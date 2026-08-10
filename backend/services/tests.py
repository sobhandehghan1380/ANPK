import urllib.error
from unittest.mock import patch

from rest_framework.test import APITestCase

from accounts.models import Organization
from billing.models import Wallet
from integrations.models import APIKey
from .models import OpenRouterConfig


class AIServiceSecurityTests(APITestCase):
    def setUp(self):
        self.organization = Organization.objects.create(
            name='AI Organization',
            contact_person='AI Owner',
            phone='09125555555',
        )
        self.wallet = Wallet.objects.create(client=self.organization, balance=1000)
        self.key = APIKey.objects.create(
            client=self.organization,
            name='AI key',
            api_key='anpk_live_test-key',
        )

    def test_query_requires_valid_api_key(self):
        response = self.client.post('/api/v1/services/ai/query/', {'prompt': 'hello'}, format='json')
        self.assertEqual(response.status_code, 401)

    @patch('services.views.urllib.request.urlopen', side_effect=urllib.error.URLError('offline'))
    def test_provider_failure_refunds_reserved_credit(self, _urlopen):
        OpenRouterConfig.objects.create(
            api_url='https://provider.invalid/api',
            api_key='configured-provider-key',
            default_model='test/model',
            wallet_rate_per_query=240,
        )
        response = self.client.post(
            '/api/v1/services/ai/query/',
            {'prompt': 'hello'},
            format='json',
            HTTP_X_ANPK_API_KEY=self.key.api_key,
        )
        self.assertEqual(response.status_code, 502)
        self.wallet.refresh_from_db()
        self.assertEqual(self.wallet.balance, 1000)
