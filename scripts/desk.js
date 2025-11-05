//  Grab Modal Cover From Dom
import { CONFIG } from './config.js';

let modalCover = document.querySelector('.modalCover')

// Set initial variable to hold number of clothing pieces currently active
window.numberOfItems = 0

// Function For Side Button Clicks To togal modals
function toggleModalId(id){

    if (id == "help"){
        document.getElementById(id).querySelector(".helpModalContent").style.transform = "translate(0)";
        if (document.getElementById(id).classList.contains('active')){
        
            let deskContent = document.querySelector('.deskContent');

            for (const child of deskContent.children){
                if (!child.classList.contains('buttons') && !child.classList.contains('button')){
                    child.classList.add('show')
                }
            }

        }
    }

    document.getElementById(id).classList.toggle('active');
    modalCover.classList.toggle('active');
    document.querySelector('.menuContainer').classList.toggle('hidden');
    document.querySelector('.helpButton').classList.toggle('hidden');


    if (id == 'save' || id == 'designs'){

        var loggedIn = checkLoggedIn();
        if (loggedIn == false){
            showLogin(id);
        }
        else {
            hideLogin(id);
            if (id == 'save'){
                saveDesk();
            }
            else {
                loadDesigns();
            }
        }
    }

    if (id == 'share'){
        shareDesk();
    }
}

// Set Up event listener so if user clicks off of modal it will close
modalCover.addEventListener('click',() => {
    let modals = document.querySelectorAll('.modal');
    modals.forEach((modal) => modal.classList.remove('active'));
    modalCover.classList.remove('active');
    document.querySelector('.menuContainer').classList.remove('hidden');
    document.querySelector('.helpButton').classList.remove('hidden');

})

// Make Sure Buttons Always show after load animation
let buttons = document.querySelectorAll('.button');
setTimeout(() => {
    buttons.forEach((button) => button.classList.add('show'))
    console.log('here');
}, 1000);


// Function Used To Fetch Products From Sanity Api And Populate the Modal
async function populateAddModal(){

    let start_target = null;
    if (window.location.href.includes('start=')){
      start_target = window.location.href.split("start=")[1].replaceAll('%20', ' ')
    }
    else {
      start_target = null;
    }

    console.log('Start Target', start_target)

    // Validate config is loaded
    if (!CONFIG || !CONFIG.sanityToken) {
        console.error('Sanity token is missing. Check that config.js is properly generated.');
        return;
    }

    var myHeaders = new Headers();

    myHeaders.append("Authorization", "Bearer " + CONFIG.sanityToken);

    var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
    };

    let container = document.querySelector("#add").querySelector(".categories");

    let product_container = document.querySelector('.container')

    console.log(container);

    fetch("https://xe2xe39s.api.sanity.io/v2021-10-21/data/query/production?query=*[_type == 'products']", requestOptions)
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => {
                console.error('Sanity API Error:', error);
                throw new Error(`API Error: ${error.message || response.statusText}`);
            });
        }
        return response.json();
    })
    .then((result) => {
        if (!result || !result['result']) {
            console.error('Invalid API response:', result);
            return;
        }
        let categories = result['result']
        if (!Array.isArray(categories)) {
            console.error('Expected array but got:', categories);
            return;
        }
        categories.forEach((category) => {

            if (!category['_id'].startsWith('drafts')){
                
                var categoryName = category['title'].replace(/\s+/g, '-');
                var displayCategoryName = category['title']

                var arrow = document.createElement('div');
                arrow.classList.add('arrow');
                arrow.innerHTML = '<i class="fa-solid fa-angle-right"></i>';

                var category_name = document.createElement('div');
                category_name.classList.add("category_title");
                category_name.innerHTML = displayCategoryName;

                var image_ref = category['cover_image']['asset']['_ref'];
                var image_link = image_ref.replace("image-", "").replace("-png",".png").replace("-jpg",".jpg").replace("-webp",".webp");
                var image_source = "https://cdn.sanity.io/images/xe2xe39s/production/" + image_link;

                var imgElm = document.createElement('img');
                imgElm.classList.add('product');
                imgElm.src = image_source;

                var imgContainer = document.createElement('div');
                imgContainer.classList.add('img_container')
                imgContainer.appendChild(imgElm)

                var categoryElm = document.createElement('div');
                categoryElm.classList.add("category");
                categoryElm.id = categoryName;
                // categoryElm.appendChild(imgContainer)
                categoryElm.appendChild(category_name);
                categoryElm.appendChild(arrow)
                categoryElm.addEventListener('click',() => {
                    toggleCategory(categoryName);
                })

                container.appendChild(categoryElm);

                if (category.hasOwnProperty('Products')){

                    var products = category['Products']

                    category_name.innerHTML = displayCategoryName + '<div class = "categoryTag"> (' + products.length + ') </div> ';

                    products.forEach((product) => {

                        if(product.hasOwnProperty('pngImg')){


                            var image_ref = product['pngImg']['asset']['_ref'];
                            var image_link = image_ref.replace("image-", "").replace("-png",".png").replace("-jpg",".jpg").replace("-webp",".webp");
                            var image_source = "https://cdn.sanity.io/images/xe2xe39s/production/" + image_link;
                            
                            var imgelm = document.createElement('img');
                            imgelm.classList.add(categoryName);
                            imgelm.classList.add('product-img');
                            
                            imgelm.src = image_source;
                            imgelm.loading = 'lazy';
                            imgelm.addEventListener('click',() => {
                                addImageDesk(image_source,product['name'],product['productURL'],product['price']);
                            })

                            product_container.appendChild(imgelm);

                            var product_name = product['name'];
                            if (product_name == start_target){
                                addImageDeskStart(image_source,product_name,product['productURL'],product['price'])
                            }

                        }
                    })
                }

        
            }

        })
    })
    .catch(error => console.log('error', error));
}

