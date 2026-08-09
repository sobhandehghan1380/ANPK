from django.contrib import admin
from .models import ProjectLead

@admin.register(ProjectLead)
class ProjectLeadAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'contact_person', 'phone', 'service_type', 'budget_range', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('company_name', 'contact_person', 'phone', 'service_type')
