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
  deleteUser
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
  orderBy,
  limit,
  where,
  query,
  deleteDoc,
  updateDoc
} from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDPX8DsAUsO-19XNRqWDMMgP00YXixk1tE",
  authDomain: "medical-app-25f81.firebaseapp.com",
  databaseURL: "https://medical-app-25f81-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "medical-app-25f81",
  storageBucket: "medical-app-25f81.appspot.com",
  messagingSenderId: "1027058281878",
  appId: "1:1027058281878:web:5f8c9de19cdd0c38c581b7",
  measurementId: "G-W6STR0FTJS"
};
//inicjalizacja firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();
const user = auth.currentUser;

//Sesja----------------------------------------------------------------
const index = document.querySelector('#Index');
const register = document.querySelector('#register');
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (index) {
      //użytkownik jest zalogowany
      //wrzuć go na mainpage
      console.log(user.uid)
      getDoc(doc(db, "doctors", user.uid))
        .then((snapshot) => {
          sessionStorage.setItem("uid", user.uid);
          if (snapshot.data() === undefined) {
            window.location.href = 'addDoctorData.html';
          } else {
            window.location.href = 'mainpage.html';
          }
        })
    } else if (register) {
    }
  } else {
    //nie jest zalogowany to go wywal na index
    if (!index && !register) {
      window.location.href = './index.html';
    }
  }
});
const uid = sessionStorage.getItem('uid');
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
    if (registerPsw.validity.valid) {
      if (registerPsw.value === registerPswRepeat.value) {
        if (registerName.validity.valid) {
          if (registerSurname.validity.valid) {
            if (registerLocalization.validity.valid) {
              if (registerPWZ.validity.valid) {
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
              }
            }
          }
        }
      } else {
        showError("not-same-psw")
        console.log("hasła nie są takie same")
      }
    }
  })
}
//Jak sie pacjent zaloguje i chce być lekarzem to to się dzieje xD----
const addDoctorDataButton = document.getElementById('addDoctorDataButton')
if (addDoctorDataButton) {
  addDoctorDataButton.addEventListener('click', () => {
    const id = sessionStorage.getItem('uid');
    if (registerName.validity.valid) {
      if (registerSurname.validity.valid) {
        if (registerLocalization.validity.valid) {
          if (registerPWZ.validity.valid) {
            addDoctorDetails(id)
          }
        }
      }
    }
  })
}

//Dodawanie danych lekarza--------------------------------------------
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
    //walidacja
    if (loginEmail.validity.valid) {
      if (loginPassword.validity.valid) {
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
                // console.log(errorMessage);
              })
          })
      }
    }
  })
}

//Resetowania hasła----------------------------------------------------
const pswResetEmail = document.querySelector('#pswResetEmail');
const pswResetBtn = document.querySelector('#pswResetBtn');
if (pswResetBtn) {
  pswResetBtn.addEventListener('click', () => {
    if (pswResetEmail.validity.valid) {
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
    }
  })
}

//wyloguj się----------------------------------------------------------
const btnSignOut = document.querySelector('#SignOutBtn');
if (btnSignOut) {
  btnSignOut.addEventListener('click', () => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        signOut(auth).then(() => {
          sessionStorage.clear();
          window.location.href = './index.html';
        }).catch((error) => {
          //nie udało się wylogować czy coś
          const errorCode = error.code;
          const errorMessage = error.message;
        })
      })
  })
}

//Ustawianie zdjęcia i tekstu na NavBarze
const profilePic = document.getElementById('profilePic');
const profileWelcome = document.getElementById('welcomeName');
if (profilePic) {
  getDoc(doc(db, "doctors", uid))
    .then((snapshot) => {
      profilePic.src = snapshot.data().img
      profileWelcome.textContent = " Witaj " + snapshot.data().name;
      if (snapshot.data().img === "") {
        profilePic.src = "https://www.business2community.com/wp-content/uploads/2017/08/blank-profile-picture-973460_640.png";
      }
    })
}

