from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

# 1. Organization Base Model

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=20, blank=True, null=True, verbose_name="شماره تماس")
    national_code = models.CharField(max_length=20, blank=True, null=True, verbose_name="کد ملی")
    job_title = models.CharField(max_length=150, blank=True, null=True, verbose_name="عنوان شغلی")
    address = models.TextField(blank=True, null=True, verbose_name="آدرس پستی")
    bio = models.TextField(blank=True, null=True, verbose_name="درباره شخص")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Profile: {self.user.username}"

class ClientOrganization(models.Model):
    owner_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="owned_organizations", verbose_name="کاربر اصلی / مالک سازمان")
    name = models.CharField(max_length=255, verbose_name="نام سازمان / بیمارستان")
    contact_person = models.CharField(max_length=150, verbose_name="نام رابط اصلی سازمان")
    phone = models.CharField(max_length=50, db_index=True, verbose_name="شماره تماس سازمان")
    email = models.EmailField(blank=True, null=True, verbose_name="ایمیل سازمان")
    address = models.TextField(blank=True, null=True, verbose_name="آدرس سازمان")
    national_code = models.CharField(max_length=50, blank=True, null=True, verbose_name="کد اقتصادی / شناسه ملی")
    website = models.URLField(blank=True, null=True, verbose_name="وب‌سایت سازمان")
    description = models.TextField(blank=True, null=True, verbose_name="توضیحات / یادداشت")
    logo_url = models.CharField(max_length=500, blank=True, default="", verbose_name="آدرس لوگوی سازمان")
    tags = models.CharField(max_length=500, blank=True, default="", verbose_name="برچسب‌ها (با کاما جدا کنید)")
    portal_access = models.BooleanField(default=True, verbose_name="دسترسی به پورتال")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="تاریخ ثبت سازمان")

    def __str__(self):
        owner_info = f" - مالک: {self.owner_user.username}" if self.owner_user else ""
        return f"{self.name}{owner_info}"

    def get_tags_list(self):
        return [tag.strip() for tag in self.tags.split(',') if tag.strip()]

    class Meta:
        verbose_name = "سازمان / مشتری"
        verbose_name_plural = "سازمان‌ها و مشتریان"


# 2. Financial & Wallet Dedicated Models
class Wallet(models.Model):
    client = models.OneToOneField(ClientOrganization, on_delete=models.CASCADE, related_name="wallet", verbose_name="سازمان / مشتری")
    balance = models.IntegerField(default=29500000, verbose_name="موجودی حساب کیف پول (تومان)")
    is_active = models.BooleanField(default=True, verbose_name="کیف پول فعال است")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاریخ آخرین بروزرسانی")

    def __str__(self):
        return f"کیف پول {self.client.name}: {self.balance:,} تومان"

    class Meta:
        verbose_name = "حساب کیف پول"
        verbose_name_plural = "امور مالی و کیف پول سازمان‌ها"


class WalletTransaction(models.Model):
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="transactions", null=True, blank=True, verbose_name="کیف پول")
    transaction_type = models.CharField(max_length=50, verbose_name="نوع تراکنش")
    amount = models.IntegerField(verbose_name="مبلغ تراکنش (تومان)")
    description = models.CharField(max_length=255, verbose_name="توضیحات تراکنش")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ تراکنش")

    def __str__(self):
        return f"تراکنش {self.wallet.client.name if self.wallet else ''} - {self.amount} تومان"

    class Meta:
        verbose_name = "تراکنش کیف پول"
        verbose_name_plural = "تراکنش‌های کیف پول"


# 3. SLA & Support Dedicated Models
class SLASupportContract(models.Model):
    client = models.ForeignKey(ClientOrganization, on_delete=models.CASCADE, related_name="sla_contracts", verbose_name="سازمان / مشتری")
    plan_name = models.CharField(max_length=150, default="پشتیبانی طلایی SLA ۲۴/۷", verbose_name="سطح قرارداد پشتیبانی")
    start_date = models.DateField(default=timezone.now, verbose_name="تاریخ شروع قرارداد")
    duration_months = models.IntegerField(default=12, verbose_name="مدت قرارداد (ماه)")
    is_active = models.BooleanField(default=True, verbose_name="قرارداد فعال است")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت سیستم")

    @property
    def remaining_days(self):
        try:
            from datetime import timedelta
            end_date = self.start_date + timedelta(days=self.duration_months * 30)
            today = timezone.now().date()
            delta = (end_date - today).days
            return max(0, delta)
        except Exception:
            return 0

    def __str__(self):
        return f"قرارداد SLA {self.client.name} ({self.duration_months} ماهه از {self.start_date})"

    class Meta:
        verbose_name = "قرارداد پشتیبانی SLA"
        verbose_name_plural = "قراردادها و پشتیبانی SLA"


