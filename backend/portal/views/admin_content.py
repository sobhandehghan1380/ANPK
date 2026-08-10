import random
import logging
from django.db import models
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
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
def admin_article_tags(request):
    """
    Admin Article Tags Management API
    GET - list all tags with article count
    POST - create a new tag: {name, slug}
    PUT - update a tag: {id, name, slug}
    DELETE - delete a tag: {id} or ?id=
    """
    from blog.models import ArticleTag, Article
    if request.method == 'POST':
        name = request.data.get('name', '').strip()
        slug = request.data.get('slug', '').strip()
        if not name:
            return Response({'error': 'نام برچسب الزامی است.'}, status=400)
        if not slug:
            slug = name.replace(' ', '-').lower()
        
        tag, created = ArticleTag.objects.get_or_create(
            slug=slug,
            defaults={'name': name}
        )
        if not created:
            return Response({'error': 'برچسب با این نامک قبلاً وجود دارد.'}, status=400)
        
        return Response({'message': f'برچسب "{name}" با موفقیت ایجاد شد.', 'id': tag.id}, status=201)

    elif request.method == 'PUT':
        tag_id = request.data.get('id') or request.data.get('item_id')
        try:
            tag = ArticleTag.objects.get(id=tag_id)
            if 'name' in request.data:
                tag.name = request.data['name'].strip()
            if 'slug' in request.data:
                tag.slug = request.data['slug'].strip()
            tag.save()
            return Response({'message': f'برچسب "{tag.name}" با موفقیت ویرایش شد.'})
        except ArticleTag.DoesNotExist:
            return Response({'error': 'برچسب یافت نشد.'}, status=404)

    elif request.method == 'DELETE':
        tag_id = request.data.get('id') or request.data.get('item_id') or request.query_params.get('id')
        try:
            tag = ArticleTag.objects.get(id=tag_id)
            tag.delete()
            return Response({'message': 'برچسب حذف شد.'})
        except ArticleTag.DoesNotExist:
            return Response({'error': 'برچسب یافت نشد.'}, status=404)

    # GET - list all tags
    tags = ArticleTag.objects.all().order_by('-id')
    data = [{
        'id': t.id,
        'name': t.name,
        'slug': t.slug,
        'articles_count': t.articles.count()
    } for t in tags]
    return Response(data)


