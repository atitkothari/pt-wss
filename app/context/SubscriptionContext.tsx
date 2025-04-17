'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

interface SubscriptionDocument {
  id: string;
  cancel_at: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created: string;
  current_period_end: { toDate: () => Date };
  current_period_start: string;
  ended_at: string | null;
  items: Array<{
    quantity: number;
    billing_thresholds: any;
  }>;
  metadata: Record<string, any>;
  price: string;
  prices: Array<string>;
  product: string;
  quantity: number;
  role: string | null;
  status: 'active' | 'trialing' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid';
  stripeLink: string;
  trial_end: { toDate: () => Date } | null;
  trial_start: string;
}

interface SubscriptionContextType {
  isTrialActive: boolean;
  daysLeftInTrial: number;
  isSubscribed: boolean;
  loading: boolean;
  error: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: Date | null;
  subscriptions: SubscriptionDocument[] | null;
}

export const getPremiumStatus = async (userId: string) => {
  if (!userId) throw new Error("User not logged in");
  
  const subscriptionsRef = collection(db, "customers", userId, "subscriptions");
  const q = query(
    subscriptionsRef,
    where("status", "in", ["trialing", "active"])
  );

  return new Promise<boolean>((resolve, reject) => {
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // In this implementation we only expect one active or trialing subscription to exist.
        console.log("Subscription snapshot", snapshot.docs.length);
        if (snapshot.docs.length === 0) {
          console.log("No active or trialing subscriptions found");
          resolve(false);
        } else {
          console.log("Active or trialing subscription found");
          resolve(true);
        }
        unsubscribe();
      },
      reject
    );
  });
};

const SubscriptionContext = createContext<SubscriptionContextType>({
  isTrialActive: false,
  daysLeftInTrial: 0,
  isSubscribed: false,
  loading: true,
  error: null,
  subscriptionStatus: null,
  currentPeriodEnd: null,
  subscriptions: null
});

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [daysLeftInTrial, setDaysLeftInTrial] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<Date | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionDocument[] | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Create a query to get active or trialing subscriptions
    const customerRef = doc(db, 'customers', user.uid);
    const subscriptionsRef = collection(customerRef, 'subscriptions');
    const activeSubscriptionsQuery = query(
      subscriptionsRef,
      where("status", "in", ["trialing", "active"])
    );
    const unsubscribe = onSnapshot(activeSubscriptionsQuery, (snapshot) => {
      if (!snapshot.empty) {
        const subscriptionDocs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SubscriptionDocument[];
        
        // Get the most recent active subscription
        const activeSubscription = subscriptionDocs.find(sub => 
          sub.status === 'active' || sub.status === 'trialing'
        );

        if (activeSubscription) {
          setSubscriptionStatus(activeSubscription.status);
          setCurrentPeriodEnd(activeSubscription.current_period_end?.toDate());
          setSubscriptions(subscriptionDocs);

          if (activeSubscription.status === 'trialing') {
            const trialEnd = activeSubscription.trial_end?.toDate();
            if (trialEnd) {
              const now = new Date();
              const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              setIsTrialActive(daysLeft > 0);
              setDaysLeftInTrial(daysLeft);
            }
          }

          setIsSubscribed(activeSubscription.status === 'active');
        } else {
          // No active subscription found
          setSubscriptionStatus(null);
          setCurrentPeriodEnd(null);
          setIsTrialActive(false);
          setDaysLeftInTrial(0);
          setIsSubscribed(false);
        }
      } else {
        // No subscriptions found
        setSubscriptionStatus(null);
        setCurrentPeriodEnd(null);
        setIsTrialActive(false);
        setDaysLeftInTrial(0);
        setIsSubscribed(false);
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
      error,
      subscriptionStatus,
      currentPeriodEnd,
      subscriptions
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext); 