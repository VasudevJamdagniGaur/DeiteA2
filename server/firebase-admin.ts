// Firebase Admin SDK configuration for server-side operations
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
let adminApp;
if (getApps().length === 0) {
  // For server-side, we use a simple configuration without service account
  // In production, you would use proper service account credentials
  adminApp = initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'deite-mental-health',
  });
} else {
  adminApp = getApps()[0];
}

export const adminDb = getFirestore(adminApp);
export { adminApp };