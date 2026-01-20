import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const state = searchParams.get("state");

    const where: any = {
      isPublic: true, // Only show public profiles in Browse Care Requests
      hideFromSearch: false, // Respect privacy setting
    };

    if (city) {
      where.city = {
        contains: city,
        mode: "insensitive",
      };
    }

    if (state) {
      where.state = {
        contains: state,
        mode: "insensitive",
      };
    }

    // Select only non-identifying fields for browse view
    // Per visibility rules: family identity/contact hidden until engagement ACCEPTED
    const profiles = await prisma.familyProfile.findMany({
      where,
      select: {
        id: true,
        // Location (always visible)
        city: true,
        state: true,
        zipCode: true,
        location: true,
        // Care needs (visible)
        careTypes: true,
        careLevel: true,
        medicalConditions: true,
        mobilityStatus: true,
        dailyLivingAssistance: true,
        additionalNeeds: true,
        // Care recipient info (non-identifying)
        ageRange: true,
        relationship: true,
        livingSituation: true,
        // Budget & timeline (visible)
        budgetMin: true,
        budgetMax: true,
        budgetFlexibility: true,
        careUrgency: true,
        preferredStartDate: true,
        careDuration: true,
        timeline: true,
        // Description (visible)
        description: true,
        // Metadata
        createdAt: true,
        // Photo visibility controlled by user setting
        profilePhoto: true,
        showProfilePhoto: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    // Process profiles to conditionally include photo based on user preference
    const processedProfiles = profiles.map(profile => ({
      ...profile,
      // Only include photo if user opted in
      profilePhoto: profile.showProfilePhoto ? profile.profilePhoto : null,
      // Remove the setting from response
      showProfilePhoto: undefined,
    }));

    return NextResponse.json(processedProfiles);
  } catch (error) {
    console.error("Error fetching family profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch family profiles" },
      { status: 500 }
    );
  }
}
