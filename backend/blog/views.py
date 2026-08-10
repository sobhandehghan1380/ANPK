from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from .models import ArticleCategory, Article, ArticleComment, ArticleTag
from django.utils import timezone
import json

RICH_CMMS_ARTICLE_CONTENT = """
## مقدمه و اهمیت مانیتورینگ نگهداشت تأسیسات بیمارستانی

در بیمارستان‌ها و مراکز درمانی پیشرفته، تجهیزات تأسیساتی مانند **چیلرهای تراکمی و جذبی**، **دیگ‌های بخار موتورخانه**، **ژنراتورهای برق اضطراری** و **دستگاه‌های اکسیژن‌ساز** نقش مستقیم در حفظ حیات بیماران ایفا می‌کنند. توقف ناگهانی هر یک از این سامانه‌ها نه‌تنها خسارات مالی هنگفتی به بار می‌آورد، بلکه سلامت بیماران بستری در بخش‌های مراقبت‌های ویژه (ICU و CCU) را به مخاطره می‌اندازد.

سامانه **CMMS (Computerized Maintenance Management System) تأسیسات نگار** توسعه‌یافته توسط شرکت ارشیا نگین پردازش کویر (ANPK)، با بهره‌گیری از پروتکل‌های مانیتورینگ آنلاین و هوش مصنوعی، فرایند نگهداشت پیشگیرانه (Preventive Maintenance) را کاملاً اتوماتیک ساخته است.

---

## چالش‌های کلیدی در سیستم‌های سنتی نگهداشت بیمارستانی

۱. **ثبت دستی و کاغذی چک‌لیست‌ها**: چک‌لیست‌های فیزیکی تکنسین‌ها معمولاً با تاخیر یا به صورت ناقص وارد سامانه‌های اداری می‌شوند.
۲. **عدم آگاهی آنی از نوسانات حرارتی و فشار**: تا پیش از بروز اختلال جدی یا قطعی کامل تجهیزات، خرابی‌های جزئی قابل تشخیص نیستند.
۳. **عدم شفافیت در مدیریت انبار قطعات یدکی**: نبود لینک مستقیم میان دستور کارهای PM و انبار قطعات باعث توقف‌های طولانی‌مدت به دلیل فقدان قطعه می‌گردد.
۴. **غفلت از تاریخ‌های کالیبراسیون تجهیزات پزشکی**: دستگاه‌های حساس مانند ونتیلاتورها نیازمند پایش دقیق دوره‌های کالیبراسیون هستند.

---

## معماری سامانه CMMS تأسیسات نگار و ماژول‌های پایش آنلاین

پلتفرم CMMS طراحی‌شده شامل سه لایه اصلی است:

### ۱. لایه جمع‌آوری داده‌ها و سنسورهای IoT
سنسورهای صنعتی نصب‌شده بر روی تجهیزات، داده‌های مربوط به دمای روغن، فشار بخار، ارتعاشات بدنه ژنراتور و ولتاژ فازها را بر برپایه پروتکل‌های استاندارد **Modbus RTU/TCP** به نودهای پردازشی انتقال می‌دهند.

### ۲. موتور پردازش هوشمند و ثبت دستور کار (Work Order)
به محض فراتر رفتن شاخص‌های عملکردی از آستانه‌های مجاز:
- دستور کار اضطراری با شناسه یکتا صادر می‌گردد.
- پیامک هشدار آنی SMS به مسئول تاسیسات و تکنسین آنکال ارسال می‌شود.
- قطعات یدکی مورد نیاز در سیستم انبارداری رزرو می‌شوند.

### ۳. پورتال مدیریت کارفرما و گزارش‌گیری BI
مدیران ارشد بیمارستان با ورود به پورتال سازمانی می‌توانند شاخص‌های کلیدی زیر را به صورت زنده مشاهده نمایند:
- **MTTR (Mean Time to Repair)**: میانگین زمان رفع خرابی
- **MTBF (Mean Time Between Failures)**: میانگین زمان بین دو خرابی
- **درصد تحقق برنامه‌های PM سالانه**

---

## جدول مقایسه‌ای: نگهداشت سنتی در برابر سامانه CMMS هوشمند ANPK

| شاخص ارزیابی | روش سنتی کاغذی | سامانه هوشمند CMMS تأسیسات نگار |
| :--- | :--- | :--- |
| **زمان آگاهی از بروز خطای تاسیسات** | ۳۰ الی ۱۲۰ دقیقه پس از قطعی | **کمتر از ۵ ثانیه (هشدار آنی SMS)** |
| **هزینه‌های تعویض قطعات اضطراری** | بسیار بالا به دلیل خرابی ثانویه | **کاهش ۴۰ درصدی هزینه‌ها** |
| **دقت ثبت تاریخچه کالیبراسیون** | دارای خطای انسانی و فراموشی | **۱۰۰٪ هوشمند با یادآوری خودکار** |
| **شفافیت گزارش عملکرد تکنسین‌ها** | غیرقابل ارزیابی دقیق | **گزارش‌گیری زنده و نمودارهای BI** |

---

## نتیجه‌گیری و دستاوردهای پیاده‌سازی

استقرار سامانه **CMMS تأسیسات نگار** در دانشگاه‌های علوم پزشکی و بیمارستان‌های بزرگ کشور نشان داده است که با دیجیتال‌سازی چک‌لیست‌ها و مانیتورینگ آنی، می‌توان پایداری شبکه تاسیسات را به **۹۹.۹٪** رساند و هزینه‌های تعمیرات سنگین را تا **۴۰٪** کاهش داد.

جهت دریافت مشاوره فنی و مشاهده دموی زنده سامانه CMMS، با کارشناسان ارشد شرکت **ارشیا نگین پردازش کویر (ANPK)** تماس حاصل فرمایید.
"""

