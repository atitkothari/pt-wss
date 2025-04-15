'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  UserCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { toast } from "sonner";
import { subscribeToGhost } from '../services/queryService';
import { sendAnalyticsEvent, AnalyticsEvents } from '../utils/analytics';

interface AuthContextType {
  user: User | null;  
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<UserCredential | undefined>;
  signInWithEmail: (email: string, password: string) => Promise<UserCredential>;
  signUpWithEmail: (email: string, password: string) => Promise<UserCredential>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  userId: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signInWithGoogle: async () => undefined,
  signInWithEmail: async () => { throw new Error('Not implemented') },
  signUpWithEmail: async () => { throw new Error('Not implemented') },
  resetPassword: async () => {},
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
          setUserId(user.uid);
          if (typeof window !== 'undefined' && 'gtag' in window) {
            ((window as any).gtag)('set', { user_id: user.uid });
          }
        } else {
          setUser(null);
          setUserId(null);
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
      const result = await signInWithPopup(auth, provider);
      
      sendAnalyticsEvent({
        event_name: AnalyticsEvents.SIGN_IN,
        event_category: 'Auth',
        method: 'Google'
      });
      
      toast.success('Successfully signed in!');
      return result;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Google';
      setError(errorMessage);
      toast.error(errorMessage);
      
      sendAnalyticsEvent({
        event_name: AnalyticsEvents.ERROR,
        event_category: 'Auth',
        error_message: errorMessage
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      sendAnalyticsEvent({
        event_name: AnalyticsEvents.SIGN_IN,
        event_category: 'Auth',
        method: 'Email'
      });
      
      toast.success('Successfully signed in!');
      return result;
    } catch (error) {
      console.error('Error signing in with email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with email';
      setError(errorMessage);
      toast.error(errorMessage);
      
      sendAnalyticsEvent({
        event_name: AnalyticsEvents.ERROR,
        event_category: 'Auth',
        error_message: errorMessage
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      sendAnalyticsEvent({
        event_name: AnalyticsEvents.SIGN_UP,
        event_category: 'Auth',
        method: 'Email'
      });
      
      toast.success('Account created successfully!');
      return result;
    } catch (error) {
      console.error('Error signing up with email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
      setError(errorMessage);
      toast.error(errorMessage);
      
      sendAnalyticsEvent({
        event_name: AnalyticsEvents.ERROR,
        event_category: 'Auth',
        error_message: errorMessage
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      await sendPasswordResetEmail(auth, email);
      
      sendAnalyticsEvent({
        event_name: AnalyticsEvents.PASSWORD_RESET,
        event_category: 'Auth'
      });
      
      toast.success('Password reset email sent!');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send password reset email';
      setError(errorMessage);
      toast.error(errorMessage);
      
      sendAnalyticsEvent({
        event_name: AnalyticsEvents.ERROR,
        event_category: 'Auth',
        error_message: errorMessage
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await signOut(auth);
      
      sendAnalyticsEvent({
        event_name: AnalyticsEvents.SIGN_OUT,
        event_category: 'Auth'
      });
      
      toast.success('Successfully signed out!');
    } catch (error) {
      console.error('Error signing out:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      setError(errorMessage);
      toast.error(errorMessage);
      
      sendAnalyticsEvent({
        event_name: AnalyticsEvents.ERROR,
        event_category: 'Auth',
        error_message: errorMessage
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      signInWithGoogle, 
      signInWithEmail,
      signUpWithEmail,
      resetPassword,
      logout, 
      userId 
    }}>
      {children}
    </AuthContext.Provider>
  );
};