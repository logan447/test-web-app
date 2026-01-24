import { Resend } from "resend";

// Initialize Resend client (will be null if API key is not configured)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const DEFAULT_FROM = process.env.EMAIL_FROM || "Olera <onboarding@resend.dev>";
const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

// Email types for consistent notification handling
export type EmailType =
  | "new_request"
  | "request_accepted"
  | "request_declined"
  | "new_message"
  | "tour_proposed"
  | "tour_accepted"
  | "tour_declined"
  | "engagement_completed";

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Helper to check if email is configured
export function isEmailConfigured(): boolean {
  return resend !== null;
}

// Send email with error handling
async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<EmailResult> {
  if (!resend) {
    console.log("[Email] Resend not configured, skipping email:", { to, subject });
    return { success: false, error: "Email service not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to,
      subject,
      html,
      text: text || stripHtml(html),
    });

    if (error) {
      console.error("[Email] Failed to send:", error);
      return { success: false, error: error.message };
    }

    console.log("[Email] Sent successfully:", { to, subject, messageId: data?.id });
    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[Email] Exception:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Strip HTML tags for plain text version
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// =============================================================================
// EMAIL TEMPLATE GENERATORS
// =============================================================================

// Base email wrapper with consistent styling
function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Olera</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Olera</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Senior Care Connections</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; text-align: center;">
                You received this email because you have an account on Olera.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                <a href="${APP_URL}/settings" style="color: #4F46E5; text-decoration: none;">Manage notification settings</a>
                &nbsp;&bull;&nbsp;
                <a href="${APP_URL}" style="color: #4F46E5; text-decoration: none;">Visit Olera</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// Primary action button style
function actionButton(text: string, url: string): string {
  return `
    <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: #ffffff; font-weight: 600; font-size: 16px; text-decoration: none; padding: 14px 32px; border-radius: 8px; margin-top: 24px;">
      ${text}
    </a>
  `;
}

// Secondary action button style
function secondaryButton(text: string, url: string): string {
  return `
    <a href="${url}" style="display: inline-block; background-color: #ffffff; color: #4F46E5; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 8px; border: 2px solid #4F46E5; margin-top: 16px;">
      ${text}
    </a>
  `;
}

// =============================================================================
// NOTIFICATION EMAIL FUNCTIONS
// =============================================================================

/**
 * Send notification for a new request/inquiry
 */
export async function sendNewRequestEmail({
  recipientEmail,
  recipientName,
  senderName,
  providerName,
  requestType,
  message,
  requestId,
}: {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  providerName?: string;
  requestType: "inquiry" | "outreach";
  message?: string;
  requestId: string;
}): Promise<EmailResult> {
  const isOutreach = requestType === "outreach";
  const subject = isOutreach
    ? `${senderName} has reached out to you on Olera`
    : `New inquiry from ${senderName}`;

  const viewUrl = isOutreach
    ? `${APP_URL}/requests/${requestId}`
    : `${APP_URL}/provider/requests/${requestId}`;

  const content = `
    <h2 style="margin: 0 0 16px; color: #111827; font-size: 22px; font-weight: 600;">
      ${isOutreach ? "You have a new connection request!" : "New inquiry received!"}
    </h2>
    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Hi ${recipientName},
    </p>
    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      ${isOutreach
        ? `<strong>${senderName}</strong> from <strong>${providerName || "a care provider"}</strong> has reached out to connect with you on Olera.`
        : `<strong>${senderName}</strong> is interested in learning more about your services.`}
    </p>
    ${message ? `
    <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Message</p>
      <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.5; font-style: italic;">"${message}"</p>
    </div>
    ` : ""}
    <div style="text-align: center;">
      ${actionButton("View Request", viewUrl)}
    </div>
    <p style="margin: 32px 0 0; color: #9ca3af; font-size: 13px; text-align: center;">
      Reply promptly to make a great first impression!
    </p>
  `;

  return sendEmail({
    to: recipientEmail,
    subject,
    html: emailWrapper(content),
  });
}

/**
 * Send notification when a request is accepted
 */
export async function sendRequestAcceptedEmail({
  recipientEmail,
  recipientName,
  providerName,
  engagementType,
  requestId,
}: {
  recipientEmail: string;
  recipientName: string;
  providerName: string;
  engagementType: string;
  requestId: string;
}): Promise<EmailResult> {
  const viewUrl = `${APP_URL}/requests/${requestId}`;

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background-color: #dcfce7; border-radius: 50%; padding: 16px; margin-bottom: 16px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22,4 12,14.01 9,11.01"></polyline>
        </svg>
      </div>
    </div>
    <h2 style="margin: 0 0 16px; color: #111827; font-size: 22px; font-weight: 600; text-align: center;">
      Great news! Your request was accepted
    </h2>
    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Hi ${recipientName},
    </p>
    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      <strong>${providerName}</strong> has accepted your ${engagementType.toLowerCase()} request! You can now:
    </p>
    <ul style="margin: 0 0 24px; padding-left: 24px; color: #4b5563; font-size: 15px; line-height: 1.8;">
      <li>View their contact information</li>
      <li>Send messages directly</li>
      <li>Schedule a ${engagementType.toLowerCase()}</li>
    </ul>
    <div style="text-align: center;">
      ${actionButton("Continue Conversation", viewUrl)}
    </div>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `${providerName} accepted your request on Olera`,
    html: emailWrapper(content),
  });
}

