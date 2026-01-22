import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/provider/matches
 * Returns family profiles that match this provider's care types,
 * excluding families the provider already has an engagement with.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the provider's profile
    const provider = await prisma.provider.findFirst({
      where: { userId: session.user.id },
      select: {
        id: true,
        careTypesOffered: true,
        city: true,
        state: true,
        serviceRadius: true,
      },
    });

    if (!provider) {
      return NextResponse.json([]);
    }

    // Get IDs of families the provider already has engagements with
    const existingEngagements = await prisma.consultRequest.findMany({
      where: {
        providerId: provider.id,
        status: { not: "DECLINED" },
      },
      select: {
        familyProfileId: true,
      },
    });

    const engagedFamilyIds = existingEngagements
      .map((e) => e.familyProfileId)
      .filter(Boolean) as string[];

    // Find family profiles that match the provider's care types
    const matchedFamilies = await prisma.familyProfile.findMany({
      where: {
        id: { notIn: engagedFamilyIds },
        // Match care types - family is looking for care that provider offers
        careTypes: {
          hasSome: provider.careTypesOffered,
        },
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    // Calculate match scores
    const scoredFamilies = matchedFamilies.map((family) => {
      let score = 0;
      const reasons: string[] = [];

      // Care type match
      const careTypeMatches = family.careTypes.filter((ct) =>
        provider.careTypesOffered.includes(ct)
      );
      if (careTypeMatches.length > 0) {
        score += careTypeMatches.length * 25;
        if (careTypeMatches.length === family.careTypes.length) {
          reasons.push("Offers all requested care types");
        } else {
          reasons.push(`Matches ${careTypeMatches.length} care type${careTypeMatches.length > 1 ? 's' : ''}`);
        }
      }

      // Location match
      if (family.state === provider.state) {
        score += 20;
        if (family.city === provider.city) {
          score += 15;
          reasons.push("Same city");
        } else {
          reasons.push("Same state");
        }
      }

      // Recent profile bonus
      const daysSinceCreated = Math.floor(
        (Date.now() - new Date(family.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceCreated <= 7) {
        score += 10;
        reasons.push("Recently active");
      }

      return {
        id: family.id,
        userId: family.userId,
        user: family.user,
        city: family.city || "",
        state: family.state || "",
        careTypes: family.careTypes,
        seniorName: family.lovedOneName,
        createdAt: family.createdAt.toISOString(),
        matchScore: Math.min(score, 100),
        matchReasons: reasons,
      };
    });

    // Sort by match score
    scoredFamilies.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    return NextResponse.json(scoredFamilies);
  } catch (error) {
    console.error("Error fetching provider matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}
