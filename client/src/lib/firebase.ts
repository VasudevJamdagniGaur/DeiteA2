
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDVCGl-fK7sWk0ohjHTPljMtSATx8J3MeA",
  authDomain: "deitetrial.firebaseapp.com",
  projectId: "deitetrial",
  storageBucket: "deitetrial.firebasestorage.app",
  messagingSenderId: "524425449967",
  appId: "1:524425449967:web:10b6ed1de226e2042de61a",
  measurementId: "G-ZQDHS7GXDE"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export default app;
