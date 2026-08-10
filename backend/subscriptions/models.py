from django.db import models
from django.db.models import F, Q
from django.utils import timezone

from accounts.models import Organization


class PricingPlan(models.Model):
    SERVICE_TYPES = (
        ("HOSTING", "میزبانی و سرور"),
        ("SUPPORT", "پشتیبانی"),
        ("MAINTENANCE", "نگهداری دوره‌ای"),
        ("OTHER", "سایر خدمات"),
    )

    service_type = models.CharField(max_length=20, choices=SERVICE_TYPES, default="SUPPORT", verbose_name="نوع سرویس")
    name = models.CharField(max_length=150, verbose_name="نام پلن")
    description = models.TextField(blank=True, null=True, verbose_name="توضیحات پلن")
    monthly_price = models.IntegerField(default=0, verbose_name="هزینه ماهانه (تومان)")
    yearly_price = models.IntegerField(default=0, verbose_name="هزینه سالانه (تومان)")
    server_cost = models.IntegerField(default=0, verbose_name="هزینه سرور (تومان)")
    support_cost = models.IntegerField(default=0, verbose_name="هزینه پشتیبانی (تومان)")
    features_list = models.TextField(blank=True, verbose_name="فهرست ویژگی‌ها")
    trial_days = models.IntegerField(default=0, verbose_name="روزهای تست رایگان")
    min_months = models.IntegerField(default=1, verbose_name="حداقل مدت (ماه)")
    is_active = models.BooleanField(default=True, verbose_name="پلن فعال است")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")

    def __str__(self):
        return f"{self.name} - {self.monthly_price:,} تومان در ماه"

    class Meta:
        db_table = "portal_pricingplan"
        verbose_name = "پلن قیمت‌گذاری"
        verbose_name_plural = "پلن‌های قیمت‌گذاری"


class ClientSubscription(models.Model):
    STATUS_CHOICES = (
        ("trialing", "دوره آزمایشی"),
        ("active", "فعال"),
        ("past_due", "سررسیدشده"),
        ("canceled", "لغوشده"),
        ("expired", "منقضی"),
    )

    service_type = models.CharField(max_length=20, choices=PricingPlan.SERVICE_TYPES, default="SUPPORT", verbose_name="نوع سرویس")
    client = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="subscriptions", verbose_name="سازمان / مشتری")
    # Nullable only for compatibility with legacy rows. New agreements require a project in the service/API layer.
    project = models.ForeignKey(
        "projects.ClientContractProject",
        on_delete=models.CASCADE,
        related_name="subscriptions",
        null=True,
        blank=True,
        verbose_name="پروژه مرتبط",
    )
    plan = models.ForeignKey(PricingPlan, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="پلن انتخابی")
    is_custom_plan = models.BooleanField(default=False, verbose_name="پلن اختصاصی")
    custom_plan_name = models.CharField(max_length=150, blank=True, null=True, verbose_name="نام پلن اختصاصی")
    custom_monthly_price = models.IntegerField(default=0, verbose_name="قیمت ماهانه اختصاصی")
    custom_yearly_price = models.IntegerField(default=0, verbose_name="قیمت سالانه اختصاصی")
    custom_server_cost = models.IntegerField(default=0, verbose_name="هزینه سرور اختصاصی")
    custom_support_cost = models.IntegerField(default=0, verbose_name="هزینه پشتیبانی اختصاصی")
    custom_description = models.TextField(blank=True, null=True, verbose_name="توضیحات پلن اختصاصی")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="trialing", verbose_name="وضعیت قرارداد سرویس")
    start_date = models.DateField(default=timezone.now, verbose_name="تاریخ شروع")
    end_date = models.DateField(verbose_name="تاریخ سررسید / انقضا")
    trial_end = models.DateField(blank=True, null=True, verbose_name="پایان دوره آزمایشی")
    auto_renew = models.BooleanField(default=False, verbose_name="تمدید خودکار")
    canceled_at = models.DateTimeField(blank=True, null=True, verbose_name="زمان لغو")
    cancellation_reason = models.TextField(blank=True, null=True, verbose_name="دلیل لغو")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="تاریخ ثبت")

    def __str__(self):
        plan_name = self.plan.name if self.plan else (self.custom_plan_name or "بدون پلن")
        scope = self.project.title if self.project else self.client.name
        return f"قرارداد سرویس {scope} - {plan_name}"

    class Meta:
        db_table = "portal_clientsubscription"
        verbose_name = "قرارداد سرویس پروژه"
        verbose_name_plural = "قراردادهای سرویس پروژه‌ها"
        constraints = [
            models.UniqueConstraint(
                fields=("project", "service_type"),
                condition=Q(status__in=("trialing", "active", "past_due")),
                name="unique_open_project_service_agreement",
            ),
        ]


