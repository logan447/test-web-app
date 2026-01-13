import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createProviderVerificationToken, sendProviderVerificationEmail } from '@/lib/verification';

/**
 * POST /api/providers/resend-verification
 *
 * Resend verification email for pending provider claim
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find user's claimed provider profile
    const provider = await prisma.provider.findFirst({
      where: {
        userId: session.user.id,
        claimed: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        verificationStatus: true,
        verified: true,
      },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'No claimed provider profile found' },
        { status: 404 }
      );
    }

    // Check if already verified
    if (provider.verificationStatus === 'verified' || provider.verified === true) {
      return NextResponse.json(
        { error: 'Provider profile is already verified' },
        { status: 400 }
      );
    }

    // Check for existing unexpired token
    const existingToken = await prisma.providerVerificationToken.findFirst({
      where: {
        providerId: provider.id,
        userId: session.user.id,
        verified: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let token: string;

    if (existingToken) {
      // Reuse existing token
      token = existingToken.token;
    } else {
      // Create new token
      const newToken = await createProviderVerificationToken(
        provider.id,
        session.user.id,
        provider.email
      );
      token = newToken.token;
    }

    // Send verification email
    await sendProviderVerificationEmail(
      provider.email,
      token,
      provider.name
    );

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    console.error('Error resending verification email:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}
