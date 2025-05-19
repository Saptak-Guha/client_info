from django.urls import path
from . import views

urlpatterns = [
    path('', views.clients, name='clients'),
    path('login/', views.client_login, name='client_login'), 
]