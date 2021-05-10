from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("settings", views.settings, name="settings"),
    path("settings/darkmode=<str:darkmode>", views.settings, name="settings_darkmode"),

    # API Routes
    path("item", views.item, name="item"),
    path("get_items/<str:filter>/<str:order>/<str:direction>", views.get_items, name="get_items"),
    path("list_status", views.list_status, name="list_status"),
    path("list_status/<int:pk>", views.list_status, name="list_status"),
    path("get_units", views.get_units, name="get_units")
]