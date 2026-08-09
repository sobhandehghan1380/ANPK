from django.contrib import admin
from django.urls import path, include
from blog import views as blog_views

# Customize Admin Site Headers for ANPK Enterprise
admin.site.site_header = "سامانه مدیریت و فرماندهی ارشیا نگین پردازش کویر (ANPK Admin Center)"
admin.site.site_title = "پنل ادمین ارشیا نگین"
admin.site.index_title = "داشبورد مدیریت ارشد ANPK"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/blog/articles/<slug:slug>/comments/', blog_views.article_comments, name='article_comments'),
    path('api/core/', include('core.urls')),
    path('api/catalog/', include('catalog.urls')),
    path('api/portal/', include('portal.urls')),
    path('api/leads/', include('leads.urls')),
    path('api/projects/', include('projects.urls')),
    path('api/contact/', include('contact.urls')),
    path('api/blog/', include('blog.urls')),
    path('api/services/', include('services.urls')),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
