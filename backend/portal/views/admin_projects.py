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
    SupportTicket, APIKey, SMSLog, SMSOTPCode
)
from services.models import AILog, SystemNodeStatus

User = get_user_model()
logger = logging.getLogger('portal')


# ─────────────────────────────────────────────────────────────
# ADMIN JWT LOGIN — احراز هویت ادمین با نام‌کاربری و رمز عبور
# ─────────────────────────────────────────────────────────────

from portal.views.utils import clean_persian_text

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_projects(request):
    """
    Admin Projects Management API to list and create client projects with phases and API keys
    """
    from projects.models import ClientContractProject, ProjectPhase
    from portal.models import APIKey
    import secrets

    if request.method == 'POST':
        action = request.data.get('action', 'create_project')


        if action == 'update_phase':
            phase_id = request.data.get('phase_id')
            progress = request.data.get('progress')
            status_val = request.data.get('status')
            start_date = request.data.get('start_date')
            target_delivery_date = request.data.get('target_delivery_date')
            deliverable_file = request.FILES.get('deliverable_file')
            
            try:
                phase = ProjectPhase.objects.get(id=phase_id)
                if progress is not None: phase.progress_percentage = int(progress)
                if status_val: phase.status = status_val
                if start_date: phase.start_date = start_date
                if target_delivery_date: phase.target_delivery_date = target_delivery_date
                if deliverable_file: phase.deliverable_file = deliverable_file
                phase.save()
                
                # Auto update parent project sprint_progress based on phases average
                proj = phase.project
                phases = proj.phases.all()
                if phases.exists():
                    total_prog = sum(p.progress_percentage for p in phases)
                    proj.sprint_progress = int(total_prog / phases.count())
                    # active phase title is the first non-completed phase
                    active = phases.filter(status='IN_PROGRESS').first() or phases.filter(status='PENDING').first()
                    if active:
                        proj.active_phase_title = active.title
                    else:
                        proj.active_phase_title = "تمام فازها تکمیل شده"
                    proj.save()
                    
                return Response({'message': 'فاز پروژه و درصد پیشرفت کلی با موفقیت بروزرسانی شد.'})
            except ProjectPhase.DoesNotExist:
                return Response({'error': 'فاز یافت نشد.'}, status=400)

        if action == 'generate_key':
            project_id = request.data.get('project_id')
            key_name = request.data.get('key_name', 'کلید API پروژه‌ای')
            try:
                project = ClientContractProject.objects.get(id=project_id)
                api_key_str = f"anpk_proj_{secrets.token_hex(16)}"
                api_key = APIKey.objects.create(
                    client=project.client,
                    project=project,
                    name=key_name,
                    key_type='PROJECT',
                    api_key=api_key_str,
                    is_active=True
                )
                return Response({'message': f'کلید API با موفقیت برای پروژه "{project.title}" صادر شد.', 'api_key': api_key.api_key})
            except ClientContractProject.DoesNotExist:
                return Response({'error': 'پروژه یافت نشد.'}, status=400)

        # Default create_project action
        client_id = request.data.get('client_id')
        title = request.data.get('title')
        contract_number = request.data.get('contract_number', 'CN-1404-01')

        try:
            client = ClientOrganization.objects.get(id=client_id)
            project = ClientContractProject.objects.create(
                client=client,
                title=title,
                contract_number=contract_number,
                active_phase_title='فاز ۲: پیاده‌سازی زیرساخت و دیتابیس',
                sprint_progress=35,
                is_active=True
            )

            # Create default 3 Project Phases
            phases_data = [
                {'phase_number': 1, 'title': 'فاز ۱: نیازسنجی و طراحی معماری', 'progress': 100, 'status': 'COMPLETED'},
                {'phase_number': 2, 'title': 'فاز ۲: پیاده‌سازی زیرساخت و دیتابیس', 'progress': 40, 'status': 'IN_PROGRESS'},
                {'phase_number': 3, 'title': 'فاز ۳: استقرار، تست و گارانتی SLA', 'progress': 0, 'status': 'NOT_STARTED'},
            ]
            for p in phases_data:
                ProjectPhase.objects.create(
                    project=project,
                    phase_number=p['phase_number'],
                    title=p['title'],
                    progress_percentage=p['progress'],
                    status=p['status']
                )

            # Generate default project API Key
            api_key_str = f"anpk_proj_{secrets.token_hex(16)}"
            APIKey.objects.create(
                client=client,
                project=project,
                name=f"کلید دسترسی اصلی {title}",
                key_type='PROJECT',
                api_key=api_key_str,
                is_active=True
            )

            return Response({'message': f'پروژه "{title}" به همراه فازبندی و کلید API صادر گردید.', 'id': project.id})
        except ClientOrganization.DoesNotExist:
            return Response({'error': 'سازمان انتخاب شده یافت نشد.'}, status=400)

    projects = ClientContractProject.objects.select_related('client').prefetch_related('phases', 'api_keys').all().order_by('-created_at')
    data = []
    for p in projects:
        data.append({
            'id': p.id,
            'title': p.title,
            'client_name': p.client.name if p.client else 'سازمان ثبت‌نشده',
            'contract_number': p.contract_number,
            'active_phase_title': p.active_phase_title,
            'sprint_progress': p.sprint_progress,
            'is_active': p.is_active,
            'phases': [{
                'id': ph.id,
                'phase_number': ph.phase_number,
                'title': ph.title,
                'progress_percentage': ph.progress_percentage,
                'status': ph.status,
                'start_date': ph.start_date.strftime('%Y-%m-%d') if ph.start_date else None,
                'target_delivery_date': ph.target_delivery_date.strftime('%Y-%m-%d') if ph.target_delivery_date else None,
                'deliverable_file': ph.deliverable_file.url if ph.deliverable_file else None,
            } for ph in p.phases.all()],
            'api_keys': [{
                'id': k.id,
                'name': k.name,
                'api_key': k.api_key,
                'is_active': k.is_active,
                'created_at': k.created_at.strftime('%Y/%m/%d')
            } for k in p.api_keys.all()]
        })
    return Response(data)

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_portfolio_projects(request):
    """
    Admin Public Portfolio Projects API
    """
    from projects.models import PublicPortfolioProject, ProjectCategory, Technology
    
    if request.method == 'POST':
        title = request.data.get('title')
        summary = request.data.get('summary', '')
        client_name_display = request.data.get('client_name_display', 'سازمان')
        sprint_progress = int(request.data.get('sprint_progress', 100))
        is_featured = request.data.get('is_featured', False)
        slug = request.data.get('slug', title.replace(' ', '-').lower() if title else 'project')
        
        full_description = request.data.get('full_description', '')
        meta_title = request.data.get('meta_title', '')
        meta_description = request.data.get('meta_description', '')

        proj = PublicPortfolioProject.objects.create(
            title=title, summary=summary, client_name_display=client_name_display,
            sprint_progress=sprint_progress, is_featured=bool(is_featured), slug=slug,
            full_description=full_description, meta_title=meta_title, meta_description=meta_description
        )
        return Response({'message': f'پروژه نمونه‌کار "{title}" به پورتفولیو اضافه شد.', 'id': proj.id})
        
    elif request.method == 'PUT':
        item_id = request.data.get('id')
        try:
            proj = PublicPortfolioProject.objects.get(id=item_id)
            if 'title' in request.data: proj.title = request.data['title']
            if 'summary' in request.data: proj.summary = request.data['summary']
            if 'client_name_display' in request.data: proj.client_name_display = request.data['client_name_display']
            if 'sprint_progress' in request.data: proj.sprint_progress = int(request.data['sprint_progress'])
            if 'is_featured' in request.data: proj.is_featured = bool(request.data['is_featured'])
            if 'full_description' in request.data: proj.full_description = request.data['full_description']
            if 'meta_title' in request.data: proj.meta_title = request.data['meta_title']
            if 'meta_description' in request.data: proj.meta_description = request.data['meta_description']
            proj.save()
            return Response({'message': 'نمونه‌کار با موفقیت ویرایش شد.'})
        except PublicPortfolioProject.DoesNotExist:
            return Response({'error': 'پروژه یافت نشد.'}, status=404)
            
    elif request.method == 'DELETE':
        item_id = request.data.get('id') or request.query_params.get('id')
        try:
            PublicPortfolioProject.objects.get(id=item_id).delete()
            return Response({'message': 'نمونه‌کار با موفقیت حذف شد.'})
        except PublicPortfolioProject.DoesNotExist:
            return Response({'error': 'پروژه یافت نشد.'}, status=404)

    projects = PublicPortfolioProject.objects.select_related('category').prefetch_related('technologies').all().order_by('-created_at')
    data = [{
        'id': p.id,
        'title': p.title,
        'slug': p.slug,
        'summary': p.summary,
        'full_description': p.full_description,
        'meta_title': p.meta_title,
        'meta_description': p.meta_description,
        'client_name_display': p.client_name_display,
        'category_name': p.category.name if p.category else 'عمومی',
        'sprint_progress': p.sprint_progress,
        'is_featured': p.is_featured,
        'technologies': [t.name for t in p.technologies.all()],
        'created_at': p.created_at.strftime('%Y/%m/%d') if p.created_at else ''
    } for p in projects]
    return Response(data)

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_project_metadata(request):
    '''
    Admin API for managing ProjectCategory and Technology.
    '''
    from projects.models import ProjectCategory, Technology
    
    if request.method == 'POST':
        action = request.data.get('action')
        if action == 'add_category':
            name = request.data.get('name')
            if name:
                ProjectCategory.objects.create(name=name, slug=name.replace(' ', '-').lower())
                return Response({'message': 'دسته‌بندی جدید ایجاد شد'})
        elif action == 'add_technology':
            name = request.data.get('name')
            if name:
                Technology.objects.create(name=name, icon_class=request.data.get('icon_class', 'code'))
                return Response({'message': 'تکنولوژی جدید ایجاد شد'})
                
    elif request.method == 'DELETE':
        action = request.data.get('action')
        item_id = request.data.get('id')
        if action == 'delete_category' and item_id:
            try:
                ProjectCategory.objects.get(id=item_id).delete()
                return Response({'message': 'دسته‌بندی حذف شد'})
            except ProjectCategory.DoesNotExist:
                return Response({'error': 'Not found'}, status=404)
        elif action == 'delete_technology' and item_id:
            try:
                Technology.objects.get(id=item_id).delete()
                return Response({'message': 'تکنولوژی حذف شد'})
            except Technology.DoesNotExist:
                return Response({'error': 'Not found'}, status=404)

    categories = ProjectCategory.objects.all()
    technologies = Technology.objects.all()
    
    data = {
        'categories': [{'id': c.id, 'name': c.name, 'slug': c.slug} for c in categories],
        'technologies': [{'id': t.id, 'name': t.name, 'icon_class': t.icon_class} for t in technologies]
    }
    return Response(data)

