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

async function newsSignup(e){

    e.preventDefault();

    let email = document.getElementById('email').value
    let fname = document.getElementById('fname').value
    let lname = document.getElementById('lname').value

    //  Check for existing user with email
    const queryEmail = query(collection(db, "news-signups"), where("Email", "==", email));

    const querySnapshot = await getDocs(queryEmail);

    let alreadySignedUp = false;

    querySnapshot.forEach((doc) => {
        alreadySignedUp = true;
    })
       
    if (!alreadySignedUp){
        await addDoc(collection(db, "news-signups"), {
            FirstName: fname, SecondName: lname, Email: email
        });
    }

    document.getElementById('form').innerHTML = '<div class="confirmMessage">Thank you, you have successfully subscribed to the Outfit of Tomorrow newsletter!</div>'

}


document.getElementById('form').addEventListener('submit',(e) => newsSignup(e))
