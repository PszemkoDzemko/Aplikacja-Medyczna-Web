import { async } from "@firebase/util";
import { initializeApp } from "firebase/app"
import { getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  setPersistence, 
  browserLocalPersistence,
  onAuthStateChanged,
  sendEmailVerification } from "firebase/auth";
import { getFirestore, collection, getDocs, setDoc, doc, where, query } from "firebase/firestore"

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


//Sesja-----------------------------------------------------------
const index = document.querySelector('#Index');
const register = document.querySelector('#register');
if(index){
  onAuthStateChanged(auth,(user)=>{
    if(user){
      console.log(user)
      //użytkownik jest zalogowany
      //wrzuć go na mainpage
      window.location.href='mainpage.html';
    }else{
    }
  });
}else if(register){
  onAuthStateChanged(auth,(user)=>{
  if(user){
}else{}
});}
else{
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
const registerSpecialization = document.querySelector('#registerSpec');
const registerPWZ = document.querySelector('#registerPwz');
  if(registerButton){
    registerButton.addEventListener('click',()=>{
      if(registerPsw.value === registerPswRepeat.value){
        createUserWithEmailAndPassword(auth, registerEmail.value,registerPsw.value)
        .then((userCredential)=>{
          addDoctorDetails(userCredential.user.uid)
          sendEmailVerification(userCredential.user)
          .then(()=>{})
        })
        .catch((error)=>{
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorMessage)
        })
      }else{
        //błąd hasła nie są takie same
        console.log("hasła nie są takie same")
      }
    })
  }
  async function addDoctorDetails(id){
    const newDoc = {
      uid: id,
      name: registerName.value,
      surname: registerSurname.value,
      nrRating: "0",
      rating: "0", 
      specialization: registerSpecialization.value,
      localization: registerLocalization.value,
      PWZ: registerPWZ.value
    };
    console.log(newDoc)
    await setDoc(doc(db,"doctors", id),newDoc);
    window.location.href='mainpage.html';
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
        //tu trzeba sprawdzić czy istnieje taki lekarz i jak nie to wylogować gościa
        //albo dać opcje założenia konta lekarza
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
    const uid = user.uid;
    //pobieranie z bazy danych do zmiennej wizyt gdzie id_doc równa się id naszego zalogowanego użytkownika
    const doctorCol = query(collection(db,"visits"), where("id_doc","==",uid));
  getDocs(doctorCol)
  .then((snapshot)=>{
  snapshot.docs.forEach((doc)=>{
      renderDocs(doc)
  })
})}
});
