import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserMode } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { mode } = body;

    // Validate mode
    if (!mode || !['FAMILY', 'PROVIDER'].includes(mode)) {
      return NextResponse.json(
        { error: "Invalid mode. Must be FAMILY or PROVIDER" },
        { status: 400 }
      );
    }

    // Check if switching to provider mode without provider identity
    if (mode === 'PROVIDER' && !session.user.hasProviderIdentity) {
      return NextResponse.json(
        {
          error: "Provider identity required",
          needsOnboarding: true
        },
        { status: 403 }
      );
    }

    // Update user's active mode in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { activeMode: mode as UserMode },
    });

    return NextResponse.json({
      success: true,
      mode,
      landingPage: mode === 'PROVIDER' ? '/provider/requests' : '/'
    });

  } catch (error) {
    console.error("Error switching mode:", error);
    return NextResponse.json(
      { error: "Failed to switch mode" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      currentMode: session.user.activeMode,
      hasProviderIdentity: session.user.hasProviderIdentity,
      canSwitchToProvider: session.user.hasProviderIdentity,
    });

  } catch (error) {
    console.error("Error fetching mode:", error);
    return NextResponse.json(
      { error: "Failed to fetch mode" },
      { status: 500 }
    );
  }
}
