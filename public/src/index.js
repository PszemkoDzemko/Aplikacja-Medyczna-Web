import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getFirestore, collection, getDocs } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyALxo_cxtuu6aIhrMCxmyG6ZvzcpypQSaA",
  authDomain: "medical-app-25f81.firebaseapp.com",
  databaseURL: "https://medical-app-25f81-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "medical-app-25f81",
  storageBucket: "medical-app-25f81.appspot.com",
  messagingSenderId: "1027058281878",
  appId: "1:1027058281878:web:34445352cd5508e0c581b7",
  measurementId: "G-VB8LW8MP2F"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore()

const cafeList = document.querySelector('#cafe-list');
console.log(cafeList)

function renderCafe(doc){
  let li = document.createElement('li');
  let name = document.createElement('span');
  let surname = document.createElement('span');
  name.textContent = doc.data().name;
  surname.textContent = doc.data().surname;

  li.setAttribute('data-id',doc.id);
  li.appendChild(name);
  li.appendChild(surname);

  cafeList.appendChild(li);
}

const colRef = collection(db,"users")
getDocs(colRef)
.then((snapshot)=>{
    snapshot.docs.forEach((doc)=>{
       renderCafe(doc)
       console.log(doc)
    })
})


