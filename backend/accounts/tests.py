from django.contrib.auth import get_user_model
from django.contrib import admin
from django.urls import resolve
from rest_framework.test import APITestCase

from .models import Organization, OrganizationMembership, SMSOTPCode, UserProfile

from .selectors import get_current_member
from .services import ensure_owner_membership
from .views import client_members


User = get_user_model()


class AccountsBoundaryTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="client_09120000001")
        self.organization = Organization.objects.create(
            name="Accounts Test Organization",
            contact_person="Accounts Owner",
            phone="09120000001",
        )
        self.member = OrganizationMembership.objects.create(
            organization=self.organization,
            user=self.user,
            phone="09120000001",
            full_name="Accounts Owner",
            role="OWNER",
        )

    def test_existing_member_url_is_owned_by_accounts_app(self):
        match = resolve("/api/v1/portal/client/members/")
        self.assertEqual(match.func, client_members)

    def test_selector_resolves_authenticated_membership(self):
        self.client.force_authenticate(self.user)
        request = self.client.get("/api/v1/portal/client/members/").wsgi_request
        request.user = self.user
        self.assertEqual(get_current_member(request), self.member)

    def test_owner_service_creates_owner_membership(self):
        second_organization = Organization.objects.create(
            name="Second Organization",
            contact_person="Second Owner",
            phone="09120000002",
        )
        membership = ensure_owner_membership(
            second_organization,
            "09120000002",
            "Second Owner",
        )

        self.assertEqual(membership.role, "OWNER")
        self.assertEqual(membership.organization, second_organization)

    def test_identity_models_belong_to_accounts_without_renaming_tables(self):
        expected_tables = {
            UserProfile: "portal_userprofile",
            Organization: "portal_clientorganization",
            OrganizationMembership: "portal_clientmember",
            SMSOTPCode: "portal_smsotpcode",
        }

        for model, table_name in expected_tables.items():
            with self.subTest(model=model.__name__):
                self.assertEqual(model._meta.app_label, "accounts")
                self.assertEqual(model._meta.db_table, table_name)

    def test_accounts_models_are_registered_in_admin(self):
        for model in (UserProfile, Organization, OrganizationMembership, SMSOTPCode):
            with self.subTest(model=model.__name__):
                self.assertIn(model, admin.site._registry)
