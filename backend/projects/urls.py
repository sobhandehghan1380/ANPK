from django.urls import path
from . import views

urlpatterns = [
    path('<int:project_id>/usage/', views.project_usage, name='project_usage'),
    path('', views.public_portfolio_projects, name='public_portfolio_projects'),
    path('public/', views.public_portfolio_projects, name='public_portfolio_projects_explicit'),
    path('client/', views.client_portal_projects, name='client_portal_projects'),
]
