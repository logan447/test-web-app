import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activeMode = session.user.activeMode || 'FAMILY';

    if (activeMode === "FAMILY") {
      // For families: mark received requests as viewed
      const familyProfile = await prisma.familyProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (familyProfile) {
        await prisma.consultRequest.updateMany({
          where: {
            familyProfileId: familyProfile.id,
            senderId: { not: session.user.id }, // Not sent by self
            viewedByReceiver: false,
          },
          data: {
            viewedByReceiver: true,
          },
        });
      }
    } else {
      // For providers: mark received requests as viewed
      const provider = await prisma.provider.findUnique({
        where: { userId: session.user.id },
      });

      if (provider) {
        await prisma.consultRequest.updateMany({
          where: {
            providerId: provider.id,
            senderId: { not: session.user.id }, // Not sent by self
            viewedByReceiver: false,
          },
          data: {
            viewedByReceiver: true,
          },
        });
      }
    }

    // Also mark all messages as read
    await prisma.message.updateMany({
      where: {
        read: false,
        senderId: { not: session.user.id },
        consultRequest: {
          OR: [
            { senderId: session.user.id },
            activeMode === "FAMILY"
              ? { familyProfile: { userId: session.user.id } }
              : { provider: { userId: session.user.id } },
          ],
        },
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking as viewed:", error);
    return NextResponse.json(
      { error: "Failed to mark as viewed" },
      { status: 500 }
    );
  }
}
