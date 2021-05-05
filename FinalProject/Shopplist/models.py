from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.

class User(AbstractUser):
    pass


class Category(models.Model):
    name = models.CharField(max_length=30)
    creator = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    # make plural categories instead of categorys
    class Meta:
        verbose_name_plural = "categories"


# default category for items should be "None"
# default_category = Category.objects.get(pk=1)

class Item(models.Model):
    name = models.CharField(max_length=30)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="items")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, related_name="items", blank=True, null=True)
    aisle = models.CharField(max_length=30, blank=True, null=True)
    active = models.BooleanField(default=False)
    purchases =  models.IntegerField(default=0)

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
            "purchases": self.purchases
        }


    def __str__(self):
        return f"{self.name} (created by {self.creator.username})"
    


class Shoplist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="shoplist")
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="shoplist")
    quantity = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} {self.item.name} on {self.user.username} shopping list"

    # make plural shopping lists
    class Meta:
        verbose_name_plural = "Shopping Lists"