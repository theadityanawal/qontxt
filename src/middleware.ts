import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionCookie } from '@/lib/firebase-admin';

const protectedRoutes = ['/dashboard', '/resume'];
const authRoutes = ['/auth'];

export async function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url);
  const response = NextResponse.next();

  // Get the token from the session cookie
  const session = request.cookies.get('session')?.value;

  // Windows path compatibility
  const isProtected = protectedRoutes.some(route =>
    pathname.startsWith(route.replace(/\\/g, '/'))
  );

  if (isProtected) {
    if (!session) {
      const redirectUrl = new URL('/auth', request.url);
      redirectUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    try {
      // Verify the session cookie for protected routes
      const decodedClaims = await verifySessionCookie(session);
      if (!decodedClaims) {
        // Clear invalid session
        response.cookies.delete('session');
        const redirectUrl = new URL('/auth', request.url);
        redirectUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      // Handle session verification errors (expired, invalid, etc.)
      console.error('Session verification failed:', error);
      response.cookies.delete('session');
      const redirectUrl = new URL('/auth', request.url);
      redirectUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (authRoutes.includes(pathname) && session) {
    try {
      const decodedClaims = await verifySessionCookie(session);
      if (decodedClaims) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      // If session is invalid on auth routes, clear it but stay on auth page
      response.cookies.delete('session');
    }
  }

  return response;
}

export const config = {
  matcher: [...protectedRoutes, ...authRoutes]
}
