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

def clean_persian_text(text, fallback):
    if not text or '?' in text:
        return fallback
    return text


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """
    API Root Directory for ANPK Enterprise Platform
    GET /api/v1/
    """
    payload = {
        'name': 'سامانه یکپارچه ارشیا نگین پردازش کویر (ANPK API Center)',
        'version': 'v1',
        'status': 'online',
        'routes': {
            'admin': {
                'description': 'پنل مدیریت ارشد سیستم (دسترسی با JWT Token ادمین)',
                'auth_token': '/api/v1/admin/token/',
                'token_refresh': '/api/v1/admin/token/refresh/',
                'overview': '/api/v1/admin/overview/',
                'analytics': '/api/v1/admin/analytics/',
                'upload': '/api/v1/admin/upload/',
                'articles': '/api/v1/admin/articles/',
                'article_categories': '/api/v1/admin/article-categories/',
                'article_tags': '/api/v1/admin/article-tags/',
                'blog_analytics': '/api/v1/admin/blog-analytics/',
                'scheduled_publish': '/api/v1/admin/scheduled-publish/',
                'clients': '/api/v1/admin/clients/',
                'leads_convert': '/api/v1/admin/leads/convert/',
                'pricing_plans': '/api/v1/admin/finance/plans/',
                'subscriptions': '/api/v1/admin/finance/subscriptions/',
                'invoices': '/api/v1/admin/finance/invoices/',
                'wallets': '/api/v1/admin/wallets/',
                'wallet_transactions': '/api/v1/admin/wallet-transactions/',
                'sla_contracts': '/api/v1/admin/sla-contracts/',
                'projects': '/api/v1/admin/projects/',
                'portfolio_projects': '/api/v1/admin/portfolio-projects/',
                'project_metadata': '/api/v1/admin/project-metadata/',
                'products': '/api/v1/admin/products/',
                'product_categories': '/api/v1/admin/product-categories/',
                'product_features': '/api/v1/admin/product-features/',
                'solutions': '/api/v1/admin/solutions/',
                'tickets': '/api/v1/admin/tickets/',
                'messages': '/api/v1/admin/messages/',
                'users': '/api/v1/admin/users/',
                'nodes': '/api/v1/admin/nodes/',
                'services_config': '/api/v1/admin/services-config/',
                'ai_logs': '/api/v1/admin/ai-logs/',
                'sms_logs': '/api/v1/admin/sms-logs/',
                'otp_logs': '/api/v1/admin/otp-logs/',
                'site_settings': '/api/v1/admin/site-settings/',
            },
            'portal': {
                'description': 'پورتال اختصاصی کارفرمایان و مشتریان (دسترسی با OTP یا JWT)',
                'send_otp': '/api/v1/portal/auth/send-otp/',
                'verify_otp': '/api/v1/portal/auth/verify-otp/',
                'overview': '/api/v1/portal/overview/',
                'wallet': '/api/v1/portal/wallet/',
                'ai_usage': '/api/v1/portal/ai-usage/',
                'invoices': '/api/v1/portal/invoices/',
                'sla_contracts': '/api/v1/portal/sla-contracts/',
                'api_keys': '/api/v1/portal/api-keys/',
                'sms_logs': '/api/v1/portal/sms-logs/',
                'tickets': '/api/v1/portal/client/tickets/',
                'ticket_reply': '/api/v1/portal/client/tickets/reply/',
                'notifications': '/api/v1/portal/client/notifications/',
            },
            'public': {
                'description': 'سرویس‌های عمومی وب‌سایت',
                'core_home': '/api/v1/core/home/',
                'core_overview': '/api/v1/core/home-overview/',
                'catalog_products': '/api/v1/catalog/products/',
                'catalog_solutions': '/api/v1/catalog/solutions/',
                'blog_articles': '/api/v1/blog/',
                'projects_public': '/api/v1/projects/public/',
                'leads_submit': '/api/v1/leads/submit/',
                'contact': '/api/v1/contact/',
                'services_ai_query': '/api/v1/services/ai/query/',
            }
        }
    }

    return Response(payload)