//Pod-Strona Profile
const profilePage = document.getElementById('profilePage');
const profilePagePic = document.getElementById('profilePagePic');
const nameSurnameProfilePage = document.getElementById('nameSurProfilePage');
const rating_0 = document.getElementById('rating2-0');
const rating_05 = document.getElementById('rating2-05');
const rating_10 = document.getElementById('rating2-10');
const rating_15 = document.getElementById('rating2-15');
const rating_20 = document.getElementById('rating2-20');
const rating_25 = document.getElementById('rating2-25');
const rating_30 = document.getElementById('rating2-30');
const rating_35 = document.getElementById('rating2-35');
const rating_40 = document.getElementById('rating2-40');
const rating_45 = document.getElementById('rating2-45');
const rating_50 = document.getElementById('rating2-50');
if (profilePage) {
  getDoc(doc(db, "doctors", uid))
    .then((snapshot) => {
      profilePagePic.src = snapshot.data().img
      nameSurnameProfilePage.textContent = snapshot.data().name + ' ' + snapshot.data().surname;
      const rating = snapshot.data().rating / snapshot.data().nrRating;
      if (snapshot.data().img === "") {
        profilePagePic.src = "https://www.business2community.com/wp-content/uploads/2017/08/blank-profile-picture-973460_640.png";
      }
      //Ocena
      if (rating >= 0 && rating < 0.5) {
        rating_0.checked = true;
      } if (rating >= 0.5 && rating < 1) {
        rating_05.checked = true;
      } if (rating >= 1 && rating < 1.5) {
        rating_10.checked = true;
      } if (rating >= 1.5 && rating < 2) {
        rating_15.checked = true;
      } if (rating >= 2 && rating < 2.5) {
        rating_20.checked = true;
      } if (rating >= 2.5 && rating < 3) {
        rating_25.checked = true;
      } if (rating >= 3 && rating < 3.5) {
        rating_30.checked = true;
      } if (rating >= 3.5 && rating < 4) {
        rating_35.checked = true;
      } if (rating >= 4 && rating < 4.5) {
        rating_40.checked = true;
      } if (rating >= 4.5 && rating < 5) {
        rating_45.checked = true;
      } if (rating >= 5) {
        rating_50.checked = true;
      }
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
  const delModal = document.getElementById('delConfirmModal');
  const conDeleteBtn = document.getElementById('delConfirmButton');
  const closeDelModal = document.getElementById('closeDelConfirmModal');
  delModal.showModal();
  closeDelModal.addEventListener('click', () => {
    delModal.close()
  })
  conDeleteBtn.addEventListener('click',()=>{
    deleteDoc(doc(db, "visits", id));
    setTimeout(() => { window.location.href = 'mainpage.html' }, 500)
  })
}

//Potwierdzanie wizyty----------------------------------------------
function doneVisit(id) {
  updateDoc(doc(db, "visits", id), { done: true });
  setTimeout(() => { window.location.reload(true) }, 500)
}

//Szczegóły wiztyty-------------------------------------------------
//Tu jest problem z tym chyba że nie bedziemy odświerzać strony tylko zmienimy diva 
const visitDetailsBody = document.getElementById('visitDetailsBody');
if (visitDetailsBody) {
  const doctor = sessionStorage.getItem('doc');
  detailsVisit(JSON.parse(doctor))
  sessionStorage.clear;
}
function detailsVisit(doc) {
  const docVisitDetailsTable = document.getElementById('visit-details-table');
  if (docVisitDetailsTable) {
    let tr = document.createElement('tr');
    let data = document.createElement('td');
    let patname = document.createElement('td');
    let patpesel = document.createElement('td');
    let patphone = document.createElement('td');
    let tdBtnEditDate = document.createElement('td');
    let editDateButton = document.createElement('button');
    let tdBtnReferral = document.createElement('td');
    let referralButton = document.createElement('button');
    let tdBtnDelete = document.createElement('td');
    let deleteVisitButton = document.createElement('button');
    referralButton.textContent = "Wystaw";
    editDateButton.textContent = "Edytuj";
    deleteVisitButton.textContent = "Usuń";
    deleteVisitButton.className = "deleteButton fancy-button";
    referralButton.className = "table-button fancy-button";
    editDateButton.className = "table-button fancy-button";
    getVisitData(doc.id).then((res) => {
      data.textContent = res.data + ' ' + res.hour;
    })
    getPatientData(doc.id_pac).then((res) => {
      patname.textContent = res.name + ' ' + res.surname;
      patpesel.textContent = res.pesel;
      patphone.textContent = res.phone;
    })
    editDateButton.addEventListener('click', () => {
      editVisitDate(doc.id)
    })
    referralButton.addEventListener('click', () => {
      addReferral(doc)
    })
    deleteVisitButton.addEventListener('click', () => {
      deleteVisit(doc.id)
    })
    tr.setAttribute('data-id', doc.id);
    tr.appendChild(data);
    tr.appendChild(patname);
    tr.appendChild(patpesel);
    tr.appendChild(patphone);
    tdBtnEditDate.appendChild(editDateButton);
    tdBtnReferral.appendChild(referralButton);
    tdBtnDelete.appendChild(deleteVisitButton);
    tr.appendChild(tdBtnEditDate);
    tr.appendChild(tdBtnReferral);
    tr.appendChild(tdBtnDelete);
    docVisitDetailsTable.appendChild(tr);
  }
}

//Wyświetlanie skierowań-----------------------------------------------
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

//Pobieranie danych lekarza-----------------------------------------
function getDoctorData(id) {
  let doctor =
    getDoc(doc(db, "doctors", id))
      .then((snapshot) => {
        return snapshot.data();
      })
  return doctor;
}

//Pobieranie danych pacjenta----------------------------------------
function getPatientData(id) {
  let pat =
    getDoc(doc(db, "users", id))
      .then((snapshot) => {
        return snapshot.data();
      })
  return pat;
}

//Pobieranie danych wizyty------------------------------------------
function getVisitData(id) {
  let visit = getDoc(doc(db, "visits", id))
    .then((snapshot) => {
      return snapshot.data();
    })
  return visit;
}

//Dodawanie skierownia----------------------------------------------
function addReferral(doctor) {
  const modal = document.getElementById('referralModal');
  const closeModal = document.getElementById('closeReferralModal');
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
      reason: referralReason.value,
      done: false
    };
    addDoc(collection(db, "referral"), newReferral).then((res)=>{
      updateDoc(doc(db, "referral", res.id), { id: res.id });
    })
  })
}

