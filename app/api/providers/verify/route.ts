import { NextRequest, NextResponse } from 'next/server';
import { verifyProviderToken } from '@/lib/verification';

/**
 * GET /api/providers/verify?token=xxx
 *
 * Verify a provider claim via email verification link
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Verify the token and update provider status
    const verificationToken = await verifyProviderToken(token);

    return NextResponse.json({
      success: true,
      message: 'Provider claim verified successfully!',
      providerId: verificationToken.providerId,
      providerName: verificationToken.provider.name,
    });
  } catch (error) {
    console.error('Error verifying provider:', error);

    const errorMessage = error instanceof Error ? error.message : 'Invalid or expired verification token';

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
