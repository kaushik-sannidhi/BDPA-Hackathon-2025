"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { UserProfile, subscribeToUserProfile, createUserProfile } from "@/lib/firebase/realtime";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    // Profile is already synced via real-time listener
    return;
  };

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined" || !auth) {
      setLoading(false);
      return;
    }

    let unsubscribeProfile: (() => void) | null = null;
    let isMounted = true;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!isMounted) return;
      
      setUser(currentUser);
      
      // Unsubscribe from previous profile listener
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (currentUser) {
        // Create profile if it doesn't exist
        await createUserProfile(currentUser);
        
        // Set up real-time listener for user profile
        unsubscribeProfile = subscribeToUserProfile(currentUser.uid, (profile) => {
          if (!isMounted) return;
          setUserProfile(profile);
          setLoading(false);
        });
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  const value = useMemo(
    () => ({ user, userProfile, loading, refreshProfile }),
    [user, userProfile, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
