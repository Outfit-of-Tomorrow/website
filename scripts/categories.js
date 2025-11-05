

// Fetch All Product Categores from sanity API and Insert them into page
import { CONFIG } from './config.js';

async function getCategories(){
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

    let container = document.querySelector(".categories");

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
        console.log(result);
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
            console.log(category);
            if (!category['_id'].startsWith('drafts')){
                var categoryElm = document.createElement('div');
                categoryElm.classList.add("category");

                if (category.hasOwnProperty('cover_image')){
                    var image_ref = category['cover_image']['asset']['_ref']
                    var image_link = image_ref.replace("image-", "").replace("-png",".png").replace("-jpg",".jpg").replace("-webp",".webp");
                    var image_source = "https://cdn.sanity.io/images/xe2xe39s/production/" + image_link;
                    
                    var imgElm = new Image()
                    imgElm.src = image_source

                    categoryElm.appendChild(imgElm);
                }

                var category_name = document.createElement('div');
                category_name.classList.add("title");
                category_name.classList.add("fade");
                category_name.innerHTML = category['title']

                categoryElm.appendChild(category_name);

                container.appendChild(categoryElm);

                observer.observe(categoryElm);
                observer.observe(category_name)

                categoryElm.addEventListener("click", () => {
                    console.log(category['title'])
                    window.location.replace("/products.html?" + category['title'])
                })

            }

        })
    })
    .catch(error => console.log('error', error));

}

getCategories();