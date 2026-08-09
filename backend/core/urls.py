from django.urls import path
from . import views

urlpatterns = [
    path('home/', views.home_overview, name='home_overview'),
    path('home-overview/', views.home_overview, name='home_overview_alias'),
]
