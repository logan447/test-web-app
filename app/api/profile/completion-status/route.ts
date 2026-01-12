import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

/**
 * GET /api/profile/completion-status
 *
 * Returns the completion status of the user's profile based on their active mode.
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
 * - location: street, city, state, zipCode (required)
 * - phone + website (required)
 * - primaryPhoto (required)
 * - description (required)
 * - licenseNumber + licenseState (required)
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
        // Required fields for provider onboarding (Sprint 0) - 8 required fields
        if (!profile.providerType) {
          missingFields.push('providerType');
        }
        if (!profile.name) {
          missingFields.push('businessName');
        }
        if (!profile.careTypesOffered || profile.careTypesOffered.length === 0) {
          missingFields.push('careTypesOffered');
        }
        // Location fields
        if (!profile.street && !profile.address) {
          missingFields.push('street');
        }
        if (!profile.city) {
          missingFields.push('city');
        }
        if (!profile.state) {
          missingFields.push('state');
        }
        if (!profile.zipCode) {
          missingFields.push('zipCode');
        }
        // Contact fields
        if (!profile.phone) {
          missingFields.push('phone');
        }
        if (!profile.website) {
          missingFields.push('website');
        }
        // Photo (required)
        if (!profile.primaryPhoto && (!profile.photos || profile.photos.length === 0)) {
          missingFields.push('primaryPhoto');
        }
        // Description (required)
        if (!profile.description) {
          missingFields.push('description');
        }
        // License (required)
        if (!profile.licenseNumber) {
          missingFields.push('licenseNumber');
        }
        if (!profile.licenseState) {
          missingFields.push('licenseState');
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
