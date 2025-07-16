import { NextResponse } from 'next/server';
import { adminDb } from '@/app/lib/firebase-admin';
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

    const tradesSnapshot = await adminDb.collection('trades').where('userId', '==', userId).get();
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
    const { optionKey, ...tradeData } = trade;
    const newTrade = { ...tradeData, userId, status: 'open', openDate: new Date().toISOString(), optionKey };
    const docRef = await adminDb.collection('trades').add(newTrade);

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

    // Ensure optionKey is not overwritten if not provided
    const { optionKey, ...tradeData } = trade;
    if (optionKey) {
      tradeData.optionKey = optionKey;
    }

    await adminDb.collection('trades').doc(id).update(tradeData);

    return NextResponse.json({ id, ...tradeData });
  } catch (error) {
    console.error('Error updating trade:', error);
    return NextResponse.json({ error: 'Failed to update trade' }, { status: 500 });
  }
}

// DELETE: Delete a trade by ID
export async function DELETE(request: Request) {
  try {
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Trade ID is required' }, { status: 400 });
    }

    // Optionally, check if the trade belongs to the user before deleting
    const docRef = adminDb.collection('trades').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }
    const docData = doc.data();
    if (!docData || docData.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await docRef.delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting trade:', error);
    return NextResponse.json({ error: 'Failed to delete trade' }, { status: 500 });
  }
}
