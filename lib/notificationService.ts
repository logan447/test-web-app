/**
 * Notification Service
 * Centralized service for sending notifications (email + in-app)
 * Respects user notification preferences
 */

import { prisma } from "@/lib/prisma";
import {
  sendNewRequestEmail,
  sendRequestAcceptedEmail,
  sendRequestDeclinedEmail,
  sendNewMessageEmail,
  sendTourProposedEmail,
  sendTourAcceptedEmail,
  sendEngagementCompletedEmail,
  isEmailConfigured,
} from "@/lib/email";
import { getEngagementTypeForProvider, formatEngagementType } from "@/lib/engagementUtils";
import {
  notifyNewMessageInApp,
  notifyNewRequestInApp,
  notifyRequestAcceptedInApp,
  notifyRequestDeclinedInApp,
  notifyEngagementCompletedInApp,
  notifyTourProposedInApp,
  notifyTourAcceptedInApp,
} from "@/lib/notificationUtils";

// Types for notification payloads
interface NotificationContext {
  requestId: string;
  skipEmail?: boolean;
}

/**
 * Check if email notifications are enabled for a request
 */
async function shouldSendEmail(requestId: string, recipientUserId: string): Promise<boolean> {
  if (!isEmailConfigured()) {
    return false;
  }

  try {
    const request = await prisma.consultRequest.findUnique({
      where: { id: requestId },
      select: { notificationSettings: true },
    });

    if (!request) return false;

    const settings = request.notificationSettings as {
      muted?: boolean;
      muteUntil?: string;
      emailNotifications?: boolean;
    } | null;

    // Check if muted
    if (settings?.muted) {
      if (settings.muteUntil) {
        const muteUntil = new Date(settings.muteUntil);
        if (muteUntil > new Date()) {
          return false; // Still muted
        }
      } else {
        return false; // Muted indefinitely
      }
    }

    // Check if email notifications are explicitly disabled
    if (settings?.emailNotifications === false) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("[NotificationService] Error checking notification settings:", error);
    return true; // Default to sending if error
  }
}

/**
 * Get user details for sending notifications
 */
async function getUserDetails(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });
  return user;
}

/**
 * Get full request context for notifications
 */
async function getRequestContext(requestId: string) {
  const request = await prisma.consultRequest.findUnique({
    where: { id: requestId },
    include: {
      provider: {
        include: { user: true },
      },
      familyProfile: {
        include: { user: true },
      },
      sender: true,
    },
  });
  return request;
}

// =============================================================================
// NOTIFICATION TRIGGERS
// =============================================================================

/**
 * Notify when a new request is created
 */
export async function notifyNewRequest(ctx: NotificationContext & {
  senderId: string;
  isOutreach: boolean; // true if provider-to-family, false if family-to-provider
}) {
  if (ctx.skipEmail) return;

  try {
    const request = await getRequestContext(ctx.requestId);
    if (!request) return;

    // Determine recipient based on who sent
    const isProviderSender = request.senderId === request.provider.user?.id;

    let recipientUserId: string;
    let recipientEmail: string | undefined;
    let recipientName: string;
    let senderName: string;

    if (isProviderSender) {
      // Provider sent to family
      recipientUserId = request.familyProfile?.user?.id || "";
      recipientEmail = request.familyProfile?.user?.email || undefined;
      recipientName = request.familyProfile?.user?.name || "there";
      senderName = request.sender.name || request.provider.name;
    } else {
      // Family sent to provider
      recipientUserId = request.provider.user?.id || "";
      recipientEmail = request.provider.user?.email || undefined;
      recipientName = request.provider.user?.name || request.provider.name;
      senderName = request.sender.name || "A family";
    }

    if (!recipientUserId) return;

    // Always create in-app notification
    if (!isProviderSender) {
      // Family sent to provider - notify provider
      await notifyNewRequestInApp({
        providerUserId: recipientUserId,
        familyName: senderName,
        requestId: ctx.requestId,
        contactReason: request.contactReason || undefined,
        familyUserId: ctx.senderId,
        providerId: request.provider.id,
      });
    }

    // Send email if configured and not muted
    if (recipientEmail) {
      const shouldSend = await shouldSendEmail(ctx.requestId, recipientUserId);
      if (shouldSend) {
        await sendNewRequestEmail({
          recipientEmail,
          recipientName,
          senderName,
          providerName: isProviderSender ? request.provider.name : undefined,
          requestType: isProviderSender ? "outreach" : "inquiry",
          message: request.message || undefined,
          requestId: ctx.requestId,
        });
      }
    }
  } catch (error) {
    console.error("[NotificationService] notifyNewRequest error:", error);
  }
}

