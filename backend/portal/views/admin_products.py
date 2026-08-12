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

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_products(request):
    """
    Admin Catalog Products Management API
    GET - list all products
    POST - create new product
    PUT - update product
    DELETE - delete product
    """
    from catalog.models import Product, ProductCategory
    if request.method == 'POST':
        name = request.data.get('name')
        slug = request.data.get('slug')
        category_id = request.data.get('category_id')
        short_desc = request.data.get('short_description', '')
        full_desc = request.data.get('full_description', '')
        demo_url = request.data.get('demo_url', '')
        image_url = request.data.get('image_url', '')
        features_list = request.data.get('features_list', '')
        technical_specs = request.data.get('technical_specs', '')
        status_val = request.data.get('status', 'دمو فعال / آماده استقرار')
        is_featured = request.data.get('is_featured', True)
        order = request.data.get('order', 0)

        category = ProductCategory.objects.filter(id=category_id).first() if category_id else None
        
        product = Product.objects.create(
            name=name, slug=slug, category=category,
            short_description=short_desc, full_description=full_desc,
            demo_url=demo_url, image_url=image_url,
            features_list=features_list, technical_specs=technical_specs,
            status=status_val, is_featured=is_featured, order=order
        )
        return Response({'message': f'محصول "{name}" به کاتالوگ افزوده شد.', 'id': product.id})

    elif request.method == 'PUT':
        product_id = request.data.get('id')
        try:
            product = Product.objects.get(id=product_id)
            fields = ['name', 'slug', 'short_description', 'full_description', 
                      'demo_url', 'image_url', 'features_list', 'technical_specs',
                      'status', 'order']
            for f in fields:
                if f in request.data:
                    setattr(product, f, request.data[f])
            
            if 'category_id' in request.data:
                cat_id = request.data['category_id']
                product.category = ProductCategory.objects.filter(id=cat_id).first() if cat_id else None
            
            if 'is_featured' in request.data:
                val = request.data['is_featured']
                product.is_featured = val == 'true' or val is True
            
            product.save()
            return Response({'message': 'محصول با موفقیت بروزرسانی شد.'})
        except Product.DoesNotExist:
            return Response({'error': 'محصول یافت نشد.'}, status=404)

    elif request.method == 'DELETE':
        product_id = request.data.get('id') or request.query_params.get('id')
        try:
            Product.objects.get(id=product_id).delete()
            return Response({'message': 'محصول حذف شد.'})
        except Product.DoesNotExist:
            return Response({'error': 'محصول یافت نشد.'}, status=404)

    products = Product.objects.select_related('category').all().order_by('order')
    data = [{
        'id': p.id,
        'name': p.name,
        'slug': p.slug,
        'short_description': p.short_description,
        'full_description': p.full_description,
        'status': p.status,
        'demo_url': p.demo_url,
        'image_url': p.image_url,
        'features_list': p.features_list,
        'technical_specs': p.technical_specs,
        'is_featured': p.is_featured,
        'order': p.order,
        'category_id': p.category.id if p.category else None,
        'category_name': p.category.name if p.category else None,
    } for p in products]
    return Response(data)

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_product_categories(request):
    """
    Admin Product Categories API
    """
    from catalog.models import ProductCategory
    if request.method == 'POST':
        name = request.data.get('name')
        slug = request.data.get('slug', name.replace(' ', '-').lower() if name else 'cat')
        icon_name = request.data.get('icon_name', 'Layers')
        description = request.data.get('description', '')
        order = request.data.get('order', 0)
        
        cat, created = ProductCategory.objects.get_or_create(
            slug=slug, 
            defaults={'name': name, 'icon_name': icon_name, 'description': description, 'order': order}
        )
        if not created:
            return Response({'error': 'دسته‌بندی با این نامک قبلاً وجود دارد.'}, status=400)
        return Response({'message': f'دسته‌بندی محصول "{name}" ثبت شد.', 'id': cat.id})

    elif request.method == 'PUT':
        cat_id = request.data.get('id') or request.data.get('item_id')
        try:
            cat = ProductCategory.objects.get(id=cat_id)
            fields = ['name', 'slug', 'icon_name', 'description', 'order']
            for f in fields:
                if f in request.data:
                    setattr(cat, f, request.data[f])
            cat.save()
            return Response({'message': f'دسته‌بندی "{cat.name}" بروزرسانی شد.'})
        except ProductCategory.DoesNotExist:
            return Response({'error': 'دسته‌بندی یافت نشد.'}, status=404)

    elif request.method == 'DELETE':
        cat_id = request.data.get('id') or request.data.get('item_id') or request.query_params.get('id')
        try:
            ProductCategory.objects.get(id=cat_id).delete()
            return Response({'message': 'دسته‌بندی حذف شد.'})
        except ProductCategory.DoesNotExist:
            return Response({'error': 'دسته‌بندی یافت نشد.'}, status=404)

    cats = ProductCategory.objects.all().order_by('order', 'id')
    data = [{
        'id': c.id,
        'name': c.name,
        'slug': c.slug,
        'icon_name': c.icon_name,
        'description': c.description,
        'order': c.order,
        'products_count': c.products.count()
    } for c in cats]
    return Response(data)

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_product_features(request):
    """
    Admin Product Features API
    """
    from catalog.models import Product, ProductFeature
    if request.method == 'POST':
        product_id = request.data.get('product_id')
        title = request.data.get('title')
        description = request.data.get('description', '')
        icon_name = request.data.get('icon_name', 'CheckCircle2')
        try:
            product = Product.objects.get(id=product_id)
            feature = ProductFeature.objects.create(
                product=product, title=title, 
                description=description, icon_name=icon_name
            )
            return Response({'message': f'ویژگی "{title}" به محصول "{product.name}" اضافه شد.', 'id': feature.id})
        except Product.DoesNotExist:
            return Response({'error': 'محصول یافت نشد.'}, status=400)

    elif request.method == 'PUT':
        feature_id = request.data.get('id') or request.data.get('item_id')
        try:
            feature = ProductFeature.objects.get(id=feature_id)
            fields = ['title', 'description', 'icon_name']
            for f in fields:
                if f in request.data:
                    setattr(feature, f, request.data[f])
            if 'product_id' in request.data:
                product = Product.objects.filter(id=request.data['product_id']).first()
                if product:
                    feature.product = product
            feature.save()
            return Response({'message': 'ویژگی بروزرسانی شد.'})
        except ProductFeature.DoesNotExist:
            return Response({'error': 'ویژگی یافت نشد.'}, status=404)

    elif request.method == 'DELETE':
        feature_id = request.data.get('id') or request.data.get('item_id') or request.query_params.get('id')
        try:
            ProductFeature.objects.get(id=feature_id).delete()
            return Response({'message': 'ویژگی حذف شد.'})
        except ProductFeature.DoesNotExist:
            return Response({'error': 'ویژگی یافت نشد.'}, status=404)

    product_id = request.GET.get('product_id')
    qs = ProductFeature.objects.select_related('product').all()
    if product_id:
        qs = qs.filter(product__id=product_id)
    data = [{
        'id': f.id,
        'product_id': f.product.id,
        'product_name': f.product.name,
        'title': f.title,
        'description': f.description,
        'icon_name': f.icon_name
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