populateAddModal();

// Function called when category is selected in add item modal
function toggleCategory(id){

    document.querySelector('.product_modal').classList.toggle('active')
    if (document.querySelector('.product_modal').classList.contains('active')){
        document.querySelector('.products').id = id
        document.querySelector('.currentProductTitle').innerHTML = id.replaceAll('-', ' ')

        let container = document.querySelector('.container');
        let products = container.querySelectorAll('.product-img')
        products.forEach((product) => {
            console.log(product.classList);

            if (product.classList.contains(id)){
                product.style.display = "";
            }
            else {
                product.style.display = "none";
            }
        })
    }
    else {
        document.querySelector('.products').id = null
    }
    
}

// Function For Adding Image To Desk
function addImageDesk(src,name,url,price){

    let content = document.querySelector('.deskContent');
    let deskImages = content.querySelector('.deskImages');

    content.querySelector('.title').style.display = 'none';
    content.querySelector('.description').style.display = 'none';
    content.querySelector('.add').style.display = 'none';

    document.querySelectorAll('.button')[1].classList.remove('hide')
    document.querySelectorAll('.button')[2].classList.remove('hide')

    toggleModalId('add')

    var img_container = document.createElement('div');
    img_container.classList.add('image_container')
    img_container.id = name;
    img_container.innerHTML =       document.getElementById('image_options_template').innerHTML;

    var img = document.createElement('img');
    img.src = src;
    img.id = url;
    img.classList.add('desk_img')

    img_container.appendChild(img);

    // Drag Element For Mouse
    dragElement(img_container);

    dragElementMobile(img_container);

    // Add Image To Desk
    deskImages.appendChild(img_container)

    // Set Desk To Active
    deskImages.classList.add('active');

    window.numberOfItems += 1
}

function addImageDeskStart(src,name,url,price){
    let content = document.querySelector('.deskContent');
    let deskImages = content.querySelector('.deskImages');

    content.querySelector('.title').style.display = 'none';
    content.querySelector('.description').style.display = 'none';
    content.querySelector('.add').style.display = 'none';

    document.querySelectorAll('.button')[1].classList.remove('hide')
    document.querySelectorAll('.button')[2].classList.remove('hide')

    var img_container = document.createElement('div');
    img_container.classList.add('image_container')
    img_container.id = name;
    img_container.innerHTML =       document.getElementById('image_options_template').innerHTML;

    var img = document.createElement('img');
    img.src = src;
    img.id = url;
    img.classList.add('desk_img')

    img_container.appendChild(img);

    // Drag Element For Mouse
    dragElement(img_container);

    dragElementMobile(img_container);

    // Add Image To Desk
    deskImages.appendChild(img_container)

    // Set Desk To Active
    deskImages.classList.add('active');

    window.numberOfItems += 1
}

