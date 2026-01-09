import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isTyping } = await req.json();
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

    // Check if user is a participant (sender, family member, or provider)
    const isParticipant =
      request.senderId === session.user.id ||
      request.familyProfile.userId === session.user.id ||
      request.provider.userId === session.user.id;

    if (!isParticipant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update typing status
    await prisma.consultRequest.update({
      where: { id: requestId },
      data: {
        typingUserId: isTyping ? session.user.id : null,
        typingUpdatedAt: new Date(),
      },
    });

    // Update user's last seen
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastSeen: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating typing status:", error);
    return NextResponse.json(
      { error: "Failed to update typing status" },
      { status: 500 }
    );
  }
}
