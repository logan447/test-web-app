# Comprehensive Platform Audit Document (v2)

## Table of Contents
1. [User Types](#1-user-types)
2. [User Flows by Type](#2-user-flows-by-type)
3. [Paywall & Monetization Flows](#3-paywall--monetization-flows)
4. [SEO Entry Flows (Claimed & Unclaimed)](#4-seo-entry-flows-claimed--unclaimed)
5. [Lifecycle & Calendar Flows](#5-lifecycle--calendar-flows)
6. [Edge Case & Recovery Flows](#6-edge-case--recovery-flows)
7. [Page-by-Page Path Details](#7-page-by-page-path-details)
8. [Master Audit Checklist](#8-master-audit-checklist)
9. [Simplification Opportunities](#9-simplification-opportunities)
10. [Risk List](#10-risk-list)

---

## 1. User Types

### 1.1 Primary User Types

| Type | Identifier | How Determined | Primary Purpose |
|------|------------|----------------|-----------------|
| **Anonymous** | No session | Not authenticated | Browse public content, view providers |
| **Family** | `activeMode = FAMILY` | Default signup or mode switch | Find care providers for loved ones |
| **Provider (Organization)** | `activeMode = PROVIDER` + `providerType ∈ {facility, home care}` | Signup with provider intent + org setup | Receive family inquiries, hire staff |
| **Provider (Individual Caregiver)** | `activeMode = PROVIDER` + `providerType = INDEPENDENT_CAREGIVER` | Signup with provider intent + individual setup | Find families/organizations to work for |
| **Admin** | `role = ADMIN` | Bootstrap or seed | Platform administration |

### 1.2 Provider Subtypes (by `providerType`)

| Category | Types | Engagement Model | CTA Text |
|----------|-------|------------------|----------|
| **Facility** | ASSISTED_LIVING, MEMORY_CARE, NURSING_HOME, INDEPENDENT_LIVING, REHABILITATION | Tour | "Schedule a Tour" |
| **Home Care Organization** | HOME_CARE, HOME_HEALTH, HOSPICE | Consultation | "Request a Consultation" |
| **Individual** | INDEPENDENT_CAREGIVER | Interview | "Schedule an Interview" |

### 1.3 Subscription Tiers

| Tier | Cost | Limits | Key Gating |
|------|------|--------|------------|
| **FREE** | $0 | 3 active engagements/month | Paywall after limit |
| **PRO** | $49/mo | Unlimited engagements | Full access |

### 1.4 State Combinations

| Mode | Has Profile | Has Provider | Subscription | Can Access |
|------|-------------|--------------|--------------|------------|
| FAMILY | No FamilyProfile | N/A | N/A | Browse, save (limited) |
| FAMILY | Has FamilyProfile | N/A | N/A | Full family features |
| PROVIDER | No ProviderIdentity | N/A | N/A | Redirect to onboarding |
| PROVIDER | ProviderIdentity | No Provider | N/A | Create/claim provider |
| PROVIDER | ProviderIdentity | Provider + FREE | FREE | 3 engagements/month |
| PROVIDER | ProviderIdentity | Provider + PRO | PRO | Unlimited |

---

## 2. User Flows by Type

### 2.1 Anonymous User Flows

#### Flow A1: Browse Providers (No Account)
- **Entry Points**: Homepage, direct `/browse` URL, Google search
- **Path**: `/` → `/browse` → `/providers/[id]`
- **Key Actions**:
  - `/`: Search form, browse care types
  - `/browse`: Filter, sort, view map, save (prompts login)
  - `/providers/[id]`: View details, reviews, photos
- **Expected Outcome**: User finds providers, prompted to sign up for engagement
- **Failure Cases**:
  - Attempting to save → Auth modal
  - Attempting to contact → Auth modal with pending action context
  - Attempting to write review → Auth modal

#### Flow A2: Sign Up (Family Intent)
- **Entry Points**: Header "Sign Up", Auth modal, CTA buttons
- **Path**: `/signup` → `/?onboarding=true` → GlobalOnboardingOverlay → `/care-profile`
- **Key Actions**:
  - `/signup`: Email/password, select family intent
  - Overlay Step 1: Confirm "I'm looking for care"
  - Overlay Step 2: Family fields (loved one name, location, care types)
  - Overlay Step 3: Visibility confirmation
  - POST `/api/user/onboarding-complete`
- **Expected Outcome**: Account created, profile started, redirected to care profile
- **Failure Cases**:
  - Existing email → Error message
  - Weak password → Validation error
  - Skipping onboarding → Profile incomplete, limited features

#### Flow A3: Sign Up (Provider Intent)
- **Entry Points**: "/for-providers" CTA, signup with `?intent=provider`
- **Path**: `/signup?intent=provider` → `/provider/leads?onboarding=true&intent=provider` → GlobalOnboardingOverlay
- **Key Actions**:
  - `/signup`: Email/password, provider intent
  - Overlay Step 1: Skip (intent pre-set)
  - Overlay Step 2: Choose org/individual
  - Overlay Step 3: Provider fields (name, type, location, care types)
  - Overlay Step 4: Visibility confirmation
- **Expected Outcome**: Account created, provider identity set, redirected to leads
- **Failure Cases**:
  - Skip onboarding → Persistent prompts on dashboard
  - No provider profile → Limited functionality, paywall on actions

#### Flow A4: Login
- **Entry Points**: Header "Log In", Auth modal
- **Path**: `/login` → Mode-based redirect
- **Expected Outcome**:
  - FAMILY mode → `/care-profile`
  - PROVIDER mode → `/provider/leads`
- **Failure Cases**:
  - Wrong credentials → Error message
  - Pending action context → Resume action after login

---

### 2.2 Family User Flows

#### Flow F1: Complete Care Profile
- **Entry Points**: Dashboard nudge, profile edit link, engagement gate
- **Path**: `/care-profile` → `/care-profile/edit`
- **Key Actions**:
  - Fill Profile Card Minimum fields (loved one name, location, care types)
  - Optionally add Tier 2 fields (age, budget, timeline, etc.)
  - Enable visibility for provider discovery
- **Expected Outcome**: Profile complete, visible to providers, can engage
- **Failure Cases**:
  - Missing Tier 1 → Can't enable visibility
  - Can't engage providers → EngagementConfirmationModal shows "Complete Profile" blocker

#### Flow F2: Search and Engage Provider (Facility - Tour)
- **Entry Points**: Search, browse, homepage
- **Path**: `/browse` → `/providers/[id]` → EngagementConfirmationModal → `/requests/[id]`
- **Key Actions**:
  - `/browse`: Search by location, filter by facility type
  - `/providers/[id]`: View profile, click "Schedule a Tour"
  - Modal: Verify profile complete → Confirm profile sharing → Acknowledge checkbox → Submit
  - POST `/api/requests` creates engagement
  - `/requests/[id]`: View conversation, propose tour dates
- **Expected Outcome**: Request sent (PENDING), provider notified, await response
- **Success States**:
  - Provider accepts → Status ACCEPTED, can propose dates
  - Tour scheduled → TourAppointment created, calendar links available
  - Tour completed → Status COMPLETED, can write review
- **Failure Cases**:
  - Profile incomplete → Modal shows "Complete Your Profile" with edit link
  - Provider declined → Notification, status DECLINED, read-only
  - Provider unresponsive → Status stays PENDING

#### Flow F3: Search and Engage Provider (Home Care - Consultation)
- **Entry Points**: Search, browse
- **Path**: Same as F2
- **Key Actions**: Same as F2, but CTA is "Request a Consultation"
- **Expected Outcome**: Consultation request sent and scheduled
- **Note**: Uses same TourAppointment model for scheduling

#### Flow F4: Search and Engage Provider (Caregiver - Interview)
- **Entry Points**: Search, browse, matches
- **Path**: Same as F2
- **Key Actions**: Same as F2, but CTA is "Schedule an Interview"
- **Contact Gating**: Caregiver contact info hidden until status = ACCEPTED
- **Expected Outcome**: Interview request sent, contact revealed after acceptance
- **Failure Cases**:
  - Caregiver declines → No contact info revealed ever

#### Flow F5: Manage Saved Providers
- **Entry Points**: Heart icons on cards, "Saved" nav link
- **Path**: `/saved` → `/saved/compare` (optional) → `/providers/[id]` → Engage
- **Key Actions**:
  - `/saved`: View saved list, remove items
  - `/saved/compare`: Side-by-side comparison (max 4)
  - Click through to provider profiles
  - Engage from saved list
- **Expected Outcome**: Organized shortlist, easy comparison, streamlined engagement
- **Failure Cases**:
  - No saved items → Empty state with "Browse Providers" CTA

#### Flow F6: View and Respond to Provider Outreach
- **Entry Points**: Notification bell, `/requests` page (Received tab)
- **Path**: Notification click → `/requests/[id]`
- **Key Actions**:
  - View incoming request from provider (org or caregiver)
  - Review provider profile inline
  - Accept or decline engagement
  - If accepted → Continue conversation, schedule meeting
- **Expected Outcome**: Engagement established or declined
- **Failure Cases**:
  - Accidental decline → No undo (consider confirmation modal)

#### Flow F7: View Recommendations/Matches
- **Entry Points**: "Matches" nav link
- **Path**: `/matches`
- **Key Actions**:
  - View algorithm-matched providers (based on care profile)
  - View active engagements section
  - Click through to provider profiles
- **Expected Outcome**: Relevant provider recommendations surfaced
- **Failure Cases**:
  - Profile incomplete → "Complete profile for better matches" prompt
  - No matches found → Empty state with "Browse All Providers" CTA

#### Flow F8: Write Review
- **Entry Points**: Provider detail page, post-engagement prompt
- **Path**: `/providers/[id]` → ReviewModal
- **Key Actions**:
  - Click "Write a Review"
  - Rate (1-5 stars), add title, content
  - Select relationship, length of stay
  - Submit
- **Expected Outcome**: Review published, Olera Score updated
- **Failure Cases**:
  - Already reviewed this provider → Error message
  - Content too short → Validation error (min 50 chars)

#### Flow F9: Switch to Provider Mode
- **Entry Points**: Profile dropdown "Switch to Provider Mode"
- **Path**: Current page → PATCH `/api/user/mode` → updateSession → Redirect
- **Key Actions**:
  - Click mode switch button in nav dropdown
  - API updates `activeMode` in database
  - Session updated via NextAuth
  - Redirect based on provider state:
    - No ProviderIdentity → `/provider/leads?onboarding=true&intent=provider`
    - Has ProviderIdentity → `/provider/leads`
- **Expected Outcome**: User now in provider mode with correct nav
- **Failure Cases**:
  - API error → Toast error, stay in current mode

---

### 2.3 Provider (Organization) Flows

#### Flow PO1: Complete Provider Profile
- **Entry Points**: Dashboard nudges, profile edit link, paywall redirect
- **Path**: `/provider/profile` → `/provider/profile/edit`
- **Key Actions**:
  - Complete Tier 1 fields (name, type, city, state, care types, payment modes)
  - Add Tier 2 fields (description, contact, pricing, photos, licensing)
  - Enable visibility
- **Expected Outcome**: Profile visible in search, Olera Score calculated
- **Failure Cases**:
  - Missing Tier 1 → Can't enable visibility
  - No photos → Lower completion score, reduced trust

#### Flow PO2: Claim Unclaimed Provider (see Section 4 for details)
- **Entry Points**: Provider detail page "Claim this listing"
- **Path**: `/providers/[id]` → ClaimProviderModal → Verification → `/provider/profile`

#### Flow PO3: Browse and Respond to Family Leads
- **Entry Points**: Dashboard, "Leads" nav link, notifications
- **Path**: `/provider/leads` → Click family card → `/provider/requests/[id]`
- **Key Actions**:
  - `/provider/leads`: View matched families, filter by care type/location/timeline
  - Click family card → View details
  - Accept or decline lead
  - If accepted → `/provider/requests/[id]`: Message, propose tour/consultation
- **Expected Outcome**: Family engaged, meeting scheduled
- **Paywall Check**: See Section 3 for gating rules
- **Failure Cases**:
  - Free tier limit reached → PaywallModal shown
  - Family withdraws → Notification, status update

#### Flow PO4: Browse and Hire Caregivers
- **Entry Points**: "Hire Staff" nav link (org-only)
- **Path**: `/provider/hire-staff` → `/provider/hire-staff/[id]` → Send request → `/provider/candidates`
- **Key Actions**:
  - `/provider/hire-staff`: Browse caregivers with `availableForOrganizations = true`
  - `/provider/hire-staff/[id]`: View profile, use message templates, send interview request
  - `/provider/candidates`: Manage hiring pipeline (Outreach tab)
- **Expected Outcome**: Caregiver interview scheduled
- **Paywall Check**: May require PRO for bulk hiring (TBD)
- **Failure Cases**:
  - Caregiver declines → Status update in pipeline
  - No available caregivers → Empty state with explanation

#### Flow PO5: Manage Incoming Applications (from Caregivers)
- **Entry Points**: "Candidates" nav link, notifications
- **Path**: `/provider/candidates` (Applied tab) → `/provider/candidates/[id]`
- **Key Actions**:
  - View caregivers who applied to work with org
  - Accept/decline applications
  - Schedule interviews for accepted candidates
- **Expected Outcome**: Hiring pipeline managed efficiently
- **Failure Cases**:
  - No applications → Empty state with "Post Opportunities" guidance

#### Flow PO6: Manage Active Engagements
- **Entry Points**: Dashboard, "Requests" nav link
- **Path**: `/provider/requests` → `/provider/requests/[id]`
- **Key Actions**:
  - View all sent/received requests (tabbed)
  - Continue conversations
  - Propose/confirm appointments
  - Mark engagements complete
- **Expected Outcome**: Engagements progress through lifecycle (PENDING → ACCEPTED → COMPLETED)
- **Failure Cases**:
  - Stale PENDING engagements → Consider auto-expire logic

---

### 2.4 Provider (Individual Caregiver) Flows

#### Flow PC1: Complete Caregiver Profile
- **Entry Points**: Dashboard nudges, profile edit link
- **Path**: `/provider/profile` → `/provider/profile/edit`
- **Key Actions**:
  - Complete profile (name, skills, certifications, availability, hourly rate)
  - Set `availableForOrganizations = true` if seeking org work
  - Upload photos, certification documents
  - Enable visibility
- **Expected Outcome**: Profile visible to families and orgs
- **Failure Cases**:
  - Profile incomplete → Not discoverable

#### Flow PC2: Browse Families Seeking Care
- **Entry Points**: "Find Families" nav link or `/caregiver`
- **Path**: `/caregiver` → Family detail → Send outreach → `/provider/requests/[id]`
- **Key Actions**:
  - Browse families with public profiles and care needs
  - Filter by care type, location, budget
  - Send interview request
- **Expected Outcome**: Connection with family established
- **Paywall Check**: See Section 3 for gating rules
- **Failure Cases**:
  - No matching families → Empty state
  - Free tier limit → PaywallModal

#### Flow PC3: Browse Organizations Hiring
- **Entry Points**: "Find Organizations" nav link
- **Path**: `/caregiver/browse-organizations` → `/caregiver/browse-organizations/[id]` → Apply
- **Key Actions**:
  - Browse organizations with job opportunities
  - View organization details (public info)
  - Submit application
- **Expected Outcome**: Application sent, await org response
- **Paywall Check**: See Section 3 for gating rules
- **Failure Cases**:
  - No hiring orgs → Empty state

#### Flow PC4: View and Respond to Interview Requests
- **Entry Points**: Notifications, `/provider/requests` (Received tab)
- **Path**: Notification → `/provider/requests/[id]}` or `/provider/opportunities/[id]`
- **Key Actions**:
  - View incoming interview requests (from families or orgs)
  - Accept or decline
  - If accepted → Schedule interview time, contact info revealed
- **Expected Outcome**: Interview scheduled, mutual contact exchange
- **Failure Cases**:
  - Decline → Request closed, no contact revealed

#### Flow PC5: Manage Employment Opportunities
- **Entry Points**: "Opportunities" nav link
- **Path**: `/provider/opportunities`
- **Key Actions**:
  - View all opportunities from organizations
  - Track application status (PENDING, ACCEPTED, etc.)
  - Respond to org messages
- **Expected Outcome**: Track hiring pipeline from caregiver perspective
- **Failure Cases**:
  - No opportunities → Empty state with "Browse Organizations" CTA

---

### 2.5 Admin Flows

#### Flow AD1: Bootstrap Admin Account
- **Path**: `/admin/bootstrap`
- **Gating**: Only works if no admin user exists
- **Key Actions**: Set admin email/password
- **Expected Outcome**: Admin account created

#### Flow AD2: Seed Demo Data
- **Path**: `/admin/seed`
- **Key Actions**: Trigger Prisma seed script
- **Expected Outcome**: Database populated with demo providers, families, engagements

#### Flow AD3: Handle Takedown Requests (see Section 4.6 for full flow)
- **Path**: `/admin/takedown-requests`
- **Key Actions**: Review, approve, or deny takedown requests

---

## 3. Paywall & Monetization Flows

### 3.1 Paywall Trigger Points

The paywall is checked when a provider attempts to create a new engagement (request). The check happens at:
- **API Location**: `POST /api/requests` (line ~296 in route handler)
- **Client Location**: Before EngagementConfirmationModal or request submission

### 3.2 Subscription Model

| Tier | Monthly Limit | What Counts | Reset |
|------|---------------|-------------|-------|
| FREE | 3 active engagements | PENDING + ACCEPTED requests initiated by provider | Monthly |
| PRO | Unlimited | N/A | N/A |

**Note**: Requests initiated by the other party (e.g., family contacting provider first) do NOT count against provider's limit.

### 3.3 Individual Caregiver Paywall Flows

#### Flow PWC1: Caregiver Applies to Organization (Gated)
- **Trigger**: Caregiver clicks "Apply" on organization profile
- **Check**: Active engagement count < 3 (FREE) or has PRO subscription
- **If Allowed**:
  1. Application submitted (requestType: HIRING)
  2. Org notified
  3. Caregiver redirected to `/provider/requests/[id]`
- **If Blocked**:
  1. PaywallModal opens
  2. Shows: "You've reached your monthly limit of 3 applications"
  3. Copy: "Upgrade to PRO for unlimited applications and priority visibility"
  4. CTA: "Upgrade to PRO - $49/month"
  5. Secondary: "View current applications" (to close some)
- **Post-Upgrade Continuation**:
  1. Modal closes
  2. Subscription updated in database
  3. Original action resumes automatically (pending action context)
  4. Application submitted

#### Flow PWC2: Caregiver Messages/Outreach to Family (Gated)
- **Trigger**: Caregiver clicks "Send Interview Request" on family profile
- **Check**: Same as PWC1
- **If Allowed**:
  1. Request created (requestType: CONSULTATION, from caregiver)
  2. Family notified
  3. Caregiver redirected to conversation
- **If Blocked**:
  1. PaywallModal with same messaging
  2. Shows active engagement count: "3 of 3 connections used this month"
- **Post-Upgrade**: Same automatic continuation

#### Flow PWC3: Caregiver Responds to Inbound Request (NOT Gated)
- **Trigger**: Caregiver receives request from family or org, clicks "Accept"
- **Check**: NONE - responding to inbound is always free
- **Rationale**: Don't penalize caregivers for being in demand
- **Flow**:
  1. Accept button always enabled
  2. Status changes to ACCEPTED
  3. Contact info exchanged
  4. Conversation continues

### 3.4 Organization Paywall Flows

#### Flow PWO1: Org Schedules Interview with Caregiver (Gated)
- **Trigger**: Org clicks "Send Interview Request" on caregiver profile
- **Check**: Active hiring engagement count < 3 (FREE) or PRO
- **If Allowed**:
  1. Request created (requestType: HIRING)
  2. Caregiver notified
  3. Org redirected to `/provider/candidates/[id]`
- **If Blocked**:
  1. PaywallModal opens
  2. Shows: "Upgrade to unlock unlimited hiring outreach"
  3. CTA: "Upgrade to PRO"
- **Post-Upgrade**: Automatic continuation

#### Flow PWO2: Org Sends Outreach to Family (Gated)
- **Trigger**: Org clicks "Contact Family" on family lead
- **Check**: Active engagement count < 3 (FREE) or PRO
- **If Allowed**:
  1. Request created
  2. Family notified
  3. Org redirected to conversation
- **If Blocked**: PaywallModal
- **Post-Upgrade**: Automatic continuation

#### Flow PWO3: Org Responds to Inbound Family Request (NOT Gated)
- **Trigger**: Family contacts org first, org clicks "Accept"
- **Check**: NONE - responding is always free
- **Flow**: Accept → ACCEPTED → Tour/consultation scheduling

### 3.5 PaywallModal UI Specification

```
┌─────────────────────────────────────────┐
│  [Lock Icon]                            │
│                                         │
│  Upgrade to Continue                    │
│                                         │
│  You've used 3 of 3 free connections    │
│  this month. Upgrade to PRO for:        │
│                                         │
│  ✓ Unlimited connections                │
│  ✓ Priority in search results           │
│  ✓ Advanced analytics                   │
│  ✓ Dedicated support                    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Upgrade to PRO - $49/month     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Manage existing connections]          │
│                                         │
└─────────────────────────────────────────┘
```

### 3.6 Post-Upgrade Continuation Flow

1. User hits paywall during action attempt
2. PaywallModal opens with `pendingAction` context stored
3. User clicks "Upgrade to PRO"
4. Redirect to `/pricing` or Stripe checkout
5. On successful payment:
   - Webhook updates `subscription.tier = PRO`
   - User redirected back to original page with `?upgraded=true&pendingAction=...`
6. Page detects params, automatically retries original action
7. Action succeeds, user continues seamlessly

---

## 4. SEO Entry Flows (Claimed & Unclaimed)

### 4.1 SEO Discovery Context

Users may land on provider pages via:
- Google search for provider name
- Google search for "care type + city" (directory result)
- Direct link from referral/marketing
- Social media shares

### 4.2 Family SEO → Claimed Provider Flow

#### Flow SEO-F1: Family Lands on Claimed Provider Page
- **Entry**: Google search → `/providers/[id]` (claimed provider)
- **Visual Indicators**:
  - ✓ Verified badge (teal, checkmark icon)
  - Full profile with photos, description, pricing
  - Reviews with responses
  - "Schedule a Tour/Consultation/Interview" CTA prominent
- **Path**: `/providers/[id]` → CTA → Auth (if needed) → Engagement
- **Key Actions**:
  1. View full provider profile
  2. Click primary CTA ("Schedule a Tour")
  3. If not logged in → AuthModal with pending action context
  4. If logged in without profile → Onboarding overlay
  5. If logged in with profile → EngagementConfirmationModal
  6. Submit → Redirect to `/requests/[id]`
- **Expected Outcome**: Engagement created, meeting scheduled
- **Alternate Actions**:
  - Save provider (heart) → Requires auth
  - Compare providers → Requires auth, add to compare list
  - Write review → Requires auth + completed engagement (ideally)
  - Continue browsing → Back to `/browse`

### 4.3 Family SEO → Unclaimed Provider Flow

#### Flow SEO-F2: Family Lands on Unclaimed Provider Page
- **Entry**: Google search → `/providers/[id]` (unclaimed provider)
- **Visual Indicators**:
  - Gray/subtle "Unclaimed listing" badge
  - Limited info (DMCA-safe public data only):
    - Name, type, general location (city/state)
    - Care types (if known from public sources)
    - No phone/email/address visible
    - No photos (or generic placeholder)
  - "Claim this listing" CTA (secondary, for providers)
  - "Contact" CTA may show but with disclaimer
- **Path**: `/providers/[id]` → CTA → Limited engagement
- **Key Actions**:
  1. View limited profile
  2. Click "Contact" (if available)
  3. Show info modal: "This listing hasn't been claimed. Information may be limited."
  4. Option to request platform assistance or continue
  5. If engagement submitted → May have limited response expectation
- **Expected Outcome**: User understands limitations, can still express interest
- **Alternate Actions**:
  - Save for later (bookmarking for when claimed)
  - Browse similar providers (prominent CTA)
  - Request notification when provider claims listing

### 4.4 Provider SEO → Claim Flow

#### Flow SEO-P1: Provider Searches for Own Organization → Claim
- **Entry**: Google search for own business → `/providers/[id]` (unclaimed)
- **Visual Indicators**:
  - "Is this your business? Claim this listing" prominent CTA
  - Limited info displayed
  - Claim benefits highlighted:
    - "Respond to family inquiries"
    - "Update your profile"
    - "Manage reviews"
- **Path**: `/providers/[id]` → "Claim this listing" → ClaimProviderModal

#### ClaimProviderModal Flow (3 Steps):

**Step 1: Verification Method Selection**
```
┌─────────────────────────────────────────┐
│  Claim This Listing                     │
│                                         │
│  Verify you represent [Provider Name]   │
│                                         │
│  Choose verification method:            │
│                                         │
│  ○ Email verification                   │
│    We'll send a code to the business    │
│    email on file                        │
│                                         │
│  ○ Phone verification                   │
│    We'll call the business phone        │
│                                         │
│  ○ Document upload                      │
│    Upload business license or official  │
│    documentation                        │
│                                         │
│  [Cancel]              [Continue →]     │
└─────────────────────────────────────────┘
```

**Step 2: Verification Execution**
- Email: Enter code sent to business email
- Phone: Enter code from automated call
- Document: Upload file, await manual review

**Step 3: Confirmation**
```
┌─────────────────────────────────────────┐
│  ✓ Claim Submitted                      │
│                                         │
│  Your claim is being reviewed.          │
│  You'll receive an email within         │
│  1-2 business days.                     │
│                                         │
│  What happens next:                     │
│  • We verify your documentation         │
│  • You get full profile edit access     │
│  • Start receiving family inquiries     │
│                                         │
│  [Go to Dashboard]                      │
└─────────────────────────────────────────┘
```

- **API**: POST `/api/providers/[id]/claim`
- **Database**: Creates claim record with status PENDING
- **Post-Approval**:
  - Provider linked to user account
  - Full edit access granted
  - Redirect to `/provider/profile/edit` with welcome banner
  - Notification sent: "Your claim has been approved!"

#### Claim Rejection Flow:
- Admin reviews and denies
- Email sent with reason
- User can resubmit with additional documentation
- Page shows: "Claim denied. [Resubmit with additional documentation]"

### 4.5 Claimed vs Unclaimed Visual Differences

| Element | Claimed | Unclaimed |
|---------|---------|-----------|
| Badge | "✓ Verified" (teal) | "Unclaimed listing" (gray) |
| Photos | Gallery with uploaded images | Generic placeholder or none |
| Description | Full custom description | Auto-generated or minimal |
| Contact Info | Phone, email, address | Hidden or "Contact via platform" |
| Pricing | Detailed pricing table | "Contact for pricing" |
| Reviews | Full reviews with responses | Reviews (no responses) |
| Response Time | "Usually responds in X" | Not shown |
| Primary CTA | "Schedule a Tour" | "Contact" (with disclaimer) |
| Secondary CTA | "Save", "Compare" | "Claim this listing" |
| Edit Access | Owner can edit | No edit access |

### 4.6 Takedown Request Flow (DMCA-Style)

#### Flow TD1: Provider Requests Takedown of Unclaimed Listing
- **Entry**: `/providers/[id]` → "Request Removal" link (footer or info section)
- **Path**: Click → TakedownRequestModal → Submit → Admin review

**TakedownRequestModal Steps:**

**Step 1: Identify Relationship**
```
┌─────────────────────────────────────────┐
│  Request Listing Removal                │
│                                         │
│  What is your relationship to this      │
│  listing?                               │
│                                         │
│  ○ I own/represent this business        │
│  ○ This business has closed             │
│  ○ Information is incorrect/harmful     │
│  ○ Other (please specify)               │
│                                         │
│  [Cancel]              [Continue →]     │
└─────────────────────────────────────────┘
```

**Step 2: Provide Details**
```
┌─────────────────────────────────────────┐
│  Request Listing Removal                │
│                                         │
│  Please provide details:                │
│                                         │
│  Your name: [________________]          │
│  Your email: [________________]         │
│  Your role: [________________]          │
│                                         │
│  Reason for removal:                    │
│  [                                  ]   │
│  [                                  ]   │
│                                         │
│  □ I confirm this information is        │
│    accurate and I have authority to     │
│    make this request                    │
│                                         │
│  [Cancel]              [Submit Request] │
└─────────────────────────────────────────┘
```

**Step 3: Confirmation**
```
┌─────────────────────────────────────────┐
│  Request Submitted                      │
│                                         │
│  Your removal request has been          │
│  submitted for review.                  │
│                                         │
│  Reference #: TDR-2024-00123            │
│                                         │
│  We'll email you at [email] within      │
│  5-7 business days with our decision.   │
│                                         │
│  [Close]                                │
└─────────────────────────────────────────┘
```

- **API**: POST `/api/admin/takedown-requests`
- **Database**: Creates TakedownRequest record with status PENDING
- **Admin Path**: `/admin/takedown-requests`
  - View all pending requests
  - Review details and evidence
  - Approve → Soft-delete provider (`deletedAt` timestamp)
  - Deny → Send email with reason, listing remains

---

## 5. Lifecycle & Calendar Flows

### 5.1 Engagement Lifecycle States

```
                    ┌─────────┐
                    │ PENDING │
                    └────┬────┘
                         │
           ┌─────────────┼─────────────┐
           │             │             │
           ▼             ▼             ▼
      ┌────────┐   ┌──────────┐   ┌───────────┐
      │ACCEPTED│   │ DECLINED │   │ CANCELLED │
      └────┬───┘   └──────────┘   └───────────┘
           │
           ▼
     ┌───────────┐
     │ COMPLETED │
     └───────────┘
```

### 5.2 Notification → Resume Action Flows

#### Flow NRA1: Notification → Accept Request → Schedule Meeting
- **Trigger**: Provider receives notification "New request from [Family]"
- **Path**: Bell dropdown → Click notification → `/provider/requests/[id]`
- **Key Actions**:
  1. Notification marked as read (PATCH `/api/notifications/[id]`)
  2. Land on request detail page
  3. Review family profile
  4. Click "Accept"
  5. Status changes to ACCEPTED
  6. "Propose Meeting Time" section appears
  7. Select date/time, add message
  8. Submit → TourAppointment created with status PROPOSED
  9. Family notified
- **Expected Outcome**: Meeting proposed, await family confirmation

#### Flow NRA2: Notification → Confirm Proposed Time → Add to Calendar
- **Trigger**: User receives "Meeting time proposed"
- **Path**: Notification → `/requests/[id]` → Confirm → Calendar
- **Key Actions**:
  1. View proposed time details
  2. Click "Confirm This Time" or "Propose Different Time"
  3. If confirmed:
     - TourAppointment status → CONFIRMED
     - Both parties notified
     - Calendar links appear (Google, Outlook, Yahoo, Apple)
  4. Click calendar link → Event added to external calendar
- **Expected Outcome**: Meeting confirmed, on both calendars

#### Flow NRA3: Notification → Message Received → Reply
- **Trigger**: User receives "New message from [Name]"
- **Path**: Notification → `/requests/[id]` → Reply
- **Key Actions**:
  1. Land on conversation thread
  2. Read new message (highlighted)
  3. Type reply in composer
  4. Send → Message created
  5. Other party notified
- **Expected Outcome**: Conversation continues

### 5.3 Saved Items → Engagement → Calendar Flow

#### Flow SEC1: Save → Compare → Engage → Schedule
- **Path**: `/browse` → Save multiple → `/saved` → `/saved/compare` → Choose → Engage → Schedule
- **Key Actions**:
  1. Browse providers, click heart to save (3-5 providers)
  2. Navigate to `/saved`
  3. Select up to 4 providers for comparison
  4. Click "Compare Selected" → `/saved/compare`
  5. Review side-by-side (pricing, rating, location, care types)
  6. Choose best fit, click "Schedule a Tour"
  7. Complete engagement flow
  8. After acceptance → Propose/confirm meeting
  9. Add to calendar
- **Expected Outcome**: Informed decision, meeting scheduled

### 5.4 Rescheduling and Cancellation Flows

#### Flow RSC1: Reschedule Confirmed Meeting
- **Trigger**: User needs to change meeting time
- **Path**: `/requests/[id]` → "Reschedule" → Propose new time
- **Key Actions**:
  1. On request detail page, find confirmed meeting
  2. Click "Reschedule"
  3. Confirmation modal: "Are you sure? The other party will be notified."
  4. If confirmed:
     - Current TourAppointment status → CANCELLED (or RESCHEDULED)
     - "Propose New Time" form appears
     - Submit new time
     - New TourAppointment created with status PROPOSED
     - Other party notified: "Meeting rescheduled"
- **Expected Outcome**: New time proposed, await confirmation
- **Edge Cases**:
  - Multiple reschedules → Consider limit or warning
  - Same-day reschedule → Urgent notification flag

#### Flow RSC2: Cancel Meeting
- **Trigger**: User needs to cancel entirely
- **Path**: `/requests/[id]` → "Cancel Meeting" → Confirm
- **Key Actions**:
  1. Click "Cancel Meeting"
  2. Modal: "Are you sure? This will cancel the meeting but keep the conversation open."
  3. Optional: Add cancellation reason
  4. If confirmed:
     - TourAppointment status → CANCELLED
     - Other party notified
     - Engagement status remains ACCEPTED (can reschedule)
- **Expected Outcome**: Meeting cancelled, engagement continues
- **Note**: Cancelling meeting ≠ declining engagement

#### Flow RSC3: Decline/Cancel Entire Engagement
- **Trigger**: User wants to end engagement entirely
- **Path**: `/requests/[id]` → "Decline" or "Cancel Engagement"
- **Key Actions**:
  1. Click decline/cancel button
  2. Confirmation modal with reason selection:
     - "Found another provider"
     - "Timing doesn't work"
     - "Changed my mind"
     - "Other"
  3. If confirmed:
     - Engagement status → DECLINED or CANCELLED
     - Other party notified
     - Page becomes read-only
     - No further actions possible
- **Expected Outcome**: Engagement ended
- **Privacy**: Contact info access revoked if was engagement-gated

### 5.5 Calendar Integration Details

#### Supported Calendar Links
Generated for each confirmed TourAppointment:

| Calendar | URL Format | Opens In |
|----------|------------|----------|
| Google Calendar | `calendar.google.com/calendar/render?action=TEMPLATE&...` | Browser/app |
| Outlook | `outlook.live.com/calendar/0/deeplink/compose?...` | Browser/app |
| Yahoo Calendar | `calendar.yahoo.com/?v=60&...` | Browser |
| Apple Calendar | `.ics` file download | Calendar.app |

#### Calendar Event Details
- **Title**: "[Meeting Type] with [Other Party Name]"
- **Time**: Confirmed date/time with timezone
- **Location**: Provider address (if facility) or "Video Call" or TBD
- **Description**:
  - Link to engagement: `olera.com/requests/[id]`
  - Provider/family name and contact (if revealed)
  - Care types discussed
  - Any notes from messages

---

## 6. Edge Case & Recovery Flows

### 6.1 Incomplete Profile Edge Cases

#### Flow EC1: User Tries to Engage Without Profile
- **Trigger**: Authenticated user without FamilyProfile clicks "Schedule a Tour"
- **Path**: CTA → EngagementConfirmationModal → Profile Blocker
- **What User Sees**:
  ```
  ┌─────────────────────────────────────────┐
  │  Complete Your Profile First            │
  │                                         │
  │  Before connecting with providers,      │
  │  we need a few details about your       │
  │  care needs.                            │
  │                                         │
  │  Missing information:                   │
  │  • Who needs care                       │
  │  • Your location                        │
  │  • Type of care needed                  │
  │                                         │
  │  [Complete Profile →]                   │
  └─────────────────────────────────────────┘
  ```
- **Path**: Click → `/care-profile/edit` → Complete → Return → Retry action
- **Pending Action**: URL params preserve intent for seamless continuation

#### Flow EC2: Provider Tries to Accept Lead Without Profile
- **Trigger**: Provider with incomplete Tier 1 tries to accept family lead
- **Path**: Click "Accept" → Blocker modal
- **What User Sees**: "Complete your provider profile to respond to families"
- **Resolution**: Complete profile → Retry

### 6.2 Empty State Flows

#### Flow ES1: No Saved Providers
- **Page**: `/saved`
- **What User Sees**:
  ```
  [Heart Icon]

  No saved providers yet

  Save providers while browsing to build
  your shortlist and compare options.

  [Browse Providers]
  ```

#### Flow ES2: No Matches Found
- **Page**: `/matches`
- **What User Sees**:
  ```
  [Sparkles Icon]

  No matches yet

  Complete your care profile to get
  personalized provider recommendations.

  [Complete Profile]  [Browse All Providers]
  ```

#### Flow ES3: No Requests/Engagements
- **Page**: `/requests`
- **What User Sees**:
  ```
  [Inbox Icon]

  No conversations yet

  When you connect with providers, your
  conversations will appear here.

  [Find Care Providers]
  ```

### 6.3 Error Recovery Flows

#### Flow ER1: Network Error During Engagement
- **Trigger**: POST `/api/requests` fails due to network
- **What User Sees**: Toast "Failed to send request. Please try again."
- **Recovery**:
  - Modal stays open
  - "Try Again" button enabled
  - Form data preserved
  - Retry with same data

#### Flow ER2: Session Expired Mid-Action
- **Trigger**: Session expires while user is composing message
- **What User Sees**:
  - Action fails
  - Toast: "Your session has expired. Please log in again."
  - AuthModal opens
- **Recovery**:
  - User logs in
  - Pending action context restored from localStorage
  - User returned to same page
  - "Your message was not sent. Would you like to try again?" prompt

#### Flow ER3: Provider No Longer Available
- **Trigger**: User tries to engage provider that was deleted/deactivated
- **What User Sees**:
  - 404 page or
  - "This provider is no longer available" message
- **Recovery**:
  - "Browse Similar Providers" CTA
  - If saved, remove from saved list automatically

### 6.4 Mode Switching Edge Cases

#### Flow MS1: Family User Switches to Provider Mode (No Provider Profile)
- **Trigger**: Click "Switch to Provider Mode" with no ProviderIdentity
- **Path**: Mode switch → `/provider/leads?onboarding=true&intent=provider`
- **Key Actions**:
  1. Mode updated in database
  2. Session updated
  3. Redirect to leads page with onboarding overlay
  4. User completes provider onboarding
  5. Provider profile created
- **Expected Outcome**: Seamless transition with guided onboarding

#### Flow MS2: Provider User Switches to Family Mode (No Family Profile)
- **Trigger**: Click "Switch to Family Mode" with no FamilyProfile
- **Path**: Mode switch → `/?onboarding=true&intent=family`
- **Key Actions**:
  1. Mode updated
  2. Redirect to home with family onboarding overlay
  3. User completes family profile
- **Expected Outcome**: Seamless transition

#### Flow MS3: User Has Both Profiles, Switches Modes
- **Trigger**: Click mode switch when both profiles exist
- **Path**: Mode switch → Landing page for that mode
- **Key Actions**:
  1. Mode updated
  2. No onboarding needed
  3. Direct redirect to:
     - FAMILY → `/care-profile`
     - PROVIDER → `/provider/leads`
  4. Nav updates to show mode-appropriate links
- **Expected Outcome**: Instant switch with no friction

### 6.5 Privacy/Contact Release Triggers

#### When Contact Info Becomes Visible

| Scenario | Before ACCEPTED | After ACCEPTED |
|----------|-----------------|----------------|
| Family → Organization | Org contact always visible | Same |
| Family → Caregiver | Caregiver contact hidden | Caregiver contact revealed |
| Provider → Family | Family contact hidden | Family contact revealed |
| Caregiver → Organization | Org contact always visible | Same |
| Organization → Caregiver | Caregiver contact hidden | Caregiver contact revealed |

#### Flow PR1: Contact Reveal on Acceptance
- **Trigger**: Request status changes from PENDING to ACCEPTED
- **System Actions**:
  1. Status update saved
  2. Contact info fields become visible in UI
  3. Notification sent: "You can now view [Name]'s contact information"
  4. Contact section in request detail shows: phone, email, address
- **Privacy Note**: Only authenticated, engaged parties see contact info

### 6.6 Seeded Demo Data Requirements

For comprehensive testing, seed data must include:

| Entity | Count | States/Variations |
|--------|-------|-------------------|
| Providers (Claimed) | 20 | All types, various completeness levels |
| Providers (Unclaimed) | 10 | Minimal data, no photos |
| Family Profiles | 15 | Various care types, budgets, timelines |
| Caregivers | 10 | Various skills, some availableForOrgs |
| Engagements | 30 | All status types (PENDING x10, ACCEPTED x10, COMPLETED x5, DECLINED x3, CANCELLED x2) |
| Tour Appointments | 15 | PROPOSED x5, CONFIRMED x5, COMPLETED x3, CANCELLED x2 |
| Messages | 50 | Across active engagements |
| Reviews | 25 | Various ratings, some with responses |
| Notifications | 40 | All types, mix of read/unread |
| Saved Providers | 20 | Various users saving various providers |
| Subscriptions | 5 | 3 FREE, 2 PRO providers |

---

## 7. Page-by-Page Path Details

### 7.1 Public Pages (13)

| URL | Purpose | Components | Primary CTA |
|-----|---------|------------|-------------|
| `/` | Homepage | Hero, Search, Categories | Search or Browse |
| `/browse` | Directory | FilterBar, MapView, Cards | View Provider |
| `/providers/[id]` | Provider detail | Tabs, Reviews, Gallery | Schedule Tour/Consult/Interview |
| `/login` | Login | LoginForm | Log In |
| `/signup` | Register | SignupForm | Create Account |
| `/forgot-password` | Password reset | ResetForm | Send Reset Link |
| `/pricing` | Pricing | PricingTable | Upgrade to PRO |
| `/privacy` | Privacy policy | Static | - |
| `/terms` | Terms | Static | - |
| `/for-providers` | Provider marketing | Hero, Features | Join as Provider |
| `/benefits` | Platform benefits | Features | Get Started |

### 7.2 Family Pages (12)

| URL | Purpose | Primary CTA | Empty State CTA |
|-----|---------|-------------|-----------------|
| `/care-profile` | Dashboard | Edit Profile | Complete Profile |
| `/care-profile/edit` | Edit profile | Save Changes | - |
| `/requests` | Engagements | Continue Conversation | Find Providers |
| `/requests/[id]` | Engagement detail | Send Message / Schedule | - |
| `/matches` | Recommendations | Contact Provider | Complete Profile |
| `/saved` | Saved list | Compare / Contact | Browse Providers |
| `/saved/compare` | Compare | Schedule Tour | - |
| `/settings` | Settings | Save | - |
| `/notifications` | Notifications | View Related | - |

### 7.3 Provider Pages (18)

| URL | Purpose | User Type | Primary CTA |
|-----|---------|-----------|-------------|
| `/provider/leads` | Family leads | Any | Accept Lead |
| `/provider/profile` | Dashboard | Any | Edit Profile |
| `/provider/profile/edit` | Edit | Any | Save Changes |
| `/provider/requests` | Engagements | Any | Continue Conversation |
| `/provider/requests/[id]` | Detail | Any | Send Message |
| `/provider/hire-staff` | Browse caregivers | ORG | Send Interview Request |
| `/provider/hire-staff/[id]` | Caregiver detail | ORG | Interview / Message |
| `/provider/candidates` | Hiring pipeline | ORG | Accept / Schedule |
| `/provider/candidates/[id]` | Candidate detail | ORG | Schedule Interview |
| `/provider/opportunities` | Job opportunities | INDIVIDUAL | View / Apply |
| `/provider/opportunities/[id]` | Opportunity detail | INDIVIDUAL | Apply |
| `/caregiver` | Browse families | INDIVIDUAL | Contact Family |
| `/caregiver/browse-organizations` | Browse orgs | INDIVIDUAL | Apply |
| `/caregiver/browse-organizations/[id]` | Org detail | INDIVIDUAL | Apply |

---

## 8. Master Audit Checklist

### 8.1 Design Consistency
- [ ] Typography: All pages use consistent heading hierarchy
- [ ] Spacing: Page padding, card padding, section gaps consistent
- [ ] Colors: No purple remnants, primary-600 for actions
- [ ] Cards: All cards use standard pattern (border, shadow, hover)
- [ ] Buttons: Primary/secondary/outline variants consistent
- [ ] Icons: Heroicons only, consistent sizes

### 8.2 Semantic Consistency
- [ ] Nav labels match page titles match breadcrumbs
- [ ] CTAs use correct terminology per provider type (Tour/Consult/Interview)
- [ ] "Leads" (provider), "Requests" (either), "Matches" (family)
- [ ] Status badges use consistent colors and text

### 8.3 Navigation Correctness
- [ ] No dead ends (every empty state has CTA)
- [ ] Breadcrumbs show entity names, not IDs
- [ ] Mode switch redirects correctly
- [ ] All links resolve (no 404s from UI)

### 8.4 CTA Clarity
- [ ] Primary CTA above fold on every page
- [ ] Secondary actions visually subordinate
- [ ] Disabled states have explanatory tooltips
- [ ] Paywall CTAs clearly explain upgrade value

### 8.5 Flow Guidance
- [ ] Onboarding prompts until profile complete
- [ ] Success modals show clear next steps
- [ ] 65+ friendly: large targets, clear language, no jargon
- [ ] Progress indicators on multi-step flows

### 8.6 Information Hierarchy
- [ ] Key info visible without scroll
- [ ] Cards show: Image → Name → Type → Rating → Location → CTA
- [ ] Hero sections don't overwhelm content

### 8.7 State Model Correctness
- [ ] PENDING/ACCEPTED/DECLINED/COMPLETED/CANCELLED displayed correctly
- [ ] Contact info gated until ACCEPTED (for caregivers/families)
- [ ] Calendar links only appear for CONFIRMED appointments

### 8.8 Privacy & Gating
- [ ] Caregiver contact hidden until engagement accepted
- [ ] Family contact hidden until engagement accepted
- [ ] Organization contact always visible
- [ ] Paywall triggers at correct points

### 8.9 Error Handling
- [ ] All pages have empty states
- [ ] Network errors show toast with retry
- [ ] Validation errors show inline
- [ ] 404/403 pages guide user back

### 8.10 Cross-Mode Coherence
- [ ] Family and provider dashboards follow same patterns
- [ ] Request pages work same way in both modes
- [ ] Notification types consistent

---

## 9. Simplification Opportunities

### 9.1 Pages to Merge or Remove

| Current | Recommendation | Rationale |
|---------|---------------|-----------|
| `/provider/opportunities` + `/provider/opportunities/[id]` | Merge into `/provider/requests` with tab | Same engagement model, reduces navigation |
| `/caregiver/browse-organizations` | Rename to `/provider/find-work` | Clearer intent, consistent with provider URL space |
| `/setup` | Remove, use GlobalOnboardingOverlay only | Duplicate functionality |
| `/onboarding` | Redirect to `/?onboarding=true` | Already just a redirect |

### 9.2 Flows to Collapse

| Current Flow | Simplification | Benefit |
|--------------|----------------|---------|
| Auth → Onboarding → Profile → Engage | Auth → Inline profile in engagement modal | Fewer steps to first meeting |
| Save → Compare → Engage | Add "Quick Compare" overlay on provider cards | Faster decision-making |
| Notification → Page → Find message | Notification deep-links to exact message | Immediate context |

### 9.3 UI Elements to Remove

| Element | Location | Rationale |
|---------|----------|-----------|
| Redundant "Back" buttons | Various detail pages | Browser back works |
| "Learn More" sections | Homepage | Focus on action, not education |
| Pricing tier comparison | Provider dashboard | Show only upgrade CTA if free |

### 9.4 CTAs to Clarify

| Current CTA | Recommended | Rationale |
|-------------|-------------|-----------|
| "Contact" | "Schedule a Tour" / "Request a Consultation" / "Schedule an Interview" | Specific to engagement type |
| "View Details" | "Continue" (if engaged) or "View Profile" (if not) | Clearer action |
| "Get Started" | "Find Care" (family) / "List Your Services" (provider) | Role-specific |

### 9.5 Information to Reduce

| Current | Simplification | Rationale |
|---------|----------------|-----------|
| Full profile summary in engagement modal | Just: Name, Type, Location, Rating | Don't overwhelm |
| All notification types in dropdown | Last 5 only, grouped by date | Scannable |
| Complete provider profile on cards | Top 4 attributes only | Focus attention |

### 9.6 Steps to Eliminate

| Current Step | Eliminate By | Benefit |
|--------------|--------------|---------|
| Acknowledgment checkbox in engagement modal | Auto-checked with info tooltip | One less click |
| Separate "Propose Time" page | Inline scheduler in request detail | No page transition |
| Review modal separate from provider page | Inline review form in completed engagement | Contextual |

---

## 10. Risk List

### 10.1 High-Risk Regressions

| Risk | Severity | Trigger | Mitigation |
|------|----------|---------|------------|
| **Paywall bypass** | Critical | API change to `/api/requests` | E2E tests for FREE tier limits |
| **Contact info leak** | Critical | UI change to gated sections | Audit all contact display components |
| **Mode switch breaks** | High | Changes to MainNav or session | Test both directions, all profile states |
| **Engagement status sync** | High | Race conditions on accept/decline | Database transactions, optimistic UI |
| **Notification links break** | High | URL structure changes | Test all notification types → page loads |

### 10.2 Medium-Risk Inconsistencies

| Risk | Severity | Symptom | Mitigation |
|------|----------|---------|------------|
| **CTA text drift** | Medium | "Contact" instead of "Schedule a Tour" | Component audit for provider type checks |
| **Badge color mismatch** | Medium | Different colors for same status | Use shared STATUS_COLORS constant |
| **Empty state variance** | Medium | Different wording/CTAs across pages | Use EmptyState component consistently |
| **Card layout drift** | Medium | Different field orders on cards | Use shared Card components |
| **Breadcrumb ID exposure** | Medium | UUIDs in breadcrumbs | Pass `currentPage` prop with entity name |

### 10.3 Low-Risk Polish Issues

| Risk | Severity | Symptom | Mitigation |
|------|----------|---------|------------|
| **Purple color remnants** | Low | Old violet classes | Global search for `violet`, `purple` |
| **Inconsistent padding** | Low | `p-4` vs `p-6` on similar elements | Design token audit |
| **Mixed icon sources** | Low | Lucide vs Heroicons | Standardize on Heroicons |
| **Orphaned pages** | Low | Pages with no nav links | Sitemap audit |

### 10.4 Integration Risks

| Risk | Severity | External Dependency | Mitigation |
|------|----------|---------------------|------------|
| **Calendar link failures** | Medium | Google/Outlook URL changes | Fallback to .ics download |
| **Auth session desync** | High | NextAuth cookie issues | Force re-auth on critical actions |
| **Stripe webhook failures** | High | Payment processing | Retry logic, manual reconciliation |
| **Map rendering issues** | Low | Google Maps API changes | Graceful degradation to address text |

### 10.5 User Experience Risks

| Risk | Severity | Symptom | Mitigation |
|------|----------|---------|------------|
| **65+ users confused** | High | Too many options, small text | Simplify flows, increase font sizes |
| **Dead-end pages** | High | No clear next action | Audit all pages for primary CTA |
| **Overwhelming onboarding** | Medium | Too many required fields | Progressive disclosure |
| **Notification overload** | Medium | Too many notifications | Consolidation, frequency limits |
| **Slow page loads** | Medium | Performance degradation | Skeleton loaders, lazy loading |

---

## Appendix A: Complete Page Inventory (52 pages)

### Public (14)
- `/`, `/browse`, `/providers`, `/providers/[id]`
- `/login`, `/signup`, `/forgot-password`
- `/pricing`, `/privacy`, `/terms`, `/benefits`, `/for-providers`
- `/admin/bootstrap`
- (SEO landing variants)

### Family (12)
- `/care-profile`, `/care-profile/edit`
- `/setup`, `/onboarding` (redirects)
- `/requests`, `/requests/[id]`, `/requests/new`
- `/matches`
- `/saved`, `/saved/compare`
- `/settings`, `/notifications`

### Provider (22)
- `/provider`, `/provider/leads`
- `/provider/profile`, `/provider/profile/edit`
- `/provider/requests`, `/provider/requests/[id]`, `/provider/requests/new`
- `/provider/hire-staff`, `/provider/hire-staff/[id]`
- `/provider/candidates`, `/provider/candidates/[id]`
- `/provider/opportunities`, `/provider/opportunities/[id]`
- `/provider/organizations`, `/provider/organizations/[id]`
- `/provider/onboarding`
- `/caregiver`, `/caregiver/browse-organizations`, `/caregiver/browse-organizations/[id]`

### Admin (4)
- `/admin/bootstrap`, `/admin/seed`
- `/admin/clear-requests`, `/admin/takedown-requests`

---

## Appendix B: Notification Type Coverage

| Type | Trigger Event | Recipient | Link To |
|------|---------------|-----------|---------|
| REQUEST_NEW | Request created | Receiving party | `/requests/[id]` or `/provider/requests/[id]` |
| REQUEST_ACCEPTED | Request accepted | Sending party | Same |
| REQUEST_DECLINED | Request declined | Sending party | Same |
| MESSAGE | New message | Other party | Same |
| TOUR_PROPOSED | Tour time proposed | Other party | Same |
| TOUR_ACCEPTED | Tour time confirmed | Both parties | Same |
| TOUR_REMINDER | 24h before tour | Both parties | Same |
| SYSTEM | Platform updates | User | Varies |

---

## Appendix C: API Endpoint Inventory

### Auth (4)
- `POST /api/auth/[...nextauth]`
- `POST /api/auth/signup`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### User (5)
- `GET/PATCH /api/user`
- `PATCH /api/user/mode`
- `POST /api/user/onboarding-complete`
- `GET /api/user/subscription`

### Providers (10)
- `GET /api/providers` (list)
- `GET/PATCH /api/providers/[id]`
- `GET /api/providers/me`
- `POST /api/providers/[id]/claim`
- `POST /api/providers/[id]/reviews`
- `GET /api/providers/[id]/reviews`
- `POST /api/providers/[id]/save`
- `DELETE /api/providers/[id]/save`

### Families (5)
- `GET /api/family-profiles`
- `GET/POST/PATCH /api/family-profiles/me`
- `GET /api/family-profiles/[id]`

### Requests (6)
- `GET /api/requests` (list)
- `POST /api/requests` (create)
- `GET/PATCH /api/requests/[id]`
- `POST /api/requests/[id]/messages`
- `POST /api/requests/[id]/tour-appointments`

### Notifications (4)
- `GET /api/notifications`
- `PATCH /api/notifications/[id]`
- `PATCH /api/notifications/mark-all-read`
- `GET /api/notifications/unread-count`

### Admin (4)
- `POST /api/admin/seed`
- `GET/POST /api/admin/takedown-requests`
- `PATCH /api/admin/takedown-requests/[id]`

---

*Document v2 - Updated with paywall flows, SEO/claim flows, lifecycle flows, edge cases, simplification opportunities, and risk list.*
