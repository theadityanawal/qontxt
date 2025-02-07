import { adminAuth, verifySessionCookie, revokeUserSessions } from '@/lib/firebase-admin';
import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/resume'];
const authRoutes = ['/auth'];

// CSRF protection
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

export async function POST(request: Request) {
  try {
    validateCSRFToken(request);

    const { token } = await request.json();
    const expiresIn = 60 * 60 * 24 * 5; // 5 days in seconds

    // First verify the ID token
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      if (!decodedToken) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      // Create a session cookie
      const sessionCookie = await adminAuth.createSessionCookie(token, { expiresIn });

      const cookieOptions: Partial<ResponseCookie> = {
        expires: new Date(Date.now() + expiresIn * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      };

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
      { status: error instanceof Error && error.message === 'Invalid origin' ? 403 : 500 }
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

    return NextResponse.json({ status: 'success' });
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
  const isProtected = protectedRoutes.some(route =>
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

  if (authRoutes.includes(pathname) && session) {
    const decodedClaims = await verifySessionCookie(session);
    if (decodedClaims) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [...protectedRoutes, ...authRoutes]
}
