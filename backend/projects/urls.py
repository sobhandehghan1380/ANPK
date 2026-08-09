from django.urls import path
from . import views

urlpatterns = [
    path('', views.public_portfolio_projects, name='public_portfolio_projects'),
    path('public/', views.public_portfolio_projects, name='public_portfolio_projects_explicit'),
    path('client/', views.client_portal_projects, name='client_portal_projects'),
]
