from django.shortcuts import render
from django.urls import reverse
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django import forms

import json
# from django.contrib.auth.decorators import login_required

from .models import User, Category, Item, Shoplist

class ItemForm(forms.ModelForm):
    '''New item form generated from Item model'''
    class Meta:
        model = Item
        fields = ("name", "category", "aisle")
        # widgets = {
            # 'category': forms.TypedChoiceField(coerce=str, empty_value="Category")
        # }

def index(request):
    # redirect to login if not logged in
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse("login"))


    # item form for user categories only
    item_form = ItemForm()
    item_form.fields["category"] = forms.ModelChoiceField(Category.objects.filter(creator=request.user), empty_label="None", required=False)

    return render(request, "Shopplist/index.html", {
        "item_form": item_form
    })


def login_view(request):
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
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):

    
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

        # add default item categories for new user (default = admin created) ------------------------------
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
            test = Item.objects.get(name=item["name"])
            return JsonResponse({"status": "Item already exists"}, status=400)
            # add link to edit ----------------------------------------------------------------------------------------
        except Item.DoesNotExist:
            pass


        new_item = Item(name=item["name"], creator=request.user)
        
        if item["category"]:       
            try: 
                # if inputted category already exists ---------------------------------------- for now, has to exist.
                category = Category.objects.get(id = int(item["category"]))
                new_item.category = category
            except Category.DoesNotExist:
                # new category
                # new_category = Category(name=item["category"])
                # new_category.save()
                return JsonResponse({"status": "Invalid category"}, status=400)

        if item["aisle"]:
            new_item.aisle = item["aisle"]

        new_item.save()

        return JsonResponse({"status": "Success"}, status=200)

    # if put, update item
    if request.method == "PUT":
        pass

        
    else:
        return HttpResponseRedirect(reverse("index"))


def get_items(request, filter):

    if filter == "all":
        pass

    if filter == "active":
        pass

    pass