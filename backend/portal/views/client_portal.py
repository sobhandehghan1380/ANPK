import random
import logging
from django.db import models
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from portal.models import (
    ClientOrganization, Wallet, WalletTransaction, Invoice, InvoiceItem, SLASupportContract,
    SupportTicket, TicketReply, APIKey, SMSLog, SMSOTPCode
)
from services.models import AILog, SystemNodeStatus

User = get_user_model()
logger = logging.getLogger('portal')


# ─────────────────────────────────────────────────────────────
# ADMIN JWT LOGIN — احراز هویت ادمین با نام‌کاربری و رمز عبور
# ─────────────────────────────────────────────────────────────

from portal.views.utils import clean_persian_text

def get_client_by_request(request):
    phone = request.GET.get('phone') or request.headers.get('X-User-Phone')
    if not phone:
        return None
    phone_clean = phone.strip().replace('+98', '0')
    return ClientOrganization.objects.filter(phone__icontains=phone_clean).first()

@api_view(['GET'])
def portal_overview(request):
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

    client = get_client_by_request(request)
    if not client:
        return Response({
            'client_name': 'حساب شخصی / کاربر جدید',
            'contact_person': 'کاربر پورتال',
            'phone': request.GET.get('phone', ''),
            'wallet_balance': 0,
            'sla_days_remaining': 0,
            'sla_plan_name': 'فاقد قرارداد پشتیبانی SLA',
            'has_active_sla': False,
            'active_projects_count': 0,
            'tickets_count': 0,
            'ai_rate': 240,
            'nodes': [],
            'projects': []
        })

    wallet, _ = Wallet.objects.get_or_create(client=client)
    
    # Check if client has active contract projects
    active_projects = client.contract_projects.filter(is_active=True)
    projects_count = active_projects.count()

    if projects_count > 0:
        sla, _ = SLASupportContract.objects.get_or_create(client=client)
        sla_days = sla.remaining_days
        sla_plan = sla.plan_name
        has_sla = True
    else:
        sla_days = 0
        sla_plan = 'فاقد قرارداد پشتیبانی SLA'
        has_sla = False

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
        'projects': projects_data
    })

@api_view(['GET', 'POST'])
def wallet_details(request):
    client = get_client_by_request(request)
    if not client:
        phone = request.GET.get('phone') or request.data.get('phone', '09131518904')
        client, _ = ClientOrganization.objects.get_or_create(phone=phone, defaults={'name': 'سازمان کاربر جدید', 'contact_person': 'کاربر پورتال'})
    
    wallet, _ = Wallet.objects.get_or_create(client=client)

    if request.method == 'POST':
        amount = int(request.data.get('amount', 5000000))
        description = request.data.get('description', 'شارژ آنلاین کیف پول سازمان')
        
        wallet.balance += amount
        wallet.save()

        WalletTransaction.objects.create(
            wallet=wallet,
            transaction_type='CHARGE',
            amount=amount,
            description=description
        )

        return Response({
            'message': 'کیف پول سازمان با موفقیت شارژ گردید.',
            'new_balance': wallet.balance
        })

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
def ai_usage_logs(request):
    logs = AILog.objects.all().order_by('-created_at')
    data = [{
        'id': log.id,
        'query': clean_persian_text(log.user_query, 'کوئری پردازش هوش مصنوعی'),
        'response': clean_persian_text(log.ai_response, 'پاسخ استخراج داده‌ها'),
        'model': log.model_used,
        'cost': log.cost_deducted,
        'date': log.created_at.strftime('%Y/%m/%d - %H:%M')
    } for log in logs]
    return Response(data)

@api_view(['GET'])
def invoices_list(request):
    client = get_client_by_request(request)
    if not client:
        return Response([])
    
    invoices = Invoice.objects.filter(client=client).prefetch_related('items').order_by('-created_at')
    
    data = [{
        'id': inv.id,
        'invoice_number': inv.invoice_number,
        'title': clean_persian_text(inv.title, 'صورتحساب خدمات'),
        'total_amount': inv.total_amount,
        'tax_amount': inv.tax_amount,
        'status': inv.status,
        'due_date': inv.due_date.strftime('%Y/%m/%d') if inv.due_date else '',
        'created_at': inv.created_at.strftime('%Y/%m/%d'),
        'items': [{
            'description': item.description,
            'quantity': item.quantity,
            'unit_price': item.unit_price,
            'total_price': item.total_price
        } for item in inv.items.all()]
    } for inv in invoices]
    
    return Response(data)

@api_view(['GET', 'POST'])
def api_keys_list(request):
    client = get_client_by_request(request)
    if not client:
        phone = request.GET.get('phone') or '09131518904'
        client, _ = ClientOrganization.objects.get_or_create(phone=phone, defaults={'name': 'سازمان کاربر جدید', 'contact_person': 'کاربر'})

    if request.method == 'POST':
        name = request.data.get('name', 'کلید پروژه جدید')
        key_val = f"anpk_proj_{random.randint(100000000, 999999999)}"
        key_obj = APIKey.objects.create(client=client, name=name, api_key=key_val)
        return Response({'message': 'کلید API جدید صادر گردید', 'api_key': key_obj.api_key})

    keys = APIKey.objects.filter(client=client)
    data = [{
        'id': k.id,
        'name': clean_persian_text(k.name, 'کلید اختصاصی سرویس'),
        'key_type': k.get_key_type_display(),
        'api_key': k.api_key,
        'is_active': k.is_active,
        'date': k.created_at.strftime('%Y/%m/%d')
    } for k in keys]
    return Response(data)