// Function To Delete Image From Desk
function deleteItem(elmnt){
    var container = elmnt.parentElement.parentElement;
    var desk = container.parentElement;
    desk.removeChild(container);
    window.numberOfItems  = window.numberOfItems - 1
}

// Function To Increase Size Of Image
function increaseImage(elmnt){
    var img = elmnt.parentElement.nextElementSibling;
    var newHeight = img.offsetHeight + 50;
    img.style.maxHeight = newHeight + 'px';
}

// Function To Decrease Size Of Image
function decreaseImage(elmnt){
    var img = elmnt.parentElement.nextElementSibling;
    var newHeight = img.offsetHeight - 50;
    if (newHeight > 100){
        img.style.maxHeight = newHeight + 'px';
    }
}

// Send Image to back
function sendBack(elmt){
    var imageContainer = elmt.parentElement.parentElement;
    var deskImages = imageContainer.parentElement;
    
    deskImages.removeChild(imageContainer)
    deskImages.prepend(imageContainer);
}

// Function to view product through url
function viewImage(elmnt){
    var url = elmnt.parentElement.nextElementSibling.id;
    window.open(url, '_blank');
}

// Function For Making Element Draggable Mouse
function dragElement(elmnt) {

    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }


}


// Function For Making Element Draggable Touch Screen
function dragElementMobile(elmnt){

    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    elmnt.ontouchstart = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        console.log(e);
        // get the mouse cursor position at startup:
        pos3 = e.changedTouches[0].clientX;
        pos4 = e.changedTouches[0].clientY;
        document.ontouchend = closeDragElement;
        // call a function whenever the cursor moves:
        document.ontouchmove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        
        // calculate the new cursor position:
        pos1 = pos3 - e.changedTouches[0].clientX;
        pos2 = pos4 - e.changedTouches[0].clientY;
        pos3 = e.changedTouches[0].clientX;
        pos4 = e.changedTouches[0].clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.ontouchend = null;
        document.ontouchmove = null;
    }

}

function saveDesk(){

    var modal = document.getElementById('save');

    if (window.numberOfItems > 0){
        previewDesign(modal);
    }
    else{
        modal.querySelector('.modalBody').innerHTML =  "<div class = 'loggedIn' ><div class = 'googleText'>Add an item to the design desk before you can save.</div></div>"
    }


}

// Function Called When Share Button Pressed
function shareDesk(){

    var modal = document.getElementById('share');

    if (window.numberOfItems > 0){
        previewDesign(modal);
    }
    else{
        modal.querySelector('.modalBody').innerHTML =  "<div class = 'loggedIn' ><div class = 'googleText'>Add an item to the design desk before you can share.</div></div>"
    }


}

// Function To Download Image In Current Modal
function downloadImage(id){

    
    console.log('here');
    var modal = document.getElementById(id);
    var image = modal.querySelector('.modalBody').getElementsByTagName('img')[0];
    var source = image.src
    
    var a = document.createElement('a');
    a.style.display = 'none';
    a.download = source;
    a.href = source;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    var button = modal.querySelector('.download');
    button.classList.add('complete');
    button.innerHTML = 'Sucess <i class="fa-solid fa-check"></i>'

    setTimeout(() => {
        button.classList.remove('complete');
        button.innerHTML = 'Download <i class="fa-solid fa-download"></i>'
    }, 3000);

}

