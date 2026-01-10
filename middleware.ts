import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Not logged in - redirect to login for protected routes
  if (!token) {
    if (pathname.startsWith('/provider') || pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // User is authenticated - enforce mode-based access control
  const activeMode = token.activeMode as string;

  // FAMILY mode users: block access to /provider/* routes
  if (activeMode === 'FAMILY' && pathname.startsWith('/provider')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // PROVIDER mode users: block access to /dashboard/* routes (except provider dashboard and requests page)
  // The /dashboard/requests page handles both family and provider modes
  if (activeMode === 'PROVIDER' &&
      pathname.startsWith('/dashboard') &&
      !pathname.startsWith('/dashboard/provider') &&
      !pathname.startsWith('/dashboard/requests')) {
    return NextResponse.redirect(new URL('/provider/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/provider/:path*',
    '/dashboard/:path*',
  ],
};
