import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/saved-families
 * Get all saved family profiles for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const savedProfiles = await prisma.savedFamilyProfile.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        familyProfile: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to return the family profiles with saved metadata
    const profiles = savedProfiles.map(saved => ({
      ...saved.familyProfile,
      savedAt: saved.createdAt,
      savedId: saved.id,
      notes: saved.notes,
    }));

    return NextResponse.json(profiles);
  } catch (error) {
    console.error("Error fetching saved families:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved families" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/saved-families
 * Save a family profile
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { familyProfileId, notes } = body;

    if (!familyProfileId) {
      return NextResponse.json(
        { error: "familyProfileId is required" },
        { status: 400 }
      );
    }

    // Check if family profile exists
    const familyProfile = await prisma.familyProfile.findUnique({
      where: { id: familyProfileId },
    });

    if (!familyProfile) {
      return NextResponse.json(
        { error: "Family profile not found" },
        { status: 404 }
      );
    }

    // Create or update saved family profile
    const saved = await prisma.savedFamilyProfile.upsert({
      where: {
        userId_familyProfileId: {
          userId: session.user.id,
          familyProfileId,
        },
      },
      update: {
        notes,
      },
      create: {
        userId: session.user.id,
        familyProfileId,
        notes,
      },
      include: {
        familyProfile: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: "Family profile saved",
      saved,
    });
  } catch (error) {
    console.error("Error saving family profile:", error);
    return NextResponse.json(
      { error: "Failed to save family profile" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/saved-families
 * Remove a saved family profile
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const familyProfileId = searchParams.get('familyProfileId');

    if (!familyProfileId) {
      return NextResponse.json(
        { error: "familyProfileId is required" },
        { status: 400 }
      );
    }

    // Delete the saved family profile
    await prisma.savedFamilyProfile.deleteMany({
      where: {
        userId: session.user.id,
        familyProfileId,
      },
    });

    return NextResponse.json({
      message: "Family profile removed from saved",
    });
  } catch (error) {
    console.error("Error removing saved family profile:", error);
    return NextResponse.json(
      { error: "Failed to remove saved family profile" },
      { status: 500 }
    );
  }
}
