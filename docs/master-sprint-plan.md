# Olera Platform — Master Sprint Plan

> **Version**: 1.2 — Sprint 0 Complete
> **Last Updated**: January 19, 2026
> **Purpose**: Execution-focused roadmap translating the Master Platform Manual into clear build tasks and sprint sequences.

## Planning Approach

**Strategy**: Foundation-First + Vertical Slicing (Demo-Optimized)

- **Sprint 0**: Stabilize foundations — fix 🟡 Partial systems, ensure core flows work
- **Sprints 1–N**: Complete vertical user journeys — each sprint delivers testable end-to-end capability
- **Final Sprints**: Admin tooling, observability, production hardening

**Constraints**:
- Every sprint produces something testable and coherent
- Every sprint must include "Definition of Done — Testable Outcomes" section
- Documentation updates are required alongside engineering, not afterward
- Prefer refactoring over layering hacks
- Demo-only shortcuts are acceptable if documented
- No time estimates — sequence only

---

## Implementation Status Audit

> Based on codebase analysis against Master Platform Manual (January 17, 2026)

### Legend
- ✅ **Built** — Core functionality works
- 🟡 **Partial** — Some features exist, gaps or fragility present
- ⬜ **Not Built** — Planned but not yet implemented

### Status by Chapter

| Part | Chapter | Status | Key Issues |
|------|---------|--------|------------|
| **I: Foundation** | 1. Auth | ✅ Built | Login, signup, password working |
| | 2. Mode System | 🟡 Partial | Uses URL param; needs DB-driven mode |
| | 3. Onboarding | 🟡 Partial | Provider onboarding exists; needs completion |
| | 4. UI/Design | ✅ Built | TailwindCSS, design tokens working |
| | 5. Navigation | 🟡 Partial | MainNav works; no dropdowns, footer, breadcrumbs |
| **II: Profiles** | 6. Family Profiles | 🟡 Partial | Schema complete; UI needs polish |
| | 7. Provider Profiles | 🟡 Partial | Comprehensive schema; UI incomplete |
| | 8. Provider Identity | 🟡 Partial | Model exists; gating flow incomplete |
| **III: Discovery** | 9. Directory & Search | ✅ Built | Basic search working |
| | 10. Provider Claiming | 🟡 Partial | Model exists; verification flow incomplete |
| | 11. Matching | ⬜ Not Built | No matching algorithm |
| **IV: Experience** | 12. Family Dashboard | 🟡 Partial | Exists; needs polish and completion |
| | 13. Provider Dashboard | 🟡 Partial | Exists; needs polish and completion |
| | 14. Settings | ✅ Built | Account settings working |
| **V: Engagement** | 15. Engagements | 🟡 Partial | ConsultRequest model; UI partial |
| | 16. Messaging | 🟡 Partial | Message model + components; needs completion |
| | 17. Scheduling | 🟡 Partial | TourAppointment model; UI incomplete |
| | 18. Saved/Favorites | ✅ Built | Working |
| | 19. Notifications | ⬜ Not Built | No delivery infrastructure |
| **VI: Hiring** | 20. Hiring Marketplace | 🟡 Partial | Routes exist; flow incomplete |
| **VII: Monetization** | 21. Subscriptions | ⬜ Not Built | Model exists; no Stripe integration |
| **VIII: Trust** | 22. Reviews | ⬜ Not Built | Model exists; no UI |
| | 23. Trust & Safety | ⬜ Not Built | No badges, reporting, moderation |
| **IX: Data** | 24. Data Management | 🟡 Partial | Basic CRUD exists |
| | 25. Data Acquisition | ⬜ Not Built | No demo data seeding |
| **X: Admin** | 26. Admin System | 🟡 Partial | Basic pages only |
| | 27. SOPs | ⬜ Not Built | Documented; not implemented |
| **XI: Marketing** | 28. Marketing & SEO | ⬜ Not Built | No SEO pages |
| | 29. Referrals | ⬜ Not Built | Not implemented |
| **XII: Support** | 30. Customer Support | ⬜ Not Built | Not implemented |
| **XIII: Tech** | 31. Architecture | ✅ Built | Next.js 15, Prisma, solid foundation |
| | 32. Deployment | 🟡 Partial | Vercel-ready; CI/CD needs setup |
| | 33. File Uploads | ✅ Built | Working with Vercel Blob |
| | 34. Communications | ⬜ Not Built | No Resend/Twilio integration |
| | 35. Error Handling | ✅ Built | Good patterns in place |
| | 36. Performance | ✅ Built | Caching patterns defined |
| | 37. Analytics | ⬜ Not Built | No audit logging |
| | 38. Third-Party | 🟡 Partial | Some integrations working |
| **XIV: Legal** | 39. Legal Framework | 🟡 Partial | Pages exist; content needs completion |

---

## Dependency Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FOUNDATION LAYER                             │
│  Auth (Ch1) ─────► Mode System (Ch2) ─────► Navigation (Ch5)        │
│       │                    │                       │                 │
│       ▼                    ▼                       ▼                 │
│  User Model          activeMode field        MainNav + Dropdowns     │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         PROFILE LAYER                                │
│  Family Profile (Ch6) ◄────────────► Provider Profile (Ch7)         │
│         │                                      │                     │
│         │              Provider Identity (Ch8) │                     │
│         │                      │               │                     │
│         ▼                      ▼               ▼                     │
│    Care needs            Gating/Claiming    Services/Details         │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DISCOVERY LAYER                               │
│  Directory (Ch9) ─────► Claiming (Ch10) ─────► Matching (Ch11)      │
│       │                      │                      │                │
│       ▼                      ▼                      ▼                │
│   Search/Filter         Verification           Profile Complete %    │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       ENGAGEMENT LAYER                               │
│  Engagements (Ch15) ──► Messaging (Ch16) ──► Scheduling (Ch17)      │
│         │                    │                     │                 │
│         ▼                    ▼                     ▼                 │
│  ConsultRequest          Messages            TourAppointment         │
│                              │                                       │
│                              ▼                                       │
│                    Notifications (Ch19) ◄── Communications (Ch34)   │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      TRUST & QUALITY LAYER                           │
│  Reviews (Ch22) ────────────► Trust & Safety (Ch23)                 │
│       │                              │                               │
│       ▼                              ▼                               │
│   Review Model              Badges + Moderation                      │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      OPERATIONS LAYER                                │
│  Admin (Ch26) ◄──── SOPs (Ch27) ◄──── Analytics (Ch37)             │
│       │                                                              │
│       ▼                                                              │
│  Moderation Queue + Dashboard                                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Sprint 0: Foundation Stabilization