class SupportTicket(models.Model):
    client = models.ForeignKey(ClientOrganization, on_delete=models.CASCADE, related_name="tickets", null=True, blank=True, verbose_name="سازمان / مشتری")
    client_name = models.CharField(max_length=255, verbose_name="نام ثبت‌کننده")
    subject = models.CharField(max_length=255, verbose_name="موضوع تیکت پشتیبانی")
    message = models.TextField(verbose_name="متن درخواست")
    status = models.CharField(max_length=50, default="open", verbose_name="وضعیت")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت تیکت")

    def __str__(self):
        return f"تیکت: {self.subject} ({self.client_name})"

    class Meta:
        verbose_name = "تیکت پشتیبانی"
        verbose_name_plural = "تیکت‌های پشتیبانی مشتریان"


# 4. API Keys Centralized Model
class TicketReply(models.Model):
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name="replies", verbose_name="تیکت مربوطه")
    sender_name = models.CharField(max_length=255, default="پشتیبانی", verbose_name="نام فرستنده")
    is_admin = models.BooleanField(default=True, verbose_name="آیا پاسخ از طرف ادمین است؟")
    message = models.TextField(verbose_name="متن پاسخ")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت پاسخ")

    def __str__(self):
        return f"پاسخ به تیکت {self.ticket.id} توسط {self.sender_name}"

    class Meta:
        verbose_name = "پاسخ تیکت"
        verbose_name_plural = "پاسخ‌های تیکت"

class InAppNotification(models.Model):
    client = models.ForeignKey(ClientOrganization, on_delete=models.CASCADE, related_name="notifications", verbose_name="سازمان / مشتری")
    title = models.CharField(max_length=255, verbose_name="عنوان نوتیفیکیشن")
    message = models.TextField(verbose_name="متن پیام")
    is_read = models.BooleanField(default=False, verbose_name="خوانده شده")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")
    
    def __str__(self):
        return f"نوتیف برای {self.client.name} - {self.title}"
        
    class Meta:
        ordering = ['-created_at']
        verbose_name = "نوتیفیکیشن"
        verbose_name_plural = "نوتیفیکیشن‌ها"

class APIKey(models.Model):
    KEY_TYPES = (
        ('PROJECT', 'کلید اختصاصی پروژه'),
        ('ACCOUNT', 'کلید کلی حساب سازمانی'),
    )

    client = models.ForeignKey(ClientOrganization, on_delete=models.CASCADE, related_name="api_keys", verbose_name="سازمان / کاربر مالک کیف پول")
    project = models.ForeignKey('projects.ClientContractProject', on_delete=models.SET_NULL, null=True, blank=True, related_name="api_keys", verbose_name="پروژه مرتبط (اختیاری)")
    name = models.CharField(max_length=150, default="کلید API اختصاصی", verbose_name="عنوان کلید")
    key_type = models.CharField(max_length=20, choices=KEY_TYPES, default='PROJECT', verbose_name="نوع کلید")
    api_key = models.CharField(max_length=255, unique=True, verbose_name="کلید API اختصاصی")
    is_active = models.BooleanField(default=True, verbose_name="کلید فعال است")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ صدور")

    def __str__(self):
        project_label = f" - پروژه: {self.project.title}" if self.project else ""
        return f"{self.client.name}{project_label} ({self.api_key[:14]}...)"

    class Meta:
        verbose_name = "کلید API اختصاصی"
        verbose_name_plural = "مدیریت متمرکز کلیدهای API"


# 5. SMS OTP Codes
class SMSOTPCode(models.Model):
    phone = models.CharField(max_length=50, db_index=True, verbose_name="شماره تلفن همراه")
    code = models.CharField(max_length=10, verbose_name="کد ۵ رقمی OTP")
    is_used = models.BooleanField(default=False, verbose_name="استفاده گردیده")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ و زمان صدور")

    def __str__(self):
        return f"کد OTP: {self.code} برای شماره {self.phone}"

    class Meta:
        verbose_name = "کد تایید OTP"
        verbose_name_plural = "کدهای تایید OTP (ورود پیامکی)"


class SMSLog(models.Model):
    project = models.ForeignKey('projects.ClientContractProject', on_delete=models.SET_NULL, null=True, blank=True, related_name="sms_logs", verbose_name="پروژه مرتبط")
    recipient = models.CharField(max_length=50, db_index=True, verbose_name="شماره گیرنده")
    text = models.TextField(verbose_name="متن پیامک")
    operator = models.CharField(max_length=100, default="همراه اول", verbose_name="اپراتور")
    cost = models.IntegerField(default=75, verbose_name="هزینه (تومان)")
    status = models.CharField(max_length=50, default="delivered", verbose_name="وضعیت تحویل")
    sent_at = models.DateTimeField(auto_now_add=True, verbose_name="زمان ارسال")

    def __str__(self):
        proj_name = f" - پروژه: {self.project.title}" if self.project else ""
        return f"پیامک {self.recipient}{proj_name} - {self.status}"

    class Meta:
        verbose_name = "گزارش پیامک"
        verbose_name_plural = "گزارشات ارسال پیامک"

