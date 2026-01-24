# A+ Platform Transformation Plan

> **Goal:** Transform platform from C+ to A+ by making engagement creation obvious, inevitable, and satisfying within the first 3 minutes.

> **Primary Outcome:** More engagements created and scheduled (tours, consultations, interviews)

---

## Master Backlog

### MUST SHIP (Blocks A+ rating)

| ID | Task | Page/Component | Acceptance Criteria | Status |
|----|------|----------------|---------------------|--------|
| M1 | Fix double footer | layout.tsx | Only one footer renders on all pages | ✅ DONE |
| M2 | Remove list/grid toggle | /browse | Toggle does not exist | ✅ DONE |
| M3 | Verify provider seed data | Database | /browse shows 5+ provider cards | ✅ DONE |
| M4 | Simplify signup modal | AuthModal.tsx | Only email + password fields | ✅ DONE |
| M5 | Engagement page redesign | /requests/[id] | New structure with progress indicator | ✅ DONE |
| M6 | Provider-specific CTAs | Provider cards + detail | CTA text matches provider type | ✅ DONE |
| M7 | Post-action confirmations | All action points | Every action shows feedback | ✅ DONE |
| M8 | Care profile restructure | /care-profile | Calendar-first layout | ✅ DONE |
| M9 | Unified card system | All cards | Single component, consistent design | ✅ DONE |
| M10 | Fix sticky nav offset | /providers/[id] | Sections align when clicked | ✅ DONE |

### SHOULD SHIP (Improves experience significantly)

| ID | Task | Page/Component | Acceptance Criteria | Status |
|----|------|----------------|---------------------|--------|
| S1 | Saved page hero colors | /saved | Uses brand colors (no red/pink) | ✅ DONE |
| S2 | Matches page context | /matches | Intro section explains purpose | ✅ DONE |
| S3 | Leads page hero reduction | /provider/leads | Family cards above fold | ✅ DONE |
| S4 | Paywall messaging clarity | PaywallModal | Clear value proposition | ✅ DONE |
| S5 | Review submission flow | ReviewModal | Reviews can be submitted | ✅ DONE |
| S6 | Filter UI simplification | /browse | Compact filter bar | ✅ DONE |
| S7 | Empty states improvement | All pages | Helpful guidance when empty | ✅ DONE |
| S8 | "Starting at" pricing | All cards | Changed from "Estimated" | ✅ DONE |
| S9 | Progress indicator | /requests/[id] | Visual step progress | ✅ DONE |
| S10 | What happens next | /requests/[id] | Collapsible guidance section | ✅ DONE |

### DEFERRED (Not blocking A+, track for later)

| ID | Task | Reason for Deferral | Revisit When |
|----|------|---------------------|--------------|
| D1 | Calendar integration | Requires external API | After core flow complete |
| D2 | Video call feature | Complex feature | After engagement flow stable |
| D3 | Benefits page persistence | Separate user flow | After family flow A+ |
| D4 | Match % algorithm | Needs data/ML | After basic matching works |
| D5 | Provider analytics deep dive | Provider-focused sprint | After family flow A+ |
| D6 | Hiring marketplace overhaul | Secondary marketplace | After primary flows A+ |

---

## Execution Schedule

### Week 1: Foundation
| Order | ID | Task | Status |
|-------|-----|------|--------|
| 1 | M1 | Fix double footer (all pages) | ✅ DONE |
| 2 | M2 | Remove list/grid toggle | ✅ DONE |
| 3 | M3 | Verify seed data | ✅ DONE |
| 4 | M4 | Simplify signup modal | ✅ DONE |
| 5 | M10 | Fix sticky nav | ✅ DONE |

### Week 2: Critical Flow
| Order | ID | Task | Status |
|-------|-----|------|--------|
| 6 | M5 | Engagement page redesign | ✅ DONE |
| 7 | M6 | Provider-specific CTAs | ✅ DONE |
| 8 | M7 | Post-action confirmations | ✅ DONE |

