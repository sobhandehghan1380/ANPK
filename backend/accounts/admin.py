from django.conf import settings
from django.contrib import admin
from django.core.cache import cache
from django.utils.html import format_html

from .models import Organization, OrganizationMembership, SMSOTPCode, UserProfile


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "owner_account", "contact_person", "phone", "portal_access", "created_at")
    search_fields = ("name", "members__user__username", "members__full_name", "contact_person", "phone")
    list_filter = ("portal_access", "created_at")

    @admin.display(description="مالک سازمان")
    def owner_account(self, obj):
        owner = obj.members.filter(role="OWNER", is_active=True).select_related("user").first()
        return owner.user.username if owner else "—"


@admin.register(OrganizationMembership)
class OrganizationMembershipAdmin(admin.ModelAdmin):
    list_display = ("full_name", "organization", "phone", "role", "is_active", "created_at")
    search_fields = ("full_name", "phone", "organization__name", "user__username")
    list_filter = ("role", "is_active", "created_at")
    autocomplete_fields = ("organization", "user")


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone_number", "national_code", "job_title", "created_at")
    search_fields = ("user__username", "user__first_name", "user__last_name", "phone_number", "national_code")
    autocomplete_fields = ("user",)


@admin.register(SMSOTPCode)
class SMSOTPCodeAdmin(admin.ModelAdmin):
    list_display = ("phone", "development_code", "otp_status", "created_at")
    search_fields = ("phone",)
    list_filter = ("is_used", "created_at")
    readonly_fields = ("phone", "development_code", "otp_status", "created_at")
    fields = ("phone", "development_code", "otp_status", "created_at")
    ordering = ("-created_at",)

    @admin.display(description="کد توسعه")
    def development_code(self, obj):
        if not settings.DEBUG:
            return "فقط در حالت توسعه قابل مشاهده است"
        if obj.is_used:
            return "استفاده‌شده"

        code = cache.get(f"portal:otp:development:{obj.pk}")
        if not code:
            return "منقضی‌شده یا مربوط به قبل از راه‌اندازی سرور"
        return format_html(
            '<code style="font-size:18px;font-weight:700;letter-spacing:4px;direction:ltr">{}</code>',
            code,
        )

    @admin.display(description="وضعیت", boolean=True)
    def otp_status(self, obj):
        return not obj.is_used

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
