import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * TEMPORARY ENDPOINT - Grant admin access to current user
 * This endpoint is for initial setup only and should be removed or secured in production
 *
 * Usage: POST to this endpoint while logged in to grant yourself admin access
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated - please log in first' },
        { status: 401 }
      );
    }

    // Grant admin access to the current logged-in user
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Admin access granted! You can now access /admin/claims`,
      user,
      nextSteps: [
        '1. Log out and log back in (to refresh your session)',
        '2. Navigate to /admin/claims to view pending claims',
        '3. Test the admin review workflow',
      ],
    });
  } catch (error) {
    console.error('Error granting admin access:', error);
    return NextResponse.json(
      { error: 'Failed to grant admin access', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET - List all users (for debugging)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      users,
      count: users.length,
      currentUser: session.user.email,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
