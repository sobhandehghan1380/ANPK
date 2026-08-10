from django.urls import path

from . import views


app_name = "accounts"

urlpatterns = [
    path("auth/send-otp/", views.send_otp, name="send_otp"),
    path("auth/verify-otp/", views.verify_otp, name="verify_otp"),
    path("auth/refresh/", views.refresh_client_token, name="refresh_client_token"),
    path("client/members/", views.client_members, name="client_members"),
]
