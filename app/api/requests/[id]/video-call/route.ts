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
    const isFamilyUser = request.familyProfile.user?.id === session.user.id;
    const isProviderUser = request.provider.user?.id === session.user.id;

    if (!isFamilyUser && !isProviderUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Generate meeting link based on platform
    let meetingLink = "";
    let messageContent = "";
    const userName = session.user.name || "Someone";

    switch (platform) {
      case "zoom":
        // In production, integrate with Zoom API to create actual meetings
        // For now, use a placeholder link
        meetingLink = `https://zoom.us/j/${Math.floor(100000000 + Math.random() * 900000000)}`;
        messageContent = `📹 **Video Call Invitation**\n\n${userName} has started a Zoom meeting.\n\n🔗 **Join Meeting:**\n${meetingLink}\n\nClick the link above to join the call.`;
        break;

      case "google":
        // In production, integrate with Google Meet API
        meetingLink = `https://meet.google.com/${generateRandomCode(10)}`;
        messageContent = `📹 **Video Call Invitation**\n\n${userName} has started a Google Meet.\n\n🔗 **Join Meeting:**\n${meetingLink}\n\nClick the link above to join the call.`;
        break;

      case "custom":
        // Generate a generic meeting link (could integrate with Twilio, Jitsi, etc.)
        const meetingId = generateRandomCode(12);
        meetingLink = `https://meet.olera.com/${meetingId}`;
        messageContent = `📹 **Video Call Invitation**\n\n${userName} has started a video call.\n\n🔗 **Join Meeting:**\n${meetingLink}\n\nClick the link above to join the call.`;
        break;
    }

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

// Helper function to generate random meeting codes
function generateRandomCode(length: number): string {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
    // Add hyphens every 3 characters for readability
    if (i > 0 && (i + 1) % 3 === 0 && i < length - 1) {
      result += "-";
    }
  }
  return result;
}
