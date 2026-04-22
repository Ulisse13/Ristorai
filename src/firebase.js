import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyDO56KiC23DVZgzZXfFwlBEBJr2aww03n0",
  authDomain: "ristorai-8d2e1.firebaseapp.com",
  projectId: "ristorai-8d2e1",
  storageBucket: "ristorai-8d2e1.firebasestorage.app",
  messagingSenderId: "955011104879",
  appId: "1:955011104879:web:6dd329633d0c26ce72cd9a"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
