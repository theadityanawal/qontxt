// src/app/api/auth/verify/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifySessionCookie } from '@/lib/firebase/admin';

export async function GET() {
  try {
    const session = cookies().get('session')?.value;

    if (!session) {
      return NextResponse.json(
        { error: 'No session cookie found' },
        { status: 401 }
      );
    }

    const { valid, uid } = await verifySessionCookie(session);

    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    return NextResponse.json({ uid }, { status: 200 });
  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
