import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createProviderVerificationToken, sendProviderVerificationEmail } from '@/lib/verification';
import { calculateVerificationSignals } from '@/lib/verification-signals';

/**
 * POST /api/providers/claim
 *
 * Claim an existing unclaimed provider profile
 * Links the provider profile to the authenticated user
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { providerId } = body;

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    // CRITICAL: Check if user already has a claimed provider profile
    const existingProvider = await prisma.provider.findFirst({
      where: {
        userId: session.user.id,
        claimed: true,
      },
    });

    if (existingProvider) {
      return NextResponse.json(
        { error: 'You already have a claimed provider profile. Please contact support if you need to claim a different profile.' },
        { status: 400 }
      );
    }

    // Check if provider exists and is unclaimed
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    if (provider.claimed) {
      return NextResponse.json(
        { error: 'This provider profile has already been claimed by another user' },
        { status: 400 }
      );
    }

    // Calculate verification signals for automatic approval logic
    const verificationSignals = await calculateVerificationSignals(
      session.user.email!,
      session.user.name,
      providerId,
      session.user.id
    );

    // Get user account age for ClaimAttempt
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { createdAt: true },
    });

    const accountAgeInDays = user
      ? Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Get client IP address
    const ipAddress = req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown';

    // CRITICAL: Use transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create ClaimAttempt record with verification signals
      const claimAttempt = await tx.claimAttempt.create({
        data: {
          providerProfileId: providerId,
          userId: session.user.id,
          ipAddress,
          verificationMethod: 'email',
          status: verificationSignals.autoApprove ? 'approved' : 'pending',
          verificationScore: verificationSignals.overallScore,
          signals: JSON.stringify(verificationSignals),
          autoApproved: verificationSignals.autoApprove,
          userEmail: session.user.email!,
          userName: session.user.name,
          userAccountAge: accountAgeInDays,
          providerName: provider.name,
          providerEmail: provider.email,
          providerWebsite: provider.website,
        },
      });

      // 2. Claim the provider profile
      // If auto-approved, set status to 'verified', otherwise 'pending'
      const claimedProvider = await tx.provider.update({
        where: { id: providerId },
        data: {
          userId: session.user.id,
          claimed: true,
          claimedAt: new Date(),
          claimedBy: session.user.id,
          verificationStatus: verificationSignals.autoApprove ? 'verified' : 'pending',
          verified: verificationSignals.autoApprove,
        },
      });

      // 3. Update user onboarding status
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          providerOnboardingComplete: true,
          providerProfileCompletedAt: new Date(),
          activeMode: 'PROVIDER',
        },
      });

      // 4. Create or update ProviderIdentity
      await tx.providerIdentity.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          providerId: providerId,
          type: provider.providerType === 'INDEPENDENT_CAREGIVER' ? 'INDIVIDUAL' : 'ORGANIZATION',
          onboardingComplete: true,
        },
        update: {
          providerId: providerId,
          onboardingComplete: true,
        },
      });

      return claimedProvider;
    });

    // If NOT auto-approved, create verification token and send email
    if (!verificationSignals.autoApprove) {
      try {
        const verificationToken = await createProviderVerificationToken(
          providerId,
          session.user.id,
          provider.email
        );

        await sendProviderVerificationEmail(
          provider.email,
          verificationToken.token,
          provider.name
        );
      } catch (emailError) {
        // Log error but don't fail the claim - verification can be resent later
        console.error('Failed to send verification email:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      providerId: result.id,
      message: verificationSignals.autoApprove
        ? 'Provider profile claimed and verified automatically!'
        : 'Provider profile claimed successfully. Awaiting admin review.',
      autoApproved: verificationSignals.autoApprove,
      pendingVerification: !verificationSignals.autoApprove,
      verificationScore: verificationSignals.overallScore,
    });
  } catch (error) {
    console.error('Error claiming provider:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
