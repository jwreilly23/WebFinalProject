from django.shortcuts import render
from django.urls import reverse
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django import forms
from django.db.models.functions import Lower
from django.utils.translation import gettext_lazy as _

import json

from .models import User, Category, Item, Shoplist, Unit

class ItemForm(forms.ModelForm):
    '''New item form generated from Item model'''
    class Meta:
        model = Item
        fields = ("name", "category", "aisle")
        labels = {
            "name": _("")
        }
        widgets = {
            "name": forms.TextInput(attrs={"placeholder":"Enter item name"}),
            "aisle": forms.TextInput(attrs={"placeholder":"(Optional)"})
        }


def index(request):
    # redirect to login if not logged in
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse("login"))

    # item form for user categories only
    item_form = ItemForm()
    item_form.fields["category"] = forms.ModelChoiceField(Category.objects.filter(creator=request.user).order_by("name"), empty_label="None", required=False)

    return render(request, "Shopplist/index.html", {
        "item_form": item_form,
        "darkmode": request.user.darkmode
    })


def settings(request, darkmode=None):
    '''Settings page, for deleting categories and toggling darkmode'''

    if request.method == "PUT":
        # for updated darkmode preference
        if darkmode == "on":
            request.user.darkmode = True
        elif darkmode == "off":
            request.user.darkmode = False
        request.user.save()
        return JsonResponse({"status": "Success"}, status=200)

    if request.method == "GET":
        # get all categories and aisles
        categories = list(Category.objects.filter(creator=request.user).values_list("name", flat=True))
        aisles = list(Item.objects.filter(creator=request.user).order_by("aisle").values_list("aisle", flat=True).distinct())
        # aisles = Item.objects.filter(creator=request.user).order_by("aisle") --------------------------------------------------------------------
        # aisles = aisles.values_list("aisle", flat=True)
        aisles = list(filter(None, aisles))
        # print(list(aisles))

        return JsonResponse({
            "categories": categories,
            "aisles": aisles
        }, safe=True)

    if request.method == "DELETE":
        # for deleting categories
        to_delete = json.loads(request.body)
        categories = to_delete["categories"]
        print(categories)
        
        for category in categories:
            try:
                category = Category.objects.get(name=category, creator=request.user)
                category.delete()
            except Category.DoesNotExist:
                return JsonResponse({"status": "Invalid category"}, status=400)
        
        return JsonResponse({"status": "Success"}, status=200)

    if request.method == "POST":
        # for creating new categories
        new_category_name = json.loads(request.body)["category"]
        # check if category already exists
        try:
            Category.objects.get(name=new_category_name, creator=request.user)
            return JsonResponse({"error": f"Category '{new_category_name}'' already exists!"}, status=400)
        except Category.DoesNotExist:
            pass
        
        new_category = Category(name=new_category_name, creator=request.user)
        new_category.save()

        return JsonResponse({"status": "Success"}, status=200)


def login_view(request):
    # default login used from previous CSCI E-33a projects
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "Shopplist/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "Shopplist/login.html")


def logout_view(request):
    # default logout used from previous CSCI E-33a projects
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    # default register used from previous CSCI E-33a projects
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "Shopplist/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "Shopplist/register.html", {
                "message": "Username already taken."
            })
        login(request, user)

        # ADDITION - add default item categories for new user (default = admin created)
        admin = User.objects.get(id=1)
        default_categories = Category.objects.filter(creator=admin)
        for i in default_categories:
            i.pk = None
            i.creator = request.user
            i.save()

        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "Shopplist/register.html")


