from django.db import models

from accounts.models import Organization


class APIKey(models.Model):
    KEY_TYPES = (("PROJECT", "کلید اختصاصی پروژه"), ("ACCOUNT", "کلید کلی حساب سازمانی"))

    client = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="api_keys", verbose_name="سازمان / کاربر مالک کیف پول")
    project = models.ForeignKey("projects.ClientContractProject", on_delete=models.SET_NULL, null=True, blank=True, related_name="api_keys", verbose_name="پروژه مرتبط (اختیاری)")
    name = models.CharField(max_length=150, default="کلید API اختصاصی", verbose_name="عنوان کلید")
    key_type = models.CharField(max_length=20, choices=KEY_TYPES, default="PROJECT", verbose_name="نوع کلید")
    api_key = models.CharField(max_length=255, unique=True, verbose_name="کلید API اختصاصی")
    is_active = models.BooleanField(default=True, verbose_name="کلید فعال است")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ صدور")

    def __str__(self):
        project_label = f" - پروژه: {self.project.title}" if self.project else ""
        return f"{self.client.name}{project_label} ({self.api_key[:14]}...)"

    class Meta:
        db_table = "portal_apikey"
        verbose_name = "کلید API اختصاصی"
        verbose_name_plural = "مدیریت متمرکز کلیدهای API"


class SMSLog(models.Model):
    project = models.ForeignKey("projects.ClientContractProject", on_delete=models.SET_NULL, null=True, blank=True, related_name="sms_logs", verbose_name="پروژه مرتبط")
    recipient = models.CharField(max_length=50, db_index=True, verbose_name="شماره گیرنده")
    text = models.TextField(verbose_name="متن پیامک")
    operator = models.CharField(max_length=100, default="همراه اول", verbose_name="اپراتور")
    cost = models.IntegerField(default=75, verbose_name="هزینه (تومان)")
    status = models.CharField(max_length=50, default="delivered", verbose_name="وضعیت تحویل")
    sent_at = models.DateTimeField(auto_now_add=True, verbose_name="زمان ارسال")

    def __str__(self):
        project_name = f" - پروژه: {self.project.title}" if self.project else ""
        return f"پیامک {self.recipient}{project_name} - {self.status}"

    class Meta:
        db_table = "portal_smslog"
        verbose_name = "گزارش پیامک"
        verbose_name_plural = "گزارش‌های ارسال پیامک"
