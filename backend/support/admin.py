from django.contrib import admin

from .models import InAppNotification, SLASupportContract, SupportTicket, TicketReply


@admin.register(SLASupportContract)
class SLASupportContractAdmin(admin.ModelAdmin):
    list_display = ("project", "subscription", "plan_name", "support_schedule", "response_time_minutes", "resolution_time_hours", "availability_percentage", "remaining_days_display", "is_active")
    search_fields = ("client__name", "project__title", "plan_name")
    list_filter = ("is_active", "start_date")

    @admin.display(description="روزهای باقی‌مانده")
    def remaining_days_display(self, obj):
        return f"{obj.remaining_days} روز"


class TicketReplyInline(admin.TabularInline):
    model = TicketReply
    extra = 0


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ("subject", "project", "client", "client_name", "status", "created_at")
    search_fields = ("subject", "project__title", "client_name", "message")
    list_filter = ("status", "created_at")
    inlines = (TicketReplyInline,)


@admin.register(InAppNotification)
class InAppNotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "client", "is_read", "created_at")
    search_fields = ("title", "message", "client__name")
    list_filter = ("is_read", "created_at")
