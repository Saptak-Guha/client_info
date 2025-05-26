from djongo import models
from bson import ObjectId

class Client(models.Model):
    _id = models.ObjectIdField(primary_key=True, default=ObjectId, editable=False)
    name = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    pan = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    
    def __str__(self):
        return self.name


class Product(models.Model):
    _id = models.ObjectIdField(primary_key=True, default=ObjectId, editable=False)
    image_url = models.URLField()   
    product_name = models.CharField(max_length=200)
    quantity = models.IntegerField()

    def __str__(self):
        return self.product_name