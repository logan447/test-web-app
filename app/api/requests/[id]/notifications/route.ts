import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/requests/[id]/notifications - Update notification settings
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: requestId } = await params;
    const { muted, muteUntil, emailNotifications } = await req.json();

    // Fetch the request to verify authorization
    const request = await prisma.consultRequest.findUnique({
      where: { id: requestId },
      include: {
        provider: { include: { user: true } },
        familyProfile: { include: { user: true } },
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Check if user is authorized (either family or provider)
    const isFamilyUser = request.familyProfile?.user?.id === session.user.id;
    const isProviderUser = request.provider.user?.id === session.user.id;

    if (!isFamilyUser && !isProviderUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update notification settings
    const notificationSettings = {
      muted: muted || false,
      muteUntil: muteUntil ? new Date(muteUntil).toISOString() : null,
      emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
    };

    const updatedRequest = await prisma.consultRequest.update({
      where: { id: requestId },
      data: {
        notificationSettings,
      },
    });

    return NextResponse.json({
      success: true,
      notificationSettings: updatedRequest.notificationSettings,
    });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return NextResponse.json(
      { error: "Failed to update notification settings" },
      { status: 500 }
    );
  }
}

// GET /api/requests/[id]/notifications - Get notification settings
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: requestId } = await params;

    // Fetch the request to verify authorization
    const request = await prisma.consultRequest.findUnique({
      where: { id: requestId },
      include: {
        provider: { include: { user: true } },
        familyProfile: { include: { user: true } },
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Check if user is authorized (either family or provider)
    const isFamilyUser = request.familyProfile?.user?.id === session.user.id;
    const isProviderUser = request.provider.user?.id === session.user.id;

    if (!isFamilyUser && !isProviderUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Return notification settings (or defaults if not set)
    const notificationSettings = request.notificationSettings || {
      muted: false,
      muteUntil: null,
      emailNotifications: true,
    };

    return NextResponse.json({
      success: true,
      notificationSettings,
    });
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification settings" },
      { status: 500 }
    );
  }
}
