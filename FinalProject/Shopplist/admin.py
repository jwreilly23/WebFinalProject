from django.contrib import admin

from .models import User, Category, Item, Shoplist

# Register your models here.
class ItemAdmin(admin.ModelAdmin):
    list_display = ("creator", "name", "category", "aisle", "purchases")


class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "creator")


admin.site.register(User)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Item, ItemAdmin)
admin.site.register(Shoplist)
