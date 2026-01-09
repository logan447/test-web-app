import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Protect provider routes - require PROVIDER mode
  if (pathname.startsWith('/provider')) {
    if (!token) {
      // Not logged in - redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Use activeMode, but fall back to role only if activeMode is not set
    // This allows users to switch modes regardless of their base role
    const activeMode = token.activeMode ?? token.role;
    if (activeMode !== 'PROVIDER') {
      // In FAMILY mode - redirect to home page
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect family dashboard - redirect to provider dashboard if in PROVIDER mode
  if (pathname === '/dashboard') {
    if (!token) {
      // Not logged in - redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const activeMode = token.activeMode ?? token.role;
    if (activeMode === 'PROVIDER') {
      // User is in PROVIDER mode, redirect to provider dashboard
      return NextResponse.redirect(new URL('/provider/dashboard', request.url));
    }
  }

  // Allow access to shared routes regardless of mode
  const sharedRoutes = ['/dashboard/requests', '/dashboard/provider-profile'];
  const isSharedRoute = sharedRoutes.some(route => pathname.startsWith(route));
  if (isSharedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Allow access from either mode
    return NextResponse.next();
  }

  // Protect other family-specific dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const activeMode = token.activeMode ?? token.role;
    if (activeMode === 'PROVIDER') {
      // Provider mode users should use provider-specific routes
      return NextResponse.redirect(new URL('/provider/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/provider/:path*',
    '/dashboard/:path*',
  ],
};