### Week 3: Polish
| Order | ID | Task | Status |
|-------|-----|------|--------|
| 9 | M8 | Care profile restructure | ✅ DONE |
| 10 | M9 | Unified card system | ✅ DONE |
| 11 | S1-S7 | Should-ship items | ✅ DONE |

### Week 4: Regression & QA
| Order | Task | Status |
|-------|------|--------|
| 12 | Full regression audit | ✅ DONE |
| 13 | Fix any gaps | ✅ DONE |
| 14 | Final verification | ✅ DONE |

---

## Page-by-Page Checklists

### PAGE: /browse
**Definition of Done:** User sees provider cards immediately, can filter without overwhelm, clicks lead to provider detail.

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 1 | Remove list/grid toggle | No toggle visible | ☐ |
| 2 | Verify cards render | 5+ cards visible on load | ☐ |
| 3 | Reduce filter bar height | Filters use <100px vertical | ☐ |
| 4 | Improve empty state | Shows guidance + CTA when no results | ☐ |
| 5 | Consistent card design | All cards use UnifiedCard | ☐ |
| 6 | No double footer | One footer only | ☐ |

---

### PAGE: /providers/[id]
**Definition of Done:** User understands provider, trusts the information, knows exactly what clicking CTA does.

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 1 | Remove page footer | No duplicate footer | ☐ |
| 2 | Fix sticky nav offset | Clicking nav item lands on correct section | ☐ |
| 3 | Provider-specific CTA | Button text matches provider type | ☐ |
| 4 | Change "Estimated Pricing" | Label says "Starting at" | ☐ |
| 5 | Verify review submission | User can submit review, it saves | ☐ |
| 6 | Contact form clarity | Form explains what happens on submit | ☐ |

---

### PAGE: AuthModal (Signup)
**Definition of Done:** User can sign up with minimal friction, knows what happens next.

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 1 | Remove Full Name field | Field does not exist | ☐ |
| 2 | Remove Phone field | Field does not exist | ☐ |
| 3 | Update API handler | Signup works without name/phone | ☐ |
| 4 | Fix TOS alignment | Text is centered, professional | ☐ |
| 5 | Reduce modal padding | Modal feels lighter | ☐ |
| 6 | Post-signup redirect | Goes to care-profile with onboarding | ☐ |

---

### PAGE: /requests/[id] (CRITICAL)
**Definition of Done:** User knows their progress, understands next steps, can easily schedule.

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 1 | Add EngagementHeader | Shows provider info + connection status | ☐ |
| 2 | Add ProgressIndicator | Visual steps from request to meet | ☐ |
| 3 | Add NextStepCard | State-based guidance on what to do | ☐ |
| 4 | Rename "Propose Tour" | Now says "Suggest Times to Meet" | ☐ |
| 5 | Add "What happens next" | Collapsible section with 3 bullets | ☐ |
| 6 | Post-schedule redirect | After scheduling, shows success state | ☐ |
| 7 | State-based content | Header/CTA change based on status | ☐ |
| 8 | Remove page footer | No duplicate footer | ☐ |

---

### PAGE: /care-profile
**Definition of Done:** User sees their engagements first, knows their next action.

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 1 | Simplify hero | Minimal hero, no garish colors | ☐ |
| 2 | Add UpcomingMeetings | Calendar section at top | ☐ |
| 3 | Add ActiveConversations | Engagement list with status | ☐ |
| 4 | Move profile completion | Bottom of page, progress bar only | ☐ |
| 5 | Remove Recent Activity | No activity widget (use notifications) | ☐ |
| 6 | Empty state with CTA | If no engagements, shows "Find Provider" | ☐ |
| 7 | No double footer | One footer only | ☐ |

---

### PAGE: /saved
**Definition of Done:** User can compare and take action on saved providers.

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 1 | Fix hero colors | Uses primary-50/100 (no red/pink) | ☐ |
| 2 | Add nudge copy | Text encourages action | ☐ |
| 3 | Show request status | Badge if request already sent | ☐ |
| 4 | Consistent cards | Uses UnifiedCard | ☐ |
| 5 | No double footer | One footer only | ☐ |

