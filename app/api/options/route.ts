import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const userId = searchParams.get('userId');
  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.wheelstrategyoptions.com/wheelstrat/filter`, {
      method: 'POST',
      headers: {
        'X-token': 'ABC',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filters: [
          {
            operation: "eq",
            field: "symbol",
            value: `"${symbol}"`
          }
        ],
        paging: true,
        pageNo: 1,
        pageSize: 1000,
        userId: "h1Mob0LGGnXOYziKQYNENMJqOb73",
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in options API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch options data' },
      { status: 500 }
    );
  }
}