/**
 * Send notification when a request is declined
 */
export async function sendRequestDeclinedEmail({
  recipientEmail,
  recipientName,
  providerName,
  requestId,
}: {
  recipientEmail: string;
  recipientName: string;
  providerName: string;
  requestId: string;
}): Promise<EmailResult> {
  const browseUrl = `${APP_URL}/browse`;

  const content = `
    <h2 style="margin: 0 0 16px; color: #111827; font-size: 22px; font-weight: 600;">
      Update on your request
    </h2>
    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Hi ${recipientName},
    </p>
    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Unfortunately, <strong>${providerName}</strong> is unable to accept your request at this time. This could be due to capacity, location, or care needs.
    </p>
    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Don't worry - there are many other excellent providers on Olera who may be a great fit for your needs.
    </p>
    <div style="text-align: center;">
      ${actionButton("Browse Other Providers", browseUrl)}
    </div>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `Update on your Olera request`,
    html: emailWrapper(content),
  });
}

/**
 * Send notification for a new message
 */
export async function sendNewMessageEmail({
  recipientEmail,
  recipientName,
  senderName,
  messagePreview,
  requestId,
  isProvider,
}: {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  messagePreview: string;
  requestId: string;
  isProvider: boolean;
}): Promise<EmailResult> {
  const viewUrl = isProvider
    ? `${APP_URL}/provider/requests/${requestId}`
    : `${APP_URL}/requests/${requestId}`;

  // Truncate message preview
  const preview = messagePreview.length > 150
    ? messagePreview.substring(0, 147) + "..."
    : messagePreview;

  const content = `
    <h2 style="margin: 0 0 16px; color: #111827; font-size: 22px; font-weight: 600;">
      New message from ${senderName}
    </h2>
    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Hi ${recipientName},
    </p>
    <div style="background-color: #f3f4f6; border-left: 4px solid #4F46E5; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 24px 0;">
      <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; font-weight: 600;">${senderName} wrote:</p>
      <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.5;">"${preview}"</p>
    </div>
    <div style="text-align: center;">
      ${actionButton("Reply Now", viewUrl)}
    </div>
    <p style="margin: 32px 0 0; color: #9ca3af; font-size: 13px; text-align: center;">
      Tip: Quick responses lead to better connections!
    </p>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `New message from ${senderName} on Olera`,
    html: emailWrapper(content),
  });
}

/**
 * Send notification when a tour/consultation is proposed
 */
export async function sendTourProposedEmail({
  recipientEmail,
  recipientName,
  proposerName,
  engagementType,
  proposedDate,
  proposedTime,
  notes,
  requestId,
  isProvider,
}: {
  recipientEmail: string;
  recipientName: string;
  proposerName: string;
  engagementType: string;
  proposedDate: string;
  proposedTime: string;
  notes?: string;
  requestId: string;
  isProvider: boolean;
}): Promise<EmailResult> {
  const viewUrl = isProvider
    ? `${APP_URL}/provider/requests/${requestId}`
    : `${APP_URL}/requests/${requestId}`;

  const formattedDate = new Date(proposedDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background-color: #dbeafe; border-radius: 50%; padding: 16px; margin-bottom: 16px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </div>
    </div>
    <h2 style="margin: 0 0 16px; color: #111827; font-size: 22px; font-weight: 600; text-align: center;">
      ${engagementType} Invitation
    </h2>
    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Hi ${recipientName},
    </p>
    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      <strong>${proposerName}</strong> has proposed a ${engagementType.toLowerCase()}:
    </p>
    <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <span style="color: #4F46E5; font-size: 20px; margin-right: 12px;">📅</span>
        <span style="color: #111827; font-size: 16px; font-weight: 600;">${formattedDate}</span>
      </div>
      <div style="display: flex; align-items: center;">
        <span style="color: #4F46E5; font-size: 20px; margin-right: 12px;">🕐</span>
        <span style="color: #111827; font-size: 16px; font-weight: 600;">${proposedTime}</span>
      </div>
      ${notes ? `
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #6b7280; font-size: 14px; font-style: italic;">"${notes}"</p>
      </div>
      ` : ""}
    </div>
    <div style="text-align: center;">
      ${actionButton("Respond to Invitation", viewUrl)}
    </div>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `${proposerName} proposed a ${engagementType.toLowerCase()} on Olera`,
    html: emailWrapper(content),
  });
}

