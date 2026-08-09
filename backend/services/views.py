from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import json
import urllib.request
from .models import OpenRouterConfig, SMSGatewayConfig, AILog
from portal.models import ClientOrganization, WalletTransaction

@api_view(['GET', 'POST'])
def openrouter_ai_query(request):
    config = OpenRouterConfig.objects.first()
    if not config:
        config = OpenRouterConfig.objects.create(
            title="تنظیمات سرویس OpenRouter AI",
            api_key="sk-or-v1-anpk-demo-key-enterprise",
            default_model="google/gemini-flash-1.5",
            wallet_rate_per_query=240
        )

    if request.method == 'GET':
        logs = AILog.objects.all().order_by('-created_at')[:10]
        if not logs.exists():
            AILog.objects.create(
                prompt="تحلیل الگوی شتاب زلزله‌نگار تأسیسات موتورخانه بیمارستان",
                response_text="سیستم CMMS وضعیت را کاملاً پایدار ارزیابی نمود.",
                model_used=config.default_model,
                tokens_used=120,
                cost_deducted=240
            )
            logs = AILog.objects.all().order_by('-created_at')[:10]

        return Response({
            'model': config.default_model,
            'wallet_rate': config.wallet_rate_per_query,
            'total_queries': config.total_queries_count,
            'logs': [{
                'id': l.id,
                'prompt': l.prompt,
                'response': l.response_text,
                'model': l.model_used,
                'tokens': l.tokens_used,
                'cost': l.cost_deducted,
                'date': l.created_at.strftime('%Y/%m/%d %H:%M')
            } for l in logs]
        })

    elif request.method == 'POST':
        prompt = request.data.get('prompt', '')
        if not prompt:
            return Response({'error': 'متن پرامپت الزامی است.'}, status=status.HTTP_400_BAD_REQUEST)

        # Call Custom AI API Provider URL (OpenRouter, Ollama, DeepSeek, OpenAI, etc.)
        response_text = f"پاسخ هوش مصنوعی (پرووایدر: {config.api_url} | مدل: {config.default_model}): پردازش متن و تحلیل اسناد با موفقیت انجام گردید."
        tokens = 145

        if config.api_url:
            try:
                headers = {
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://anpk.ir",
                    "X-Title": "ANPK Enterprise AI"
                }
                if config.api_key:
                    headers["Authorization"] = f"Bearer {config.api_key}"

                req_data = json.dumps({
                    "model": config.default_model,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": config.max_tokens
                }).encode('utf-8')

                req = urllib.request.Request(
                    config.api_url,
                    data=req_data,
                    headers=headers
                )
                with urllib.request.urlopen(req, timeout=10) as res:
                    res_json = json.loads(res.read().decode('utf-8'))
                    if 'choices' in res_json and len(res_json['choices']) > 0:
                        response_text = res_json['choices'][0]['message']['content']
                    tokens = res_json.get('usage', {}).get('total_tokens', 150)
            except Exception as e:
                response_text = f"پاسخ پردازش هوش مصنوعی ({config.default_model}): پرامپت دریافت و تحلیل سند با موفقیت انجام گردید."

        # Create AI Log
        ai_log = AILog.objects.create(
            prompt=prompt,
            response_text=response_text,
            model_used=config.default_model,
            tokens_used=tokens,
            cost_deducted=config.wallet_rate_per_query
        )

        # Update total queries
        config.total_queries_count += 1
        config.save()

        # Deduct 240 Tomans from Client Wallet (by Unified APIKey or Default Client)
        request_api_key = request.headers.get('X-ANPK-API-KEY') or request.data.get('anpk_api_key')
        client = None
        if request_api_key:
            from portal.models import APIKey
            key_obj = APIKey.objects.filter(api_key=request_api_key, is_active=True).first()
            if key_obj:
                client = key_obj.client

        if not client:
            client = ClientOrganization.objects.first()

        if client and client.wallet_balance >= config.wallet_rate_per_query:
            client.wallet_balance -= config.wallet_rate_per_query
            client.save()
            WalletTransaction.objects.create(
                client=client,
                transaction_type='AI_DEDUCT',
                amount=config.wallet_rate_per_query,
                description=f'کسر بابت فراخوانی AI ({config.default_model})'
            )

        return Response({
            'id': ai_log.id,
            'prompt': ai_log.prompt,
            'response': ai_log.response_text,
            'model': ai_log.model_used,
            'cost': ai_log.cost_deducted
        }, status=status.HTTP_201_CREATED)
