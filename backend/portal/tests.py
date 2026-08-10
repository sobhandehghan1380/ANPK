from datetime import timedelta

from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.core.cache import cache
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase

from accounts.models import Organization as ClientOrganization
from accounts.models import OrganizationMembership as ClientMember
from accounts.models import SMSOTPCode
from billing.models import (
    Invoice,
    InvoiceItem,
    Payment,
    Wallet,
    WalletTransaction,
)
from integrations.models import APIKey, SMSLog
from projects.models import ClientContractProject
from subscriptions.models import ClientSubscription, PricingPlan
from support.models import InAppNotification, SLASupportContract, SupportTicket, TicketReply


User = get_user_model()


class PortalDomainBoundaryTests(APITestCase):
    def test_portal_has_no_admin_owned_models(self):
        portal_models = [model for model in admin.site._registry if model._meta.app_label == 'portal']
        self.assertEqual(portal_models, [])

    def test_domain_models_keep_historical_tables(self):
        expected = {
            Wallet: ('billing', 'portal_wallet'),
            WalletTransaction: ('billing', 'portal_wallettransaction'),
            PricingPlan: ('subscriptions', 'portal_pricingplan'),
            ClientSubscription: ('subscriptions', 'portal_clientsubscription'),
            Invoice: ('billing', 'portal_invoice'),
            InvoiceItem: ('billing', 'portal_invoiceitem'),
            Payment: ('billing', 'portal_payment'),
            SLASupportContract: ('support', 'portal_slasupportcontract'),
            SupportTicket: ('support', 'portal_supportticket'),
            TicketReply: ('support', 'portal_ticketreply'),
            InAppNotification: ('support', 'portal_inappnotification'),
            APIKey: ('integrations', 'portal_apikey'),
            SMSLog: ('integrations', 'portal_smslog'),
        }
        inline_only_models = {InvoiceItem, TicketReply}
        for model, (app_label, table_name) in expected.items():
            with self.subTest(model=model.__name__):
                self.assertEqual(model._meta.app_label, app_label)
                self.assertEqual(model._meta.db_table, table_name)
                if model not in inline_only_models:
                    self.assertIn(model, admin.site._registry)


