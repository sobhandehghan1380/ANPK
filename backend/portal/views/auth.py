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

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_token_obtain(request):
    """
    POST /api/portal/admin/token/
    دریافت JWT token برای ادمین‌های سیستم
    body: { "username": "...", "password": "..." }
    """
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()

    if not username or not password:
        return Response({'error': 'نام کاربری و رمز عبور الزامی است.'}, status=400)

    user = authenticate(username=username, password=password)
    if user is None:
        logger.warning(f'[ADMIN_AUTH] Failed login attempt for username: {username}')
        return Response({'error': 'نام کاربری یا رمز عبور اشتباه است.'}, status=401)

    if not user.is_staff:
        logger.warning(f'[ADMIN_AUTH] Non-staff user attempted admin login: {username}')
        return Response({'error': 'شما دسترسی ادمین ندارید.'}, status=403)

    refresh = RefreshToken.for_user(user)
    logger.info(f'[ADMIN_AUTH] Successful admin login: {username}')
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        }
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_token_refresh(request):
    """
    POST /api/portal/admin/token/refresh/
    تمدید JWT token با refresh token
    """
    from rest_framework_simplejwt.tokens import RefreshToken as RT
    from rest_framework_simplejwt.exceptions import TokenError
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response({'error': 'refresh token الزامی است.'}, status=400)
    try:
        token = RT(refresh_token)
        return Response({'access': str(token.access_token)})
    except TokenError as e:
        return Response({'error': 'توکن نامعتبر یا منقضی شده است.'}, status=401)

