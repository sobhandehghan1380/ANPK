from django.contrib import admin
from .models import ArticleCategory, Article, ArticleTag

@admin.register(ArticleCategory)
class ArticleCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'get_articles_count')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}

    def get_articles_count(self, obj):
        return obj.articles.count()
    get_articles_count.short_description = 'تعداد مقالات متصل'


@admin.register(ArticleTag)
class ArticleTagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'author', 'read_time', 'views_count', 'is_featured', 'status', 'created_at')
    search_fields = ('title', 'summary', 'content', 'meta_title')
    list_filter = ('category', 'is_featured', 'status', 'created_at')
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ('tags',)
    fieldsets = (
        ('اطلاعات پایه', {
            'fields': ('title', 'slug', 'category', 'author', 'status', 'is_featured')
        }),
        ('محتوا', {
            'fields': ('summary', 'content', 'read_time', 'tags')
        }),
        ('مدیا', {
            'fields': ('thumbnail', 'cover_image')
        }),
        ('سئو و متادیتا', {
            'fields': ('meta_title', 'meta_description')
        }),
        ('زمان‌بندی و آمار', {
            'fields': ('published_at', 'views_count')
        }),
    )