@override_settings(PAYMENT_MOCK_ENABLED=True, FRONTEND_URL='http://testserver')
class PortalSecurityTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='client_09120000000')
        self.organization = ClientOrganization.objects.create(
            name='Test Organization',
            contact_person='Test Owner',
            phone='09120000000',
        )
        self.member = ClientMember.objects.create(
            organization=self.organization,
            user=self.user,
            phone='09120000000',
            full_name='Test Owner',
            role='OWNER',
        )
        self.wallet = Wallet.objects.create(client=self.organization, balance=0)
        self.project = ClientContractProject.objects.create(
            client=self.organization,
            title='Test Contract Project',
            slug='test-contract-project',
        )
        self.client.force_authenticate(self.user)

    def test_overview_identifies_the_authenticated_member(self):
        response = self.client.get('/api/v1/portal/overview/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['member']['name'], 'Test Owner')
        self.assertEqual(response.data['member']['phone'], '09120000000')
        self.assertEqual(response.data['member']['role'], 'OWNER')
        self.assertEqual(response.data['member']['role_label'], 'مالک سازمان')
        self.assertEqual(response.data['member']['organization_name'], 'Test Organization')

    def test_notifications_return_iso_dates_and_can_be_marked_as_read(self):
        notification = InAppNotification.objects.create(
            client=self.organization,
            title='Contract updated',
            message='Your contract was updated.',
        )

        listed = self.client.get('/api/v1/portal/client/notifications/')
        self.assertEqual(listed.status_code, 200)
        self.assertEqual(listed.data[0]['id'], notification.id)
        self.assertIn('T', listed.data[0]['created_at'])

        marked = self.client.post(
            '/api/v1/portal/client/notifications/',
            {'id': notification.id},
            format='json',
        )
        self.assertEqual(marked.status_code, 200)
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)

    def test_wallet_recharge_requires_verified_payment(self):
        response = self.client.post('/api/v1/portal/wallet/', {'amount': 50000}, format='json')
        self.assertEqual(response.status_code, 200)
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.balance, 0)

        invoice = Invoice.objects.get(id=response.data['invoice_id'])
        self.assertEqual(invoice.status, 'pending')
        self.assertIsNone(invoice.project_id)

        verification = self.client.post('/api/v1/portal/client/finance/payment/verify/', {
            'invoice_id': invoice.id,
            'authority': response.data['authority'],
            'status': 'OK',
        }, format='json')
        self.assertEqual(verification.status_code, 200)
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.balance, 50000)

        repeated = self.client.post('/api/v1/portal/client/finance/payment/verify/', {
            'invoice_id': invoice.id,
            'authority': response.data['authority'],
            'status': 'OK',
        }, format='json')
        self.assertEqual(repeated.status_code, 200)
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.balance, 50000)

    def test_owner_can_pay_service_invoice_from_wallet_but_not_recharge_invoice(self):
        self.wallet.balance = 300000
        self.wallet.save(update_fields=['balance'])
        service_invoice = Invoice.objects.create(
            client=self.organization,
            project=self.project,
            invoice_type='custom',
            invoice_number='PORTAL-SERVICE-1',
            amount=120000,
            total_amount=120000,
            due_date=timezone.localdate() + timedelta(days=7),
        )

        paid = self.client.post(
            '/api/v1/portal/client/finance/payment/wallet/',
            {'invoice_id': service_invoice.id},
            format='json',
        )
        self.assertEqual(paid.status_code, 200)
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.balance, 180000)

        recharge_invoice = Invoice.objects.create(
            client=self.organization,
            invoice_type='wallet_recharge',
            invoice_number='PORTAL-RECHARGE-1',
            amount=50000,
            total_amount=50000,
            due_date=timezone.localdate() + timedelta(days=1),
        )
        rejected = self.client.post(
            '/api/v1/portal/client/finance/payment/wallet/',
            {'invoice_id': recharge_invoice.id},
            format='json',
        )
        self.assertEqual(rejected.status_code, 400)
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.balance, 180000)

    def test_api_key_is_only_returned_in_full_once(self):
        created = self.client.post('/api/v1/portal/api-keys/', {
            'name': 'integration',
            'project_id': self.project.id,
        }, format='json')
        self.assertEqual(created.status_code, 200)
        self.assertTrue(created.data['api_key'].startswith('anpk_live_'))

        listed = self.client.get('/api/v1/portal/api-keys/')
        self.assertEqual(listed.status_code, 200)
        self.assertIn('...', listed.data[0]['api_key'])
        self.assertNotEqual(listed.data[0]['api_key'], created.data['api_key'])
        self.assertEqual(listed.data[0]['project_id'], self.project.id)

    def test_ticket_creation_requires_an_owned_project(self):
        missing_project = self.client.post('/api/v1/portal/client/tickets/', {
            'subject': 'Subject',
            'message': 'Message',
        }, format='json')
        self.assertEqual(missing_project.status_code, 400)

        created = self.client.post('/api/v1/portal/client/tickets/', {
            'project_id': self.project.id,
            'subject': 'Subject',
            'message': 'Message',
        }, format='json')
        self.assertEqual(created.status_code, 200)
        ticket = SupportTicket.objects.get(id=created.data['id'])
        self.assertEqual(ticket.project_id, self.project.id)
        self.assertEqual(ticket.client_id, self.organization.id)

    def test_sla_is_exposed_through_its_project_subscription(self):
        subscription = ClientSubscription.objects.create(
            client=self.organization,
            project=self.project,
            status='active',
            end_date=timezone.localdate() + timedelta(days=365),
        )
        contract = SLASupportContract.objects.create(
            client=self.organization,
            project=self.project,
            subscription=subscription,
            response_time_minutes=20,
            resolution_time_hours=3,
        )

        response = self.client.get('/api/v1/portal/sla-contracts/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]['id'], contract.id)
        self.assertEqual(response.data[0]['project_id'], self.project.id)
        self.assertEqual(response.data[0]['subscription_id'], subscription.id)


class AdminOrganizationOwnershipTests(APITestCase):
    def setUp(self):
        self.staff = User.objects.create_user(username='organization-admin', is_staff=True)
        self.client.force_authenticate(self.staff)

    def test_admin_create_uses_owner_membership_as_source_of_truth(self):
        response = self.client.post('/api/v1/admin/clients/', {
            'name': 'Membership Organization',
            'contact_person': 'Membership Owner',
            'phone': '09127770000',
        }, format='json')

        self.assertEqual(response.status_code, 200)
        organization = ClientOrganization.objects.get(pk=response.data['id'])
        owner = organization.members.get(role='OWNER', is_active=True)
        self.assertEqual(owner.phone, '09127770000')

        list_response = self.client.get('/api/v1/admin/clients/')
        organization_data = next(item for item in list_response.data if item['id'] == organization.id)
        self.assertEqual(organization_data['owner_user_id'], owner.user_id)
        self.assertEqual(organization_data['owner_username'], owner.user.username)


class ProjectCommercialStructureTests(APITestCase):
    def setUp(self):
        self.staff = User.objects.create_user(username='finance-admin', is_staff=True)
        self.organization = ClientOrganization.objects.create(
            name='Commercial Organization',
            contact_person='Commercial Owner',
            phone='09123334444',
        )
        self.project = ClientContractProject.objects.create(
            client=self.organization,
            title='Commercial Project',
            slug='commercial-project',
        )
        self.plan = PricingPlan.objects.create(
            name='Enterprise',
            monthly_price=1000000,
        )
        self.client.force_authenticate(self.staff)

    def test_subscription_sla_and_invoice_follow_the_project(self):
        subscription_response = self.client.post('/api/v1/admin/finance/subscriptions/', {
            'action': 'create_subscription',
            'project_id': self.project.id,
            'plan_id': self.plan.id,
            'months': 12,
        }, format='json')
        self.assertEqual(subscription_response.status_code, 200)
        subscription = ClientSubscription.objects.get(id=subscription_response.data['id'])
        self.assertEqual(subscription.project_id, self.project.id)
        self.assertEqual(subscription.client_id, self.organization.id)

        sla_response = self.client.post('/api/v1/admin/sla-contracts/', {
            'subscription_id': subscription.id,
            'plan_name': 'SLA Enterprise',
            'response_time_minutes': 15,
            'resolution_time_hours': 2,
            'availability_percentage': '99.95',
        }, format='json')
        self.assertEqual(sla_response.status_code, 200)
        contract = SLASupportContract.objects.get(id=sla_response.data['id'])
        self.assertEqual(contract.subscription_id, subscription.id)
        self.assertEqual(contract.project_id, self.project.id)
        self.assertEqual(contract.client_id, self.organization.id)

        invoice = Invoice.objects.get(id=subscription_response.data['invoice_id'])
        self.assertEqual(invoice.project_id, self.project.id)
        self.assertEqual(invoice.client_id, self.organization.id)
        self.assertEqual(invoice.status, 'pending')
        self.assertEqual(invoice.service_period.months, 12)

    def test_canceling_service_contract_cancels_its_unpaid_period_and_invoice(self):
        created = self.client.post('/api/v1/admin/finance/subscriptions/', {
            'action': 'create_subscription',
            'project_id': self.project.id,
            'plan_id': self.plan.id,
            'months': 2,
        }, format='json')
        self.assertEqual(created.status_code, 200)

        canceled = self.client.post('/api/v1/admin/finance/subscriptions/', {
            'action': 'cancel_subscription',
            'subscription_id': created.data['id'],
            'reason': 'test cancellation',
        }, format='json')
        self.assertEqual(canceled.status_code, 200)

        subscription = ClientSubscription.objects.get(id=created.data['id'])
        invoice = Invoice.objects.get(id=created.data['invoice_id'])
        self.assertEqual(subscription.status, 'canceled')
        self.assertEqual(invoice.status, 'cancelled')
        self.assertEqual(invoice.service_period.status, 'CANCELED')


@override_settings(DEBUG=True, OTP_TTL_SECONDS=300)
class OTPTests(APITestCase):
    def setUp(self):
        user = User.objects.create_user(username='client_09121111111')
        organization = ClientOrganization.objects.create(
            name='OTP Organization',
            contact_person='OTP Owner',
            phone='09121111111',
        )
        ClientMember.objects.create(
            organization=organization,
            user=user,
            phone='09121111111',
            full_name='OTP Owner',
            role='OWNER',
        )

    def test_expired_otp_is_rejected(self):
        otp = SMSOTPCode.objects.create(phone='09121111111', code=make_password('12345'))
        SMSOTPCode.objects.filter(id=otp.id).update(created_at=timezone.now() - timedelta(minutes=10))

        response = self.client.post('/api/v1/portal/auth/verify-otp/', {
            'phone': '09121111111',
            'code': '12345',
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_sent_otp_is_hashed(self):
        response = self.client.post('/api/v1/portal/auth/send-otp/', {'phone': '09121111111'}, format='json')
        self.assertEqual(response.status_code, 200)
        otp = SMSOTPCode.objects.latest('created_at')
        development_code = cache.get(f'portal:otp:development:{otp.pk}')
        self.assertIsNotNone(development_code)
        self.assertNotEqual(otp.code, development_code)
        self.assertNotIn('demo_code', response.data)

        verified = self.client.post('/api/v1/portal/auth/verify-otp/', {
            'phone': '09121111111',
            'code': development_code,
        }, format='json')
        self.assertEqual(verified.status_code, 200)
        self.assertIsNone(cache.get(f'portal:otp:development:{otp.pk}'))
