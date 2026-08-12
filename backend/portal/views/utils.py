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

def clean_persian_text(text, fallback):
    if not text or '?' in text:
        return fallback
    return text


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """
    API Root Directory for ANPK Enterprise Platform
    GET /api/
    """
    return Response({
        'name': 'سامانه یکپارچه ارشیا نگین پردازش کویر (ANPK API Center)',
        'version': 'v2.5.0',
        'status': 'online',
        'routes': {
            'admin': {
                'description': 'پنل مدیریت ارشد سیستم (دسترسی با JWT Token ادمین)',
                'auth_token': '/api/admin/token/',
                'token_refresh': '/api/admin/token/refresh/',
                'overview': '/api/admin/overview/',
                'analytics': '/api/admin/analytics/',
                'upload': '/api/admin/upload/',
                'articles': '/api/admin/articles/',
                'article_categories': '/api/admin/article-categories/',
                'article_tags': '/api/admin/article-tags/',
                'blog_analytics': '/api/admin/blog-analytics/',
                'scheduled_publish': '/api/admin/scheduled-publish/',
                'clients': '/api/admin/clients/',
                'leads_convert': '/api/admin/leads/convert/',
                'pricing_plans': '/api/admin/finance/plans/',
                'subscriptions': '/api/admin/finance/subscriptions/',
                'invoices': '/api/admin/finance/invoices/',
                'wallets': '/api/admin/wallets/',
                'wallet_transactions': '/api/admin/wallet-transactions/',
                'sla_contracts': '/api/admin/sla-contracts/',
                'projects': '/api/admin/projects/',
                'portfolio_projects': '/api/admin/portfolio-projects/',
                'project_metadata': '/api/admin/project-metadata/',
                'products': '/api/admin/products/',
                'product_categories': '/api/admin/product-categories/',
                'product_features': '/api/admin/product-features/',
                'solutions': '/api/admin/solutions/',
                'tickets': '/api/admin/tickets/',
                'messages': '/api/admin/messages/',
                'users': '/api/admin/users/',
                'nodes': '/api/admin/nodes/',
                'services_config': '/api/admin/services-config/',
                'ai_logs': '/api/admin/ai-logs/',
                'sms_logs': '/api/admin/sms-logs/',
                'otp_logs': '/api/admin/otp-logs/',
                'site_settings': '/api/admin/site-settings/',
            },
            'portal': {
                'description': 'پورتال اختصاصی کارفرمایان و مشتریان (دسترسی با OTP یا JWT)',
                'send_otp': '/api/portal/auth/send-otp/',
                'verify_otp': '/api/portal/auth/verify-otp/',
                'overview': '/api/portal/overview/',
                'wallet': '/api/portal/wallet/',
                'ai_usage': '/api/portal/ai-usage/',
                'invoices': '/api/portal/invoices/',
                'api_keys': '/api/portal/api-keys/',
                'sms_logs': '/api/portal/sms-logs/',
                'tickets': '/api/portal/client/tickets/',
                'ticket_reply': '/api/portal/client/tickets/reply/',
                'notifications': '/api/portal/client/notifications/',
            },
            'public': {
                'description': 'سرویس‌های عمومی وب‌سایت',
                'core_home': '/api/core/home/',
                'core_overview': '/api/core/home-overview/',
                'catalog_products': '/api/catalog/products/',
                'catalog_solutions': '/api/catalog/solutions/',
                'blog_articles': '/api/blog/',
                'projects_public': '/api/projects/public/',
                'leads_submit': '/api/leads/submit/',
                'contact': '/api/contact/',
                'services_ai_query': '/api/services/ai/query/',
            }
        }
    })

