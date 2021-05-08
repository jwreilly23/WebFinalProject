// global vars
let currentView;
let alertHolder;
let alertMessage;
let token;
let purchasedItems = [];
let orderDirection = "asc";
let unitOptions = [];
let cartTotal;

document.addEventListener('DOMContentLoaded', function() {

    // navlinks
    document.querySelector('a[name="active-list"]').addEventListener('click', () => activeView());
    document.querySelector('a[name="all-items"]').addEventListener('click', () => allItemsView());

    // item sorting buttons
    document.querySelectorAll('button[name="sort"]').forEach(function(button) {
        button.onclick = function() {
            if (currentView === "active") {
                activeView(button.dataset.sort);
            } else if (currentView === "all") {
                allItemsView(undefined, button.dataset.sort);
            }
        }
    });

    // finish shopping button
    document.querySelector('button[name="finish-shopping"]').addEventListener('click', () => {
        let action = confirm('Remove all checked items from shopping list?');
        if (action === true) {
            updateList(purchasedItems);
        } 
    })

    // make alert message, token, cart total global
    alertHolder = document.querySelector('#alert-holder');
    alertMessage = document.querySelector('#alert-message');
    token = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
    cartTotal = document.querySelector('#estimate-total');

    // get and store units
    fetch('get_units')
    .then(response => response.json())
    .then(result => {
        unitOptions = result.list;
    })
    .catch(error => {
        console.log('Error', error);
    });

    // by default load active view
    activeView();    

});

function activeView(order='name') {
    // show active view only
    document.querySelector('#active-view').style.display = 'block';
    document.querySelector('#all-items-view').style.display = 'none';
    alertHolder.style.display = 'none';

    // set current view, clear purchased items list
    currentView = 'active';

    // flush items list, alerter, set headers for changing cols
    document.querySelector('#items-list').innerHTML = '';
    document.querySelector('th[name="check-col"]').innerHTML = 'Checked';
    document.querySelector('th[name="quantity-col"] > span').innerHTML = 'Amount';
    alertMessage.innerHTML = '';

    // get items
    // let myPromise = new Promise(function(myResolve, myReject) {
    //     let result = getItems('active', order);

    //     if (result === "done") {
    //         myResolve("OK");
    //     } else {
    //         myReject("Error");
    //     }
    // });

    // myPromise.then(
    //     function(value) {
    //         cartTotaller();
    //     },
    //     function(error) {
    //         console.log('FUCK ME');
    //     }
    // );
    
    
    
    getItems('active', order)

    // .then(pageLoaded => {
    //     console.log(pageLoaded);
    //     // estimated total at top
    //     cartTotal = document.querySelector('#estimate-total');
    //     // get all quantities
    //     cartTotal.innerHTML = 'yeet';
    //     cartTotaller();
    // });
    
    
}

