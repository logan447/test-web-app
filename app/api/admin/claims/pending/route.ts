import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-permissions';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/claims/pending
 *
 * List all pending provider claim attempts for admin review
 */
export async function GET() {
  try {
    // Check admin permissions
    const permission = await requireAdmin();
    if (!permission.success) {
      return NextResponse.json(
        { error: permission.error },
        { status: permission.error?.includes('Unauthorized') ? 401 : 403 }
      );
    }

    // Fetch pending claims with verification signals
    const pendingClaims = await prisma.claimAttempt.findMany({
      where: {
        status: 'pending',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            website: true,
            phone: true,
            city: true,
            state: true,
            providerType: true,
            description: true,
          },
        },
      },
      orderBy: [
        { verificationScore: 'desc' }, // High scores first
        { attemptedAt: 'desc' },       // Most recent first
      ],
    });

    // Parse signals JSON and format response
    const formattedClaims = pendingClaims.map((claim) => ({
      id: claim.id,
      attemptedAt: claim.attemptedAt,
      verificationScore: claim.verificationScore,
      signals: claim.signals ? JSON.parse(claim.signals) : null,
      autoApproved: claim.autoApproved,
      user: {
        id: claim.user.id,
        email: claim.userEmail,
        name: claim.userName,
        accountAge: claim.userAccountAge,
        createdAt: claim.user.createdAt,
      },
      provider: {
        id: claim.provider.id,
        name: claim.providerName,
        email: claim.providerEmail,
        website: claim.providerWebsite,
        phone: claim.provider.phone,
        city: claim.provider.city,
        state: claim.provider.state,
        providerType: claim.provider.providerType,
        description: claim.provider.description,
      },
      ipAddress: claim.ipAddress,
      status: claim.status,
    }));

    return NextResponse.json({
      claims: formattedClaims,
      count: formattedClaims.length,
    });
  } catch (error) {
    console.error('Error fetching pending claims:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
