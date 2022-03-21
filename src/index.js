import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getFirestore,collection,getDocs } from "firebase/firestore"


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
//baza danych
const db = getFirestore()

const colRef = collection(db,"users")

getDocs(colRef)
.then((snapshot) => {
    let users = []
    snapshot.docs.forEach((doc)=>{
        users.push({ ...doc.data() })
    })
    console.log(users)
}) 
.catch(err => {
    console.log(err.message)
})