from django.urls import path
from . import views

urlpatterns = [
    path('ai/query/', views.openrouter_ai_query, name='openrouter_ai_query'),
]
