import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
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
      businessName, // Required
      careTypes, // Array (required)
      street, // Required
      city, // Required
      state, // Required
      zipCode, // Required
      phone, // Required
      website, // Required
      photoPreview, // Data URL (required)
      description, // Required
      licenseNumber, // Required
      licenseState, // Required
      availableForFamilies, // Boolean (defaults to true)
      availableForOrganizations, // Boolean (caregivers only)
      hiringCaregivers, // Boolean (organizations only)
    } = body;

    // Validate required fields
    if (!providerType || !businessName || !careTypes || careTypes.length === 0) {
      return NextResponse.json(
        { error: 'Provider type, business name, and care types are required' },
        { status: 400 }
      );
    }

    if (!street || !city || !state || !zipCode) {
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

    // Upload photo to Vercel Blob
    let photoUrl = '';
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

    // Create or update provider profile
    const provider = await prisma.provider.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        providerType,
        name: businessName,
        careTypesOffered: careTypes,
        street,
        city,
        state,
        zipCode,
        address: `${street}, ${city}, ${state} ${zipCode}`, // Legacy field
        phone,
        website,
        email: session.user.email || '',
        primaryPhoto: photoUrl,
        photos: photoUrl ? [photoUrl] : [],
        description,
        licenseNumber,
        licenseState,
        licensed: true,
        availableForFamilies: availableForFamilies ?? true,
        availableForOrganizations: availableForOrganizations ?? false,
        hiringCaregivers: hiringCaregivers ?? false,
      },
      update: {
        providerType,
        name: businessName,
        careTypesOffered: careTypes,
        street,
        city,
        state,
        zipCode,
        address: `${street}, ${city}, ${state} ${zipCode}`,
        phone,
        website,
        primaryPhoto: photoUrl || undefined,
        photos: photoUrl ? [photoUrl] : undefined,
        description,
        licenseNumber,
        licenseState,
        licensed: true,
        availableForFamilies: availableForFamilies ?? true,
        availableForOrganizations: availableForOrganizations ?? false,
        hiringCaregivers: hiringCaregivers ?? false,
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
