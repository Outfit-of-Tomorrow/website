// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-analytics.js";
import { getFirestore, getDocs, orderBy, getDoc, doc , query, where, collection, addDoc, setDoc, deleteDoc} from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-firestore.js'
import { CONFIG } from './config.js';

const firebaseConfig = CONFIG.firebase;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

async function saveDesk(){

   
    console.log('saving');

    var modal = document.getElementById('save');
    var imgSrc = modal.getElementsByTagName('img')[0].src;
    var name = 'Test Name';
    var email = getCookie("email");
    var button = modal.querySelector('.modalButton');

    let products = []
    let deskImages = document.querySelector('.deskImages')
    for (const product of deskImages.children){
        var productLink = product.querySelector('.desk_img').id;
        var productImageLink = product.querySelector('.desk_img').src;
        var productName = product.id;
        products.push({Name: productName, Link: productLink, ImageLink: productImageLink })
    }

    console.log(products);

    const bodyInner = modal.querySelector('.modalBody').innerHTML;
    modal.querySelector('.modalBody').innerHTML = '<div class = "loading"></div>'
    
    const byteSize = new Blob([imgSrc]).size;

    var maxBytes = 1000000

    // If Img Source is above maximum size we need to split it
    if (byteSize > maxBytes){

     
        console.log('bigger');

        var splitStrings = imgSrc.match(/.{1,1000000}/g);
        console.log(splitStrings);

        // If not there assign all splits with split true
        // Then split ref = custom id
        // 

        // Recursive Loop To create unique splitId
        var unique = false;
        while (unique == false) {

            // Create Split Id
            var splitId = Math.random();

            // Create Query To Check for existence of split Id
            const splitQuery = query(collection(db, "outfit-of-tomorrow"), where("splitId", "==", splitId));

            // Run query
            const querySnapshot = await getDocs(splitQuery);

            unique = true;

            querySnapshot.forEach((doc) => {
                unique = false;
            });
        
        }

        console.log(splitId);

        
        splitStrings.forEach(async function (string, i) {
            
            await addDoc(collection(db, "outfit-of-tomorrow"), {
                name: name, email:email, imgSrc: string, splits: 'true', splitId: splitId, splitNumber: i, products: products
            });

        })


    }
    else{

        await addDoc(collection(db, 'outfit-of-tomorrow'),{
            name: name, email: email, imgSrc: imgSrc, splits: 'none', products: products
        })

    }


    button.classList.add('complete');
    button.innerHTML = 'Design Saved <i class="fa-solid fa-check"></i>'

    modal.querySelector('.modalBody').innerHTML = bodyInner;

    setTimeout(() => {
        button.classList.remove('complete');
        button.innerHTML = 'Save <i class="fa-solid fa-floppy-disk"></i>'
    }, 3000);

}

async function populateDesigns(){

    var modal = document.getElementById('designs');
    var body = modal.querySelector('.modalBody');

    // Create a reference to the cities collection
    const dbRef = collection(db, "outfit-of-tomorrow");

    // Create a query against the collection.
    var userEmail = getCookie("email");
    const q = query(dbRef, where("email", "==", userEmail));

    const querySnapshot = await getDocs(q);

    var counter = 0;

    await querySnapshot.forEach(async (designDoc) => {

        console.log(designDoc.id, " => ", designDoc.data());

        const data = designDoc.data();

        var name = data.name;
        var email = data.email;
        var splits = data.splits;
        var products = data.products;

        if (splits == 'true'){

            console.log('splitsTrue');
            
            if (data.splitNumber != 0){
                return
            }

            console.log('splitHere');

            var splitId = data.splitId;

            // Run Query for splitId
            const splitQuery = query(collection(db, "outfit-of-tomorrow"), where("splitId", "==", splitId) , orderBy('splitNumber'));
            // Run query
            const querySnapshotSplitId = await getDocs(splitQuery);

            var source = '';

            querySnapshotSplitId.forEach((splitDoc) => {
                source += splitDoc.data().imgSrc;
            });


        }
        else {
            var source = data.imgSrc;
        }

        var productLinks = document.createElement('div');
        productLinks.classList.add('productLinks');
        products.forEach((product) => {

            var link = document.createElement('a');
            link.classList.add('productLink');
            // link.innerHTML = '<i class="fa-solid fa-arrow-up-right-from-square"></i>' + product.Name;
            link.href = product.Link;
            link.innerHTML = product.Name;
            link.target = "_blank";
            
            var linkImg = document.createElement('img');
            linkImg.src = product.ImageLink;

            link.appendChild(linkImg)
            productLinks.appendChild(link)

        })



        var designElm = document.createElement('div');
        designElm.classList.add('design');
        designElm.classList.add('hide');
        designElm.classList.add( "id" + designDoc.id)
        designElm.innerHTML = '<div class = "designName">' + name + '</div><div class ="designContent"> <div class="designImage"><img src="' + source + '"></div><div class="designOptions"><div class="designOption share"><i class="fa-solid fa-share"></i></div> <div class="designOption delete"><i class="fa-solid fa-trash"></i></div></div></div>'
        designElm.appendChild(productLinks);

        var deleteButton = designElm.querySelector('.delete');
        deleteButton.addEventListener('click',async () => {
            console.log('delete ' + designDoc.id);

            var designContainer = document.querySelector('.id' + designDoc.id )
            designContainer.parentElement.removeChild(designContainer);

            await deleteDoc(doc(db, "outfit-of-tomorrow", designDoc.id));
            
            
        })

        var shareButton = designElm.querySelector('.share');
        shareButton.addEventListener('click',async () => {
            console.log('share' + designDoc.id);

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
            navigator.share(shareData);
            
        })
        // Hide Loader
        body.querySelector('.loading').classList.add('hide');

        // Add Design To Body
        body.appendChild(designElm);

        counter += 1;

    });
    // console.log(counter);
    // if (counter == 0){
    //     console.log('here');
    //     body.innerHTML = '<div class = "no-text">It seems you have no saved designs.</div>'
    // }

}

async function deleteDesign(id) {
    console.log('delete' + id);
}

document.getElementById('loadDesigns').addEventListener('click',() => populateDesigns())
document.getElementById('save').querySelector('.modalButton').addEventListener('click',() => saveDesk())