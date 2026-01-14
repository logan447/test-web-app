/**
 * Loops Email Service
 * Handles all transactional emails for provider claim verification system
 */

const LOOPS_API_KEY = process.env.LOOPS_API_KEY;
const LOOPS_API_URL = 'https://app.loops.so/api/v1';

interface LoopsEmailData {
  email: string;
  [key: string]: any;
}

/**
 * Send a transactional email via Loops
 */
async function sendLoopsEmail(transactionalId: string, data: LoopsEmailData) {
  if (!LOOPS_API_KEY) {
    console.warn('⚠️ LOOPS_API_KEY not configured - email not sent');
    return { success: false, reason: 'API key not configured' };
  }

  try {
    const response = await fetch(`${LOOPS_API_URL}/transactional`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOOPS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionalId,
        email: data.email,
        dataVariables: data,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Loops API error:', error);
      return { success: false, reason: error };
    }

    const result = await response.json();
    console.log('✅ Email sent via Loops:', transactionalId, 'to:', data.email);
    return { success: true, result };
  } catch (error) {
    console.error('Failed to send Loops email:', error);
    return { success: false, reason: String(error) };
  }
}

/**
 * Email 1: Claim Auto-Approved
 * Sent when user's claim is automatically approved (high confidence)
 */
export async function sendClaimAutoApprovedEmail(data: {
  email: string;
  userName: string;
  providerName: string;
  providerUrl: string;
  score: number;
}) {
  return sendLoopsEmail('claim_auto_approved', {
    email: data.email,
    userName: data.userName,
    providerName: data.providerName,
    providerUrl: data.providerUrl,
    score: data.score,
    message: `Congratulations! Your claim to ${data.providerName} has been automatically verified and approved.`,
  });
}

/**
 * Email 2: Claim Pending Admin Review
 * Sent when user's claim requires manual review
 */
export async function sendClaimPendingReviewEmail(data: {
  email: string;
  userName: string;
  providerName: string;
  providerUrl: string;
  score: number;
  reviewTimeframe: string;
}) {
  return sendLoopsEmail('claim_pending_review', {
    email: data.email,
    userName: data.userName,
    providerName: data.providerName,
    providerUrl: data.providerUrl,
    score: data.score,
    reviewTimeframe: data.reviewTimeframe || '24 hours',
    message: `Thank you for claiming ${data.providerName}. Our team will review your claim within ${data.reviewTimeframe || '24 hours'}.`,
  });
}

/**
 * Email 3: Claim Approved by Admin
 * Sent when admin approves a pending claim
 */
export async function sendClaimApprovedEmail(data: {
  email: string;
  userName: string;
  providerName: string;
  providerUrl: string;
  adminNote?: string;
}) {
  return sendLoopsEmail('claim_approved', {
    email: data.email,
    userName: data.userName,
    providerName: data.providerName,
    providerUrl: data.providerUrl,
    adminNote: data.adminNote || '',
    message: `Great news! Your claim to ${data.providerName} has been approved by our team.`,
  });
}

/**
 * Email 4: Claim Rejected
 * Sent when admin rejects a claim
 */
export async function sendClaimRejectedEmail(data: {
  email: string;
  userName: string;
  providerName: string;
  reason?: string;
  supportEmail: string;
}) {
  return sendLoopsEmail('claim_rejected', {
    email: data.email,
    userName: data.userName,
    providerName: data.providerName,
    reason: data.reason || 'We were unable to verify your ownership of this profile.',
    supportEmail: data.supportEmail || 'support@olera.com',
    message: `Unfortunately, your claim to ${data.providerName} was not approved.`,
  });
}

/**
 * Email 5 (Optional): Engagement Trigger
 * Sent when a family contacts an unclaimed provider
 */
export async function sendEngagementTriggerEmail(data: {
  email: string;
  providerName: string;
  providerUrl: string;
  claimUrl: string;
  familyCount: number;
}) {
  return sendLoopsEmail('engagement_trigger', {
    email: data.email,
    providerName: data.providerName,
    providerUrl: data.providerUrl,
    claimUrl: data.claimUrl,
    familyCount: data.familyCount,
    message: `${data.familyCount} ${data.familyCount === 1 ? 'family has' : 'families have'} shown interest in ${data.providerName}.`,
  });
}
