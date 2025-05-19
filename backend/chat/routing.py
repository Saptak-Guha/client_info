# chat/routing.py

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # client_id is 24‐hex‐char (MongoDB ObjectId)
    re_path(r'ws/chat/(?P<client_id>[0-9a-fA-F]{24})/$', consumers.ChatConsumer.as_asgi()),
]
