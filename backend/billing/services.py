import calendar
import uuid
from dataclasses import dataclass
from datetime import date, timedelta

from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from subscriptions.models import ClientSubscription, PricingPlanVersion, SubscriptionPeriod

from .models import Invoice, InvoiceItem, Payment, Wallet, WalletTransaction


class BillingError(Exception):
    """A business-rule error that can safely be shown to an API client."""


class InsufficientWalletBalance(BillingError):
    pass


class InvalidPaymentMethod(BillingError):
    pass


@dataclass(frozen=True)
class SettlementResult:
    invoice: Invoice
    payment: Payment | None
    wallet_transaction: WalletTransaction | None
    already_paid: bool


def add_calendar_months(value: date, months: int) -> date:
    """Add calendar months without approximating a month as 30 days."""
    month_index = value.month - 1 + months
    year = value.year + month_index // 12
    month = month_index % 12 + 1
    day = min(value.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


def _price_for(subscription: ClientSubscription, period_start: date):
    if subscription.is_custom_plan:
        if subscription.service_type == "HOSTING":
            price = subscription.custom_server_cost or subscription.custom_monthly_price
        elif subscription.service_type in {"SUPPORT", "MAINTENANCE"}:
            price = subscription.custom_support_cost or subscription.custom_monthly_price
        else:
            price = subscription.custom_monthly_price
        return max(int(price), 0), None

    if not subscription.plan_id:
        raise BillingError("برای این قرارداد سرویس، پلن یا قیمت اختصاصی تعریف نشده است.")

    price_version = (
        PricingPlanVersion.objects.filter(
            plan_id=subscription.plan_id,
            effective_from__lte=period_start,
        )
        .filter(Q(effective_to__isnull=True) | Q(effective_to__gte=period_start))
        .order_by("-effective_from", "-id")
        .first()
    )
    if price_version:
        return int(price_version.monthly_price), price_version

    plan = subscription.plan
    if subscription.service_type == "HOSTING":
        price = plan.server_cost or plan.monthly_price
    elif subscription.service_type in {"SUPPORT", "MAINTENANCE"}:
        price = plan.support_cost or plan.monthly_price
    else:
        price = plan.monthly_price
    return max(int(price), 0), None


@transaction.atomic
def create_renewal_invoice(
    subscription: ClientSubscription,
    months: int,
    *,
    discount_amount: int = 0,
    tax_amount: int = 0,
    period_start: date | None = None,
    due_days: int = 7,
) -> tuple[Invoice, SubscriptionPeriod]:
    """Create an unpaid invoice and immutable priced service period."""
    try:
        months = int(months)
        discount_amount = int(discount_amount)
        tax_amount = int(tax_amount)
    except (TypeError, ValueError) as exc:
        raise BillingError("مقادیر مالی یا تعداد ماه معتبر نیست.") from exc

    if not 1 <= months <= 36:
        raise BillingError("مدت تمدید باید بین ۱ تا ۳۶ ماه باشد.")
    if discount_amount < 0 or tax_amount < 0:
        raise BillingError("تخفیف و مالیات نمی‌توانند منفی باشند.")

    subscription = (
        ClientSubscription.objects.select_for_update()
        .select_related("plan", "project", "client")
        .get(pk=subscription.pk)
    )
    if not subscription.project_id:
        raise BillingError("قرارداد سرویس باید به یک پروژه متصل باشد.")
    if subscription.status == "canceled":
        raise BillingError("برای قرارداد لغوشده امکان صدور تمدید وجود ندارد.")
    if subscription.periods.filter(status="INVOICED", invoice__status="pending").exists():
        raise BillingError("یک فاکتور تمدید پرداخت‌نشده برای این قرارداد وجود دارد.")

    today = timezone.localdate()
    start_date = period_start or max(subscription.end_date, today)
    if start_date < today and period_start is not None:
        raise BillingError("شروع دوره تمدید نمی‌تواند در گذشته باشد.")
    end_date = add_calendar_months(start_date, months)
    monthly_price, price_version = _price_for(subscription, start_date)
    subtotal = monthly_price * months
    if discount_amount > subtotal + tax_amount:
        raise BillingError("تخفیف از مبلغ قابل پرداخت بیشتر است.")
    total_amount = subtotal - discount_amount + tax_amount

    service_label = dict(subscription._meta.get_field("service_type").choices).get(
        subscription.service_type,
        "سرویس",
    )
    invoice = Invoice.objects.create(
        client=subscription.client,
        project=subscription.project,
        subscription=subscription,
        invoice_type="subscription",
        description=f"تمدید {service_label} پروژه {subscription.project.title} برای {months} ماه",
        invoice_number=f"INV-SVC-{timezone.now():%Y%m%d}-{uuid.uuid4().hex[:8].upper()}",
        amount=subtotal,
        discount_amount=discount_amount,
        tax_amount=tax_amount,
        total_amount=total_amount,
        due_date=today + timedelta(days=max(int(due_days), 0)),
    )
    InvoiceItem.objects.create(
        invoice=invoice,
        title=f"{service_label} - {start_date} تا {end_date}",
        quantity=months,
        unit_price=monthly_price,
        total_price=subtotal,
    )
    period = SubscriptionPeriod.objects.create(
        subscription=subscription,
        price_version=price_version,
        invoice=invoice,
        months=months,
        start_date=start_date,
        end_date=end_date,
        monthly_unit_price=monthly_price,
        subtotal=subtotal,
        discount_amount=discount_amount,
        tax_amount=tax_amount,
        total_amount=total_amount,
        status="INVOICED",
    )
    return invoice, period


def _existing_successful_payment(invoice: Invoice, idempotency_key: str | None):
    payments = invoice.payments.filter(status="SUCCESS")
    if idempotency_key:
        payment = payments.filter(idempotency_key=idempotency_key).first()
        if payment:
            return payment
    return payments.order_by("paid_at", "id").first()


@transaction.atomic
def settle_invoice(
    invoice: Invoice | int,
    *,
    payment_method: str,
    reference_id: str | None = None,
    idempotency_key: str | None = None,
) -> SettlementResult:
    """Settle an invoice exactly once and apply its wallet/service side effects."""
    invoice_id = invoice.pk if isinstance(invoice, Invoice) else int(invoice)
    invoice = Invoice.objects.select_for_update().select_related("client", "project", "subscription").get(pk=invoice_id)
    payment_method = str(payment_method).upper()

    if payment_method not in {"GATEWAY", "WALLET", "BANK"}:
        raise InvalidPaymentMethod("روش پرداخت معتبر نیست.")
    if invoice.status == "cancelled":
        raise BillingError("فاکتور لغوشده قابل پرداخت نیست.")
    if invoice.status == "paid":
        return SettlementResult(
            invoice=invoice,
            payment=_existing_successful_payment(invoice, idempotency_key),
            wallet_transaction=None,
            already_paid=True,
        )
    if invoice.total_amount < 0:
        raise BillingError("مبلغ فاکتور نامعتبر است.")
    if payment_method == "WALLET" and invoice.invoice_type == "wallet_recharge":
        raise InvalidPaymentMethod("فاکتور شارژ کیف پول باید از درگاه یا واریز بانکی پرداخت شود.")

    wallet_transaction = None
    if payment_method == "WALLET":
        Wallet.objects.get_or_create(client=invoice.client, defaults={"balance": 0})
        wallet = Wallet.objects.select_for_update().get(client=invoice.client)
        if not wallet.is_active:
            raise BillingError("کیف پول سازمان غیرفعال است.")
        if wallet.balance < invoice.total_amount:
            raise InsufficientWalletBalance("موجودی کیف پول برای پرداخت این فاکتور کافی نیست.")
        before = wallet.balance
        wallet.balance -= invoice.total_amount
        wallet.save(update_fields=["balance", "updated_at"])
        wallet_transaction = WalletTransaction.objects.create(
            wallet=wallet,
            invoice=invoice,
            project=invoice.project,
            transaction_type="INVOICE_PAYMENT",
            amount=invoice.total_amount,
            balance_before=before,
            balance_after=wallet.balance,
            idempotency_key=f"{idempotency_key}:wallet" if idempotency_key else None,
            status="FINAL",
            description=f"پرداخت فاکتور {invoice.invoice_number} از کیف پول",
        )

    payment = Payment.objects.create(
        invoice=invoice,
        amount=invoice.total_amount,
        payment_method=payment_method,
        status="SUCCESS",
        reference_id=reference_id,
        idempotency_key=idempotency_key,
    )
    invoice.status = "paid"
    invoice.paid_at = timezone.now()
    invoice.save(update_fields=["status", "paid_at"])

    if invoice.invoice_type == "wallet_recharge":
        Wallet.objects.get_or_create(client=invoice.client, defaults={"balance": 0})
        wallet = Wallet.objects.select_for_update().get(client=invoice.client)
        before = wallet.balance
        wallet.balance += invoice.total_amount
        wallet.save(update_fields=["balance", "updated_at"])
        wallet_transaction = WalletTransaction.objects.create(
            wallet=wallet,
            invoice=invoice,
            project=invoice.project,
            transaction_type="CHARGE",
            amount=invoice.total_amount,
            balance_before=before,
            balance_after=wallet.balance,
            idempotency_key=f"{idempotency_key}:wallet" if idempotency_key else None,
            status="FINAL",
            description=f"شارژ کیف پول با فاکتور {invoice.invoice_number}",
        )

    period = SubscriptionPeriod.objects.select_for_update().filter(invoice=invoice).first()
    if period and period.status != "ACTIVE":
        period.status = "ACTIVE"
        period.activated_at = timezone.now()
        period.save(update_fields=["status", "activated_at"])

        subscription = ClientSubscription.objects.select_for_update().get(pk=period.subscription_id)
        subscription.start_date = min(subscription.start_date, period.start_date)
        subscription.end_date = max(subscription.end_date, period.end_date)
        subscription.status = "active"
        subscription.save(update_fields=["start_date", "end_date", "status"])

    return SettlementResult(
        invoice=invoice,
        payment=payment,
        wallet_transaction=wallet_transaction,
        already_paid=False,
    )
