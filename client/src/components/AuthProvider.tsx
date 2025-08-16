import { createContext, useContext, ReactNode } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { useAuth } from "../hooks/useAuth";
import { UserProfile } from "../types";

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasProfile: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  try {
    const auth = useAuth();

    return (
      <AuthContext.Provider value={auth}>
        {children}
      </AuthContext.Provider>
    );
  } catch (error) {
    console.error('AuthProvider error:', error);
    
    // Fallback loading state if auth initialization fails
    return (
      <AuthContext.Provider value={{
        user: null,
        profile: null,
        loading: true,
        isAuthenticated: false,
        hasProfile: false,
        refreshProfile: async () => {},
      }}>
        {children}
      </AuthContext.Provider>
    );
  }
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
