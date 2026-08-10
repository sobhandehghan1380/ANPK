from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import ProjectLead
from accounts.models import OrganizationMembership


class LeadPermissionTests(APITestCase):
    def test_public_can_create_but_cannot_list_or_manage_leads(self):
        forbidden_list = self.client.get('/api/v1/leads/submit/')
        self.assertEqual(forbidden_list.status_code, 403)

        created = self.client.post('/api/v1/leads/submit/', {
            'company_name': 'Public Company',
            'contact_person': 'Public User',
            'phone': '09123333333',
            'service_type': 'Web',
            'budget_range': 'Unknown',
        }, format='json')
        self.assertEqual(created.status_code, 201)
        lead = ProjectLead.objects.get()

        forbidden_update = self.client.post('/api/v1/leads/submit/', {
            'action': 'update_status',
            'lead_id': lead.id,
            'status': 'contract',
        }, format='json')
        self.assertEqual(forbidden_update.status_code, 403)

    def test_staff_can_list_leads(self):
        staff = get_user_model().objects.create_user(username='staff', is_staff=True)
        self.client.force_authenticate(staff)
        response = self.client.get('/api/v1/leads/submit/')
        self.assertEqual(response.status_code, 200)

    def test_staff_conversion_creates_otp_owner_without_default_password(self):
        staff = get_user_model().objects.create_user(username='staff-converter', is_staff=True)
        lead = ProjectLead.objects.create(
            company_name='Converted Company',
            contact_person='Converted Owner',
            phone='09126666666',
            service_type='Web',
            budget_range='Unknown',
            timeline='',
        )
        self.client.force_authenticate(staff)
        response = self.client.post('/api/v1/leads/convert/', {'lead_id': lead.id}, format='json')
        self.assertEqual(response.status_code, 200)
        member = OrganizationMembership.objects.get(phone=lead.phone)
        self.assertEqual(member.role, 'OWNER')
        self.assertFalse(member.user.has_usable_password())