### Goal
Ensure core platform architecture is solid before building features. Fix 🟡 Partial systems that would cause cascading issues. Establish testing and validation patterns for all subsequent sprints.

### Chapters Covered
- Ch 1: Authentication (mode initialization at signup/login)
- Ch 2: Mode System
- Ch 4: UI/Design (visual foundation)
- Ch 5: Navigation & Routing
- Ch 8: Provider Identity & Gating
- Ch 31: Architecture (verification)
- Ch 35: Error Handling (standardization)

### Tasks

#### 0.1 Mode System Refactor (Ch 2)

**Mode Persistence (Remove URL param)**:
- [ ] Remove URL-based `?mode=` parameter from all routes
- [ ] Read `activeMode` from database via API/session
- [ ] Update `MainNav.tsx` to use DB mode instead of URL param
- [ ] Update account dropdown to reflect current mode from DB
- [ ] Add mode switch API endpoint (`PATCH /api/user/mode`)
- [ ] Test mode persistence across page navigation

**Mode Initialization (Signup & Login)**:
- [ ] Add `intent` query param support to signup flow
  - Accept `?intent=provider` on `/signup` and `/api/auth/signup`
  - Set `User.activeMode` based on intent param (default: FAMILY)
- [ ] Remove profile-completion-based mode calculation from login flow
- [ ] Ensure login restores `User.activeMode` directly from DB
- [ ] Test: signup with `?intent=provider` → user starts in PROVIDER mode
- [ ] Test: returning user login → restores last active mode from DB

#### 0.2 Navigation Foundation (Ch 5)
- [ ] Audit `MainNav.tsx` for mode parameter removal
- [ ] Implement minimal breadcrumb component
  - Auto-generated from route path
  - Display on dashboard and detail pages
  - Home > Section > Page pattern
- [ ] Build minimal footer
  - Single-row layout with essential links
  - Placeholder links acceptable (`#`)
  - Copyright and basic legal links
- [ ] Ensure route protection middleware is correctly gating authenticated routes

#### 0.3 Provider Identity Flow (Ch 8)
- [ ] Verify `ProviderIdentity` model is correctly linked to `User`
- [ ] Complete provider onboarding flow (`/provider/onboarding`)
- [ ] Ensure gating: users without `ProviderIdentity` cannot access provider features
- [ ] Test: new user → create provider identity → access provider dashboard

#### 0.4 Data Model Verification
- [ ] Run Prisma migrations to ensure schema is in sync
- [ ] Verify all indexes are created (check `@@index` declarations)
- [ ] Test basic CRUD for: User, FamilyProfile, Provider, ConsultRequest
- [ ] Ensure seed script runs without errors

#### 0.5 Test Framework Setup
- [ ] Install and configure Jest (or Vitest) for unit tests
- [ ] Configure React Testing Library for component tests
- [ ] Set up test database configuration (Prisma test environment)
- [ ] Create test utilities and helpers (`lib/test-utils.ts`)
- [ ] Write sample tests for mode system API endpoint
- [ ] Add `npm test` script to package.json
- [ ] Verify CI can run tests (local verification)

#### 0.6 Input Validation Layer
- [ ] Install and configure Zod for schema validation
- [ ] Create shared validation schemas in `lib/validations/`
  - `auth.ts` — login, signup, password reset
  - `user.ts` — profile updates, mode switch
  - `provider.ts` — provider identity creation
- [ ] Integrate validation middleware for API routes
- [ ] Add client-side validation to forms (using same schemas)
- [ ] Test: invalid input returns structured error response

#### 0.7 Error Response Standardization
- [ ] Define standard API error response format
  ```typescript
  { success: false, error: { code: string, message: string, details?: object } }
  ```
- [ ] Create error utility in `lib/api-error.ts`
- [ ] Update existing API routes to use standard format
- [ ] Create client-side error handling utility
- [ ] Test: API errors display user-friendly messages in UI

#### 0.8 Design System Foundation (Ch 4)

**Purpose**: Establish the visual foundation so the site "feels right" from Sprint 0. This is about alignment, not polish—later sprints refine without revisiting core aesthetic decisions.

**Color Palette & Tokens**:
- [ ] Update Tailwind config with authoritative color palette (from provided references)
- [ ] Define semantic color tokens (primary, secondary, accent, success, warning, error)
- [ ] Ensure consistent color usage across existing components

**Typography**:
- [ ] Establish type scale (headings, body, captions, labels)
- [ ] Configure font family in Tailwind (match provided references)
- [ ] Apply consistent typography to existing pages

**Spacing & Layout**:
- [ ] Define spacing scale (use existing Tailwind or extend as needed)
- [ ] Establish consistent padding/margin patterns for cards, sections, containers

**Logo & Branding**:
- [ ] Integrate correct logo assets (small bird mark per provided reference)
- [ ] Ensure logo is correctly sized and positioned in header
- [ ] Verify favicon is updated

**Component Patterns**:
- [ ] Align button styles with design references (primary, secondary, ghost)
- [ ] Align card styles (border radius, shadows, padding)
- [ ] Align form input styles (borders, focus states, validation states)

