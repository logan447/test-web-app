import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch notifications for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const offset = parseInt(searchParams.get("offset") || "0");
    const unreadOnly = searchParams.get("unread") === "true";
    const type = searchParams.get("type");

    // Build where clause
    const where: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (unreadOnly) {
      where.read = false;
    }

    if (type) {
      where.type = type;
    }

    // Fetch notifications with pagination
    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: session.user.id, read: false },
      }),
    ]);

    return NextResponse.json({
      notifications,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + notifications.length < totalCount,
      },
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// PATCH - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, markAll } = body;

    if (markAll) {
      // Mark all notifications as read
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: "notificationIds array required" },
        { status: 400 }
      );
    }

    // Mark specific notifications as read
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: session.user.id, // Ensure user owns notifications
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}

// DELETE - Delete notifications
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("id");
    const deleteAll = searchParams.get("all") === "true";
    const deleteRead = searchParams.get("read") === "true";

    if (deleteAll) {
      // Delete all notifications for user
      await prisma.notification.deleteMany({
        where: { userId: session.user.id },
      });
      return NextResponse.json({ success: true, message: "All notifications deleted" });
    }

    if (deleteRead) {
      // Delete all read notifications
      await prisma.notification.deleteMany({
        where: { userId: session.user.id, read: true },
      });
      return NextResponse.json({ success: true, message: "Read notifications deleted" });
    }

    if (notificationId) {
      // Delete specific notification
      await prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userId: session.user.id,
        },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Specify id, all=true, or read=true" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error deleting notifications:", error);
    return NextResponse.json(
      { error: "Failed to delete notifications" },
      { status: 500 }
    );
  }
}
