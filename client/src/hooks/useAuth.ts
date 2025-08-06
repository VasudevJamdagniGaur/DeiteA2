import { useState, useEffect } from "react";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { getUserProfile } from "../lib/auth";
import { UserProfile } from "../types";

export const useAuth = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (user) {
      try {
        console.log("Manually refreshing profile for user:", user.uid);
        const userProfile = await getUserProfile(user.uid);
        console.log("Profile refreshed:", userProfile);
        setProfile(userProfile);
      } catch (error) {
        console.error("Error refreshing user profile:", error);
        setProfile(null);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser ? firebaseUser.uid : "no user");
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          console.log("Fetching profile for user:", firebaseUser.uid);
          const userProfile = await getUserProfile(firebaseUser.uid);
          console.log("Profile fetched:", userProfile);
          setProfile(userProfile);
        } catch (error: any) {
          console.error("Error fetching user profile:", error);
          
          // If it's a Firestore unavailable error, don't set profile to null immediately
          // This prevents the app from thinking the user has no profile when it's just a connection issue
          if (error?.code === 'unavailable') {
            console.log("Firestore unavailable - retrying profile fetch in 2 seconds");
            setTimeout(async () => {
              try {
                const retryProfile = await getUserProfile(firebaseUser.uid);
                console.log("Profile retry fetch successful:", retryProfile);
                setProfile(retryProfile);
              } catch (retryError) {
                console.error("Profile retry fetch failed:", retryError);
                setProfile(null);
              }
            }, 2000);
          } else {
            setProfile(null);
          }
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    hasProfile: !!profile,
    refreshProfile,
  };
};
