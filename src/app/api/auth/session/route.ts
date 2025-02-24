import { NextResponse } from 'next/server';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import type { NextRequest } from 'next/server';
import { cookies, headers } from 'next/headers';
import { adminAuth, verifySessionCookie, revokeUserSessions } from '@/lib/firebase-admin';

const PROTECTED_ROUTES = ['/dashboard', '/resume'];
const AUTH_ROUTES = ['/auth'];

// CSRF protection
/**
 * Validates the CSRF token by checking the origin and host headers.
 * Throws an error if the validation fails.
 */
const validateCSRFToken = (request: Request) => {
  const headersList = headers();
  const origin = headersList.get('origin');
  const host = headersList.get('host');

  if (!origin || !host) {
    throw new Error('Missing origin or host headers');
  }

  const isValidOrigin = origin === `https://${host}` ||
                       origin === `http://${host}` ||
                       (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost'));

  if (!isValidOrigin) {
    throw new Error('Invalid origin');
  }
}

/**
 * Handles the creation of a session cookie from an ID token.
 * This function expects a JSON body with a `token` field.
 * It verifies the token, creates a session cookie, and sets it in the response.
 */
export async function POST(request: NextRequest) {
  try {
    validateCSRFToken();

    let token;
    validateCSRFToken(request);
      const body = await request.json();
      token = body.token;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const expiresIn = 60 * 60 * 24 * 5; // 5 days in seconds

    const cookieOptions: Partial<ResponseCookie> = {
      expires: new Date(Date.now() + expiresIn * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    };

    // First verify the ID token
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      if (!decodedToken) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      // Create a session cookie
      const sessionCookie = await adminAuth.createSessionCookie(token, { expiresIn });

      const cookieStore = cookies();
      cookieStore.set('session', sessionCookie, cookieOptions);

      return NextResponse.json({ status: 'success' });
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
/**
 * Handles the deletion of the session cookie and revokes the user's session.
 * This function is typically called when a user logs out.
 *
 * @param request - The incoming request object.
 * @returns A JSON response indicating the success or failure of the operation.
 */
export async function DELETE(request: Request) {
    );
  }
}

export async function DELETE(request: Request) {
  try {
    validateCSRFToken(request);

    const cookieStore = cookies();
    const session = cookieStore.get('session');

    if (session?.value) {
      try {
        const decodedClaims = await verifySessionCookie(session.value);
        if (decodedClaims?.uid) {
          await revokeUserSessions(decodedClaims.uid);
        }
      } catch (error) {
        console.error('Error revoking session:', error);
      }
    }

    cookieStore.delete('session');

/**
 * Middleware to protect routes and handle session validation.
 * Redirects to the authentication page if the session is invalid or missing.
 * Allows access to protected routes only if the session is valid.
 */
export async function middleware(request: NextRequest) {
  } catch (error) {
    console.error('Session deletion error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 403 });
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url);

  // Get the token from the session cookie
  const session = request.cookies.get('session')?.value;

  // Windows path compatibility
  const isProtected = PROTECTED_ROUTES.some(route =>
    pathname.startsWith(route.replace(/\\/g, '/'))
  );

  if (isProtected) {
    if (!session) {
      const redirectUrl = new URL('/auth', request.url);
      redirectUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Verify the session cookie for protected routes
    const decodedClaims = await verifySessionCookie(session);
    if (!decodedClaims) {
      const redirectUrl = new URL('/auth', request.url);
      redirectUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (AUTH_ROUTES.includes(pathname) && session) {
    const decodedClaims = await verifySessionCookie(session);
    if (decodedClaims) {
const authRoutes = AUTH_ROUTES;

// Configuration object for route matching
// This ensures that the middleware is applied to the specified routes
export const config = {
  matcher: [...PROTECTED_ROUTES, ...AUTH_ROUTES]
}

  return NextResponse.next();
}

export const config = {
  matcher: [...PROTECTED_ROUTES, ...authRoutes]
}

