// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateSession } from '@/lib/auth-utils';

// Add routes that don't require authentication
const publicRoutes = [
  '/login',
  '/signup',
  '/reset-password',
  '/_next',
  '/api/auth',
  '/favicon.ico',
];

export async function middleware(request: NextRequest) {
  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const { isAuthenticated } = await validateSession();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Specify which routes should trigger the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. Matches any path starting with:
     *  - api/auth (authentication API routes)
     *  - _next/static (static files)
     *  - _next/image (image optimization files)
     *  - favicon.ico (favicon file)
     * 2. public routes defined above
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
