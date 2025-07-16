import { NextResponse } from 'next/server';
import { adminDb } from '@/app/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

// POST: Fetch prices for a list of option keys
export async function POST(request: Request) {
  try {
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await getAuth().verifyIdToken(idToken);

    const { optionKeys } = await request.json();
    if (!optionKeys || !Array.isArray(optionKeys)) {
      return NextResponse.json({ error: 'Option keys are required' }, { status: 400 });
    }

    const prices: { [key: string]: number } = {};
    for (const optionKey of optionKeys) {
      // This is a placeholder for fetching the actual price from a data provider
      // For now, we'll use a random number
      prices[optionKey] = Math.random() * 100;
    }

    return NextResponse.json(prices);
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 });
  }
}
