from rest_framework import serializers
from .models import Client

class ClientSerializer(serializers.ModelSerializer):
    _id = serializers.CharField(read_only=True)
    
    class Meta:
        model = Client
        fields = '__all__'
        
from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    _id = serializers.CharField(read_only=True)
    class Meta:
        model = Product
        fields = '__all__'
        