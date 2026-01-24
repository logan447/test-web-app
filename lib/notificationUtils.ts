import { prisma } from "@/lib/prisma";
import { NotificationType, Prisma } from "@prisma/client";

// ============================================
// Notification Creation Utilities
// Sprint 15: In-App Notification System
// ============================================

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  linkHref?: string;
  linkLabel?: string;
  relatedRequestId?: string;
  relatedUserId?: string;
  relatedProviderId?: string;
  metadata?: Prisma.InputJsonValue;
}

/**
 * Create a single notification
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        body: params.body,
        linkHref: params.linkHref,
        linkLabel: params.linkLabel,
        relatedRequestId: params.relatedRequestId,
        relatedUserId: params.relatedUserId,
        relatedProviderId: params.relatedProviderId,
        metadata: params.metadata,
      },
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    // Don't throw - notifications should fail gracefully
    return null;
  }
}

/**
 * Create notification for new message
 */
export async function notifyNewMessageInApp(params: {
  recipientUserId: string;
  senderName: string;
  requestId: string;
  messagePreview: string;
  senderUserId: string;
}) {
  const truncatedMessage =
    params.messagePreview.length > 100
      ? params.messagePreview.substring(0, 97) + "..."
      : params.messagePreview;

  return createNotification({
    userId: params.recipientUserId,
    type: "MESSAGE",
    title: `New message from ${params.senderName}`,
    body: truncatedMessage,
    linkHref: `/requests/${params.requestId}`,
    linkLabel: "View conversation",
    relatedRequestId: params.requestId,
    relatedUserId: params.senderUserId,
  });
}

/**
 * Create notification for new request (family → provider)
 */
export async function notifyNewRequestInApp(params: {
  providerUserId: string;
  familyName: string;
  requestId: string;
  contactReason?: string;
  familyUserId: string;
  providerId: string;
}) {
  const reason = params.contactReason || "consultation";

  return createNotification({
    userId: params.providerUserId,
    type: "REQUEST_NEW",
    title: "New inquiry received",
    body: `${params.familyName} has requested a ${reason.toLowerCase()}`,
    linkHref: `/provider/requests/${params.requestId}`,
    linkLabel: "View request",
    relatedRequestId: params.requestId,
    relatedUserId: params.familyUserId,
    relatedProviderId: params.providerId,
  });
}

/**
 * Create notification for request accepted
 */
export async function notifyRequestAcceptedInApp(params: {
  recipientUserId: string;
  providerName: string;
  requestId: string;
  providerId: string;
}) {
  return createNotification({
    userId: params.recipientUserId,
    type: "REQUEST_ACCEPTED",
    title: "Request accepted!",
    body: `${params.providerName} has accepted your request`,
    linkHref: `/requests/${params.requestId}`,
    linkLabel: "View details",
    relatedRequestId: params.requestId,
    relatedProviderId: params.providerId,
  });
}

/**
 * Create notification for request declined
 */
export async function notifyRequestDeclinedInApp(params: {
  recipientUserId: string;
  providerName: string;
  requestId: string;
  providerId: string;
}) {
  return createNotification({
    userId: params.recipientUserId,
    type: "REQUEST_DECLINED",
    title: "Request update",
    body: `${params.providerName} was unable to accept your request at this time`,
    linkHref: `/requests/${params.requestId}`,
    linkLabel: "View details",
    relatedRequestId: params.requestId,
    relatedProviderId: params.providerId,
  });
}

/**
 * Create notification for engagement completed
 */
export async function notifyEngagementCompletedInApp(params: {
  recipientUserId: string;
  otherPartyName: string;
  requestId: string;
  relatedUserId?: string;
  relatedProviderId?: string;
}) {
  return createNotification({
    userId: params.recipientUserId,
    type: "REQUEST_COMPLETED",
    title: "Engagement completed",
    body: `Your engagement with ${params.otherPartyName} has been marked as completed`,
    linkHref: `/requests/${params.requestId}`,
    linkLabel: "View summary",
    relatedRequestId: params.requestId,
    relatedUserId: params.relatedUserId,
    relatedProviderId: params.relatedProviderId,
  });
}

