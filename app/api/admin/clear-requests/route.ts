import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete all messages first (due to foreign key constraints)
    const deletedMessages = await prisma.message.deleteMany({});

    // Delete all consultation requests
    const deletedRequests = await prisma.consultRequest.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `Deleted ${deletedRequests.count} consultation requests and ${deletedMessages.count} messages`,
      deletedRequests: deletedRequests.count,
      deletedMessages: deletedMessages.count,
    });
  } catch (error) {
    console.error("Error clearing consultation requests:", error);
    return NextResponse.json(
      { error: "Failed to clear consultation requests" },
      { status: 500 }
    );
  }
}
