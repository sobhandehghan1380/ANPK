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
def admin_article_categories(request):
    """
    Admin Article Categories API
    """
    from blog.models import ArticleCategory
    if request.method == 'POST':
        name = request.data.get('name')
        slug = request.data.get('slug')
        desc = request.data.get('description', '')

        cat = ArticleCategory.objects.create(name=name, slug=slug, description=desc)
        return Response({'message': f'دسته‌بندی "{name}" با موفقیت ایجاد شد.', 'id': cat.id})

    elif request.method == 'PUT':
        cat_id = request.data.get('id') or request.data.get('item_id')
        try:
            cat = ArticleCategory.objects.get(id=cat_id)
            if 'name' in request.data:
                cat.name = request.data['name']
            if 'slug' in request.data:
                cat.slug = request.data['slug']
            if 'description' in request.data:
                cat.description = request.data['description']
            cat.save()
            return Response({'message': f'دسته‌بندی "{cat.name}" با موفقیت ویرایش شد.'})
        except ArticleCategory.DoesNotExist:
            return Response({'error': 'دسته‌بندی یافت نشد.'}, status=404)

    elif request.method == 'DELETE':
        cat_id = request.data.get('id') or request.data.get('item_id') or request.query_params.get('id')
        try:
            cat = ArticleCategory.objects.get(id=cat_id)
            cat.delete()
            return Response({'message': 'دسته‌بندی حذف شد.'})
        except ArticleCategory.DoesNotExist:
            return Response({'error': 'دسته‌بندی یافت نشد.'}, status=404)

    categories = ArticleCategory.objects.all()
    data = [{
        'id': c.id,
        'name': c.name,
        'slug': c.slug,
        'description': c.description,
        'articles_count': c.articles.count()
    } for c in categories]
    return Response(data)

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_articles(request):
    """
    Admin Articles & Blog Management API
    """
    from blog.models import Article, ArticleCategory, ArticleTag
    
    def handle_tags(article, tags_str):
        if not tags_str: return
        # Handle comma-separated tags
        tag_names = [t.strip() for t in tags_str.split(',') if t.strip()]
        tag_objs = []
        for name in tag_names:
            tag, _ = ArticleTag.objects.get_or_create(name=name, defaults={'slug': name.replace(' ', '-')})
            tag_objs.append(tag)
        article.tags.set(tag_objs)
        
    if request.method == 'POST':
        title = request.data.get('title')
        slug = request.data.get('slug', 'new-article')
        category_id = request.data.get('category_id')
        author = request.data.get('author', 'دپارتمان مهندسی ANPK')
        summary = request.data.get('summary', '')
        content = request.data.get('content', '')
        tags_str = request.data.get('tags', '')
        read_time = request.data.get('read_time', '۵ دقیقه')
        status_val = request.data.get('status', 'PUBLISHED')
        is_featured = request.data.get('is_featured', 'false').lower() == 'true'
        language = request.data.get('language', 'fa')
        allow_comments = request.data.get('allow_comments', 'true').lower() == 'true'
        table_of_contents = request.data.get('table_of_contents', 'true').lower() == 'true'
        meta_title = request.data.get('meta_title', '')
        meta_description = request.data.get('meta_description', '')
        canonical_url = request.data.get('canonical_url', '')
        og_title = request.data.get('og_title', '')
        og_description = request.data.get('og_description', '')
        schema_type = request.data.get('schema_type', 'Article')
        published_at = request.data.get('published_at') or None

        category = ArticleCategory.objects.filter(id=category_id).first() if category_id else None
        article = Article.objects.create(
            title=title, slug=slug, category=category, author=author,
            summary=summary, content=content, read_time=read_time,
            status=status_val, is_featured=is_featured,
            language=language, allow_comments=allow_comments,
            table_of_contents=table_of_contents,
            meta_title=meta_title or None, meta_description=meta_description or None,
            canonical_url=canonical_url or None,
            og_title=og_title or None, og_description=og_description or None,
            schema_type=schema_type,
            published_at=published_at,
        )
        if request.FILES.get('thumbnail'): article.thumbnail = request.FILES['thumbnail']
        if request.FILES.get('cover_image'): article.cover_image = request.FILES['cover_image']
        if request.FILES.get('og_image'): article.og_image = request.FILES['og_image']
        article.save()
        handle_tags(article, tags_str)
        return Response({'message': f'مقاله "{title}" ایجاد گردید.', 'id': article.id})

    elif request.method == 'PUT':
        item_id = request.data.get('id')
        try:
            a = Article.objects.get(id=item_id)
            fields = ['title','slug','author','summary','content','read_time','status',
                      'language','schema_type','meta_title','meta_description',
                      'canonical_url','og_title','og_description']
            for f in fields:
                if f in request.data: setattr(a, f, request.data[f] or None if f not in ['title','slug','author','summary','content','read_time','status','language','schema_type'] else request.data[f])
            if 'category_id' in request.data:
                cat_id = request.data['category_id']
                a.category = ArticleCategory.objects.filter(id=cat_id).first() if cat_id else None
            if 'is_featured' in request.data:
                val = request.data['is_featured']
                a.is_featured = val == 'true' or val is True
            if 'allow_comments' in request.data:
                val = request.data['allow_comments']
                a.allow_comments = val == 'true' or val is True
            if 'table_of_contents' in request.data:
                val = request.data['table_of_contents']
                a.table_of_contents = val == 'true' or val is True
            if 'published_at' in request.data and request.data['published_at']:
                a.published_at = request.data['published_at']
            if 'thumbnail' in request.FILES: a.thumbnail = request.FILES['thumbnail']
            if 'cover_image' in request.FILES: a.cover_image = request.FILES['cover_image']
            if 'og_image' in request.FILES: a.og_image = request.FILES['og_image']
            a.save()
            if 'tags' in request.data: handle_tags(a, request.data['tags'])
            return Response({'message': 'مقاله با موفقیت ویرایش شد.'})
        except Article.DoesNotExist:
            return Response({'error': 'مقاله یافت نشد.'}, status=404)

    elif request.method == 'DELETE':
        item_id = request.data.get('id') or request.query_params.get('id')
        try:
            Article.objects.get(id=item_id).delete()
            return Response({'message': 'مقاله حذف شد.'})
        except Article.DoesNotExist:
            return Response({'error': 'مقاله یافت نشد.'}, status=404)

    articles = Article.objects.select_related('category').prefetch_related('tags').all()

    search_query = request.query_params.get('search')
    if search_query:
        articles = articles.filter(
            models.Q(title__icontains=search_query) | models.Q(summary__icontains=search_query)
        )

    status_filter = request.query_params.get('status')
    if status_filter:
        articles = articles.filter(status=status_filter)

    category_filter = request.query_params.get('category')
    if category_filter:
        articles = articles.filter(category_id=category_filter)

    featured_filter = request.query_params.get('featured')
    if featured_filter and featured_filter.lower() == 'true':
        articles = articles.filter(is_featured=True)

    articles = articles.order_by('-created_at')
    data = [{
        'id': a.id, 'title': a.title, 'slug': a.slug,
        'category_id': a.category.id if a.category else None,
        'category_name': a.category.name if a.category else 'عمومی',
        'author': a.author, 'summary': a.summary, 'content': a.content,
        'tags': [t.name for t in a.tags.all()], 'read_time': a.read_time,
        'thumbnail': a.thumbnail.url if a.thumbnail else None,
        'cover_image': a.cover_image.url if a.cover_image else None,
        'og_image': a.og_image.url if a.og_image else None,
        'views_count': a.views_count, 'status': a.status, 'is_featured': a.is_featured,
        'language': a.language, 'schema_type': a.schema_type,
        'allow_comments': a.allow_comments, 'table_of_contents': a.table_of_contents,
        'meta_title': a.meta_title, 'meta_description': a.meta_description,
        'canonical_url': a.canonical_url,
        'og_title': a.og_title, 'og_description': a.og_description,
        'published_at': a.published_at.strftime('%Y-%m-%dT%H:%M') if a.published_at else None,
        'created_at': a.created_at.strftime('%Y/%m/%d')
    } for a in articles]
    return Response(data)

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_messages(request):
    '''
    Admin API for managing Contact Messages.
    '''
    from contact.models import ContactMessage
    if request.method == 'POST':
        action = request.data.get('action')
        msg_id = request.data.get('id')
        if action == 'mark_read' and msg_id:
            try:
                msg = ContactMessage.objects.get(id=msg_id)
                msg.is_read = True
                msg.save()
                return Response({'message': 'پیام به عنوان خوانده شده علامت‌گذاری شد'})
            except ContactMessage.DoesNotExist:
                return Response({'error': 'Message not found'}, status=404)
    elif request.method == 'DELETE':
        msg_id = request.data.get('id')
        if msg_id:
            try:
                ContactMessage.objects.get(id=msg_id).delete()
                return Response({'message': 'پیام حذف شد'})
            except ContactMessage.DoesNotExist:
                return Response({'error': 'Message not found'}, status=404)
                
    messages = ContactMessage.objects.all().order_by('-created_at')
    data = [{
        'id': m.id,
        'name': m.name,
        'email': m.email,
        'phone': m.phone,
        'subject': m.subject,
        'message': m.message,
        'is_read': m.is_read,
        'created_at': m.created_at.strftime('%Y-%m-%d %H:%M')
    } for m in messages]
    return Response(data)

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_site_settings(request):
    '''
    Admin API for managing CompanyInfo, HeroSection, and HeroTypewriterItem.
    '''
    from core.models import CompanyInfo, HeroSection, HeroTypewriterItem
    
    if request.method == 'POST':
        action = request.data.get('action')
        if action == 'update_company':
            company, _ = CompanyInfo.objects.get_or_create(id=1)
            company.name = request.data.get('name', company.name)
            company.tagline = request.data.get('tagline', company.tagline)
            company.phone = request.data.get('phone', company.phone)
            company.email = request.data.get('email', company.email)
            company.address = request.data.get('address', company.address)
            company.save()
            return Response({'message': 'اطلاعات شرکت بروزرسانی شد'})
            
        elif action == 'update_hero':
            hero, _ = HeroSection.objects.get_or_create(id=1)
            hero.badge_text = request.data.get('badge_text', hero.badge_text)
            hero.main_title_static = request.data.get('main_title_static', hero.main_title_static)
            hero.sub_description = request.data.get('sub_description', hero.sub_description)
            hero.primary_button_text = request.data.get('primary_button_text', hero.primary_button_text)
            hero.secondary_button_text = request.data.get('secondary_button_text', hero.secondary_button_text)
            hero.is_active = request.data.get('is_active', hero.is_active)
            hero.save()
            return Response({'message': 'تنظیمات هیرو بروزرسانی شد'})
            
        elif action == 'add_typewriter':
            hero, _ = HeroSection.objects.get_or_create(id=1)
            text = request.data.get('text')
            if text:
                HeroTypewriterItem.objects.create(
                    hero=hero,
                    text=text,
                    color_class=request.data.get('color_class', 'gradient-text-primary'),
                    order=int(request.data.get('order', 0))
                )
                return Response({'message': 'عبارت متحرک اضافه شد'})
                
        elif action == 'delete_typewriter':
            item_id = request.data.get('id')
            try:
                HeroTypewriterItem.objects.get(id=item_id).delete()
                return Response({'message': 'عبارت متحرک حذف شد'})
            except HeroTypewriterItem.DoesNotExist:
                return Response({'error': 'Not found'}, status=404)
    
    # GET Method
    company = CompanyInfo.objects.first()
    hero = HeroSection.objects.first()
    typewriters = HeroTypewriterItem.objects.all().order_by('order') if hero else []
    
    data = {
        'company': {
            'name': company.name if company else '',
            'tagline': company.tagline if company else '',
            'phone': company.phone if company else '',
            'email': company.email if company else '',
            'address': company.address if company else '',
        },
        'hero': {
            'badge_text': hero.badge_text if hero else '',
            'main_title_static': hero.main_title_static if hero else '',
            'sub_description': hero.sub_description if hero else '',
            'primary_button_text': hero.primary_button_text if hero else '',
            'secondary_button_text': hero.secondary_button_text if hero else '',
            'is_active': hero.is_active if hero else True,
        },
        'typewriters': [
            {'id': t.id, 'text': t.text, 'color_class': t.color_class, 'order': t.order}
            for t in typewriters
        ]
    }
    return Response(data)

