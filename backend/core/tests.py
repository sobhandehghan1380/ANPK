from django.test import TestCase


class APIVersioningTests(TestCase):
    def test_v1_is_the_canonical_api_root(self):
        response = self.client.get('/api/v1/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['version'], 'v1')
        self.assertNotIn('Deprecation', response.headers)
        self.assertTrue(
            response.json()['routes']['public']['core_home'].startswith('/api/v1/')
        )

    def test_unversioned_api_is_removed(self):
        response = self.client.get('/api/')
        self.assertEqual(response.status_code, 404)
