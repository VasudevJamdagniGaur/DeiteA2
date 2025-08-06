// Simplified Firebase configuration for memory storage
// Using client SDK with server-side operations since Admin SDK requires service account

import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDVCGl-fK7sWk0ohjHTPljMtSATx8J3MeA",
  authDomain: "deitetrial.firebaseapp.com",
  projectId: "deitetrial",
  storageBucket: "deitetrial.firebasestorage.app",
  messagingSenderId: "524425449967",
  appId: "1:524425449967:web:10b6ed1de226e2042de61a",
};

const app = initializeApp(firebaseConfig, 'server-app');
export const serverDb = getFirestore(app);
export { app as serverApp };