RICH_HL7_ARTICLE_CONTENT = """
## ضرورت یکپارچه‌سازی سامانه‌های سلامت با استاندارد HL7 FHIR

در عصر سلامت دیجیتال، اطلاعات بالینی بیماران در سامانه‌های مختلفی نظیر HIS بیمارستانی، LIS آزمایشگاهی، RIS تصویربرداری و سامانه‌های نوبت‌دهی توزیع شده‌اند. عدم وجود زبان مشترک برای تبادل این داده‌ها، چالش بزرگ انزوا و جزیره‌ای شدن اطلاعات را ایجاد می‌کند.

پروتکل **HL7 FHIR (Fast Healthcare Interoperability Resources)** استاندارد بین‌المللی نسل جدید است که با بهره‌گیری از مفاهیم مدرن وب مانند RESTful API، JSON و OAuth2، تبادل امن و زیرثانیه‌ای پرونده الکترونیک سلامت (EHR) را میسر می‌سازد.

---

## معماری میکروسرویس‌های سلامت دیجیتال ANPK

در پلتفرم‌های توسعه‌یافته توسط ارشیا نگین پردازش کویر (ANPK):
- داده‌های بالینی بیمار در قالب منابع استاندارد FHIR (مانند `Patient`, `Observation`, `Encounter`, `Condition`) مدل‌سازی می‌شوند.
- موتور پردازش هوشمند OCR و هوش مصنوعی اسناد پزشکی، اطلاعات دفترچه‌ها و نسخه‌ها را تبدیل به JSON استاندارد FHIR می‌نماید.
- امنیت داده‌ها با مانیتورینگ آنی، رمزنگاری End-to-End و لایه‌های احراز هویت کنترل می‌گردد.
"""

