import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBxtRJ8NPp0TiqjxFNM7ci5UZnowyQhwVU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "deitea2-659f5.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "deitea2-659f5",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "deitea2-659f5.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "974533520189",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:974533520189:web:your_app_id_here",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