class PricingPlanVersion(models.Model):
    plan = models.ForeignKey(PricingPlan, on_delete=models.CASCADE, related_name="price_versions", verbose_name="پلن")
    effective_from = models.DateField(verbose_name="معتبر از")
    effective_to = models.DateField(null=True, blank=True, verbose_name="معتبر تا")
    monthly_price = models.PositiveBigIntegerField(verbose_name="قیمت ماهانه")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.plan.name} - {self.monthly_price:,} از {self.effective_from}"

    class Meta:
        db_table = "subscriptions_pricingplanversion"
        ordering = ("-effective_from", "-id")
        verbose_name = "نسخه قیمت پلن"
        verbose_name_plural = "نسخه‌های قیمت پلن‌ها"
        constraints = [
            models.UniqueConstraint(fields=("plan", "effective_from"), name="unique_plan_price_effective_date"),
            models.CheckConstraint(
                condition=Q(effective_to__isnull=True) | Q(effective_to__gte=F("effective_from")),
                name="price_version_valid_date_range",
            ),
        ]


class SubscriptionPeriod(models.Model):
    STATUS_CHOICES = (
        ("DRAFT", "پیش‌نویس"),
        ("INVOICED", "در انتظار پرداخت"),
        ("ACTIVE", "فعال"),
        ("CANCELED", "لغوشده"),
        ("REFUNDED", "برگشت‌خورده"),
    )

    subscription = models.ForeignKey(ClientSubscription, on_delete=models.CASCADE, related_name="periods", verbose_name="قرارداد سرویس")
    price_version = models.ForeignKey(PricingPlanVersion, on_delete=models.PROTECT, related_name="periods", null=True, blank=True, verbose_name="نسخه قیمت")
    invoice = models.OneToOneField("billing.Invoice", on_delete=models.PROTECT, related_name="service_period", null=True, blank=True, verbose_name="فاکتور")
    months = models.PositiveSmallIntegerField(verbose_name="تعداد ماه")
    start_date = models.DateField(verbose_name="شروع دوره")
    end_date = models.DateField(verbose_name="پایان دوره (غیرشامل)")
    monthly_unit_price = models.PositiveBigIntegerField(verbose_name="قیمت ماهانه ثبت‌شده")
    subtotal = models.PositiveBigIntegerField(verbose_name="جمع قبل از تخفیف")
    discount_amount = models.PositiveBigIntegerField(default=0, verbose_name="تخفیف")
    tax_amount = models.PositiveBigIntegerField(default=0, verbose_name="مالیات")
    total_amount = models.PositiveBigIntegerField(verbose_name="مبلغ نهایی")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="DRAFT", verbose_name="وضعیت")
    activated_at = models.DateTimeField(null=True, blank=True, verbose_name="زمان فعال‌سازی")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.subscription} - {self.months} ماه ({self.start_date} تا {self.end_date})"

    class Meta:
        db_table = "subscriptions_subscriptionperiod"
        ordering = ("-start_date", "-id")
        verbose_name = "دوره تمدید سرویس"
        verbose_name_plural = "دوره‌های تمدید سرویس"
        constraints = [
            models.CheckConstraint(condition=Q(months__gt=0), name="subscription_period_positive_months"),
            models.CheckConstraint(condition=Q(end_date__gt=F("start_date")), name="subscription_period_valid_range"),
        ]