@api_view(['GET'])
def sms_logs_list(request):
    client = get_client_by_request(request)
    project_id = request.GET.get('project_id')
    phone = request.GET.get('phone')

    if not client and not phone:
        return Response([])

    logs = SMSLog.objects.none()

    if client:
        client_phone = client.phone if client.phone else ''
        logs = SMSLog.objects.filter(
            models.Q(project__client=client) |
            models.Q(recipient__icontains=client_phone)
        )
    elif phone:
        phone_clean = phone.strip().replace('+98', '0')
        logs = SMSLog.objects.filter(recipient__icontains=phone_clean)

    # Exclude sensitive authentication OTP codes from public portal logs
    logs = logs.exclude(text__icontains='کد تایید')\
               .exclude(text__icontains='OTP')\
               .exclude(text__icontains='کد ورود')

    if project_id:
        logs = logs.filter(project_id=project_id)

    logs = logs.order_by('-sent_at')

    # If no operational notification SMS logs exist, generate sample operational alerts
    if not logs.exists() and client:
        first_proj = client.contract_projects.first()
        SMSLog.objects.create(
            project=first_proj,
            recipient=client.phone or '09131518904',
            text='هشدار سامانه: فاز ۲ توسعه پروژه با موفقیت مستقر و آماده تست گردید.',
            operator='همراه اول',
            cost=75,
            status='delivered'
        )
        SMSLog.objects.create(
            project=first_proj,
            recipient=client.phone or '09131518904',
            text='اطلاع‌رسانی پشتیبانی: تیکت شما به کارشناس ارشد زیرساخت ارجاع داده شد.',
            operator='همراه اول',
            cost=75,
            status='delivered'
        )
        logs = SMSLog.objects.filter(
            models.Q(project__client=client) |
            models.Q(recipient__icontains=client.phone)
        ).exclude(text__icontains='کد تایید')\
         .exclude(text__icontains='OTP')\
         .exclude(text__icontains='کد ورود').order_by('-sent_at')

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

@api_view(['POST'])
def send_otp(request):
    phone = request.data.get('phone', '').strip()
    if not phone or len(phone) < 10:
        return Response({'error': 'لطفاً شماره تلفن همراه معتبر وارد نمایید.'}, status=status.HTTP_400_BAD_REQUEST)

    phone_clean = phone.replace('+98', '0')

    client_exists = ClientOrganization.objects.filter(phone__icontains=phone_clean).exists()
    user_exists = User.objects.filter(username=phone_clean).exists()

    if not client_exists and not user_exists:
        return Response({
            'error': 'شماره همراه واردشده در سامانه مشتریان ثبت نگردیده است. لطفاً جهت تعریف حساب با پشتیبانی تماس بگیرید.'
        }, status=status.HTTP_404_NOT_FOUND)

    code = f"{random.randint(10000, 99999)}"
    SMSOTPCode.objects.create(phone=phone_clean, code=code)

    SMSLog.objects.create(
        recipient=phone_clean,
        text=f"کد تایید ورود به پورتال ANPK: {code}",
        operator="همراه اول / کاوه نگار",
        cost=75,
        status="delivered"
    )

    return Response({
        'message': 'کد تایید ۵ رقمی با موفقیت ارسال گردید.',
        'demo_code': code,
        'phone': phone_clean
    })

