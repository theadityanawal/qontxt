import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get session cookie
  const session = request.cookies.get('session')

  // If accessing dashboard without session, redirect to login
  if (request.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If accessing login with session, redirect to dashboard
  if (request.nextUrl.pathname === '/' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*']
}
