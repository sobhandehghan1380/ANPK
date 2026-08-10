from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase

from accounts.models import Organization, OrganizationMembership
from integrations.models import SMSLog
from services.models import AILog

from .models import ClientContractProject


User = get_user_model()


class ProjectUsageAPITests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username='project-owner')
        self.other_owner = User.objects.create_user(username='other-project-owner')
        self.staff = User.objects.create_user(username='usage-admin', is_staff=True)

        self.organization = Organization.objects.create(
            name='Usage Organization',
            contact_person='Owner',
            phone='09121110000',
        )
        self.other_organization = Organization.objects.create(
            name='Other Organization',
            contact_person='Other Owner',
            phone='09121110001',
        )
        OrganizationMembership.objects.create(
            organization=self.organization,
            user=self.owner,
            phone='09121110000',
            full_name='Owner',
            role='OWNER',
        )
        OrganizationMembership.objects.create(
            organization=self.other_organization,
            user=self.other_owner,
            phone='09121110001',
            full_name='Other Owner',
            role='OWNER',
        )

        self.project = ClientContractProject.objects.create(
            client=self.organization,
            title='Measured Project',
            slug='measured-project',
        )
        self.other_project = ClientContractProject.objects.create(
            client=self.other_organization,
            title='Other Project',
            slug='other-project',
        )

        AILog.objects.create(
            project=self.project,
            user_query='first',
            ai_response='first response',
            model_used='model/a',
            cost_deducted=240,
        )
        AILog.objects.create(
            project=self.project,
            user_query='second',
            ai_response='second response',
            model_used='model/b',
            cost_deducted=300,
        )
        AILog.objects.create(
            project=self.other_project,
            user_query='private',
            ai_response='private response',
            model_used='model/a',
            cost_deducted=999,
        )
        SMSLog.objects.create(
            project=self.project,
            recipient='09121110000',
            text='delivered message',
            cost=50,
            status='delivered',
        )
        SMSLog.objects.create(
            project=self.project,
            recipient='09121110000',
            text='failed message',
            cost=70,
            status='failed',
        )
        SMSLog.objects.create(
            project=self.other_project,
            recipient='09121110001',
            text='private message',
            cost=999,
            status='delivered',
        )

    def test_member_receives_only_own_project_usage(self):
        self.client.force_authenticate(self.owner)
        response = self.client.get(f'/api/v1/projects/{self.project.id}/usage/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['access_scope'], 'organization')
        self.assertEqual(response.data['ai']['request_count'], 2)
        self.assertEqual(response.data['ai']['total_cost'], 540)
        self.assertEqual(response.data['sms']['message_count'], 2)
        self.assertEqual(response.data['sms']['total_cost'], 120)
        self.assertEqual(response.data['sms']['delivered_count'], 1)
        self.assertEqual(response.data['sms']['failed_count'], 1)

    def test_member_cannot_access_another_organizations_project(self):
        self.client.force_authenticate(self.owner)
        response = self.client.get(f'/api/v1/projects/{self.other_project.id}/usage/')
        self.assertEqual(response.status_code, 404)

    def test_staff_can_access_any_project_usage(self):
        self.client.force_authenticate(self.staff)
        response = self.client.get(f'/api/v1/projects/{self.other_project.id}/usage/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['access_scope'], 'admin')
        self.assertEqual(response.data['ai']['total_cost'], 999)
        self.assertEqual(response.data['sms']['total_cost'], 999)

    def test_date_filters_and_validation(self):
        self.client.force_authenticate(self.owner)
        tomorrow = (timezone.localdate() + timedelta(days=1)).isoformat()
        empty = self.client.get(
            f'/api/v1/projects/{self.project.id}/usage/',
            {'date_from': tomorrow},
        )
        self.assertEqual(empty.status_code, 200)
        self.assertEqual(empty.data['ai']['request_count'], 0)
        self.assertEqual(empty.data['sms']['message_count'], 0)

        invalid = self.client.get(
            f'/api/v1/projects/{self.project.id}/usage/',
            {'date_from': 'not-a-date'},
        )
        self.assertEqual(invalid.status_code, 400)