@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_scheduled_publish(request):
    """
    Scheduled Publishing API
    GET - list scheduled articles (published_at in future)
    POST - manually trigger publishing of due articles: {action: 'publish_now'}
    """
    from blog.models import Article
    
    if request.method == 'POST':
        action = request.data.get('action')
        if action == 'publish_now':
            now = timezone.now()
            scheduled = Article.objects.filter(
                status='DRAFT',
                published_at__isnull=False,
                published_at__lte=now
            )
            count = 0
            for article in scheduled:
                article.status = 'PUBLISHED'
                article.save()
                count += 1
            return Response({'message': f'{count} مقاله با موفقیت منتشر شد.'})
        return Response({'error': 'عملیات نامعتبر.'}, status=400)
    
    # GET - list scheduled articles
    now = timezone.now()
    scheduled = Article.objects.filter(
        status='DRAFT',
        published_at__isnull=False,
        published_at__gt=now
    ).order_by('published_at')
    
    due = Article.objects.filter(
        status='DRAFT',
        published_at__isnull=False,
        published_at__lte=now
    ).count()
    
    data = [{
        'id': a.id,
        'title': a.title,
        'slug': a.slug,
        'published_at': a.published_at.strftime('%Y-%m-%d %H:%M') if a.published_at else None,
        'created_at': a.created_at.strftime('%Y/%m/%d')
    } for a in scheduled]
    
    return Response({
        'scheduled': data,
        'due_count': due,
        'total_scheduled': len(data)
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_blog_analytics(request):
    """
    Blog Analytics Dashboard API
    Returns comprehensive statistics for the blog section
    """
    from blog.models import Article, ArticleCategory, ArticleTag, ArticleComment
    from django.db.models import Count, Sum, Avg, Q
    from django.utils import timezone
    from datetime import timedelta

    # Article statistics
    total_articles = Article.objects.count()
    published_articles = Article.objects.filter(status='PUBLISHED').count()
    draft_articles = Article.objects.filter(status='DRAFT').count()
    archived_articles = Article.objects.filter(status='ARCHIVED').count()
    featured_articles = Article.objects.filter(is_featured=True).count()
    total_views = Article.objects.aggregate(total=Sum('views_count'))['total'] or 0
    avg_views = Article.objects.aggregate(avg=Avg('views_count'))['avg'] or 0

    # Comments statistics
    total_comments = ArticleComment.objects.count()
    pending_comments = ArticleComment.objects.filter(status='PENDING').count()
    approved_comments = ArticleComment.objects.filter(status='APPROVED').count()
    rejected_comments = ArticleComment.objects.filter(status='REJECTED').count()

    # Categories & Tags
    total_categories = ArticleCategory.objects.count()
    total_tags = ArticleTag.objects.count()

    # Top viewed articles
    top_articles = Article.objects.filter(status='PUBLISHED').order_by('-views_count')[:5]
    top_articles_data = [{
        'id': a.id,
        'title': a.title,
        'slug': a.slug,
        'views_count': a.views_count,
        'category': a.category.name if a.category else 'عمومی'
    } for a in top_articles]

    # Top categories by article count
    top_categories = ArticleCategory.objects.annotate(
        article_count=Count('articles')
    ).order_by('-article_count')[:5]
    top_categories_data = [{
        'id': c.id,
        'name': c.name,
        'slug': c.slug,
        'article_count': c.article_count
    } for c in top_categories]

    # Recent comments
    recent_comments = ArticleComment.objects.select_related('article').order_by('-created_at')[:5]
    recent_comments_data = [{
        'id': c.id,
        'name': c.name,
        'article_title': c.article.title,
        'content': c.content[:100],
        'status': c.status,
        'created_at': c.created_at.strftime('%Y/%m/%d %H:%M')
    } for c in recent_comments]

    # Views trend (last 7 days)
    now = timezone.now()
    views_trend = []
    for i in range(6, -1, -1):
        date = now - timedelta(days=i)
        day_views = Article.objects.filter(
            created_at__date=date.date()
        ).aggregate(total=Sum('views_count'))['total'] or 0
        views_trend.append({
            'date': date.strftime('%Y/%m/%d'),
            'views': day_views
        })

    data = {
        'articles': {
            'total': total_articles,
            'published': published_articles,
            'draft': draft_articles,
            'archived': archived_articles,
            'featured': featured_articles,
            'total_views': total_views,
            'avg_views': round(avg_views, 1)
        },
        'comments': {
            'total': total_comments,
            'pending': pending_comments,
            'approved': approved_comments,
            'rejected': rejected_comments
        },
        'taxonomy': {
            'categories': total_categories,
            'tags': total_tags
        },
        'top_articles': top_articles_data,
        'top_categories': top_categories_data,
        'recent_comments': recent_comments_data,
        'views_trend': views_trend
    }
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
        elif request.data.get('thumbnail'): article.thumbnail = request.data['thumbnail']
        if request.FILES.get('cover_image'): article.cover_image = request.FILES['cover_image']
        elif request.data.get('cover_image'): article.cover_image = request.data['cover_image']
        if request.FILES.get('og_image'): article.og_image = request.FILES['og_image']
        elif request.data.get('og_image'): article.og_image = request.data['og_image']
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
            elif 'thumbnail' in request.data: a.thumbnail = request.data['thumbnail'] or None
            if 'cover_image' in request.FILES: a.cover_image = request.FILES['cover_image']
            elif 'cover_image' in request.data: a.cover_image = request.data['cover_image'] or None
            if 'og_image' in request.FILES: a.og_image = request.FILES['og_image']
            elif 'og_image' in request.data: a.og_image = request.data['og_image'] or None
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

