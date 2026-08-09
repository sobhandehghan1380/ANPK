from django.urls import path
from . import views

urlpatterns = [
    path('', views.contact_messages, name='contact_messages'),
]
