import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/contact-view/check?familyProfileId=xxx
 * Check if user can view contact info for a specific family profile
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

    const { searchParams } = new URL(request.url);
    const familyProfileId = searchParams.get('familyProfileId');

    if (!familyProfileId) {
      return NextResponse.json(
        { error: "familyProfileId is required" },
        { status: 400 }
      );
    }

    // Get user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    // No subscription = FREE tier, can't view
    if (!subscription || subscription.tier === 'FREE') {
      return NextResponse.json({
        canView: false,
        reason: "NO_SUBSCRIPTION",
        requiresUpgrade: true,
        isUnlocked: false,
      });
    }

    // Check subscription status
    if (subscription.status !== 'ACTIVE') {
      return NextResponse.json({
        canView: false,
        reason: "INACTIVE_SUBSCRIPTION",
        requiresUpgrade: true,
        isUnlocked: false,
      });
    }

    // Check if already viewed
    const existingView = await prisma.contactView.findUnique({
      where: {
        userId_familyProfileId: {
          userId: session.user.id,
          familyProfileId,
        },
      },
    });

    if (existingView) {
      return NextResponse.json({
        canView: true,
        reason: "ALREADY_UNLOCKED",
        isUnlocked: true,
      });
    }

    // PRO tier = unlimited (contactViewsLimit is null)
    if (subscription.contactViewsLimit === null) {
      return NextResponse.json({
        canView: true,
        reason: "UNLIMITED",
        isUnlocked: false,
      });
    }

    // Check against limit
    if (subscription.contactViewsUsed >= subscription.contactViewsLimit) {
      return NextResponse.json({
        canView: false,
        reason: "LIMIT_REACHED",
        requiresUpgrade: true,
        isUnlocked: false,
        currentUsage: subscription.contactViewsUsed,
        limit: subscription.contactViewsLimit,
      });
    }

    // Has remaining views
    return NextResponse.json({
      canView: true,
      reason: "HAS_REMAINING_VIEWS",
      isUnlocked: false,
      remainingViews: subscription.contactViewsLimit - subscription.contactViewsUsed,
    });
  } catch (error) {
    console.error("Error checking contact view:", error);
    return NextResponse.json(
      { error: "Failed to check contact view access" },
      { status: 500 }
    );
  }
}
