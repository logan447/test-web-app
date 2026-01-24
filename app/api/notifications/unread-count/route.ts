import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activeMode = session.user.activeMode || 'FAMILY';

    let unreadCount = 0;

    if (activeMode === "FAMILY") {
      // For families: count received requests not viewed
      const familyProfile = await prisma.familyProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (familyProfile) {
        unreadCount = await prisma.consultRequest.count({
          where: {
            familyProfileId: familyProfile.id,
            senderId: { not: session.user.id }, // Not sent by self
            viewedByReceiver: false,
          },
        });
      }
    } else {
      // For providers: count received requests not viewed
      const provider = await prisma.provider.findUnique({
        where: { userId: session.user.id },
      });

      if (provider) {
        unreadCount = await prisma.consultRequest.count({
          where: {
            providerId: provider.id,
            senderId: { not: session.user.id }, // Not sent by self
            viewedByReceiver: false,
          },
        });
      }
    }

    // Count unread messages in conversations
    const unreadMessages = await prisma.message.count({
      where: {
        read: false,
        senderId: { not: session.user.id }, // Not sent by self
        consultRequest: {
          OR: [
            { senderId: session.user.id },
            activeMode === "FAMILY"
              ? { familyProfile: { userId: session.user.id } }
              : { provider: { userId: session.user.id } },
          ],
        },
      },
    });

    // Count unread in-app notifications (Sprint 15)
    const unreadNotifications = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false,
      },
    });

    return NextResponse.json({
      unreadRequests: unreadCount,
      unreadMessages,
      unreadNotifications,
      total: unreadNotifications, // Use notification count as the primary indicator
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json(
      { error: "Failed to fetch unread count" },
      { status: 500 }
    );
  }
}