**Documentation**:
- [ ] Create `docs/ui-style-guide.md` documenting:
  - Color palette with hex values
  - Typography scale
  - Spacing conventions
  - Component patterns with examples
- [ ] Reference provided screenshots as authoritative source

### Dependencies
None (this is Sprint 0)

### Acceptance Criteria
- [ ] Mode persists across navigation without URL parameter
- [ ] Breadcrumbs display on dashboard and detail routes
- [ ] Footer renders on all pages
- [ ] New user can complete provider onboarding end-to-end
- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes without errors
- [ ] `npm test` passes all tests
- [ ] API endpoints return standardized error responses
- [ ] Visual foundation established: colors, typography, logo match design references
- [ ] UI style guide documented in `docs/ui-style-guide.md`

### Definition of Done — Testable Outcomes

| Test | How to Verify | Expected Result |
|------|---------------|-----------------|
| Mode persistence | Log in → switch mode → navigate 3 pages → refresh | Mode remains consistent; no URL param |
| Mode init (provider intent) | Sign up via `/signup?intent=provider` | User starts in PROVIDER mode |
| Mode init (default) | Sign up via `/signup` (no intent) | User starts in FAMILY mode |
| Mode restore on login | Log out → log back in | Mode matches what user had before logout |
| Breadcrumb display | Visit `/dashboard`, `/dashboard/care-profile`, `/providers/[id]` | Breadcrumbs show correct hierarchy |
| Footer render | Visit any 5 pages | Footer appears on all pages |
| Provider onboarding | Create new account → select Provider mode → complete onboarding | Provider dashboard accessible |
| Provider gating | Access `/provider/dashboard` without ProviderIdentity | Redirect to onboarding |
| Build success | Run `npm run build` | Completes with no errors |
| Test suite | Run `npm test` | All tests pass |
| Validation | Submit invalid data to `/api/user/mode` | Structured error response returned |
| Error format | Trigger API error | Response matches standard format |
| Visual consistency | Compare homepage, dashboard, provider detail against reference screenshots | Colors, typography, spacing match design references |
| Logo display | Check header on 3+ pages | Logo (bird mark) renders correctly, consistent size/position |
| Button styles | Inspect primary/secondary buttons across site | Styles match design references |
| Style guide | Check `docs/ui-style-guide.md` exists | Documents color palette, typography, spacing, components |

### Documentation Deliverables
- [ ] Update Master Platform Manual Ch 2 implementation status
- [ ] Update Master Platform Manual Ch 4 implementation status
- [ ] Update Master Platform Manual Ch 5 implementation status
- [ ] Update Master Platform Manual Ch 8 implementation status
- [ ] Document error response format in `docs/api-conventions.md`
- [ ] Document test setup in `docs/testing.md`
- [ ] Create UI style guide in `docs/ui-style-guide.md`

### Tech Debt Notes
- **Demo acceptable**: Footer links can be placeholder (`#`)
- **Demo acceptable**: Breadcrumbs minimal (no dropdown menus)
- **Deferred**: Full CTA intent propagation (adding `?intent=provider` to all provider-targeted CTAs) → Sprint 1/2
- **Deferred**: "Get Started" wizard with explicit mode question → Sprint 1+
- **Deferred**: UI micro-interactions, animations, advanced responsive polish → Sprint 9
- **Must be solid**: Mode system must work correctly — this affects all features
- **Must be solid**: Mode initialization and persistence — foundational for all user flows
- **Must be solid**: Provider gating — security-critical
- **Must be solid**: Error response format — affects all API consumers
- **Must be solid**: Visual foundation (colors, typography, logo, core components) — site should "feel right" from Sprint 0

---

## Sprint 0: Audit Results & Completion Status

> **Audit Date**: January 19, 2026
> **Status**: ✅ Complete (with documented deferrals)

### Walkthrough Results

| Walkthrough | Description | Result |
|-------------|-------------|--------|
| W1: Landing & Discovery | Homepage → Search → Provider Detail | ✅ PASS |
| W2: Family Signup & Profile | Signup → Dashboard → Care Profile | ✅ PASS |
| W3: Mode System | Toggle mode → Persist across navigation → Refresh | ✅ PASS |
| W4: Provider Onboarding | Mode switch → Onboarding → Dashboard | ✅ PASS |
| W5: Provider Dashboard | Dashboard → Requests → Seed data flows | ✅ PASS |

### Completed Items

| Task | Status | Notes |
|------|--------|-------|
| Breadcrumb Component | ✅ Complete | Auto-generated from route path, displays on 19+ pages |
| Provider Onboarding Flow | ✅ Complete | `/provider/onboarding` functional |
| Provider Gating | ✅ Complete | Redirects to onboarding when no ProviderIdentity |
| Mode Persistence | ✅ Complete | `User.activeMode` stored in DB, restored on login |
| Route Protection | ✅ Complete | Middleware correctly gates authenticated routes |
| Seed Data API | ✅ Complete | `/api/admin/seed` creates test accounts with relationships |
| Auth Race Condition Fix | ✅ Complete | Fixed hard-refresh redirect bugs on provider pages |
| Build Success | ✅ Complete | `npm run build` completes without errors |
| Signup Intent Parameter | ✅ Complete | `/signup?intent=provider` correctly sets PROVIDER mode |
| Dev Server | ✅ Complete | `npm run dev` starts without errors |

### Fixes Applied During Audit

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Breadcrumbs not visible on dashboard/requests/settings | CUID regex too broad (`^[a-z0-9]{8,}$`) matching known segments | Check `SEGMENT_LABELS` before ID detection |
| Hard refresh redirects to login | Using `!session` instead of `status === "unauthenticated"` | Fixed auth checks in all provider pages |
| 404 on breadcrumb `/provider` click | No page existed at `/provider` route | Created redirect page based on identity status |
| Provider ID showing in breadcrumbs | No `currentPage` prop on detail pages | Added entity names to detail page breadcrumbs |
| Signup intent parameter ignored | Signup page didn't read URL params or pass intent to API | Added `useSearchParams()`, pass intent, redirect by mode |