/**
 * Notify when a request status changes
 */
export async function notifyRequestStatusChange(ctx: NotificationContext & {
  newStatus: "ACCEPTED" | "DECLINED" | "COMPLETED";
  changedByUserId: string;
}) {
  if (ctx.skipEmail) return;

  try {
    const request = await getRequestContext(ctx.requestId);
    if (!request) return;

    // Determine who to notify (the other party)
    const isProviderChanging = ctx.changedByUserId === request.provider.user?.id;

    let recipientUserId: string;
    let recipientEmail: string | undefined;
    let recipientName: string;

    if (isProviderChanging) {
      // Provider changed status, notify family
      recipientUserId = request.familyProfile?.user?.id || "";
      recipientEmail = request.familyProfile?.user?.email || undefined;
      recipientName = request.familyProfile?.user?.name || "there";
    } else {
      // Family changed status, notify provider
      recipientUserId = request.provider.user?.id || "";
      recipientEmail = request.provider.user?.email || undefined;
      recipientName = request.provider.user?.name || request.provider.name;
    }

    if (!recipientUserId) return;

    const engagementType = formatEngagementType(
      getEngagementTypeForProvider(request.provider.providerType)
    );

    // Create in-app notifications
    if (ctx.newStatus === "ACCEPTED") {
      await notifyRequestAcceptedInApp({
        recipientUserId,
        providerName: request.provider.name,
        requestId: ctx.requestId,
        providerId: request.provider.id,
      });
    } else if (ctx.newStatus === "DECLINED") {
      await notifyRequestDeclinedInApp({
        recipientUserId,
        providerName: request.provider.name,
        requestId: ctx.requestId,
        providerId: request.provider.id,
      });
    } else if (ctx.newStatus === "COMPLETED") {
      const otherPartyName = isProviderChanging
        ? request.provider.name
        : request.familyProfile?.user?.name || "the family";

      await notifyEngagementCompletedInApp({
        recipientUserId,
        otherPartyName,
        requestId: ctx.requestId,
        relatedUserId: isProviderChanging ? request.provider.user?.id : request.familyProfile?.user?.id,
        relatedProviderId: request.provider.id,
      });
    }

    // Send email if configured and not muted
    if (recipientEmail) {
      const shouldSend = await shouldSendEmail(ctx.requestId, recipientUserId);
      if (shouldSend) {
        if (ctx.newStatus === "ACCEPTED") {
          await sendRequestAcceptedEmail({
            recipientEmail,
            recipientName,
            providerName: request.provider.name,
            engagementType,
            requestId: ctx.requestId,
          });
        } else if (ctx.newStatus === "DECLINED") {
          await sendRequestDeclinedEmail({
            recipientEmail,
            recipientName,
            providerName: request.provider.name,
            requestId: ctx.requestId,
          });
        } else if (ctx.newStatus === "COMPLETED") {
          const otherPartyName = isProviderChanging
            ? request.provider.name
            : request.familyProfile?.user?.name || "the family";

          await sendEngagementCompletedEmail({
            recipientEmail,
            recipientName,
            otherPartyName,
            engagementType,
            requestId: ctx.requestId,
            isProvider: !isProviderChanging,
          });
        }
      }
    }
  } catch (error) {
    console.error("[NotificationService] notifyRequestStatusChange error:", error);
  }
}

