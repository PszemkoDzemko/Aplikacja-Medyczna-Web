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
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  doc,
  where,
  query,
  deleteDoc,
  updateDoc,
  waitForPendingWrites
} from "firebase/firestore"

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

//Sesja----------------------------------------------------------------
const index = document.querySelector('#Index');
const register = document.querySelector('#register');
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (index) {
      //użytkownik jest zalogowany
      //wrzuć go na mainpage
      window.location.href = 'mainpage.html';
    } else if (register) {
    }
  } else {
    //nie jest zalogowany to go wywal na index
    if (!index && !register) {
      window.location.href = './index.html';
    }
  }
});

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
            showError(errorCode);
            console.log(errorMessage);
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
        showError(errorCode);
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
          window.location.href = './index.html';
        }).catch((error) => {
          //nie udało się wylogować czy coś
          const errorCode = error.code;
          const errorMessage = error.message;
        })
      })
  })
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
            profileWelcome.textContent = " Witaj " + doc.data().name;
            const profileImg = doc.data().img
          })
        })
    }

    //Pobieranie z bazy nieodbytych wizyt lekarza i przekazywanie do funkcji wyżej
    //pobieranie z bazy danych do zmiennej wizyt gdzie id_doc równa się id naszego zalogowanego użytkownika
    const doctorVisitNotDone = query(collection(db, "visits"), where("id_doc", "==", uid), where("done", "==", false));
    getDocs(doctorVisitNotDone)
      .then((snapshot) => {
        //tu dla każdego odczytanego dokumentu wywołujemy funkcje renderDocs
        snapshot.docs.forEach((doc) => {
          renderVisits(doc)
        })
      })//koniec pobierania wizyt


    //pobieranie zakończonych wizyt
    const doctorVisitDone = query(collection(db, "visits"), where("id_doc", "==", uid), where("done", "==", true));
    getDocs(doctorVisitDone)
      .then((snapshot) => {
        //tu dla każdego odczytanego dokumentu wywołujemy funkcje renderDocs
        snapshot.docs.forEach((doc) => {
          renderDoneVisits(doc)
        })
      })

    //Pobieranie skierowań lekarza
    const doctorReferralDone = query(collection(db, "referral"), where("id_doc", "==", uid));
    getDocs(doctorReferralDone)
      .then((snapshot) => {
        snapshot.docs.forEach((doc) => {
          renderReferral(doc);
        })
      })
  }

});

