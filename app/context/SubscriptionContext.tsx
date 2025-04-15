'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SubscriptionContextType {
  isTrialActive: boolean;
  daysLeftInTrial: number;
  isSubscribed: boolean;
  loading: boolean;
  error: string | null;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isTrialActive: false,
  daysLeftInTrial: 0,
  isSubscribed: false,
  loading: true,
  error: null,
});

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [daysLeftInTrial, setDaysLeftInTrial] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const trialEndDate = data.trialEndDate?.toDate();
        const subscriptionStatus = data.subscriptionStatus;

        if (trialEndDate) {
          const now = new Date();
          const daysLeft = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          setIsTrialActive(daysLeft > 0);
          setDaysLeftInTrial(daysLeft);
        }

        setIsSubscribed(subscriptionStatus === 'active');
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching subscription data:', error);
      setError('Failed to load subscription data');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <SubscriptionContext.Provider value={{
      isTrialActive,
      daysLeftInTrial,
      isSubscribed,
      loading,
      error
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext); 