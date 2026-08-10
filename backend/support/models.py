import datetime

from django.db import models
from django.utils import timezone

from accounts.models import Organization


class SLASupportContract(models.Model):
    client = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="sla_contracts", verbose_name="سازمان / مشتری")
    project = models.ForeignKey("projects.ClientContractProject", on_delete=models.CASCADE, related_name="sla_contracts", null=True, blank=True, verbose_name="پروژه مرتبط")
    subscription = models.OneToOneField("subscriptions.ClientSubscription", on_delete=models.CASCADE, related_name="sla_contract", null=True, blank=True, verbose_name="اشتراک مرتبط")
    plan_name = models.CharField(max_length=150, default="پشتیبانی طلایی SLA ۲۴/۷", verbose_name="سطح قرارداد پشتیبانی")
    start_date = models.DateField(default=timezone.now, verbose_name="تاریخ شروع قرارداد")
    duration_months = models.IntegerField(default=12, verbose_name="مدت قرارداد (ماه)")
    support_schedule = models.CharField(max_length=50, default="24/7", verbose_name="ساعات پشتیبانی")
    response_time_minutes = models.PositiveIntegerField(default=30, verbose_name="حداکثر زمان پاسخ اولیه (دقیقه)")
    resolution_time_hours = models.PositiveIntegerField(default=4, verbose_name="حداکثر زمان رفع خطای بحرانی (ساعت)")
    availability_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=99.90, verbose_name="دسترس‌پذیری تضمین‌شده (درصد)")
    is_active = models.BooleanField(default=True, verbose_name="قرارداد فعال است")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت سیستم")

    @property
    def remaining_days(self):
        try:
            start_date = self.start_date
            if isinstance(start_date, datetime.datetime):
                start_date = start_date.date()
            elif isinstance(start_date, str):
                start_date = datetime.date.fromisoformat(start_date)
            end_date = start_date + datetime.timedelta(days=int(self.duration_months or 12) * 30)
            return max(0, (end_date - timezone.now().date()).days)
        except Exception:
            return 0

    def __str__(self):
        scope = self.project.title if self.project else self.client.name
        return f"قرارداد SLA {scope} ({self.duration_months} ماهه از {self.start_date})"

    class Meta:
        db_table = "portal_slasupportcontract"
        verbose_name = "قرارداد پشتیبانی SLA"
        verbose_name_plural = "قراردادها و پشتیبانی SLA"


class SupportTicket(models.Model):
    client = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="tickets", null=True, blank=True, verbose_name="سازمان / مشتری")
    project = models.ForeignKey("projects.ClientContractProject", on_delete=models.CASCADE, related_name="tickets", null=True, blank=True, verbose_name="پروژه مرتبط")
    client_name = models.CharField(max_length=255, verbose_name="نام ثبت‌کننده")
    subject = models.CharField(max_length=255, verbose_name="موضوع تیکت پشتیبانی")
    message = models.TextField(verbose_name="متن درخواست")
    status = models.CharField(max_length=50, default="open", verbose_name="وضعیت")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت تیکت")

    def __str__(self):
        return f"تیکت: {self.subject} ({self.client_name})"

    class Meta:
        db_table = "portal_supportticket"
        verbose_name = "تیکت پشتیبانی"
        verbose_name_plural = "تیکت‌های پشتیبانی مشتریان"


class TicketReply(models.Model):
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name="replies", verbose_name="تیکت مربوطه")
    sender_name = models.CharField(max_length=255, default="پشتیبانی", verbose_name="نام فرستنده")
    is_admin = models.BooleanField(default=True, verbose_name="آیا پاسخ از طرف ادمین است؟")
    message = models.TextField(verbose_name="متن پاسخ")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت پاسخ")

    def __str__(self):
        return f"پاسخ به تیکت {self.ticket.id} توسط {self.sender_name}"

    class Meta:
        db_table = "portal_ticketreply"
        verbose_name = "پاسخ تیکت"
        verbose_name_plural = "پاسخ‌های تیکت"


class InAppNotification(models.Model):
    client = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="notifications", verbose_name="سازمان / مشتری")
    title = models.CharField(max_length=255, verbose_name="عنوان نوتیفیکیشن")
    message = models.TextField(verbose_name="متن پیام")
    is_read = models.BooleanField(default=False, verbose_name="خوانده شده")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")

    def __str__(self):
        return f"نوتیف برای {self.client.name} - {self.title}"

    class Meta:
        db_table = "portal_inappnotification"
        ordering = ["-created_at"]
        verbose_name = "اعلان داخل برنامه"
        verbose_name_plural = "اعلان‌های داخل برنامه"
