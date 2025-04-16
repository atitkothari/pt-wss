import { auth } from './firebase';
import { adminDb } from './firebase-admin';

// Types
export type SubscriptionStatus = 
  | 'active' 
  | 'trialing' 
  | 'past_due' 
  | 'canceled' 
  | 'incomplete' 
  | 'incomplete_expired' 
  | 'unpaid'
  | null;

export interface SubscriptionData {
  subscriptionId: string | null;
  subscriptionStatus: SubscriptionStatus;
  subscriptionCurrentPeriodEnd: Date | null;
  stripeCustomerId: string | null;
}

// Helper function to check if the user has an active subscription
export async function hasActiveSubscription(userId?: string): Promise<boolean> {
  try {
    // If no userId provided, get current user
    if (!userId) {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return false;
      }
      userId = currentUser.uid;
    }

    // Use admin SDK on the server
    if (typeof window === 'undefined') {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return false;
      }
      
      const userData = userDoc.data() as SubscriptionData;
      return isSubscriptionActive(userData);
    } 
    
    // Use fetch API for client-side
    else {
      const response = await fetch('/api/check-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      return data.hasActiveSubscription;
    }
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
}

// Helper function to determine if a subscription is active
export function isSubscriptionActive(subscriptionData: SubscriptionData | null | undefined): boolean {
  if (!subscriptionData) {
    return false;
  }
  
  const { subscriptionStatus, subscriptionCurrentPeriodEnd } = subscriptionData;
  
  // Active if subscription status is active or trialing
  if (subscriptionStatus === 'active' || subscriptionStatus === 'trialing') {
    return true;
  }
  
  // For past_due, check if within grace period (7 days)
  if (subscriptionStatus === 'past_due' && subscriptionCurrentPeriodEnd) {
    const gracePeriodEnd = new Date(subscriptionCurrentPeriodEnd);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);
    return new Date() < gracePeriodEnd;
  }
  
  return false;
} 