import json
import logging
import urllib.error
import urllib.request

from django.conf import settings


logger = logging.getLogger(__name__)


def send_otp_message(phone, code):
    """Send OTP through a provider-neutral JSON webhook configured by environment."""
    if not settings.SMS_OTP_ENDPOINT:
        return False

    payload = json.dumps({
        'recipient': phone,
        'message': f'کد تأیید ورود به پورتال ANPK: {code}',
        'sender': settings.SMS_SENDER_LINE,
    }).encode('utf-8')
    headers = {'Content-Type': 'application/json'}
    if settings.SMS_OTP_API_KEY:
        headers['Authorization'] = f'Bearer {settings.SMS_OTP_API_KEY}'

    request = urllib.request.Request(
        settings.SMS_OTP_ENDPOINT,
        data=payload,
        headers=headers,
        method='POST',
    )
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            return 200 <= response.status < 300
    except (urllib.error.URLError, TimeoutError, ValueError) as exc:
        logger.error('OTP provider request failed: %s', exc)
        return False
