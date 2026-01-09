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

  // Get activeMode from token, defaulting to FAMILY if not set or if it's falsy
  // This is the source of truth for which mode the user is in
  const activeMode = token.activeMode === 'PROVIDER' ? 'PROVIDER' : 'FAMILY';

  // Debug logging
  console.log('[MIDDLEWARE]', {
    pathname,
    userId: token.id,
    email: token.email,
    role: token.role,
    tokenActiveMode: token.activeMode,
    resolvedActiveMode: activeMode,
  });

  // Protect provider routes - require PROVIDER mode
  if (pathname.startsWith('/provider')) {
    if (activeMode !== 'PROVIDER') {
      // In FAMILY mode - redirect to home page
      console.log('[MIDDLEWARE] ❌ Blocking access - user in FAMILY mode, redirecting to /');
      return NextResponse.redirect(new URL('/', request.url));
    }
    console.log('[MIDDLEWARE] ✅ Allowing access to provider route');
  }

  // Protect family dashboard - redirect to provider dashboard if in PROVIDER mode
  if (pathname === '/dashboard') {
    if (activeMode === 'PROVIDER') {
      // User is in PROVIDER mode, redirect to provider dashboard
      console.log('[MIDDLEWARE] ❌ Blocking access - user in PROVIDER mode, redirecting to /provider/dashboard');
      return NextResponse.redirect(new URL('/provider/dashboard', request.url));
    }
    console.log('[MIDDLEWARE] ✅ Allowing access to family dashboard');
  }

  // Allow access to shared routes regardless of mode
  const sharedRoutes = ['/dashboard/requests', '/dashboard/provider-profile'];
  const isSharedRoute = sharedRoutes.some(route => pathname.startsWith(route));
  if (isSharedRoute) {
    console.log('[MIDDLEWARE] ✅ Allowing access to shared route');
    return NextResponse.next();
  }

  // Protect other family-specific dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (activeMode === 'PROVIDER') {
      // Provider mode users should use provider-specific routes
      console.log('[MIDDLEWARE] ❌ Blocking access - user in PROVIDER mode, redirecting to /provider/dashboard');
      return NextResponse.redirect(new URL('/provider/dashboard', request.url));
    }
    console.log('[MIDDLEWARE] ✅ Allowing access to family route');
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/provider/:path*',
    '/dashboard/:path*',
  ],
};
