import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/onboarding/family/complete
 *
 * Saves family onboarding data and marks onboarding as complete.
 * Creates or updates the FamilyProfile with required fields.
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
    const {
      whoNeedsCare,
      careType, // Array of care types (required)
      city, // Required
      state, // Required for full onboarding, optional for minimal
      careNeeds, // Array of care needs/disabilities (required)
      budget, // Optional
      timeline, // Optional
      isPublic, // Visibility toggle (defaults to true)
      minimalOnboarding, // Flag for minimal onboarding
    } = body;

    // Validate required fields
    if (!careType || careType.length === 0) {
      return NextResponse.json(
        { error: 'Care type is required' },
        { status: 400 }
      );
    }

    if (!city) {
      return NextResponse.json(
        { error: 'City is required' },
        { status: 400 }
      );
    }

    // For full onboarding, require state and careNeeds
    // For minimal onboarding, we'll use defaults
    if (!minimalOnboarding) {
      if (!state) {
        return NextResponse.json(
          { error: 'State is required' },
          { status: 400 }
        );
      }

      if (!careNeeds || careNeeds.length === 0) {
        return NextResponse.json(
          { error: 'Care needs are required' },
          { status: 400 }
        );
      }
    }

    // Create or update family profile
    const familyProfile = await prisma.familyProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        whoNeedsCare,
        careType,
        city,
        state: state || '', // Allow empty for minimal onboarding
        careNeeds: careNeeds || careType, // Default to careType if not provided
        location: state ? `${city}, ${state}` : city, // Legacy field
        zipCode: '', // Will be filled later
        isPublic: isPublic ?? true, // Default to true
        visibleToProviders: isPublic ?? true,
      },
      update: {
        whoNeedsCare,
        careType,
        city,
        state: state || '', // Allow empty for minimal onboarding
        careNeeds: careNeeds || careType,
        location: state ? `${city}, ${state}` : city,
        isPublic: isPublic ?? true,
        visibleToProviders: isPublic ?? true,
      },
    });

    // Update user onboarding status
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        familyOnboardingComplete: true,
        familyProfileCompletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      profileId: familyProfile.id,
    });
  } catch (error) {
    console.error('Error completing family onboarding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