---

### PAGE: /matches
**Definition of Done:** User understands matches and can continue engagements.

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 1 | Add intro section | Explains what matches are | ☐ |
| 2 | Separate sections | Active vs Recommended clearly split | ☐ |
| 3 | Add match % indicator | Shows match score on cards | ☐ |
| 4 | Link to engagement | "Continue Conversation" CTA | ☐ |
| 5 | No double footer | One footer only | ☐ |

---

### PAGE: /provider/leads
**Definition of Done:** Provider sees leads immediately, can respond with minimal friction.

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 1 | Reduce hero height | Max 100px or remove entirely | ☐ |
| 2 | Remove extra banners | One banner max, or none | ☐ |
| 3 | Family cards prominent | Cards visible without scrolling | ☐ |
| 4 | Clear CTA on cards | "Respond to [Name]" not "View Details" | ☐ |
| 5 | Paywall clarity | Clear explanation of what unlock provides | ☐ |
| 6 | No double footer | One footer only | ☐ |

---

## Final Regression Audit Checklist

### Routing
| Check | Pass |
|-------|------|
| Home → Browse works | ☐ |
| Browse → Provider Detail works | ☐ |
| Provider Detail → Auth (if needed) works | ☐ |
| Auth → Request Creation works | ☐ |
| Request Creation → Engagement Page works | ☐ |
| Engagement Page → Schedule works | ☐ |
| Post-schedule shows success state | ☐ |
| All "Back" buttons work correctly | ☐ |
| 404 pages are handled gracefully | ☐ |

### CTAs
| Check | Pass |
|-------|------|
| All provider cards have consistent CTA | ☐ |
| CTA text matches provider type | ☐ |
| Primary CTA is always visible | ☐ |
| Secondary CTA is available | ☐ |
| CTAs work when logged out (trigger auth) | ☐ |
| CTAs work when logged in (proceed) | ☐ |

### Persistence
| Check | Pass |
|-------|------|
| Saved providers persist across sessions | ☐ |
| Draft messages persist (if any) | ☐ |
| Filter selections persist in URL | ☐ |
| Request data persists correctly | ☐ |
| Schedule data saves to database | ☐ |

### Confirmations
| Check | Pass |
|-------|------|
| Saving provider shows toast | ☐ |
| Creating request shows confirmation | ☐ |
| Scheduling shows success state | ☐ |
| Error states show helpful message | ☐ |
| Loading states show spinner | ☐ |

### Visual Consistency
| Check | Pass |
|-------|------|
| Only one footer on all pages | ☐ |
| All cards use unified design | ☐ |
| Brand colors consistent | ☐ |
| No broken images | ☐ |
| Mobile responsive | ☐ |

---

## CTA Text Reference

### Provider-Specific CTAs
```
ASSISTED_LIVING:     "Schedule a Tour" / "Request Info"
MEMORY_CARE:         "Schedule a Tour" / "Request Info"
NURSING_HOME:        "Schedule a Tour" / "Request Info"
HOME_CARE:           "Request a Consultation" / "Get a Care Plan"
HOME_HEALTH:         "Request a Consultation" / "Get a Care Plan"
INDEPENDENT_CAREGIVER: "Schedule an Interview" / "Send Message"
HOSPICE:             "Request a Consultation" / "Learn More"
INDEPENDENT_LIVING:  "Schedule a Tour" / "Request Info"
REHABILITATION:      "Schedule a Tour" / "Request Info"
```

---

## Engagement Page States

### State: PENDING
- Header: "Your request is on its way!"
- Progress: ● Request Sent → ○ Provider Response → ○ Schedule → ○ Meet
- CTA: "Suggest Times" (secondary: "Send a Message")

