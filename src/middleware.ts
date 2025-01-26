import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';

const protectedRoutes = ['/dashboard', '/resume'];
const authRoutes = ['/auth'];

export async function middleware(request: Request) {
  const { pathname } = new URL(request.url);
  const session = await auth.currentUser;

  // Windows path compatibility
  const isProtected = protectedRoutes.some(route =>
    pathname.startsWith(route.replace(/\\/g, '/'))
  );

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  if (authRoutes.includes(pathname) && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}
