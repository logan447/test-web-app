import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/takedown-requests - List all takedown requests for admin review
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check admin access
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (verify against role in database)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status !== 'ALL') {
      where.status = status;
    }

    // Fetch takedown requests with pagination
    const [requests, totalCount] = await Promise.all([
      prisma.takedownRequest.findMany({
        where,
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              providerType: true,
              city: true,
              state: true,
              phone: true,
              email: true,
              website: true,
              claimed: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.takedownRequest.count({ where }),
    ]);

    // Get counts by status for tabs
    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      prisma.takedownRequest.count({ where: { status: 'PENDING' } }),
      prisma.takedownRequest.count({ where: { status: 'APPROVED' } }),
      prisma.takedownRequest.count({ where: { status: 'DENIED' } }),
    ]);

    return NextResponse.json({
      requests,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: pendingCount + approvedCount + rejectedCount,
      },
    });
  } catch (error) {
    console.error('Error fetching takedown requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch takedown requests' },
      { status: 500 }
    );
  }
}
