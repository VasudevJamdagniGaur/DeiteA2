import { useState, useEffect } from "react";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { getUserProfile } from "../lib/auth";
import { UserProfile } from "../types";

export const useAuth = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileChecked, setProfileChecked] = useState(false);

  const refreshProfile = async () => {
    if (user) {
      try {
        console.log("Manually refreshing profile for user:", user.uid);
        const userProfile = await getUserProfile(user.uid);
        console.log("Profile refreshed:", userProfile);
        setProfile(userProfile);
        setProfileChecked(true);
      } catch (error) {
        console.error("Error refreshing user profile:", error);
        // Don't set profile to null on error, keep existing profile if any
        if (!profile) {
          setProfileChecked(true);
        }
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser ? firebaseUser.uid : "no user");
      setUser(firebaseUser);
      
      if (firebaseUser) {
        let retryCount = 0;
        const maxRetries = 3;
        
        const fetchProfileWithRetry = async () => {
          try {
            console.log(`Fetching profile for user (attempt ${retryCount + 1}):`, firebaseUser.uid);
            const userProfile = await getUserProfile(firebaseUser.uid);
            console.log("Profile fetched:", userProfile);
            setProfile(userProfile);
            setProfileChecked(true);
          } catch (error: any) {
            console.error("Error fetching user profile:", error);
            retryCount++;
            
            if (error?.code === 'unavailable' && retryCount < maxRetries) {
              console.log(`Firestore unavailable - retrying profile fetch in ${retryCount * 2} seconds (attempt ${retryCount}/${maxRetries})`);
              setTimeout(fetchProfileWithRetry, retryCount * 2000);
            } else {
              console.log("Max retries reached or different error, marking profile as checked");
              // Only set profile to null if we've exhausted retries or it's not a connection issue
              if (error?.code !== 'unavailable') {
                setProfile(null);
              }
              setProfileChecked(true);
            }
          }
        };
        
        await fetchProfileWithRetry();
      } else {
        setProfile(null);
        setProfileChecked(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    profile,
    loading,
    profileChecked,
    isAuthenticated: !!user,
    hasProfile: !!profile,
    refreshProfile,
  };
};