//Edytowanie daty wizyty
function editVisitDate(id) {
  const modal = document.getElementById('editModal');
  const closeModal = document.getElementById('closeEditModal');
  const sendDataButton = document.getElementById('editVisitApplyButton');
  const newVisitDate = document.getElementById('newVisitData');
  const newVisitTime = document.getElementById('newVisitTime');
  modal.showModal();
  closeModal.addEventListener('click', () => {
    modal.close()
  })
  sendDataButton.addEventListener('click', () => {
    0
    if (newVisitDate.value !== "") {
      updateDoc(doc(db, "visits", id), { data: newVisitDate.value });
    }
    if (newVisitTime.value !== "") {
      updateDoc(doc(db, "visits", id), { hour: newVisitTime.value });
    }
    setTimeout(() => { window.location.reload(true) }, 500)
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

//Wyświetlanie błędów--------------------------------------------------
function showError(error) {
  const errorDiv = document.getElementById('errorDiv');
  let errorP = document.getElementById('errorP')
  if (error === "auth/invalid-email") {
    errorP.textContent = "Nieprawidłowy adres email";
  } else if (error === "auth/user-not-found") {
    errorP.textContent = "Taki użytkownik nie istnieje";
  } else if (error === "auth/internal-error") {
    errorP.textContent = "Podaj hasło";
  } else if (error === "auth/wrong-password") {
    errorP.textContent = "Nieprawidłowe hasło";
  } else if (error === "auth/missing-email") {
    errorP.textContent = "E-mail jest wymagany";
  } else if (error === "auth/weak-password") {
    errorP.textContent = "Hasło powinno mieć min 6 znaków";
  } else if (error === "not-same-psw") {
    errorP.textContent = "Hasła nie są identyczne";
  }
}

// funkcja do potweirdzenia 
function confirmSubmit( abc)
{
var agree=confirm(abc);
if (agree)
 return true ;
else
 return false ;
}

// wczytywanie lekarzy na strone glowna
const doctorsView = document.querySelector('#doctorsView');
if (doctorsView) {
  var doc_id_temp = query(collection(db, "doctors"), orderBy("uid"), limit(4));
  getDocs(doc_id_temp)
  .then((snapshot) => {
    //tu dla każdego odczytanego dokumentu wywołujemy funkcje renderDoctors
    snapshot.docs.forEach((doc) => {
      renderDoctors(doc);
    })
  })
}

function renderDoctors(doc) {
  
  const doctorsView = document.querySelector('#doctorsView');
  
  if (doctorsView) {
    getDoctorData(doc.data().uid).then((res) => {
      doctorsView.innerHTML = doctorsView.innerHTML + `
      <div class="col-lg-6 mt-4 mt-lg-0">
            <div class="member d-flex align-items-start" style="width: 546px; height: 240px;">
              <div class="pic"><img src="${res.img}" class="img-fluid" alt=""></div>
              <div class="member-info">
                <h4 >${res.name} ${res.surname}</h4>
                <span>${res.specialization}</span>
                <p>${res.localization}</p>
                <div class="social">
                  <a href=""><i class="ri-twitter-fill"></i></a>
                  <a href=""><i class="ri-facebook-fill"></i></a>
                  <a href=""><i class="ri-instagram-fill"></i></a>
                  <a href=""> <i class="ri-linkedin-box-fill"></i> </a>
                </div>
              </div>
            </div>
          </div>`;
    })
  }
}

// Edytowanie danych lekarza CHYBA DZIAłA

const editButton = document.querySelector('#editDoctorDataButton');
const editName = document.querySelector('#editName');
const editSurname = document.querySelector('#editSurname');
const editLocalization = document.querySelector('#editLocalization');
const editSpecialization = document.querySelector('#editSpec')
if (editButton){

  getDoc(doc(db, "doctors", uid))
    .then((snapshot) => {
      editName.value = snapshot.data().name
      editSurname.value = snapshot.data().surname
      editLocalization.value = snapshot.data().localization
      editSpecialization.value = snapshot.data().specialization
    })

  editButton.addEventListener('click', () => {
    if(editName.validity.valid){console.log(2);
      if (editSurname.validity.valid) {console.log(3);
        if (editLocalization.validity.valid) {console.log(4);
          if (editSpecialization.validity.valid) {console.log(5);
            const newName = editName.value;
            const newSurname = editSurname.value;
            const newLocalization = editLocalization.value;
            const newSpecialization = editSpecialization.value;
            updateDoc(doc(db, "doctors", uid), { name: newName, surname: newSurname, specialization: newSpecialization, localization: newLocalization});
            setTimeout(() => { window.location.href = 'profile.html' }, 500);
          }
        }
      }
    }
  })
  
}

//Usuwanie konta
const deleteAccBtn = document.getElementById('deleteAccountBtn');
const modal = document.getElementById('delAccModal');
const closeModal = document.getElementById('closeDelAccModal');
const delAccButton = document.getElementById('delAccButton');
deleteAccBtn.addEventListener('click',()=>{
  modal.showModal();
  closeModal.addEventListener('click', () => {
    modal.close();
  })
  delAccButton.addEventListener('click', () => {
    console.log(auth.currentUser)
  deleteUser(auth.currentUser).then(()=>{
    //użytkownik usunięty wywalić na główną strone 
    setTimeout(() => { window.location.href = 'index.html' }, 500)
      }).catch((error)=>{
        //error
      })
    })
})

//Trzeba zrobić funkcję wyświetlającą błedy która tworzy jakiegoś diva albo dodaje do istniejącegoi przesyła mu error message
//ewentualnie zmiana opcji display z none na block i się wtedy pojawi div

//co do wyświetlania innych rzeczy to na górze miacie wyświetlanie w tabelce wizyt danego lekarza


