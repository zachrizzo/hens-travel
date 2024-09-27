// lib/firebaseConfig.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth } from 'firebase/auth'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAiIlqZj0iT1C3ky6Vh4cwJ6EjoxsUXrFQ",
    authDomain: "hens-travel.firebaseapp.com",
    projectId: "hens-travel",
    storageBucket: "hens-travel.appspot.com",
    messagingSenderId: "171340594471",
    appId: "1:171340594471:web:f735affe8484be6e117d02",
    measurementId: "G-Z0YKXXPB75"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app)
const auth = getAuth(app)

// const analytics = getAnalytics(app);


// Initialize Firestore
const db = getFirestore(app)

export { db, storage, auth }
