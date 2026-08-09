from django.urls import path
from . import views

urlpatterns = [
    path('products/', views.products_list, name='products_list'),
    path('products/<slug:slug>/', views.product_detail, name='product_detail'),
    path('solutions/', views.solutions_list, name='solutions_list'),
    path('solutions/<slug:slug>/', views.solution_detail, name='solution_detail'),
]
