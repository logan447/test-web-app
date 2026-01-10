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

  // User is authenticated - allow access to all routes
  // Pages will handle mode-specific content checks themselves
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/provider/:path*',
    '/dashboard/:path*',
  ],
};
