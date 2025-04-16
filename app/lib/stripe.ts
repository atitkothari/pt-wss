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
    
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create portal session: ${errorText}`);
    }

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
} 