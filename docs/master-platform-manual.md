# Olera Platform — Master Systems Manual

> **Version**: 1.1 — Sprint 0 Complete
> **Last Reviewed**: January 19, 2026

> **Purpose**: This document serves as the source of truth for all platform systems. It will be iteratively refined as we work through each chapter, answer key questions, and make architectural decisions.
>
> **Implementation Status Indicators**:
> - ✅ **Built** — Core functionality exists and works
> - 🟡 **Partial** — Some features exist, gaps or fragility present
> - ⬜ **Not Built** — Planned but not yet implemented
> - ❌ **Deferred** — Out of scope for demo
>
> **Review Status Indicators**:
> - ✅ **Reviewed** — Chapter has been jointly reviewed and approved
> - ⏳ **Pending** — Chapter content exists but has not yet been reviewed
> - 🆕 **New Placeholder** — Chapter to be written; structure approved
> - ⭐ **Future Direction** — Strategic concept for future phases; not in current scope
>
> **Demo vs. Production Scope**:
> This manual documents both the demo implementation and the full production system design. The distinction is made clear throughout:
> - **Simple deferrals** are noted inline (e.g., "❌ Deferred for demo" with rationale and "Post-demo" notes)
> - **Complex multi-phase features** use explicit **Demo Scope** and **Production Scope** subsections
>
> This ensures reviewers understand that the demo is intentionally simplified, while the full system has been thoughtfully designed even where features are deferred.

---

## Review Progress

**Last Updated**: January 19, 2026 (Sprint 0 Audit Complete)

| Status | Count | Chapters |
|--------|-------|----------|
| ✅ Reviewed | 39 | 1–39 (all chapters) |
| ⏳ Pending | 0 | — |
| 🆕 Placeholder/New | 0 | — |
| **Total** | **39** | |

### Remaining Chapters to Review

All originally pending chapters have been reviewed. ✅

### Chapters Requiring Content Development

All chapters have been reviewed and developed. ✅

---

## Sprint 0 Completion Summary

> **Completion Date**: January 19, 2026
> **Status**: ✅ Complete — Platform foundations verified and stable

### What Was Verified

Sprint 0 focused on stabilizing the foundation layer before building features. The following systems were verified through comprehensive human audits:

| System | Status | Verification Method |
|--------|--------|---------------------|
| Authentication & Session | ✅ Solid | Hard refresh tests, login/logout cycles |
| Mode System (FAMILY/PROVIDER) | ✅ Solid | Toggle, persist, refresh, cross-session |
| Mode Initialization (Signup) | ✅ Fixed | Intent parameter flow verified end-to-end |
| Route Protection | ✅ Solid | Middleware gates all protected routes |
| Breadcrumb Navigation | ✅ Built | Auto-generated on 19+ pages |
| Provider Gating | ✅ Working | Redirects to onboarding when no ProviderIdentity |
| Build System | ✅ Passing | `npm run build` and `npm run dev` verified |
| Seed Data System | ✅ Working | 4 test accounts with proper relationships |

### Bugs Fixed During Sprint 0

| Bug | Impact | Fix Applied |
|-----|--------|-------------|
| Signup ignored `?intent=provider` | Provider-targeted signup didn't set PROVIDER mode | Added `useSearchParams()`, pass intent to API |
| AuthModal didn't pass intent | Modal signup always defaulted to FAMILY mode | Added intent prop, redirect by mode |
| AuthModal view state not resetting | Re-opening modal showed previous view | Added useEffect to sync view state on open |
| Hard refresh caused login redirect | Using `!session` instead of auth status | Changed to `status === "unauthenticated"` pattern |
| Breadcrumbs missing on known routes | CUID regex matched known segments like "dashboard" | Check `SEGMENT_LABELS` before ID detection |

### Key Architectural Decisions Confirmed

1. **Mode Source of Truth**: `User.activeMode` in database (URL param to be removed in Sprint 1)
2. **Auth Pattern**: Use `status === "unauthenticated"` not `!session` for redirect logic
3. **Provider Gating**: Uses `ProviderIdentity` model (to be simplified in Sprint 1)
4. **Breadcrumb Strategy**: Auto-generated from URL path with `SEGMENT_LABELS` mapping
5. **Intent Flow**: `/signup?intent=provider` → API → `activeMode: PROVIDER` → redirect to provider dashboard

### Platform-Wide Implications for Future Sprints

| Implication | Affected Sprints | Notes |
|-------------|------------------|-------|
| Auth pattern established | All | Always use `status === "unauthenticated"` for redirects |
| Mode is DB-only | Sprint 1+ | Remove all URL `?mode=` handling |
| Gentle nudges over forced redirects | Sprint 1 | Per Manual Ch 8, use prompts not blocks |
| Navigation rendering principle | Sprint 1+ | "Maximize visibility, gate by action" |

### Items Deferred to Sprint 1

See Sprint Plan for full deferral list. Key items:
- Remove URL `?mode=` parameter (DB is source of truth)
- Remove forced onboarding redirect (use gentle nudges)
- Footer implementation
- Route renaming per Manual specifications

---

## Table of Contents

### Foundational Architectural Decisions
*Core decisions that apply across multiple chapters*

- [Foundational Architectural Decisions](#foundational-architectural-decisions) | ✅ Reviewed

### Part I: Platform Foundation
*How users enter the platform, navigate the system, and experience our design quality*

| Ch | Title | Review Status |
|----|-------|---------------|
| 1 | [Authentication & Account Management](#chapter-1-authentication--account-management) | ✅ Reviewed |
| 2 | [Mode System (Family vs Provider)](#chapter-2-mode-system-family-vs-provider) | ✅ Reviewed |
| 3 | [Onboarding Wizard (Shared System)](#chapter-3-onboarding-wizard-shared-system) | ✅ Reviewed |
| 4 | [UI & Design Language](#chapter-4-ui--design-language) | ✅ Reviewed |
| 5 | [Navigation & Routing](#chapter-5-navigation--routing) | ✅ Reviewed |

### Part II: User Identity & Profiles
*Establishing who users are and how they present themselves*

| Ch | Title | Review Status |
|----|-------|---------------|
| 6 | [Family Care Profiles](#chapter-6-family-care-profiles) | ✅ Reviewed |
| 7 | [Provider Profiles](#chapter-7-provider-profiles) | ✅ Reviewed |
| 8 | [Provider Identity & Gating](#chapter-8-provider-identity--gating) | ✅ Reviewed |

### Part III: Discovery, Directory & Matching
*How users find, evaluate, and get matched with each other*

| Ch | Title | Review Status |
|----|-------|---------------|
| 9 | [Provider Directory & Search](#chapter-9-provider-directory--search) | ✅ Reviewed |
| 10 | [Provider Claiming (Organizations Only)](#chapter-10-provider-claiming-organizations-only) | ✅ Reviewed |
| 11 | [Profile Completion & Matching](#chapter-11-profile-completion--matching) | ✅ Reviewed |

### Part IV: User Experience
*Daily platform interactions through dashboards and settings*

| Ch | Title | Review Status |
|----|-------|---------------|
| 12 | [Family Dashboard](#chapter-12-family-dashboard) | ✅ Reviewed |
| 13 | [Provider Dashboard](#chapter-13-provider-dashboard) | ✅ Reviewed |
| 14 | [Settings & Preferences](#chapter-14-settings--preferences) | ✅ Reviewed |

### Part V: Engagement
*Core interaction systems between families and providers*

| Ch | Title | Review Status |
|----|-------|---------------|
| 15 | [Engagements](#chapter-15-engagements) | ✅ Reviewed |
| 16 | [Messaging System](#chapter-16-messaging-system) | ✅ Reviewed |
| 17 | [Multi-Context Scheduling](#chapter-17-multi-context-scheduling) | ✅ Reviewed |
| 18 | [Saved / Favorites](#chapter-18-saved--favorites) | ✅ Reviewed |
| 19 | [Notifications](#chapter-19-notifications) | ✅ Reviewed |

### Part VI: Hiring Marketplace
*B2B marketplace for organizations hiring caregivers*

| Ch | Title | Review Status |
|----|-------|---------------|
| 20 | [Caregiver Hiring Marketplace](#chapter-20-caregiver-hiring-marketplace) | ✅ Reviewed |

### Part VII: Monetization
*Subscription tiers, paywalls, and revenue model*

| Ch | Title | Review Status |
|----|-------|---------------|
| 21 | [Subscriptions & Paywalls](#chapter-21-subscriptions--paywalls) | ✅ Reviewed |

### Part VIII: Trust & Quality
*Building confidence through reviews, ratings, and safety systems*

| Ch | Title | Review Status |
|----|-------|---------------|
| 22 | [Reviews & Ratings](#chapter-22-reviews--ratings) | ✅ Reviewed |
| 23 | [Trust & Safety](#chapter-23-trust--safety) | ✅ Reviewed |

### Part IX: Data Acquisition & Directory Scale
*Seeding, scaling, and managing the national provider directory*

| Ch | Title | Review Status |
|----|-------|---------------|
| 24 | [Provider Data Management](#chapter-24-provider-data-management) | ✅ Reviewed |
| 25 | [Data Acquisition & Enrichment](#chapter-25-data-acquisition--enrichment) | ✅ Reviewed |

### Part X: Platform Administration & Operations
*Internal tools, workflows, and standard operating procedures*

| Ch | Title | Review Status |
|----|-------|---------------|
| 26 | [Admin System](#chapter-26-admin-system) | ✅ Reviewed |
| 27 | [Human Workflows & Standard Operating Procedures](#chapter-27-human-workflows--standard-operating-procedures) | ✅ Reviewed |
| | 27.1 Operating Philosophy | |
| | 27.2 Daily Operations Checklist | |
| | 27.3 Provider Claim Verification | |
| | 27.4 Review Moderation | |
| | 27.5 Takedown & Legal Requests | |
| | 27.6 User Management | |
| | 27.7 Provider Listing Management | |
| | 27.8 Support Ticket Management | |
| | 27.9 Error & Incident Response | |
| | 27.10 Attribution & Referral Management | |
| | 27.11 Audit Log Usage | |
| | 27.12 SLA Summary | |
| | 27.13 Escalation Matrix | |
| | 27.14 Admin Onboarding Checklist | |
| | 27.15 Demo vs Production Scope | |
| | 27.16 Quick Reference Card | |

### Part XI: Marketing & Growth
*User acquisition, SEO, and referral programs*

| Ch | Title | Review Status |
|----|-------|---------------|
| 28 | [Marketing & SEO Pages](#chapter-28-marketing--seo-pages) | ✅ Reviewed |
| 29 | [Referral Programs & Partner Attribution](#chapter-29-referral-programs--partner-attribution) | ✅ Reviewed |

### Part XII: Help & Support
*User assistance and support channels*

| Ch | Title | Review Status |
|----|-------|---------------|
| 30 | [Customer Support](#chapter-30-customer-support) | ✅ Reviewed |

### Part XIII: Tech Stack & Infrastructure
*Complete technical foundation enabling the platform end-to-end — single source of truth for all technology*

| Ch | Title | Review Status |
|----|-------|---------------|
| 31 | [Application Architecture & Tech Stack](#chapter-31-application-architecture--tech-stack) | ✅ Reviewed |
| | 31.1 Technology Stack Overview | |
| | 31.2 Frontend Architecture | |
| | 31.3 Backend Architecture | |
| | 31.4 Database Layer | |
| | 31.5 Authentication Infrastructure | |
| | 31.6 Directory Structure | |
| | 31.7 Environment Variables | |
| 32 | [Hosting, Deployment & CI/CD](#chapter-32-hosting-deployment--cicd) | ✅ Reviewed |
| | 32.1 Hosting Environment | |
| | 32.2 Deployment Pipeline | |
| | 32.3 Environment Management | |
| | 32.4 Build Configuration | |
| | 32.5 Domain & SSL | |
| | 32.6 Monitoring & Logs | |
| | 32.7 Rollbacks & Recovery | |
| | 32.8 Demo vs Production Summary | |
| 33 | [File Uploads & Media](#chapter-33-file-uploads--media) | ✅ Reviewed |
| | 33.1 Storage Architecture | |
| | 33.2 Image Upload API | |
| | 33.3 Upload Use Cases | |
| | 33.4 Image Optimization | |
| | 33.5 File Size Limits & Quotas | |
| | 33.6 Error Handling | |
| | 33.7 Security Considerations | |
| | 33.8 Database Schema | |
| | 33.9 Admin System Integration | |
| 34 | [Communications Infrastructure](#chapter-34-communications-infrastructure) | ✅ Reviewed |
| | 34.1 Delivery Infrastructure (Resend, Twilio) | |
| | 34.2 Template Architecture | |
| | 34.3 Transactional Email Templates | |
| | 34.4 Lifecycle Automation | |
| | 34.5 Call Center Workflow (Production) | |
| | 34.6 Admin-Initiated Outreach (Production) | |
| | 34.7 Delivery Tracking | |
| | 34.8 Implementation Status | |
| | 34.9 Key Decisions Log | |
| | 34.10 Cross-Chapter Integration | |
| 35 | [Error Handling & Monitoring](#chapter-35-error-handling--monitoring) | ✅ Reviewed |
| | 35.1 Error Handling Architecture | |
| | 35.2 Frontend Error States | |
| | 35.3 API Error Handling | |
| | 35.4 Error Logging | |
| | 35.5 Monitoring & Alerting | |
| | 35.6 Admin System Integration | |
| | 35.7 Error Recovery Patterns | |
| 36 | [Performance & Caching](#chapter-36-performance--caching) | ✅ Reviewed |
| | 36.1 Performance Strategy | |
| | 36.2 Database Optimization | |
| | 36.3 Image Optimization | |
| | 36.4 Data Caching | |
| | 36.5 Bundle Optimization | |
| | 36.6 Core Web Vitals | |
| | 36.7 Admin System Integration | |
| | 36.8 Performance Checklist | |
| 37 | [Analytics & Audit Logging](#chapter-37-analytics--audit-logging) | ✅ Reviewed |
| | 37.1 Demo Scope | |
| | 37.2 Audit Log Schema | |
| | 37.3 Action Categories & Priorities | |
| | 37.4 Admin Audit Dashboard | |
| | 37.5 Retention & Compliance | |
| | 37.6 Implementation Notes | |
| | 37.7 Admin Legal & Compliance Section | |
| 38 | [Third-Party Services & Integrations](#chapter-38-third-party-services--integrations) | ✅ Reviewed |
| | 38.1 Service Inventory | |
| | 38.2 Environment Variable Registry | |
| | 38.3 API Integration Patterns | |
| | 38.4 Service Dependencies by Feature | |
| | 38.5 Vendor Evaluation & Management | |
| | 38.6 Admin Integration Visibility | |
| | 38.7 Demo vs Production Scope | |
| | 38.8 Cross-Reference Index | |

### Part XIV: Legal & Regulatory Compliance
*Comprehensive legal framework, policies, and compliance procedures*

| Ch | Title | Review Status |
|----|-------|---------------|
| 39 | [Legal Framework Overview](#chapter-39-legal-framework-overview) | ✅ Reviewed |
| | **39.1 Core Legal & Policy Documents** | |
| | 39.1.1 Terms of Service | |
| | 39.1.2 Privacy Notice | |
| | 39.1.3 Medical & Emergency Disclaimer | |
| | 39.1.4 No-PHI Warning Prompt | |
| | **39.2 Compliance, Moderation & Enforcement** | |
| | 39.2.1 DMCA & Trademark Policy | |
| | 39.2.2 Defamation / Legal Escalation SOP | |
| | 39.2.3 Incident Response Plan | |
| | **39.3 Data Governance & User Rights** | |
| | 39.3.1 Data Retention & Deletion Policy | |
| | 39.3.2 Data Export & Portability | |
| | 39.3.3 Inquiry Form Consent Text | |
| | 39.3.4 Premium Subscription Terms | |

### Future Directions
*Strategic concepts for future phases — not in current scope*

| ID | Title | Status |
|----|-------|--------|
| F1 | [Mobile App Development (iOS & Android)](#future-mobile-app-development-ios--android) | ⭐ Future |
| F2 | [AI Benefits Finder](#future-ai-benefits-finder) | ⭐ Future |
| F3 | [Caregiver Workforce & Direct Staffing Model](#future-caregiver-workforce--direct-staffing-model) | ⭐ Future |
| F4 | [Transaction Hosting Platform](#future-transaction-hosting-platform) | ⭐ Future |

### Appendices

- [Appendix A: Architectural Decisions Log](#appendix-a-architectural-decisions-log)
- [Appendix B: Demo Scenarios](#appendix-b-demo-scenarios)
- [Appendix C: Known Issues & Tech Debt](#appendix-c-known-issues--tech-debt)
- [Appendix D: Glossary](#appendix-d-glossary)

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
| **Mode determines dropdown** | Mode selects which dropdown menu appears (Family or Provider) |
| **Profiles inside dashboards** | Care Profile and Provider Profile are sections within dashboards, not separate nav items |

> **Cross-Reference**: See **Chapter 5: Navigation & Routing** for the complete account dropdown rendering model, including the navigation rendering principle (maximize visibility, gate by action).

### Navigation Rendering Principle (DECIDED)

> **Core Rule**: Tabs are visible by default. Do not hide navigation based on profile completion or existence. Gate by action (empty states, prompts) rather than visibility.

| Principle | Application |
|-----------|-------------|
| **Core tabs always visible** | All 4 core tabs in each mode appear regardless of profile state |
| **Pages handle empty states** | If user lacks profile, page shows CTA — tab is still visible |
| **Only hiring varies** | Hiring section tabs depend on provider type (the one exception) |

### Family Mode Navigation (DECIDED)

**Always shown** (regardless of family profile existence):

| Nav Item | Route | Contains |
|----------|-------|----------|
| **Find Providers** | `/` (homepage) | Provider directory with filters |
| **Saved Providers** | `/family/saved-providers` | Saved provider list |
| **My Providers** | `/family/my-providers` | All engagements (requests, messages, conversations) |
| **Dashboard** | `/family/dashboard` | Summary, schedule, activity, **Care Profile editing** |

### Provider Mode Navigation (DECIDED)

**Core tabs — always shown** (regardless of provider profile existence):

| Nav Item | Route | Contains |
|----------|-------|----------|
| **Find Families** | `/provider/find-families` | Browse families with visibility enabled |
| **Saved Families** | `/provider/saved-families` | Saved family list |
| **My Families** | `/provider/my-families` | All engagements with families |
| **My Provider Profile** | `/provider/dashboard` | Summary, stats, calendar, **Provider Profile editing** |

### Hiring Section — Provider Type Conditional (DECIDED)

The hiring section is the **only** part of navigation that varies based on user state. This is because organizations and caregivers have fundamentally different hiring journeys.

#### Unknown Provider Type (No Profile Yet)

| Dropdown Label | Route | Purpose |
|----------------|-------|---------|
| "Hire Care Staff" | `/provider/hire-staff/onboarding` | Routes to organization onboarding |
| "Become a Caregiver" | `/provider/caregiver/onboarding` | Routes to caregiver onboarding |

#### Organization Provider

| Dropdown Label | Route | Purpose |
|----------------|-------|---------|
| "Hire Care Staff" | `/provider/hire-staff` | Browse caregivers available for hire |
| "My Candidates" | `/provider/my-candidates` | Hiring engagements with caregivers |

#### Individual Caregiver

| Dropdown Label | Route | Purpose |
|----------------|-------|---------|
| "Hiring Organizations" | `/provider/hiring-organizations` | Browse orgs actively hiring |
| "My Job Opportunities" | `/provider/my-opportunities` | Hiring engagements with orgs |

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

### Care Journey Pathways (DECIDED)

> These pathways describe how families typically arrive at the platform, informing content strategy, navigation design, and onboarding flows.

Three primary pathways families follow when seeking care:

#### Pathway 1: Hospital Discharge

```
Hospital Admission → Discharge Planning → Rehab/SNF → Next Level of Care
```

| Attribute | Details |
|-----------|---------|
| **Triggers** | Surgery, stroke, fall, acute illness |
| **Timeline** | 24-72 hours for placement decisions |
| **User State** | High urgency, limited research time |
| **Content Needs** | "What to expect after hospital discharge," SNF vs rehab comparison, Medicare coverage guides |
| **Platform Entry** | Direct search for specific care type, "Help Me Decide" for guidance |

#### Pathway 2: Clinical Escalation

```
Primary Care Visit → Recognition of Decline → Family Discussion → Care Transition
```

| Attribute | Details |
|-----------|---------|
| **Triggers** | Cognitive decline, mobility issues, medication management concerns |
| **Timeline** | Weeks to months |
| **User State** | Moderate urgency, time to research |
| **Content Needs** | "Signs your parent needs more help," care type comparisons, family conversation guides |
| **Platform Entry** | Educational content, comparison pages, care assessment wizard |

#### Pathway 3: Self-Directed Research

```
Family Concern → Online Research → Care Assessment → Provider Selection
```

| Attribute | Details |
|-----------|---------|
| **Triggers** | Proactive planning, observed changes, caregiver burnout |
| **Timeline** | Variable, often extended research phase |
| **User State** | Lower urgency, comprehensive research |
| **Content Needs** | Comprehensive guides, cost information, local directory pages |
| **Platform Entry** | SEO content, topic hubs, directory browsing |

**Cross-Reference**: See Chapter 28: Marketing & SEO Pages for content strategy aligned to these pathways.

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

> **Sprint 0 Status**: Verified working (January 19, 2026)

| Item | Status | Notes |
|------|--------|-------|
| 2.1 Mode Storage (`User.activeMode`) | ✅ | Database field exists, verified in Sprint 0 |
| 2.2 Mode Switching (toggle) | ✅ | Works correctly, routing verified |
| 2.3 Mode Defaulting on Login | ✅ | Restores from DB correctly |
| 2.4 Mode Persistence Across Sessions | ✅ | Stored in DB, verified across refresh |
| 2.5 URL Mode Parameter (`?mode=`) | 🟡 | To be removed in Sprint 1 (DB is source of truth) |
| 2.6 Mode Selection Modal (signup/onboarding) | 🟡 | Provider onboarding works; formal wizard deferred |

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
| 3.9 Care Assessment Wizard | ⬜ | "Help Me Decide" flow for care type recommendations |
| 3.10 Caregiver Job Seeker Onboarding | ⬜ | `/caregiver-jobs/` entry flow |

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

**Detailed field lists**: See Chapter 6 (Family Care Profiles) and Chapter 7 (Provider Profiles).

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
- Completion % stored in DB (not calculated on-the-fly) — details in Chapter 11

#### 3.9 Care Assessment Wizard — "Help Me Decide" (DECIDED)

**Purpose**: Guide families who are unsure of care needs to appropriate care type recommendations.

**Entry Points**:
- "Help Me Decide" button in primary navigation
- Topic hub CTAs
- Article contextual CTAs
- Comparison page CTAs

**Assessment Flow**:

| Step | Question | Options | Purpose |
|------|----------|---------|---------|
| 1 | **Relationship** | "Who needs care?" | Parent, Spouse, Myself, Other |
| 2 | **Current Situation** | "Where do they live now?" | Own home, Family's home, Already in facility |
| 3 | **Daily Living** | "Do they need help with daily activities?" | Bathing, Dressing, Eating, Mobility, None |
| 4 | **Medical Needs** | "Do they require medical care?" | Skilled nursing, Medication management, Therapy, None |
| 5 | **Cognitive** | "Are there memory or cognitive concerns?" | Diagnosed dementia, Suspected decline, No concerns |
| 6 | **Location** | "Where are you looking for care?" | City/zip input |
| 7 | **Budget** | "What is your budget range?" | Ranges by care type |
| 8 | **Timeline** | "How soon do you need care?" | Immediately, 1-3 months, 3-6 months, Planning ahead |

**Output**: Personalized care type recommendations with:
- Recommended care type(s) with explanation
- Links to relevant topic hub
- Links to local directory (city page)
- Option to "Talk to an advisor" (future)

**Assessment Behavior**:

| Scenario | Behavior |
|----------|----------|
| Not logged in | Complete assessment → results shown → signup prompt with context preserved |
| Logged in (no profile) | Complete assessment → results shown → option to save to profile |
| Logged in (has profile) | Complete assessment → results shown → option to update profile |

**Data Storage**: Assessment responses stored with user (if logged in) for:
- Pre-filling family profile fields
- Analytics on user needs
- Future advisor matching

**Cross-Reference**: See Chapter 28: Marketing & SEO Pages for care pathways that inform assessment design.

#### 3.10 Caregiver Job Seeker Onboarding (DECIDED)

**Purpose**: Capture professional caregivers seeking employment opportunities.

**Entry Point**: `/caregiver-jobs/` landing page or "Looking for Work?" links

**Flow Variant**: Uses Provider wizard variant with job-seeker-specific framing.

| Step | Content | Fields |
|------|---------|--------|
| 1 | **Basic Info** | Name, email, phone, location |
| 2 | **Experience** | Years of experience, settings worked (home care, facility, etc.) |
| 3 | **Certifications** | CNA, HHA, LPN, RN, CPR, other |
| 4 | **Availability** | Full-time, part-time, live-in, schedule preferences |
| 5 | **Work Preferences** | Preferred care types, distance willing to travel, desired pay range |
| 6 | **Profile Photo** | Optional but recommended |

**Visibility Settings** (job seeker specific):

| Toggle | Default | Purpose |
|--------|---------|---------|
| Visible to hiring organizations | **On** | Primary purpose of job seeker flow |
| Visible to families | Off | Can enable if also seeking direct employment |

**Post-Onboarding**:
- Profile created as Individual Caregiver
- Appears in organization hiring searches
- Can browse providers with "Looking for caregivers" enabled
- Receives notifications when matched with opportunities

**Cross-Reference**: See Chapter 28: Marketing & SEO Pages for job seeker landing page content.

---

## Chapter 4: UI & Design Language

**Review Status**: ✅ Reviewed

**Purpose**: Establish platform-wide UI/UX principles and design quality standards that ensure Olera delivers a top-tier, consumer-grade experience across all systems. This chapter is upstream of all user-facing implementation — decisions here cascade into every component, page, and interaction.

**Primary User Optimization**: We optimize for all user types (seniors, family members, caregivers, clinicians, discharge planners), but design with seniors as the baseline. If the experience is usable for seniors themselves, it will be usable for everyone. The goal is for any user to confidently show the product to a loved one and navigate it together.

### Scope

| Item | Status | Notes |
|------|--------|-------|
| 4.1 Design Philosophy & Principles | ✅ | 7 core principles |
| 4.2 Visual Language | ✅ | Typography, color, spacing, iconography |
| 4.3 Component Library Standards | ✅ | shadcn/ui + application layer |
| 4.4 Interaction Patterns | ✅ | Loading, empty, error, transitions |
| 4.5 Quality Bar & Inspiration | ✅ | Reference apps, anti-patterns |
| 4.6 Accessibility in Design | ✅ | WCAG integration in design process |
| 4.7 Responsive Design Guidelines | ✅ | Mobile-first, breakpoints |
| 4.8 Demo vs. Production Scope | ✅ | Scope distinctions |

---

### 4.1 Design Philosophy & Principles

These 7 principles govern all design decisions across the platform:

| # | Principle | Definition | Application Example |
|---|-----------|------------|---------------------|
| 1 | **Clarity over cleverness** | Users understand immediately what to do | No ambiguous icons without labels |
| 2 | **Warmth with professionalism** | Care is personal; design feels human but credible | Warm teal palette, professional typography |
| 3 | **Progressive disclosure** | Show only what's needed at each step | Multi-step forms, expandable sections |
| 4 | **Consistent patterns** | Same actions look and feel the same everywhere | All "Save" buttons behave identically |
| 5 | **Mobile-first, desktop-enhanced** | Design for mobile constraints first | Touch targets ≥44px, thumb-zone navigation |
| 6 | **Accessible by default** | Accessibility is not an add-on | WCAG AA minimum, semantic HTML always |
| 7 | **Speed communicates quality** | Perceived performance matters | Skeleton loaders, optimistic UI |

**Quality Commitment**: Olera is not a "good enough" platform. Every screen, every interaction, every detail should meet a consumer-grade quality bar comparable to the best modern applications.

---

### 4.2 Visual Language

#### 4.2.1 Typography

**Font System**: Single-family system for consistency.

| Role | Font | Rationale |
|------|------|-----------|
| **All text** | Inter (or system equivalent) | Clean, modern, excellent readability at all sizes |

**Type Scale** (16px base):

| Token | Size | Line Height | Use Case |
|-------|------|-------------|----------|
| `text-xs` | 12px | 16px | Captions, timestamps |
| `text-sm` | 14px | 20px | Secondary text, labels |
| `text-base` | 16px | 24px | Body text (minimum for readability) |
| `text-lg` | 18px | 28px | Emphasized body, card titles |
| `text-xl` | 20px | 28px | Section headers |
| `text-2xl` | 24px | 32px | Page section titles |
| `text-3xl` | 30px | 36px | Page titles |
| `text-4xl` | 36px | 40px | Hero headlines |

**Accessibility Requirements**:
- Body text never below 16px
- Interactive element labels never below 14px
- Line height minimum 1.5x font size for body text

#### 4.2.2 Color System

The Olera color palette prioritizes warmth and trust while maintaining professional credibility. Colors are derived from the existing brand identity.

**Primary Palette** (Olera Teal):

| Token | Use | Hex | Notes |
|-------|-----|-----|-------|
| `primary` | Primary actions, links, accents | `#0D9488` (teal-600) | Brand teal — 4.5:1 contrast on white |
| `primary-hover` | Hover state | `#0F766E` (teal-700) | Darker for affordance |
| `primary-light` | Backgrounds, badges, highlights | `#CCFBF1` (teal-100) | Subtle emphasis |
| `primary-50` | Very light backgrounds | `#F0FDFA` (teal-50) | Section backgrounds |

**Secondary Palette** (Neutral):

| Token | Use | Hex | Notes |
|-------|-----|-----|-------|
| `secondary` | Secondary actions, borders | `#6B7280` (gray-500) | Neutral, non-competing |
| `secondary-hover` | Hover state | `#4B5563` (gray-600) | — |
| `text-primary` | Primary text | `#111827` (gray-900) | High contrast |
| `text-secondary` | Secondary text | `#6B7280` (gray-500) | De-emphasized |
| `text-muted` | Muted/placeholder | `#9CA3AF` (gray-400) | Lowest emphasis |

**Semantic Colors**:

| Token | Use | Hex |
|-------|-----|-----|
| `success` | Confirmations, verified badges, completed | `#10B981` (emerald-500) |
| `warning` | Cautions, pending states | `#F59E0B` (amber-500) |
| `error` | Errors, destructive actions | `#EF4444` (red-500) |
| `info` | Informational messages | `#3B82F6` (blue-500) |

**Background Colors**:

| Token | Use | Hex |
|-------|-----|-----|
| `bg-white` | Primary background | `#FFFFFF` |
| `bg-gray-50` | Section alternation | `#F9FAFB` |
| `bg-gray-100` | Card backgrounds, inputs | `#F3F4F6` |

**Contrast Requirements**: All text/background combinations must meet WCAG AA (4.5:1 for normal text, 3:1 for large text and UI components).

#### 4.2.3 Spacing System

Uses a 4px base unit aligned with Tailwind's default scale. Maintain consistency with existing Olera patterns where effective.

| Token | Value | Common Use |
|-------|-------|------------|
| `space-1` | 4px | Tight inline spacing |
| `space-2` | 8px | Related element gaps, icon padding |
| `space-3` | 12px | Form field spacing |
| `space-4` | 16px | Standard padding, card gaps |
| `space-5` | 20px | Medium section padding |
| `space-6` | 24px | Card padding, section gaps |
| `space-8` | 32px | Section margins |
| `space-10` | 40px | Large section breaks |
| `space-12` | 48px | Major section breaks |
| `space-16` | 64px | Page section padding |

**Rule**: Never use arbitrary pixel values. All spacing uses tokens.

**Layout Patterns**:
- Card padding: `space-6` (24px)
- Form field gaps: `space-4` (16px)
- Section separation: `space-8` to `space-12` (32-48px)
- Page margins (mobile): `space-4` (16px)
- Page margins (desktop): `space-6` to `space-8` (24-32px)

#### 4.2.4 Iconography

**Primary Library**: Lucide Icons (standard in shadcn ecosystem)

**Icon Usage Rules**:
1. Icons always paired with text labels for primary actions
2. Icon-only buttons require `aria-label` and tooltip on hover
3. Consistent sizing:
   - 16px: Inline with text
   - 20px: Buttons, form elements
   - 24px: Navigation, card actions
4. Stroke width: 1.5px (default), 2px (emphasized)
5. Color: Inherit from text color or use semantic color

**Common Icons**:

| Action | Icon | Notes |
|--------|------|-------|
| Save/Favorite | Heart (outline/filled) | Toggle state |
| Search | Search (magnifying glass) | — |
| Location | MapPin | — |
| Phone | Phone | — |
| Email | Mail | — |
| Settings | Settings (gear) | — |
| Menu | Menu (hamburger) | Mobile nav |
| Close | X | Modals, dismissible |
| Back | ArrowLeft | Navigation |
| External link | ExternalLink | Opens new tab |
| Verified | CheckCircle or BadgeCheck | Trust indicator |

---

### 4.3 Component Library Standards

#### Base Layer: shadcn/ui

| Aspect | Standard |
|--------|----------|
| **Library** | shadcn/ui with Radix primitives |
| **Styling** | Tailwind CSS with CSS variables for theming |
| **Location** | `components/ui/` for base components |
| **Customization** | Extend via variants, never modify core components directly |

#### Application Layer

| Category | Location | Examples |
|----------|----------|----------|
| **Domain components** | `components/` | ProviderCard, FamilyProfile, EngagementCard |
| **Layout components** | `components/layout/` | PageHeader, Sidebar, ModeAwareNav |
| **Form components** | `components/forms/` | OnboardingWizard, ProfileEditor |

#### Component Documentation Standard

Each custom component should include:
```typescript
/**
 * @component ProviderCard
 * @description Displays provider summary for directory/search contexts
 * @see Chapter 9 (Provider Directory) for usage context
 * @see Chapter 7 (Provider Profiles) for data model
 */
```

#### Key Component Patterns

| Component | Pattern | Notes |
|-----------|---------|-------|
| **Buttons** | Primary (teal), Secondary (outline), Ghost, Destructive | Consistent sizing: sm, default, lg |
| **Cards** | White background, subtle shadow, rounded-lg | Consistent padding (space-6) |
| **Forms** | Label above input, error below, required indicator | 16px min input height on mobile |
| **Modals** | Centered, backdrop blur, focus trap | Max-width 640px |
| **Toasts** | Bottom-right, auto-dismiss (5s), action optional | Use sparingly |

---

### 4.4 Interaction Patterns

#### 4.4.1 Loading States

| Context | Pattern | Implementation |
|---------|---------|----------------|
| **Page load** | Skeleton screens | Match layout structure, pulse animation |
| **Action pending** | Button spinner | Replace button text with spinner, disable button |
| **Data fetch** | Inline skeleton | Replace content area only |
| **Background save** | Toast notification | "Saved" confirmation after completion |
| **Long operation** | Progress indicator | For multi-step processes |

**Rule**: Never use full-page spinners. Always show structural skeleton that matches the expected layout.

#### 4.4.2 Empty States

Every empty state must include:

| Element | Required | Notes |
|---------|----------|-------|
| **Illustration** | ✅ Yes (demo + production) | Custom illustrations showing the intended content |
| **Headline** | ✅ Yes | Clear, action-oriented (e.g., "No saved providers yet") |
| **Description** | ✅ Yes | Brief explanation of what would appear here |
| **Primary CTA** | ✅ Yes | Action to populate the empty state |

**Examples**:

| Context | Headline | CTA |
|---------|----------|-----|
| Saved Providers (empty) | "No saved providers yet" | "Browse providers" |
| Messages (empty) | "No conversations yet" | "Find providers" |
| Search no results | "No providers match your filters" | "Clear filters" or "Broaden search" |

#### 4.4.3 Error States

| Error Type | Pattern | Implementation |
|------------|---------|----------------|
| **Form validation** | Inline error below field | Red border, error icon, red text |
| **API error (recoverable)** | Toast notification | With retry action if applicable |
| **API error (blocking)** | Inline alert | Within the content area |
| **Page error** | Error boundary | Full-page with illustration, retry button |
| **Network error** | Offline indicator | Banner at top, retry when online |

**Error Message Guidelines**:
- Be specific: "Email is already registered" not "Invalid input"
- Offer solutions: "Try signing in instead" after duplicate email
- Never blame the user: "We couldn't process that" not "You entered it wrong"

#### 4.4.4 Transitions & Animation

| Animation | Duration | Easing | Use Case |
|-----------|----------|--------|----------|
| **Micro** | 150ms | ease-out | Button hover, focus rings, toggles |
| **Standard** | 200ms | ease-in-out | Modals opening, dropdowns, tooltips |
| **Complex** | 300ms | ease-in-out | Page transitions, accordions, carousels |
| **Emphasis** | 400ms | spring | Success celebrations, first-time tutorials |

**Animation Principles**:
1. **Purposeful**: Every animation should provide feedback or guide attention
2. **Subtle**: Animations enhance, never distract
3. **Performant**: Use CSS transforms and opacity; avoid layout-triggering properties
4. **Respectful**: Honor `prefers-reduced-motion` — all animations must have reduced-motion fallbacks

**Micro-interactions to Include**:
- Button press feedback (scale down slightly)
- Heart icon animation on save
- Progress bar animations
- Form field focus transitions
- Card hover lift effect

---

### 4.5 Quality Bar & Inspiration

#### Primary Inspiration

These applications represent our target quality bar for specific aspects:

| App | What to Learn |
|-----|---------------|
| **Airbnb** | Homepage hero design, search UX, photo galleries, trust badges, listing cards |
| **Zillow** | Directory filters, map integration, saved searches, property cards |
| **LinkedIn** | Profile completeness indicators, professional presentation, notification patterns |

#### Secondary Inspiration

| App | What to Learn |
|-----|---------------|
| **One Medical** | Clean healthcare UX, trust signals, appointment booking flows |
| **Headspace** | Warmth in digital health, calming aesthetics, onboarding |
| **Zocdoc** | Provider directory patterns, review presentation, booking confirmation |

#### Anti-Patterns to Avoid

| Pattern | Why | Instead |
|---------|-----|---------|
| **Cluttered dashboards** | Overwhelms users, especially older adults | Progressive disclosure, clear hierarchy |
| **Tiny text / low contrast** | Accessibility failure | 16px minimum, WCAG AA contrast |
| **Aggressive upsells** | Erodes trust in care context | Subtle upgrade prompts, value-first |
| **Dark patterns** | Unethical, damages brand | Honest UI, easy cancellation |
| **Infinite scroll without position** | Disorienting, hard to return | Pagination or "load more" with scroll position |
| **Auto-playing media** | Startling, accessibility issue | User-initiated only |

#### Quality Gate

Before any page ships, ask: **"Would this feel out of place in Airbnb or LinkedIn?"** If yes, iterate.

---

### 4.6 Accessibility in Design

Accessibility is a design requirement, not an audit afterthought.

#### Minimum Standards

| Requirement | Standard | Verification |
|-------------|----------|--------------|
| **Color contrast** | WCAG AA (4.5:1 text, 3:1 UI) | Automated tooling (axe, Lighthouse) |
| **Touch targets** | 44x44px minimum | Design review |
| **Focus indicators** | Visible on all interactive elements | Manual testing |
| **Text scaling** | Supports 200% zoom without horizontal scroll | Browser testing |
| **Screen reader** | All content accessible, logical reading order | VoiceOver/NVDA testing |
| **Keyboard navigation** | All actions reachable via keyboard | Tab through every flow |

#### Design Process Integration

| Phase | Accessibility Action |
|-------|---------------------|
| **Design** | Use accessible color palette, verify contrast, specify focus states |
| **Development** | Semantic HTML first, ARIA only when needed |
| **Review** | Automated a11y tests in CI (axe-core) |
| **QA** | Manual keyboard + screen reader testing for key flows |

#### Senior-Specific Considerations

| Consideration | Implementation |
|---------------|----------------|
| **Larger default text** | 16px minimum body, 14px minimum labels |
| **High contrast mode support** | Test with Windows High Contrast |
| **Clear tap targets** | Generous padding on buttons (44px+ height) |
| **Simple language** | Avoid jargon, use plain terms |
| **Forgiving inputs** | Phone number formatting, flexible date entry |
| **Confirmation before destructive actions** | "Are you sure?" for deletes |

> **Cross-Reference**: Chapter 37 (Accessibility Standards) covers compliance auditing and i18n. This section covers accessibility in the design process.

---

### 4.7 Responsive Design Guidelines

#### Breakpoints

| Name | Width | Primary Context |
|------|-------|-----------------|
| `mobile` | < 640px | Phones (portrait) |
| `sm` | ≥ 640px | Phones (landscape), small tablets |
| `md` | ≥ 768px | Tablets |
| `lg` | ≥ 1024px | Laptops, small desktops |
| `xl` | ≥ 1280px | Desktops |
| `2xl` | ≥ 1536px | Large monitors |

#### Mobile-First Rules

| Rule | Implementation |
|------|----------------|
| **Default styles are mobile** | Base CSS targets mobile; add complexity at breakpoints |
| **Touch-first interactions** | Hover states are enhancements, not requirements |
| **Thumb-zone navigation** | Primary actions in bottom 40% of viewport on mobile |
| **No horizontal scroll** | Content reflows; tables become cards on mobile |
| **Tap targets** | Minimum 44x44px with adequate spacing |

#### Layout Patterns by Page Type

| Page Type | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| **Homepage** | Stacked sections | 2-column where appropriate | Full hero, 3-column features |
| **Directory** | Single column cards, map toggle | 2-column grid | 3-column grid + map sidebar |
| **Provider Profile** | Stacked sections | 2-column (photo + info) | 2-column with sticky sidebar |
| **Dashboard** | Bottom tab navigation | Sidebar nav (collapsible) | Persistent sidebar |
| **Forms** | Full-width inputs | Constrained width (max 640px) | Constrained width, centered |
| **Settings** | Full-width list | 2-column (nav + content) | 2-column with sidebar |

#### Navigation Patterns

| Context | Mobile | Desktop |
|---------|--------|---------|
| **Primary nav** | Hamburger menu OR bottom tabs | Horizontal header nav |
| **Mode switcher** | In hamburger menu | Header dropdown |
| **Account menu** | In hamburger menu | Header dropdown |
| **Back navigation** | Top-left arrow + header title | Breadcrumbs |

---

### 4.8 Demo vs. Production Scope

| Aspect | Demo Scope | Production Scope |
|--------|------------|------------------|
| **Typography** | ✅ Final system | ✅ Same |
| **Colors** | ✅ Final Olera palette | ✅ Same |
| **Core components** | ✅ Polished, production-ready | ✅ Same |
| **Micro-interactions** | ✅ Full implementation | ✅ Same |
| **Custom illustrations** | ✅ For empty states, key moments | ✅ Expanded library |
| **Loading skeletons** | ✅ All pages | ✅ Same |
| **Error states** | ✅ Full implementation | ✅ Same |
| **Empty states** | ✅ With illustrations and CTAs | ✅ Same |
| **Dark mode** | ❌ Deferred | 🟡 If demand warrants |
| **Print styles** | ❌ Deferred | 🟡 For profiles, reports |
| **Admin UI polish** | 🟡 Functional, clear, not highly polished | ✅ Full polish |

**Demo Quality Standard**: The demo should feel like a clearly evolved, superior version of the current Olera site. Strong branding alignment, clean interaction patterns, smooth self-serve usability. No radical visual departures — improvements should feel natural and inevitable.

---

### Architectural Notes

**CSS Architecture**:
- Tailwind CSS as primary styling system
- CSS variables for theme tokens (colors, spacing)
- Component-scoped styles only when necessary
- No global style overrides outside of theme configuration

**Animation Library**: CSS transitions for simple animations; Framer Motion for complex sequences (optional, evaluate bundle impact).

**Image Handling**:
- Next/Image for automatic optimization
- Defined size presets for common use cases (avatar, card thumbnail, hero)
- WebP format with JPEG fallback
- Lazy loading below the fold

**Font Loading**:
- `font-display: swap` for web fonts
- Preload critical fonts in document head
- System font stack as fallback

---

## Chapter 6: Family Care Profiles

**Purpose**: Allow families to describe their care needs and preferences to help match with providers.

| Item | Status | Notes |
|------|--------|-------|
| 6.1 Care Profile Creation | ✅ | `/dashboard/care-profiles` |
| 6.2 Loved One Info (name, age, relationship) | ✅ | Fields in `FamilyProfile` |
| 6.3 Care Needs Assessment (care level, conditions, mobility) | ✅ | Multiple fields exist |
| 6.4 Personality & Preferences | ✅ | Extensive fields |
| 6.5 Location & Contact Preferences | ✅ | Fields exist |
| 6.6 Budget & Timeline | ✅ | Fields exist |
| 6.7 Privacy/Visibility Settings | ✅ | `profileVisibility`, etc. |
| 6.8 Profile Completion Tracking | 🟡 | May exist but unclear |
| 6.9 Multiple Care Profiles per Account | 🟡 | Schema supports single profile per user currently |

### Key Questions
- [x] Should families be able to create multiple care profiles (e.g., for different family members)?
- [x] Which fields are truly required vs optional? → **See Foundational Decisions: Two-Threshold Model**
- [x] How does profile completion affect matching/visibility? → **See Foundational Decisions: Two-Threshold Model**

### Architectural Notes

#### 6.1 Care Profile Location (DECIDED)

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

#### 6.2–6.7 Profile Field Categories (DECIDED)

Current field structure accepted as-is for demo:

| Category | Status | Notes |
|----------|--------|-------|
| 6.2 Loved One Info | ✅ Accept | Name, age, relationship, gender |
| 6.3 Care Needs | ✅ Accept | Care level, conditions, mobility |
| 6.4 Personality & Preferences | ✅ Accept | Hobbies, communication style |
| 6.5 Location & Contact | ✅ Accept | Address, contact preferences |
| 6.6 Budget & Timeline | ✅ Accept | Budget range, urgency |
| 6.7 Visibility | ✅ Accept | Visible to providers toggle |

**Required for visibility** (per Two-Threshold Model): Name, location, care type needed.

**All other fields**: Optional, improve matching quality.

#### 6.8 Profile Completion Tracking (DECIDED)

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

#### 6.9 Multiple Care Profiles (DECIDED)

> **Cross-Reference**: See Chapter 39 (Legal Framework) for data retention periods (39.3.1), data export requirements (39.3.2), and CCPA privacy rights.

**Demo**: Single care profile per account.

**Post-demo**: Support multiple profiles if user research confirms need.

| Phase | Behavior |
|-------|----------|
| Demo | One `FamilyProfile` per user |
| Future | Multiple profiles with separate visibility toggles |

**Rationale**: Single profile simplifies matching, UI, and data model. Multi-profile can be added later without breaking changes.

> **Cross-Reference**: See Chapter 39 (Legal Framework) Section 39.1.8 for No-PHI warning prompts. Profiles must NOT collect sensitive medical information.

**Future implementation notes** (if needed):
- Dashboard shows list of profiles with "Add another loved one"
- Each profile has independent visibility toggle
- Matching considers all visible profiles

---

## Chapter 7: Provider Profiles

**Purpose**: Allow care providers to describe their services, qualifications, and offerings.

| Item | Status | Notes |
|------|--------|-------|
| 7.1 Provider Model (basic info) | ✅ | Extensive `Provider` model |
| 7.2 Provider Types | ✅ | HOME_CARE, ASSISTED_LIVING, MEMORY_CARE, NURSING_HOME, HOSPICE, REHABILITATION, INDEPENDENT_CAREGIVER |
| 7.3 Services Offered | ✅ | `careTypesOffered`, detailed service arrays |
| 7.4 Location & Service Area | ✅ | address, city, state, zip, serviceRadius |
| 7.5 Photos & Media | ✅ | photos array, coverPhoto |
| 7.6 Licensing & Certifications | ✅ | Fields exist |
| 7.7 Pricing Information | ✅ | Extensive pricing fields |
| 7.8 Staff Information | ✅ | Ratios, credentials, training |
| 7.9 Amenities & Features | ✅ | Multiple arrays |
| 7.10 Specialty Programs | ✅ | Memory care, hospice, etc. |
| 7.11 About / Team / Virtual Tour | ✅ | teamMembersJson, virtualTourUrl |
| 7.12 Claimed vs Unclaimed Status | ✅ | `claimed` boolean |
| 7.13 Profile Completion Tracking | 🟡 | `/api/dashboard/profile-completion` exists |
| 7.14 Primary Care Type | ⬜ | Required field for canonical URL |
| 7.15 "Looking for Work?" Section | ⬜ | Job seeker entry on provider pages |

### Key Questions
- [x] Which fields should be required vs optional per provider type? → **See Two-Threshold Model + below**
- [x] How should unclaimed profiles differ in display/editing? → **See 7.12 Three-Tier Model**
- [x] What is the minimum viable profile for each provider type? → **See Two-Threshold Model**

### Architectural Notes

#### 7.1 Provider Profile Location (DECIDED)

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

#### 7.2 & 7.14 Provider Types and Type-Specific Fields (DECIDED)

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

#### 7.3–7.11 Profile Field Categories (DECIDED)

Current field structure accepted as-is for demo:

| Category | Status | Notes |
|----------|--------|-------|
| 7.3 Services Offered | ✅ Accept | `careTypesOffered`, service arrays |
| 7.4 Location & Service Area | ✅ Accept | Address, zip, serviceRadius |
| 7.5 Photos & Media | ✅ Accept | photos array, coverPhoto |
| 7.6 Licensing & Certifications | ✅ Accept | Fields exist |
| 7.7 Pricing Information | ✅ Accept | Extensive pricing fields |
| 7.8 Staff Information | ✅ Accept | Ratios, credentials, training |
| 7.9 Amenities & Features | ✅ Accept | Multiple arrays |
| 7.10 Specialty Programs | ✅ Accept | Memory care, hospice, etc. |
| 7.11 About / Team / Virtual Tour | ✅ Accept | teamMembersJson, virtualTourUrl |

**Required for visibility** (per Two-Threshold Model):
- Organization: Org name, location, provider type
- Individual Caregiver: Full name, location, services offered

**All other fields**: Optional, improve matching quality.

> **Cross-Reference**: See Chapter 39 (Legal Framework) for Terms of Service requirements (39.1.4), Provider liability language (39.2.1), and No-PHI warning implementation (39.1.8).

#### 7.12 Claimed vs Unclaimed Status (DECIDED)

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

#### 7.13 Provider Profile Completion Tracking (DECIDED)

**Storage**: `Provider.completionPercentage` field in DB (not calculated on-the-fly).

**Calculation**: Recalculate on profile save.

**Display**: Progress bar/indicator in Provider Dashboard.

**Nudging**: "Complete your profile" prompt if below visibility threshold.

**Note**: Completion weights similar to family profiles — visibility threshold fields ≈ 40%, additional fields improve matching. Exact weights can be tuned later.

#### 7.14 Primary Care Type Requirement (DECIDED)

**Purpose**: Every provider MUST have a primary care type that determines their canonical URL and primary directory placement.

**Field**: `Provider.primaryCareType` (required, single value)

| Attribute | Specification |
|-----------|---------------|
| **Required** | Yes, for all providers |
| **Type** | Single enum value from care type taxonomy |
| **Set During** | Onboarding wizard (required step) |
| **Editable** | Yes, via provider profile settings |

**Valid Primary Care Types**:
- HOME_CARE
- HOME_HEALTH
- ASSISTED_LIVING
- INDEPENDENT_LIVING
- MEMORY_CARE
- NURSING_HOME
- ADULT_DAY_CARE
- REHAB
- HOSPICE

**URL Determination**:
- Primary care type determines the canonical URL path
- Example: Provider with `primaryCareType: ASSISTED_LIVING` → `/assisted-living/texas/austin/provider-name/`

**Directory Visibility**:
- Provider appears in ALL directories for care types they offer (via `careTypesOffered` array)
- Primary care type determines where the canonical link points
- Example: A provider with primary type "Assisted Living" offering Memory Care appears in:
  - `/assisted-living/texas/austin/` (canonical URL)
  - `/memory-care/texas/austin/` (also appears, links to canonical)

**Cross-Reference**: See Chapter 28: Marketing & SEO Pages for URL architecture details.

#### 7.15 "Looking for Work?" Section — Job Seeker Entry (DECIDED)

**Purpose**: Provider profile pages can optionally include a section for caregiver job seekers when the provider is actively hiring.

**Visibility Condition**: Section appears when `Provider.activelyHiring === true`

**Section Content**:

| Element | Content |
|---------|---------|
| **Header** | "Looking for Work?" or "Join Our Team" |
| **Subtext** | "We're looking for qualified caregivers" |
| **CTA Button** | "Apply to Work Here" |
| **Benefits List** | Optional: pay range, benefits if specified |

**Placement**: Below main provider information, above reviews section.

**CTA Behavior**:
- If not logged in → Routes to `/caregiver-jobs/` with provider context
- If logged in (not caregiver) → Routes to caregiver onboarding with provider context
- If logged in (caregiver) → Creates application engagement with provider

**Provider Control**:
- Toggle: "Actively Hiring" in provider dashboard settings
- Optional fields: Positions available, pay range, benefits offered

**Cross-Reference**:
- See Chapter 3: Onboarding for caregiver job seeker flow
- See Chapter 28: Marketing & SEO Pages for `/caregiver-jobs/` landing page

---

## Chapter 8: Provider Identity & Gating

**Purpose**: Control access to provider features based on profile existence and subscription status.

| Item | Status | Notes |
|------|--------|-------|
| 8.1 ProviderIdentity Model | ❌ Remove | Redundant, simplify to Provider existence |
| 8.2 Identity Type (ORGANIZATION vs INDIVIDUAL) | ✅ | Use `Provider.providerType` instead |
| 8.3 Onboarding Complete Flag | ❌ Remove | Use profile completion % instead |
| 8.4 Linking to Provider Profile | ✅ | Direct User → Provider relationship |
| 8.5 Feature Gating Logic | 🟡 | Needs implementation per three-tier model |

### Key Questions
- [x] What features are gated behind ProviderIdentity? → **See three-tier model in 7.12**
- [x] Is this model necessary, or can gating be simplified? → **Remove ProviderIdentity, use Provider + subscription**
- [x] How does this interact with mode system? → **Mode controls nav, gating controls actions**

### Architectural Notes

#### 8.1 Remove ProviderIdentity Model (DECIDED)

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

#### 8.2 Provider Type Determination (DECIDED)

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

#### 8.3 Three-Tier Gating Logic (DECIDED)

**Cross-reference**: See Chapter 7.12 for full permissions matrix.

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

#### 8.4 Feature Gating Implementation (DECIDED)

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

#### 8.5 Mode vs Gating Separation (DECIDED)

| Concept | What It Controls |
|---------|------------------|
| **Mode** (FAMILY/PROVIDER) | Which nav items appear, which landing page |
| **Gating** (tier) | What actions are allowed within provider mode |

**Key principle**: Mode switch is always instant and free. Gating applies to specific actions within provider mode.

**Cross-reference**:
- Mode system details in Chapter 2
- Subscription tiers in Chapter 18

---

## Chapter 9: Provider Directory & Search

**Purpose**: Public-facing directory for families to discover and search for care providers.

**Cross-reference**: See Foundational Decisions → **Homepage vs Directory Architecture** for the relationship between homepage and `/providers`.

| Item | Status | Notes |
|------|--------|-------|
| 9.1 Provider Listing Page | ✅ | `/providers` (currently redirects to `/`, will be separate) |
| 9.2 Location-Based Search | ✅ | City/state for demo; zip+radius deferred |
| 9.3 Filter by Provider Type | ✅ | All provider types in dropdown |
| 9.4 Filter by Services/Specialties | ✅ | Care type dropdown exists |
| 9.5 Filter by Price Range | ✅ | Price slider (0–15000) |
| 9.6 Sort Options | ✅ | Sort dropdown exists |
| 9.7 Provider Cards | ✅ | `EnhancedProviderCard` component |
| 9.8 Provider Detail Page | ✅ | `/providers/[id]` with full sections |
| 9.9 Map View | ✅ | Leaflet integration, list/map toggle |
| 9.10 "Near Me" Geolocation | ❌ | Deferred for demo |
| 9.11 City/State SEO Pages | ❌ | Deferred for demo |
| 9.12 Search Results Caching | ❌ | Deferred for demo |

### Key Questions
- [x] What filters are most important for demo? → **See Foundational Decisions: Standardized Filter Set**
- [x] Is map view needed for demo? → **Yes, if stable; otherwise defer**
- [x] SEO pages priority? → **Deferred for demo**

### Architectural Notes

#### 9.1 Directory Location (DECIDED)

`/providers` is the dedicated provider directory page (Zillow-style).

**Current state**: `/providers` redirects to `/` (homepage). This will be refactored so:
- Homepage (`/`) = Marketing landing (Airbnb-style)
- Directory (`/providers`) = Full search experience (Zillow-style)

**Cross-reference**: See Foundational Decisions → Homepage vs Directory Architecture.

#### 9.2 Location Search (DECIDED)

| Feature | Demo | Post-Demo |
|---------|------|-----------|
| City search | ✅ | ✅ |
| State search | ✅ | ✅ |
| Zip code search | ❌ Deferred | ✅ |
| Radius filtering | ❌ Deferred | ✅ |

#### 9.3–9.6 Filters and Sort (DECIDED)

All current filters accepted for demo:
- Provider type dropdown
- Care type dropdown
- Price range slider
- Rating filter
- Sort options (newest, etc.)

**Cross-reference**: See Foundational Decisions → Standardized Filter Set for full list.

#### 9.7 Provider Cards (DECIDED)

`EnhancedProviderCard` component displays:
- Cover photo
- Provider name and type
- Location
- Rating and review count
- Price range
- Badges (verified, licensed, etc.)
- Specialty indicators (memory care, hospice, etc.)

**Additional requirement**: Cards for unclaimed providers should show "Unclaimed" badge per Chapter 7.12.

#### 9.8 Provider Detail Page (DECIDED)

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

#### 9.9 Map View (DECIDED)

Leaflet map integration exists with list/map toggle.

**Demo scope**: Include if stable. If buggy, hide toggle and defer.

**Post-demo**: Full interactive map with clustering, hover previews.

#### 9.10–9.12 Deferred Items (DECIDED)

| Item | Reason for Deferral |
|------|---------------------|
| 9.10 Geolocation | Adds complexity (permissions, accuracy); city/state sufficient |
| 9.11 SEO Pages | Not needed for demo functionality; important for organic traffic post-launch |
| 9.12 Caching | Performance optimization; only needed at scale |

---

## Chapter 10: Provider Claiming (Organizations Only)

**Purpose**: Allow organizations to claim their pre-seeded directory profiles and gain edit access.

**Important**: Only organizations have unclaimed profiles. Families and individual caregivers never have unclaimed profiles — they create profiles directly.

**Cross-reference**: See Chapter 7.12 for three-tier provider access model (Unclaimed → Claimed → Subscribed).

| Item | Status | Notes |
|------|--------|-------|
| 10.1 Claim Request Submission | 🟡 | Placeholder exists, workflow not implemented |
| 10.2 Verification Methods | ⬜ | Not implemented |
| 10.3 Admin Review Queue | ⬜ | Not implemented |
| 10.4 Claimed → Editable Transition | 🟡 | `claimed` field exists, logic needed |
| 10.5 Claim Notifications | ⬜ | Not implemented |
| 10.6 Rejection Handling | ⬜ | Not implemented |

### Key Questions
- [x] What verification methods should be supported? → **See 10.2 below**
- [x] What information can unclaimed profiles display? → **See Chapter 7.12**
- [x] Admin review workflow requirements? → **See 10.3 below**

### Architectural Notes

#### 10.1 Claim Request Submission (DECIDED)

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

#### 10.2 Verification Methods (DECIDED)

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

#### 10.3 Admin Review Queue (DECIDED)

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

#### 10.4 Claimed → Editable Transition (DECIDED)

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

#### 10.5 Claim Notifications (DECIDED)

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

#### 10.6 Rejection & Appeal Handling (DECIDED)

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

## Chapter 12: Family Dashboard

**Purpose**: Central hub for families to manage their care search activities.

**Cross-reference**: See Foundational Decisions → Route Architecture for navigation structure.

| Item | Status | Notes |
|------|--------|-------|
| 12.1 Dashboard Home | ✅ | `/family/dashboard` (renamed from `/dashboard`) |
| 12.2 My Providers (engagements) | ✅ | `/family/my-providers` (renamed from `/dashboard/requests`) |
| 12.3 Engagement Detail + Messaging | ✅ | `/family/my-providers/[id]` |
| 12.4 Saved Providers | ✅ | `/family/saved-providers` (renamed from `/dashboard/saved`) |
| 12.5 Care Profile Management | ✅ | Tab within `/family/dashboard` (consolidated) |
| 12.6 Activity Feed | 🟡 | API exists, needs all engagement types |
| 12.7 Dashboard Stats/Summary | 🟡 | API exists |
| 12.8 Profile Completion Prompts | 🟡 | Needs implementation |
| 12.9 Calendar & Quick Actions | 🟡 | Calendar should be primary element |

### Key Questions
- [x] What should the dashboard home prioritize? → **Calendar first, then profile completion, activity feed, quick actions**
- [x] Activity feed requirements? → **All engagement types: interviews, consultations, tours, requests**

### Architectural Notes

#### 12.1 Dashboard Home Structure (DECIDED)

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

#### 12.2–12.3 My Providers — Unified Engagement System (DECIDED)

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

#### 12.4 Saved Providers (DECIDED)

**Route**: `/family/saved-providers` (renamed from `/dashboard/saved`)

**Features**:
- Grid/list view of saved providers
- Remove from saved action
- Click through to provider detail
- Supports both organizations and individual caregivers

#### 12.5 Care Profile Management (DECIDED)

**Location**: Tab within `/family/dashboard` (not separate page)

**Implementation**: Consolidate `/dashboard/care-profiles` into dashboard tab.

**Cross-reference**: See Chapter 6 for care profile fields and completion tracking.

#### 12.6 Activity Feed (DECIDED)

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

#### 12.7 Dashboard Stats (DECIDED)

**Stats to Display**:

| Stat | Description |
|------|-------------|
| Active Engagements | Ongoing conversations/requests |
| Scheduled | Upcoming tours, consultations, interviews |
| Saved Providers | Count of bookmarked providers |
| Messages | Unread message count |

**Terminology**: Using "Engagements" rather than "Requests" in stats where appropriate. May revisit overall terminology post-demo.

#### 12.8 Profile Completion Prompts (DECIDED)

| Profile State | Display |
|---------------|---------|
| Below visibility threshold | Prominent banner: "Complete your profile to be discovered by providers" |
| Above threshold, incomplete | Subtle progress indicator: "Your profile is X% complete" |
| Complete (100%) | No prompt, or celebratory badge |

**Cross-reference**: See Foundational Decisions → Two-Threshold Model.

#### 12.9 Calendar as Primary Element (DECIDED)

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

## Chapter 13: Provider Dashboard

**Purpose**: Central hub for providers to manage inquiries, engagements, and their profile.

**Cross-reference**: See Foundational Decisions → Route Architecture for navigation structure.

**Important**: All pages are explicit and separate — no dynamic/conditional dashboards that mirror each other. Each user type has dedicated pages for their specific workflows.

| Item | Status | Notes |
|------|--------|-------|
| 13.1 Dashboard Home | ✅ | `/provider/dashboard` |
| 13.2 My Families (engagements) | ✅ | `/provider/my-families` (renamed) |
| 13.3 Engagement Detail + Messaging | ✅ | `/provider/my-families/[id]` |
| 13.4 Saved Families | ✅ | `/provider/saved-families` (renamed) |
| 13.5 Hiring: Find Caregivers | 🟡 | `/provider/find-caregivers` (org providers only) |
| 13.6 Hiring: My Candidates | 🟡 | `/provider/my-candidates` (org providers only) |
| 13.7 Profile Completion Tracking | 🟡 | Widget in dashboard |
| 13.8 Calendar (Scheduled Appointments) | 🟡 | Primary dashboard element |
| 13.9 Provider Profile Edit | 🟡 | Tab within dashboard |

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

#### 13.1 Dashboard Home Structure (DECIDED)

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

#### 13.2–13.3 My Families — Bidirectional Engagement (DECIDED)

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

#### 13.4 Saved Families (DECIDED)

**Route**: `/provider/saved-families` (renamed from `/provider/saved`)

**Purpose**: Families the provider has bookmarked.

**Note**: Only families with visibility enabled appear in browse/save.

#### 13.5–13.6 Hiring System — Simplified Model (DECIDED)

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

**Navigation Display**: Hiring tabs in the account dropdown vary by provider type (per Chapter 5 rendering model):

| Provider Type | Hiring Tabs |
|---------------|-------------|
| Unknown (no profile) | "Hire Care Staff", "Become a Caregiver" (onboarding paths) |
| Organization | "Hire Care Staff", "My Candidates" |
| Individual Caregiver | "Hiring Organizations", "My Job Opportunities" |

> **Cross-Reference**: See Chapter 5.4 for complete dropdown specifications. The hiring section is the only part of navigation that varies by user state.

#### 13.7 Profile Completion Tracking (DECIDED)

Same pattern as Family Dashboard:
- Progress bar widget
- CTA if below visibility threshold
- Cross-reference: Chapter 7.13

#### 13.8 Calendar as Primary Element (DECIDED)

**Engagement Type Visual Distinction**:

| Type | Color | System |
|------|-------|--------|
| Tour | Blue | Care-Seeking |
| Consultation | Green | Care-Seeking |
| Interview (with family) | Purple | Care-Seeking |
| Hiring Interview | Orange | Hiring |

**Features**: Same as Family Dashboard (week view, click to detail, type colors).

#### 13.9 Provider Profile Edit (DECIDED)

**Location**: Tab within `/provider/dashboard`

**Cross-reference**: See Chapter 7 for provider profile fields.

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

## Chapter 15: Engagements

**Purpose**: The unified system for all interactions between parties — covering care-seeking (Family ↔ Provider) and hiring (Org ↔ Caregiver).

**Cross-reference**:
- Chapter 12 (Family Dashboard) and Chapter 13 (Provider Dashboard) for engagement views
- Chapter 16 for messaging within engagements
- Chapter 17 for scheduling within engagements

| Item | Status | Notes |
|------|--------|-------|
| 15.1 Engagement Creation | ✅ | Bidirectional (any party can initiate) |
| 15.2 Engagement Types | 🟡 | Expand beyond CONSULTATION/HIRING |
| 15.3 Engagement Status Workflow | ✅ | PENDING → ACCEPTED → ACTIVE → COMPLETED |
| 15.4 Engagement Context/Reason | ✅ | Aligned with types |
| 15.5 Contact Preferences & Video | 🟡 | Phone/Email/Video |
| 15.6 Engagement Listing | ✅ | Bidirectional views per user type |
| 15.7 Engagement Expiration | ⬜ | Deferred for demo |
| 15.8 Systems Separation | 🟡 | Separate models for Care-Seeking vs Hiring |

### Key Questions
- [x] Are all request statuses being used correctly? → **Yes, added ACTIVE state**
- [x] Request expiration rules? → **Deferred for demo, documented for production**

### Architectural Notes

#### 15.1 Engagement Creation — Bidirectional (DECIDED)

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

#### 15.2 Engagement Types (DECIDED)

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

#### 15.3 Engagement Status Workflow (DECIDED)

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

#### 15.3.1 Contact Information Release (DECIDED)

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

#### 15.4 Engagement Context/Reason (DECIDED)

`contactReason` field aligned with engagement types:

| Type | Relevant Reasons |
|------|------------------|
| TOUR | Schedule tour, Reschedule tour |
| CONSULTATION | Request pricing, Discuss services, Placement assistance |
| INTERVIEW | Schedule interview, Discuss availability |
| INQUIRY | Ask a question, Request information |
| OUTREACH | Share availability, Follow up |

#### 15.5 Contact Preferences & Video Calling (DECIDED)

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

#### 15.5.1 Calendar Integration (DECIDED)

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

#### 15.6 Engagement Listing — Bidirectional Views (DECIDED)

**Cross-reference**: Already documented in Chapters 9 & 10.

| User | Page | Shows |
|------|------|-------|
| Family | My Providers | All engagements with providers (inbound + outbound) |
| Provider | My Families | All engagements with families (inbound + outbound) |
| Org Provider | My Candidates | All hiring engagements (inbound + outbound) |
| Individual Caregiver | My Opportunities | All hiring engagements (inbound + outbound) |

#### 15.7 Engagement Expiration (DECIDED)

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

#### 15.8 Engagement Systems Separation (DECIDED)

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

## Chapter 16: Messaging System

**Purpose**: Enable communication within engagements between families, providers, and caregivers.

**Cross-reference**:
- Chapter 15 (Engagements) for engagement context
- Chapter 19 (Notifications) for message notification integration

| Item | Status | Notes |
|------|--------|-------|
| 16.1 Messages Within Engagements | ✅ | `Message` model, API exists |
| 16.2 Read/Unread Status | ✅ | `status` field (SENT/DELIVERED/READ), timestamps |
| 16.3 Typing Indicators | ❌ | Deferred — requires real-time to be useful |
| 16.4 File Attachments | ✅ | `attachments` JSON field, basic support for demo |
| 16.5 Real-time Updates | 🟡 | Polling for demo, WebSocket for production |
| 16.6 Message Notifications | 🟡 | In-app for demo, email digest optional |

### Key Questions
- [x] Is polling acceptable for demo, or do we need real-time? → **Polling acceptable for demo**
- [x] File attachments needed for demo? → **Yes, basic file sharing included**

### Architectural Notes

#### 16.1 Messages Within Engagements (DECIDED)

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

#### 16.2 Read/Unread Status (DECIDED)

**Current implementation accepted.**

| Status | Meaning | Trigger |
|--------|---------|---------|
| `SENT` | Message created | On send |
| `DELIVERED` | Recipient's client received | On fetch (polling) |
| `READ` | Recipient viewed message | On view in UI |

**Visual indicators**:
- Unread messages highlighted in thread
- Read receipts shown to sender (simple indicator for demo, checkmarks for production)

#### 16.3 Typing Indicators (DECIDED)

**Status**: ❌ Deferred for demo.

**What they are**: Visual feedback ("John is typing...") when the other person is composing a message.

**Why deferred**: Requires real-time communication (WebSocket) to feel natural. With polling, typing indicators become stale and create poor UX (persistent "typing..." after person stopped).

**Production**: Implement alongside WebSocket messaging.

#### 16.4 File Attachments (DECIDED)

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

#### 16.5 Real-time Updates (DECIDED)

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

#### 16.6 Message Notifications (DECIDED)

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

#### 16.7 Message UI/UX (DECIDED)

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

## Chapter 17: Multi-Context Scheduling

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
| 17.1 Scheduling Model | ✅ | Integrated into `Engagement` / `HiringEngagement` models |
| 17.2 Context-Aware CTAs & Language | ⬜ | CTA text varies by provider type |
| 17.3 Propose Appointment | 🟡 | Via engagement creation with `scheduledAt` |
| 17.4 Accept / Decline Flow | 🟡 | Part of engagement status workflow |
| 17.5 Reschedule Flow | ⬜ | Update `scheduledAt`, notify other party |
| 17.6 Cancellation Flow | 🟡 | Set status to CANCELLED |
| 17.7 Email Reminders | ⬜ | **Demo-critical**: 24h + 1h before |
| 17.8 SMS Reminders | ⬜ | **Demo-critical**: 24h + 1h before via Twilio |
| 17.9 Calendar Integration | ⬜ | Opt-out default, both parties receive invites |
| 17.10 Video Call vs In-Person | ⬜ | `meetingType` field, clear UX distinction |

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

#### 17.1 Scheduling Model — INTEGRATED (DECIDED)

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

#### 17.2 Context-Aware CTAs & Language (DECIDED)

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

#### 17.7 Email Reminders (DECIDED — Demo-Critical)

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

#### 17.8 SMS Reminders (DECIDED — Demo-Critical)

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

#### 17.9 Calendar Integration (DECIDED)

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

#### 17.10 Video Call vs In-Person UX (DECIDED)

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

## Chapter 18: Saved / Favorites

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

## Chapter 22: Reviews & Ratings

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
| 22.1 Olera Score (Unified) | 🟡 | Master score aggregating all signals |
| 22.2 Review Model (Care-Seeking) | ✅ | `Review` model exists, needs expansion |
| 22.3 Review Model (Hiring) | ⬜ | `HiringReview` model needed |
| 22.4 Two-Sided Reviews | ⬜ | Family ↔ Provider, Org ↔ Caregiver |
| 22.5 Blind Review Window | ⬜ | 14-day window, reveals when both submit |
| 22.6 Interaction-Based Reviews | ⬜ | Tours, consults, interviews, ongoing care |
| 22.7 Multi-Channel Collection | ⬜ | Platform prompts, QR, links, phone |
| 22.8 Review Trigger Logic | ⬜ | "Did this happen?" confirmation flow |
| 22.9 Prompt Cadence | ⬜ | Multiple reminders, quarterly for ongoing |
| 22.10 Direct Provider Page Reviews | ⬜ | Public entry point with structured intake |
| 22.11 Structured Feedback Sessions | ⬜ | Post-demo: scheduled feedback calls |
| 22.12 Review Display & Trust Signals | 🟡 | Components exist, need refinement |
| 22.13 Provider Response to Reviews | ⬜ | One public response allowed |
| 22.14 Review Moderation | 🟡 | `approved` field exists |
| 22.15 Helpful Votes | ✅ | `helpfulCount` field, API exists |

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

#### 22.1 Olera Score — Unified Master Score (DECIDED)

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

#### 22.2-22.4 Two-Sided Review System (DECIDED)

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

#### 22.5 Blind Review Window (DECIDED)

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

#### 22.6 Interaction-Based Reviews (DECIDED)

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

#### 22.7 Multi-Channel Review Collection (DECIDED)

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

#### 22.8 Review Trigger Logic (DECIDED)

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

#### 22.9 Prompt Cadence (DECIDED)

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

#### 22.10 Direct Provider Page Reviews (DECIDED)

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

#### 22.11 Structured Feedback Sessions (Post-Demo)

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

#### 22.12 Review Display & Trust Signals (DECIDED)

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

#### 22.13 Provider Response to Reviews (DECIDED)

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

#### 22.14 Review Moderation (DECIDED)

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

## Chapter 19: Notifications

**Purpose**: Keep users informed of all relevant activity and updates through a unified, multi-channel notification system.

### Core Principles (DECIDED)

| Principle | Decision |
|-----------|----------|
| **Activity Feed = Canonical Log** | All notifications appear in the Activity feed on the dashboard. Single source of truth. |
| **All Notifications Are Critical** | No priority tiers. Every notification is actionable or important. |
| **SMS First-Class Channel** | SMS enabled for ALL notification types by default, not just reminders. |
| **Individual Delivery** | Notifications sent individually, not batched into digests. |
| **Centralized Preferences** | Settings page controls all notification preferences. Not inline or in modals. |

> **Cross-Reference**: See Chapter 39 (Legal Framework) Section 39.1.6 for CAN-SPAM compliance (email) and TCPA compliance (SMS). All marketing emails must include unsubscribe links, and SMS requires explicit opt-in consent.

### Features

| Item | Status | Notes |
|------|--------|-------|
| 19.1 Activity Feed (Unified) | 🟡 | Canonical notification log on dashboard |
| 19.2 In-App Notification Count | ✅ | `/api/notifications/unread-count` |
| 19.3 Mark Notifications Viewed | ✅ | `/api/notifications/mark-viewed` |
| 19.4 Notification List UI | 🟡 | Needs verification |
| 19.5 Notification Types | ⬜ | Comprehensive list below |
| 19.6 Email Notifications | ⬜ | All types, individual delivery |
| 19.7 SMS Notifications | ⬜ | All types, first-class channel |
| 19.8 Notification Preferences | ⬜ | Centralized in Settings |
| 19.9 Quiet Hours | ⬜ | Default business hours M-F |
| 19.10 Push Notifications | ⬜ | Planned for production |

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

#### 19.1 Activity Feed — Unified Notification Log (DECIDED)

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

#### 19.5 Notification Types — Comprehensive List (DECIDED)

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

#### 19.6-19.7 Email & SMS — All Types, Individual Delivery (DECIDED)

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

#### 19.8 Notification Preferences — Centralized in Settings (DECIDED)

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

#### 19.9 Quiet Hours (DECIDED)

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

#### 19.10 Push Notifications — Planned for Production (DECIDED)

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

## Chapter 11: Profile Completion & Matching

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
| 11.1 Profile Completion % (All Types) | 🟡 | Needs explicit storage |
| 11.2 Completion Storage | ⬜ | Store in DB for matching |
| 11.3 "Complete Your Profile" Prompts | 🟡 | May exist, needs verification |
| 11.4 Match Scoring Algorithm | ⬜ | Rule-based, weighted |
| 11.5 Match Score Display | ⬜ | Percentage or qualitative |
| 11.6 "Best Matches" - Family → Provider | ⬜ | Dashboard recommendations |
| 11.7 "Best Matches" - Provider → Family | ⬜ | Dashboard recommendations |
| 11.8 "Best Matches" - Org → Caregiver | ⬜ | Hiring recommendations |
| 11.9 "Best Matches" - Caregiver → Org | ⬜ | Opportunity recommendations |
| 11.10 Olera Score Integration | ⬜ | Factors into match ranking |

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

#### 11.1-11.2 Profile Completion — Stored Explicitly (DECIDED)

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

#### 11.4 Match Scoring Algorithm (DECIDED)

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

#### 11.5 Match Score Display (DECIDED)

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

#### 11.3 "Complete Your Profile" Prompts (DECIDED)

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

#### 11.6-11.9 "Best Matches" Recommendations (DECIDED)

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

#### 11.10 Olera Score Integration (DECIDED)

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

## Chapter 21: Subscriptions & Paywalls

**Purpose**: Simple, action-gated monetization where providers pay to engage, not to browse.

### Core Principle (DECIDED)

> **Families are always free. Providers pay to engage.**
>
> The paywall sits at the engagement layer. Everything is visible (profiles, marketplaces, inbound activity). The paywall only appears when a provider tries to take action.

> **Cross-Reference**: See Chapter 39 (Legal Framework) Section 39.3.4 for subscription terms including auto-renewal disclosures, cancellation rights, and refund policies. Subscription checkout must include prominent terms acceptance.

> **Cross-Reference**: See Chapter 38 (Third-Party Services & Integrations) Section 38.1.4 for Stripe service configuration and environment variable requirements.

### Provider States

| State | Who | Can Become Active? |
|-------|-----|-------------------|
| **Unclaimed** | No one controls listing | ❌ No account to pay with |
| **Claimed (Non-Active)** | Provider has account | ✅ Yes |
| **Claimed (Active)** | Provider has paid membership | ✅ Already is |

### Features

| Item | Status | Notes |
|------|--------|-------|
| 21.1 Membership Model | ⬜ | Two-tier: Non-Active (free) vs Active (paid) |
| 21.2 Pricing | ⬜ | $25/mo or $240/year ($20/mo) |
| 21.3 Paywall UI | 🟡 | Exists, needs update for new model |
| 21.4 Paywall Triggers | ⬜ | Engagement actions only |
| 21.5 "Active" Badge | ⬜ | Subtle indicator on provider cards |
| 21.6 Unclaimed Provider UX | ⬜ | Clear messaging for families |
| 21.7 Stripe Integration | ⬜ | Production only |
| 21.8 Mock Membership (Demo) | ⬜ | Admin toggle for demo |
| 21.9 Grace Period | ⬜ | 7 days for failed payments |
| 21.10 Review Tools Gating | ⬜ | Active review generation = paid |

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

#### 21.1 Two-Tier Membership Model (DECIDED)

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

#### 21.2 Pricing (DECIDED)

| Plan | Price | Effective Monthly |
|------|-------|-------------------|
| Monthly | $25/month | $25 |
| Annual | $240/year | $20 (20% savings) |

---

#### 21.4 Paywall Triggers (DECIDED)

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

#### 21.5 "Active" Badge (DECIDED)

Providers with active membership show a subtle badge:

- **Label**: "Active" (not "Member" or "Paid")
- **Meaning**: Active = paid + can engage
- **Display**: Small badge on provider cards in directory

This helps families identify providers who can respond through the platform, while not stigmatizing non-active providers.

---

#### 21.6 Unclaimed Provider UX (DECIDED)

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

#### 21.7-21.8 Stripe vs Mock (DECIDED)

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

#### 21.9 Grace Period (DECIDED)

When payment fails:

| Day | Action |
|-----|--------|
| 0 | Payment fails, retry automatically |
| 1 | Email: "Payment failed, please update your card" |
| 3 | Email + In-app: "Your membership will be paused in 4 days" |
| 7 | Membership paused → provider becomes non-active |

Provider can re-activate by updating payment method and paying.

---

#### 21.10 Review Tools Gating (DECIDED)

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

## Chapter 20: Caregiver Hiring Marketplace

**Purpose**: Enable organizations to find and hire individual caregivers, and caregivers to find employment opportunities — a two-sided staffing marketplace within Olera.

### Core Principle

> **One membership unlocks both marketplaces.**
>
> Organizations can find families (demand) AND find caregivers (supply). Individual caregivers can serve families AND find employment with organizations.

### Features

| Item | Status | Notes |
|------|--------|-------|
| 20.1 Find Caregivers (for orgs) | 🟡 | `/provider/find-caregivers` |
| 20.2 Find Organizations (for caregivers) | ⬜ | `/provider/find-organizations` |
| 20.3 Caregiver Availability Display | ⬜ | Critical for hiring decisions |
| 20.4 Bidirectional Hiring Engagements | 🟡 | `HiringEngagement` model |
| 20.5 Context-Specific CTAs | ⬜ | Different by direction |
| 20.6 Hiring Engagement Workflow | 🟡 | Interview → Hired flow |
| 20.7 Saved Candidates / Opportunities | ⬜ | Models defined in Ch. 14 |
| 20.8 Org Hiring Profile Fields | ⬜ | Within unified provider profile |
| 20.9 Caregiver Job-Seeking Profile | ⬜ | Extended fields on Provider |

### Key Questions — RESOLVED

- [x] **Is the hiring marketplace in scope for demo?**
  - **DECIDED**: Yes. Full bidirectional hiring must be demonstrated.

- [x] **Should caregivers have a separate model from Provider?**
  - **DECIDED**: No. Caregivers stay in Provider model with `type=INDIVIDUAL_CAREGIVER`. They ARE providers.

- [x] **Route prefix for caregivers?**
  - **DECIDED**: Use `/provider/` prefix (not `/caregiver/`). All provider-mode routes share the prefix.

### Architectural Notes

---

#### 20.1-20.2 Browse Experiences (DECIDED)

**Organizations Finding Caregivers:**

| Dropdown Label | Route | Purpose |
|----------------|-------|---------|
| "Hire Care Staff" | `/provider/hire-staff` | Browse caregivers available for hire |
| "My Candidates" | `/provider/my-candidates` | All hiring engagements |

**Individual Caregivers Finding Organizations:**

| Dropdown Label | Route | Purpose |
|----------------|-------|---------|
| "Hiring Organizations" | `/provider/hiring-organizations` | Browse orgs actively hiring |
| "My Job Opportunities" | `/provider/my-opportunities` | All hiring engagements |

> **Cross-reference:** See Chapter 5.4 for complete dropdown specifications and the navigation rendering principle.

---

#### 20.3 Caregiver Availability Display (DECIDED — Critical)

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

#### 20.4-20.5 Bidirectional Hiring Engagements & CTAs (DECIDED)

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

#### 20.6 Hiring Engagement Workflow (DECIDED)

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

#### 20.7 Saved Candidates / Opportunities (DECIDED)

**Cross-reference:** See Chapter 14 for models.

| Model | Purpose |
|-------|---------|
| `SavedCandidate` | Org saves caregiver for later |
| `SavedOpportunity` | Caregiver saves org for later |

Both include optional `notes` field for tracking.

---

#### 20.8 Organization Hiring Profile (DECIDED)

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

#### 20.9 Caregiver Job-Seeking Profile (DECIDED)

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

## Chapter 26: Admin System

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
| 26.1 Admin Mode (3rd mode) | ⬜ | Accessible via account dropdown for ADMIN users |
| 26.2 Admin Dashboard Home | ⬜ | Queue counts, system health, recent activity |
| 26.3 Claims Queue | ⬜ | Provider claim review workflow |
| 26.4 Reviews Queue | ⬜ | Review moderation workflow |
| 26.5 Provider Requests Queue | ⬜ | Provider-initiated requests (edits, removals, complaints) |
| 26.6 User Reports Queue | ⬜ | Content/user reports from platform users |
| 26.7 Support Queue | ⬜ | General support requests |
| 26.8 Legal & Compliance Queue | ⬜ | Legal requests (C&D, DMCA, GDPR, CCPA) |
| 26.9 Questions Queue | ⬜ | Community questions/answers moderation |
| 26.10 Provider Data Management | ⬜ | Full CRUD for provider records |
| 26.11 User Data Management | ⬜ | User account management |
| 26.12 Family Data Management | ⬜ | Family profile management |
| 26.13 Engagement Data View | ⬜ | View/manage engagements |
| 26.14 System Health Dashboard | ⬜ | API, DB, delivery metrics |
| 26.15 Background Jobs Monitor | ⬜ | Job status, failures |
| 26.16 Activity Logs | ⬜ | Admin action history |
| 26.17 External Tools Map | ⬜ | Links + context for external systems |
| 26.18 Embedded Documentation | ⬜ | SOPs, policies, guides |
| 26.19 Database Seeding Tools | ✅ | `/admin/seed` exists |
| 26.20 Data Clear Tools | ✅ | `/admin/clear-requests` exists |
| 26.21 SEO Content Management | ⬜ | Future: SEO page creation |
| 26.22 Help Article Management | ⬜ | Future: Help center content |
| 26.23 Notification Template Management | ⬜ | Future: Edit notification templates |
| 26.24 Questions Content Management | ⬜ | Manage community Q&A content |

### Key Questions — RESOLVED

- [x] **What admin features are needed for demo?**
  - **DECIDED**: Full structure visible, demo-depth in Claims Queue, Provider Requests Queue, Provider Data Management, External Tools Map, and at least one SOP per major area.

- [x] **Should there be role-based permissions?**
  - **DECIDED**: Single ADMIN role for demo. Role tiers (Admin, Support, Content Manager) deferred to production.

- [x] **Should audit logging be implemented?**
  - **DECIDED**: Yes, minimal for demo. Auth events, subscription events, and admin actions logged. Visible in Admin > Legal & Compliance > Audit Log. See Chapter 37 for full specification.

- [x] **How do providers submit requests?**
  - **DECIDED**: Both channels — email to support@olera.com AND contact form on unclaimed listing pages.

---

### Architectural Notes

#### 26.1 Admin Mode Access (DECIDED)

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
│   ├── /admin/queues/questions        → Questions Moderation Queue
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
├── /admin/legal                         → Legal & Compliance (First-Class Section)
│   ├── /admin/legal/audit-log           → Audit Log Viewer (✅ Demo)
│   ├── /admin/legal/data-requests       → Data Deletion/Export Requests (Deferred)
│   └── /admin/legal/compliance          → Compliance Dashboard (Deferred)
│
├── /admin/system
│   ├── /admin/system/health           → System Health Dashboard
│   ├── /admin/system/jobs             → Background Jobs Monitor
│   └── /admin/system/external         → External Tools Map
│
├── /admin/content
│   ├── /admin/content/seo             → SEO Page Management
│   ├── /admin/content/questions       → Questions Content Management
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

#### 26.2 Admin Dashboard Home (DECIDED)

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

#### 26.3 Claims Queue (DECIDED — Demo-Critical)

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

#### 26.5 Provider Requests Queue (DECIDED — Demo-Critical)

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

#### 26.9 Questions Moderation Queue (DECIDED)

**Purpose**: Moderate community-generated questions and answers flagged by auto-moderation triggers.

**Location**: `/admin/queues/questions`

**Queue Items** (auto-flagged content):

| Flag Trigger | Description |
|--------------|-------------|
| `PROFANITY` | Content contains words from profanity filter |
| `EXTERNAL_URL` | First-time poster included external link |
| `PREVIOUS_FLAGS` | User has prior flagged content |
| `DUPLICATE` | High similarity to existing question |
| `SPAM_PATTERN` | Unusual character patterns or repetition |

**Item Statuses:**

| Status | Meaning |
|--------|---------|
| `PENDING` | Awaiting review (content is published) |
| `REVIEWING` | Admin has claimed the item |
| `APPROVED` | Reviewed, flag cleared, content remains |
| `EDITED` | Admin edited content, flag cleared |
| `HIDDEN` | Content hidden from public view |
| `DELETED` | Content permanently removed |

**Actions Available:**

| Action | Result | User Notification |
|--------|--------|-------------------|
| **Approve** | Clear flag, content remains | None |
| **Edit** | Admin modifies content, clears flag | "Your content was edited by a moderator" |
| **Hide** | Content hidden from public | "Your content was hidden for policy violation" |
| **Delete** | Content permanently removed | "Your content was removed for [reason]" |
| **Warn User** | Warning logged, content may remain | "You've received a warning" |

**Queue List View:**

```
┌─────────────────────────────────────────────────────────────┐
│  QUESTIONS MODERATION                            12 items    │
├─────────────────────────────────────────────────────────────┤
│  Filter: [Status ▼] [Type ▼] [Trigger ▼]  Sort: [Oldest ▼] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 🟡 PENDING  [Question]           [EXTERNAL_URL]        ││
│  │ "What is the best memory care in Austin?"              ││
│  │ By: Jane D. (family) • Posted 2 hours ago              ││
│  │ Topic: Memory Care • Preview: "I found this link..."   ││
│  │                                                         ││
│  │ [Approve] [Edit] [Hide] [Delete] [View Full]           ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 🟡 PENDING  [Answer]             [PROFANITY]           ││
│  │ Answer to: "How much does home care cost?"             ││
│  │ By: CareExpert42 (user) • Posted 4 hours ago           ││
│  │ Preview: "That's a [flagged word] question..."         ││
│  │                                                         ││
│  │ [Approve] [Edit] [Hide] [Delete] [View Full]           ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Item Detail View:**

```
┌─────────────────────────────────────────────────────────────┐
│  FLAGGED QUESTION #Q-12345                        [← Back]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CONTENT                                                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ "What is the best memory care in Austin?"              ││
│  │                                                         ││
│  │ I'm looking for a memory care facility for my mother.  ││
│  │ I found this helpful resource: http://example.com      ││
│  │ What do you all think?                                 ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  FLAG DETAILS                                               │
│  Trigger: External URL (first post by user)                │
│  Flagged at: Jan 15, 2026 at 2:34 PM                       │
│                                                             │
│  USER INFO                                                  │
│  Author: Jane D. (family)                                  │
│  Account created: Jan 10, 2026                             │
│  Previous flags: 0                                         │
│  Other posts: 2 questions, 5 answers                       │
│                                                             │
│  ACTION                                                     │
│  [Approve] [Edit Content] [Hide] [Delete] [Warn User]      │
│                                                             │
│  Notes: [Text area for admin notes]                        │
│                                                             │
│                                        [Save] [Resolve]    │
└─────────────────────────────────────────────────────────────┘
```

**SLA**: 24 hours for review of flagged content

**Cross-Reference**: See Chapter 23: Trust & Safety (23.8) for moderation rules.

**Demo Implementation**: Basic queue with sample flagged content in seed data.

---

#### 26.10 Legal & Compliance Queue (DECIDED)

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

#### 26.11 Provider Data Management (DECIDED — Demo-Critical)

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

#### 26.13 System Health Dashboard (DECIDED)

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

#### 26.16 External Tools Map (DECIDED — Demo-Critical)

**Purpose**: Central reference for all external systems Olera relies on.

> **Cross-Reference**: See Chapter 38 (Third-Party Services & Integrations) for the authoritative service registry, environment variable documentation, and vendor management policies. This section focuses on the Admin UI presentation of that information.

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
| **Ch 7-8: Providers** | Provider data management |
| **Ch 10: Claiming** | Claims queue |
| **Ch 15: Engagements** | Engagement data view, dispute handling |
| **Ch 16: Messaging** | Message reports queue |
| **Ch 23: Reviews** | Reviews queue, moderation |
| **Ch 19: Notifications** | Delivery monitoring, template management |
| **Ch 22: Subscriptions** | Billing support (via Stripe link) |
| **Ch 20: Hiring** | Hiring engagement management |
| **Ch 25: Provider Data** | Seeding tools, bulk import |
| **Ch 29: Marketing & SEO** | SEO content management |
| **Ch 24: Trust** | Reports queue, fraud investigation |
| **Ch 34: Help** | Help article management |
| **Ch 32: Errors** | System health, logs |
| **Ch 37: Audit Logging** | Audit log viewer, compliance |

---

### Legal & Compliance Section (DECIDED — Required for Demo)

The Admin panel includes a dedicated **Legal & Compliance** section as a **first-class concept**.

> **Cross-Reference**: See Chapter 37 (Analytics & Audit Logging) for full audit log specification and Chapter 39 (Legal Framework) for compliance requirements.

**Admin > Legal & Compliance Structure**:

```
/admin/legal
├── Audit Log              ← ✅ Required for Demo
│   ├── Filter by action type
│   ├── Filter by date range
│   └── View event details
│
├── Data Requests          ← Deferred to Production
│   ├── Deletion requests (CCPA)
│   └── Export requests
│
└── Compliance Dashboard   ← Deferred to Production
    ├── Terms acceptance metrics
    └── Cookie consent metrics
```

**Demo Scope**:
- Audit Log viewer with basic filters (action type, date range)
- Display of auth events, subscription events, admin actions
- Clickable details for each log entry

**Rationale**: For legal and compliance purposes, the audit log must be visible as a first-class concept in the admin panel, demonstrating that the platform has compliance infrastructure in place.

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
> **Proposed**: Chapter 21 (Communications & Automation) — to be developed after completing current chapter sequence.

---

## Chapter 27: Human Workflows & Standard Operating Procedures

**Review Status**: ✅ Reviewed

**Purpose**: Serve as the operational playbook for the Olera admin team, defining exactly what to do, when to do it, and where to do it in the admin panel for all human-required workflows across the platform.

> **Audience**: This chapter is written for a small admin team (2–3 business-hours staff) who are not engineers. SOPs are designed to be prescriptive, consistent, and low-judgment.

> **Cross-References**:
> - Chapter 26 (Admin System): Admin panel structure and capabilities
> - Chapter 30 (Customer Support): Support intake channels
> - Chapter 23 (Trust & Safety): Safety policies and enforcement
> - Chapter 37 (Analytics & Audit Logging): Audit trail requirements

---

### 27.1 Operating Philosophy

#### 27.1.1 Automation First, Humans Second

**Principle**: The system handles routine work automatically. Humans focus on exceptions, edge cases, and high-risk decisions.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      AUTOMATION TIERS                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   TIER 1: Fully Automated                                               │
│   ├── User signup/login                                                 │
│   ├── Profile creation and updates                                      │
│   ├── Engagement booking flow                                           │
│   ├── Standard notifications                                            │
│   └── Basic data validation                                             │
│                                                                         │
│   TIER 2: Auto-Approved + Flagged for Review                           │
│   ├── Reviews (published, flagged if suspicious)                        │
│   ├── Provider profile edits (live, flagged if significant)            │
│   ├── New provider signups (active, flagged if high-risk)              │
│   └── Claim submissions (queued, auto-verified if signals strong)      │
│                                                                         │
│   TIER 3: Human Review Required                                         │
│   ├── Flagged reviews (reported or system-flagged)                      │
│   ├── Claim verification (low confidence)                               │
│   ├── Takedown requests (DMCA, defamation, legal)                      │
│   ├── User suspensions/bans                                             │
│   ├── Escalated support tickets                                         │
│   └── Edge cases and exceptions                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 27.1.2 Admin Panel as Command Center

**All human workflows funnel into the admin panel.** Admins should never need to:
- Access the database directly
- Edit code or configuration files
- Use external tools for core operations

**Admin Panel Location**: `/admin`

**Key Sections**:

| Section | Location | Purpose |
|---------|----------|---------|
| Dashboard | `/admin` | Overview, alerts, key metrics |
| Users | `/admin/users` | User management, suspensions |
| Providers | `/admin/providers` | Provider listings, verification |
| Claims Queue | `/admin/claims` | Pending claim verifications |
| Reviews | `/admin/reviews` | Review moderation queue |
| Support | `/admin/support` | Support ticket management |
| Legal | `/admin/legal` | Takedowns, DMCA, legal requests |
| Audit Log | `/admin/audit` | All system actions |

---

### 27.2 Daily Operations Checklist

**Frequency**: Every business day, first thing

**Location**: `/admin` (Dashboard)

| Step | Action | Where | Expected Time |
|------|--------|-------|---------------|
| 1 | Check overnight alerts | Dashboard → Alerts | 2 min |
| 2 | Review claims queue | `/admin/claims` | 5–15 min |
| 3 | Process flagged reviews | `/admin/reviews` → Flagged | 5–10 min |
| 4 | Check support tickets | `/admin/support` | 10–20 min |
| 5 | Review legal queue | `/admin/legal` | 5 min |
| 6 | Spot-check recent signups | `/admin/users` → Recent | 5 min |

**Total Daily Time**: 30–60 minutes (light day) to 2 hours (busy day)

---

### 27.3 Provider Claim Verification

**Triggering Event**: Provider submits claim for an unclaimed listing

**Location**: `/admin/claims`

**SLA**: 24 business hours

#### 27.3.1 Claim Queue Overview

| Column | Content |
|--------|---------|
| Claim ID | Unique identifier |
| Provider Name | Business name being claimed |
| Claimant | User submitting claim |
| Submitted | Date/time |
| Verification Status | Auto-verified, Pending Review, Flagged |
| Actions | Verify, Reject, Request Info |

#### 27.3.2 Auto-Verification (No Human Action Needed)

**System auto-verifies when ALL conditions met**:
- Email domain matches business website
- User verified their email
- No existing claim disputes
- Business information matches public records

**Result**: Claim approved automatically, admin sees in log only

#### 27.3.3 Manual Verification Procedure

**When**: Auto-verification fails or flags raised

**Steps**:

| Step | Action | Notes |
|------|--------|-------|
| 1 | Open claim from queue | Click claim ID |
| 2 | Review claimant info | Check email, phone, stated role |
| 3 | Compare to listing | Does claimed role match business? |
| 4 | Check for red flags | Multiple claims, suspicious email, etc. |
| 5 | **If confident**: Click "Approve Claim" | Claimant gets control of listing |
| 6 | **If unsure**: Click "Request Verification" | System sends verification request |
| 7 | **If suspicious**: Click "Reject Claim" | Select rejection reason |

**Verification Methods** (in order of preference):
1. Email from business domain
2. Phone verification (admin calls business)
3. Documentation (license, incorporation docs)

#### 27.3.4 Rejection Reasons

| Reason | When to Use |
|--------|-------------|
| Cannot verify identity | No matching evidence |
| Duplicate claim | Another user already claimed |
| Fraudulent attempt | Clear bad faith |
| Incomplete information | Need more details |

**After Rejection**: User receives notification with reason. They can resubmit with additional documentation.

#### 27.3.5 Escalation

**Escalate to leadership when**:
- Claimant disputes rejection
- Legal threats made
- High-profile business involved
- Uncertain about decision

---

### 27.4 Review Moderation

**Triggering Events**:
- User reports a review
- System flags review (profanity, spam signals)
- Provider disputes review

**Location**: `/admin/reviews`

**SLA**: 48 business hours

#### 27.4.1 Review Queue Tabs

| Tab | Content | Priority |
|-----|---------|----------|
| **Reported** | User-reported reviews | High |
| **Flagged** | System-flagged reviews | Medium |
| **Disputed** | Provider-disputed reviews | Medium |
| **All** | All reviews (for spot-checking) | Low |

#### 27.4.2 Review Moderation Procedure

**Steps**:

| Step | Action |
|------|--------|
| 1 | Open flagged review |
| 2 | Read full review content |
| 3 | Check reviewer history (other reviews, account age) |
| 4 | Check provider history (review patterns, disputes) |
| 5 | Apply moderation decision (see below) |
| 6 | Add internal note explaining decision |

#### 27.4.3 Moderation Decisions

| Decision | When to Use | Effect |
|----------|-------------|--------|
| **Approve** | Review is legitimate | Review remains visible |
| **Remove** | Violates guidelines | Review hidden, reviewer notified |
| **Edit** | Minor issues (profanity) | Redact specific content |
| **Escalate** | Legal risk, threats | Sent to legal queue |

#### 27.4.4 Review Removal Criteria

**Remove if review contains**:
- Profanity or slurs
- Personal attacks on individuals (not business)
- Clearly false factual claims
- Spam or promotional content
- Confidential information
- Threats or harassment

**Keep even if**:
- Negative opinion (allowed)
- Mentions specific incidents (if factual)
- Low star rating (allowed)
- Provider disagrees (opinion is protected)

#### 27.4.5 Provider Dispute Handling

**When provider disputes a review**:

| Step | Action |
|------|--------|
| 1 | Review provider's dispute reason |
| 2 | Compare to review content |
| 3 | Check if review violates guidelines |
| 4 | **If violation**: Remove review |
| 5 | **If no violation**: Deny dispute, explain to provider |
| 6 | If provider escalates: Send to legal queue |

---

### 27.5 Takedown & Legal Requests

**Triggering Events**:
- DMCA takedown notice received
- Defamation claim received
- Legal inquiry or subpoena
- Trademark complaint

**Location**: `/admin/legal`

**SLA**: 24 hours acknowledgment, resolution varies

#### 27.5.1 Legal Queue Overview

| Request Type | Source | Urgency |
|--------------|--------|---------|
| DMCA | Copyright holder | High (legal deadline) |
| Defamation | Subject of content | Medium |
| Trademark | Brand owner | Medium |
| Subpoena | Court/law enforcement | High |
| General Legal | Attorneys, users | Varies |

#### 27.5.2 DMCA Takedown Procedure

**Legal Requirement**: Must act on valid DMCA notices

| Step | Action | Timing |
|------|--------|--------|
| 1 | Verify notice completeness | See checklist below |
| 2 | If complete: Remove content immediately | Same day |
| 3 | Notify uploader of removal | Within 24h |
| 4 | Log in audit trail | Immediate |
| 5 | If counter-notice received: Restore in 10–14 days | Per DMCA |

**DMCA Notice Checklist**:
- [ ] Identifies copyrighted work
- [ ] Identifies infringing content (URL)
- [ ] Good faith statement
- [ ] Accuracy statement
- [ ] Signature (electronic OK)
- [ ] Contact information

**If notice incomplete**: Respond requesting missing information

#### 27.5.3 Defamation Request Procedure

| Step | Action |
|------|--------|
| 1 | Log request in legal queue |
| 2 | Review content in question |
| 3 | Is it opinion or factual claim? |
| 4 | **Opinion**: Generally protected, deny request |
| 5 | **Factual claim**: Is it provably false? |
| 6 | **If unsure**: Escalate to leadership/legal counsel |
| 7 | Respond to requester with decision |

**Default Position**: Content stays unless clearly violates guidelines or legal counsel advises removal.

#### 27.5.4 Law Enforcement Requests

| Step | Action |
|------|--------|
| 1 | Verify request is legitimate (official letterhead, badge number) |
| 2 | Determine scope of request |
| 3 | **Subpoena**: Comply with scope, preserve data |
| 4 | **Voluntary request**: Escalate to leadership |
| 5 | Document everything in audit log |
| 6 | Do not notify user if prohibited by order |

**Escalate immediately**: All law enforcement requests go to leadership.

---

### 27.6 User Management

**Location**: `/admin/users`

#### 27.6.1 User Lookup

**Search by**:
- Email address
- User ID
- Name
- Phone number

**User Detail View Shows**:
- Account info (email, created date, role)
- Profile completion
- Activity history
- Engagements
- Reviews written
- Flags/warnings

#### 27.6.2 User Suspension Procedure

**Triggering Events**:
- Multiple guideline violations
- Harassment reports
- Fraud detection
- Safety concerns

| Step | Action |
|------|--------|
| 1 | Open user from `/admin/users` |
| 2 | Review violation history |
| 3 | Document reason for suspension |
| 4 | Click "Suspend User" |
| 5 | Select duration (temporary/permanent) |
| 6 | User receives notification |
| 7 | Action logged in audit trail |

**Suspension Tiers**:

| Tier | Duration | Trigger |
|------|----------|---------|
| Warning | N/A | First minor violation |
| Temp Suspension | 7 days | Repeated minor violations |
| Temp Suspension | 30 days | Serious violation |
| Permanent Ban | Indefinite | Severe violation, safety risk |

#### 27.6.3 Account Deletion Requests

**Triggering Event**: User requests account deletion

**Location**: `/admin/users` → User detail → "Deletion Requests"

| Step | Action |
|------|--------|
| 1 | Verify request is from account owner |
| 2 | Check for active engagements |
| 3 | If active engagements: Contact user, cannot delete until resolved |
| 4 | If clear: Process deletion |
| 5 | Anonymize data per retention policy |
| 6 | Audit log retained (anonymized) |

**Data Retained After Deletion** (per Ch 39):
- Audit logs (anonymized)
- Financial records (7 years)
- Legal hold data (if applicable)

---

### 27.7 Provider Listing Management

**Location**: `/admin/providers`

#### 27.7.1 Provider Lookup

**Search by**:
- Business name
- Provider ID
- City/State
- Email
- Phone

**Provider Detail View Shows**:
- Business information
- Claim status (claimed/unclaimed)
- Verification badges
- Reviews summary
- Engagement history
- Edit history

#### 27.7.2 Listing Quality Issues

**When flagged for quality**:

| Issue | Action |
|-------|--------|
| Missing required info | Contact provider, request completion |
| Duplicate listing | Merge or remove duplicate |
| Incorrect information | Verify and correct |
| Closed business | Mark as inactive |
| Photos inappropriate | Remove photos, notify |

#### 27.7.3 Provider Suspension

**Triggers**:
- Fraud confirmed
- Safety violations
- Legal requirement
- Repeated policy violations

| Step | Action |
|------|--------|
| 1 | Document evidence thoroughly |
| 2 | Escalate to leadership for approval |
| 3 | If approved: Suspend listing |
| 4 | Notify provider with reason |
| 5 | Listing hidden from directory |
| 6 | Active engagements handled case-by-case |

---

### 27.8 Support Ticket Management

**Location**: `/admin/support`

**SLA**: First response within 24 business hours

#### 27.8.1 Ticket Queue

| Column | Content |
|--------|---------|
| Ticket ID | Unique identifier |
| Subject | Brief description |
| User | Submitter info |
| Category | Support category |
| Status | New, In Progress, Waiting, Resolved |
| Priority | Low, Normal, High, Urgent |
| Created | Submission time |

#### 27.8.2 Ticket Processing Procedure

| Step | Action |
|------|--------|
| 1 | Open ticket from queue |
| 2 | Read full message and context |
| 3 | Check user history if relevant |
| 4 | **If simple**: Respond and resolve |
| 5 | **If complex**: Investigate, update status to "In Progress" |
| 6 | **If needs user input**: Respond with questions, set to "Waiting" |
| 7 | **If escalation needed**: Tag appropriately, assign to lead |

#### 27.8.3 Common Support Scenarios

| Scenario | Action |
|----------|--------|
| "Can't log in" | Reset password link, check account status |
| "Want to delete account" | Direct to settings, or process deletion request |
| "Wrong info on listing" | If claimed: Direct to edit. If unclaimed: Admin edit |
| "Review is unfair" | Explain review policy, offer dispute if criteria met |
| "Didn't receive notification" | Check delivery status, verify contact info |
| "Billing question" | Check Stripe, explain charges |
| "How do I...?" | Link to relevant help content or guide through |

#### 27.8.4 Escalation Triggers

**Escalate to leadership when**:
- User threatens legal action
- Safety concern raised
- Technical issue beyond admin scope
- Policy exception requested
- Media/PR involvement

---

### 27.9 Error & Incident Response

**Triggering Events**:
- System error alerts
- User-reported bugs
- Performance degradation
- Service outages

**Location**: `/admin` → Dashboard → Alerts

#### 27.9.1 Error Severity Levels

| Level | Description | Response |
|-------|-------------|----------|
| **Critical** | Platform down, data loss risk | Immediate escalation |
| **High** | Major feature broken | Escalate within 1 hour |
| **Medium** | Feature degraded | Log ticket, business hours |
| **Low** | Minor issue | Log for engineering backlog |

#### 27.9.2 Incident Response Procedure

**For Critical/High severity**:

| Step | Action | Who |
|------|--------|-----|
| 1 | Acknowledge alert | Admin |
| 2 | Document symptoms | Admin |
| 3 | Escalate to engineering | Admin → Engineering |
| 4 | Update status page (if exists) | Engineering |
| 5 | Monitor for resolution | Admin |
| 6 | Notify affected users if needed | Admin |
| 7 | Post-incident review | Team |

**For Medium/Low severity**:

| Step | Action |
|------|--------|
| 1 | Log issue details |
| 2 | Create ticket for engineering |
| 3 | Note workarounds if available |
| 4 | Monitor for recurrence |

---

### 27.10 Attribution & Referral Management

**Location**: `/admin/attribution` (if built) or `/admin/users`

#### 27.10.1 Referral Tracking

**What's Tracked**:
- Referral source (partner, campaign, organic)
- Conversion events
- Attribution disputes

#### 27.10.2 Attribution Dispute Handling

| Step | Action |
|------|--------|
| 1 | Review dispute details |
| 2 | Check referral tracking data |
| 3 | Verify cookie/parameter data |
| 4 | Make determination |
| 5 | Communicate decision to partner |
| 6 | Adjust attribution if needed |

---

### 27.11 Audit Log Usage

**Location**: `/admin/audit`

**Purpose**: Track all system actions for compliance, debugging, and accountability.

#### 27.11.1 Audit Log Fields

| Field | Description |
|-------|-------------|
| Timestamp | When action occurred |
| Actor | Who performed action (user, admin, system) |
| Action | What was done |
| Target | What was affected |
| Details | Additional context |
| IP Address | Origin (for security) |

#### 27.11.2 Common Audit Log Uses

| Use Case | How to Search |
|----------|---------------|
| User activity history | Filter by actor ID |
| Track specific action | Filter by action type |
| Investigate incident | Filter by time range |
| Compliance review | Export filtered results |

#### 27.11.3 Audit Log Retention

| Log Type | Retention |
|----------|-----------|
| Auth events | 7 years |
| Admin actions | 7 years |
| User data changes | 7 years |
| System events | 1 year |

---

### 27.12 SLA Summary

| Queue | First Response | Resolution Target |
|-------|----------------|-------------------|
| Claims | 24 business hours | 48 business hours |
| Flagged Reviews | 24 business hours | 48 business hours |
| Support Tickets | 24 business hours | Varies by complexity |
| Legal Requests | 24 hours | Per legal requirements |
| DMCA | Same day | Same day |
| Critical Errors | Immediate | ASAP |

---

### 27.13 Escalation Matrix

| Situation | Escalate To | Method |
|-----------|-------------|--------|
| Legal threats | Leadership | Immediate message |
| Safety concerns | Leadership | Immediate message |
| Technical issues (Critical) | Engineering | On-call alert |
| Policy exceptions | Leadership | Email with context |
| Media/PR inquiries | Leadership | Immediate message |
| Fraud patterns | Leadership + Engineering | Meeting |
| User appeals (after denial) | Leadership | Email with history |

---

### 27.14 Admin Onboarding Checklist

**For new admin team members**:

| Day | Task | Duration |
|-----|------|----------|
| 1 | Read this chapter (Ch 27) | 2 hours |
| 1 | Admin panel walkthrough | 1 hour |
| 1 | Shadow experienced admin | 2 hours |
| 2 | Practice claim verification (supervised) | 2 hours |
| 2 | Practice review moderation (supervised) | 2 hours |
| 3 | Handle support tickets (supervised) | 4 hours |
| 4 | Solo operations (with backup available) | Full day |
| 5 | Full solo operations | Full day |

**Access Levels**:

| Level | Can Do |
|-------|--------|
| Admin (Standard) | All daily operations |
| Admin (Senior) | + User suspensions, escalation handling |
| Admin (Lead) | + Policy exceptions, team management |

---

### 27.15 Demo vs Production Scope

| Workflow | Demo | Production |
|----------|------|------------|
| Claim verification | ✅ Manual queue | ✅ + Auto-verification |
| Review moderation | ✅ Manual queue | ✅ + AI flagging |
| Support tickets | ✅ Basic queue | ✅ + SLA tracking |
| Legal handling | ✅ Manual process | ✅ + Legal tooling |
| Incident response | 🟡 Basic alerts | ✅ + PagerDuty |
| Audit logging | ✅ Basic | ✅ + Retention policies |
| SLA monitoring | ⬜ Defer | ✅ Dashboard |

---

### 27.16 Quick Reference Card

**Print this for daily use**:

```
╔═══════════════════════════════════════════════════════════════════════╗
║                    ADMIN QUICK REFERENCE                               ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                        ║
║  DAILY CHECKLIST                                                       ║
║  □ Check alerts (/admin → Dashboard)                                   ║
║  □ Process claims (/admin/claims)                                      ║
║  □ Review flagged reviews (/admin/reviews)                            ║
║  □ Handle support tickets (/admin/support)                            ║
║  □ Check legal queue (/admin/legal)                                   ║
║                                                                        ║
║  SLA REMINDERS                                                         ║
║  • Claims: 24h first response, 48h resolution                         ║
║  • Reviews: 48h resolution                                            ║
║  • Support: 24h first response                                        ║
║  • DMCA: Same day action required                                     ║
║                                                                        ║
║  ESCALATE IMMEDIATELY                                                  ║
║  • Legal threats → Leadership                                         ║
║  • Safety concerns → Leadership                                       ║
║  • Platform down → Engineering                                        ║
║  • Media inquiries → Leadership                                       ║
║                                                                        ║
║  WHEN IN DOUBT                                                         ║
║  • Document everything                                                 ║
║  • Don't rush decisions                                               ║
║  • Ask for help                                                       ║
║  • Check audit log for precedent                                      ║
║                                                                        ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

## Chapter 24: Provider Data Management

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
| 24.1 Organization vs Account Data Model | ✅ Decided | See 24.1 below |
| 24.2 Unclaimed Provider Lifecycle | ✅ Decided | See 24.2 below |
| 24.3 Field Classification Framework | ✅ Decided | Core, Extended, Audit, Deprecated |
| **Source of Truth** | | |
| 24.4 Current State (Airtable) | ✅ Documented | CSV export, manual upload |
| 24.5 Target State (Postgres) | ✅ Decided | Full migration, Airtable deprecated |
| 24.6 Transition Plan | 🟡 In Progress | See 24.6 below |
| **Data Migration** | | |
| 24.7 Field Mapping Matrix | ✅ Decided | Airtable → Provider model |
| 24.8 Migration Execution Plan | ⬜ | Sequenced rollout |
| 24.9 Validation & Rollback | ⬜ | Pre/post checks |
| **Admin Upload System** | | |
| 24.10 Upload File Format | ✅ Decided | Standardized CSV |
| 24.11 Validation Rules | ✅ Decided | See 24.11 below |
| 24.12 Deduplication Strategy | ✅ Decided | See 24.12 below |
| 24.13 Update Behavior | ✅ Decided | Merge vs. overwrite rules |
| 24.14 Admin UI Integration | 🟡 | Cross-ref Chapter 26 |
| **Scale & Performance** | | |
| 24.15 Current Scale (~40K) | ✅ | Existing dataset |
| 24.16 Target Scale (500K+) | ⬜ | Performance considerations |
| **Demo & Development** | | |
| 24.17 Demo User Accounts | ✅ | `prisma/seed.ts` |
| 24.18 Demo Walkthrough | ⬜ | Documentation needed |
| 24.19 Data Reset Tools | 🟡 | Partial implementation |

---

### 24.1 Organization Data vs Account Data (DECIDED)

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

### 24.2 Unclaimed Provider Lifecycle (DECIDED)

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

### 24.3 Field Classification Framework (DECIDED)

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

### 24.4 Current State: Airtable as Data Source (DOCUMENTED)

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

### 24.5 Target State: Postgres as Source of Truth (DECIDED)

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

### 24.6 Transition Plan (IN PROGRESS)

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

### 24.7 Field Mapping Matrix (DECIDED)

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

### 24.8 Upload File Format (DECIDED)

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

### 24.9 Validation Rules (DECIDED)

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

### 24.10 Deduplication Strategy (DECIDED)

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

### 24.11 Update Behavior (DECIDED)

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

### 24.12 Admin UI Integration (CROSS-REFERENCE)

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

### 24.13 Current Scale: ~40,000 Providers

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

### 24.14 Target Scale: 500,000+ Providers

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

Scaling to 500K+ requires data acquisition strategies beyond manual CSV uploads. See **Chapter 26: Data Acquisition & Enrichment** for:
- Public data sourcing
- API-based enrichment
- Compliance framework
- AI-assisted verification

---

### 24.15 Demo & Development Data

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

### 24.16 Demo Walkthrough Documentation

**To Be Documented**

| Scenario | Description | Accounts Used |
|----------|-------------|---------------|
| Family care search | Find and contact providers | family.assisted.active |
| Provider response | Respond to family inquiry | provider.al.flagship |
| Caregiver hiring | Org finds caregiver | provider.al.flagship + caregiver.fulltime |
| Admin operations | Manage providers, claims | admin |

---

### 24.17 Data Reset Capabilities

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

### Cross-Reference: Chapter 26

**Chapter 26: Data Acquisition & Enrichment** will cover:

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

| Chapter | Integration with Ch 25 |
|---------|------------------------|
| **Ch 7: Provider Profiles** | Field definitions, display rules |
| **Ch 8: Provider Identity** | Claiming links account to org data |
| **Ch 9: Provider Directory** | Search uses Provider table |
| **Ch 10: Provider Claiming** | Transitions unclaimed → claimed |
| **Ch 11: Profile Completion** | Completion % calculation |
| **Ch 22: Subscriptions** | Claimed → Active transition |
| **Ch 27: Admin System** | Bulk import UI, data management |

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

## Chapter 5: Navigation & Routing

**Purpose**: Define the platform's navigation architecture, account dropdown rendering model, route structure, and URL protection.

### 5.1 Navigation Rendering Principle (DECIDED)

> **Core Principle**: Maximize tab visibility; gate by action, not visibility.

| Principle | Meaning |
|-----------|---------|
| **Tabs visible by default** | Navigation items appear regardless of profile completion state |
| **No hiding based on profile** | A user without a profile still sees all relevant tabs for their current mode |
| **Gate by action** | Clicking a tab may prompt profile creation or show empty state — but the tab is visible |
| **Empty states educate** | Pages explain why content is unavailable and guide next steps |
| **Consistent rendering** | Same tabs appear for all users in a given mode (except hiring section) |

**Benefits**:
- Users discover full platform capabilities immediately
- Navigation is predictable across all states
- Rendering logic is simpler (minimal conditionals)
- Empty states educate rather than hide functionality

**The One Exception**: The hiring section in Provider mode varies by provider type because organizations and caregivers have fundamentally different hiring journeys.

---

### 5.2 Main Navigation Bar (DECIDED)

**Structure**: Single primary navigation bar, always visible.

**Desktop Layout**:
```
[Logo] [Home Care ▼] [Assisted Living ▼] [Memory Care ▼] [Nursing Homes ▼] [More ▼] [Help Me Decide]    [Sign In] [List Your Business]
```

| Element | Behavior |
|---------|----------|
| **Logo** | Routes to `/` (homepage) |
| **Care Type Dropdowns** | Home Care, Assisted Living, Memory Care, Nursing Homes (see 5.2.1) |
| **More Menu** | Mega menu with full care ecosystem (see 5.2.2) |
| **Help Me Decide** | Primary CTA, routes to care assessment wizard |
| **Auth / Account** | Logged out: Sign In + List Your Business / Logged in: Account Dropdown |

**Mode Toggle Behavior** (in account dropdown when logged in):

| Current State | Button Label | Action |
|---------------|--------------|--------|
| Logged out | N/A | "List Your Business" routes to `/for-providers` |
| Logged in, Family mode | Provider Mode | Switches to Provider mode |
| Logged in, Provider mode | Family Mode | Switches to Family mode |

**Mode Source of Truth**: Database `User.currentMode` field. URL `?mode=` parameter has been removed per prior decision.

**Implementation**: `components/Navigation/MainNav.tsx`

---

#### 5.2.1 Care Type Dropdowns (DECIDED)

Each of the four primary care type nav items opens a dropdown menu:

**Dropdown Content Structure** (per care type):

| Element | Example (Home Care) |
|---------|---------------------|
| **Overview Link** | "Home Care Guide" → `/home-care/` |
| **Find Near Me** | "Find Home Care Near Me" → `/home-care/` with location prompt |
| **Compare Link** | "Compare Home Care" → `/compare/` filtered |
| **Featured Articles** | 2-3 top articles from `/home-care/articles/` |
| **View All** | "View All Home Care Resources" → `/home-care/` |

**Care Types in Primary Nav**:

| Nav Label | Topic Hub URL | Why Primary |
|-----------|---------------|-------------|
| Home Care | `/home-care/` | Highest search volume, entry point for many families |
| Assisted Living | `/assisted-living/` | Most common facility search |
| Memory Care | `/memory-care/` | High urgency, specific need |
| Nursing Homes | `/nursing-homes/` | High search volume, familiar term |

**Other Care Types**: Accessed via "More" mega menu (see 5.2.2).

---

#### 5.2.2 "More" Mega Menu (DECIDED)

The "More" dropdown opens a comprehensive mega menu serving as the complete care ecosystem map:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ CARE TYPES                │ PLANNING & SUPPORT        │ RESOURCES               │
│                           │                           │                         │
│ • Home Care               │ • Paying for Care         │ • Research              │
│ • Home Health             │ • Legal Planning          │ • Aging in America      │
│ • Assisted Living         │ • Caregiver Support       │ • Compare Care Types    │
│ • Independent Living      │ • Health Conditions       │ • Care Assessment       │
│ • Memory Care             │ • Aging at Home           │                         │
│ • Nursing Homes           │                           │ COMPANY                 │
│ • Adult Day Care          │ LOOKING FOR WORK?         │                         │
│ • Rehab                   │                           │ • About Olera           │
│ • Hospice                 │ • Caregiver Jobs          │ • How Olera Works       │
│                           │                           │ • Contact Us            │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Column Breakdown**:

| Column | Purpose | Links To |
|--------|---------|----------|
| **Care Types** | All 9 care types | Topic hubs (`/[care-type]/`) |
| **Planning & Support** | Non-provider content pillars | Planning topic hubs |
| **Looking for Work?** | Caregiver job seeker entry | `/caregiver-jobs/` |
| **Resources** | Authority content | `/research/`, `/aging-in-america/`, `/compare/` |
| **Company** | Transparency and company info | `/company/`, `/how-olera-works/` |

**Mega Menu Behavior**:
- Opens on hover (desktop) or tap (mobile)
- Full-width dropdown with organized columns
- Links are clearly categorized for quick scanning
- Mobile: Expands as accordion sections

---

#### 5.2.3 "Help Me Decide" CTA (DECIDED)

Primary navigation call-to-action for families unsure of care needs.

| Attribute | Specification |
|-----------|---------------|
| **Label** | "Help Me Decide" |
| **Style** | Primary button (stands out from nav links) |
| **Destination** | Care Assessment Wizard (see Chapter 3: Onboarding) |
| **Behavior** | If not logged in, completes assessment then prompts signup |

**Entry Points for Care Assessment**:
- Primary nav CTA (this)
- Topic hub CTAs
- Article contextual CTAs
- Comparison page CTAs
- Exit-intent modal (optional, future)

**Cross-Reference**: See Chapter 3: Onboarding for care assessment wizard specification.

---

### 5.3 Account Dropdown — Family Mode (DECIDED)

**Applies to**: All logged-in users currently in Family mode, regardless of profile existence.

```
┌─────────────────────────────┐
│ [Name]                      │
│ [Email]                     │
│ [Family Mode badge]         │
├─────────────────────────────┤
│ Find Providers              │
│ Saved Providers             │
│ My Providers                │
│ Dashboard                   │
├─────────────────────────────┤
│ Provider Mode               │
│ Settings                    │
├─────────────────────────────┤
│ Log Out                     │
└─────────────────────────────┘
```

| Tab | Route | Behavior (No Family Profile) |
|-----|-------|------------------------------|
| Find Providers | `/` | Works (public search) |
| Saved Providers | `/family/saved-providers` | Empty state: "Create a care profile to save providers" |
| My Providers | `/family/my-providers` | Empty state: "No provider connections yet" |
| Dashboard | `/family/dashboard` | Shows profile completion CTA if incomplete |

**Tab count**: Always 7 items (4 core + 2 utility + 1 auth)

---

### 5.4 Account Dropdown — Provider Mode (DECIDED)

**Applies to**: All logged-in users currently in Provider mode.

**Core tabs** (always visible):

| Tab | Route | Behavior (No Provider Profile) |
|-----|-------|--------------------------------|
| Find Families | `/provider/find-families` | Works (public search) |
| Saved Families | `/provider/saved-families` | Empty state with profile creation CTA |
| My Families | `/provider/my-families` | Empty state with profile creation CTA |
| My Provider Profile | `/provider/dashboard` | Shows profile creation flow |

**Hiring section** (varies by provider type):

| Provider Type | Hiring Tabs Shown |
|---------------|-------------------|
| **Unknown** (no profile) | Hire Care Staff, Become a Caregiver |
| **Organization** | Hire Care Staff, My Candidates |
| **Caregiver** | Hiring Organizations, My Job Opportunities |

#### Provider Mode — Unknown Type (No Profile)

```
┌─────────────────────────────┐
│ [Name]                      │
│ [Email]                     │
│ [Provider Mode badge]       │
├─────────────────────────────┤
│ Find Families               │
│ Saved Families              │
│ My Families                 │
│ My Provider Profile         │
├─────────────────────────────┤
│ Hire Care Staff             │  ← Routes to org onboarding
│ Become a Caregiver          │  ← Routes to caregiver onboarding
├─────────────────────────────┤
│ Family Mode                 │
│ Settings                    │
├─────────────────────────────┤
│ Log Out                     │
└─────────────────────────────┘
```

#### Provider Mode — Organization

```
┌─────────────────────────────┐
│ [Name]                      │
│ [Email]                     │
│ [Provider Mode badge]       │
├─────────────────────────────┤
│ Find Families               │
│ Saved Families              │
│ My Families                 │
│ My Provider Profile         │
├─────────────────────────────┤
│ Hire Care Staff             │
│ My Candidates               │
├─────────────────────────────┤
│ Family Mode                 │
│ Settings                    │
├─────────────────────────────┤
│ Log Out                     │
└─────────────────────────────┘
```

#### Provider Mode — Caregiver

```
┌─────────────────────────────┐
│ [Name]                      │
│ [Email]                     │
│ [Provider Mode badge]       │
├─────────────────────────────┤
│ Find Families               │
│ Saved Families              │
│ My Families                 │
│ My Provider Profile         │
├─────────────────────────────┤
│ Hiring Organizations        │
│ My Job Opportunities        │
├─────────────────────────────┤
│ Family Mode                 │
│ Settings                    │
├─────────────────────────────┤
│ Log Out                     │
└─────────────────────────────┘
```

**Tab count**: Always 9 items (4 core + 2 hiring + 2 utility + 1 auth)

---

### 5.5 Logged Out State (DECIDED)

**Main Nav (Right Side)**:

| Element | Label | Action |
|---------|-------|--------|
| Mode Toggle | Provider Mode | Routes to `/for-providers` landing |
| Auth Button 1 | Sign In | Opens auth modal (login view) |
| Auth Button 2 | Get Started | Opens auth modal (signup view) |

**Account Dropdown**: Does not exist (no session)

---

### 5.6 Rendering Logic Summary (DECIDED)

```
IF logged out:
  → No dropdown
  → Show "Sign In" + "Get Started"
  → Mode toggle routes to /for-providers

IF logged in:
  → Show dropdown with header (name, email, mode badge)

  IF current mode == Family:
    → Always show: Find Providers, Saved Providers, My Providers, Dashboard
    → Pages handle empty states based on profile existence

  IF current mode == Provider:
    → Always show: Find Families, Saved Families, My Families, My Provider Profile
    → Hiring section varies by provider type:
        - Unknown → "Hire Care Staff" + "Become a Caregiver"
        - Organization → "Hire Care Staff" + "My Candidates"
        - Caregiver → "Hiring Organizations" + "My Job Opportunities"

  → Always show: Mode switch, Settings, Log Out
```

**Total conditionals in rendering**: 1 (provider type for hiring section)
**Tabs hidden based on profile existence**: 0

---

### 5.7 Route Structure (DECIDED)

| Route Pattern | Access | Purpose |
|---------------|--------|---------|
| `/` | Public | Homepage / Family search |
| `/family/*` | Authenticated | Family mode pages |
| `/provider/*` | Authenticated | Provider mode pages |
| `/admin/*` | Admin role | Admin mode (not user-facing) |
| `/settings` | Authenticated | Both modes |
| `/for-providers` | Public | Provider landing page |

---

### 5.8 Route Protection (DECIDED)

**Middleware** (`middleware.ts`):
- Protects `/family/*` and `/provider/*` routes
- Unauthenticated users → redirect to `/login?returnUrl=<original_path>`
- Authenticated users pass through
- Mode enforcement handled at page level, not middleware

**Login Redirect Flow**:
1. User visits protected route while unauthenticated
2. Redirect to `/login?returnUrl=/original/path`
3. After successful login, redirect to `returnUrl`
4. If no `returnUrl`, redirect to user's last mode landing page

---

### 5.9 Breadcrumbs (DECIDED)

| Status | Notes |
|--------|-------|
| ⬜ Not Built | Required for demo |

**Specification**:
- Display below MainNav on all authenticated pages
- Auto-generate from route segments with readable labels
- Support custom overrides for complex paths
- Examples:
  - Home > Dashboard > Saved Providers
  - Home > Provider Dashboard > My Families > [Family Name]

**Implementation Approach**:
- Breadcrumb component reads current route
- Mapping file defines segment → label transformations
- Pages can override via props for dynamic segments

---

### 5.10 Key Decisions Log

| Decision | Status | Rationale |
|----------|--------|-----------|
| URL `?mode=` parameter removed | ✅ Decided | DB state is source of truth; URL param was fragile |
| 404/error pages consolidated | ✅ Decided | Moved to Chapter 32: Error Handling |
| Breadcrumbs required for demo | ✅ Decided | Improves navigation clarity |
| Maximize tab visibility | ✅ Decided | Gate by action, not visibility |
| Hiring section varies by type | ✅ Decided | Only exception to consistent rendering |
| Mega menu for "More" | ✅ Decided | Comprehensive care ecosystem navigation |
| "Help Me Decide" CTA | ✅ Decided | Primary nav CTA routes to care assessment |
| Footer with transparency hub | ✅ Decided | Trust and legal links in footer |

---

### 5.11 Footer Navigation (DECIDED)

**Purpose**: Site-wide footer providing comprehensive navigation, legal compliance, and trust signals.

**Footer Structure**:

```
CARE TYPES              PLANNING              COMPANY               LEGAL & TRUST
─────────────────────────────────────────────────────────────────────────────────
Home Care               Paying for Care       About Us              Terms of Service
Home Health             Legal Planning        How Olera Works       Privacy Policy
Assisted Living         Caregiver Support     Careers               Accessibility
Independent Living      Health Conditions     Press                 Do Not Sell My Info
Memory Care             Aging at Home         Contact
Nursing Homes
Adult Day Care          FOR PROVIDERS
Rehab                   ─────────────
Hospice                 List Your Business
                        Provider Resources
                        Claim Your Listing
```

**Column Details**:

| Column | Purpose | Links To |
|--------|---------|----------|
| **Care Types** | All 9 care type topic hubs | `/[care-type]/` |
| **Planning** | Planning & support content | `/paying-for-care/`, `/legal-planning/`, etc. |
| **For Providers** | Provider acquisition funnel | `/for-providers`, resources |
| **Company** | Corporate and transparency | `/company/`, `/how-olera-works/` |
| **Legal & Trust** | Compliance and trust | `/terms`, `/privacy`, `/accessibility` |

**Footer Behavior**:
- Always visible on all pages
- Consistent across logged-in and logged-out states
- Mobile: Columns stack vertically with accordion expand

**Cross-Reference**: See Chapter 28: Marketing & SEO Pages for transparency hub content.

---

### 5.12 Cross-Chapter Integration

| Chapter | Integration Point |
|---------|-------------------|
| Ch 2: Mode System | Mode toggle triggers DB update via `/api/user/mode` |
| Ch 1: Authentication | Login redirect uses `returnUrl` parameter |
| Ch 3: Onboarding | "Help Me Decide" routes to care assessment wizard |
| Ch 12: Family Dashboard | Dashboard tab routes to `/family/dashboard` |
| Ch 13: Provider Dashboard | My Provider Profile routes to `/provider/dashboard` |
| Ch 20: Hiring Marketplace | Hiring tabs route to `/provider/hire-staff`, etc. |
| Ch 29: Marketing & SEO | Topic hubs, mega menu links, footer structure |
| Ch 32: Error Handling | 404 and error pages consolidated there |

---

### 5.13 Implementation Status

> **Last Updated**: January 19, 2026 (Sprint 0 Complete)

| Item | Status | Notes |
|------|--------|-------|
| Main Navigation | ✅ Built | `MainNav.tsx` — needs mode parameter removal (Sprint 1) |
| Care Type Dropdowns | ⬜ Not Built | 4 dropdowns with featured content |
| "More" Mega Menu | ⬜ Not Built | Full care ecosystem navigation |
| "Help Me Decide" CTA | ⬜ Not Built | Routes to care assessment wizard |
| Footer Navigation | ⬜ Not Built | Full footer with all sections (Sprint 1) |
| Account Dropdown | 🟡 Partial | Exists but uses URL mode param (Sprint 1 cleanup) |
| Route Protection | ✅ Built | Middleware working correctly |
| Login Redirect | ✅ Built | `returnUrl` parameter preserved |
| Breadcrumbs | ✅ Built | Auto-generated from path, 19+ pages, `SEGMENT_LABELS` mapping |
| Mode from DB | ✅ Built | `User.activeMode` restored on login, persists across sessions |

**Sprint 0 Notes**:
- Breadcrumb component (`components/Navigation/Breadcrumb.tsx`) implemented with auto-generation from URL path
- Uses `SEGMENT_LABELS` mapping for route-to-label translation
- ID detection (UUID, CUID) skips dynamic segments; detail pages use `currentPage` prop
- Auth race condition fixed: uses `status === "unauthenticated"` pattern

### Demo vs Production

| Feature | Demo | Production |
|---------|------|------------|
| Account dropdown | Full implementation | Same |
| Mega menu | Basic structure | Featured content integration |
| Footer | Full structure | Same |
| Breadcrumbs | Basic auto-generation | Custom labels, analytics |
| Route protection | Current middleware | Same + role-based guards |

---

## Chapter 14: Settings & Preferences

**Purpose**: Centralized account-level settings that apply regardless of current mode. Profile-specific settings (visibility, care needs, services) remain in their respective dashboards.

### 14.1 Settings Architecture (DECIDED)

**Settings vs Dashboard Split**:

| Location | Contains | Examples |
|----------|----------|----------|
| **Settings** (`/settings`) | Account-level preferences | Name, password, notifications, privacy |
| **Family Dashboard** | Family profile settings | Care needs, visibility, preferences |
| **Provider Dashboard** | Provider profile settings | Services, availability, visibility |

**Rationale**: Users operate in multiple modes. Account settings apply universally; profile settings are mode-specific and belong in their respective dashboards.

---

### 14.2 Account Information (DECIDED)

| Field | Editable | Validation | Notes |
|-------|----------|------------|-------|
| **Name** | ✅ Yes | Required, 2-100 chars | Displayed in nav dropdown, messages, engagements |
| **Email** | ❌ No | — | Primary identifier, used for auth. Cannot be changed. |
| **Phone** | ✅ Yes | Optional, E.164 format | Used for SMS notifications if enabled (future) |

**Implementation**:
- Read: `GET /api/user/profile`
- Update: `PATCH /api/user/settings`

**UI Note**: Remove the "Account Type" badge from settings. Users can operate in both modes, so showing "Family Account" or "Provider Account" is misleading.

---

### 14.3 Notification Preferences (DECIDED)

**Scope**: Account-wide. Single set of preferences applies to all activity across modes.

| Preference | Key | Default | Description |
|------------|-----|---------|-------------|
| **Messages** | `emailMessages` | ✅ On | New messages from families/providers |
| **Engagement Updates** | `emailRequests` | ✅ On | Status changes, scheduling confirmations |
| **Reminders** | `emailReminders` | ✅ On | Upcoming appointments, deadlines |
| **Platform Updates** | `emailUpdates` | ⬜ Off | New features, improvements |
| **Marketing** | `emailMarketing` | ⬜ Off | Tips, resources, promotional content |

**Channel Support**:

| Channel | Demo | Production |
|---------|------|------------|
| Email | ✅ Full | Full |
| SMS | ⬜ Deferred | Per-preference toggle |
| Push (web) | ⬜ Deferred | Per-preference toggle |
| Push (mobile) | ⬜ Deferred | Future mobile app |

**Storage**: Preferences stored on `User` model (or related `UserPreferences` table).

**Cross-reference**: See Chapter 19 (Notifications) for delivery logic and Chapter 21 (Communications) for email templates.

---

### 14.4 Password Management (DECIDED)

**Change Password Flow**:

1. User enters current password (required for verification)
2. User enters new password + confirmation
3. Validation:
   - Current password must be correct
   - New password: minimum 8 characters
   - New password must match confirmation
4. On success: Password updated, user remains logged in
5. On failure: Error message, no change

**Password Requirements**:

| Rule | Requirement |
|------|-------------|
| Minimum length | 8 characters |
| Complexity | None for demo (letters, numbers, symbols all valid) |
| History | None for demo (can reuse old passwords) |

**Production Enhancements** (deferred):
- Password strength meter
- Complexity requirements (mixed case, numbers, symbols)
- Password history (prevent reuse of last N passwords)
- Two-factor authentication (2FA) setup

**Implementation**: `PATCH /api/user/settings` with `currentPassword` and `newPassword` fields.

---

### 14.5 Privacy & Data (DECIDED)

| Feature | Demo Scope | Production Scope |
|---------|------------|------------------|
| **Data Export** | ⬜ Placeholder button | Full GDPR-compliant export (JSON/CSV) |
| **Account Deletion** | ⬜ Placeholder button | Soft-delete with 30-day recovery window |
| **Connected Accounts** | ⬜ Not shown | Google, Apple account linking |
| **Session Management** | ⬜ Not shown | View active sessions, revoke access |

**Data Export (Production)**:
- User requests export → queued job generates archive
- Archive includes: profile data, messages, engagements, saved items
- Delivered via secure download link (email notification)
- Retention: Download available for 7 days

**Account Deletion (Production)**:
- User confirms deletion → account enters "pending deletion" state
- 30-day recovery window (user can log in to cancel)
- After 30 days: permanent deletion of all user data
- Related data handling:
  - Engagements: Anonymized (preserved for other party's records)
  - Messages: Deleted
  - Reviews: Anonymized (content preserved, author shown as "Deleted User")

> **Cross-Reference**: See Chapter 39 (Legal Framework) for data retention periods (39.3.1), data export requirements (39.3.2), and CCPA compliance requirements.

---

### 14.6 Settings Page Sections

**UI Structure**:

```
/settings
├── Account Information
│   ├── Name (editable)
│   ├── Email (read-only)
│   └── Phone (editable)
├── Email Notifications
│   ├── Messages toggle
│   ├── Engagement Updates toggle
│   ├── Reminders toggle
│   ├── Platform Updates toggle
│   └── Marketing toggle
├── Change Password
│   ├── Current Password
│   ├── New Password
│   └── Confirm New Password
├── Privacy & Data
│   └── Download Your Data (button)
└── Danger Zone
    └── Delete Account (button)
```

---

### 14.7 Key Decisions Log

| Decision | Status | Rationale |
|----------|--------|-----------|
| Settings vs Dashboard split | ✅ Decided | Account settings universal; profile settings mode-specific |
| Notification scope: account-wide | ✅ Decided | Simpler than per-mode; no clear user benefit to splitting |
| Remove Account Type badge | ✅ Decided | Misleading now that users can have both modes |
| Data export/deletion deferred | ✅ Decided | Not needed for demo; production requires legal review |
| SMS/push notifications deferred | ✅ Decided | Email-only for demo simplicity |

---

### 14.8 Implementation Status

| Item | Status | Notes |
|------|--------|-------|
| Settings page | ✅ Built | `/settings` exists |
| Account info editing | ✅ Built | Name, phone editable |
| Password change | ✅ Built | Full validation |
| Notification preferences UI | ✅ Built | Toggles exist |
| Notification preferences persistence | 🟡 Verify | May not save to DB |
| Data export | ⬜ Placeholder | Button only |
| Account deletion | ⬜ Placeholder | Button only |
| Remove Account Type badge | 🟡 Needed | Currently shows misleading role |

### Demo vs Production

| Feature | Demo | Production |
|---------|------|------------|
| Account info | ✅ Full | Same |
| Password change | ✅ Full | + strength meter, 2FA |
| Notifications | ✅ Email toggles | + SMS, push, per-channel |
| Data export | ⬜ Deferred | GDPR-compliant |
| Account deletion | ⬜ Deferred | Soft-delete + recovery |
| Session management | ⬜ Deferred | View/revoke sessions |

---

### 14.9 Cross-Chapter Integration

| Chapter | Integration Point |
|---------|-------------------|
| Ch 1: Authentication | Password change uses same auth system |
| Ch 5: Navigation | Settings accessible from account dropdown in both modes |
| Ch 19: Notifications | Preferences control notification delivery |
| Ch 21: Communications | Email templates for notification types |
| Ch 36: Data Export | Production data export implementation |

---

## Chapter 28: Marketing & SEO Pages

**Purpose**: Comprehensive SEO strategy and public-facing content architecture designed to dominate organic search, reduce paid traffic dependency, and build topical authority across the senior care ecosystem.

### 28.1 SEO Strategy Overview

**Competitive Landscape**: Competing against A Place for Mom, Caring.com, SeniorAdvisor, and general directories like Yelp and Google Business Profiles.

**Core Strategy**:
- **Topic-first URL clustering**: Group content by care type to build topical authority
- **Hub-and-spoke model**: Topic hubs link to articles, questions, and directories
- **Programmatic SEO**: City directories as highest ROI pages (scalable, high-intent)
- **Two content types**: Articles (editorial) and Questions (community/UGC)
- **Internal linking**: Every page strengthens related pages through deliberate cross-linking

**Success Metrics**:
- Organic traffic growth
- Indexed page count
- Featured snippet capture rate
- Domain authority improvement
- Conversion from SEO traffic to family/provider signups

### 28.2 Care Type Taxonomy

Nine primary care types form the foundation of URL architecture and content organization:

| Care Type | URL Slug | Category | Description |
|-----------|----------|----------|-------------|
| Home Care | `/home-care/` | Home-Based | Non-medical assistance (ADLs, companionship) |
| Home Health | `/home-health/` | Home-Based | Licensed medical care at home (nursing, PT, OT) |
| Assisted Living | `/assisted-living/` | Facility-Based | Residential communities with daily living support |
| Independent Living | `/independent-living/` | Facility-Based | Active adult communities, minimal care services |
| Memory Care | `/memory-care/` | Facility-Based | Specialized dementia/Alzheimer's care |
| Nursing Home | `/nursing-homes/` | Facility-Based | Skilled nursing facilities (SNFs), 24/7 medical care |
| Adult Day Care | `/adult-day-care/` | Community-Based | Daytime programs, caregiver respite |
| Rehab | `/rehab/` | Transitional | Short-term rehabilitation post-hospitalization |
| Hospice | `/hospice/` | End-of-Life | Comfort-focused care for terminal illness |

**Note**: Respite Care is a service attribute, not a primary care type. Providers offering respite indicate it within their service tags.

### 28.3 URL Architecture

**Topic-First Clustering Pattern**:
```
/[care-type]/                           → Topic Hub
/[care-type]/[state]/                   → State Directory
/[care-type]/[state]/[city]/            → City Directory
/[care-type]/[state]/[city]/[provider]/ → Provider Profile
/[care-type]/articles/                  → Article Index
/[care-type]/articles/[slug]/           → Individual Article
/[care-type]/questions/                 → Questions Index
/[care-type]/questions/[slug]/          → Individual Question
```

**Planning & Support Topics** (no provider directories):
```
/paying-for-care/                       → Topic Hub
/paying-for-care/articles/              → Article Index
/paying-for-care/articles/[slug]/       → Individual Article
/paying-for-care/questions/             → Questions Index

/legal-planning/                        → Topic Hub
/caregiver-support/                     → Topic Hub
/health-conditions/                     → Topic Hub
/aging-at-home/                         → Topic Hub
```

**Comparison Pages**:
```
/compare/                               → Comparison Hub
/compare/[a]-vs-[b]/                    → Direct Comparison
```
Examples: `/compare/assisted-living-vs-memory-care/`, `/compare/home-care-vs-home-health/`

**Special Content**:
```
/research/                              → Research Hub
/aging-in-america/                      → Editorial Series
/caregiver-jobs/                        → Job Seeker Landing
/company/                               → Company Information
/how-olera-works/                       → Transparency Hub
```

### 28.4 Care Journey Pathways

Three primary pathways families follow when seeking care:

**Pathway 1: Hospital Discharge**
```
Hospital Admission → Discharge Planning → Rehab/SNF → Next Level of Care
```
- Triggers: Surgery, stroke, fall, acute illness
- Timeline: 24-72 hours for placement decisions
- Content needs: "What to expect after hospital discharge," SNF vs rehab comparison, Medicare coverage

**Pathway 2: Clinical Escalation**
```
Primary Care Visit → Recognition of Decline → Family Discussion → Care Transition
```
- Triggers: Cognitive decline, mobility issues, medication management concerns
- Timeline: Weeks to months
- Content needs: "Signs your parent needs more help," care type comparisons, family conversation guides

**Pathway 3: Self-Directed Research**
```
Family Concern → Online Research → Care Assessment → Provider Selection
```
- Triggers: Proactive planning, observed changes, caregiver burnout
- Timeline: Variable, often extended research phase
- Content needs: Comprehensive guides, cost information, local directory pages

### 28.5 Page Type Specifications

#### 28.5.1 Topic Hubs

**Purpose**: Authority pages that serve as entry points for each care type or planning topic.

**URL Pattern**: `/[topic]/`

**Content Structure**:
- H1: "[Topic] Guide" or "Understanding [Topic]"
- Overview section (300-500 words)
- Quick navigation to subtopics
- Featured articles (3-5)
- Recent questions (3-5)
- Link to state/city directories (for care types with providers)
- Related care types section

**Internal Linking**:
- Links to all article and question index pages
- Links to comparison pages involving this care type
- Links to related topic hubs
- Links to state-level directories

**Schema Markup**: `WebPage` with `BreadcrumbList`

#### 28.5.2 State Directory Pages

**Purpose**: Aggregate all cities within a state for a specific care type.

**URL Pattern**: `/[care-type]/[state]/`

**Content Structure**:
- H1: "[Care Type] in [State]"
- State overview (150-300 words, unique per state)
- City links organized by region/population
- State-specific regulations callout
- Featured providers (top-rated in state)
- State statistics (provider count, average costs if available)

**Internal Linking**:
- Up to topic hub
- Down to city directories
- Across to same state in other care types

**Schema Markup**: `WebPage` with `BreadcrumbList`, `ItemList` for cities

#### 28.5.3 City Directory Pages

**Purpose**: Highest ROI programmatic pages. List all providers of a care type in a specific city.

**URL Pattern**: `/[care-type]/[state]/[city]/`

**Content Structure**:
- H1: "[Care Type] in [City], [State]"
- City overview (100-200 words)
- Provider cards with:
  - Provider name
  - Trust score (if sufficient data)
  - Review snippet
  - Services summary
  - CTA to profile
- Filter/sort options (not in URL, client-side)
- "Request information from multiple providers" CTA
- Nearby cities section
- Related care types in same city

**Provider Visibility Rules**:
- Providers appear in directories for ALL care types they offer (via service tags)
- Canonical URL uses provider's **primary care type**
- Example: A provider with primary type "Assisted Living" offering Memory Care appears in both `/assisted-living/texas/austin/` and `/memory-care/texas/austin/`

**Internal Linking**:
- Up to state directory
- Across to same city in other care types
- To individual provider profiles
- To relevant local articles/questions

**Schema Markup**: `LocalBusiness` aggregate, `ItemList`, `BreadcrumbList`

**Scalability**: ~27,000+ potential city directory pages (9 care types × 3,000+ cities)

#### 28.5.4 Provider Profile Pages

**Purpose**: Comprehensive provider information for conversion and SEO.

**URL Pattern**: `/[primary-care-type]/[state]/[city]/[provider-slug]/`

**Content Structure**: See Chapter 7: Provider Profiles for full specification.

**SEO Elements**:
- Unique meta description per provider
- Schema markup for `LocalBusiness` or `MedicalBusiness`
- Breadcrumb navigation
- Internal links to city directory, care type hub

**Primary Care Type Requirement**:
- Every provider MUST have a primary care type
- Primary care type determines canonical URL
- Multi-service providers tagged with additional care types for directory visibility

#### 28.5.5 Article Pages

**Purpose**: Editorial content for topical authority and informational queries.

**URL Pattern**: `/[topic]/articles/[slug]/`

**Content Types**:
- How-to guides ("How to Choose a Memory Care Facility")
- Informational explainers ("What Does Home Health Care Include?")
- Cost guides ("How Much Does Assisted Living Cost in California?")
- Checklists ("Questions to Ask When Touring a Nursing Home")
- Condition-specific ("Caring for Someone with Parkinson's Disease")

**Content Structure**:
- H1: Article title
- Author byline with credentials
- Last updated date
- Table of contents (for 1500+ word articles)
- Body content with H2/H3 structure
- Related articles sidebar
- Related questions section
- CTA to find local providers (contextual)

**Schema Markup**: `Article` with `Author`, `BreadcrumbList`

**Quality Standards**:
- Minimum 800 words for indexing
- Medical accuracy review for health-related content
- Annual review cycle for evergreen content
- Clear sourcing for statistics and claims

#### 28.5.6 Question Pages

**Purpose**: Community-generated content capturing long-tail queries and building engagement.

**URL Pattern**: `/[topic]/questions/[slug]/`

**Question System Specifications**:

| Attribute | Specification |
|-----------|---------------|
| Submission | Any authenticated user |
| Moderation | Auto-approve with flag triggers |
| Threading | 2-level depth maximum (question → answer → reply) |
| Reactions | "Helpful" only (single reaction type) |
| Editing | Author can edit within 24 hours |
| Deletion | Author can delete if no answers; soft-delete otherwise |

**Auto-Approve Flag Triggers**:
- Profanity filter match
- External URL in first post
- User has previous flagged content
- Duplicate detection match
- Spam pattern detection

**Content Structure**:
- H1: Question text
- Asker info (name, date)
- Question body/context
- Answers sorted by "Helpful" count
- Related questions
- Topic breadcrumb

**Schema Markup**: `QAPage` with `Question` and `Answer`

**Moderation Queue**: See Chapter 26: Admin System for queue specifications.

#### 28.5.7 Comparison Pages

**Purpose**: Capture "[A] vs [B]" search queries and aid decision-making.

**URL Pattern**: `/compare/[a]-vs-[b]/`

**Content Structure**:
- H1: "[Care Type A] vs [Care Type B]: What's the Difference?"
- Side-by-side comparison table
- Detailed breakdown by factor (cost, level of care, living situation)
- "Which is right for you?" decision guide
- Links to both topic hubs
- "Help me decide" CTA to care assessment

**Priority Comparisons**:
- Assisted Living vs Memory Care
- Home Care vs Home Health
- Assisted Living vs Nursing Home
- Independent Living vs Assisted Living
- Home Care vs Assisted Living

**Schema Markup**: `Article` with comparison table markup

### 28.6 Navigation Structure

#### 28.6.1 Primary Navigation

**Desktop Header**:
```
[Logo] [Home Care ▼] [Assisted Living ▼] [Memory Care ▼] [Nursing Homes ▼] [More ▼] [Help Me Decide]    [Sign In] [List Your Business]
```

**Dropdown Menus** (Top 4 Care Types):
Each dropdown contains:
- Overview link to topic hub
- "Find [Care Type] Near Me" (geolocation or manual entry)
- "Compare [Care Type]" link
- 2-3 featured articles
- "View All [Care Type] Resources"

#### 28.6.2 "More" Mega Menu

Comprehensive care ecosystem navigation:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ CARE TYPES                │ PLANNING & SUPPORT        │ RESOURCES               │
│                           │                           │                         │
│ • Home Care               │ • Paying for Care         │ • Research              │
│ • Home Health             │ • Legal Planning          │ • Aging in America      │
│ • Assisted Living         │ • Caregiver Support       │ • Compare Care Types    │
│ • Independent Living      │ • Health Conditions       │ • Care Assessment       │
│ • Memory Care             │ • Aging at Home           │                         │
│ • Nursing Homes           │                           │ COMPANY                 │
│ • Adult Day Care          │ LOOKING FOR WORK?         │                         │
│ • Rehab                   │                           │ • About Olera           │
│ • Hospice                 │ • Caregiver Jobs          │ • How Olera Works       │
│                           │                           │ • Contact Us            │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### 28.6.3 Footer Navigation

```
CARE TYPES              PLANNING              COMPANY               LEGAL & TRUST
─────────────────────────────────────────────────────────────────────────────────
Home Care               Paying for Care       About Us              Terms of Service
Home Health             Legal Planning        How Olera Works       Privacy Policy
Assisted Living         Caregiver Support     Careers               Accessibility
Independent Living      Health Conditions     Press                 Do Not Sell My Info
Memory Care             Aging at Home         Contact
Nursing Homes
Adult Day Care          FOR PROVIDERS
Rehab                   ─────────────
Hospice                 List Your Business
                        Provider Resources
                        Claim Your Listing
```

### 28.7 "Help Me Decide" Flow

**Entry Points**:
- Primary nav CTA button
- Topic hub CTAs
- Article contextual CTAs
- Comparison page CTAs
- Exit-intent modal (optional)

**Flow**: Routes to Care Assessment Wizard (Chapter 3: Onboarding)

**Assessment Captures**:
- Care recipient relationship
- Current living situation
- Care needs (ADLs, medical, cognitive)
- Location preferences
- Budget considerations
- Timeline urgency

**Output**: Personalized care type recommendations with links to relevant directories.

### 28.8 Job Seeker Capture

**Landing Page**: `/caregiver-jobs/`

**Purpose**: Capture professional caregivers seeking employment to build provider talent pool.

**Content Structure**:
- Value proposition for caregivers
- "Create Your Profile" CTA
- How it works explanation
- Featured provider partners
- Caregiver resources/articles

**Profile Creation Flow**:
1. Basic information
2. Experience and certifications
3. Availability and preferences
4. Work history
5. Profile photo (optional)

**Provider Visibility**:
- Providers toggle "Looking for caregivers" in profile settings
- Enabled providers appear in caregiver job search
- No job listings created; caregivers apply via provider contact

**Provider Profile Integration**:
- "Looking for work?" section on provider pages (when provider has visibility enabled)
- Links to caregiver signup flow
- See Chapter 7: Provider Profiles for placement specifications

### 28.9 Transparency Hub

**URL**: `/how-olera-works/`

**Purpose**: Build trust by explaining platform mechanics.

**Sections**:

| Page | URL | Content |
|------|-----|---------|
| Overview | `/how-olera-works/` | Platform mission and mechanics summary |
| How Listings Work | `/how-olera-works/listings/` | Claimed vs unclaimed, verification process |
| How Scores Work | `/how-olera-works/scores/` | Trust score methodology, data sources |
| How Reviews Work | `/how-olera-works/reviews/` | Review collection, verification, moderation |
| How Requests Work | `/how-olera-works/requests/` | Information request routing, provider matching |

### 28.10 Brand & Authority Content

#### 28.10.1 Research Hub

**URL**: `/research/`

**Purpose**: Original research, data reports, and industry analysis.

**Content Types**:
- Annual "State of Senior Care" reports
- Cost index data by region
- Consumer surveys
- Policy analysis

**SEO Value**: Linkable assets for earning backlinks, establishing domain authority.

#### 28.10.2 Aging in America Series

**URL**: `/aging-in-america/`

**Purpose**: Editorial series exploring demographics, cultural perspectives, and societal trends.

**Content Approach**: Long-form journalism, data visualization, personal stories.

**SEO Value**: Brand awareness, social sharing, media coverage potential.

#### 28.10.3 Company Pages

**URL Structure**:
```
/company/                  → About Olera
/company/careers/          → Careers
/company/press/            → Press & Media
/company/contact/          → Contact Us
```

### 28.11 Internal Linking Strategy

**Principles**:
1. Every page links up (to parent in hierarchy)
2. Every page links across (to related content)
3. Hub pages link down to all children
4. Contextual links within content body
5. Related content blocks on all pages

**Automated Linking**:
- Article/Question pages auto-link to relevant city directories
- City directories auto-link to nearby cities
- Provider profiles auto-link to care type hubs
- Cross-care-type linking on geographic pages

**Manual Curation**:
- Featured articles on hub pages
- "Related reading" in articles
- "You might also ask" in questions

### 28.12 Scalable Page Table

| Page Type | URL Pattern | Quantity | ROI | Priority |
|-----------|-------------|----------|-----|----------|
| City Directories | `/[care-type]/[state]/[city]/` | ~27,000 | ★★★★★ | P0 |
| State Directories | `/[care-type]/[state]/` | ~450 | ★★★★☆ | P0 |
| Topic Hubs | `/[topic]/` | ~15 | ★★★★★ | P0 |
| Provider Profiles | `/[care-type]/.../[provider]/` | ~50,000+ | ★★★★☆ | P0 |
| Comparison Pages | `/compare/[a]-vs-[b]/` | ~20 | ★★★★☆ | P1 |
| Articles | `/[topic]/articles/[slug]/` | 200+ | ★★★☆☆ | P1 |
| Question Pages | `/[topic]/questions/[slug]/` | 1,000+ | ★★★☆☆ | P2 |
| Planning Hubs | `/[planning-topic]/` | 5 | ★★★★☆ | P1 |
| Transparency Hub | `/how-olera-works/...` | 5 | ★★☆☆☆ | P2 |
| Research Hub | `/research/` | 10+ | ★★★☆☆ | P2 |
| Caregiver Jobs | `/caregiver-jobs/` | 1 | ★★☆☆☆ | P2 |

**ROI Rationale**:
- City directories: High-intent, scalable, programmatic generation
- Provider profiles: Conversion pages, unique content per listing
- Topic hubs: Authority signals, link equity distribution
- Comparisons: Decision-stage queries, high conversion potential
- Articles: Informational intent, brand building, backlink potential
- Questions: Long-tail capture, community engagement, UGC scale

### 28.13 Technical SEO Requirements

| Requirement | Implementation |
|-------------|----------------|
| Sitemap | Dynamic XML sitemaps by page type |
| Robots.txt | Allow all indexable pages, block admin/auth |
| Canonical URLs | Self-referencing canonicals, handle pagination |
| Meta Tags | Unique title/description per page type |
| Open Graph | Social preview optimization |
| Schema Markup | Page-type-specific structured data |
| Page Speed | Core Web Vitals optimization |
| Mobile | Mobile-first responsive design |
| HTTPS | Site-wide SSL |
| Internationalization | `hreflang` if expanding (future) |

### 28.14 Implementation Status

| Item | Status | Notes |
|------|--------|-------|
| 29.1 Homepage | ✅ | `/` - search-centric |
| 29.2 For Providers Landing | ✅ | `/for-providers` |
| 29.3 Topic Hubs (Care Types) | ⬜ | 9 hubs needed |
| 29.4 Topic Hubs (Planning) | ⬜ | 5 hubs needed |
| 29.5 State Directory Pages | ⬜ | Programmatic generation |
| 29.6 City Directory Pages | ⬜ | Programmatic generation |
| 29.7 Provider Profile SEO | 🟡 | Profiles exist, SEO optimization needed |
| 29.8 Article System | ⬜ | CMS and templates |
| 29.9 Questions System | ⬜ | Submission, moderation, display |
| 29.10 Comparison Pages | ⬜ | Template and content |
| 29.11 Transparency Hub | ⬜ | 5 pages |
| 29.12 Research Hub | ⬜ | Template and initial content |
| 29.13 Caregiver Jobs Landing | ⬜ | Landing page and profile flow |
| 29.14 Navigation Implementation | 🟡 | Primary nav exists, mega menu needed |
| 29.15 Footer Update | ⬜ | Full footer with all sections |
| 29.16 Schema Markup | ⬜ | Page-type-specific |
| 29.17 XML Sitemaps | ⬜ | Dynamic generation |
| 29.18 Care Assessment Integration | 🟡 | Wizard exists, "Help Me Decide" CTAs needed |

### 28.15 Cross-Chapter Dependencies

| Chapter | Update Required |
|---------|-----------------|
| Foundational Decisions | Care pathways documentation |
| Ch 3: Onboarding | Care assessment for "Help Me Decide" flow, caregiver profile flow |
| Ch 5: Navigation | Mega menu structure, footer structure, hub access |
| Ch 7: Provider Profiles | Primary care type requirement, "Looking for work?" section |
| Ch 24: Trust & Safety | Questions moderation rules |
| Ch 27: Admin System | Questions moderation queue |
| Ch 38: Legal | Transparency hub pages |

### Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| URL Structure | Topic-first clustering | Builds topical authority, cleaner hierarchy |
| Care Types | 9 primary types | Comprehensive coverage without over-segmentation |
| Content Types | Articles + Questions | Simplicity; guides are long articles, forums are questions |
| Question Threading | 2-level max | Prevents deep nesting, maintains readability |
| Question Reactions | "Helpful" only | Single signal simplifies UX and ranking |
| Question Moderation | Auto-approve + flags | Scales without bottleneck while catching issues |
| Primary Care Type | Required field | Ensures canonical URL, enables directory logic |
| Navigation | 4 dropdowns + mega menu | Balances quick access with comprehensive discovery |
| Comparison | Dedicated pillar | Captures high-intent "[A] vs [B]" queries |

### Key Questions
- [x] SEO pages priority for demo? → City directories and topic hubs are P0
- [x] Content strategy deferred? → No, comprehensive strategy defined above

---
---

## Chapter 29: Referral Programs & Partner Attribution
### 29.0 Purpose & Scope
**Purpose**: Track how users discover Olera, enable word-of-mouth growth through referral programs, and manage partner relationships for B2B acquisition channels.

**Why This Matters**:

- **Marketing ROI**: Know which campaigns, partners, or referrers drive signups
- **Growth**: Incentivize users to invite others (word-of-mouth is high-trust in senior care)
- **Partnerships**: Track referrals from hospitals, social workers, senior centers, etc.

#### Scope Labels Used in This Chapter

| Label | Meaning |
|-------|---------|
| 🟢 DEMO | Build for demo. Minimal implementation, functional for investor/stakeholder presentation. |
| 🔵 PRODUCTION | Build for production launch. Not needed for demo but required before public release. |
| ⚪ FUTURE | Optional/aspirational. Not committed. May never be built. |

Section 29.0 — Approve / Modify / Reject

---

### 29.1 Attribution Fundamentals (CLARIFIED)

This section explains what attribution means and why we track it differently in demo vs production.

#### 29.1.1 What Is Attribution?

Attribution answers one question: **"How did this user find Olera?"**

When someone signs up, we want to know:

- Did they click a Google ad?
- Did they come from a partner website (e.g., a hospital)?
- Did a friend refer them?
- Did they find us organically?

This data helps us understand what's working and where to invest marketing dollars.

#### 29.1.2 Demo vs Production Attribution — Plain Language

| Aspect | Demo Scope 🟢 | Production Scope 🔵 |
|--------|---------------|---------------------|
| What we capture | UTM parameters only (from URLs) | UTM + referral codes + partner IDs |
| Why | Proves we can track marketing campaigns | Full growth engine with incentives |
| User experience | Invisible — no user action needed | May involve entering referral codes |
| Complexity | Very low — just read URL params | Medium — rewards, validation, fraud prevention |
| Marketing use | "Users came from Facebook campaign X" | "Users came from partner Y, referrer Z, campaign X" |

#### 29.1.3 Why Demo Only Needs UTM

For the demo, stakeholders need to see:

1. We can track where users come from
2. We have the infrastructure to attribute signups

UTM parameters achieve this with zero user friction and minimal code. Referral codes and partner tracking add complexity that doesn't improve the demo but could introduce bugs.

#### 29.1.4 What Happens to Attribution Data

| Stage | Demo 🟢 | Production 🔵 |
|-------|---------|---------------|
| Capture | Store on User record at signup | Same |
| Visibility | Admin panel (user detail page) | Admin panel + analytics dashboards |
| Reporting | Basic counts by source/medium | Full funnel analysis, cohort tracking |
| Action | None (informational only) | Trigger rewards, partner payouts, campaign optimization |

Section 29.1 (Attribution Fundamentals) — Approve / Modify / Reject

---

### 29.2 UTM Parameter Tracking 🟢 DEMO

**Scope**: Demo-approved. Build this.

#### 29.2.1 What Are UTM Parameters?

UTM parameters are tags added to URLs that tell you where traffic came from.

**Example URL**:

```
https://olera.com/?utm_source=facebook&utm_medium=cpc&utm_campaign=launch2025
```

When a user clicks this link and signs up, we know:

- **Source**: Facebook
- **Medium**: CPC (cost-per-click / paid ad)
- **Campaign**: launch2025

#### 29.2.2 Standard UTM Parameters

| Parameter | Purpose | Example Values |
|-----------|---------|----------------|
| `utm_source` | Where the traffic came from | `google`, `facebook`, `newsletter`, `partner_hospital` |
| `utm_medium` | Marketing channel type | `cpc`, `email`, `social`, `referral` |
| `utm_campaign` | Specific campaign name | `launch2025`, `spring_promo`, `caregiver_outreach` |
| `utm_term` | Paid search keyword (optional) | `senior care near me` |
| `utm_content` | Differentiates ad variations (optional) | `blue_button`, `hero_image_v2` |

#### 29.2.3 Implementation

**Capture Flow**:

```
User clicks link with UTM params
       ↓
Landing page JavaScript reads URL params
       ↓
Store in sessionStorage (persists across pages)
       ↓
On signup, send UTM data to API
       ↓
Save to User record in database
```

**Schema Addition (Prisma)**:

```prisma
model User {
  // ... existing fields ...

  // Attribution (Demo)
  utmSource      String?   // e.g., "facebook"
  utmMedium      String?   // e.g., "cpc"
  utmCampaign    String?   // e.g., "launch2025"
  utmTerm        String?   // e.g., "senior care"
  utmContent     String?   // e.g., "blue_button"
  attributedAt   DateTime? // When attribution was captured
}
```

**Admin Visibility**:

- User detail page shows attribution source
- Basic table/list: "Users by Source" (group by utmSource)

#### 29.2.4 Demo Deliverables

| Item | Required |
|------|----------|
| UTM capture on landing page | ✅ |
| Persist through signup flow | ✅ |
| Save to User record | ✅ |
| Display in admin user detail | ✅ |
| Analytics dashboard | ⬜ Defer |

Section 29.2 (UTM Parameter Tracking) — Approve / Modify / Reject

---

### 29.3 Referral Codes 🔵 PRODUCTION

**Scope**: Production only. Defer for demo.

#### 29.3.1 What Are Referral Codes?

A referral code is a unique identifier that lets existing users invite new users — and optionally earn a reward when the new user signs up.

**Example**:

1. Sarah is an Olera user
2. Sarah's referral code is `SARAH2025`
3. Sarah shares: "Sign up at olera.com with code SARAH2025"
4. New user enters `SARAH2025` at signup
5. Both Sarah and the new user may receive a reward

#### 29.3.2 Why Defer for Demo?

| Concern | Risk Level |
|---------|------------|
| Reward fulfillment logic | Medium — needs careful design |
| Fraud prevention | Medium — fake accounts, self-referral |
| User experience complexity | Low-Medium — extra signup field |
| Edge cases | Medium — expired codes, duplicate use |

For demo, UTM tracking proves attribution works. Referral codes add complexity without improving the demo narrative.

#### 29.3.3 Production Design (Placeholder)

**Schema Addition (Production)**:

```prisma
model ReferralCode {
  id          String   @id @default(cuid())
  code        String   @unique  // e.g., "SARAH2025"
  ownerId     String   // User who owns this code
  owner       User     @relation(fields: [ownerId], references: [id])
  usageCount  Int      @default(0)
  maxUses     Int?     // NULL = unlimited
  expiresAt   DateTime?
  createdAt   DateTime @default(now())
}

model ReferralRedemption {
  id             String   @id @default(cuid())
  referralCodeId String
  referralCode   ReferralCode @relation(...)
  referredUserId String   @unique  // New user who used the code
  referredUser   User     @relation(...)
  rewardStatus   String   // PENDING, GRANTED, EXPIRED
  createdAt      DateTime @default(now())
}
```

**Reward Options** (to be decided in production):

- Account credit
- Free month of premium
- Gift card
- No reward (tracking only)

Section 29.3 (Referral Codes) — Approve / Modify / Reject

---

### 29.4 Partner & Affiliate Tracking 🔵 PRODUCTION (CLARIFIED)

**Scope**: Production only. Defer for demo.

#### 29.4.1 What Is Partner/Affiliate Tracking?

This is B2B attribution — tracking when users come from organizational partners rather than individual referrers.

**Examples of Partners**:

| Partner Type | Example | How They Refer |
|--------------|---------|----------------|
| Hospitals | Mercy Health discharge planning | Link on patient portal, social worker referral |
| Senior centers | Local YMCA senior program | Flyers, website link |
| Insurance companies | Medicare Advantage plans | Member portal, care navigator |
| Social workers | Independent geriatric care managers | Direct recommendations |
| Content affiliates | Senior care blogs | Affiliate links in articles |

#### 29.4.2 Why This Matters (Production)

**For Olera**:

- Understand which partnerships drive volume
- Measure partner ROI
- Prioritize partnership development

**For Partners**:

- Potentially receive referral fees or revenue share
- Track their impact
- Co-marketing opportunities

#### 29.4.3 Why Defer for Demo?

| Concern | Explanation |
|---------|-------------|
| No partners yet | Demo is internal; no live B2B relationships |
| Revenue share complexity | Requires legal, finance, contracts |
| Partner portal | Partners would need a dashboard (significant scope) |
| Demo value | UTM tracking can simulate partner attribution (use `utm_source=partner_mercy_health`) |

**Demo Workaround**: Use UTM parameters to simulate partner tracking:

```
https://olera.com/?utm_source=partner_mercy_health&utm_medium=referral&utm_campaign=discharge_pilot
```

This proves the tracking works without building partner infrastructure.

#### 29.4.4 Production Design (Placeholder)

**Schema Addition (Production)**:

```prisma
model Partner {
  id            String   @id @default(cuid())
  name          String   // "Mercy Health"
  type          String   // HOSPITAL, SENIOR_CENTER, INSURANCE, AFFILIATE
  contactEmail  String?
  revenueShare  Float?   // e.g., 0.10 for 10%
  partnerCode   String   @unique  // URL-safe identifier
  active        Boolean  @default(true)
  createdAt     DateTime @default(now())

  referrals     PartnerReferral[]
}

model PartnerReferral {
  id          String   @id @default(cuid())
  partnerId   String
  partner     Partner  @relation(...)
  userId      String   // User who signed up
  user        User     @relation(...)
  payoutStatus String  // PENDING, PAID, WAIVED
  createdAt   DateTime @default(now())
}
```

**Partner Portal Features** (Future):

- Partner login
- Referral dashboard
- Payout history
- Marketing materials

Section 29.4 (Partner & Affiliate Tracking) — Approve / Modify / Reject

---

### 29.5 Caregiver-to-Caregiver Referral Model 🔵 PRODUCTION (NEW)

**Scope**: Production only. This section addresses the user feedback about referral model clarity.

#### 29.5.1 Who Refers Whom?

| Referrer | Referee | Supported? | Rationale |
|----------|---------|------------|-----------|
| Caregiver → Caregiver | | ✅ Yes | Natural word-of-mouth; students, nursing peers |
| Family → Family | | ✅ Yes | Families share resources when navigating care |
| Provider → Family | | 🟡 Indirect | Providers don't "refer" families; families find providers |
| Provider → Provider | | ❌ No | Unclear value; providers are competitors, not referrers |

#### 29.5.2 Why Caregiver Referrals Make Sense

The natural referral path:

1. Maria is a CNA student using Olera to find her first job
2. Maria tells her classmate Devon: "Use Olera, it's great"
3. Devon signs up using Maria's referral link
4. Both get a small reward

**Why this works**:

- **High trust**: Peer recommendations in caregiving are powerful
- **Network effects**: Nursing programs, CNA classes, caregiver communities
- **Low cost to serve**: Caregivers are individual users, not complex B2B

#### 29.5.3 Why Provider-to-Provider Referrals Are Excluded

| Reason | Explanation |
|--------|-------------|
| Competitive dynamics | Assisted living facilities don't refer families to competitors |
| Unclear incentive | What would a provider gain by referring another provider? |
| Complexity | B2B referrals require contracts, legal review, revenue share |
| Low volume | Few providers would participate |

**Exception**: A provider might refer a *caregiver* to another provider for employment. This is covered by the caregiver job marketplace, not the referral program.

#### 29.5.4 Proposed Caregiver Referral Rewards

| Reward Type | Referrer Gets | New User Gets | Complexity |
|-------------|---------------|---------------|------------|
| Account credit | $10 credit | $10 credit | Low |
| Free premium month | 1 month free | 1 month free | Low |
| Feature unlock | Priority placement | Priority placement | Medium |
| Cash/gift card | $10 gift card | — | High (fulfillment) |

**Recommendation**: Start with account credit or free premium month. These are:

- Easy to implement (no external fulfillment)
- Valuable to caregivers (especially students)
- Low fraud risk (credit only usable on platform)

#### 29.5.5 Anti-Fraud Measures (Production)

| Measure | Purpose |
|---------|---------|
| Email verification required | Prevent fake account farms |
| One referral reward per IP (soft limit) | Reduce self-referral |
| Reward only after profile completion | Ensure real engagement |
| Manual review for high-volume referrers | Catch abuse patterns |
| Referral code expiration | Limit long-tail fraud |

#### 29.5.6 How It Would Be Marketed

**To Caregivers**:

> "Love Olera? Share it with a friend and you'll both get a free month of Premium."

**Channels**:

- In-app prompt after positive actions (job saved, message sent)
- Email: "Share Olera with your classmates"
- Social share buttons with pre-filled text

**Messaging Themes**:

- Help a friend find work
- Support your fellow caregivers
- Grow together

Section 29.5 (Caregiver-to-Caregiver Referral Model) — Approve / Modify / Reject

---

### 29.6 Prisma Schema Summary

#### 29.6.1 Demo Schema (UTM Only) 🟢

```prisma
model User {
  // ... existing fields ...

  // Attribution - Demo
  utmSource      String?
  utmMedium      String?
  utmCampaign    String?
  utmTerm        String?
  utmContent     String?
  attributedAt   DateTime?
}
```

#### 29.6.2 Production Schema Additions 🔵

```prisma
// Referral Codes
model ReferralCode {
  id          String    @id @default(cuid())
  code        String    @unique
  ownerId     String
  owner       User      @relation("ReferralCodeOwner", fields: [ownerId], references: [id])
  usageCount  Int       @default(0)
  maxUses     Int?
  expiresAt   DateTime?
  active      Boolean   @default(true)
  createdAt   DateTime  @default(now())

  redemptions ReferralRedemption[]
}

model ReferralRedemption {
  id             String       @id @default(cuid())
  referralCodeId String
  referralCode   ReferralCode @relation(fields: [referralCodeId], references: [id])
  referredUserId String       @unique
  referredUser   User         @relation("ReferredUser", fields: [referredUserId], references: [id])
  rewardStatus   String       @default("PENDING") // PENDING, GRANTED, EXPIRED, REVOKED
  rewardType     String?      // CREDIT, FREE_MONTH, etc.
  rewardValue    Int?         // e.g., 1000 for $10.00 credit (cents)
  grantedAt      DateTime?
  createdAt      DateTime     @default(now())
}

// Partner/Affiliate Tracking
model Partner {
  id            String    @id @default(cuid())
  name          String
  type          String    // HOSPITAL, SENIOR_CENTER, INSURANCE, AFFILIATE, OTHER
  partnerCode   String    @unique
  contactName   String?
  contactEmail  String?
  revenueShare  Float?    // Decimal, e.g., 0.10 = 10%
  active        Boolean   @default(true)
  notes         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  referrals     PartnerReferral[]
}

model PartnerReferral {
  id           String   @id @default(cuid())
  partnerId    String
  partner      Partner  @relation(fields: [partnerId], references: [id])
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  payoutStatus String   @default("PENDING") // PENDING, PAID, WAIVED
  payoutAmount Int?     // In cents
  paidAt       DateTime?
  createdAt    DateTime @default(now())

  @@unique([partnerId, userId])
}

// User additions for production
model User {
  // ... existing fields ...

  // Referral relationships
  referralCodes     ReferralCode[]       @relation("ReferralCodeOwner")
  referredBy        ReferralRedemption?  @relation("ReferredUser")
  partnerReferral   PartnerReferral?

  // Account credit (for referral rewards)
  accountCreditCents Int @default(0)
}
```

Section 29.6 (Prisma Schema Summary) — Approve / Modify / Reject

---

### 29.7 Admin Panel Views

#### 29.7.1 Demo Admin Views 🟢

**User Detail Page** — Add attribution section:

```
┌─────────────────────────────────────────────┐
│ Attribution                                 │
├─────────────────────────────────────────────┤
│ Source:    facebook                         │
│ Medium:    cpc                              │
│ Campaign:  launch2025                       │
│ Captured:  Jan 15, 2025 at 2:34 PM         │
└─────────────────────────────────────────────┘
```

**Users List** — Optional column: "Source" (shows utmSource or "Direct")

#### 29.7.2 Production Admin Views 🔵

**Attribution Dashboard** (`/admin/attribution`):

- Signups by source (pie chart)
- Signups by campaign (bar chart)
- Referral leaderboard (top referrers)
- Partner performance table

**Referral Management** (`/admin/referrals`):

- All referral codes
- Redemption history
- Pending rewards
- Fraud flags

**Partner Management** (`/admin/partners`):

- Partner list with referral counts
- Payout queue
- Partner detail/edit

Section 29.7 (Admin Panel Views) — Approve / Modify / Reject

---

### 29.8 Platform-Wide Reconciliation

#### 29.8.1 Cross-Chapter Dependencies

| Chapter | Integration Point | Status |
|---------|-------------------|--------|
| Ch 1: Authentication & Account Management | Capture UTM at signup | 🟢 Demo |
| Ch 3: Onboarding Wizard | Persist UTM through onboarding flow | 🟢 Demo |
| Ch 14: Settings & Preferences | Referral code display (Production) | 🔵 Production |
| Ch 19: Notifications | "You earned a referral reward" | 🔵 Production |
| Ch 26: Admin System | Attribution views in user management | 🟢 Demo (basic) |
| Ch 37: Analytics & Audit Logging | Attribution reporting | 🔵 Production |
| Ch 38: Third-Party Services & Integrations | Analytics tools (Mixpanel, etc.) | 🔵 Production |

#### 29.8.2 Data Flow

**Demo Flow (UTM Only)**:

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Landing Page │ →  │ Signup Form  │ →  │ User Record  │
│ (read UTM)   │    │ (pass UTM)   │    │ (store UTM)  │
└──────────────┘    └──────────────┘    └──────────────┘
```

**Production Flow (Full)**:

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Landing Page │ →  │ Signup Form  │ →  │ User Record  │
│ (read UTM)   │    │ + ref code   │    │ + referral   │
│ (read partner│    │ field        │    │ + partner    │
│  code)       │    │              │    │ link         │
└──────────────┘    └──────────────┘    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Reward       │
                    │ Processing   │
                    └──────────────┘
```

#### 29.8.3 Numbering & TOC Check

- Chapter 29 follows Chapter 28 (to be verified)
- No numbering gaps introduced
- TOC entry exists at line 129

Section 29.8 (Platform-Wide Reconciliation) — Approve / Modify / Reject

---

### 29.9 Implementation Status

| Item | Demo 🟢 | Production 🔵 | Notes |
|------|---------|---------------|-------|
| 29.1 Attribution Fundamentals | N/A | N/A | Conceptual |
| 29.2 UTM Parameter Tracking | ⬜ Build | ✅ Included | Demo deliverable |
| 29.3 Referral Codes | ⬜ Defer | ⬜ Build | Production only |
| 29.4 Partner/Affiliate Tracking | ⬜ Defer | ⬜ Build | Production only |
| 29.5 Caregiver Referral Model | ⬜ Defer | ⬜ Build | Production only |
| 29.6 Schema (UTM fields) | ⬜ Build | ✅ Included | Demo deliverable |
| 29.6 Schema (Referral/Partner) | ⬜ Defer | ⬜ Build | Production only |
| 29.7 Admin Attribution View | ⬜ Build | ✅ Included | Demo deliverable |
| 29.7 Admin Referral/Partner | ⬜ Defer | ⬜ Build | Production only |

Section 29.9 (Implementation Status) — Approve / Modify / Reject

---

### 29.10 Key Decisions Log

| Decision | Status | Rationale |
|----------|--------|-----------|
| UTM tracking for demo | ✅ Approved | Low complexity, proves attribution works |
| Defer referral codes to production | ✅ Approved | Adds complexity without demo value |
| Defer partner tracking to production | ✅ Approved | No partners for demo; UTM can simulate |
| Caregiver-to-caregiver referrals | ✅ Approved (concept) | Natural word-of-mouth path |
| Exclude provider-to-provider referrals | ✅ Approved | Unclear value, competitive dynamics |
| Reward type: account credit | 🟡 Recommended | Simple, no external fulfillment |
| Standard 5-parameter UTM | ✅ Approved | Industry standard |

Section 29.10 (Key Decisions Log) — Approve / Modify / Reject

---

### Summary: Demo vs Production

| Feature | Demo 🟢 | Production 🔵 | Future ⚪ |
|---------|---------|---------------|----------|
| UTM parameter capture | ✅ | ✅ | — |
| UTM in admin panel | ✅ | ✅ | — |
| Referral codes | — | ✅ | — |
| Caregiver referral rewards | — | ✅ | — |
| Family referral rewards | — | ✅ | — |
| Partner/affiliate tracking | — | ✅ | — |
| Partner portal | — | — | ⚪ |
| Revenue share payouts | — | — | ⚪ |
| Advanced attribution analytics | — | ✅ | — |
| A/B test attribution | — | — | ⚪ |

**Full Chapter 29 — Approve / Modify / Reject**

---

### Update Todos

- [x] Draft complete Chapter 29 with all sections
- [x] Clarify Section 2.1 (Demo vs Production Attribution)
- [x] Clarify Section 2.4 (Partner/Affiliate Tracking)
- [x] Add Caregiver-to-Caregiver Referral Model section
- [x] Present all sections for approval
- [x] Awaiting user approval
- [x] Commit approved changes to H9VzE branch

---

## Chapter 31: Application Architecture & Tech Stack

**Review Status**: ✅ Reviewed

**Purpose**: Document the complete technical architecture enabling the Olera platform, serving as the single source of truth for all technology decisions.

> **Cross-References**:
> - Chapter 32 (Hosting & Deployment): Vercel configuration, environment management
> - Chapter 33 (File Uploads): Vercel Blob storage integration
> - Chapter 35 (Error Handling): Error architecture patterns
> - Chapter 36 (Performance): Database indexes, caching strategies
> - Chapter 38 (Third-Party Services): Complete service registry

---

### 31.1 Technology Stack Overview

**Core Stack Summary**:

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Framework** | Next.js | 15.1.0 | Full-stack React framework (App Router) |
| **Language** | TypeScript | 5.7.2 | Type-safe JavaScript |
| **UI Library** | React | 18.3.1 | Component-based UI |
| **Styling** | Tailwind CSS | 3.4.17 | Utility-first CSS |
| **Database** | PostgreSQL | — | Relational database (hosted on Neon) |
| **ORM** | Prisma | 6.2.0 | Type-safe database client |
| **Authentication** | NextAuth.js | 4.24.11 | Auth framework for Next.js |
| **Validation** | Zod | 3.24.1 | Schema validation |
| **File Storage** | Vercel Blob | 2.0.0 | Object storage for uploads |
| **Hosting** | Vercel | — | Serverless deployment platform |

**Key Dependencies**:

| Package | Purpose |
|---------|---------|
| `@headlessui/react` | Accessible UI components (modals, dropdowns) |
| `react-hot-toast` | Toast notifications |
| `date-fns` | Date manipulation |
| `bcryptjs` | Password hashing |
| `leaflet` / `react-leaflet` | Map components |
| `marked` | Markdown parsing |
| `isomorphic-dompurify` | HTML sanitization |

---

### 31.2 Frontend Architecture

#### 31.2.1 Next.js App Router

**Router**: App Router (Next.js 13+)

**Key Features Used**:
- Server Components (default)
- Client Components (`"use client"` directive)
- API Routes (`app/api/`)
- Layouts and nested routing
- Loading and error states

**Directory Structure**:
```
app/
├── layout.tsx              # Root layout (providers, global styles)
├── page.tsx                # Homepage
├── error.tsx               # Global error boundary
├── not-found.tsx           # 404 page
├── globals.css             # Global styles
├── api/                    # API routes (20 directories)
├── admin/                  # Admin pages
├── dashboard/              # User dashboard
├── provider/               # Provider pages
├── providers/              # Provider directory
├── login/                  # Auth pages
├── signup/
├── settings/
└── ...
```

#### 31.2.2 Component Architecture

**Component Organization**:
```
components/
├── Auth/                   # Authentication components
├── CareProfile/            # Family profile components
├── Dashboard/              # Dashboard widgets
├── Directory/              # Provider directory cards
├── Gallery/                # Photo gallery/upload
├── Loading/                # Loading skeletons
├── Messaging/              # Chat/messaging UI
├── Navigation/             # Header, sidebar, nav
├── Paywall/                # Subscription gates
├── Provider/               # Provider page components
├── ProviderProfile/        # Provider profile editing
├── Reviews/                # Review display/forms
├── SEO/                    # Meta tags, structured data
└── UI/                     # Shared UI primitives
```

**Component Patterns**:

| Pattern | Usage |
|---------|-------|
| Server Components | Data fetching, static content |
| Client Components | Interactive UI, forms, state |
| Composition | Layouts wrapping page content |
| Props drilling | Minimal; prefer server fetching |

#### 31.2.3 Styling with Tailwind

**Configuration**: Default Tailwind with custom theme extensions

**Patterns**:
- Utility classes for all styling
- `className` prop for component styling
- Responsive prefixes (`sm:`, `md:`, `lg:`)
- Dark mode: Not implemented for demo

| Feature | Demo | Production |
|---------|------|------------|
| Responsive design | ✅ | ✅ |
| Custom color palette | ✅ | ✅ |
| Dark mode | ⬜ Defer | ✅ |
| Component variants | 🟡 Ad-hoc | Design system |

---

### 31.3 Backend Architecture

#### 31.3.1 API Routes

**Location**: `app/api/`

**Route Categories**:

| Category | Routes | Purpose |
|----------|--------|---------|
| **Auth** | `/api/auth/*`, `/api/register` | Authentication, signup |
| **Users** | `/api/user/*` | User profile management |
| **Providers** | `/api/providers/*` | Provider CRUD, search |
| **Families** | `/api/family-profiles/*` | Family profile management |
| **Engagements** | `/api/requests/*` | Booking/engagement flow |
| **Messaging** | `/api/dashboard/messages/*` | Chat functionality |
| **Reviews** | `/api/reviews/*` | Review management |
| **Subscriptions** | `/api/subscription/*` | Stripe integration |
| **Notifications** | `/api/notifications/*` | In-app notifications |
| **Admin** | `/api/admin/*` | Admin operations |
| **Uploads** | `/api/upload/*` | File uploads |

**API Pattern**:
```typescript
// Standard API route structure
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // 1. Authentication check
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Business logic
  const data = await prisma.model.findMany({ ... });

  // 3. Response
  return NextResponse.json(data);
}
```

#### 31.3.2 Services Layer

**Location**: `lib/`

| File | Purpose |
|------|---------|
| `auth.ts` | NextAuth configuration, session handling |
| `prisma.ts` | Prisma client singleton |
| `mode-helpers.ts` | User mode (FAMILY/PROVIDER) utilities |
| `contact-masking.ts` | Contact info visibility logic |
| `providerUtils.ts` | Provider-specific utilities |
| `toast.ts` | Toast notification helpers |

**Prisma Client Pattern**:
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

#### 31.3.3 Validation with Zod

**Pattern**: Validate request bodies in API routes

```typescript
import { z } from 'zod';

const CreateReviewSchema = z.object({
  providerId: z.string(),
  rating: z.number().min(1).max(5),
  content: z.string().min(10).max(2000),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = CreateReviewSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  // Use validated data
  const { providerId, rating, content } = result.data;
}
```

---

### 31.4 Database Layer

#### 31.4.1 PostgreSQL on Neon

**Provider**: Neon (serverless PostgreSQL)

**Connection**: Via `DATABASE_URL` environment variable

**Features Used**:
- Standard PostgreSQL
- Serverless scaling (Neon)
- Connection pooling (Neon managed)

#### 31.4.2 Prisma ORM

**Schema Location**: `prisma/schema.prisma`

**Core Models**:

| Model | Purpose |
|-------|---------|
| `User` | User accounts (all roles) |
| `FamilyProfile` | Family/care recipient details |
| `Provider` | Provider listings |
| `ProviderIdentity` | Provider onboarding gate |
| `ConsultRequest` | Engagement/booking requests |
| `Review` | Provider reviews |
| `Subscription` | Stripe subscription data |
| `SavedProvider` | Family saved providers |
| `SavedFamilyProfile` | Provider saved families |
| `ContactView` | Contact info unlock tracking |
| `Notification` | In-app notifications |

**Enums**:

| Enum | Values |
|------|--------|
| `UserRole` | FAMILY, PROVIDER, ADMIN |
| `UserMode` | FAMILY, PROVIDER |
| `ProviderType` | HOME_CARE, ASSISTED_LIVING, MEMORY_CARE, ... |
| `CareType` | COMPANION_CARE, PERSONAL_CARE, SKILLED_NURSING, ... |
| `ConsultRequestStatus` | PENDING, ACCEPTED, DECLINED, COMPLETED, CANCELLED |
| `SubscriptionTier` | FREE, BASIC, PRO |
| `SubscriptionStatus` | ACTIVE, CANCELLED, EXPIRED, PAST_DUE |

**Key Indexes** (performance optimization):

| Model | Indexed Fields |
|-------|----------------|
| Provider | `city`, `state`, `providerType` |
| ConsultRequest | `familyProfileId`, `providerId`, `status` |
| SavedProvider | `userId`, `providerId` |
| Review | `providerId`, `userId` |

#### 31.4.3 Migrations

**Strategy**: `prisma db push` for demo (schema sync without migrations)

```bash
# Development: Push schema changes
npx prisma db push

# Generate client after schema changes
npx prisma generate
```

| Feature | Demo | Production |
|---------|------|------------|
| Schema push | ✅ `db push` | ⬜ |
| Migrations | ⬜ Defer | ✅ `prisma migrate` |
| Seed data | ✅ `prisma/seed.ts` | ✅ |

---

### 31.5 Authentication Infrastructure

#### 31.5.1 NextAuth.js Configuration

**Location**: `lib/auth.ts`

**Session Strategy**: JWT (stateless)

**Providers**:
- Credentials (email/password) — ✅ Implemented
- OAuth (Google, etc.) — ⬜ Deferred for demo

**Session Data**:
```typescript
{
  user: {
    id: string,
    email: string,
    name: string,
    role: 'FAMILY' | 'PROVIDER' | 'ADMIN',
    activeMode: 'FAMILY' | 'PROVIDER'
  }
}
```

#### 31.5.2 Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   /login    │ ──▶ │  NextAuth   │ ──▶ │  Prisma     │
│   (form)    │     │  authorize  │     │  (verify)   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  JWT Token  │
                    │  (cookie)   │
                    └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Session    │
                    │  (server)   │
                    └─────────────┘
```

**Mode Calculation on Login**:
- Default: FAMILY mode
- If user has Provider with ≥15% profile completion → PROVIDER mode
- Mode stored in `user.activeMode` and JWT

#### 31.5.3 Protected Routes

**Server-Side Protection**:
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return <div>Protected content</div>;
}
```

**API Route Protection**:
```typescript
const session = await getServerSession(authOptions);
if (!session?.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

### 31.6 Directory Structure

**Complete Project Structure**:
```
/home/user/test-web-app/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes (20 directories)
│   │   ├── auth/           # NextAuth handlers
│   │   ├── providers/      # Provider CRUD
│   │   ├── family-profiles/# Family CRUD
│   │   ├── requests/       # Engagements
│   │   ├── reviews/        # Reviews
│   │   ├── subscription/   # Stripe
│   │   ├── notifications/  # Notifications
│   │   ├── upload/         # File uploads
│   │   └── ...
│   ├── admin/              # Admin pages
│   ├── dashboard/          # User dashboard
│   ├── provider/           # Provider pages
│   ├── providers/          # Directory/search
│   ├── login/              # Auth pages
│   ├── signup/
│   ├── settings/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   ├── error.tsx           # Error boundary
│   ├── not-found.tsx       # 404 page
│   └── globals.css         # Global styles
├── components/              # React components (19 directories)
│   ├── Auth/
│   ├── CareProfile/
│   ├── Dashboard/
│   ├── Directory/
│   ├── Gallery/
│   ├── Messaging/
│   ├── Navigation/
│   ├── Provider/
│   ├── Reviews/
│   ├── UI/
│   └── ...
├── lib/                     # Utilities
│   ├── auth.ts             # NextAuth config
│   ├── prisma.ts           # Prisma client
│   ├── mode-helpers.ts     # Mode utilities
│   └── ...
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data script
├── types/                   # TypeScript definitions
├── public/                  # Static assets
├── scripts/                 # Build/utility scripts
├── docs/                    # Documentation
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json             # Vercel configuration
```

---

### 31.7 Environment Variables

**Required Variables**:

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `NEXTAUTH_SECRET` | JWT signing secret | Random 32+ char string |
| `NEXTAUTH_URL` | Base URL for auth | `https://olera.app` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob access | Vercel-provided |

**Optional/Future Variables**:

| Variable | Purpose | Demo Status |
|----------|---------|-------------|
| `STRIPE_SECRET_KEY` | Stripe payments | ⬜ If payments enabled |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhooks | ⬜ If payments enabled |
| `RESEND_API_KEY` | Email sending | ⬜ For communications |
| `TWILIO_ACCOUNT_SID` | SMS sending | ⬜ For communications |
| `TWILIO_AUTH_TOKEN` | SMS sending | ⬜ For communications |
| `TWILIO_PHONE_NUMBER` | SMS sender | ⬜ For communications |
| `SENTRY_DSN` | Error tracking | ⬜ Production only |

> **Cross-Reference**: See Chapter 38 (Third-Party Services) for complete environment variable registry.

---

## Chapter 32: Hosting, Deployment & CI/CD

**Review Status**: ✅ Reviewed

**Purpose**: Document hosting environment, deployment processes, and release management for the Olera platform.

> **Cross-References**:
> - Chapter 31 (Application Architecture): Technology stack details
> - Chapter 35 (Error Handling): Vercel logs for monitoring
> - Chapter 36 (Performance): Vercel Analytics
> - Chapter 38 (Third-Party Services): Vercel in service registry

---

### 32.1 Hosting Environment

#### 32.1.1 Vercel Platform

**Provider**: Vercel

| Feature | Description |
|---------|-------------|
| **Hosting Type** | Serverless (Functions + Edge) |
| **CDN** | Global Edge Network |
| **SSL** | Automatic HTTPS |
| **Domain** | Custom domain support |
| **Framework** | Next.js (first-class support) |

**Why Vercel**:
- Native Next.js integration (Vercel created Next.js)
- Zero-config deployments
- Automatic preview deployments
- Built-in analytics
- Serverless functions with no cold-start optimization

#### 32.1.2 Infrastructure Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         VERCEL INFRASTRUCTURE                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐  │
│   │   Edge Network  │     │   Serverless    │     │   Vercel Blob   │  │
│   │   (CDN/Static)  │     │   Functions     │     │   (Storage)     │  │
│   └────────┬────────┘     └────────┬────────┘     └────────┬────────┘  │
│            │                       │                       │           │
│            └───────────────────────┼───────────────────────┘           │
│                                    │                                    │
│                           ┌────────▼────────┐                          │
│                           │   Next.js App   │                          │
│                           └────────┬────────┘                          │
│                                    │                                    │
└────────────────────────────────────┼────────────────────────────────────┘
                                     │
                            ┌────────▼────────┐
                            │   Neon (DB)     │
                            │   PostgreSQL    │
                            └─────────────────┘
```

#### 32.1.3 Vercel Configuration

**File**: `vercel.json`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "prisma db push --accept-data-loss && npm run build",
  "framework": "nextjs"
}
```

**Configuration Notes**:
- Custom build command includes Prisma schema sync
- Framework auto-detected as Next.js
- No custom routes or redirects configured (Next.js handles routing)

| Setting | Value | Notes |
|---------|-------|-------|
| Build Command | `prisma db push && npm run build` | Schema sync before build |
| Output Directory | Auto (`.next`) | Next.js default |
| Install Command | `npm install` | Default |
| Node.js Version | 18.x | LTS version |

---

### 32.2 Deployment Pipeline

#### 32.2.1 Git-Based Workflow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Local     │     │   GitHub    │     │   Vercel    │
│   Dev       │ ──▶ │   Push      │ ──▶ │   Build     │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                    │
                           │                    ▼
                    ┌──────┴──────┐      ┌─────────────┐
                    │   Branch    │      │   Deploy    │
                    └─────────────┘      └─────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │  main    │ │  PR      │ │  feature │
        │  branch  │ │  branch  │ │  branch  │
        └────┬─────┘ └────┬─────┘ └────┬─────┘
             │            │            │
             ▼            ▼            ▼
        Production    Preview      Preview
```

#### 32.2.2 Deployment Types

| Type | Trigger | URL | Purpose |
|------|---------|-----|---------|
| **Production** | Push to `main` | `olera.app` | Live production site |
| **Preview** | Pull request | `*.vercel.app` | PR review, testing |
| **Branch** | Push to any branch | `*.vercel.app` | Development testing |

**Current Production URL**: `test-web-app-pi.vercel.app` (from `main` branch)

#### 32.2.3 Build Process

**Build Steps**:
1. Install dependencies (`npm install`)
2. Generate Prisma client (`postinstall: prisma generate`)
3. Sync database schema (`prisma db push`)
4. Build Next.js application (`next build`)
5. Deploy to Vercel infrastructure

**Build Output**:
```
├── .next/                  # Compiled application
│   ├── static/            # Static assets (JS, CSS)
│   ├── server/            # Server-side code
│   └── cache/             # Build cache
```

**Build Time**: ~2-3 minutes (typical)

| Step | Duration | Notes |
|------|----------|-------|
| Install | ~30s | npm dependencies |
| Prisma Generate | ~5s | Type generation |
| Prisma Push | ~10s | Schema sync |
| Next.js Build | ~90s | Compilation |
| Deploy | ~30s | Edge distribution |

---

### 32.3 Environment Management

#### 32.3.1 Environment Types

| Environment | Branch | Database | Purpose |
|-------------|--------|----------|---------|
| **Development** | local | Local or shared Neon | Local development |
| **Preview** | PR branches | Shared Neon (demo) | PR review |
| **Production** | `main` | Production Neon | Live site |

**Current Setup** (Demo):
- Single Neon database shared across all environments
- Production and preview use same data

**Production Setup** (Future):
- Separate databases per environment
- Database branching for previews

#### 32.3.2 Environment Variables

**Management**: Vercel Dashboard → Project → Settings → Environment Variables

**Variable Scopes**:

| Scope | Description |
|-------|-------------|
| Production | Only production deployments |
| Preview | All preview deployments |
| Development | Local development (via `.env.local`) |

**Required Variables by Environment**:

| Variable | Development | Preview | Production |
|----------|-------------|---------|------------|
| `DATABASE_URL` | ✅ | ✅ | ✅ |
| `NEXTAUTH_SECRET` | ✅ | ✅ | ✅ |
| `NEXTAUTH_URL` | ✅ | Auto | Auto |
| `BLOB_READ_WRITE_TOKEN` | ✅ | ✅ | ✅ |

**Local Development** (`.env.local`):
```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3001"
BLOB_READ_WRITE_TOKEN="vercel_blob_..."
```

> **Note**: `.env.local` is gitignored and not committed to version control.

#### 32.3.3 Secrets Management

| Secret Type | Storage | Access |
|-------------|---------|--------|
| Database credentials | Vercel env vars | Build + runtime |
| API keys | Vercel env vars | Runtime only |
| Auth secrets | Vercel env vars | Runtime only |

**Best Practices**:
- Never commit secrets to Git
- Use Vercel's encrypted environment variables
- Rotate secrets periodically (production)
- Use different values per environment

---

### 32.4 Build Configuration

#### 32.4.1 Next.js Configuration

**File**: `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable caching during development
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
};

export default nextConfig;
```

**Current Configuration**: Minimal (relies on Next.js defaults)

| Feature | Status | Notes |
|---------|--------|-------|
| Image optimization | ✅ Default | Vercel Image Optimization |
| API routes | ✅ Default | Serverless functions |
| Static generation | ✅ Default | Automatic |
| Edge runtime | ⬜ Not used | Could optimize specific routes |

#### 32.4.2 TypeScript Configuration

**File**: `tsconfig.json`

**Key Settings**:
- Strict mode enabled
- Path aliases (`@/*` → `/*`)
- Next.js plugin for type checking

#### 32.4.3 Package Scripts

**File**: `package.json`

```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate",
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

| Script | Purpose | When Used |
|--------|---------|-----------|
| `dev` | Local development server | Development |
| `build` | Production build | Vercel build |
| `start` | Start production server | Not used (Vercel) |
| `lint` | ESLint check | Development |
| `postinstall` | Generate Prisma client | After npm install |
| `seed` | Seed database | Manual |

---

### 32.5 Domain & SSL

#### 32.5.1 Domain Configuration

**Current Setup**:
- Vercel subdomain: `test-web-app-pi.vercel.app`
- Custom domain: ⬜ Not configured for demo

**Production Setup** (Future):
| Domain | Purpose |
|--------|---------|
| `olera.app` | Primary domain |
| `www.olera.app` | Redirect to primary |
| `app.olera.app` | Application (optional) |

#### 32.5.2 SSL/HTTPS

**Provider**: Vercel (automatic Let's Encrypt)

| Feature | Status |
|---------|--------|
| HTTPS enforcement | ✅ Automatic |
| SSL certificate | ✅ Auto-provisioned |
| Certificate renewal | ✅ Automatic |
| HTTP → HTTPS redirect | ✅ Automatic |

---

### 32.6 Monitoring & Logs

#### 32.6.1 Vercel Dashboard

**Location**: `vercel.com/dashboard`

**Available Metrics**:

| Metric | Description | Demo | Production |
|--------|-------------|------|------------|
| Deployment status | Build success/failure | ✅ | ✅ |
| Function invocations | API call counts | ✅ | ✅ |
| Function duration | Execution time | ✅ | ✅ |
| Edge requests | CDN traffic | ✅ | ✅ |
| Bandwidth | Data transfer | ✅ | ✅ |

#### 32.6.2 Logs

**Log Types**:

| Log Type | Access | Retention |
|----------|--------|-----------|
| Build logs | Vercel Dashboard | 7 days |
| Function logs | Vercel Dashboard → Logs | 1 hour (free tier) |
| Edge logs | Vercel Dashboard → Logs | 1 hour (free tier) |

**Accessing Logs**:
1. Vercel Dashboard → Project → Deployments
2. Select deployment → View Function Logs
3. Filter by timestamp, function name, status

#### 32.6.3 Vercel Analytics

**Features**:

| Feature | Demo | Production |
|---------|------|------------|
| Web Vitals | ✅ | ✅ |
| Page views | ✅ | ✅ |
| Unique visitors | ✅ | ✅ |
| Geographic distribution | ✅ | ✅ |
| Device breakdown | ✅ | ✅ |

> **Cross-Reference**: See Chapter 36 (Performance) for Core Web Vitals targets.

---

### 32.7 Rollbacks & Recovery

#### 32.7.1 Instant Rollback

**Feature**: Vercel supports instant rollback to any previous deployment

**Process**:
1. Vercel Dashboard → Deployments
2. Find previous stable deployment
3. Click "..." → "Promote to Production"

**Rollback Time**: < 1 minute (no rebuild required)

#### 32.7.2 Deployment History

**Retention**: All deployments retained indefinitely

| Action | Result |
|--------|--------|
| Rollback | Previous deployment becomes active |
| Redeploy | Rebuild from same commit |
| Promote | Make preview deployment production |

---

### 32.8 Demo vs Production Summary

| Feature | Demo | Production |
|---------|------|------------|
| Hosting | ✅ Vercel | ✅ Vercel |
| Custom domain | ⬜ Vercel subdomain | ✅ Custom domain |
| SSL | ✅ Automatic | ✅ Automatic |
| Environment separation | 🟡 Shared DB | ✅ Separate DBs |
| CI/CD | ✅ Git-based | ✅ Git-based |
| Preview deployments | ✅ | ✅ |
| Rollbacks | ✅ | ✅ |
| Monitoring | ✅ Vercel Dashboard | ✅ + Sentry |
| Log retention | 🟡 1 hour | ✅ Extended |

---

## Chapter 33: File Uploads & Media

**Review Status**: ✅ Reviewed

**Purpose**: Define the file upload and media management infrastructure for the Olera platform, covering image uploads (profile photos, galleries), document uploads (certificates, licenses), storage architecture, optimization strategies, and admin oversight.

> **Cross-References**:
> - Chapter 6 (Provider Profiles): Photo gallery integration
> - Chapter 7 (Family Profiles): Profile photo upload
> - Chapter 23 (Trust & Safety): Certificate/license verification documents
> - Chapter 26 (Admin System): Media Management section (Production)
> - Chapter 35 (Error Handling): Upload error states
> - Chapter 36 (Performance & Caching): Image optimization
> - Chapter 37 (Analytics & Audit Logging): File upload/delete audit trail
> - Chapter 38 (Third-Party Services): Vercel Blob storage

---

### 33.1 Storage Architecture

**Storage Provider**: Vercel Blob

| Attribute | Value |
|-----------|-------|
| **Provider** | Vercel Blob |
| **Why** | Native Vercel integration, automatic CDN, simple API |
| **Access** | Public URLs for images |
| **Naming** | Random suffix added automatically (prevents collisions) |
| **Regions** | Auto-distributed via Vercel Edge |

**Environment Variables**:
```
BLOB_READ_WRITE_TOKEN=<vercel-blob-token>
```

| Feature | Demo | Production |
|---------|------|------------|
| Vercel Blob storage | ✅ | ✅ |
| Public image URLs | ✅ | ✅ |
| CDN distribution | ✅ | ✅ |
| Private document storage | ⬜ Defer | ✅ |

---

### 33.2 Image Upload API

**Endpoint**: `POST /api/upload/images`

**Implementation** (verified in codebase):
```typescript
// Request: multipart/form-data with 'file' field
// Response: { url: string, pathname: string }
```

**Validation Rules**:

| Rule | Value | Error Message |
|------|-------|---------------|
| Authentication | Required | "Unauthorized" (401) |
| File presence | Required | "No file provided" (400) |
| File type | JPEG, PNG, WebP | "Invalid file type. Only JPEG, PNG, and WebP images are allowed." (400) |
| File size | Max 5MB | "File too large. Maximum size is 5MB." (400) |

**Response Format**:
```json
{
  "url": "https://xxxxx.public.blob.vercel-storage.com/image-abc123.jpg",
  "pathname": "image-abc123.jpg"
}
```

| Feature | Demo | Production |
|---------|------|------------|
| Image upload endpoint | ✅ Built | ✅ |
| Authentication required | ✅ Built | ✅ |
| File type validation | ✅ Built | ✅ |
| File size validation | ✅ Built | ✅ |
| Virus/malware scanning | ⬜ Defer | ✅ |

---

### 33.3 Upload Use Cases

#### 33.3.1 Profile Photos (Users & Providers)

**Component**: `ProfilePhotoUpload`

| Attribute | Value |
|-----------|-------|
| Max size | 5MB |
| Types | JPEG, PNG, WebP |
| Quantity | Single image |
| Crop/resize | Client-side (optional) |
| Storage field | `User.image` or `Provider.photoUrl` |

**Status**: ✅ Built and functional

#### 33.3.2 Provider Photo Gallery

**Component**: `EnhancedPhotoUpload`

| Attribute | Value |
|-----------|-------|
| Max size | 5MB per image |
| Types | JPEG, PNG, WebP |
| Quantity | Multiple (up to 10 recommended) |
| Storage field | `Provider.galleryUrls` (JSON array) |

**Status**: ✅ Built and functional

#### 33.3.3 Document Uploads (Certificates, Licenses)

**Status**: ⬜ Deferred for demo

**Production Scope**:

| Attribute | Value |
|-----------|-------|
| Max size | 10MB |
| Types | PDF, JPEG, PNG |
| Storage | Private (not public URL) |
| Access | Admin verification only |
| Storage field | `Provider.certificateUrls` |

---

### 33.4 Image Optimization

**Strategy**: Client-side optimization via Next.js Image component

| Technique | Implementation | Demo | Production |
|-----------|----------------|------|------------|
| Responsive sizing | `next/image` with `sizes` prop | ✅ | ✅ |
| Lazy loading | `next/image` default behavior | ✅ | ✅ |
| Format conversion | Automatic WebP via Vercel | ✅ | ✅ |
| Quality reduction | `quality` prop (75-85 recommended) | ✅ | ✅ |
| Server-side resize | Sharp processing on upload | ⬜ Defer | ✅ |
| Thumbnail generation | Pre-generate small versions | ⬜ Defer | ✅ |

**Usage Pattern**:
```tsx
import Image from 'next/image';

<Image
  src={provider.photoUrl}
  alt={provider.name}
  width={400}
  height={300}
  quality={80}
  sizes="(max-width: 768px) 100vw, 400px"
/>
```

---

### 33.5 File Size Limits & Quotas

| Upload Type | Max File Size | Max Files | Notes |
|-------------|---------------|-----------|-------|
| Profile photo | 5MB | 1 | Replaces existing |
| Gallery image | 5MB | 10 | Per provider |
| Certificate (Prod) | 10MB | 5 | Per provider |
| Message attachment (Prod) | 10MB | 3 | Per message |

**Quota Enforcement**:
- Demo: No hard quotas (low usage expected)
- Production: Enforce via database counts before accepting upload

---

### 33.6 Error Handling

| Error | HTTP Code | User Message | Resolution |
|-------|-----------|--------------|------------|
| Not authenticated | 401 | "Please log in to upload" | Redirect to login |
| No file provided | 400 | "Please select a file" | Show file picker |
| Invalid file type | 400 | "Only JPEG, PNG, and WebP images are allowed" | Clear, try again |
| File too large | 400 | "File too large. Maximum size is 5MB" | Compress and retry |
| Upload failed | 500 | "Upload failed. Please try again" | Retry or contact support |
| Storage quota exceeded | 400 | "Maximum images reached" | Delete existing first |

**UI Requirements**:
- Loading state during upload
- Progress indicator for large files (Production)
- Clear error messages with actionable guidance
- Success confirmation with preview

---

### 33.7 Security Considerations

| Concern | Mitigation | Demo | Production |
|---------|------------|------|------------|
| Unauthorized upload | Session authentication required | ✅ | ✅ |
| Malicious file types | MIME type validation | ✅ | ✅ |
| Oversized files | Size limit enforcement | ✅ | ✅ |
| Path traversal | Vercel Blob handles naming | ✅ | ✅ |
| Malware in files | Virus scanning | ⬜ Defer | ✅ |
| EXIF data leakage | Strip metadata on upload | ⬜ Defer | ✅ |
| Hotlinking abuse | Referer restrictions | ⬜ Defer | ⬜ Optional |

---

### 33.8 Database Schema

**Existing fields** (no changes required for demo):

```prisma
model User {
  image         String?   // Profile photo URL
}

model Provider {
  photoUrl      String?   // Primary profile photo
  galleryUrls   Json?     // Array of gallery image URLs
  certificateUrls Json?   // Array of certificate document URLs (Production)
}
```

**Production Addition** (for audit/cleanup):

```prisma
model UploadedFile {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  url         String   @unique
  pathname    String
  fileType    String   // image, document
  mimeType    String
  size        Int      // bytes
  uploadedBy  String   // userId
  entityType  String?  // user, provider, message
  entityId    String?
  deleted     Boolean  @default(false)
  deletedAt   DateTime?

  @@index([uploadedBy])
  @@index([entityType, entityId])
}
```

| Feature | Demo | Production |
|---------|------|------------|
| URL storage in entity fields | ✅ | ✅ |
| Separate UploadedFile tracking | ⬜ Defer | ✅ |
| Orphan file cleanup | ⬜ Defer | ✅ |

---

### 33.9 Admin System Integration

#### 33.9.1 Storage Locations

| Data Type | Storage Location | Access Method |
|-----------|------------------|---------------|
| **Image files** | Vercel Blob (public URLs) | Direct URL access |
| **Document files** (Prod) | Vercel Blob (private URLs) | Signed URL via API |
| **File metadata** | PostgreSQL (`Provider.galleryUrls`, etc.) | Admin Panel queries |
| **Upload tracking** (Prod) | PostgreSQL (`UploadedFile` table) | Admin Panel |
| **Upload errors** | Application logs (Vercel) | Vercel Dashboard → Logs |
| **Audit trail** | PostgreSQL (`AuditLog` table) | Admin Panel → Audit Log |

#### 33.9.2 Error Surfacing

| Error Type | Where Surfaced | Who Sees It |
|------------|----------------|-------------|
| **User-facing upload error** | UI toast/alert | End user |
| **API error (4xx/5xx)** | Console log + Vercel logs | Developers |
| **Storage failure** | Vercel Blob dashboard + logs | Developers |
| **Repeated failures** (Prod) | Error monitoring (Sentry) | Developers |
| **Quota exceeded** | UI message + admin flag | User + Admin |

**Demo Scope**: Errors logged to Vercel console; no dedicated error dashboard.

**Production Scope**:
- Integrate with Sentry for error aggregation
- Alert on repeated upload failures (e.g., >5 failures/hour)
- Admin Panel shows recent upload errors per user/provider

#### 33.9.3 Admin Panel Access

**Location**: Admin > Media Management (Production only)

| Feature | Demo | Production |
|---------|------|------------|
| View all uploaded files | ⬜ Defer | ✅ |
| Filter by user/provider | ⬜ Defer | ✅ |
| View file metadata (size, type, date) | ⬜ Defer | ✅ |
| Preview images inline | ⬜ Defer | ✅ |
| Delete/remove files | ⬜ Defer | ✅ |
| View upload errors | ⬜ Defer | ✅ |
| Storage usage dashboard | ⬜ Defer | ✅ |

**Demo Workaround**: Admins can view uploaded images via:
1. Provider/User detail pages in Admin Panel (existing)
2. Direct URL inspection from database fields
3. Vercel Blob dashboard (requires Vercel access)

**Admin Panel Wireframe (Production)**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Admin > Media Management                                                │
├─────────────────────────────────────────────────────────────────────────┤
│ Filters: [File Type ▼] [Date Range] [User/Provider Search]              │
├─────────────────────────────────────────────────────────────────────────┤
│ Preview  │ File Name       │ Type   │ Size   │ Uploaded By │ Actions   │
├──────────┼─────────────────┼────────┼────────┼─────────────┼───────────┤
│ [thumb]  │ profile-abc.jpg │ Image  │ 1.2MB  │ user:123    │ [Delete]  │
├──────────┼─────────────────┼────────┼────────┼─────────────┼───────────┤
│ [thumb]  │ gallery-xyz.png │ Image  │ 3.4MB  │ provider:45 │ [Delete]  │
├──────────┼─────────────────┼────────┼────────┼─────────────┼───────────┤
│ [icon]   │ license.pdf     │ Doc    │ 2.1MB  │ provider:45 │ [View]    │
└─────────────────────────────────────────────────────────────────────────┘
│ Total Storage: 1.2 GB │ Files: 3,421 │ Errors (24h): 3              │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 33.9.4 Permissions & Access Controls

| Role | Can Upload | Can View Own | Can View All | Can Delete Own | Can Delete All |
|------|------------|--------------|--------------|----------------|----------------|
| **Unauthenticated** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Family User** | ✅ Profile photo | ✅ | ❌ | ✅ | ❌ |
| **Provider User** | ✅ Profile + Gallery | ✅ | ❌ | ✅ | ❌ |
| **Support Staff** (Prod) | ❌ | ❌ | ✅ Read-only | ❌ | ❌ |
| **Admin** | ✅ On behalf of | ✅ | ✅ | ✅ | ✅ |

**Admin Override Actions** (Production):
- Remove inappropriate images
- Replace profile photos on behalf of user (with audit log)
- Access private documents for verification review

#### 33.9.5 Audit Logging Integration

> **Cross-Reference**: Chapter 37 (Analytics & Audit Logging)

| Action | Logged | Log Fields | Demo | Production |
|--------|--------|------------|------|------------|
| Image uploaded | ✅ | userId, fileUrl, size, type | ⬜ | ✅ |
| Image deleted by user | ✅ | userId, fileUrl | ⬜ | ✅ |
| Image deleted by admin | ✅ | adminId, targetUserId, fileUrl, reason | ⬜ | ✅ |
| Upload failed | ✅ | userId, error, fileType, size | ⬜ | ✅ |
| Document accessed for verification | ✅ | adminId, documentUrl | ⬜ | ✅ |

**Audit Log Entry Example**:
```json
{
  "timestamp": "2026-01-17T10:32:00Z",
  "actorId": "admin:456",
  "actorType": "admin",
  "action": "file_delete",
  "targetType": "provider",
  "targetId": "provider:123",
  "metadata": {
    "fileUrl": "https://blob.vercel-storage.com/gallery-xyz.jpg",
    "reason": "Inappropriate content",
    "previousValue": "[gallery array]"
  }
}
```

#### 33.9.6 Monitoring & Alerting (Production)

| Metric | Threshold | Alert |
|--------|-----------|-------|
| Upload error rate | >5% of attempts | Slack notification |
| Storage usage | >80% of quota | Email to admin |
| Large file attempts | >10MB rejected | Log only |
| Repeated failures (same user) | >3 in 1 hour | Flag for review |

**Integration Points**:
- Vercel Analytics: Request volume, latency
- Sentry: Error tracking, stack traces
- Custom dashboard (Production): Storage metrics, error rates

---

## Chapter 23: Trust & Safety

**Purpose**: Build user trust through provider verification, content moderation, and user safety features. Critical for demonstrating operational readiness.

> **Cross-Reference**: See Chapter 39 (Legal Framework) for Section 230 protections (39.2.2), content moderation policies (39.2.3), and platform liability limitations (39.2.1). Olera operates as an information marketplace and does not guarantee provider quality or care outcomes.

### 23.1 Provider Status & Trust Badges (DECIDED — Required for Demo)

**Purpose**: Visual indicators that communicate provider status and trustworthiness at a glance.

#### Two-State Model

Provider records exist in one of two states:

| State | Field | Visual | Meaning |
|-------|-------|--------|---------|
| **Unclaimed** | `claimed = false` | Gray outline, no icon | Data sourced from public records; not managed by provider |
| **Claimed** | `claimed = true` | Blue checkmark | Provider has verified ownership of this listing |

**Key Rules**:
- Providers who create their own profiles are **automatically marked as claimed**
- Only organizations have unclaimed profiles (from imports/scaling)
- Individual caregivers and families never have unclaimed profiles

#### Trust Signal Badges (Within Claimed State)

Claimed providers may display additional trust signal badges based on verification:

| Badge | Condition | Visual | Meaning |
|-------|-----------|--------|---------|
| **Verified** | Trust signals meet confidence threshold | Green shield | Olera has verified credentials (see details below) |
| **Background Checked** | `backgroundCheckVerified = true` | Gold badge | Caregiver has provided proof of background check |

**Note**: "Verified" is a trust signal badge, not a separate state. Claimed providers are auto-verified by default using available trust signals. Human verification occurs only when auto-verification confidence is insufficient.

**Demo Scope**: Unclaimed, Claimed states; Verified badge
**Production Scope**: + Background Checked badge (for individual caregivers)

#### Verified Badge — What It Means by Provider Type

The "Verified" badge (green shield) represents different verification criteria depending on provider type:

**Organizations (Facilities, Agencies)**:

| Verification | Description |
|--------------|-------------|
| Business license | Confirmed as registered business entity |
| State licensing | Licensed to operate as care provider in their state |
| Insurance | Liability insurance documentation on file |
| Physical location | Address confirmed (for facilities) |

**Individual Caregivers**:

| Verification | Description |
|--------------|-------------|
| Identity | Government ID verified |
| Credentials | Certifications confirmed (CNA, HHA, etc.) |
| Work authorization | Eligible to work in the US |

**Note**: The "Verified" badge does NOT include background checks. Background checks are a separate, optional trust signal (see 24.6).

#### Background Checked Badge — Individual Caregivers Only

| Attribute | Value |
|-----------|-------|
| **Applies to** | Individual caregivers only |
| **Does NOT apply to** | Organizations, families |
| **How obtained** | Caregiver uploads proof of completed background check |
| **Olera's role** | Trust signal display, not administration |

**Rationale**: Background checks are a trust signal, not a platform requirement. Olera does not perform or administer background checks. Caregivers who have completed a background check through a third party can upload proof to display this badge.

#### Badge Display Locations

| Location | Display |
|----------|---------|
| Provider card (search results) | Badge icon next to name |
| Provider profile header | Badge with label ("Claimed", "Verified", "Background Checked") |
| Provider profile sidebar | Full badge explanation |
| Engagement detail | Small badge indicator |

#### Badge Visual Specifications

```
Unclaimed:        Claimed:          Verified:         Background Checked:
┌─────────┐      ┌─────────┐       ┌─────────┐       ┌─────────┐
│ ○       │      │ ✓ Blue  │       │ 🛡 Green│       │ ✓ Gold  │
│ Gray    │      │         │       │         │       │         │
└─────────┘      └─────────┘       └─────────┘       └─────────┘
"Unclaimed"      "Claimed"         "Verified"        "Background Checked"
```

#### Badge Tooltip/Explanation

| Badge | Provider Type | Tooltip Text |
|-------|---------------|--------------|
| Unclaimed | All | "This listing was created from public records. The provider has not yet claimed it." |
| Claimed | All | "This provider has verified ownership of this listing." |
| Verified | Organization | "Olera has verified this organization's business license, state licensing, and insurance." |
| Verified | Caregiver | "Olera has verified this caregiver's identity and credentials." |
| Background Checked | Caregiver only | "This caregiver has provided proof of a completed background check." |

---

### 23.2 Verification Process (DECIDED)

**Two-State Model with Auto-Verification**:

```
  UNCLAIMED                              CLAIMED
  ┌────────────────────┐                ┌──────────────────────────────────┐
  │ • From import      │                │ • Provider controls profile      │
  │ • From scaling     │  ───────────►  │ • Auto-verified via trust signals│
  │ • Basic info only  │    (claim)     │ • "Verified" badge if confident  │
  │ • "Claim" CTA      │                │                                  │
  └────────────────────┘                └──────────────────────────────────┘
                                                       │
                                                       ▼ (if low confidence)
                                        ┌──────────────────────────────────┐
                                        │ Flag for human review            │
                                        │ • Admin notified via transaction │
                                        │ • Review in admin panel          │
                                        └──────────────────────────────────┘
```

#### Claiming Flow

| Step | Actor | Action | System Result |
|------|-------|--------|---------------|
| 1 | Provider | Finds unclaimed listing, clicks "Claim This Listing" | Claim request created |
| 2 | Provider | Fills claim form (name, role, contact) | Request enters Claims Queue |
| 3 | Admin | Reviews claim, calls/emails provider | Verification in progress |
| 4 | Admin | Approves claim | `claimed = true`, provider gets account access |

**Direct Profile Creation**: Providers who create their own profiles are automatically marked as claimed (no claim flow needed).

**Cross-reference**: See Chapter 10 (Provider Claiming) for full claim flow.

#### Auto-Verification Flow (Default)

| Step | Actor | Action | System Result |
|------|-------|--------|---------------|
| 1 | System | Provider becomes claimed | Auto-verification triggered |
| 2 | System | Evaluates available trust signals | Confidence score calculated |
| 3a | System | Confidence sufficient | "Verified" badge displayed |
| 3b | System | Confidence insufficient | Flagged for human review; admin notified |

#### Human Verification Flow (Exception)

| Step | Actor | Action | System Result |
|------|-------|--------|---------------|
| 1 | System | Flags provider with low confidence | Review task created in admin panel |
| 2 | System | Sends transactional notification | Admin team alerted |
| 3 | Admin | Reviews provider in admin panel | Manual verification |
| 4 | Admin | Approves or requests documentation | Badge updated or provider contacted |

**Demo Scope**: Manual verification via admin toggle (auto-verification logic deferred)
**Production Scope**: Full auto-verification with trust signal evaluation

---

### 23.3 Report/Flag System (DECIDED — Required for Demo)

**Purpose**: Allow users to report inappropriate content, policy violations, or safety concerns.

#### Reportable Content Types

| Content Type | Who Can Report | Report Location |
|--------------|----------------|-----------------|
| Provider profile | Families, other providers | Provider profile page → "Report" |
| Family profile | Providers (when visible) | Family profile → "Report" |
| Review | Any logged-in user | Review → "⋮" menu → "Report" |
| Message | Message recipient | Message → "⋮" menu → "Report" |
| User (general) | Any user in engagement | Engagement detail → "Report User" |

#### Report Reasons (Standard Dropdown)

| Reason | Description |
|--------|-------------|
| **Inappropriate content** | Offensive, explicit, or harmful content |
| **Spam or scam** | Unsolicited commercial content or fraudulent behavior |
| **Incorrect information** | Factually wrong details (address, services, etc.) |
| **Harassment** | Abusive, threatening, or bullying behavior |
| **Impersonation** | Pretending to be someone else |
| **Safety concern** | Potential danger to users |
| **Other** | Free text field for unlisted reasons |

#### Report Model

```typescript
Report {
  id: string
  status: PENDING | REVIEWING | RESOLVED | DISMISSED

  // Reporter
  reporterId: string
  reporterType: FAMILY | PROVIDER | ADMIN

  // Target
  targetType: PROVIDER_PROFILE | FAMILY_PROFILE | REVIEW | MESSAGE | USER
  targetId: string

  // Details
  reason: ReportReason (enum)
  description?: string  // Optional details

  // Resolution
  assignedTo?: string  // Admin user ID
  resolution?: CONTENT_REMOVED | USER_WARNED | USER_SUSPENDED | NO_ACTION
  resolutionNotes?: string
  resolvedAt?: DateTime
  resolvedBy?: string

  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Report UI Flow

**User Side**:
```
1. User clicks "Report" on content
2. Modal appears:
   ┌─────────────────────────────────────────┐
   │ Report this [content type]              │
   ├─────────────────────────────────────────┤
   │ Why are you reporting this?             │
   │ [Dropdown: Select reason]               │
   │                                         │
   │ Additional details (optional):          │
   │ [Text area]                             │
   │                                         │
   │ [Cancel]              [Submit Report]   │
   └─────────────────────────────────────────┘
3. Confirmation: "Thank you. We'll review this report."
```

**Admin Side**: See Section 24.5 (Moderation Queue)

---

### 23.4 Block User (DECIDED — Required for Demo)

**Purpose**: Allow users to prevent contact from specific users who are abusive or violating policies.

#### Block Mechanics

| Blocker | Can Block | Effect |
|---------|-----------|--------|
| Family | Provider | Provider cannot: message, send requests, appear in family's search |
| Provider | Family | Family cannot: message, send requests; provider hidden from their search |
| Any user | Any user | Bidirectional communication blocked |

#### Block Model

```typescript
UserBlock {
  id: string
  blockerId: string  // User who initiated block
  blockedId: string  // User who is blocked
  reason?: string    // Optional internal note
  createdAt: DateTime
}
```

#### Block UI

**Initiating a Block**:
- Location: User profile → "⋮" menu → "Block User"
- Location: Engagement detail → "⋮" menu → "Block User"
- Location: Message thread → "⋮" menu → "Block User"

**Block Confirmation Modal**:
```
┌─────────────────────────────────────────┐
│ Block [User Name]?                      │
├─────────────────────────────────────────┤
│ They won't be able to:                  │
│ • Send you messages                     │
│ • Send you requests                     │
│ • See your profile in search            │
│                                         │
│ They won't be notified that you         │
│ blocked them.                           │
│                                         │
│ [Cancel]                [Block User]    │
└─────────────────────────────────────────┘
```

#### Managing Blocks

**Location**: Settings → Privacy → Blocked Users

**Block List UI**:
```
┌─────────────────────────────────────────┐
│ Blocked Users                           │
├─────────────────────────────────────────┤
│ Sunrise Senior Living    [Unblock]      │
│ Blocked on Jan 15, 2026                 │
├─────────────────────────────────────────┤
│ John D.                  [Unblock]      │
│ Blocked on Jan 10, 2026                 │
└─────────────────────────────────────────┘
```

#### Block Enforcement

| Action | Enforcement |
|--------|-------------|
| Search | Blocked users excluded from results |
| Messaging | "You cannot message this user" error |
| Requests | "You cannot send requests to this user" error |
| Existing engagements | Remain visible but messaging disabled |

---

### 23.5 Content Moderation Queue (DECIDED — Required for Demo)

**Purpose**: Centralized admin interface for reviewing user-generated content that requires human moderation.

**Location**: `/admin/moderation`

#### Queue Scope (Key UGC Only)

| Content Type | Auto-Queued | User-Reported | Priority |
|--------------|-------------|---------------|----------|
| Reviews | If contains flagged keywords | ✅ Yes | Normal |
| Provider profiles (new/edited) | If significant changes | ✅ Yes | Normal |
| Messages | No (privacy) | ✅ Yes (reported only) | High |
| Family profiles | No | ✅ Yes | Normal |
| User accounts | No | ✅ Yes | High |

#### Moderation Queue UI

**Queue Table**:
```
/admin/moderation
┌────────────────────────────────────────────────────────────────────┐
│ Moderation Queue                            [Filter ▼] [Search]   │
├────────────────────────────────────────────────────────────────────┤
│ Status │ Type    │ Content         │ Reported By │ Reason   │ Age │
├────────────────────────────────────────────────────────────────────┤
│ 🟡 New │ Review  │ "Terrible pl... │ Jane D.     │ Spam     │ 2h  │
│ 🟡 New │ Message │ [Conversation]  │ Provider X  │ Harass.. │ 4h  │
│ 🔵 Rev │ Profile │ Sunrise Senior  │ Auto-flag   │ Keywords │ 1d  │
│ ✅ Done│ Review  │ "Great exper... │ John S.     │ Spam     │ 2d  │
└────────────────────────────────────────────────────────────────────┘
```

**Queue Filters**:
- Status: All, Pending, Reviewing, Resolved
- Type: All, Reviews, Profiles, Messages, Users
- Priority: All, High, Normal, Low

**Moderation Detail View**:
```
┌─────────────────────────────────────────────────────────────────┐
│ Review Report #RPT-12345                              [← Back]  │
├─────────────────────────────────────────────────────────────────┤
│ REPORTED CONTENT                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ★★★★★ "This place is terrible! They stole my money..."     │ │
│ │ — Anonymous, Jan 14, 2026                                   │ │
│ │ On: Sunrise Senior Living                                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ REPORT DETAILS                                                  │
│ Reported by: Jane D. (family)                                   │
│ Reason: Spam or scam                                            │
│ Details: "This review seems fake, I toured this facility..."    │
│ Submitted: Jan 15, 2026 at 2:34 PM                              │
│                                                                 │
│ CONTEXT                                                         │
│ • Reviewer has 0 verified engagements                           │
│ • Review posted via direct link (not engagement-gated)          │
│ • Similar text found in 2 other reviews (possible spam)         │
├─────────────────────────────────────────────────────────────────┤
│ ACTION                                                          │
│ [Remove Content] [Warn User] [Suspend User] [Dismiss Report]    │
│                                                                 │
│ Notes: [Text area for admin notes]                              │
│                                                                 │
│                                        [Save Notes] [Resolve]   │
└─────────────────────────────────────────────────────────────────┘
```

#### Moderation Actions

| Action | Effect | Notification |
|--------|--------|--------------|
| **Dismiss** | Report closed, no action | Reporter: "We reviewed your report" |
| **Remove Content** | Content hidden/deleted | Content owner: "Your [content] was removed" |
| **Warn User** | Warning logged, content may remain | User: "You've received a warning" |
| **Suspend User** | Account suspended, cannot log in | User: "Your account has been suspended" |

#### Moderation Workflow

```
Report Submitted
      ↓
  [PENDING] ──────────────────────────────┐
      ↓                                   │
  Admin claims report                     │
      ↓                                   │
  [REVIEWING] ────────────────────────────┤
      ↓                                   │
  Admin takes action                      │
      ↓                                   │
  [RESOLVED] ─────────────────────────────┘
      │
      ├── Dismissed (false positive)
      ├── Content removed
      ├── User warned
      └── User suspended
```

---

### 23.6 Background Check Trust Signal (Production Only)

**Important Distinction**: Olera does NOT perform or administer background checks. The platform allows individual caregivers to upload proof of completed background checks as a trust signal.

#### How It Works

| Step | Description |
|------|-------------|
| 1 | Caregiver obtains background check from third-party provider |
| 2 | Caregiver uploads proof (PDF document or verification link) |
| 3 | Admin reviews and approves the submission |
| 4 | "Background Checked" badge displayed on profile |

#### Accepted Proof

| Format | Description |
|--------|-------------|
| **PDF document** | Official background check report from recognized provider |
| **Verification link** | URL to provider's verification portal (e.g., Checkr, GoodHire) |
| **Certificate image** | Clear photo/scan of completion certificate |

#### Recommended Third-Party Providers

| Provider | Cost Range | Notes |
|----------|------------|-------|
| **Checkr** | $30-80 | Industry standard, widely recognized |
| **GoodHire** | $30-100 | User-friendly interface |
| **Sterling** | $40-150 | Comprehensive packages |
| **First Advantage** | Varies | Enterprise-focused |

**Note**: Olera may display a "Recommended provider" link on the caregiver profile upload page pointing to an affordable, user-friendly option. This is informational only—Olera receives no commission or referral benefit.

#### Upload Flow

**Caregiver Side** (Provider Dashboard → Profile → Background Check):
```
┌─────────────────────────────────────────────┐
│ Background Check Verification               │
├─────────────────────────────────────────────┤
│ Upload proof of your background check to    │
│ display the "Background Checked" badge.     │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ [📎 Drop file or click to upload]       │ │
│ │ Accepted: PDF, PNG, JPG (max 10MB)      │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ OR paste verification link:                 │
│ [Enter verification URL________________]    │
│                                             │
│ Don't have a background check?              │
│ [View recommended providers]                │
│                                             │
│                              [Submit]       │
└─────────────────────────────────────────────┘
```

#### Verification Status

| Status | Badge | Meaning |
|--------|-------|---------|
| **Not submitted** | None | No background check uploaded |
| **Pending review** | None | Awaiting admin verification |
| **Verified** | Gold badge | Admin confirmed valid proof |
| **Rejected** | None | Invalid or unreadable proof; caregiver notified |

#### Admin Review

**Location**: `/admin/moderation` → Background Check Submissions

| Field | Description |
|-------|-------------|
| Caregiver | Name, profile link |
| Submitted | Date and time |
| Proof type | Document or link |
| Preview | View document / follow link |
| Actions | Approve, Reject (with reason) |

**Demo Scope**: ⬜ Deferred (not required for demo)
**Production Scope**: Full upload flow, admin review, badge display

---

### 23.7 Fraud Detection (Production Only)

| Signal | Detection Method | Action |
|--------|------------------|--------|
| Duplicate accounts | Same email/phone/name patterns | Auto-flag for review |
| Spam profiles | Rapid creation, low quality | Auto-flag for review |
| Fake reviews | Pattern analysis, sentiment anomalies | Hold for moderation |
| Suspicious behavior | Unusual messaging patterns | Alert admin |

**Demo Scope**: ⬜ Deferred
**Production Scope**: Rule-based detection with admin alerts

---

### 23.8 Questions & Community Content Moderation (DECIDED)

**Purpose**: Define moderation rules for the community Questions system (see Chapter 28: Marketing & SEO Pages).

#### Questions System Specifications

| Attribute | Specification |
|-----------|---------------|
| **Submission** | Any authenticated user |
| **Moderation** | Auto-approve with flag triggers |
| **Threading** | 2-level depth maximum (question → answer → reply) |
| **Reactions** | "Helpful" only (single reaction type) |
| **Editing** | Author can edit within 24 hours |
| **Deletion** | Author can delete if no answers; soft-delete otherwise |

#### Auto-Approve with Flag Triggers

Questions and answers are published immediately but auto-flagged for moderation review when any trigger fires:

| Flag Trigger | Detection | Action |
|--------------|-----------|--------|
| **Profanity filter** | Keyword match against profanity list | Publish + queue for review |
| **External URL** | Any URL in first post by user | Publish + queue for review |
| **Previous flags** | User has content previously flagged | Publish + queue for review |
| **Duplicate detection** | High similarity to existing question | Publish + queue for review |
| **Spam patterns** | Repeated content, unusual character patterns | Publish + queue for review |

**Rationale**: Auto-approve-with-triggers balances scale (no bottleneck) with quality (catches issues). Content is published immediately for good UX, while problematic content is surfaced for review.

#### Moderation Actions for Questions

| Action | Effect | User Notification |
|--------|--------|-------------------|
| **Approve** | Content remains published, flag cleared | None |
| **Edit** | Admin edits content, flag cleared | "Your content was edited by a moderator" |
| **Hide** | Content hidden from public view | "Your content was hidden for policy violation" |
| **Delete** | Content permanently removed | "Your content was removed for [reason]" |
| **Warn User** | Content may remain, warning logged | "You've received a warning about your content" |

#### Questions Moderation Queue

**Location**: `/admin/moderation` → Questions tab

| Column | Content |
|--------|---------|
| **Status** | Pending, Reviewing, Resolved |
| **Type** | Question, Answer, Reply |
| **Content Preview** | First 100 characters |
| **Flag Trigger** | Which trigger(s) fired |
| **Author** | User name, link to profile |
| **Age** | Time since flagged |

**Cross-Reference**: See Chapter 27: Admin System for queue implementation details.

#### Content Guidelines for Questions

Users submitting questions and answers must adhere to:

| Guideline | Description |
|-----------|-------------|
| **Relevant** | Questions must be about senior care, caregiving, or related planning |
| **Respectful** | No personal attacks, harassment, or offensive language |
| **Original** | No copied content from other sources |
| **Non-promotional** | No advertising, spam, or self-promotion |
| **No PII** | Do not share personal contact information publicly |
| **Accurate** | Answers should be factual; medical advice must include disclaimers |

---

### 23.9 Implementation Status

| Item | Status | Notes |
|------|--------|-------|
| Provider states (Unclaimed/Claimed) + Verified badge | ⬜ Not Built | Required for demo |
| Badge display on cards | ⬜ Not Built | Required for demo |
| Badge display on profiles | ⬜ Not Built | Required for demo |
| Report/flag UI | ⬜ Not Built | Required for demo |
| Report model | ⬜ Not Built | Required for demo |
| Block user functionality | ⬜ Not Built | Required for demo |
| Block management UI | ⬜ Not Built | Required for demo |
| Moderation queue | ⬜ Not Built | Required for demo |
| Moderation actions | ⬜ Not Built | Required for demo |
| Questions moderation system | ⬜ Not Built | Auto-approve with flag triggers |
| Questions moderation queue (admin) | ⬜ Not Built | Tab in moderation interface |
| Background check upload flow | ⬜ Not Built | Production only (self-reported trust signal) |
| Fraud detection | ⬜ Not Built | Production only |

### 23.10 Key Decisions Log

| Decision | Status | Rationale |
|----------|--------|-----------|
| Verification badges for demo | ✅ Decided | Critical for trust signals |
| Two-state model (Unclaimed/Claimed) | ✅ Decided | Simpler model; Verified is trust badge within Claimed, not separate state |
| Auto-verification by default | ✅ Decided | Human review only when confidence insufficient; admin notified via transaction |
| Report/flag for demo | ✅ Decided | Required for safety demonstration |
| Block user for demo | ✅ Decided | Required for handling policy violations |
| Centralized moderation queue | ✅ Decided | Simple, actionable, admin-accessible |
| Background checks: self-reported model | ✅ Decided | Olera does not administer; caregivers upload proof; trust signal only |
| Fraud detection: defer | ✅ Decided | Requires pattern analysis infrastructure |

---

### 23.11 Cross-Chapter Integration

| Chapter | Integration Point |
|---------|-------------------|
| Ch 10: Provider Claiming | Claim approval sets `claimed = true` |
| Ch 23: Reviews & Ratings | Review moderation flows to moderation queue |
| Ch 25: Provider Data Management | Badge fields on Provider model |
| Ch 26: Data Acquisition | Two-state model (Unclaimed/Claimed) defined |
| Ch 27: Admin System | Moderation queue + verification review in admin panel |
| Ch 29: Marketing & SEO | Questions system moderation rules |
| Ch 14: Settings | Blocked users list in Settings → Privacy |

### Demo vs Production Summary

| Feature | Demo | Production |
|---------|------|------------|
| Provider states + badges | ✅ Unclaimed/Claimed states + Verified badge | + Background Checked badge |
| Badge display | ✅ Cards + profiles | Same |
| Report/flag | ✅ All content types | Same + auto-detection |
| Block user | ✅ Full functionality | Same |
| Block management | ✅ Settings UI | Same |
| Moderation queue | ✅ Full UI | Same + analytics |
| Background checks | ⬜ Defer | Self-reported upload, admin review |
| Fraud detection | ⬜ Defer | Rule-based system |

---

## Chapter 30: Customer Support

**Review Status**: ✅ Reviewed

**Purpose**: Define the human and automated customer support systems for the Olera platform, including support architecture, common support scenarios, intake channels, ticket management, and references to Standard Operating Procedures (SOPs).

> **Scope Note**: This chapter describes *what* support systems exist and *how* they function architecturally. Detailed operational procedures (step-by-step SOPs) are maintained separately and referenced where applicable.

> **Cross-References**:
> - Chapter 26 (Admin System): Support ticket management interface
> - Chapter 23 (Trust & Safety): Verification issues, content disputes
> - Chapter 27 (Human Workflows & SOPs): Detailed operational procedures
> - Chapter 34 (Communications Infrastructure): Email delivery for support responses
> - Chapter 39 (Legal Framework): Takedown procedures, DMCA compliance

---

### 30.1 Support Architecture Overview

Olera's customer support system operates across three layers:

| Layer | Description | Demo | Production |
|-------|-------------|------|------------|
| **Self-Service** | FAQ, help content, in-app guidance | ✅ Basic | ✅ Full |
| **Automated** | Form submissions, auto-responses, routing | ✅ Basic | ✅ Full |
| **Human** | Staff-handled tickets, phone support, escalations | ⬜ Minimal | ✅ Full |

**Architecture Diagram (Production)**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPPORT INTAKE CHANNELS                         │
├─────────────────────────────────────────────────────────────────────────┤
│  Contact Form    │  Takedown Form   │  Email         │  Phone          │
│  (/contact)      │  (provider page) │  (support@)    │  (Zoom Phone)   │
└────────┬─────────┴────────┬─────────┴───────┬────────┴────────┬────────┘
         │                  │                 │                 │
         ▼                  ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      TICKET CREATION & ROUTING                          │
│  - Auto-categorization based on form type / email subject               │
│  - Priority assignment (P0-P3)                                          │
│  - Assignment to support queue or specific agent                        │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     ADMIN PANEL: SUPPORT QUEUE                          │
│  - Ticket list with filters (status, priority, category)                │
│  - Ticket detail view with full history                                 │
│  - Actions: Respond, Escalate, Resolve, Close                           │
│  - SOP links for common issue types                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 30.2 Self-Service: FAQ & Help Content

#### 30.2.1 Demo Scope

| Feature | Status | Notes |
|---------|--------|-------|
| Static FAQ page (`/help` or `/faq`) | ✅ Required | Single unified page |
| Mode-aware content (Family vs Provider) | ⬜ Defer | Combined content with section headers |
| Search functionality | ⬜ Defer | Simple list/accordion sufficient |
| Footer "Help" link on all pages | ✅ Required | Standard placement |
| Header help icon (?) | ⬜ Optional | Not required for demo |

**Demo FAQ Content Categories**:
1. Account & Login (signup, password reset, email verification)
2. Mode Switching (Family vs Provider experience)
3. For Families (searching, saving, contacting providers)
4. For Providers (claiming listings, profile management)
5. Contact & Support (how to reach us)

#### 30.2.2 Production Scope

| Feature | Status | Notes |
|---------|--------|-------|
| Searchable help center | ✅ | Full-text search across articles |
| Category navigation | ✅ | Organized by topic |
| Mode-aware filtering | ✅ | Show relevant content based on user mode |
| Article view analytics | ✅ | Track popular articles, search terms |
| "Was this helpful?" feedback | ⬜ Defer | Future enhancement |

---

### 30.3 Support Intake Channels

#### 30.3.1 Contact Us Form

**Purpose**: General inquiries, feedback, and issues not covered by specialized forms.

**Demo Scope**:
- Location: `/contact` (linked from footer and FAQ page)
- Fields: Name, Email, Subject (dropdown), Message
- Subject options: General Inquiry, Account Issue, Provider Question, Family Question, Other
- Submission: Sends email to `support@olera.com` via Resend
- Confirmation: "Thank you. We'll respond within 1-2 business days."
- No ticket number, no tracking

**Production Scope**:
- Same form, but creates ticket in support system
- Auto-response email with ticket number
- User can view ticket status (if logged in)

| Feature | Demo | Production |
|---------|------|------------|
| Contact form exists | ✅ | ✅ |
| Email notification to support | ✅ | ✅ |
| Ticket creation | ⬜ | ✅ |
| User ticket tracking | ⬜ | ✅ |

#### 30.3.2 Takedown Request Form

**Purpose**: Allow individuals to request removal of unclaimed provider listings.

> **Context**: Some providers sourced from public data may not want to be listed on Olera. Rather than claiming and managing their listing, they may request removal. This must be explicitly supported.

**Location**: Accessible from unclaimed provider profile pages via "Request Removal" or "Report This Listing" link.

**Demo Scope**:
- Simple form: Name, Email, Relationship to Listing, Reason for Request, Provider URL
- Submission: Sends email to `support@olera.com` with subject "[Takedown Request]"
- Confirmation: "Your request has been received. We'll review it within 3-5 business days."

**Production Scope**:
- Creates ticket with category "Takedown Request"
- Auto-categorized as P2 priority
- Triggers SOP: Takedown Request Handling (see Section 30.6)
- Audit logged per Chapter 37

| Feature | Demo | Production |
|---------|------|------------|
| Takedown form on unclaimed profiles | ✅ | ✅ |
| Email notification | ✅ | ✅ |
| Ticket creation with category | ⬜ | ✅ |
| SOP trigger | Manual | Automated |

#### 30.3.3 Email Support

**Address**: `support@olera.com`

**Demo Scope**: Monitored manually; no automated processing.

**Production Scope**:
- Emails to support address auto-create tickets
- Subject line parsing for auto-categorization
- Auto-response with ticket number
- Threaded replies update ticket

#### 30.3.4 Phone Support

**Number**: Zoom Phone line (number TBD)

**Demo Scope**: Not staffed. Voicemail with callback promise.

**Production Scope**:
- Staffed during business hours (e.g., M-F 9am-5pm ET)
- Voicemail outside hours with next-day callback
- Calls logged; tickets created for follow-up items
- Staff have access to Admin Panel for real-time lookup

**Public Contact Information Display**:
```
Need help?
📧 support@olera.com
📞 (XXX) XXX-XXXX (Mon-Fri, 9am-5pm ET)
```

---

### 30.4 Ticket Management (Production)

> **Note**: This section is Production scope only. Demo has no ticketing system.

#### 30.4.1 Ticket Lifecycle

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   New    │───►│   Open   │───►│ Pending  │───►│ Resolved │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                     │                               │
                     │         ┌──────────┐          │
                     └────────►│ Escalated│──────────┘
                               └──────────┘
```

| Status | Meaning |
|--------|---------|
| **New** | Just created, unassigned |
| **Open** | Assigned to agent, in progress |
| **Pending** | Awaiting user response or external action |
| **Escalated** | Requires senior review or special handling |
| **Resolved** | Issue addressed, awaiting confirmation |
| **Closed** | Complete, no further action |

#### 30.4.2 Ticket Schema

```prisma
model SupportTicket {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Source
  channel       String   // form, email, phone, admin
  category      String   // general, takedown, verification, billing, account

  // Requester
  requesterEmail String
  requesterName  String?
  userId         String?  // If logged-in user

  // Content
  subject       String
  description   String   @db.Text

  // Management
  status        String   @default("new") // new, open, pending, escalated, resolved, closed
  priority      String   @default("P3")  // P0, P1, P2, P3
  assignedTo    String?  // Admin user ID

  // Resolution
  resolution    String?  @db.Text
  resolvedAt    DateTime?
  closedAt      DateTime?

  // Relations
  messages      SupportMessage[]

  @@index([status])
  @@index([category])
  @@index([requesterEmail])
}

model SupportMessage {
  id        String   @id @default(cuid())
  ticketId  String
  ticket    SupportTicket @relation(fields: [ticketId], references: [id])
  createdAt DateTime @default(now())
  authorType String  // user, agent, system
  authorId   String?
  content    String  @db.Text
  isInternal Boolean @default(false) // Internal notes not visible to user
}
```

#### 30.4.3 Priority Levels

| Priority | Response Target | Examples |
|----------|-----------------|----------|
| **P0** | 1 hour | Account locked, payment failure, security issue |
| **P1** | 4 hours | Verification blocked, listing dispute |
| **P2** | 24 hours | Takedown request, profile issues |
| **P3** | 48 hours | General questions, feedback |

#### 30.4.4 Admin Panel: Support Queue

**Location**: Admin > Support

**Features**:
- Ticket list with filters (status, priority, category, assignee)
- Quick actions: Assign, Change Priority, Add Note
- Ticket detail view with full message history
- Internal notes (not visible to requester)
- SOP quick links based on ticket category
- Resolution templates for common issues

---

### 30.5 Common Support Scenarios

This section catalogs the most common support needs by user type and how they should be handled.

#### 30.5.1 Family Support Scenarios

| Scenario | Frequency | Handling | SOP Reference |
|----------|-----------|----------|---------------|
| Can't log in / password reset | High | Self-service (forgot password flow) | — |
| Account locked after failed attempts | Medium | Admin unlock via Admin Panel | Account Access SOP |
| Can't find a provider | Low | FAQ / guided search tips | — |
| Provider not responding | Medium | Explain provider may be unclaimed; suggest alternatives | — |
| Billing/subscription question | Medium (Prod) | Billing SOP; Stripe dashboard lookup | Billing SOP |
| Request account deletion | Low | Data deletion SOP per Ch 39 | Data Deletion SOP |
| Report inappropriate content | Low | Content moderation SOP | Content Moderation SOP |

#### 30.5.2 Provider Support Scenarios

| Scenario | Frequency | Handling | SOP Reference |
|----------|-----------|----------|---------------|
| Can't log in / password reset | High | Self-service (forgot password flow) | — |
| How do I claim my listing? | High | FAQ; guided claiming flow | — |
| Claiming verification failed | Medium | Manual verification review | Verification SOP |
| Someone else claimed my listing | Low | Listing dispute process | Listing Dispute SOP |
| I want my listing removed | Medium | Takedown request form | Takedown SOP |
| How do I update my profile? | High | FAQ; in-app guidance | — |
| Incorrect information on my listing | Medium | Self-edit if claimed; support if unclaimed | — |
| Billing/subscription question | Medium (Prod) | Billing SOP | Billing SOP |
| Request account deletion | Low | Data deletion SOP | Data Deletion SOP |

#### 30.5.3 SOP Index

The following SOPs are referenced by support operations. Detailed procedures live in Chapter 27 (Human Workflows & SOPs) or separate operational documentation.

| SOP Name | Trigger | Owner |
|----------|---------|-------|
| **Takedown Request Handling** | Takedown form submission | Support |
| **Listing Dispute Resolution** | Competing ownership claims | Support + Admin |
| **Manual Verification Review** | Auto-verification failure or flag | Admin |
| **Account Access Recovery** | Locked accounts, lost 2FA | Support |
| **Billing Issue Resolution** | Payment failures, refund requests | Support + Finance |
| **Data Deletion Request** | User deletion request per Ch 39 | Support + Legal |
| **Content Moderation** | Reported content, policy violations | Admin |

---

### 30.6 Takedown Request Handling

**Purpose**: Define the process for handling requests to remove unclaimed provider listings.

#### 30.6.1 Eligibility

Takedown requests are accepted for:
- Unclaimed listings only
- Requestor must demonstrate relationship to listing (owner, employee, or authorized representative)

Takedown requests are **not** accepted for:
- Claimed listings (provider controls their own content)
- Requests from third parties with no relationship to listing
- Requests to remove accurate public information without valid reason

#### 30.6.2 Process Overview

| Step | Action | Timeline |
|------|--------|----------|
| 1 | Request received via form or email | — |
| 2 | Ticket created (Production) or email logged (Demo) | Immediate |
| 3 | Verify requestor identity and relationship | 1-2 days |
| 4 | Review listing and request validity | 1-2 days |
| 5 | Decision: Approve, Deny, or Request More Info | — |
| 6 | If approved: Remove listing, notify requestor | Same day |
| 7 | If denied: Notify requestor with reason | Same day |
| 8 | Audit log entry | Automatic |

#### 30.6.3 Decision Criteria

| Approve If | Deny If |
|------------|---------|
| Requestor is verified owner/operator | No verifiable relationship to listing |
| Valid reason (ceased operations, privacy concern) | Attempting to suppress legitimate public info |
| Listing is unclaimed | Listing is claimed (direct them to self-manage) |

> **Cross-Reference**: See Chapter 39 (Legal Framework) Section 39.2 for platform liability and content moderation policies.

---

## Chapter 35: Error Handling & Monitoring

**Review Status**: ✅ Reviewed

**Purpose**: Define the error handling architecture, user-facing error states, API error formats, monitoring infrastructure, and debugging capabilities for the Olera platform.

> **Cross-References**:
> - Chapter 26 (Admin System): Admin visibility into system errors
> - Chapter 30 (Customer Support): Error-triggered support flows
> - Chapter 33 (File Uploads & Media): Upload error handling
> - Chapter 36 (Performance & Caching): Performance monitoring overlap
> - Chapter 37 (Analytics & Audit Logging): Error logging as audit events
> - Chapter 38 (Third-Party Services): Sentry, monitoring tools

---

### 35.1 Error Handling Architecture

**Layered Error Handling**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ERROR HANDLING LAYERS                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Layer 1: Component Level                                               │
│  ├── Try/catch in event handlers                                        │
│  ├── Form validation errors (inline)                                    │
│  └── API call error handling (per-component)                            │
│                                                                         │
│  Layer 2: Route Level                                                   │
│  ├── error.tsx — Catches unhandled errors in route segment              │
│  ├── not-found.tsx — 404 page                                           │
│  └── loading.tsx — Route loading states (optional)                      │
│                                                                         │
│  Layer 3: Application Level                                             │
│  ├── Global error boundary (app/error.tsx)                              │
│  └── Root layout error handling                                         │
│                                                                         │
│  Layer 4: Server Level                                                  │
│  ├── API route error responses                                          │
│  ├── Server action error handling                                       │
│  └── Middleware error handling                                          │
│                                                                         │
│  Layer 5: Infrastructure Level                                          │
│  ├── Vercel error logs                                                  │
│  ├── Sentry integration (Production)                                    │
│  └── Uptime monitoring (Production)                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

| Layer | Demo | Production |
|-------|------|------------|
| Component-level handling | ✅ | ✅ |
| Route-level error.tsx | ✅ Built | ✅ |
| Global error boundary | ✅ Built | ✅ |
| API error responses | ✅ Built | ✅ |
| Sentry integration | ⬜ Defer | ✅ |
| Uptime monitoring | ⬜ Defer | ✅ |

---

### 35.2 Frontend Error States

#### 35.2.1 Global Error Boundary

**Location**: `app/error.tsx`

**Current Implementation** (verified):
- Displays user-friendly error message
- Provides "Try again" (reset) and "Go home" actions
- Shows error details in development mode only
- Logs errors to console

**User-Facing Message**:
> "Something went wrong. We encountered an unexpected error. Please try again or contact support if the problem persists."

| Feature | Demo | Production |
|---------|------|------------|
| User-friendly error page | ✅ Built | ✅ |
| Reset/retry action | ✅ Built | ✅ |
| Navigation to home | ✅ Built | ✅ |
| Dev-only error details | ✅ Built | ✅ |
| Error reporting to Sentry | ⬜ Defer | ✅ |

#### 35.2.2 Not Found (404) Page

**Location**: `app/not-found.tsx`

**Required Elements**:
- Clear "Page not found" message
- Navigation options (home, search, back)
- Consistent with brand styling

| Feature | Demo | Production |
|---------|------|------------|
| Custom 404 page | ✅ Required | ✅ |
| Navigation links | ✅ Required | ✅ |
| Search suggestion | ⬜ Optional | ✅ |

#### 35.2.3 Loading States

**Strategy**: Component-level loading states (not route-level loading.tsx)

**Patterns**:

| Context | Loading Pattern | Example |
|---------|-----------------|---------|
| Page initial load | Skeleton screens | Dashboard cards |
| Data fetching | Spinner + text | "Loading providers..." |
| Button action | Button spinner | "Saving..." |
| Image loading | Blur placeholder | Provider photos |
| Infinite scroll | Bottom spinner | Search results |

**Standard Loading Component**:
```tsx
// Spinner with optional message
<LoadingSpinner message="Loading..." />

// Skeleton for cards
<CardSkeleton count={3} />
```

| Feature | Demo | Production |
|---------|------|------------|
| Spinner component | ✅ | ✅ |
| Skeleton components | 🟡 Partial | ✅ |
| Button loading states | ✅ | ✅ |
| Image placeholders | ✅ (Next/Image) | ✅ |

#### 35.2.4 Empty States

**When to Show**: No data to display (empty lists, no results, no activity)

**Required Elements**:
- Descriptive message explaining the empty state
- Illustration or icon (optional)
- Call-to-action when applicable

**Examples**:

| Context | Message | CTA |
|---------|---------|-----|
| No saved providers | "You haven't saved any providers yet" | "Browse providers" |
| No search results | "No providers match your search" | "Clear filters" |
| No messages | "No messages yet" | "Find a provider" |
| No notifications | "You're all caught up!" | None needed |

| Feature | Demo | Production |
|---------|------|------------|
| Empty state messages | 🟡 Partial | ✅ |
| Empty state illustrations | ⬜ Optional | ✅ |
| Contextual CTAs | 🟡 Partial | ✅ |

---

### 35.3 API Error Handling

#### 35.3.1 Standard Error Response Format

**Format**:
```typescript
// Error response
{
  "error": "Human-readable error message"
}

// With optional error code (for programmatic handling)
{
  "error": "Email already registered",
  "code": "EMAIL_EXISTS"
}
```

**HTTP Status Codes**:

| Code | Meaning | When to Use |
|------|---------|-------------|
| 400 | Bad Request | Invalid input, validation errors |
| 401 | Unauthorized | Not logged in, session expired |
| 403 | Forbidden | Logged in but not permitted |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource, state conflict |
| 422 | Unprocessable | Valid format but business rule violation |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Error | Unexpected server error |

#### 35.3.2 API Error Handling Pattern

**Standard Pattern** (for all API routes):
```typescript
export async function POST(request: Request) {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Input validation
    const body = await request.json();
    if (!body.requiredField) {
      return NextResponse.json(
        { error: "Required field missing" },
        { status: 400 }
      );
    }

    // 3. Business logic
    const result = await performAction(body);

    // 4. Success response
    return NextResponse.json(result);

  } catch (error) {
    // 5. Error logging
    console.error("API error:", error);

    // 6. Generic error response (don't leak internals)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
```

#### 35.3.3 Client-Side Error Handling

**Pattern for API Calls**:
```typescript
async function fetchData() {
  try {
    const response = await fetch('/api/endpoint');

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    // Show user-friendly toast/alert
    toast.error(error.message || 'Something went wrong');
    throw error; // Re-throw for component handling
  }
}
```

---

### 35.4 Error Logging

#### 35.4.1 Demo Scope

**Logging Strategy**: Console + Vercel Logs

| Log Type | Method | Visibility |
|----------|--------|------------|
| Client errors | `console.error()` | Browser DevTools |
| API errors | `console.error()` | Vercel Function Logs |
| Unhandled exceptions | Automatic | Vercel Error Logs |

**Accessing Logs**:
1. Vercel Dashboard → Project → Logs
2. Filter by: Function logs, Edge logs, Build logs
3. Search by timestamp or error message

#### 35.4.2 Production Scope

**Logging Strategy**: Sentry + Vercel Logs

**Sentry Integration**:
```typescript
// lib/sentry.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  beforeSend(event) {
    // Scrub sensitive data
    return event;
  },
});
```

**What to Log**:

| Event | Severity | Demo | Production |
|-------|----------|------|------------|
| Unhandled exceptions | Error | Console | Sentry |
| API 5xx errors | Error | Console | Sentry |
| API 4xx errors | Warning | Console | Sentry (sampled) |
| Auth failures | Warning | Console | Sentry |
| Validation errors | Info | Console only | Console only |
| Performance issues | Warning | None | Sentry |

---

### 35.5 Monitoring & Alerting

#### 35.5.1 Demo Scope

**Monitoring**: Vercel Dashboard only

| Metric | Source | Demo | Production |
|--------|--------|------|------------|
| Deployment status | Vercel | ✅ | ✅ |
| Function invocations | Vercel Analytics | ✅ | ✅ |
| Error count (basic) | Vercel Logs | ✅ | ✅ |
| Response times | Vercel Analytics | ✅ | ✅ |

#### 35.5.2 Production Scope

**Monitoring Stack**:

| Tool | Purpose |
|------|---------|
| **Sentry** | Error tracking, performance monitoring |
| **Vercel Analytics** | Traffic, performance, Web Vitals |
| **Better Uptime** (or similar) | Uptime monitoring, status page |

**Alerting Thresholds**:

| Metric | Threshold | Alert Channel |
|--------|-----------|---------------|
| Error rate | >1% of requests | Slack |
| Unhandled exception | Any | Slack + Email |
| API response time | >2s p95 | Slack |
| Uptime | <99.5% | Email + SMS |
| Memory/CPU spike | >80% | Slack |

---

### 35.6 Admin System Integration

#### 35.6.1 Error Visibility for Admins

**Demo Scope**: No admin error dashboard. Errors visible via:
1. Vercel Dashboard (requires Vercel access)
2. Console logs in browser DevTools (for client errors)

**Production Scope**: Admin > System Health

**Admin Panel Wireframe**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Admin > System Health                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│ │ Uptime      │  │ Error Rate  │  │ Avg Response│  │ Active Users│     │
│ │ 99.9%       │  │ 0.3%        │  │ 245ms       │  │ 127         │     │
│ └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────────────────────┤
│ Recent Errors (last 24h)                                    [View All] │
├─────────────────────────────────────────────────────────────────────────┤
│ Time       │ Type      │ Message              │ Count │ Status        │
├────────────┼───────────┼──────────────────────┼───────┼───────────────┤
│ 10:32 AM   │ API Error │ Database timeout     │ 3     │ 🔴 Unresolved │
├────────────┼───────────┼──────────────────────┼───────┼───────────────┤
│ 09:15 AM   │ Client    │ ChunkLoadError       │ 12    │ 🟡 Monitoring │
├────────────┼───────────┼──────────────────────┼───────┼───────────────┤
│ Yesterday  │ API Error │ Rate limit exceeded  │ 45    │ 🟢 Resolved   │
└─────────────────────────────────────────────────────────────────────────┘
```

| Feature | Demo | Production |
|---------|------|------------|
| System health dashboard | ⬜ Defer | ✅ |
| Recent errors list | ⬜ Defer | ✅ |
| Error drill-down (Sentry link) | ⬜ Defer | ✅ |
| Uptime indicator | ⬜ Defer | ✅ |

#### 35.6.2 Error-to-Support Flow

When users encounter errors:
1. Error page shows "Contact support" link
2. Link pre-fills support form with error context (if possible)
3. Support team can reference error ID in Sentry (Production)

> **Cross-Reference**: See Chapter 30 (Customer Support) for support form handling.

#### 35.6.3 Audit Logging for Errors

> **Cross-Reference**: Chapter 37 (Analytics & Audit Logging)

| Error Event | Logged | Demo | Production |
|-------------|--------|------|------------|
| API 5xx errors | ✅ | ⬜ | ✅ |
| Authentication failures | ✅ | ⬜ | ✅ |
| Rate limit violations | ✅ | ⬜ | ✅ |
| Admin override actions | ✅ | ⬜ | ✅ |

---

### 35.7 Error Recovery Patterns

#### 35.7.1 Retry Logic

**When to Retry**: Network errors, transient failures, rate limits (with backoff)

**Pattern**:
```typescript
async function fetchWithRetry(url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
      if (response.status !== 429 && response.status < 500) throw new Error();
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000); // Exponential backoff
    }
  }
}
```

#### 35.7.2 Graceful Degradation

| Failure | Degradation Strategy |
|---------|---------------------|
| Image load fails | Show placeholder/fallback image |
| API timeout | Show cached data if available, else error state |
| Feature unavailable | Hide feature, don't break page |
| Third-party down | Show "temporarily unavailable" for that feature |

---

## Chapter 36: Performance & Caching

**Review Status**: ✅ Reviewed

**Purpose**: Define the performance optimization strategy, caching patterns, and monitoring approach for the Olera platform to ensure fast, responsive user experiences.

> **Cross-References**:
> - Chapter 33 (File Uploads & Media): Image storage and CDN delivery
> - Chapter 35 (Error Handling & Monitoring): Performance monitoring overlap
> - Chapter 37 (Analytics & Audit Logging): Web Vitals tracking
> - Chapter 38 (Third-Party Services): Vercel Analytics, monitoring tools

---

### 36.1 Performance Strategy

**Philosophy**: Leverage Next.js and Vercel's built-in optimizations rather than adding custom infrastructure complexity. For demo scope, rely on platform defaults; for production, layer in explicit caching and monitoring.

**Performance Priorities**:

| Priority | Area | Demo Approach | Production Approach |
|----------|------|---------------|---------------------|
| **P0** | Database queries | ✅ Indexes (built) | Indexes + query monitoring |
| **P0** | Image delivery | ✅ Next/Image (built) | Next/Image + CDN tuning |
| **P1** | Page load times | Vercel defaults | ISR + Edge caching |
| **P2** | Bundle size | Implicit code splitting | Explicit analysis + optimization |
| **P3** | API response times | No caching | Redis + response caching |

**Demo Scope Decision**: No Redis, no bundle analyzer, no custom caching layer. Platform defaults are sufficient for demo traffic.

---

### 36.2 Database Optimization

#### 36.2.1 Index Strategy

**Current Indexes** (verified in Prisma schema):

| Model | Indexed Fields | Purpose |
|-------|----------------|---------|
| **User** | `userId` | Fast user lookups |
| **Provider** | `city`, `state`, `providerType` | Directory filtering |
| **Engagement** | `familyProfileId`, `providerId`, `status`, `requestType` | Engagement queries |
| **ConsultRequest** | `consultRequestId`, `requestId`, `status` | Request lookups |
| **SavedProvider** | `userId`, `familyProfileId`, `providerId` | Saved provider queries |

| Feature | Demo | Production |
|---------|------|------------|
| Prisma indexes defined | ✅ Built | ✅ |
| Query performance monitoring | ⬜ Defer | ✅ |
| Slow query logging | ⬜ Defer | ✅ |
| Connection pooling | Vercel managed | Vercel managed |

#### 36.2.2 Query Best Practices

**Patterns to Follow**:
```typescript
// ✅ Good: Select only needed fields
const providers = await prisma.provider.findMany({
  where: { city: "Austin", status: "ACTIVE" },
  select: { id: true, businessName: true, city: true }
});

// ✅ Good: Use include sparingly, only when needed
const engagement = await prisma.engagement.findUnique({
  where: { id },
  include: { provider: { select: { businessName: true } } }
});

// ❌ Avoid: Fetching entire related records
const user = await prisma.user.findUnique({
  where: { id },
  include: { engagements: true, savedProviders: true, messages: true }
});
```

**N+1 Query Prevention**:
- Use `include` for related data needed immediately
- Use separate queries for optional/lazy-loaded data
- Avoid loops that query database per iteration

---

### 36.3 Image Optimization

#### 36.3.1 Next/Image Implementation

**Current Usage** (verified in 8 components):
- `ProfilePhotoUpload.tsx`
- `CaregiverCard.tsx`
- `EnhancedProviderCard.tsx`
- `OrganizationCard.tsx`
- `SavedProviderCard.tsx`
- `EnhancedPhotoUpload.tsx`
- `PhotoGallery.tsx`
- `PhotoUpload.tsx`

**Next/Image Benefits** (automatic):
- Automatic WebP/AVIF conversion
- Responsive sizing (`sizes` prop)
- Lazy loading by default
- Blur placeholder support
- Vercel Image Optimization CDN

#### 36.3.2 Image Configuration

**Current next.config.ts**: Minimal (no image configuration needed — Vercel defaults apply)

**Required Patterns**:
```tsx
// Provider card image
<Image
  src={provider.photoUrl || "/placeholder-provider.png"}
  alt={provider.businessName}
  width={200}
  height={200}
  className="object-cover"
  priority={isAboveFold}  // Only for above-fold images
/>

// Gallery images (lazy loaded)
<Image
  src={photo.url}
  alt={photo.alt}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
/>
```

| Feature | Demo | Production |
|---------|------|------------|
| Next/Image usage | ✅ Built | ✅ |
| Placeholder images | ✅ Built | ✅ |
| Responsive sizes | ✅ Built | ✅ |
| Priority loading (above-fold) | 🟡 Partial | ✅ |
| Image CDN (Vercel) | ✅ Automatic | ✅ |

---

### 36.4 Data Caching

#### 36.4.1 Demo Scope

**Approach**: No explicit caching. Rely on:
- Vercel Edge Network (static assets)
- Next.js automatic fetch deduplication
- Browser caching (Cache-Control headers)

#### 36.4.2 Production Scope

**ISR (Incremental Static Regeneration)** — for semi-static pages:

```typescript
// app/providers/[city]/page.tsx
export const revalidate = 3600; // Revalidate every hour

export default async function CityProvidersPage({ params }) {
  const providers = await getProvidersByCity(params.city);
  return <ProviderList providers={providers} />;
}
```

**Candidates for ISR**:

| Page | Revalidate Interval | Rationale |
|------|---------------------|-----------|
| Provider directory (by city) | 1 hour | Provider data changes infrequently |
| Provider profile (public) | 1 hour | Profile updates are rare |
| Static pages (terms, privacy) | 24 hours | Rarely change |
| Homepage | 1 hour | Featured providers may update |

**API Response Caching** (Production only):

```typescript
// Cache API responses at edge
export async function GET(request: Request) {
  const data = await fetchData();

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  });
}
```

| Feature | Demo | Production |
|---------|------|------------|
| ISR for directory pages | ⬜ Defer | ✅ |
| API response caching | ⬜ Defer | ✅ |
| Redis caching layer | ⬜ Not needed | 🟡 If scale requires |
| Vercel Edge caching | ✅ Automatic | ✅ |

---

### 36.5 Bundle Optimization

#### 36.5.1 Automatic Optimizations

Next.js provides automatic code splitting:
- **Route-based splitting**: Each page loads only its code
- **Component-based splitting**: `dynamic()` for heavy components
- **Third-party chunking**: Vendor code separated

#### 36.5.2 Dynamic Imports

**Pattern for Heavy Components**:
```typescript
import dynamic from 'next/dynamic';

// Lazy load map component (heavy)
const MapView = dynamic(() => import('@/components/MapView'), {
  loading: () => <MapSkeleton />,
  ssr: false  // Client-only for map libraries
});

// Lazy load rich text editor
const RichTextEditor = dynamic(
  () => import('@/components/RichTextEditor'),
  { loading: () => <EditorSkeleton /> }
);
```

**Candidates for Dynamic Import**:

| Component | Reason | Demo | Production |
|-----------|--------|------|------------|
| Map components | Large library (Mapbox/Google) | ✅ If used | ✅ |
| Rich text editors | Heavy dependencies | ✅ If used | ✅ |
| Chart/graph libraries | Data visualization | ⬜ Not used | ✅ |
| PDF generators | Large libraries | ⬜ Not used | ✅ |

#### 36.5.3 Bundle Analysis (Production)

**Setup** (production only):
```bash
npm install @next/bundle-analyzer
```

```typescript
// next.config.ts (production analysis)
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
```

| Feature | Demo | Production |
|---------|------|------------|
| Automatic code splitting | ✅ Built-in | ✅ |
| Dynamic imports (heavy components) | 🟡 As needed | ✅ |
| Bundle analyzer | ⬜ Defer | ✅ |
| Tree shaking | ✅ Built-in | ✅ |

---

### 36.6 Core Web Vitals

#### 36.6.1 Target Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Main content visible |
| **FID** (First Input Delay) | < 100ms | Time to interactive |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Visual stability |
| **TTFB** (Time to First Byte) | < 600ms | Server response time |

#### 36.6.2 Measurement

**Demo Scope**: Vercel Analytics (automatic)

```
Vercel Dashboard → Project → Analytics → Web Vitals
```

**Production Scope**: Vercel Analytics + Sentry Performance

| Tool | Purpose | Demo | Production |
|------|---------|------|------------|
| Vercel Analytics | Core Web Vitals, traffic | ✅ | ✅ |
| Vercel Speed Insights | Real user monitoring | ✅ | ✅ |
| Sentry Performance | Transaction tracing | ⬜ Defer | ✅ |
| Lighthouse CI | Build-time audits | ⬜ Defer | ✅ |

#### 36.6.3 Optimization Techniques

| Metric | Optimization | Implementation |
|--------|--------------|----------------|
| **LCP** | Priority images above fold | `priority` prop on hero images |
| **LCP** | Preload critical fonts | `next/font` (automatic) |
| **FID** | Minimize JS on initial load | Code splitting, dynamic imports |
| **FID** | Defer non-critical scripts | `next/script` with strategy |
| **CLS** | Reserve image dimensions | Always specify `width`/`height` |
| **CLS** | Avoid layout-shifting elements | Fixed heights for dynamic content |

---

### 36.7 Admin System Integration

#### 36.7.1 Performance Visibility

**Demo Scope**: No admin performance dashboard. Use:
1. Vercel Dashboard (requires Vercel access)
2. Browser DevTools for ad-hoc testing

**Production Scope**: Admin > System Health (shared with Ch 35)

**Admin Performance Panel** (Production):

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Admin > System Health > Performance                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│ │ LCP         │  │ FID         │  │ CLS         │  │ TTFB        │     │
│ │ 1.8s ✅     │  │ 45ms ✅     │  │ 0.05 ✅     │  │ 320ms ✅    │     │
│ └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────────────────────┤
│ Slowest Pages (last 24h)                                    [View All] │
├─────────────────────────────────────────────────────────────────────────┤
│ Page                    │ Avg LCP  │ p95 LCP  │ Traffic │ Status       │
├─────────────────────────┼──────────┼──────────┼─────────┼──────────────┤
│ /providers/austin       │ 2.1s    │ 3.2s    │ 1,234   │ 🟡 Warning   │
├─────────────────────────┼──────────┼──────────┼─────────┼──────────────┤
│ /dashboard              │ 1.5s    │ 2.0s    │ 892     │ ✅ Good      │
└─────────────────────────────────────────────────────────────────────────┘
```

| Feature | Demo | Production |
|---------|------|------------|
| Performance dashboard in admin | ⬜ Defer | ✅ |
| Web Vitals display | ⬜ Defer | ✅ |
| Slow page identification | ⬜ Defer | ✅ |
| Alerts for performance regression | ⬜ Defer | ✅ |

> **Cross-Reference**: See Chapter 35.6 (Admin System Integration) for shared System Health panel structure.

---

### 36.8 Performance Checklist

**Demo Launch Checklist**:

| Item | Status | Notes |
|------|--------|-------|
| Database indexes defined | ✅ | Verified in Prisma schema |
| Next/Image used for all images | ✅ | 8 components verified |
| No N+1 query patterns | 🟡 | Review during development |
| Critical images have `priority` | 🟡 | Review above-fold images |
| Image dimensions specified | 🟡 | Review for CLS |
| Vercel Analytics enabled | ✅ | Automatic with deployment |

**Production Checklist** (Future):

| Item | Status | Notes |
|------|--------|-------|
| ISR for directory pages | ⬜ | Add `revalidate` exports |
| Bundle analyzer review | ⬜ | Run before launch |
| API response caching | ⬜ | Add Cache-Control headers |
| Sentry Performance enabled | ⬜ | Configure tracing |
| Lighthouse CI in pipeline | ⬜ | Add to CI/CD |
| Performance budget defined | ⬜ | LCP < 2.5s, bundle < 200KB |

---

## Chapter 37: Analytics & Audit Logging

**Review Status**: ✅ Reviewed

**Purpose**: Track key actions for debugging, compliance, and admin visibility. Audit logging is a **first-class concept** visible in the Admin panel for legal and compliance purposes.

> **Cross-Reference**: See Chapter 39 (Legal Framework) Section 39.3.1 for audit log retention requirements (7-year minimum for compliance). Audit logs are exempt from user deletion requests per 39.3.1.

### 37.1 Demo Scope (DECIDED)

| Log Type | Demo | Production |
|----------|------|------------|
| Auth events (login/logout) | ✅ Required | ✅ |
| Subscription events | ✅ Required | ✅ |
| Admin actions | ✅ Basic | ✅ Full |
| Mode switches | ⬜ Defer | ✅ |
| Engagement actions | ⬜ Defer | ✅ |
| Data change history | ⬜ Defer | ✅ |

**Demo Requirement**: Audit log must be **visible as first-class concept** in Admin panel under Legal & Compliance section.

---

### 37.2 Audit Log Schema (DECIDED)

```prisma
model AuditLog {
  id          String   @id @default(cuid())
  timestamp   DateTime @default(now())
  actorId     String?  // userId or "system"
  actorType   String   // user, admin, system
  action      String   // login, logout, update, delete, etc.
  targetType  String?  // user, provider, engagement, subscription
  targetId    String?
  metadata    Json?    // old/new values, IP address, etc.
  ipAddress   String?

  @@index([timestamp])
  @@index([actorId])
  @@index([action])
  @@index([targetType, targetId])
}
```

**Schema Notes**:
- `actorId` nullable for system-generated events
- `metadata` stores context (old/new values for data changes, IP for auth)
- Indexes on timestamp, actor, action, and target for query performance

---

### 37.3 Action Categories & Priorities (DECIDED)

| Priority | Category | Actions | Demo | Production |
|----------|----------|---------|------|------------|
| **P0** | Authentication | login, logout, password_reset, email_verify | ✅ | ✅ |
| **P0** | Subscription | subscribe, upgrade, downgrade, cancel | ✅ | ✅ |
| **P1** | Admin | user_suspend, provider_verify, manual_override, role_change | ✅ Basic | ✅ Full |
| **P2** | Data Changes | profile_update, status_change, pricing_change | ⬜ Defer | ✅ |
| **P3** | User Activity | mode_switch, engagement_create, message_send | ⬜ Defer | ✅ |

**Sensitive Fields** (for Data Changes logging):
- Email, phone number
- Subscription status, Stripe IDs
- Pricing information
- Claimed/verified status
- Provider status changes

---

### 37.4 Admin Audit Dashboard (DECIDED)

**Demo Scope**: Lightweight, illustrative dashboard within Admin > Legal & Compliance.

```
┌─────────────────────────────────────────────────────────────────────┐
│ Admin > Legal & Compliance > Audit Log                              │
├─────────────────────────────────────────────────────────────────────┤
│ Filters: [Action Type ▼] [Date Range] [Search Actor/Target]        │
├─────────────────────────────────────────────────────────────────────┤
│ Timestamp        │ Actor      │ Action     │ Target     │ Details  │
├──────────────────┼────────────┼────────────┼────────────┼──────────┤
│ 2024-01-15 10:32 │ admin@     │ user_      │ user:abc   │ [View]   │
│                  │ olera.com  │ suspend    │            │          │
├──────────────────┼────────────┼────────────┼────────────┼──────────┤
│ 2024-01-15 10:15 │ user:xyz   │ login      │ -          │ [View]   │
├──────────────────┼────────────┼────────────┼────────────┼──────────┤
│ 2024-01-15 09:48 │ user:xyz   │ subscribe  │ sub:def    │ [View]   │
└─────────────────────────────────────────────────────────────────────┘
```

| Feature | Demo | Production |
|---------|------|------------|
| List view with basic filters | ✅ | ✅ |
| Filter by action type | ✅ | ✅ |
| Filter by date range | ✅ | ✅ |
| Search by actor/target | ⬜ Defer | ✅ |
| Export to CSV | ⬜ Defer | ✅ |
| Detailed metadata view | ✅ Basic | ✅ Full |

---

### 37.5 Retention & Compliance (DECIDED)

| Log Type | Retention Period | Notes |
|----------|------------------|-------|
| Auth logs | 7 years | Compliance requirement per Ch 39 |
| Subscription logs | 7 years | Financial compliance |
| Admin action logs | 7 years | Audit trail requirement |
| Data change logs | 7 years | Compliance requirement |

**Deletion Exemption**: Audit logs are **NOT deleted** when a user requests account deletion (per Chapter 39, Section 39.3.1). User-identifying fields may be anonymized, but the log record is retained.

**Anonymization Approach**:
```
Before: { actorId: "user_abc123", action: "login", ... }
After:  { actorId: "DELETED_USER", action: "login", ... }
```

---

### 37.6 Implementation Notes

**Logging Service Pattern**:
```typescript
// services/auditLog.ts
export async function logAuditEvent({
  actorId,
  actorType,
  action,
  targetType,
  targetId,
  metadata,
  ipAddress,
}: AuditLogInput) {
  await prisma.auditLog.create({
    data: {
      actorId,
      actorType,
      action,
      targetType,
      targetId,
      metadata,
      ipAddress,
    },
  });
}
```

**Integration Points**:

| System | Integration |
|--------|-------------|
| Auth (Ch 1) | Log login/logout in auth handlers |
| Subscriptions (Ch 21) | Log subscription events in webhook handlers |
| Admin (Ch 26) | Log all admin actions in admin API routes |
| Settings (Ch 14) | Future: show user their auth history |

---

### 37.7 Admin Legal & Compliance Section (DECIDED)

The Admin panel includes a dedicated **Legal & Compliance** section housing:

| Item | Description | Demo |
|------|-------------|------|
| Audit Log | View all logged compliance events | ✅ |
| Data Deletion Requests | Queue of pending deletion requests | ⬜ Defer |
| Export Requests | Queue of data export requests | ⬜ Defer |
| Compliance Dashboard | Overview metrics | ⬜ Defer |

**Admin Navigation Update** (per Chapter 26):
```
Admin Panel
├── Dashboard
├── Users
├── Providers
├── Engagements
├── Subscriptions
├── Content Moderation
├── Legal & Compliance    ← NEW SECTION
│   ├── Audit Log         ← First-class, required for demo
│   ├── Data Requests     (deferred)
│   └── Compliance        (deferred)
└── Settings
```

> **Cross-Reference**: See Chapter 26 (Admin System) for full admin panel structure.

---

## Chapter 34: Communications Infrastructure

**Review Status**: ✅ Reviewed

**Purpose**: Define the delivery infrastructure for transactional communications (email and SMS) that enable the end-to-end user experience.

> **Scope Distinction**: Chapter 19 (Notifications) defines *what* to send and *when*. This chapter defines *how* to send it — infrastructure, templates, and delivery tracking.

> **Demo Scope Summary**: Email and SMS notifications for key user transactions. No call center tooling, live chat, or ticketing system for demo.

> **Cross-References**:
> - Chapter 14 (Settings & Preferences): Notification preferences control delivery
> - Chapter 19 (Notifications): Defines notification types; this chapter delivers them
> - Chapter 26 (Admin System): Admin visibility into delivery status
> - Chapter 38 (Third-Party Services): Master service registry, environment variables

### 34.1 Delivery Infrastructure (DECIDED)

#### Email Provider: Resend

| Attribute | Value |
|-----------|-------|
| **Provider** | Resend |
| **Why** | Modern API, React Email support, minimal setup, excellent DX |
| **Free tier** | 100 emails/day (sufficient for demo) |
| **Integration** | Single API key, TypeScript SDK |
| **Templates** | React Email components → HTML |

**Setup Requirements**:
1. Create Resend account
2. Add API key to environment (`RESEND_API_KEY`)
3. Configure sender domain (or use Resend's default for testing)
4. Install packages: `resend`, `@react-email/components`

**Email Service Architecture**:
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│ Notification    │ ──▶ │ Email Service    │ ──▶ │ Resend API  │
│ Trigger         │     │ (lib/email.ts)   │     │             │
└─────────────────┘     └──────────────────┘     └─────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │ React Email      │
                        │ Templates        │
                        └──────────────────┘
```

#### SMS Provider: Twilio

| Attribute | Value |
|-----------|-------|
| **Provider** | Twilio |
| **Demo scope** | ✅ Required — important for end-to-end experience |
| **Setup** | Account SID, Auth Token, Phone Number |
| **Integration** | `twilio` npm package |

**SMS Setup Requirements**:
1. Create Twilio account
2. Add credentials to environment (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`)
3. Provision phone number (can use trial number for demo)
4. Install package: `twilio`

**Demo SMS Use Cases**:
| Notification | Trigger | Message |
|--------------|---------|---------|
| Engagement confirmation | Booking confirmed | "Your {{type}} with {{provider}} is confirmed for {{date}}" |
| Appointment reminder | 1 hour before | "Reminder: {{type}} in 1 hour at {{location}}" |
| New message alert | Message received | "New message from {{from}} on Olera. View: {{url}}" |

---

### 34.2 Template Architecture (DECIDED)

**Approach**: React Email components compiled to HTML at send time.

**Template Directory Structure**:
```
/emails
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Button.tsx
│   └── Layout.tsx
├── templates/
│   ├── WelcomeEmail.tsx
│   ├── EngagementReceived.tsx
│   ├── EngagementAccepted.tsx
│   ├── AppointmentReminder.tsx
│   ├── NewMessage.tsx
│   ├── ReviewRequest.tsx
│   ├── ProfileNudge.tsx
│   └── CallCenterTask.tsx
└── index.ts
```

**Template Variables (Personalization)**:

| Variable | Type | Description |
|----------|------|-------------|
| `{{name}}` | string | Recipient's display name |
| `{{recipientEmail}}` | string | Recipient's email |
| `{{providerName}}` | string | Provider business name |
| `{{familyName}}` | string | Family contact name |
| `{{engagementType}}` | string | Tour, Consultation, Interview |
| `{{date}}` | string | Formatted date |
| `{{time}}` | string | Formatted time |
| `{{actionUrl}}` | string | CTA link to Olera |
| `{{previewText}}` | string | Message preview (for messages) |

**Template Requirements**:
- Mobile-responsive (single column, large tap targets)
- Brand-consistent (Olera colors, logo)
- Clear CTA button ("View in Olera")
- Unsubscribe link in footer
- Plain text fallback generated automatically

---

### 34.3 Transactional Email Templates (DECIDED)

| Template | Trigger | Subject Line | Key Content |
|----------|---------|--------------|-------------|
| **Welcome** | Account created | "Welcome to Olera" | Getting started guide, profile CTA |
| **Engagement Received** | New request (provider) | "New {{type}} request from {{name}}" | Request details, accept/decline CTA |
| **Engagement Accepted** | Status → ACCEPTED | "{{provider}} accepted your {{type}}" | Date/time, calendar add, directions |
| **Engagement Declined** | Status → DECLINED | "Update on your {{type}} request" | Alternative options CTA |
| **Appointment Reminder (24h)** | 24h before | "Reminder: {{type}} tomorrow" | Date, time, location, prep tips |
| **Appointment Reminder (1h)** | 1h before | "Starting soon: {{type}} in 1 hour" | Quick details, contact info |
| **New Message** | Message received | "New message from {{from}}" | Preview, reply CTA |
| **Review Request** | Engagement completed + 24h | "How was your {{type}} with {{provider}}?" | Star rating CTA |
| **Profile Nudge** | Profile < 50%, 3 days old | "Complete your profile to get matched" | Missing fields, completion CTA |

---

### 34.4 Lifecycle Automation (DECIDED)

#### Welcome Sequence

| Step | Timing | Channel | Content |
|------|--------|---------|---------|
| 1 | Immediate | Email | Welcome + getting started |
| 2 | Day 3 (if no activity) | Email | "Here's what you can do on Olera" |

**Demo Scope**: Step 1 only (single welcome email)
**Production Scope**: Full sequence with conditional logic

#### Profile Completion Nudge

| Trigger | Condition | Action |
|---------|-----------|--------|
| Account age = 3 days | Profile < 50% complete | Send profile nudge email |
| Account age = 7 days | Profile < 50% complete | Send second nudge (escalated) |

**Demo Scope**: Single nudge at day 3
**Production Scope**: Escalating sequence, admin visibility

#### Re-engagement (Production Only)

| Trigger | Condition | Action |
|---------|-----------|--------|
| Last login > 14 days | Has incomplete engagements | "We miss you" email |
| Last login > 30 days | Any user | Re-engagement campaign |

**Demo Scope**: ⬜ Deferred
**Production Scope**: Full re-engagement flows

---

### 34.5 Call Center Workflow (Production Only)

**Demo Scope**: ⬜ **Deferred** — No call center tooling for demo

**Production Purpose**: Enable admin/support staff to manage outbound calls, track outcomes, and trigger follow-up actions.

**Why Deferred**: Demo focuses on email and SMS transactional notifications. Call center operations add complexity that isn't needed to demonstrate the core user experience.

**Production Features** (documented for future implementation):

| Feature | Description |
|---------|-------------|
| Task queue UI | `/admin/call-center` with priority-based queue |
| CallCenterTask model | Tracks calls, outcomes, follow-ups |
| Automated triggers | Claims, stuck engagements, verification calls |
| Click-to-call | VoIP integration for browser-based calling |
| Outcome tracking | Answer, voicemail, reschedule, etc. |
| Reports | Call volume, conversion, staff performance |

> **Note**: Full call center specification preserved in version control for production implementation.

---

### 34.6 Admin-Initiated Outreach (Production Only)

**Demo Scope**: ⬜ **Deferred** — Single-user email via standard admin actions only

**Production Purpose**: Allow admins to send one-off or batch communications to users.

**Why Deferred**: Demo uses standard notification triggers. Batch outreach and segment builders add complexity.

**Production Features**:

| Feature | Demo | Production |
|---------|------|------------|
| Single-user email from admin | ⬜ Defer | ✅ |
| Single-user SMS from admin | ⬜ Defer | ✅ |
| Segment builder | ⬜ Defer | ✅ |
| Batch send | ⬜ Defer | ✅ |
| A/B testing | ⬜ Defer | ✅ |

---

### 34.7 Delivery Tracking (DECIDED)

#### Email Events (via Resend webhooks)

| Event | Tracked | Action |
|-------|---------|--------|
| `sent` | ✅ | Mark notification as delivered |
| `delivered` | ✅ | Confirm delivery |
| `opened` | 🟡 Demo: skip | Track engagement |
| `clicked` | 🟡 Demo: skip | Track CTA conversion |
| `bounced` | ✅ | Mark email invalid, alert admin |
| `complained` | ✅ | Auto-unsubscribe, flag account |

#### SMS Events (via Twilio webhooks)

| Event | Tracked | Action |
|-------|---------|--------|
| `sent` | ✅ | Mark as sent |
| `delivered` | ✅ | Confirm delivery |
| `failed` | ✅ | Mark phone invalid, alert admin |

#### Demo Scope

| Feature | Demo | Production |
|---------|------|------------|
| Send/fail tracking | ✅ | Same |
| Bounce handling | ✅ | Same + auto-disable |
| Open/click tracking | ⬜ Defer | Full analytics |
| Delivery dashboard | ⬜ Defer | Admin analytics page |

---

### 34.8 Implementation Status

| Item | Status | Demo Required | Notes |
|------|--------|---------------|-------|
| Email service (Resend) | ⬜ Not Built | ✅ Yes | Setup required |
| React Email templates | ⬜ Not Built | ✅ Yes | Core templates for demo |
| SMS service (Twilio) | ⬜ Not Built | ✅ Yes | Required for end-to-end experience |
| Welcome email | ⬜ Not Built | ✅ Yes | Single email on signup |
| Engagement notifications | ⬜ Not Built | ✅ Yes | Email + SMS for bookings |
| Appointment reminders | ⬜ Not Built | ✅ Yes | 1-hour SMS reminder |
| Message alerts | ⬜ Not Built | ✅ Yes | Email + SMS for new messages |
| Basic delivery tracking | ⬜ Not Built | ✅ Yes | Send/fail status |
| Call center workflow | ⬜ Not Built | ⬜ No | Deferred to production |
| Admin batch outreach | ⬜ Not Built | ⬜ No | Deferred to production |

### 34.9 Key Decisions Log

| Decision | Status | Rationale |
|----------|--------|-----------|
| Email provider: Resend | ✅ Decided | Simplest setup, modern API, React Email support |
| SMS provider: Twilio | ✅ Decided | Required for demo — important for end-to-end experience |
| Template system: React Email | ✅ Decided | Component-based, type-safe, easy to maintain |
| Welcome email for demo | ✅ Decided | Required for complete user journey |
| Transactional notifications | ✅ Decided | Email + SMS for key actions |
| Call center: defer | ✅ Decided | No call center tooling for demo — adds unnecessary complexity |
| Re-engagement: defer | ✅ Decided | Not needed for demo; production feature |
| Batch outreach: defer | ✅ Decided | Not needed for demo; production feature |

---

### 34.10 Cross-Chapter Integration

| Chapter | Integration Point |
|---------|-------------------|
| Ch 14: Settings | Notification preferences control delivery channels |
| Ch 15: Engagements | Engagement events trigger email + SMS notifications |
| Ch 19: Notifications | Defines notification types; this chapter delivers them |
| Ch 26: Admin System | Delivery status visibility in admin |
| Ch 38: Third-Party Services | Resend and Twilio in service registry |

### Demo vs Production Summary

| Feature | Demo | Production |
|---------|------|------------|
| Email (Resend) | ✅ Required | Same |
| SMS (Twilio) | ✅ Required | Same |
| Transactional templates | ✅ Core set | Full library |
| Welcome email | ✅ Single email | Multi-step sequence |
| Engagement notifications | ✅ Email + SMS | Same |
| Appointment reminders | ✅ 1-hour SMS | 24h + 1h multi-channel |
| Message alerts | ✅ Email + SMS | Same |
| Profile nudge | ✅ Single nudge | Escalating sequence |
| Re-engagement | ⬜ Defer | Full campaigns |
| Call center workflow | ⬜ Defer | Full queue + triggers |
| Admin batch outreach | ⬜ Defer | Segment builder |
| Delivery analytics | 🟡 Basic send/fail | Full dashboard |

---

## Chapter 25: Data Acquisition & Enrichment

**Purpose**: Define the four-phase strategy for building and scaling the provider directory, from demo through 500K+ providers.

> **Scope Note**: This chapter covers *how we get* provider data into the platform. For *how we manage* provider data once ingested, see Chapter 25 (Provider Data Management).

---

### 25.1 Definitions (DECIDED)

**Data Acquisition**: The process of obtaining provider records and ingesting them into the Olera platform. Includes migration from legacy systems and scaling via external sources.

**Enrichment**: Mechanisms that encourage providers, families, and individuals to contribute additional structured data over time. Enrichment is **user-driven** and includes:

| Enrichment Type | Description |
|-----------------|-------------|
| Onboarding flows | Initial profile creation data capture |
| Follow-up prompts | Post-signup nudges for additional info |
| Profile completion nudges | Progress indicators, reminders |
| Engagement-driven capture | Data collected through platform interactions |

**Important Distinction**: External data sources (APIs, public records) are part of *data acquisition*, not enrichment. Enrichment refers specifically to user-contributed data that improves profile quality over time.

---

### 25.2 Provider State Model (DECIDED)

**Two-State Model**:

| State | Definition |
|-------|------------|
| **Unclaimed** | Provider record exists but has not been claimed by the provider |
| **Claimed** | Provider has claimed ownership of their listing |

**Key Rules**:
- Providers who create their own profiles are **automatically marked as claimed**
- Only organizations have unclaimed profiles (from imports/scaling)
- Individual caregivers and families never have unclaimed profiles — they create profiles directly

**Verification Within Claimed State**:
- Claimed providers are **auto-verified by default** using available trust signals
- Human verification required **only** when auto-verification confidence is insufficient
- Trust signals determine badge display but do not constitute a separate state

```
Provider State Model:

  UNCLAIMED                              CLAIMED
  ┌────────────────────┐                ┌──────────────────────────────────┐
  │ • From import      │                │ • Provider controls profile      │
  │ • From scaling     │  ───────────►  │ • Auto-verified via trust signals│
  │ • Basic info only  │    (claim)     │ • Badges based on trust signals  │
  │ • "Claim" CTA      │                │ • Enrichment via user actions    │
  └────────────────────┘                └──────────────────────────────────┘
                                                       │
                                                       ▼
                                        ┌──────────────────────────────────┐
                                        │ Low confidence? Flag for review  │
                                        │ • Admin notified via transaction │
                                        │ • Human review in admin panel    │
                                        └──────────────────────────────────┘
```

**Auto-Verification Flow**:

| Step | Action |
|------|--------|
| 1 | Provider claims listing (or creates profile directly) |
| 2 | System evaluates available trust signals |
| 3a | Confidence sufficient → auto-verified; trust badges displayed |
| 3b | Confidence insufficient → flag for review; admin notified |
| 4 | Human review completed via admin panel |

**Cross-reference**: See Chapter 24 (Trust & Safety) for trust signal details and badge display.

---

### 25.3 Phase 1: Demo (DECIDED)

**Purpose**: Illustrate platform functionality using seeded demo data.

**Assumptions**:

| Attribute | Value |
|-----------|-------|
| Provider count | ~100-500 (sufficient for demo) |
| Data type | Synthetic or anonymized |
| State mix | Mostly unclaimed, some claimed |
| Geographic spread | Representative sample |
| Provider types | All types represented |

**Demo vs Production**:

| Attribute | Demo | Production |
|-----------|------|------------|
| Data source | Seeded fixtures | Legacy DB + scaling sources |
| Contact info | Placeholder | Real |
| Enrichment | Simulated | User-driven |
| Persistence | Wipeable | Permanent |

**Demo Exit**: Demo data wiped entirely before Phase 2 migration.

---

### 25.4 Phase 2: Migration & Reconciliation (DECIDED)

**Purpose**: Migrate existing 40K-provider legacy database into the new platform as the single source of truth.

**Migration Starting State**:

| State | Count | Notes |
|-------|-------|-------|
| **Claimed** | ~200 | Already claimed in legacy system; preserve claimed status |
| **Unclaimed** | ~39,800 | Not yet claimed; import as unclaimed |
| **Total** | ~40,000 | Full legacy dataset |

**Single Source of Truth**:

```
┌─────────────────────────────────────────────────────────┐
│                  Olera Provider Database                │
│                  (Single Source of Truth)               │
├─────────────────────────────────────────────────────────┤
│                          │                              │
│     ┌────────────────────┼────────────────────┐        │
│     ▼                    ▼                    ▼        │
│  Web App            Mobile Apps         Admin Tooling   │
│                     (Future)                            │
└─────────────────────────────────────────────────────────┘
```

**Field Mapping Strategy**:

| Category | Approach |
|----------|----------|
| **Direct mappings** | Legacy field → new field (1:1) |
| **Transformations** | Normalize formats (phone, address, etc.) |
| **Deprecated fields** | Document and exclude |
| **New fields** | Initialize with defaults or null |

**Enrichment at Migration**:

| Provider State | Enrichment Status |
|----------------|-------------------|
| Claimed (~200) | Incomplete; limited to legacy data |
| Unclaimed (~39,800) | Incomplete; limited to legacy data |

**Note**: Migration enrichment is constrained to what exists in the legacy database. No new enrichment occurs during migration itself.

**Duplicate Handling** (Edge Case):

| Aspect | Approach |
|--------|----------|
| Expected frequency | Rare |
| Detection | Match on NPI, address, or name similarity |
| Resolution | Flag for manual review; do not auto-merge |
| Scope | High-level acknowledgment; do not over-engineer |

**Migration Artifacts**:
- Field mapping document
- Deprecation log
- Quality report (issues flagged)
- Claimed provider list (preserved from legacy)

---

### 25.5 Phase 3: Post-Migration Baseline (DECIDED)

**Purpose**: Define steady-state after legacy reconciliation is complete.

**Baseline Population**:

| State | Count | Description |
|-------|-------|-------------|
| **Unclaimed** | ~39,800 | Searchable; "Claim this listing" CTA |
| **Claimed** | ~200 | Provider-controlled; auto-verified via trust signals |

**Provider Lifecycle at Baseline**:

```
┌──────────────────────────────────────────────────────────┐
│  UNCLAIMED (~39,800)                                     │
│  • Imported from legacy                                  │
│  • Visible in directory                                  │
│  • Basic info displayed                                  │
│  • "Claim this listing" CTA prominent                    │
│  • Enrichment: Legacy data only                          │
│                                                          │
│     ↓ Provider claims listing                            │
│                                                          │
│  CLAIMED (~200 initially, grows over time)               │
│  • Provider controls profile                             │
│  • Auto-verification via trust signals (DEFAULT)         │
│  • Human verification ONLY if auto-confidence low        │
│  • Low confidence → flag + admin notification            │
│  • Human review handled in admin panel                   │
│  • Enrichment: User-driven (prompts, nudges, engagement) │
│  • Trust signal badges displayed based on verification   │
└──────────────────────────────────────────────────────────┘
```

**Baseline Assumptions**:

| Assumption | Implication |
|------------|-------------|
| Unclaimed providers are searchable | Families discover providers before claiming |
| Claim rate low initially | Outreach needed to drive claims |
| Enrichment is user-driven | No external enrichment pipelines at baseline |
| Auto-verification is default | Human review is exception, not rule |
| Providers creating profiles = claimed | No unclaimed state for self-created profiles |

**Success Criteria**:
- All 40K providers accessible in new platform
- Search and filtering functional
- Two-state model (Unclaimed/Claimed) operational
- Auto-verification working with trust signals
- Admin panel handles human review escalations
- No dependency on legacy system

---

### 25.6 Phase 4: Scaling (DECIDED)

**Purpose**: Grow beyond 40K providers through systematic, compliant, auditable data acquisition.

**Scaling Target**: 40K → 500K+ providers

**New Provider Characteristics**:

| Attribute | Value |
|-----------|-------|
| Initial state | Unclaimed |
| Initial enrichment | **None** |
| Enrichment pathway | Post-ingestion workflows (prompts, nudges when claimed) |

**Four Pillars of Data Acquisition**:

| Pillar | Description | Legal Consideration |
|--------|-------------|---------------------|
| **1. Public Data Sources** | State licensing DBs, CMS Medicare, registries | Generally permissible; attribution may apply |
| **2. API-Based Acquisition** | Google Places, state APIs | ToS compliance; rate limits; costs |
| **3. Web Scraping** | Structured extraction from public sites | Legal review required; robots.txt compliance |
| **4. Third-Party Data Providers** | Commercial data vendors | Licensing agreements; usage restrictions |

**Scaling Principles**:

| Principle | Description |
|-----------|-------------|
| **Repeatable** | Documented import process per source |
| **Compliant** | Legal review before any new source |
| **Auditable** | Every record traceable to source |
| **Incremental** | One source at a time; validate before expanding |

**Enrichment for Scaled Providers**:

| Stage | Enrichment Status |
|-------|-------------------|
| At ingestion | None (basic record only) |
| Post-ingestion (unclaimed) | Minimal; awaiting claim |
| Post-claim | User-driven (onboarding, prompts, nudges, engagement) |

---

### 25.7 Phase Summary

| Phase | Trigger | Exit Criteria |
|-------|---------|---------------|
| **1. Demo** | Project kickoff | Demo complete; data wiped |
| **2. Migration** | Demo complete | 40K providers in new system (200 claimed, 39.8K unclaimed) |
| **3. Baseline** | Migration complete | System stable; two-state model operational; auto-verification working |
| **4. Scaling** | Baseline stable + legal framework | Ongoing; measured by provider growth |

---

### 25.8 Implementation Status

| Item | Status | Notes |
|------|--------|-------|
| Demo data seeding | ⬜ Not Built | Required for demo |
| Legacy migration scripts | ⬜ Not Built | Post-demo |
| Field mapping document | ⬜ Not Built | Post-demo |
| Auto-verification logic | ⬜ Not Built | Post-demo |
| Admin review queue | ⬜ Not Built | Post-demo |
| Scaling pipelines | ⬜ Not Built | Post-baseline |
| Legal compliance framework | ⬜ Not Built | Required before scaling |

### 25.9 Key Decisions Log

| Decision | Status | Rationale |
|----------|--------|-----------|
| Four-phase approach | ✅ Decided | Clear progression from demo to scale |
| Two-state model (Unclaimed/Claimed) | ✅ Decided | Simpler than three-tier; verification implicit via trust signals |
| Auto-verification by default | ✅ Decided | Human review only when confidence insufficient |
| User-driven enrichment definition | ✅ Decided | Distinguishes from external data acquisition |
| Demo data wipeable | ✅ Decided | Clean separation between demo and production |
| ~200 claimed at migration | ✅ Decided | Reflects actual legacy state |

---

### 25.10 Cross-References

| Topic | Chapter |
|-------|---------|
| Provider profiles | Ch 7: Provider Profiles |
| Claiming flow | Ch 10: Provider Claiming |
| Trust signals & badges | Ch 24: Trust & Safety |
| Provider data management | Ch 25: Provider Data Management |
| Profile completion nudges | Ch 11: Profile Completion & Matching |
| Onboarding flows | Ch 3: Onboarding Wizard |
| Admin panel | Ch 27: Admin System |

---

## Chapter 38: Third-Party Services & Integrations

**Review Status**: ✅ Reviewed

**Purpose**: Serve as the central, authoritative registry for all third-party services, external APIs, and vendor integrations used across the platform. This chapter provides a single reference point for understanding what external dependencies exist, how they are configured, and where they are used.

> **Cross-Reference**: Individual services are documented in detail within their functional chapters (e.g., Resend in Chapter 34, Vercel in Chapter 32). This chapter provides the master inventory and cross-references.

---

### 38.1 Service Inventory (DECIDED)

> **Complete registry of all external services the platform depends on.**

#### 38.1.1 Infrastructure Services

| Service | Purpose | Status | Chapter Reference |
|---------|---------|--------|-------------------|
| **Vercel** | Hosting, deployment, edge functions | ✅ Active | Ch 32: Hosting & Deployment |
| **Neon** | PostgreSQL database (serverless) | ✅ Active | Ch 31: Application Architecture |
| **Vercel Blob** | File/image storage | ✅ Active | Ch 33: File Uploads & Media |

#### 38.1.2 Communication Services

| Service | Purpose | Status | Chapter Reference |
|---------|---------|--------|-------------------|
| **Resend** | Transactional email delivery | ✅ Active | Ch 34: Communications Infrastructure |
| **Twilio** | SMS delivery | ⬜ Future | Ch 34: Communications Infrastructure |

#### 38.1.3 Authentication & Security

| Service | Purpose | Status | Chapter Reference |
|---------|---------|--------|-------------------|
| **NextAuth.js** | Authentication framework | ✅ Active | Ch 1: Authentication |
| **bcrypt** | Password hashing | ✅ Active | Ch 1: Authentication |

#### 38.1.4 Payment & Billing

| Service | Purpose | Status | Chapter Reference |
|---------|---------|--------|-------------------|
| **Stripe** | Subscription billing, payment processing | ✅ Demo | Ch 21: Subscriptions & Paywalls |

#### 38.1.5 Analytics & Monitoring

| Service | Purpose | Status | Chapter Reference |
|---------|---------|--------|-------------------|
| **Google Analytics** | User analytics, traffic analysis | 🟡 Optional | Ch 37: Analytics & Audit Logging |
| **Sentry** | Error tracking, monitoring | 🟡 Optional | Ch 35: Error Handling & Monitoring |

#### 38.1.6 Video & Scheduling (Future)

| Service | Purpose | Status | Chapter Reference |
|---------|---------|--------|-------------------|
| **Zoom API** | Video meeting integration | ⬜ Future | Ch 17: Multi-Context Scheduling |
| **Google Meet API** | Video meeting integration | ⬜ Future | Ch 17: Multi-Context Scheduling |

---

### 38.2 Environment Variable Registry (DECIDED)

> **Single source of truth for all environment variables required by third-party integrations.**

#### 38.2.1 Required Variables (Demo)

| Variable | Service | Purpose | Secret? |
|----------|---------|---------|---------|
| `DATABASE_URL` | Neon | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | NextAuth.js | Session encryption key | Yes |
| `NEXTAUTH_URL` | NextAuth.js | Application base URL | No |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob | File storage authentication | Yes |

#### 38.2.2 Optional Variables (Demo)

| Variable | Service | Purpose | Secret? |
|----------|---------|---------|---------|
| `RESEND_API_KEY` | Resend | Email delivery authentication | Yes |
| `STRIPE_SECRET_KEY` | Stripe | Payment processing (server) | Yes |
| `STRIPE_PUBLISHABLE_KEY` | Stripe | Payment processing (client) | No |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Webhook signature verification | Yes |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics | Analytics tracking ID | No |
| `SENTRY_DSN` | Sentry | Error reporting endpoint | No |

#### 38.2.3 Future Variables (Production)

| Variable | Service | Purpose | Secret? |
|----------|---------|---------|---------|
| `TWILIO_ACCOUNT_SID` | Twilio | SMS authentication | Yes |
| `TWILIO_AUTH_TOKEN` | Twilio | SMS authentication | Yes |
| `TWILIO_PHONE_NUMBER` | Twilio | SMS sender number | No |
| `ZOOM_CLIENT_ID` | Zoom | Video meeting OAuth | Yes |
| `ZOOM_CLIENT_SECRET` | Zoom | Video meeting OAuth | Yes |
| `GOOGLE_CLIENT_ID` | Google | OAuth / Meet integration | Yes |
| `GOOGLE_CLIENT_SECRET` | Google | OAuth / Meet integration | Yes |

#### 38.2.4 Environment Configuration Pattern

```
# .env.example serves as the authoritative template
# All new environment variables MUST be added to .env.example with:
# 1. Clear comment explaining purpose
# 2. Example value format
# 3. Link to where the value is obtained
```

---

### 38.3 API Integration Patterns (DECIDED)

> **Standardized patterns for integrating with external APIs.**

#### 38.3.1 Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Application Layer                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐               │
│  │ API Routes  │   │ Server      │   │ Background  │               │
│  │             │   │ Actions     │   │ Jobs        │               │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘               │
│         │                 │                 │                       │
│         └─────────────────┼─────────────────┘                       │
│                           │                                         │
│                           ▼                                         │
│              ┌────────────────────────┐                             │
│              │   Service Layer        │                             │
│              │   /lib or /services    │                             │
│              └───────────┬────────────┘                             │
│                          │                                          │
├──────────────────────────┼──────────────────────────────────────────┤
│                          ▼                                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │ Prisma  │  │ Resend  │  │ Stripe  │  │ Vercel  │  │ Twilio  │   │
│  │ (Neon)  │  │ API     │  │ API     │  │ Blob    │  │ API     │   │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │
│                                                                     │
│                       External Services                             │
└─────────────────────────────────────────────────────────────────────┘
```

#### 38.3.2 Service Wrapper Pattern

All third-party integrations should use a service wrapper:

```typescript
// lib/email.ts - Example service wrapper pattern
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  template,
  data,
}: SendEmailParams) {
  // Validation
  if (!process.env.RESEND_API_KEY) {
    console.warn('Email not sent: RESEND_API_KEY not configured');
    return { success: false, reason: 'not_configured' };
  }

  // Send via external API
  const result = await resend.emails.send({
    from: 'Olera <notifications@olera.com>',
    to,
    subject,
    react: renderTemplate(template, data),
  });

  return { success: true, id: result.id };
}
```

**Pattern Benefits**:
- Centralized configuration
- Graceful degradation when not configured
- Consistent error handling
- Easy mocking for tests

#### 38.3.3 Rate-Limited API Handling

| Service | Rate Limit | Handling Strategy |
|---------|------------|-------------------|
| Resend | 100/day (free) | Queue + batch for production |
| Stripe | 100/sec | Webhook-based, no polling |
| Twilio | Varies by plan | Queue for bulk SMS |
| Vercel Blob | 1000/min | Client-side retry with backoff |

---

### 38.4 Service Dependencies by Feature (DECIDED)

> **Which services are required for each platform feature.**

| Feature | Required Services | Optional Services |
|---------|-------------------|-------------------|
| **Core Platform** | Vercel, Neon, NextAuth | - |
| **User Authentication** | NextAuth, bcrypt | Google OAuth (future) |
| **Email Notifications** | Resend | - |
| **Profile Images** | Vercel Blob | - |
| **Subscriptions** | Stripe | - |
| **Analytics** | - | Google Analytics |
| **Error Tracking** | - | Sentry |
| **SMS Notifications** | - | Twilio (future) |
| **Video Scheduling** | - | Zoom, Google Meet (future) |

---

### 38.5 Vendor Evaluation & Management (DECIDED)

> **Criteria and process for evaluating and managing third-party vendors.**

#### 38.5.1 Vendor Selection Criteria

| Criterion | Weight | Evaluation |
|-----------|--------|------------|
| **Reliability** | High | Uptime SLAs, incident history |
| **Developer Experience** | High | Documentation, SDK quality, support |
| **Data Privacy** | High | GDPR compliance, data handling |
| **Cost** | Medium | Free tier, scaling costs |
| **Scalability** | Medium | Growth capacity, rate limits |
| **Lock-in Risk** | Low | Migration path, data portability |

#### 38.5.2 Current Vendor Decisions

| Service | Vendor | Why Chosen | Alternatives Considered |
|---------|--------|------------|-------------------------|
| Hosting | Vercel | Next.js native, edge functions, easy deployment | AWS, Netlify, Railway |
| Database | Neon | Serverless PostgreSQL, Prisma support, free tier | Supabase, PlanetScale |
| Email | Resend | Modern API, React Email, excellent DX | SendGrid, Postmark |
| Storage | Vercel Blob | Native Vercel integration, simple API | AWS S3, Cloudflare R2 |
| Payments | Stripe | Industry standard, comprehensive API | Paddle, LemonSqueezy |

#### 38.5.3 Vendor Change Process

1. **Proposal**: Document reason for change, alternatives evaluated
2. **Impact Assessment**: Identify affected chapters and code
3. **Migration Plan**: Step-by-step transition approach
4. **Implementation**: Execute with rollback capability
5. **Documentation**: Update this chapter and all cross-references

---

### 38.6 Admin Integration Visibility (DECIDED)

> **How third-party integrations appear in the Admin panel.**

**Location**: Admin > System > External Tools Map

#### Admin External Tools Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│ Admin > System > External Tools                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ INFRASTRUCTURE                                                      │
│ ┌─────────────────────┐ ┌─────────────────────┐                     │
│ │ Vercel              │ │ Neon                │                     │
│ │ ✅ Connected        │ │ ✅ Connected        │                     │
│ │ [Dashboard →]       │ │ [Dashboard →]       │                     │
│ └─────────────────────┘ └─────────────────────┘                     │
│                                                                     │
│ COMMUNICATIONS                                                      │
│ ┌─────────────────────┐ ┌─────────────────────┐                     │
│ │ Resend              │ │ Twilio              │                     │
│ │ ✅ Configured       │ │ ⬜ Not Configured   │                     │
│ │ [Dashboard →]       │ │ [Setup Guide →]     │                     │
│ └─────────────────────┘ └─────────────────────┘                     │
│                                                                     │
│ PAYMENTS                                                            │
│ ┌─────────────────────┐                                             │
│ │ Stripe              │                                             │
│ │ ✅ Connected        │                                             │
│ │ [Dashboard →]       │                                             │
│ └─────────────────────┘                                             │
│                                                                     │
│ ANALYTICS & MONITORING                                              │
│ ┌─────────────────────┐ ┌─────────────────────┐                     │
│ │ Google Analytics    │ │ Sentry              │                     │
│ │ 🟡 Optional         │ │ 🟡 Optional         │                     │
│ │ [Setup Guide →]     │ │ [Setup Guide →]     │                     │
│ └─────────────────────┘ └─────────────────────┘                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

| Feature | Demo | Production |
|---------|------|------------|
| Service status indicators | ✅ | ✅ |
| External dashboard links | ✅ | ✅ |
| Configuration status | ✅ | ✅ |
| Usage metrics | ⬜ Defer | ✅ |
| Cost tracking | ⬜ Defer | ✅ |

> **Cross-Reference**: See Chapter 26 (Admin System) Section 26.17 for full External Tools Map specification.

---

### 38.7 Demo vs Production Scope

| Aspect | Demo | Production |
|--------|------|------------|
| **Required Services** | Vercel, Neon, NextAuth, Vercel Blob, Stripe | All listed |
| **Optional Services** | Resend (email), Analytics | All configured |
| **Service Monitoring** | Basic status checks | Full health monitoring |
| **Cost Tracking** | Not included | Dashboard integration |
| **SLA Monitoring** | Not included | Automated alerts |

---

### 38.8 Cross-Reference Index

This chapter serves as the central registry. Detailed implementation for each service is documented in the referenced chapters:

| Service Category | Primary Chapter | Related Chapters |
|------------------|-----------------|------------------|
| Hosting & Deployment | Ch 32 | Ch 31, Ch 35 |
| Database | Ch 31 | Ch 36 |
| Email | Ch 34 | Ch 19 |
| File Storage | Ch 33 | Ch 7, Ch 6 |
| Payments | Ch 21 | Ch 26 |
| Authentication | Ch 1 | Ch 8 |
| Analytics | Ch 37 | Ch 26, Ch 28 |
| Error Monitoring | Ch 35 | Ch 26 |

---

## Chapter 39: Legal Framework Overview

**Review Status**: ✅ Reviewed

**Purpose**: Serve as the legal backbone of the platform, documenting all legal requirements, regulatory compliance frameworks, policies, and procedures that govern Olera's operations.

> **Important**: This chapter documents legal requirements and content structure. Actual legal document text must be reviewed by qualified legal counsel before production launch.

---

### Platform Legal Positioning (DECIDED)

> **Olera Legal Positioning**
>
> Olera operates as an **information marketplace and directory service** connecting families seeking care with care providers.
>
> **Olera Does NOT**:
> - Provide care services directly
> - Employ caregivers or care workers
> - Guarantee care quality or outcomes
> - Process care-related payments (current scope)
> - Provide medical advice, diagnoses, or recommendations
>
> **Olera DOES**:
> - Provide information about care providers from public sources and self-reporting
> - Facilitate communication between families and providers
> - Display user-generated reviews and ratings
> - Offer tools to help families organize their care search
>
> This positioning maintains Section 230 protections and limits platform liability.

---

### Chapter Structure

| Section | Description | Status |
|---------|-------------|--------|
| **39.1 Core Legal & Policy Documents** | User-facing legal documents | ✅ Reviewed |
| **39.2 Compliance, Moderation & Enforcement** | Internal policies and SOPs | ✅ Reviewed |
| **39.3 Data Governance & User Rights** | Data handling policies | ✅ Reviewed |
| **39.4 Transparency Hub Pages** | Public explainer pages | ✅ Decided |

---

### 39.1 Core Legal & Policy Documents

> User-facing legal documents governing the relationship between Olera and its users.

| Document | Purpose | Demo | Production |
|----------|---------|------|------------|
| **39.1.1 Terms of Service** | User agreement (all users) | ✅ Draft | ✅ Attorney-reviewed |
| **39.1.2 Privacy Notice** | Data collection disclosures | ✅ Draft | ✅ Attorney-reviewed |
| **39.1.3 Cookie & Tracking Policy** | Cookie disclosure | 🟡 Basic banner | ✅ Full policy |
| **39.1.4 Review Policy** | Review guidelines | ✅ Documented (Ch 23) | ✅ Same |
| **39.1.5 Advertising Disclosure** | FTC compliance | ✅ Implemented | ✅ Same |
| **39.1.6 Accessibility Statement** | ADA compliance | ✅ Draft | ✅ Polished |
| **39.1.7 Medical Disclaimer** | Liability limitation | ✅ Implemented | ✅ Same |
| **39.1.8 No-PHI Warning** | HIPAA compliance | ✅ Implemented | ✅ Same |
| **39.1.9 AI Disclosure** | AI transparency | ✅ Implemented | ✅ Same |
| **39.1.10 Featured Badge Tooltip** | Paid feature disclosure | ✅ Implemented | ✅ Same |
| **39.1.11 Ranking Transparency** | How search works | 🟡 Basic | ✅ Full page |
| **39.1.12 Olera Score Methodology** | Score calculation | 🟡 Basic | ✅ Full page |

#### 39.1.1 Terms of Service (DECIDED)

**Document Approach**: Single Terms of Service with role-specific sections for Care Seekers and Providers. This simplifies surfacing at touchpoints while maintaining distinct obligations.

**Surfacing Points**:
| Touchpoint | Action |
|------------|--------|
| Account creation | Checkbox + link: "I agree to the Terms of Service" |
| Provider claiming | Additional checkbox for provider-specific terms |
| Subscription checkout | Checkbox + link including subscription terms |
| First review submission | Link to Review Policy |

**Terms of Service Structure**:

| Section | Key Provisions |
|---------|----------------|
| **1. Acceptance** | Using the platform = accepting terms |
| **2. Eligibility** | Age 18+, legal capacity |
| **3. Account Terms** | Accurate info, account security, one account per person |
| **4. Platform Description** | Information marketplace (not healthcare provider) |
| **5. Acceptable Use** | Prohibited activities, content standards |
| **6. User Content** | Users responsible for their content; license to Olera |
| **7. Care Seeker Terms** | Inquiry process, independent verification responsibility |
| **8. Provider Terms** | Accurate info attestation, licensing representation, response expectations, claiming terms |
| **9. Reviews** | Guidelines, Olera's right to remove, provider response rights |
| **10. Intellectual Property** | Olera owns platform; trademarks |
| **11. Disclaimers** | Not healthcare provider, info "as-is", no outcome guarantees |
| **12. Limitation of Liability** | Cap on damages, exclusions |
| **13. Indemnification** | Users indemnify Olera for their content/conduct |
| **14. Dispute Resolution** | Governing law (Texas), informal resolution first, arbitration optional |
| **15. Termination** | Olera can terminate; user can close account; effect of termination |
| **16. Changes** | How updates are communicated; continued use = acceptance |
| **17. General** | Severability, entire agreement, no waiver |

**Key Disclaimers** (Section 11):

> "Olera is an information marketplace that connects families with care providers. Olera is NOT a healthcare provider and does NOT provide medical advice, diagnosis, treatment, or care services. Olera does NOT employ caregivers, guarantee care quality, or verify all provider claims. Information on this platform is provided 'as-is' from public sources and provider self-reporting. Users are responsible for independently verifying provider credentials, licensing, and suitability before engaging any provider."

#### 39.1.2 Privacy Notice (DECIDED)

**Structure**:

| Section | Content |
|---------|---------|
| **Information We Collect** | Account data, profile data, usage data, device info, cookies |
| **How We Collect It** | Direct input, automatic collection, third parties (analytics) |
| **How We Use It** | Service delivery, matching, communication, analytics, marketing, safety |
| **Legal Basis** | Contract, consent, legitimate interest |
| **Information Sharing** | With providers (per consent), service providers, legal requirements |
| **Third-Party Services** | Analytics, hosting, email — no selling of personal data |
| **Data Retention** | Retention periods (see 39.3.1) |
| **Your Rights** | Access, correction, deletion, portability, objection |
| **California Rights (CCPA)** | Right to know, delete, opt-out of sale (we don't sell), non-discrimination |
| **Security** | Encryption, access controls, monitoring |
| **Children** | No collection from under-18 |
| **International** | US-based; no EU targeting |
| **Changes** | How updates communicated, effective date |
| **Contact** | Privacy inquiries contact |

**CCPA-Specific Disclosures**:

| Category | Collected | Disclosed To | Sold |
|----------|-----------|--------------|------|
| Identifiers | ✅ | Service providers, providers (with consent) | ❌ No |
| Commercial info | ✅ | Service providers | ❌ No |
| Internet activity | ✅ | Analytics providers | ❌ No |
| Geolocation | ✅ (coarse) | Service providers | ❌ No |
| Professional info | ✅ (providers) | Users (public profile) | ❌ No |

#### 39.1.3 Medical & Emergency Disclaimer (DECIDED)

**Standard Text**:

> "Olera is not a healthcare provider and does not provide medical advice, diagnosis, or treatment. Information on this platform is for informational purposes only and should not be used as a substitute for professional medical advice. Always consult qualified healthcare professionals for medical decisions. In case of medical emergency, call 911 immediately."

**Placement**:
- Global footer
- Provider profile pages (above inquiry form)
- Inquiry submission confirmation
- Help/FAQ pages

#### 39.1.4 No-PHI Warning Prompt (DECIDED)

**HIPAA Position**: Olera is NOT a HIPAA-covered entity. Olera does not meet the definition of a covered entity (healthcare provider transmitting health information electronically, health plan, or healthcare clearinghouse) and does not collect, store, or process Protected Health Information (PHI). No Business Associate Agreement (BAA) workflow is required or offered.

**No-PHI Warning Text**:

> "**Important**: Please do not share sensitive medical information, diagnoses, medical records, treatment details, or other protected health information (PHI) in messages, profiles, reviews, or file uploads. Olera is not a healthcare provider and cannot protect medical information under HIPAA. Keep communications focused on care needs and logistics."

**Placement** (prominent UI display):

| Location | Display |
|----------|---------|
| **Message composer** | Yellow warning banner above text input |
| **Profile forms** (family care needs) | Warning text above free-text fields |
| **Inquiry forms** | Warning text above message field |
| **File upload** | Warning modal before upload: "Do not upload medical records, prescriptions, or documents containing PHI" |
| **Review submission** | Warning text above review body |

**File Upload Specific Warning**:

> "**Do not upload medical records.** Olera cannot accept medical records, prescriptions, diagnostic reports, or any documents containing protected health information (PHI). Acceptable uploads include: profile photos, facility photos, certifications, and business documents."

---

### 39.2 Compliance, Moderation & Enforcement

> Internal policies and SOPs for maintaining platform integrity.

| Document | Purpose | Demo | Production |
|----------|---------|------|------------|
| **39.2.1 DMCA Policy** | Copyright safe harbor | ✅ Contact + process | ✅ Full workflow |
| **39.2.2 Takedown Process** | Content removal | ✅ Manual | ✅ Ticketed workflow |
| **39.2.3 Provider Verification SOP** | Verification procedures | ✅ Manual | ✅ Documented |
| **39.2.4 Content Moderation SOP** | UGC moderation | ✅ Manual | ✅ Documented |
| **39.2.5 Legal Escalation SOP** | Defamation, legal threats | 🟡 Outline | ✅ Full SOP |
| **39.2.6 Incident Response Plan** | Data breach procedures | 🟡 Outline | ✅ Full IRP |
| **39.2.7 Accessibility SOP** | ADA response | 🟡 Outline | ✅ Full SOP |
| **39.2.8 Privacy Impact Assessment** | New feature review | ❌ Deferred | ✅ Template |

#### 39.2.1 DMCA & Trademark Policy (DECIDED)

**Section 230 and DMCA Background**:

Section 230 of the Communications Decency Act (47 U.S.C. § 230) provides that "No provider or user of an interactive computer service shall be treated as the publisher or speaker of any information provided by another information content provider." This means Olera is generally not liable for user-generated content (reviews, messages, profile information submitted by users).

**Key Legal Points**:
- Section 230 immunity applies to user-generated content
- Content moderation does NOT destroy Section 230 protection (the "Good Samaritan" provision)
- DMCA provides safe harbor for copyright claims IF proper procedures are followed
- Platform can lose protection if it materially contributes to unlawful content

**DMCA Designated Agent**:
- Name: [To be designated]
- Email: dmca@olera.com
- Address: [Company address]
- Registration: Must register with US Copyright Office

**DMCA Takedown Process**:

| Step | Action | Timeline |
|------|--------|----------|
| 1 | Receive DMCA notice | Log immediately |
| 2 | Verify notice completeness | Within 24 hours |
| 3 | Remove/disable content | "Expeditiously" (within 24-48 hours) |
| 4 | Notify content poster | Within 24 hours of removal |
| 5 | Receive counter-notice (if any) | 10-14 days for counter |
| 6 | Restore content (if counter-notice valid) | 10-14 days after counter |
| 7 | Document resolution | Ongoing |

**DMCA Notice Requirements** (must include all):
- Physical/electronic signature of copyright owner
- Identification of copyrighted work
- Identification of infringing material + location
- Contact information
- Good faith statement
- Accuracy statement under penalty of perjury

**Repeat Infringer Policy**: Accounts with 3+ valid DMCA strikes will be terminated.

#### 39.2.2 Defamation / Legal Escalation SOP (DECIDED)

**Guiding Principle**: Section 230 generally protects Olera from defamation liability for user reviews. However, good-faith response procedures are important for risk management and user trust.

**Escalation Triggers**:
- Lawyer letter / cease and desist
- Formal legal complaint
- Regulatory inquiry
- Subpoena or court order
- Credible defamation claim

**Response Process**:

| Step | Action | Timeline | Owner |
|------|--------|----------|-------|
| 1 | Receive complaint | Log in Legal Queue | Support |
| 2 | Initial assessment | Within 24 hours | Admin |
| 3 | Preserve content | Before any action | Admin |
| 4 | Classify severity | Within 24 hours | Admin Lead |
| 5 | Escalate to counsel | If credible legal threat | Admin Lead |
| 6 | Acknowledge receipt | Within 48-72 hours | Admin/Counsel |
| 7 | Investigate claim | Per counsel guidance | Counsel |
| 8 | Decision + action | Per counsel guidance | Counsel |
| 9 | Respond to complainant | Per counsel guidance | Counsel |
| 10 | Document resolution | After resolution | Admin |

**Content Preservation**: Never delete content that is subject to a legal complaint without counsel approval. Preserve screenshots, metadata, and user information.

**Response Templates**:
- Acknowledgment of receipt
- Request for additional information
- Explanation of Section 230 (if applicable)
- Resolution notification

#### 39.2.3 Incident Response Plan (DECIDED)

**Scope**: Security incidents, data breaches, unauthorized access

**Incident Classification**:

| Severity | Description | Response Time |
|----------|-------------|---------------|
| **Critical** | Confirmed data breach with PII exposure | Immediate |
| **High** | Suspected breach, unauthorized access | Within 2 hours |
| **Medium** | Security vulnerability discovered | Within 24 hours |
| **Low** | Minor security event, no data exposure | Within 72 hours |

**Response Phases**:

| Phase | Actions |
|-------|---------|
| **1. Detection** | Monitoring alerts, user reports, security scans |
| **2. Containment** | Isolate systems, revoke access, preserve evidence |
| **3. Assessment** | Determine scope, affected users, data types |
| **4. Notification** | Legal obligations (CA: 72 hours), affected users, authorities if required |
| **5. Remediation** | Patch vulnerability, restore systems, reset credentials |
| **6. Recovery** | Monitor for recurrence, restore normal operations |
| **7. Post-Incident** | Root cause analysis, update procedures, document lessons |

**Notification Requirements**:
- California (CCPA): Notify AG if 500+ CA residents affected
- Other states: Varying requirements, consult counsel
- Users: "Without unreasonable delay"

---

### 39.3 Data Governance & User Rights

> Policies governing data retention, deletion, and user rights.

| Document | Purpose | Demo | Production |
|----------|---------|------|------------|
| **39.3.1 Data Retention Policy** | Retention periods | ✅ Documented | ✅ Same |
| **39.3.2 Data Export & Portability** | User data export | 🟡 Manual (support) | ✅ Self-service |
| **39.3.3 Consent Text** | Form consent language | ✅ Implemented | ✅ Same |
| **39.3.4 Subscription Terms** | Auto-renewal | ✅ Documented | ✅ Same |

#### 39.3.1 Data Retention & Deletion Policy (DECIDED)

**Retention Periods**:

| Data Type | Retention Period | Deletion Trigger |
|-----------|------------------|------------------|
| **Active account data** | While account active | Account deletion request |
| **Deleted account data** | 30 days (soft delete) | Auto-purge after 30 days |
| **Messages** | 3 years after last activity | Account deletion (both parties) OR auto-purge |
| **Reviews** | Indefinitely | Author deletion request OR moderation removal |
| **Provider data (unclaimed)** | Indefinitely (public info) | Provider removal request |
| **Provider data (claimed)** | While claimed + 30 days | Account deletion |
| **Audit logs** | 7 years | Automated purge |
| **Analytics (anonymized)** | Indefinitely | N/A (anonymized) |
| **Support tickets** | 3 years | Automated purge |
| **Email/SMS logs** | 1 year | Automated purge |

**Deletion Process**:

| Step | Action | Timeline |
|------|--------|----------|
| 1 | User requests deletion | Immediate acknowledgment |
| 2 | Account soft-deleted | Within 24 hours |
| 3 | User data anonymized/deleted | Within 30 days |
| 4 | Backups purged | Within 90 days |
| 5 | Confirmation sent | Upon completion |

**Exceptions to Deletion**:
- Active legal hold
- Pending dispute or investigation
- Required for fraud prevention (anonymized patterns only)
- Regulatory retention requirements

**Legal Hold Process**: When litigation is anticipated or pending, affected data is flagged and excluded from routine deletion.

#### 39.3.2 Data Export & Portability (DECIDED)

**User Rights**:
- Download personal data in machine-readable format (JSON)
- Request within 45 days (CCPA compliance)
- Free of charge (first request per 12 months)

**Export Contents** (Care Seekers):

| Category | Included |
|----------|----------|
| **Profile** | Name, email, location, preferences |
| **Care profiles** | All care recipient profiles |
| **Messages** | Sent and received messages |
| **Reviews** | Reviews authored |
| **Saved providers** | Saved/favorited providers |
| **Activity** | Search history, engagement history |
| **Settings** | Preferences, notification settings |

**Export Contents** (Providers):

| Category | Included |
|----------|----------|
| **Profile** | All profile information |
| **Engagements** | Inquiry history, engagement data |
| **Reviews received** | Reviews and responses |
| **Messages** | Sent and received |
| **Analytics** | Profile views, response rates |

**Demo Scope**: Manual export via support request
**Production Scope**: Self-service in Settings → Privacy → "Download my data"

#### 39.3.3 Inquiry Form Consent Text (DECIDED)

**Standard Consent** (displayed on inquiry submission):

> "By submitting this inquiry, you consent to Olera sharing your name, email, phone number, and message with **[Provider Name]** so they can respond to your request. The provider may contact you directly. See our [Privacy Notice] for details on how your information is used and protected."

**Checkbox Text** (required before submission):

> "I consent to sharing my contact information with this provider"

#### 39.3.4 Premium Subscription Terms (DECIDED)

**Auto-Renewal Disclosure** (per FTC guidelines, state laws):

> "Your subscription will automatically renew at the end of each billing period at the then-current rate unless you cancel before the renewal date. You can cancel anytime in your Account Settings. Cancellation takes effect at the end of your current billing period."

**Placement**:
- Subscription checkout page (prominent)
- Confirmation email
- Account Settings → Subscription

**Cancellation**:
- Self-service cancellation in Settings
- No penalty for cancellation
- Access continues until end of billing period
- Confirmation email upon cancellation

---

### Regulatory Compliance Matrix (DECIDED)

| Regulation | Applies | Olera Obligation | Implementation |
|------------|---------|------------------|----------------|
| **Section 230** | ✅ Yes | Maintain platform (not publisher) status | Don't editorialize; moderate per policy; preserve immunity |
| **DMCA** | ✅ Yes | Safe harbor procedures | Designated agent, takedown process (39.2.1) |
| **CCPA/CPRA** | ✅ Yes | Privacy rights for CA residents | Privacy Notice (39.1.2) + data request workflow |
| **HIPAA** | ❌ No | N/A — not a covered entity | No-PHI prompts (39.1.8), disclaimers, no BAA |
| **ADA/WCAG** | ✅ Yes | Web accessibility | WCAG AA compliance (Ch 37) |
| **FTC Act** | ✅ Yes | Truth in advertising | Honest marketing, endorsement disclosure |
| **CAN-SPAM** | ✅ Yes | Email marketing compliance | Unsubscribe, sender ID, physical address |
| **TCPA** | ✅ Yes | SMS/call consent | Opt-in for SMS, easy opt-out, no autodialing |
| **State Licensing** | ⚠️ Monitor | Some states regulate referrals | Legal review before state expansion |
| **GDPR** | ❌ No | Not targeting EU users | Revisit if international expansion |

---

### Liability Framework (DECIDED)

#### Liability Allocation

| Party | Responsible For |
|-------|-----------------|
| **Olera** | Platform availability, data security, accuracy of Olera-generated content, moderation per policy |
| **Providers** | Accuracy of self-reported info, care quality, licensing compliance, response to inquiries |
| **Care Seekers** | Accuracy of their profiles, their conduct, due diligence in provider selection |

#### Olera Disclaims Liability For

- Care quality or outcomes
- Provider licensing status (beyond displayed info)
- Accuracy of public-source provider data
- Accuracy of provider self-reported data
- Actions taken outside the platform
- User-generated content (reviews, messages)
- Loss from reliance on platform information
- Provider responsiveness or availability
- Disputes between users and providers

#### Required Disclaimers

| Disclaimer | Placement | Text Summary |
|------------|-----------|--------------|
| **Not a Healthcare Provider** | Footer, ToS, profiles, inquiry forms | Olera doesn't provide medical advice or care |
| **Information As-Is** | Provider profiles, ToS | Verify independently; public sources + self-reporting |
| **No Employment Relationship** | Hiring marketplace, ToS | Olera doesn't employ caregivers |
| **No Outcome Guarantee** | ToS, Help pages | Olera doesn't guarantee care quality |
| **Verify Independently** | Provider profiles, inquiry confirmation | Users responsible for due diligence |
| **Review Disclaimer** | Reviews section | Individual experiences; may not be typical |

---

### Demo vs. Production Scope Summary

| Category | Demo | Production |
|----------|------|------------|
| **Legal Documents** | ✅ Draft placeholders (clearly marked) | ✅ Attorney-reviewed |
| **Terms of Service** | ✅ Draft | ✅ Attorney-reviewed |
| **Privacy Notice** | ✅ Draft with CCPA elements | ✅ Attorney-reviewed |
| **Cookie Consent** | 🟡 Basic banner | ✅ Granular controls |
| **Disclaimers** | ✅ All implemented | ✅ Same |
| **No-PHI Warnings** | ✅ All placements | ✅ Same |
| **DMCA Process** | ✅ Contact email + manual | ✅ Full workflow |
| **Data Export** | 🟡 Manual (support request) | ✅ Self-service |
| **Account Deletion** | 🟡 Manual (support request) | ✅ Self-service |
| **Transparency Hub** | 🟡 Overview page only | ✅ All 5 pages |
| **All SOPs** | 🟡 Outline/placeholder | ✅ Fully documented |
| **Legal Counsel Review** | ❌ Not required | ✅ Required before launch |

---

### 39.4 Transparency Hub Pages (DECIDED)

**Purpose**: Public-facing pages explaining how Olera works, building trust through transparency about platform mechanics.

**URL Structure**: `/how-olera-works/`

**Hub Pages**:

| Page | URL | Purpose |
|------|-----|---------|
| **Overview** | `/how-olera-works/` | Platform mission, mechanics summary, links to detail pages |
| **How Listings Work** | `/how-olera-works/listings/` | Claimed vs unclaimed providers, data sources, verification |
| **How Scores Work** | `/how-olera-works/scores/` | Trust score methodology, data sources, calculation factors |
| **How Reviews Work** | `/how-olera-works/reviews/` | Review collection, verification, moderation policies |
| **How Requests Work** | `/how-olera-works/requests/` | Information request routing, provider matching, response times |

#### Overview Page Content

| Section | Content |
|---------|---------|
| **Hero** | "How Olera Works" + mission statement |
| **Quick Links** | Cards linking to each detail page |
| **Trust Commitment** | Statement on transparency and user protection |
| **Contact** | Link to support for questions |

#### How Listings Work

| Section | Content |
|---------|---------|
| **Data Sources** | Where provider information comes from |
| **Unclaimed Listings** | What unclaimed means, how providers can claim |
| **Claimed Listings** | Benefits of claimed status, verification |
| **Updating Information** | How providers update their listings |
| **Accuracy Commitment** | How we maintain data quality |

#### How Scores Work

| Section | Content |
|---------|---------|
| **What the Score Represents** | Overall trust/quality indicator |
| **Score Components** | Reviews, verification status, response rates, etc. |
| **How Scores Are Calculated** | Transparent methodology (without gaming details) |
| **Score Updates** | How often, what triggers changes |
| **Score Limitations** | What the score doesn't measure |

#### How Reviews Work

| Section | Content |
|---------|---------|
| **Who Can Review** | Verification requirements |
| **Review Collection** | How we solicit and collect reviews |
| **Review Moderation** | What's allowed, what's removed |
| **Provider Responses** | How providers can respond |
| **Fake Review Prevention** | Detection and removal processes |

#### How Requests Work

| Section | Content |
|---------|---------|
| **What Happens When You Submit** | Step-by-step process |
| **Provider Notification** | How providers receive requests |
| **Response Expectations** | Typical response times |
| **Privacy Protections** | What information is shared |
| **If You Don't Hear Back** | What to do, alternatives |

**Footer Placement**: "How Olera Works" link in Company section and Legal & Trust section.

**SEO Value**: Trust and transparency signals for users researching platform credibility.

**Cross-Reference**: See Chapter 28: Marketing & SEO Pages for navigation integration.

---

## Future Directions

> ⭐ **Strategic Concepts for Future Phases** — These sections outline long-term possibilities that are explicitly **not** part of the current demo or build scope. They are included to demonstrate forward thinking and establish placeholders for future strategic decisions.

---

### Future: Mobile App Development (iOS & Android)

> ⭐ **Future Direction** — Not in current scope

**Concept**: Native iOS and Android mobile applications that serve as companion apps to the Olera web platform, providing families and providers with on-the-go access to core functionality while maintaining a unified, consistent user experience across all platforms.

#### Strategic Vision

The Olera mobile apps will extend—not replace—the web platform, following the proven patterns established by Zillow, Airbnb, and Yelp. These companies demonstrate that successful mobile companions share a common backend, maintain consistent data models, and deliver parallel UX patterns across platforms while optimizing for each platform's native strengths.

**Core Principles**:
- **Single source of truth**: All platforms (web, iOS, Android) connect to the same backend APIs and database
- **Feature parity**: Core functionality available on all platforms, with platform-appropriate optimizations
- **Consistent UX language**: Same information architecture and user mental models across platforms
- **Native-first interactions**: Leverage platform-specific capabilities (notifications, camera, location) where they add value
- **Offline-aware design**: Graceful degradation when connectivity is limited

#### Architecture Alignment

The current web application architecture is designed to support future mobile clients without rework:

**Shared Backend & APIs**:
- Next.js API routes follow RESTful patterns that translate directly to mobile API consumption
- Authentication via NextAuth JWT tokens works seamlessly with mobile clients
- All business logic lives in server-side services, not in frontend components
- Database schema and Prisma models are platform-agnostic

**Consistent Data Models**:
- User, Provider, Family, and Engagement models are designed for multi-platform access
- Mode switching (Family/Provider) architecture works identically via API
- File upload patterns (Vercel Blob) support mobile upload workflows
- Notification data model accommodates push notification delivery

**Reusable Systems**:
| Web System | Mobile Reusability |
|------------|-------------------|
| Authentication (JWT) | Direct reuse—mobile clients authenticate via same endpoints |
| API routes | Direct consumption—RESTful patterns work for React Native/Swift/Kotlin |
| Prisma schema | No changes—same database serves all clients |
| Validation (Zod) | Server-side validation protects all clients equally |
| File uploads | Same Vercel Blob URLs work across platforms |
| Messaging system | Same API, mobile-optimized display |
| Notifications | Extend to push notifications via existing notification infrastructure |

#### Platform-Specific Considerations

**iOS Development**:
- Swift/SwiftUI for native iOS experience
- Leverage iOS-specific features: Face ID, Apple Maps integration, Siri shortcuts
- App Store compliance and review process
- Push notifications via Apple Push Notification Service (APNS)
- Support for iOS accessibility features (VoiceOver, Dynamic Type)

**Android Development**:
- Kotlin/Jetpack Compose for modern Android development
- Material Design 3 alignment with platform conventions
- Google Play Store distribution and policies
- Push notifications via Firebase Cloud Messaging (FCM)
- Android accessibility support (TalkBack, font scaling)

**Cross-Platform Considerations**:
- Evaluate React Native or Flutter for code sharing, balanced against native performance needs
- Shared business logic libraries where appropriate
- Platform-specific UI implementations for optimal user experience
- Unified testing strategy across platforms

#### Mobile-First Features

While the web platform is fully functional, mobile apps can optimize for mobile-specific use cases:

**For Families**:
- Quick provider search with GPS-based location
- Camera integration for care profile photos
- Push notifications for provider responses and messages
- Saved providers accessible offline
- Tour scheduling with calendar integration

**For Providers**:
- Instant notification of new inquiries
- Quick response templates optimized for mobile
- Photo uploads directly from device camera
- Dashboard metrics at a glance
- On-the-go profile updates

#### Current State & Path Forward

**Current State**:
- Web application serves as the primary platform
- iOS and Android prototypes exist but lack unified production architecture
- No shared component library or design system formalized for mobile
- Backend APIs are mobile-ready but not yet optimized for mobile consumption patterns

**Prerequisites Before Mobile Development**:
1. Web application feature-complete and stable
2. API documentation finalized for mobile consumption
3. Design system formalized with mobile-specific components
4. Authentication flow validated for mobile security requirements
5. Push notification infrastructure selected and integrated
6. Mobile analytics and crash reporting strategy defined

**Development Approach**:
1. **Phase 1**: API audit and optimization for mobile patterns (pagination, caching headers, response size optimization)
2. **Phase 2**: Design system extension with mobile component specifications
3. **Phase 3**: Core feature development (authentication, profile, search, messaging)
4. **Phase 4**: Platform-specific optimizations and native integrations
5. **Phase 5**: Beta testing, App Store/Play Store submission, launch

#### Architectural Guardrails

To ensure the web platform development does not block future mobile work:

**Do**:
- Keep business logic in API routes, not React components
- Use platform-agnostic data formats in API responses
- Design APIs with pagination and filtering for large datasets
- Implement proper cache headers for mobile bandwidth optimization
- Store file references as URLs, not platform-specific formats
- Use relative time formatting that works across timezones

**Avoid**:
- Coupling business logic to Next.js-specific features
- Server-side rendering dependencies in core data flows
- Browser-specific APIs in shared service code
- Hardcoded web-only assumptions in database schema
- Session-based auth patterns that don't translate to mobile

#### Why Deferred

- Core web platform must stabilize before multi-platform development
- Mobile development requires dedicated iOS/Android expertise
- App Store presence brings ongoing maintenance and review obligations
- Limited resources better focused on web feature completion
- Market validation of web platform informs mobile priorities

#### Strategic Value

Mobile apps represent a natural extension of Olera's mission to simplify senior care discovery. Mobile-first users—particularly busy adult children coordinating care—benefit from on-the-go access. The architecture established in the web platform ensures mobile development will be an evolution, not a rewrite.

**Cross-Reference**: See Chapter 31 (Application Architecture & Tech Stack) for current backend infrastructure and Chapter 34 (Communications Infrastructure) for notification systems that extend to mobile push.

---

### Future: AI Benefits Finder

> ⭐ **Future Direction** — Not in current scope

**Concept**: An AI-driven benefits discovery tool that helps families identify financial aid, public programs, and senior care resources through voice-first interactions rather than complex form navigation.

**Voice-First Interaction Model**:
- Conversational AI interface for care profile data collection
- Natural language processing to extract structured information from family conversations
- Progressive disclosure—gather information organically through dialogue
- Support for phone-based interaction for less tech-savvy users
- Fallback to text-based chat for users who prefer typing

**Care Profile Integration**:
- Voice-collected data populates and strengthens existing care profiles
- Bidirectional sync: profile data informs AI context, AI discoveries enrich profiles
- Unified data model ensures no duplicate or conflicting information
- Consent-based data sharing between Benefits Finder and core platform

**Benefits Data Strategy**:
- Comprehensive indexing of senior care benefits (federal, state, local)
- Financial aid programs (Medicaid, Medicare, VA benefits, etc.)
- Public assistance programs relevant to senior care
- Private foundation grants and charitable resources
- Eligibility criteria mapping for automated qualification checks
- Regular scraping and validation to maintain currency
- Legal compliance review for data sourcing and use
- Geographic targeting to surface location-relevant benefits

**Key Capabilities**:
- Eligibility screening based on care profile data
- Personalized benefit recommendations ranked by fit and value
- Application assistance and documentation guidance
- Deadline tracking and renewal reminders
- Benefits comparison and optimization suggestions

**Why Deferred**:
- Requires significant AI/ML infrastructure investment
- Benefits data aggregation is operationally complex
- Regulatory review needed for advice vs. information distinction
- Voice AI technology maturity considerations
- Core marketplace functionality takes priority

**Positioning**:
- Opt-in enhancement that builds on core platform
- Does not block current demo or launch scope
- Potential differentiator for family engagement and retention
- Aligns with mission to reduce family burden in care navigation

**Prerequisites Before Consideration**:
- Core care profile system fully operational
- User research validating demand for benefits discovery
- Legal review of benefits advice vs. information boundaries
- Partnership evaluation with benefits data providers
- Voice AI vendor assessment and selection
- Data licensing and compliance framework established

---

### Future: Caregiver Workforce & Direct Staffing Model

> ⭐ **Future Direction** — Not in current scope

**Concept**: Potential future pivot where Olera directly employs, manages, schedules, and dispatches caregivers rather than operating purely as a marketplace.

**Potential Scope**:
- Direct caregiver employment model
- Scheduling and dispatch systems
- Payroll and benefits administration
- Training and certification programs
- Quality assurance and supervision
- Background check management
- Performance tracking and reviews

**Why Deferred**:
- Fundamentally different business model than marketplace
- Significant operational complexity and overhead
- Employment law and liability considerations
- Capital intensive (payroll, benefits, insurance)
- Different unit economics than marketplace model

**Strategic Rationale for Inclusion**:
- Demonstrates awareness of vertical integration option
- Shows long-term strategic thinking beyond current scope
- Acknowledges market where competitors have taken this approach
- Preserves optionality for future strategic decisions

---

### Future: Transaction Hosting Platform

> ⭐ **Future Direction** — Not in current scope

**Concept**: Enable payments and financial transactions between families and providers after they connect through Olera.

**Potential Scope**:
- Payment processing integration (Stripe Connect, etc.)
- Escrow and transaction guarantees
- Invoicing and receipt generation
- Refund and dispute handling
- Tax documentation (1099s for providers)
- Care cost tracking and reporting

**Why Deferred**:
- Requires significant regulatory review (money transmission laws)
- Adds liability and compliance complexity
- Market validation needed to confirm demand
- Current focus is marketplace/discovery, not transactions

**Prerequisites Before Consideration**:
- Demonstrated user demand for in-platform payments
- Legal review of money transmission requirements by state
- Insurance and liability framework established
- Operational capacity to handle payment disputes

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
