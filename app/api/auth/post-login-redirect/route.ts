import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(request: Request) {
  try {
    // Read the JWT token directly from the cookie
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    console.log('[PostLoginRedirect] Token:', token);

    if (!token) {
      console.log('[PostLoginRedirect] No token, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const mode = token.activeMode as string;
    console.log('[PostLoginRedirect] User mode:', mode);

    // Redirect based on mode
    if (mode === 'PROVIDER') {
      console.log('[PostLoginRedirect] Redirecting PROVIDER to /provider/requests');
      return NextResponse.redirect(new URL('/provider/requests', request.url));
    } else {
      console.log('[PostLoginRedirect] Redirecting FAMILY to /');
      return NextResponse.redirect(new URL('/', request.url));
    }
  } catch (error) {
    console.error('[PostLoginRedirect] Error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