### Deferred to Sprint 1

| Item | Rationale | Sprint |
|------|-----------|--------|
| Remove URL `?mode=` parameter | Working but not causing issues; lower priority | Sprint 1 |
| Footer implementation | Demo acceptable without full footer | Sprint 1 |
| Test framework setup (Jest/Vitest) | Time constraint; manual testing sufficient for Sprint 0 | Sprint 1 |
| Input validation layer (Zod) | Existing validation working; enhancement deferred | Sprint 1 |
| Error response standardization | Existing patterns working; formalization deferred | Sprint 1 |
| Remove ProviderIdentity model | Per Manual Ch 8; requires schema migration | Sprint 1 |
| Route renaming `/provider/requests` → `/provider/find-families` | Per Manual Ch 13; cosmetic change | Sprint 1 |
| Provider login default landing page | Currently goes to `/provider/dashboard`; Manual specifies `/provider/find-families` | Sprint 1 |
| Remove forced onboarding redirect | Per Manual Ch 8.4; use gentle nudges instead | Sprint 1 |

### Gap Verification (Post-Audit)

| Gap | Finding | Resolution |
|-----|---------|------------|
| Mode Initialization (signup flow) | **BUG FOUND** — Signup page didn't read `?intent=provider` | **FIXED** — Now reads intent, passes to API, redirects by mode |
| Design System Foundation | **COMPLETE** — UI style guide exists (10KB), Tailwind configured | No action needed (incorrectly listed as deferred) |
| Data Model | **VALID** — Schema generates successfully, 21+ indexes defined | No action needed |
| `npm run dev` | **PASS** — Starts without errors in 4.3s | No action needed |

### Key Architectural Decisions Confirmed

1. **Mode Source of Truth**: `User.activeMode` in database (URL param to be removed in Sprint 1)
2. **Provider Gating**: Uses `ProviderIdentity` model (to be simplified per Manual Ch 8 in Sprint 1)
3. **Breadcrumb Strategy**: Auto-generated from URL path with `SEGMENT_LABELS` mapping
4. **Auth Pattern**: Use `status === "unauthenticated"` not `!session` for redirect logic

### Human Audit Checklist Results

> **Audit Date**: January 19, 2026
> **Auditor**: Human (manual testing)

| Audit | Description | Result | Notes |
|-------|-------------|--------|-------|
| **1. Provider Intent Signup** | `/signup?intent=provider` and for-providers CTA flows | ✅ PASS | Fixed during audit — intent now passed correctly |
| **2. Breadcrumbs** | Family and provider breadcrumb visibility and navigation | ✅ PASS | Auto-generated on 19+ pages |
| **3. Auth Persistence** | Hard refresh on all protected pages | ✅ PASS | No session loss or false redirects |
| **4. Mode Persistence** | Toggle, navigate, refresh, re-login | ✅ PASS | Mode correctly restored from DB |
| **5. Provider Onboarding Gating** | New user → provider mode → onboarding | ✅ PASS | Works but uses forced redirect (deferred: gentle nudges) |
| **6. Build & Dev Server** | `npm run build` and `npm run dev` | ✅ PASS | Both complete without errors |
| **7. Design System** | UI consistency spot check | ⏸️ DEFERRED | Deferred to Sprint 2 (Polish & UX) |
| **8. Seed Data** | Admin seed page and test accounts | ✅ PASS | All 4 accounts created correctly |
| **9. Documentation** | Manual and sprint plan accuracy | ✅ PASS | Updated with all findings |

### UX Items Noted (Non-Blocking)

| Item | Description | Deferred To |
|------|-------------|-------------|
| Modal vs dedicated page for signup | Consider full-page signup for provider intent | Sprint 2 |
| Visible close button on AuthModal | Add X button for easier dismissal | Sprint 2 |
| Navigation UX gap | Manual specifies "gentle nudges" not forced redirects | Sprint 1 |

### Commits (Sprint 0)

- `9d3b3c9` Fix AuthModal view state not resetting when reopened
- `4c780d6` Fix provider intent flow in AuthModal and for-providers page
- `7ad66ff` Fix signup intent parameter handling + complete Sprint 0 gap verification
- `81ae8fd` Fix breadcrumb regression: known segments were incorrectly skipped
- `c456a54` Fix auth race condition on all provider pages + improve breadcrumb visibility
- `7e2b14c` Address Sprint 0 audit findings from Walkthrough 4
- `f8fd0e5` Add Breadcrumb component platform-wide for consistent navigation
- `97167f9` Add Breadcrumb component to dashboard page for Sprint 0 navigation audit

### Sprint 1 Implications

Based on Sprint 0 findings, Sprint 1 should prioritize:

1. **Remove URL `?mode=` parameter** — DB is the sole source of truth; URL param causes sync bugs
2. **Remove forced onboarding redirect** — Per Manual Ch 8, use gentle nudges instead of blocking
3. **Route renaming** — Align routes with Manual specifications (e.g., `/provider/requests` → `/provider/find-families`)
4. **Footer implementation** — Complete navigation structure

---

## Sprint 1: Family Discovery Journey

### Goal
A family user can browse the provider directory, view provider details, save favorites, and initiate contact.

### Chapters Covered
- Ch 6: Family Care Profiles
- Ch 9: Provider Directory & Search
- Ch 18: Saved / Favorites
- Ch 15: Engagements (initiation only)

### Tasks

#### 1.1 Family Profile Completion (Ch 6)
- [ ] Review `/dashboard/care-profile` form against Ch 6 spec
- [ ] Ensure all required visibility threshold fields are present
- [ ] Add profile completion percentage indicator
- [ ] Test: profile below threshold → not visible to providers

