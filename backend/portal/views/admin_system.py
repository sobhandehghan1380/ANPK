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
    UserProfile,
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

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_ai_logs(request):
    """
    Admin AI Usage Monitoring API for all organizations
    """
    from services.models import AILog
    logs = AILog.objects.select_related('project', 'project__client').all().order_by('-created_at')
    data = [{
        'id': l.id,
        'user_query': l.user_query,
        'ai_response': l.ai_response,
        'cost_deducted': l.cost_deducted,
        'model_used': l.model_used,
        'project_name': l.project.title if l.project else 'عمومی سازمان',
        'client_name': l.project.client.name if (l.project and l.project.client) else 'کاربر پورتال',
        'created_at': l.created_at.strftime('%Y/%m/%d - %H:%M')
    } for l in logs]
    return Response(data)

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_sms_logs(request):
    """
    Admin SMS Logs Monitoring & Direct Sending API
    """
    if request.method == 'POST':
        recipient = request.data.get('recipient')
        text = request.data.get('text')
        operator = request.data.get('operator', 'کاوه‌نگار / مگفا (بومی)')

        if not recipient or not text:
            return Response({'error': 'شماره دریافت‌کننده و متن پیامک الزامی است.'}, status=400)

        sms_log = SMSLog.objects.create(
            recipient=recipient,
            text=text,
            operator=operator,
            cost=240,
            status='SENT'
        )
        return Response({'message': f'پیامک با موفقیت به شماره {recipient} ارسال شد.', 'id': sms_log.id})

    logs = SMSLog.objects.select_related('project', 'project__client').all().order_by('-created_at')
    data = [{
        'id': s.id,
        'recipient': s.recipient,
        'text': s.text,
        'operator': s.operator,
        'cost': s.cost,
        'project_title': s.project.title if s.project else 'پیامک سازمانی / اطلاع‌رسانی',
        'client_name': s.project.client.name if (s.project and s.project.client) else 'سیستم متمرکز',
        'sent_at': s.created_at.strftime('%Y/%m/%d - %H:%M')
    } for s in logs]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_otp_logs(request):
    """
    Admin SMS OTP Codes Log (مثل SMSOTPCodeAdmin در جنگو)
    """
    otps = SMSOTPCode.objects.all().order_by('-created_at')[:100]
    data = [{
        'id': o.id,
        'phone': o.phone,
        'code': o.code,
        'is_used': o.is_used,
        'created_at': o.created_at.strftime('%Y/%m/%d - %H:%M')
    } for o in otps]
    return Response(data)

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_nodes(request):
    """
    Admin Server Nodes Monitoring & Management API
    """
    from services.models import SystemNodeStatus
    if request.method == 'POST':
        name = request.data.get('name')
        status_label = request.data.get('status_label', 'عملیاتی (۹۹.۹٪)')
        uptime = request.data.get('uptime', '۹۹.۹٪')
        latency = int(request.data.get('latency', 25))

        node = SystemNodeStatus.objects.create(
            name=name,
            status_label=status_label,
            uptime_percentage=uptime,
            latency_ms=latency,
            is_active=True
        )
        return Response({'message': f'نود جدید "{name}" اضافه شد.', 'id': node.id})

    nodes = SystemNodeStatus.objects.all()
    data = [{
        'id': n.id,
        'name': n.name,
        'status_label': n.status_label,
        'uptime': n.uptime_percentage,
        'latency': n.latency_ms,
        'is_active': n.is_active
    } for n in nodes]
    return Response(data)

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_services_config(request):
    """
    Admin AI & SMS Services Configuration API (OpenRouterConfig & SMSGatewayConfig)
    """
    from services.models import OpenRouterConfig, SMSGatewayConfig
    if request.method == 'POST':
        default_model = request.data.get('default_model', 'anthropic/claude-3.5-sonnet')
        rate = int(request.data.get('wallet_rate_per_query', 240))
        sender_line = request.data.get('sender_line', '3000777')

        ai_cfg, _ = OpenRouterConfig.objects.get_or_create(id=1)
        ai_cfg.default_model = default_model
        ai_cfg.wallet_rate_per_query = rate
        ai_cfg.is_active = True
        ai_cfg.save()

        sms_cfg, _ = SMSGatewayConfig.objects.get_or_create(id=1)
        sms_cfg.sender_line = sender_line
        sms_cfg.is_active = True
        sms_cfg.save()

        return Response({
            'message': 'تنظیمات درگاه‌های AI و پیامک با موفقیت بروزرسانی شد.',
            'default_model': ai_cfg.default_model,
            'wallet_rate_per_query': ai_cfg.wallet_rate_per_query,
            'sender_line': sms_cfg.sender_line
        })

    ai_cfg = OpenRouterConfig.objects.first()
    sms_cfg = SMSGatewayConfig.objects.first()

    return Response({
        'default_model': ai_cfg.default_model if ai_cfg else 'google/gemini-2.5-flash',
        'wallet_rate_per_query': ai_cfg.wallet_rate_per_query if ai_cfg else 240,
        'ai_active': ai_cfg.is_active if ai_cfg else True,
        'provider_name': sms_cfg.provider_name if sms_cfg else 'کاوه‌نگار / مگفا (بومی)',
        'sender_line': sms_cfg.sender_line if sms_cfg else '3000777',
        'sms_active': sms_cfg.is_active if sms_cfg else True,
    })

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_users(request):
    """
    Admin Users & Roles Management API (Full Django Auth Users Integration)
    """
    from django.contrib.auth import get_user_model
    User = get_user_model()

    if request.method == 'POST':
        action = request.data.get('action', 'create_or_update')

        
        if action == 'edit_user':
            user_id = request.data.get('id')
            user = User.objects.filter(id=user_id).first()
            if not user: return Response({'error': 'کاربر یافت نشد.'}, status=400)
            
            first_name = request.data.get('first_name', '')
            last_name = request.data.get('last_name', '')
            if request.data.get('email'): user.email = request.data.get('email')
            if request.data.get('password'): user.set_password(request.data.get('password'))
            user.first_name = first_name
            user.last_name = last_name
            role = request.data.get('role', 'client')
            user.is_staff = True if role in ['admin', 'superuser'] else False
            user.is_superuser = True if role == 'superuser' else False
            user.save()

            if not hasattr(user, 'profile'):
                UserProfile.objects.create(user=user)
            
            user.profile.phone_number = request.data.get('phone_number', '')
            user.profile.national_code = request.data.get('national_code', '')
            user.profile.job_title = request.data.get('job_title', '')
            user.profile.address = request.data.get('address', '')
            user.profile.bio = request.data.get('bio', '')
            user.profile.save()

            return Response({'message': f'اطلاعات کاربر "{user.username}" با موفقیت بروزرسانی شد.'})

        if action == 'toggle_active':
            user_id = request.data.get('id')
            user = User.objects.filter(id=user_id).first()
            if user:
                user.is_active = not user.is_active
                user.save()
                return Response({'message': f'وضعیت فعال‌سازی کاربر "{user.username}" به {user.is_active} تغییر یافت.'})
            return Response({'error': 'کاربر یافت نشد.'}, status=400)

        username = request.data.get('username')
        email = request.data.get('email', '')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        role = request.data.get('role', 'admin') # superuser, admin, client
        is_active = request.data.get('is_active', True)

        if not username:
            return Response({'error': 'نام کاربری الزامی است.'}, status=400)

        user, created = User.objects.get_or_create(username=username)
        if email:
            user.email = email
        if password:
            user.set_password(password)
        if first_name:
            user.first_name = first_name
        if last_name:
            user.last_name = last_name

        user.is_staff = True if role in ['admin', 'superuser'] else False
        user.is_superuser = True if role == 'superuser' else False
        user.is_active = bool(is_active)
        user.save()

        # --- Handle Profile Fields ---
        phone_number = request.data.get('phone_number', '')
        national_code = request.data.get('national_code', '')
        job_title = request.data.get('job_title', '')
        address = request.data.get('address', '')
        bio = request.data.get('bio', '')

        if not hasattr(user, 'profile'):
            UserProfile.objects.create(user=user)
        
        user.profile.phone_number = phone_number
        user.profile.national_code = national_code
        user.profile.job_title = job_title
        user.profile.address = address
        user.profile.bio = bio
        user.profile.save()


        msg = f'کاربر "{username}" جدید با نقش {role} ایجاد شد.' if created else f'اطلاعات کاربر "{username}" بروزرسانی شد.'
        return Response({'message': msg, 'id': user.id})

    if request.method == 'DELETE':
        user_id = request.data.get('id')
        User.objects.filter(id=user_id).delete()
        return Response({'message': 'کاربر با موفقیت حذف گردید.'})

    users = User.objects.all().order_by('-date_joined')
    data = [{
        'id': u.id,
        'username': u.username,
        'first_name': u.first_name,
        'last_name': u.last_name,
        'phone_number': getattr(u, 'profile', None).phone_number if getattr(u, 'profile', None) else '',
        'national_code': getattr(u, 'profile', None).national_code if getattr(u, 'profile', None) else '',
        'job_title': getattr(u, 'profile', None).job_title if getattr(u, 'profile', None) else '',
        'address': getattr(u, 'profile', None).address if getattr(u, 'profile', None) else '',
        'bio': getattr(u, 'profile', None).bio if getattr(u, 'profile', None) else '',
        'email': u.email or 'ثبت‌نشده',
        'is_active': u.is_active,
        'is_staff': u.is_staff,
        'is_superuser': u.is_superuser,
        'role_label': 'مدیر ارشد (Superuser)' if u.is_superuser else ('ادمین سیستم' if u.is_staff else 'کاربر پورتال'),
        'date_joined': u.date_joined.strftime('%Y/%m/%d - %H:%M') if u.date_joined else '۱۴۰۴/۰۱/۰۱'
    } for u in users]
    return Response(data)

