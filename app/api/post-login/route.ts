import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(request: Request) {
  try {
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    console.log('[Post-login] Token:', token?.activeMode);

    if (!token) {
      console.log('[Post-login] No token found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Redirect based on mode
    if (token.activeMode === 'PROVIDER') {
      console.log('[Post-login] PROVIDER mode -> /provider/requests');
      return NextResponse.redirect(new URL('/provider/requests', request.url));
    } else {
      console.log('[Post-login] FAMILY mode -> /');
      return NextResponse.redirect(new URL('/', request.url));
    }
  } catch (error) {
    console.error('[Post-login] Error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
