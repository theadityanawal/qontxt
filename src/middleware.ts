// middleware.ts - Route Protection
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

/**
 * Middleware function to handle authentication using Firebase Admin SDK
 *
 * @param request - The incoming Next.js request object containing client information
 * @returns A NextResponse object that either:
 *          - Redirects to login page if no session exists
 *          - Allows request to proceed if session is valid
 *          - Redirects to login page if session verification fails
 *
 * @remarks
 * This middleware:
 * 1. Checks for session cookie in the request
 * 2. If no session exists, redirects to login page
 * 3. Attempts to verify the session cookie using Firebase Admin
 * 4. If verification succeeds, allows request to proceed
 * 5. If verification fails, redirects to login page
 *
 * @throws Will catch and handle any errors during session verification
 */
export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session');

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await adminAuth.verifySessionCookie(session.value);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/home/:path*']
}
