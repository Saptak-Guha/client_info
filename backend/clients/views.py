from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Client
from .serializers import ClientSerializer
@api_view(['GET', 'POST', 'DELETE'])
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
        name_query = request.query_params.get('name', None)
        if name_query:
            filtered_clients = Client.objects.filter(name__icontains=name_query)
            serializer = ClientSerializer(filtered_clients, many=True)
        else:
            all_clients = Client.objects.all()
            serializer = ClientSerializer(all_clients, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'DELETE':
        names_to_delete = request.data.get('names', [])
        deleted, _ = Client.objects.filter(name__in=names_to_delete).delete()
        return Response({'message': f"{deleted} client(s) deleted."}, status=status.HTTP_200_OK)
