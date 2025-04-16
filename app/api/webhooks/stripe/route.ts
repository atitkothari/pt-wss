import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { adminDb } from '../../../lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

// This is your Stripe webhook secret for testing your endpoint locally.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Extend the Stripe types as needed
interface StripeSubscription extends Stripe.Subscription {
  current_period_end: number;
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`❌ Error verifying webhook signature: ${errorMessage}`);
      return new NextResponse(`Webhook signature verification failed: ${errorMessage}`, { status: 400 });
    }

    console.log(`✅ Success: Received Stripe webhook event: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        
        // Get the customer and subscription details
        const customerId = checkoutSession.customer as string;
        const subscriptionId = checkoutSession.subscription as string;
        const userId = checkoutSession.metadata?.userId;

        if (!userId) {
          console.error('No userId found in session metadata');
          return new NextResponse('Missing userId in session metadata', { status: 400 });
        }

        // Store subscription info in the database
        const userRef = adminDb.collection('users').doc(userId);
        await userRef.update({
          subscriptionId: subscriptionId,
          subscriptionStatus: 'trialing', // Initially in trial
          stripeCustomerId: customerId,
          updatedAt: new Date(),
        });

        console.log(`✅ Subscription created for user: ${userId}`);
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as StripeSubscription;
        const customerId = subscription.customer as string;
        
        // Find the user with this customer ID
        const usersRef = adminDb.collection('users');
        const querySnapshot = await usersRef.where('stripeCustomerId', '==', customerId).limit(1).get();
        
        if (querySnapshot.empty) {
          console.error(`No user found with Stripe customer ID: ${customerId}`);
          return new NextResponse('User not found', { status: 404 });
        }

        // Update subscription status
        const userDoc = querySnapshot.docs[0];
        await userDoc.ref.update({
          subscriptionStatus: subscription.status,
          subscriptionPlan: subscription.items.data[0]?.price.lookup_key || 'unknown',
          subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          updatedAt: new Date(),
        });
        
        console.log(`✅ Subscription updated for user: ${userDoc.id}, status: ${subscription.status}`);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Find the user with this customer ID
        const usersRef = adminDb.collection('users');
        const querySnapshot = await usersRef.where('stripeCustomerId', '==', customerId).limit(1).get();
        
        if (querySnapshot.empty) {
          console.error(`No user found with Stripe customer ID: ${customerId}`);
          return new NextResponse('User not found', { status: 404 });
        }

        // Update subscription status to canceled
        const userDoc = querySnapshot.docs[0];
        await userDoc.ref.update({
          subscriptionStatus: 'canceled',
          updatedAt: new Date(),
        });
        
        console.log(`✅ Subscription canceled for user: ${userDoc.id}`);
        break;
      }
      
      default:
        console.log(`🔔 Unhandled event type: ${event.type}`);
    }

    return new NextResponse('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 