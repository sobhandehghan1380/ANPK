from django.contrib import admin
from .models import OpenRouterConfig, SMSGatewayConfig, AILog, SystemNodeStatus

@admin.register(OpenRouterConfig)
class OpenRouterConfigAdmin(admin.ModelAdmin):
    list_display = ('default_model', 'api_url', 'wallet_rate_per_query', 'is_active')


@admin.register(SMSGatewayConfig)
class SMSGatewayConfigAdmin(admin.ModelAdmin):
    list_display = ('provider_name', 'sender_line', 'is_active')


@admin.register(AILog)
class AILogAdmin(admin.ModelAdmin):
    list_display = ('model_used', 'user_query', 'cost_deducted', 'created_at')
    search_fields = ('user_query', 'ai_response', 'model_used')


@admin.register(SystemNodeStatus)
class SystemNodeStatusAdmin(admin.ModelAdmin):
    list_display = ('name', 'status_label', 'uptime_percentage', 'latency_ms', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)
