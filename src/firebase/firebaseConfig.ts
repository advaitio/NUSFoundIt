import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// unlike telegam API the firebase public key is not sensitive. 
const firebaseConfig = {
  apiKey: "AIzaSyD6RfoW8ZOSfjCk3z6LaOvN9uLijfUgNxA",
  authDomain: "nusfoundit.firebaseapp.com",
  projectId: "nusfoundit",
  storageBucket: "nusfoundit.firebasestorage.app",
  messagingSenderId: "981573864660",
  appId: "1:981573864660:web:a68eb87a30724d12747f41"
};

const app = initializeApp(firebaseConfig);
// to use in other app parts
export const db = getFirestore(app);
export const storage = getStorage(app);