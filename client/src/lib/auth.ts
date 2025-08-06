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
