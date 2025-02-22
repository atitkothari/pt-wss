'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;  
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  userId: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signInWithGoogle: async () => {},
  logout: async () => {},
  userId: null
});

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ 
  children 
}: { 
  children: React.ReactNode 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null); 

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUser(user);
          setUserId(user.uid); // Set userId directly from user object
          // Set user ID for Google Analytics
          if (typeof window !== 'undefined' && 'gtag' in window) {
            ((window as any).gtag)('set', { user_id: user.uid });
          }
        } else {
          setUser(null);
          setUserId(null); // Clear userId when user signs out
          // Clear user ID from Google Analytics
          if (typeof window !== 'undefined' && 'gtag' in window) {
            ((window as any).gtag)('set', { user_id: undefined });
          }
        }
        setLoading(false);
      }, (error) => {
        console.error('Auth state change error:', error);
        setError(error.message);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Auth setup error:', error);
      setError(error instanceof Error ? error.message : 'Authentication setup failed');
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Successfully signed in!');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Google';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await signOut(auth);
      toast.success('Successfully signed out!');
    } catch (error) {
      console.error('Error signing out:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signInWithGoogle, logout, userId }}>
      {children}
    </AuthContext.Provider>
  );
};