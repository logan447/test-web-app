import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProviderType } from "@prisma/client";

/**
 * GET /api/caregiver/matches
 * Returns organizations that match the caregiver's profile
 *
 * Matching algorithm considers:
 * - Location (city/state match)
 * - Care types overlap
 * - Provider type (organizations hiring caregivers)
 * - Active hiring status
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the caregiver's provider profile
    const caregiver = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    });

    if (!caregiver) {
      return NextResponse.json([]);
    }

    // Only show matches for independent caregivers
    if (caregiver.providerType !== ProviderType.INDEPENDENT_CAREGIVER) {
      return NextResponse.json([]);
    }

    // Find organizations that might be looking for caregivers
    // These are non-caregiver providers (facilities, agencies, etc.)
    const organizationTypes: ProviderType[] = [
      ProviderType.ASSISTED_LIVING,
      ProviderType.MEMORY_CARE,
      ProviderType.HOME_CARE,
      ProviderType.NURSING_HOME,
      ProviderType.HOSPICE,
      ProviderType.REHABILITATION,
    ];

    const organizations = await prisma.provider.findMany({
      where: {
        providerType: { in: organizationTypes },
        isVisible: true,
        // Exclude the current user's own provider
        userId: { not: session.user.id },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            subscription: true,
          },
        },
      },
      take: 20,
    });

    // Calculate match scores
    const matches = organizations.map((org) => {
      let matchScore = 50; // Base score
      const matchReasons: string[] = [];

      // Location match (same state = +20, same city = +30)
      if (caregiver.state && org.state && caregiver.state === org.state) {
        matchScore += 20;
        matchReasons.push("Same state");

        if (caregiver.city && org.city && caregiver.city.toLowerCase() === org.city.toLowerCase()) {
          matchScore += 10;
          matchReasons.push("Same city");
        }
      }

      // Care types overlap
      const caregiverCareTypes = caregiver.careTypesOffered || [];
      const orgCareTypes = org.careTypesOffered || [];
      const overlappingTypes = caregiverCareTypes.filter((type) =>
        orgCareTypes.includes(type)
      );

      if (overlappingTypes.length > 0) {
        matchScore += overlappingTypes.length * 10;
        matchReasons.push(`${overlappingTypes.length} matching care types`);
      }

      // Organization has active subscription (more likely to be hiring)
      const hasSubscription = org.user?.subscription?.status === "ACTIVE";
      if (hasSubscription) {
        matchScore += 15;
        matchReasons.push("Actively hiring");
      }

      // Cap at 100
      matchScore = Math.min(matchScore, 100);

      return {
        id: org.id,
        name: org.name,
        providerType: org.providerType,
        city: org.city,
        state: org.state,
        description: org.description,
        coverPhoto: org.coverPhoto,
        photos: org.photos || [],
        isHiring: hasSubscription,
        matchScore,
        matchReasons,
        careTypesOffered: org.careTypesOffered,
      };
    });

    // Sort by match score descending
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Filter to only return high-quality matches (score >= 60)
    const qualityMatches = matches.filter((m) => m.matchScore >= 60);

    return NextResponse.json(qualityMatches);
  } catch (error) {
    console.error("Error fetching caregiver matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}