/**
 * Send notification when a tour/consultation is accepted
 */
export async function sendTourAcceptedEmail({
  recipientEmail,
  recipientName,
  otherPartyName,
  engagementType,
  confirmedDate,
  confirmedTime,
  location,
  requestId,
  isProvider,
}: {
  recipientEmail: string;
  recipientName: string;
  otherPartyName: string;
  engagementType: string;
  confirmedDate: string;
  confirmedTime: string;
  location?: string;
  requestId: string;
  isProvider: boolean;
}): Promise<EmailResult> {
  const viewUrl = isProvider
    ? `${APP_URL}/provider/requests/${requestId}`
    : `${APP_URL}/requests/${requestId}`;

  const formattedDate = new Date(confirmedDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; background-color: #dcfce7; border-radius: 50%; padding: 16px; margin-bottom: 16px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22,4 12,14.01 9,11.01"></polyline>
        </svg>
      </div>
    </div>
    <h2 style="margin: 0 0 16px; color: #111827; font-size: 22px; font-weight: 600; text-align: center;">
      ${engagementType} Confirmed!
    </h2>
    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Hi ${recipientName},
    </p>
    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Your ${engagementType.toLowerCase()} with <strong>${otherPartyName}</strong> has been confirmed!
    </p>
    <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #a7f3d0;">
      <div style="margin-bottom: 16px;">
        <p style="margin: 0 0 4px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Date & Time</p>
        <p style="margin: 0; color: #111827; font-size: 18px; font-weight: 600;">${formattedDate} at ${confirmedTime}</p>
      </div>
      ${location ? `
      <div>
        <p style="margin: 0 0 4px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Location</p>
        <p style="margin: 0; color: #111827; font-size: 16px;">${location}</p>
      </div>
      ` : ""}
    </div>
    <div style="text-align: center;">
      ${actionButton("View Details & Add to Calendar", viewUrl)}
    </div>
    <p style="margin: 32px 0 0; color: #9ca3af; font-size: 13px; text-align: center;">
      We look forward to helping you find the perfect care solution!
    </p>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `${engagementType} confirmed with ${otherPartyName} on Olera`,
    html: emailWrapper(content),
  });
}

/**
 * Send notification when engagement is completed
 */
export async function sendEngagementCompletedEmail({
  recipientEmail,
  recipientName,
  otherPartyName,
  engagementType,
  requestId,
  isProvider,
}: {
  recipientEmail: string;
  recipientName: string;
  otherPartyName: string;
  engagementType: string;
  requestId: string;
  isProvider: boolean;
}): Promise<EmailResult> {
  const viewUrl = isProvider
    ? `${APP_URL}/provider/requests/${requestId}`
    : `${APP_URL}/requests/${requestId}`;

  const reviewUrl = `${APP_URL}/providers`; // Would link to review page

  const content = `
    <h2 style="margin: 0 0 16px; color: #111827; font-size: 22px; font-weight: 600;">
      ${engagementType} Completed
    </h2>
    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Hi ${recipientName},
    </p>
    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Your ${engagementType.toLowerCase()} with <strong>${otherPartyName}</strong> has been marked as completed.
    </p>
    ${!isProvider ? `
    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      We hope it was a great experience! Consider leaving a review to help other families find quality care.
    </p>
    <div style="text-align: center;">
      ${actionButton("Leave a Review", reviewUrl)}
      <br/>
      ${secondaryButton("View Summary", viewUrl)}
    </div>
    ` : `
    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
      Thank you for connecting with families on Olera!
    </p>
    <div style="text-align: center;">
      ${actionButton("View Summary", viewUrl)}
    </div>
    `}
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `${engagementType} with ${otherPartyName} completed`,
    html: emailWrapper(content),
  });
}