### State: ACCEPTED
- Header: "Great news! [Provider] wants to connect"
- Progress: ✓ Request Sent → ● Provider Response → ○ Schedule → ○ Meet
- CTA: "Schedule Your Visit"

### State: TOUR_PROPOSED
- Header: "Almost there!"
- Progress: ✓ Request Sent → ✓ Response → ● Schedule → ○ Meet
- CTA: "Confirm Time" or "Suggest Different Times"

### State: SCHEDULED
- Header: "You're all set!"
- Progress: ✓ Request Sent → ✓ Response → ✓ Schedule → ○ Meet
- CTA: "Add to Calendar" | "Get Directions" | "What to Bring"

---

## Change Log

| Date | Task ID | Change | Commit |
|------|---------|--------|--------|
| 2026-01-24 | M1 | Removed Footer from layout.tsx - individual pages control their own footer | a724ea7 |
| 2026-01-24 | M2 | Removed list/grid toggle from /browse - simplified to list view only | a724ea7 |
| 2026-01-24 | M3 | Verified seed data has 58+ providers (36 orgs, 18 caregivers, 4 unclaimed) | a724ea7 |
| 2026-01-24 | M4 | Simplified signup modal to email + password only (name collected in onboarding) | a724ea7 |
| 2026-01-24 | M10 | Added scroll-mt-36 to all section elements for proper sticky nav offset | a724ea7 |
| 2026-01-24 | M5 | Created EngagementHeader, EngagementProgressIndicator, NextStepCard components | 4c9af04 |
| 2026-01-24 | M6 | Added provider-type-specific CTAs to ProviderCard (Schedule Tour/Consultation/Interview) | 4c9af04 |
| 2026-01-24 | M7 | Created EngagementSuccessModal for post-action confirmations | 4c9af04 |
| 2026-01-24 | S8 | Changed "Estimated Pricing" to "Starting at" in ProviderCard | 4c9af04 |
| 2026-01-24 | S9 | Progress indicator implemented via EngagementProgressIndicator | 4c9af04 |
| 2026-01-24 | S10 | "What happens next" collapsible section added to NextStepCard | 4c9af04 |
| 2026-01-24 | M8 | Care profile restructure with calendar-first layout | 275790d |
| 2026-01-24 | M9 | Created UnifiedCard system with shared styles and components | 275790d |
| 2026-01-24 | S1 | Changed saved page hero from pink/rose to brand primary colors | 275790d |
| 2026-01-24 | S2 | Added intro section to matches page explaining personalized matching | 275790d |
| 2026-01-24 | S3 | Reduced leads page hero to compact inline header | 275790d |
| 2026-01-24 | S4 | Redesigned PaywallModal with clear value proposition | 275790d |
| 2026-01-24 | S5 | Verified review submission flow works (auto-approved by default) | 275790d |
| 2026-01-24 | S6 | Created compact filter bar with primary/secondary filters | 275790d |
| 2026-01-24 | S7 | Created reusable EmptyState component for consistent empty states | 275790d |
| 2026-01-24 | W4-1 | Fixed 404 page broken links (/search→/browse, /dashboard→/care-profile, etc.) | 2b89214 |
| 2026-01-24 | W4-2 | Fixed provider detail page CTA to use provider-type-specific text | 2b89214 |
| 2026-01-24 | W4-3 | Fixed CTA text in engagementUtils (Request a Consultation, Schedule an Interview) | 2b89214 |
| 2026-01-24 | W4-4 | Fixed secondary CTAs in providerUtils (Request Info, Get a Care Plan, Send Message) | 2b89214 |
| 2026-01-24 | W4-5 | Moved HOSPICE from FACILITY_PROVIDER_TYPES to HOME_CARE_PROVIDER_TYPES | 2b89214 |
| 2026-01-24 | W4-6 | Full regression audit: Routing ✓, CTAs ✓, Persistence ✓, Confirmations ✓, Visual ✓ | 2b89214 |

---

*Last Updated: 2026-01-24*
