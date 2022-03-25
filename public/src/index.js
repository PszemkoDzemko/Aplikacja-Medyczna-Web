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

// const userTable = document.querySelector('#add-users-table');

// function renderUsers(doc){
//   let tr = document.createElement('tr');
//   let name = document.createElement('td');
//   let surname = document.createElement('td');
//   let pesel = document.createElement('td');
//   let phone = document.createElement('td');
//   let address = document.createElement('td');
//   name.textContent = doc.data().name;
//   surname.textContent = doc.data().surname;
//   pesel.textContent = doc.data().pesel;
//   phone.textContent = doc.data().phone;
//   address.textContent = doc.data().address;
  

//   tr.setAttribute('data-id',doc.id);
//   tr.appendChild(name);
//   tr.appendChild(surname);
//   tr.appendChild(pesel);
//   tr.appendChild(phone);
//   tr.appendChild(address);

//   userTable.appendChild(tr);
// } 

// const docTable = document.querySelector('#add-doctor-table');

// function renderDocs(doc){
//   let tr = document.createElement('tr');
//   let name = document.createElement('td');
//   let surname = document.createElement('td');
//   let specialization = document.createElement('td');
//   let img = document.createElement('img');


//   name.textContent = doc.data().name;
//   surname.textContent = doc.data().surname;
//   specialization.textContent = doc.data().specialization
//   img.src = doc.data().img

//   tr.setAttribute('data-id',doc.id);
//   tr.appendChild(name);
//   tr.appendChild(surname);
//   tr.appendChild(specialization);
//   tr.appendChild(img);

//   docTable.appendChild(tr);
// } 

const userCol = collection(db,"users")
getDocs(userCol)
.then((snapshot)=>{
    snapshot.docs.forEach((doc)=>{
      //  renderUsers(doc)
    })
})

const doctorCol = collection(db,"doctors")
getDocs(doctorCol)
.then((snapshot)=>{
  snapshot.docs.forEach((doc)=>{
    // renderDocs(doc)
  })
})


