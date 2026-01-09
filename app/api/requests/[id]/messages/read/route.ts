import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Verify user is participant in this request
    const request = await prisma.consultRequest.findUnique({
      where: { id: requestId },
      include: {
        familyProfile: {
          include: { user: true },
        },
        provider: {
          include: { user: true },
        },
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Check if user is a participant
    const isParticipant =
      request.senderId === session.user.id ||
      request.familyProfile.userId === session.user.id ||
      request.provider.userId === session.user.id;

    if (!isParticipant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Mark all messages NOT sent by this user as read and delivered
    const now = new Date();
    await prisma.message.updateMany({
      where: {
        consultRequestId: requestId,
        senderId: { not: session.user.id },
        OR: [
          { status: "SENT" },
          { status: "DELIVERED" },
        ],
      },
      data: {
        status: "READ",
        deliveredAt: now,
        readAt: now,
        read: true, // Update legacy field as well
      },
    });

    // Also mark messages as DELIVERED if they were just SENT by other users
    await prisma.message.updateMany({
      where: {
        consultRequestId: requestId,
        senderId: { not: session.user.id },
        status: "SENT",
      },
      data: {
        status: "DELIVERED",
        deliveredAt: now,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}
