import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/user/onboarding-complete
 * Marks the current user's onboarding as complete.
 * This is the single source of truth for onboarding status.
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Update user's onboarding status
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingCompletedAt: new Date() },
      select: {
        id: true,
        onboardingCompletedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      onboardingCompletedAt: user.onboardingCompletedAt,
    });
  } catch (error) {
    console.error("Error marking onboarding complete:", error);
    return NextResponse.json(
      { error: "Failed to update onboarding status" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/onboarding-complete
 * Checks if the current user has completed onboarding.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        onboardingCompletedAt: true,
      },
    });

    return NextResponse.json({
      completed: !!user?.onboardingCompletedAt,
      completedAt: user?.onboardingCompletedAt,
    });
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return NextResponse.json(
      { error: "Failed to check onboarding status" },
      { status: 500 }
    );
  }
}