#### 1.2 Directory Polish (Ch 9)
- [ ] Verify provider card displays: name, type, location, rating, photo
- [ ] Implement care type filter (dropdown)
- [ ] Implement location filter (city/state or zip)
- [ ] Add "No results" empty state with helpful message
- [ ] Ensure pagination or infinite scroll works

#### 1.3 Provider Detail Page (Ch 7 + 9)
- [ ] Verify `/providers/[id]` displays full provider profile
- [ ] Show all sections: About, Services, Amenities, Photos, Reviews (if any)
- [ ] Add "Save" button (heart icon)
- [ ] Add "Contact" CTA button

#### 1.4 Saved Providers (Ch 18)
- [ ] Verify `/dashboard/saved` displays saved providers list
- [ ] Add "Remove" action from saved list
- [ ] Show empty state if no saved providers

#### 1.5 Contact Initiation (Ch 15)
- [ ] Build contact modal/form triggered from provider detail page
- [ ] Fields: message, contact reason, preferred contact method
- [ ] Create `ConsultRequest` on submission
- [ ] Show confirmation message after submission
- [ ] Redirect to engagement detail page

### Dependencies
- Sprint 0 complete (mode system, navigation foundation)

### Acceptance Criteria
- [ ] Family can browse directory with filters
- [ ] Family can view full provider profile
- [ ] Family can save/unsave providers
- [ ] Family can send contact request to provider
- [ ] Contact request appears in family's engagement list

### Tech Debt Notes
- **Demo acceptable**: Basic filters only (care type, location). Advanced filters (price, rating) can be post-demo.
- **Demo acceptable**: Simple contact form. Rich booking flow (tour scheduling) comes in Sprint 3.
- **Must be solid**: SavedProvider relationship must work correctly

---

## Sprint 2: Provider Response Journey

### Goal
A provider can view incoming requests, respond to families, and manage their profile.

### Chapters Covered
- Ch 7: Provider Profiles
- Ch 10: Provider Claiming
- Ch 13: Provider Dashboard
- Ch 15: Engagements (response flow)
- Ch 16: Messaging (basic)

### Tasks

#### 2.1 Provider Dashboard (Ch 13)
- [ ] Verify `/provider/dashboard` shows summary widgets
- [ ] Display: pending requests count, recent messages, profile completion
- [ ] Add quick links to: requests, profile editing, saved families

#### 2.2 Provider Profile Editing (Ch 7)
- [ ] Build comprehensive profile editor at `/dashboard/provider-profile`
- [ ] Sections: Basic Info, Services, Amenities, Photos, Pricing
- [ ] Photo upload using existing upload infrastructure
- [ ] Cover photo selection
- [ ] Profile completion percentage indicator

#### 2.3 Incoming Requests (Ch 15)
- [ ] Verify `/provider/requests` lists all ConsultRequests for this provider
- [ ] Show request card: family name (or anonymized), message preview, date
- [ ] Filter by status: Pending, Accepted, Completed
- [ ] Request detail page: `/provider/requests/[id]`

#### 2.4 Request Response (Ch 15 + 16)
- [ ] Accept/Decline actions on request detail page
- [ ] On Accept: reveal family contact info (if subscription allows)
- [ ] Basic reply form that creates a Message
- [ ] Show message thread on request detail page

#### 2.5 Provider Claiming (Ch 10) — Basic
- [ ] If provider is unclaimed, show "Claim this listing" on detail page
- [ ] Claim request flow: verify ownership (demo: simple confirmation)
- [ ] Link `ProviderIdentity.providerId` to `Provider.id` on claim
- [ ] Update provider detail page to show "Claimed" state

### Dependencies
- Sprint 1 complete (family can initiate contact)

### Acceptance Criteria
- [ ] Provider sees incoming requests on dashboard
- [ ] Provider can accept/decline requests
- [ ] Provider can send reply message
- [ ] Provider can edit their profile
- [ ] Unclaimed provider can be claimed by user

### Tech Debt Notes
- **Demo acceptable**: Claiming verification is simple confirmation (no document upload)
- **Demo acceptable**: Basic messaging (no real-time, no read receipts yet)
- **Must be solid**: Request status transitions must be correct
- **Must be solid**: Provider-User linking via ProviderIdentity

---

## Sprint 3: Engagement & Scheduling

### Goal
Families and providers can have back-and-forth conversations and schedule tours/appointments.

### Chapters Covered
- Ch 16: Messaging System (full)
- Ch 17: Multi-Context Scheduling
- Ch 12: Family Dashboard (engagement view)

### Tasks

#### 3.1 Full Messaging (Ch 16)
- [ ] Message thread UI in engagement detail page
- [ ] Real-time message polling (or WebSocket if feasible)
- [ ] Message timestamps and sender identification
- [ ] "New message" indicator on engagement list
- [ ] Mark messages as read when viewed

#### 3.2 Tour Scheduling (Ch 17)
- [ ] "Schedule Tour" button in engagement thread
- [ ] Tour proposal form: date, time, notes
- [ ] Create `TourAppointment` record
- [ ] Show proposed tour in thread
- [ ] Accept/Decline/Reschedule actions for recipient
- [ ] Calendar view of upcoming tours (simple list view acceptable for demo)

#### 3.3 Family Dashboard Engagement View (Ch 12)
- [ ] `/dashboard/requests` shows all family's engagements
- [ ] Engagement card: provider name, status, last message preview
- [ ] Engagement detail page with full message thread
- [ ] "Schedule Tour" CTA in engagement

#### 3.4 Engagement Status Flow
- [ ] Implement full status machine: PENDING → ACCEPTED → COMPLETED
- [ ] Add CANCELLED status with cancellation reason
- [ ] Show status badge on engagement cards
- [ ] Status change creates system message in thread

### Dependencies
- Sprint 2 complete (provider can respond)

### Acceptance Criteria
- [ ] Family and provider can exchange multiple messages
- [ ] Either party can propose a tour
- [ ] Tour can be accepted, declined, or rescheduled
- [ ] Engagement status reflects current state
- [ ] Both dashboards show engagement activity

