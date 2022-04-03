import { initializeApp } from "firebase/app"
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  reload
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, getDocs, setDoc, doc, where, query, deleteDoc, updateDoc, waitForPendingWrites } from "firebase/firestore"

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
//inicjalizacja firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

//Sesja-----------------------------------------------------------
const index = document.querySelector('#Index');
const register = document.querySelector('#register');
if (index) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log(user)
      //użytkownik jest zalogowany
      //wrzuć go na mainpage
      window.location.href = 'mainpage.html';
    } else {
    }
  });
} else if (register) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
    } else { }
  });
}
else {
  onAuthStateChanged(auth, (user) => {
    if (user) {
    } else {
      //nie jest zalogowany to go wywal na index
      window.location.href = 'index.html';
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
if (registerButton) {
  registerButton.addEventListener('click', () => {
    if (registerPsw.value === registerPswRepeat.value) {
      createUserWithEmailAndPassword(auth, registerEmail.value, registerPsw.value)
        .then((userCredential) => {
          addDoctorDetails(userCredential.user.uid)
          sendEmailVerification(userCredential.user)
            .then(() => { })
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorMessage)
        })
    } else {
      //błąd hasła nie są takie same
      console.log("hasła nie są takie same")
    }
  })
}
async function addDoctorDetails(id) {
  const newDoc = {
    uid: id,
    name: registerName.value,
    surname: registerSurname.value,
    nrRating: "0",
    rating: "0",
    specialization: registerSpecialization.value,
    localization: registerLocalization.value,
    PWZ: registerPWZ.value,
    img: ""
  };
  console.log(newDoc)
  await setDoc(doc(db, "doctors", id), newDoc);
  window.location.href = 'mainpage.html';
}

//Logowanie------------------------------------------------------------
//pobieranie danych
const loginButton = document.querySelector('#loginBtn');
const loginEmail = document.querySelector('#emailLogin');
const loginPassword = document.querySelector('#passwordLogin');
if (loginButton) {
  loginButton.addEventListener('click', () => {
    //ustaw sesję lokalną
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        //zaloguj mailem i hasłem
        signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value)
          .then((userCredential) => {
            //tu trzeba sprawdzić czy istnieje taki lekarz i jak nie to wylogować gościa
            //albo dać opcje założenia konta lekarza
            //w sensie sparawdzacie czy w kolekcji lekarzy istnieje dokument o id userCredential.user.uid jak istnieje to spoko a jak nie to szybki singout
            //i można przenieść na jakąś stronę czy coś
          })
          .catch((error) => {
            //tu są błędy jak coś nie działa np. złe hasło czy coś
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorMessage)
          })
      })
  })
}

//Resetowania hasła----------------------------------------------------
const pswResetEmail = document.querySelector('#pswResetEmail');
const pswResetBtn = document.querySelector('#pswResetBtn');
if (pswResetBtn) {
  pswResetBtn.addEventListener('click', () => {
    sendPasswordResetEmail(auth, pswResetEmail.value)
      .then(() => {
        //wysłano maila z resetem
        window.location.href = 'login.html';
      })
      .catch((error) => {
        //błedy do przesłania i wyświetlania w jakimś div
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorMessage)
      });
  })
}

//wyloguj się----------------------------------------------------------
const btnSignOut = document.querySelector('#SignOutBtn');
if (btnSignOut) {
  btnSignOut.addEventListener('click', () => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        signOut(auth).then(() => {
          window.location.href = 'index.html';
        }).catch((error) => {
          //nie udało się wylogować czy coś
          const errorCode = error.code;
          const errorMessage = error.message;
        })
      })
  })
}

//Wyświetalanie wizyt lekarza-----------------------------------------
const docVisitTable = document.querySelector('#add-doctor-visit-table');
function renderDocs(doc) {
  //sprawdzenie czy docTable w ogóle istnieje
  //bo jak nie jesteśmy zalogowani to nie istnieje i będzie walić błędy
  if (docVisitTable) {
    let tr = document.createElement('tr');
    let data = document.createElement('td');
    let hour = document.createElement('td');
    let tdDetails = document.createElement('td');
    let tdDone = document.createElement('td');
    let tdDelete = document.createElement('td');
    let detailsButton = document.createElement('button');
    let doneButton = document.createElement('button');
    let deleteButton = document.createElement('button');
    detailsButton.textContent = "Szczegóły";
    detailsButton.className = "detailsButton";
    detailsButton.addEventListener('click', () => {
      window.top.location = 'pages/visitDetails.html';
      detailsVisit(doc);
    })
    doneButton.textContent = "Potwierdź";
    doneButton.className = "doneButton";
    doneButton.addEventListener('click', () => {
      doneVisit(doc.id);
    });
    deleteButton.textContent = "Usuń";
    deleteButton.className = "deleteButton";
    deleteButton.addEventListener('click', () => {
      deleteVisit(doc.id);
    });
    data.textContent = doc.data().data;
    hour.textContent = doc.data().hour;
    tr.setAttribute('data-id', doc.id);
    tr.appendChild(data);
    tr.appendChild(hour);
    tdDetails.appendChild(detailsButton);
    tdDone.appendChild(doneButton);
    tdDelete.appendChild(deleteButton);
    tr.appendChild(tdDetails);
    tr.appendChild(tdDone);
    tr.appendChild(tdDelete);
    docVisitTable.appendChild(tr);
  }
}

