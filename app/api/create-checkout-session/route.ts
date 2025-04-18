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

if (!MONTHLY_PRICE_ID || !YEARLY_PRICE_ID) {
  throw new Error('Stripe price IDs are not set in environment variables');
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
      console.error("Customer document not found in Firebase for userId:", userId);
      return new NextResponse('Unauthorized - Customer document not found', { status: 401 });
    }

    const stripeId = customerDoc.data()?.stripeId;
    console.log('Found Stripe customer ID:', stripeId);
    
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
        subscription_data: {
          trial_period_days: 1,
        },
        payment_method_collection: 'if_required',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/covered-call-screener?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing`,
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