import { initializeApp }

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"

import {

  getFirestore

}

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"


const firebaseConfig = {

  apiKey: "AIzaSyBrd48UiFiA5OGN2rhLptXSSg_PX5s4AGA",

  authDomain:
  "app-afiliados-971c8.firebaseapp.com",

  databaseURL:
  "https://app-afiliados-971c8-default-rtdb.firebaseio.com",

  projectId:
  "app-afiliados-971c8",

  storageBucket:
  "app-afiliados-971c8.firebasestorage.app",

  messagingSenderId:
  "763269723561",

  appId:
  "1:763269723561:web:75a22513773527393cc0b8"
}


const app = initializeApp(
  firebaseConfig
)


const db = getFirestore(app)


export { db }