@api_view(['POST'])
def verify_otp(request):
    phone = request.data.get('phone', '').strip().replace('+98', '0')
    code = request.data.get('code', '').strip()

    if not phone or not code:
        return Response({'error': 'شماره موبایل و کد تایید ۵ رقمی الزامی است.'}, status=status.HTTP_400_BAD_REQUEST)

    otp_obj = SMSOTPCode.objects.filter(phone=phone, code=code, is_used=False).last()
    if not otp_obj:
        return Response({'error': 'کد تایید واردشده اشتباه است یا منقضی گردیده است.'}, status=status.HTTP_400_BAD_REQUEST)

    client = ClientOrganization.objects.filter(phone__icontains=phone).first()
    user = User.objects.filter(username=phone).first()

    if not client and not user:
        return Response({'error': 'حساب کاربری معتبری برای این شماره همراه یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)

    otp_obj.is_used = True
    otp_obj.save()

    client_name = client.name if client else (user.username if user else 'کاربر پورتال')

    return Response({
        'message': 'ورود پیامکی با موفقیت انجام شد.',
        'client_name': client_name,
        'phone': phone
    })

@api_view(['GET', 'POST'])
def tickets_list(request):
    client = get_client_by_request(request)
    if request.method == 'POST':
        action = request.data.get('action')
        
        if action == 'reply_ticket':
            ticket_id = request.data.get('ticket_id')
            message = request.data.get('message')
            try:
                ticket = SupportTicket.objects.get(id=ticket_id, client=client)
                TicketReply.objects.create(
                    ticket=ticket,
                    sender_name=client.contact_person if client else "مشتری",
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
        subject = request.data.get('subject')
        message = request.data.get('message')
        ticket = SupportTicket.objects.create(
            client=client,
            client_name=client.name if client else request.data.get('client_name', 'کاربر پورتال'),
            subject=subject,
            message=message
        )
        return Response({'message': 'تیکت پشتیبانی ثبت شد', 'id': ticket.id})

    if client:
        tickets = SupportTicket.objects.filter(client=client).prefetch_related('replies').order_by('-created_at')
    else:
        tickets = SupportTicket.objects.none()

    data = [{
        'id': t.id,
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
def request_payment(request):
    client = get_client_by_request(request)
    if not client:
        return Response({'error': 'Client not found'}, status=404)
        
    invoice_id = request.data.get('invoice_id')
    try:
        invoice = Invoice.objects.get(id=invoice_id, client=client)
    except Invoice.DoesNotExist:
        return Response({'error': 'Invoice not found'}, status=404)
        
    if invoice.status == 'paid':
        return Response({'error': 'Invoice is already paid'}, status=400)
        
    # Mocking IPG Request
    import os
    frontend_url = os.getenv('NEXT_PUBLIC_API_URL') or os.getenv('FRONTEND_URL') or 'http://localhost:3000'
    authority = f"A{random.randint(100000000000, 999999999999)}"
    payment_url = f"{frontend_url}/portal/finance/payment/gateway?authority={authority}&amount={invoice.total_amount}&invoice={invoice.id}"
    
    return Response({
        'authority': authority,
        'payment_url': payment_url,
        'message': 'در حال انتقال به درگاه پرداخت...'
    })

@api_view(['POST'])
def verify_payment(request):
    client = get_client_by_request(request)
    if not client:
        return Response({'error': 'Client not found'}, status=404)
        
    invoice_id = request.data.get('invoice_id')
    authority = request.data.get('authority')
    status_code = request.data.get('status')
    
    try:
        invoice = Invoice.objects.get(id=invoice_id, client=client)
    except Invoice.DoesNotExist:
        return Response({'error': 'Invoice not found'}, status=404)
        
    if status_code == 'OK':
        # Mark as paid
        invoice.status = 'paid'
        invoice.save()
        
        # Log payment
        from portal.models import Payment
        Payment.objects.create(
            invoice=invoice,
            amount=invoice.total_amount,
            reference_id=authority,
            status='success'
        )
        
        # If it was a subscription renewal, update it
        if invoice.invoice_type == 'subscription' and invoice.subscription:
            import datetime
            # Extend for 30 days (mock logic for monthly)
            invoice.subscription.end_date += datetime.timedelta(days=30)
            invoice.subscription.status = 'active'
            invoice.subscription.save()
            
        # If wallet recharge
        if invoice.invoice_type == 'wallet_recharge':
            wallet, _ = Wallet.objects.get_or_create(client=client)
            wallet.balance += invoice.total_amount
            wallet.save()
            
        return Response({'message': 'پرداخت با موفقیت انجام شد و فاکتور تسویه گردید.', 'reference_id': authority, 'status': 'success'})
    else:
        return Response({'error': 'پرداخت توسط کاربر لغو شد یا با خطا مواجه گردید.', 'status': 'failed'}, status=400)

# ─────────────────────────────────────────────────────────────
# Notifications & Tickets Reply
# ─────────────────────────────────────────────────────────────
from portal.models import InAppNotification, TicketReply, SupportTicket

@api_view(['GET', 'POST'])
def notifications_list(request):
    client = get_client_by_request(request)
    if not client:
        return Response([])
        
    if request.method == 'POST':
        # Mark as read
        notif_id = request.data.get('id')
        try:
            n = InAppNotification.objects.get(id=notif_id, client=client)
            n.is_read = True
            n.save()
            return Response({'message': 'خوانده شد'})
        except:
            pass
            
    notifs = InAppNotification.objects.filter(client=client).order_by('-created_at')[:20]
    data = [{
        'id': n.id,
        'title': n.title,
        'message': n.message,
        'is_read': n.is_read,
        'created_at': n.created_at.strftime('%Y-%m-%d %H:%M')
    } for n in notifs]
    return Response(data)

@api_view(['POST'])
def reply_ticket(request):
    client = get_client_by_request(request)
    if not client:
        return Response({'error': 'Client not found'}, status=404)
        
    ticket_id = request.data.get('ticket_id')
    message = request.data.get('message')
    
    try:
        ticket = SupportTicket.objects.get(id=ticket_id, client=client)
        TicketReply.objects.create(
            ticket=ticket,
            sender_name=client.contact_person,
            is_admin=False,
            message=message
        )
        ticket.status = 'open' # reopen ticket if it was closed
        ticket.save()
        return Response({'message': 'پاسخ با موفقیت ارسال شد'})
    except Exception as e:
        return Response({'error': str(e)}, status=400)
