import { loadStripe } from '@stripe/stripe-js';
import { auth } from './firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase';

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
    
    // Include Firebase user info and selected price ID
    const body = { 
      userId: currentUser.uid,
      email: currentUser.email,
      isYearly: isYearly,      
    }
    
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    
    console.log(response)
    
    // if (!response.ok) {
    //   const errorText = await response.text();
    //   throw new Error(`Failed to create checkout session: ${errorText}`);
    // }

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
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('You must be logged in to manage your subscription');
    }
       
    const functions = getFunctions(app, "us-central1");
    const functionRef = httpsCallable(
      functions,
      "ext-firestore-stripe-payments-createPortalLink"
    );
    const response = await functionRef({
      customerId: user?.uid,
      returnUrl: window.location.origin,
    });
    
    const data = response.data as { url: string };    
    console.log(data.url)
    if (!data.url) {
      throw new Error('Invalid response from server: missing URL');
    }
    
    window.location.href = data.url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
} 