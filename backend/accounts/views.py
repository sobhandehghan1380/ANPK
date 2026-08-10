import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password, make_password
from django.core.cache import cache
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from integrations.models import SMSLog
from services.sms import send_otp_message

from .models import OrganizationMembership, SMSOTPCode
from .selectors import get_current_member
from .services import normalize_phone
from .throttles import OTPSendThrottle, OTPVerifyThrottle


User = get_user_model()


def _unauthorized():
    return Response(
        {"error": "دسترسی غیرمجاز. لطفاً مجدداً وارد پورتال شوید."},
        status=status.HTTP_403_FORBIDDEN,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([OTPSendThrottle])
def send_otp(request):
    phone = normalize_phone(request.data.get("phone"))
    if not phone.isdigit() or len(phone) != 11 or not phone.startswith("09"):
        return Response(
            {"error": "لطفاً شماره تلفن همراه معتبر وارد نمایید."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not OrganizationMembership.objects.filter(phone=phone, is_active=True).exists():
        return Response(
            {
                "error": "شماره همراه واردشده در سامانه مشتریان ثبت نگردیده است. لطفاً جهت تعریف حساب با پشتیبانی تماس بگیرید."
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    code = f"{secrets.randbelow(90000) + 10000}"
    SMSOTPCode.objects.filter(phone=phone, is_used=False).update(is_used=True)
    otp = SMSOTPCode.objects.create(phone=phone, code=make_password(code))

    if settings.DEBUG:
        cache.set(
            f"portal:otp:development:{otp.pk}",
            code,
            timeout=settings.OTP_TTL_SECONDS,
        )

    delivered = send_otp_message(phone, code)
    SMSLog.objects.create(
        recipient=phone,
        text="کد تایید ورود به پورتال ANPK ارسال شد.",
        operator="همراه اول / کاوه نگار",
        cost=75,
        status="delivered" if delivered else ("development" if settings.DEBUG else "failed"),
    )

    if not settings.DEBUG and not delivered:
        otp.delete()
        return Response(
            {"error": "سرویس ارسال پیامک هنوز برای محیط عملیاتی پیکربندی نشده است."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    return Response(
        {
            "message": "کد تایید ۵ رقمی با موفقیت ارسال گردید.",
            "phone": phone,
        }
    )


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([OTPVerifyThrottle])
def verify_otp(request):
    phone = normalize_phone(request.data.get("phone"))
    code = str(request.data.get("code", "")).strip()
    if not phone or not code:
        return Response(
            {"error": "شماره موبایل و کد تایید ۵ رقمی الزامی است."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    cutoff = timezone.now() - timedelta(seconds=settings.OTP_TTL_SECONDS)
    candidates = SMSOTPCode.objects.filter(
        phone=phone,
        is_used=False,
        created_at__gte=cutoff,
    ).order_by("-created_at")
    otp = next((candidate for candidate in candidates if check_password(code, candidate.code)), None)
    if not otp:
        return Response(
            {"error": "کد تایید واردشده اشتباه است یا منقضی گردیده است."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    member = (
        OrganizationMembership.objects.select_related("organization", "user")
        .filter(phone=phone, is_active=True)
        .first()
    )
    if not member:
        return Response(
            {"error": "حساب کاربری معتبری برای این شماره همراه یافت نشد."},
            status=status.HTTP_404_NOT_FOUND,
        )

    otp.is_used = True
    otp.save(update_fields=["is_used"])
    cache.delete(f"portal:otp:development:{otp.pk}")

    refresh = RefreshToken.for_user(member.user)
    return Response(
        {
            "message": "ورود پیامکی با موفقیت انجام شد.",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "member": {
                "id": member.id,
                "name": member.full_name,
                "role": member.role,
                "organization_name": member.organization.name,
            },
        }
    )


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([OTPVerifyThrottle])
def refresh_client_token(request):
    refresh_value = request.data.get("refresh")
    if not refresh_value:
        return Response(
            {"error": "refresh token الزامی است."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        refresh = RefreshToken(refresh_value)
        user_id = refresh.get("user_id")
    except Exception:
        return Response(
            {"error": "توکن نامعتبر یا منقضی است."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not OrganizationMembership.objects.filter(user_id=user_id, is_active=True).exists():
        return Response(
            {"error": "عضویت فعال یافت نشد."},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    return Response({"access": str(refresh.access_token)})


@api_view(["GET", "POST", "DELETE"])
@permission_classes([IsAuthenticated])
def client_members(request):
    member = get_current_member(request)
    if not member:
        return _unauthorized()
    organization = member.organization

    if request.method == "POST":
        if member.role != "OWNER":
            return Response(
                {"error": "فقط مالک سازمان می‌تواند همکار جدید اضافه کند."},
                status=status.HTTP_403_FORBIDDEN,
            )

        phone = normalize_phone(request.data.get("phone"))
        full_name = str(request.data.get("full_name") or "").strip()
        if not phone.isdigit() or len(phone) != 11 or not full_name:
            return Response(
                {"error": "نام و شماره تلفن همراه معتبر الزامی است."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if OrganizationMembership.objects.filter(phone=phone).exists():
            return Response(
                {"error": "این شماره همراه قبلاً به یک عضو اختصاص یافته است."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create(username=f"client_{phone}", first_name=full_name)
        user.set_unusable_password()
        user.save(update_fields=["password"])
        new_member = OrganizationMembership.objects.create(
            organization=organization,
            user=user,
            phone=phone,
            full_name=full_name,
            role="MEMBER",
        )
        return Response(
            {
                "message": f'"{full_name}" با موفقیت به تیم سازمان اضافه شد.',
                "id": new_member.id,
            }
        )

    if request.method == "DELETE":
        if member.role != "OWNER":
            return Response(
                {"error": "فقط مالک سازمان می‌تواند عضو را حذف کند."},
                status=status.HTTP_403_FORBIDDEN,
            )

        member_id = request.data.get("id") or request.query_params.get("id")
        try:
            target = OrganizationMembership.objects.get(id=member_id, organization=organization)
        except OrganizationMembership.DoesNotExist:
            return Response(
                {"error": "عضو یافت نشد."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if target.id == member.id:
            return Response(
                {"error": "نمی‌توانید حساب خودتان را حذف کنید."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        target_user = target.user
        target.delete()
        target_user.delete()
        return Response({"message": "عضو با موفقیت از سازمان حذف شد."})

    memberships = OrganizationMembership.objects.filter(organization=organization).order_by(
        "-role", "created_at"
    )
    return Response(
        {
            "members": [
                {
                    "id": item.id,
                    "full_name": item.full_name,
                    "phone": item.phone,
                    "role": item.role,
                    "is_active": item.is_active,
                    "is_me": item.id == member.id,
                    "created_at": item.created_at.strftime("%Y/%m/%d"),
                }
                for item in memberships
            ],
            "my_role": member.role,
        }
    )
