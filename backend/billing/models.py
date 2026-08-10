from django.db import models

from accounts.models import Organization


class Wallet(models.Model):
    client = models.OneToOneField(
        Organization,
        on_delete=models.CASCADE,
        related_name="wallet",
        verbose_name="سازمان / مشتری",
    )
    balance = models.IntegerField(default=0, verbose_name="موجودی کیف پول (تومان)")
    is_active = models.BooleanField(default=True, verbose_name="کیف پول فعال است")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="آخرین بروزرسانی")

    def __str__(self):
        return f"کیف پول {self.client.name}: {self.balance:,} تومان"

    class Meta:
        db_table = "portal_wallet"
        verbose_name = "کیف پول"
        verbose_name_plural = "کیف پول سازمان‌ها"


class WalletTransaction(models.Model):
    STATUS_CHOICES = (
        ("PENDING", "در انتظار"),
        ("FINAL", "قطعی"),
        ("REVERSED", "برگشت‌خورده"),
    )

    wallet = models.ForeignKey(
        Wallet,
        on_delete=models.CASCADE,
        related_name="transactions",
        null=True,
        blank=True,
        verbose_name="کیف پول",
    )
    invoice = models.ForeignKey(
        "Invoice",
        on_delete=models.SET_NULL,
        related_name="wallet_transactions",
        null=True,
        blank=True,
        verbose_name="فاکتور مرتبط",
    )
    project = models.ForeignKey(
        "projects.ClientContractProject",
        on_delete=models.SET_NULL,
        related_name="wallet_transactions",
        null=True,
        blank=True,
        verbose_name="پروژه مرتبط",
    )
    transaction_type = models.CharField(max_length=50, verbose_name="نوع تراکنش")
    amount = models.IntegerField(verbose_name="مبلغ تراکنش (تومان)")
    balance_before = models.IntegerField(null=True, blank=True, verbose_name="موجودی قبل")
    balance_after = models.IntegerField(null=True, blank=True, verbose_name="موجودی بعد")
    idempotency_key = models.CharField(
        max_length=160,
        unique=True,
        null=True,
        blank=True,
        verbose_name="کلید یکتایی عملیات",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="FINAL", verbose_name="وضعیت")
    description = models.CharField(max_length=255, verbose_name="توضیحات تراکنش")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ تراکنش")

    def __str__(self):
        organization = self.wallet.client.name if self.wallet else ""
        return f"تراکنش {organization} - {self.amount:,} تومان"

    class Meta:
        db_table = "portal_wallettransaction"
        verbose_name = "تراکنش کیف پول"
        verbose_name_plural = "تراکنش‌های کیف پول"


class Invoice(models.Model):
    STATUS_CHOICES = (
        ("pending", "در انتظار پرداخت"),
        ("paid", "پرداخت شده"),
        ("cancelled", "لغو شده"),
    )
    TYPE_CHOICES = (
        ("subscription", "خرید / تمدید سرویس"),
        ("wallet_recharge", "شارژ کیف پول"),
        ("custom", "خدمات متفرقه و اختصاصی"),
    )

    client = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="invoices", verbose_name="مشتری")
    project = models.ForeignKey(
        "projects.ClientContractProject",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invoices",
        verbose_name="پروژه مرتبط",
    )
    subscription = models.ForeignKey(
        "subscriptions.ClientSubscription",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invoices",
        verbose_name="قرارداد سرویس مرتبط",
    )
    invoice_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default="custom", verbose_name="نوع فاکتور")
    description = models.CharField(max_length=255, blank=True, null=True, verbose_name="توضیحات فاکتور")
    invoice_number = models.CharField(max_length=50, unique=True, verbose_name="شماره فاکتور")
    amount = models.IntegerField(verbose_name="مبلغ فاکتور (تومان)")
    discount_amount = models.IntegerField(default=0, verbose_name="مبلغ تخفیف (تومان)")
    tax_amount = models.IntegerField(default=0, verbose_name="مالیات (تومان)")
    total_amount = models.IntegerField(verbose_name="مبلغ نهایی (تومان)")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending", verbose_name="وضعیت پرداخت")
    due_date = models.DateField(verbose_name="مهلت پرداخت")
    paid_at = models.DateTimeField(null=True, blank=True, verbose_name="زمان تسویه")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ صدور")

    def __str__(self):
        return f"فاکتور {self.invoice_number} - {self.client.name} - {self.status}"

    class Meta:
        db_table = "portal_invoice"
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
        db_table = "portal_invoiceitem"
        verbose_name = "ردیف فاکتور"
        verbose_name_plural = "ردیف‌های فاکتور"


class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = (
        ("GATEWAY", "درگاه پرداخت"),
        ("WALLET", "کیف پول"),
        ("BANK", "کارت / حواله بانکی"),
    )
    STATUS_CHOICES = (
        ("PENDING", "در انتظار"),
        ("SUCCESS", "موفق"),
        ("REFUNDED", "برگشت‌خورده"),
    )

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="payments", verbose_name="فاکتور مربوطه")
    amount = models.IntegerField(verbose_name="مبلغ پرداختی (تومان)")
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, default="GATEWAY", verbose_name="روش پرداخت")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="SUCCESS", verbose_name="وضعیت پرداخت")
    reference_id = models.CharField(max_length=180, blank=True, null=True, db_index=True, verbose_name="کد پیگیری تراکنش / درگاه")
    idempotency_key = models.CharField(max_length=200, unique=True, null=True, blank=True, verbose_name="کلید یکتایی عملیات")
    paid_at = models.DateTimeField(auto_now_add=True, verbose_name="زمان پرداخت")

    def __str__(self):
        return f"پرداخت {self.amount:,} بابت فاکتور {self.invoice.invoice_number}"

    class Meta:
        db_table = "portal_payment"
        verbose_name = "رسید پرداخت"
        verbose_name_plural = "رسیدهای پرداخت"
