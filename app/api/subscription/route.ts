import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/subscription
 * Get current user's subscription details
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

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    // If no subscription exists, return FREE tier defaults
    if (!subscription) {
      return NextResponse.json({
        tier: 'FREE',
        status: 'ACTIVE',
        contactViewsUsed: 0,
        contactViewsLimit: 0,
        hasActiveSubscription: false,
      });
    }

    return NextResponse.json({
      ...subscription,
      hasActiveSubscription: subscription.status === 'ACTIVE' && subscription.tier !== 'FREE',
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subscription
 * Create or update subscription (Demo mode - instant activation)
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
    const { tier } = body;

    if (!tier || !['FREE', 'BASIC', 'PRO'].includes(tier)) {
      return NextResponse.json(
        { error: "Invalid tier" },
        { status: 400 }
      );
    }

    // Set contact view limits based on tier
    let contactViewsLimit: number | null;
    switch (tier) {
      case 'FREE':
        contactViewsLimit = 0;
        break;
      case 'BASIC':
        contactViewsLimit = 10;
        break;
      case 'PRO':
        contactViewsLimit = null; // Unlimited
        break;
      default:
        contactViewsLimit = 0;
    }

    // Calculate period end (30 days from now)
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

    // Create or update subscription
    const subscription = await prisma.subscription.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        tier,
        status: 'ACTIVE',
        contactViewsLimit,
        contactViewsUsed: 0, // Reset usage on tier change
        currentPeriodStart,
        currentPeriodEnd,
      },
      create: {
        userId: session.user.id,
        tier,
        status: 'ACTIVE',
        contactViewsLimit,
        contactViewsUsed: 0,
        currentPeriodStart,
        currentPeriodEnd,
      },
    });

    return NextResponse.json({
      message: `Successfully upgraded to ${tier}`,
      subscription,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
