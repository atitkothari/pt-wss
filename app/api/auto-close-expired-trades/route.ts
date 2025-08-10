import { NextResponse } from 'next/server';
import { adminDb } from '@/app/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    // Optional: Add authentication for admin access
    // const authHeader = request.headers.get('Authorization');
    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

  
    
    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch all open trades that have expired
    const expiredTradesSnapshot = await adminDb
      .collection('trades')
      .where('status', '==', 'open')
      .where('expiration', '<', today)
      .get();

    if (expiredTradesSnapshot.empty) {

      return NextResponse.json({ 
        message: 'No expired trades found',
        closedCount: 0 
      });
    }

    

    // Batch update all expired trades
    const batch = adminDb.batch();
    const closedTrades: Array<{
      id: string;
      symbol: string;
      type: string;
      strike: number;
      expiration: string;
      userId: string;
    }> = [];

    expiredTradesSnapshot.forEach((doc) => {
      const tradeData = doc.data();
      const tradeRef = adminDb.collection('trades').doc(doc.id);
      
      // Update trade to expired status with closing cost of 0
      batch.update(tradeRef, {
        status: 'expired',
        closeDate: new Date().toISOString(),
        closingCost: 0
      });

      closedTrades.push({
        id: doc.id,
        symbol: tradeData.symbol,
        type: tradeData.type,
        strike: tradeData.strike,
        expiration: tradeData.expiration,
        userId: tradeData.userId
      });
    });

    // Commit the batch update
    await batch.commit();

    

    return NextResponse.json({
      message: `Successfully closed ${closedTrades.length} expired trades`,
      closedCount: closedTrades.length,
      closedTrades: closedTrades
    });

  } catch (error) {
    console.error('Error in auto-close expired trades:', error);
    return NextResponse.json({ 
      error: 'Failed to auto-close expired trades',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to check for expired trades without closing them
export async function GET(request: Request) {
  try {

    
    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch all open trades that have expired
    const expiredTradesSnapshot = await adminDb
      .collection('trades')
      .where('status', '==', 'open')
      .where('expiration', '<', today)
      .get();

    const expiredTrades = expiredTradesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        symbol: data.symbol,
        type: data.type,
        strike: data.strike,
        expiration: data.expiration,
        userId: data.userId,
        premium: data.premium,
        openDate: data.openDate
      };
    });

    

    return NextResponse.json({
      message: `Found ${expiredTrades.length} expired trades`,
      expiredCount: expiredTrades.length,
      expiredTrades: expiredTrades
    });

  } catch (error) {
    console.error('Error checking for expired trades:', error);
    return NextResponse.json({ 
      error: 'Failed to check for expired trades',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 