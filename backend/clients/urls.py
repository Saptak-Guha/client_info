from django.urls import path
from . import views

urlpatterns = [
    path('', views.clients, name='clients'),
    path('api/login/', views.client_login, name='client_login'),
    path('product/', views.add_product_page, name='add_product_page'),
    path('api/get_product/', views.get_product, name='addproduct'),
    path('api/products/', views.list_products, name='product-list'),  # GET all products
    path('api/checkout/', views.checkout_products),
    path('update/', views.update),
    
    # Unified product endpoints
    path('api/products/<str:pk>/', views.product_detail, name='product-detail'),
]