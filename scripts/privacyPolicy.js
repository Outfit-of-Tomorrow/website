

// Fetch Post Information From sanity api and insert to page
import { CONFIG } from './config.js';

async function getPrivacyPolicy(){
            
    var myHeaders = new Headers();
    
    myHeaders.append("Authorization", "Bearer " + CONFIG.sanityToken);

    var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
    };

    var post = document.querySelector('.posts')

    fetch("https://xe2xe39s.api.sanity.io/v2021-10-21/data/query/production?query=*%5B_type%20%3D%3D%20%22pageContent%22%20%26%26%20pageTitle%20%3D%3D%20%22Privacy%20Policy%22%5D")
    .then(response => response.json())
    .then((result) => {

        var components = result.result[0]['pageContent']

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
        })
    })
    .catch(error => console.log('error', error));

}

getPrivacyPolicy();