import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Here you would typically:
    // 1. Validate the email
    // 2. Store it in your database
    // 3. Send a welcome email
    // For now, we'll just return success

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process signup' },
      { status: 500 }
    );
  }
} 