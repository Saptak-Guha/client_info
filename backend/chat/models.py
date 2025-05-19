# chat/models.py

from djongo import models
from bson import ObjectId

class ChatMessage(models.Model):
    _id = models.ObjectIdField(primary_key=True, default=ObjectId, editable=False)
    sender   = models.CharField(max_length=255)
    receiver = models.CharField(max_length=255)

    message   = models.TextField()
    is_bot    = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} → {self.receiver}: {self.message[:50]}"
