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

    const activeMode = token.activeMode || token.role;
    if (activeMode !== 'PROVIDER') {
      // In FAMILY mode - redirect to family dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect family-specific dashboard routes - require FAMILY mode
  if (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/requests')) {
    if (!token) {
      // Not logged in - redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Allow access to shared routes like /dashboard/requests/[id]
    // These are accessible from both modes
    const sharedRoutes = ['/dashboard/provider-profile'];
    const isSharedRoute = sharedRoutes.some(route => pathname.startsWith(route));

    if (!isSharedRoute) {
      const activeMode = token.activeMode || token.role;
      if (activeMode === 'PROVIDER' && pathname === '/dashboard') {
        // Provider in FAMILY mode trying to access family dashboard
        // Allow it since they might have dual roles
        // But if they're only PROVIDER, redirect to provider dashboard
        if (token.role === 'PROVIDER' && !token.dualRole) {
          return NextResponse.redirect(new URL('/provider/dashboard', request.url));
        }
      }
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
