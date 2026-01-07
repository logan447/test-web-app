import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/saved-providers
 * Get all saved providers for the current family user
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

    // Get user's family profile
    const familyProfile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!familyProfile) {
      return NextResponse.json([], { status: 200 });
    }

    const savedProviders = await prisma.savedProvider.findMany({
      where: {
        familyProfileId: familyProfile.id,
      },
      include: {
        provider: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(savedProviders);
  } catch (error) {
    console.error("Error fetching saved providers:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved providers" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/saved-providers
 * Save a provider
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

    // Get user's family profile
    const familyProfile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!familyProfile) {
      return NextResponse.json(
        { error: "Family profile not found. Please create a care profile first." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { providerId, notes } = body;

    if (!providerId) {
      return NextResponse.json(
        { error: "providerId is required" },
        { status: 400 }
      );
    }

    // Check if provider exists
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    // Create or update saved provider
    const saved = await prisma.savedProvider.upsert({
      where: {
        familyProfileId_providerId: {
          familyProfileId: familyProfile.id,
          providerId,
        },
      },
      update: {
        notes,
      },
      create: {
        familyProfileId: familyProfile.id,
        providerId,
        notes,
      },
      include: {
        provider: true,
      },
    });

    return NextResponse.json({
      message: "Provider saved",
      saved,
    });
  } catch (error) {
    console.error("Error saving provider:", error);
    return NextResponse.json(
      { error: "Failed to save provider" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/saved-providers
 * Remove a saved provider
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

    // Get user's family profile
    const familyProfile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!familyProfile) {
      return NextResponse.json(
        { error: "Family profile not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    if (!providerId) {
      return NextResponse.json(
        { error: "providerId is required" },
        { status: 400 }
      );
    }

    // Delete the saved provider
    await prisma.savedProvider.deleteMany({
      where: {
        familyProfileId: familyProfile.id,
        providerId,
      },
    });

    return NextResponse.json({
      message: "Provider removed from saved",
    });
  } catch (error) {
    console.error("Error removing saved provider:", error);
    return NextResponse.json(
      { error: "Failed to remove saved provider" },
      { status: 500 }
    );
  }
}
