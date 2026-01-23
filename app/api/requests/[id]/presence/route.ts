import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Fetch request with participant information
    const request = await prisma.consultRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: true,
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

    // Determine who the "other" participant is
    let otherUser = null;
    const currentUserId = session.user.id;

    // If current user is the sender, the other user is either family or provider
    if (request.senderId === currentUserId) {
      // Sender could be either family or provider
      // The other participant is whoever they're NOT
      if (request.familyProfile?.userId === currentUserId) {
        // Current user is family, other is provider
        otherUser = request.provider.user;
      } else {
        // Current user is provider (or sender), other is family
        otherUser = request.familyProfile?.user;
      }
    } else if (request.familyProfile?.userId === currentUserId) {
      // Current user is family, other is sender (could be provider)
      otherUser = request.sender;
    } else if (request.provider.userId === currentUserId) {
      // Current user is provider, other is sender (could be family)
      otherUser = request.sender;
    } else {
      // User is not a participant
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!otherUser) {
      return NextResponse.json({ error: "Could not determine other participant" }, { status: 500 });
    }

    // Determine if other user is online (active within last 2 minutes)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const isOnline = otherUser.lastSeen && otherUser.lastSeen > twoMinutesAgo;

    // Check typing status
    const isTyping = request.typingUserId === otherUser.id;

    // Only show typing if it was updated within last 5 seconds
    const fiveSecondsAgo = new Date(Date.now() - 5 * 1000);
    const showTyping = isTyping && request.typingUpdatedAt && request.typingUpdatedAt > fiveSecondsAgo;

    // Update current user's last seen
    await prisma.user.update({
      where: { id: currentUserId },
      data: { lastSeen: new Date() },
    });

    return NextResponse.json({
      otherUser: {
        id: otherUser.id,
        name: otherUser.name,
        lastSeen: otherUser.lastSeen,
      },
      isOnline,
      isTyping: showTyping,
    });
  } catch (error) {
    console.error("Error fetching presence:", error);
    return NextResponse.json(
      { error: "Failed to fetch presence" },
      { status: 500 }
    );
  }
}
