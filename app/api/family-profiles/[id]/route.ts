import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the full profile
    const profile = await prisma.familyProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Check if this is the owner
    const isOwner = profile.userId === session.user.id;

    // Only show public profiles or profiles the user owns
    if (!profile.isPublic && !isOwner) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Check if there's an ACCEPTED engagement between the viewing provider and this family
    // This determines whether identity/contact info is revealed
    let hasAcceptedEngagement = false;

    if (!isOwner) {
      // Find provider associated with current user
      const viewerProvider = await prisma.provider.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });

      if (viewerProvider) {
        // Check for ACCEPTED engagement
        const acceptedEngagement = await prisma.consultRequest.findFirst({
          where: {
            familyProfileId: id,
            providerId: viewerProvider.id,
            status: { in: ["ACCEPTED", "COMPLETED"] },
          },
        });
        hasAcceptedEngagement = !!acceptedEngagement;
      }
    }

    // Build response based on visibility rules
    // Per agreed rules: family identity/contact hidden until engagement ACCEPTED
    const response: any = {
      id: profile.id,
      // Location (always visible)
      city: profile.city,
      state: profile.state,
      zipCode: profile.zipCode,
      location: profile.location,
      // Care recipient info (non-identifying, always visible)
      ageRange: profile.ageRange,
      relationship: profile.relationship,
      livingSituation: profile.livingSituation,
      gender: profile.gender,
      // Care needs (always visible)
      careTypes: profile.careTypes,
      careLevel: profile.careLevel,
      medicalConditions: profile.medicalConditions,
      mobilityStatus: profile.mobilityStatus,
      dailyLivingAssistance: profile.dailyLivingAssistance,
      additionalNeeds: profile.additionalNeeds,
      // Personality & preferences (always visible)
      personalityTraits: profile.personalityTraits,
      hobbiesInterests: profile.hobbiesInterests,
      communicationPreferences: profile.communicationPreferences,
      culturalBackground: profile.culturalBackground,
      religiousPreferences: profile.religiousPreferences,
      languagePreferences: profile.languagePreferences,
      petPreferences: profile.petPreferences,
      // Location preferences (always visible)
      careSettingPreference: profile.careSettingPreference,
      proximityImportance: profile.proximityImportance,
      proximityDetails: profile.proximityDetails,
      neighborhoodPreferences: profile.neighborhoodPreferences,
      // Contact preferences (method types, not actual contact - always visible)
      preferredContactMethods: profile.preferredContactMethods,
      bestTimeToContact: profile.bestTimeToContact,
      tourPreference: profile.tourPreference,
      communicationFrequency: profile.communicationFrequency,
      additionalContactNotes: profile.additionalContactNotes,
      // Budget & timeline (always visible)
      budgetMin: profile.budgetMin,
      budgetMax: profile.budgetMax,
      budgetFlexibility: profile.budgetFlexibility,
      paymentMethods: profile.paymentMethods,
      budgetIncludes: profile.budgetIncludes,
      financialAssistanceNeeded: profile.financialAssistanceNeeded,
      careUrgency: profile.careUrgency,
      preferredStartDate: profile.preferredStartDate,
      careDuration: profile.careDuration,
      scheduleFlexibility: profile.scheduleFlexibility,
      timeline: profile.timeline,
      insurance: profile.insurance,
      // Description (always visible)
      description: profile.description,
      profileNotes: profile.profileNotes,
      // Metadata
      createdAt: profile.createdAt,
      isPublic: profile.isPublic,
      // Photo - only if user opted in OR viewer has accepted engagement OR is owner
      profilePhoto: (profile.showProfilePhoto || hasAcceptedEngagement || isOwner)
        ? profile.profilePhoto
        : null,
      // Identity revealed flag
      identityRevealed: hasAcceptedEngagement || isOwner,
    };

    // Identity & contact - only revealed after ACCEPTED engagement or to owner
    if (hasAcceptedEngagement || isOwner) {
      response.user = {
        name: profile.user.name,
        email: profile.user.email,
        phone: profile.user.phone,
      };
      response.lovedOneName = profile.lovedOneName;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching family profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch family profile" },
      { status: 500 }
    );
  }
}
