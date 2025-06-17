import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'coolify.kothariatit.com',
  database: 'postgres',
  password: 'nGVKnt89uHTZYsBw8iSMK0eAkyWC1PyNY34uwhe5gMifMOnk0clnRo8HiSZ2O3vc',
  port: 5432,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM wheel_options WHERE symbol ILIKE $1 LIMIT 10',
      [`%${symbol}%`]
    );
    client.release();

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching options from PostgreSQL:', error);
    return NextResponse.json(
      { error: 'Failed to fetch options from database' },
      { status: 500 }
    );
  }
} 