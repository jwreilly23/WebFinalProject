**Shopplist Overview**

Shopplist is a web application where you can create a virtual shopping list, and keep track of all previous items you have purchased. 

**First Log In**

There is nothing to see unless logged in, as this is intended as a personal help tool. After registering a new account if needed and logging in for the first time, you will be taken to the active items view. This is the default view and is your active shopping list for items you need to buy. As this is your first time, there will be no items shown and you should proceed to the all items page, where new items can be created. 

Here you can add items by name, and optionally include a category and/or aisle. A standard 5 categories are included for all new users, but categories can also be removed or added via the settings page.

**Getting Started**

Enter a few items to start generating your inventory. Two items with the same name cannot be created so as to avoid unintentional repeats, but any item can be edited or deleted via the right-most column on either the active or all items list pages. While on this page, notice you can click the ‘Item Name’, ‘Category’, ‘Aisle’, and ‘Purchases’ column headers to sort your items by the respective column. Clicking the header a second time will reverse the order. Once you have a few items, click the checkbox in the ‘On List’ column to add the item to your active shopping list. Now click the ‘Active List’ tab at the top to head to your active shopping list. 

**Active Shopping List**

All items checked on the ‘All Items’ page will be displayed here. Notice on this page the purchases column has been replaced by an amount column, where you can enter the quantity you intend to purchase and the price per unit, pound, or ounce. These options can be changed as needed, and the estimate total at the top will change as you make updates. As you shop you can check off the items as you get them, and again you can sort the items by name, category, or aisle as you go. Once finished, click the ‘Finish Shopping’ button to remove all checked items from your active shopping list (and any unchecked will remain). Any price or unit updates made to purchased items will be saved for the next time they are added to the active shopping list, and each time an item is purchased the purchased value will be incremented on the ‘All Items’ page.

**Additional Settings**

For some additional settings, click the ‘Settings’ tab at the top. Here you can remove or add categories, as well as toggle dark mode. Your preference for dark mode on or off will be saved for the next time you log in.

**File Breakdown** 

To run through the page with more populated info, use

Username: jwreilly

Password: password

**models.py**

The models present in this file are User, Category, Unit, and Item. The User model is the default AbstractUser model provided by Django, with an additional field called darkmode which stores the users darkmode preference as true or false. The Category model has a name and creator. The unit model has a unit type and unit abbreviation – the end user only sees the abbreviations and the unit types are defined by the admin, some more options could be added if needed. The item model is the most significant and stores the bulk of the item data, including the creator, name, category, aisle, whether it’s active (on the shopping list), how many times its been purchased, and what its unit type and price is.

**urls.py**

Here the url patterns are stored, separated by standard and API routes. In some instances there are similar paths, where one path includes an optional piece of data (e.g. settings and settings/darkmode=<str:darkmode>). 

**views.py**

The ItemForm is a Django form created using the Item model for creating new items. This is used for the default index route, to populate the add new item form. The index route renders index.html with two pieces of data, the item form and the users darkmode preference. The settings route allows users to change their darkmode preference, get all categories for the settings page, delete categories, or add categories. The login, logout, and registered were reused from the previous CSCI-E33a projects, the only change being some addition to the register logic. When a user registers, the admin categories are duplicated as categories for the new user. This gives each user some standard starting categories, but also allows for them to be deleted if desired.

The item route lets the user register a new item, update an item, or delete an item. When a user updates an item, if they change the category to something that does not currently exist, it will create that as a new category and assign it that item. The get items route returns a json list of items depending on a few criteria – a filter, order, and direction. The filter can be one of two things, all or active. Order can be category, name, quantity, or aisle, and is defaulted to name in the main.js file. If direction is desc, it changes to sort by descending. A secondary sorting is defaulted to name, unless the primary ‘order’ is name, in which case the secondary sorting is by category name.

The list status route takes a list of items and removes them from the active list, increments the purchases, and saves the latest price and units for each item. Alternately if a pk is provided, it reverses the active list status of the item.

The get units route gives the default unit options for item prices. I chose to make this an API route so that options could be changed by the admin via the admin interface and reflected on the web page.

**admin.py**

This has the models to include on the admin page, with some UI tweaking for the item and category models.

**Login.html, register.html**

Reused from the previous CSCI-E33a projects.

**layout.html**

HTML layout, with the stylesheets, bootstrap scripts, and navbar included. For the body and navbar, there is logic determining if the user has darkmode set to true. If so, it changes the classes to the darkmode. This is to save the user preferences for subsequent logins or page refreshes.

**index.html**

This includes the main.js script and main site views. The main divs are alert-holder (this is used across multiple views to display various alerts), the active-view, the all-items-view, the settings-view, and the list-table. List-table is used on both the active and all items views, as the table structure is very similar.

**main.js**

There are a handful of global variables for tracking the current view, any alerts, the CSRF token, purchased items and items to be deleted, the standard unit options, the cart total, and the item sorting direction. For the item sorting direction, I decided to just have it alternate between asc and desc each time get\_items is fetched (technically only desc makes the order descending, asc was chosen for readability). I thought about more elegant (and complicated) ways to sort columns, but decided this was sufficient as if it sorts the opposite way from what you want, you can click again and it reverses the order almost instantly. 

After the DOM content is loaded, a few things happen. The navbar tabs are assigned event listeners to render the respective pages, and the item column headers are given event listeners to sort get items based on the value of the header (using datasets). Other assignments include the finish shopping button, alert functionality, the CSRF token value, cart total element, and the standard units are retrieved and stored. By default the active view gets rendered.

The active view hides/shows the views needed, modifies the table column headers that change based on active/all, then gets all the items and adds them to the view. The all items view does the same as active, plus displays an alert if the view was rendered with one specified . It also establishes the form logic in order to add new items. 

The settings view gets all categories for the user to display, and lets users delete categories, add categories, or toggle darkmode. If a user turns darkmode on or off, their preference is saved as part of the respective User model, such that the next time they log in or refresh it takes effect.

addItemToView is used by both active and all item views, and is what adds each items info to the view, as well as buttons to edit and delete the item.

getItems generates the list of items to add to the respective view. getItems is always called with a filter and order, where filter is either all or active, and the order is asc or desc (switches back and forth each time the function is called). 

updateList is used once the user is finished shopping, to remove from the list/increment purchases/save price and unit info.

The cartTotaller is called any time the price or quantity of an item changes on the active view, and it updates the cart total based on the change. If the total goes up it flashes red, if it goes down it flashes green.
