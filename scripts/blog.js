


// Fetch all blog posts from sanity api and insert them to page
import { CONFIG } from './config.js';

async function getPosts(){
            
    var myHeaders = new Headers();
    
    myHeaders.append("Authorization", "Bearer " + CONFIG.sanityToken);

    var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
    };

    fetch("https://xe2xe39s.api.sanity.io/v2021-10-21/data/query/production?query=*[_type=='blog'] | order(sort_overide desc, _createdAt desc)", requestOptions)
    .then(response => response.json())
    .then((result) => {
        console.log(result);
        let posts  = result['result'];
        posts.forEach((post) => {
            console.log(post);

            let image_ref = post['blog_cover_image']['asset']['_ref'];
            let image_link = image_ref.replace("image-", "").replace("-png",".png").replace("-jpg",".jpg").replace("-webp",".webp");
            let image_source = "https://cdn.sanity.io/images/xe2xe39s/production/" + image_link;

            let blog_title = post['title'];
            let blog_description = post['blog_description'];
            let show = post['show']

            if (show == true && !post['_id'].startsWith("drafts")) {
                console.log(blog_description)
                console.log(blog_title);
                console.log(image_source)

                const blogElm = document.createElement('div')
                blogElm.classList.add('post')

                const imgElm = new Image()
                imgElm.src = image_source

                const infoElm = document.createElement('div')
                infoElm.classList.add('blog-info')
                infoElm.innerHTML = "<div class = 'title'>" + blog_title + "</div> <div class = 'description'>" + blog_description + "</div>"

                const readElm = document.createElement('a')
                readElm.href = "./post.html?" + post['_id']
                readElm.classList.add('read')
                readElm.innerHTML = "Read More"

                blogElm.appendChild(imgElm);
                infoElm.appendChild(readElm)
                blogElm.appendChild(infoElm)

                let posts = document.querySelector('.blog_posts');

                posts.appendChild(blogElm);

                observer.observe(blogElm)

            }
        
        })
    })
    .catch(error => console.log('error', error));

}

getPosts();