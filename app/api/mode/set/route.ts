import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserMode } from '@prisma/client';

/**
 * POST /api/mode/set
 *
 * Robust mode setting endpoint that:
 * 1. Updates database immediately
 * 2. Sets httpOnly cookie for immediate availability
 * 3. Returns success for session update
 *
 * This ensures mode persists across navigation, refresh, and re-auth
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { mode } = body;

    // Validate mode
    if (!mode || !['FAMILY', 'PROVIDER'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be FAMILY or PROVIDER' },
        { status: 400 }
      );
    }

    // 1. Update database immediately - source of truth
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { activeMode: mode as UserMode },
    });

    // 2. Create response with mode cookie
    const response = NextResponse.json({
      success: true,
      mode,
      userId: session.user.id,
    });

    // Set httpOnly cookie for immediate mode availability
    // This cookie is read by middleware and pages for instant mode detection
    response.cookies.set('user-mode', mode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Error setting mode:', error);
    return NextResponse.json(
      { error: 'Failed to set mode' },
      { status: 500 }
    );
  }
}
