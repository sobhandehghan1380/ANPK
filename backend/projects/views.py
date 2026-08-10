from rest_framework.decorators import api_view, permission_classes
from django.db.models import Count, Q, Sum
from django.utils.dateparse import parse_date
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import ProjectCategory, Technology, PublicPortfolioProject, ClientContractProject, ProjectPhase
from accounts.models import Organization
from integrations.models import SMSLog
from accounts.selectors import get_current_member
from services.models import AILog


def _usage_date_range(request):
    date_from_value = request.query_params.get('date_from')
    date_to_value = request.query_params.get('date_to')
    date_from = parse_date(date_from_value) if date_from_value else None
    date_to = parse_date(date_to_value) if date_to_value else None
    if date_from_value and not date_from:
        return None, None, Response(
            {'error': 'date_from باید با قالب YYYY-MM-DD ارسال شود.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if date_to_value and not date_to:
        return None, None, Response(
            {'error': 'date_to باید با قالب YYYY-MM-DD ارسال شود.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if date_from and date_to and date_from > date_to:
        return None, None, Response(
            {'error': 'date_from نمی‌تواند بعد از date_to باشد.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    return date_from, date_to, None


def _usage_log_limit(request):
    try:
        return max(1, min(int(request.query_params.get('limit', 50)), 100))
    except (TypeError, ValueError):
        return 50


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def project_usage(request, project_id):
    """Return tenant-safe AI and SMS consumption for one contract project."""
    project = ClientContractProject.objects.select_related('client').filter(id=project_id).first()
    if not project:
        return Response({'error': 'پروژه یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)

    if request.user.is_staff:
        access_scope = 'admin'
    else:
        member = get_current_member(request)
        if not member or not member.organization.portal_access:
            return Response({'error': 'دسترسی به پورتال این سازمان فعال نیست.'}, status=status.HTTP_403_FORBIDDEN)
        if project.client_id != member.organization_id:
            # Do not reveal whether another tenant's project exists.
            return Response({'error': 'پروژه یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)
        access_scope = 'organization'

    date_from, date_to, date_error = _usage_date_range(request)
    if date_error:
        return date_error

    ai_logs = AILog.objects.filter(project=project)
    sms_logs = SMSLog.objects.filter(project=project)
    if date_from:
        ai_logs = ai_logs.filter(created_at__date__gte=date_from)
        sms_logs = sms_logs.filter(sent_at__date__gte=date_from)
    if date_to:
        ai_logs = ai_logs.filter(created_at__date__lte=date_to)
        sms_logs = sms_logs.filter(sent_at__date__lte=date_to)

    ai_summary = ai_logs.aggregate(
        request_count=Count('id'),
        total_cost=Sum('cost_deducted'),
    )
    sms_summary = sms_logs.aggregate(
        message_count=Count('id'),
        total_cost=Sum('cost'),
        delivered_count=Count(
            'id',
            filter=Q(status__iexact='delivered') | Q(status__iexact='sent'),
        ),
        failed_count=Count('id', filter=Q(status__iexact='failed')),
    )
    model_breakdown = list(
        ai_logs.values('model_used')
        .annotate(request_count=Count('id'), total_cost=Sum('cost_deducted'))
        .order_by('-request_count', 'model_used')
    )
    limit = _usage_log_limit(request)

    return Response({
        'project': {
            'id': project.id,
            'title': project.title,
            'contract_number': project.contract_number,
            'organization_id': project.client_id,
            'organization_name': project.client.name,
        },
        'access_scope': access_scope,
        'period': {
            'date_from': date_from.isoformat() if date_from else None,
            'date_to': date_to.isoformat() if date_to else None,
        },
        'ai': {
            'request_count': ai_summary['request_count'],
            'total_cost': ai_summary['total_cost'] or 0,
            'models': model_breakdown,
            'logs': [{
                'id': item.id,
                'user_query': item.user_query,
                'ai_response': item.ai_response,
                'model_used': item.model_used,
                'cost_deducted': item.cost_deducted,
                'created_at': item.created_at.isoformat(),
                'project_id': project.id,
                'project_name': project.title,
            } for item in ai_logs.order_by('-created_at')[:limit]],
        },
        'sms': {
            'message_count': sms_summary['message_count'],
            'total_cost': sms_summary['total_cost'] or 0,
            'delivered_count': sms_summary['delivered_count'],
            'failed_count': sms_summary['failed_count'],
            'logs': [{
                'id': item.id,
                'recipient': item.recipient,
                'text': item.text,
                'operator': item.operator,
                'cost': item.cost,
                'status': item.status,
                'sent_at': item.sent_at.isoformat(),
                'project_id': project.id,
                'project_title': project.title,
            } for item in sms_logs.order_by('-sent_at')[:limit]],
        },
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def public_portfolio_projects(request):
    projects = PublicPortfolioProject.objects.filter(is_featured=True)
    if not projects.exists():
        cat_cmms, _ = ProjectCategory.objects.get_or_create(name='نگهداشت تأسیسات & CMMS', slug='cmms')
        cat_webrtc, _ = ProjectCategory.objects.get_or_create(name='ارتباطات تصویری & WebRTC', slug='webrtc')

        t_python, _ = Technology.objects.get_or_create(name='Python 3.12', category='بک‌اند')
        t_django, _ = Technology.objects.get_or_create(name='Django REST Framework', category='بک‌اند')
        t_next, _ = Technology.objects.get_or_create(name='Next.js 14', category='فرانت‌اند')
        t_webrtc, _ = Technology.objects.get_or_create(name='WebRTC Protocol', category='استریمینگ')

        p1 = PublicPortfolioProject.objects.create(
            title='سامانه مدیریت نگهداشت تأسیسات و CMMS بیمارستانی',
            slug='cmms-facility-negar',
            category=cat_cmms,
            client_name_display='دانشگاه‌های علوم پزشکی و بیمارستان‌های کشور',
            summary='پایدارسازی و مانیتورینگ آنلاین تاسیسات چیلر، موتورخانه، ژنراتورها و کالیبراسیون تجهیزات پزشکی با پایداری ۹۹.۹٪.',
            full_description='طراحی و استقرار کامل معماری میکروسرویس CMMS بیمارستانی شامل ماژول هشدارهای آنی پیامکی SMS.',
            sprint_progress=100
        )
        p1.technologies.add(t_python, t_django, t_next)

        p2 = PublicPortfolioProject.objects.create(
            title='پلتفرم کلاس‌های آنلاین و برگزاری وبینار اختصاصی آیرا (Aira)',
            slug='aira-webrtc-platform',
            category=cat_webrtc,
            client_name_display='دانشگاه‌ها و مراکز آموزشی بزرگ کشور',
            summary='زیرساخت بومی برگزاری همایش‌ها و کلاس‌های آنلاین تحت وب بدون نیاز به نصب نرم‌افزار جانبی.',
            full_description='پلتفرم اختصاصی آیرا مبتنی بر پروتکل استریمینگ کم‌تاخیر WebRTC.',
            sprint_progress=100
        )
        p2.technologies.add(t_webrtc, t_python, t_django, t_next)

        projects = PublicPortfolioProject.objects.filter(is_featured=True)

    data = [{
        'id': p.id,
        'title': p.title,
        'slug': p.slug,
        'category': p.category.name if p.category else 'پلتفرم سازمانی',
        'category_slug': p.category.slug if p.category else 'general',
        'client_display': p.client_name_display,
        'summary': p.summary,
        'full_description': p.full_description,
        'technologies': [tech.name for tech in p.technologies.all()],
        'progress': p.sprint_progress,
        'demo_url': p.demo_url,
        'meta_title': p.meta_title,
        'meta_description': p.meta_description
    } for p in projects]
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def client_portal_projects(request):
    # Multi-tenant isolation via the authenticated member's JWT — never a client-supplied phone
    member = get_current_member(request)
    if not member:
        return Response({'error': 'دسترسی غیرمجاز. لطفاً مجدداً وارد پورتال شوید.'}, status=403)

    projects = ClientContractProject.objects.filter(client=member.organization, is_active=True)

    data = [{
        'id': p.id,
        'title': p.title,
        'slug': p.slug,
        'contract_number': p.contract_number,
        'contract_date': p.contract_date.strftime('%Y/%m/%d') if p.contract_date else '',
        'contract_value': p.contract_value,
        'progress': p.sprint_progress,
        'active_phase': p.active_phase_title,
        'delivery_date': p.delivery_date.strftime('%Y/%m/%d') if p.delivery_date else '',
        'login_url': p.login_url or '/portal',
        'usage_api': f'/api/v1/projects/{p.id}/usage/',
        'phases': [{
            'number': phase.phase_number,
            'title': phase.title,
            'description': phase.description or '',
            'progress': phase.progress_percentage,
            'status': phase.status,
            'status_display': phase.get_status_display(),
            'start_date': phase.start_date.strftime('%Y/%m/%d'),
            'target_date': phase.target_delivery_date.strftime('%Y/%m/%d'),
            'deliverable_file': phase.deliverable_file.url if phase.deliverable_file else None,
        } for phase in p.phases.all()]
    } for p in projects]
    return Response(data)
