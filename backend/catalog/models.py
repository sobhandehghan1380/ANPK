from django.db import models

# 1. Product Categories
class ProductCategory(models.Model):
    name = models.CharField(max_length=150, verbose_name="نام دسته‌بندی")
    slug = models.SlugField(unique=True, verbose_name="شناسه یکتا (slug)")
    icon_name = models.CharField(max_length=100, default="Layers", verbose_name="نام آیکون (Lucide)")
    description = models.TextField(blank=True, default="", verbose_name="توضیحات دسته‌بندی")
    order = models.IntegerField(default=0, verbose_name="اولویت نمایش")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "دسته‌بندی محصول"
        verbose_name_plural = "دسته‌بندی‌های محصولات"
        ordering = ['order', 'id']


# 2. Comprehensive Software Product Model
class Product(models.Model):
    name = models.CharField(max_length=255, verbose_name="نام محصول")
    slug = models.SlugField(unique=True, verbose_name="شناسه یکتا (slug)")
    category = models.ForeignKey(ProductCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name="products", verbose_name="دسته‌بندی محصول")
    short_description = models.TextField(verbose_name="توضیح کوتاه (چکیده کارت)")
    full_description = models.TextField(blank=True, default="", verbose_name="توضیحات جامع و کامل معرفی محصول")
    icon_name = models.CharField(max_length=100, default="Bot", verbose_name="نام آیکون (Lucide)")
    image_url = models.CharField(max_length=500, blank=True, default="", verbose_name="آدرس تصویر بنر / اسکرین‌شات")
    status = models.CharField(max_length=100, default="دمو فعال / آماده استقرار", verbose_name="وضعیت توسعه و تحویل")
    demo_url = models.URLField(blank=True, default="", verbose_name="لینک آنلاین دمو / سامانه")
    catalog_pdf_url = models.URLField(blank=True, default="", verbose_name="لینک کاتالوگ PDF / دفترچه فنی")
    features_list = models.TextField(blank=True, default="", verbose_name="لیست امکانات و قابلیت‌ها (هرکدام در یک خط)")
    technical_specs = models.TextField(blank=True, default="", verbose_name="مشخصات فنی و زیرساخت (هرکدام در یک خط)")
    is_featured = models.BooleanField(default=True, verbose_name="نمایش ویژه در صفحه اصلی")
    order = models.IntegerField(default=0, verbose_name="اولویت نمایش")

    def __str__(self):
        cat_info = f" ({self.category.name})" if self.category else ""
        return f"{self.name}{cat_info}"

    class Meta:
        verbose_name = "محصول نرم‌افزاری"
        verbose_name_plural = "محصولات نرم‌افزاری & کلود"
        ordering = ['order', 'id']


class ProductFeature(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="features", verbose_name="محصول مرتبط")
    title = models.CharField(max_length=255, verbose_name="عنوان قابلیت")
    description = models.TextField(blank=True, default="", verbose_name="توضیحات قابلیت")
    icon_name = models.CharField(max_length=100, default="CheckCircle2", verbose_name="نام آیکون")

    def __str__(self):
        return f"{self.product.name} - {self.title}"

    class Meta:
        verbose_name = "قابلیت محصول"
        verbose_name_plural = "قابلیت‌ها و امکانات محصول"


# 3. Specialized Industry Solution Model
class Solution(models.Model):
    title = models.CharField(max_length=255, verbose_name="عنوان راهکار تخصصی")
    slug = models.SlugField(unique=True, verbose_name="شناسه یکتا (slug)")
    subtitle = models.CharField(max_length=255, blank=True, default="", verbose_name="زیرعنوان / دستاورد شاخص")
    description = models.TextField(verbose_name="توضیحات جامع راهکار و چالش‌های حل‌شده")
    icon_name = models.CharField(max_length=100, default="ShieldCheck", verbose_name="نام آیکون (Lucide)")
    image_url = models.CharField(max_length=500, blank=True, default="", verbose_name="تصویر بنر / معماری راهکار")
    target_industries = models.TextField(blank=True, default="", verbose_name="صنایع و مراجع هدف (هرکدام در یک خط)")
    key_benefits = models.TextField(blank=True, default="", verbose_name="مزایای کلیدی راهکار (هرکدام در یک خط)")
    use_cases = models.TextField(blank=True, default="", verbose_name="سناریوهای واقعی استفاده (Use Cases)")
    architecture_summary = models.TextField(blank=True, default="", verbose_name="خلاصه معماری و تکنولوژی‌های به‌کاررفته")
    demo_url = models.URLField(blank=True, default="", verbose_name="لینک دمو یا درخواست مشاوره")
    is_featured = models.BooleanField(default=True, verbose_name="نمایش ویژه در صفحه اصلی")
    order = models.IntegerField(default=0, verbose_name="اولویت نمایش")

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "راهکار تخصصی"
        verbose_name_plural = "راهکارهای تخصصی صنایع & سازمان‌ها"
        ordering = ['order', 'id']


class SolutionBenefit(models.Model):
    solution = models.ForeignKey(Solution, on_delete=models.CASCADE, related_name="benefits", verbose_name="راهکار مرتبط")
    title = models.CharField(max_length=255, verbose_name="عنوان دستاورد / مزیت")
    metric_value = models.CharField(max_length=50, blank=True, default="", verbose_name="مقدار عددی شاخص (e.g. +35%)")
    description = models.TextField(blank=True, default="", verbose_name="توضیحات تکمیلی")

    def __str__(self):
        return f"{self.solution.title} - {self.title}"

    class Meta:
        verbose_name = "مزیت راهکار"
        verbose_name_plural = "مزایا و دستاوردهای راهکار"
