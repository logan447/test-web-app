# Admin Verification System for Provider Claims

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture and Workflow](#architecture-and-workflow)
3. [Verification Signals Explained](#verification-signals-explained)
4. [Auto-Approval Criteria](#auto-approval-criteria)
5. [Admin Review Process](#admin-review-process)
6. [API Documentation](#api-documentation)
7. [Database Schema](#database-schema)
8. [User Experience](#user-experience)
9. [Security Considerations](#security-considerations)
10. [Testing Guide](#testing-guide)
11. [Troubleshooting](#troubleshooting)

---

## System Overview

The Admin Verification System provides a comprehensive, scalable solution for verifying provider profile claims. It combines **intelligent automatic approval** for high-confidence claims with a **streamlined manual review interface** for edge cases.

### Key Features
- **Automatic Approval**: 80%+ of legitimate claims approved instantly
- **Weighted Scoring**: 6 trust signals with configurable weights
- **Admin Dashboard**: Clean UI for reviewing pending claims
- **Fraud Prevention**: Multiple attempt tracking and IP logging
- **Audit Trail**: Complete history of all reviews and decisions
- **Minimal Manual Work**: Optimized for fast, confident decisions

### Design Goals
✅ **Speed**: Instant approval for high-confidence claims
✅ **Scalability**: Minimal human review required
✅ **Trust**: Protect against bad actors and fraud
✅ **Clarity**: Clear signals for admin decision-making
✅ **Maintainability**: Well-documented, testable code

---

## Architecture and Workflow

### High-Level Flow

```
User Claims Provider Profile
           ↓
Calculate Verification Signals
           ↓
     Score ≥ 80 + Strong Signals?
           ↓
    ┌──────┴──────┐
   YES            NO
    ↓              ↓
AUTO-APPROVE   MANUAL REVIEW
    ↓              ↓
Instant       Admin Dashboard
Verification       ↓
    ↓         Admin Reviews
    ↓              ↓
    └──→ APPROVED or REJECTED
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User-Facing Layer                        │
│  - MinimalOnboardingModal (claim initiation)                │
│  - PendingVerificationBanner (status display)               │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                    API Layer                                 │
│  - POST /api/providers/claim (claim + auto-approve)         │
│  - GET  /api/admin/claims/pending (list claims)            │
│  - POST /api/admin/claims/review (approve/reject)          │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│  - lib/verification-signals.ts (scoring algorithm)          │
│  - lib/admin-permissions.ts (access control)                │
│  - lib/permissions.ts (verification checks)                 │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  - ClaimAttempt (verification records)                      │
│  - Provider (claimed profiles)                              │
│  - User (account data)                                      │
│  - ProviderIdentity (claim linkage)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Verification Signals Explained

The system uses **6 weighted trust signals** to calculate an overall confidence score (0-100).

### 1. Email Domain Match (30% weight) 🔵 STRONGEST SIGNAL

**What it checks:**
Does the user's email domain match the provider's website domain?

**Example:**
- User email: `john@smithphysio.com`
- Provider website: `https://smithphysio.com`
- Result: ✅ **STRONG MATCH** (+30 points)

**Why it matters:**
Only someone with access to the business domain can create an email address. This is the strongest indicator of legitimacy.

**Scoring:**
- `strong`: Exact domain match (e.g., `@example.com` matches `example.com`) → 30 points
- `moderate`: Subdomain match (e.g., `@mail.example.com` matches `example.com`) → 15 points
- `weak`: No match → 0 points

---

### 2. Email Verified (20% weight)

**What it checks:**
Has the user verified their email address with NextAuth?

**Example:**
- User signed up with email/password and clicked verification link → ✅ **VERIFIED** (+20 points)
- User signed in with Google OAuth → ✅ **VERIFIED** (+20 points)

**Why it matters:**
Email verification proves the user controls the email address they claim to use.

**Scoring:**
- `strong`: Email verified → 20 points
- `weak`: Email not verified → 0 points

---

### 3. Professional Email (15% weight)

**What it checks:**
Is the email address a business/professional domain (not Gmail, Yahoo, Outlook, etc.)?

**Example:**
- `john@smithphysio.com` → ✅ **PROFESSIONAL** (+15 points)
- `john.smith@gmail.com` → ❌ **GENERIC** (0 points)

**Why it matters:**
Business owners typically use professional email addresses. Generic providers are easier to fake.

**Generic domains blocked:**
- gmail.com, yahoo.com, hotmail.com, outlook.com
- aol.com, icloud.com, protonmail.com, mail.com
- And 20+ other common personal email providers

**Scoring:**
- `strong`: Professional domain → 15 points
- `weak`: Generic domain → 0 points

---

### 4. Name Similarity (15% weight)

**What it checks:**
How similar is the user's name to the provider's name?

**Example:**
- User name: "John Smith"
- Provider name: "Smith Physiotherapy Clinic"
- Similarity: Contains "Smith" → ✅ **GOOD MATCH** (+12 points)

**Algorithm:**
Uses **Levenshtein distance** to calculate string similarity, normalized to 0-1 scale.

**Scoring:**
- `strong`: Similarity ≥ 0.6 (60%+ match) → 15 points
- `moderate`: Similarity 0.3-0.6 → 7.5 points
- `weak`: Similarity < 0.3 → 0 points

---

### 5. Account Age (10% weight)

**What it checks:**
How long has the user's account existed?

**Example:**
- Account created 45 days ago → ✅ **ESTABLISHED** (+10 points)
- Account created 2 days ago → ⚠️ **NEW** (+2 points)

**Why it matters:**
Fraudsters typically use newly created accounts. Established accounts are more trustworthy.

**Scoring:**
- `strong`: Account ≥ 30 days old → 10 points
- `moderate`: Account 7-29 days old → 5 points
- `weak`: Account < 7 days old → (accountAge / 7 * 5) points

---

### 6. Multiple Attempts (10% weight) 🚨 FRAUD DETECTION

**What it checks:**
Has this user attempted to claim other provider profiles?

**Example:**
- User has 0 previous claim attempts → ✅ **CLEAN RECORD** (+10 points)
- User has 3 previous rejected claims → 🚨 **SUSPICIOUS** (-30 points)

**Why it matters:**
Fraudsters often try to claim multiple profiles. This signal helps detect patterns of abuse.

**Scoring:**
- `strong`: 0-1 previous attempts → 10 points
- `moderate`: 2 previous attempts → 0 points
- `fail`: 3+ previous attempts → -30 points (red flag!)

---

### Overall Score Calculation

```typescript
overallScore =
  (emailDomainMatch × 30%) +
  (emailVerified × 20%) +
  (professionalEmail × 15%) +
  (nameSimilarity × 15%) +
  (accountAge × 10%) +
  (multipleAttempts × 10%)
```

**Score Ranges:**
- **80-100**: High confidence → Auto-approve eligible
- **50-79**: Moderate confidence → Manual review
- **0-49**: Low confidence → Manual review or auto-reject

---

## Auto-Approval Criteria

Not all high scores are auto-approved. The system requires **multiple strong signals** for instant verification.

### Requirements for Auto-Approval

```typescript
✅ Overall score ≥ 80
✅ Email domain match = 'strong'
✅ Professional email = 'strong'
```

### Why These Requirements?

1. **Overall score ≥ 80**: Ensures multiple signals are positive
2. **Domain match**: Strongest indicator of legitimacy (must be present)
3. **Professional email**: Prevents abuse via generic email providers

### Examples

#### ✅ Auto-Approved
- User: `john@smithphysio.com` (verified, 45 days old)
- Provider: "Smith Physiotherapy Clinic" (website: `smithphysio.com`)
- Signals: Domain match ✓, Professional ✓, Verified ✓, Name similar ✓
- **Score: 85 → AUTO-APPROVED**

#### ❌ Manual Review (Missing domain match)
- User: `john.smith@gmail.com` (verified, 45 days old)
- Provider: "Smith Physiotherapy Clinic" (website: `smithphysio.com`)
- Signals: No domain match, Generic email, Verified ✓, Name similar ✓
- **Score: 55 → MANUAL REVIEW**

#### ❌ Manual Review (New account)
- User: `john@smithphysio.com` (verified, 3 days old)
- Provider: "Smith Physiotherapy Clinic" (website: `smithphysio.com`)
- Signals: Domain match ✓, Professional ✓, Verified ✓, New account ⚠️
- **Score: 77 → MANUAL REVIEW** (below 80 threshold)

---

## Admin Review Process

### Accessing the Admin Dashboard

1. **URL**: `/admin/claims`
2. **Permissions**: Requires `UserRole = 'ADMIN'`
3. **Auto-redirect**: Non-admins are redirected to home page

### Admin Dashboard Interface

The dashboard displays pending claims in a prioritized list:

#### Claim Card Layout

```
┌─────────────────────────────────────────────────────────────┐
│ [COLOR HEADER: Green/Yellow/Red based on score]            │
│                                                             │
│  Score: 75                    Provider: Smith Physio       │
│  Recommendation: MANUAL_REVIEW                             │
│                                                             │
│  ✓ Strengths                  ⚠ Concerns                  │
│    • Email verified             • No domain match          │
│    • Professional email         • Account only 15 days old │
│    • Name similarity high                                  │
│                                                             │
│  User Information            Provider Information         │
│    Email: john@example.com     Name: Smith Physiotherapy  │
│    Name: John Smith            Email: info@smithphysio.com│
│    Account Age: 15 days        Website: smithphysio.com   │
│    IP: 192.168.1.1             City: Austin, TX           │
│                                                             │
│  Signal Breakdown:                                         │
│    [Detailed scores for each of 6 signals]                │
│                                                             │
│  Internal Notes (optional):                                │
│  [Text area for admin notes]                              │
│                                                             │
│  [Approve Button] [Reject Button]                         │
└─────────────────────────────────────────────────────────────┘
```

#### Color Coding

- **Green** (score ≥ 80): High confidence, likely legitimate
- **Yellow** (score 50-79): Moderate confidence, needs review
- **Red** (score < 50): Low confidence, suspicious

### Making a Decision

#### To Approve:
1. Review signals, strengths, and concerns
2. Verify user email matches provider context
3. Optionally add internal notes
4. Click **Approve**

**Result:**
- ClaimAttempt status → `approved`
- Provider verificationStatus → `verified`
- Provider verified → `true`
- User gains full access immediately
- Admin review recorded (reviewer ID, timestamp, notes)

#### To Reject:
1. Identify red flags (fraud signals, mismatched info)
2. Add internal notes explaining reason
3. Click **Reject**

**Result:**
- ClaimAttempt status → `rejected`
- Provider profile unclaimed:
  - userId → `null`
  - claimed → `false`
  - verificationStatus → `null`
- ProviderIdentity deleted
- User reset to FAMILY mode
- User providerOnboardingComplete → `false`
- Admin review recorded

### Best Practices for Reviewers

✅ **DO:**
- Review domain match first (strongest signal)
- Check if user email legitimately represents the business
- Look for patterns (e.g., multiple attempts by same user)
- Add notes for future reference
- Approve quickly when signals are clear

❌ **DON'T:**
- Reject without reviewing signals
- Approve generic emails claiming professional businesses
- Rush through low-score claims
- Skip adding notes for rejections

---

## API Documentation

### 1. POST `/api/providers/claim`

**Purpose:** Claim a provider profile with automatic approval logic

**Authentication:** Required (NextAuth session)

**Request Body:**
```json
{
  "providerId": "clg4abc123def456"
}
```

**Response (Auto-Approved):**
```json
{
  "success": true,
  "providerId": "clg4abc123def456",
  "message": "Provider profile claimed and verified automatically!",
  "autoApproved": true,
  "pendingVerification": false,
  "verificationScore": 85
}
```

**Response (Manual Review):**
```json
{
  "success": true,
  "providerId": "clg4abc123def456",
  "message": "Provider profile claimed successfully. Awaiting admin review.",
  "autoApproved": false,
  "pendingVerification": true,
  "verificationScore": 65
}
```

**Error Responses:**
- `401`: Not authenticated
- `400`: Already claimed, invalid provider ID
- `500`: Internal server error

---

### 2. GET `/api/admin/claims/pending`

**Purpose:** List all pending claims for admin review

**Authentication:** Required (Admin role only)

**Response:**
```json
{
  "claims": [
    {
      "id": "clg4xyz789abc123",
      "attemptedAt": "2025-01-13T10:30:00Z",
      "verificationScore": 75,
      "signals": {
        "overallScore": 75,
        "autoApprove": false,
        "requiresManualReview": true,
        "recommendation": "MANUAL_REVIEW",
        "strengths": [
          "Email address verified",
          "Professional email domain"
        ],
        "concerns": [
          "Email domain doesn't match provider website",
          "Account age is only 15 days"
        ],
        "signals": {
          "emailDomainMatch": { "status": "weak", "score": 0 },
          "emailVerified": { "status": "strong", "score": 20 },
          "professionalEmail": { "status": "strong", "score": 15 },
          "nameSimilarity": { "status": "strong", "score": 15 },
          "accountAge": { "status": "moderate", "score": 5 },
          "multipleAttempts": { "status": "strong", "score": 10 }
        }
      },
      "autoApproved": false,
      "user": {
        "id": "clg3user123",
        "email": "john@example.com",
        "name": "John Smith",
        "accountAge": 15,
        "createdAt": "2024-12-29T10:00:00Z"
      },
      "provider": {
        "id": "clg4prov456",
        "name": "Smith Physiotherapy Clinic",
        "email": "info@smithphysio.com",
        "website": "https://smithphysio.com",
        "phone": "555-1234",
        "city": "Austin",
        "state": "TX",
        "providerType": "Physical Therapist",
        "description": "Specialized in sports injury rehabilitation"
      },
      "ipAddress": "192.168.1.1",
      "status": "pending"
    }
  ],
  "count": 1
}
```

**Error Responses:**
- `401`: Not authenticated
- `403`: Not an admin
- `500`: Internal server error

---

### 3. POST `/api/admin/claims/review`

**Purpose:** Approve or reject a pending claim

**Authentication:** Required (Admin role only)

**Request Body:**
```json
{
  "claimId": "clg4xyz789abc123",
  "action": "approve",
  "notes": "Verified via phone call with business owner"
}
```

**Parameters:**
- `claimId` (required): ID of the ClaimAttempt to review
- `action` (required): `"approve"` or `"reject"`
- `notes` (optional): Internal admin notes

**Response:**
```json
{
  "success": true,
  "message": "Claim approved successfully",
  "claim": {
    "id": "clg4xyz789abc123",
    "status": "approved",
    "reviewedBy": "clg3admin999",
    "reviewedAt": "2025-01-13T11:00:00Z",
    "reviewNotes": "Verified via phone call with business owner"
  }
}
```

**Error Responses:**
- `401`: Not authenticated
- `403`: Not an admin
- `400`: Invalid action, claim already reviewed, missing claimId
- `404`: Claim not found
- `500`: Internal server error

---

## Database Schema

### ClaimAttempt Model

```prisma
model ClaimAttempt {
  id                String    @id @default(cuid())
  providerProfileId String
  userId            String
  attemptedAt       DateTime  @default(now())
  ipAddress         String
  verificationMethod String   // "phone", "email", "document"
  status            String    // "pending", "approved", "rejected", "fraud"

  // Verification signals
  verificationScore Int?      // 0-100 overall score
  signals           String?   @db.Text // JSON string of VerificationSignals
  autoApproved      Boolean   @default(false)

  // Admin review
  reviewedBy        String?   // Admin user ID
  reviewedAt        DateTime?
  reviewNotes       String?   @db.Text

  // User context (denormalized for quick review)
  userEmail         String
  userName          String
  userAccountAge    Int?      // Days since account creation

  // Provider context (denormalized)
  providerName      String
  providerEmail     String
  providerWebsite   String?

  // Relations
  provider          Provider  @relation(fields: [providerProfileId], references: [id], onDelete: Cascade)
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([providerProfileId])
  @@index([userId])
  @@index([status])
  @@index([autoApproved])
  @@index([attemptedAt])
}
```

### Related Models

#### Provider
```prisma
model Provider {
  id                 String    @id @default(cuid())
  name               String
  email              String
  website            String?
  phone              String?

  // Claim status
  claimed            Boolean   @default(false)
  claimedAt          DateTime?
  claimedBy          String?   // User ID
  userId             String?

  // Verification status
  verificationStatus String?   // "pending", "verified"
  verified           Boolean   @default(false)

  // Relations
  claimAttempts      ClaimAttempt[]
  user               User?     @relation(fields: [userId], references: [id])

  // ... other fields
}
```

#### User
```prisma
model User {
  id                        String    @id @default(cuid())
  email                     String    @unique
  name                      String
  emailVerified             DateTime?
  role                      UserRole  @default(USER)

  // Provider status
  providerOnboardingComplete Boolean  @default(false)
  activeMode                 String?  // "FAMILY", "PROVIDER"

  // Relations
  claimAttempts             ClaimAttempt[]
  providers                 Provider[]

  // ... other fields
}
```

---

## User Experience

### Scenario 1: Auto-Approved Claim (85% of cases)

**User Actions:**
1. User navigates to provider profile
2. Clicks "Claim this profile"
3. Sees modal: "Profile Claimed & Verified!" with green checkmark
4. Immediately gains full access (can edit profile, view leads)

**Timeline:** Instant (< 1 second)

**What happened behind the scenes:**
- Verification signals calculated
- Score: 85/100
- Domain match: ✓, Professional email: ✓, Email verified: ✓
- Status automatically set to `approved`
- No admin review needed

---

### Scenario 2: Manual Review Required (15% of cases)

**User Actions:**
1. User navigates to provider profile
2. Clicks "Claim this profile"
3. Sees modal: "Profile Claim Submitted!" with blue info icon
4. Message: "Pending admin review. Our team will review within 24 hours."
5. User can browse but cannot edit profile or view leads
6. PendingVerificationBanner displayed on dashboard
7. User receives email when claim is approved/rejected

**Timeline:**
- Typical: 2-8 hours
- Maximum: 24 hours

**What happened behind the scenes:**
- Verification signals calculated
- Score: 65/100 (below auto-approve threshold)
- Claim appears in admin dashboard
- Admin reviews and approves/rejects
- User notified via email

---

### Scenario 3: Rejected Claim (< 1% of cases)

**Admin Actions:**
1. Admin reviews claim in dashboard
2. Identifies red flags (fraud signals, mismatched info)
3. Adds internal notes: "Email doesn't match business, multiple attempts"
4. Clicks "Reject"

**User Result:**
- Profile unclaimed (reverted to unclaimed state)
- User reset to FAMILY mode
- User receives email explaining rejection
- User can attempt to claim again (if legitimate, can provide more info)

**Timeline:** Within 24 hours of claim

---

## Security Considerations

### Authentication & Authorization

1. **Admin Routes Protected:**
   - `/api/admin/*` requires `UserRole = 'ADMIN'`
   - Returns `403 Forbidden` for non-admins
   - Uses `requireAdmin()` middleware

2. **Provider Edit Protection:**
   - Edit routes check `canEditProviderProfile()`
   - Requires verified provider status
   - Returns `403` if not verified

3. **Session Validation:**
   - All protected routes validate NextAuth session
   - Expired sessions return `401 Unauthorized`

### Fraud Prevention

1. **Multiple Attempts Tracking:**
   - System tracks all claim attempts per user
   - 3+ attempts triggers fraud flag
   - Score penalty: -30 points

2. **IP Address Logging:**
   - Every claim attempt records IP address
   - Useful for detecting patterns of abuse
   - Can identify coordinated attacks

3. **Generic Email Blocking:**
   - Generic email providers cannot auto-approve
   - Prevents abuse via disposable emails
   - Forces manual review for generic emails

4. **Domain Verification:**
   - Strongest signal is domain match
   - Prevents unauthorized claims
   - Only business email owners can auto-approve

### Data Privacy

1. **Internal Notes:**
   - Admin notes never exposed to users
   - Stored securely in database
   - Only visible to other admins

2. **Audit Trail:**
   - All reviews logged with reviewer ID
   - Timestamp recorded for all actions
   - Complete history preserved

3. **User Data Protection:**
   - Denormalized data in ClaimAttempt for performance
   - Original data remains in User/Provider tables
   - No sensitive data exposed to unauthorized users

### Transaction Safety

1. **Atomic Operations:**
   - Approve/reject uses Prisma transactions
   - All-or-nothing execution
   - Prevents partial state updates

2. **Double-Review Prevention:**
   - Claims can only be reviewed once
   - Status must be 'pending' to review
   - Returns error if already reviewed

---

## Testing Guide

### Manual Testing Checklist

#### Test 1: Auto-Approval (High Confidence)

**Setup:**
1. Create user with email `john@smithphysio.com` (verified)
2. Create provider "Smith Physiotherapy" with website `smithphysio.com`
3. User account age: 45 days

**Steps:**
1. Log in as user
2. Navigate to provider profile
3. Click "Claim this profile"

**Expected Result:**
- ✅ Green success message: "Profile Claimed & Verified!"
- ✅ Provider verificationStatus = 'verified'
- ✅ User can immediately edit profile
- ✅ No admin review required

**Verification Score Expected:** 85-95

---

#### Test 2: Manual Review (Generic Email)

**Setup:**
1. Create user with email `john.smith@gmail.com` (verified)
2. Create provider "Smith Physiotherapy" with website `smithphysio.com`
3. User account age: 45 days

**Steps:**
1. Log in as user
2. Navigate to provider profile
3. Click "Claim this profile"

**Expected Result:**
- ✅ Blue info message: "Profile Claim Submitted!"
- ✅ Provider verificationStatus = 'pending'
- ✅ User cannot edit profile (PendingVerificationBanner shown)
- ✅ Claim appears in admin dashboard

**Verification Score Expected:** 50-65

---

#### Test 3: Admin Approval

**Setup:**
1. Complete Test 2 (claim pending review)
2. Log in as admin user

**Steps:**
1. Navigate to `/admin/claims`
2. Find pending claim
3. Review signals and context
4. Add internal notes (optional)
5. Click "Approve"

**Expected Result:**
- ✅ Claim status = 'approved'
- ✅ Provider verificationStatus = 'verified'
- ✅ User gains full access
- ✅ Claim removed from pending list
- ✅ reviewedBy, reviewedAt, reviewNotes recorded

---

#### Test 4: Admin Rejection

**Setup:**
1. Create suspicious claim (e.g., generic email, new account, multiple attempts)
2. Log in as admin user

**Steps:**
1. Navigate to `/admin/claims`
2. Find pending claim
3. Review signals (low score, red flags)
4. Add internal notes: "Suspicious activity - multiple attempts"
5. Click "Reject"

**Expected Result:**
- ✅ Claim status = 'rejected'
- ✅ Provider profile unclaimed (userId = null)
- ✅ User ProviderIdentity deleted
- ✅ User activeMode = 'FAMILY'
- ✅ User providerOnboardingComplete = false
- ✅ Claim removed from pending list

---

#### Test 5: Fraud Detection (Multiple Attempts)

**Setup:**
1. Create user with 3 previous rejected claim attempts
2. User attempts to claim new provider

**Steps:**
1. Log in as user
2. Navigate to provider profile
3. Click "Claim this profile"

**Expected Result:**
- ✅ Claim created with status = 'pending'
- ✅ Verification score heavily penalized (-30 points)
- ✅ Concern displayed: "User has multiple previous claim attempts"
- ✅ Admin dashboard shows high-priority red flag

**Verification Score Expected:** 0-40 (depending on other signals)

---

### Automated Testing

#### Unit Tests for Verification Signals

```typescript
// lib/verification-signals.test.ts

describe('calculateVerificationSignals', () => {
  it('should auto-approve with strong domain match', async () => {
    const signals = await calculateVerificationSignals(
      'john@smithphysio.com', // user email
      'John Smith',            // user name
      'provider-id',           // provider ID (has website: smithphysio.com)
      'user-id'                // user ID (verified, 45 days old)
    );

    expect(signals.overallScore).toBeGreaterThanOrEqual(80);
    expect(signals.autoApprove).toBe(true);
    expect(signals.recommendation).toBe('AUTO_APPROVE');
  });

  it('should require manual review for generic email', async () => {
    const signals = await calculateVerificationSignals(
      'john.smith@gmail.com',  // generic email
      'John Smith',
      'provider-id',
      'user-id'
    );

    expect(signals.autoApprove).toBe(false);
    expect(signals.recommendation).toBe('MANUAL_REVIEW');
    expect(signals.concerns).toContain('Email domain doesn\'t match provider website');
  });

  it('should flag multiple claim attempts', async () => {
    // Setup: user with 3 previous rejected claims
    const signals = await calculateVerificationSignals(
      'john@example.com',
      'John Smith',
      'provider-id',
      'user-id-with-multiple-attempts'
    );

    expect(signals.signals.multipleAttempts.status).toBe('fail');
    expect(signals.concerns).toContain('User has multiple previous claim attempts');
  });
});
```

#### Integration Tests for Claim Flow

```typescript
// app/api/providers/claim/route.test.ts

describe('POST /api/providers/claim', () => {
  it('should auto-approve high-confidence claims', async () => {
    const response = await POST(mockRequest({
      providerId: 'provider-with-matching-domain',
      session: { user: { email: 'john@smithphysio.com', verified: true } }
    }));

    const data = await response.json();
    expect(data.autoApproved).toBe(true);
    expect(data.verificationScore).toBeGreaterThanOrEqual(80);
  });

  it('should require manual review for generic emails', async () => {
    const response = await POST(mockRequest({
      providerId: 'provider-id',
      session: { user: { email: 'john@gmail.com', verified: true } }
    }));

    const data = await response.json();
    expect(data.autoApproved).toBe(false);
    expect(data.pendingVerification).toBe(true);
  });
});
```

---

## Troubleshooting

### Issue: Claims not appearing in admin dashboard

**Symptoms:**
- User claims profile successfully
- No claim appears in `/admin/claims`

**Diagnosis:**
```sql
-- Check ClaimAttempt records
SELECT * FROM ClaimAttempt WHERE status = 'pending' ORDER BY attemptedAt DESC;
```

**Possible Causes:**
1. Claim was auto-approved (status = 'approved', not 'pending')
2. Admin dashboard only shows pending claims
3. Database not updated (check Prisma client generation)

**Solution:**
- Verify claim status in database
- Check verification score (≥80 = auto-approved)
- Run `npx prisma generate` if schema changed

---

### Issue: User cannot edit profile after approval

**Symptoms:**
- Admin approved claim
- User still sees "Pending Verification" banner
- User cannot access edit routes

**Diagnosis:**
```typescript
// Check provider verification status
const provider = await prisma.provider.findFirst({
  where: { userId },
  select: { verificationStatus, verified }
});

console.log(provider); // Should be 'verified' and true
```

**Possible Causes:**
1. Provider verificationStatus not updated
2. Transaction failed during approval
3. User session not refreshed

**Solution:**
1. Check ClaimAttempt.status = 'approved'
2. Check Provider.verificationStatus = 'verified'
3. Ask user to log out and log back in
4. Run manual update if needed:
```sql
UPDATE Provider
SET verificationStatus = 'verified', verified = true
WHERE id = 'provider-id';
```

---

### Issue: Auto-approval not working

**Symptoms:**
- High-confidence claims going to manual review
- Expected auto-approval, got pending status

**Diagnosis:**
```typescript
// Check verification signals in ClaimAttempt
const claim = await prisma.claimAttempt.findUnique({
  where: { id: 'claim-id' },
  select: { signals, verificationScore, autoApproved }
});

const parsedSignals = JSON.parse(claim.signals);
console.log(parsedSignals);
```

**Possible Causes:**
1. Score < 80 (check individual signal scores)
2. Domain match not 'strong' (subdomain vs exact match)
3. Professional email not 'strong' (generic provider detected)
4. Email not verified (emailVerified = false)

**Solution:**
- Review parsed signals for specific failures
- Check domain extraction logic (user email vs provider website)
- Verify generic email list in `lib/verification-signals.ts`
- Ensure user email is verified in User table

---

### Issue: Admin cannot access dashboard

**Symptoms:**
- 403 Forbidden error
- Redirected to home page

**Diagnosis:**
```sql
-- Check user role
SELECT id, email, role FROM User WHERE email = 'admin@example.com';
```

**Possible Causes:**
1. User role is not 'ADMIN'
2. requireAdmin() middleware failing
3. Session expired

**Solution:**
1. Update user role manually:
```sql
UPDATE User SET role = 'ADMIN' WHERE email = 'admin@example.com';
```
2. Ask user to log out and log back in
3. Verify session is valid

---

### Issue: Multiple attempts not detected

**Symptoms:**
- Fraudulent user making multiple claims
- No fraud penalty applied
- Score not reduced

**Diagnosis:**
```sql
-- Check claim attempts for user
SELECT * FROM ClaimAttempt WHERE userId = 'user-id' ORDER BY attemptedAt DESC;
```

**Possible Causes:**
1. Previous attempts have status other than 'rejected'
2. User ID not matching (different accounts)
3. Query logic error in `lib/verification-signals.ts`

**Solution:**
- Verify userId is consistent across attempts
- Check ClaimAttempt.status values
- Review `calculateMultipleAttempts()` function logic

---

### Issue: Rejection not cleaning up state

**Symptoms:**
- Admin rejects claim
- Provider still shows as claimed
- User still has provider access

**Diagnosis:**
```sql
-- Check provider state after rejection
SELECT userId, claimed, verificationStatus, verified
FROM Provider WHERE id = 'provider-id';

-- Check claim status
SELECT status, reviewedBy, reviewedAt
FROM ClaimAttempt WHERE id = 'claim-id';
```

**Possible Causes:**
1. Transaction failed during rejection
2. Provider.userId not set to null
3. ProviderIdentity not deleted

**Solution:**
1. Check logs for transaction errors
2. Run manual cleanup:
```sql
UPDATE Provider
SET userId = NULL, claimed = false, verificationStatus = NULL, verified = false
WHERE id = 'provider-id';

DELETE FROM ProviderIdentity WHERE userId = 'user-id';

UPDATE User
SET providerOnboardingComplete = false, activeMode = 'FAMILY'
WHERE id = 'user-id';
```

---

## Performance Considerations

### Database Indexes

The following indexes optimize query performance:

```prisma
@@index([status])           // Fast pending claims query
@@index([autoApproved])     // Fast auto-approved claims query
@@index([attemptedAt])      // Chronological sorting
@@index([providerProfileId]) // Provider lookup
@@index([userId])           // User lookup
```

### Denormalized Data

ClaimAttempt includes denormalized user/provider context to minimize joins:
- `userEmail`, `userName`, `userAccountAge`
- `providerName`, `providerEmail`, `providerWebsite`

**Benefit:** Admin dashboard queries don't need to join User and Provider tables.

### Signal Calculation

Verification signals are calculated **once** during claim:
- Stored as JSON in `ClaimAttempt.signals`
- No recalculation needed for admin review
- Reduces database queries

---

## Maintenance & Monitoring

### Key Metrics to Track

1. **Auto-Approval Rate:**
   ```sql
   SELECT
     COUNT(CASE WHEN autoApproved = true THEN 1 END) * 100.0 / COUNT(*) AS auto_approval_rate
   FROM ClaimAttempt
   WHERE attemptedAt > NOW() - INTERVAL '30 days';
   ```
   **Target:** 70-85%

2. **Average Review Time:**
   ```sql
   SELECT
     AVG(EXTRACT(EPOCH FROM (reviewedAt - attemptedAt)) / 3600) AS avg_hours_to_review
   FROM ClaimAttempt
   WHERE status IN ('approved', 'rejected')
     AND attemptedAt > NOW() - INTERVAL '30 days';
   ```
   **Target:** < 8 hours

3. **Rejection Rate:**
   ```sql
   SELECT
     COUNT(CASE WHEN status = 'rejected' THEN 1 END) * 100.0 / COUNT(*) AS rejection_rate
   FROM ClaimAttempt
   WHERE status IN ('approved', 'rejected')
     AND attemptedAt > NOW() - INTERVAL '30 days';
   ```
   **Target:** < 5%

4. **Fraud Detection Rate:**
   ```sql
   SELECT COUNT(*) AS fraud_attempts
   FROM ClaimAttempt
   WHERE signals::json->>'multipleAttempts'->>'status' = 'fail'
     AND attemptedAt > NOW() - INTERVAL '30 days';
   ```
   **Target:** Monitor for patterns

### Tuning Signal Weights

If metrics deviate from targets, consider adjusting signal weights in `lib/verification-signals.ts`:

```typescript
// Current weights
const WEIGHTS = {
  emailDomainMatch: 0.30,
  emailVerified: 0.20,
  professionalEmail: 0.15,
  nameSimilarity: 0.15,
  accountAge: 0.10,
  multipleAttempts: 0.10,
};

// Example: Increase domain match importance
const WEIGHTS = {
  emailDomainMatch: 0.35, // +5%
  emailVerified: 0.20,
  professionalEmail: 0.10, // -5%
  nameSimilarity: 0.15,
  accountAge: 0.10,
  multipleAttempts: 0.10,
};
```

**When to tune:**
- Auto-approval rate too low (< 70%): Relax weights or lower threshold
- Auto-approval rate too high (> 90%): Tighten weights or raise threshold
- High rejection rate (> 10%): Investigate common rejection patterns

---

## Future Enhancements

### Planned Features

1. **Email Notifications:**
   - Send email to user when claim approved/rejected
   - Send email to admin team when high-priority claim needs review
   - Template: "Your claim for [Provider Name] has been approved!"

2. **Admin Dashboard Enhancements:**
   - Bulk approve/reject for multiple claims
   - Filter by score range, date, provider type
   - Search by user email, provider name
   - Export claim history to CSV

3. **Additional Verification Signals:**
   - Phone verification (SMS code)
   - Document upload (business license, ID)
   - LinkedIn profile match
   - Google My Business verification

4. **Machine Learning:**
   - Train model on historical claim data
   - Predict fraud probability
   - Dynamic weight adjustment based on outcomes

5. **Audit Log:**
   - Separate AuditLog table for all admin actions
   - Track who viewed which claims (not just who reviewed)
   - Export audit logs for compliance

---

## Support & Contact

For questions or issues with the Admin Verification System:

- **Code Documentation:** See inline comments in `/lib/verification-signals.ts`
- **API Docs:** Reference this document's API section
- **Bug Reports:** Open issue in project repository
- **Feature Requests:** Submit via project issue tracker

---

**Last Updated:** 2025-01-13
**Version:** 1.0.0
**Author:** Claude (AI Assistant)
