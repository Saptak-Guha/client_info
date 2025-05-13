from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Client
from .serializers import ClientSerializer

@api_view(['GET', 'POST'])
def clients(request):
    if request.method == 'POST':
        serializer = ClientSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            name = serializer.validated_data.get('name', 'User')
            return Response(
                {'message': f"Hello, {name}! Your name has been saved."},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'GET':
        all_clients = Client.objects.all()
        serializer = ClientSerializer(all_clients, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
