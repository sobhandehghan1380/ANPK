from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase


class ContactPermissionTests(APITestCase):
    def test_public_can_submit_but_cannot_list_messages(self):
        listed = self.client.get('/api/v1/contact/')
        self.assertEqual(listed.status_code, 403)

        submitted = self.client.post('/api/v1/contact/', {
            'name': 'Public User',
            'phone': '09124444444',
            'subject': 'Question',
            'message': 'Hello',
        }, format='json')
        self.assertEqual(submitted.status_code, 201)

        staff = get_user_model().objects.create_user(username='staff', is_staff=True)
        self.client.force_authenticate(staff)
        listed = self.client.get('/api/v1/contact/')
        self.assertEqual(listed.status_code, 200)
        self.assertEqual(len(listed.data), 1)