/**
 * Notify when a new message is sent
 */
export async function notifyNewMessage(ctx: NotificationContext & {
  senderId: string;
  messageContent: string;
}) {
  if (ctx.skipEmail) return;

  try {
    const request = await getRequestContext(ctx.requestId);
    if (!request) return;

    // Determine recipient (the other party)
    const isSenderProvider = ctx.senderId === request.provider.user?.id;

    let recipientUserId: string;
    let recipientEmail: string | undefined;
    let recipientName: string;
    let senderName: string;

    if (isSenderProvider) {
      recipientUserId = request.familyProfile?.user?.id || "";
      recipientEmail = request.familyProfile?.user?.email || undefined;
      recipientName = request.familyProfile?.user?.name || "there";
      senderName = request.provider.name;
    } else {
      recipientUserId = request.provider.user?.id || "";
      recipientEmail = request.provider.user?.email || undefined;
      recipientName = request.provider.user?.name || request.provider.name;
      senderName = request.sender.name || "A family member";
    }

    if (!recipientUserId) return;

    // Always create in-app notification
    await notifyNewMessageInApp({
      recipientUserId,
      senderName,
      requestId: ctx.requestId,
      messagePreview: ctx.messageContent,
      senderUserId: ctx.senderId,
    });

    // Send email if configured and not muted
    if (recipientEmail) {
      const shouldSend = await shouldSendEmail(ctx.requestId, recipientUserId);
      if (shouldSend) {
        await sendNewMessageEmail({
          recipientEmail,
          recipientName,
          senderName,
          messagePreview: ctx.messageContent,
          requestId: ctx.requestId,
          isProvider: !isSenderProvider,
        });
      }
    }
  } catch (error) {
    console.error("[NotificationService] notifyNewMessage error:", error);
  }
}

/**
 * Notify when a tour is proposed
 */
export async function notifyTourProposed(ctx: NotificationContext & {
  proposerId: string;
  proposedDate: string;
  proposedTime: string;
  notes?: string;
}) {
  if (ctx.skipEmail) return;

  try {
    const request = await getRequestContext(ctx.requestId);
    if (!request) return;

    // Notify the other party
    const isProposerProvider = ctx.proposerId === request.provider.user?.id;

    let recipientUserId: string;
    let recipientEmail: string | undefined;
    let recipientName: string;
    let proposerName: string;

    if (isProposerProvider) {
      recipientUserId = request.familyProfile?.user?.id || "";
      recipientEmail = request.familyProfile?.user?.email || undefined;
      recipientName = request.familyProfile?.user?.name || "there";
      proposerName = request.provider.name;
    } else {
      recipientUserId = request.provider.user?.id || "";
      recipientEmail = request.provider.user?.email || undefined;
      recipientName = request.provider.user?.name || request.provider.name;
      proposerName = request.sender.name || "A family member";
    }

    if (!recipientUserId) return;

    // Always create in-app notification
    await notifyTourProposedInApp({
      recipientUserId,
      proposerName,
      requestId: ctx.requestId,
      proposedDate: ctx.proposedDate,
      proposedTime: ctx.proposedTime,
      proposerUserId: ctx.proposerId,
    });

    // Send email if configured and not muted
    if (recipientEmail) {
      const shouldSend = await shouldSendEmail(ctx.requestId, recipientUserId);
      if (shouldSend) {
        const engagementType = formatEngagementType(
          getEngagementTypeForProvider(request.provider.providerType)
        );

        await sendTourProposedEmail({
          recipientEmail,
          recipientName,
          proposerName,
          engagementType,
          proposedDate: ctx.proposedDate,
          proposedTime: ctx.proposedTime,
          notes: ctx.notes,
          requestId: ctx.requestId,
          isProvider: !isProposerProvider,
        });
      }
    }
  } catch (error) {
    console.error("[NotificationService] notifyTourProposed error:", error);
  }
}

/**
 * Notify when a tour is accepted
 */
