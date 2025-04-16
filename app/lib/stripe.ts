import { loadStripe } from '@stripe/stripe-js';
import { auth } from './firebase';

let stripePromise: Promise<any> | null = null;

const getStripe = () => {
  if (typeof window === 'undefined') return null;
  
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

export async function createCheckoutSession(isYearly: boolean = true) {
  try {
    // Get current Firebase user
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('You must be logged in to start a subscription');
    }
    
    // Include Firebase user info
    const body = { 
      userId: currentUser.uid,
      email: currentUser.email,
      isYearly 
    };
    
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create checkout session: ${errorText}`);
    }

    const { sessionId } = await response.json();
    const stripe = await getStripe();
    
    if (!stripe) {
      throw new Error('Stripe failed to initialize');
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function createCustomerPortalSession() {
  try {
    // Get current Firebase user
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('You must be logged in to manage your subscription');
    }
    
    // Include Firebase user info
    const body = {
      userId: currentUser.uid,
      email: currentUser.email
    };
    
    console.log('Creating portal session for user:', currentUser.uid);
    
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Portal session error response:', response.status, errorText);
      
      if (response.status === 400) {
        throw new Error('You don\'t have an active subscription to manage');
      } else if (response.status === 404) {
        throw new Error('User profile not found. Please sign out and sign in again.');
      } else {
        throw new Error(`Failed to create portal session: ${errorText}`);
      }
    }

    const data = await response.json();
    
    if (!data.url) {
      throw new Error('Invalid response from server: missing URL');
    }
    
    window.location.href = data.url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
} 