### Tech Debt Notes
- **Demo acceptable**: Polling-based messaging (WebSocket is production enhancement)
- **Demo acceptable**: Simple tour scheduling (no calendar integration)
- **Must be solid**: Message ordering and read status
- **Must be solid**: TourAppointment status transitions

---

## Sprint 4: Reviews & Trust Signals

### Goal
Families can leave reviews; providers display trust badges; basic safety signals are visible.

### Chapters Covered
- Ch 22: Reviews & Ratings
- Ch 23: Trust & Safety

### Tasks

#### 4.1 Review System (Ch 22)
- [ ] "Write a Review" button on provider detail page (for families with engagement)
- [ ] Review form: rating (1-5 stars), title, content, relationship
- [ ] Review submission creates `Review` record
- [ ] Reviews display on provider detail page
- [ ] Average rating calculation and display
- [ ] Review count on provider cards in directory

#### 4.2 Trust Badges (Ch 23)
- [ ] Define badge types: Verified, Claimed, Licensed
- [ ] Display badges on provider cards
- [ ] Display badges on provider detail page
- [ ] "Verified" badge logic: `Provider.verified === true`
- [ ] "Claimed" badge logic: `Provider.claimed === true`
- [ ] Tooltip explaining what each badge means

#### 4.3 Basic Safety (Ch 23)
- [ ] "Report" button on provider detail page
- [ ] Report modal: reason selection, details field
- [ ] Create report record (new `Report` model if needed)
- [ ] Confirmation message: "Thank you for reporting"
- [ ] Admin visibility of reports (basic — detailed in Sprint 7)

#### 4.4 Review Moderation (Basic)
- [ ] Reviews default to `approved: true`
- [ ] Admin can view all reviews
- [ ] Admin can toggle review approval status

### Dependencies
- Sprint 3 complete (engagements working)

### Acceptance Criteria
- [ ] Family can write review for engaged provider
- [ ] Reviews display on provider profile
- [ ] Average rating shows on cards and profile
- [ ] Trust badges display correctly based on provider state
- [ ] Users can report providers
- [ ] Admin can see and moderate reviews

### Tech Debt Notes
- **Demo acceptable**: Simple report form (no investigation workflow)
- **Demo acceptable**: Reviews auto-approved (moderation queue in admin sprint)
- **Must be solid**: Rating calculation must be accurate
- **Must be solid**: Badge logic must reflect actual provider state

---

## Sprint 5: Notifications & Communications

### Goal
Users receive email and SMS notifications for key platform events.

### Chapters Covered
- Ch 19: Notifications
- Ch 34: Communications Infrastructure
- Ch 14: Settings (notification preferences)

### Tasks

#### 5.1 Email Infrastructure (Ch 34)
- [ ] Set up Resend account and API key
- [ ] Create email service utility (`lib/email.ts`)
- [ ] Build base email template with React Email
- [ ] Test: send test email successfully

#### 5.2 SMS Infrastructure (Ch 34)
- [ ] Set up Twilio account with phone number
- [ ] Create SMS service utility (`lib/sms.ts`)
- [ ] Test: send test SMS successfully

#### 5.3 Transactional Emails (Ch 34)
- [ ] Welcome email on signup
- [ ] New engagement request notification
- [ ] Engagement accepted notification
- [ ] New message notification (with link to thread)
- [ ] Tour scheduled/confirmed notification

#### 5.4 SMS Notifications (Ch 34)
- [ ] New engagement request SMS
- [ ] Tour reminder (1 hour before)
- [ ] New message SMS (if enabled in preferences)

#### 5.5 Notification Preferences (Ch 14)
- [ ] Add notification preferences to Settings page
- [ ] Toggles: email messages, email requests, email reminders
- [ ] Store preferences on User model (or related table)
- [ ] Respect preferences when sending notifications

### Dependencies
- Sprint 3 complete (messaging and scheduling working)

### Acceptance Criteria
- [ ] New users receive welcome email
- [ ] Engagement events trigger email notifications
- [ ] SMS notifications send for key events
- [ ] Users can disable specific notification types
- [ ] Delivery failures are logged (not necessarily displayed)

### Tech Debt Notes
- **Demo acceptable**: Basic delivery tracking (send/fail only)
- **Demo acceptable**: No unsubscribe link handling (use preferences page)
- **Must be solid**: Welcome email must send reliably
- **Must be solid**: Preferences must be respected

---

## Sprint 6: Caregiver Hiring Marketplace

### Goal
Organizations can browse and contact individual caregivers for hiring.

### Chapters Covered
- Ch 20: Caregiver Hiring Marketplace

### Tasks

#### 6.1 Caregiver Directory
- [ ] Filter providers by `providerType: INDEPENDENT_CAREGIVER`
- [ ] `/caregiver/browse-organizations` for caregivers to find orgs
- [ ] `/provider/hire-staff` for orgs to find caregivers
- [ ] Caregiver-specific filters: availability, certifications, experience

#### 6.2 Caregiver Profile Display
- [ ] Caregiver card shows: name, certifications, availability status
- [ ] Caregiver detail page with: bio, experience, certifications, availability

#### 6.3 Hiring Request Flow
- [ ] "Contact for Hiring" button on caregiver profile
- [ ] Hiring request form (similar to family contact)
- [ ] `requestType: HIRING` on ConsultRequest
- [ ] Caregiver receives hiring request in their dashboard

#### 6.4 Organization Hiring Dashboard
- [ ] `/provider/hiring-requests` shows outgoing hiring requests
- [ ] Filter by status
- [ ] Manage hiring conversations (uses existing messaging)

### Dependencies
- Sprint 2 complete (provider response flow)
- Sprint 3 complete (messaging)

### Acceptance Criteria
- [ ] Organizations can browse caregivers
- [ ] Organizations can send hiring requests
- [ ] Caregivers see hiring requests separately from family requests
- [ ] Hiring conversations work like family engagements

