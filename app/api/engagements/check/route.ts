import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/engagements/check?providerId=xxx
 *
 * Check if the current user has an active engagement with a specific provider.
 * Returns the engagement if found, null otherwise.
 *
 * Active engagement = status is PENDING or ACCEPTED (not DECLINED or COMPLETED)
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get("providerId");

    if (!providerId) {
      return NextResponse.json(
        { error: "providerId is required" },
        { status: 400 }
      );
    }

    // Get user's family profile
    const familyProfile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!familyProfile) {
      // No profile = no engagements
      return NextResponse.json({ activeEngagement: null });
    }

    // Check for active engagement with this provider
    // Active = PENDING or ACCEPTED (excludes DECLINED and COMPLETED)
    const activeEngagement = await prisma.consultRequest.findFirst({
      where: {
        familyProfileId: familyProfile.id,
        providerId: providerId,
        status: {
          in: ["PENDING", "ACCEPTED"],
        },
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      activeEngagement: activeEngagement
        ? {
            id: activeEngagement.id,
            status: activeEngagement.status,
            createdAt: activeEngagement.createdAt,
            providerName: activeEngagement.provider.name,
          }
        : null,
    });
  } catch (error) {
    console.error("Error checking engagement:", error);
    return NextResponse.json(
      { error: "Failed to check engagement" },
      { status: 500 }
    );
  }
}
