from django.urls import path
from . import views

urlpatterns = [
    path('', views.clients, name='clients'),         # API endpoint
    path('api/login/', views.client_login, name='client_login'), # API endpoint
    path('product/', views.add_product_page, name='add_product_page'),          
    path('api/get_product/', views.get_product, name='addproduct'),  # Renders index.html
    path('api/products/', views.get_all_products),         # GET only
    path('api/checkout/', views.checkout_products), 
]