### Tech Debt Notes
- **Demo acceptable**: Basic caregiver filters (detailed search is production)
- **Demo acceptable**: Same messaging UI for hiring (no separate workflow)
- **Must be solid**: `requestType` must correctly differentiate CONSULTATION vs HIRING

---

## Sprint 7: Admin System & Moderation

### Goal
Platform administrators can manage users, providers, reviews, and reports.

### Chapters Covered
- Ch 26: Admin System
- Ch 27: Human Workflows & SOPs
- Ch 37: Analytics & Audit Logging (basic)

### Tasks

#### 7.1 Admin Dashboard (Ch 26)
- [ ] `/admin` dashboard with summary stats
- [ ] Widgets: users count, providers count, pending claims, reports
- [ ] Quick links to admin sections

#### 7.2 User Management
- [ ] `/admin/users` — list all users
- [ ] Search by name/email
- [ ] View user detail: profile info, subscription, activity
- [ ] Actions: suspend user, reset password

#### 7.3 Provider Management
- [ ] `/admin/providers` — list all providers
- [ ] Filter by: type, status (claimed/unclaimed), verified
- [ ] Provider detail view with all fields
- [ ] Actions: verify provider, feature provider, deactivate

#### 7.4 Moderation Queue
- [ ] `/admin/moderation` — unified queue
- [ ] Tabs: Reviews, Reports, Claims
- [ ] Review moderation: approve/reject with reason
- [ ] Report handling: view report, take action (warn, suspend, dismiss)
- [ ] Claim verification: approve/reject claim requests

#### 7.5 Basic Audit Logging (Ch 37)
- [ ] Log admin actions: user suspension, provider verification, review moderation
- [ ] Simple audit log table in database
- [ ] `/admin/audit-log` — view recent admin actions

### Dependencies
- Sprint 4 complete (reviews and reports exist)

### Acceptance Criteria
- [ ] Admin can view and search users
- [ ] Admin can view and manage providers
- [ ] Admin can moderate reviews
- [ ] Admin can handle reports
- [ ] Admin actions are logged

### Tech Debt Notes
- **Demo acceptable**: Basic audit log (text-based, no structured queries)
- **Demo acceptable**: Simple moderation actions (no escalation workflow)
- **Must be solid**: Admin routes must be properly protected
- **Must be solid**: Audit logging must capture who/what/when

---

## Sprint 8: Subscriptions & Paywalls

### Goal
Implement tiered access with subscription management.

### Chapters Covered
- Ch 21: Subscriptions & Paywalls

### Tasks

#### 8.1 Subscription Model
- [ ] Verify `Subscription` model with tiers: FREE, BASIC, PRO
- [ ] Define tier limits (e.g., contact views per month)
- [ ] Create subscription service utility

#### 8.2 Paywall Implementation
- [ ] Paywall check before viewing family contact info
- [ ] Track `ContactView` records
- [ ] Show paywall modal when limit reached
- [ ] Display remaining views count

#### 8.3 Subscription UI
- [ ] `/subscription` page showing current plan
- [ ] Plan comparison table
- [ ] "Upgrade" button (links to Stripe or placeholder)

#### 8.4 Stripe Integration (Demo)
- [ ] Set up Stripe test account
- [ ] Create Stripe products for tiers
- [ ] Checkout flow for upgrade
- [ ] Webhook handler for subscription events
- [ ] Update local subscription status on payment

### Dependencies
- Sprint 2 complete (providers viewing family info)

### Acceptance Criteria
- [ ] Free users hit contact view limit
- [ ] Paywall modal displays with upgrade option
- [ ] Users can initiate subscription upgrade
- [ ] Subscription status updates after payment
- [ ] Subscription page shows current plan

### Tech Debt Notes
- **Demo acceptable**: Stripe test mode only
- **Demo acceptable**: Simple webhook handling (no retry logic)
- **Must be solid**: Contact view tracking must be accurate
- **Must be solid**: Subscription status must reflect reality

---

## Sprint 9: Demo Data & Polish

### Goal
Seed realistic demo data and polish the user experience for demonstration.

### Chapters Covered
- Ch 25: Data Acquisition & Enrichment
- Ch 4: UI & Design Language (polish)
- All chapters (polish pass)

### Tasks

#### 9.1 Demo Data Seeding (Ch 25)
- [ ] Create comprehensive seed script with realistic providers
- [ ] 20+ providers across different types and locations
- [ ] Include provider photos (stock or placeholder)
- [ ] Create demo family profiles
- [ ] Create sample engagements at various stages
- [ ] Create sample reviews

#### 9.2 UI Polish
- [ ] Consistent loading states across all pages
- [ ] Empty states with helpful CTAs
- [ ] Form validation messages
- [ ] Success/error toast notifications
- [ ] Mobile responsive check on all pages

#### 9.3 Navigation Polish (Ch 5)
- [ ] Care type dropdown menus (if not done)
- [ ] Footer with all sections
- [ ] Breadcrumbs on detail pages

#### 9.4 Demo Scenario Testing
- [ ] Test complete family journey end-to-end
- [ ] Test complete provider journey end-to-end
- [ ] Test caregiver hiring journey
- [ ] Fix any broken flows

### Dependencies
- All previous sprints complete

### Acceptance Criteria
- [ ] Database seeds with realistic demo data
- [ ] All pages have consistent loading/empty states
- [ ] Navigation is complete and functional
- [ ] Core user journeys work end-to-end
- [ ] No console errors in demo flows

### Tech Debt Notes
- **Demo acceptable**: Placeholder images acceptable
- **Demo acceptable**: Some edge cases may have rough UX
- **Must be solid**: Core demo scenarios must work flawlessly

---

## Sprint 10: Production Hardening

### Goal
Prepare platform for production deployment with monitoring, error handling, and security hardening.

