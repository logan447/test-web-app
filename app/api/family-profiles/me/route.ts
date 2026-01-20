import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateCompletionPercentage,
  validateVisibilityChange,
  getMissingCardMinimumFields,
} from "@/lib/profileCompletion";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Family profile not found" }, { status: 404 });
    }

    // Calculate current completion and missing fields for UI
    const completionPercentage = calculateCompletionPercentage(profile);
    const missingCardMinimumFields = getMissingCardMinimumFields(profile);

    return NextResponse.json({
      ...profile,
      completionPercentage,
      missingCardMinimumFields,
      canEnableVisibility: missingCardMinimumFields.length === 0,
    });
  } catch (error) {
    console.error("Error fetching family profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch family profile" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      careTypes,
      location,
      city,
      state,
      zipCode,
      budgetMin,
      budgetMax,
      timeline,
      insurance,
      description,
      isPublic,
      lovedOneName,
      // Additional fields from full care profile form
      ageRange,
      gender,
      relationship,
      livingSituation,
      careLevel,
      medicalConditions,
      mobilityStatus,
      dailyLivingAssistance,
      personalityTraits,
      hobbiesInterests,
      culturalBackground,
      languagePreferences,
      careUrgency,
      preferredContactMethods,
      bestTimeToContact,
      tourPreference,
    } = body;

    // Check if family profile already exists
    const existingProfile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: "Family profile already exists" },
        { status: 400 }
      );
    }

    // Prepare profile data for completion calculation
    const profileData = {
      lovedOneName,
      city,
      state,
      location,
      careTypes,
      ageRange,
      gender,
      relationship,
      livingSituation,
      careLevel,
      medicalConditions,
      mobilityStatus,
      dailyLivingAssistance,
      personalityTraits,
      hobbiesInterests,
      culturalBackground,
      languagePreferences,
      budgetMin,
      budgetMax,
      timeline,
      careUrgency,
      preferredContactMethods,
      bestTimeToContact,
      tourPreference,
    };

    // Calculate completion percentage
    const completionPercentage = calculateCompletionPercentage(profileData);

    // Validate visibility if trying to enable
    if (isPublic) {
      const visibilityError = validateVisibilityChange(profileData, true);
      if (visibilityError) {
        return NextResponse.json(
          { error: visibilityError },
          { status: 400 }
        );
      }
    }

    const profile = await prisma.familyProfile.create({
      data: {
        userId: session.user.id,
        careTypes,
        location,
        city,
        state,
        zipCode,
        budgetMin,
        budgetMax,
        timeline,
        insurance,
        description,
        isPublic: isPublic ?? false,
        lovedOneName,
        completionPercentage,
        // Additional fields
        ageRange,
        gender,
        relationship,
        livingSituation,
        careLevel,
        medicalConditions,
        mobilityStatus,
        dailyLivingAssistance,
        personalityTraits,
        hobbiesInterests,
        culturalBackground,
        languagePreferences,
        careUrgency,
        preferredContactMethods,
        bestTimeToContact,
        tourPreference,
      },
    });

    // Return with additional computed fields
    const missingCardMinimumFields = getMissingCardMinimumFields(profile);

    return NextResponse.json({
      ...profile,
      missingCardMinimumFields,
      canEnableVisibility: missingCardMinimumFields.length === 0,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating family profile:", error);
    return NextResponse.json(
      { error: "Failed to create family profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      careTypes,
      location,
      city,
      state,
      zipCode,
      budgetMin,
      budgetMax,
      timeline,
      insurance,
      description,
      isPublic,
      lovedOneName,
      // Additional fields from full care profile form
      ageRange,
      gender,
      relationship,
      livingSituation,
      careLevel,
      medicalConditions,
      mobilityStatus,
      dailyLivingAssistance,
      personalityTraits,
      hobbiesInterests,
      culturalBackground,
      languagePreferences,
      careUrgency,
      preferredContactMethods,
      bestTimeToContact,
      tourPreference,
    } = body;

    // Get current profile to merge data for completion calculation
    const currentProfile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!currentProfile) {
      return NextResponse.json(
        { error: "Family profile not found" },
        { status: 404 }
      );
    }

    // Merge current profile with updates for completion calculation
    const profileData = {
      lovedOneName: lovedOneName ?? currentProfile.lovedOneName,
      city: city ?? currentProfile.city,
      state: state ?? currentProfile.state,
      location: location ?? currentProfile.location,
      careTypes: careTypes ?? currentProfile.careTypes,
      ageRange: ageRange ?? currentProfile.ageRange,
      gender: gender ?? currentProfile.gender,
      relationship: relationship ?? currentProfile.relationship,
      livingSituation: livingSituation ?? currentProfile.livingSituation,
      careLevel: careLevel ?? currentProfile.careLevel,
      medicalConditions: medicalConditions ?? currentProfile.medicalConditions,
      mobilityStatus: mobilityStatus ?? currentProfile.mobilityStatus,
      dailyLivingAssistance: dailyLivingAssistance ?? currentProfile.dailyLivingAssistance,
      personalityTraits: personalityTraits ?? currentProfile.personalityTraits,
      hobbiesInterests: hobbiesInterests ?? currentProfile.hobbiesInterests,
      culturalBackground: culturalBackground ?? currentProfile.culturalBackground,
      languagePreferences: languagePreferences ?? currentProfile.languagePreferences,
      budgetMin: budgetMin ?? currentProfile.budgetMin,
      budgetMax: budgetMax ?? currentProfile.budgetMax,
      timeline: timeline ?? currentProfile.timeline,
      careUrgency: careUrgency ?? currentProfile.careUrgency,
      preferredContactMethods: preferredContactMethods ?? currentProfile.preferredContactMethods,
      bestTimeToContact: bestTimeToContact ?? currentProfile.bestTimeToContact,
      tourPreference: tourPreference ?? currentProfile.tourPreference,
    };

    // Calculate completion percentage
    const completionPercentage = calculateCompletionPercentage(profileData);

    // Validate visibility if trying to enable
    const requestedVisibility = isPublic ?? currentProfile.isPublic;
    if (requestedVisibility && !currentProfile.isPublic) {
      // User is trying to enable visibility
      const visibilityError = validateVisibilityChange(profileData, true);
      if (visibilityError) {
        return NextResponse.json(
          { error: visibilityError },
          { status: 400 }
        );
      }
    }

    const profile = await prisma.familyProfile.update({
      where: { userId: session.user.id },
      data: {
        careTypes,
        location,
        city,
        state,
        zipCode,
        budgetMin,
        budgetMax,
        timeline,
        insurance,
        description,
        isPublic,
        lovedOneName,
        completionPercentage,
        // Additional fields
        ageRange,
        gender,
        relationship,
        livingSituation,
        careLevel,
        medicalConditions,
        mobilityStatus,
        dailyLivingAssistance,
        personalityTraits,
        hobbiesInterests,
        culturalBackground,
        languagePreferences,
        careUrgency,
        preferredContactMethods,
        bestTimeToContact,
        tourPreference,
      },
    });

    // Return with additional computed fields
    const missingCardMinimumFields = getMissingCardMinimumFields(profile);

    return NextResponse.json({
      ...profile,
      missingCardMinimumFields,
      canEnableVisibility: missingCardMinimumFields.length === 0,
    });
  } catch (error) {
    console.error("Error updating family profile:", error);
    return NextResponse.json(
      { error: "Failed to update family profile" },
      { status: 500 }
    );
  }
}
