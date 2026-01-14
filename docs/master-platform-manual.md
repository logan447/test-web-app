# Olera Platform — Master Systems Manual

> **Purpose**: This document serves as the source of truth for all platform systems. It will be iteratively refined as we work through each chapter, answer key questions, and make architectural decisions.
>
> **Status Indicators**:
> - ✅ **Built** — Core functionality exists and works
> - 🟡 **Partial** — Some features exist, gaps or fragility present
> - ⬜ **Not Built** — Planned but not yet implemented
> - ❌ **Deferred** — Out of scope for demo

---

## Table of Contents

### Core Platform Systems
1. [Authentication & Account Management](#chapter-1-authentication--account-management)
2. [Mode System (Family vs Provider)](#chapter-2-mode-system-family-vs-provider)
3. [Onboarding Wizard (Shared System)](#chapter-3-onboarding-wizard-shared-system)
4. [Family Care Profiles](#chapter-4-family-care-profiles)
5. [Provider Profiles](#chapter-5-provider-profiles)
6. [Provider Identity & Gating](#chapter-6-provider-identity--gating)
7. [Provider Directory (Public)](#chapter-7-provider-directory--search)
8. [Provider Claiming (Organizations Only)](#chapter-8-provider-claiming-organizations-only)

### User Dashboards
9. [Family Dashboard](#chapter-9-family-dashboard)
10. [Provider Dashboard](#chapter-10-provider-dashboard)

### Engagement Systems
11. [Consultation Requests](#chapter-11-consultation-requests)
12. [Messaging System](#chapter-12-messaging-system)
13. [Multi-Context Scheduling](#chapter-13-multi-context-scheduling)
14. [Saved / Favorites](#chapter-14-saved--favorites)
15. [Reviews & Ratings](#chapter-15-reviews--ratings)
16. [Notifications](#chapter-16-notifications)

### Matching & Growth
17. [Profile Completion & Matching](#chapter-17-profile-completion--matching)
18. [Subscriptions & Paywalls](#chapter-18-subscriptions--paywalls)
19. [Caregiver Hiring Marketplace](#chapter-19-caregiver-hiring-marketplace)

### Administration
20. [Admin System](#chapter-20-admin-system)
21. [Data Seeding & Demo Data](#chapter-21-data-seeding--demo-data)

### Navigation & Settings
22. [Navigation & Routing](#chapter-22-navigation--routing)
23. [Settings & Preferences](#chapter-23-settings--preferences)

### Marketing & Content
24. [Marketing & SEO Pages](#chapter-24-marketing--seo-pages)
25. [File Uploads & Media](#chapter-25-file-uploads--media)

### Trust & Operations
26. [Trust & Safety](#chapter-26-trust--safety)
27. [Help & Support](#chapter-27-help--support)
28. [Error Handling & Monitoring](#chapter-28-error-handling--monitoring)

### Future Considerations
29. [Audit & Activity Logging](#chapter-29-audit--activity-logging)
30. [Localization & Accessibility](#chapter-30-localization--accessibility)
31. [Referral & Attribution](#chapter-31-referral--attribution)
32. [Data Export & Portability](#chapter-32-data-export--portability)
33. [Performance & Caching](#chapter-33-performance--caching)

---

## Foundational Architectural Decisions

> These decisions apply across multiple chapters and establish the core patterns for the platform.

### Two-Threshold Model (DECIDED)

| Threshold | Requirements | What It Enables |
|-----------|--------------|-----------------|
| **Account Creation** | Email + password (or social auth) | Explore platform, but profile invisible, no matching |
| **Profile Visibility + Matching** | Name, location, basic role-specific fields | Profile card renders, visibility toggles work, matching activates |

**Visibility Threshold Fields** (minimum to cross):

| Profile Type | Required for Visibility |
|--------------|------------------------|
| Family | Full name, location, care type needed |
| Individual Caregiver | Full name, location, services offered |
| Provider Organization | Org name, location, provider type |

**Behavior if threshold not met**:
- Profile exists but marked invisible
- User prompted to complete required fields if they try to enable visibility
- Matching algorithm ignores profiles below threshold

### Route Architecture Principles (DECIDED)

| Principle | Meaning |
|-----------|---------|
| **No dynamic dashboards** | Each dashboard is a separate, explicit page |
| **No mode-dependent routes** | URL determines content, not mode |
| **One page, one purpose** | No overloaded pages that change based on context |
| **Dropdown = Route map** | Each account dropdown item → one static route |
| **Mode controls visibility only** | Mode affects nav items shown, not page behavior |
| **Profiles inside dashboards** | Care Profile and Provider Profile are sections within dashboards, not separate nav items |

### Family Mode Navigation (DECIDED)

| Nav Item | Route | Contains |
|----------|-------|----------|
| **Find Providers** | `/` (homepage) | Provider directory with filters |
| **Saved Providers** | `/family/saved-providers` | Saved provider list |
| **My Providers** | `/family/my-providers` | All engagements (requests, messages, conversations) |
| **Family Dashboard** | `/family/dashboard` | Summary, schedule, activity, **Care Profile editing** |

### Provider Mode Navigation (DECIDED)

| Nav Item | Route | Contains |
|----------|-------|----------|
| **Find Families** | `/provider/find-families` | Browse families with visibility enabled |
| **Saved Families** | `/provider/saved-families` | Saved family list |
| **My Families** | `/provider/my-families` | All engagements with families |
| **Provider Dashboard** | `/provider/dashboard` | Summary, stats, calendar, **Provider Profile editing** |

### Org Provider — Additional Navigation (Conditional)

| Nav Item | Route | Purpose |
|----------|-------|---------|
| **Find Care Staff** | `/provider/find-caregivers` | Browse caregivers seeking jobs |
| **My Candidates** | `/provider/my-candidates` | Engagements with caregivers |

### Individual Caregiver — Additional Navigation (Conditional)

| Nav Item | Route | Purpose |
|----------|-------|---------|
| **Find Hiring Orgs** | `/caregiver/find-organizations` | Browse orgs with hiring enabled |
| **My Job Opportunities** | `/caregiver/my-opportunities` | Job engagements with orgs |

### Route Migration Summary

| Current Route | New Route | Action |
|---------------|-----------|--------|
| `/dashboard` | `/family/dashboard` | Rename |
| `/dashboard/requests` | `/family/my-providers` | Rename |
| `/dashboard/saved` | `/family/saved-providers` | Rename |
| `/dashboard/care-profiles` | Remove | Consolidate into `/family/dashboard` |
| `/provider/requests` | `/provider/find-families` | Rename |
| `/provider/saved` | `/provider/saved-families` | Rename |
| `/provider/hire-staff` | `/provider/find-caregivers` | Rename |
| `/provider/hiring-requests` | `/provider/my-candidates` | Rename |
| `/caregiver/browse-organizations` | `/caregiver/find-organizations` | Rename |
| (new) | `/provider/my-families` | Create |
| (new) | `/caregiver/my-opportunities` | Create |

---

## Chapter 1: Authentication & Account Management

**Purpose**: User registration, login, session management, and account lifecycle.

| Item | Status | Notes |
|------|--------|-------|
| 1.1 User Registration (Signup) | ✅ | `/signup`, `/api/auth/signup` |
| 1.2 Login / Logout | ✅ | NextAuth credentials provider |
| 1.3 Session Management (JWT) | ✅ | JWT strategy with role/mode in token |
| 1.4 Password Reset | ⬜ | Not implemented |
| 1.5 Account Deletion | ⬜ | Not implemented |
| 1.6 Email Verification | ⬜ | Not implemented |

### Key Questions
- [x] Is email verification required for demo? → **No, deferred**
- [x] Password reset priority? → **Deferred for demo**

### Architectural Notes

#### 1.1 Signup Entry Points & Mode Defaulting (DECIDED)

Signup entry point determines the user's initial `activeMode`:

| Entry Point | Default Mode | Rationale |
|-------------|--------------|-----------|
| `/signup` (direct) | FAMILY | Most users seeking care |
| `/for-providers` CTA | PROVIDER | Explicitly targeting providers |
| `/providers/[id]` — "Claim this page" CTA | PROVIDER | Provider claiming action |
| `/providers/[id]` — save/contact action | FAMILY | User was browsing as family |
| Inline modal (anywhere) | Inherit from context | Preserve user intent |

**Implementation**: Add optional `intent` query param to signup (e.g., `/signup?intent=provider`). Use this to set `User.activeMode` on account creation.

**Cross-reference**: Signup triggers the onboarding wizard — see Chapter 3 for wizard details.

#### 1.2 Login Mode Defaulting (DECIDED)

Always restore the user's last active mode from `User.activeMode` in the database.

| Scenario | Behavior |
|----------|----------|
| Returning user logs in | Restore `User.activeMode` from DB (whatever they last used) |
| New user logs in for first time | Use mode set during signup (per 1.1 decision) |

**Rationale**: Profile-completion-based defaulting is confusing and unpredictable. Users should return to whatever mode they were last using.

**Implementation**: Remove profile-completion-based mode calculation from login flow in `lib/auth.ts`. Simply read `User.activeMode` from DB.

#### 1.3 Session (JWT) Contents (DECIDED)

Current JWT fields are sufficient for demo:

| Field | Purpose |
|-------|---------|
| `id` | User identification for DB lookups |
| `email` | Display in UI |
| `name` | Display greeting/avatars |
| `role` | Access control (FAMILY/PROVIDER/ADMIN) |
| `activeMode` | Which view to render (family vs provider) |

**Note**: Additional fields (e.g., `providerId`) can be added later if needed. Keep JWT minimal for now.

#### 1.4 Password Reset (DECIDED)

**Status**: ❌ Deferred for demo.

**Rationale**: Demo users will use known test accounts. Requires email service integration which is out of scope for initial demo.

**Workaround**: Provide demo credentials list. Manual DB reset if needed.

**Post-demo**: Implement before real user testing.

#### 1.5 Account Deletion (DECIDED)

**Status**: ❌ Deferred for demo.

**Rationale**: Test accounts reset via seed script. Requires cascading delete logic. GDPR/CCPA compliance not needed until real users.

**Post-demo**: Implement before public launch.

#### 1.6 Email Verification (DECIDED)

**Status**: ❌ Deferred for demo.

**Rationale**: Demo uses test accounts with known emails. Spam prevention not a concern during controlled demo.

**Post-demo**: Consider implementing before public launch to prevent fake accounts.

---

## Chapter 2: Mode System (Family vs Provider)

**Purpose**: Allow users to switch between family (care-seeker) and provider (care-giver) modes within a single account.

| Item | Status | Notes |
|------|--------|-------|
| 2.1 Mode Storage (`User.activeMode`) | ✅ | Database field exists |
| 2.2 Mode Switching (toggle) | 🟡 | Works but has caused routing bugs |
| 2.3 Mode Defaulting on Login | 🟡 | Based on profile completion %; logic may need revision |
| 2.4 Mode Persistence Across Sessions | ✅ | Stored in DB |
| 2.5 URL Mode Parameter (`?mode=`) | 🟡 | Implemented but fragile, causes "bleeding" |
| 2.6 Mode Selection Modal (signup/onboarding) | 🟡 | May be broken/incomplete |

### Key Questions
- [x] Should signup source (e.g., `/for-providers`) influence default mode? → **Yes (see Chapter 1.1)**
- [x] Is the URL `?mode=` parameter necessary, or can we rely solely on DB state? → **Remove URL param, DB only**
- [x] What triggers mode defaulting on login? → **Restore from DB (see Chapter 1.2)**

### Architectural Notes

#### 2.1 Mode Storage — Single Source of Truth (DECIDED)

`User.activeMode` in the database is the sole source of truth for mode.

| Layer | Role |
|-------|------|
| Database (`User.activeMode`) | Authoritative source |
| JWT Session (`activeMode`) | Mirrors DB, refreshed on login/mode switch |
| URL (`?mode=`) | ❌ **Remove entirely** — causes sync bugs and "bleeding" |

**Implementation**: Remove all `?mode=` URL parameter handling from codebase.

#### 2.2 Mode Switching Behavior (DECIDED)

**Toggle Location**: Available in both account dropdown AND main navigation. Always shows opposite mode.

**Landing Pages by Mode**:

| Mode Switched To | Landing Page | Notes |
|------------------|--------------|-------|
| FAMILY | `/` ("Find Providers") | Discovery-first, not dashboard |
| PROVIDER | `/provider/find-families` ("Find Families") | Discovery-first, not dashboard |

Dashboards remain accessible via nav but are not the default landing on mode switch.

**Cross-reference**: See Foundational Architectural Decisions for full route architecture.

**Provider Mode Without Profile** — No Blocking:

| Principle | Behavior |
|-----------|----------|
| No forced onboarding | User can explore all provider tabs freely |
| Lightweight wizard | Dismissible modal prompts profile creation |
| Saveable & exitable | User can partially complete and return later |
| Gentle nudges | Encourage profile creation without blocking exploration |

**Key**: Low friction, user autonomy. Avoid drop-off from forced flows.

#### 2.3–2.5 Mode Defaulting, Persistence, URL Parameter (DECIDED)

These items are resolved by decisions above:
- **2.3 Mode Defaulting on Login**: Restore from DB (see Chapter 1.2)
- **2.4 Mode Persistence**: Stored in `User.activeMode` (see 2.1)
- **2.5 URL Mode Parameter**: Remove entirely (see 2.1)

#### 2.6 Mode Selection (DECIDED)

No separate mode-selection modal. Mode is determined by:
- Signup intent (`?intent=` param) — see Chapter 1.1
- Onboarding wizard first question ("Get Started" flow) — see Chapter 3
- Manual toggle — see 2.2

**Cross-reference**: All onboarding wizard details are in Chapter 3.

---

## Chapter 3: Onboarding Wizard (Shared System)

**Purpose**: Single, lightweight wizard supporting multiple entry points and user types. This is a shared system referenced by other chapters.

| Item | Status | Notes |
|------|--------|-------|
| 3.1 Wizard Triggers | 🟡 | Multiple entry points, needs consolidation |
| 3.2 Wizard Variants (Family / Caregiver / Org) | 🟡 | Exists but may need cleanup |
| 3.3 Intent & Subtype Selection | 🟡 | "Get Started" + provider subtype question |
| 3.4 Field Collection | 🟡 | Maps to FamilyProfile / Provider models |
| 3.5 Visibility Settings | 🟡 | Toggles per user type |
| 3.6 Early Exit & Partial Completion | 🟡 | Save-as-you-go, safe defaults |
| 3.7 Post-Wizard Routing | 🟡 | New signup → dashboard; returning → stay |
| 3.8 Profile Completion Integration | 🟡 | Contributes to completion % |

### Key Questions
- [x] Should onboarding be skippable or mandatory? → **Skippable, non-blocking**
- [x] What are the distinct entry points? → **See 3.1 below**
- [x] What is the minimum info required for each user type? → **None beyond email/password (see below)**

### Profile Data Philosophy (DECIDED)

**Cross-reference**: See Foundational Architectural Decisions → Two-Threshold Model for full details.

| Threshold | Requirements | What It Enables |
|-----------|--------------|-----------------|
| **Account Creation** | Email + password only | Explore platform freely |
| **Visibility + Matching** | Name, location, basic role fields | Profile visible, matching active |

| Principle | Detail |
|-----------|--------|
| **Low friction at signup** | Only email + password required to create account |
| **Intentional friction for visibility** | Minimal fields required before profile can be discovered |
| **Progressive enhancement** | Additional fields improve match quality and confidence |
| **No blocking** | Users can explore without completing profile |

### Architectural Notes

#### 3.1 Wizard Triggers (DECIDED)

| Entry Point | Wizard Variant | Intent Source |
|-------------|----------------|---------------|
| "Get Started" button (main nav) | Asks first: Family or Provider? | Explicit selection |
| `/signup` (direct) | Family | Implicit (default) |
| `/signup?intent=provider` | Provider (asks subtype) | Implicit from param |
| `/for-providers` CTA | Provider (asks subtype) | Implicit from context |
| "Claim this page" on `/providers/[id]` | Provider Org | Implicit from context |
| "Contact provider" on `/providers/[id]` | Family | Implicit from context |
| First switch to provider mode (no profile) | Provider (asks subtype) | Implicit from mode |
| First switch to family mode (no profile) | Family | Implicit from mode |

#### 3.2 Wizard Variants (DECIDED)

| Variant | User Type | Key Characteristics |
|---------|-----------|---------------------|
| **Family** | Families seeking care | Collects care needs, loved one info |
| **Individual Caregiver** | Independent caregivers | Collects skills, availability, employment preferences |
| **Provider Organization** | Care facilities, agencies | Collects org info, services, may involve claiming |

#### 3.3 Intent & Subtype Selection (DECIDED)

**"Get Started" flow** (explicit intent):
- Step 1: "Are you looking for care?" vs "Are you a care provider?"
- If provider → Step 2: "Are you an individual caregiver?" vs "Are you a care organization?"

**All other entry points**: Intent is implicit, wizard skips to relevant variant.

**Provider subtype is required** before any other provider fields can be saved.

#### 3.4 Field Collection (DECIDED)

Wizard collects essential fields only. Full profile editing happens in dedicated profile pages.

| Variant | Essential Fields | Stores To |
|---------|------------------|-----------|
| Family | Name, location, care type needed, relationship | `FamilyProfile` |
| Individual Caregiver | Name, location, services offered, availability | `Provider` (type=INDEPENDENT_CAREGIVER) |
| Provider Org | Org name, location, provider type, services | `Provider` |

**Detailed field lists**: See Chapter 4 (Family) and Chapter 5 (Provider).

#### 3.5 Visibility Settings (DECIDED)

Visibility is a prominent wizard step. Controls who can discover the profile.

**Default Visibility** (if user exits before setting):

| Profile Type | Default | Rationale |
|--------------|---------|-----------|
| Family | **Not visible** | Privacy-first; opt-in to be discovered |
| Individual Caregiver | **Not visible** | Privacy-first; opt-in |
| Provider Organization | **Visible to families** | Directory model; orgs expect to be found |

**Visibility Toggles by Type**:

| Profile Type | Toggle 1 | Toggle 2 |
|--------------|----------|----------|
| Family | Visible to providers | — |
| Individual Caregiver | Visible to families | Visible to hiring orgs |
| Provider Org | Visible to families | Visible as hiring org to caregivers |

#### 3.6 Early Exit & Partial Completion (DECIDED)

| Principle | Implementation |
|-----------|----------------|
| **Dismissible** | X button always visible; closes wizard immediately |
| **Save-as-you-go** | Each field/section saves on blur or "Next" |
| **Resume later** | Partial progress stored; wizard reopens where user left off |
| **No hard blocks** | User can navigate away and explore freely |
| **Safe defaults** | Visibility defaults applied if not explicitly set |
| **Subtype required** | Provider wizard requires subtype before saving any data |

#### 3.7 Post-Wizard Routing (DECIDED)

| Scenario | Redirect To |
|----------|-------------|
| New user completing signup wizard | Dashboard (family or provider) |
| Returning user completing wizard | Stay on current page |
| User dismisses wizard early | Stay on current page |

#### 3.8 Profile Completion Integration (DECIDED)

- Wizard progress contributes to visible profile completion %
- Incomplete profiles show nudge in dashboard/nav: "Complete your profile"
- Completion % stored in DB (not calculated on-the-fly) — details in Chapter 17

---

## Chapter 4: Family Care Profiles

**Purpose**: Allow families to describe their care needs and preferences to help match with providers.

| Item | Status | Notes |
|------|--------|-------|
| 4.1 Care Profile Creation | ✅ | `/dashboard/care-profiles` |
| 4.2 Loved One Info (name, age, relationship) | ✅ | Fields in `FamilyProfile` |
| 4.3 Care Needs Assessment (care level, conditions, mobility) | ✅ | Multiple fields exist |
| 4.4 Personality & Preferences | ✅ | Extensive fields |
| 4.5 Location & Contact Preferences | ✅ | Fields exist |
| 4.6 Budget & Timeline | ✅ | Fields exist |
| 4.7 Privacy/Visibility Settings | ✅ | `profileVisibility`, etc. |
| 4.8 Profile Completion Tracking | 🟡 | May exist but unclear |
| 4.9 Multiple Care Profiles per Account | 🟡 | Schema supports single profile per user currently |

### Key Questions
- [ ] Should families be able to create multiple care profiles (e.g., for different family members)?
- [ ] Which fields are truly required vs optional?
- [ ] How does profile completion affect matching/visibility?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 5: Provider Profiles

**Purpose**: Allow care providers to describe their services, qualifications, and offerings.

| Item | Status | Notes |
|------|--------|-------|
| 5.1 Provider Model (basic info) | ✅ | Extensive `Provider` model |
| 5.2 Provider Types | ✅ | HOME_CARE, ASSISTED_LIVING, MEMORY_CARE, NURSING_HOME, HOSPICE, REHABILITATION, INDEPENDENT_CAREGIVER |
| 5.3 Services Offered | ✅ | `careTypesOffered`, detailed service arrays |
| 5.4 Location & Service Area | ✅ | address, city, state, zip, serviceRadius |
| 5.5 Photos & Media | ✅ | photos array, coverPhoto |
| 5.6 Licensing & Certifications | ✅ | Fields exist |
| 5.7 Pricing Information | ✅ | Extensive pricing fields |
| 5.8 Staff Information | ✅ | Ratios, credentials, training |
| 5.9 Amenities & Features | ✅ | Multiple arrays |
| 5.10 Specialty Programs | ✅ | Memory care, hospice, etc. |
| 5.11 About / Team / Virtual Tour | ✅ | teamMembersJson, virtualTourUrl |
| 5.12 Claimed vs Unclaimed Status | ✅ | `claimed` boolean |
| 5.13 Profile Completion Tracking | 🟡 | `/api/dashboard/profile-completion` exists |
| 5.14 Type-Specific Field Display | 🟡 | May not be conditional by provider type |

### Key Questions
- [ ] Which fields should be required vs optional per provider type?
- [ ] How should unclaimed profiles differ in display/editing?
- [ ] What is the minimum viable profile for each provider type?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 6: Provider Identity & Gating

**Purpose**: Gate provider features for new users until they establish their provider identity.

| Item | Status | Notes |
|------|--------|-------|
| 6.1 ProviderIdentity Model | ✅ | Exists in schema |
| 6.2 Identity Type (ORGANIZATION vs INDIVIDUAL) | ✅ | Field exists |
| 6.3 Onboarding Complete Flag | ✅ | Field exists |
| 6.4 Linking to Provider Profile | ✅ | `providerId` field |
| 6.5 Feature Gating Logic | 🟡 | Unclear how/if used consistently |

### Key Questions
- [ ] What features are gated behind ProviderIdentity?
- [ ] Is this model necessary, or can gating be simplified?
- [ ] How does this interact with mode system?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 7: Provider Directory & Search

**Purpose**: Public-facing directory for families to discover and search for care providers.

| Item | Status | Notes |
|------|--------|-------|
| 7.1 Provider Listing Page | ✅ | `/providers` |
| 7.2 Location-Based Search | ✅ | By zip, city, radius |
| 7.3 Filter by Provider Type | ✅ | HOME_CARE, ASSISTED_LIVING, etc. |
| 7.4 Filter by Services/Specialties | 🟡 | May need verification |
| 7.5 Filter by Price Range | 🟡 | If pricing is public |
| 7.6 Sort Options | 🟡 | Distance, rating, newest |
| 7.7 Provider Cards | ✅ | Components exist |
| 7.8 Provider Detail Page | ✅ | `/providers/[id]` |
| 7.9 Map View | 🟡 | Leaflet integrated, unclear if working |
| 7.10 "Near Me" Geolocation | 🟡 | Browser geolocation |
| 7.11 City/State SEO Pages | ⬜ | Not built |
| 7.12 Search Results Caching | ⬜ | Performance optimization |

### Key Questions
- [ ] What filters are most important for demo?
- [ ] Is map view needed for demo?
- [ ] SEO pages priority?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 8: Provider Claiming (Organizations Only)

**Purpose**: Allow organizations to claim their pre-seeded directory profiles and gain edit access.

**Important**: Only organizations have unclaimed profiles. Families and individual caregivers never have unclaimed profiles.

| Item | Status | Notes |
|------|--------|-------|
| 8.1 Claim Request Submission | ⬜ | No claim workflow visible |
| 8.2 Verification Methods | ⬜ | Email domain, phone, documentation |
| 8.3 Admin Review Queue | ⬜ | No admin claim review |
| 8.4 Claimed → Editable Transition | 🟡 | `claimed` field exists, logic unclear |
| 8.5 Claim Notifications | ⬜ | Not implemented |
| 8.6 Rejection Handling | ⬜ | Not implemented |

### Key Questions
- [ ] What verification methods should be supported?
- [ ] What information can unclaimed profiles display?
- [ ] Admin review workflow requirements?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 9: Family Dashboard

**Purpose**: Central hub for families to manage their care search activities.

| Item | Status | Notes |
|------|--------|-------|
| 9.1 Dashboard Home | ✅ | `/dashboard` |
| 9.2 My Requests (outbound consultations) | ✅ | `/dashboard/requests` |
| 9.3 Request Detail + Messaging | ✅ | `/dashboard/requests/[id]` |
| 9.4 Saved Providers | ✅ | `/dashboard/saved` |
| 9.5 Care Profile Management | ✅ | `/dashboard/care-profiles` |
| 9.6 Activity Feed | 🟡 | `/api/dashboard/activity` exists |
| 9.7 Dashboard Stats/Summary | 🟡 | `/api/dashboard/stats` exists |
| 9.8 Profile Completion Prompts | 🟡 | Unclear if shown |
| 9.9 Quick Actions | 🟡 | Search providers, create request, etc. |

### Key Questions
- [ ] What should the dashboard home prioritize?
- [ ] Activity feed requirements?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 10: Provider Dashboard

**Purpose**: Central hub for providers to manage inquiries and their profile.

| Item | Status | Notes |
|------|--------|-------|
| 10.1 Dashboard Home | ✅ | `/provider/dashboard` |
| 10.2 Inbound Requests (from families) | ✅ | `/provider/requests` |
| 10.3 Request Detail + Messaging | ✅ | `/provider/requests/[id]` |
| 10.4 Saved Families | ✅ | `/provider/saved` |
| 10.5 Hiring Requests (from/to caregivers) | 🟡 | `/provider/hiring-requests` exists |
| 10.6 Browse Caregivers to Hire | 🟡 | `/provider/hire-staff` exists |
| 10.7 Profile Completion Tracking | 🟡 | API exists |
| 10.8 Scheduled Appointments | 🟡 | `/api/dashboard/tours` exists |
| 10.9 Profile Edit Access | 🟡 | Link to edit provider profile |

### Key Questions
- [ ] What should provider dashboard prioritize?
- [ ] Hiring features needed for demo?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 11: Consultation Requests

**Purpose**: Enable families to initiate contact with providers through structured requests.

| Item | Status | Notes |
|------|--------|-------|
| 11.1 Request Creation (family → provider) | ✅ | `/dashboard/requests/new` |
| 11.2 Request Types | ✅ | CONSULTATION, HIRING |
| 11.3 Request Status Workflow | ✅ | PENDING → ACCEPTED → DECLINED / COMPLETED / CANCELLED |
| 11.4 Contact Reason | ✅ | Tour, pricing, question, placement assistance |
| 11.5 Preferred Contact Method | ✅ | Field exists |
| 11.6 Request Listing (both sides) | ✅ | Works |
| 11.7 Request Expiration | ⬜ | Auto-close stale requests |

### Key Questions
- [ ] Are all request statuses being used correctly?
- [ ] Request expiration rules?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 12: Messaging System

**Purpose**: Enable communication between families and providers within request contexts.

| Item | Status | Notes |
|------|--------|-------|
| 12.1 Messages Within Requests | ✅ | `Message` model, API exists |
| 12.2 Read/Unread Status | ✅ | `read`, `readAt` fields |
| 12.3 Typing Indicators | 🟡 | Fields exist, unclear if working |
| 12.4 File Attachments | 🟡 | `attachments` JSON field exists |
| 12.5 Real-time Updates | 🟡 | Polling-based, not WebSocket |
| 12.6 Message Notifications | 🟡 | Linked to notification system |

### Key Questions
- [ ] Is polling acceptable for demo, or do we need real-time?
- [ ] File attachments needed for demo?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 13: Multi-Context Scheduling

**Purpose**: Support scheduling for various engagement types across different user relationships.

### Scheduling Contexts

| Context | Relationship | Notes |
|---------|--------------|-------|
| **Tours** | Family → Facility (assisted living, memory care, nursing home, rehab) | Visit scheduling |
| **Consultations** | Family → Home Care Agency | Service consultation |
| **Interviews** | Family → Individual Caregiver | Hiring interview |
| **Hiring Interviews** | Organization ↔ Individual Caregiver | Employment interview |

### Features

| Item | Status | Notes |
|------|--------|-------|
| 13.1 Scheduling Model | 🟡 | `TourAppointment` exists, may need generalization |
| 13.2 Context-Aware CTAs & Language | ⬜ | Currently hardcoded to "tour" language |
| 13.3 Propose Appointment | 🟡 | API exists |
| 13.4 Accept / Decline Flow | 🟡 | Status field exists |
| 13.5 Reschedule Flow | ⬜ | Not implemented |
| 13.6 Cancellation Flow | 🟡 | Status exists, UI unclear |
| 13.7 Appointment Reminders | ⬜ | Not implemented |
| 13.8 Calendar Integration (external) | ⬜ | Google, Apple, Outlook |
| 13.9 Video Call Scheduling | 🟡 | `/api/requests/[id]/video-call` exists |

### Key Questions
- [ ] Should all scheduling contexts use the same model, or separate models?
- [ ] Context-specific field requirements?
- [ ] Video call integration requirements?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 14: Saved / Favorites

**Purpose**: Allow users to save and organize items of interest for later reference.

| Item | Status | Notes |
|------|--------|-------|
| 14.1 Families Save Providers | ✅ | `SavedProvider` model, API |
| 14.2 Providers Save Families | ✅ | `SavedFamilyProfile` model, API |
| 14.3 Notes on Saved Items | ✅ | `notes` field exists |
| 14.4 Saved Lists UI | ✅ | Both dashboards have `/saved` |
| 14.5 Unsave Functionality | ✅ | Should exist |

### Key Questions
- [ ] Any issues with current implementation?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 15: Reviews & Ratings

**Purpose**: Enable families to share experiences and help others make informed decisions.

| Item | Status | Notes |
|------|--------|-------|
| 15.1 Review Model | ✅ | `Review` model exists |
| 15.2 Submit Review | 🟡 | API exists |
| 15.3 Display Reviews on Provider | 🟡 | Components likely exist |
| 15.4 Aggregate Rating | ✅ | `averageRating`, `reviewCount` on Provider |
| 15.5 Helpful Votes | ✅ | `helpfulCount` field, API exists |
| 15.6 Review Moderation | 🟡 | `approved` field exists |
| 15.7 Review Eligibility | ⬜ | Must have engaged with provider? |

### Key Questions
- [ ] Who can leave reviews? Any verification?
- [ ] Moderation workflow for demo?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 16: Notifications

**Purpose**: Keep users informed of relevant activity and updates.

| Item | Status | Notes |
|------|--------|-------|
| 16.1 In-App Notification Count | ✅ | `/api/notifications/unread-count` |
| 16.2 Mark Notifications Viewed | ✅ | `/api/notifications/mark-viewed` |
| 16.3 Notification List UI | 🟡 | Unclear if complete |
| 16.4 Notification Types | 🟡 | New message, request status change, etc. |
| 16.5 Per-Request Notification Settings | 🟡 | `notificationSettings` JSON field |
| 16.6 Email Notifications | ⬜ | Not implemented |
| 16.7 SMS Notifications | ⬜ | Not implemented |

### Key Questions
- [ ] What notification types are needed for demo?
- [ ] In-app only for demo, or email required?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 17: Profile Completion & Matching

**Purpose**: Track profile completeness and provide basic matching between families and providers.

| Item | Status | Notes |
|------|--------|-------|
| 17.1 Provider Profile Completion % | 🟡 | API exists, used for mode defaulting |
| 17.2 Family Profile Completion % | 🟡 | Unclear if tracked |
| 17.3 "Complete Your Profile" Prompts | 🟡 | May exist in dashboard |
| 17.4 Completion Storage (DB vs calculated) | 🟡 | Currently calculated on-the-fly |
| 17.5 Match Scoring (family ↔ provider) | ⬜ | Not implemented |
| 17.6 Recommended Providers (for families) | ⬜ | Not implemented |
| 17.7 Recommended Families (for providers) | ⬜ | Not implemented |

### Key Questions
- [ ] Should completion % be stored in DB or calculated?
- [ ] Match scoring algorithm requirements?
- [ ] Is matching needed for demo?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 18: Subscriptions & Paywalls

**Purpose**: Monetization through tiered access to premium features.

| Item | Status | Notes |
|------|--------|-------|
| 18.1 Subscription Model | ✅ | `Subscription` model exists |
| 18.2 Tiers | ✅ | FREE, BASIC, PRO |
| 18.3 Contact View Limits | ✅ | `contactViewsUsed`, `contactViewsLimit` |
| 18.4 Contact View Tracking | ✅ | `ContactView` model, API |
| 18.5 Contact Masking | 🟡 | `contact-masking.ts` exists |
| 18.6 Paywall UI | 🟡 | `/components/Paywall` exists |
| 18.7 Stripe Integration | ⬜ | Fields exist, not connected |
| 18.8 Subscription Management Portal | ⬜ | Not implemented |
| 18.9 Upgrade/Downgrade Flow | ⬜ | Not implemented |

### Key Questions
- [ ] Is Stripe needed for demo, or mock subscription states?
- [ ] What features are gated at each tier?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 19: Caregiver Hiring Marketplace

**Purpose**: Enable organizations to find and hire individual caregivers, and caregivers to find employment.

| Item | Status | Notes |
|------|--------|-------|
| 19.1 Caregiver Browse (for organizations) | 🟡 | `/provider/hire-staff` exists |
| 19.2 Organization Browse (for caregivers) | 🟡 | `/caregiver/browse-organizations` exists |
| 19.3 Hiring Request (org → caregiver) | 🟡 | RequestType=HIRING exists |
| 19.4 Caregiver Profile Creation | 🟡 | Uses Provider model with type=INDEPENDENT_CAREGIVER |
| 19.5 Availability Flags | ✅ | `availableForFamilies`, `availableForOrganizations` |
| 19.6 Hiring Request Status Workflow | 🟡 | Reuses ConsultRequest statuses |

### Key Questions
- [ ] Is the hiring marketplace in scope for demo?
- [ ] Should caregivers have a separate model from Provider?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 20: Admin System

**Purpose**: Administrative tools for platform management and oversight.

| Item | Status | Notes |
|------|--------|-------|
| 20.1 Admin Role | ✅ | `UserRole.ADMIN` exists |
| 20.2 Seed Database | ✅ | `/admin/seed` |
| 20.3 Clear Requests | ✅ | `/admin/clear-requests` |
| 20.4 User Management UI | ⬜ | No admin UI |
| 20.5 Provider Management UI | ⬜ | No admin UI |
| 20.6 Claim Review Queue | ⬜ | Not implemented |
| 20.7 Review Moderation Queue | ⬜ | Not implemented |
| 20.8 Analytics Dashboard | ⬜ | Not implemented |

### Key Questions
- [ ] What admin features are needed for demo?
- [ ] Claim review workflow priority?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 21: Data Seeding & Demo Data

**Purpose**: Populate the platform with realistic data for development and demonstrations.

| Item | Status | Notes |
|------|--------|-------|
| 21.1 Seed Script | ✅ | `prisma/seed.ts` |
| 21.2 Comprehensive Seed | ✅ | `prisma/seed-comprehensive.ts` |
| 21.3 Demo User Accounts | 🟡 | Exists, may need review |
| 21.4 Sample Providers (organizations) | 🟡 | Seeded, need to verify quality |
| 21.5 Sample Caregivers | 🟡 | May need addition |
| 21.6 Sample Requests/Conversations | 🟡 | May be seeded |
| 21.7 Sample Reviews | 🟡 | May need addition |
| 21.8 Demo Script/Walkthrough Doc | ⬜ | Not written |
| 21.9 Data Reset Capability | 🟡 | Clear requests exists |

### Key Questions
- [ ] What demo scenarios need to be pre-seeded?
- [ ] Demo account credentials documentation?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 22: Navigation & Routing

**Purpose**: Application navigation structure and route protection.

| Item | Status | Notes |
|------|--------|-------|
| 22.1 Main Navigation | ✅ | `MainNav.tsx` |
| 22.2 Mode-Aware Nav Items | 🟡 | Switches based on mode |
| 22.3 Protected Routes (middleware) | ✅ | Auth check in middleware |
| 22.4 Login Redirect (returnUrl) | 🟡 | Recent fixes applied |
| 22.5 Mode URL Parameter Preservation | 🟡 | Fragile, causes bleeding |
| 22.6 Route Structure | ✅ | `/dashboard/*` (family) vs `/provider/*` (provider) |
| 22.7 404 / Error Pages | 🟡 | May need verification |
| 22.8 Breadcrumbs | ⬜ | Not implemented |

### Key Questions
- [ ] Is the `?mode=` URL parameter causing more problems than it solves?
- [ ] Should we remove it and rely solely on DB state?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 23: Settings & Preferences

**Purpose**: User account settings and preference management.

| Item | Status | Notes |
|------|--------|-------|
| 23.1 Settings Page | ✅ | `/settings` |
| 23.2 User Profile Settings | 🟡 | `/api/user/profile` exists |
| 23.3 Notification Preferences | 🟡 | Unclear scope |
| 23.4 Privacy Settings | 🟡 | In FamilyProfile, not standalone |
| 23.5 Account Security | ⬜ | Change password, etc. |

### Key Questions
- [ ] What settings are needed for demo?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 24: Marketing & SEO Pages

**Purpose**: Public-facing pages for marketing, SEO, and legal compliance.

| Item | Status | Notes |
|------|--------|-------|
| 24.1 Homepage | ✅ | `/` (provider search) |
| 24.2 For Providers Landing | ✅ | `/for-providers` |
| 24.3 Terms of Service | ✅ | `/terms` |
| 24.4 Privacy Policy | ✅ | `/privacy` |
| 24.5 City/State Directory Pages | ⬜ | SEO landing pages |
| 24.6 Service Category Pages | ⬜ | By care type |
| 24.7 Guides/Articles/Blog | ⬜ | Content marketing |
| 24.8 About Us | ⬜ | Company page |

### Key Questions
- [ ] SEO pages priority for demo?
- [ ] Content strategy deferred?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 25: File Uploads & Media

**Purpose**: Handle image and document uploads throughout the platform.

| Item | Status | Notes |
|------|--------|-------|
| 25.1 Image Upload API | ✅ | `/api/upload/images` |
| 25.2 Vercel Blob Storage | ✅ | Configured |
| 25.3 Profile Photo Upload | ✅ | Integrated |
| 25.4 Provider Photo Gallery | ✅ | Components exist |
| 25.5 Document Uploads (certificates) | 🟡 | `certificateUrls` field exists |
| 25.6 File Size Limits | 🟡 | May need verification |
| 25.7 Image Optimization | 🟡 | Next/Image usage |

### Key Questions
- [ ] Any upload issues to address?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 26: Trust & Safety

**Purpose**: Build user trust through verification, moderation, and safety features.

| Item | Status | Notes |
|------|--------|-------|
| 26.1 Provider Verification Badges | ⬜ | Visual indicator of verified/claimed status |
| 26.2 Background Check Integration | ⬜ | Third-party integration (Checkr, etc.) — deferred |
| 26.3 Report/Flag Content or User | ⬜ | Abuse reporting mechanism |
| 26.4 Block User | ⬜ | Prevent contact from specific users |
| 26.5 Content Moderation Queue | ⬜ | Admin review of flagged content |
| 26.6 Fraud Detection | ⬜ | Duplicate accounts, spam |

### Key Questions
- [ ] Verification badges for demo?
- [ ] Report button for demo?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 27: Help & Support

**Purpose**: Provide users with help resources and support channels.

| Item | Status | Notes |
|------|--------|-------|
| 27.1 FAQ / Help Center | ⬜ | Static content pages |
| 27.2 Contact Support Form | ⬜ | Email or in-app |
| 27.3 Live Chat | ⬜ | Intercom, Crisp — deferred |
| 27.4 Feedback Collection | ⬜ | Simple form or widget |

### Key Questions
- [ ] Minimal FAQ page for demo?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 28: Error Handling & Monitoring

**Purpose**: Ensure application stability and enable debugging.

| Item | Status | Notes |
|------|--------|-------|
| 28.1 Global Error Boundaries (React) | 🟡 | May need verification |
| 28.2 API Error Responses (consistent format) | 🟡 | Standardization needed |
| 28.3 Error Logging (Sentry, etc.) | ⬜ | Third-party integration |
| 28.4 Uptime Monitoring | ⬜ | External service |
| 28.5 Loading States | 🟡 | Components exist |
| 28.6 Empty States | 🟡 | May need improvement |

### Key Questions
- [ ] Error handling audit for demo stability?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 29: Audit & Activity Logging

**Purpose**: Track key actions for debugging, compliance, and admin visibility.

| Item | Status | Notes |
|------|--------|-------|
| 29.1 User Action Log | ⬜ | Login, mode switch, request sent |
| 29.2 Admin Action Log | ⬜ | Track admin operations |
| 29.3 Data Change History | ⬜ | For sensitive fields |

### Key Questions
- [ ] Needed for demo? Likely deferred.

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 30: Localization & Accessibility

**Purpose**: Support diverse users through language options and accessibility compliance.

| Item | Status | Notes |
|------|--------|-------|
| 30.1 Multi-Language Support (i18n) | ⬜ | Spanish priority |
| 30.2 Accessibility Compliance (WCAG) | 🟡 | Basic check needed |
| 30.3 Provider Language Capabilities | ✅ | `languagesSpoken` field exists |
| 30.4 Semantic HTML | 🟡 | May need audit |
| 30.5 Keyboard Navigation | 🟡 | May need audit |

### Key Questions
- [ ] Accessibility audit scope for demo?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 31: Referral & Attribution

**Purpose**: Track user acquisition sources and enable referral programs.

| Item | Status | Notes |
|------|--------|-------|
| 31.1 UTM Parameter Tracking | ⬜ | Marketing attribution |
| 31.2 Referral Codes | ⬜ | User-to-user referrals |
| 31.3 Partner/Affiliate Tracking | ⬜ | B2B partnerships |

### Key Questions
- [ ] Deferred for demo?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 32: Data Export & Portability

**Purpose**: Enable users to access and export their data.

| Item | Status | Notes |
|------|--------|-------|
| 32.1 Export My Data | ⬜ | Download personal data |
| 32.2 Delete My Account | ⬜ | With data removal |
| 32.3 Provider Data Export (CRM) | ⬜ | For claimed providers |

### Key Questions
- [ ] Deferred for demo?

### Architectural Notes
_To be filled in during chapter review._

---

## Chapter 33: Performance & Caching

**Purpose**: Ensure the application performs well under load.

| Item | Status | Notes |
|------|--------|-------|
| 33.1 Database Query Optimization | 🟡 | Index verification needed |
| 33.2 API Response Caching | ⬜ | Redis or in-memory |
| 33.3 Static Page Generation (ISR) | ⬜ | Next.js incremental static regen |
| 33.4 Image Optimization | 🟡 | Next/Image, CDN |
| 33.5 Bundle Size Analysis | ⬜ | Webpack analyzer |

### Key Questions
- [ ] Performance issues observed?

### Architectural Notes
_To be filled in during chapter review._

---

## Appendix A: Architectural Decisions Log

_Decisions made during chapter reviews will be logged here._

| Date | Chapter | Decision | Rationale |
|------|---------|----------|-----------|
| | | | |

---

## Appendix B: Demo Scenarios

_Key user flows to be demonstrated will be documented here._

| Scenario | Description | Status |
|----------|-------------|--------|
| | | |

---

## Appendix C: Known Issues & Tech Debt

_Issues identified during review will be logged here for tracking._

| ID | Chapter | Issue | Priority | Status |
|----|---------|-------|----------|--------|
| | | | | |

---

## Appendix D: Glossary

| Term | Definition |
|------|------------|
| **Family** | A user seeking care for themselves or a loved one |
| **Provider** | An organization or individual offering care services |
| **Mode** | The active persona (FAMILY or PROVIDER) for a user session |
| **Claimed** | An organization profile that has been verified and linked to a user account |
| **Unclaimed** | A pre-seeded organization profile not yet claimed by any user |
| **Care Profile** | A family's description of their care needs |
| **Provider Profile** | A provider's description of their services and qualifications |
| **Consultation Request** | A structured inquiry from a family to a provider |
| **Hiring Request** | A structured inquiry between organizations and caregivers |

---

_Last Updated: 2025-01-14_