@api_view(['GET'])
@permission_classes([AllowAny])
def articles_list(request):
    articles = Article.objects.filter(status='PUBLISHED').order_by('-created_at')
    if not articles.exists():
        cat_health, _ = ArticleCategory.objects.get_or_create(name='سلامت دیجیتال & FHIR', slug='digital-health')
        cat_cmms, _ = ArticleCategory.objects.get_or_create(name='نگهداشت تأسیسات & CMMS', slug='cmms')

        a1 = Article.objects.create(
            title='معماری پلتفرم‌های سلامت دیجیتال و استاندارد HL7 FHIR',
            slug='hl7-fhir-architecture',
            category=cat_health,
            author='تیم مهندسی ANPK',
            summary='بررسی نحوه تبادل امن داده‌های بالینی و پرونده الکترونیک سلامت بیمارستانی بر اساس آخرین پروتکل‌های HL7 FHIR با پایداری ۹۹.۹٪.',
            content=RICH_HL7_ARTICLE_CONTENT,
            read_time='۶ دقیقه',
            status='PUBLISHED',
            views_count=520
        )
        t1, _ = ArticleTag.objects.get_or_create(name='HL7 FHIR', slug='hl7-fhir')
        t2, _ = ArticleTag.objects.get_or_create(name='سلامت دیجیتال', slug='digital-health-tag')
        a1.tags.set([t1, t2])

        a2 = Article.objects.create(
            title='بهینه‌سازی و مانیتورینگ آنی تاسیسات بیمارستانی با CMMS',
            slug='cmms-facility-monitoring',
            category=cat_cmms,
            author='دپارتمان مهندسی ANPK',
            summary='تحلیل راهکارهای نگهداشت پیشگیرانه (PM) و مانیتورینگ آنلاین چیلرها و موتورخانه بیمارستان با سنسورهای IoT.',
            content=RICH_CMMS_ARTICLE_CONTENT,
            read_time='۵ دقیقه',
            status='PUBLISHED',
            views_count=410
        )
        t3, _ = ArticleTag.objects.get_or_create(name='CMMS', slug='cmms-tag')
        t4, _ = ArticleTag.objects.get_or_create(name='مانیتورینگ IoT', slug='iot-monitoring')
        a2.tags.set([t3, t4])

        articles = Article.objects.filter(status='PUBLISHED').order_by('-created_at')

    data = [{
        'id': a.id,
        'title': a.title,
        'slug': a.slug,
        'category': a.category.name if a.category else 'عمومی',
        'category_slug': a.category.slug if a.category else 'general',
        'author': a.author,
        'summary': a.summary,
        'content': a.content,
        'read_time': a.read_time,
        'tags': [tag.name for tag in a.tags.all()],
        'thumbnail': a.thumbnail.url if a.thumbnail else None,
        'cover_image': a.cover_image.url if a.cover_image else None,
        'image_url': a.cover_image.url if a.cover_image else (a.thumbnail.url if a.thumbnail else None),
        'views_count': a.views_count,
        'date': a.created_at.strftime('%Y/%m/%d')
    } for a in articles]
    return Response(data)


