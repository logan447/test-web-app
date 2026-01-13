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

    // Update user's active mode in database
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { activeMode: mode as UserMode },
      include: {
        familyProfile: true,
        provider: true,
      },
    });

    // Determine landing page based on mode and onboarding completion (Sprint 0)
    let landingPage = '/';

    if (mode === 'FAMILY') {
      // Check if family onboarding is complete
      if (!user.familyOnboardingComplete) {
        landingPage = '/onboarding/family';
      } else {
        landingPage = '/providers'; // Browse providers
      }
    } else {
      // PROVIDER mode
      if (!user.providerOnboardingComplete) {
        landingPage = '/provider/onboarding';
      } else {
        landingPage = '/provider/requests'; // Inbox
      }
    }

    // Return success with landing page info
    // Client should call session.update() to refresh the NextAuth session
    return NextResponse.json({
      success: true,
      mode,
      landingPage
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
    });

  } catch (error) {
    console.error("Error fetching mode:", error);
    return NextResponse.json(
      { error: "Failed to fetch mode" },
      { status: 500 }
    );
  }
}