### Chapters Covered
- Ch 32: Hosting, Deployment & CI/CD
- Ch 35: Error Handling & Monitoring
- Ch 36: Performance & Caching
- Ch 39: Legal Framework

### Tasks

#### 10.1 Deployment Pipeline (Ch 32)
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Automated build and test on PR
- [ ] Staging environment deployment
- [ ] Production deployment workflow

#### 10.2 Error Monitoring (Ch 35)
- [ ] Set up Sentry (or similar) for error tracking
- [ ] Capture frontend and API errors
- [ ] Set up error alerting

#### 10.3 Performance (Ch 36)
- [ ] Review and optimize slow queries
- [ ] Implement caching where beneficial
- [ ] Bundle size analysis
- [ ] Core Web Vitals audit

#### 10.4 Security Hardening
- [ ] Review all API endpoints for auth checks
- [ ] CSRF protection verification
- [ ] Rate limiting on auth endpoints
- [ ] Environment variable audit

#### 10.5 Legal Pages (Ch 39)
- [ ] Complete Terms of Service content
- [ ] Complete Privacy Policy content
- [ ] Cookie consent banner (if required)
- [ ] Medical/emergency disclaimer

### Dependencies
- Sprint 9 complete (demo-ready)

### Acceptance Criteria
- [ ] CI/CD deploys to staging on merge
- [ ] Errors are captured and alerted
- [ ] No critical security vulnerabilities
- [ ] Legal pages are complete
- [ ] Performance meets acceptable thresholds

### Tech Debt Notes
- **Production required**: All items in this sprint
- **Post-demo**: Advanced monitoring, A/B testing infrastructure

---

## Sprint Sequence Summary

| Sprint | Focus | Key Deliverable |
|--------|-------|-----------------|
| **0** | Foundation | Mode system (persistence + initialization), navigation, provider gating, test framework, validation, visual foundation |
| **1** | Family Discovery | Family can browse, save, and contact providers |
| **2** | Provider Response | Provider can view and respond to requests |
| **3** | Engagement | Full messaging and tour scheduling |
| **4** | Trust | Reviews, ratings, and trust badges |
| **5** | Notifications | Email and SMS notifications working |
| **6** | Hiring | Caregiver hiring marketplace functional |
| **7** | Admin | Admin dashboard and moderation tools |
| **8** | Monetization | Subscriptions and paywalls |
| **9** | Polish | Demo data and UX refinement |
| **10** | Production | Deployment, monitoring, security |

---

## Cross-Cutting Concerns

These items should be addressed throughout all sprints:

### Testing
- Test framework established in Sprint 0 (Jest/Vitest + React Testing Library)
- Each sprint should include tests for new API endpoints and critical flows
- Manual testing checklist aligned with "Definition of Done — Testable Outcomes"
- `npm test` must pass before marking any task complete

### Documentation
- Update Master Platform Manual implementation status after each sprint
- Document any demo-only decisions for post-demo cleanup
- Every sprint must include documentation deliverables

### Code Quality
- Use standardized error response format (established in Sprint 0)
- Use Zod validation for all API inputs (established in Sprint 0)
- Type safety (avoid `any`)
- Component composition over duplication

---

## Appendix: Chapter-to-Sprint Mapping

| Chapter | Primary Sprint | Also Touched In |
|---------|---------------|-----------------|
| Ch 1: Auth | ✅ Built | Sprint 0 (mode initialization) |
| Ch 2: Mode System | Sprint 0 | — |
| Ch 3: Onboarding | Sprint 0 | Sprint 2 |
| Ch 4: UI/Design | Sprint 0 (foundation) | Sprint 9 (polish) |
| Ch 5: Navigation | Sprint 0 | Sprint 9 |
| Ch 6: Family Profiles | Sprint 1 | — |
| Ch 7: Provider Profiles | Sprint 2 | Sprint 1 |
| Ch 8: Provider Identity | Sprint 0 | Sprint 2 |
| Ch 9: Directory & Search | Sprint 1 | — |
| Ch 10: Provider Claiming | Sprint 2 | — |
| Ch 11: Matching | Future | — |
| Ch 12: Family Dashboard | Sprint 3 | Sprint 1 |
| Ch 13: Provider Dashboard | Sprint 2 | — |
| Ch 14: Settings | Sprint 5 | ✅ Built |
| Ch 15: Engagements | Sprint 1, 2 | Sprint 3 |
| Ch 16: Messaging | Sprint 3 | Sprint 2 |
| Ch 17: Scheduling | Sprint 3 | — |
| Ch 18: Saved/Favorites | Sprint 1 | ✅ Built |
| Ch 19: Notifications | Sprint 5 | — |
| Ch 20: Hiring Marketplace | Sprint 6 | — |
| Ch 21: Subscriptions | Sprint 8 | — |
| Ch 22: Reviews | Sprint 4 | — |
| Ch 23: Trust & Safety | Sprint 4 | Sprint 7 |
| Ch 24: Data Management | Sprint 7 | — |
| Ch 25: Data Acquisition | Sprint 9 | — |
| Ch 26: Admin System | Sprint 7 | — |
| Ch 27: SOPs | Sprint 7 | — |
| Ch 28: Marketing & SEO | Future | — |
| Ch 29: Referrals | Future | — |
| Ch 30: Customer Support | Future | — |
| Ch 31: Architecture | ✅ Built | — |
| Ch 32: Deployment | Sprint 10 | — |
| Ch 33: File Uploads | ✅ Built | — |
| Ch 34: Communications | Sprint 5 | — |
| Ch 35: Error Handling | Sprint 0 | Sprint 10 (monitoring) |
| Ch 36: Performance | Sprint 10 | — |
| Ch 37: Analytics | Sprint 7 | — |
| Ch 38: Third-Party | Sprint 5, 8 | — |
| Ch 39: Legal Framework | Sprint 10 | — |

---

*Last updated: January 19, 2026*
