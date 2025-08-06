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

// Save chat message to Firebase
export const saveMessageToFirebase = async (
  uid: string,
  message: string,
  sender: 'user' | 'ai',
  conversationId?: string
) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const messageData = {
      uid,
      message,
      sender,
      timestamp: admin.firestore.Timestamp.now(),
      date: today,
      conversationId: conversationId || `${uid}_${today}`,
      createdAt: new Date().toISOString()
    };

    // Save to users/{uid}/messages collection
    const messagesRef = serverDb.collection("users").doc(uid).collection("messages");
    await messagesRef.add(messageData);

    console.log(`Message saved to Firebase for user ${uid}`);
    return messageData;
  } catch (error) {
    console.error("Error saving message to Firebase:", error);
    throw error;
  }
};

// Save day summary to Firebase
export const saveDaySummaryToFirebase = async (uid: string, date: string, summary: string) => {
  try {
    const summaryRef = serverDb.collection("users").doc(uid).collection("summaries").doc(date);
    await summaryRef.set({
      uid,
      date,
      summary,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    console.log(`Day summary saved to Firebase for user ${uid}, date ${date}`);
  } catch (error) {
    console.error("Error saving day summary to Firebase:", error);
    throw error;
  }
};

export { app as serverApp, serverDb };