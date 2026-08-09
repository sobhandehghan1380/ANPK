from django.db import models

class OpenRouterConfig(models.Model):
    api_url = models.URLField(default="https://openrouter.ai/api/v1/chat/completions", verbose_name="آدرس API پرووایدر هوش مصنوعی")
    api_key = models.CharField(max_length=255, default="sk-or-v1-demo-key-anpk", verbose_name="کلید API سرویس هوش مصنوعی")
    default_model = models.CharField(max_length=150, default="google/gemini-2.5-flash", verbose_name="مدل هوش مصنوعی پیش‌فرض")
    wallet_rate_per_query = models.IntegerField(default=240, verbose_name="تعرفه کسر از کیف پول برای هر کوئری (تومان)")
    is_active = models.BooleanField(default=True, verbose_name="سرویس فعال است")

    def __str__(self):
        return f"تنظیمات هوش مصنوعی ({self.default_model})"

    class Meta:
        verbose_name = "تنظیمات سرویس هوش مصنوعی"
        verbose_name_plural = "تنظیمات هوش مصنوعی و سرویس API"


class SMSGatewayConfig(models.Model):
    provider_name = models.CharField(max_length=100, default="کاوه نگار / ملی پیامک واسط", verbose_name="نام سامانه پیامکی")
    api_key = models.CharField(max_length=255, default="sms-gateway-demo-key-anpk", verbose_name="کلید API درگاه پیامک")
    sender_line = models.CharField(max_length=50, default="30005050", verbose_name="خط اختصاصی ارسال پیامک")
    is_active = models.BooleanField(default=True, verbose_name="درگاه فعال است")

    def __str__(self):
        return f"سامانه پیامک: {self.provider_name}"

    class Meta:
        verbose_name = "تنظیمات درگاه پیامک"
        verbose_name_plural = "تنظیمات سرویس پیامک"


class AILog(models.Model):
    project = models.ForeignKey('projects.ClientContractProject', on_delete=models.SET_NULL, null=True, blank=True, related_name="ai_logs", verbose_name="پروژه مرتبط")
    user_query = models.TextField(default="", verbose_name="سوال / پرامپت کاربر")
    ai_response = models.TextField(default="", verbose_name="پاسخ هوش مصنوعی")
    model_used = models.CharField(max_length=150, verbose_name="مدل استفاده‌شده")
    cost_deducted = models.IntegerField(default=240, verbose_name="هزینه کسرشده از کیف پول (تومان)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ کوئری")

    def __str__(self):
        proj_name = f" - پروژه: {self.project.title}" if self.project else ""
        return f"کوئری AI{proj_name} - {self.model_used} - {self.cost_deducted} تومان"

    class Meta:
        verbose_name = "لاگ پردازش هوش مصنوعی"
        verbose_name_plural = "گزارشات پردازش هوش مصنوعی"


class SystemNodeStatus(models.Model):
    name = models.CharField(max_length=150, verbose_name="نام نود / سرویس کلود")
    status_label = models.CharField(max_length=50, default="آنلاین", verbose_name="وضعیت پایش (e.g. آنلاین، نگه‌داشت)")
    uptime_percentage = models.CharField(max_length=20, default="۹۹.۹٪", verbose_name="درصد پایداری (Uptime)")
    latency_ms = models.IntegerField(default=25, verbose_name="تخمین تاخیر شبکه (ms)")
    is_active = models.BooleanField(default=True, verbose_name="نود فعال است")

    def __str__(self):
        return f"نود: {self.name} - {self.status_label} ({self.uptime_percentage})"

    class Meta:
        verbose_name = "نود کلود و وضعیت پایداری"
        verbose_name_plural = "پایش آنلاین نودها و سرویس‌ها (Node Status)"
