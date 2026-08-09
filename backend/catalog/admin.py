from django.contrib import admin
from .models import ProductCategory, Product, ProductFeature, Solution, SolutionBenefit

class ProductFeatureInline(admin.TabularInline):
    model = ProductFeature
    extra = 1

class SolutionBenefitInline(admin.TabularInline):
    model = SolutionBenefit
    extra = 1

@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'icon_name', 'order')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('order', 'id')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'status', 'is_featured', 'order')
    list_filter = ('category', 'is_featured', 'status')
    search_fields = ('name', 'short_description', 'full_description')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductFeatureInline]
    ordering = ('order', 'id')

@admin.register(Solution)
class SolutionAdmin(admin.ModelAdmin):
    list_display = ('title', 'subtitle', 'is_featured', 'order')
    list_filter = ('is_featured',)
    search_fields = ('title', 'subtitle', 'description')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [SolutionBenefitInline]
    ordering = ('order', 'id')
