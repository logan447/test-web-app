import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Activity {
  id: string;
  type: "REQUEST" | "MESSAGE" | "PROFILE_UPDATE" | "TOUR_SCHEDULED" | "PROVIDER_SAVED";
  title: string;
  description: string;
  timestamp: string;
  relatedId?: string;
  isUnread: boolean;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;
    const activeMode = session.user.activeMode || userRole;

    const activities: Activity[] = [];

    if (activeMode === "FAMILY") {
      // Get consultation requests (both sent and received)
      const requests = await prisma.consultRequest.findMany({
        where: {
          OR: [
            { senderId: userId },
            { familyProfile: { userId: userId } }
          ]
        },
        include: {
          sender: { select: { name: true } },
          provider: { select: { name: true } },
          familyProfile: { select: { userId: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      for (const request of requests) {
        const isOutgoing = request.senderId === userId;
        activities.push({
          id: `request-${request.id}`,
          type: "REQUEST",
          title: isOutgoing ? `Consultation Request to ${request.provider.name}` : `Consultation Request received`,
          description: `Status: ${request.status}`,
          timestamp: request.createdAt.toISOString(),
          relatedId: request.id,
          isUnread: !isOutgoing && request.status === "PENDING",
        });
      }

      // Get messages - Find messages where I'm part of the conversation
      const messages = await prisma.message.findMany({
        where: {
          consultRequest: {
            OR: [
              { senderId: userId },
              { familyProfile: { userId: userId } }
            ]
          },
          senderId: { not: userId } // Only show messages from others
        },
        include: {
          consultRequest: {
            select: {
              id: true,
              sender: { select: { name: true, id: true } },
              provider: { select: { name: true, userId: true } },
            }
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      for (const message of messages) {
        // Get sender name - if senderId matches request sender, use sender name, otherwise use provider name
        const senderName = message.senderId === message.consultRequest.sender.id
          ? message.consultRequest.sender.name
          : message.consultRequest.provider.name;

        activities.push({
          id: `message-${message.id}`,
          type: "MESSAGE",
          title: `New message from ${senderName}`,
          description: message.content.substring(0, 100) + (message.content.length > 100 ? "..." : ""),
          timestamp: message.createdAt.toISOString(),
          relatedId: message.consultRequestId,
          isUnread: !message.read,
        });
      }

      // Get saved providers (need to get family profile first)
      const familyProfile = await prisma.familyProfile.findUnique({
        where: { userId: userId },
        select: { id: true },
      });

      if (familyProfile) {
        const savedProviders = await prisma.savedProvider.findMany({
          where: { familyProfileId: familyProfile.id },
          include: {
            provider: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        });

        for (const saved of savedProviders) {
          activities.push({
            id: `saved-${saved.id}`,
            type: "PROVIDER_SAVED",
            title: `Saved ${saved.provider.name}`,
            description: "Added to your saved providers",
            timestamp: saved.createdAt.toISOString(),
            relatedId: undefined,
            isUnread: false,
          });
        }
      }

      // Get tour appointments
      const tours = await prisma.tourAppointment.findMany({
        where: {
          request: {
            OR: [
              { senderId: userId },
              { familyProfile: { userId: userId } }
            ]
          },
        },
        include: {
          request: {
            select: {
              id: true,
              provider: { select: { name: true } },
            },
          },
        },
        orderBy: { proposedDate: "desc" },
        take: 10,
      });

      for (const tour of tours) {
        activities.push({
          id: `tour-${tour.id}`,
          type: "TOUR_SCHEDULED",
          title: `Tour scheduled with ${tour.request.provider.name}`,
          description: `${tour.status}: ${new Date(tour.proposedDate).toLocaleDateString()} at ${tour.proposedTime}`,
          timestamp: tour.createdAt.toISOString(),
          relatedId: tour.requestId,
          isUnread: false,
        });
      }
    } else {
      // Provider mode - show requests to their provider
      const requests = await prisma.consultRequest.findMany({
        where: {
          provider: { userId: userId }
        },
        include: {
          sender: { select: { name: true } },
          familyProfile: { select: { lovedOneName: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      for (const request of requests) {
        activities.push({
          id: `request-${request.id}`,
          type: "REQUEST",
          title: `New consultation request from ${request.sender.name}`,
          description: `Status: ${request.status}${request.familyProfile.lovedOneName ? ` - For ${request.familyProfile.lovedOneName}` : ""}`,
          timestamp: request.createdAt.toISOString(),
          relatedId: request.id,
          isUnread: request.status === "PENDING",
        });
      }

      // Get messages for provider
      const messages = await prisma.message.findMany({
        where: {
          consultRequest: {
            provider: { userId: userId }
          },
          senderId: { not: userId } // Only show messages from others
        },
        include: {
          consultRequest: {
            select: {
              id: true,
              sender: { select: { name: true, id: true } },
            }
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      for (const message of messages) {
        activities.push({
          id: `message-${message.id}`,
          type: "MESSAGE",
          title: `New message from ${message.consultRequest.sender.name}`,
          description: message.content.substring(0, 100) + (message.content.length > 100 ? "..." : ""),
          timestamp: message.createdAt.toISOString(),
          relatedId: message.consultRequestId,
          isUnread: !message.read,
        });
      }

      // Get tour appointments for provider
      const tours = await prisma.tourAppointment.findMany({
        where: {
          request: {
            provider: { userId: userId }
          },
        },
        include: {
          request: {
            select: {
              id: true,
              sender: { select: { name: true } },
              familyProfile: { select: { lovedOneName: true } },
            },
          },
        },
        orderBy: { proposedDate: "desc" },
        take: 10,
      });

      for (const tour of tours) {
        const familyInfo = tour.request.familyProfile.lovedOneName
          ? ` for ${tour.request.familyProfile.lovedOneName}`
          : "";

        activities.push({
          id: `tour-${tour.id}`,
          type: "TOUR_SCHEDULED",
          title: `Tour scheduled with ${tour.request.sender.name}`,
          description: `${tour.status}: ${new Date(tour.proposedDate).toLocaleDateString()} at ${tour.proposedTime}${familyInfo}`,
          timestamp: tour.createdAt.toISOString(),
          relatedId: tour.requestId,
          isUnread: false,
        });
      }
    }

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Limit to most recent 50 activities
    const limitedActivities = activities.slice(0, 50);

    return NextResponse.json({
      activities: limitedActivities,
    });
  } catch (error) {
    console.error("Failed to fetch activity feed:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
