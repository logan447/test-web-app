import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/contact-view
 * Unlock family profile contact information
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
    const { familyProfileId } = body;

    if (!familyProfileId) {
      return NextResponse.json(
        { error: "familyProfileId is required" },
        { status: 400 }
      );
    }

    // Check if family profile exists
    const familyProfile = await prisma.familyProfile.findUnique({
      where: { id: familyProfileId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!familyProfile) {
      return NextResponse.json(
        { error: "Family profile not found" },
        { status: 404 }
      );
    }

    // Get user's subscription
    let subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    // Create FREE subscription if doesn't exist
    if (!subscription) {
      const currentPeriodStart = new Date();
      const currentPeriodEnd = new Date();
      currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

      subscription = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          tier: 'FREE',
          status: 'ACTIVE',
          contactViewsLimit: 0,
          contactViewsUsed: 0,
          currentPeriodStart,
          currentPeriodEnd,
        },
      });
    }

    // Check subscription status
    if (subscription.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          error: "Subscription not active",
          reason: "INACTIVE_SUBSCRIPTION",
          requiresUpgrade: true,
        },
        { status: 403 }
      );
    }

    // Check if already viewed (no double counting)
    const existingView = await prisma.contactView.findUnique({
      where: {
        userId_familyProfileId: {
          userId: session.user.id,
          familyProfileId,
        },
      },
    });

    if (existingView) {
      // Already unlocked, return contact info
      return NextResponse.json({
        message: "Contact already unlocked",
        contactInfo: familyProfile.user,
        alreadyUnlocked: true,
      });
    }

    // Check against limit (null = unlimited for PRO tier)
    if (subscription.contactViewsLimit !== null) {
      if (subscription.contactViewsUsed >= subscription.contactViewsLimit) {
        return NextResponse.json(
          {
            error: "Contact view limit reached",
            reason: "LIMIT_REACHED",
            requiresUpgrade: true,
            currentUsage: subscription.contactViewsUsed,
            limit: subscription.contactViewsLimit,
          },
          { status: 403 }
        );
      }
    }

    // Record contact view
    await prisma.contactView.create({
      data: {
        userId: session.user.id,
        familyProfileId,
      },
    });

    // Increment usage counter
    await prisma.subscription.update({
      where: { userId: session.user.id },
      data: {
        contactViewsUsed: {
          increment: 1,
        },
      },
    });

    // Return unlocked contact info
    return NextResponse.json({
      message: "Contact information unlocked",
      contactInfo: familyProfile.user,
      remainingViews: subscription.contactViewsLimit !== null
        ? subscription.contactViewsLimit - (subscription.contactViewsUsed + 1)
        : null, // null = unlimited
    });
  } catch (error) {
    console.error("Error unlocking contact:", error);
    return NextResponse.json(
      { error: "Failed to unlock contact information" },
      { status: 500 }
    );
  }
}
