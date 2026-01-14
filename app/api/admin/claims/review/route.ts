import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-permissions';
import { prisma } from '@/lib/prisma';
import { sendClaimApprovedEmail, sendClaimRejectedEmail } from '@/lib/loops-email';

/**
 * POST /api/admin/claims/review
 *
 * Approve or reject a provider claim attempt
 */
export async function POST(req: NextRequest) {
  try {
    // Check admin permissions
    const permission = await requireAdmin();
    if (!permission.success) {
      return NextResponse.json(
        { error: permission.error },
        { status: permission.error?.includes('Unauthorized') ? 401 : 403 }
      );
    }

    const body = await req.json();
    const { claimId, action, notes } = body;

    if (!claimId || !action) {
      return NextResponse.json(
        { error: 'Claim ID and action are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Fetch the claim attempt
    const claimAttempt = await prisma.claimAttempt.findUnique({
      where: { id: claimId },
      include: {
        provider: true,
      },
    });

    if (!claimAttempt) {
      return NextResponse.json(
        { error: 'Claim attempt not found' },
        { status: 404 }
      );
    }

    if (claimAttempt.status !== 'pending') {
      return NextResponse.json(
        { error: 'Claim has already been reviewed' },
        { status: 400 }
      );
    }

    // Perform approval or rejection in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update ClaimAttempt status
      const updatedClaim = await tx.claimAttempt.update({
        where: { id: claimId },
        data: {
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewedBy: permission.userId,
          reviewedAt: new Date(),
          reviewNotes: notes || null,
        },
      });

      // 2. If approved, update Provider verification status
      if (action === 'approve') {
        await tx.provider.update({
          where: { id: claimAttempt.providerProfileId },
          data: {
            verificationStatus: 'verified',
            verified: true,
          },
        });
      }

      // 3. If rejected, unclaim the provider profile
      if (action === 'reject') {
        await tx.provider.update({
          where: { id: claimAttempt.providerProfileId },
          data: {
            userId: null,
            claimed: false,
            claimedAt: null,
            claimedBy: null,
            verificationStatus: null,
            verified: false,
          },
        });

        // Also remove ProviderIdentity if exists
        await tx.providerIdentity.deleteMany({
          where: { userId: claimAttempt.userId },
        });

        // Update user onboarding status
        await tx.user.update({
          where: { id: claimAttempt.userId },
          data: {
            providerOnboardingComplete: false,
            activeMode: 'FAMILY',
          },
        });
      }

      return updatedClaim;
    });

    // Send email notification via Loops
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
      const providerUrl = `${baseUrl}/providers/${claimAttempt.providerProfileId}`;

      if (action === 'approve') {
        // Email 3: Claim approved by admin
        await sendClaimApprovedEmail({
          email: claimAttempt.userEmail,
          userName: claimAttempt.userName,
          providerName: claimAttempt.providerName,
          providerUrl,
          adminNote: notes,
        });
      } else {
        // Email 4: Claim rejected
        await sendClaimRejectedEmail({
          email: claimAttempt.userEmail,
          userName: claimAttempt.userName,
          providerName: claimAttempt.providerName,
          reason: notes || 'We were unable to verify your ownership of this profile at this time.',
          supportEmail: 'support@olera.com',
        });
      }
    } catch (emailError) {
      // Log error but don't fail the review action
      console.error('Failed to send admin review email notification:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: action === 'approve'
        ? 'Claim approved successfully'
        : 'Claim rejected successfully',
      claim: result,
    });
  } catch (error) {
    console.error('Error reviewing claim:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
