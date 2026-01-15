# Olera Platform — Master Systems Manual

> **Purpose**: This document serves as the source of truth for all platform systems. It will be iteratively refined as we work through each chapter, answer key questions, and make architectural decisions.
>
> **Status Indicators**:
> - ✅ **Built** — Core functionality exists and works
> - 🟡 **Partial** — Some features exist, gaps or fragility present
> - ⬜ **Not Built** — Planned but not yet implemented
> - ❌ **Deferred** — Out of scope for demo
>
> **Demo vs. Production Scope**:
> This manual documents both the demo implementation and the full production system design. The distinction is made clear throughout:
> - **Simple deferrals** are noted inline (e.g., "❌ Deferred for demo" with rationale and "Post-demo" notes)
> - **Complex multi-phase features** use explicit **Demo Scope** and **Production Scope** subsections
>
> This ensures reviewers understand that the demo is intentionally simplified, while the full system has been thoughtfully designed even where features are deferred.

---

## Table of Contents

### Core Platform Systems
1. [Authentication & Account Management](#chapter-1-authentication--account-management)
2. [Mode System (Family vs Provider)](#chapter-2-mode-system-family-vs-provider)
3. [Onboarding Wizard (Shared System)](#chapter-3-onboarding-wizard-shared-system)
4. [Family Care Profiles](#chapter-4-family-care-profiles)
5. [Provider Profiles](#chapter-5-provider-profiles)
6. [Provider Identity & Gating](#chapter-6-provider-identity--gating)
7. [Provider Directory & Search](#chapter-7-provider-directory--search)
8. [Provider Claiming (Organizations Only)](#chapter-8-provider-claiming-organizations-only)

### User Dashboards
9. [Family Dashboard](#chapter-9-family-dashboard)
10. [Provider Dashboard](#chapter-10-provider-dashboard)

### Engagement Systems
11. [Engagements](#chapter-11-engagements)
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
21. [Provider Data Management](#chapter-21-provider-data-management)

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

### Core Systems (Planned)
34. [Communications & Automation](#chapter-34-communications--automation) ⭐ *Core system — to be developed*
35. [Data Acquisition & Enrichment](#chapter-35-data-acquisition--enrichment) ⭐ *Referenced from Ch 21*

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

### Organization Provider — Additional Navigation (Conditional)

Shown only for organization-type providers:

| Dropdown Label | Route | Purpose |
|----------------|-------|---------|
| "Find Caregivers" | `/provider/find-caregivers` | Browse caregivers available for hire |
| "Saved Candidates" | `/provider/saved-candidates` | Bookmarked caregivers |
| "My Candidates" | `/provider/my-candidates` | Hiring engagements with caregivers |

### Individual Caregiver — Additional Navigation (Conditional)

Shown only for individual caregiver providers:

| Dropdown Label | Route | Purpose |
|----------------|-------|---------|
| "Find Organizations" | `/provider/find-organizations` | Browse orgs actively hiring |
| "Saved Opportunities" | `/provider/saved-opportunities` | Bookmarked potential employers |
| "My Opportunities" | `/provider/my-opportunities` | Hiring engagements with orgs |

**Note**: Individual caregivers use the `/provider/` prefix (not `/caregiver/`) because they ARE providers in the system.

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
| (new) | `/provider/my-families` | Create |
| (new) | `/provider/find-organizations` | Create |
| (new) | `/provider/saved-candidates` | Create |
| (new) | `/provider/saved-opportunities` | Create |
| (new) | `/provider/my-opportunities` | Create |

### Homepage vs Directory Architecture (DECIDED)

> This section defines the relationship between the homepage and provider directory, affecting UX flows, SEO strategy, and navigation.

#### Purpose & Design Direction

| Page | Purpose | Design Model | Primary Audience |
|------|---------|--------------|------------------|
| **Homepage `/`** | Marketing landing, value communication, quick entry | Airbnb-style | First-time visitors, undecided users |
| **Directory `/providers`** | Full-featured search and discovery | Zillow-style | Users ready to search and compare |

#### Homepage Structure (DECIDED)

The homepage is a **marketing-first landing page**, not a directory.

| Section | Purpose |
|---------|---------|
| **Hero** | Value proposition + simplified search widget (location + care type only) |
| **Category Cards** | Quick entry by provider type → links to pre-filtered `/providers` |
| **How It Works** | 3-step explanation for families |
| **Trust Signals** | Stats, testimonials, security badges |
| **For Providers CTA** | Secondary CTA for provider acquisition |
| **Footer** | Links, legal, etc. |

**What homepage should NOT have**:
- Full filter sidebar
- Paginated provider listings
- Map view toggle

#### Directory Structure (DECIDED)

`/providers` is the **full-featured search directory**.

| Feature | Demo Scope | Post-Demo |
|---------|------------|-----------|
| Full filter sidebar | ✅ | ✅ |
| Provider card grid | ✅ | ✅ |
| Map view toggle | ✅ (if stable) | ✅ |
| Paginated results | ✅ | ✅ |
| URL-based filter state | 🟡 Nice-to-have | ✅ (for sharing, SEO) |

#### Entry Point Flows (DECIDED)

| Entry Point | Destination | Behavior |
|-------------|-------------|----------|
| Homepage search widget | `/providers?city=X&careType=Y` | Pre-filtered results |
| Homepage category card | `/providers?providerType=X` | Pre-filtered by type |
| Nav "Find Providers" (Family mode) | `/providers` | Full directory, no pre-filter |
| Direct URL | `/providers` | Full directory |
| Provider detail "Back" | `/providers` | Return to directory (preserve filters later) |
| SEO city pages (future) | `/providers?city=X&state=Y` | Pre-filtered by location |

#### Standardized Filter Set (DECIDED)

Consistent filters across `/providers` and future SEO pages:

| Filter | Demo | Post-Demo |
|--------|------|-----------|
| Location (city/state) | ✅ | ✅ |
| Location (zip + radius) | ❌ Deferred | ✅ |
| Provider type | ✅ | ✅ |
| Care type / services | ✅ | ✅ |
| Price range | ✅ | ✅ |
| Rating | ✅ | ✅ |
| Payment accepted | 🟡 Optional | ✅ |
| Availability | ❌ Deferred | ✅ |
| Amenities | 🟡 Optional | ✅ |
| Geolocation ("Near Me") | ❌ Deferred | ✅ |

#### UX Flow Principles (DECIDED)

| Principle | Implementation |
|-----------|----------------|
| **No redundancy** | Homepage = entry point, `/providers` = search experience |
| **Clear navigation** | "Find Providers" in nav always goes to `/providers` |
| **Smooth transitions** | Search from homepage lands on filtered `/providers` |
| **Consistent back nav** | Detail page "Back" returns to `/providers` |
| **Non-blocking** | Users can browse without login; actions prompt auth |

#### Demo vs Post-Demo Scope

| Component | Demo | Post-Demo |
|-----------|------|-----------|
| Homepage | Simplified Airbnb-style (hero, categories, trust) | Full design polish |
| `/providers` | Full filters, cards, map toggle | SEO optimization, URL state |
| SEO pages | ❌ Deferred | `/care/[state]/[city]` pages |
| Geolocation | ❌ Deferred | Browser-based "Near Me" |
| Search caching | ❌ Deferred | Performance optimization |

**Note**: Current homepage functions as a de facto directory. This is acceptable during development but will be refactored to match this architecture.

### Provider Type Taxonomy (DECIDED)

> This taxonomy determines CTAs, engagement types, and profile rendering across all contexts.

#### Classification by Service Delivery

| Category | Provider Types | Service Location | Primary CTA (from Family) |
|----------|---------------|------------------|---------------------------|
| **Facility-Based** | Assisted Living, Memory Care, Nursing Home, Rehab Center, Independent Living, CCRC, Adult Day Care | At facility | "Schedule Tour" |
| **Service-Based** | Home Care Agency, Home Health Agency, Hospice Agency | At family's location | "Schedule Consultation" |
| **Individual** | Independent Caregiver | At family's location | "Request Interview" |

#### Service-Based Provider Distinctions

These three provider types all deliver care at the family's location, but serve different needs:

| Provider Type | Care Type | Typical Services | Licensing |
|---------------|-----------|------------------|-----------|
| **Home Care Agency** | Non-medical, custodial | Personal care, companionship, homemaking, meal prep, transportation | State-licensed (varies) |
| **Home Health Agency** | Skilled medical | Nursing care, physical therapy, wound care, medication management | Medicare/Medicaid certified |
| **Hospice Agency** | End-of-life | Pain management, symptom control, emotional/spiritual support | Medicare certified |

All three use "Schedule Consultation" as their primary CTA since they don't have facilities to tour.

### CTA Reference (DECIDED)

> This section serves as the single source of truth for all CTAs across the platform. All chapters should reference this section.

#### Care Marketplace CTAs (Family ↔ Provider)

**Family viewing Providers:**

| Provider Category | CTA Text | Creates Engagement Type |
|-------------------|----------|------------------------|
| Facility-Based | "Schedule Tour" | TOUR |
| Service-Based (Home Care, Home Health, Hospice) | "Schedule Consultation" | CONSULTATION |
| Individual Caregiver | "Request Interview" | INTERVIEW |

**Provider viewing Families:**

| Provider Category | CTA Text | Creates Engagement Type |
|-------------------|----------|------------------------|
| All Provider Types | "Offer Services" | OUTREACH |

> **Note**: "Offer Services" replaced "Send Outreach" for clearer, service-oriented language.

#### Hiring Marketplace CTAs (Organization ↔ Individual Caregiver)

| Viewer | Subject | CTA Text | Creates Engagement Type |
|--------|---------|----------|------------------------|
| Organization | Caregiver | "Invite to Interview" | HIRING_INTERVIEW |
| Caregiver | Organization | "Apply" | APPLICATION |

#### Secondary CTAs (All Contexts)

| Action | CTA Text | Notes |
|--------|----------|-------|
| Save for later | "Save" / "Saved" (toggle) | Heart icon, works across all contexts |
| Send message | "Message" | Opens messaging, requires engagement |
| View details | "View Profile" | Links to full profile page |

### One Profile, Multiple Views (DECIDED)

> **Core Principle**: Each user has ONE master profile. The same profile is rendered differently depending on who is viewing it and in what context.

This applies to all profile types:
- **Families**: One profile viewed by all provider types
- **Provider Organizations**: One profile viewed by families (care-seeking) and caregivers (job-seeking)
- **Individual Caregivers**: One profile viewed by families (care-seeking) and organizations (hiring)

#### Visibility Toggles

| Toggle | Controls | Located On |
|--------|----------|------------|
| `availableForFamilies` | Whether profile appears in Family → Provider search | Provider Dashboard settings |
| `availableForOrganizations` | Whether caregiver profile appears in Org → Caregiver search | Provider Dashboard settings |
| `activelyHiring` | Whether org appears in Caregiver → Org search | Provider Dashboard settings |

### Contextual Rendering Matrices (DECIDED)

> These matrices define exactly what fields are shown and what CTAs appear based on viewer type and marketplace context.

#### Matrix 1: Care Marketplace — Family Viewing Providers

| Field Category | Facility-Based | Service-Based | Individual Caregiver |
|----------------|----------------|---------------|---------------------|
| **Basic Info** | Name, photos, location | Name, photos, service area | Name, photo, location |
| **Description** | Facility description, amenities | Services offered, approach | Bio, experience |
| **Olera Score** | Always shown | Always shown | Shown after first review* |
| **Pricing** | Room rates, care levels | Hourly/visit rates | Hourly rates |
| **Availability** | Bed availability | Service availability | Schedule availability |
| **Primary CTA** | "Schedule Tour" | "Schedule Consultation" | "Request Interview" |
| **Secondary CTAs** | Save, Message | Save, Message | Save, Message |

*Individual caregivers display a placeholder (e.g., "New to Olera") until they receive their first review.

#### Matrix 2: Care Marketplace — Provider Viewing Families

| Field | Visibility | Notes |
|-------|------------|-------|
| Family name | ✅ Shown | Primary identifier |
| Location (city/area) | ✅ Shown | For service area matching |
| Care recipient info | ✅ Shown | Age, conditions, care needs |
| Care type needed | ✅ Shown | Primary matching criteria |
| Budget range | ✅ Shown | If family has specified |
| Preferred schedule | ✅ Shown | If family has specified |
| Contact info | ❌ Hidden | Revealed after engagement |
| **Primary CTA** | "Offer Services" | Creates OUTREACH engagement |
| **Secondary CTAs** | Save | Heart icon |

#### Matrix 3: Hiring Marketplace — Organization Viewing Caregivers

| Field | Visibility | Notes |
|-------|------------|-------|
| Caregiver name | ✅ Shown | Primary identifier |
| Photo | ✅ Shown | Professional headshot |
| Location | ✅ Shown | City/area |
| Olera Score | ✅ Shown* | *Placeholder if no reviews yet |
| Experience | ✅ Shown | Years, settings worked |
| Certifications | ✅ Shown | CNA, HHA, etc. |
| Skills/specialties | ✅ Shown | Memory care, hospice, etc. |
| **Availability fields** | ✅ Shown | Critical for hiring decisions |
| - Available for full-time | ✅ | Boolean |
| - Available for part-time | ✅ | Boolean |
| - Earliest start date | ✅ | Date |
| - Willing to relocate | ✅ | Boolean |
| Desired hourly rate | ✅ Shown | If specified |
| Contact info | ❌ Hidden | Revealed after engagement |
| **Primary CTA** | "Invite to Interview" | Creates HIRING_INTERVIEW |
| **Secondary CTAs** | Save | Heart icon |

#### Matrix 4: Hiring Marketplace — Caregiver Viewing Organizations

| Field | Visibility | Notes |
|-------|------------|-------|
| Organization name | ✅ Shown | Primary identifier |
| Photos | ✅ Shown | Facility/team photos |
| Location | ✅ Shown | Address/area |
| Provider type | ✅ Shown | Facility type or service type |
| Olera Score | ✅ Shown | Organization's care quality score |
| **Hiring fields** | ✅ Shown | |
| - Positions available | ✅ | Job titles/roles |
| - Employment types | ✅ | Full-time, part-time, PRN |
| - Pay range | ✅ | If specified |
| - Benefits offered | ✅ | If specified |
| About/culture | ✅ Shown | Organization description |
| Contact info | ❌ Hidden | Revealed after engagement |
| **Primary CTA** | "Apply" | Creates APPLICATION |
| **Secondary CTAs** | Save | Heart icon |

#### Olera Score Display Rules

| Profile Type | Score Display | Condition |
|--------------|---------------|-----------|
| Provider Organization | Always shown | Score calculated from all review sources |
| Individual Caregiver | Conditional | Shown only after first review received |
| Individual Caregiver (no reviews) | Placeholder | "New to Olera" or similar indicator |
| Family | Not applicable | Families don't have public scores |

### Hiring Eligibility (DECIDED)

Individual caregivers may be hired by any organization type:

| Organization Type | Can Hire Caregivers | Notes |
|-------------------|--------------------|----|
| Home Care Agency | ✅ Yes | Primary hiring channel |
| Home Health Agency | ✅ Yes | For certified staff |
| Hospice Agency | ✅ Yes | For hospice aides |
| Assisted Living | ✅ Yes | For facility staff |
| Memory Care | ✅ Yes | For specialized staff |
| Nursing Home | ✅ Yes | For CNAs, aides |
| All other facility types | ✅ Yes | Universal hiring support |

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
- [x] Should families be able to create multiple care profiles (e.g., for different family members)?
- [x] Which fields are truly required vs optional? → **See Foundational Decisions: Two-Threshold Model**
- [x] How does profile completion affect matching/visibility? → **See Foundational Decisions: Two-Threshold Model**

### Architectural Notes

#### 4.1 Care Profile Location (DECIDED)

Care profile editing lives within the Family Dashboard (`/family/dashboard`), not as a separate page.

| Component | Location |
|-----------|----------|
| Initial creation | Onboarding wizard (Chapter 3) |
| Full editing | Tab within `/family/dashboard` |

**Family Dashboard Structure** (tabs/sections):

| Section | Purpose |
|---------|---------|
| **Overview** | Summary stats, quick links |
| **Care Profile** | Edit care profile fields |
| **Schedule/Calendar** | Upcoming tours, consults, interviews |
| **Activity Stream** | Recent activity, notifications |

**Cross-reference**: See Foundational Decisions → Route Architecture for full navigation structure.

#### 4.2–4.7 Profile Field Categories (DECIDED)

Current field structure accepted as-is for demo:

| Category | Status | Notes |
|----------|--------|-------|
| 4.2 Loved One Info | ✅ Accept | Name, age, relationship, gender |
| 4.3 Care Needs | ✅ Accept | Care level, conditions, mobility |
| 4.4 Personality & Preferences | ✅ Accept | Hobbies, communication style |
| 4.5 Location & Contact | ✅ Accept | Address, contact preferences |
| 4.6 Budget & Timeline | ✅ Accept | Budget range, urgency |
| 4.7 Visibility | ✅ Accept | Visible to providers toggle |

**Required for visibility** (per Two-Threshold Model): Name, location, care type needed.

**All other fields**: Optional, improve matching quality.

#### 4.8 Profile Completion Tracking (DECIDED)

**Storage**: `FamilyProfile.completionPercentage` field in DB (not calculated on-the-fly).

**Calculation**: Recalculate on profile save.

**Display**: Progress bar/indicator in Family Dashboard.

**Nudging**: "Complete your profile" prompt if below visibility threshold.

**Suggested completion weights**:

| Field Group | Weight | Notes |
|-------------|--------|-------|
| Visibility threshold (name, location, care type) | 40% | Must complete to be visible |
| Care needs details | 20% | Improves matching |
| Personality & preferences | 15% | Improves matching |
| Budget & timeline | 15% | Improves matching |
| Contact preferences | 10% | Improves engagement |

**Note**: Crossing visibility threshold ≈ 40% complete. Weights can be tuned later.

#### 4.9 Multiple Care Profiles (DECIDED)

**Demo**: Single care profile per account.

**Post-demo**: Support multiple profiles if user research confirms need.

| Phase | Behavior |
|-------|----------|
| Demo | One `FamilyProfile` per user |
| Future | Multiple profiles with separate visibility toggles |

**Rationale**: Single profile simplifies matching, UI, and data model. Multi-profile can be added later without breaking changes.

**Future implementation notes** (if needed):
- Dashboard shows list of profiles with "Add another loved one"
- Each profile has independent visibility toggle
- Matching considers all visible profiles

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
- [x] Which fields should be required vs optional per provider type? → **See Two-Threshold Model + below**
- [x] How should unclaimed profiles differ in display/editing? → **See 5.12 Three-Tier Model**
- [x] What is the minimum viable profile for each provider type? → **See Two-Threshold Model**

### Architectural Notes

#### 5.1 Provider Profile Location (DECIDED)

Provider profile editing lives within the Provider Dashboard (`/provider/dashboard`), not as a separate page.

| Component | Location |
|-----------|----------|
| Initial creation | Onboarding wizard (Chapter 3) |
| Full editing | Tab within `/provider/dashboard` |

**Provider Dashboard Structure** (tabs/sections):

| Section | Purpose |
|---------|---------|
| **Overview** | Summary stats, quick links, engagement metrics |
| **Provider Profile** | Edit profile fields (conditional by provider type) |
| **Schedule/Calendar** | Upcoming tours, consults, interviews |
| **Activity Stream** | Recent activity, notifications |

**Cross-reference**: See Foundational Decisions → Route Architecture for full navigation structure.

#### 5.2 & 5.14 Provider Types and Type-Specific Fields (DECIDED)

**Provider Type Categories**:

| Category | Provider Types |
|----------|----------------|
| **Facility-based** | Assisted Living, Memory Care, Nursing Home, Rehabilitation, Independent Living, Adult Day Care |
| **Home-based services** | Home Care, Home Health, Hospice |
| **Individual** | Independent Caregiver |

**Type-Specific Field Display**:

| Category | Relevant Field Categories |
|----------|---------------------------|
| **Facility-based** | Amenities, room types, capacity, staff ratios, virtual tour, photos |
| **Home-based services** | Service area/radius, in-home services, scheduling flexibility |
| **Individual Caregiver** | Personal skills, certifications, availability, hourly rate, employment preferences |

**Implementation**:
- Profile form detects `providerType` and shows relevant sections
- Hidden sections are not required, just not displayed
- All fields stored in same `Provider` model (schema unchanged)

**Demo approach**: Accept that some fields may show for all types initially. Full conditional logic refined during UI polish phase.

#### 5.3–5.11 Profile Field Categories (DECIDED)

Current field structure accepted as-is for demo:

| Category | Status | Notes |
|----------|--------|-------|
| 5.3 Services Offered | ✅ Accept | `careTypesOffered`, service arrays |
| 5.4 Location & Service Area | ✅ Accept | Address, zip, serviceRadius |
| 5.5 Photos & Media | ✅ Accept | photos array, coverPhoto |
| 5.6 Licensing & Certifications | ✅ Accept | Fields exist |
| 5.7 Pricing Information | ✅ Accept | Extensive pricing fields |
| 5.8 Staff Information | ✅ Accept | Ratios, credentials, training |
| 5.9 Amenities & Features | ✅ Accept | Multiple arrays |
| 5.10 Specialty Programs | ✅ Accept | Memory care, hospice, etc. |
| 5.11 About / Team / Virtual Tour | ✅ Accept | teamMembersJson, virtualTourUrl |

**Required for visibility** (per Two-Threshold Model):
- Organization: Org name, location, provider type
- Individual Caregiver: Full name, location, services offered

**All other fields**: Optional, improve matching quality.

#### 5.12 Claimed vs Unclaimed Status (DECIDED)

**Context**: Only organizations have unclaimed profiles (seeded nationwide directory). Individual caregivers and families never have unclaimed profiles.

**Three-Tier Provider Access Model**:

| Tier | Cost | Access Level |
|------|------|--------------|
| **Unclaimed** | N/A | Profile visible, no owner access |
| **Claimed (Free)** | Free | View inbound leads, edit profile |
| **Subscribed (Paid)** | Paid | Full engagement capabilities |

**Key distinction**:
- **Claiming = Visibility + Access** (see leads, edit profile)
- **Subscription = Interaction + Action** (respond, initiate outreach)

**Permissions Matrix**:

| Capability | Unclaimed | Claimed (Free) | Subscribed |
|------------|-----------|----------------|------------|
| Visible in directory | ✅ | ✅ | ✅ |
| Visible to caregivers (hiring) | ✅ | ✅ | ✅ |
| Profile badge | "Unclaimed" | None | "Verified" or premium badge |
| Edit profile | ❌ | ✅ | ✅ |
| View inbound requests | ❌ | ✅ (read-only) | ✅ |
| View inbound messages | ❌ | ✅ (read-only) | ✅ |
| Respond to messages | ❌ | ❌ | ✅ |
| Accept/decline requests | ❌ | ❌ | ✅ |
| Initiate outreach to families | ❌ | ❌ | ✅ |
| Initiate outreach to caregivers | ❌ | ❌ | ✅ |
| Schedule tours/consults | ❌ | ❌ | ✅ |
| Access analytics | ❌ | Basic | Full |

**Engagement with Unclaimed Profiles** (from family/caregiver side):

| Action | Allowed? | Notes |
|--------|----------|-------|
| Families initiate request/message | ✅ Yes | Engagement is created, stored |
| Caregivers initiate inquiry | ✅ Yes | Engagement is created, stored |
| Provider sees engagement | ❌ No | Must claim first |
| Provider responds | ❌ No | Must claim + subscribe |

**User Notice** (when engaging with unclaimed provider):
- "This provider has not yet claimed their Olera profile"
- "We will attempt to forward your message to the provider"
- "You are encouraged to also contact them directly"
- "Response times may vary for unclaimed listings"

**Claimed Provider Paywall Notice** (when trying to respond without subscription):
- "Upgrade to respond to this inquiry"
- "You have X new leads waiting — subscribe to connect"
- Show preview of message/request without full details

**Key principles**:
- Claiming is free and frictionless (encourages adoption)
- Leads are visible but "locked" until subscription (creates value demonstration)
- Maintains transparency and user trust
- Aligns with directory-first, freemium monetization strategy

**Cross-reference**:
- Claiming workflow details in Chapter 8
- Subscription tiers and pricing in Chapter 18

#### 5.13 Provider Profile Completion Tracking (DECIDED)

**Storage**: `Provider.completionPercentage` field in DB (not calculated on-the-fly).

**Calculation**: Recalculate on profile save.

**Display**: Progress bar/indicator in Provider Dashboard.

**Nudging**: "Complete your profile" prompt if below visibility threshold.

**Note**: Completion weights similar to family profiles — visibility threshold fields ≈ 40%, additional fields improve matching. Exact weights can be tuned later.

---

## Chapter 6: Provider Identity & Gating

**Purpose**: Control access to provider features based on profile existence and subscription status.

| Item | Status | Notes |
|------|--------|-------|
| 6.1 ProviderIdentity Model | ❌ Remove | Redundant, simplify to Provider existence |
| 6.2 Identity Type (ORGANIZATION vs INDIVIDUAL) | ✅ | Use `Provider.providerType` instead |
| 6.3 Onboarding Complete Flag | ❌ Remove | Use profile completion % instead |
| 6.4 Linking to Provider Profile | ✅ | Direct User → Provider relationship |
| 6.5 Feature Gating Logic | 🟡 | Needs implementation per three-tier model |

### Key Questions
- [x] What features are gated behind ProviderIdentity? → **See three-tier model in 5.12**
- [x] Is this model necessary, or can gating be simplified? → **Remove ProviderIdentity, use Provider + subscription**
- [x] How does this interact with mode system? → **Mode controls nav, gating controls actions**

### Architectural Notes

#### 6.1 Remove ProviderIdentity Model (DECIDED)

**Problem**: `ProviderIdentity` creates unnecessary indirection (User → ProviderIdentity → Provider).

**Solution**: Simplify to direct User → Provider relationship.

| What ProviderIdentity Tracked | New Location |
|-------------------------------|--------------|
| User has provider identity | Provider record exists for user |
| Type (ORG vs INDIVIDUAL) | `Provider.providerType` field |
| Onboarding complete | Profile completion % (Two-Threshold Model) |

**Migration steps**:
1. Remove `/api/provider-identity` route
2. Update auth to check Provider existence directly
3. Drop `ProviderIdentity` table from schema
4. Update any code referencing `hasProviderIdentity`

#### 6.2 Provider Type Determination (DECIDED)

Provider type is determined by `Provider.providerType`:

| providerType Value | Category |
|--------------------|----------|
| `INDEPENDENT_CAREGIVER` | Individual |
| All others (ASSISTED_LIVING, HOME_CARE, etc.) | Organization |

**Helper function**:
```
isIndividualCaregiver(provider) = provider.providerType === 'INDEPENDENT_CAREGIVER'
isOrganization(provider) = provider.providerType !== 'INDEPENDENT_CAREGIVER'
```

#### 6.3 Three-Tier Gating Logic (DECIDED)

**Cross-reference**: See Chapter 5.12 for full permissions matrix.

**Gating checks**:

| Check | How to Determine |
|-------|------------------|
| User is a provider | `Provider` record exists with `userId` |
| Provider is claimed | `Provider.claimed === true` OR provider was user-created |
| Provider is subscribed | `Provider.subscriptionStatus === 'ACTIVE'` |

**Tier determination**:

```
if (!provider) → Not a provider (family-only user)
if (provider && !provider.claimed) → Unclaimed (seeded, no owner)
if (provider && provider.claimed && !isSubscribed) → Claimed (Free)
if (provider && provider.claimed && isSubscribed) → Subscribed
```

**Note**: User-created providers (via onboarding) are automatically `claimed = true`.

#### 6.4 Feature Gating Implementation (DECIDED)

**No hard blocking** — use nudges and paywalls instead of preventing navigation.

| Feature | Gating Behavior |
|---------|-----------------|
| Browse `/provider/find-families` | ✅ Always accessible in provider mode |
| View family profiles | ✅ Accessible (families control their own visibility) |
| Provider Dashboard | ✅ Accessible (shows upgrade prompts if needed) |
| Edit provider profile | Requires: Provider exists |
| View inbound leads | Requires: Provider claimed |
| Respond to leads | Requires: Subscription (shows paywall if not) |
| Initiate outreach | Requires: Subscription (shows paywall if not) |

**Paywall UX**:
- Show lead count and preview
- "Upgrade to connect with these families"
- Clear value proposition

#### 6.5 Mode vs Gating Separation (DECIDED)

| Concept | What It Controls |
|---------|------------------|
| **Mode** (FAMILY/PROVIDER) | Which nav items appear, which landing page |
| **Gating** (tier) | What actions are allowed within provider mode |

**Key principle**: Mode switch is always instant and free. Gating applies to specific actions within provider mode.

**Cross-reference**:
- Mode system details in Chapter 2
- Subscription tiers in Chapter 18

---

## Chapter 7: Provider Directory & Search

**Purpose**: Public-facing directory for families to discover and search for care providers.

**Cross-reference**: See Foundational Decisions → **Homepage vs Directory Architecture** for the relationship between homepage and `/providers`.

| Item | Status | Notes |
|------|--------|-------|
| 7.1 Provider Listing Page | ✅ | `/providers` (currently redirects to `/`, will be separate) |
| 7.2 Location-Based Search | ✅ | City/state for demo; zip+radius deferred |
| 7.3 Filter by Provider Type | ✅ | All provider types in dropdown |
| 7.4 Filter by Services/Specialties | ✅ | Care type dropdown exists |
| 7.5 Filter by Price Range | ✅ | Price slider (0–15000) |
| 7.6 Sort Options | ✅ | Sort dropdown exists |
| 7.7 Provider Cards | ✅ | `EnhancedProviderCard` component |
| 7.8 Provider Detail Page | ✅ | `/providers/[id]` with full sections |
| 7.9 Map View | ✅ | Leaflet integration, list/map toggle |
| 7.10 "Near Me" Geolocation | ❌ | Deferred for demo |
| 7.11 City/State SEO Pages | ❌ | Deferred for demo |
| 7.12 Search Results Caching | ❌ | Deferred for demo |

### Key Questions
- [x] What filters are most important for demo? → **See Foundational Decisions: Standardized Filter Set**
- [x] Is map view needed for demo? → **Yes, if stable; otherwise defer**
- [x] SEO pages priority? → **Deferred for demo**

### Architectural Notes

#### 7.1 Directory Location (DECIDED)

`/providers` is the dedicated provider directory page (Zillow-style).

**Current state**: `/providers` redirects to `/` (homepage). This will be refactored so:
- Homepage (`/`) = Marketing landing (Airbnb-style)
- Directory (`/providers`) = Full search experience (Zillow-style)

**Cross-reference**: See Foundational Decisions → Homepage vs Directory Architecture.

#### 7.2 Location Search (DECIDED)

| Feature | Demo | Post-Demo |
|---------|------|-----------|
| City search | ✅ | ✅ |
| State search | ✅ | ✅ |
| Zip code search | ❌ Deferred | ✅ |
| Radius filtering | ❌ Deferred | ✅ |

#### 7.3–7.6 Filters and Sort (DECIDED)

All current filters accepted for demo:
- Provider type dropdown
- Care type dropdown
- Price range slider
- Rating filter
- Sort options (newest, etc.)

**Cross-reference**: See Foundational Decisions → Standardized Filter Set for full list.

#### 7.7 Provider Cards (DECIDED)

`EnhancedProviderCard` component displays:
- Cover photo
- Provider name and type
- Location
- Rating and review count
- Price range
- Badges (verified, licensed, etc.)
- Specialty indicators (memory care, hospice, etc.)

**Additional requirement**: Cards for unclaimed providers should show "Unclaimed" badge per Chapter 5.12.

#### 7.8 Provider Detail Page (DECIDED)

`/providers/[id]` includes comprehensive sections:
- Photo gallery
- Basic info (name, type, description)
- Contact section with CTAs
- Amenities
- Staff information
- Location with map
- Reviews
- Specialty care programs

**Requirements per earlier decisions**:
- Show "Unclaimed" badge for unclaimed providers
- Show appropriate CTAs based on claimed/subscription status
- "Back" navigation returns to `/providers`

#### 7.9 Map View (DECIDED)

Leaflet map integration exists with list/map toggle.

**Demo scope**: Include if stable. If buggy, hide toggle and defer.

**Post-demo**: Full interactive map with clustering, hover previews.

#### 7.10–7.12 Deferred Items (DECIDED)

| Item | Reason for Deferral |
|------|---------------------|
| 7.10 Geolocation | Adds complexity (permissions, accuracy); city/state sufficient |
| 7.11 SEO Pages | Not needed for demo functionality; important for organic traffic post-launch |
| 7.12 Caching | Performance optimization; only needed at scale |

---

## Chapter 8: Provider Claiming (Organizations Only)

**Purpose**: Allow organizations to claim their pre-seeded directory profiles and gain edit access.

**Important**: Only organizations have unclaimed profiles. Families and individual caregivers never have unclaimed profiles — they create profiles directly.

**Cross-reference**: See Chapter 5.12 for three-tier provider access model (Unclaimed → Claimed → Subscribed).

| Item | Status | Notes |
|------|--------|-------|
| 8.1 Claim Request Submission | 🟡 | Placeholder exists, workflow not implemented |
| 8.2 Verification Methods | ⬜ | Not implemented |
| 8.3 Admin Review Queue | ⬜ | Not implemented |
| 8.4 Claimed → Editable Transition | 🟡 | `claimed` field exists, logic needed |
| 8.5 Claim Notifications | ⬜ | Not implemented |
| 8.6 Rejection Handling | ⬜ | Not implemented |

### Key Questions
- [x] What verification methods should be supported? → **See 8.2 below**
- [x] What information can unclaimed profiles display? → **See Chapter 5.12**
- [x] Admin review workflow requirements? → **See 8.3 below**

### Architectural Notes

#### 8.1 Claim Request Submission (DECIDED)

##### Demo Scope
- Self-service claiming with **instant approval**
- User clicks "Claim this listing" → signs up/logs in → provides attestation → claim approved
- No admin review queue
- No verification beyond role attestation

##### Production Scope
- Self-service submission with soft verification
- Auto-approve if email domain matches provider domain
- Otherwise, route to admin review queue
- Full audit trail of all claim activity

**Claim Flow**:

```
User clicks "Claim this listing" on /providers/[id]
    ↓
User signs up or logs in (if not authenticated)
    ↓
User completes claim form:
  - Role attestation checkbox (required)
  - Work email (for domain matching)
  - Optional: additional verification info
    ↓
[Demo] → Instant approval
[Production] → Domain match check
    ↓
If domain matches → Auto-approve
If no match → Route to admin review queue
    ↓
On approval: Provider.claimed = true, Provider.userId = user.id
```

**Entry Points**:

| Entry Point | CTA | Behavior |
|-------------|-----|----------|
| `/providers/[id]` (unclaimed) | "Claim this listing" button | Opens claim flow |
| `/provider/onboarding` | "Claim Existing Listing" option | Search for listing, then claim |
| `/for-providers` marketing | "Already listed? Claim your profile" | Search for listing, then claim |

#### 8.2 Verification Methods (DECIDED)

##### Demo Scope

| Method | Included | Notes |
|--------|----------|-------|
| Role attestation checkbox | ✅ | "I am authorized to manage this listing" |
| All others | ❌ | Deferred |

##### Production Scope

| Method | Required | Notes |
|--------|----------|-------|
| Role attestation checkbox | ✅ Required | Legal attestation of authority |
| Work email domain match | ✅ Auto-approve trigger | user@sunrisesenior.com → Sunrise Senior Living |
| Phone verification (call/SMS) | ✅ Required | Verify via listed phone number |
| Document upload | Optional | Business license, authorization letter |
| Video verification | Consider | For high-value or disputed claims |

**Production verification logic**:
1. If work email domain matches provider's website domain → **Auto-approve**
2. If phone verification succeeds → **Auto-approve**
3. Otherwise → **Route to admin review**

#### 8.3 Admin Review Queue (DECIDED)

##### Demo Scope
Not implemented. All claims auto-approved instantly.

##### Production Scope

**Human-in-the-Loop Process**:

When a claim cannot be auto-verified, the system initiates a human review process:

1. **Claim Submission**: User submits claim that doesn't match auto-approval criteria
2. **Slack Alert**: System posts to internal `#claim-reviews` Slack channel with:
   - Provider name and location
   - Claimant name and email
   - Verification info provided
   - Link to admin review panel
3. **Admin Review**: Reviewer logs into admin panel (`/admin/claims`) to:
   - View claim details and submitted documentation
   - View provider profile and any existing owner info
   - Cross-reference public info (website, LinkedIn, etc.)
   - Approve, reject, or request additional information
4. **Resolution**: Admin action triggers:
   - Database update (claimed status, userId assignment)
   - Notification to claimant (see 8.5)
   - Audit log entry

**Admin Panel Requirements**:

| Feature | Description |
|---------|-------------|
| Pending claims list | Filterable, sortable queue |
| Claim detail view | All submitted info, provider profile, history |
| Quick actions | Approve, Reject, Request More Info |
| Bulk actions | Approve/reject multiple claims |
| Claim history | Audit trail of all claim activity |
| Metrics dashboard | Claims per day, approval rate, average review time |

**SLA Target**: Review within 24-48 hours of submission.

#### 8.4 Claimed → Editable Transition (DECIDED)

**On successful claim approval**:

| Action | Implementation |
|--------|----------------|
| Set `Provider.claimed = true` | DB update |
| Set `Provider.userId = claimingUser.id` | DB update |
| Grant edit access | Middleware checks `userId` matches session |
| Add to Provider Dashboard | Provider appears in user's `/provider/dashboard` |
| Remove "Unclaimed" badge | Conditional rendering based on `claimed` |
| Enable lead viewing | Per three-tier model (Chapter 5.12) |

**Access after claiming** (per three-tier model):
- ✅ Edit profile
- ✅ View inbound leads (read-only)
- ❌ Respond to leads (requires subscription)
- ❌ Initiate outreach (requires subscription)

#### 8.5 Claim Notifications (DECIDED)

##### Demo Scope
Not implemented.

##### Production Scope

**Claimant Notifications** (via Email):

| Notification | Trigger | Content |
|--------------|---------|---------|
| Claim received (pending) | Claim submitted, pending review | Confirmation, expected timeline |
| Claim approved | Auto-approved or admin approved | Welcome, next steps, dashboard link |
| Claim rejected | Admin rejects | Reason, what to provide, appeal instructions |
| Additional info requested | Admin requests docs | What's needed, how to submit |

**Admin Notifications** (via Slack to `#claim-reviews`):

| Notification | Trigger | Content |
|--------------|---------|---------|
| New claim pending | Claim enters review queue | Provider info, claimant info, review link |
| Claim SLA warning | Claim pending > 24 hours | Reminder with claim details |
| Daily digest | Morning summary | Count of pending claims, oldest claim age |

#### 8.6 Rejection & Appeal Handling (DECIDED)

##### Demo Scope
Not implemented (no rejections since auto-approve).

##### Production Scope

**Rejection Flow**:
1. Admin rejects claim with required reason
2. Claimant receives rejection email with:
   - Clear reason for rejection
   - What additional info might help
   - Appeal instructions and link
   - Support contact for questions

**Appeal Process**:
1. Claimant submits appeal via form (within 30 days of rejection)
2. Appeal routed to senior reviewer (different from original reviewer)
3. Senior reviewer can:
   - Uphold rejection (with explanation)
   - Overturn and approve claim
   - Request additional verification

**Reclaim After Appeal**:
- If appeal approved → Standard claim transition applies (8.4)
- If appeal denied → Claimant may re-apply after 30 days with new documentation

**Disputed Claims** (edge case):
- If multiple users claim same provider → Flag for manual review
- First verified claimant gets priority
- Others notified and can appeal with documentation
- May require conference call or additional verification

---

## Chapter 9: Family Dashboard

**Purpose**: Central hub for families to manage their care search activities.

**Cross-reference**: See Foundational Decisions → Route Architecture for navigation structure.

| Item | Status | Notes |
|------|--------|-------|
| 9.1 Dashboard Home | ✅ | `/family/dashboard` (renamed from `/dashboard`) |
| 9.2 My Providers (engagements) | ✅ | `/family/my-providers` (renamed from `/dashboard/requests`) |
| 9.3 Engagement Detail + Messaging | ✅ | `/family/my-providers/[id]` |
| 9.4 Saved Providers | ✅ | `/family/saved-providers` (renamed from `/dashboard/saved`) |
| 9.5 Care Profile Management | ✅ | Tab within `/family/dashboard` (consolidated) |
| 9.6 Activity Feed | 🟡 | API exists, needs all engagement types |
| 9.7 Dashboard Stats/Summary | 🟡 | API exists |
| 9.8 Profile Completion Prompts | 🟡 | Needs implementation |
| 9.9 Calendar & Quick Actions | 🟡 | Calendar should be primary element |

### Key Questions
- [x] What should the dashboard home prioritize? → **Calendar first, then profile completion, activity feed, quick actions**
- [x] Activity feed requirements? → **All engagement types: interviews, consultations, tours, requests**

### Architectural Notes

#### 9.1 Dashboard Home Structure (DECIDED)

Family Dashboard (`/family/dashboard`) is a tabbed interface with calendar-first design.

**Tab Structure**:

| Tab | Content |
|-----|---------|
| **Overview** | Calendar, stats, activity feed, quick actions |
| **Care Profile** | Edit care profile fields (consolidated from separate page) |

**Overview Layout Priority** (top to bottom):

| Priority | Component | Purpose |
|----------|-----------|---------|
| 1 | **Calendar** | Primary element — all booked interviews, consultations, tours |
| 2 | **Profile Completion** | Progress bar with CTA if below threshold |
| 3 | **Activity Feed** | Recent engagement activity |
| 4 | **Quick Actions & Stats** | Navigation shortcuts, summary counts |

**Calendar Requirements**:
- Shows all scheduled engagements (tours, consultations, interviews)
- Entries are clickable → navigates to engagement detail
- Week/month view toggle
- Visual distinction by engagement type

#### 9.2–9.3 My Providers — Unified Engagement System (DECIDED)

**Route**: `/family/my-providers` (renamed from `/dashboard/requests`)

**Purpose**: All engagements with providers (both organizations AND individual caregivers) in a single, unified view.

**Supported Provider Types**:

| Provider Type | Engagement Types |
|---------------|------------------|
| **Organizations** (facilities, agencies) | Tours, consultations, general inquiries |
| **Individual Caregivers** | Interviews, hiring inquiries |

**Features**:

| Feature | Status | Notes |
|---------|--------|-------|
| Unified engagement list | ✅ | All provider types in one view |
| Filter by status | ✅ | Pending, Active, Completed, etc. |
| Filter by engagement type | ✅ | Tour, Consultation, Interview |
| Filter by provider type | ✅ | Organization vs Individual |
| Engagement detail view | ✅ | `/family/my-providers/[id]` |
| In-context messaging | ✅ | Messages within engagement |
| Status indicators | ✅ | Visual badges for state |

**Terminology Note**: "Requests" may be revisited in favor of a clearer umbrella term (e.g., "Engagements" or "Conversations"). For now, keeping "requests" in code but using "My Providers" in UI navigation.

#### 9.4 Saved Providers (DECIDED)

**Route**: `/family/saved-providers` (renamed from `/dashboard/saved`)

**Features**:
- Grid/list view of saved providers
- Remove from saved action
- Click through to provider detail
- Supports both organizations and individual caregivers

#### 9.5 Care Profile Management (DECIDED)

**Location**: Tab within `/family/dashboard` (not separate page)

**Implementation**: Consolidate `/dashboard/care-profiles` into dashboard tab.

**Cross-reference**: See Chapter 4 for care profile fields and completion tracking.

#### 9.6 Activity Feed (DECIDED)

**Purpose**: Chronological log of all meaningful engagements.

**Included Activity Types**:

| Activity Type | Description |
|---------------|-------------|
| Request/inquiry sent | Family initiated contact |
| Request status changed | Provider responded, accepted, declined |
| New message received | Unread message notification |
| Tour scheduled | Tour booking confirmed |
| Consultation scheduled | Consultation booking confirmed |
| Interview scheduled | Caregiver interview confirmed |
| Provider saved | Added to saved list |
| Profile updated | Care profile changes |

**Demo Scope**:
- Last 20 activities
- Chronological order (newest first)
- Read/unread visual distinction
- Click to navigate to related item

**Production Scope**:
- Paginated list
- Filter by activity type
- Mark all as read
- Activity grouping by day

#### 9.7 Dashboard Stats (DECIDED)

**Stats to Display**:

| Stat | Description |
|------|-------------|
| Active Engagements | Ongoing conversations/requests |
| Scheduled | Upcoming tours, consultations, interviews |
| Saved Providers | Count of bookmarked providers |
| Messages | Unread message count |

**Terminology**: Using "Engagements" rather than "Requests" in stats where appropriate. May revisit overall terminology post-demo.

#### 9.8 Profile Completion Prompts (DECIDED)

| Profile State | Display |
|---------------|---------|
| Below visibility threshold | Prominent banner: "Complete your profile to be discovered by providers" |
| Above threshold, incomplete | Subtle progress indicator: "Your profile is X% complete" |
| Complete (100%) | No prompt, or celebratory badge |

**Cross-reference**: See Foundational Decisions → Two-Threshold Model.

#### 9.9 Calendar as Primary Element (DECIDED)

**Calendar Requirements**:

| Feature | Demo | Production |
|---------|------|------------|
| Week view | ✅ | ✅ |
| Month view | 🟡 Optional | ✅ |
| Engagement type colors | ✅ | ✅ |
| Click to detail | ✅ | ✅ |
| Add to external calendar | ❌ Defer | ✅ |

**Engagement Type Visual Distinction**:

| Type | Color/Badge |
|------|-------------|
| Tour | Blue |
| Consultation | Green |
| Interview | Purple |

**Quick Actions** (below calendar):

| Action | Destination |
|--------|-------------|
| "Find Providers" | `/providers` |
| "View All Engagements" | `/family/my-providers` |
| "Edit Care Profile" | Dashboard Care Profile tab |

---

## Chapter 10: Provider Dashboard

**Purpose**: Central hub for providers to manage inquiries, engagements, and their profile.

**Cross-reference**: See Foundational Decisions → Route Architecture for navigation structure.

**Important**: All pages are explicit and separate — no dynamic/conditional dashboards that mirror each other. Each user type has dedicated pages for their specific workflows.

| Item | Status | Notes |
|------|--------|-------|
| 10.1 Dashboard Home | ✅ | `/provider/dashboard` |
| 10.2 My Families (engagements) | ✅ | `/provider/my-families` (renamed) |
| 10.3 Engagement Detail + Messaging | ✅ | `/provider/my-families/[id]` |
| 10.4 Saved Families | ✅ | `/provider/saved-families` (renamed) |
| 10.5 Hiring: Find Caregivers | 🟡 | `/provider/find-caregivers` (org providers only) |
| 10.6 Hiring: My Candidates | 🟡 | `/provider/my-candidates` (org providers only) |
| 10.7 Profile Completion Tracking | 🟡 | Widget in dashboard |
| 10.8 Calendar (Scheduled Appointments) | 🟡 | Primary dashboard element |
| 10.9 Provider Profile Edit | 🟡 | Tab within dashboard |

### Key Questions
- [x] What should provider dashboard prioritize? → **Calendar first, then leads/paywall, profile completion, activity**
- [x] Hiring features needed for demo? → **Yes, simplified model (no job postings/applications)**

### Architectural Notes

#### Two Distinct Engagement Systems (DECIDED)

| System | Parties | Purpose | Completely Separate |
|--------|---------|---------|---------------------|
| **Care-Seeking** | Family ↔ Provider | Finding and engaging care | ✅ |
| **Hiring** | Organization ↔ Individual Caregiver | Employment/staffing | ✅ |

These systems do NOT overlap. A provider's "My Families" page shows family engagements only. Hiring engagements appear in "My Candidates" only.

#### 10.1 Dashboard Home Structure (DECIDED)

Provider Dashboard (`/provider/dashboard`) uses calendar-first design with three-tier gating.

**Tab Structure**:

| Tab | Content |
|-----|---------|
| **Overview** | Calendar, lead summary, activity feed, quick actions |
| **Provider Profile** | Edit provider profile fields |

**Overview Layout Priority**:

| Priority | Component | Purpose |
|----------|-----------|---------|
| 1 | **Calendar** | All scheduled tours, consultations, interviews |
| 2 | **Lead Summary / Paywall** | New leads count; upgrade CTA if not subscribed |
| 3 | **Reviews Summary Card** | Unresponded reviews count, quick response access |
| 4 | **Profile Completion** | Progress bar with CTA if below threshold |
| 5 | **Activity Feed** | Recent engagement activity, including new reviews |
| 6 | **Quick Actions & Stats** | Navigation shortcuts |

#### Reviews Summary Card (DECIDED)

A persistent dashboard card for review management:

```
┌─────────────────────────────────────────────────────────┐
│  REVIEWS                                    [View All]  │
├─────────────────────────────────────────────────────────┤
│  ★ 4.5 average  •  47 reviews  •  2 awaiting response  │
│                                                         │
│  Recent:                                                │
│  ★★★★★ Jane D. — "Exceptional care..."    [Respond]   │
│  ★★★★☆ Michael R. — "Good experience..."  ✓ Responded │
└─────────────────────────────────────────────────────────┘
```

**Card Features:**
- Aggregate stats (average rating, total count)
- Unresponded review count (highlighted if >0)
- Quick links to recent reviews needing response
- "View All" opens full review management view

**"View All" Review Management** (sub-view within dashboard, not a top-level tab):
- Filterable list: All | Awaiting Response | Responded
- Each review expandable or links to detail panel
- Response form accessible inline or via slide-out

**Cross-reference:** See Chapter 15 for full review response workflow.

**Three-Tier Gating Display**:

| Tier | Dashboard Experience |
|------|---------------------|
| Unclaimed | N/A (no dashboard access) |
| Claimed (Free) | See lead count, blurred previews, "Upgrade to respond" CTA |
| Subscribed | Full access to all features |

#### 10.2–10.3 My Families — Bidirectional Engagement (DECIDED)

**Route**: `/provider/my-families` (renamed from `/provider/requests`)

**Purpose**: All engagements with families — both inbound AND outbound.

**Bidirectional Support**:

| Direction | Initiated By | Examples |
|-----------|--------------|----------|
| **Inbound** | Family | Tour request, consultation request, inquiry |
| **Outbound** | Provider | Follow-up, availability outreach, proactive contact |

**Engagement Data Model**:

```
Engagement {
  id
  familyId        → Family
  providerId      → Provider (org or individual)
  initiatedBy     → FAMILY | PROVIDER
  type            → TOUR | CONSULTATION | INQUIRY | OUTREACH
  status          → PENDING | ACTIVE | COMPLETED | DECLINED | CANCELLED
  messages[]
  scheduledEvents[]
}
```

**Key Principle**: One engagement record, two views. Family sees it in "My Providers", Provider sees it in "My Families".

**Features**:

| Feature | Status |
|---------|--------|
| Unified list (inbound + outbound) | ✅ |
| Filter by direction | ✅ |
| Filter by status | ✅ |
| Filter by engagement type | ✅ |
| Engagement detail view | ✅ |
| In-context messaging | ✅ |
| Response actions | ✅ (gated by subscription) |

**Context-Aware CTAs**: Button labels must match engagement type and context:
- Tour: "Schedule Tour", "Confirm Tour", "Reschedule"
- Consultation: "Schedule Consultation", "Confirm Time"
- Interview: "Schedule Interview", "Confirm Interview"
- General: "Send Message", "Accept", "Decline"

#### 10.4 Saved Families (DECIDED)

**Route**: `/provider/saved-families` (renamed from `/provider/saved`)

**Purpose**: Families the provider has bookmarked.

**Note**: Only families with visibility enabled appear in browse/save.

#### 10.5–10.6 Hiring System — Simplified Model (DECIDED)

**Applies to**: Organization providers hiring individual caregivers.

**What hiring is NOT**:
- ❌ No job posting system
- ❌ No application tracking
- ❌ No formal application workflow

**What hiring IS**:
- ✅ Profile visibility toggles (caregiver marks "available for hiring", org marks "currently hiring")
- ✅ Browse pages (Find Caregivers / Find Organizations)
- ✅ Save functionality
- ✅ Direct engagement initiation
- ✅ Messaging within engagement
- ✅ Interview scheduling

**Organization Provider Pages (Hiring Caregivers)**:

| Dropdown Label | Route | Purpose |
|----------------|-------|---------|
| "Find Caregivers" | `/provider/find-caregivers` | Browse caregivers available for hire |
| "Saved Candidates" | `/provider/saved-candidates` | Bookmarked caregivers |
| "My Candidates" | `/provider/my-candidates` | All hiring engagements with caregivers |

**Individual Caregiver Pages (Finding Jobs)**:

| Dropdown Label | Route | Purpose |
|----------------|-------|---------|
| "Find Organizations" | `/provider/find-organizations` | Browse orgs actively hiring |
| "Saved Opportunities" | `/provider/saved-opportunities` | Bookmarked potential employers |
| "My Opportunities" | `/provider/my-opportunities` | All hiring engagements with orgs |

**Route Naming Principle**: All provider-mode routes use `/provider/` prefix. Dropdown labels must match route names exactly (e.g., "My Opportunities" → `/provider/my-opportunities`).

**Hiring Engagement Model**:

```
HiringEngagement {
  id
  organizationId  → Provider (org type)
  caregiverId     → Provider (individual caregiver)
  initiatedBy     → ORGANIZATION | CAREGIVER
  type            → INTERVIEW_REQUEST | INQUIRY
  status          → PENDING | INTERVIEWING | HIRED | DECLINED | WITHDRAWN
  messages[]
  scheduledInterviews[]
}
```

**Bidirectional**:

| Direction | Initiated By | Appears In |
|-----------|--------------|------------|
| Org → Caregiver | Organization | Org's "My Candidates" + Caregiver's "My Opportunities" |
| Caregiver → Org | Caregiver | Caregiver's "My Opportunities" + Org's "My Candidates" |

**Navigation Display**: Hiring pages appear in account dropdown only for relevant user types:
- Organization providers see: "Find Caregivers", "Saved Candidates", "My Candidates"
- Individual caregivers see: "Find Organizations", "Saved Opportunities", "My Opportunities"

#### 10.7 Profile Completion Tracking (DECIDED)

Same pattern as Family Dashboard:
- Progress bar widget
- CTA if below visibility threshold
- Cross-reference: Chapter 5.13

#### 10.8 Calendar as Primary Element (DECIDED)

**Engagement Type Visual Distinction**:

| Type | Color | System |
|------|-------|--------|
| Tour | Blue | Care-Seeking |
| Consultation | Green | Care-Seeking |
| Interview (with family) | Purple | Care-Seeking |
| Hiring Interview | Orange | Hiring |

**Features**: Same as Family Dashboard (week view, click to detail, type colors).

#### 10.9 Provider Profile Edit (DECIDED)

**Location**: Tab within `/provider/dashboard`

**Cross-reference**: See Chapter 5 for provider profile fields.

#### Activity Feed — All Systems (DECIDED)

**Care-Seeking Activities**:

| Activity | Direction |
|----------|-----------|
| Inquiry received | Inbound |
| Inquiry sent | Outbound |
| Tour scheduled | Both |
| Consultation scheduled | Both |
| Message received | Inbound |
| Status changed | Both |

**Hiring Activities** (org providers):

| Activity | Direction |
|----------|-----------|
| Interview request received | Inbound |
| Interview request sent | Outbound |
| Interview scheduled | Both |
| Candidate message received | Inbound |
| Hiring status changed | Both |

**All activities include inbound AND outbound across both systems.**

---

## Chapter 11: Engagements

**Purpose**: The unified system for all interactions between parties — covering care-seeking (Family ↔ Provider) and hiring (Org ↔ Caregiver).

**Cross-reference**:
- Chapter 9 (Family Dashboard) and Chapter 10 (Provider Dashboard) for engagement views
- Chapter 12 for messaging within engagements
- Chapter 13 for scheduling within engagements

| Item | Status | Notes |
|------|--------|-------|
| 11.1 Engagement Creation | ✅ | Bidirectional (any party can initiate) |
| 11.2 Engagement Types | 🟡 | Expand beyond CONSULTATION/HIRING |
| 11.3 Engagement Status Workflow | ✅ | PENDING → ACCEPTED → ACTIVE → COMPLETED |
| 11.4 Engagement Context/Reason | ✅ | Aligned with types |
| 11.5 Contact Preferences & Video | 🟡 | Phone/Email/Video |
| 11.6 Engagement Listing | ✅ | Bidirectional views per user type |
| 11.7 Engagement Expiration | ⬜ | Deferred for demo |
| 11.8 Systems Separation | 🟡 | Separate models for Care-Seeking vs Hiring |

### Key Questions
- [x] Are all request statuses being used correctly? → **Yes, added ACTIVE state**
- [x] Request expiration rules? → **Deferred for demo, documented for production**

### Architectural Notes

#### 11.1 Engagement Creation — Bidirectional (DECIDED)

Any party can initiate an engagement.

**Care-Seeking System**:

| Initiator | Target | Examples |
|-----------|--------|----------|
| Family | Provider (org) | Tour request, consultation, inquiry |
| Family | Provider (individual) | Interview request, inquiry |
| Provider | Family | Availability outreach, follow-up |

**Hiring System**:

| Initiator | Target | Examples |
|-----------|--------|----------|
| Organization | Caregiver | Interview request, hiring inquiry |
| Caregiver | Organization | Job inquiry, availability notice |

**Implementation**: Current `ConsultRequest.senderId` already supports bidirectional initiation.

#### 11.2 Engagement Types (DECIDED)

Expanded beyond simple CONSULTATION/HIRING to granular types.

**Care-Seeking Types**:

| Type | Description | Typical Initiator |
|------|-------------|-------------------|
| `TOUR` | Facility visit scheduling | Family |
| `CONSULTATION` | Service discussion | Family or Provider |
| `INTERVIEW` | Family interviewing individual caregiver | Family |
| `INQUIRY` | General question | Family or Provider |
| `OUTREACH` | Proactive contact | Provider |

**Hiring Types**:

| Type | Description | Typical Initiator |
|------|-------------|-------------------|
| `HIRING_INTERVIEW` | Employment interview | Org or Caregiver |
| `HIRING_INQUIRY` | Job-related question | Org or Caregiver |

**Implementation**: Add `engagementType` enum field to models.

#### 11.3 Engagement Status Workflow (DECIDED)

| Status | Meaning | Transitions From |
|--------|---------|------------------|
| `PENDING` | Awaiting response from recipient | (initial) |
| `ACCEPTED` | Recipient agreed to engage | PENDING |
| `ACTIVE` | Ongoing conversation/scheduling | ACCEPTED |
| `COMPLETED` | Engagement concluded successfully | ACTIVE |
| `DECLINED` | Recipient declined | PENDING |
| `CANCELLED` | Initiator withdrew | PENDING, ACCEPTED, ACTIVE |

**Status Flow Diagram**:
```
PENDING → ACCEPTED → ACTIVE → COMPLETED
    ↓         ↓         ↓
 DECLINED  CANCELLED  CANCELLED
```

#### 11.3.1 Contact Information Release (DECIDED)

**Contact info visibility rules by user type**:

| User Type | Contact Info Visibility | Trigger |
|-----------|------------------------|---------|
| **Family** | Hidden until accepted | Engagement status = ACCEPTED |
| **Individual Caregiver** | Hidden until accepted | Engagement status = ACCEPTED |
| **Org Provider** | Always visible | No gating (public directory info) |

**Rationale**:
- Families and individual caregivers are individuals with privacy concerns
- Org providers are businesses with publicly available contact info
- Acceptance signals mutual intent to connect

**What "contact info" includes** (gated for individuals):
- Phone number
- Email address
- Full address

**What's always visible** (regardless of acceptance):
- Name
- General location (city/state)
- Profile details (services, description, etc.)

#### 11.4 Engagement Context/Reason (DECIDED)

`contactReason` field aligned with engagement types:

| Type | Relevant Reasons |
|------|------------------|
| TOUR | Schedule tour, Reschedule tour |
| CONSULTATION | Request pricing, Discuss services, Placement assistance |
| INTERVIEW | Schedule interview, Discuss availability |
| INQUIRY | Ask a question, Request information |
| OUTREACH | Share availability, Follow up |

#### 11.5 Contact Preferences & Video Calling (DECIDED)

**Contact Method Options**:

| Method | Demo | Production |
|--------|------|------------|
| Phone | ✅ | ✅ |
| Email | ✅ | ✅ |
| Video Call | ✅ | ✅ |
| In-App Only | ❌ Defer | ✅ |

**Video Calling Implementation**:

##### Demo Scope
- Video call button in engagement detail
- Generate unique video call link (Daily.co or similar service)
- User clicks to join in new browser tab
- Link included in calendar invite

##### Production Scope
- Embedded video UI within platform
- Recording capability (consider)
- Virtual waiting room

#### 11.5.1 Calendar Integration (DECIDED)

**Approach**: Auto-invite as default (Option C), ICS fallback.

##### Demo Scope

| Feature | Included |
|---------|----------|
| Auto-send Google Calendar invite on acceptance | ✅ Target |
| "Add to Calendar" (.ics download) | ✅ Fallback |
| View calendar event in engagement detail | ✅ |
| Re-send calendar invite button | ✅ |

##### Production Scope

| Feature | Included |
|---------|----------|
| All demo features | ✅ |
| Calendar sync (read user's availability) | ✅ |
| Availability checking before proposing times | ✅ |
| Multiple calendar provider support | ✅ |

**Auto-Invite Behavior**:

| Trigger | Action |
|---------|--------|
| Engagement with scheduled date/time is ACCEPTED | System generates Google Calendar invite |
| Invite sent to | Both parties' email addresses |
| Invite includes | Title, date/time, location or video link, engagement link |

**User Preferences** (set during onboarding):
- "Allow calendar invitations to be sent to this email" — **default ON** (opt-out, not opt-in)
- Can be changed in account settings

**Engagement Detail Page Calendar Features**:
- View calendar event details
- Re-send calendar invite button
- "Add to Calendar" (.ics) download link
- Edit/reschedule triggers new invite

#### 11.6 Engagement Listing — Bidirectional Views (DECIDED)

**Cross-reference**: Already documented in Chapters 9 & 10.

| User | Page | Shows |
|------|------|-------|
| Family | My Providers | All engagements with providers (inbound + outbound) |
| Provider | My Families | All engagements with families (inbound + outbound) |
| Org Provider | My Candidates | All hiring engagements (inbound + outbound) |
| Individual Caregiver | My Opportunities | All hiring engagements (inbound + outbound) |

#### 11.7 Engagement Expiration (DECIDED)

##### Demo Scope
Deferred — no automatic expiration.

##### Production Scope

| Rule | Behavior |
|------|----------|
| No response in 14 days | Mark as EXPIRED, notify initiator |
| No activity in 30 days | Mark as STALE, prompt both parties |
| Completed engagements | Archive after 90 days |

**Notifications**:
- "Your inquiry to [Provider] has expired with no response"
- "Your conversation with [Family] has been inactive for 30 days"

#### 11.8 Engagement Systems Separation (DECIDED)

**Decision**: Separate models for Care-Seeking and Hiring (Option B).

| System | Model | Parties |
|--------|-------|---------|
| **Care-Seeking** | `Engagement` | Family ↔ Provider |
| **Hiring** | `HiringEngagement` | Org ↔ Individual Caregiver |

**Rationale**: Aligns with "explicit, not dynamic" principle. Clean separation prevents conflation of different relationship types.

**Shared Behavior** (implemented consistently across both models):
- Bidirectional initiation
- Status workflow
- Messaging
- Scheduling
- Calendar integration

**Separate Concerns**:
- Different parties (family vs org/caregiver)
- Different engagement types
- Different pages/views
- Different calendar colors

---

## Chapter 12: Messaging System

**Purpose**: Enable communication within engagements between families, providers, and caregivers.

**Cross-reference**:
- Chapter 11 (Engagements) for engagement context
- Chapter 16 (Notifications) for message notification integration

| Item | Status | Notes |
|------|--------|-------|
| 12.1 Messages Within Engagements | ✅ | `Message` model, API exists |
| 12.2 Read/Unread Status | ✅ | `status` field (SENT/DELIVERED/READ), timestamps |
| 12.3 Typing Indicators | ❌ | Deferred — requires real-time to be useful |
| 12.4 File Attachments | ✅ | `attachments` JSON field, basic support for demo |
| 12.5 Real-time Updates | 🟡 | Polling for demo, WebSocket for production |
| 12.6 Message Notifications | 🟡 | In-app for demo, email digest optional |

### Key Questions
- [x] Is polling acceptable for demo, or do we need real-time? → **Polling acceptable for demo**
- [x] File attachments needed for demo? → **Yes, basic file sharing included**

### Architectural Notes

#### 12.1 Messages Within Engagements (DECIDED)

**Model Approach**: Single `Message` model with nullable foreign keys to both engagement systems.

| Field | Purpose |
|-------|---------|
| `engagementId` | FK to Care-Seeking engagement (nullable) |
| `hiringEngagementId` | FK to Hiring engagement (nullable) |
| `senderId` | User who sent the message |
| `content` | Message text |
| `attachments` | JSON array of file attachments |
| `status` | SENT / DELIVERED / READ |
| `createdAt`, `readAt`, `deliveredAt` | Timestamps |

**Rationale**: Message logic is identical across both systems. Single model avoids duplication while maintaining clear relationships.

#### 12.2 Read/Unread Status (DECIDED)

**Current implementation accepted.**

| Status | Meaning | Trigger |
|--------|---------|---------|
| `SENT` | Message created | On send |
| `DELIVERED` | Recipient's client received | On fetch (polling) |
| `READ` | Recipient viewed message | On view in UI |

**Visual indicators**:
- Unread messages highlighted in thread
- Read receipts shown to sender (simple indicator for demo, checkmarks for production)

#### 12.3 Typing Indicators (DECIDED)

**Status**: ❌ Deferred for demo.

**What they are**: Visual feedback ("John is typing...") when the other person is composing a message.

**Why deferred**: Requires real-time communication (WebSocket) to feel natural. With polling, typing indicators become stale and create poor UX (persistent "typing..." after person stopped).

**Production**: Implement alongside WebSocket messaging.

#### 12.4 File Attachments (DECIDED)

##### Demo Scope

| Feature | Included |
|---------|----------|
| Image attachments (JPG, PNG, GIF) | ✅ |
| Document attachments (PDF, DOC, etc.) | ✅ |
| File size limit | 10MB |
| Upload progress indicator | ✅ |
| Image preview in thread | ✅ Basic |
| Click to download/view | ✅ |

##### Production Scope

| Feature | Included |
|---------|----------|
| All demo features | ✅ |
| Increased file size limit | 25MB |
| Virus/malware scanning | ✅ |
| Image thumbnails/optimization | ✅ |
| File type restrictions | ✅ |

**Use cases**:
- Family shares care recipient photo
- Provider shares brochure/pricing PDF
- Caregiver shares certification documents

**Security Note** (Post-Demo Requirement):
- HIPAA compliance considerations for health-related documents
- Secure file storage and access controls
- Data retention and deletion policies
- Encryption at rest and in transit

#### 12.5 Real-time Updates (DECIDED)

##### Demo Scope
**Polling-based** — client fetches new messages every 5-10 seconds.

| Aspect | Detail |
|--------|--------|
| Mechanism | HTTP polling on interval |
| Latency | 0-10 seconds |
| Complexity | Low |
| Infrastructure | Standard HTTP |

##### Production Scope
**WebSocket/SSE primary** with polling fallback.

| Aspect | Detail |
|--------|--------|
| Mechanism | WebSocket or Server-Sent Events |
| Latency | <1 second |
| Fallback | Polling if connection fails |

**Rationale for demo**: Demo conversations are low-volume. 5-10 second delay is acceptable. Real-time adds significant complexity for marginal demo benefit.

#### 12.6 Message Notifications (DECIDED)

**Cross-reference**: Chapter 16 (Notifications) for full notification system.

##### Demo Scope

| Channel | Behavior |
|---------|----------|
| In-app | ✅ Unread badge, activity feed entry |
| Email | 🟡 Daily digest of unread messages (optional) |
| SMS | ❌ Defer |
| Push | ❌ Defer |

##### Production Scope

| Channel | Behavior |
|---------|----------|
| In-app | ✅ Real-time badge updates |
| Email | ✅ Configurable: immediate, digest, or off |
| SMS | ✅ Optional for urgent messages |
| Push | ✅ Mobile app notifications |

**Ideal for demo**: Basic transactional email (new message notification) would improve experience. Can be deferred if it materially slows delivery.

#### 12.7 Message UI/UX (DECIDED)

##### Demo Scope

| Feature | Included |
|---------|----------|
| Chronological message list | ✅ |
| Sender name/avatar | ✅ |
| Timestamps | ✅ |
| Read receipts (simple) | ✅ |
| Message input + send button | ✅ |
| Attach file button | ✅ |
| Emoji picker | ❌ Defer |
| Message editing | ❌ Not planned |
| Message deletion | ❌ Defer |

##### Production Scope

| Feature | Included |
|---------|----------|
| All demo features | ✅ |
| Rich read receipts (checkmarks) | ✅ |
| Emoji picker | 🟡 Consider |
| Message deletion | 🟡 Consider |
| Message search | ✅ |

---

## Chapter 13: Multi-Context Scheduling

**Purpose**: Support scheduling for various engagement types across different user relationships.

### Scheduling Contexts

| Context | Relationship | Engagement Type |
|---------|--------------|-----------------|
| **Tours** | Family → Facility-Based Provider | TOUR |
| **Consultations** | Family → Service-Based Provider (Home Care, Home Health, Hospice) | CONSULTATION |
| **Interviews** | Family → Individual Caregiver | INTERVIEW |
| **Outreach** | Provider → Family | OUTREACH |
| **Hiring Interviews** | Organization → Caregiver | HIRING_INTERVIEW |
| **Applications** | Caregiver → Organization | APPLICATION |

> **Note**: See [Provider Type Taxonomy](#provider-type-taxonomy-decided) for full list of facility-based vs service-based providers.

### Features

| Item | Status | Notes |
|------|--------|-------|
| 13.1 Scheduling Model | ✅ | Integrated into `Engagement` / `HiringEngagement` models |
| 13.2 Context-Aware CTAs & Language | ⬜ | CTA text varies by provider type |
| 13.3 Propose Appointment | 🟡 | Via engagement creation with `scheduledAt` |
| 13.4 Accept / Decline Flow | 🟡 | Part of engagement status workflow |
| 13.5 Reschedule Flow | ⬜ | Update `scheduledAt`, notify other party |
| 13.6 Cancellation Flow | 🟡 | Set status to CANCELLED |
| 13.7 Email Reminders | ⬜ | **Demo-critical**: 24h + 1h before |
| 13.8 SMS Reminders | ⬜ | **Demo-critical**: 24h + 1h before via Twilio |
| 13.9 Calendar Integration | ⬜ | Opt-out default, both parties receive invites |
| 13.10 Video Call vs In-Person | ⬜ | `meetingType` field, clear UX distinction |

### Key Questions — RESOLVED

- [x] **Should all scheduling contexts use the same model, or separate models?**
  - **DECIDED**: Scheduling is integrated into engagement models. No separate `TourAppointment` model.
  - `Engagement` model handles Family ↔ Provider scheduling
  - `HiringEngagement` model handles Org ↔ Caregiver scheduling
  - Both have `scheduledAt` DateTime field

- [x] **Context-specific field requirements?**
  - **DECIDED**: `meetingType` (VIDEO_CALL | IN_PERSON), `videoCallUrl`, `location` fields

- [x] **Video call integration requirements?**
  - **DECIDED**: External link for demo (Zoom/Google Meet URL), clear UX indicators

### Architectural Notes

#### 13.1 Scheduling Model — INTEGRATED (DECIDED)

Scheduling is **not a separate system** — it's embedded in engagement workflow:

- `scheduledAt`: DateTime field on both `Engagement` and `HiringEngagement`
- `meetingType`: 'VIDEO_CALL' | 'IN_PERSON'
- `videoCallUrl`: string (required if VIDEO_CALL)
- `location`: string (required if IN_PERSON — address or "Provider's facility")

Status workflow handles scheduling state:
- `PENDING` = proposed, awaiting response
- `ACCEPTED` = date/time confirmed
- `ACTIVE` = engagement in progress
- `COMPLETED` / `CANCELLED` = terminal states

#### 13.2 Context-Aware CTAs & Language (DECIDED)

> **Reference**: See [CTA Reference](#cta-reference-decided) in Foundational Decisions for the complete CTA matrix.

CTA text varies by provider type and marketplace context:

**Care Marketplace — Family initiating:**

| Provider Category | Provider Types | CTA Text | Creates Engagement Type |
|-------------------|----------------|----------|------------------------|
| Facility-Based | Assisted Living, Memory Care, Nursing Home, Rehab, Independent Living, CCRC, Adult Day Care | "Schedule Tour" | TOUR |
| Service-Based | Home Care Agency, Home Health Agency, Hospice Agency | "Schedule Consultation" | CONSULTATION |
| Individual | Independent Caregiver | "Request Interview" | INTERVIEW |

**Care Marketplace — Provider initiating:**

| Provider Category | CTA Text | Creates Engagement Type |
|-------------------|----------|------------------------|
| All Provider Types | "Offer Services" | OUTREACH |

**Hiring Marketplace:**

| Direction | CTA Text | Creates Engagement Type |
|-----------|----------|------------------------|
| Organization → Caregiver | "Invite to Interview" | HIRING_INTERVIEW |
| Caregiver → Organization | "Apply" | APPLICATION |

#### 13.7 Email Reminders (DECIDED — Demo-Critical)

**Both parties** receive email reminders for all engagement types.

| Timing | Content |
|--------|---------|
| 24 hours before | Engagement type, date/time, video link OR location, "View Details" link |
| 1 hour before | Same, with "Starting soon" emphasis |

**Implementation:**
- Scheduled job (Vercel Cron or node-cron) runs every 15 minutes
- Checks for engagements in reminder windows
- Sends to both parties using email on file
- Google Calendar reminders serve as additional layer (if integrated)

#### 13.8 SMS Reminders (DECIDED — Demo-Critical)

**Both parties** receive SMS reminders for all engagement types.

| Timing | Content |
|--------|---------|
| 24 hours before | Brief: type, time, link to details |
| 1 hour before | Same, with "Starting soon" |

**Implementation:**
- Twilio for SMS delivery
- Same scheduled job as email reminders
- Requires phone number (see Onboarding Impact below)

**Onboarding Impact — Phone Number Collection:**
- **Option B (DECIDED)**: Phone number required during onboarding wizard
- Context message: "We'll send you reminders about upcoming appointments"
- If user skips onboarding, prompt when scheduling first engagement
- Fallback to Option C (optional with clear trade-off) if Option B proves insufficient

#### 13.9 Calendar Integration (DECIDED)

**Opt-out by default** — calendar invites sent automatically using email on file.

| Behavior | Details |
|----------|---------|
| Default | Auto-send calendar invite to both parties when engagement is accepted |
| Opt-out | User can disable in settings (but reminders still sent via email/SMS) |
| Fallback | ICS file download for non-Google calendars |

**Both parties always receive:**
1. Calendar invite (opt-out)
2. Email reminders (24h + 1h)
3. SMS reminders (24h + 1h)

This applies to **all engagement types**: Family ↔ Provider, Org ↔ Caregiver, etc.

**Add to Calendar UI:**
- Clearly shows event will be added automatically
- Works for both in-person and video engagements
- Consistent UX across all scheduling contexts

#### 13.10 Video Call vs In-Person UX (DECIDED)

**Core Principle**: Users must always be able to orient themselves. At any point, they should clearly see:
1. **What** — Is this video or in-person?
2. **When** — Date and time (with timezone)
3. **How** — Join link (video) or address (in-person)

**UI Requirements by Surface:**

| Surface | Requirements |
|---------|--------------|
| **Dashboard** | Upcoming engagements with visual badge (video icon vs map pin), time, prominent "Join Call" button for video |
| **Engagement Detail** | Large meeting type indicator, countdown/time, "Join Call" button OR address with map link |
| **Calendar Event** | Meeting type in title, video link in description/location field, clear time with timezone |
| **Reminder Emails/SMS** | Meeting type, time, join link OR address |

**Demo Scope:**
- User selects meeting type when proposing (or provider sets when accepting)
- Clear visual distinction everywhere (icons, colors, labels)
- "Join Call" button always visible for video engagements
- Manual video URL entry by provider

**Production Scope:**
- Automatic Zoom/Meet link generation via API
- "Add to Calendar" button on engagement detail (in addition to auto-invite)
- Join link copied to clipboard on click
- Pre-meeting lobby/waiting room

### Demo vs Production Summary

| Feature | Demo Scope | Production Scope |
|---------|------------|------------------|
| Email Reminders | 24h + 1h via scheduled job | Same + delivery tracking, retry logic |
| SMS Reminders | 24h + 1h via Twilio | Same + opt-out preferences per engagement |
| Phone Collection | Required during onboarding | Same |
| Calendar Invites | Auto-send (opt-out), Google focus | Multi-provider (Google, Apple, Outlook) |
| Video Links | Manual URL entry | Auto-generated via Zoom/Meet API |
| Video UX | Clear indicators, "Join Call" button | Same + waiting room, one-click join |

---

## Chapter 14: Saved / Favorites

**Purpose**: Allow users to save and organize items of interest for later reference.

### Features

| Item | Status | Notes |
|------|--------|-------|
| 14.1 Families Save Providers | ✅ | `SavedProvider` model, API |
| 14.2 Providers Save Families | ✅ | `SavedFamilyProfile` model, API |
| 14.3 Notes on Saved Items | ✅ | `notes` field exists |
| 14.4 Saved Lists UI | ✅ | Both dashboards have `/saved` |
| 14.5 Unsave Functionality | ✅ | Exists |
| 14.6 Orgs Save Caregivers (Hiring) | ⬜ | `SavedCandidate` model needed |
| 14.7 Caregivers Save Orgs (Hiring) | ⬜ | `SavedOpportunity` model needed |

### Key Questions — RESOLVED

- [x] **Any issues with current implementation?**
  - **DECIDED**: Care-seeking saves are complete. Hiring system saves need new models.

- [x] **Should hiring saves reuse existing models or use separate models?**
  - **DECIDED**: Option A — Separate, purpose-built models (see rationale below)

### Architectural Notes

#### Two Save Systems (Parallel to Engagement Architecture)

Following the same pattern as `Engagement` / `HiringEngagement`, saves are split by context:

| Context | Saver | Saved | Model |
|---------|-------|-------|-------|
| **Care-Seeking** | Family | Provider | `SavedProvider` ✅ |
| **Care-Seeking** | Provider | Family | `SavedFamilyProfile` ✅ |
| **Hiring** | Organization | Individual Caregiver | `SavedCandidate` ⬜ |
| **Hiring** | Individual Caregiver | Organization | `SavedOpportunity` ⬜ |

#### Option A Rationale (DECIDED)

We chose **separate models over context fields** because:

1. **Consistency**: Matches our Engagement/HiringEngagement split
2. **Explicit over implicit**: No context filtering needed in queries
3. **Type safety**: Compiler enforces correct relationships
4. **Error resistance**: Hard to misuse; no forgotten context filters
5. **Independent evolution**: Models can diverge if needs differ

#### New Models Required

```prisma
model SavedCandidate {
  id             String   @id @default(cuid())
  organizationId String
  caregiverId    String
  notes          String?
  createdAt      DateTime @default(now())

  organization   Provider @relation("OrgSavedCandidates", fields: [organizationId], references: [id])
  caregiver      Provider @relation("CaregiverSavedBy", fields: [caregiverId], references: [id])

  @@unique([organizationId, caregiverId])
}

model SavedOpportunity {
  id             String   @id @default(cuid())
  caregiverId    String
  organizationId String
  notes          String?
  createdAt      DateTime @default(now())

  caregiver      Provider @relation("CaregiverSavedOpportunities", fields: [caregiverId], references: [id])
  organization   Provider @relation("OrgSavedByCaregiver", fields: [organizationId], references: [id])

  @@unique([caregiverId, organizationId])
}
```

#### UI Placement

Routes must match dropdown navigation labels exactly:

| User Type | Dropdown Label | Route | Content |
|-----------|---------------|-------|---------|
| Family | "Saved Providers" | `/family/saved-providers` | Saved providers (for care) |
| Provider (Org) | "Saved Families" | `/provider/saved-families` | Saved families (leads) |
| Provider (Org) | "Saved Candidates" | `/provider/saved-candidates` | Saved caregivers (hiring) |
| Provider (Caregiver) | "Saved Opportunities" | `/provider/saved-opportunities` | Saved organizations (jobs) |

#### Demo vs Production

| Feature | Demo Scope | Production Scope |
|---------|------------|------------------|
| Care-seeking saves | ✅ Complete | Same |
| Hiring saves | New models + basic UI | Same + bulk actions, tags |
| Notes on saves | ✅ Text field | Rich text, templates |

---

## Chapter 15: Reviews & Ratings

**Purpose**: Build a two-sided accountability system that creates trust, improves quality, and helps families make informed decisions across all care interactions.

### Three Non-Negotiable Pillars

| Pillar | Description |
|--------|-------------|
| **1. Universal Quality Signal** | Every provider (claimed or unclaimed) has an Olera Score. Families always see something meaningful. |
| **2. Two-Sided Reviews** | Families ↔ Providers AND Organizations ↔ Caregivers. Accountability flows both directions. Reviews tied to actual interactions. |
| **3. Care-Embedded Collection** | On-site QR reviews, provider-distributed tools, platform prompts, phone calls. All reviews live within Olera. |

### Features

| Item | Status | Notes |
|------|--------|-------|
| 15.1 Olera Score (Unified) | 🟡 | Master score aggregating all signals |
| 15.2 Review Model (Care-Seeking) | ✅ | `Review` model exists, needs expansion |
| 15.3 Review Model (Hiring) | ⬜ | `HiringReview` model needed |
| 15.4 Two-Sided Reviews | ⬜ | Family ↔ Provider, Org ↔ Caregiver |
| 15.5 Blind Review Window | ⬜ | 14-day window, reveals when both submit |
| 15.6 Interaction-Based Reviews | ⬜ | Tours, consults, interviews, ongoing care |
| 15.7 Multi-Channel Collection | ⬜ | Platform prompts, QR, links, phone |
| 15.8 Review Trigger Logic | ⬜ | "Did this happen?" confirmation flow |
| 15.9 Prompt Cadence | ⬜ | Multiple reminders, quarterly for ongoing |
| 15.10 Direct Provider Page Reviews | ⬜ | Public entry point with structured intake |
| 15.11 Structured Feedback Sessions | ⬜ | Post-demo: scheduled feedback calls |
| 15.12 Review Display & Trust Signals | 🟡 | Components exist, need refinement |
| 15.13 Provider Response to Reviews | ⬜ | One public response allowed |
| 15.14 Review Moderation | 🟡 | `approved` field exists |
| 15.15 Helpful Votes | ✅ | `helpfulCount` field, API exists |

### Key Questions — RESOLVED

- [x] **Who can leave reviews?**
  - **DECIDED**: Engagement-gated preferred. Non-engagement reviews (QR/direct) accepted but marked "Unverified."

- [x] **How do Olera Score and user reviews relate?**
  - **DECIDED**: One unified Olera Score that incorporates all signals including Olera-native reviews over time.

- [x] **Are provider→family reviews visible?**
  - **DECIDED**: Two-sided reviews visible both ways (full transparency).

- [x] **What about hiring context?**
  - **DECIDED**: Organization ↔ Caregiver reviews included (demo if feasible, otherwise post-demo).

### Architectural Notes

---

#### 15.1 Olera Score — Unified Master Score (DECIDED)

The Olera Score is the **single, primary quality signal** for every provider.

**Inputs to Olera Score:**

| Signal | Source | Weight (conceptual) |
|--------|--------|---------------------|
| Community Sentiment | AI-derived from public web | High |
| Public Reputation | Aggregated reputation signals | Medium |
| Google Reviews | When available | Medium |
| Profile Completeness | Claimed provider data | Low-Medium |
| **Olera-Native Reviews** | Platform reviews (as collected) | High (increasing over time) |

**Key Properties:**
- Always present (0-5 scale) for every provider, claimed or unclaimed
- Does not require Olera reviews to exist (uses other signals)
- Incorporates Olera reviews as additional strong signal when available
- Becomes more accurate and credible as first-party data grows
- Consistent methodology applied at nationwide scale
- Not easily gameable by individual actions

**Display:**
- Prominent on all provider cards and profiles
- "How is this calculated?" expandable explanation
- Olera-native review count shown separately for transparency

---

#### 15.2-15.4 Two-Sided Review System (DECIDED)

Reviews flow in both directions across both engagement systems:

**Care-Seeking Context:**

| Reviewer | Reviewed | Model | Visibility |
|----------|----------|-------|------------|
| Family | Provider | `Review` | Public (on provider profile) |
| Provider | Family | `FamilyReview` | Visible to other providers |

**Hiring Context:**

| Reviewer | Reviewed | Model | Visibility |
|----------|----------|-------|------------|
| Organization | Caregiver | `HiringReview` | Visible to other organizations |
| Caregiver | Organization | `HiringReview` | Public (on org profile) |

**Rating Dimensions:**

| Context | Reviewer | Dimensions |
|---------|----------|------------|
| Care-Seeking | Family → Provider | Overall, Care Quality, Communication, Responsiveness, (Facility Condition if applicable) |
| Care-Seeking | Provider → Family | Overall, Communication, Reliability, Environment |
| Hiring | Org → Caregiver | Overall, Professionalism, Reliability, Skills |
| Hiring | Caregiver → Org | Overall, Communication, Work Environment, Support |

---

#### 15.5 Blind Review Window (DECIDED)

Prevents retaliation, encourages honest feedback (Uber/Airbnb pattern).

**Flow:**
```
Engagement/Interaction Completes (or scheduled time passes)
                    │
     ┌──────────────┴──────────────┐
     ▼                              ▼
┌─────────────┐              ┌─────────────┐
│  Party A    │              │  Party B    │
│ Prompted to │              │ Prompted to │
│   Review    │              │   Review    │
└──────┬──────┘              └──────┬──────┘
       │                            │
       └────────────┬───────────────┘
                    │
         BLIND WINDOW (14 days)
                    │
    ┌───────────────┴───────────────┐
    │  Window expires OR both submit │
    └───────────────┬───────────────┘
                    │
                    ▼
         ┌─────────────────┐
         │ Reviews Revealed │
         │  to both parties │
         └─────────────────┘
```

**Rules:**
- 14-day window from interaction completion
- Neither party sees the other's review until both submit OR window expires
- Reminders sent during window (see Prompt Cadence)
- Skipped reviews are recorded as "No review submitted"

---

#### 15.6 Interaction-Based Reviews (DECIDED)

Reviews can be left for **any interaction type**, not just ongoing care:

| Interaction Type | Review Prompt Trigger | Example Questions |
|-----------------|----------------------|-------------------|
| **Tour** | After scheduled tour date | "How was your facility visit?" |
| **Consultation** | After scheduled consult | "Was the consultation helpful?" |
| **Interview** | After scheduled interview | "How was your interview experience?" |
| **One-Time Service** | After service date | "How was the service provided?" |
| **Ongoing Care** | Periodic (quarterly) | "How is your ongoing care experience?" |

**Why this matters:**
- Early touchpoints affect family decisions
- Increases review volume and transparency
- Even if care never starts, the interaction experience matters

---

#### 15.7 Multi-Channel Review Collection (DECIDED)

**Channel 1: Platform Prompts (Automated)**
- Triggered after scheduled interaction time passes
- Email + SMS + in-app notification
- Multiple reminders over 14-day window
- Quarterly prompts for ongoing care relationships

**Channel 2: QR Code + Short Link (Care-Embedded)**
- Each provider gets unique QR + `olera.co/r/[code]`
- Mobile-optimized review intake
- Staff can facilitate on-site during/after care
- Printable for facility display

**Channel 3: Provider-Distributed Links (Staff Tools)**
- Provider admin generates shareable review links
- Distributes to care staff for field collection
- Optional attribution tracking (which staff collected)

**Channel 4: Provider-Initiated Requests (Direct)**
- Provider sends review request to specific family via Olera
- Rate-limited to prevent spam (e.g., max 1 request per family per 30 days)
- Clear opt-out for families

**Channel 5: Direct on Provider Page (Public Entry)**
- Review intake accessible from public provider page
- Captures structured context (see 15.10)
- Important for users arriving from Google

**Channel 6: Phone Calls (Post-Demo)**
- Phase 1: Human call center workflow (possibly AI-assisted transcription)
- Phase 2: AI calling workflows with safeguards
- Higher conversion, especially for elder care demographics

---

#### 15.8 Review Trigger Logic (DECIDED)

We don't always have verified engagement completion, but we have scheduled timestamps.

**Trigger Flow:**
```
Scheduled Interaction Time Passes
              │
              ▼
    ┌─────────────────────┐
    │ "Did this happen?"  │
    │   confirmation      │
    └──────────┬──────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
   [YES]            [NO]
       │               │
       ▼               ▼
┌─────────────┐  ┌──────────────────┐
│ Review      │  │ Reschedule flow  │
│ Prompt      │  │ + Alternative    │
│             │  │   recommendations│
└─────────────┘  └──────────────────┘
```

**Applies to:** Tours, consultations, interviews, ongoing care touchpoints

---

#### 15.9 Prompt Cadence (DECIDED)

**For Single Interactions (Tour, Consult, Interview):**

| Day | Action |
|-----|--------|
| 0 | Interaction scheduled time passes |
| 0 | "Did this happen?" confirmation sent |
| 1 | If confirmed: Review prompt (email + SMS + in-app) |
| 4 | Reminder #1 (if not submitted) |
| 10 | Reminder #2 (if not submitted) |
| 14 | Final reminder + window closes |

**For Ongoing Care Relationships:**

| Interval | Action |
|----------|--------|
| After first visit/week | Initial review prompt |
| Every 3-6 months | Periodic review prompt ("How is care going?") |
| On relationship end | Final review prompt |

**Growth Lever Mindset:**
- Review collection is a core engagement loop
- Multiple touchpoints increase conversion
- Long-term cadence maintains review freshness

---

#### 15.10 Direct Provider Page Reviews (DECIDED)

For users arriving at provider page without tracked engagement (e.g., from Google):

**Structured Intake Captures:**

| Field | Purpose |
|-------|---------|
| Reviewer Role | Family member, caregiver, other |
| Interaction Type | Tour, consult, interview, ongoing care, other |
| Timeframe | When did this occur? (date range) |
| Duration | If ongoing, how long? |
| Relationship to Care Recipient | Self, spouse, parent, etc. |

**Verification Status:**
- If reviewer has account + matching engagement: "Verified Review"
- If reviewer has account, no matching engagement: "Olera Member"
- If no account: "Unverified" (prompted to create account)

---

#### 15.11 Structured Feedback Sessions (Post-Demo)

Optional workflow for early relationship health checks:

**Flow:**
1. After first visit (or within first 2-3 weeks), Olera prompts family
2. Family can schedule short feedback call/session with provider
3. Platform facilitates scheduling (uses engagement system)
4. Structured agenda: What's working? What could improve?
5. Follow-up prompt to convert session insights into review

**Benefits:**
- Organized, platform-supported feedback channel
- Improves provider retention and quality
- Surfaces issues before they become problems
- Creates additional review collection opportunity

**Scope:** Post-demo enhancement

---

#### 15.12 Review Display & Trust Signals (DECIDED)

**On Provider Profile:**

```
┌─────────────────────────────────────────────────────────┐
│  OLERA SCORE: 4.2 ★★★★☆                                │
│  Based on community data, reputation signals,           │
│  and 47 Olera reviews                                   │
│  [How is this calculated?]                              │
├─────────────────────────────────────────────────────────┤
│  OLERA REVIEWS (47)                     [Leave Review]  │
│  ─────────────────                                      │
│  ★★★★★ "Exceptional care for my mother..."             │
│  Jane D. • Verified Family • Ongoing Care • 6 months   │
│  [Provider Response: "Thank you Jane..."]              │
│  👍 12 found this helpful                               │
│                                                         │
│  ★★★★☆ "Good tour experience, staff was helpful..."    │
│  Michael R. • Verified Family • Tour • Dec 2024        │
│  👍 3 found this helpful                                │
└─────────────────────────────────────────────────────────┘
```

**Trust Signals:**

| Signal | Display |
|--------|---------|
| Verified Review | "Verified Family" / "Verified Caregiver" badge |
| Interaction Type | Tour, Consultation, Ongoing Care, etc. |
| Duration | For ongoing: "6 months", "2 years" |
| Recency | Relative time ("3 months ago") |
| Helpful Count | "X found this helpful" |
| Provider Response | One response allowed, displayed below review |

---

#### 15.13 Provider Response to Reviews (DECIDED)

**Core Rules:**
- Provider can post **one public response** per review
- Shows engagement and accountability
- Must be respectful (subject to moderation)
- Response appears below review on profile
- Response is FREE for all providers (not gated behind membership)

**Review Response Workflow:**

```
New Review Submitted
        │
        ▼
┌───────────────────────────────────────┐
│ 1. Activity Feed Notification         │
│    "New 5-star review from Jane D."   │
│    [View & Respond]                   │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ 2. Reviews Summary Card Updates       │
│    "2 awaiting response"              │
│    Recent review appears in card      │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ 3. Provider Clicks "Respond"          │
│    Opens Review Detail Panel          │
│    (slide-out or modal)               │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ 4. Provider Composes Response         │
│    Sees full review + response form   │
│    Warning: "This will be public"     │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ 5. Response Published                 │
│    Appears on public provider profile │
│    Family notified (optional)         │
└───────────────────────────────────────┘
```

**Dashboard Integration:**

| Surface | Purpose |
|---------|---------|
| **Activity Feed** | Notification when new review received |
| **Reviews Summary Card** | Persistent access to reviews, unresponded count |
| **Review Detail Panel** | Full review + response form (slide-out/modal) |
| **"View All" Sub-view** | Filterable list within dashboard |

**Cross-reference:** See Chapter 10 → Reviews Summary Card for dashboard layout.

**Review Response Reminders:**

Providers receive escalating reminders for unresponded reviews:

| Timing | Channel | Message |
|--------|---------|---------|
| Day 0 | In-app, Email, SMS | "New review from Jane D. — respond to show you care" |
| Day 3 | In-app, Email | "Reminder: Jane D.'s review is awaiting your response" |
| Day 7 | In-app, Email | "Final reminder: Reviews with responses build trust" |

**Cross-reference:** See Chapter 16 → Review Response Reminders for notification details.

**Public Display:**

```
┌─────────────────────────────────────────────────────────┐
│  ★★★★★ "Exceptional care for my mother..."             │
│  Jane D. • Verified Family • Ongoing Care • 6 months   │
│  Dec 15, 2024                                          │
│                                                         │
│  ↳ Response from Sunrise Senior Living:                │
│    "Thank you so much for your kind words, Jane.       │
│    It was our privilege to care for your mother."      │
│    — Dec 16, 2024                                      │
└─────────────────────────────────────────────────────────┘
```

---

#### 15.14 Review Moderation (DECIDED)

**Demo Scope:**
- Auto-approve all reviews (controlled environment)
- Basic profanity filter (reject obvious violations)

**Production Scope:**
- Auto-approve with filters (profanity, spam detection)
- Provider can flag reviews for admin review
- Admin panel for moderation queue
- Appeal process for disputed reviews

---

### New Models Required

```prisma
// Family reviews of Provider (care-seeking)
model Review {
  id              String    @id @default(cuid())
  providerId      String
  reviewerId      String    // User ID (family)
  engagementId    String?   // Nullable for unverified reviews

  // Ratings
  overallRating   Int       // 1-5
  careQuality     Int?      // 1-5, optional
  communication   Int?      // 1-5, optional
  responsiveness  Int?      // 1-5, optional

  // Content
  content         String
  interactionType String    // TOUR, CONSULTATION, INTERVIEW, ONGOING_CARE, OTHER
  duration        String?   // For ongoing: "6 months", etc.
  timeframe       DateTime? // When interaction occurred

  // Status
  status          String    @default("PENDING") // PENDING, PUBLISHED, HIDDEN
  verifiedReview  Boolean   @default(false)

  // Response
  providerResponse String?
  respondedAt      DateTime?

  // Engagement
  helpfulCount    Int       @default(0)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  provider        Provider  @relation(fields: [providerId], references: [id])
  reviewer        User      @relation(fields: [reviewerId], references: [id])
  engagement      Engagement? @relation(fields: [engagementId], references: [id])
}

// Provider reviews of Family (care-seeking)
model FamilyReview {
  id              String    @id @default(cuid())
  familyProfileId String
  reviewerId      String    // Provider user ID
  engagementId    String?

  overallRating   Int
  communication   Int?
  reliability     Int?
  environment     Int?

  content         String

  status          String    @default("PENDING")
  createdAt       DateTime  @default(now())

  familyProfile   FamilyProfile @relation(fields: [familyProfileId], references: [id])
  reviewer        User      @relation(fields: [reviewerId], references: [id])
}

// Org ↔ Caregiver reviews (hiring context)
model HiringReview {
  id                  String    @id @default(cuid())
  hiringEngagementId  String?
  reviewerId          String
  revieweeId          String    // Provider ID (org or caregiver)
  reviewerType        String    // ORGANIZATION or CAREGIVER

  overallRating       Int
  professionalism     Int?
  reliability         Int?
  communication       Int?

  content             String

  status              String    @default("PENDING")
  createdAt           DateTime  @default(now())

  reviewer            User      @relation("HiringReviewAuthor", fields: [reviewerId], references: [id])
  reviewee            Provider  @relation("HiringReviewSubject", fields: [revieweeId], references: [id])
}

// Review collection tracking
model ReviewRequest {
  id              String    @id @default(cuid())
  providerId      String
  familyUserId    String?
  engagementId    String?

  channel         String    // PLATFORM_PROMPT, QR_CODE, PROVIDER_LINK, PROVIDER_REQUEST, DIRECT, PHONE
  shortCode       String?   @unique // For QR/link: olera.co/r/[shortCode]

  sentAt          DateTime?
  reminders       Json      @default("[]") // Array of reminder timestamps
  completedAt     DateTime?
  reviewId        String?   // Resulting review, if submitted

  createdAt       DateTime  @default(now())
}
```

---

### Demo vs Production Summary

| Feature | Demo Scope | Production Scope |
|---------|------------|------------------|
| Olera Score | Unified display, incorporates reviews | Same + refined weighting algorithm |
| Two-Sided Reviews (Care) | Family ↔ Provider | Same |
| Two-Sided Reviews (Hiring) | If feasible, otherwise specify | Org ↔ Caregiver |
| Blind Review Window | 14 days | Same |
| Collection: Platform Prompts | Email + in-app | + SMS |
| Collection: QR + Links | Basic implementation | + Analytics |
| Collection: Phone Calls | ❌ Defer | Human → AI calling |
| Review Trigger Logic | "Did this happen?" flow | Same |
| Prompt Cadence | Multiple reminders, quarterly ongoing | Same + A/B testing |
| Direct Provider Page | Structured intake | Same + account prompts |
| Feedback Sessions | ❌ Defer | Scheduled feedback calls |
| Provider Responses | One response | Same + templates |
| Moderation | Auto-approve | Filters + admin queue |

---

## Chapter 16: Notifications

**Purpose**: Keep users informed of all relevant activity and updates through a unified, multi-channel notification system.

### Core Principles (DECIDED)

| Principle | Decision |
|-----------|----------|
| **Activity Feed = Canonical Log** | All notifications appear in the Activity feed on the dashboard. Single source of truth. |
| **All Notifications Are Critical** | No priority tiers. Every notification is actionable or important. |
| **SMS First-Class Channel** | SMS enabled for ALL notification types by default, not just reminders. |
| **Individual Delivery** | Notifications sent individually, not batched into digests. |
| **Centralized Preferences** | Settings page controls all notification preferences. Not inline or in modals. |

### Features

| Item | Status | Notes |
|------|--------|-------|
| 16.1 Activity Feed (Unified) | 🟡 | Canonical notification log on dashboard |
| 16.2 In-App Notification Count | ✅ | `/api/notifications/unread-count` |
| 16.3 Mark Notifications Viewed | ✅ | `/api/notifications/mark-viewed` |
| 16.4 Notification List UI | 🟡 | Needs verification |
| 16.5 Notification Types | ⬜ | Comprehensive list below |
| 16.6 Email Notifications | ⬜ | All types, individual delivery |
| 16.7 SMS Notifications | ⬜ | All types, first-class channel |
| 16.8 Notification Preferences | ⬜ | Centralized in Settings |
| 16.9 Quiet Hours | ⬜ | Default business hours M-F |
| 16.10 Push Notifications | ⬜ | Planned for production |

### Key Questions — RESOLVED

- [x] **What notification types are needed for demo?**
  - **DECIDED**: All types listed below. Every notification is critical.

- [x] **In-app only for demo, or email/SMS required?**
  - **DECIDED**: All three channels for demo. SMS is first-class, not optional.

- [x] **Should notifications be digested?**
  - **DECIDED**: No. Individual delivery by default. Digest only if users report fatigue later.

- [x] **Where do notification preferences live?**
  - **DECIDED**: Dedicated Settings page. Not inline or in engagement detail.

### Architectural Notes

---

#### 16.1 Activity Feed — Unified Notification Log (DECIDED)

The Activity feed on the dashboard is the **single source of truth** for all system activity.

**Properties:**
- Every notification appears in the Activity feed
- Chronologically ordered (newest first)
- Click-through to relevant page (engagement, message, review, etc.)
- Unread indicator for unseen items
- "Mark all as read" action

**Activity Feed Location:**
- Family Dashboard: Activity tab/section
- Provider Dashboard: Activity tab/section
- Both modes share the same notification data for the user

**Feed Entry Structure:**
```
┌─────────────────────────────────────────────────────────┐
│ [Icon] [Title]                              [Timestamp] │
│        [Description/Preview]                            │
│        [Action Button if applicable]                    │
└─────────────────────────────────────────────────────────┘

Example:
┌─────────────────────────────────────────────────────────┐
│ 📅 Tour Scheduled                              2h ago   │
│    Sunrise Senior Living accepted your tour request    │
│    for Jan 20 at 2:00 PM                               │
│    [View Details]                                       │
└─────────────────────────────────────────────────────────┘
```

---

#### 16.5 Notification Types — Comprehensive List (DECIDED)

All types below are delivered via **all three channels** (In-App + Email + SMS) by default.

**Engagement Notifications (Care-Seeking):**

| Event | Recipient | Message Example |
|-------|-----------|-----------------|
| New engagement received | Provider | "New tour request from Jane D." |
| Engagement accepted | Family | "Sunrise Senior Living accepted your tour" |
| Engagement declined | Family | "Your consultation request was declined" |
| Engagement rescheduled | Both | "Your tour has been rescheduled to Jan 22" |
| Engagement cancelled | Both | "Tour with Sunrise Senior Living was cancelled" |
| Engagement status change | Both | "Your consultation is now active" |

**Hiring Engagement Notifications (Org ↔ Caregiver):**

| Event | Recipient | Message Example |
|-------|-----------|-----------------|
| New hiring interest | Caregiver | "Sunrise Home Care is interested in you" |
| Interview scheduled | Both | "Interview scheduled for Jan 21 at 10 AM" |
| Hiring status change | Both | "Your interview has been confirmed" |

**Scheduling Notifications:**

| Event | Recipient | Message Example |
|-------|-----------|-----------------|
| Appointment reminder (24h) | Both | "Reminder: Tour tomorrow at 2:00 PM" |
| Appointment reminder (1h) | Both | "Starting soon: Tour in 1 hour" |
| Calendar invite sent | Both | "Calendar invite sent for your consultation" |

**Messaging Notifications:**

| Event | Recipient | Message Example |
|-------|-----------|-----------------|
| New message | Recipient | "New message from Sunrise Senior Living" |

**Review Notifications:**

| Event | Recipient | Message Example |
|-------|-----------|-----------------|
| "Did this happen?" prompt | Both | "Did your tour with Sunrise happen?" |
| Review reminder | Both | "Don't forget to leave a review" |
| New review received | Provider | "You received a new 5-star review" |
| Review response received | Family | "Sunrise responded to your review" |

**Review Response Reminders (Escalating):**

Providers receive reminders to respond to reviews, with escalating urgency:

| Timing | Channels | Message |
|--------|----------|---------|
| Day 0 (new review) | In-app, Email, SMS | "New review from Jane D. — respond to show you care" |
| Day 3 (if unresponded) | In-app, Email | "Reminder: Jane D.'s review is awaiting your response" |
| Day 7 (if unresponded) | In-app, Email | "Final reminder: Reviews with responses build trust" |

**Cross-reference:** See Chapter 15 → Provider Response to Reviews for full workflow.

**System Notifications:**

| Event | Recipient | Message Example |
|-------|-----------|-----------------|
| Profile incomplete prompt | User | "Complete your profile to get matched" |
| Subscription status | Provider | "Your subscription renews in 7 days" |
| Account security | User | "New login from a new device" |

---

#### 16.6-16.7 Email & SMS — All Types, Individual Delivery (DECIDED)

**Delivery Strategy:**
- **Individual sends** for all notifications (no batching/digest)
- SMS is a **first-class channel**, not a fallback
- All three channels fire for each notification (unless user opts out)

**Email Content:**
- Clear subject line matching notification type
- Brief body with context and CTA
- "View in Olera" button linking to relevant page
- Unsubscribe link in footer

**SMS Content:**
- Concise (160 char limit awareness)
- Key info + short link to Olera
- Example: "Olera: Your tour with Sunrise is tomorrow at 2 PM. View details: olera.co/e/abc123"

**Delivery Infrastructure:**
- Email: Existing email provider (SendGrid, Resend, etc.)
- SMS: Twilio (decided in Chapter 13)
- Both triggered by same notification event

---

#### 16.8 Notification Preferences — Centralized in Settings (DECIDED)

**Location:** `/settings/notifications` (or Settings page with Notifications section)

**NOT in:**
- Engagement detail pages
- Modals
- Inline flows

**Settings Available:**

| Setting | Options | Default |
|---------|---------|---------|
| Email notifications | On / Off | On |
| SMS notifications | On / Off | On |
| In-app notifications | Always on | On (not toggleable) |
| Quiet hours | Enable / Disable | Enabled |
| Quiet hours range | Time picker | 6 PM - 8 AM weekdays |

**Demo Scope:**
- Basic on/off toggles for email and SMS
- Quiet hours with default business hours

**Production Scope:**
- Per-type granular controls (e.g., disable SMS for review reminders only)
- Custom quiet hours schedule
- Vacation/pause mode

---

#### 16.9 Quiet Hours (DECIDED)

**Default Behavior:**
- Quiet hours: **Outside business hours, Monday-Friday**
- Suggested default: 6 PM - 8 AM local time on weekdays
- Weekends: User preference (could be all day or business hours only)

**During Quiet Hours:**
- In-app notifications: Still logged to Activity feed (always)
- Email: Held and delivered at next business hour window
- SMS: Held and delivered at next business hour window

**Exceptions (bypass quiet hours):**
- Appointment reminders within 2 hours of scheduled time
- Urgent system/security alerts

**Demo Scope:**
- Default quiet hours enabled
- No customization UI (hardcoded defaults)

**Production Scope:**
- Full customization in Settings
- Per-day schedule
- Timezone-aware

---

#### 16.10 Push Notifications — Planned for Production (DECIDED)

**Clarification:**
- **Browser push** (service workers): Deferred for production
- **Native mobile push** (iOS/Android): Out of scope, but architect for future extension

**Demo Scope:**
- In-app + Email + SMS are sufficient
- No browser push implementation

**Production Scope:**
- Browser push opt-in
- Architecture supports future mobile app push
- Same notification events trigger push channel

**Architectural Consideration:**
- Notification service should be channel-agnostic
- Adding push later = adding another delivery adapter
- Notification preferences model should include `pushEnabled` field now (defaulted off)

---

### Notification Model

```prisma
model Notification {
  id          String    @id @default(cuid())
  userId      String

  // Type and content
  type        String    // ENGAGEMENT_NEW, MESSAGE_NEW, REMINDER_24H, REVIEW_PROMPT, etc.
  title       String
  body        String
  data        Json      @default("{}") // Structured payload (engagementId, providerId, etc.)

  // Linking
  actionUrl   String?   // Deep link to relevant page

  // Status
  read        Boolean   @default(false)
  readAt      DateTime?

  // Delivery tracking
  emailSent   Boolean   @default(false)
  emailSentAt DateTime?
  smsSent     Boolean   @default(false)
  smsSentAt   DateTime?

  createdAt   DateTime  @default(now())

  user        User      @relation(fields: [userId], references: [id])

  @@index([userId, read])
  @@index([userId, createdAt])
}

model NotificationPreferences {
  id              String   @id @default(cuid())
  userId          String   @unique

  emailEnabled    Boolean  @default(true)
  smsEnabled      Boolean  @default(true)
  pushEnabled     Boolean  @default(false) // For future

  quietHoursEnabled Boolean @default(true)
  quietHoursStart   String  @default("18:00") // 6 PM
  quietHoursEnd     String  @default("08:00") // 8 AM
  quietHoursTimezone String @default("America/New_York")

  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id])
}
```

---

### Cross-Chapter Consistency

This notification system supports all previously decided flows:

| Chapter | Notification Integration |
|---------|-------------------------|
| **Ch. 11: Engagements** | New engagement, status changes → all channels |
| **Ch. 12: Messaging** | New message → all channels |
| **Ch. 13: Scheduling** | Reminders (24h, 1h), reschedule, cancel → all channels |
| **Ch. 15: Reviews** | "Did this happen?", reminders, new review → all channels |
| **Ch. 10: Hiring** | Hiring engagement events → all channels |

---

### Demo vs Production Summary

| Feature | Demo Scope | Production Scope |
|---------|------------|------------------|
| Activity Feed | Unified log on dashboard | Same + filtering/search |
| In-App | Bell icon + dropdown + Activity feed | Same |
| Email | All notification types, individual sends | Same + templates |
| SMS | All notification types via Twilio | Same + delivery optimization |
| Preferences | Basic on/off in Settings | Granular per-type controls |
| Quiet Hours | Default business hours (hardcoded) | Fully customizable |
| Push (Browser) | ❌ Defer | Service worker implementation |
| Push (Mobile) | ❌ Out of scope | Native app integration |
| Digests | ❌ Not used | Optional if user fatigue reported |

---

## Chapter 17: Profile Completion & Matching

**Purpose**: Track profile completeness and provide intelligent matching across all user relationships — families finding providers, and organizations finding caregivers.

### Core Principle

> **Better data → Better matches**
>
> As profiles become more complete and detailed, match quality improves. Users should visibly see this relationship: adding more information leads to stronger, more relevant recommendations.

### Matching Contexts

| Context | Party A | Party B | Purpose |
|---------|---------|---------|---------|
| **Care-Seeking** | Family | Provider Organization | Family finds care facilities/agencies |
| **Care-Seeking** | Family | Individual Caregiver | Family finds independent caregivers |
| **Hiring** | Organization | Individual Caregiver | Organization finds employees |

### Features

| Item | Status | Notes |
|------|--------|-------|
| 17.1 Profile Completion % (All Types) | 🟡 | Needs explicit storage |
| 17.2 Completion Storage | ⬜ | Store in DB for matching |
| 17.3 "Complete Your Profile" Prompts | 🟡 | May exist, needs verification |
| 17.4 Match Scoring Algorithm | ⬜ | Rule-based, weighted |
| 17.5 Match Score Display | ⬜ | Percentage or qualitative |
| 17.6 "Best Matches" - Family → Provider | ⬜ | Dashboard recommendations |
| 17.7 "Best Matches" - Provider → Family | ⬜ | Dashboard recommendations |
| 17.8 "Best Matches" - Org → Caregiver | ⬜ | Hiring recommendations |
| 17.9 "Best Matches" - Caregiver → Org | ⬜ | Opportunity recommendations |
| 17.10 Olera Score Integration | ⬜ | Factors into match ranking |

### Key Questions — RESOLVED

- [x] **Should completion % be stored in DB or calculated?**
  - **DECIDED**: Stored in DB. Enables sophisticated matching and progressive enhancement.

- [x] **Match scoring algorithm requirements?**
  - **DECIDED**: Rule-based weighted matching. No ML for demo. More attribute overlap = higher score.

- [x] **Is matching needed for demo?**
  - **DECIDED**: Yes. Must demonstrate that better profile data leads to better matches.

- [x] **Should Olera Score factor into matching?**
  - **DECIDED**: Yes. Higher-quality providers are preferentially recommended.

### Architectural Notes

---

#### 17.1-17.2 Profile Completion — Stored Explicitly (DECIDED)

Profile completion is **stored in the database**, not calculated on-the-fly.

**Why Store:**
- Enables efficient matching queries
- Supports progressive enhancement (demo → production)
- Allows tracking completion over time
- Required for "better data → better matches" demonstration

**Completion Calculation:**

Each profile type has **required fields** (visibility threshold) and **optional fields** (richness).

```
Completion % = (Filled Required Fields / Total Required) * 60%
             + (Filled Optional Fields / Total Optional) * 40%
```

Required fields contribute 60% of completion score (ensures threshold is weighted heavily).
Optional fields contribute 40% (rewards additional detail).

---

#### Profile Attributes by Type

**Family Care Profile:**

| Field | Category | Matching Weight |
|-------|----------|-----------------|
| Location (city/zip) | Required | High |
| Care type needed | Required | High |
| Care recipient relationship | Required | - |
| Budget range | Optional | Medium |
| Schedule/timing preferences | Optional | Medium |
| Specific care needs | Optional | High |
| Preferences (language, gender) | Optional | Medium |
| Timeline/urgency | Optional | Low |
| Living situation | Optional | Medium |

**Provider Organization:**

| Field | Category | Matching Weight |
|-------|----------|-----------------|
| Organization name | Required | - |
| Location | Required | High |
| Provider type | Required | High |
| Services offered | Optional | High |
| Price range | Optional | Medium |
| Availability/capacity | Optional | Medium |
| Specializations | Optional | High |
| Amenities | Optional | Low |
| Photos | Optional | - |
| Description | Optional | - |
| Olera Score | System | High |

**Individual Caregiver:**

| Field | Category | Matching Weight |
|-------|----------|-----------------|
| Name | Required | - |
| Location | Required | High |
| Services offered | Required | High |
| Experience level | Optional | Medium |
| Certifications | Optional | High |
| Availability/schedule | Optional | High |
| Rate range | Optional | Medium |
| Specializations | Optional | High |
| Languages | Optional | Medium |
| Bio | Optional | - |
| Olera Score | System | High |

**Organization as Employer (Hiring Context):**

| Field | Category | Matching Weight |
|-------|----------|-----------------|
| Location | Required | High |
| Roles/positions needed | Optional | High |
| Experience requirements | Optional | Medium |
| Certifications required | Optional | High |
| Schedule needs | Optional | High |
| Pay range offered | Optional | Medium |
| Benefits offered | Optional | Low |

---

#### 17.4 Match Scoring Algorithm (DECIDED)

**Approach:** Rule-based weighted matching. No ML required.

**Core Logic:**
```
Match Score = Base Alignment Score
            + Attribute Overlap Score
            + Olera Score Bonus
            + Profile Completeness Bonus
```

**Scoring Breakdown:**

| Component | Description | Max Points |
|-----------|-------------|------------|
| **Base Alignment** | Required attributes match (location proximity, care type) | 40 |
| **Attribute Overlap** | Each matching optional attribute adds points | 40 |
| **Olera Score Bonus** | Provider quality signal (Olera Score × 4) | 20 |
| **Completeness Bonus** | Both profiles highly complete | 10 |
| **Total** | | 110 |

**Displayed as:** Percentage (score/110 × 100) or qualitative tier

---

#### Match Scoring: Family ↔ Provider

```
BASE ALIGNMENT (40 points max)
├── Location within service area     +20 (required for any match)
└── Care type alignment              +20 (required for any match)

ATTRIBUTE OVERLAP (40 points max)
├── Budget aligns with pricing       +8
├── Schedule aligns with availability +8
├── Specific needs match services    +4 each (max +16)
└── Preferences match (language, etc.) +4 each (max +8)

OLERA SCORE BONUS (20 points max)
└── Provider Olera Score × 4         (e.g., 4.5 → +18)

COMPLETENESS BONUS (10 points max)
├── Family profile >80% complete     +5
└── Provider profile >80% complete   +5

TOTAL POSSIBLE: 110 points
```

**Example Scenarios:**

| Family Profile | Provider Profile | Match Score | Display |
|----------------|------------------|-------------|---------|
| Minimal (location + care type only) | Full profile | ~55/110 | "50% Match" |
| Partial (+ budget, schedule) | Full profile | ~75/110 | "68% Match" |
| Complete (all fields) | Full profile, high Olera | ~100/110 | "91% Match" |

**Key Insight:** A family with minimal profile data CAN still see providers, but match scores will be lower because fewer dimensions can be compared. Adding budget, schedule, and specific needs unlocks higher match scores.

---

#### Match Scoring: Organization ↔ Caregiver (Hiring)

```
BASE ALIGNMENT (40 points max)
├── Location within commute range    +20 (required)
└── Role/service type alignment      +20 (required)

ATTRIBUTE OVERLAP (40 points max)
├── Experience meets requirements    +10
├── Certifications match needs       +10
├── Schedule/availability aligns     +10
└── Pay range overlaps               +10

OLERA SCORE BONUS (20 points max)
└── Caregiver Olera Score × 4        (if applicable)

COMPLETENESS BONUS (10 points max)
├── Org hiring profile >80% complete +5
└── Caregiver profile >80% complete  +5

TOTAL POSSIBLE: 110 points
```

---

#### 17.5 Match Score Display (DECIDED)

**Options:**

| Format | Example | Pros | Cons |
|--------|---------|------|------|
| Percentage | "78% Match" | Precise, familiar | May feel arbitrary |
| Qualitative | "Strong Match" | Friendly, simple | Less granular |
| Stars | ★★★★☆ | Visual | Confuses with ratings |

**Recommendation for Demo:** **Percentage with qualitative label**

| Score Range | Label | Display |
|-------------|-------|---------|
| 85-100% | Excellent Match | "92% Match ✓ Excellent" |
| 70-84% | Strong Match | "76% Match — Strong" |
| 50-69% | Good Match | "58% Match — Good" |
| 30-49% | Partial Match | "42% Match" |
| <30% | Low Match | Not shown in recommendations |

---

#### 17.3 "Complete Your Profile" Prompts (DECIDED)

**Prompt Triggers:**

| Condition | Location | Message | Priority |
|-----------|----------|---------|----------|
| Below visibility threshold | Dashboard banner (persistent) | "Complete your profile to be visible and get matched" | Critical |
| 50-79% complete | Dashboard card (dismissible) | "Add more details to improve your match quality" | Medium |
| 80%+ complete | None | Profile is considered complete | - |
| After viewing low match | Contextual tooltip | "Add [field] to improve matches like this" | Low |

**Contextual Prompts (Demo Enhancement):**

When a user views a provider with a low match score, show:
> "This match could be stronger. Add your budget and schedule preferences to see better matches."

This directly reinforces: **better data → better matches**.

---

#### 17.6-17.9 "Best Matches" Recommendations (DECIDED)

**Framing:** "Best matches for your needs" (not "Nearby" or "Recommended")

**Family Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│  BEST MATCHES FOR YOUR NEEDS                            │
│  Based on your care profile                             │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐                                            │
│  │ [Photo] │  Sunrise Senior Living                     │
│  │         │  ★ 4.5 Olera Score │ 92% Match ✓ Excellent│
│  │         │  Assisted Living • 2.3 mi                  │
│  └─────────┘  [View Profile]                            │
│                                                         │
│  ┌─────────┐                                            │
│  │ [Photo] │  Maria G. — Independent Caregiver          │
│  │         │  ★ 4.2 Olera Score │ 78% Match — Strong   │
│  │         │  Home Care • 1.8 mi                        │
│  └─────────┘  [View Profile]                            │
├─────────────────────────────────────────────────────────┤
│  💡 Add your budget and schedule to improve matches     │
│     [Complete Profile]                                  │
└─────────────────────────────────────────────────────────┘
```

**Provider Dashboard (Care-Seeking Leads):**
```
┌─────────────────────────────────────────────────────────┐
│  FAMILIES MATCHING YOUR SERVICES                        │
├─────────────────────────────────────────────────────────┤
│  Jane D. — Looking for Memory Care                      │
│  85% Match ✓ Excellent │ Budget: $5-7k/mo              │
│  [View Profile] [Send Message]                          │
└─────────────────────────────────────────────────────────┘
```

**Provider Dashboard (Hiring — Organizations):**
```
┌─────────────────────────────────────────────────────────┐
│  BEST CAREGIVER MATCHES                                 │
│  Based on your hiring needs                             │
├─────────────────────────────────────────────────────────┤
│  Sarah M. — CNA, 5 years experience                     │
│  88% Match ✓ Excellent │ Available: Full-time          │
│  [View Profile] [Express Interest]                      │
└─────────────────────────────────────────────────────────┘
```

**Provider Dashboard (Hiring — Individual Caregivers):**
```
┌─────────────────────────────────────────────────────────┐
│  BEST OPPORTUNITIES FOR YOU                             │
│  Organizations looking for your skills                  │
├─────────────────────────────────────────────────────────┤
│  Sunrise Home Care — Hiring CNAs                        │
│  82% Match — Strong │ Pay: $22-28/hr                   │
│  [View Details] [Express Interest]                      │
└─────────────────────────────────────────────────────────┘
```

---

#### 17.10 Olera Score Integration (DECIDED)

Olera Score factors into matching as a **quality signal**:

- Higher Olera Score → Higher match score (all else equal)
- Ensures quality providers surface to the top
- Does NOT replace attribute matching (a 5-star provider with wrong care type won't match)

**Weight:** Olera Score contributes up to ~18% of total match score (20/110 points)

---

### Data Model

```prisma
model ProfileCompletion {
  id              String   @id @default(cuid())
  userId          String   @unique

  // Completion percentages
  familyCompletion    Int?     // 0-100, null if no family profile
  providerCompletion  Int?     // 0-100, null if no provider profile
  hiringCompletion    Int?     // 0-100, for org hiring profile

  // Threshold status
  familyVisibilityMet    Boolean @default(false)
  providerVisibilityMet  Boolean @default(false)

  // Field-level tracking (for prompts)
  missingFields       Json    @default("[]") // Array of field names

  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id])
}

// Match scores could be cached or calculated on-demand
// For demo: calculate on-demand
// For production: consider caching with invalidation
```

---

### Demonstrating "Better Data → Better Matches" in Demo

**User Flow (Demo Scenario):**

1. **Family signs up** with minimal profile (location, care type)
2. **Views "Best Matches"** — sees providers with 40-60% match scores
3. **Sees prompt:** "Add your budget to see better matches"
4. **Adds budget** — match scores for budget-aligned providers jump to 60-75%
5. **Adds schedule preferences** — scores jump again to 70-85%
6. **Adds specific care needs** — some providers now show 85-95% match

**Visual Progression:**
```
Step 1: "58% Match — Good"
Step 2: "72% Match — Strong"  (+14 from budget)
Step 3: "81% Match — Strong"  (+9 from schedule)
Step 4: "93% Match ✓ Excellent" (+12 from care needs)
```

This creates a clear, demonstrable relationship that will resonate with stakeholders.

---

### Demo vs Production Summary

| Feature | Demo Scope | Production Scope |
|---------|------------|------------------|
| Profile Completion Storage | Stored in DB | Same + historical tracking |
| Completion Prompts | Dashboard + contextual | Same + email nudges |
| Match Algorithm | Rule-based weighted | Same, refined weights |
| Match Display | Percentage + label | Same + explanation tooltip |
| "Best Matches" Sections | All 4 contexts | Same + personalization |
| Olera Score Integration | Fixed weight (×4) | Tunable weight |
| Match Caching | Calculate on-demand | Cached with invalidation |
| ML Enhancement | ❌ Not included | Future consideration |

---

## Chapter 18: Subscriptions & Paywalls

**Purpose**: Simple, action-gated monetization where providers pay to engage, not to browse.

### Core Principle (DECIDED)

> **Families are always free. Providers pay to engage.**
>
> The paywall sits at the engagement layer. Everything is visible (profiles, marketplaces, inbound activity). The paywall only appears when a provider tries to take action.

### Provider States

| State | Who | Can Become Active? |
|-------|-----|-------------------|
| **Unclaimed** | No one controls listing | ❌ No account to pay with |
| **Claimed (Non-Active)** | Provider has account | ✅ Yes |
| **Claimed (Active)** | Provider has paid membership | ✅ Already is |

### Features

| Item | Status | Notes |
|------|--------|-------|
| 18.1 Membership Model | ⬜ | Two-tier: Non-Active (free) vs Active (paid) |
| 18.2 Pricing | ⬜ | $25/mo or $240/year ($20/mo) |
| 18.3 Paywall UI | 🟡 | Exists, needs update for new model |
| 18.4 Paywall Triggers | ⬜ | Engagement actions only |
| 18.5 "Active" Badge | ⬜ | Subtle indicator on provider cards |
| 18.6 Unclaimed Provider UX | ⬜ | Clear messaging for families |
| 18.7 Stripe Integration | ⬜ | Production only |
| 18.8 Mock Membership (Demo) | ⬜ | Admin toggle for demo |
| 18.9 Grace Period | ⬜ | 7 days for failed payments |
| 18.10 Review Tools Gating | ⬜ | Active review generation = paid |

### Key Questions — RESOLVED

- [x] **Is Stripe needed for demo, or mock subscription states?**
  - **DECIDED**: Mock for demo (admin toggle), Stripe for production.

- [x] **What features are gated?**
  - **DECIDED**: Engagement actions only. Browse, view, and receive are free.

- [x] **Single tier or multiple tiers?**
  - **DECIDED**: Two-tier only. Non-Active (free) vs Active (paid). No BASIC/PRO complexity.

- [x] **Are review tools gated?**
  - **DECIDED**: Receiving/responding = free. Active generation (QR, requests, staff links) = paid.

### Architectural Notes

---

#### 18.1 Two-Tier Membership Model (DECIDED)

**Families: Always Free**

| Capability | Access |
|------------|--------|
| Create/edit profile | ✅ |
| Browse all providers | ✅ |
| View provider contact info (public) | ✅ |
| Send engagements | ✅ |
| Receive/respond to messages | ✅ |
| Leave reviews | ✅ |
| Full platform access | ✅ |

**Providers: Two-Tier Membership**

| Capability | Non-Active (Free) | Active ($25/mo) |
|------------|-------------------|-----------------|
| Create/edit profile | ✅ | ✅ |
| Appear in directory | ✅ | ✅ |
| Browse all marketplaces | ✅ | ✅ |
| View family profiles | ✅ | ✅ |
| See inbound engagements (full details) | ✅ | ✅ |
| See messages from families (read-only) | ✅ | ✅ |
| Receive reviews | ✅ | ✅ |
| Respond to reviews | ✅ | ✅ |
| **Send engagements** | ❌ Paywall | ✅ |
| **Accept/decline engagements** | ❌ Paywall | ✅ |
| **Respond to messages** | ❌ Paywall | ✅ |
| **Generate review QR codes** | ❌ Paywall | ✅ |
| **Send review requests** | ❌ Paywall | ✅ |
| **Distribute staff review links** | ❌ Paywall | ✅ |
| **View review analytics** | ❌ Paywall | ✅ |
| Access hiring marketplace (browse) | ✅ | ✅ |
| Hiring: send/respond to interest | ❌ Paywall | ✅ |

**Key Insight:** One membership unlocks engagement in BOTH marketplaces:
- Provider ↔ Families (demand generation)
- Provider ↔ Providers (hiring / staffing supply)

---

#### 18.2 Pricing (DECIDED)

| Plan | Price | Effective Monthly |
|------|-------|-------------------|
| Monthly | $25/month | $25 |
| Annual | $240/year | $20 (20% savings) |

---

#### 18.4 Paywall Triggers (DECIDED)

The paywall appears when a non-active provider clicks:

**Engagement Actions:**
- "Accept" or "Decline" on an engagement
- "Reply" or "Send Message"
- "Express Interest" (hiring)
- "Schedule" or any engagement workflow action

**Review Generation Actions:**
- "Generate Review QR Code"
- "Send Review Request"
- "Get Staff Review Links"
- "View Review Analytics"

**Paywall Modal:**

```
┌─────────────────────────────────────────────────────────┐
│  🔓 Go Active to Respond                                │
│                                                         │
│  Jane D. is waiting to hear from you about a tour.     │
│                                                         │
│  Active membership includes:                            │
│  ✓ Respond to all engagement requests                  │
│  ✓ Message families directly                           │
│  ✓ Access the caregiver hiring marketplace             │
│  ✓ Generate review links and QR codes                  │
│  ✓ Complete bookings and grow your business            │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  $25/month                      [Start Monthly] │   │
│  │  $240/year ($20/mo, save 20%)   [Start Annual]  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Questions? Contact support@olera.com                  │
└─────────────────────────────────────────────────────────┘
```

---

#### 18.5 "Active" Badge (DECIDED)

Providers with active membership show a subtle badge:

- **Label**: "Active" (not "Member" or "Paid")
- **Meaning**: Active = paid + can engage
- **Display**: Small badge on provider cards in directory

This helps families identify providers who can respond through the platform, while not stigmatizing non-active providers.

---

#### 18.6 Unclaimed Provider UX (DECIDED)

When a family engages an unclaimed provider:

**Family Sees:**
```
┌─────────────────────────────────────────────────────────┐
│  ℹ️ This provider hasn't claimed their listing yet      │
│                                                         │
│  They may not receive your request through Olera.      │
│  You can contact them directly:                        │
│                                                         │
│  📞 (555) 123-4567                                     │
│  🌐 www.sunriseseniorliving.com                        │
│                                                         │
│  [Send Request Anyway]  [Find Similar Providers]       │
└─────────────────────────────────────────────────────────┘
```

**Key Points:**
- Families always have access to public provider contact info (phone, email, website)
- We do NOT gate provider contact info — directory remains fully useful
- Clear messaging that in-platform workflows require claimed/active provider
- Families can contact off-platform if needed

---

#### 18.7-18.8 Stripe vs Mock (DECIDED)

**Demo Scope: Mock Membership**
- Admin can toggle provider membership status
- Paywall modal shows but "Start Monthly" instantly upgrades (no payment)
- Allows demonstrating full user flow without Stripe setup

**Production Scope: Stripe Integration**
- Stripe Checkout for initial subscription
- Stripe Customer Portal for management
- Webhook handling for subscription events
- Automatic downgrade on payment failure (after grace period)

---

#### 18.9 Grace Period (DECIDED)

When payment fails:

| Day | Action |
|-----|--------|
| 0 | Payment fails, retry automatically |
| 1 | Email: "Payment failed, please update your card" |
| 3 | Email + In-app: "Your membership will be paused in 4 days" |
| 7 | Membership paused → provider becomes non-active |

Provider can re-activate by updating payment method and paying.

---

#### 18.10 Review Tools Gating (DECIDED)

| Review Capability | Non-Active (Free) | Active (Paid) |
|-------------------|-------------------|---------------|
| Receive reviews | ✅ | ✅ |
| Respond to reviews | ✅ | ✅ |
| View reviews & basic stats | ✅ | ✅ |
| Generate QR code | ❌ Paywall | ✅ |
| Send review requests | ❌ Paywall | ✅ |
| Distribute staff review links | ❌ Paywall | ✅ |
| Review analytics | ❌ Paywall | ✅ |

**Rationale:**
- Passive receipt benefits the marketplace (more reviews = better directory)
- Active solicitation is a business tool that adds value to membership

**Cross-reference:** See Chapter 15 for full review system details.

---

### Data Model

```prisma
model ProviderMembership {
  id              String    @id @default(cuid())
  providerId      String    @unique

  // Membership status
  status          String    @default("INACTIVE") // INACTIVE, ACTIVE, GRACE_PERIOD, CANCELLED
  plan            String?   // MONTHLY, ANNUAL

  // Billing
  stripeCustomerId     String?
  stripeSubscriptionId String?
  currentPeriodStart   DateTime?
  currentPeriodEnd     DateTime?

  // Grace period tracking
  gracePeriodStart     DateTime?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  provider        Provider  @relation(fields: [providerId], references: [id])
}
```

---

### Demo vs Production Summary

| Feature | Demo Scope | Production Scope |
|---------|------------|------------------|
| Membership states | Mock (admin toggle) | Stripe integration |
| Paywall UI | Functional modal | Same + payment flow |
| Payment processing | Skip (instant upgrade) | Stripe Checkout |
| Subscription management | Admin panel only | Self-service portal |
| Billing history | Not needed | Stripe Customer Portal |
| Grace period | Manual toggle | Automated (7 days) |
| "Active" badge | Displayed | Same |
| Unclaimed provider UX | Clear messaging | Same |

---

## Chapter 19: Caregiver Hiring Marketplace

**Purpose**: Enable organizations to find and hire individual caregivers, and caregivers to find employment opportunities — a two-sided staffing marketplace within Olera.

### Core Principle

> **One membership unlocks both marketplaces.**
>
> Organizations can find families (demand) AND find caregivers (supply). Individual caregivers can serve families AND find employment with organizations.

### Features

| Item | Status | Notes |
|------|--------|-------|
| 19.1 Find Caregivers (for orgs) | 🟡 | `/provider/find-caregivers` |
| 19.2 Find Organizations (for caregivers) | ⬜ | `/provider/find-organizations` |
| 19.3 Caregiver Availability Display | ⬜ | Critical for hiring decisions |
| 19.4 Bidirectional Hiring Engagements | 🟡 | `HiringEngagement` model |
| 19.5 Context-Specific CTAs | ⬜ | Different by direction |
| 19.6 Hiring Engagement Workflow | 🟡 | Interview → Hired flow |
| 19.7 Saved Candidates / Opportunities | ⬜ | Models defined in Ch. 14 |
| 19.8 Org Hiring Profile Fields | ⬜ | Within unified provider profile |
| 19.9 Caregiver Job-Seeking Profile | ⬜ | Extended fields on Provider |

### Key Questions — RESOLVED

- [x] **Is the hiring marketplace in scope for demo?**
  - **DECIDED**: Yes. Full bidirectional hiring must be demonstrated.

- [x] **Should caregivers have a separate model from Provider?**
  - **DECIDED**: No. Caregivers stay in Provider model with `type=INDIVIDUAL_CAREGIVER`. They ARE providers.

- [x] **Route prefix for caregivers?**
  - **DECIDED**: Use `/provider/` prefix (not `/caregiver/`). All provider-mode routes share the prefix.

### Architectural Notes

---

#### 19.1-19.2 Browse Experiences (DECIDED)

**Organizations Finding Caregivers:**

| Dropdown Label | Route | Purpose |
|----------------|-------|---------|
| "Find Caregivers" | `/provider/find-caregivers` | Browse caregivers available for hire |
| "Saved Candidates" | `/provider/saved-candidates` | Bookmarked caregivers |
| "My Candidates" | `/provider/my-candidates` | All hiring engagements |

**Individual Caregivers Finding Organizations:**

| Dropdown Label | Route | Purpose |
|----------------|-------|---------|
| "Find Organizations" | `/provider/find-organizations` | Browse orgs actively hiring |
| "Saved Opportunities" | `/provider/saved-opportunities` | Bookmarked potential employers |
| "My Opportunities" | `/provider/my-opportunities` | All hiring engagements |

**Cross-reference:** See Chapter 10 for full route definitions.

---

#### 19.3 Caregiver Availability Display (DECIDED — Critical)

**This is a critical hiring blocker.** Organizations need to quickly assess whether a caregiver is available for the specific shifts they are trying to staff.

**Availability Fields on Caregiver Profile:**

| Field | Type | Purpose |
|-------|------|---------|
| `availableForOrganizations` | Boolean | Visible in hiring marketplace |
| `availableSchedule` | Enum[] | FULL_TIME, PART_TIME, PER_DIEM, LIVE_IN |
| `availableDays` | Enum[] | MON, TUE, WED, THU, FRI, SAT, SUN |
| `availableShifts` | Enum[] | MORNING, AFTERNOON, EVENING, OVERNIGHT |
| `availableStartDate` | Date | When can they start? |
| `willingToRelocate` | Boolean | Open to relocation |
| `preferredLocations` | String[] | Zip codes or cities |

**Display on Caregiver Card:**

```
┌─────────────────────────────────────────────────────────┐
│  Maria G. — CNA, 5 years experience                     │
│  ★ 4.3 Olera Score │ 85% Match ✓ Excellent             │
│                                                         │
│  📍 Boston, MA (willing to travel 15 mi)               │
│  ⏰ Available: Full-time, Part-time                    │
│  📅 Days: Mon-Fri │ Shifts: Morning, Afternoon         │
│  🟢 Can start: Immediately                              │
│                                                         │
│  [View Profile]  [Invite to Interview]                  │
└─────────────────────────────────────────────────────────┘
```

**Filtering:**

Organizations can filter caregiver search by:
- Availability type (full-time, part-time, etc.)
- Days available
- Shifts available
- Start date urgency
- Location / willing to travel

---

#### 19.4-19.5 Bidirectional Hiring Engagements & CTAs (DECIDED)

**Context-Specific CTAs (Not Generic):**

| Direction | User Sees | CTA | Creates |
|-----------|-----------|-----|---------|
| Org → Caregiver | Caregiver profile | "Invite to Interview" | HiringEngagement (INTERVIEW_INVITE) |
| Caregiver → Org | Organization profile | "Apply" | HiringEngagement (APPLICATION) |

**Secondary Actions:**
- "Save to Candidates" / "Save to Opportunities" — saves without engagement
- "Send Message" — only after engagement exists (requires Active membership)

**Engagement Appears In:**
- Org's "My Candidates" + Caregiver's "My Opportunities" (same record, two views)

---

#### 19.6 Hiring Engagement Workflow (DECIDED)

**Simplified Model** (no job postings, no formal applications):

```
ENGAGEMENT CREATED
(Invite to Interview or Application)
        │
        ▼
┌───────────────────┐
│     PENDING       │  Awaiting response from other party
└─────────┬─────────┘
          │
    ┌─────┴─────┐
    ▼           ▼
┌────────┐  ┌────────┐
│DECLINED│  │ACCEPTED│
└────────┘  └────┬───┘
                 │
                 ▼
        ┌───────────────────┐
        │   INTERVIEWING    │  Interview scheduled/in progress
        └─────────┬─────────┘
                  │
          ┌───────┴───────┐
          ▼               ▼
    ┌──────────┐    ┌──────────┐
    │ WITHDRAWN│    │   HIRED  │  Employment confirmed
    └──────────┘    └──────────┘
```

**Status Definitions:**

| Status | Meaning |
|--------|---------|
| PENDING | Awaiting response |
| ACCEPTED | Interest confirmed, ready to schedule |
| INTERVIEWING | Interview scheduled or completed |
| HIRED | Employment relationship established |
| DECLINED | Other party declined |
| WITHDRAWN | Initiator withdrew |

---

#### 19.7 Saved Candidates / Opportunities (DECIDED)

**Cross-reference:** See Chapter 14 for models.

| Model | Purpose |
|-------|---------|
| `SavedCandidate` | Org saves caregiver for later |
| `SavedOpportunity` | Caregiver saves org for later |

Both include optional `notes` field for tracking.

---

#### 19.8 Organization Hiring Profile (DECIDED)

**One unified provider profile** — no separate "hiring profile."

Organizations actively hiring add these fields to their existing profile:

| Field | Type | Purpose |
|-------|------|---------|
| `activelyHiring` | Boolean | Shows "Hiring" badge in directory |
| `rolesNeeded` | String[] | CNA, HHA, LPN, RN, etc. |
| `experienceRequired` | String | "2+ years", "Entry-level welcome" |
| `certificationsRequired` | String[] | Required certs for roles |
| `payRangeMin` | Int | Minimum hourly/salary |
| `payRangeMax` | Int | Maximum hourly/salary |
| `payType` | Enum | HOURLY, SALARY, PER_DIEM |
| `benefitsOffered` | String[] | Health, PTO, 401k, etc. |
| `scheduleTypes` | Enum[] | FULL_TIME, PART_TIME, PER_DIEM |

**Display on Organization Card (to Caregivers):**

```
┌─────────────────────────────────────────────────────────┐
│  Sunrise Home Care                                      │
│  ★ 4.5 Olera Score │ 82% Match — Strong                │
│  🏢 Home Care Agency • Boston, MA                      │
│                                                         │
│  🟢 HIRING: CNA, HHA                                   │
│  💰 $22-28/hr │ Full-time, Part-time                   │
│  🎁 Benefits: Health, PTO, 401k                        │
│                                                         │
│  [View Profile]  [Apply]                                │
└─────────────────────────────────────────────────────────┘
```

---

#### 19.9 Caregiver Job-Seeking Profile (DECIDED)

Extended fields on Provider model for `type=INDIVIDUAL_CAREGIVER`:

| Field | Type | Purpose |
|-------|------|---------|
| `experienceYears` | Int | Years of caregiving experience |
| `certifications` | String[] | CNA, HHA, LPN, RN, CPR, etc. |
| `specializations` | String[] | Memory care, mobility, wound care, etc. |
| `hourlyRateMin` | Int | Pay expectation minimum |
| `hourlyRateMax` | Int | Pay expectation maximum |
| `languages` | String[] | Languages spoken |
| `hasReliableTransport` | Boolean | Can travel to clients |
| `willingToTravel` | Int | Miles willing to travel |
| `backgroundCheckDate` | Date | Last background check |
| `references` | Json | Reference contacts (gated) |

---

### Membership Gating (Cross-reference: Ch. 18)

| Action | Non-Active | Active |
|--------|------------|--------|
| Browse caregivers/orgs | ✅ | ✅ |
| View full profiles | ✅ | ✅ |
| Save candidates/opportunities | ✅ | ✅ |
| "Invite to Interview" | ❌ Paywall | ✅ |
| "Apply" | ❌ Paywall | ✅ |
| Message within engagement | ❌ Paywall | ✅ |
| Accept/decline engagements | ❌ Paywall | ✅ |

---

### Demo vs Production Summary

| Feature | Demo Scope | Production Scope |
|---------|------------|------------------|
| Find Caregivers | Full browse + filters | Same + advanced filters |
| Find Organizations | Full browse + filters | Same + job alerts |
| Availability Display | Core fields | Same + calendar integration |
| Bidirectional Engagements | Full workflow | Same |
| CTAs | Context-specific | Same |
| Hiring Status Workflow | Full PENDING → HIRED | Same + offer letters |
| Org Hiring Profile | Within unified profile | Same |
| Caregiver Job Profile | Extended fields | Same + verified badges |

---

## Chapter 20: Admin System

**Purpose**: The central operational hub for the entire Olera platform. This is the single internal interface where all platform operations, monitoring, and management occur.

### Core Principles

> **One system, one source of truth** — No fragmented internal tools. All operational work happens here.
>
> **Comprehensive, not fragmented** — All current and future systems are manageable from the admin panel.
>
> **Human-in-the-loop by design** — Clear definition of where humans monitor, oversee, intervene, or take action.
>
> **Self-documenting** — New team members can onboard entirely within the admin system.

### Features Overview

| Item | Status | Notes |
|------|--------|-------|
| 20.1 Admin Mode (3rd mode) | ⬜ | Accessible via account dropdown for ADMIN users |
| 20.2 Admin Dashboard Home | ⬜ | Queue counts, system health, recent activity |
| 20.3 Claims Queue | ⬜ | Provider claim review workflow |
| 20.4 Reviews Queue | ⬜ | Review moderation workflow |
| 20.5 Provider Requests Queue | ⬜ | Provider-initiated requests (edits, removals, complaints) |
| 20.6 User Reports Queue | ⬜ | Content/user reports from platform users |
| 20.7 Support Queue | ⬜ | General support requests |
| 20.8 Legal & Compliance Queue | ⬜ | Legal requests (C&D, DMCA, GDPR, CCPA) |
| 20.9 Provider Data Management | ⬜ | Full CRUD for provider records |
| 20.10 User Data Management | ⬜ | User account management |
| 20.11 Family Data Management | ⬜ | Family profile management |
| 20.12 Engagement Data View | ⬜ | View/manage engagements |
| 20.13 System Health Dashboard | ⬜ | API, DB, delivery metrics |
| 20.14 Background Jobs Monitor | ⬜ | Job status, failures |
| 20.15 Activity Logs | ⬜ | Admin action history |
| 20.16 External Tools Map | ⬜ | Links + context for external systems |
| 20.17 Embedded Documentation | ⬜ | SOPs, policies, guides |
| 20.18 Database Seeding Tools | ✅ | `/admin/seed` exists |
| 20.19 Data Clear Tools | ✅ | `/admin/clear-requests` exists |
| 20.20 SEO Content Management | ⬜ | Future: SEO page creation |
| 20.21 Help Article Management | ⬜ | Future: Help center content |
| 20.22 Notification Template Management | ⬜ | Future: Edit notification templates |

### Key Questions — RESOLVED

- [x] **What admin features are needed for demo?**
  - **DECIDED**: Full structure visible, demo-depth in Claims Queue, Provider Requests Queue, Provider Data Management, External Tools Map, and at least one SOP per major area.

- [x] **Should there be role-based permissions?**
  - **DECIDED**: Single ADMIN role for demo. Role tiers (Admin, Support, Content Manager) deferred to production.

- [x] **Should audit logging be implemented?**
  - **DECIDED**: Deferred for demo. Structure exists but logging not active.

- [x] **How do providers submit requests?**
  - **DECIDED**: Both channels — email to support@olera.com AND contact form on unclaimed listing pages.

---

### Architectural Notes

#### 20.1 Admin Mode Access (DECIDED)

Admin Mode is the **third mode** alongside Family Mode and Provider Mode.

| Mode | Available To | Dropdown Label |
|------|--------------|----------------|
| Family Mode | Users with FamilyProfile | "Family Mode" |
| Provider Mode | Users with Provider | "Provider Mode" |
| **Admin Mode** | Users with `role: ADMIN` | "Admin Mode" |

**Access Control:**
- Only users with `User.role === 'ADMIN'` see the Admin Mode option
- Admin Mode uses `/admin/*` routes, completely separate from family/provider dashboards
- Admins can still access Family/Provider modes if they have those profiles (useful for testing)

```
Account Dropdown (Admin user):
├── 👨‍👩‍👧 Family Mode        → /family/dashboard
├── 🏢 Provider Mode      → /provider/dashboard
├── ─────────────────────
└── ⚙️ Admin Mode         → /admin
```

---

#### Admin Navigation Structure (DECIDED)

```
/admin                          → Dashboard Home
│
├── /admin/queues
│   ├── /admin/queues/claims           → Provider Claims Queue
│   ├── /admin/queues/reviews          → Review Moderation Queue
│   ├── /admin/queues/provider-requests → Provider Requests Queue
│   ├── /admin/queues/reports          → User/Content Reports Queue
│   ├── /admin/queues/support          → Support Tickets Queue
│   └── /admin/queues/legal            → Legal & Compliance Queue
│
├── /admin/data
│   ├── /admin/data/providers          → Provider Data Management
│   ├── /admin/data/users              → User Account Management
│   ├── /admin/data/families           → Family Profile Management
│   ├── /admin/data/engagements        → Engagement Records
│   └── /admin/data/reviews            → Review Records
│
├── /admin/system
│   ├── /admin/system/health           → System Health Dashboard
│   ├── /admin/system/jobs             → Background Jobs Monitor
│   ├── /admin/system/logs             → Activity & Audit Logs
│   └── /admin/system/external         → External Tools Map
│
├── /admin/content
│   ├── /admin/content/seo             → SEO Page Management
│   ├── /admin/content/help            → Help Articles
│   └── /admin/content/templates       → Notification Templates
│
├── /admin/tools
│   ├── /admin/tools/seed              → Database Seeding
│   ├── /admin/tools/clear             → Clear Test Data
│   └── /admin/tools/bulk              → Bulk Operations
│
└── /admin/docs
    ├── /admin/docs/getting-started    → Onboarding Guide
    ├── /admin/docs/sops               → Standard Operating Procedures
    ├── /admin/docs/policies           → Policies & Guidelines
    ├── /admin/docs/systems            → External Systems Guide
    └── /admin/docs/troubleshooting    → Troubleshooting Guide
```

---

#### 20.2 Admin Dashboard Home (DECIDED)

The landing page after entering Admin Mode:

```
┌─────────────────────────────────────────────────────────────┐
│  OLERA ADMIN                              Jan 15, 2026      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  QUEUES REQUIRING ATTENTION                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│  │ Claims       │ │ Reviews      │ │ Provider Req │         │
│  │ 3 pending    │ │ 1 flagged    │ │ 5 open       │         │
│  │ [View →]     │ │ [View →]     │ │ [View →]     │         │
│  └──────────────┘ └──────────────┘ └──────────────┘         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│  │ Reports      │ │ Support      │ │ Legal        │         │
│  │ 0 pending    │ │ 2 open       │ │ 1 active     │         │
│  │ [View →]     │ │ [View →]     │ │ [View →]     │         │
│  └──────────────┘ └──────────────┘ └──────────────┘         │
│                                                             │
│  SYSTEM HEALTH                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ✅ API: 45ms avg │ ✅ DB: OK │ ✅ Jobs: Running     │    │
│  │ ✅ Email: 98.5%  │ ✅ SMS: 97.2%  │ ⚠️ 2 warnings  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  RECENT ADMIN ACTIVITY                                      │
│  • Jane D. approved claim for Sunrise Senior Living (2h ago)│
│  • System: Daily backup completed successfully (6h ago)     │
│  • John S. resolved support ticket #1234 (yesterday)        │
│                                                             │
│  QUICK ACTIONS                                              │
│  [📚 View Docs] [🌱 Seed Database] [🗑️ Clear Test Data]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Queue System Design

#### Human Intervention Types

| Type | Definition | Example Queues |
|------|------------|----------------|
| **Decision Required** | Item cannot proceed without human judgment | Claims, Legal |
| **Review Required** | Item flagged for human verification | Reviews, Reports |
| **Response Required** | External party awaiting response | Provider Requests, Support |
| **Awareness Only** | Informational, no action needed | Logs, Health alerts |

#### Standard Queue Interface Pattern

All queues follow a consistent UI pattern:

```
┌─────────────────────────────────────────────────────────────┐
│  [QUEUE NAME]                               [X] items       │
├─────────────────────────────────────────────────────────────┤
│  Filter: [Status ▼] [Type ▼] [Date ▼]    Sort: [Oldest ▼]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ [Priority Indicator] [ITEM TYPE]           [SLA Badge] ││
│  │ Primary identifier / title                              ││
│  │ Secondary info (date, source, etc.)                     ││
│  │ Brief description or excerpt...                         ││
│  │                                                         ││
│  │ [Action 1] [Action 2] [Action 3] [More ▼]              ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  [Pagination: < 1 2 3 ... 10 >]                            │
└─────────────────────────────────────────────────────────────┘
```

---

#### 20.3 Claims Queue (DECIDED — Demo-Critical)

**Purpose**: Review and process provider ownership claims.

**Queue Items:**

| Status | Meaning |
|--------|---------|
| `PENDING` | Awaiting initial review |
| `INFO_REQUESTED` | Additional documentation requested |
| `APPROVED` | Claim approved, ownership transferred |
| `REJECTED` | Claim rejected (with reason) |
| `APPEALED` | Rejection appealed by claimant |

**Actions Available:**
- View claim details and submitted documentation
- View provider listing
- Approve claim
- Reject claim (with reason selection)
- Request more information
- Escalate to senior admin

**SLA**: 48 hours for initial response

**Demo Implementation**: Full workflow with sample claims in seed data.

---

#### 20.5 Provider Requests Queue (DECIDED — Demo-Critical)

**Purpose**: Handle provider-initiated requests that are not claims.

**Request Types:**

| Type | Description | SLA | Actions |
|------|-------------|-----|---------|
| `EDIT_UNCLAIMED` | Provider wants data corrected on unclaimed listing | 48h | Edit, Invite to Claim, Respond |
| `REMOVE_LISTING` | Provider wants page removed | 48h | Verify, Remove, Suppress, Decline |
| `SUPPRESS_LISTING` | Provider wants reduced visibility | 48h | Suppress, Respond |
| `CLAIM_DISPUTE` | Provider disputes another's claim | 24h | Investigate, Escalate |
| `REVIEW_COMPLAINT` | Provider disputes a review (non-legal) | 72h | Review, Remove, Decline |
| `DATA_CORRECTION` | Claimed provider reports platform error | 48h | Verify, Correct |
| `VISIBILITY_ISSUE` | Provider unhappy with search ranking | 72h | Investigate, Explain |
| `GENERAL_FEEDBACK` | Suggestions, complaints, other | 1 week | Log, Respond, Route |

**Intake Channels:**
1. Email to support@olera.com (creates queue item automatically)
2. Contact form on unclaimed listing pages (creates queue item)

**Demo Implementation**: Full workflow with sample requests in seed data.

---

#### 20.8 Legal & Compliance Queue (DECIDED)

**Purpose**: Handle requests with legal implications requiring careful handling.

**Request Types:**

| Type | Source | SLA | Escalation |
|------|--------|-----|------------|
| `DMCA_TAKEDOWN` | Content owner claims infringement | 24h ack | Legal counsel |
| `DEFAMATION_CLAIM` | Provider claims review is defamatory | 48h ack | Legal counsel |
| `CEASE_DESIST` | Lawyer letter | 24h ack | Legal counsel |
| `REGULATORY_INQUIRY` | State/federal agency | Immediate | Leadership + Legal |
| `GDPR_REQUEST` | EU user data request | 30 days | Process per SOP |
| `CCPA_REQUEST` | CA user data request | 45 days | Process per SOP |
| `SUBPOENA` | Court order | Per order | Legal counsel |

**Access**: Visible to all admins for demo. Production may restrict to senior admins.

**Demo Implementation**: Structure and placeholder SOPs. One sample legal item in seed data.

---

### Data Management Design

#### 20.9 Provider Data Management (DECIDED — Demo-Critical)

**Purpose**: Full CRUD operations on provider records.

**Capabilities:**

| Action | Description | Demo Status |
|--------|-------------|-------------|
| **List** | Paginated, filterable provider list | ✅ Implement |
| **Search** | Search by name, location, type | ✅ Implement |
| **View** | Full provider detail view | ✅ Implement |
| **Edit** | Modify any provider field | ✅ Implement |
| **Create** | Add new provider (manual entry) | 🟡 Basic |
| **Delete** | Remove provider (soft delete) | ✅ Implement |
| **Bulk Edit** | Edit multiple providers | ⬜ Placeholder |
| **Import** | Bulk import from CSV | ⬜ Placeholder |
| **Export** | Export provider data | ⬜ Placeholder |
| **Audit Trail** | View change history | ⬜ Placeholder |

**Provider List View:**

```
┌─────────────────────────────────────────────────────────────┐
│  PROVIDERS                                    1,247 total   │
├─────────────────────────────────────────────────────────────┤
│  [+ Add Provider]  [Import CSV]  [Export]                   │
│                                                             │
│  Search: [________________________] [🔍]                    │
│  Filter: [Type ▼] [Status ▼] [State ▼] [Claimed ▼]         │
├─────────────────────────────────────────────────────────────┤
│  Name                  │ Type        │ Location │ Status   │
│  ──────────────────────┼─────────────┼──────────┼──────────│
│  Sunrise Senior Living │ Assisted    │ Austin   │ Claimed  │
│  Memory Care of Austin │ Memory Care │ Austin   │ Unclaimed│
│  Golden Years Home Care│ Home Care   │ Dallas   │ Claimed  │
│  ...                                                        │
├─────────────────────────────────────────────────────────────┤
│  [< Prev] Page 1 of 125 [Next >]    Showing 10 per page    │
└─────────────────────────────────────────────────────────────┘
```

**Provider Edit View:**

```
┌─────────────────────────────────────────────────────────────┐
│  EDIT PROVIDER: Sunrise Senior Living                       │
│  ID: clx123abc | Created: 2024-06-15 | Last Edit: 2026-01-10│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  BASIC INFORMATION                                          │
│  Name: [Sunrise Senior Living____________]                  │
│  Type: [Assisted Living ▼]                                  │
│  Status: [● Active ○ Inactive ○ Closed]                    │
│                                                             │
│  LOCATION                                                   │
│  Address: [123 Care Lane_________________]                  │
│  City: [Austin___] State: [TX ▼] Zip: [78701__]            │
│                                                             │
│  CONTACT                                                    │
│  Phone: [512-555-1234____]                                  │
│  Email: [info@sunrisesenior.com__________]                  │
│  Website: [https://sunrisesenior.com_____]                  │
│                                                             │
│  OWNERSHIP                                                  │
│  Claim Status: [● Claimed ○ Unclaimed]                     │
│  Claimed By: John Smith (john@sunrisesenior.com)           │
│  Claimed On: 2025-08-20                                     │
│  [Revoke Claim]                                             │
│                                                             │
│  [Save Changes] [Cancel] [Delete Provider]                  │
└─────────────────────────────────────────────────────────────┘
```

---

### System Operations Design

#### 20.13 System Health Dashboard (DECIDED)

**Purpose**: At-a-glance view of platform operational status.

**Metrics Displayed:**

| Category | Metrics | Source |
|----------|---------|--------|
| **API** | Response time (avg, p95), error rate | Application logs |
| **Database** | Connection status, query latency | Neon |
| **Email** | Delivery rate, bounce rate | Resend |
| **SMS** | Delivery rate, failure rate | Twilio |
| **Jobs** | Running, completed, failed (24h) | Job queue |
| **Storage** | Usage, upload failures | Vercel Blob |

**Alert Thresholds:**

| Metric | Warning | Critical |
|--------|---------|----------|
| API error rate | >1% | >5% |
| API p95 latency | >2s | >5s |
| DB connection | Slow | Failed |
| Email delivery | <95% | <90% |
| SMS delivery | <95% | <90% |
| Failed jobs | >5 | >20 |

**Demo Implementation**: Basic metrics display with mock data. Real integrations in production.

---

#### 20.16 External Tools Map (DECIDED — Demo-Critical)

**Purpose**: Central reference for all external systems Olera relies on.

**Comprehensive Tool List:**

| Tool | Category | Purpose | Demo Status |
|------|----------|---------|-------------|
| **Neon** | Infrastructure | PostgreSQL database | ✅ Document |
| **Vercel** | Infrastructure | Hosting, serverless, deployments | ✅ Document |
| **Vercel Blob** | Storage | User uploads (photos, documents) | ✅ Document |
| **Twilio** | Communications | SMS notifications | ✅ Document |
| **Resend** | Communications | Transactional email | ✅ Document |
| **Stripe** | Payments | Subscriptions, billing | ✅ Document |
| **Sentry** | Monitoring | Error tracking, alerting | ✅ Document |
| **Google Calendar API** | Integration | Calendar invites | 🟡 Note |
| **1Password** | Security | Credential management | ✅ Document |
| **GitHub** | Development | Code repository | ✅ Document |
| **Slack** | Internal Comms | Team communication, alerts | 🟡 Future |
| **Intercom/Crisp** | Support | Live chat (future) | ⬜ Placeholder |
| **Checkr** | Trust & Safety | Background checks (future) | ⬜ Placeholder |
| **Plausible/PostHog** | Analytics | Usage analytics (future) | ⬜ Placeholder |
| **Zendesk** | Support | Ticketing system (future) | ⬜ Placeholder |

**External Tool Entry Format:**

```
┌─────────────────────────────────────────────────────────────┐
│  🗄️  NEON (PostgreSQL Database)                             │
├─────────────────────────────────────────────────────────────┤
│  Purpose: Primary data store for all platform data          │
│                                                             │
│  When to use:                                               │
│  • Direct data queries when admin UI insufficient           │
│  • Emergency data fixes                                     │
│  • Bulk operations not available in admin panel             │
│  • Database performance investigation                       │
│                                                             │
│  Access Information:                                        │
│  • URL: console.neon.tech                                   │
│  • Account: ops@olera.com                                   │
│  • Credentials: 1Password → "Neon Production"               │
│                                                             │
│  ⚠️  Important Notes:                                        │
│  • Direct DB changes bypass audit logging                   │
│  • Document all manual changes in #ops-log Slack            │
│  • Never modify production without backup verification      │
│                                                             │
│  [🔗 Open Neon Console]  [📖 Neon Operations Guide]         │
└─────────────────────────────────────────────────────────────┘
```

---

### Embedded Documentation Design

#### Documentation Architecture (DECIDED — Demo-Critical)

```
/admin/docs
│
├── 📚 GETTING STARTED
│   ├── Welcome to Olera Admin
│   ├── System Overview & Architecture
│   ├── Your First Day Checklist ⭐
│   ├── Key Concepts & Terminology
│   └── Navigation Guide
│
├── 📋 STANDARD OPERATING PROCEDURES (SOPs)
│   │
│   ├── QUEUES
│   │   ├── SOP: Processing Provider Claims ⭐ Demo-Critical
│   │   ├── SOP: Review Moderation [Placeholder]
│   │   ├── SOP: User Report Handling [Placeholder]
│   │   └── SOP: Support Ticket Resolution [Placeholder]
│   │
│   ├── PROVIDER REQUESTS
│   │   ├── SOP: Unclaimed Listing Edit Requests ⭐ Demo-Critical
│   │   ├── SOP: Provider Removal Requests ⭐ Demo-Critical
│   │   ├── SOP: Claim Disputes [Placeholder]
│   │   └── SOP: Visibility Complaints [Placeholder]
│   │
│   ├── DATA MANAGEMENT
│   │   ├── SOP: Provider Data Editing ⭐ Demo-Critical
│   │   ├── SOP: User Account Management [Placeholder]
│   │   ├── SOP: Bulk Data Operations [Placeholder]
│   │   └── SOP: Data Quality Audits [Placeholder]
│   │
│   ├── LEGAL & COMPLIANCE
│   │   ├── SOP: Cease & Desist Response [Placeholder]
│   │   ├── SOP: DMCA Takedown Process [Placeholder]
│   │   ├── SOP: GDPR Data Requests [Placeholder]
│   │   ├── SOP: CCPA Consumer Requests [Placeholder]
│   │   └── SOP: Regulatory Inquiry Response [Placeholder]
│   │
│   └── SYSTEM OPERATIONS
│       ├── SOP: Database Seeding ⭐ Demo-Critical
│       ├── SOP: Incident Response [Placeholder]
│       └── SOP: Deployment Rollback [Placeholder]
│
├── 📜 POLICIES & GUIDELINES
│   ├── Review Content Guidelines
│   ├── Provider Data Standards
│   ├── Moderation Decision Framework
│   ├── Escalation Matrix
│   └── Response Time SLAs
│
├── 🗺️ EXTERNAL SYSTEMS
│   ├── System Map Overview (see 20.16)
│   ├── Neon Operations Guide
│   ├── Vercel Operations Guide
│   ├── Twilio Operations Guide
│   ├── Stripe Operations Guide
│   └── Sentry Operations Guide
│
└── 🆘 TROUBLESHOOTING
    ├── Common Issues & Solutions
    ├── Error Code Reference
    ├── FAQ for Operators
    └── Emergency Procedures
```

⭐ = Demo-critical: Fully written for demo
[Placeholder] = Structure exists, content is placeholder text

---

#### Demo-Critical SOP: Processing Provider Claims

```markdown
# SOP: Processing Provider Claims

**Version**: 1.0
**Last Updated**: 2026-01-15
**SLA**: 48 hours from submission

## Purpose

This procedure covers how to review and process provider claims when
a user requests to claim an unclaimed listing.

## When to Use

- New item appears in Claims Queue
- Claim requires manual review (not auto-approved)

## Procedure

### 1. Open the Claim

Navigate to **Queues → Claims** and select the pending claim.

### 2. Verify Requester Identity

Check the following:

- [ ] Email domain matches provider name/website
- [ ] Submitted documentation is legible
- [ ] Business license (if provided) matches provider
- [ ] Government ID (if provided) shows authorized person

### 3. Cross-Reference Provider Data

- [ ] Google the provider to verify existence
- [ ] Check provider's official website (if exists)
- [ ] Verify phone number matches public records

### 4. Make a Decision

**IF all verification passes:**
→ Click **[Approve]**
→ System will notify claimant and transfer ownership

**IF verification is inconclusive:**
→ Click **[Request More Info]**
→ Select what additional documentation is needed
→ Claim returns to queue when user responds

**IF verification fails:**
→ Click **[Reject]**
→ Select rejection reason from dropdown
→ Add notes explaining the decision
→ System will notify claimant with appeal option

### 5. Document Your Decision

Add notes to the claim record explaining your verification steps
and reasoning. This is required for audit purposes.

## Escalation

Escalate to a senior admin if:

- Claim involves a large/notable provider
- Multiple people are claiming the same provider
- You suspect fraud or impersonation
- The claimant is being hostile or threatening

## Common Issues

| Issue | Resolution |
|-------|------------|
| Claimant uses personal email (gmail, etc.) | Request business email or additional documentation |
| Provider has no website | Verify via state licensing database if applicable |
| Documentation is blurry/illegible | Request clearer copies |
| Claimant is not the owner but an employee | Request authorization letter from owner |

## Related SOPs

- SOP: Claim Disputes
- SOP: Provider Data Editing
```

---

#### Demo-Critical SOP: Provider Removal Requests

```markdown
# SOP: Provider Removal Requests

**Version**: 1.0
**Last Updated**: 2026-01-15
**SLA**: 48 hours from submission

## Purpose

This procedure covers how to handle requests from providers who want
their unclaimed listing removed from Olera.

## When to Use

- Provider Requests Queue: "Remove Unclaimed Listing" type
- Email/contact form requesting page removal

## Background

Olera aggregates publicly available provider information to help
families find care. Providers may request removal for various reasons.
Our default is to accommodate reasonable requests while explaining
the value of claiming their page instead.

## Procedure

### 1. Verify Requester Authorization

The requester must prove they represent the provider:

- [ ] Email from business domain (@providername.com)
- [ ] OR verifiable phone call from listed number
- [ ] OR documentation proving authorization

**If unverified:** Request verification before proceeding.

### 2. Understand the Request

Ask clarifying questions if needed:

- What specifically concerns them about the listing?
- Is the information inaccurate?
- Are they aware they can claim and control the page?

### 3. Offer Alternatives

Before removing, offer these options:

**Option A: CLAIM THE PAGE (Preferred)**

> "By claiming your page, you gain full control over your listing,
> can respond to reviews, and connect with families seeking care."

→ Send claim invitation email

**Option B: CORRECT THE DATA**

> "If specific information is wrong, we can correct it immediately.
> What needs to be changed?"

→ Edit the listing per their corrections

**Option C: SUPPRESS VISIBILITY**

> "We can reduce the visibility of your listing so it doesn't appear
> in search results, while keeping the data available if families
> search by name."

→ Mark listing as "suppressed"

### 4. If Provider Insists on Removal

If the provider declines all alternatives:

1. [ ] Confirm their identity one final time
2. [ ] Document the request and interaction
3. [ ] Process the removal:
   - Navigate to provider in **Data → Providers**
   - Click **[Delete Provider]**
   - Select reason: "Provider removal request"
   - Confirm deletion
4. [ ] Send confirmation email to requester

### 5. Document the Outcome

Add notes to the request record:

- Verification method used
- Alternatives offered
- Final outcome and reason

## Escalation

Escalate to **Legal queue** if:

- Request mentions lawyers or legal action
- Request cites specific laws (GDPR, CCPA, etc.)
- Requester is hostile or threatening
- You're unsure whether removal is appropriate

## DO NOT Remove If

- Requester cannot verify authorization
- Request appears to be from competitor
- Provider is under active investigation
- There are active engagements with families

## Related SOPs

- SOP: Processing Provider Claims
- SOP: Cease & Desist Response
- SOP: GDPR Data Requests
```

---

### Legal & Compliance Framework

#### Policy Reference Structure

```
┌─────────────────────────────────────────────────────────────┐
│  📜 LEGAL & COMPLIANCE REFERENCE                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PLATFORM POLICIES                                          │
│  ├── Terms of Service (/terms)                              │
│  ├── Privacy Policy (/privacy)                              │
│  ├── Review Guidelines                                      │
│  ├── Provider Data Usage Policy                             │
│  ├── Acceptable Use Policy                                  │
│  └── Content Moderation Policy                              │
│                                                             │
│  LEGAL SOPs [Placeholder structure for demo]                │
│  ├── SOP: Responding to Cease & Desist Letters              │
│  ├── SOP: DMCA Takedown Process                             │
│  ├── SOP: Review Defamation Claims                          │
│  ├── SOP: GDPR Data Subject Requests                        │
│  ├── SOP: CCPA Consumer Requests                            │
│  └── SOP: Regulatory Inquiry Response                       │
│                                                             │
│  ESCALATION CONTACTS                                        │
│  ├── Legal Counsel: [To be added]                           │
│  ├── Executive Escalation: [To be added]                    │
│  └── Emergency (after hours): [To be added]                 │
│                                                             │
│  RESPONSE TEMPLATES                                         │
│  ├── Acknowledgment: Legal Letter Received                  │
│  ├── Acknowledgment: Data Request Received                  │
│  ├── Response: Removal Request - Approved                   │
│  ├── Response: Removal Request - Declined                   │
│  └── Response: Review Complaint - Resolution                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Demo vs Production Scope

| Admin Feature | Demo | Production |
|---------------|------|------------|
| **Admin Mode access** | ✅ Single ADMIN role | Tiered roles |
| **Dashboard Home** | ✅ Queue counts + health | + Analytics, trends |
| **Claims Queue** | ✅ Full workflow | + Auto-approve rules |
| **Reviews Queue** | 🟡 Basic structure | Full moderation |
| **Provider Requests Queue** | ✅ Full workflow | Same |
| **User Reports Queue** | 🟡 Basic structure | + AI triage |
| **Support Queue** | 🟡 Basic structure | + Ticketing integration |
| **Legal Queue** | 🟡 Structure + placeholders | Full workflow |
| **Provider Data Management** | ✅ Full CRUD | + Bulk ops, import/export |
| **User/Family Data** | 🟡 View + basic edit | Full management |
| **System Health** | 🟡 Basic metrics | Full observability |
| **External Tools Map** | ✅ Complete documentation | + Embedded widgets |
| **Embedded Docs** | ✅ Structure + demo SOPs | All SOPs complete |
| **Legal SOPs** | 🟡 Placeholder structure | Fully written |
| **Audit Logging** | ⬜ Defer | Full action logging |
| **Role-based Permissions** | ⬜ Defer | Tiered access control |
| **Bulk Operations** | ⬜ Defer | Import/export, batch edit |
| **Analytics Dashboard** | ⬜ Defer | Usage, conversion metrics |

---

### Cross-Chapter Integration

The Admin System integrates with every other chapter:

| Chapter | Admin Integration |
|---------|-------------------|
| **Ch 1: Auth** | User management, account recovery |
| **Ch 5-7: Providers** | Provider data management |
| **Ch 8: Claiming** | Claims queue |
| **Ch 11: Engagements** | Engagement data view, dispute handling |
| **Ch 12: Messaging** | Message reports queue |
| **Ch 15: Reviews** | Reviews queue, moderation |
| **Ch 16: Notifications** | Delivery monitoring, template management |
| **Ch 18: Subscriptions** | Billing support (via Stripe link) |
| **Ch 19: Hiring** | Hiring engagement management |
| **Ch 21: Seeding** | Seeding tools |
| **Ch 24: SEO** | SEO content management |
| **Ch 26: Trust** | Reports queue, fraud investigation |
| **Ch 27: Help** | Help article management |
| **Ch 28: Errors** | System health, logs |

---

### Future Chapter Reference: Communications & Automation

> **Note**: A dedicated **Communications & Automation** chapter is required as a core platform system. This will cover:
>
> **Transactional Communications**
> - Email notifications (engagement updates, reminders, reviews)
> - SMS notifications (reminders, verification, alerts)
> - Template management and personalization
>
> **Lifecycle Automation**
> - Welcome sequences
> - Re-engagement campaigns
> - Profile completion reminders
> - Inactivity follow-ups
>
> **Operational Communications**
> - Admin-initiated outreach
> - Call center workflow triggers
> - Outbound call scheduling and tracking
> - Multi-channel communication sequences
>
> **Automation Engine**
> - Trigger definitions (events, conditions, timing)
> - Action definitions (send email, send SMS, create task, notify admin)
> - Rule builder for complex workflows
> - Delivery tracking and analytics
>
> This system is critical because it can offload significant manual work while ensuring consistent, timely communication across all user touchpoints.
>
> **Proposed**: Chapter 34 (Communications & Automation) — to be developed after completing current chapter sequence.

---

## Chapter 21: Provider Data Management

**Purpose**: Define the architecture, migration strategy, and operational workflows for managing provider data at nationwide scale — from the initial 40,000 providers to 500,000+ organizations.

### Core Principles

> **Single Source of Truth**: Postgres (Neon) is the authoritative source for all production data. Legacy systems feed into it, not alongside it.
>
> **Organization Data ≠ Account Data**: Public directory information about a provider organization is distinct from the private account information of the person who claims/manages it.
>
> **Unclaimed by Default**: Seeded providers start unclaimed. Claiming links an organization record to a user account without losing data.

### Features Overview

| Item | Status | Notes |
|------|--------|-------|
| **Data Architecture** | | |
| 21.1 Organization vs Account Data Model | ✅ Decided | See 21.1 below |
| 21.2 Unclaimed Provider Lifecycle | ✅ Decided | See 21.2 below |
| 21.3 Field Classification Framework | ✅ Decided | Core, Extended, Audit, Deprecated |
| **Source of Truth** | | |
| 21.4 Current State (Airtable) | ✅ Documented | CSV export, manual upload |
| 21.5 Target State (Postgres) | ✅ Decided | Full migration, Airtable deprecated |
| 21.6 Transition Plan | 🟡 In Progress | See 21.6 below |
| **Data Migration** | | |
| 21.7 Field Mapping Matrix | ✅ Decided | Airtable → Provider model |
| 21.8 Migration Execution Plan | ⬜ | Sequenced rollout |
| 21.9 Validation & Rollback | ⬜ | Pre/post checks |
| **Admin Upload System** | | |
| 21.10 Upload File Format | ✅ Decided | Standardized CSV |
| 21.11 Validation Rules | ✅ Decided | See 21.11 below |
| 21.12 Deduplication Strategy | ✅ Decided | See 21.12 below |
| 21.13 Update Behavior | ✅ Decided | Merge vs. overwrite rules |
| 21.14 Admin UI Integration | 🟡 | Cross-ref Chapter 20 |
| **Scale & Performance** | | |
| 21.15 Current Scale (~40K) | ✅ | Existing dataset |
| 21.16 Target Scale (500K+) | ⬜ | Performance considerations |
| **Demo & Development** | | |
| 21.17 Demo User Accounts | ✅ | `prisma/seed.ts` |
| 21.18 Demo Walkthrough | ⬜ | Documentation needed |
| 21.19 Data Reset Tools | 🟡 | Partial implementation |

---

### 21.1 Organization Data vs Account Data (DECIDED)

**The Core Distinction**

Every provider record contains two conceptually separate data sets:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ORGANIZATION DATA (Public / Directory)                                     │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Source: Seeded from public data, CSV uploads, enrichment                   │
│  Visibility: Public (shown in directory to all users)                       │
│  Ownership: Platform-owned until claimed                                    │
│                                                                             │
│  Fields:                                                                    │
│  • name, providerType, description                                          │
│  • address, city, state, zipCode, latitude, longitude                       │
│  • phone (public/listed), website                                           │
│  • email (public/contact — NOT for notifications)                           │
│  • photos, coverPhoto                                                       │
│  • services, amenities, pricing, capacity                                   │
│  • averageRating, reviewCount, oleraScore                                   │
│  • claimed (boolean), verified (boolean)                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │  CLAIMING CREATES LINK
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ACCOUNT DATA (Private / Operational)                                       │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Source: User-provided during claiming/signup                               │
│  Visibility: Private (only visible to account holder)                       │
│  Ownership: User-owned                                                      │
│                                                                             │
│  Stored On: User model (linked via Provider.userId)                         │
│                                                                             │
│  Fields:                                                                    │
│  • User.email (for login, notifications, billing)                           │
│  • User.phone (for SMS notifications)                                       │
│  • User.name (account holder name)                                          │
│  • Subscription status, Stripe IDs                                          │
│  • Notification preferences                                                 │
│  • Team members / authorized users (future)                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key Implications**

| Aspect | Organization Data | Account Data |
|--------|-------------------|--------------|
| **Created when** | Provider record seeded/imported | User claims provider |
| **Editable by** | Admin (unclaimed) or Owner (claimed) | Account owner only |
| **Used for** | Directory display, search, matching | Login, notifications, billing |
| **Email purpose** | Public contact (may go unanswered) | Platform communications |
| **Phone purpose** | Public listing | SMS notifications |

**Example Scenario**

```
Sunrise Senior Living (seeded):
├── Organization Email: info@sunrisesenior.com (public, on website)
├── Organization Phone: (512) 555-1234 (public, on signage)
└── claimed: false

Jane Smith claims Sunrise Senior Living:
├── Account Email: jane.smith@sunrisesenior.com (private, for Olera login)
├── Account Phone: (512) 555-9999 (private, for SMS reminders)
├── User.name: Jane Smith (Administrator)
└── Provider.userId: links to Jane's User record
└── Provider.claimed: true
```

**Schema Representation**

The current schema already supports this separation:

```prisma
model Provider {
  // Organization data (public)
  name            String
  email           String      // Public contact email
  phone           String      // Public listed phone
  // ... other organization fields

  // Link to account data (private)
  userId          String?     @unique
  user            User?       // When claimed, links to owner's account
  claimed         Boolean     @default(false)
}

model User {
  // Account data (private)
  email           String      @unique  // Login/notification email
  phone           String?              // SMS notification phone
  name            String               // Account holder name

  provider        Provider?   // If they own a provider
}
```

**No Schema Changes Required** — The distinction is conceptual and enforced through:
1. Admin UI labeling (clearly separate "Public Contact" from "Account Settings")
2. Notification logic (use User.email/phone, not Provider.email/phone)
3. Import logic (only populate Provider fields, never create User records)

---

### 21.2 Unclaimed Provider Lifecycle (DECIDED)

**States and Transitions**

```
┌──────────────────┐
│    SEEDED        │  Provider record created via bulk import
│    (Unclaimed)   │  • userId = null
│                  │  • claimed = false
└────────┬─────────┘
         │
         │  User clicks "Claim this listing"
         │  Completes verification (see Chapter 8)
         ▼
┌──────────────────┐
│    CLAIMED       │  User account linked to provider
│    (Free Tier)   │  • userId = claimant's user ID
│                  │  • claimed = true
│                  │  • Can edit profile, view leads (read-only)
└────────┬─────────┘
         │
         │  User subscribes (see Chapter 18)
         ▼
┌──────────────────┐
│    ACTIVE        │  Full platform access
│    (Subscribed)  │  • Can respond to leads
│                  │  • Can initiate outreach
│                  │  • Review tools unlocked
└──────────────────┘
```

**Data Preservation on Claiming**

When a provider is claimed, **all organization data is preserved**:

| Field | Behavior on Claim |
|-------|-------------------|
| name, address, phone, website | Preserved (user can edit after) |
| description, photos | Preserved (user can edit after) |
| averageRating, reviewCount | Preserved (owned by platform) |
| oleraScore | Preserved (calculated by platform) |
| createdAt | Preserved (original seed date) |
| **userId** | Set to claimant's user ID |
| **claimed** | Set to `true` |
| **updatedAt** | Updated to claim timestamp |

**No data loss occurs** — claiming is purely additive (links account to existing record).

---

### 21.3 Field Classification Framework (DECIDED)

All provider fields fall into four categories:

| Category | Definition | Storage | Example Fields |
|----------|------------|---------|----------------|
| **Core** | Essential for directory listing and search | `Provider` table | name, address, providerType, phone |
| **Extended** | Enriches profile but not required | `Provider` table (nullable) | photos, amenities, pricing, description |
| **Audit/Meta** | Internal tracking, verification, quality | `ProviderAudit` table (new) | dataSource, lastVerified, auditStatus |
| **Deprecated** | Legacy fields no longer used | Archive or drop | Custom markers, workflow fields |

**Field Storage Decision**

For the initial migration, we will:
1. **Migrate Core + Extended fields** into the existing `Provider` table
2. **Defer Audit/Meta fields** — create `ProviderAudit` table when needed
3. **Ignore Deprecated fields** — do not migrate

---

### 21.4 Current State: Airtable as Data Source (DOCUMENTED)

**Current Workflow**

```
┌─────────────┐      CSV Export      ┌─────────────┐      Upload      ┌─────────────┐
│  Airtable   │  ─────────────────▶  │  CSV File   │  ─────────────▶  │  Postgres   │
│  (40K rows) │                      │  (mapped)   │                  │  (Neon)     │
└─────────────┘                      └─────────────┘                  └─────────────┘
```

**Current Characteristics**

| Aspect | Current State |
|--------|---------------|
| Record count | ~40,000 organization providers |
| Data entry | Manual + enrichment scripts |
| Export format | CSV |
| Import method | Script-based upload |
| Sync frequency | Manual/periodic |
| Airtable connection | No direct API integration |

**Airtable Field Inventory**

The legacy Airtable contains 130+ fields. Most are operational/workflow fields not needed in production:

| Category | Field Count | Examples |
|----------|-------------|----------|
| Core Identity | ~10 | provider_id, provider_name, provider_category |
| Location | ~8 | address, city, state, zipcode, lat, lon |
| Contact | ~15 | phone, website, email_*, contact_* |
| Ratings/Scores | ~12 | google_rating, medicare_rating, olera_score |
| Content | ~5 | provider_description, provider_images |
| Audit/Verification | ~25 | Audit Status, Verification Summary, Business Status |
| Workflow/Operational | ~55 | Custom Marker*, Group*, *_Evaluator, LLM Prompt* |

---

### 21.5 Target State: Postgres as Source of Truth (DECIDED)

**Decision: Full Migration (Option A)**

Postgres (Neon) becomes the **sole source of truth** for all production data.

**Target Architecture**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           POSTGRES (NEON)                                   │
│                         Source of Truth                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │    Provider     │    │ ProviderAudit   │    │ ProviderScoring │         │
│  │   (Core +       │    │   (Meta/        │    │   (Olera Score  │         │
│  │    Extended)    │    │    Tracking)    │    │    Inputs)      │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────┴───────┐ ┌─────┴─────┐ ┌──────┴──────┐
            │ Admin Upload  │ │ API       │ │ Enrichment  │
            │ (CSV Import)  │ │ Ingestion │ │ Pipelines   │
            └───────────────┘ └───────────┘ └─────────────┘
                    ▲
                    │
            ┌───────┴───────┐
            │   Airtable    │  (Staging/prep only during transition)
            │   CSV Export  │
            └───────────────┘
```

**Airtable's Future Role**

| Option | Role | Recommended |
|--------|------|-------------|
| **A: Deprecated** | No longer used; all ops in Admin UI | ✅ Target |
| **B: Staging Only** | Prep data before upload; not authoritative | Transition phase |
| **C: Parallel** | Remains for some workflows | ❌ Avoid |

**Transition Period**: Airtable may serve as a staging/prep tool until the Admin UI (Chapter 20) is fully functional for bulk operations.

---

### 21.6 Transition Plan (IN PROGRESS)

**Phase 1: Initial Migration**

| Step | Action | Status |
|------|--------|--------|
| 1.1 | Define upload file format (21.10) | ✅ Done |
| 1.2 | Create field mapping matrix (21.7) | ✅ Done |
| 1.3 | Export clean CSV from Airtable | ⬜ Pending |
| 1.4 | Implement upload validation | ⬜ Pending |
| 1.5 | Run initial import (~40K records) | ⬜ Pending |
| 1.6 | Verify data integrity | ⬜ Pending |

**Phase 2: Admin UI Enablement**

| Step | Action | Status |
|------|--------|--------|
| 2.1 | Build Provider Data Management UI (Ch 20.9) | 🟡 Partial |
| 2.2 | Build bulk import UI | ⬜ Pending |
| 2.3 | Test operational workflows in Admin | ⬜ Pending |
| 2.4 | Train team on Admin UI | ⬜ Pending |

**Phase 3: Airtable Deprecation**

| Step | Action | Status |
|------|--------|--------|
| 3.1 | All new data entered via Admin UI | ⬜ Pending |
| 3.2 | No new Airtable updates | ⬜ Pending |
| 3.3 | Archive Airtable (read-only backup) | ⬜ Pending |
| 3.4 | Decommission Airtable access | ⬜ Future |

---

### 21.7 Field Mapping Matrix (DECIDED)

**Mapping: Airtable → Provider Model**

This matrix defines which Airtable fields map to which Provider model fields.

#### Core Fields (Required for Migration)

| Airtable Field | Provider Field | Transform | Notes |
|----------------|----------------|-----------|-------|
| `provider_id` | External reference | Store in audit | Original ID for dedup |
| `provider_name` | `name` | Direct | Required |
| `provider_category` | `providerType` | Normalize | Map to ProviderType enum |
| `address` | `address` | Direct | Required |
| `city` | `city` | Direct | Required |
| `state` | `state` | Normalize | 2-letter code |
| `zipcode` | `zipCode` | Normalize | 5-digit, leading zeros |
| `phone` | `phone` | Normalize | Format: (XXX) XXX-XXXX |
| `lat` | `latitude` | Direct | Float |
| `lon` | `longitude` | Direct | Float |

#### Extended Fields (Migrate if Available)

| Airtable Field | Provider Field | Transform | Notes |
|----------------|----------------|-----------|-------|
| `website` | `website` | Validate URL | Optional |
| `email_general` | `email` | Validate email | Public contact email |
| `provider_description` | `description` | Direct | Or use `provider_description enhanced` |
| `provider_images` | `photos` | Parse array | JSON array of URLs |
| `provider_logo` | `coverPhoto` | Direct | URL |
| `lower_price` | `priceMin` | Direct | Integer (dollars) |
| `upper_price` | `priceMax` | Direct | Integer (dollars) |
| `google_rating` | (scoring input) | — | See ProviderScoring |
| `medicare_rating` | (scoring input) | — | See ProviderScoring |
| `olera_score` | (calculated) | — | Recalculate in new system |

#### Provider Type Mapping

| Airtable `provider_category` | Provider `providerType` |
|------------------------------|-------------------------|
| "Assisted Living" | `ASSISTED_LIVING` |
| "Memory Care" | `MEMORY_CARE` |
| "Nursing Home" / "Skilled Nursing" | `NURSING_HOME` |
| "Home Care" / "Home Care Agency" | `HOME_CARE` |
| "Home Health" / "Home Health Agency" | `HOME_HEALTH` |
| "Hospice" | `HOSPICE` |
| "Independent Living" | `INDEPENDENT_LIVING` |
| "Rehabilitation" / "Rehab" | `REHABILITATION` |
| (Individual caregiver - not in Airtable) | `INDEPENDENT_CAREGIVER` |

#### Fields NOT Migrated (Deprecated)

These fields are operational/workflow artifacts and should not be migrated:

| Field Pattern | Reason |
|---------------|--------|
| `Custom Marker*` | Internal workflow flags |
| `*Group*` | Batch processing markers |
| `*Evaluator*` | One-time audit outputs |
| `LLM Prompt*` | Prompt engineering artifacts |
| `Linked In Message*` | Outreach campaign data |
| `Connection Request Sent` | CRM activity |
| `Uploaded to Loops` | Marketing sync flag |
| `API Selector` | Enrichment config |
| `*Finder*` | Enrichment attempt fields |
| `call status` | Outreach campaign data |
| `status (contact info)` | Workflow status |

#### Fields Deferred to Audit Table (Future)

| Airtable Field | Future Location | Purpose |
|----------------|-----------------|---------|
| `Audit Status` | `ProviderAudit.status` | Verification state |
| `Audit Confidence` | `ProviderAudit.confidence` | Quality score |
| `Verification Summary` | `ProviderAudit.summary` | Human-readable status |
| `Business Status` | `ProviderAudit.businessStatus` | Open/closed/unknown |
| `Data Quality Issues` | `ProviderAudit.issues` | Known problems |
| `Verification Sources` | `ProviderAudit.sources` | Where data came from |
| `Last modified time` | `ProviderAudit.lastModified` | Airtable timestamp |
| `Created` | `ProviderAudit.originalCreated` | Original creation date |

---

### 21.10 Upload File Format (DECIDED)

**Standardized CSV Format**

All bulk imports use a standardized CSV format with these columns:

```csv
external_id,name,provider_type,address,city,state,zip_code,phone,website,email,description,latitude,longitude,price_min,price_max,photos
```

**Column Specifications**

| Column | Required | Format | Example |
|--------|----------|--------|---------|
| `external_id` | ✅ | String | `airtable_abc123` |
| `name` | ✅ | String (max 255) | `Sunrise Senior Living` |
| `provider_type` | ✅ | Enum value | `ASSISTED_LIVING` |
| `address` | ✅ | String | `123 Care Lane` |
| `city` | ✅ | String | `Austin` |
| `state` | ✅ | 2-letter code | `TX` |
| `zip_code` | ✅ | 5 digits | `78701` |
| `phone` | ✅ | (XXX) XXX-XXXX | `(512) 555-1234` |
| `website` | | Valid URL or empty | `https://example.com` |
| `email` | | Valid email or empty | `info@example.com` |
| `description` | | Text | `A caring community...` |
| `latitude` | | Decimal | `30.2672` |
| `longitude` | | Decimal | `-97.7431` |
| `price_min` | | Integer (dollars) | `4000` |
| `price_max` | | Integer (dollars) | `8000` |
| `photos` | | JSON array or pipe-delimited | `url1|url2|url3` |

**File Requirements**

| Requirement | Specification |
|-------------|---------------|
| Encoding | UTF-8 |
| Delimiter | Comma |
| Quote character | Double quote (`"`) |
| Header row | Required |
| Max file size | 50MB |
| Max rows per file | 50,000 |

---

### 21.11 Validation Rules (DECIDED)

**Pre-Import Validation**

Each row is validated before import. Invalid rows are rejected with error details.

| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| `external_id` | Required, unique in file | "Missing external_id" / "Duplicate external_id" |
| `name` | Required, 1-255 chars | "Name is required" / "Name too long" |
| `provider_type` | Must be valid enum | "Invalid provider_type: {value}" |
| `address` | Required, non-empty | "Address is required" |
| `city` | Required, non-empty | "City is required" |
| `state` | Required, 2-letter code | "Invalid state code" |
| `zip_code` | Required, 5 digits | "Invalid zip code format" |
| `phone` | Required, valid format | "Invalid phone format" |
| `website` | If present, valid URL | "Invalid website URL" |
| `email` | If present, valid email | "Invalid email format" |
| `latitude` | If present, -90 to 90 | "Invalid latitude" |
| `longitude` | If present, -180 to 180 | "Invalid longitude" |
| `price_min` | If present, positive integer | "Invalid price_min" |
| `price_max` | If present, ≥ price_min | "price_max must be ≥ price_min" |

**Validation Response**

```json
{
  "valid": false,
  "totalRows": 1000,
  "validRows": 985,
  "invalidRows": 15,
  "errors": [
    {"row": 42, "field": "phone", "message": "Invalid phone format", "value": "555-1234"},
    {"row": 156, "field": "provider_type", "message": "Invalid provider_type: Senior Care", "value": "Senior Care"}
  ]
}
```

---

### 21.12 Deduplication Strategy (DECIDED)

**Deduplication Key**

Primary deduplication uses `external_id`. Secondary matching uses name + address.

```
Dedup Priority:
1. Exact match on external_id → Update existing record
2. Fuzzy match on (name + address + city + state) → Flag for review
3. No match → Create new record
```

**Match Scoring**

| Match Type | Score | Action |
|------------|-------|--------|
| Exact `external_id` match | 100 | Update |
| Exact name + address | 90 | Flag as likely duplicate |
| Fuzzy name (>90% similar) + exact address | 80 | Flag for review |
| Exact address only | 50 | Flag for review |
| No match | 0 | Create new |

**Flagged Records**

Records flagged as potential duplicates appear in Admin queue for manual resolution:
- Merge (combine records)
- Keep Both (mark as distinct)
- Skip (don't import)

---

### 21.13 Update Behavior (DECIDED)

**Merge vs. Overwrite Rules**

When updating an existing record:

| Field Category | Update Behavior | Rationale |
|----------------|-----------------|-----------|
| **Identity** (name, type) | Overwrite | Source of truth for directory |
| **Location** (address, city, state, zip) | Overwrite | May have corrections |
| **Contact** (phone, email, website) | Overwrite if non-empty | Don't blank out existing data |
| **Content** (description, photos) | Merge (append new) | Preserve existing enrichment |
| **Ratings** (averageRating, reviewCount) | Never overwrite | Platform-calculated |
| **Status** (claimed, verified) | Never overwrite | User/admin controlled |
| **Timestamps** (createdAt) | Never overwrite | Preserve history |

**Merge Logic for Arrays**

```
photos: existing_photos ∪ new_photos (deduplicated by URL)
certifications: existing ∪ new (deduplicated)
```

**Audit Trail**

Every import creates an audit record:
- Who uploaded
- When
- How many created/updated/skipped
- Original file reference

---

### 21.14 Admin UI Integration (CROSS-REFERENCE)

**Cross-reference**: See Chapter 20 → Admin Tools → Bulk Import.

**Admin Import Workflow**

```
Admin navigates to /admin/tools/bulk-import
        │
        ▼
┌─────────────────────────────────────────┐
│  1. UPLOAD FILE                         │
│  [Choose CSV file]                      │
│  Max 50MB, UTF-8 encoded                │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  2. VALIDATION PREVIEW                  │
│  ✅ 985 valid rows                      │
│  ❌ 15 invalid rows [View Errors]       │
│  ⚠️ 23 potential duplicates [Review]    │
│                                         │
│  [Cancel] [Continue with valid rows]    │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  3. DUPLICATE RESOLUTION                │
│  23 potential duplicates found          │
│                                         │
│  Row 42: "Sunrise Senior Living"        │
│  Matches existing: "Sunrise Senior..."  │
│  [Merge] [Keep Both] [Skip]             │
│                                         │
│  [Skip All Duplicates] [Resolve All]    │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  4. IMPORT CONFIRMATION                 │
│  Ready to import:                       │
│  • 962 new providers                    │
│  • 23 updates to existing               │
│  • 15 skipped (invalid)                 │
│                                         │
│  [Cancel] [Run Import]                  │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  5. IMPORT COMPLETE                     │
│  ✅ 985 providers processed             │
│  • 962 created                          │
│  • 23 updated                           │
│                                         │
│  [Download Report] [View Providers]     │
└─────────────────────────────────────────┘
```

---

### 21.15 Current Scale: ~40,000 Providers

**Dataset Characteristics**

| Attribute | Value |
|-----------|-------|
| Total records | ~40,000 |
| Provider types | Mix of all organization types |
| Geographic coverage | Nationwide (US) |
| Data quality | Variable (some enriched, some sparse) |
| Claimed status | All unclaimed (pre-seeded directory) |

**State Distribution** (approximate)

| State | % of Records |
|-------|--------------|
| California | 12% |
| Texas | 10% |
| Florida | 8% |
| New York | 6% |
| Other states | 64% |

---

### 21.16 Target Scale: 500,000+ Providers

**Scaling Considerations**

| Concern | Current (40K) | Target (500K) | Mitigation |
|---------|---------------|---------------|------------|
| Database size | ~100MB | ~1.5GB | Standard Postgres capacity |
| Query performance | <100ms | Potential slowdown | Indexes, query optimization |
| Search latency | Fast | May degrade | Full-text search, caching |
| Import time | Minutes | Hours | Background jobs, chunking |
| Admin UI pagination | Fine | Critical | Virtual scrolling, server-side |

**Required Optimizations**

| Optimization | When Needed | Implementation |
|--------------|-------------|----------------|
| Database indexes | Now | `@@index` on search fields |
| Full-text search | 100K+ | PostgreSQL FTS or external |
| Search caching | 200K+ | Redis or in-memory |
| CDN for images | 100K+ | Vercel Blob CDN |
| Background imports | 50K+ per file | Job queue (BullMQ) |

**Future: Data Acquisition**

Scaling to 500K+ requires data acquisition strategies beyond manual CSV uploads. See **Chapter 35: Data Acquisition & Enrichment** for:
- Public data sourcing
- API-based enrichment
- Compliance framework
- AI-assisted verification

---

### 21.17 Demo & Development Data

**Demo User Accounts**

| Account | Email | Password | Purpose |
|---------|-------|----------|---------|
| Family (Active) | `family.assisted.active@demo.com` | `demo123` | Family searching for AL |
| Family (Memory) | `family.memory.early@demo.com` | `demo123` | Memory care search |
| Provider (Claimed) | `provider.al.flagship@demo.com` | `demo123` | Claimed org provider |
| Provider (Individual) | `caregiver.fulltime@demo.com` | `demo123` | Individual caregiver |
| Admin | `admin@demo.com` | `demo123` | Admin mode access |

**Demo Data Scope**

| Data Type | Count | Purpose |
|-----------|-------|---------|
| Family accounts | 12 | Various care needs, completion levels |
| Provider accounts (org) | 8 | Various types, claimed status |
| Provider accounts (individual) | 4 | Caregivers for hiring demo |
| Engagements | 15-20 | Various statuses, types |
| Messages | 50+ | Conversation threads |
| Reviews | 20+ | Ratings distribution |

**Seed Scripts**

| Script | Purpose | Command |
|--------|---------|---------|
| `prisma/seed.ts` | Demo accounts + sample data | `npx prisma db seed` |
| `prisma/seed-comprehensive.ts` | Extended demo scenarios | Manual run |

---

### 21.18 Demo Walkthrough Documentation

**To Be Documented**

| Scenario | Description | Accounts Used |
|----------|-------------|---------------|
| Family care search | Find and contact providers | family.assisted.active |
| Provider response | Respond to family inquiry | provider.al.flagship |
| Caregiver hiring | Org finds caregiver | provider.al.flagship + caregiver.fulltime |
| Admin operations | Manage providers, claims | admin |

---

### 21.19 Data Reset Capabilities

**Reset Options**

| Action | Route | Effect |
|--------|-------|--------|
| Clear engagements | `/admin/tools/clear-requests` | Removes all ConsultRequest + Messages |
| Full reset | `npx prisma db seed` | Drops all data, reseeds |
| Selective clear | Manual script | Clears specific data types |

**Demo Reset Flow**

```
Before demo presentation:
1. Run: npx prisma db seed
2. Verify: Test accounts accessible
3. Verify: Sample data present
```

---

### Future Reference: Chapter 35

**Chapter 35: Data Acquisition & Enrichment** will cover:

| Topic | Description |
|-------|-------------|
| **Data Sourcing** | Public registries, licensing databases, scraping |
| **API Enrichment** | Google Places, CMS Medicare data, state APIs |
| **Legal Compliance** | DMCA, public data rules, ToS compliance |
| **AI Verification** | Automated quality checks, closure detection |
| **Enrichment Pipelines** | Ongoing data freshness, scoring updates |

This chapter is intentionally separate to allow proper legal/compliance review before implementation.

---

### Cross-Chapter Integration

| Chapter | Integration with Ch 21 |
|---------|------------------------|
| **Ch 5: Provider Profiles** | Field definitions, display rules |
| **Ch 6: Provider Identity** | Claiming links account to org data |
| **Ch 7: Provider Directory** | Search uses Provider table |
| **Ch 8: Provider Claiming** | Transitions unclaimed → claimed |
| **Ch 17: Profile Completion** | Completion % calculation |
| **Ch 18: Subscriptions** | Claimed → Active transition |
| **Ch 20: Admin System** | Bulk import UI, data management |

---

### Appendix: Future Schema Additions

**ProviderAudit Table** (for tracking data quality)

```prisma
model ProviderAudit {
  id              String    @id @default(cuid())
  providerId      String    @unique
  provider        Provider  @relation(fields: [providerId], references: [id])

  // Source tracking
  dataSource      String?   // "airtable", "cms", "google", "manual"
  externalId      String?   // Original ID from source system
  importBatchId   String?   // Which import created/updated this

  // Verification
  auditStatus     String?   // "verified", "needs_review", "flagged"
  auditConfidence Int?      // 0-100 confidence score
  businessStatus  String?   // "open", "closed", "unknown"
  lastVerified    DateTime?
  verificationSources String[] @default([])

  // Quality
  dataQualityIssues String[] @default([])
  missingFields     String[] @default([])

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

**ProviderScoring Table** (for Olera Score calculation)

```prisma
model ProviderScoring {
  id              String    @id @default(cuid())
  providerId      String    @unique
  provider        Provider  @relation(fields: [providerId], references: [id])

  // External ratings
  googleRating    Float?
  googleReviewCount Int?
  medicareRating  Float?
  yelpRating      Float?

  // Calculated scores
  sentimentScore  Float?    // AI-derived sentiment
  valueScore      Float?    // Value for money indicator
  infoAvailability Float?   // How complete is public info

  // Final score
  oleraScore      Float?    // Calculated composite score
  scoreCalculatedAt DateTime?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

These tables are **not required for initial migration** but provide a clean home for audit and scoring data when needed.

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

## Chapter 34: Communications & Automation

**Purpose**: Define transactional communications, lifecycle automation, and operational outreach systems.

> ⭐ **Core System**: This chapter is required as a foundational platform capability. Referenced in Chapter 20 (Admin System) as a future development priority.

| Item | Status | Notes |
|------|--------|-------|
| **Transactional Communications** | | |
| 34.1 Email Notifications | ⬜ | Engagement updates, reminders, reviews |
| 34.2 SMS Notifications | ⬜ | Reminders, verification, alerts |
| 34.3 Template Management | ⬜ | Personalization, versioning |
| **Lifecycle Automation** | | |
| 34.4 Welcome Sequences | ⬜ | Onboarding emails |
| 34.5 Re-engagement Campaigns | ⬜ | Inactive user outreach |
| 34.6 Profile Completion Reminders | ⬜ | Nudges to complete profile |
| **Operational Communications** | | |
| 34.7 Admin-Initiated Outreach | ⬜ | Manual campaigns |
| 34.8 Call Center Workflow | ⬜ | Trigger-based task creation |
| **Automation Engine** | | |
| 34.9 Trigger Definitions | ⬜ | Events, conditions, timing |
| 34.10 Action Definitions | ⬜ | Send email, SMS, create task |
| 34.11 Delivery Tracking | ⬜ | Analytics and monitoring |

### Architectural Notes
_To be developed. See Chapter 20 Future Chapter Reference for initial scope._

---

## Chapter 35: Data Acquisition & Enrichment

**Purpose**: Define strategies for scaling the provider directory from 40K to 500K+ through data sourcing, enrichment, and quality assurance.

> ⭐ **Core System**: Referenced from Chapter 21 (Provider Data Management). Intentionally separated to allow proper legal/compliance review before implementation.

| Item | Status | Notes |
|------|--------|-------|
| **Data Sourcing** | | |
| 35.1 Public Data Sources | ⬜ | State licensing databases, registries |
| 35.2 API-Based Enrichment | ⬜ | Google Places, CMS Medicare, state APIs |
| 35.3 Web Scraping Strategy | ⬜ | When, what, how |
| 35.4 Third-Party Data Providers | ⬜ | Paid data sources |
| **Legal & Compliance** | | |
| 35.5 Public Data Rules | ⬜ | By state/jurisdiction |
| 35.6 DMCA Considerations | ⬜ | Content usage rights |
| 35.7 Terms of Service Compliance | ⬜ | Respecting source ToS |
| 35.8 Data Licensing | ⬜ | Attribution requirements |
| **AI-Assisted Verification** | | |
| 35.9 Automated Quality Checks | ⬜ | Data validation pipelines |
| 35.10 Closure Detection | ⬜ | Identifying closed providers |
| 35.11 Human-in-the-Loop Escalation | ⬜ | When AI flags for review |
| **Enrichment Pipelines** | | |
| 35.12 Olera Score Inputs | ⬜ | External ratings, sentiment |
| 35.13 Data Freshness Monitoring | ⬜ | Stale data detection |
| 35.14 Contact Information Updates | ⬜ | Phone/email verification |

### Key Questions
- [ ] What public data sources are available per state?
- [ ] Legal review of scraping vs. API usage?
- [ ] Compliance framework for data usage?

### Architectural Notes
_To be developed with legal/compliance review._

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

_Last Updated: 2026-01-15_
