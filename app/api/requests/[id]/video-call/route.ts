import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/requests/[id]/video-call - Generate video call link and send message
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: requestId } = await params;
    const { platform } = await req.json();

    // Validate platform
    if (!["zoom", "google", "custom"].includes(platform)) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    // Fetch the request to verify authorization
    const request = await prisma.consultRequest.findUnique({
      where: { id: requestId },
      include: {
        provider: { include: { user: true } },
        familyProfile: { include: { user: true } },
        sender: true,
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

    // Generate meeting link using Jitsi Meet (free, no API required)
    // Jitsi provides instant, no-registration video conferencing
    let meetingLink = "";
    let messageContent = "";
    const userName = session.user.name || "Someone";

    // Generate unique meeting room ID
    const meetingId = `olera-${requestId.slice(0, 8)}-${Date.now().toString(36)}`;

    // Use Jitsi Meet for all platforms (works without API keys)
    // Room names are unique per request and timestamp
    meetingLink = `https://meet.jit.si/${meetingId}`;

    // Customize message based on platform preference
    let platformName = "video call";
    let platformEmoji = "📹";

    switch (platform) {
      case "zoom":
        platformName = "Zoom-style meeting";
        platformEmoji = "💼";
        break;
      case "google":
        platformName = "Google Meet-style conference";
        platformEmoji = "🎥";
        break;
      case "custom":
        platformName = "video call";
        platformEmoji = "📹";
        break;
    }

    messageContent = `${platformEmoji} **Video Call Invitation**\n\n${userName} has started a ${platformName}.\n\n🔗 **Join Meeting:**\n${meetingLink}\n\n💡 *No app download required - works in your browser!*\n\nClick the link above to join the call.`;

    // Create a message with the video call link
    const message = await prisma.message.create({
      data: {
        consultRequestId: requestId,
        senderId: session.user.id,
        content: messageContent,
        status: "SENT",
      },
    });

    // Update request's updatedAt timestamp
    await prisma.consultRequest.update({
      where: { id: requestId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      meetingLink,
      message,
    });
  } catch (error) {
    console.error("Error creating video call:", error);
    return NextResponse.json(
      { error: "Failed to create video call" },
      { status: 500 }
    );
  }
}
