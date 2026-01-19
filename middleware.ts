import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Bootstrap routes are PUBLIC - they handle their own security
  // by checking if any admin exists in the database
  const isBootstrapRoute =
    pathname === '/admin/bootstrap' ||
    pathname === '/api/admin/bootstrap';

  if (isBootstrapRoute) {
    return NextResponse.next();
  }

  // Protected routes that require authentication
  const isProtectedRoute =
    pathname.startsWith('/provider') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/caregiver') ||
    pathname.startsWith('/admin');

  // Not logged in - redirect to login for protected routes with returnUrl
  if (!token && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes require ADMIN role (except bootstrap which is handled above)
  if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // User is authenticated - allow access to all routes
  // Pages will handle mode-specific content checks themselves
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/provider/:path*',
    '/dashboard/:path*',
    '/settings/:path*',
    '/caregiver/:path*',
    '/admin/:path*',
  ],
};
