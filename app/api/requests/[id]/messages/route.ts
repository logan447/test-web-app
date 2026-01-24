import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyNewMessage } from "@/lib/notificationService";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { content, attachments } = body;

    const message = await prisma.message.create({
      data: {
        consultRequestId: id,
        senderId: session.user.id,
        content,
        attachments: attachments || [],
      },
    });

    // Send email notification (non-blocking)
    notifyNewMessage({
      requestId: id,
      senderId: session.user.id,
      messageContent: content,
    }).catch(console.error);

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