// Function To Share Image
async function shareImg(source){

    var modal = document.getElementById('share');
    var image = modal.querySelector('.modalBody').getElementsByTagName('img')[0];
    var source = image.src

    async function shareImage() {
        const response = await fetch(source);
        const blob = await response.blob();
        const filesArray = [
            new File(
            [blob],
            'myDesign.jpg',
            {
                type: "image/jpeg",
                lastModified: new Date().getTime()
            }
            )
            
        ];
        const shareData = {
            title: 'My Design - outfit-of-tomorrow',
            // text: 'Some Text',
            files: filesArray,
        };

        if (navigator.canShare){
          navigator.share(shareData);
        }
        else {
          modal.querySelector('.modalBody').innerHTML = "<div style = 'color: rgba(155,0,0,0.8); font-size: 16px; text-align: center'> Unable to share image. Sorry <i class='fa-solid fa-triangle-exclamation'></i></div>"
        }
    }

    shareImage();
}


async function previewDesign(modal){

    // Grab body of modal
    var body = modal.querySelector('.modalBody');

    var buttons = modal.querySelectorAll('.modalButton');
    buttons.forEach((button) => {
        button.style.pointerEvents = 'none';
    })

    // Reset Content Of Modal
    body.innerHTML = "<div class='loading'></div><canvas id = 'canvas'></canvas>";

    // Set Up Desk To Be Photographed
    var desk = document.querySelector('.desk');
    desk.style.backgroundImage = 'radial-gradient(transparent,transparent)';
    desk.style.filter = 'blur(0)';
    desk.style.opacity = '1';

    // Filter Function for centents of desk capture
    function filter (node) {
        if (node.tagName == 'DIV'){
            if (node.classList == 'button show'){
                return false;
            }
            return true;
        }
        return node.tagName == 'IMG';
    }

    // Grab Image Then Crop It
    grabImage(document.querySelector('.desk'), filter, true, modal);


}


// Function To Grab Image From Dom And Crop
function grabImage(target, filter, crop, modal){

    htmlToImage.toPng(target, {filter: filter, backgroundColor: 'white'})
    .then(function (dataUrl) {

        desk.style.backgroundImage = '';
        desk.style.filter = '';
        desk.style.opacity = '';

        if (crop == true){
            
            var body = modal.querySelector('.modalBody');

            // load the image:
            var image = new Image();
            image.src = dataUrl;

            var canvas = body.getElementsByTagName("canvas")[0];
            console.log(body);
            console.log(canvas);
            var context = canvas.getContext("2d");
            var data = {};
        
            image.onload = function () {
                canvas.width = this.width;
                canvas.height = this.height;
        
                context.drawImage(this, 0, 0, image.width, image.height);
        
                cropImage();
            };

             // crop image whitespace:
            function cropImage() {
                data = context.getImageData(0, 0, image.width, image.height).data;

                var top    = scanY(true);
                var bottom = scanY(false);
                var left   = scanX(true);
                var right  = scanX(false);

                var new_width = right - left;
                var new_height = bottom - top;

                canvas.width = new_width;
                canvas.height = new_height;

                context.drawImage(image, left, top, new_width, new_height, 0, 0, new_width, new_height);

                // Create Image From Canvas
                var imgUrl    = canvas.toDataURL();
                var imageDone = document.createElement('img')
                imageDone.src = imgUrl;
               
                // if (modal.id == 'save'){
                //     body.innerHTML = '<input class = "saveName" type = "text" placeholder = "Enter Design Name">';
                //     var input = body.querySelector('.saveName')
                //     input.focus();
                // }
                // else {body.innerHTML = ""}
                
                body.innerHTML = ""

                body.appendChild(imageDone);

                // document.querySelector('.loading').classList.add('hide');

                var buttons = modal.querySelectorAll('.modalButton');
                buttons.forEach((button) => {
                    button.style.pointerEvents = '';
                })

            }

            // get pixel RGB data:
            function getRGB(x, y) {
                return {
                    red:   data[((image.width * y) + x) * 4],
                    green: data[((image.width * y) + x) * 4 + 1],
                    blue:  data[((image.width * y) + x) * 4 + 2]
                };
            }

            // check if pixel is white:
            function isEmpty(rgb) {
                return rgb.red == 255 && rgb.green == 255 && rgb.blue == 255;
            }

            // scan top and bottom edges of image:
            function scanY(top) {
                var offset = (top) ? 1 : -1;

                for (var y = ((top) ? 0 : image.height - 1); ((top) ? (y < image.height) : (y > -1)); y += offset) {
                    for (var x = 0; x < image.width; x++) {
                        if (!isEmpty(getRGB(x, y))) {
                            return y;
                        }
                    }
                }

                return null;
            }

            // scan left and right edges of image:
            function scanX(left) {
                var offset = (left) ? 1 : -1;

                for (var x = ((left) ? 0 : image.width - 1); ((left) ? (x < image.width) : (x > -1)); x += offset) {
                    for (var y = 0; y < image.height; y++) {
                        if (!isEmpty(getRGB(x, y))) {
                            return x;
                        }
                    }
                }

                return null;
            }
        
           

        }

    })
    .catch(function (error) {
        console.error('oops, something went wrong!', error);
    });
}