function allItemsView(alerter, order='name') {
    // show active view only
    document.querySelector('#active-view').style.display = 'none';
    document.querySelector('#all-items-view').style.display = 'block';
    alertHolder.style.display = 'none';

    // set current view
    currentView = 'all';

    // flush items list, alerter, set changing col headers
    document.querySelector('#items-list').innerHTML = '';
    document.querySelector('th[name="check-col"]').innerHTML = 'On List';
    document.querySelector('th[name="quantity-col"] > span').innerHTML = 'Purchases';
    // alertMessage.innerHTML = '';

    // show alert if view loaded with alert
    if (alerter != undefined) {
        alertHolder.style.display = 'block';
    }

    // get all items
    getItems('all', order);

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
    let quantCol =  document.createElement('td');

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
                // update row values
                itemName.innerHTML = update.name;
                itemCategory.innerHTML = update.category;
                itemAisle.innerHTML = update.aisle;
            })
            .catch(error => {
                console.log('Error', error);
            })
        }
    });

    // quantity columns
    if (currentView === 'all') {
        quantCol.innerHTML = item.purchases;
    } else if (currentView === 'active') {
        // create cols for quantity, unit, price
        let amountRow = document.createElement('div');
        amountRow.setAttribute('class', 'row');

        let amountCol1 = document.createElement('div');
        let amountCol2 = document.createElement('div');
        let amountCol3 = document.createElement('div');
        amountCol1.setAttribute('class', 'col-3');
        amountCol2.setAttribute('class', 'col-6 input-group');
        amountCol3.setAttribute('class', 'col-3');

        // quantity
        let itemQuantity = document.createElement('input');
        setMultAttributes(itemQuantity, [['type', 'number'], ['max', '99'], ['min', '0'], ['class', 'item-quantity']]);
        itemQuantity.value = 1;
        // update cart total as quantity changes
        itemQuantity.setAttribute('onchange', 'cartTotaller()')

        // price prepend
        let pricePrepend = document.createElement('div');
        pricePrepend.setAttribute('class', 'input-group-prepend');
        let pricePrependText = document.createElement('span');
        pricePrependText.setAttribute('class', 'input-group-text')
        pricePrependText.innerHTML = '@';
        pricePrepend.append(pricePrependText);

        // price
        let itemPrice = document.createElement('input');
        setMultAttributes(itemPrice, [['type', 'number'], ['max', '99'], ['min', '0.25'], ['value', item.price], ['step', '0.25'], ['class', 'form-control']]);
        // update cart total as quantity changes
        itemPrice.setAttribute('onchange', 'cartTotaller()')

        //price append
        let priceAppend = document.createElement('div');
        priceAppend.setAttribute('class', 'input-group-append');
        let priceAppendText = document.createElement('span');
        priceAppendText.setAttribute('class', 'input-group-text');
        priceAppendText.innerHTML = 'per';
        priceAppend.append(priceAppendText);

        // units
        let itemUnit = document.createElement('select');
        for (option of unitOptions) {
            let newOption = document.createElement('option');
            newOption.value = newOption.innerHTML = option;
            itemUnit.append(newOption);
        }
        // set value to item unit as saved
        itemUnit.value = item.unit;

        amountCol1.append(itemQuantity);
        amountCol2.append(pricePrepend, itemPrice, priceAppend);
        amountCol3.append(itemUnit);
        amountRow.append(amountCol1, amountCol2, amountCol3);
        quantCol.append(amountRow);
    }


    // checkbox
    itemActive.setAttribute('type', 'checkbox');
    if (currentView === 'all' && item.active === true) {
        itemActive.checked = true;
    }
    if (currentView === 'active' && purchasedItems.includes(item.pk)) {
        // item is on purchased list, check box
        itemActive.checked = true;
        itemName.style.textDecoration = itemCategory.style.textDecoration = itemAisle.style.textDecoration = 'line-through';
    }

    // set click for checkbox
    itemActive.addEventListener('click', function() {
        // if active (shopping) view
        if (currentView === 'active') {
            // toggle row line-through on click, and add/removed to purchasedItems array
            if (itemName.style.textDecoration === '') {
                itemName.style.textDecoration = itemCategory.style.textDecoration = itemAisle.style.textDecoration = 'line-through';
                purchasedItems.push([item.pk, amountCol1]);
            } else {
                itemName.style.textDecoration = itemCategory.style.textDecoration = itemAisle.style.textDecoration = '';
                // remove item from purchasedItems
                const itemIndex = purchasedItems.indexOf(item.pk);
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
    addedItem.append(itemName, itemCategory, itemAisle, quantCol, itemListStatus)
    itemsDisplay = document.querySelector(`#items-list`);
    itemsDisplay.append(addedItem);

}

function getItems(filter, order) {
    fetch(`get_items/${filter}/${order}/${orderDirection}`)
    .then(response => response.json())
    .then(data => {
        // add each to view
        console.log(data);

        data.forEach(addItemToView);

        // zero item case ----------------------------------


        // reverse sorting direction
        if (orderDirection === "asc") {
            orderDirection = "desc";
        } else {
            orderDirection = "asc";
        }

        // set cart total
        cartTotaller();
    })
    .catch(error => {
        console.log('Error', error);
    })
}

function updateList(items) {
    fetch('list_status', {
        method: 'PUT',
        body: JSON.stringify({
            items: purchasedItems
        }),
        headers: {
            // send csrf token
            'X-CSRFToken': token
        }
    })
    .then(response => {
        activeView();
    })
    .catch(error => {
        console.log('Error:', error);
    })

}

function setMultAttributes(element, inputList) {
    for (pair of inputList) {
        element.setAttribute(pair[0], pair[1]);
    }
}

function cartTotaller() {
    // for each row, multiply quantity by price
    let cartPrices = document.querySelectorAll('input[class="form-control"]');
    let cartQuantities = document.querySelectorAll('input[class="item-quantity"]');
    let cartQuantList = [];

    // get all quantities
    for (quant of cartQuantities) {
        cartQuantList.push(quant.value);
    }
    
    // get all prices
    let cartPriceList = [];
    for (price of cartPrices) {
        cartPriceList.push(price.value);
    }

    // add them up
    let totalAmount = 0;
    for (let i = 0; i < cartPriceList.length; i++) {
        totalAmount += Number(cartQuantList[i]) * Number(cartPriceList[i]);
    }
    
    // formatting
    const totalFormatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        style: 'currency',
        currency: 'USD'
    });

    // update cart total
    cartTotal.innerHTML = totalFormatter.format(totalAmount);
}
