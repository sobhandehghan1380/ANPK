from django.contrib import admin
from django.urls import path, include

# Customize Admin Site Headers for ANPK Enterprise
admin.site.site_header = "سامانه مدیریت و فرماندهی ارشیا نگین پردازش کویر (ANPK Admin Center)"
admin.site.site_title = "پنل ادمین ارشیا نگین"
admin.site.index_title = "داشبورد مدیریت ارشد ANPK"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('backend.api_urls')),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
