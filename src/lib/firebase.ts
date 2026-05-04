import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD1Ph39I9XSfHGZM9PQIaN-D0EgCaAyuSA",
  authDomain: "field-word-time-management.firebaseapp.com",
  projectId: "field-word-time-management",
  storageBucket: "field-word-time-management.firebasestorage.app",
  messagingSenderId: "941799153877",
  appId: "1:941799153877:web:c7d7f9b211548c8ee9425c",
  measurementId: "G-67DBCYL1WX"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
