import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
        { error: 'Provider profile is already claimed' },
        { status: 400 }
      );
    }

    // Claim the provider profile
    const claimedProvider = await prisma.provider.update({
      where: { id: providerId },
      data: {
        userId: session.user.id,
        claimed: true,
        claimedAt: new Date(),
        claimedBy: session.user.id,
        verificationStatus: 'pending',
      },
    });

    // Update user onboarding status
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        providerOnboardingComplete: true,
        providerProfileCompletedAt: new Date(),
        activeMode: 'PROVIDER',
      },
    });

    // Create ProviderIdentity if it doesn't exist
    await prisma.providerIdentity.upsert({
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

    return NextResponse.json({
      success: true,
      providerId: claimedProvider.id,
      message: 'Provider profile claimed successfully',
    });
  } catch (error) {
    console.error('Error claiming provider:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
