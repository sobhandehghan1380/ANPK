from rest_framework.throttling import AnonRateThrottle

from .services import normalize_phone


class _PhoneAwareAnonThrottle(AnonRateThrottle):
    """Rate-limit by both source IP and normalized phone number."""

    def get_cache_key(self, request, view):
        phone = normalize_phone(request.data.get("phone"))
        ident = self.get_ident(request)
        if not ident and not phone:
            return None
        return self.cache_format % {
            "scope": self.scope,
            "ident": f"{ident}:{phone}",
        }


class OTPSendThrottle(_PhoneAwareAnonThrottle):
    scope = "otp_send"
    rate = "5/min"


class OTPVerifyThrottle(_PhoneAwareAnonThrottle):
    scope = "otp_verify"
    rate = "10/min"
