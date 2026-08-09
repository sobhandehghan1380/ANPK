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
def admin_products(request):
    """
    Admin Catalog Products Management API
    """
    from catalog.models import Product
    if request.method == 'POST':
        name = request.data.get('name')
        slug = request.data.get('slug')
        short_desc = request.data.get('short_description', 'توضیحات کوتاه محصول...')
        demo_url = request.data.get('demo_url', 'https://anpk.ir')

        product = Product.objects.create(
            name=name,
            slug=slug,
            short_description=short_desc,
            demo_url=demo_url,
            status='ACTIVE'
        )
        return Response({'message': f'محصول "{name}" به کاتالوگ افزوده شد.', 'id': product.id})

    products = Product.objects.all().order_by('order')
    data = [{
        'id': p.id,
        'name': p.name,
        'slug': p.slug,
        'short_description': p.short_description,
        'status': p.status,
        'demo_url': p.demo_url
    } for p in products]
    return Response(data)

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_product_categories(request):
    """
    Admin Product Categories API (مثل ProductCategoryAdmin در جنگو)
    """
    from catalog.models import ProductCategory
    if request.method == 'POST':
        name = request.data.get('name')
        slug = request.data.get('slug', name.replace(' ', '-').lower() if name else 'cat')
        icon_name = request.data.get('icon_name', 'cpu')
        cat, _ = ProductCategory.objects.get_or_create(slug=slug, defaults={'name': name, 'icon_name': icon_name})
        return Response({'message': f'دسته‌بندی محصول "{name}" ثبت شد.', 'id': cat.id})

    cats = ProductCategory.objects.all().order_by('order', 'id')
    data = [{
        'id': c.id,
        'name': c.name,
        'slug': c.slug,
        'icon_name': c.icon_name,
        'order': c.order,
        'products_count': c.products.count()
    } for c in cats]
    return Response(data)

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_product_features(request):
    """
    Admin Product Features (inline) API (مثل ProductFeatureInline در جنگو)
    """
    from catalog.models import Product, ProductFeature
    if request.method == 'POST':
        product_id = request.data.get('product_id')
        title = request.data.get('title')
        description = request.data.get('description', '')
        try:
            product = Product.objects.get(id=product_id)
            feature = ProductFeature.objects.create(product=product, title=title, description=description)
            return Response({'message': f'ویژگی "{title}" به محصول "{product.name}" اضافه شد.', 'id': feature.id})
        except Product.DoesNotExist:
            return Response({'error': 'محصول یافت نشد.'}, status=400)

    product_id = request.GET.get('product_id')
    qs = ProductFeature.objects.select_related('product').all()
    if product_id:
        qs = qs.filter(product__id=product_id)
    data = [{
        'id': f.id,
        'product_id': f.product.id,
        'product_name': f.product.name,
        'title': f.title,
        'description': f.description
    } for f in qs]
    return Response(data)

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_solutions(request):
    """
    Admin Solutions API (مثل SolutionAdmin در جنگو - با SolutionBenefit inline)
    """
    from catalog.models import Solution, SolutionBenefit
    if request.method == 'POST':
        title = request.data.get('title')
        subtitle = request.data.get('subtitle', '')
        description = request.data.get('description', '')
        slug = request.data.get('slug', title.replace(' ', '-').lower() if title else 'solution')
        is_featured = request.data.get('is_featured', False)
        benefits = request.data.get('benefits', [])

        solution = Solution.objects.create(
            title=title, subtitle=subtitle, description=description,
            slug=slug, is_featured=bool(is_featured)
        )
        for b in benefits:
            SolutionBenefit.objects.create(solution=solution, title=b)

        return Response({'message': f'راه‌حل "{title}" با {len(benefits)} مزیت ثبت شد.', 'id': solution.id})

    solutions = Solution.objects.prefetch_related('benefits').all().order_by('order', 'id')
    data = [{
        'id': s.id,
        'title': s.title,
        'subtitle': s.subtitle,
        'description': s.description,
        'slug': s.slug,
        'is_featured': s.is_featured,
        'order': s.order,
        'benefits': [b.title for b in s.benefits.all()]
    } for s in solutions]
    return Response(data)

