// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCaRDhcbb2w_oZ0vrckRiNsblR29wSVnao",
  authDomain: "ally-chat-dfcdf.firebaseapp.com",
  projectId: "ally-chat-dfcdf",
  storageBucket: "ally-chat-dfcdf.firebasestorage.app",
  messagingSenderId: "737144936275",
  appId: "1:737144936275:web:f8ae58301911db76c1f3a6",
  measurementId: "G-YC2D94FY8X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
