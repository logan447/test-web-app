import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

/**
 * POST /api/onboarding/provider/complete
 *
 * Saves provider onboarding data and marks onboarding as complete.
 * Creates or updates the Provider profile with required fields.
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
      providerType, // Required
      businessName, // Required (called "name" in minimal onboarding)
      name, // Alternative to businessName for minimal onboarding
      careTypes, // Array (required)
      street, // Required for full, optional for minimal
      city, // Required
      state, // Required for full, optional for minimal
      zipCode, // Required for full, optional for minimal
      phone, // Required for full, optional for minimal
      website, // Required for full, optional for minimal
      photoPreview, // Data URL (required for full, optional for minimal)
      description, // Required for full, optional for minimal
      licenseNumber, // Required for full, optional for minimal
      licenseState, // Required for full, optional for minimal
      availableForFamilies, // Boolean (defaults to true)
      availableForOrganizations, // Boolean (caregivers only)
      hiringCaregivers, // Boolean (organizations only)
      isHiringCaregivers, // Alternative name for hiringCaregivers
      minimalOnboarding, // Flag for minimal onboarding
    } = body;

    // Use name if businessName not provided (for minimal onboarding)
    const finalBusinessName = businessName || name;

    // Validate required fields
    if (!providerType || !finalBusinessName || !careTypes || careTypes.length === 0) {
      return NextResponse.json(
        { error: 'Provider type, name, and care types are required' },
        { status: 400 }
      );
    }

    if (!city) {
      return NextResponse.json(
        { error: 'City is required' },
        { status: 400 }
      );
    }

    // For full onboarding, require additional fields
    if (!minimalOnboarding) {
      if (!street || !state || !zipCode) {
        return NextResponse.json(
          { error: 'Complete address is required' },
          { status: 400 }
        );
      }

      if (!phone || !website) {
        return NextResponse.json(
          { error: 'Phone and website are required' },
          { status: 400 }
        );
      }

      if (!photoPreview) {
        return NextResponse.json(
          { error: 'Photo is required' },
          { status: 400 }
        );
      }

      if (!description) {
        return NextResponse.json(
          { error: 'Description is required' },
          { status: 400 }
        );
      }

      if (!licenseNumber || !licenseState) {
        return NextResponse.json(
          { error: 'License information is required' },
          { status: 400 }
        );
      }
    }

    // Upload photo to Vercel Blob (skip for minimal onboarding if no photo)
    let photoUrl = '';
    if (photoPreview) {
      try {
        // Extract base64 data from data URL
        const base64Data = photoPreview.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `provider-${session.user.id}-${Date.now()}.jpg`;

        const blob = await put(filename, buffer, {
          access: 'public',
          contentType: 'image/jpeg',
        });

        photoUrl = blob.url;
      } catch (uploadError) {
        console.error('Photo upload error:', uploadError);
        // Continue without photo for now - will be empty string
      }
    }

    // Build create data object with required fields
    const createData: any = {
      userId: session.user.id,
      providerType,
      name: finalBusinessName,
      careTypesOffered: careTypes,
      city,
      state: state || '', // Required field - empty for minimal mode
      zipCode: zipCode || '', // Required field - empty for minimal mode
      phone: phone || '', // Required field - empty for minimal mode
      address: city, // Will be updated if we have more address details
      email: session.user.email || '',
      photos: photoUrl ? [photoUrl] : [], // Required array field
      availableForFamilies: availableForFamilies ?? true,
      availableForOrganizations: availableForOrganizations ?? false,
      hiringCaregivers: isHiringCaregivers || hiringCaregivers || false,
      licensed: false, // Default to false, will be set to true if license provided
    };

    // Only add optional fields if they have values
    if (street) createData.street = street;
    if (street && state && zipCode) {
      createData.address = `${street}, ${city}, ${state} ${zipCode}`;
    }
    if (website) createData.website = website;
    if (photoUrl) {
      createData.primaryPhoto = photoUrl;
    }
    if (description) createData.description = description;
    if (licenseNumber) {
      createData.licenseNumber = licenseNumber;
      createData.licensed = true;
    }
    if (licenseState) createData.licenseState = licenseState;

    // Create or update provider profile
    const provider = await prisma.provider.upsert({
      where: { userId: session.user.id },
      create: createData,
      update: {
        providerType,
        name: finalBusinessName,
        careTypesOffered: careTypes,
        street: street || undefined,
        city,
        state: state || '',
        zipCode: zipCode || '',
        address: street && state && zipCode ? `${street}, ${city}, ${state} ${zipCode}` : city,
        phone: phone || '',
        website: website || undefined,
        primaryPhoto: photoUrl || undefined,
        photos: photoUrl ? [photoUrl] : [],
        description: description || undefined,
        licenseNumber: licenseNumber || undefined,
        licenseState: licenseState || undefined,
        licensed: licenseNumber ? true : undefined,
        availableForFamilies: availableForFamilies ?? true,
        availableForOrganizations: availableForOrganizations ?? false,
        hiringCaregivers: isHiringCaregivers || hiringCaregivers || undefined,
      },
    });

    // Update user onboarding status
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        providerOnboardingComplete: true,
        providerProfileCompletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      profileId: provider.id,
    });
  } catch (error) {
    console.error('Error completing provider onboarding:', error);

    // Return more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      {
        error: 'Failed to create provider profile',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
