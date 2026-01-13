import { NextResponse } from 'next/server';
import { getCurrentUserVerificationStatus } from '@/lib/permissions';

/**
 * GET /api/providers/verification-status
 *
 * Get current user's provider verification status
 */
export async function GET() {
  try {
    const status = await getCurrentUserVerificationStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error getting verification status:', error);
    return NextResponse.json(
      { error: 'Failed to get verification status' },
      { status: 500 }
    );
  }
}
