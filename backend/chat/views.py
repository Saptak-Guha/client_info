from bson import ObjectId
from rest_framework.decorators import api_view
from rest_framework.response import Response
from clients.models import Client
from .models import ChatMessage
from django.shortcuts import get_object_or_404
from django.db.models import Q


@api_view(['POST'])
def chat_view(request):
    client_id_str = request.data.get("_id")
    message = request.data.get("message")
    from_server = request.data.get("from_server", False)

    if not client_id_str or not message:
        return Response({"error": "missing _id"}, status=400)

    try:
        client_id = ObjectId(client_id_str)
    except Exception:
        return Response({"error": "invalid _id"}, status=400)

    client = get_object_or_404(Client, _id=client_id)

    if from_server:
        # server -> client
        ChatMessage.objects.create(
            sender='me',
            receiver=str(client._id),
            message=message,
            is_bot=False
        )
        return Response({"status": "from server"})
    else:
        # client -> server
        ChatMessage.objects.create(
            sender=str(client._id),
            receiver='me',
            message=message,
            is_bot=False
        )
        return Response({"status": "received"})



from django.http import JsonResponse
from .models import ChatMessage

def chat_history(request, client_id):
    messages = ChatMessage.objects.filter(
        Q(sender=client_id) | Q(receiver=client_id)
    ).order_by('timestamp')

    # message data from id if needed to access
    # hit  curl http://127.0.0.1:8000/chat/history/the id {e.g: 682b8b8b8b26b5dd22894846)}/
    data = [{
        'sender': msg.sender,
        'receiver': msg.receiver,
        'message': msg.message,
        'timestamp': msg.timestamp.isoformat()
    } for msg in messages]

    return JsonResponse(data, safe=False)
