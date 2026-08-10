import random
import logging
from django.db import models
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import (
    Organization as ClientOrganization,
    OrganizationMembership as ClientMember,
    SMSOTPCode,
)
from billing.models import Wallet, WalletTransaction
from integrations.models import APIKey, SMSLog
from subscriptions.models import ClientSubscription
from support.models import SLASupportContract, SupportTicket, TicketReply
from services.models import AILog, SystemNodeStatus
from accounts.services import ensure_owner_membership

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
            client.save()

        Wallet.objects.get_or_create(client=client, defaults={'balance': initial_balance})
        ensure_owner_membership(client, phone, contact_person, owner_user)

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
                owner_user = User.objects.filter(id=user_id).first() if user_id else None
            else:
                owner_user = None
             
            client.save()
            ensure_owner_membership(client, client.phone, client.contact_person, owner_user)
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

    clients = ClientOrganization.objects.select_related('wallet').prefetch_related(
        models.Prefetch(
            'members',
            queryset=ClientMember.objects.filter(role='OWNER', is_active=True).select_related('user'),
            to_attr='active_owner_memberships',
        ),
        'contract_projects',
    ).all().order_by('-created_at')
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
        'owner_username': c.active_owner_memberships[0].user.username if c.active_owner_memberships else 'اکانت کاربر متصل‌نشده',
        'owner_user_id': c.active_owner_memberships[0].user_id if c.active_owner_memberships else None,
        'owner_email': c.active_owner_memberships[0].user.email if c.active_owner_memberships else None,
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
            from billing.models import Invoice, InvoiceItem
            
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
        action = request.data.get('action', 'update_status')
        ticket_id = request.data.get('ticket_id') or request.data.get('id')
        
        try:
            ticket = SupportTicket.objects.get(id=ticket_id)
            if action == 'delete':
                ticket.delete()
                return Response({'message': 'تیکت حذف شد.'})

            new_status = request.data.get('status')
            reply_message = request.data.get('reply') or request.data.get('message', '')
            if action == 'reply_ticket' and reply_message:
                new_status = 'answered'
            if not new_status:
                new_status = ticket.status
            ticket.status = new_status
            ticket.save()
            
            if reply_message:
                TicketReply.objects.create(
                    ticket=ticket,
                    sender_name='پشتیبانی ارشیا نگین',
                    is_admin=True,
                    message=reply_message
                )
            
            return Response({'message': f'تیکت #{ticket.id} بروزرسانی شد.', 'status': new_status})
        except SupportTicket.DoesNotExist:
            return Response({'error': 'تیکت یافت نشد.'}, status=400)

    tickets = SupportTicket.objects.select_related('client', 'project').prefetch_related('replies').all().order_by('-created_at')
    data = [{
        'id': t.id,
        'client_name': t.client_name or (t.client.name if t.client else 'کاربر ناشناس'),
        'client_id': t.client.id if t.client else None,
        'project_id': t.project_id,
        'project_name': t.project.title if t.project else 'تیکت قدیمی بدون پروژه',
        'subject': t.subject,
        'message': t.message,
        'status': t.status,
        'created_at': t.created_at.strftime('%Y/%m/%d - %H:%M'),
        'replies': [{
            'id': r.id,
            'sender_name': r.sender_name,
            'is_admin': r.is_admin,
            'message': r.message,
            'created_at': r.created_at.strftime('%Y/%m/%d - %H:%M')
        } for r in t.replies.all()]
    } for t in tickets]
    return Response(data)

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_sla_contracts(request):
    """
    Admin SLA Support Contracts API (کامل مثل جنگو ادمین)
    """
    if request.method == 'POST':
        subscription_id = request.data.get('subscription_id')
        if not subscription_id:
            return Response({'error': 'انتخاب اشتراک پروژه برای SLA الزامی است.'}, status=400)
        plan_name = request.data.get('plan_name', 'SLA Gold')
        duration_months = int(request.data.get('duration_months', 12))
        support_schedule = request.data.get('support_schedule', '24/7')
        response_time_minutes = int(request.data.get('response_time_minutes', 30))
        resolution_time_hours = int(request.data.get('resolution_time_hours', 4))
        availability_percentage = request.data.get('availability_percentage', '99.90')
        from datetime import date
        try:
            subscription = ClientSubscription.objects.select_related('client', 'project').get(id=subscription_id)
            if not subscription.project:
                return Response({'error': 'اشتراک قدیمی فاقد پروژه است و نمی‌تواند SLA جدید دریافت کند.'}, status=400)
            if hasattr(subscription, 'sla_contract'):
                return Response({'error': 'برای این اشتراک قبلاً قرارداد SLA ثبت شده است.'}, status=400)
            contract = SLASupportContract.objects.create(
                client=subscription.client,
                project=subscription.project,
                subscription=subscription,
                plan_name=plan_name,
                duration_months=duration_months,
                start_date=date.today(),
                support_schedule=support_schedule,
                response_time_minutes=response_time_minutes,
                resolution_time_hours=resolution_time_hours,
                availability_percentage=availability_percentage,
                is_active=True
            )
            return Response({'message': f'قرارداد SLA "{plan_name}" برای پروژه "{subscription.project.title}" ثبت شد.', 'id': contract.id})
        except ClientSubscription.DoesNotExist:
            return Response({'error': 'اشتراک یافت نشد.'}, status=404)

    contracts = SLASupportContract.objects.select_related('client', 'project', 'subscription').all().order_by('-start_date')
    data = [{
        'id': c.id,
        'client_name': c.client.name if c.client else 'سازمان ثبت‌نشده',
        'client_id': c.client.id if c.client else None,
        'project_id': c.project_id,
        'project_name': c.project.title if c.project else 'SLA قدیمی بدون پروژه',
        'subscription_id': c.subscription_id,
        'plan_name': c.plan_name,
        'start_date': c.start_date.strftime('%Y/%m/%d') if c.start_date else '',
        'duration_months': c.duration_months,
        'remaining_days': c.remaining_days,
        'support_schedule': c.support_schedule,
        'response_time_minutes': c.response_time_minutes,
        'resolution_time_hours': c.resolution_time_hours,
        'availability_percentage': str(c.availability_percentage),
        'is_active': c.is_active,
    } for c in contracts]
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_convert_lead(request):
    lead_id = request.data.get('lead_id')
    from leads.models import ProjectLead
    try:
        lead = ProjectLead.objects.get(id=lead_id)
        # Create client
        client, created = ClientOrganization.objects.get_or_create(
            phone=lead.phone,
            defaults={'name': lead.company_name, 'contact_person': lead.contact_person}
        )
        if created:
            Wallet.objects.create(client=client, balance=0)
        ensure_owner_membership(client, lead.phone, lead.contact_person)

        lead.status = 'contract'
        lead.save()
        return Response({'message': 'سرنخ (Lead) به مشتری دائم تبدیل شد و کیف‌پول آن ایجاد گردید.'})
    except Exception as e:
        return Response({'error': str(e)}, status=400)
