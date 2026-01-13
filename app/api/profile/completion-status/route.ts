import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/profile/completion-status
 *
 * Returns the completion status of the user's profile based on their active mode.
 * Updated for modal onboarding - only checks REQUIRED fields.
 *
 * For families, checks if they have completed required onboarding fields:
 * - careType (required)
 * - city + state (required)
 * - careNeeds (required)
 *
 * For providers, checks if they have completed required onboarding fields:
 * - providerType (required)
 * - name/businessName (required)
 * - careTypesOffered (required)
 * - city + state (required)
 * - phone + email (required)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        familyProfile: true,
        provider: true,
        providerIdentity: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const mode = user.activeMode;
    let isComplete = false;
    let missingFields: string[] = [];
    let profileType: 'family' | 'provider' = mode === 'FAMILY' ? 'family' : 'provider';

    if (mode === 'FAMILY') {
      // Check family profile completion
      const profile = user.familyProfile;

      if (!profile) {
        isComplete = false;
        missingFields = ['Profile not created', 'careType', 'location', 'careNeeds'];
      } else {
        // Required fields for family onboarding (Sprint 0)
        if (!profile.careType || profile.careType.length === 0) {
          missingFields.push('careType');
        }
        if (!profile.city) {
          missingFields.push('city');
        }
        if (!profile.state) {
          missingFields.push('state');
        }
        if (!profile.careNeeds || profile.careNeeds.length === 0) {
          missingFields.push('careNeeds');
        }

        isComplete = missingFields.length === 0;
      }
    } else {
      // Check provider profile completion
      const profile = user.provider;
      const hasProviderIdentity = !!user.providerIdentity;

      if (!hasProviderIdentity) {
        isComplete = false;
        missingFields = ['Provider identity not created'];
      } else if (!profile) {
        isComplete = false;
        missingFields = ['Provider profile not created', 'All required fields'];
      } else {
        // Required fields for modal onboarding - only essential fields
        if (!profile.providerType) {
          missingFields.push('providerType');
        }
        if (!profile.name) {
          missingFields.push('businessName');
        }
        if (!profile.careTypesOffered || profile.careTypesOffered.length === 0) {
          missingFields.push('careTypesOffered');
        }
        if (!profile.city) {
          missingFields.push('city');
        }
        if (!profile.state) {
          missingFields.push('state');
        }
        if (!profile.phone) {
          missingFields.push('phone');
        }
        if (!profile.email) {
          missingFields.push('email');
        }

        isComplete = missingFields.length === 0;
      }
    }

    return NextResponse.json({
      isComplete,
      missingFields,
      profileType,
      mode,
      onboardingComplete: mode === 'FAMILY'
        ? user.familyOnboardingComplete
        : user.providerOnboardingComplete,
    });
  } catch (error) {
    console.error('Error checking profile completion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