# 6. Billing & Subscription Dedicated Models
class PricingPlan(models.Model):
    name = models.CharField(max_length=150, verbose_name="نام پلن")
    monthly_price = models.IntegerField(default=0, verbose_name="هزینه ماهانه (تومان)")
    yearly_price = models.IntegerField(default=0, verbose_name="هزینه سالانه (تومان)")
    features_list = models.TextField(blank=True, verbose_name="لیست ویژگی‌ها (با خط جدید جدا شود)")
    is_active = models.BooleanField(default=True, verbose_name="پلن فعال است")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")

    def __str__(self):
        return f"{self.name} - {self.monthly_price:,} تومان در ماه"

    class Meta:
        verbose_name = "پلن قیمت‌گذاری"
        verbose_name_plural = "پلن‌های قیمت‌گذاری"

class ClientSubscription(models.Model):
    client = models.ForeignKey(ClientOrganization, on_delete=models.CASCADE, related_name="subscriptions", verbose_name="سازمان / مشتری")
    plan = models.ForeignKey(PricingPlan, on_delete=models.SET_NULL, null=True, verbose_name="پلن انتخابی")
    start_date = models.DateField(default=timezone.now, verbose_name="تاریخ شروع")
    end_date = models.DateField(verbose_name="تاریخ سررسید / انقضا")
    auto_renew = models.BooleanField(default=False, verbose_name="تمدید خودکار")
    is_active = models.BooleanField(default=True, verbose_name="اشتراک فعال است")

    def __str__(self):
        plan_name = self.plan.name if self.plan else 'بدون پلن'
    reference_id = models.CharField(max_length=100, blank=True, null=True, verbose_name="کد پیگیری تراکنش / درگاه")

    class Meta:
        verbose_name = "اشتراک مشتری"
        verbose_name_plural = "اشتراک‌های مشتریان"

class Invoice(models.Model):
    STATUS_CHOICES = (
        ('pending', 'در انتظار پرداخت'),
        ('paid', 'پرداخت شده'),
        ('cancelled', 'لغو شده'),
    )
    TYPE_CHOICES = (
        ('subscription', 'خرید / تمدید اشتراک'),
        ('wallet_recharge', 'شارژ کیف پول'),
        ('custom', 'خدمات متفرقه و اختصاصی'),
    )
    client = models.ForeignKey(ClientOrganization, on_delete=models.CASCADE, related_name="invoices", verbose_name="مشتری")
    subscription = models.ForeignKey(ClientSubscription, on_delete=models.SET_NULL, null=True, blank=True, related_name="invoices", verbose_name="بابت اشتراک")
    invoice_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='custom', verbose_name="نوع فاکتور")
    description = models.CharField(max_length=255, blank=True, null=True, verbose_name="توضیحات فاکتور")
    invoice_number = models.CharField(max_length=50, unique=True, verbose_name="شماره فاکتور")
    amount = models.IntegerField(verbose_name="مبلغ فاکتور (تومان)")
    discount_amount = models.IntegerField(default=0, verbose_name="مبلغ تخفیف (تومان)")
    tax_amount = models.IntegerField(default=0, verbose_name="مبلغ مالیات بر ارزش افزوده")
    total_amount = models.IntegerField(verbose_name="مبلغ کل پرداخت (تومان)")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="وضعیت پرداخت")
    due_date = models.DateField(verbose_name="مهلت پرداخت")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ صدور")

    def __str__(self):
        return f"فاکتور {self.invoice_number} - {self.client.name} - {self.status}"

    class Meta:
        verbose_name = "فاکتور"
        verbose_name_plural = "فاکتورهای مالی"

class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="items", verbose_name="فاکتور")
    title = models.CharField(max_length=255, verbose_name="شرح کالا / خدمات")
    quantity = models.PositiveIntegerField(default=1, verbose_name="تعداد / مقدار")
    unit_price = models.IntegerField(verbose_name="مبلغ واحد (تومان)")
    total_price = models.IntegerField(verbose_name="مبلغ کل ردیف (تومان)")

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} - {self.quantity} x {self.unit_price}"

    class Meta:
        verbose_name = "ردیف فاکتور"
        verbose_name_plural = "ردیف‌های فاکتور"

class Payment(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="payments", verbose_name="فاکتور مربوطه")
    amount = models.IntegerField(verbose_name="مبلغ پرداختی (تومان)")
    payment_method = models.CharField(max_length=50, default="کیف پول", verbose_name="روش پرداخت")
    reference_id = models.CharField(max_length=100, blank=True, null=True, verbose_name="کد پیگیری تراکنش / درگاه")
    paid_at = models.DateTimeField(auto_now_add=True, verbose_name="زمان پرداخت")

    def __str__(self):
        return f"پرداخت {self.amount:,} بابت فاکتور {self.invoice.invoice_number}"

    class Meta:
        verbose_name = "رسید پرداخت"
        verbose_name_plural = "رسیدهای پرداخت"
