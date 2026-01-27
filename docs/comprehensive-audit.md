# Comprehensive Platform Audit Document

## Table of Contents
1. [User Types](#1-user-types)
2. [User Flows by Type](#2-user-flows-by-type)
3. [Page-by-Page Path Details](#3-page-by-page-path-details)
4. [Master Audit Checklist](#4-master-audit-checklist)

---

## 1. User Types

### 1.1 Primary User Types

| Type | Identifier | How Determined | Primary Purpose |
|------|------------|----------------|-----------------|
| **Anonymous** | No session | Not authenticated | Browse public content, view providers |
| **Family** | `activeMode = FAMILY` | Default signup or mode switch | Find care providers for loved ones |
| **Provider (Organization)** | `activeMode = PROVIDER` + `ProviderIdentity.type = ORGANIZATION` | Signup with provider intent + org setup | Receive family inquiries, hire staff |
| **Provider (Individual Caregiver)** | `activeMode = PROVIDER` + `ProviderIdentity.type = INDIVIDUAL` | Signup with provider intent + individual setup | Find families/organizations to work for |
| **Admin** | `role = ADMIN` | Bootstrap or seed | Platform administration |

### 1.2 Provider Subtypes (by `providerType`)

| Category | Types | Engagement Model | CTA Text |
|----------|-------|------------------|----------|
| **Facility** | ASSISTED_LIVING, MEMORY_CARE, NURSING_HOME, INDEPENDENT_LIVING, REHABILITATION | Tour | "Schedule a Tour" |
| **Home Care Organization** | HOME_CARE, HOME_HEALTH, HOSPICE | Consultation | "Request a Consultation" |
| **Individual** | INDEPENDENT_CAREGIVER | Interview | "Schedule an Interview" |

### 1.3 State Combinations

| Mode | Has Profile | Has ProviderIdentity | Can Access |
|------|-------------|---------------------|------------|
| FAMILY | No FamilyProfile | N/A | Browse, save (limited) |
| FAMILY | Has FamilyProfile | N/A | Full family features |
| PROVIDER | No ProviderIdentity | N/A | Redirect to onboarding |
| PROVIDER | ProviderIdentity (no Provider) | Yes | Create/claim provider |
| PROVIDER | ProviderIdentity + Provider | Yes | Full provider features |

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
  - Attempting to contact → Auth modal
  - Attempting to write review → Auth modal

#### Flow A2: Sign Up (Family Intent)
- **Entry Points**: Header "Sign Up", Auth modal, CTA buttons
- **Path**: `/signup` → `/setup` (optional) → `/care-profile`
- **Key Actions**:
  - `/signup`: Email/password, select family intent
  - `/setup`: Care profile wizard (optional)
  - `/care-profile`: Dashboard landing
- **Expected Outcome**: Account created, redirected to family dashboard
- **Failure Cases**:
  - Existing email → Error message
  - Weak password → Validation error
  - Network failure → Toast error, retry

#### Flow A3: Sign Up (Provider Intent)
- **Entry Points**: "/for-providers" CTA, signup with `?intent=provider`
- **Path**: `/signup?intent=provider` → `/provider/onboarding` → `/provider/leads`
- **Key Actions**:
  - `/signup`: Email/password, provider intent selected
  - `/provider/onboarding`: Choose org/individual, create ProviderIdentity
  - `/provider/leads`: Dashboard landing (with onboarding prompts if incomplete)
- **Expected Outcome**: Account created, provider identity set, redirected to leads
- **Failure Cases**:
  - Skip onboarding → Persistent prompts on dashboard
  - No provider profile → Limited functionality

#### Flow A4: Login
- **Entry Points**: Header "Log In", Auth modal
- **Path**: `/login` → Mode-based redirect
- **Key Actions**:
  - `/login`: Email/password
- **Expected Outcome**:
  - FAMILY mode → `/care-profile`
  - PROVIDER mode → `/provider/leads`
- **Failure Cases**:
  - Wrong credentials → Error message
  - Account locked → Error message

---

### 2.2 Family User Flows

#### Flow F1: Complete Care Profile
- **Entry Points**: Dashboard nudge, profile edit link
- **Path**: `/care-profile` → `/care-profile/edit`
- **Key Actions**:
  - Fill required fields (loved one name, location, care types)
  - Set visibility preferences
  - Set contact preferences
- **Expected Outcome**: Profile complete, visible to providers
- **Failure Cases**:
  - Missing required fields → Validation, can't enable visibility
  - Invalid location → Autocomplete guidance

#### Flow F2: Search and Engage Provider (Facility - Tour)
- **Entry Points**: Search, browse, homepage
- **Path**: `/browse` → `/providers/[id]` → Request modal → `/requests/[id]`
- **Key Actions**:
  - `/browse`: Search by location, filter by type
  - `/providers/[id]`: View profile, click "Schedule a Tour"
  - Modal: Confirm profile sharing, write message
  - `/requests/[id]`: View conversation, propose dates
- **Expected Outcome**: Request sent, provider notified, tour scheduled
- **Failure Cases**:
  - Profile incomplete → Redirect to complete profile first
  - Provider declined → Notification, status update
  - Provider unresponsive → Status stays PENDING

#### Flow F3: Search and Engage Provider (Home Care - Consultation)
- **Entry Points**: Search, browse
- **Path**: `/browse` → `/providers/[id]` → Request modal → `/requests/[id]`
- **Key Actions**:
  - Same as F2, but CTA is "Request a Consultation"
  - Tour appointment model used for consultation scheduling
- **Expected Outcome**: Consultation request sent and scheduled
- **Failure Cases**: Same as F2

#### Flow F4: Search and Engage Provider (Caregiver - Interview)
- **Entry Points**: Search, browse, matches
- **Path**: `/browse` → `/providers/[id]` → Request modal → `/requests/[id]`
- **Key Actions**:
  - Same as F2, but CTA is "Schedule an Interview"
  - **Contact info gated until ACCEPTED**
- **Expected Outcome**: Interview request sent, caregiver contact revealed after acceptance
- **Failure Cases**:
  - Caregiver declines → No contact info revealed
  - Profile incomplete → Must complete before requesting

#### Flow F5: Manage Saved Providers
- **Entry Points**: Heart icons, "Saved" nav link
- **Path**: `/saved` → `/saved/compare` (optional) → `/providers/[id]`
- **Key Actions**:
  - `/saved`: View saved list, remove items
  - `/saved/compare`: Side-by-side comparison
  - Individual provider detail
- **Expected Outcome**: Organized shortlist, easy comparison
- **Failure Cases**:
  - No saved items → Empty state with CTA to browse

#### Flow F6: View and Respond to Provider Outreach
- **Entry Points**: Notification bell, `/requests` page
- **Path**: Notification → `/requests/[id]`
- **Key Actions**:
  - View incoming request from provider
  - Accept/decline engagement
  - Continue conversation if accepted
- **Expected Outcome**: Engagement established or declined
- **Failure Cases**:
  - Spam requests → Report/decline options needed

#### Flow F7: View Recommendations/Matches
- **Entry Points**: "Matches" nav link
- **Path**: `/matches`
- **Key Actions**:
  - View algorithm-matched providers
  - View active engagements section
  - Click through to provider profiles
- **Expected Outcome**: Relevant provider recommendations
- **Failure Cases**:
  - Profile incomplete → No matches, prompt to complete
  - No matches found → Empty state with browse CTA

#### Flow F8: Write Review
- **Entry Points**: Provider detail page, completed engagement
- **Path**: `/providers/[id]` → Review modal
- **Key Actions**:
  - Click "Write a Review"
  - Rate (1-5 stars), add title, content, relationship, length of stay
  - Submit
- **Expected Outcome**: Review published, provider score updated
- **Failure Cases**:
  - Already reviewed → Error (one review per provider)
  - Content too short → Validation error

#### Flow F9: Switch to Provider Mode
- **Entry Points**: Profile dropdown "Switch to Provider Mode"
- **Path**: Current page → Mode switch API → Provider dashboard or onboarding
- **Key Actions**:
  - Click mode switch button
  - If no ProviderIdentity → Redirect to `/provider/leads?onboarding=true`
  - If has ProviderIdentity → Redirect to `/provider/leads`
- **Expected Outcome**: User now sees provider UI
- **Failure Cases**:
  - Mode switch fails → Toast error, stay in current mode

---

### 2.3 Provider (Organization) Flows

#### Flow PO1: Complete Provider Profile
- **Entry Points**: Dashboard nudges, profile edit link
- **Path**: `/provider/profile` → `/provider/profile/edit`
- **Key Actions**:
  - Complete Tier 1 fields (name, type, location, care types)
  - Add Tier 2 fields (contact, pricing, photos, licensing)
  - Enable visibility
- **Expected Outcome**: Profile visible in search, Olera Score calculated
- **Failure Cases**:
  - Missing Tier 1 → Can't enable visibility
  - No photos → Lower completion score

#### Flow PO2: Claim Unclaimed Provider
- **Entry Points**: Provider detail page "Claim this listing"
- **Path**: `/providers/[id]` → Claim modal → `/provider/profile`
- **Key Actions**:
  - Verify ownership
  - Submit claim
  - Profile linked to account
- **Expected Outcome**: Provider claimed, full edit access
- **Failure Cases**:
  - Already owns provider → Error message
  - Provider already claimed → Error message

#### Flow PO3: Browse and Respond to Family Leads
- **Entry Points**: Dashboard, "Leads" nav link, notifications
- **Path**: `/provider/leads` → `/provider/requests/[id]`
- **Key Actions**:
  - `/provider/leads`: View matched families, filter by care type/location
  - Click family card → View family profile (gated contact)
  - Accept/decline engagement
  - `/provider/requests/[id]`: Message, propose tour/consultation
- **Expected Outcome**: Family engaged, tour/consultation scheduled
- **Failure Cases**:
  - Subscription required → Paywall modal (PRO required to accept)
  - Family withdraws → Notification, status update

#### Flow PO4: Browse and Hire Caregivers
- **Entry Points**: "Hire Staff" nav link
- **Path**: `/provider/hire-staff` → `/provider/hire-staff/[id]` → `/provider/candidates/[id]`
- **Key Actions**:
  - `/provider/hire-staff`: Browse available caregivers
  - `/provider/hire-staff/[id]`: View caregiver profile, send interview request
  - `/provider/candidates`: Manage hiring pipeline
  - `/provider/candidates/[id]`: View candidate details, schedule interview
- **Expected Outcome**: Caregiver hired or engaged for interview
- **Failure Cases**:
  - Caregiver declines → Status update
  - No available caregivers → Empty state

#### Flow PO5: Manage Incoming Applications (from Caregivers)
- **Entry Points**: "Candidates" nav link, notifications
- **Path**: `/provider/candidates` (Received tab)
- **Key Actions**:
  - View caregivers who applied
  - Accept/decline applications
  - Schedule interviews
- **Expected Outcome**: Hiring pipeline managed
- **Failure Cases**:
  - No applications → Empty state

#### Flow PO6: Manage Active Engagements
- **Entry Points**: Dashboard, "Requests" nav link
- **Path**: `/provider/requests` → `/provider/requests/[id]`
- **Key Actions**:
  - View all sent/received requests
  - Continue conversations
  - Propose/confirm appointments
  - Mark complete
- **Expected Outcome**: Engagements progress through lifecycle
- **Failure Cases**:
  - Stale engagements → Manual cleanup needed

---

### 2.4 Provider (Individual Caregiver) Flows

#### Flow PC1: Complete Caregiver Profile
- **Entry Points**: Dashboard nudges, profile edit link
- **Path**: `/provider/profile` → `/provider/profile/edit`
- **Key Actions**:
  - Complete profile (name, skills, certifications, availability)
  - Set `availableForOrganizations` flag if seeking org work
  - Upload photos, certifications
- **Expected Outcome**: Profile visible, can receive requests
- **Failure Cases**:
  - Profile incomplete → Not visible to families/orgs

#### Flow PC2: Browse Families Seeking Care
- **Entry Points**: "Find Families" nav or `/caregiver`
- **Path**: `/caregiver` → Family detail → Request
- **Key Actions**:
  - Browse families with care needs
  - Filter by care type, location, budget
  - Send outreach request
- **Expected Outcome**: Connection with family established
- **Failure Cases**:
  - No matching families → Empty state
  - Family profile private → Not visible

#### Flow PC3: Browse Organizations Hiring
- **Entry Points**: "Browse Organizations" nav link
- **Path**: `/caregiver/browse-organizations` → `/caregiver/browse-organizations/[id]`
- **Key Actions**:
  - Browse hiring organizations
  - View organization details
  - Apply for position
- **Expected Outcome**: Application sent to organization
- **Failure Cases**:
  - No hiring orgs → Empty state

#### Flow PC4: View and Respond to Interview Requests
- **Entry Points**: Notifications, `/provider/opportunities`
- **Path**: Notification → `/provider/opportunities/[id]` or `/provider/requests/[id]`
- **Key Actions**:
  - View incoming interview requests (from families or orgs)
  - Accept/decline
  - Schedule interview time
- **Expected Outcome**: Interview scheduled, contact info exchanged
- **Failure Cases**:
  - Decline → Request closed
  - No-show → Manual status update needed

#### Flow PC5: Manage Employment Opportunities
- **Entry Points**: "Opportunities" nav link
- **Path**: `/provider/opportunities`
- **Key Actions**:
  - View all job opportunities from orgs
  - Track application status
  - Respond to messages
- **Expected Outcome**: Track hiring pipeline from caregiver side
- **Failure Cases**:
  - No opportunities → Empty state with browse orgs CTA

---

### 2.5 Admin Flows

#### Flow AD1: Bootstrap Admin Account
- **Entry Points**: Direct URL when no admin exists
- **Path**: `/admin/bootstrap`
- **Key Actions**:
  - Set admin credentials (first time only)
- **Expected Outcome**: Admin account created
- **Failure Cases**:
  - Admin exists → Page blocked

#### Flow AD2: Seed Demo Data
- **Entry Points**: Admin dashboard, direct URL
- **Path**: `/admin/seed`
- **Key Actions**:
  - Trigger seed script
  - View seeding progress
- **Expected Outcome**: Database populated with demo data
- **Failure Cases**:
  - Already seeded → Warning, option to re-seed

#### Flow AD3: Handle Takedown Requests
- **Entry Points**: Admin notifications, direct URL
- **Path**: `/admin/takedown-requests`
- **Key Actions**:
  - Review pending takedown requests
  - Approve (soft-delete provider) or deny with reason
- **Expected Outcome**: Provider removed or request denied
- **Failure Cases**:
  - Invalid request → Error handling

---

## 3. Page-by-Page Path Details

### 3.1 Public Pages

| URL | Purpose | Auth Required | Key Components | Key Actions |
|-----|---------|---------------|----------------|-------------|
| `/` | Homepage | No | Hero, Search, Featured, CareTypes | Search, browse categories |
| `/browse` | Provider directory | No | FilterBar, MapView, ProviderCards | Filter, sort, save, view |
| `/providers/[id]` | Provider detail | No | Tabs, Reviews, Contact, Gallery | Contact, review, save, claim |
| `/login` | Authentication | No | LoginForm | Login, forgot password |
| `/signup` | Registration | No | SignupForm, IntentSelector | Create account |
| `/forgot-password` | Password reset | No | ResetForm | Request reset |
| `/pricing` | Pricing info | No | PricingTable | View plans |
| `/privacy` | Privacy policy | No | Static content | Read |
| `/terms` | Terms of service | No | Static content | Read |
| `/for-providers` | Provider marketing | No | Hero, Features, CTA | Learn more, sign up |
| `/benefits` | Platform benefits | No | FeatureList | Learn more |

### 3.2 Family Pages (Authenticated)

| URL | Purpose | Auth | Mode | Profile Required | Key Components |
|-----|---------|------|------|------------------|----------------|
| `/care-profile` | Family dashboard | Yes | FAMILY | No (but limited) | Calendar, Stats, Actions |
| `/care-profile/edit` | Edit profile | Yes | FAMILY | No | ProfileForm |
| `/setup` | Initial wizard | Yes | FAMILY | No | SetupWizard |
| `/requests` | Engagement list | Yes | FAMILY | No | Tabs, RequestCards |
| `/requests/[id]` | Engagement detail | Yes | FAMILY | No | Messages, TourScheduler |
| `/requests/new` | New request | Yes | FAMILY | For visibility | RequestForm |
| `/matches` | Recommendations | Yes | FAMILY | Partial | MatchCards, EngagementList |
| `/saved` | Saved providers | Yes | FAMILY | No | SavedList |
| `/saved/compare` | Compare providers | Yes | FAMILY | No | CompareTable |
| `/settings` | Account settings | Yes | Any | No | SettingsForm |
| `/notifications` | All notifications | Yes | Any | No | NotificationList |

### 3.3 Provider Pages (Authenticated + Provider Mode)

| URL | Purpose | Identity Type | Key Components |
|-----|---------|---------------|----------------|
| `/provider/leads` | Family inquiries | Any | FamilyCards, Filters, Pipeline |
| `/provider/profile` | Provider dashboard | Any | Stats, Calendar, Completion |
| `/provider/profile/edit` | Edit profile | Any | ProfileForm |
| `/provider/requests` | Sent requests | Any | RequestCards, Tabs |
| `/provider/requests/[id]` | Request detail | Any | Messages, Scheduler |
| `/provider/requests/new` | New outreach | Any | OutreachForm |
| `/provider/hire-staff` | Browse caregivers | ORGANIZATION | CaregiverCards, Filters |
| `/provider/hire-staff/[id]` | Caregiver detail | ORGANIZATION | Profile, InterviewForm |
| `/provider/candidates` | Hiring pipeline | ORGANIZATION | Pipeline, Tabs |
| `/provider/candidates/[id]` | Candidate detail | ORGANIZATION | Profile, Status |
| `/provider/opportunities` | Job listings | INDIVIDUAL | OpportunityCards |
| `/provider/opportunities/[id]` | Opportunity detail | INDIVIDUAL | Details, ApplyForm |
| `/provider/organizations` | Browse orgs | INDIVIDUAL | OrgCards |
| `/provider/organizations/[id]` | Org detail | INDIVIDUAL | Profile, ApplyButton |
| `/provider/onboarding` | Provider setup | None (creates) | OnboardingWizard |
| `/caregiver` | Browse families | INDIVIDUAL | FamilyCards |
| `/caregiver/browse-organizations` | Browse hiring orgs | INDIVIDUAL | OrgCards |
| `/caregiver/browse-organizations/[id]` | Org detail | INDIVIDUAL | Profile, Apply |

### 3.4 Admin Pages

| URL | Purpose | Auth | Role Required |
|-----|---------|------|---------------|
| `/admin/bootstrap` | Create first admin | No* | None (self-gating) |
| `/admin/seed` | Seed demo data | Yes | ADMIN |
| `/admin/clear-requests` | Clear requests | Yes | ADMIN |
| `/admin/takedown-requests` | Manage takedowns | Yes | ADMIN |

---

## 4. Master Audit Checklist

### 4.1 Design Consistency Checklist

#### Typography
- [ ] All page titles use `text-2xl sm:text-3xl lg:text-4xl font-bold`
- [ ] Section headings use `text-xl font-semibold` or `text-lg font-semibold`
- [ ] Body text uses `text-base` or `text-sm` consistently
- [ ] Labels use `text-sm font-medium text-gray-700`
- [ ] Helper text uses `text-xs text-gray-500`
- [ ] No orphaned font size classes (random `text-md`, etc.)

#### Spacing
- [ ] Page padding: `px-4 sm:px-6 lg:px-8` with `max-w-7xl mx-auto`
- [ ] Section spacing: `py-8` or `py-12` consistently
- [ ] Card padding: `p-4` or `p-6` consistently
- [ ] Modal padding: `p-6` consistently
- [ ] Gap utilities: `gap-4` for grids, `gap-2` for inline items
- [ ] No hardcoded pixel values in spacing

#### Color System
- [ ] Primary actions: `bg-primary-600 hover:bg-primary-700 text-white`
- [ ] Secondary actions: `bg-gray-100 hover:bg-gray-200 text-gray-700`
- [ ] Destructive actions: `bg-red-600 hover:bg-red-700 text-white`
- [ ] Success states: `bg-green-*` variants
- [ ] Warning states: `bg-amber-*` variants
- [ ] Info states: `bg-blue-*` variants
- [ ] No purple/violet colors (legacy - should be primary)
- [ ] Consistent badge color coding

#### Card Patterns
- [ ] All cards use `border border-gray-200 rounded-xl shadow-sm`
- [ ] Card hover: `hover:shadow-md hover:border-primary-200`
- [ ] Card transitions: `transition-all duration-200`
- [ ] Consistent internal layout (image → content → actions)
- [ ] Badges positioned consistently (top-left or top-right)
- [ ] Save button (heart) positioned consistently

#### Button Styles
- [ ] Primary: `bg-primary-600 text-white rounded-lg px-4 py-2`
- [ ] Secondary: `bg-gray-100 text-gray-700 rounded-lg px-4 py-2`
- [ ] Outline: `border border-primary-600 text-primary-600 rounded-lg px-4 py-2`
- [ ] Link style: `text-primary-600 hover:text-primary-700 font-medium`
- [ ] Disabled: `disabled:opacity-50 disabled:cursor-not-allowed`
- [ ] Loading state with spinner icon

#### Iconography
- [ ] Consistent icon sizes: `w-4 h-4`, `w-5 h-5`, `w-6 h-6`
- [ ] Icons from same library (Heroicons)
- [ ] Consistent icon + text spacing (`gap-2`)
- [ ] Icons have proper stroke width (`strokeWidth={2}`)

---

### 4.2 Semantic Consistency Checklist

#### Navigation Labels
- [ ] "Care Profile" (not "Dashboard" for families)
- [ ] "Find Care" or "Browse" (not "Search")
- [ ] "Leads" (not "Inquiries" for providers)
- [ ] "Requests" (not "Engagements" in UI)
- [ ] "Matches" (not "Recommendations")
- [ ] "Saved" (not "Favorites" or "Bookmarks")

#### CTA Labels by Context
| Provider Type | Family CTA | Provider CTA |
|---------------|------------|--------------|
| Facility | "Schedule a Tour" | "View Lead" |
| Home Care | "Request a Consultation" | "View Lead" |
| Caregiver | "Schedule an Interview" | "View Opportunity" |

- [ ] CTAs match provider type everywhere
- [ ] No generic "Contact" for specific engagement types
- [ ] "View Details" for read-only, "Continue" for active

#### Page Titles & Breadcrumbs
- [ ] Page title matches `<title>` tag
- [ ] Breadcrumb labels match navigation labels
- [ ] URLs use kebab-case (`hire-staff` not `hireStaff`)
- [ ] Dynamic breadcrumbs show entity name (not ID)

#### Terminology Alignment
- [ ] "Provider" = Organization or caregiver offering care
- [ ] "Family" = User seeking care
- [ ] "Caregiver" = Individual provider (not organization)
- [ ] "Lead" = Family inquiry (provider perspective)
- [ ] "Request" = Engagement request (any direction)
- [ ] "Candidate" = Caregiver in hiring pipeline
- [ ] "Opportunity" = Job/position for caregivers

---

### 4.3 Navigation Correctness Checklist

#### No Dead Ends
- [ ] Every empty state has CTA to browse/create
- [ ] Back buttons work correctly
- [ ] Breadcrumbs link to valid pages
- [ ] Modal close returns to previous state

#### Correct Redirects
- [ ] Login → Mode-appropriate dashboard
- [ ] Signup → Onboarding or dashboard
- [ ] Mode switch → Correct landing page
- [ ] 401 → Login page
- [ ] 403 → Access denied message
- [ ] 404 → Not found page with navigation

#### Route Protection
- [ ] `/provider/*` requires Provider mode
- [ ] `/admin/*` requires Admin role
- [ ] Dynamic routes validate entity exists
- [ ] No route loops

#### Mode-Specific Navigation
- [ ] MainNav shows correct links for mode
- [ ] Provider nav hides for family mode
- [ ] Family nav hides for provider mode
- [ ] Mode indicator visible in header

---

### 4.4 CTA Clarity Checklist

#### Context-Appropriate CTAs
- [ ] Tour CTA only for facility types
- [ ] Consultation CTA only for home care types
- [ ] Interview CTA only for caregivers
- [ ] Hire CTA only for organization providers

#### Action Clarity
- [ ] Primary action visually prominent
- [ ] Secondary actions clearly subordinate
- [ ] Destructive actions require confirmation
- [ ] Disabled states explained (tooltip/message)

#### State-Appropriate CTAs
- [ ] PENDING: "Waiting for response" (no action)
- [ ] ACCEPTED: "Continue conversation", "Propose time"
- [ ] COMPLETED: "Leave review" (if not reviewed)
- [ ] DECLINED/CANCELLED: No action (read-only)

---

### 4.5 Flow Guidance Checklist

#### Progressive Disclosure
- [ ] Complex forms broken into steps
- [ ] Optional fields clearly marked
- [ ] Required fields validated incrementally
- [ ] Help text where needed

#### Clear Next Steps
- [ ] Success states show what's next
- [ ] Empty states guide to action
- [ ] Onboarding prompts until complete
- [ ] Profile completion nudges visible

#### 65+ Friendly
- [ ] Large touch targets (min 44x44px)
- [ ] High contrast text
- [ ] Clear, simple language
- [ ] No jargon without explanation
- [ ] Large readable fonts (min 16px base)

---

### 4.6 Information Hierarchy Checklist

#### Above the Fold
- [ ] Page purpose clear immediately
- [ ] Primary CTA visible without scroll
- [ ] Key info (name, rating, location) prominent
- [ ] Hero sections not overwhelming

#### Card Information Order
1. Image/Avatar
2. Name/Title
3. Type/Category badge
4. Key attributes (rating, price, location)
5. Description (truncated)
6. Actions (CTA, save)

- [ ] All cards follow this order
- [ ] No critical info cut off
- [ ] Consistent truncation rules

#### Visual Weight
- [ ] Headings have proper weight hierarchy
- [ ] Important badges stand out
- [ ] Secondary info visually subdued
- [ ] Actions have appropriate prominence

---

### 4.7 Card System Consistency Checklist

#### ProviderCard Audit
- [ ] Image with fallback gradient
- [ ] Verified badge (if applicable)
- [ ] Type badge with correct color
- [ ] Rating/OleraScore displayed
- [ ] Location shown
- [ ] Price range (if available)
- [ ] Care types as badges
- [ ] Truncated description
- [ ] Save button
- [ ] View/CTA button

#### FamilyCard Audit
- [ ] Avatar/photo with fallback
- [ ] Name displayed
- [ ] Posted date
- [ ] Care types needed
- [ ] Location
- [ ] Budget range
- [ ] Timeline badge (color-coded)
- [ ] Save button
- [ ] View/CTA button

#### CaregiverCard Audit
- [ ] Photo with fallback (primary colors, not purple)
- [ ] Name displayed
- [ ] Type badge ("Independent Caregiver")
- [ ] Certifications badges
- [ ] Experience/skills
- [ ] Hourly rate (if shown)
- [ ] Availability indicator
- [ ] Save button
- [ ] Interview CTA

---

### 4.8 State Model Correctness Checklist

#### Engagement Status Display
| Status | Badge Color | Family Text | Provider Text |
|--------|-------------|-------------|---------------|
| PENDING | Amber | "Pending Response" | "New Request" |
| ACCEPTED | Green | "Accepted" | "Accepted" |
| DECLINED | Red | "Declined" | "Declined" |
| COMPLETED | Blue | "Completed" | "Completed" |
| CANCELLED | Gray | "Cancelled" | "Cancelled" |

- [ ] Status badges use correct colors
- [ ] Status text matches user perspective
- [ ] Transitions shown correctly

#### Notification States
- [ ] Unread indicator (red dot)
- [ ] Read indicator (no dot)
- [ ] Count shows "9+" for >9
- [ ] Bell dropdown shows recent
- [ ] Full list at `/notifications`

#### Saved/Favorited States
- [ ] Heart filled = saved (red)
- [ ] Heart outline = not saved (gray)
- [ ] Toggle animates
- [ ] Saved list updates immediately

---

### 4.9 Privacy & Contact Gating Checklist

#### Contact Info Visibility Rules

| Viewer | Viewing | Engagement Status | Contact Visible |
|--------|---------|-------------------|-----------------|
| Family | Organization | Any | Always |
| Family | Caregiver | PENDING | No |
| Family | Caregiver | ACCEPTED/COMPLETED | Yes |
| Provider | Family | PENDING | No |
| Provider | Family | ACCEPTED/COMPLETED | Yes |
| Anonymous | Any | N/A | No (except org phone/basic) |

- [ ] Caregiver contact hidden until engagement accepted
- [ ] Family contact hidden until engagement accepted
- [ ] Organization contact always visible to families
- [ ] Anonymous users can't see contact info
- [ ] Contact reveal triggers notification

#### Profile Visibility
- [ ] Family `isPublic = false` hides from provider search
- [ ] Provider `isVisible = false` hides from family search
- [ ] Profile completion gates visibility toggle
- [ ] Claimed/unclaimed affects display but not privacy

---

### 4.10 Data Integrity Checklist

#### Location System
- [ ] LocationAutocomplete used for all location inputs
- [ ] City/State displayed consistently
- [ ] Invalid locations show helpful error
- [ ] Map markers display correctly

#### Profile Completeness
- [ ] Completion percentage calculates correctly
- [ ] Tier 1 fields gate visibility
- [ ] Nudge messages show correct missing fields
- [ ] Progress bar updates on save

#### Review System
- [ ] One review per user per provider enforced
- [ ] Rating displays correctly (stars + number)
- [ ] Helpful count increments
- [ ] OleraScore updates after review

#### Olera Score
- [ ] Score displays on all provider cards
- [ ] Badge color indicates score range
- [ ] Calculation includes reviews + completion
- [ ] Updates when underlying data changes

#### Seeded/Unclaimed Providers
- [ ] "Claim this listing" CTA visible
- [ ] Unclaimed badge displayed
- [ ] Limited editing until claimed
- [ ] Claim flow works correctly

---

### 4.11 Notification System Checklist

#### Event Coverage
| Event | Notification Created | Email Sent |
|-------|---------------------|------------|
| New request | Yes | Yes (if enabled) |
| Request accepted | Yes | Yes (if enabled) |
| Request declined | Yes | Yes (if enabled) |
| Request completed | Yes | No |
| New message | Yes | Yes (if enabled) |
| Tour proposed | Yes | Yes (if enabled) |
| Tour accepted | Yes | Yes (if enabled) |
| Tour reminder | Yes | Yes (if enabled) |
| Profile view | Optional | No |

- [ ] All events create notifications
- [ ] Email respects notification settings
- [ ] Notification links to correct page
- [ ] Notification body is accurate

#### Bell Dropdown
- [ ] Shows most recent notifications
- [ ] Unread count accurate
- [ ] "View all" links to `/notifications`
- [ ] Mark all read works
- [ ] Individual click marks as read

---

### 4.12 Error Handling Checklist

#### Empty States
- [ ] Contextual icon
- [ ] Clear title
- [ ] Helpful description
- [ ] CTA to take action
- [ ] Uses EmptyState component variants

#### Loading States
- [ ] Skeleton loaders for cards
- [ ] Spinner for actions
- [ ] Disabled buttons during loading
- [ ] Loading text where appropriate

#### Validation Messages
- [ ] Inline errors below fields
- [ ] Clear error message text
- [ ] Red border on invalid fields
- [ ] Focus moves to first error

#### Network Errors
- [ ] Toast notification for API errors
- [ ] Retry option where appropriate
- [ ] Graceful degradation
- [ ] No blank screens

---

### 4.13 Cross-Platform Coherence Checklist

#### Family ↔ Provider Analogous Pages

| Family Page | Provider Equivalent | Same Patterns? |
|-------------|---------------------|----------------|
| `/care-profile` | `/provider/profile` | [ ] Yes |
| `/requests` | `/provider/requests` | [ ] Yes |
| `/requests/[id]` | `/provider/requests/[id]` | [ ] Yes |
| `/matches` | `/provider/leads` | [ ] Yes |
| `/saved` | Saved families feature | [ ] Yes |

- [ ] Same PageHero component used
- [ ] Same card patterns
- [ ] Same empty states
- [ ] Same action patterns
- [ ] Same notification handling

#### Consistent Experiences
- [ ] Mode switch preserves expected UX
- [ ] Similar features work similarly
- [ ] Terminology consistent across modes
- [ ] Visual patterns recognizable

---

## 5. Sprint Task Conversion Template

### Task Format
```
[ ] {Category}: {Specific Issue}
    - Page: {URL}
    - Severity: Critical | High | Medium | Low
    - Type: Bug | Design | UX | Data | Accessibility
    - Details: {Description}
    - Fix: {Proposed solution}
```

### Priority Matrix
| Severity | Definition |
|----------|------------|
| Critical | Blocks user flow, data loss, security issue |
| High | Major UX problem, significant inconsistency |
| Medium | Minor inconsistency, polish issue |
| Low | Nice-to-have improvement |

### Sample Task Entries
```
[ ] Design: Purple color remnant in caregiver fallback image
    - Page: /provider/hire-staff
    - Severity: Low
    - Type: Design
    - Details: CaregiverCard using purple gradient instead of primary
    - Fix: Change from-purple-* to from-primary-*

[ ] Navigation: Breadcrumb shows ID instead of name
    - Page: /providers/[id]
    - Severity: Medium
    - Type: UX
    - Details: Dynamic breadcrumb shows UUID instead of provider name
    - Fix: Pass currentPage prop with provider.name

[ ] CTA: Wrong button text for caregiver engagement
    - Page: /providers/[id] (caregiver)
    - Severity: High
    - Type: UX
    - Details: Shows "Schedule a Tour" instead of "Schedule an Interview"
    - Fix: Check providerType and use correct CTA text
```

---

## 6. Execution Plan

### Phase 1: Automated Scans
1. Run through all public pages logged out
2. Run through all family flows logged in as family
3. Run through all provider (org) flows logged in as org
4. Run through all provider (caregiver) flows logged in as caregiver
5. Run through admin flows logged in as admin

### Phase 2: Manual Review per Page
For each page:
1. Check design consistency (colors, spacing, typography)
2. Check semantic consistency (labels, CTAs, terminology)
3. Check navigation (back, breadcrumbs, links)
4. Check states (loading, empty, error, success)
5. Check responsiveness (desktop, tablet, mobile)

### Phase 3: Flow Testing
For each flow:
1. Complete happy path end-to-end
2. Test failure cases (validation, network, permission)
3. Test edge cases (empty data, long text, special characters)
4. Verify notifications created
5. Verify state transitions correct

### Phase 4: Cross-Reference
1. Compare family vs provider analogous pages
2. Verify privacy rules applied correctly
3. Check data consistency across views
4. Validate business rules enforced

---

## Appendix A: Page Inventory (48 pages)

### Public (13)
- `/`, `/browse`, `/providers/[id]`, `/providers`
- `/login`, `/signup`, `/forgot-password`
- `/pricing`, `/privacy`, `/terms`, `/benefits`, `/for-providers`
- `/admin/bootstrap`

### Family (12)
- `/care-profile`, `/care-profile/edit`
- `/setup`, `/onboarding`
- `/requests`, `/requests/[id]`, `/requests/new`
- `/matches`
- `/saved`, `/saved/compare`
- `/settings`, `/notifications`

### Provider (18)
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

## Appendix B: API Endpoint Inventory (50+ endpoints)

See routes documentation in codebase for complete API reference.

Key endpoint categories:
- `/api/auth/*` - Authentication
- `/api/user/*` - User management
- `/api/providers/*` - Provider operations
- `/api/family-profiles/*` - Family profiles
- `/api/requests/*` - Engagement requests
- `/api/notifications/*` - Notifications
- `/api/admin/*` - Admin operations

---

*Document generated for comprehensive platform audit. Use checklists as sprint task sources.*
