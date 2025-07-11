// Simplified Firebase configuration for memory storage
// Using client SDK with server-side operations since Admin SDK requires service account

import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyBxtRJ8NPp0TiqjxFNM7ci5UZnowyQhwVU",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "deitea2-659f5.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "deitea2-659f5",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "deitea2-659f5.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "974533520189",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:974533520189:web:your_app_id_here",
};

const app = initializeApp(firebaseConfig, 'server-app');
export const serverDb = getFirestore(app);
export { app as serverApp };