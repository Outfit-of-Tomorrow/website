

// Fetch Post Information From sanity api and insert to page
import { CONFIG } from './config.js';

async function getPosts(){
            
    var myHeaders = new Headers();
    
    myHeaders.append("Authorization", "Bearer " + CONFIG.sanityToken);

    var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
    };

    var location = window.location.href;
    var post_id = location.split("post.html?")[1]
    console.log(post_id);
    console.log(window.location.href)

    let post = document.querySelector(".post");

    fetch("https://xe2xe39s.api.sanity.io/v2021-10-21/data/query/production?query=*%5B_type%20%3D%3D%20'blog'%20%26%26%20_id%20%3D%3D%20'" + post_id + "'%5D", requestOptions)
    .then(response => response.json())
    .then((result) => {
        console.log(result);
        var blog = result['result'][0];
        var title = blog['title']
        var description = blog['blog_description']
        var components = blog['BlogComponents']
        var creation_date = blog['_createdAt']
        var last_update = blog['_updatedAt']

        document.querySelector(".postTitle").innerHTML = title
        document.querySelector(".postDescription").innerHTML = description

        components.forEach((component) => {
            console.log(component);
            let component_type = component['_type']
            var listItem = component['listItem']
            if (component_type == 'image'){
                if (component.hasOwnProperty('asset')){
                    var image_ref = component['asset']['_ref']
                    var image_link = image_ref.replace("image-", "").replace("-png",".png").replace("-jpg",".jpg").replace("-webp",".webp");
                    var image_source = "https://cdn.sanity.io/images/xe2xe39s/production/" + image_link;
                    
                    var imgElm = new Image()
                    imgElm.src = image_source
                    imgElm.classList.add("post_img")

                    post.appendChild(imgElm);

                    observer.observe(imgElm);
                }
            }
            else if (component_type == 'block'){
                
                

                var children = component['children']
                var markDefs = component['markDefs']
                var style = component['style'].replace("normal","div")  // Style = H1, normal, H2 etc
                if (listItem == 'number' || listItem == 'bullet'){
                    style = 'li'
                }

                var blockElm = document.createElement(style)
                blockElm.classList.add('blockElm')
               
                if (listItem == 'number' || listItem == 'bullet'){
                    blockElm.classList.add('list')
                }

                children.forEach((child) => {
                    var child_type = child['_type'];
                    if (child_type == 'span'){
                        // underline, em, code, strong, strike-through

                        var childElm = document.createElement('span')

                        var child_text = child['text']
                        

                        var marks = child['marks']

                        marks.forEach((mark) => {
                            markDefs.forEach((markDef) => {
                                if (markDef['_key'] == mark){
                                    var markDefType = markDef['_type']
                                    if (markDefType == 'link' && markDef['href']){
                                        child_text = "<a href = '" + markDef['href'] + "'> " + child_text + "</a>"
                                    }
                                }
                            })
                            childElm.classList.add(mark)
                        })

                        childElm.innerHTML = child_text;

                        blockElm.appendChild(childElm);
                    }
                })

                post.appendChild(blockElm)

                observer.observe(blockElm);

            }
            else if (component_type == 'reference' && component.hasOwnProperty('_ref')){
                var ref = component['_ref'];

                var placeholderElm = document.createElement('div')
                placeholderElm.classList.add('product');
                placeholderElm.id = ref;

                post.appendChild(placeholderElm);

                observer.observe(placeholderElm);

                fetch ('https://xe2xe39s.api.sanity.io/v2021-10-21/data/query/production?query=*[_id == "'+ ref +'"]', requestOptions)
                .then(product_response => product_response.json())
                .then((product_result) => {
                    console.log(product_result);
                    var product = product_result['result'][0]
                    var product_id = product['_id'];

                    var product_container = document.getElementById(product_id)

                    var image_ref = product['img']['asset']['_ref']
                    var image_link = image_ref.replace("image-", "").replace("-png",".png").replace("-jpg",".jpg").replace("-webp",".webp");
                    var image_source = "https://cdn.sanity.io/images/xe2xe39s/production/" + image_link;
                
                    var product_name = product['name']
                    var product_price = product['price']
                    var product_url = product['productURL']
                    var product_description = product['description']

                    var imgElm = new Image()
                    imgElm.src = image_source

                    product_container.appendChild(imgElm);

                    product_container.innerHTML = product_container.innerHTML + "<div class = 'product_info'><div class = 'name'>" + product_name + "</div><div class = 'description'>" + product_description + "</div><div class = 'price'>£ " + product_price + "</div><a href = '"+ product_url +"'>Buy Now</a></div>"



                })
                .catch(error => console.log('error', error));
                // Display Product
            }
            else {

            }
        })
    })
    .catch(error => console.log('error', error));

}

getPosts();