import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User as FirebaseUser 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
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
  await setDoc(userRef, profile);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
};

export const saveReflection = async (uid: string, date: string, content: string) => {
  const reflectionRef = doc(db, "reflections", `${uid}_${date}`);
  await setDoc(reflectionRef, {
    uid,
    date,
    content,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
};

export const saveChatHistory = async (uid: string, date: string, messages: any[]) => {
  const chatRef = doc(db, "chat_history", `${uid}_${date}`);
  await setDoc(chatRef, {
    uid,
    date,
    messages,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
};

export const getChatHistory = async (uid: string, date: string) => {
  const chatRef = doc(db, "chat_history", `${uid}_${date}`);
  const chatSnap = await getDoc(chatRef);
  
  if (chatSnap.exists()) {
    return chatSnap.data();
  }
  return null;
};

export const getReflection = async (uid: string, date: string) => {
  const reflectionRef = doc(db, "reflections", `${uid}_${date}`);
  const reflectionSnap = await getDoc(reflectionRef);
  
  if (reflectionSnap.exists()) {
    return reflectionSnap.data();
  }
  return null;
};

export const getReflection = async (uid: string, date: string) => {
  const reflectionRef = doc(db, "reflections", `${uid}_${date}`);
  const reflectionSnap = await getDoc(reflectionRef);
  
  if (reflectionSnap.exists()) {
    return reflectionSnap.data();
  }
  return null;
};
