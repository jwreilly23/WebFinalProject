// global vars
let currentView;
let alertHolder;
let alertMessage;
let token;
let purchasedItems = [];

document.addEventListener('DOMContentLoaded', function() {

    // navlinks
    document.querySelector('a[name="active-list"]').addEventListener('click', activeView);
    document.querySelector('a[name="all-items"]').addEventListener('click', () => allItemsView());

    // make alert message, token global
    alertHolder = document.querySelector('#alert-holder');
    alertMessage = document.querySelector('#alert-message');
    token = document.querySelector('input[name="csrfmiddlewaretoken"]').value;

    // by default load active view
    activeView();
    

});

function activeView() {
    // show active view only
    document.querySelector('#active-view').style.display = 'block';
    document.querySelector('#all-items-view').style.display = 'none';
    alertHolder.style.display = 'none';

    // set current view
    currentView = 'active';

    // flush items list, alerter
    document.querySelector('#active-items-list').innerHTML = '';
    alertMessage.innerHTML = '';

    // get items
    get_items('active');    
}

function allItemsView(alerter) {
    // show active view only
    document.querySelector('#active-view').style.display = 'none';
    document.querySelector('#all-items-view').style.display = 'block';
    alertHolder.style.display = 'none';

    // set current view
    currentView = 'all';

    // flush items list, alerter
    document.querySelector('#all-items-list').innerHTML = '';
    // alertMessage.innerHTML = '';

    // show alert if view loaded with alert
    if (alerter != undefined) {
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

            if (reply.status === 'Success') {
                alertMessage.innerHTML = `New item \'${itemName}\' added succcessfully`;
                alertMessage.setAttribute('class', 'alert alert-success');
            } else {
                alertMessage.innerHTML = reply.status;
                alertMessage.setAttribute('class', 'alert alert-danger');
            }

            // reload view with alert
            allItemsView(alertMessage);
        })
        .catch(error => {
            console.log('Error', error);
        });
    }
    
}

function addItemToView(item) {
    // create divs
    let addedItem = document.createElement('tr');
    let itemName = document.createElement('td');
    let itemCategory = document.createElement('td');
    let itemAisle = document.createElement('td');
    let itemListStatus = document.createElement('td');
    let itemActive = document.createElement('input');
    let itemEdit = document.createElement('button');

    // purchases at some point ----------------------------------------------


    // set classes
    // addedItem.setAttribute('class', 'row item-holder')
    // itemName.setAttribute('class', 'col-4 item-name');
    // itemCategory.setAttribute('class', 'col-4 item-category');
    // itemAisle.setAttribute('class', 'col-4 item-aisle');

    // fill in content
    itemName.innerHTML = item.name;
    itemCategory.innerHTML = item.category;
    // ------------------------------------------------------------------------keep a none vs a null?
    // if (item.category === "None") {
    //     itemCategory.style.fontStyle = 'italic';
    // }
    itemAisle.innerHTML = item.aisle;
    itemActive.setAttribute('type', 'checkbox');
    if (currentView ==='all' && item.active === true) {
        itemActive.checked = true;
    }

    // edit button
    itemEdit.setAttribute('class', 'btn btn-link');
    itemEdit.innerHTML = 'Edit';

    // set click for edit button
    itemEdit.addEventListener('click', function() {
        if (itemEdit.innerHTML === 'Edit') {
            // set button to save
            itemEdit.innerHTML = 'Save';

            // change item info fields to text area prefilled with current value
            let currentInfo = [itemName, itemCategory, itemAisle];

            for (field of currentInfo) {
                // store value and clear
                let fieldVal = field.innerHTML;
                field.innerHTML = '';

                // insert a text area
                let editArea = document.createElement('textarea');
                field.append(editArea);

                // prefill with value
                editArea.innerHTML = fieldVal;
            }
        }
        else if (itemEdit.innerHTML === 'Save') {
            // set button to edit
            itemEdit.innerHTML = 'Edit';

            // save updated values
            fetch('item', {
                method: 'PUT',
                body: JSON.stringify({
                    pk: item.pk,
                    name: itemName.children[0].value,
                    category: itemCategory.children[0].value,
                    aisle: itemAisle.children[0].value,
                }),
                headers: {
                    // send csrf token
                    'X-CSRFToken': token
                }
            })
            .then(response => response.json())
            .then(update => {
                console.log(update);
                itemName.innerHTML = update.name;
                itemCategory.innerHTML = update.category;
                itemAisle.innerHTML = update.aisle;
            })
            .catch(error => {
                console.log('Error', error);
            })

            // get rid of text areas
            
            // alert('yeeeeet');

        }

    });

    // set click for checkbox
    itemActive.addEventListener('click', function() {
        // if active (shopping) view
        if (currentView === 'active') {
            // toggle row line-through on click, and add/removed to purchasedItems array
            if (addedItem.style.textDecoration === '') {
                addedItem.style.textDecoration = 'line-through';
                // make item id only?  ------------------------------------------------------------------
                purchasedItems.push(item);
            } else {
                addedItem.style.textDecoration = '';
                // remove item from purchasedItems
                const itemIndex = purchasedItems.indexOf(item);
                if (itemIndex != -1) {
                    purchasedItems.splice(itemIndex, 1);
                }
            }
        }

        // if all items view
        if (currentView === 'all') {
            fetch(`list_status/${item.pk}`)
            .then(response => response.json())
            .then(result => {
                // show alert notifying change
                alertMessage.innerHTML = result.action;
                alertMessage.setAttribute('class', 'alert alert-info');
                document.querySelector('#alert-holder').style.display = 'block';
            })
            .catch(error => {
                console.log('Error', error);
            })
        }
    });

    // add to items to view
    itemListStatus.append(itemActive, itemEdit);
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
    .catch(error => {
        console.log('Error', error);
    })
}