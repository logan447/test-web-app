import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify the provider exists
    const provider = await prisma.provider.findUnique({
      where: { id },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    // Check if provider is already claimed
    if (provider.claimed) {
      return NextResponse.json(
        { error: "This provider has already been claimed" },
        { status: 400 }
      );
    }

    // Check if user already owns a provider
    const existingProvider = await prisma.provider.findFirst({
      where: { userId: session.user.id },
    });

    if (existingProvider) {
      return NextResponse.json(
        { error: "You already own a provider profile. You cannot claim another listing." },
        { status: 400 }
      );
    }

    // Get or create provider identity for the user
    let providerIdentity = await prisma.providerIdentity.findUnique({
      where: { userId: session.user.id },
    });

    if (!providerIdentity) {
      // Create provider identity if it doesn't exist
      providerIdentity = await prisma.providerIdentity.create({
        data: {
          userId: session.user.id,
          type: "ORGANIZATION", // Default, can be updated later
          onboardingComplete: true, // They're claiming, so they're a provider
        },
      });
    }

    // Update provider to mark as claimed and link to user
    const updatedProvider = await prisma.provider.update({
      where: { id },
      data: {
        claimed: true,
        userId: session.user.id,
      },
    });

    // Update provider identity to link to this provider
    await prisma.providerIdentity.update({
      where: { id: providerIdentity.id },
      data: {
        providerId: id,
        onboardingComplete: true,
      },
    });

    // Update user's active mode to PROVIDER if not already
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        activeMode: "PROVIDER",
      },
    });

    return NextResponse.json({
      success: true,
      provider: updatedProvider,
      message: "Provider claimed successfully",
    });
  } catch (error) {
    console.error("Error claiming provider:", error);
    return NextResponse.json(
      { error: "Failed to claim provider" },
      { status: 500 }
    );
  }
}