export async function notifyTourAccepted(ctx: NotificationContext & {
  acceptedByUserId: string;
  confirmedDate: string;
  confirmedTime: string;
}) {
  if (ctx.skipEmail) return;

  try {
    const request = await getRequestContext(ctx.requestId);
    if (!request) return;

    // Notify the proposer (who is not the one accepting)
    const isAccepterProvider = ctx.acceptedByUserId === request.provider.user?.id;

    // Get provider location for calendar
    const providerLocation = [
      request.provider.address,
      request.provider.city,
      request.provider.state,
    ].filter(Boolean).join(", ");

    const engagementType = formatEngagementType(
      getEngagementTypeForProvider(request.provider.providerType)
    );

    // Notify the proposer
    let proposerUserId: string;
    let proposerEmail: string | undefined;
    let proposerName: string;
    let accepterName: string;

    if (isAccepterProvider) {
      // Provider accepted, notify family (who proposed)
      proposerUserId = request.familyProfile?.user?.id || "";
      proposerEmail = request.familyProfile?.user?.email || undefined;
      proposerName = request.familyProfile?.user?.name || "there";
      accepterName = request.provider.name;
    } else {
      // Family accepted, notify provider (who proposed)
      proposerUserId = request.provider.user?.id || "";
      proposerEmail = request.provider.user?.email || undefined;
      proposerName = request.provider.user?.name || request.provider.name;
      accepterName = request.sender.name || "The family";
    }

    // Create in-app notification for proposer
    if (proposerUserId) {
      await notifyTourAcceptedInApp({
        recipientUserId: proposerUserId,
        accepterName,
        requestId: ctx.requestId,
        scheduledDate: ctx.confirmedDate,
        scheduledTime: ctx.confirmedTime,
        accepterUserId: ctx.acceptedByUserId,
      });
    }

    // Send email to proposer if configured and not muted
    if (proposerEmail && proposerUserId) {
      const shouldSend = await shouldSendEmail(ctx.requestId, proposerUserId);
      if (shouldSend) {
        await sendTourAcceptedEmail({
          recipientEmail: proposerEmail,
          recipientName: proposerName,
          otherPartyName: accepterName,
          engagementType,
          confirmedDate: ctx.confirmedDate,
          confirmedTime: ctx.confirmedTime,
          location: providerLocation || undefined,
          requestId: ctx.requestId,
          isProvider: !isAccepterProvider,
        });
      }
    }

    // Also notify the accepter (confirmation)
    let accepterUserId: string;
    let accepterEmail: string | undefined;

    if (isAccepterProvider) {
      accepterUserId = request.provider.user?.id || "";
      accepterEmail = request.provider.user?.email || undefined;
    } else {
      accepterUserId = request.familyProfile?.user?.id || "";
      accepterEmail = request.familyProfile?.user?.email || undefined;
    }

    // Create in-app notification for accepter (confirmation)
    if (accepterUserId) {
      await notifyTourAcceptedInApp({
        recipientUserId: accepterUserId,
        accepterName: proposerName,
        requestId: ctx.requestId,
        scheduledDate: ctx.confirmedDate,
        scheduledTime: ctx.confirmedTime,
        accepterUserId: proposerUserId,
      });
    }

    // Send email to accepter if configured and not muted
    if (accepterEmail && accepterUserId) {
      const shouldSend = await shouldSendEmail(ctx.requestId, accepterUserId);
      if (shouldSend) {
        await sendTourAcceptedEmail({
          recipientEmail: accepterEmail,
          recipientName: isAccepterProvider ? request.provider.name : (request.familyProfile?.user?.name || "there"),
          otherPartyName: proposerName,
          engagementType,
          confirmedDate: ctx.confirmedDate,
          confirmedTime: ctx.confirmedTime,
          location: providerLocation || undefined,
          requestId: ctx.requestId,
          isProvider: isAccepterProvider,
        });
      }
    }
  } catch (error) {
    console.error("[NotificationService] notifyTourAccepted error:", error);
  }
}