/**
 * Create notification for tour/meeting proposed
 */
export async function notifyTourProposedInApp(params: {
  recipientUserId: string;
  proposerName: string;
  requestId: string;
  proposedDate: string;
  proposedTime: string;
  proposerUserId: string;
}) {
  return createNotification({
    userId: params.recipientUserId,
    type: "TOUR_PROPOSED",
    title: "Tour proposed",
    body: `${params.proposerName} proposed a tour for ${params.proposedDate} at ${params.proposedTime}`,
    linkHref: `/requests/${params.requestId}`,
    linkLabel: "Respond",
    relatedRequestId: params.requestId,
    relatedUserId: params.proposerUserId,
  });
}

/**
 * Create notification for tour/meeting accepted
 */
export async function notifyTourAcceptedInApp(params: {
  recipientUserId: string;
  accepterName: string;
  requestId: string;
  scheduledDate: string;
  scheduledTime: string;
  accepterUserId: string;
}) {
  return createNotification({
    userId: params.recipientUserId,
    type: "TOUR_ACCEPTED",
    title: "Tour confirmed!",
    body: `${params.accepterName} confirmed your tour for ${params.scheduledDate} at ${params.scheduledTime}`,
    linkHref: `/requests/${params.requestId}`,
    linkLabel: "View details",
    relatedRequestId: params.requestId,
    relatedUserId: params.accepterUserId,
  });
}

/**
 * Create notification for upcoming tour reminder
 */
export async function notifyTourReminderInApp(params: {
  recipientUserId: string;
  providerName: string;
  requestId: string;
  scheduledDate: string;
  scheduledTime: string;
  hoursUntil: number;
}) {
  const timeLabel = params.hoursUntil === 24 ? "tomorrow" : `in ${params.hoursUntil} hours`;

  return createNotification({
    userId: params.recipientUserId,
    type: "TOUR_REMINDER",
    title: `Tour reminder`,
    body: `Your tour with ${params.providerName} is ${timeLabel} at ${params.scheduledTime}`,
    linkHref: `/requests/${params.requestId}`,
    linkLabel: "View details",
    relatedRequestId: params.requestId,
  });
}

/**
 * Create notification for profile view (premium feature)
 */
export async function notifyProfileViewInApp(params: {
  recipientUserId: string;
  viewerName?: string;
  isAnonymous?: boolean;
}) {
  const viewerLabel = params.isAnonymous || !params.viewerName
    ? "Someone"
    : params.viewerName;

  return createNotification({
    userId: params.recipientUserId,
    type: "PROFILE_VIEW",
    title: "Profile viewed",
    body: `${viewerLabel} viewed your profile`,
    linkHref: "/provider/profile",
    linkLabel: "View profile",
  });
}

/**
 * Create system notification
 */
export async function notifySystemInApp(params: {
  recipientUserId: string;
  title: string;
  body: string;
  linkHref?: string;
  linkLabel?: string;
}) {
  return createNotification({
    userId: params.recipientUserId,
    type: "SYSTEM",
    title: params.title,
    body: params.body,
    linkHref: params.linkHref,
    linkLabel: params.linkLabel,
  });
}

/**
 * Get unread notification count for user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    return await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
}

/**
 * Mark notifications as read
 */
export async function markNotificationsAsRead(
  userId: string,
  notificationIds?: string[]
): Promise<void> {
  try {
    if (notificationIds && notificationIds.length > 0) {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });
    } else {
      // Mark all as read
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: {
          read: true,
          readAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error("Error marking notifications as read:", error);
  }
}

/**
 * Delete old notifications (cleanup utility)
 * Can be called periodically to clean up old notifications
 */
export async function deleteOldNotifications(daysOld: number = 90): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        read: true, // Only delete read notifications
      },
    });

    return result.count;
  } catch (error) {
    console.error("Error deleting old notifications:", error);
    return 0;
  }
}
