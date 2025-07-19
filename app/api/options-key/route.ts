import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

const pool = new Pool({
  user: 'postgres',
  host: 'coolify.kothariatit.com',
  database: 'postgres',
  password: 'nGVKnt89uHTZYsBw8iSMK0eAkyWC1PyNY34uwhe5gMifMOnk0clnRo8HiSZ2O3vc',
  port: 5432,
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);    
    const optionKey = searchParams.get('optionKey');

    if (!optionKey) {
      return NextResponse.json({ error: 'Missing optionKey parameters' }, { status: 400 });
    }

    const client = await pool.connect();    
    
      const query = `
      SELECT *
      FROM wheel_options
      WHERE option_key = $1
      LIMIT 1;
    `;
    const values = [optionKey];
    const result = await client.query(query, values);
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Option not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
    
  } catch (error) {
    console.error('Error fetching option data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 