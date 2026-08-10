import logging
import secrets
import uuid
from datetime import timedelta
from urllib.parse import urlencode
from django.conf import settings
from django.core import signing
from django.db import models
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from accounts.models import Organization as ClientOrganization
from billing.models import Invoice, InvoiceItem, Wallet, WalletTransaction
from billing.services import BillingError, settle_invoice
from integrations.models import APIKey, SMSLog
from support.models import InAppNotification, SLASupportContract, SupportTicket, TicketReply
from services.models import AILog, SystemNodeStatus
from accounts.selectors import get_current_member

logger = logging.getLogger('portal')


# ─────────────────────────────────────────────────────────────
# CLIENT PORTAL AUTH — احراز هویت اعضای سازمان با OTP + JWT
# ─────────────────────────────────────────────────────────────

from portal.views.utils import clean_persian_text


def build_payment_response(invoice):
    if not settings.PAYMENT_MOCK_ENABLED:
        return Response(
            {'error': 'درگاه پرداخت عملیاتی هنوز پیکربندی نشده است.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    authority = signing.dumps(
        {
            'invoice_id': invoice.id,
            'client_id': invoice.client_id,
            'nonce': secrets.token_hex(16),
        },
        salt='portal-payment',
        compress=True,
    )
    query = urlencode({
        'authority': authority,
        'amount': invoice.total_amount,
        'invoice': invoice.id,
    })
    return Response({
        'authority': authority,
        'payment_url': f"{settings.FRONTEND_URL}/portal/finance/payment/gateway?{query}",
        'invoice_id': invoice.id,
        'message': 'در حال انتقال به درگاه پرداخت آزمایشی...',
    })


def _unauthorized():
    return Response({'error': 'دسترسی غیرمجاز. لطفاً مجدداً وارد پورتال شوید.'}, status=status.HTTP_403_FORBIDDEN)


def serialize_sla_contract(contract):
    return {
        'id': contract.id,
        'project_id': contract.project_id,
        'project_name': contract.project.title if contract.project else 'SLA قدیمی بدون پروژه',
        'subscription_id': contract.subscription_id,
        'plan_name': contract.plan_name,
        'start_date': contract.start_date.strftime('%Y/%m/%d') if contract.start_date else '',
        'duration_months': contract.duration_months,
        'remaining_days': contract.remaining_days,
        'support_schedule': contract.support_schedule,
        'response_time_minutes': contract.response_time_minutes,
        'resolution_time_hours': contract.resolution_time_hours,
        'availability_percentage': str(contract.availability_percentage),
        'is_active': contract.is_active,
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def portal_overview(request):
    member = get_current_member(request)
    if not member:
        return _unauthorized()
    client = member.organization

    # Fetch live system node status
    nodes = SystemNodeStatus.objects.filter(is_active=True)
    if not nodes.exists():
        SystemNodeStatus.objects.create(name='پلتفرم آیرا (WebRTC Node)', status_label='آنلاین (۹۹.۹٪)', uptime_percentage='۹۹.۹٪', latency_ms=15)
        SystemNodeStatus.objects.create(name='هوش مصنوعی & OCR اسناد', status_label='آنلاین (۹۹.۸٪)', uptime_percentage='۹۹.۸٪', latency_ms=210)
        SystemNodeStatus.objects.create(name='پایگاه داده CMMS تأسیسات نگار', status_label='آنلاین (۱۰۰٪)', uptime_percentage='۱۰۰٪', latency_ms=45)
        nodes = SystemNodeStatus.objects.filter(is_active=True)

    nodes_data = [{
        'id': n.id,
        'name': clean_persian_text(n.name, 'نود کلود و سرویس ANPK'),
        'status_label': clean_persian_text(n.status_label, 'آنلاین (۹۹.۹٪)'),
        'uptime': n.uptime_percentage,
        'latency': n.latency_ms
    } for n in nodes]

    wallet, _ = Wallet.objects.get_or_create(client=client)

    # Check if client has active contract projects
    active_projects = client.contract_projects.filter(is_active=True)
    projects_count = active_projects.count()

    sla_contracts = list(
        SLASupportContract.objects.select_related('project', 'subscription')
        .filter(client=client, project__in=active_projects, is_active=True)
        .order_by('start_date', 'id')
    )
    primary_sla = min(sla_contracts, key=lambda item: item.remaining_days) if sla_contracts else None
    sla_days = primary_sla.remaining_days if primary_sla else 0
    sla_plan = primary_sla.plan_name if primary_sla else 'فاقد قرارداد پشتیبانی SLA'
    has_sla = bool(primary_sla)

    tickets_count = client.tickets.count()

    projects_data = [{
        'id': p.id,
        'title': p.title,
        'contract_number': p.contract_number,
        'progress': p.sprint_progress,
        'phase': p.active_phase_title
    } for p in active_projects]

    return Response({
        'client_name': client.name,
        'contact_person': client.contact_person,
        'phone': client.phone,
        'wallet_balance': wallet.balance,
        'sla_days_remaining': sla_days,
        'sla_plan_name': sla_plan,
        'has_active_sla': has_sla,
        'active_projects_count': projects_count,
        'tickets_count': tickets_count,
        'ai_rate': 240,
        'nodes': nodes_data if projects_count > 0 else [],
        'projects': projects_data,
        'sla_contracts': [serialize_sla_contract(contract) for contract in sla_contracts],
        'member': {
            'id': member.id,
            'name': member.full_name,
            'role': member.role,
            'role_label': member.get_role_display(),
            'phone': member.phone,
            'organization_name': client.name,
        }
    })

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def wallet_details(request):
    member = get_current_member(request)
    if not member:
        return _unauthorized()
    client = member.organization

    wallet, _ = Wallet.objects.get_or_create(client=client)

    if request.method == 'POST':
        try:
            amount = int(request.data.get('amount', 0))
        except (TypeError, ValueError):
            return Response({'error': 'مبلغ واردشده معتبر نیست.'}, status=status.HTTP_400_BAD_REQUEST)

        if amount < 10000 or amount > 1_000_000_000:
            return Response(
                {'error': 'مبلغ شارژ باید بین ۱۰ هزار تا یک میلیارد تومان باشد.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        description = request.data.get('description', 'شارژ آنلاین کیف پول سازمان')
        invoice = Invoice.objects.create(
            client=client,
            invoice_type='wallet_recharge',
            description=description,
            invoice_number=f"WLT-{timezone.now():%Y%m%d}-{uuid.uuid4().hex[:10].upper()}",
            amount=amount,
            total_amount=amount,
            due_date=timezone.localdate() + timedelta(days=1),
        )
        InvoiceItem.objects.create(
            invoice=invoice,
            title=description,
            quantity=1,
            unit_price=amount,
            total_price=amount,
        )
        return build_payment_response(invoice)

    transactions = WalletTransaction.objects.filter(wallet=wallet).order_by('-created_at')

    data = {
        'balance': wallet.balance,
        'is_active': wallet.is_active,
        'transactions': [{
            'id': t.id,
            'type': t.transaction_type,
            'amount': t.amount,
            'description': clean_persian_text(t.description, 'شارژ آنلاین کیف پول سازمان'),
            'date': t.created_at.strftime('%Y/%m/%d - %H:%M')
        } for t in transactions]
    }
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_usage_logs(request):
    member = get_current_member(request)
    if not member:
        return _unauthorized()
    client = member.organization

    logs = AILog.objects.filter(project__client=client)
    project_id = request.query_params.get('project_id')
    if project_id:
        logs = logs.filter(project_id=project_id)
    logs = logs.select_related('project').order_by('-created_at')
    data = [{
        'id': log.id,
        'project_id': log.project_id,
        'project_name': log.project.title if log.project else None,
        'user_query': clean_persian_text(log.user_query, 'کوئری پردازش هوش مصنوعی'),
        'ai_response': clean_persian_text(log.ai_response, 'پاسخ استخراج داده‌ها'),
        'model_used': log.model_used,
        'cost_deducted': log.cost_deducted,
        'created_at': log.created_at.isoformat(),
        # Compatibility aliases for older portal clients.
        'query': clean_persian_text(log.user_query, 'کوئری پردازش هوش مصنوعی'),
        'response': clean_persian_text(log.ai_response, 'پاسخ استخراج داده‌ها'),
        'model': log.model_used,
        'cost': log.cost_deducted,
        'date': log.created_at.strftime('%Y/%m/%d - %H:%M')
    } for log in logs]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def invoices_list(request):
    member = get_current_member(request)
    if not member:
        return _unauthorized()
    client = member.organization

    invoices = Invoice.objects.filter(client=client).select_related('project', 'subscription').prefetch_related('items').order_by('-created_at')

    data = [{
        'id': inv.id,
        'invoice_number': inv.invoice_number,
        'project_id': inv.project_id,
        'project_name': inv.project.title if inv.project else None,
        'subscription_id': inv.subscription_id,
        'invoice_type': inv.invoice_type,
        'can_pay_with_wallet': member.role == 'OWNER' and inv.status == 'pending' and inv.invoice_type != 'wallet_recharge',
        'title': clean_persian_text(inv.description, 'صورتحساب خدمات'),
        'total_amount': inv.total_amount,
        'tax_amount': inv.tax_amount,
        'status': inv.status,
        'due_date': inv.due_date.strftime('%Y/%m/%d') if inv.due_date else '',
        'created_at': inv.created_at.strftime('%Y/%m/%d'),
        'items': [{
            'description': item.title,
            'quantity': item.quantity,
            'unit_price': item.unit_price,
            'total_price': item.total_price
        } for item in inv.items.all()]
    } for inv in invoices]

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sla_contracts_list(request):
    member = get_current_member(request)
    if not member:
        return _unauthorized()

    contracts = SLASupportContract.objects.select_related('project', 'subscription').filter(
        client=member.organization,
    )
    project_id = request.query_params.get('project_id')
    if project_id:
        contracts = contracts.filter(project_id=project_id)
    return Response([serialize_sla_contract(contract) for contract in contracts.order_by('-start_date', '-id')])

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def api_keys_list(request):
    member = get_current_member(request)
    if not member:
        return _unauthorized()
    client = member.organization

    if request.method == 'POST':
        name = request.data.get('name', 'کلید پروژه جدید')
        if member.role != 'OWNER':
            return Response(
                {'error': 'فقط مالک سازمان می‌تواند کلید API جدید ایجاد کند.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        project_id = request.data.get('project_id')
        project = client.contract_projects.filter(id=project_id, is_active=True).first()
        if not project:
            return Response({'error': 'انتخاب پروژه معتبر برای صدور کلید الزامی است.'}, status=status.HTTP_400_BAD_REQUEST)
        key_val = f"anpk_live_{secrets.token_urlsafe(32)}"
        key_obj = APIKey.objects.create(
            client=client,
            project=project,
            name=name,
            key_type='PROJECT',
            api_key=key_val,
        )
        return Response({'message': 'کلید API جدید صادر گردید', 'api_key': key_obj.api_key})

    keys = APIKey.objects.filter(client=client).select_related('project')
    data = [{
        'id': k.id,
        'name': clean_persian_text(k.name, 'کلید اختصاصی سرویس'),
        'project_id': k.project_id,
        'project_name': k.project.title if k.project else 'کلید قدیمی بدون پروژه',
        'key_type': k.get_key_type_display(),
        'api_key': f"{k.api_key[:14]}...{k.api_key[-4:]}",
        'is_active': k.is_active,
        'date': k.created_at.strftime('%Y/%m/%d')
    } for k in keys]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sms_logs_list(request):
    member = get_current_member(request)
    if not member:
        return _unauthorized()
    client = member.organization
    project_id = request.GET.get('project_id')

    client_phone = client.phone if client.phone else ''
    logs = SMSLog.objects.filter(
        models.Q(project__client=client) |
        models.Q(recipient__icontains=client_phone)
    )

    # Exclude sensitive authentication OTP codes from public portal logs
    logs = logs.exclude(text__icontains='کد تایید')\
               .exclude(text__icontains='OTP')\
               .exclude(text__icontains='کد ورود')

    if project_id:
        logs = logs.filter(project_id=project_id)

    logs = logs.order_by('-sent_at')

    data = [{
        'id': log.id,
        'project_id': log.project.id if log.project else None,
        'project_title': log.project.title if log.project else 'سامانه اطلاع‌رسانی ANPK',
        'recipient': log.recipient,
        'text': clean_persian_text(log.text, 'اطلاع‌رسانی پشتیبانی پروژه ANPK'),
        'operator': log.operator,
        'cost': log.cost,
        'status': log.status,
        'sent_at': log.sent_at.strftime('%Y/%m/%d - %H:%M')
    } for log in logs]
    return Response(data)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def tickets_list(request):
    member = get_current_member(request)
    if not member:
        return _unauthorized()
    client = member.organization

    if request.method == 'POST':
        action = request.data.get('action')

        if action == 'reply_ticket':
            ticket_id = request.data.get('ticket_id')
            message = request.data.get('message')
            try:
                ticket = SupportTicket.objects.get(id=ticket_id, client=client)
                TicketReply.objects.create(
                    ticket=ticket,
                    sender_name=member.full_name,
                    is_admin=False,
                    message=message
                )
                if ticket.status == 'answered':
                    ticket.status = 'open'
                    ticket.save()
                return Response({'message': 'پاسخ شما ارسال شد.'})
            except SupportTicket.DoesNotExist:
                return Response({'error': 'تیکت یافت نشد.'}, status=400)

        # default create ticket
        project_id = request.data.get('project_id')
        if not project_id:
            return Response({'error': 'انتخاب پروژه برای ثبت تیکت الزامی است.'}, status=status.HTTP_400_BAD_REQUEST)
        project = client.contract_projects.filter(id=project_id, is_active=True).first()
        if not project:
            return Response({'error': 'پروژه انتخاب‌شده یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)
        subject = request.data.get('subject')
        message = request.data.get('message')
        ticket = SupportTicket.objects.create(
            client=client,
            project=project,
            client_name=client.name,
            subject=subject,
            message=message
        )
        return Response({'message': 'تیکت پشتیبانی ثبت شد', 'id': ticket.id})

    tickets = SupportTicket.objects.filter(client=client).select_related('project').prefetch_related('replies')
    project_id = request.query_params.get('project_id')
    if project_id:
        tickets = tickets.filter(project_id=project_id)
    tickets = tickets.order_by('-created_at')

    data = [{
        'id': t.id,
        'project_id': t.project_id,
        'project_name': t.project.title if t.project else 'تیکت قدیمی بدون پروژه',
        'subject': clean_persian_text(t.subject, 'درخواست پشتیبانی فنی'),
        'message': clean_persian_text(t.message, 'متن تیکت پشتیبانی'),
        'status': t.status,
        'date': t.created_at.strftime('%Y/%m/%d - %H:%M'),
        'replies': [{
            'id': r.id,
            'sender_name': r.sender_name,
            'is_admin': r.is_admin,
            'message': r.message,
            'created_at': r.created_at.strftime('%Y/%m/%d - %H:%M')
        } for r in t.replies.all()]
    } for t in tickets]

    return Response(data)

# ─────────────────────────────────────────────────────────────
# IPG (Internet Payment Gateway) Mock Integration
# ─────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_payment(request):
    member = get_current_member(request)
    if not member:
        return _unauthorized()
    client = member.organization

    invoice_id = request.data.get('invoice_id')
    try:
        invoice = Invoice.objects.get(id=invoice_id, client=client)
    except Invoice.DoesNotExist:
        return Response({'error': 'Invoice not found'}, status=404)

    if invoice.status != 'pending':
        return Response({'error': 'فقط فاکتور در انتظار پرداخت قابل ارسال به درگاه است.'}, status=400)

    return build_payment_response(invoice)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pay_invoice_with_wallet(request):
    member = get_current_member(request)
    if not member:
        return _unauthorized()
    if member.role != 'OWNER':
        return Response(
            {'error': 'فقط مالک سازمان می‌تواند فاکتور را از کیف پول پرداخت کند.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        invoice = Invoice.objects.get(id=request.data.get('invoice_id'), client=member.organization)
    except Invoice.DoesNotExist:
        return Response({'error': 'فاکتور یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)

    try:
        result = settle_invoice(
            invoice,
            payment_method='WALLET',
            reference_id=f'WALLET-{invoice.invoice_number}',
            idempotency_key=f'portal-wallet:{invoice.id}',
        )
    except BillingError as exc:
        return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    wallet = Wallet.objects.get(client=member.organization)
    return Response({
        'message': 'فاکتور قبلاً پرداخت شده بود.' if result.already_paid else 'فاکتور از کیف پول سازمان پرداخت شد.',
        'status': 'success',
        'invoice_id': invoice.id,
        'wallet_balance': wallet.balance,
        'reference_id': result.payment.reference_id if result.payment else None,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    member = get_current_member(request)
    if not member:
        return _unauthorized()
    client = member.organization

    invoice_id = request.data.get('invoice_id')
    authority = request.data.get('authority')
    status_code = request.data.get('status')

    if not authority:
        return Response({'error': 'شناسه پرداخت الزامی است.'}, status=status.HTTP_400_BAD_REQUEST)

    if not settings.PAYMENT_MOCK_ENABLED:
        return Response(
            {'error': 'تأیید پرداخت عملیاتی هنوز پیکربندی نشده است.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    try:
        invoice = Invoice.objects.get(id=invoice_id, client=client)
    except Invoice.DoesNotExist:
        return Response({'error': 'Invoice not found'}, status=404)

    if status_code != 'OK':
        return Response({'error': 'پرداخت توسط کاربر لغو شد یا با خطا مواجه گردید.', 'status': 'failed'}, status=400)

    try:
        payment_claim = signing.loads(
            authority,
            salt='portal-payment',
            max_age=15 * 60,
        )
    except signing.BadSignature:
        return Response({'error': 'شناسه پرداخت نامعتبر یا منقضی است.'}, status=status.HTTP_400_BAD_REQUEST)

    if (
        payment_claim.get('invoice_id') != invoice.id
        or payment_claim.get('client_id') != client.id
    ):
        return Response({'error': 'اطلاعات پرداخت با فاکتور مطابقت ندارد.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        result = settle_invoice(
            invoice,
            payment_method='GATEWAY',
            reference_id=authority,
            idempotency_key=f'gateway:{authority}',
        )
    except BillingError as exc:
        return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        'message': 'این پرداخت قبلاً ثبت شده بود.' if result.already_paid else 'پرداخت با موفقیت انجام شد و فاکتور تسویه گردید.',
        'reference_id': authority,
        'status': 'success',
    })

# ─────────────────────────────────────────────────────────────
# Notifications & Tickets Reply
# ─────────────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def notifications_list(request):
    member = get_current_member(request)
    if not member:
        return _unauthorized()
    client = member.organization

    if request.method == 'POST':
        # Mark as read
        notif_id = request.data.get('id')
        try:
            n = InAppNotification.objects.get(id=notif_id, client=client)
            n.is_read = True
            n.save()
            return Response({'message': 'خوانده شد'})
        except InAppNotification.DoesNotExist:
            pass

    notifs = InAppNotification.objects.filter(client=client).order_by('-created_at')[:20]
    data = [{
        'id': n.id,
        'title': n.title,
        'message': n.message,
        'is_read': n.is_read,
        'created_at': n.created_at.isoformat()
    } for n in notifs]
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reply_ticket(request):
    member = get_current_member(request)
    if not member:
        return _unauthorized()
    client = member.organization

    ticket_id = request.data.get('ticket_id')
    message = request.data.get('message')

    try:
        ticket = SupportTicket.objects.get(id=ticket_id, client=client)
        TicketReply.objects.create(
            ticket=ticket,
            sender_name=member.full_name,
            is_admin=False,
            message=message
        )
        ticket.status = 'open'  # reopen ticket if it was closed
        ticket.save()
        return Response({'message': 'پاسخ با موفقیت ارسال شد'})
    except Exception as e:
        return Response({'error': str(e)}, status=400)
