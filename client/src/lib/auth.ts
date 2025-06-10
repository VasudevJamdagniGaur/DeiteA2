import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User as FirebaseUser 
} from "firebase/auth";
import { auth } from "./firebase";
import { UserProfile } from "../types";
import { apiRequest } from "./queryClient";

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
  await apiRequest("/api/users", {
    method: "POST",
    body: JSON.stringify({
      uid: profile.uid,
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const response = await apiRequest(`/api/users/${uid}`, {
      method: "GET",
    });
    return response as UserProfile;
  } catch (error: any) {
    if (error.message?.includes('404')) {
      return null;
    }
    throw error;
  }
};

export const saveReflection = async (uid: string, date: string, content: string) => {
  await apiRequest("/api/reflections", {
    method: "POST",
    body: JSON.stringify({
      uid,
      date,
      content,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const getReflection = async (uid: string, date: string) => {
  try {
    const response = await apiRequest(`/api/reflections/${uid}/${date}`, {
      method: "GET",
    });
    return response;
  } catch (error: any) {
    if (error.message?.includes('404')) {
      return null;
    }
    throw error;
  }
};
