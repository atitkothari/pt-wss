import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { adminDb } from '../../lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

// Get these from environment variables in production
const MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID;
const YEARLY_PRICE_ID = process.env.STRIPE_YEARLY_PRICE_ID;

export async function POST(req: Request) {
  try {
    const headersList = headers();
    const authHeader = headersList.get('authorization');
    
    // Get user info from request body since we're only using Firebase Auth
    const body = await req.json();
    const { userId, email: userEmail, isYearly } = body;
    
    // Check if we have a userId (required)
    if (!userId) {
      console.error("No user ID provided in request");
      return new NextResponse('Unauthorized - No user ID provided', { status: 401 });
    }
    
    console.log("Processing checkout for Firebase user:", userId);
    
    try {
      // Get or create user document in Firestore using Admin SDK
      const userRef = adminDb.collection('users').doc(userId);
      const userDoc = await userRef.get();
      
      // Get or create Stripe customer
      let customerId;
      
      if (userDoc.exists && userDoc.data()?.stripeCustomerId) {
        // Use existing Stripe customer ID from Firestore
        customerId = userDoc.data()?.stripeCustomerId;
        console.log("Using existing Stripe customer:", customerId);
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          email: userEmail || userId,
          metadata: {
            firebaseUID: userId,
          },
        });
        customerId = customer.id;
        
        // Update or create user document with Stripe customer ID
        if (userDoc.exists) {
          await userRef.update({ 
            stripeCustomerId: customerId,
            updatedAt: new Date()
          });
        } else {
          await userRef.set({ 
            stripeCustomerId: customerId,
            email: userEmail,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        
        console.log("Created new Stripe customer:", customerId);
      }
      
      // Use fixed price IDs from environment variables
      const priceId = isYearly ? YEARLY_PRICE_ID : MONTHLY_PRICE_ID;
      
      // Check if price ID exists
      if (!priceId) {
        console.error("Price ID not found in environment variables");
        return new NextResponse('Price ID not configured. Please contact support.', { status: 500 });
      }

      // Create checkout session
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        subscription_data: {
          trial_period_days: 5,
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/covered-call-screener?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing`,
        allow_promotion_codes: true,
        metadata: {
          userId,
        },
      });

      return NextResponse.json({ sessionId: checkoutSession.id });
    } catch (error) {
      console.error('Database or Stripe error:', error);
      return new NextResponse('Internal server error', { status: 500 });
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 