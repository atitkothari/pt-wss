import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/app/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(req: Request) {
  try {
    // Get user info from request body since we're only using Firebase Auth
    const body = await req.json();
    const { userId } = body;
    
    // Check if we have a userId (required)
    if (!userId) {
      console.error("No user ID provided in request");
      return new NextResponse('Unauthorized - No user ID provided', { status: 401 });
    }
    
    console.log("Using Firebase auth user:", userId);

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    if (!userData?.stripeCustomerId) {
      return new NextResponse('No subscription found', { status: 400 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userData.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://wheelstrategyoptions.com'}/covered-call-screener`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return new NextResponse(`Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
} 