@api_view(['GET'])
@permission_classes([AllowAny])
def article_detail(request, slug):
    try:
        a = Article.objects.get(slug=slug, status='PUBLISHED')
        
        # Increment views count dynamically
        a.views_count += 1
        a.save()

        # Update sample content if it was the legacy stub
        if len(a.content) < 200:
            if a.slug == 'cmms-facility-monitoring':
                a.content = RICH_CMMS_ARTICLE_CONTENT
            elif a.slug == 'hl7-fhir-architecture':
                a.content = RICH_HL7_ARTICLE_CONTENT
            a.save()

        data = {
            'id': a.id,
            'title': a.title,
            'slug': a.slug,
            'category': a.category.name if a.category else 'عمومی',
            'category_slug': a.category.slug if a.category else 'general',
            'author': a.author,
            'summary': a.summary,
            'content': a.content,
            'read_time': a.read_time,
            'tags': [tag.name for tag in a.tags.all()],
            'thumbnail': a.thumbnail.url if a.thumbnail else None,
            'cover_image': a.cover_image.url if a.cover_image else None,
            'image_url': a.cover_image.url if a.cover_image else (a.thumbnail.url if a.thumbnail else None),
            'views_count': a.views_count,
            'date': a.created_at.strftime('%Y/%m/%d')
        }
        return Response(data)
    except Article.DoesNotExist:
        return Response({'error': 'مقاله مورد نظر یافت نشد.'}, status=404)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def article_comments(request, slug):
    """
    GET /api/v1/blog/articles/<slug>/comments/ - list approved comments
    POST /api/v1/blog/articles/<slug>/comments/ - submit a new comment
    """
    try:
        article = Article.objects.get(slug=slug)
    except Article.DoesNotExist:
        return Response({'error': 'مقاله یافت نشد.'}, status=404)

    if request.method == 'GET':
        comments = ArticleComment.objects.filter(
            article=article, status='APPROVED', parent=None
        ).prefetch_related('replies').order_by('created_at')
        data = []
        for c in comments:
            replies = [{
                'id': r.id, 'name': r.name, 'content': r.content,
                'created_at': r.created_at.strftime('%Y/%m/%d')
            } for r in c.replies.filter(status='APPROVED')]
            data.append({
                'id': c.id, 'name': c.name, 'content': c.content,
                'created_at': c.created_at.strftime('%Y/%m/%d'),
                'replies': replies
            })
        return Response({'comments': data, 'count': len(data)})

    # POST
    if not article.allow_comments:
        return Response({'error': 'نظردهی برای این مقاله غیرفعال است.'}, status=403)

    name = request.data.get('name', '').strip()
    email = request.data.get('email', '').strip()
    content = request.data.get('content', '').strip()
    parent_id = request.data.get('parent_id')

    if not name or not email or not content:
        return Response({'error': 'نام، ایمیل و متن نظر الزامی است.'}, status=400)
    if len(content) < 10:
        return Response({'error': 'نظر باید حداقل ۱۰ کاراکتر باشد.'}, status=400)
    if len(content) > 2000:
        return Response({'error': 'نظر نباید بیشتر از ۲۰۰۰ کاراکتر باشد.'}, status=400)

    parent = None
    if parent_id:
        try:
            parent = ArticleComment.objects.get(id=parent_id, article=article)
        except ArticleComment.DoesNotExist:
            pass

    ip = request.META.get('REMOTE_ADDR')
    comment = ArticleComment.objects.create(
        article=article, name=name, email=email,
        content=content, parent=parent, ip_address=ip
    )
    return Response({'message': 'نظر شما دریافت شد و پس از تأیید نمایش داده میشود.', 'id': comment.id}, status=201)


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_comments(request):
    """
    Admin API for managing all comments
    GET - list all comments with filter ?status=PENDING|APPROVED|REJECTED
    POST - reply to a comment: {ticket_id: id, message: text}
    PUT - approve/reject a comment: {id, status}
    DELETE - delete a comment: {id} or ?id=
    """
    from blog.models import Article, ArticleComment
    if request.method == 'GET':
        status_filter = request.query_params.get('status')
        qs = ArticleComment.objects.select_related('article', 'parent').order_by('-created_at')
        if status_filter:
            qs = qs.filter(status=status_filter)
        data = [{
            'id': c.id,
            'article_title': c.article.title,
            'article_slug': c.article.slug,
            'name': c.name,
            'email': c.email,
            'content': c.content,
            'status': c.status,
            'parent_id': c.parent_id,
            'ip_address': c.ip_address,
            'created_at': c.created_at.strftime('%Y/%m/%d %H:%M'),
        } for c in qs]
        pending_count = ArticleComment.objects.filter(status='PENDING').count()
        return Response({'comments': data, 'pending_count': pending_count})

    elif request.method == 'POST':
        # Reply to comment
        comment_id = request.data.get('comment_id')
        message = request.data.get('message', '').strip()
        if not comment_id or not message:
            return Response({'error': 'شناسه نظر و متن پاسخ الزامی است.'}, status=400)
        try:
            parent_comment = ArticleComment.objects.get(id=comment_id)
            if len(message) < 5:
                return Response({'error': 'پاسخ باید حداقل ۵ کاراکتر باشد.'}, status=400)
            if len(message) > 2000:
                return Response({'error': 'پاسخ نباید بیشتر از ۲۰۰۰ کاراکتر باشد.'}, status=400)
            
            reply = ArticleComment.objects.create(
                article=parent_comment.article,
                name='پشتیبانی ارشیا نگین',
                email='info@anpk.ir',
                content=message,
                parent=parent_comment,
                status='APPROVED',
                ip_address=request.META.get('REMOTE_ADDR')
            )
            return Response({
                'message': 'پاسخ با موفقیت ثبت شد.',
                'id': reply.id,
                'created_at': reply.created_at.strftime('%Y/%m/%d %H:%M')
            }, status=201)
        except ArticleComment.DoesNotExist:
            return Response({'error': 'نظر مورد نظر یافت نشد.'}, status=404)

    elif request.method == 'PUT':
        comment_id = request.data.get('id')
        new_status = request.data.get('status')
        try:
            c = ArticleComment.objects.get(id=comment_id)
            c.status = new_status
            c.save()
            return Response({'message': f'وضعیت نظر به "{new_status}" تغییر یافت.'})
        except ArticleComment.DoesNotExist:
            return Response({'error': 'نظر یافت نشد.'}, status=404)

    elif request.method == 'DELETE':
        comment_id = request.data.get('id') or request.query_params.get('id')
        try:
            ArticleComment.objects.get(id=comment_id).delete()
            return Response({'message': 'نظر حذف شد.'})
        except ArticleComment.DoesNotExist:
            return Response({'error': 'نظر یافت نشد.'}, status=404)
