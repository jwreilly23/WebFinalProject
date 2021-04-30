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

    // alert info
    alertMessage = document.querySelector('#item-alert');

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