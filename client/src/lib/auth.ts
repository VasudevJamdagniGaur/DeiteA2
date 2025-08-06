
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User as FirebaseUser 
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, addDoc, query, orderBy, getDocs, where, Timestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import { UserProfile } from "../types";

export const signUp = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signOut = async () => {
  await firebaseSignOut(auth);
};

export const saveUserProfile = async (profile: UserProfile) => {
  const userRef = doc(db, "users", profile.uid);
  // Use merge: true to ensure the profile is saved even if document exists
  await setDoc(userRef, {
    ...profile,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }, { merge: true });
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Save individual chat message
export const saveChatMessage = async (
  uid: string, 
  message: string, 
  sender: 'user' | 'ai', 
  conversationId?: string
) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const messageData = {
    uid,
    message,
    sender,
    timestamp: Timestamp.now(),
    date: today,
    conversationId: conversationId || `${uid}_${today}`,
    createdAt: new Date().toISOString()
  };

  // Save to users/{uid}/messages collection
  const messagesRef = collection(db, "users", uid, "messages");
  await addDoc(messagesRef, messageData);
  
  return messageData;
};

// Get messages for a specific day
export const getMessagesForDay = async (uid: string, date: string) => {
  try {
    const messagesRef = collection(db, "users", uid, "messages");
    const q = query(
      messagesRef, 
      where("date", "==", date),
      orderBy("timestamp", "asc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching messages for day:", error);
    return [];
  }
};

// Get all messages for a user
export const getAllUserMessages = async (uid: string) => {
  try {
    const messagesRef = collection(db, "users", uid, "messages");
    const q = query(messagesRef, orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching all user messages:", error);
    return [];
  }
};

// Save day summary
export const saveDaySummary = async (uid: string, date: string, summary: string) => {
  const summaryRef = doc(db, "users", uid, "summaries", date);
  await setDoc(summaryRef, {
    uid,
    date,
    summary,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }, { merge: true });
};

// Get day summary
export const getDaySummary = async (uid: string, date: string) => {
  try {
    const summaryRef = doc(db, "users", uid, "summaries", date);
    const summarySnap = await getDoc(summaryRef);
    
    if (summarySnap.exists()) {
      return summarySnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching day summary:", error);
    return null;
  }
};

// Get all summaries for a user
export const getAllUserSummaries = async (uid: string) => {
  try {
    const summariesRef = collection(db, "users", uid, "summaries");
    const q = query(summariesRef, orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching all user summaries:", error);
    return [];
  }
};

export const saveReflection = async (uid: string, date: string, content: string) => {
  const reflectionRef = doc(db, "users", uid, "reflections", date);
  await setDoc(reflectionRef, {
    uid,
    date,
    content,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
};

export const saveDayReflect = async (uid: string, date: string, dayReflect: string) => {
  const dayReflectRef = doc(db, "users", uid, "summaries", date);
  await setDoc(dayReflectRef, {
    uid,
    date,
    dayReflect,
    summary: dayReflect,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }, { merge: true });
};

export const getDayReflect = async (uid: string, date: string) => {
  const dayReflectRef = doc(db, "users", uid, "summaries", date);
  const dayReflectSnap = await getDoc(dayReflectRef);
  
  if (dayReflectSnap.exists()) {
    return dayReflectSnap.data();
  }
  return null;
};

export const getReflection = async (uid: string, date: string) => {
  const reflectionRef = doc(db, "users", uid, "summaries", date);
  const reflectionSnap = await getDoc(reflectionRef);
  
  if (reflectionSnap.exists()) {
    return reflectionSnap.data();
  }
  return null;
};
