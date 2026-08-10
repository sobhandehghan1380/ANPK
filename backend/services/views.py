import json
import logging
import urllib.error
import urllib.request

from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from billing.models import Wallet, WalletTransaction
from integrations.models import APIKey
from .models import AILog, OpenRouterConfig


logger = logging.getLogger(__name__)


def _request_api_key(request):
    explicit_key = request.headers.get('X-ANPK-API-KEY') or request.data.get('anpk_api_key')
    if explicit_key:
        return str(explicit_key).strip()

    authorization = request.headers.get('Authorization', '')
    if authorization.startswith('Bearer anpk_'):
        return authorization.removeprefix('Bearer ').strip()
    return ''


def _reserve_wallet_credit(client, amount, model_name):
    with transaction.atomic():
        Wallet.objects.get_or_create(client=client, defaults={'balance': 0})
        wallet = Wallet.objects.select_for_update().get(client=client)
        if not wallet.is_active or wallet.balance < amount:
            return None
        wallet.balance -= amount
        wallet.save(update_fields=['balance', 'updated_at'])
        WalletTransaction.objects.create(
            wallet=wallet,
            transaction_type='AI_DEDUCT',
            amount=amount,
            description=f'کسر بابت فراخوانی AI ({model_name})',
        )
        return wallet.id


def _refund_wallet_credit(wallet_id, amount, model_name):
    with transaction.atomic():
        wallet = Wallet.objects.select_for_update().get(id=wallet_id)
        wallet.balance += amount
        wallet.save(update_fields=['balance', 'updated_at'])
        WalletTransaction.objects.create(
            wallet=wallet,
            transaction_type='AI_REFUND',
            amount=amount,
            description=f'بازگشت اعتبار فراخوانی ناموفق AI ({model_name})',
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def openrouter_ai_query(request):
    prompt = str(request.data.get('prompt', '')).strip()
    if not prompt:
        return Response({'error': 'متن پرامپت الزامی است.'}, status=status.HTTP_400_BAD_REQUEST)
    if len(prompt) > 20_000:
        return Response({'error': 'متن پرامپت بیش از حد طولانی است.'}, status=status.HTTP_400_BAD_REQUEST)

    api_key_value = _request_api_key(request)
    key = APIKey.objects.select_related('client', 'project').filter(
        api_key=api_key_value,
        is_active=True,
    ).first()
    if not key:
        return Response({'error': 'کلید API معتبر نیست.'}, status=status.HTTP_401_UNAUTHORIZED)

    config = OpenRouterConfig.objects.filter(is_active=True).first()
    if not config or not config.api_url or not config.api_key or 'demo-key' in config.api_key:
        return Response(
            {'error': 'سرویس هوش مصنوعی پیکربندی نشده است.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    wallet_id = _reserve_wallet_credit(
        key.client,
        config.wallet_rate_per_query,
        config.default_model,
    )
    if wallet_id is None:
        return Response({'error': 'اعتبار کیف پول کافی نیست.'}, status=status.HTTP_402_PAYMENT_REQUIRED)

    payload = json.dumps({
        'model': config.default_model,
        'messages': [{'role': 'user', 'content': prompt}],
        'max_tokens': 1000,
    }).encode('utf-8')
    provider_request = urllib.request.Request(
        config.api_url,
        data=payload,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {config.api_key}',
            'HTTP-Referer': 'https://anpk.ir',
            'X-Title': 'ANPK Enterprise AI',
        },
        method='POST',
    )

    try:
        with urllib.request.urlopen(provider_request, timeout=30) as provider_response:
            response_payload = json.loads(provider_response.read().decode('utf-8'))
        choices = response_payload.get('choices') or []
        response_text = choices[0]['message']['content'] if choices else ''
        if not response_text:
            raise ValueError('Provider returned no response content')
    except (urllib.error.URLError, TimeoutError, ValueError, KeyError, json.JSONDecodeError) as exc:
        logger.error('AI provider request failed: %s', exc)
        _refund_wallet_credit(wallet_id, config.wallet_rate_per_query, config.default_model)
        return Response({'error': 'سرویس هوش مصنوعی پاسخ معتبری نداد.'}, status=status.HTTP_502_BAD_GATEWAY)

    ai_log = AILog.objects.create(
        project=key.project,
        user_query=prompt,
        ai_response=response_text,
        model_used=config.default_model,
        cost_deducted=config.wallet_rate_per_query,
    )
    return Response({
        'id': ai_log.id,
        'prompt': ai_log.user_query,
        'response': ai_log.ai_response,
        'model': ai_log.model_used,
        'cost': ai_log.cost_deducted,
    }, status=status.HTTP_201_CREATED)
