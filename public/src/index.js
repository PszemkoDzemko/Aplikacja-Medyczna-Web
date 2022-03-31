import { initializeApp } from "firebase/app"
import { getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  setPersistence, 
  browserLocalPersistence,
  onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs, setDoc, addDoc, doc, where, query } from "firebase/firestore"

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
const db = getFirestore();

let uid
//Sesja-----------------------------------------------------------
const index = document.querySelector('#Index');
if(index){
  onAuthStateChanged(auth,(user)=>{
    if(user){
      console.log(user)
      //użytkownik jest zalogowany
      //wrzuć go na mainpage
      window.location.href='mainpage.html';
      //i pobierz jego uid
      uid = user.uid;
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

//Rejestracja----------------------------------------------------------
const registerButton = document.querySelector('#registerBtn');
const registerName = document.querySelector('#registerName');
const registerSurname = document.querySelector('#registerSurname');
const registerEmail = document.querySelector('#registerEmail');
const registerPsw = document.querySelector('#registerPsw');
const registerPswRepeat = document.querySelector('#registerPsw-repeat');
const registerLocalization = document.querySelector('#registerLocalization');
const registerPWZ = document.querySelector('#registerPwz');
if(registerButton){
  registerButton.addEventListener('click',()=>{
      createUserWithEmailAndPassword(auth, registerEmail.value,registerPsw.value)
      .then((userCredential)=>{
        const newDoc = {
          uid: userCredential.user.uid,
          name: registerName.value,
          surname: registerSurname.value,
          nrRating: "0",
          rating: "0",
          specialization: "",
          localization: registerLocalization.value,
          PWZ: registerPWZ.value
        };
        setDoc(doc(db,"doctors", userCredential.user.uid),newDoc);
      })
      .catch((error)=>{
        const errorCode = error.code;
        const errorMessage = error.message;
      })
  })
}

//Logowanie------------------------------------------------------------
//pobieranie danych
const loginButton = document.querySelector('#loginBtn');
const loginEmail = document.querySelector('#emailLogin');
const loginPassword = document.querySelector('#passwordLogin');
if(loginButton){
  loginButton.addEventListener('click',()=>{
    //ustaw sesję lokalną
    setPersistence(auth, browserLocalPersistence)
    .then(()=>{
      //zaloguj mailem i hasłem
      signInWithEmailAndPassword(auth,loginEmail.value,loginPassword.value)
      .then((userCredential)=>{
      })
      .catch((error)=>{
        //tu są błędy jak coś nie działa np. złe hasło czy coś
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorMessage)
      })
    })
  })
}

//wyloguj się----------------------------------------------------------
const btnSignOut = document.querySelector('#SignOutBtn');
if(btnSignOut){
  btnSignOut.addEventListener('click',()=>{
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


//Wyświetalanie wizyt lekarza
const docTable = document.querySelector('#add-doctor-table');
function renderDocs(doc){
  //sprawdzenie czy docTable w ogóle istnieje
  //bo jak nie jesteśmy zalogowani to nie istnieje i będzie walić błędy
    if(docTable){
    let tr = document.createElement('tr');
    let data = document.createElement('td');
    let hour = document.createElement('td');
    data.textContent = doc.data().data;
    hour.textContent = doc.data().hour;
    tr.setAttribute('data-id',doc.id);
    tr.appendChild(data);
    tr.appendChild(hour);
    docTable.appendChild(tr);
  }
}
//Pobieranie z bazy wizyt lekarza i przekazywanie do funkcji wyżej
onAuthStateChanged(auth,(user)=>{
  if(user){
    //pobieranie id zalogowanego użytkownika
    uid = user.uid;
    //pobieranie z bazy danych do zmiennej wizyt gdzie id_doc równa się id naszego zalogowanego użytkownika
    const doctorCol = query(collection(db,"visits"), where("id_doc","==",uid));
  getDocs(doctorCol)
  .then((snapshot)=>{
  snapshot.docs.forEach((doc)=>{
      renderDocs(doc)
  })
})}
});
