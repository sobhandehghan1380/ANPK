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
    ClientOrganization, Wallet, WalletTransaction, SLASupportContract,
    SupportTicket, TicketReply, APIKey, SMSLog, SMSOTPCode
)
from services.models import AILog, SystemNodeStatus

User = get_user_model()
logger = logging.getLogger('portal')


# ─────────────────────────────────────────────────────────────
# ADMIN JWT LOGIN — احراز هویت ادمین با نام‌کاربری و رمز عبور
# ─────────────────────────────────────────────────────────────

from portal.views.utils import clean_persian_text

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_clients(request):
    """
    Admin Client Organizations API (Linked with User Account and Projects)
    """
    from django.contrib.auth import get_user_model
    User = get_user_model()

    if request.method == 'POST':
        name = request.data.get('name')
        contact_person = request.data.get('contact_person')
        phone = request.data.get('phone')
        user_id = request.data.get('user_id')
        initial_balance = int(request.data.get('initial_balance', 0))

        owner_user = User.objects.filter(id=user_id).first() if user_id else None

        client, created = ClientOrganization.objects.get_or_create(
            phone=phone,
            defaults={
                'name': name, 
                'contact_person': contact_person, 
                'owner_user': owner_user,
                'email': request.data.get('email', ''),
                'address': request.data.get('address', ''),
                'national_code': request.data.get('national_code', ''),
                'website': request.data.get('website', ''),
                'description': request.data.get('description', ''),
                'logo_url': request.data.get('logo_url', ''),
                'tags': request.data.get('tags', ''),
                'portal_access': request.data.get('portal_access', True)
            }
        )
        if not created:
            client.name = name
            client.contact_person = contact_person
            if owner_user:
                client.owner_user = owner_user
            client.save()

        Wallet.objects.get_or_create(client=client, defaults={'balance': initial_balance})

        return Response({'message': f'سازمان "{name}" به همراه اکانت کاربر متصل ثبت گردید.', 'id': client.id})

    elif request.method == 'PUT':
        client_id = request.data.get('id')
        try:
            client = ClientOrganization.objects.get(id=client_id)
            fields = ['name', 'contact_person', 'phone', 'email', 'address', 
                      'national_code', 'website', 'description', 'logo_url', 
                      'tags', 'portal_access']
            for f in fields:
                if f in request.data:
                    setattr(client, f, request.data[f])
            
            if 'user_id' in request.data:
                user_id = request.data['user_id']
                client.owner_user = User.objects.filter(id=user_id).first() if user_id else None
            
            client.save()
            return Response({'message': 'سازمان با موفقیت بروزرسانی شد.'})
        except ClientOrganization.DoesNotExist:
            return Response({'error': 'سازمان یافت نشد.'}, status=404)

    elif request.method == 'DELETE':
        client_id = request.data.get('id') or request.query_params.get('id')
        try:
            ClientOrganization.objects.get(id=client_id).delete()
            return Response({'message': 'سازمان حذف شد.'})
        except ClientOrganization.DoesNotExist:
            return Response({'error': 'سازمان یافت نشد.'}, status=404)

    clients = ClientOrganization.objects.select_related('owner_user', 'wallet').prefetch_related('contract_projects').all().order_by('-created_at')
    data = [{
        'id': c.id,
        'name': c.name,
        'contact_person': c.contact_person,
        'phone': c.phone,
        'email': c.email,
        'address': c.address,
        'national_code': c.national_code,
        'website': c.website,
        'description': c.description,
        'logo_url': c.logo_url,
        'tags': c.tags,
        'tags_list': c.get_tags_list(),
        'portal_access': c.portal_access,
        'owner_username': c.owner_user.username if c.owner_user else 'اکانت کاربر متصل‌نشده',
        'owner_user_id': c.owner_user.id if c.owner_user else None,
        'owner_email': c.owner_user.email if c.owner_user else None,
        'wallet_balance': c.wallet.balance if hasattr(c, 'wallet') else 0,
        'wallet_id': c.wallet.id if hasattr(c, 'wallet') else None,
        'projects_count': c.contract_projects.count(),
        'projects_list': [{
            'id': p.id,
            'title': p.title,
            'contract_number': p.contract_number,
            'sprint_progress': p.sprint_progress
        } for p in c.contract_projects.all()],
        'created_at': c.created_at.strftime('%Y/%m/%d')
    } for c in clients]
    return Response(data)

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_wallets(request):
    """
    Admin Wallet Management API to list all client wallets and manually top up
    """
    if request.method == 'POST':
        client_id = request.data.get('client_id')
        amount = int(request.data.get('amount', 0))
        description = request.data.get('description', 'شارژ دستی توسط ادمین ارشیا نگین پردازش')

        try:
            client = ClientOrganization.objects.get(id=client_id)
            
            import uuid
            from datetime import date
            from portal.models import Invoice, InvoiceItem
            
            invoice = Invoice.objects.create(
                client=client,
                invoice_type='wallet_recharge',
                invoice_number=f"INV-{uuid.uuid4().hex[:8].upper()}",
                amount=amount,
                total_amount=amount,
                status='pending',
                due_date=date.today(),
                description=description
            )
            
            InvoiceItem.objects.create(
                invoice=invoice,
                title='درخواست شارژ کیف‌پول',
                quantity=1,
                unit_price=amount
            )
            
            return Response({'message': f'فاکتور شارژ کیف‌پول ({invoice.invoice_number}) صادر شد. جهت اعمال شارژ، فاکتور را از بخش حسابداری تایید/پرداخت کنید.'})
        except ClientOrganization.DoesNotExist:
            return Response({'error': 'سازمان یافت نشد.'}, status=400)

    wallets = Wallet.objects.select_related('client').all()
    data = [{
        'id': w.id,
        'client_id': w.client.id,
        'client_name': w.client.name,
        'contact_person': w.client.contact_person,
        'phone': w.client.phone,
        'balance': w.balance,
        'is_active': w.is_active,
        'updated_at': w.updated_at.strftime('%Y/%m/%d - %H:%M')
    } for w in wallets]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_wallet_transactions(request):
    """
    Admin Wallet Transactions Log API (مثل WalletTransactionAdmin در جنگو)
    """
    client_id = request.GET.get('client_id')
    qs = WalletTransaction.objects.select_related('wallet__client').all().order_by('-created_at')
    if client_id:
        qs = qs.filter(wallet__client__id=client_id)
    data = [{
        'id': t.id,
        'client_name': t.wallet.client.name if t.wallet and t.wallet.client else 'سازمان ثبت‌نشده',
        'transaction_type': t.transaction_type,
        'amount': t.amount,
        'description': t.description,
        'created_at': t.created_at.strftime('%Y/%m/%d - %H:%M')
    } for t in qs[:100]]
    return Response(data)

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_tickets(request):
    """
    Admin Support Tickets Management API to list and update ticket status
    """
    if request.method == 'POST':
        ticket_id = request.data.get('ticket_id')
        new_status = request.data.get('status', 'پاسخ داده شده')
        
        try:
            ticket = SupportTicket, TicketReply.objects.get(id=ticket_id)
            ticket.status = new_status
            ticket.save()
            return Response({'message': f'وضعیت تیکت #{ticket.id} به "{new_status}" تغییر یافت.'})
        except (SupportTicket.DoesNotExist, TicketReply.DoesNotExist):
            return Response({'error': 'تیکت یافت نشد.'}, status=400)

    tickets = SupportTicket, TicketReply.objects.all().order_by('-created_at')
    data = [{
        'id': t.id,
        'client_name': t.client_name,
        'subject': t.subject,
        'message': t.message,
        'status': t.status,
        'created_at': t.created_at.strftime('%Y/%m/%d - %H:%M')
    } for t in tickets]
    return Response(data)

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_sla_contracts(request):
    """
    Admin SLA Support Contracts API (کامل مثل جنگو ادمین)
    """
    if request.method == 'POST':
        client_id = request.data.get('client_id')
        plan_name = request.data.get('plan_name', 'SLA Gold')
        duration_months = int(request.data.get('duration_months', 12))
        from datetime import date
        try:
            client = ClientOrganization.objects.get(id=client_id)
            contract = SLASupportContract.objects.create(
                client=client,
                plan_name=plan_name,
                duration_months=duration_months,
                start_date=date.today(),
                is_active=True
            )
            return Response({'message': f'قرارداد SLA "{plan_name}" برای سازمان "{client.name}" ثبت شد.', 'id': contract.id})
        except ClientOrganization.DoesNotExist:
            return Response({'error': 'سازمان یافت نشد.'}, status=400)

    contracts = SLASupportContract.objects.select_related('client').all().order_by('-start_date')
    data = [{
        'id': c.id,
        'client_name': c.client.name if c.client else 'سازمان ثبت‌نشده',
        'client_id': c.client.id if c.client else None,
        'plan_name': c.plan_name,
        'start_date': c.start_date.strftime('%Y/%m/%d') if c.start_date else '',
        'duration_months': c.duration_months,
        'remaining_days': c.remaining_days,
        'is_active': c.is_active,
    } for c in contracts]
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_convert_lead(request):
    lead_id = request.data.get('lead_id')
    from leads.models import ProjectLead
    from django.contrib.auth.models import User
    from portal.models import Wallet
    try:
        lead = ProjectLead.objects.get(id=lead_id)
        # Create user
        user, _ = User.objects.get_or_create(username=lead.phone, defaults={'first_name': lead.contact_person})
        # Create client
        client, created = ClientOrganization.objects.get_or_create(
            phone=lead.phone,
            defaults={'name': lead.company_name, 'contact_person': lead.contact_person, 'owner_user': user}
        )
        if created:
            Wallet.objects.create(client=client, balance=0)
            
        lead.status = 'converted'
        lead.save()
        return Response({'message': 'سرنخ (Lead) به مشتری دائم تبدیل شد و کیف‌پول آن ایجاد گردید.'})
    except Exception as e:
        return Response({'error': str(e)}, status=400)
