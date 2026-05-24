// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD6RfoW8ZOSfjCk3z6LaOvN9uLijfUgNxA",
  authDomain: "nusfoundit.firebaseapp.com",
  projectId: "nusfoundit",
  storageBucket: "nusfoundit.firebasestorage.app",
  messagingSenderId: "981573864660",
  appId: "1:981573864660:web:a68eb87a30724d12747f41"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);