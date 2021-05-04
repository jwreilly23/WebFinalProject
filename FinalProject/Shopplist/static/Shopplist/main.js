// global vars
let currentView;

document.addEventListener('DOMContentLoaded', function() {

    // navlinks
    document.querySelector('a[name="active-list"]').addEventListener('click', activeView);
    document.querySelector('a[name="all-items"]').addEventListener('click', () => allItemsView());

    // by default load active view
    activeView();
    

});

function activeView() {
    // show active view only
    document.querySelector('#active-view').style.display = 'block';
    document.querySelector('#all-items-view').style.display = 'none';

    // set current view
    currentView = 'active';

    // flush items list, alerter
    document.querySelector('#active-items-list').innerHTML = '';

    // get items
    get_items('active');    


}

function allItemsView(alerter, status) {
    // show active view only
    document.querySelector('#active-view').style.display = 'none';
    document.querySelector('#all-items-view').style.display = 'block';
    alertHolder = document.querySelector('#alert-holder')
    alertHolder.style.display = 'none';
    alertMessage = document.querySelector('#item-alert');

    // set current view
    currentView = 'all';

    // flush items list, alerter
    document.querySelector('#all-items-list').innerHTML = '';
    alertMessage.innerHTML = '';

    // alert info
    alertMessage = document.querySelector('#item-alert');
    if (alerter != undefined) {
        // there is an alert, change class based on alert status and show alert
        alertMessage.setAttribute('class', `${status}`);
        alertMessage.innerHTML = alerter;
        alertHolder.style.display = 'block';
    }

    // get all items
    get_items('all');

    // form logic
    document.querySelector('form').onsubmit = function() {
        event.preventDefault();

        // read in form data
        let itemName = document.querySelector('input[name="name"]').value
        let itemCategory = document.querySelector('select[name="category"]').value
        let itemAisle = document.querySelector('input[name="aisle"]').value
        let token = document.querySelector('input[name="csrfmiddlewaretoken"]').value

        fetch('item', {
            method: 'POST',
            body: JSON.stringify({
                name: itemName,
                category: itemCategory,
                aisle: itemAisle
            }),
            headers: {
                // send csrf token
                'X-CSRFToken': token
            }
        })
        .then(response => response.json())
        .then(reply => {
            // if item already matching name, alert replace/edit/cancel

            // if success
            if (reply.status === 'Success') {
                alertMessage = `New item \'${itemName}\' added succcessfully`;
                alertStatus = 'alert alert-success';                
            } else {
                alertMessage = reply.status;
                alertStatus = 'alert alert-danger';                
            }
            // reload view with alert
            allItemsView(alertMessage, alertStatus);
        })
        .catch(error => {
            console.log('Error', error);
        });
    }
    
}

function addItemToView(item) {
    console.log(view);

    // create divs
    addedItem = document.createElement('tr');
    itemName = document.createElement('td');
    itemCategory = document.createElement('td');
    itemAisle = document.createElement('td');
    itemListStatus = document.createElement('td');
    itemActive = document.createElement('input');

    // purchases at some point ----------------------------------------------


    // set classes
    // addedItem.setAttribute('class', 'row item-holder')
    // itemName.setAttribute('class', 'col-4 item-name');
    // itemCategory.setAttribute('class', 'col-4 item-category');
    // itemAisle.setAttribute('class', 'col-4 item-aisle');

    // fill in content
    itemName.innerHTML = item.name;
    if (item.category === "None") {
        itemCategory.innerHTML = `<i>${item.category}</i>`;
    } else {
        itemCategory.innerHTML = item.category;
    }
    itemAisle.innerHTML = item.aisle;
    itemActive.setAttribute('type', 'checkbox');
    if (item.active === true) {
        itemActive.checked = true;
    }

    // set click for checkbox
    itemActive.addEventListener('click', () => {
        fetch(`list_status/${item.pk}`)
        .then(response => response.json())
        .then(result => {
            alertMessage = result.action;
            alertStatus = 'alert alert-info';
            allItemsView(alertMessage, alertStatus);
        })
    });


    // add to items to view
    itemListStatus.append(itemActive);
    addedItem.append(itemName, itemCategory, itemAisle, itemListStatus)
    itemsDisplay = document.querySelector(`#${currentView}-items-list`);
    itemsDisplay.append(addedItem);

}

function get_items(filter) {
    fetch(`get_items/${filter}`)
    .then(response => response.json())
    .then(data => {
        // add each to view
        console.log(data);

        // set which view to add to based on filter
        view = `#${filter}-items-list`;

        data.forEach(addItemToView);

        // zero item case ----------------------------------
    })
}