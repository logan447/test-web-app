# Loops Email Setup Guide

This guide explains how to set up transactional emails using Loops for the provider claim verification system.

## Overview

The system sends 4 critical email notifications:

1. **Claim Auto-Approved** - When a user's claim is instantly verified
2. **Claim Pending Review** - When a claim requires manual admin review
3. **Claim Approved** - When admin approves a pending claim
4. **Claim Rejected** - When admin rejects a claim

## Setup Instructions

### 1. Get Your Loops API Key

1. Log in to [Loops](https://app.loops.so)
2. Navigate to Settings → API
3. Copy your API key
4. Add it to your `.env` file:
   ```bash
   LOOPS_API_KEY="your_api_key_here"
   ```

### 2. Create Transactional Email Templates

You need to create 4 transactional email templates in Loops. For each template:

1. Go to **Transactional** in the Loops dashboard
2. Click **Create Transactional**
3. Use the template details below

---

## Email Template #1: Claim Auto-Approved

**Template ID:** `claim_auto_approved`

**Subject:** `🎉 Your claim to {{providerName}} has been approved!`

**Variables:**
- `userName` (string) - User's name
- `providerName` (string) - Provider organization name
- `providerUrl` (string) - Link to provider profile
- `score` (number) - Verification score
- `message` (string) - Success message

**Email Body Template:**
```
Hi {{userName}},

Great news! 🎉

{{message}}

Your claim has been automatically verified based on strong trust signals (verification score: {{score}}/100).

You can now:
✅ Manage your provider profile
✅ Respond to family inquiries
✅ Update your information and services

View your profile: {{providerUrl}}

Welcome to Olera!

---
Need help? Reply to this email or visit our support center.
```

---

## Email Template #2: Claim Pending Review

**Template ID:** `claim_pending_review`

**Subject:** `⏳ Your claim to {{providerName}} is under review`

**Variables:**
- `userName` (string) - User's name
- `providerName` (string) - Provider organization name
- `providerUrl` (string) - Link to provider profile
- `score` (number) - Verification score
- `reviewTimeframe` (string) - Expected review time
- `message` (string) - Info message

**Email Body Template:**
```
Hi {{userName}},

Thank you for claiming {{providerName}}!

{{message}}

**What happens next?**

Our team is reviewing your claim to verify ownership. This process typically takes {{reviewTimeframe}}.

You'll receive another email once your claim is approved or if we need additional information.

**Verification Score:** {{score}}/100

View your profile: {{providerUrl}}

---
Questions? Reply to this email and we'll be happy to help.
```

---

## Email Template #3: Claim Approved

**Template ID:** `claim_approved`

**Subject:** `✅ Your claim to {{providerName}} has been approved!`

**Variables:**
- `userName` (string) - User's name
- `providerName` (string) - Provider organization name
- `providerUrl` (string) - Link to provider profile
- `adminNote` (string, optional) - Note from admin reviewer
- `message` (string) - Approval message

**Email Body Template:**
```
Hi {{userName}},

Excellent news! 🎉

{{message}}

After reviewing your claim, our team has verified your ownership of {{providerName}}.

You now have full access to:
✅ Manage your provider profile
✅ Respond to family inquiries
✅ Update your services and availability
✅ View your profile analytics

{{#if adminNote}}
**Note from our team:**
{{adminNote}}
{{/if}}

Get started: {{providerUrl}}

Welcome to Olera!

---
Need help getting started? Reply to this email or visit our support center.
```

---

## Email Template #4: Claim Rejected

**Template ID:** `claim_rejected`

**Subject:** `❌ Update on your claim to {{providerName}}`

**Variables:**
- `userName` (string) - User's name
- `providerName` (string) - Provider organization name
- `reason` (string) - Rejection reason
- `supportEmail` (string) - Support contact email
- `message` (string) - Rejection message

**Email Body Template:**
```
Hi {{userName}},

{{message}}

**Reason:**
{{reason}}

We understand this may be disappointing. If you believe this was an error or have additional verification information, please contact our support team.

**Next steps:**

1. **Review the reason** - Understand why the claim wasn't approved
2. **Gather verification documents** - Prepare proof of ownership (business license, domain ownership, etc.)
3. **Contact support** - Email us at {{supportEmail}} with your verification materials

We're here to help verify legitimate providers and ensure the accuracy of our platform.

---
Questions? Contact us at {{supportEmail}}
```

---

## Testing Your Email Setup

### Test in Development

1. Set your `LOOPS_API_KEY` in `.env`
2. Submit a test claim
3. Check the console for email sending logs:
   ```
   ✅ Email sent via Loops: claim_auto_approved to: user@example.com
   ```

### Test Without Loops API Key

If `LOOPS_API_KEY` is not set, the system will:
- Log a warning: `⚠️ LOOPS_API_KEY not configured - email not sent`
- Continue functioning normally (emails are non-blocking)

### Verify Email Delivery

1. Go to **Loops Dashboard → Transactional → Logs**
2. Check for recent email sends
3. Verify delivery status

---

## Email Triggers

| Event | Email Template | Triggered By |
|-------|----------------|--------------|
| Claim submitted (auto-approved) | `claim_auto_approved` | `/api/providers/claim` |
| Claim submitted (pending) | `claim_pending_review` | `/api/providers/claim` |
| Admin approves claim | `claim_approved` | `/api/admin/claims/review` |
| Admin rejects claim | `claim_rejected` | `/api/admin/claims/review` |

---

## Code Implementation

All email functions are located in `/lib/loops-email.ts`:

```typescript
// Import email functions
import {
  sendClaimAutoApprovedEmail,
  sendClaimPendingReviewEmail,
  sendClaimApprovedEmail,
  sendClaimRejectedEmail,
} from '@/lib/loops-email';

// Example: Send auto-approved email
await sendClaimAutoApprovedEmail({
  email: 'user@example.com',
  userName: 'John Smith',
  providerName: 'ABC Senior Care',
  providerUrl: 'https://yoursite.com/providers/123',
  score: 85,
});
```

---

## Troubleshooting

### Email not sending?

1. **Check API key** - Ensure `LOOPS_API_KEY` is set in `.env`
2. **Check Loops dashboard** - Verify transactional emails are created
3. **Check template IDs** - Ensure IDs match exactly (`claim_auto_approved`, etc.)
4. **Check console logs** - Look for error messages

### Common Issues

**Issue:** "Transactional email not found"
**Fix:** Create the template in Loops with exact ID name

**Issue:** "Authorization failed"
**Fix:** Verify your API key is correct

**Issue:** Email variables not rendering
**Fix:** Ensure all variables are defined in the Loops template

---

## Production Deployment

### Environment Variables

Add to your production environment (Vercel, etc.):

```bash
LOOPS_API_KEY="your_production_api_key"
NEXTAUTH_URL="https://yourdomain.com"
```

### Verification Checklist

- [ ] All 4 transactional templates created in Loops
- [ ] Template IDs match exactly
- [ ] All variables configured in each template
- [ ] API key added to production environment
- [ ] Test email sent in production
- [ ] Email logs verified in Loops dashboard

---

## Additional Notes

- **Non-blocking:** Emails are sent asynchronously and don't block the API response
- **Graceful failure:** If email fails, the claim/review still succeeds
- **Logging:** All email events are logged to console for debugging
- **Privacy:** User emails are only sent to Loops for transactional purposes

---

## Support

- **Loops Documentation:** https://loops.so/docs
- **Loops Support:** https://loops.so/support
- **This Project:** Contact your development team

---

**Status:** ✅ Email system ready to deploy once Loops templates are created
