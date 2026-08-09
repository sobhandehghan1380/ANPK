from django.contrib import admin
from .models import CompanyInfo, HeroSection, HeroTypewriterItem

class HeroTypewriterItemInline(admin.TabularInline):
    model = HeroTypewriterItem
    extra = 3

@admin.register(HeroSection)
class HeroSectionAdmin(admin.ModelAdmin):
    list_display = ('main_title_static', 'badge_text', 'is_active')
    inlines = [HeroTypewriterItemInline]

@admin.register(CompanyInfo)
class CompanyInfoAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'email')
