from django.db import models
from django.utils import timezone

class ArticleCategory(models.Model):
    name = models.CharField(max_length=150, verbose_name="عنوان دسته‌بندی مقاله")
    slug = models.SlugField(unique=True, verbose_name="شناسه یکتا")
    description = models.CharField(max_length=255, blank=True, null=True, verbose_name="توضیحات کوتاه")
    icon = models.ImageField(upload_to="categories/icons/", blank=True, null=True, verbose_name="آیکون / تصویر دسته‌بندی")
    meta_title = models.CharField(max_length=150, blank=True, null=True, verbose_name="عنوان سئو (Meta Title)")
    meta_description = models.TextField(blank=True, null=True, verbose_name="توضیحات سئو (Meta Description)")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "دسته‌بندی مقاله"
        verbose_name_plural = "دسته‌بندی‌های مقالات وبلاگ"

class ArticleTag(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="عنوان برچسب")
    slug = models.SlugField(unique=True, verbose_name="شناسه یکتا برچسب")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "برچسب مقاله"
        verbose_name_plural = "برچسب‌های مقالات"

class Article(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'پیش‌نویس'),
        ('PUBLISHED', 'منتشر شده'),
        ('ARCHIVED', 'آرشیو شده'),
    ]
    LANGUAGE_CHOICES = [
        ('fa', 'فارسی'),
        ('en', 'English'),
        ('ar', 'العربية'),
    ]
    SCHEMA_CHOICES = [
        ('Article', 'مقاله'),
        ('NewsArticle', 'خبر'),
        ('BlogPosting', 'پست وبلاگ'),
        ('TechArticle', 'مقاله فنی'),
        ('HowTo', 'آموزش'),
    ]

    title = models.CharField(max_length=255, verbose_name="عنوان مقاله")
    slug = models.SlugField(unique=True, verbose_name="شناسه یکتا")
    category = models.ForeignKey(ArticleCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name="articles", verbose_name="دسته‌بندی موضوعی مقاله")
    author = models.CharField(max_length=150, default="دپارتمان مهندسی ANPK", verbose_name="نویسنده")
    
    summary = models.TextField(verbose_name="خلاصه / چکیده مقاله")
    content = models.TextField(verbose_name="متن کامل مقاله")
    table_of_contents = models.BooleanField(default=True, verbose_name="نمایش فهرست مطالب")
    read_time = models.CharField(max_length=50, default="۵ دقیقه", verbose_name="زمان تقریبی مطالعه")
    
    # Taxonomy
    tags = models.ManyToManyField(ArticleTag, blank=True, related_name="articles", verbose_name="برچسب‌ها")
    
    # Media
    thumbnail = models.ImageField(upload_to="articles/thumbnails/", blank=True, null=True, verbose_name="تصویر شاخص (Thumbnail)")
    cover_image = models.ImageField(upload_to="articles/covers/", blank=True, null=True, verbose_name="تصویر اصلی / هدر (Cover)")
    
    # Analytics
    views_count = models.IntegerField(default=0, verbose_name="تعداد بازدیدکنندگان")
    
    # Publishing & Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PUBLISHED', verbose_name="وضعیت انتشار")
    is_featured = models.BooleanField(default=False, verbose_name="مقاله ویژه / برگزیده")
    published_at = models.DateTimeField(blank=True, null=True, verbose_name="تاریخ و زمان انتشار (برای زمان‌بندی)")
    scheduled_at = models.DateTimeField(blank=True, null=True, verbose_name="تاریخ زمان‌بندی شده")
    
    # SEO
    meta_title = models.CharField(max_length=150, blank=True, null=True, verbose_name="عنوان سئو (Meta Title)")
    meta_description = models.TextField(blank=True, null=True, verbose_name="توضیحات سئو (Meta Description)")
    canonical_url = models.URLField(blank=True, null=True, verbose_name="Canonical URL")
    
    # Open Graph (Social Media)
    og_title = models.CharField(max_length=255, blank=True, null=True, verbose_name="عنوان Open Graph (شبکه اجتماعی)")
    og_description = models.TextField(blank=True, null=True, verbose_name="توضیحات Open Graph")
    og_image = models.ImageField(upload_to="articles/og/", blank=True, null=True, verbose_name="تصویر Open Graph (1200x630)")
    
    # Advanced Settings
    language = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, default='fa', verbose_name="زبان مقاله")
    schema_type = models.CharField(max_length=30, choices=SCHEMA_CHOICES, default='Article', verbose_name="نوع Schema.org")
    allow_comments = models.BooleanField(default=True, verbose_name="اجازه نظر دهی")
    
    # Dates
    created_at = models.DateTimeField(default=timezone.now, verbose_name="تاریخ ایجاد")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="آخرین بروزرسانی")

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "مقاله مهندسی"
        verbose_name_plural = "مقالات و پایگاه دانش"

class ArticleComment(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'در انتظار تأیید'),
        ('APPROVED', 'تأیید شده'),
        ('REJECTED', 'رد شده'),
    ]
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='comments', verbose_name='مقاله')
    name = models.CharField(max_length=100, verbose_name='نام ارسالکننده')
    email = models.EmailField(verbose_name='ایمیل')
    content = models.TextField(verbose_name='متن نظر')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', verbose_name='وضعیت')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies', verbose_name='پاسخ به')
    ip_address = models.GenericIPAddressField(blank=True, null=True, verbose_name='آدرس IP')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='تاریخ ارسال')

    def __str__(self):
        return f'{self.name} - {self.article.title}'

    class Meta:
        verbose_name = 'نظر'
        verbose_name_plural = 'نظرات مقالات'
        ordering = ['-created_at']
