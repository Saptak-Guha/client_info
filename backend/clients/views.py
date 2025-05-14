from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from bson.objectid import ObjectId
from .models import Client
from .serializers import ClientSerializer

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def clients(request):
    
    if request.method == 'PUT':
        try:
            client_id = request.data.get('_id')
            client = Client.objects.get(_id=ObjectId(client_id))
            serializer = ClientSerializer(client, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'POST':
        serializer = ClientSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'GET':
        name = request.query_params.get('name', '')
        clients = Client.objects.filter(name__icontains=name)
        serializer = ClientSerializer(clients, many=True)
        return Response(serializer.data)

    elif request.method == 'DELETE':
        try:
            ids = [ObjectId(_id) for _id in request.data.get('_ids', [])]
            deleted_count, _ = Client.objects.filter(_id__in=ids).delete()
            return Response({'message': f'Deleted {deleted_count} clients'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)