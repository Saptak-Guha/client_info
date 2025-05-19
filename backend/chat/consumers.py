# chat/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import ChatMessage
from django.db.models import Q

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # 24‐char hex client_id from URL
        self.client_id = self.scope['url_route']['kwargs']['client_id']
        self.user = "me"  # “me” is always the server/admin identity

        # group name that is always the same, sorted to avoid duplicates
        users = sorted([self.user, self.client_id])
        self.room_group_name = f'chat_{users[0]}_{users[1]}'

        # join this individual group as no one else will be in it
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Fetch last 20 messages between “me” and this client_id
        recent = await sync_to_async(list)(
            ChatMessage.objects.filter(
                Q(sender=self.user, receiver=self.client_id) |
                Q(sender=self.client_id, receiver=self.user)
            ).order_by('-timestamp')[:20]
        )
        #  in newest‐first, so reverse
        recent.reverse()

        # Sending over WebSocket
        for msg in recent:
            await self.send(text_data=json.dumps({
                'sender': msg.sender,
                'receiver': msg.receiver,
                'message': msg.message,
                'timestamp': str(msg.timestamp),
            }))

    async def disconnect(self, close_code):
        # Leave group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        """
        Called when any participant (server or client) sends JSON over WS.

        Expecting JSON of the form:
            {
              "sender": "<clientId or 'me'>",
              "message": "some text"
            }
        We then infer the receiver: if sender == "me", receiver = client_id; else receiver = "me".
        """
        data = json.loads(text_data)
        sender = data.get('sender')
        message = data.get('message')
        if not sender or not message:
            return  # ignore illegal

        # detect sender and who’s receiving
        if sender == "me":
            receiver = self.client_id
            is_bot = False  # treat these as “server” messages not “bot”
        else:
            # The only other valid sender is the client_id string
            sender = self.client_id
            receiver = "me"
            is_bot = False

        
        await sync_to_async(ChatMessage(
            sender=sender,
            receiver=receiver,
            message=message,
            is_bot=is_bot
        ).save)()

        # broadcast it to the group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'sender': sender,
                'receiver': receiver,
                'message': message,
            }
        )

    async def chat_message(self, event):
        """
        When group_send triggers this, forward JSON to WebSocket consumer.
        """
        await self.send(text_data=json.dumps({
            'sender': event['sender'],
            'receiver': event['receiver'],
            'message': event['message'],
        }))
