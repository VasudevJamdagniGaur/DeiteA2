
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

// Initialize analytics safely for mobile apps
let analytics: any = null;
try {
  // Only initialize analytics in browser environment
  if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.warn('Analytics initialization failed:', error);
}

export { analytics };
export default app;
