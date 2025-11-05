
function searchProduct(value){
  value = value.toLowerCase();
  let products = document.querySelectorAll('.product');
  products.forEach((product) => {
    let productName = product.querySelector('.name').innerHTML.toLowerCase();
    let productDescription = product.querySelector('.productDescription').innerHTML.toLowerCase();
    if (productName.includes(value) || productDescription.includes(value)){
      product.classList.remove('searchHide')
    }
    else {
      product.classList.add('searchHide');
    }
  })
}

// Fetch Products Under the correct category and insert them into page
import { CONFIG } from './config.js';

async function getProducts() {

  var myHeaders = new Headers();

  myHeaders.append("Authorization", "Bearer " + CONFIG.sanityToken);

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  var location = window.location.href;
  var product_type = location.split("products.html?")[1]

  fetch("https://xe2xe39s.api.sanity.io/v2021-10-21/data/query/production?query=*%5B_type%20%3D%3D%20'products'%20%26%26%20title%20%3D%3D%20'" + product_type + "'%20%5D", requestOptions)
    .then(response => response.json())
    .then((result) => {
      console.log(result);
      if (result['result'][0].hasOwnProperty('Products')) {
        let products = result['result'][0]['Products'];

        var counter = 0

        products.forEach(product => {
          let product_id = product['_id']

          let image_ref = product['img']['asset']['_ref']
          let image_link = image_ref.replace("image-", "").replace("-png", ".png").replace("-jpg", ".jpg");
          let image_source = "https://cdn.sanity.io/images/xe2xe39s/production/" + image_link;

          let numberPrice = product['price']
          let name = product['name']
          let description = product['description'];
          let productUrl = product['productURL'];
          let extendedDescription = product['extraDescription']

          let priceParts = numberPrice.toString().split(".");
          let price = priceParts[0];
          let extraPrice = "";
          
          if (priceParts.length > 1){
            extraPrice = "." + priceParts[1];
            if (extraPrice.length == 2){
              extraPrice += "0";
            }
          }

          const productElm = document.createElement('div')
          productElm.classList.add('product')
          productElm.classList.add(product_type)
          productElm.style.transitionDelay = (counter * 0.05) + 's'

          const imgElm = new Image()
          imgElm.src = image_source

          const infoElm = document.createElement('div')
          infoElm.classList.add('product-info')
          infoElm.innerHTML = "<div class = 'name'>" + name + "</div> <div class = 'productDescription'>" + description + "</div><div class = 'buyProduct'><a href = '" + productUrl + "' target = '_blank'>Buy Here</a><div class = 'price'>£" + price + "<div class = 'extraPrice'>" + extraPrice + "</div></div></div>"

          productElm.appendChild(imgElm);
          productElm.appendChild(infoElm)

          let products = document.querySelector('.products');

          products.appendChild(productElm);

          productElm.addEventListener('click', () => openModal(image_source, name, price, description, productUrl, extendedDescription, extraPrice))

          observer.observe(productElm)

          counter += 1

        })

      }
      else {
        let products = document.querySelector('.products');

        products.innerHTML = "<div class = 'no-text'>No " + product_type + "'s found</div>"
      }
    })
    .catch(error => console.log('error', error));

}

getProducts();

let modal = document.querySelector('.productModal');

function closeModal() {
  modal.classList.remove('active');
}

function openModal(image_source, name, price, description, productUrl, extendedDescription, priceExtra) {

  let imgElm = modal.querySelector('#modal-img')
  let textSection = modal.querySelector('.productTextSection')
  let nameElm = textSection.querySelector('.productName')
  let priceElm = textSection.querySelector('.productPrice')
  let descriptionElm = textSection.querySelector('.productDescription')
  let productLinkElm = textSection.querySelector('.productLink')
  let extendedDescriptionElm = textSection.querySelector('.productExtendedDescription')
  let extraPriceElm = textSection.querySelector('.extraPrice');
  let addToDesk = textSection.querySelector('.addToDesignDesk');

  if (extendedDescription.length == 1) {
    extendedDescriptionElm.style.display = "none"
  }
  else {
    extendedDescriptionElm.style.display = ""
    extendedDescriptionElm.innerHTML = extendedDescription;
  }

  extraPriceElm.innerHTML = priceExtra;
  imgElm.src = image_source;
  nameElm.innerHTML = name;
  priceElm.innerHTML = "£" + price;
  priceElm.appendChild(extraPriceElm);
  descriptionElm.innerHTML = description;
  productLinkElm.href = productUrl;

  addToDesk.addEventListener('click', () => {
    window.location.href = "designDesk.html?start=" + name;  
  })

  modal.classList.add('active')
}