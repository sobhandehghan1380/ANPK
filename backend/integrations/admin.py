import secrets

from django.contrib import admin

from .models import APIKey, SMSLog


@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    list_display = ("name", "client", "project", "key_type", "api_key", "is_active", "created_at")
    search_fields = ("client__name", "project__title", "name", "api_key")
    list_filter = ("key_type", "is_active", "created_at")

    def save_model(self, request, obj, form, change):
        if not obj.api_key:
            prefix = "anpk_proj_" if obj.key_type == "PROJECT" else "anpk_acc_"
            obj.api_key = f"{prefix}{secrets.token_hex(16)}"
        super().save_model(request, obj, form, change)


@admin.register(SMSLog)
class SMSLogAdmin(admin.ModelAdmin):
    list_display = ("recipient", "project", "operator", "cost", "status", "sent_at")
    search_fields = ("recipient", "text", "project__title")
    list_filter = ("status", "operator", "sent_at")
