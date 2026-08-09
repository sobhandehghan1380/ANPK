from django.contrib import admin
from .models import ProjectCategory, Technology, PublicPortfolioProject, ClientContractProject, ProjectPhase

class ProjectPhaseInline(admin.TabularInline):
    model = ProjectPhase
    extra = 3
    fields = ('phase_number', 'title', 'progress_percentage', 'status', 'start_date', 'target_delivery_date')


@admin.register(ProjectCategory)
class ProjectCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Technology)
class TechnologyAdmin(admin.ModelAdmin):
    list_display = ('name', 'category')
    list_filter = ('category',)
    search_fields = ('name',)


@admin.register(PublicPortfolioProject)
class PublicPortfolioProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'client_name_display', 'sprint_progress', 'is_featured', 'created_at')
    search_fields = ('title', 'client_name_display', 'summary')
    list_filter = ('category', 'is_featured', 'created_at')
    filter_horizontal = ('technologies',)
    prepopulated_fields = {'slug': ('title',)}


@admin.register(ClientContractProject)
class ClientContractProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'client', 'contract_number', 'contract_date', 'contract_value', 'sprint_progress', 'active_phase_title', 'is_active')
    search_fields = ('title', 'contract_number', 'client__name', 'active_phase_title')
    list_filter = ('is_active', 'contract_date')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [ProjectPhaseInline]
    fields = ('title', 'slug', 'client', 'contract_number', 'contract_date', 'contract_value', 'sprint_progress', 'active_phase_title', 'delivery_date', 'login_url', 'is_active')


@admin.register(ProjectPhase)
class ProjectPhaseAdmin(admin.ModelAdmin):
    list_display = ('project', 'phase_number', 'title', 'progress_percentage', 'status', 'target_delivery_date')
    list_filter = ('status', 'project')
    search_fields = ('title', 'project__title')
