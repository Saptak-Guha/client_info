from django.db import models

class Client(models.Model):
    name = models.CharField(max_length=255)
    password = models.CharField(max_length=20)
    pan = models.CharField(max_length=15, unique=True)
    email = models.EmailField(max_length=255, unique=True)
    phone = models.CharField(max_length=15, unique=True)
    def __str__(self):
        return self.name

    class Meta:
        db_table = 'clients'  
