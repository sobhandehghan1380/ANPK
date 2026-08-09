from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from .models import (
    ClientOrganization, Wallet, WalletTransaction,
    SLASupportContract, SupportTicket, APIKey, SMSOTPCode, SMSLog
)
import secrets

User = get_user_model()

@admin.register(ClientOrganization)
class ClientOrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner_user', 'contact_person', 'phone', 'created_at')
    search_fields = ('name', 'owner_user__username', 'contact_person', 'phone')


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('client', 'balance', 'is_active', 'updated_at')
    search_fields = ('client__name',)
    list_filter = ('is_active',)


@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = ('wallet', 'transaction_type', 'amount', 'created_at')
    list_filter = ('transaction_type', 'created_at')


@admin.register(SLASupportContract)
class SLASupportContractAdmin(admin.ModelAdmin):
    list_display = ('client', 'plan_name', 'start_date', 'duration_months', 'get_remaining_days_display', 'is_active')
    search_fields = ('client__name', 'plan_name')
    list_filter = ('is_active', 'start_date')

    def get_remaining_days_display(self, obj):
        return f"{obj.remaining_days} روز"
    get_remaining_days_display.short_description = 'روزهای باقی‌مانده (محاسبه‌شده)'


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ('subject', 'client', 'client_name', 'status', 'created_at')
    search_fields = ('subject', 'client_name', 'message')
    list_filter = ('status', 'created_at')


@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    list_display = ('name', 'client', 'project', 'key_type', 'api_key', 'is_active', 'created_at')
    search_fields = ('client__name', 'project__title', 'name', 'api_key')
    list_filter = ('key_type', 'is_active', 'created_at')

    def save_model(self, request, obj, form, change):
        if not obj.api_key:
            prefix = "anpk_proj_" if obj.key_type == 'PROJECT' else "anpk_acc_"
            obj.api_key = f"{prefix}{secrets.token_hex(16)}"
        super().save_model(request, obj, form, change)


@admin.register(SMSOTPCode)
class SMSOTPCodeAdmin(admin.ModelAdmin):
    list_display = ('phone', 'code', 'is_used', 'created_at')
    search_fields = ('phone', 'code')
    list_filter = ('is_used', 'created_at')


@admin.register(SMSLog)
class SMSLogAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'text', 'operator', 'cost', 'status', 'sent_at')
    search_fields = ('recipient', 'text')
    list_filter = ('status', 'operator', 'sent_at')
