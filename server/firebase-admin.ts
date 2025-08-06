
// Simplified Firebase configuration for memory storage
// Using client SDK with server-side operations since Admin SDK requires service account

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import * as admin from 'firebase-admin'; // Import the admin SDK

const firebaseConfig = {
  apiKey: "AIzaSyDVCGl-fK7sWk0ohjHTPljMtSATx8J3MeA",
  authDomain: "deitetrial.firebaseapp.com",
  projectId: "deitetrial",
  storageBucket: "deitetrial.firebasestorage.app",
  messagingSenderId: "524425449967",
  appId: "1:524425449967:web:10b6ed1de226e2042de61a",
};

// Initialize Firebase client SDK for server operations
const app = initializeApp(firebaseConfig, "server-app");
export const serverDb = getFirestore(app);

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp(firebaseConfig);
}

// Get a Firestore instance using the Admin SDK
const db = admin.firestore();

// Save chat message to Firebase
export async function saveMessageToFirebase(uid: string, content: string, sender: 'user' | 'ai'): Promise<void> {
  try {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const timestamp = new Date();

    // Save to users/{uid}/messages/{date}/messages collection
    const userMessagesRef = db.collection('users').doc(uid).collection('messages').doc(date).collection('messages');

    await userMessagesRef.add({
      content,
      sender,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      localTimestamp: timestamp.toISOString()
    });

    // Also update the day summary document
    const daySummaryRef = db.collection('users').doc(uid).collection('messages').doc(date);
    await daySummaryRef.set({
      date,
      lastActivity: admin.firestore.FieldValue.serverTimestamp(),
      messageCount: admin.firestore.FieldValue.increment(1)
    }, { merge: true });

    console.log(`Message saved to Firebase for user ${uid} on ${date}`);
  } catch (error) {
    console.error('Error saving message to Firebase:', error);
    throw error;
  }
}

// Save day summary to Firebase
export async function saveDaySummaryToFirebase(uid: string, date: string, summary: string): Promise<void> {
  try {
    const daySummaryRef = db.collection('users').doc(uid).collection('messages').doc(date);
    await daySummaryRef.set({
      date,
      summary,
      summaryUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log(`Day summary saved to Firebase for user ${uid} on ${date}`);
  } catch (error) {
    console.error('Error saving day summary to Firebase:', error);
    throw error;
  }
}

export { db };
