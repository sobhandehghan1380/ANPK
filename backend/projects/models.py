from django.db import models
from django.utils import timezone
from portal.models import ClientOrganization

class ProjectCategory(models.Model):
    name = models.CharField(max_length=150, verbose_name="عنوان دسته‌بندی")
    slug = models.SlugField(unique=True, verbose_name="شناسه یکتا")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "دسته‌بندی پروژه"
        verbose_name_plural = "دسته‌بندی‌های پروژه‌ها"


class Technology(models.Model):
    name = models.CharField(max_length=100, verbose_name="نام تکنولوژی")
    category = models.CharField(max_length=100, default="بک‌اند", verbose_name="حوزه تکنولوژی")

    def __str__(self):
        return f"{self.name} ({self.category})"

    class Meta:
        verbose_name = "تکنولوژی"
        verbose_name_plural = "تکنولوژی‌های نرم‌افزاری"


class PublicPortfolioProject(models.Model):
    title = models.CharField(max_length=255, verbose_name="عنوان پروژه / نمونه‌کار")
    slug = models.SlugField(unique=True, verbose_name="شناسه یکتا")
    category = models.ForeignKey(ProjectCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name="projects", verbose_name="دسته‌بندی اصلی پروژه")
    technologies = models.ManyToManyField(Technology, related_name="projects", blank=True, verbose_name="تکنولوژی‌های استفاده‌شده")
    client_name_display = models.CharField(max_length=255, verbose_name="نام سازمان / کارفرما")
    summary = models.TextField(verbose_name="خلاصه دستاوردها و ارزش افزوده")
    full_description = models.TextField(blank=True, null=True, verbose_name="شرح کامل معماری فنی و جزئیات استقرار")
    sprint_progress = models.IntegerField(default=100, verbose_name="درصد پیشرفت استقرار (۱۰۰٪ کامل)")
    demo_url = models.URLField(blank=True, null=True, verbose_name="آدرس لینک دمو یا وب‌سایت پروژه")
    is_featured = models.BooleanField(default=True, verbose_name="نمایش در نمونه‌کارهای ویژه صفحه اصلی")
    meta_title = models.CharField(max_length=70, blank=True, null=True, verbose_name="عنوان سئو (Meta Title)")
    meta_description = models.CharField(max_length=160, blank=True, null=True, verbose_name="توضیحات سئو (Meta Description)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت در پورتفولیو")

    def __str__(self):
        return f"{self.title} ({self.client_name_display})"

    class Meta:
        verbose_name = "نمونه‌کار عمومی"
        verbose_name_plural = "پروژه‌ها و نمونه‌کارهای عمومی سایت"


class ClientContractProject(models.Model):
    client = models.ForeignKey(ClientOrganization, on_delete=models.CASCADE, related_name="contract_projects", verbose_name="سازمان / کاربر مالک پروژه")
    title = models.CharField(max_length=255, verbose_name="عنوان پروژه قراردادی مشتری")
    slug = models.SlugField(unique=True, verbose_name="شناسه یکتا")
    contract_number = models.CharField(max_length=100, default="ANPK-CNT-1404-892", verbose_name="شماره رسمی قرارداد")
    contract_date = models.DateField(default=timezone.now, verbose_name="تاریخ عقد قرارداد")
    contract_value = models.IntegerField(default=150000000, verbose_name="مبلغ مالی قرارداد (تومان)")
    sprint_progress = models.IntegerField(default=85, verbose_name="درصد پیشرفت کلی اسپرینت")
    active_phase_title = models.CharField(max_length=150, default="فاز ۳: استقرار بومی & مانیتورینگ موتورخانه", verbose_name="عنوان فاز جاری")
    delivery_date = models.DateField(default=timezone.now, verbose_name="تاریخ تحویل فاز جاری / نهایی")
    login_url = models.URLField(blank=True, null=True, verbose_name="آدرس اختصاصی ورود مشتری به سامانه")
    is_active = models.BooleanField(default=True, verbose_name="پروژه فعال است")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت در سیستم")

    def __str__(self):
        return f"پروژه: {self.title} - شماره قرارداد: {self.contract_number} ({self.client.name})"

    class Meta:
        verbose_name = "پروژه قراردادی مشتری"
        verbose_name_plural = "پروژه‌های خصوصی پورتال مشتریان"


class ProjectPhase(models.Model):
    STATUS_CHOICES = (
        ('COMPLETED', 'تکمیل شده (۱۰۰٪)'),
        ('IN_PROGRESS', 'در حال انجام'),
        ('PENDING', 'در انتظار شروع'),
    )

    project = models.ForeignKey(ClientContractProject, on_delete=models.CASCADE, related_name="phases", verbose_name="پروژه مربوطه")
    phase_number = models.IntegerField(default=1, verbose_name="شماره فاز")
    title = models.CharField(max_length=255, verbose_name="عنوان فاز اجرایی")
    description = models.TextField(blank=True, null=True, verbose_name="توضیحات و خروجی‌های این فاز")
    progress_percentage = models.IntegerField(default=0, verbose_name="درصد پیشرفت این فاز (۰ تا ۱۰۰)")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='IN_PROGRESS', verbose_name="وضعیت فاز")
    start_date = models.DateField(default=timezone.now, verbose_name="تاریخ شروع فاز")
    target_delivery_date = models.DateField(default=timezone.now, verbose_name="تاریخ تحویل تخمینی فاز")
    deliverable_file = models.FileField(upload_to="deliverables/", blank=True, null=True, verbose_name="فایل خروجی (تحویلی)")

    def __str__(self):
        return f"فاز {self.phase_number}: {self.title} ({self.get_status_display()})"

    class Meta:
        ordering = ['phase_number']
        verbose_name = "فاز اجرایی پروژه"
        verbose_name_plural = "فازهای اجرایی پروژه"
