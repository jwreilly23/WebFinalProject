// global vars

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

    // flush items list
    document.querySelector('#items-list').innerHTML = '';


}

function allItemsView(alerter) {
    // show active view only
    document.querySelector('#active-view').style.display = 'none';
    document.querySelector('#all-items-view').style.display = 'block';
    alertHolder = document.querySelector('#alert-holder')
    alertHolder.style.display = 'none';
    if (alerter != undefined) {
        alertHolder.style.display = 'block';
    }

    // flush items list
    document.querySelector('#items-list').innerHTML = '';

    // alert info
    alertMessage = document.querySelector('#item-alert');

    // get all items
    fetch('get_items/all')
    .then(response => response.json())
    .then(data => {
        // add each to view
        console.log(data);

        data.forEach(addItemToView);

        // error case
    })

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
                // update alert
                alertMessage.setAttribute('class', 'alert alert-success');
                alertMessage.innerHTML = `New item '${itemName}' added succcessfully`;

                // reload view with alert
                allItemsView(reply);
            } else {
                alertMessage.setAttribute('class', 'alert alert-danger');
                alertMessage.innerHTML = reply.status;

                // reload view with alert
                allItemsView(reply);

            }
        })
        .catch(error => {
            console.log('Error', error);
        });
    }
    
}

function addItemToView(item) {
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
            allItemsView(result.action);
        })
    });


    // add to all-items-view
    itemListStatus.append(itemActive);
    addedItem.append(itemName, itemCategory, itemAisle, itemListStatus)
    itemsDisplay = document.querySelector('#items-list');
    itemsDisplay.append(addedItem);

}