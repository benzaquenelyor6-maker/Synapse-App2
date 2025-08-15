// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9Dw6Abygr4C2laV3iFxWUbN30G0EqhGk",
  authDomain: "application-cours-e87b9.firebaseapp.com",
  projectId: "application-cours-e87b9",
  storageBucket: "application-cours-e87b9.firebasestorage.app",
  messagingSenderId: "270814949959",
  appId: "1:270814949959:web:690690a47769b9ecd4f762",
  measurementId: "G-2RNBRTE6JG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the Firestore database instance for our app to use
export const db = getFirestore(app);
