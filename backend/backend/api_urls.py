"""API v1 route definitions mounted under /api/v1/."""

from blog import views as blog_views
from django.urls import include, path


urlpatterns = [
    path(
        'blog/articles/<slug:slug>/comments/',
        blog_views.article_comments,
        name='article_comments',
    ),
    path('core/', include('core.urls')),
    path('catalog/', include('catalog.urls')),
    path('leads/', include('leads.urls')),
    path('projects/', include('projects.urls')),
    path('contact/', include('contact.urls')),
    path('blog/', include('blog.urls')),
    path('services/', include('services.urls')),
    # Account authentication and organization membership endpoints keep the
    # existing /portal/ URL contract while being owned by the accounts app.
    path('portal/', include('accounts.urls')),
    # Must remain last because it exposes the admin/ and portal/ API prefixes.
    path('', include('portal.urls')),
]
