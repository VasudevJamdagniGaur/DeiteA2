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
        // Only fetch profile if we don't have one or if the user changed
        if (!profile || (user && user.uid !== firebaseUser.uid)) {
          try {
            console.log("Fetching profile for user:", firebaseUser.uid);
            const userProfile = await getUserProfile(firebaseUser.uid);
            console.log("Profile fetched:", userProfile);
            setProfile(userProfile);
          } catch (error) {
            console.error("Error fetching user profile:", error);
            setProfile(null);
          }
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile, user]);

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    hasProfile: !!profile,
    refreshProfile,
  };
};
