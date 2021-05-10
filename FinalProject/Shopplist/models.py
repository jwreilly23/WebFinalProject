from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.

class User(AbstractUser):
    darkmode = models.BooleanField(default=False)
    pass


class Category(models.Model):
    name = models.CharField(max_length=30)
    creator = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    # make plural categories instead of categorys
    class Meta:
        verbose_name_plural = "categories"


class Unit(models.Model):
    unit_type = models.CharField(max_length=15)
    unit_abrev = models.CharField(max_length=15)

    def __str__(self):
        return self.unit_type


class Item(models.Model):
    name = models.CharField(max_length=30)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="items")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, related_name="items", blank=True, null=True)
    aisle = models.CharField(max_length=30, blank=True, null=True)
    active = models.BooleanField(default=False)
    purchases =  models.IntegerField(default=0)
    unit = models.ForeignKey(Unit, on_delete=models.SET_DEFAULT, related_name="units", default=1)
    price = models.DecimalField(max_digits=5, decimal_places=2, default=1.00)

    def serialize(self):
        '''Returns item info as JSON'''
        if self.category is None:
            serial_category = None
        else:
            serial_category = self.category.name 
        return {
            "name": self.name,
            "pk": self.pk,
            "category": serial_category,
            "aisle": self.aisle,
            "active": self.active,
            "purchases": self.purchases,
            "unit": self.unit.unit_abrev,
            "price": self.price
        }

    def __str__(self):
        return f"{self.name} (created by {self.creator.username})"
    