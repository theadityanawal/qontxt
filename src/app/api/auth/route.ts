// src/app/api/auth/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { DecodedIdToken } from 'firebase-admin/auth';

export async function POST(request: Request) {
  const cookieStore = cookies();

  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Missing authentication token' },
        { status: 401 }
      );
    }

    // Verify the token first
    let decodedToken: DecodedIdToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('Error verifying token:', error);
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 403 }
      );
    }

    // Create session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(token, {
      expiresIn,
    });

    // Set cookie with enhanced security options
    cookieStore.set('session', sessionCookie, {
      maxAge: expiresIn / 1000, // Convert to seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      priority: 'high',
    });

    return NextResponse.json(
      {
        status: 'success',
        uid: decodedToken.uid
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error('Error in auth API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const cookieStore = cookies();

  try {
    // Clear the session cookie
    cookieStore.set('session', '', {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json(
      { status: 'success' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error clearing session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
