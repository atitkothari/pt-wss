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
  loading: boolean;
  error: string | null;
  subscriptionStatus: string | null;
  
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
  loading: true,
  error: null,
  subscriptionStatus: null,    
});

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);    

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Create a query to get active or trialing subscriptions
    const customerRef = doc(db, 'customers', user.uid);
    const subscriptionsRef = collection(customerRef, 'subscriptions');   
    const unsubscribe = onSnapshot(subscriptionsRef, (snapshot) => {
      if (!snapshot.empty) {
        const subscriptionDocs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SubscriptionDocument[];
        
        // Sort subscriptions by created date in descending order (newest first)
        const sortedSubscriptions = subscriptionDocs.sort((a, b) => 
          new Date(b.created).getTime() - new Date(a.created).getTime()
        );
        
        // Get the most recent active subscription
        const activeSubscription = sortedSubscriptions[0];
        setSubscriptionStatus(activeSubscription?.status || null);
        
      } else {
        // No subscriptions found
        setSubscriptionStatus(null);
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
      loading,
      error,
      subscriptionStatus,      
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext); 