from django.db import models

class ProjectLead(models.Model):
    STATUS_CHOICES = (
        ('new', 'جدید (نیازمند بررسی)'),
        ('contacted', 'در حال پیگیری و تماس'),
        ('contract', 'تایید و عقد قرارداد'),
        ('archived', 'بایگانی'),
    )
    PRIORITY_CHOICES = (
        ('hot', 'داغ (فوری)'),
        ('warm', 'گرم (احتمالی)'),
        ('cold', 'سرد (بلندمدت)'),
    )

    company_name = models.CharField(max_length=255, verbose_name="نام سازمان / بیمارستان")
    contact_person = models.CharField(max_length=255, verbose_name="نام و نام خانوادگی رابط")
    phone = models.CharField(max_length=50, verbose_name="شماره تماس")
    email = models.EmailField(blank=True, null=True, verbose_name="ایمیل")
    service_type = models.CharField(max_length=255, verbose_name="سرویس درخواستی")
    budget_range = models.CharField(max_length=150, verbose_name="حدود بودجه")
    timeline = models.CharField(max_length=150, verbose_name="زمان‌بندی مد نظر")
    description = models.TextField(blank=True, null=True, verbose_name="توضیحات تکمیلی")
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='new', verbose_name="وضعیت پیگیری")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='warm', verbose_name="اولویت")
    source = models.CharField(max_length=100, blank=True, null=True, verbose_name="منبع لید")
    assigned_to = models.CharField(max_length=100, blank=True, null=True, verbose_name="مسئول پیگیری")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت درخواست")

    def __str__(self):
        return f"لید: {self.company_name} ({self.contact_person})"

    class Meta:
        verbose_name = "لید درخواست پروژه"
        verbose_name_plural = "لیدهای درخواست پروژه (فرم ۴ مرحله‌ای)"

class LeadActivityLog(models.Model):
    ACTIVITY_TYPES = (
        ('note', 'یادداشت داخلی'),
        ('call', 'تماس تلفنی'),
        ('meeting', 'جلسه حضوری/آنلاین'),
        ('email', 'ایمیل/پیامک'),
    )
    lead = models.ForeignKey(ProjectLead, on_delete=models.CASCADE, related_name='activities', verbose_name="لید مرتبط")
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES, default='note', verbose_name="نوع فعالیت")
    description = models.TextField(verbose_name="شرح فعالیت")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت")

    class Meta:
        verbose_name = "سابقه فعالیت لید"
        verbose_name_plural = "سوابق فعالیت لیدها"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_activity_type_display()} - {self.lead.company_name}"