//Wyświetalanie wizyt lekarza-----------------------------------------
const docVisitTable = document.querySelector('#add-doctor-visit-table');
function renderVisits(doc) {
  //sprawdzenie czy docTable w ogóle istnieje
  //bo jak nie jesteśmy zalogowani to nie istnieje i będzie walić błędy
  if (docVisitTable) {
    let tr = document.createElement('tr');
    let data = document.createElement('td');
    let patient = document.createElement('td');
    let tdDetails = document.createElement('td');
    let tdDone = document.createElement('td');
    let tdDelete = document.createElement('td');
    let detailsButton = document.createElement('button');
    let doneButton = document.createElement('button');
    let deleteButton = document.createElement('button');
    detailsButton.textContent = "Szczegóły";
    detailsButton.className = "detailsButton";
    detailsButton.addEventListener('click', () => {
      sessionStorage.setItem("doc", JSON.stringify(doc.data()));
      window.location.href = 'visitDetails.html';
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
    getPatientData(doc.data().id_pac).then((res) => {
      patient.textContent = res.name + " " + res.surname
    })
    data.textContent = doc.data().data + " " + doc.data().hour;
    tr.setAttribute('data-id', doc.id);
    tr.appendChild(data);
    tr.appendChild(patient);
    tdDetails.appendChild(detailsButton);
    tdDone.appendChild(doneButton);
    tdDelete.appendChild(deleteButton);
    tr.appendChild(tdDetails);
    tr.appendChild(tdDone);
    tr.appendChild(tdDelete);
    docVisitTable.appendChild(tr);
  }
}

//Historia wizyt
const docVisitDoneTable = document.querySelector('#visit-history-table');
function renderDoneVisits(doc) {
  if (docVisitDoneTable) {
    let tr = document.createElement('tr');
    let data = document.createElement('td');
    let patient = document.createElement('td');
    let tdDelete = document.createElement('td');
    let deleteButton = document.createElement('button');
    deleteButton.textContent = "Usuń";
    deleteButton.className = "deleteButton";
    deleteButton.addEventListener('click', () => {
      deleteVisit(doc.id);
    });
    getPatientData(doc.data().id_pac).then((res) => {
      patient.textContent = res.name + " " + res.surname
    })
    data.textContent = doc.data().data + " " + doc.data().hour;
    tr.setAttribute('data-id', doc.id);
    tr.appendChild(data);
    tr.appendChild(patient);
    tdDelete.appendChild(deleteButton);
    tr.appendChild(tdDelete);
    docVisitDoneTable.appendChild(tr);
  }

}

//Usuwanie wizyty--------------------------------------------------
function deleteVisit(id) {
  deleteDoc(doc(db, "visits", id));
  setTimeout(() => { window.location.reload(true) }, 500)
}

//Potwierdzanie wizyty---------------------------------------------
function doneVisit(id) {
  updateDoc(doc(db, "visits", id), { done: true });
  setTimeout(() => { window.location.reload(true) }, 500)
}

//Szczegóły wiztyty o ile są potrzebne w ogóle???????????????????????
//Tu jest problem z tym chyba że nie bedziemy odświerzać strony tylko zmienimy diva 
const visitDetailsBody = document.getElementById('visitDetailsBody');
if (visitDetailsBody) {
  const doctor = sessionStorage.getItem('doc');
  detailsVisit(JSON.parse(doctor))
  sessionStorage.clear;
}
function detailsVisit(doc) {
  const docVisitDetailsTable = document.querySelector('#visit-details-table');
  if (docVisitDetailsTable) {
    let tr = document.createElement('tr');
    let data = document.createElement('td');
    let patname = document.createElement('td');
    let patsurname = document.createElement('td');
    let tdBtnReferral = document.createElement('td');
    let referralButton = document.createElement('button');
    referralButton.textContent = "Wystaw";
    data.textContent = doc.data + ' ' + doc.hour;
    getPatientData(doc.id_pac).then((res) => {
      patname.textContent = res.name;
      patsurname.textContent = res.surname;
    })
    referralButton.addEventListener('click', () => {
      addReferral(doc)
    })
    tr.setAttribute('data-id', doc.id);
    tr.appendChild(data);
    tr.appendChild(patname);
    tr.appendChild(patsurname);
    tdBtnReferral.appendChild(referralButton);
    tr.appendChild(tdBtnReferral);
    docVisitDetailsTable.appendChild(tr);
  }
}

//Wyświetlanie skierowań
const referralBody = document.getElementById('doctor-referral-table');
function renderReferral(doc) {
  if (referralBody) {
    let tr = document.createElement('tr');
    let data = document.createElement('td');
    let patient = document.createElement('td');
    let reason = document.createElement('td');
    let doctor = document.createElement('td');
    let info = document.createElement('td');
    getPatientData(doc.data().id_pac).then((res) => {
      patient.textContent = res.name + " " + res.surname;
    })
    getDoctorData(doc.data().id_doc).then((res) => {
      doctor.textContent = res.name + " " + res.surname;
    })
    data.textContent = doc.data().data;
    reason.textContent = doc.data().reason;
    info.textContent = doc.data().info;
    tr.appendChild(data);
    tr.appendChild(patient);
    tr.appendChild(reason);
    tr.appendChild(doctor);
    tr.appendChild(info);
    referralBody.appendChild(tr);
  }
}

//Pobieranie danych lekarza
function getDoctorData(id) {
  let doctor =
    getDoc(doc(db, "doctors", id))
      .then((snapshot) => {
        return snapshot.data();
      })
  return doctor;
}

//Pobieranie danych pacjenta
function getPatientData(id) {
  let pat =
    getDoc(doc(db, "users", id))
      .then((snapshot) => {
        return snapshot.data();
      })
  return pat;
}

function addReferral(doctor) {
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('closeModal');
  const sendDataButton = document.getElementById('referralAddButton');
  const referralData = document.getElementById('referralData');
  const referralReason = document.getElementById('referralReason');
  const referralInfo = document.getElementById('referralInfo');
  modal.showModal();
  closeModal.addEventListener('click', () => {
    modal.close();
  })
  sendDataButton.addEventListener('click', () => {
    const newReferral = {
      data: referralData.value,
      id_doc: doctor.id_doc,
      id_pac: doctor.id_pac,
      info: referralInfo.value,
      reason: referralReason.value
    };
    console.log(newReferral)
    addDoc(collection(db, "referral"), newReferral);
  })
}

//Dodawanie zdjęcia-------------------------------------------------
const profileImgUpload = document.getElementById('profileImgUpload');
const profileImgUploadButton = document.getElementById('profileImgUploadButton');
if (profileImgUploadButton) {
  profileImgUploadButton.addEventListener('click', () => {
    const profileImgRef = ref(storage, 'doctors/' + profileImgUpload.files[0].name)
    uploadBytes(profileImgRef, profileImgUpload.files[0]).then((snapshot) => {
      getDownloadURL(snapshot.ref)
        .then((snapshot) => {
          setProfileImg(snapshot);
        })
    })
  })
}
//Ustawianie dodanego zdjęcia na profilowe
function setProfileImg(imgUrl) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      updateDoc(doc(db, "doctors", user.uid), { img: imgUrl });
      setTimeout(() => { window.location.reload(true) }, 500)
    }
  });
}


function showError(error) {
  const errorDiv = document.getElementById('errorDiv');
  let errorP = document.getElementById('errorP')
  if(error==="auth/invalid-email"){
      errorP.textContent = "Nieprawidłowy adres email";
  }else if(error==="auth/user-not-found"){
    errorP.textContent = "Taki użytkownik nie istnieje";
  }else if(error==="auth/internal-error"){
    errorP.textContent = "Podaj hasło";
  }else if(error==="auth/wrong-password"){
    errorP.textContent = "Nieprawidłowe hasło";
  }else if(error==="auth/missing-email"){
    errorP.textContent = "E-mail jest wymagany";
  }else if(error==="auth/weak-password"){
    errorP.textContent = "Hasło powinno mieć min 6 znaków";
  }
  
}

//Trzeba zrobić funkcję wyświetlającą błedy która tworzy jakiegoś diva albo dodaje do istniejącegoi przesyła mu error message
//ewentualnie zmiana opcji display z none na block i się wtedy pojawi div

//co do wyświetlania innych rzeczy to na górze miacie wyświetlanie w tabelce wizyt danego lekarza
