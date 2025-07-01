// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAwl0XGBnJTsqPsj1pEcJViKKX6N8DUnwA",
  authDomain: "ally-1d4e6.firebaseapp.com",
  projectId: "ally-1d4e6",
  storageBucket: "ally-1d4e6.firebasestorage.app",
  messagingSenderId: "352800758324",
  appId: "1:352800758324:web:9bd5d705e3ff5a4de4c861",
  measurementId: "G-WH21F3TLEP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
