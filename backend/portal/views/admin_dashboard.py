import random
import logging
from django.db import models
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import Organization as ClientOrganization, SMSOTPCode
from billing.models import Wallet, WalletTransaction
from integrations.models import APIKey, SMSLog
from support.models import SLASupportContract, SupportTicket
from services.models import AILog, SystemNodeStatus

User = get_user_model()
logger = logging.getLogger('portal')


# ─────────────────────────────────────────────────────────────
# ADMIN JWT LOGIN — احراز هویت ادمین با نام‌کاربری و رمز عبور
# ─────────────────────────────────────────────────────────────

from portal.views.utils import clean_persian_text

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_overview(request):
    """
    Comprehensive Admin Dashboard API aggregating overall metrics and system status
    """
    from services.models import AILog, SystemNodeStatus
    from leads.models import ProjectLead
    from projects.models import ClientContractProject
    total_clients = ClientOrganization.objects.count()
    total_projects = ClientContractProject.objects.count()
    active_projects = ClientContractProject.objects.filter(is_active=True).count()
    total_wallets_balance = sum([w.balance for w in Wallet.objects.all()]) or 0
    total_tickets = SupportTicket.objects.count()
    pending_tickets = SupportTicket.objects.filter(status='در حال بررسی').count()
    total_ai_logs = AILog.objects.count()
    total_sms_logs = SMSLog.objects.count()

    # Recent Leads
    recent_leads = ProjectLead.objects.all().order_by('-created_at')[:10]
    leads_data = [{
        'id': l.id,
        'name': l.contact_person,
        'organization': l.company_name,
        'phone': l.phone,
        'service_type': l.service_type,
        'budget': l.budget_range,
        'status': l.get_status_display(),
        'created_at': l.created_at.strftime('%Y/%m/%d - %H:%M')
    } for l in recent_leads]

    # System Nodes
    nodes = SystemNodeStatus.objects.all()
    nodes_data = [{
        'id': n.id,
        'name': n.name,
        'status_label': n.status_label,
        'uptime': n.uptime_percentage,
        'latency': n.latency_ms,
        'is_active': n.is_active
    } for n in nodes]

    # Contract Projects (for the projects board sidebar/list)
    contract_projects = ClientContractProject.objects.select_related('client').prefetch_related('phases').all().order_by('-created_at')
    contract_projects_data = [{
        'id': p.id,
        'title': p.title,
        'client_id': p.client.id if p.client else None,
        'client_name': p.client.name if p.client else 'سازمان ثبت‌نشده',
        'contract_number': p.contract_number,
        'active_phase_title': p.active_phase_title,
        'sprint_progress': p.sprint_progress,
        'is_active': p.is_active,
        'phases': [{
            'id': ph.id,
            'phase_number': ph.phase_number,
            'title': ph.title,
            'description': ph.description,
            'progress_percentage': ph.progress_percentage,
            'status': ph.status,
            'start_date': ph.start_date.strftime('%Y-%m-%d') if ph.start_date else None,
            'target_delivery_date': ph.target_delivery_date.strftime('%Y-%m-%d') if ph.target_delivery_date else None,
            'deliverable_file': ph.deliverable_file.url if ph.deliverable_file else None,
        } for ph in p.phases.all()]
    } for p in contract_projects]

    return Response({
        'total_clients': total_clients,
        'total_projects': total_projects,
        'active_projects': active_projects,
        'total_wallets_balance': total_wallets_balance,
        'total_tickets': total_tickets,
        'pending_tickets': pending_tickets,
        'total_ai_logs': total_ai_logs,
        'total_sms_logs': total_sms_logs,
        'recent_leads': leads_data,
        'nodes': nodes_data,
        'contract_projects': contract_projects_data
    })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_analytics(request):
    """
    Admin Analytics API for charts (Revenue, AI usage trend, Project progress)
    """
    from services.models import AILog
    from projects.models import ClientContractProject

    # Monthly revenue simulation / calculation
    revenue_chart = [
        {'month': 'مهر', 'revenue': 45000000},
        {'month': 'آبان', 'revenue': 62000000},
        {'month': 'آذر', 'revenue': 88000000},
        {'month': 'دی', 'revenue': 120000000},
        {'month': 'بهمن', 'revenue': 185000000},
    ]

    # AI Usage Trend
    ai_trend = [
        {'day': 'شنبه', 'queries': 120},
        {'day': 'یکشنبه', 'queries': 185},
        {'day': 'دوشنبه', 'queries': 240},
        {'day': 'سه‌شنبه', 'queries': 310},
        {'day': 'چهارشنبه', 'queries': 450},
        {'day': 'پنج‌شنبه', 'queries': 290},
        {'day': 'جمعه', 'queries': 150},
    ]

    # Projects progress breakdown
    projects = ClientContractProject.objects.all()
    projects_breakdown = [{
        'name': p.title,
        'progress': p.sprint_progress
    } for p in projects]

    return Response({
        'revenue_chart': revenue_chart,
        'ai_trend': ai_trend,
        'projects_breakdown': projects_breakdown,
    })

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_delete_item(request):
    """
    Universal Delete API for Admin models
    """
    model_name = request.data.get('model')
    item_id = request.data.get('id')

    if not item_id:
        return Response({'error': 'شناسه آیتم الزامی است.'}, status=400)

    try:
        if model_name == 'lead':
            from leads.models import ProjectLead
            ProjectLead.objects.filter(id=item_id).delete()
        elif model_name == 'ticket':
            SupportTicket.objects.filter(id=item_id).delete()
        elif model_name == 'project':
            from projects.models import ClientContractProject
            ClientContractProject.objects.filter(id=item_id).delete()
        elif model_name == 'node':
            from services.models import SystemNodeStatus
            SystemNodeStatus.objects.filter(id=item_id).delete()
        elif model_name == 'article':
            from blog.models import Article
            Article.objects.filter(id=item_id).delete()
        elif model_name == 'client':
            ClientOrganization.objects.filter(id=item_id).delete()
        return Response({'message': 'آیتم مورد نظر با موفقیت حذف گردید.'})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_update_item(request):
    """
    Universal Update API for Admin models (Leads, Projects, Tickets, Nodes, Clients, Products)
    """
    model_name = request.data.get('model')
    item_id = request.data.get('id')

    if not item_id or not model_name:
        return Response({'error': 'مدل و شناسه آیتم الزامی است.'}, status=400)

    try:
        if model_name == 'lead':
            from leads.models import ProjectLead
            lead = ProjectLead.objects.get(id=item_id)
            if 'status' in request.data: lead.status = request.data['status']
            if 'company_name' in request.data: lead.company_name = request.data['company_name']
            if 'contact_person' in request.data: lead.contact_person = request.data['contact_person']
            if 'phone' in request.data: lead.phone = request.data['phone']
            if 'budget_range' in request.data: lead.budget_range = request.data['budget_range']
            lead.save()
            return Response({'message': f'درخواست لید #{item_id} با موفقیت ویرایش گردید.'})

        elif model_name == 'project':
            from projects.models import ClientContractProject
            project = ClientContractProject.objects.get(id=item_id)
            if 'title' in request.data: project.title = request.data['title']
            if 'contract_number' in request.data: project.contract_number = request.data['contract_number']
            if 'current_phase' in request.data: project.current_phase = request.data['current_phase']
            if 'progress_percentage' in request.data: project.progress_percentage = int(request.data['progress_percentage'])
            if 'is_active' in request.data: project.is_active = bool(request.data['is_active'])
            project.save()
            return Response({'message': f'پروژه "{project.title}" بروزرسانی شد.'})

        elif model_name == 'node':
            from services.models import SystemNodeStatus
            node = SystemNodeStatus.objects.get(id=item_id)
            if 'name' in request.data: node.name = request.data['name']
            if 'status_label' in request.data: node.status_label = request.data['status_label']
            if 'latency_ms' in request.data: node.latency_ms = int(request.data['latency_ms'])
            if 'uptime_percentage' in request.data: node.uptime_percentage = request.data['uptime_percentage']
            if 'is_active' in request.data: node.is_active = bool(request.data['is_active'])
            node.save()
            return Response({'message': f'نود "{node.name}" بروزرسانی شد.'})

        elif model_name == 'ticket':
            ticket = SupportTicket.objects.get(id=item_id)
            if 'status' in request.data: ticket.status = request.data['status']
            if 'subject' in request.data: ticket.subject = request.data['subject']
            ticket.save()
            return Response({'message': f'تیکت #{item_id} بروزرسانی گردید.'})

        elif model_name == 'product':
            from catalog.models import Product
            product = Product.objects.get(id=item_id)
            if 'name' in request.data: product.name = request.data['name']
            if 'short_description' in request.data: product.short_description = request.data['short_description']
            if 'status' in request.data: product.status = request.data['status']
            product.save()
            return Response({'message': f'محصول "{product.name}" بروزرسانی شد.'})

        return Response({'error': 'مدل نامعتبر است.'}, status=400)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

