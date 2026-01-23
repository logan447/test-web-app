import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/requests/[id]/timeline
 * Returns a unified timeline of all engagement events for a request:
 * - Messages (with read status)
 * - Tour appointments (proposed, accepted, declined, completed)
 * - Status changes
 * - Milestones (first message, accepted, etc.)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: requestId } = await params;

    // Fetch the request with all related data
    const consultRequest = await prisma.consultRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: {
          select: { id: true, name: true },
        },
        provider: {
          select: { id: true, name: true, userId: true, coverPhoto: true },
        },
        messages: {
          orderBy: { createdAt: "asc" },
        },
        tourAppointments: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!consultRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Check authorization
    const isFamily = consultRequest.senderId === session.user.id;
    const isProvider = consultRequest.provider.userId === session.user.id;

    if (!isFamily && !isProvider) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Build timeline events
    const timelineEvents: TimelineEvent[] = [];

    // Add request creation milestone
    timelineEvents.push({
      id: `milestone-created-${consultRequest.id}`,
      type: "milestone",
      eventType: "request_created",
      title: "Conversation Started",
      description: isFamily
        ? `You reached out to ${consultRequest.provider.name}`
        : `${consultRequest.sender.name} reached out to you`,
      timestamp: consultRequest.createdAt.toISOString(),
      metadata: {
        initiatedBy: isFamily ? "you" : "family",
      },
    });

    // Add messages to timeline
    let firstMessageAdded = false;
    consultRequest.messages.forEach((message) => {
      const isOwnMessage = message.senderId === session.user.id;
      // Determine sender name based on senderId
      const senderName = message.senderId === consultRequest.senderId
        ? consultRequest.sender.name
        : consultRequest.provider.name;

      // Add first message milestone
      if (!firstMessageAdded) {
        firstMessageAdded = true;
        if (message.senderId !== consultRequest.senderId) {
          // First response from the other party
          timelineEvents.push({
            id: `milestone-first-response-${message.id}`,
            type: "milestone",
            eventType: "first_response",
            title: "First Response",
            description: isProvider
              ? "You sent your first response"
              : `${consultRequest.provider.name} responded`,
            timestamp: message.createdAt.toISOString(),
            metadata: {},
          });
        }
      }

      timelineEvents.push({
        id: `message-${message.id}`,
        type: "message",
        eventType: "message_sent",
        title: isOwnMessage ? "You" : senderName || "Unknown",
        description: message.content,
        timestamp: message.createdAt.toISOString(),
        metadata: {
          senderId: message.senderId,
          senderName,
          isOwnMessage,
          status: message.status,
          readAt: message.readAt?.toISOString(),
          attachments: message.attachments,
        },
      });
    });

    // Add tour appointments to timeline
    consultRequest.tourAppointments.forEach((tour) => {
      const isOwnProposal = tour.proposedBy === session.user.id;
      // Determine proposer name based on proposedBy
      const otherPartyName = tour.proposedBy === consultRequest.senderId
        ? consultRequest.sender.name
        : consultRequest.provider.name;
      const proposerName = isOwnProposal ? "You" : otherPartyName || "Unknown";

      // Tour proposed event
      timelineEvents.push({
        id: `tour-proposed-${tour.id}`,
        type: "tour",
        eventType: "tour_proposed",
        title: `Tour ${tour.status === "PROPOSED" ? "Proposed" : "Scheduled"}`,
        description: `${proposerName} proposed a tour for ${new Date(tour.proposedDate).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })} at ${tour.proposedTime}`,
        timestamp: tour.createdAt.toISOString(),
        metadata: {
          tourId: tour.id,
          proposedBy: tour.proposedBy,
          proposerName,
          isOwnProposal,
          proposedDate: tour.proposedDate.toISOString(),
          proposedTime: tour.proposedTime,
          status: tour.status,
          notes: tour.notes,
        },
      });

      // Tour status change events
      if (tour.status === "ACCEPTED" && tour.updatedAt > tour.createdAt) {
        timelineEvents.push({
          id: `tour-accepted-${tour.id}`,
          type: "milestone",
          eventType: "tour_accepted",
          title: "Tour Confirmed",
          description: `Tour scheduled for ${new Date(tour.proposedDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })} at ${tour.proposedTime}`,
          timestamp: tour.updatedAt.toISOString(),
          metadata: {
            tourId: tour.id,
          },
        });
      } else if (tour.status === "DECLINED" && tour.updatedAt > tour.createdAt) {
        timelineEvents.push({
          id: `tour-declined-${tour.id}`,
          type: "tour",
          eventType: "tour_declined",
          title: "Tour Declined",
          description: "The tour proposal was declined",
          timestamp: tour.updatedAt.toISOString(),
          metadata: {
            tourId: tour.id,
          },
        });
      } else if (tour.status === "COMPLETED") {
        timelineEvents.push({
          id: `tour-completed-${tour.id}`,
          type: "milestone",
          eventType: "tour_completed",
          title: "Tour Completed",
          description: `Tour at ${consultRequest.provider.name} was completed`,
          timestamp: tour.updatedAt.toISOString(),
          metadata: {
            tourId: tour.id,
          },
        });
      }
    });

    // Add request status milestones
    if (consultRequest.status === "ACCEPTED") {
      timelineEvents.push({
        id: `milestone-accepted-${consultRequest.id}`,
        type: "milestone",
        eventType: "request_accepted",
        title: "Request Accepted",
        description: isProvider
          ? "You accepted this care request"
          : `${consultRequest.provider.name} accepted your request`,
        timestamp: consultRequest.updatedAt.toISOString(),
        metadata: {},
      });
    } else if (consultRequest.status === "DECLINED") {
      timelineEvents.push({
        id: `milestone-declined-${consultRequest.id}`,
        type: "milestone",
        eventType: "request_declined",
        title: "Request Declined",
        description: "This request was declined",
        timestamp: consultRequest.updatedAt.toISOString(),
        metadata: {},
      });
    } else if (consultRequest.status === "COMPLETED") {
      timelineEvents.push({
        id: `milestone-completed-${consultRequest.id}`,
        type: "milestone",
        eventType: "request_completed",
        title: "Engagement Completed",
        description: "This engagement has been marked as completed",
        timestamp: consultRequest.updatedAt.toISOString(),
        metadata: {},
      });
    }

    // Sort by timestamp
    timelineEvents.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Calculate engagement stats
    const stats = {
      totalMessages: consultRequest.messages.length,
      messagesByYou: consultRequest.messages.filter(
        (m) => m.senderId === session.user.id
      ).length,
      messagesByOther: consultRequest.messages.filter(
        (m) => m.senderId !== session.user.id
      ).length,
      toursProposed: consultRequest.tourAppointments.length,
      toursAccepted: consultRequest.tourAppointments.filter((t) => t.status === "ACCEPTED")
        .length,
      toursCompleted: consultRequest.tourAppointments.filter((t) => t.status === "COMPLETED")
        .length,
      daysSinceStart: Math.floor(
        (Date.now() - new Date(consultRequest.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      ),
      status: consultRequest.status,
    };

    return NextResponse.json({
      timeline: timelineEvents,
      stats,
      request: {
        id: consultRequest.id,
        status: consultRequest.status,
        createdAt: consultRequest.createdAt.toISOString(),
        provider: {
          id: consultRequest.provider.id,
          name: consultRequest.provider.name,
          coverPhoto: consultRequest.provider.coverPhoto,
        },
        family: {
          id: consultRequest.sender.id,
          name: consultRequest.sender.name,
        },
      },
    });
  } catch (error) {
    console.error("Timeline fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch timeline" },
      { status: 500 }
    );
  }
}

interface TimelineEvent {
  id: string;
  type: "message" | "tour" | "milestone" | "status_change";
  eventType: string;
  title: string;
  description: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}