//Funkcja, która po zalogoawniu sprawdza użytkownika i odczytuje dane z bazy
onAuthStateChanged(auth, (user) => {
  if (user) {
    //pobieranie id zalogowanego użytkownika
    const uid = user.uid;

    //Ustawianie zdjęcia i tekstu
    const profilePic = document.getElementById('profilePic');
    const profileWelcome = document.getElementById('welcomeName');
    if (profilePic) {
      getDocs(query(collection(db, "doctors"), where("uid", "==", uid)))
        .then((snapshot) => {
          snapshot.docs.forEach((doc) => {
            profilePic.src = doc.data().img
            profileWelcome.textContent = "Witaj " + doc.data().name
            const profileImg = doc.data().img
          })
        })
    }


    //Pobieranie z bazy nieodbytych wizyt lekarza i przekazywanie do funkcji wyżej
    //pobieranie z bazy danych do zmiennej wizyt gdzie id_doc równa się id naszego zalogowanego użytkownika
      const doctorCol = query(collection(db, "visits"), where("id_doc", "==", uid), where("done", "==", false));
      getDocs(doctorCol)
        .then((snapshot) => {
          //tu dla każdego odczytanego dokumentu wywołujemy funkcje renderDocs
          snapshot.docs.forEach((doc) => {
            renderDocs(doc)
          })
        })//koniec pobierania wizyt
  }
});

//Usuwanie wizyty--------------------------------------------------
function deleteVisit(id) {
  deleteDoc(doc(db, "visits", id));
  readVisits();
  //trzeba jakoś odświerzyć iframa
}

//Potwierdzanie wizyty---------------------------------------------
function doneVisit(id) {
  updateDoc(doc(db, "visits", id), { done: true });
  //tu też odświerzyc
}

//Szczegóły wiztyty o ile są potrzebne w ogóle???????????????????????
//Tu jest problem z tym chyba że nie bedziemy odświerzać strony tylko zmienimy diva 
function detailsVisit(doc) {
  console.log("elo");
  const docVisitDetailsTable = document.querySelector('#doctor-visit-details-table');
  if (docVisitDetailsTable) {
    console.log("działa");
    let tr = document.createElement('tr');
    let data = document.createElement('td');
    let hour = document.createElement('td');
    data.textContent = doc.data().data;
    hour.textContent = doc.data().hour;
    tr.setAttribute('data-id', doc.id);
    tr.appendChild(data);
    tr.appendChild(hour);
    docVisitDetailsTable.appendChild(tr);
  }
}

//Dodawanie zdjęcia-------------------------------------------------
const profileImgUpload = document.getElementById('profileImgUpload');
const profileImgUploadButton = document.getElementById('profileImgUploadButton');
profileImgUploadButton.addEventListener('click',()=>{
  const profileImgRef = ref(storage,'doctors/'+profileImgUpload.files[0].name)
  uploadBytes(profileImgRef, profileImgUpload.files[0]).then((snapshot)=>{
    getDownloadURL(snapshot.ref)
    .then((snapshot)=>{
      setProfileImg(snapshot);
    })
  })
})

function setProfileImg(imgUrl){
  onAuthStateChanged(auth, (user) => {
    if (user) {
      updateDoc(doc(db, "doctors", user.uid), { img: imgUrl });
      setTimeout(()=>{window.location.reload(true)},500)
    }
  });
}


//Trzeba zrobić funkcję wyświetlającą błedy która tworzy jakiegoś diva albo dodaje do istniejącegoi przesyła mu error message
//ewentualnie zmiana opcji display z none na block i się wtedy pojawi div

//co do wyświetlania innych rzeczy to na górze miacie wyświetlanie w tabelce wizyt danego lekarza
