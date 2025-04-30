import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { adminDb } from '../../lib/firebase-admin';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-03-31.basil',
});

// Get these from environment variables in production
const MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID;
const YEARLY_PRICE_ID = process.env.STRIPE_YEARLY_PRICE_ID;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

if (!MONTHLY_PRICE_ID || !YEARLY_PRICE_ID) {
  throw new Error('Stripe price IDs are not set in environment variables');
}

if (!APP_URL) {
  throw new Error('NEXT_PUBLIC_APP_URL is not set in environment variables');
}

export async function POST(req: Request) {
  try {
    const headersList = headers();
    const authHeader = headersList.get('authorization');
    
    // Get user info from request body since we're only using Firebase Auth
    const body = await req.json();
    const { userId, email: userEmail, isYearly } = body;
    
    console.log('Request body:', { userId, userEmail, isYearly });
    
    if (!userId) {
      console.error("No user ID provided in request");
      return new NextResponse('Unauthorized - No user ID provided', { status: 401 });
    }
    
    //read customer collection from firebase
    const customerRef = adminDb.collection('customers').doc(userId);
    const customerDoc = await customerRef.get();
    
    if (!customerDoc.exists) {
      console.log("Customer document not found in Firebase for userId:", userId, "Creating new customer document...");
      // Create a new customer document with an empty stripeId
      await customerRef.set({
        stripeId: null, // Initialize with null
        // You might want to add other fields like email, createdAt, etc.
        email: userEmail,
        createdAt: new Date().toISOString(),
      });
      console.log("Created new customer document for userId:", userId);
    }

    let stripeId = customerDoc.exists ? customerDoc.data()?.stripeId : null;
    console.log('Found Stripe customer ID:', stripeId);

    // If stripeId doesn't exist or if the customer doesn't exist in Stripe, create a new Stripe customer
    if (!stripeId) {
      try {
        // Create a new Stripe customer
        const stripeCustomer = await stripe.customers.create({
          email: userEmail,
        });
        stripeId = stripeCustomer.id;

        // Update Firestore with the new Stripe customer ID
        await customerRef.update({
          stripeId: stripeId,
        });
        console.log('Created new Stripe customer and updated Firestore');
      } catch (error) {
        console.error('Stripe error details:', error);
        return new NextResponse(`Stripe error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
      }
    } else {
      // Verify if the customer exists in Stripe
      try {
        await stripe.customers.retrieve(stripeId);
        console.log('Verified existing Stripe customer');
      } catch (error) {
        console.log('Stripe customer not found, creating new one');
        // Create a new Stripe customer
        const stripeCustomer = await stripe.customers.create({
          email: userEmail,
        });
        stripeId = stripeCustomer.id;

        // Update Firestore with the new Stripe customer ID
        await customerRef.update({
          stripeId: stripeId,
        });
        console.log('Created new Stripe customer and updated Firestore');
      }
    }
    
    try {
      // Use predefined price IDs from environment variables if available
      let priceId = isYearly ? YEARLY_PRICE_ID : MONTHLY_PRICE_ID;
      
      if (!priceId) {
        console.error("Price ID not found for subscription type:", isYearly ? 'yearly' : 'monthly');
        return new NextResponse('Internal server error - Price configuration missing', { status: 500 });
      }

      console.log('Creating checkout session with price ID:', priceId);

      // Create checkout session
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: stripeId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',        
        success_url: `${APP_URL}/covered-call-screener?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${APP_URL}/pricing`,
        allow_promotion_codes: true,
        metadata: {
          userId,
        },
      });

      console.log('Checkout session created successfully:', checkoutSession.id);
      return NextResponse.json({ sessionId: checkoutSession.id });
    } catch (error) {
      console.error('Stripe error details:', error);
      return new NextResponse(`Stripe error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
    }
  } catch (error) {
    console.error('General error in create-checkout-session:', error);
    return new NextResponse(`Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
} 