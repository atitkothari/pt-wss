import { NextResponse } from 'next/server';
import { adminDb } from '../../lib/firebase-admin';
import { isSubscriptionActive, SubscriptionData } from '../../lib/subscription';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    // Get user document from Firestore
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ hasActiveSubscription: false });
    }
    
    const userData = userDoc.data() as SubscriptionData;
    const hasActiveSubscription = isSubscriptionActive(userData);
    
    return NextResponse.json({ hasActiveSubscription });
  } catch (error) {
    console.error('Error checking subscription:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 