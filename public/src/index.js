import { initializeApp } from "firebase/app"
import { getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  setPersistence, 
  browserLocalPersistence,
  onAuthStateChanged } from "firebase/auth";
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
const auth = getAuth();
const db = getFirestore()

const index = document.querySelector('#Index');
//sprawdzanie czy jest zalogowany
if(index){
  onAuthStateChanged(auth,(user)=>{
    if(user){
      //użytkownik jest zalogowany
      //wrzuć go na mainpage
      window.location.href='mainpage.html';
      //i pobierz jego uid
      const uid = user.uid
    }else{
    }
  });
}else{
  onAuthStateChanged(auth,(user)=>{
    if(user){
    }else{
      //nie jest zalogowany to go wywal na index
      window.location.href='index.html';
    }
  });
}

//Logowanie
//pobieranie danych
const loginButton = document.querySelector('#btnLogin');
const email = document.querySelector('#emailLogin');
const password = document.querySelector('#passwordLogin');
if(loginButton!==null){
  loginButton.addEventListener('click',()=>{
    //ustaw sesję lokalną
    setPersistence(auth, browserLocalPersistence)
    .then(()=>{
      //zaloguj mailem i hasłem
      signInWithEmailAndPassword(auth,email.value,password.value)
      .then((userCredential)=>{
        //po zalogowaniu przejdź na mainpage
        window.location.href='mainpage.html';
      })
      .catch((error)=>{
        //tu są błędy jak coś nie działa np. złe hasło czy coś
        const errorCode = error.code;
        const errorMessage = error.message;
      })
    })
  })
}

//wyloguj się
const btnSignOut = document.querySelector('#btnSignOut');
if(btnSignOut!==null){
  btnSignOut.addEventListener('click',()=>{
    console.log("elo");
    setPersistence(auth,browserLocalPersistence)
    .then(()=>{
      signOut(auth).then(()=>{
        window.location.href='index.html';
      }).catch((error)=>{
        //nie udało się wylogować czy coś
      })
    })
  })
}

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


