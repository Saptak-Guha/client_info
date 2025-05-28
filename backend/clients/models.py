from djongo import models
from bson import ObjectId

class Client(models.Model):
    _id = models.ObjectIdField(primary_key=True, default=ObjectId, editable=False)
    name = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    pan = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, unique=True)
    company = models.CharField(max_length=100)
    gstr = models.IntegerField()
    
    def __str__(self):
        return self.name


from bson.decimal128 import Decimal128

class Product(models.Model):
    _id = models.ObjectIdField(primary_key=True, default=ObjectId, editable=False)
    image_url = models.URLField()   
    product_name = models.CharField(max_length=200)
    product_category = models.CharField(max_length=100)
    product_description = models.TextField()
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.product_name

    def save(self, *args, **kwargs):
        # convert price if it's Decimal128 to Decimal before saving
        if isinstance(self.price, Decimal128):
            self.price = self.price.to_decimal()
        super().save(*args, **kwargs)
