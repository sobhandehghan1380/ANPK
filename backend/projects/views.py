from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ProjectCategory, Technology, PublicPortfolioProject, ClientContractProject, ProjectPhase
from portal.models import ClientOrganization

@api_view(['GET'])
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
def client_portal_projects(request):
    # Strict Phone-based Multi-Tenant Isolation
    phone = request.GET.get('phone') or request.headers.get('X-User-Phone')
    
    if not phone:
        return Response([], status=200)

    phone_clean = phone.strip().replace('+98', '0')
    client = ClientOrganization.objects.filter(phone__icontains=phone_clean).first()

    if not client:
        return Response([], status=200)

    projects = ClientContractProject.objects.filter(client=client, is_active=True)

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
