import { NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

// GET: Fetch all trades for the current user
export async function GET(request: Request) {
  try {
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const tradesSnapshot = await db.collection('trades').where('userId', '==', userId).get();
    const trades = tradesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(trades);
  } catch (error) {
    console.error('Error fetching trades:', error);
    return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 });
  }
}

// POST: Create a new trade
export async function POST(request: Request) {
  try {
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const trade = await request.json();
    const newTrade = { ...trade, userId, status: 'open', openDate: new Date().toISOString() };
    const docRef = await db.collection('trades').add(newTrade);

    return NextResponse.json({ id: docRef.id, ...newTrade });
  } catch (error) {
    console.error('Error creating trade:', error);
    return NextResponse.json({ error: 'Failed to create trade' }, { status: 500 });
  }
}

// PUT: Update an existing trade
export async function PUT(request: Request) {
  try {
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await getAuth().verifyIdToken(idToken);

    const { id, ...trade } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Trade ID is required' }, { status: 400 });
    }

    await db.collection('trades').doc(id).update(trade);

    return NextResponse.json({ id, ...trade });
  } catch (error) {
    console.error('Error updating trade:', error);
    return NextResponse.json({ error: 'Failed to update trade' }, { status: 500 });
  }
}
