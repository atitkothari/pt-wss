import { loadStripe } from '@stripe/stripe-js';

let stripePromise: Promise<any> | null = null;

const getStripe = () => {
  if (typeof window === 'undefined') return null;
  
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

export async function createCheckoutSession(priceId: string) {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
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
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
} 