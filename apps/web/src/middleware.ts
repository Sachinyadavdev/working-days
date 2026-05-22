import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Allow API routes and static files
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Check for auth token in cookies or localStorage (via cookie bridge)
  // Note: In production, use httpOnly cookies. For now, check a simple cookie.
  const token = request.cookies.get('ems-auth-token')?.value;

  // For the initial setup, we'll do a soft check.
  // The actual token validation happens on the API side.
  // This middleware primarily handles redirects.

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
