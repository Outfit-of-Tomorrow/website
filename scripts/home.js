// Fetch All Product Categores from sanity API and Insert them into page
import { CONFIG } from './config.js';

async function getFeaturedPost(){
            
    var myHeaders = new Headers();
    
    myHeaders.append("Authorization", "Bearer " + CONFIG.sanityToken);

    var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
    };

    let backgroundImage = document.querySelector('#featured_image')
    let title = document.querySelector('#featured_title')
    let link = document.querySelector('#featured_link')

    fetch("https://xe2xe39s.api.sanity.io/v2021-10-21/data/query/production?query=*%5B(_type%20%3D%3D%20'blog'%20%26%26%20featured%20%3D%3D%20true)%5D%5B0%5D")
    .then(response => response.json())
    .then((result) => {

        if (result.result == null){

            fetch("https://xe2xe39s.api.sanity.io/v2021-10-21/data/query/production?query=*%5B(_type%20%3D%3D%20'blog'%20)%5D%20%7C%20order(_createdAt%20desc)%5B0%5D")
            .then(response => response.json())
            .then((result) => {
                
                result = result.result

                var title_content = result.title;

                let image_ref = result['blog_cover_image']['asset']['_ref']
                let image_link = image_ref.replace("image-", "").replace("-png",".png").replace("-jpg",".jpg").replace("-webp",".webp");
                let image_source = "https://cdn.sanity.io/images/xe2xe39s/production/" + image_link;
                
                let postId = result._id

                backgroundImage.src = image_source;
                title.innerHTML = title_content;
                link.href = './post.html?' + postId

            })
            .catch(error => console.log('error', error));

        }
        else {

            result = result.result

            var title_content = result.title;

            let image_ref = result['blog_cover_image']['asset']['_ref']
            let image_link = image_ref.replace("image-", "").replace("-png",".png").replace("-jpg",".jpg").replace("-webp",".webp");
            let image_source = "https://cdn.sanity.io/images/xe2xe39s/production/" + image_link;
            
            let postId = result._id

            backgroundImage.src = image_source;
            title.innerHTML = title_content;
            link.href = './post.html?' + postId
        }

    })
    .catch(error => console.log('error', error));

}

getFeaturedPost();