// Initialize Google Login + Create Button

window.onload = function () {
  
    google.accounts.id.initialize({
      client_id: '955115297209-8tualu3rurgn6e39g9nfbag6fl4uda1o.apps.googleusercontent.com',
      callback: handleCallbackResponse
    });
    // google.accounts.id.prompt();

    google.accounts.id.renderButton(
        document.getElementById('designs').querySelector('.googleButton'),
        {theme: 'filled_black', size: 'large', width: '250px', }
    )

    google.accounts.id.renderButton(
        document.getElementById('save').querySelector('.googleButton'),
        {theme: 'filled_black', size: 'large', width: '250px', }
    )
};

// Callback Response After User Logs In
function handleCallbackResponse(response){

    var userObject = jwt_decode(response.credential);

    var name = userObject.name;
    var email = userObject.email;

    document.cookie = 'email=' + email;

    var modal = document.querySelector('.modal.active');

    hideLogin('save');
    hideLogin('designs');

    if (modal.id == 'save'){
        // Remove Login Text
        saveDesk();
    }
    else if (modal.id == 'designs'){
        // Remove Login Text
        loadDesigns();
    }

}

// Function To Check If User Is Logged In
function checkLoggedIn(){
    let email = getCookie("email");
    if (email != "") {
        // User Logged In
        console.log('Logged In');
        return email;
    } else {
        console.log('Not Logged In')
        return false;
    }
    
}

// Function To Get Cookie By It's Name From Dom
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}

// Funtion To delete cookie from dom
function delete_cookie( name, path, domain ) {
    if( getCookie( name ) ) {
      document.cookie = name + "=" +
        ((path) ? ";path="+path:"")+
        ((domain)?";domain="+domain:"") +
        ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }
  }


// Function To Hide Login Buttons
function hideLogin(id){

    var modal = document.getElementById(id);
    var login = modal.querySelector('.loggedIn');
    var notLogin = modal.querySelector('.notLogin');

    if (login == null || notLogin == null){
        return 
    }

    login.classList.add('hide');
    notLogin.classList.remove('hide');

    if (id == 'save'){
        var button = modal.querySelector('.modalButton')
        button.classList.remove('hide')
    }
}

// Function To Show Login Buttons
function showLogin(id){

    var modal = document.getElementById(id);
    var login = modal.querySelector('.loggedIn');
    var notLogin = modal.querySelector('.notLogin');

    if (login == null || notLogin == null){
        return 
    }

    login.classList.remove('hide');
    notLogin.classList.add('hide');

    if (id == 'save'){
        var button = modal.querySelector('.modalButton')
        button.classList.add('hide')
    }

}

// Sign Out Function for google login
function signOut(){
    delete_cookie('email', '', '');
    delete_cookie('name=', '', '');
    console.log('coocie Deleted')
    console.log(document.cookie)
}

// Function To load users Designs Into Designs Modal
function loadDesigns(){
    var modal = document.getElementById('designs');
    var body = modal.querySelector('.modalBody');

    body.innerHTML = "<div class='loading'></div>";

    var button = document.getElementById('loadDesigns');
    button.click();

    console.log('load');
}

// Save Design
function saveDesign(){
    var modal = document.getElementById('save');
    var body = modal.querySelector('.modalBody');
    var img = body.getElementsByTagName('img')[0];

    var imgSrc = img.src;
    var email = getCookie('email');

    // Removed logging of sensitive data (email)
}


