from djongo import models
from bson.objectid import ObjectId

class Client(models.Model):
    _id = models.ObjectIdField(primary_key=True, default=ObjectId)
    name = models.CharField(max_length=255)
    password = models.CharField(max_length=20)
    pan = models.CharField(max_length=15, unique=True)
    email = models.EmailField(max_length=255, unique=True)
    phone = models.CharField(max_length=15, unique=True)

    def __str__(self):
        return self.name

    class Meta: 
        db_table = 'clients'