from rest_framework import serializers
from .models import Client

class ClientSerializer(serializers.ModelSerializer):
    _id = serializers.CharField(read_only=True)
    
    class Meta:
        model = Client
        fields = '__all__'