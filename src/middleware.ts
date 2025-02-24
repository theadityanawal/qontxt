import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionCookie } from '@/lib/firebase-admin';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Define protected and auth routes
const protectedRoutes = ['/dashboard', '/resume'];
const authRoutes = ['/auth'];
const API_ROUTES = ['/api/ai', '/api/auth'];

// Initialize rate limiter
const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '10 s'),
});

// Security configurations
const CORS_ORIGINS = new Set([
  'https://qontxt.com',
  'https://app.qontxt.com',
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : [])
]);

const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'strict-dynamic'", "'nonce-{NONCE}'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'"],
  'connect-src': [
    "'self'",
    'https://api.openai.com',
    'https://api.deepseek.com',
    'https://generativelanguage.googleapis.com'
  ],
  'frame-ancestors': ["'none'"],
  'form-action': ["'self'"],
  'base-uri': ["'self'"],
  'object-src': ["'none'"]
};

// Helper Functions
function errorResponse(message: string, status: number) {
  return new NextResponse(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

function generateCSP(nonce?: string): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([key, values]) => {
      const processedValues = values.map(v =>
        v.includes('{NONCE}') ? v.replace('{NONCE}', nonce || '') : v
      );
      return `${key} ${processedValues.join(' ')}`;
    })
    .join('; ');
}

function addSecurityHeaders(response: NextResponse, nonce?: string): void {
  response.headers.set('Content-Security-Policy', generateCSP(nonce));

  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  );
}

// Main Middleware Function
export async function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url);
  const response = NextResponse.next();
  const nonce = crypto.randomUUID();

  try {
    // Add security headers to all responses
    addSecurityHeaders(response, nonce);

    // CORS handling for API routes
    if (pathname.startsWith('/api/')) {
      const origin = request.headers.get('origin');

      if (origin && CORS_ORIGINS.has(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        response.headers.set('Access-Control-Max-Age', '86400');
      }

      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return response;
        }

    // Get IP address from request headers
function getClientIP(request: NextRequest): string {
    // Try forwarded header first (for proxied requests)
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    // Try real IP header (common in nginx)
    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
      return realIP.trim();
    }

    // Fallback to connection remote address
    return '127.0.0.1'; // Default fallback
  }

      // Rate limiting for API routes
      if (API_ROUTES.some(route => pathname.startsWith(route))) {
        const clientIP = getClientIP(request);
        const { success, limit, reset, remaining } = await rateLimiter.limit(clientIP);

        if (!success) {
          errorTracker.trackError(
            new Error('Rate limit exceeded'),
            'low',
            { route: pathname, metadata: { ip: clientIP, limit, reset } }
          );
          return errorResponse('Too many requests', 429);
        }

        // Add rate limit headers
        response.headers.set('X-RateLimit-Limit', limit.toString());
        response.headers.set('X-RateLimit-Remaining', remaining.toString());
        response.headers.set('X-RateLimit-Reset', reset.toString());
      }
    }

    // Protected Routes & Authentication Logic
    const session = request.cookies.get('session')?.value;
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
        const decodedClaims = await verifySessionCookie(session);

        if (!decodedClaims) {
          response.cookies.delete('session');
          const redirectUrl = new URL('/auth', request.url);
          redirectUrl.searchParams.set('from', pathname);
          return NextResponse.redirect(redirectUrl);
        }

        // Add user info to request headers
        response.headers.set('X-User-ID', decodedClaims.uid);
        response.headers.set('X-User-Email', decodedClaims.email || '');
      } catch (error) {
        errorTracker.trackError(
          error instanceof Error ? error : new Error('Session verification failed'),
          'medium',
          { route: pathname }
        );
        response.cookies.delete('session');
        const redirectUrl = new URL('/auth', request.url);
        redirectUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Auth Routes Handling
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
  } catch (error) {
    errorTracker.trackError(
      error instanceof Error ? error : new Error('Middleware error'),
      'high',
      { route: pathname }
    );
    return errorResponse('Internal server error', 500);
  }
}

// Configure middleware matcher
export const config = {
  matcher: [
    ...API_ROUTES.map(route => route + '/:path*'),
    ...authRoutes,
    ...protectedRoutes.map(route => route + '/:path*'),
  ]
};

