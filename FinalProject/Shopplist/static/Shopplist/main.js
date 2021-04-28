// global vars

document.addEventListener('DOMContentLoaded', function() {

    // navlinks
    document.querySelector('a[name="active-list"]').addEventListener('click', activeView);
    document.querySelector('a[name="all-items"]').addEventListener('click', allItemsView);

    // by default load active view
    activeView();
    

});

function activeView() {
    // show active view only
    document.querySelector('#active-view').style.display = 'block';
    document.querySelector('#all-items-view').style.display = 'none';


}

function allItemsView() {
    // show active view only
    document.querySelector('#active-view').style.display = 'none';
    document.querySelector('#all-items-view').style.display = 'block';
    

}