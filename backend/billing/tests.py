from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from accounts.models import Organization
from billing.models import Invoice, Payment, Wallet, WalletTransaction
from billing.services import InvalidPaymentMethod, create_renewal_invoice, settle_invoice
from projects.models import ClientContractProject
from subscriptions.models import ClientSubscription, PricingPlan, PricingPlanVersion


class BillingSettlementTests(TestCase):
    def setUp(self):
        self.organization = Organization.objects.create(
            name="Billing Organization",
            contact_person="Owner",
            phone="09120000001",
        )
        self.project = ClientContractProject.objects.create(
            client=self.organization,
            title="Billing Project",
            slug="billing-project",
        )
        self.wallet = Wallet.objects.create(client=self.organization, balance=1_000_000)

    def make_invoice(self, invoice_type="custom", amount=250_000):
        return Invoice.objects.create(
            client=self.organization,
            project=self.project,
            invoice_type=invoice_type,
            invoice_number=f"TEST-{invoice_type}-{Invoice.objects.count()}",
            amount=amount,
            total_amount=amount,
            due_date=timezone.localdate() + timedelta(days=7),
        )

    def test_service_invoice_can_be_paid_from_wallet_exactly_once(self):
        invoice = self.make_invoice()

        first = settle_invoice(
            invoice,
            payment_method="WALLET",
            reference_id="WALLET-1",
            idempotency_key="test-wallet-payment-1",
        )
        second = settle_invoice(
            invoice,
            payment_method="WALLET",
            reference_id="WALLET-1",
            idempotency_key="test-wallet-payment-1",
        )

        self.wallet.refresh_from_db()
        invoice.refresh_from_db()
        self.assertEqual(self.wallet.balance, 750_000)
        self.assertEqual(invoice.status, "paid")
        self.assertIsNotNone(invoice.paid_at)
        self.assertFalse(first.already_paid)
        self.assertTrue(second.already_paid)
        self.assertEqual(Payment.objects.filter(invoice=invoice).count(), 1)
        transaction = WalletTransaction.objects.get(invoice=invoice)
        self.assertEqual(transaction.transaction_type, "INVOICE_PAYMENT")
        self.assertEqual(transaction.balance_before, 1_000_000)
        self.assertEqual(transaction.balance_after, 750_000)

    def test_wallet_recharge_cannot_be_paid_by_wallet(self):
        invoice = self.make_invoice(invoice_type="wallet_recharge")
        with self.assertRaises(InvalidPaymentMethod):
            settle_invoice(invoice, payment_method="WALLET", idempotency_key="circular-recharge")

        self.wallet.refresh_from_db()
        invoice.refresh_from_db()
        self.assertEqual(self.wallet.balance, 1_000_000)
        self.assertEqual(invoice.status, "pending")

    def test_external_wallet_recharge_credits_wallet_once(self):
        invoice = self.make_invoice(invoice_type="wallet_recharge", amount=400_000)

        settle_invoice(
            invoice,
            payment_method="GATEWAY",
            reference_id="GATEWAY-RECHARGE",
            idempotency_key="gateway-recharge-1",
        )
        settle_invoice(
            invoice,
            payment_method="GATEWAY",
            reference_id="GATEWAY-RECHARGE",
            idempotency_key="gateway-recharge-1",
        )

        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.balance, 1_400_000)
        self.assertEqual(WalletTransaction.objects.filter(invoice=invoice).count(), 1)
        self.assertEqual(Payment.objects.filter(invoice=invoice).count(), 1)

    def test_direct_gateway_payment_does_not_touch_wallet(self):
        invoice = self.make_invoice(amount=300_000)
        settle_invoice(
            invoice,
            payment_method="GATEWAY",
            reference_id="GATEWAY-SERVICE",
            idempotency_key="gateway-service-1",
        )
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.balance, 1_000_000)
        self.assertFalse(WalletTransaction.objects.filter(invoice=invoice).exists())


class SubscriptionRenewalTests(TestCase):
    def setUp(self):
        self.today = timezone.localdate()
        self.organization = Organization.objects.create(
            name="Renewal Organization",
            contact_person="Owner",
            phone="09120000002",
        )
        self.project = ClientContractProject.objects.create(
            client=self.organization,
            title="Renewal Project",
            slug="renewal-project",
        )
        self.plan = PricingPlan.objects.create(
            name="Managed Support",
            service_type="SUPPORT",
            monthly_price=100_000,
            support_cost=100_000,
        )
        PricingPlanVersion.objects.create(
            plan=self.plan,
            effective_from=self.today,
            monthly_price=100_000,
        )
        self.subscription = ClientSubscription.objects.create(
            client=self.organization,
            project=self.project,
            plan=self.plan,
            service_type="SUPPORT",
            start_date=self.today,
            end_date=self.today,
            status="past_due",
        )

    def test_payment_activates_exact_calendar_period_and_future_price(self):
        first_invoice, first_period = create_renewal_invoice(self.subscription, 1)
        self.assertEqual(first_invoice.total_amount, 100_000)
        self.assertEqual(first_period.monthly_unit_price, 100_000)
        self.assertEqual(first_period.end_date.month, (self.today.month % 12) + 1)
        self.assertEqual(self.subscription.end_date, self.today)

        settle_invoice(
            first_invoice,
            payment_method="BANK",
            reference_id="BANK-FIRST",
            idempotency_key="bank-first-period",
        )
        self.subscription.refresh_from_db()
        first_period.refresh_from_db()
        self.assertEqual(first_period.status, "ACTIVE")
        self.assertEqual(self.subscription.end_date, first_period.end_date)
        self.assertEqual(self.subscription.status, "active")

        PricingPlanVersion.objects.filter(plan=self.plan, effective_to__isnull=True).update(
            effective_to=first_period.end_date - timedelta(days=1)
        )
        new_version = PricingPlanVersion.objects.create(
            plan=self.plan,
            effective_from=first_period.end_date,
            monthly_price=150_000,
        )
        second_invoice, second_period = create_renewal_invoice(self.subscription, 3)

        first_period.refresh_from_db()
        self.assertEqual(first_period.monthly_unit_price, 100_000)
        self.assertEqual(second_period.price_version_id, new_version.id)
        self.assertEqual(second_period.start_date, first_period.end_date)
        self.assertEqual(second_period.monthly_unit_price, 150_000)
        self.assertEqual(second_invoice.total_amount, 450_000)
        self.subscription.refresh_from_db()
        self.assertEqual(self.subscription.end_date, first_period.end_date)

