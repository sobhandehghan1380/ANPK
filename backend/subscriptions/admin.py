from django.contrib import admin

from .models import ClientSubscription, PricingPlan, PricingPlanVersion, SubscriptionPeriod


@admin.register(PricingPlan)
class PricingPlanAdmin(admin.ModelAdmin):
    list_display = ("name", "service_type", "monthly_price", "yearly_price", "is_active", "created_at")
    search_fields = ("name",)
    list_filter = ("is_active",)


@admin.register(ClientSubscription)
class ClientSubscriptionAdmin(admin.ModelAdmin):
    list_display = ("project", "client", "service_type", "plan", "status", "start_date", "end_date", "auto_renew")
    search_fields = ("project__title", "client__name", "plan__name", "custom_plan_name")
    list_filter = ("status", "auto_renew", "is_custom_plan")


@admin.register(PricingPlanVersion)
class PricingPlanVersionAdmin(admin.ModelAdmin):
    list_display = ("plan", "monthly_price", "effective_from", "effective_to", "created_at")
    search_fields = ("plan__name",)
    list_filter = ("effective_from",)


@admin.register(SubscriptionPeriod)
class SubscriptionPeriodAdmin(admin.ModelAdmin):
    list_display = ("subscription", "months", "start_date", "end_date", "total_amount", "status", "invoice")
    search_fields = ("subscription__project__title", "invoice__invoice_number")
    list_filter = ("status", "start_date")