def item(request):
    '''Registers a new item for the user'''
    # if post, register new item
    if request.method == "POST":
        # load body request
        item = json.loads(request.body)

        # check if name already exits
        try:
            Item.objects.get(name=item["name"], creator=request.user)
            return JsonResponse({"status": "Item already exists!"}, status=400)
        except Item.DoesNotExist:
            pass

        new_item = Item(name=item["name"], creator=request.user)
        
        if item["category"]:       
            try:
                category = Category.objects.get(id = int(item["category"]), creator=request.user)
                new_item.category = category
            except Category.DoesNotExist:
                return JsonResponse({"status": "Invalid category"}, status=400)

        if item["aisle"]:
            new_item.aisle = item["aisle"]

        new_item.save()

        return JsonResponse({"status": "Success"}, status=200)

    # if put, update item
    if request.method == "PUT":
        # get request info
        updates = json.loads(request.body)

        # get item, update vals, save
        try:
            item_to_update = Item.objects.get(pk=updates["pk"], creator=request.user)
        except Item.DoesNotExist:
            return JsonResponse({"status": "Invalid item"}, status=400)

        # check if category exists
        try:
            category = Category.objects.get(name=updates["category"], creator=request.user)
        except Category.DoesNotExist:
            # new category
            if updates["category"] == '':
                category = None
            else:
                category = Category(name=updates["category"], creator=request.user)
                category.save()

        item_to_update.name = updates["name"]
        item_to_update.category = category
        item_to_update.aisle = updates["aisle"]
        item_to_update.save()

        # return updated values
        return JsonResponse(item_to_update.serialize(), safe=False, status=200)
    
    if request.method == "DELETE":
        # get item pk
        item_pk = json.loads(request.body)["pk"]
        try:
            item_to_delete = Item.objects.get(pk=int(item_pk), creator=request.user)
        except Item.DoesNotExist:
            return JsonResponse({"status": "Error"}, status=400)
        
        # delete
        item_to_delete.delete()
        return JsonResponse({"status": "Success"}, status=200)


def get_items(request, filter, order, direction):
    '''Returns all or active items in json. Orders by name , category or aisle;
    ascending or descending
    '''
    # order by category, need to specify by name as opposed to default primary key
    if order == "category":
        order = "category__name"

    # quantity col sorting
    if order == "quantity":
        if filter == "all":
            order = "purchases"
        if filter == "active":
            pass

    # make ordering case insensitive
    order = Lower(order)

    # set order to descending if specified
    if direction == "desc":
        order = order.desc()

    # choose secondary order
    if order == "name":
        secondary_order = Lower("category__name")
    else:
        secondary_order = Lower("name")

    if filter == "all":
        items = Item.objects.filter(creator=request.user).order_by(order, secondary_order)

    if filter == "active":
        items = Item.objects.filter(creator=request.user, active=True).order_by(order, secondary_order)
        
    return JsonResponse([item.serialize() for item in items], safe=False, status=200)


def list_status(request, pk=None):
    '''If pk included, revert item active status
    If put request, take list and remove items from list/increment purchases
    '''
    if request.method == "PUT":
        # get items
        items_list = json.loads(request.body)["items"]

        # change items to inactive and increment purchases
        for item in items_list:
            try:
                item_object = Item.objects.get(pk=item, creator=request.user)
                print(item_object)
            except Item.DoesNotExist:
                return JsonResponse({"status": "Invalid item"}, status=400)
            item_object.active = False
            item_object.purchases += 1
            item_object.price = items_list[item]["price"]

            # get unit object
            unit = Unit.objects.get(unit_abrev=items_list[item]["units"])
            item_object.unit = unit

            # save item
            item_object.save()

        return JsonResponse({"action": "updated"}, status=200)


    # get item by pk
    try:
        item = Item.objects.get(pk=pk, creator=request.user)
    except Item.DoesNotExist:
        return JsonResponse({"status": "Invalid item"}, status=400)

    # reverse active status
    if item.active:
        item.active = False
        action = f"'{item.name}' removed from shopping list"
    else:
        item.active = True
        action = f"'{item.name}' added to shopping list"
    item.save()

    return JsonResponse({"action": action}, status=200)

def get_units(request):

    units = list(Unit.objects.all().values_list("unit_abrev", flat=True))
    
    return JsonResponse({"list": units}, status=200)