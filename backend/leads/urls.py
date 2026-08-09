from django.urls import path
from . import views

urlpatterns = [
    path('submit/', views.project_leads_list, name='project_leads_list'),
    path('convert/', views.convert_lead, name='convert_lead'),
]
