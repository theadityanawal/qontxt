// src/app/api/auth/route.ts
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/config-admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return new NextResponse('No token provided', { status: 401 });
    }

    // Create session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(token, {
      expiresIn,
    });

    // Set cookie
    cookies().set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });

    return new NextResponse(JSON.stringify({ status: 'success' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in auth API:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
