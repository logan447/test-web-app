# Sprint Backlog: B- to A+ Transformation

**Created**: January 2025
**Source**: `/docs/page-by-page-audit.md`
**Total Issues**: 217

---

## Sprint 1 — Completed ✓

**Date**: January 26, 2025
**Type**: Deep Sprint (Critical Bugs + 1 GASH Page)
**Commits**: `b4a29a9`, `1d4580d`

### Completed Items

| ID | Issue | Resolution |
|----|-------|------------|
| A-001 | EC-1: Edit Care Profile save bug | Added `saveSucceeded` state guard, disabled navigation during save |
| A-002 | HS-4: "View applications" wrong routing | Changed route to `/provider/candidates`, updated text to "View Candidates" |
| A-003 | DP-1: Duplicate browse pages | Consolidated to `/providers/browse-organizations` with redirects from old URLs |
| A-083–A-096 | G-1: Request page redesign (14 issues) | Complete first-principles redesign: scheduling-first, messages collapsed, 65+ friendly, 1359→706 lines |

### Key Decisions Made

1. **Browse pages canonical URL**: `/providers/browse-organizations` (not `/caregiver/`)
2. **Request page approach**: Full redesign (not incremental fixes) — messaging demoted to secondary role
3. **Navigation updates**: All links to old browse pages redirect to canonical URL

### Handoff Note
Sprint 1 is complete. All code committed and pushed. Ready for Sprint 2 (Edit Care Profile GASH + Global Standards).

---

## Sprint 2 — Completed ✓

**Date**: January 26, 2025
**Type**: Deep Sprint (1 GASH Page)
**Commits**: `df4123b`

### Completed Items

| ID | Issue | Resolution |
|----|-------|------------|
| A-115 | EC-2: Feels like survey, not profile builder | Redesigned from 4-step wizard to section-based profile builder with all sections visible |
| A-116 | EC-3: Questions too long and poorly written | Rewrote all copy at 3rd-4th grade reading level with plain language |
| A-117 | EC-4: Hero section takes too much vertical space | Removed hero, integrated header into two-column layout |
| A-118 | EC-5: Progress indicators too wide | Replaced with compact progress bar showing % complete |
| A-119 | EC-6: Questions poorly fitted to viewport | Two-column layout: form (60%) + live preview (40%) |
| A-120 | EC-7: Users don't understand profile's value | Added live preview showing "What providers see" |
| A-121 | EC-8: No preview of live profile | Full live preview panel updates in real-time |
| A-122 | EC-9: Privacy controls not clearly explained | Dedicated Privacy section with simple toggle and explanation |
| A-123 | EC-10: Profile photo and first name not encouraged | Photo upload with encouragement: "Profiles with photos get 3x more responses" |

### Key Decisions Made

1. **Full section-based redesign**: All sections visible and editable (not wizard steps)
2. **Live preview architecture**: Right panel shows real-time preview of what providers see
3. **Photo encouragement**: Strongly encouraged but not required, with "3x more responses" messaging
4. **Plain language copy**: All labels and descriptions written at 3rd-4th grade reading level
5. **Collapsible sections**: Preferences section collapsible to reduce cognitive load
6. **Pattern for reuse**: Architecture designed to be reusable for provider profile edit later

### Handoff Note
Sprint 2 is complete. Edit Care Profile transformed from 4-step wizard to modern section-based profile builder. All code committed and pushed. Ready for Sprint 3 (Provider Profile Pages GASH).

---

## Sprint 3 — Completed ✓

**Date**: January 26, 2025
**Type**: Deep Sprint (2 GASH Pages)
**Commits**: `c4ad0c9`, `9a8fd62`

### Completed Items

| Page | Treatment | Priority |
|------|-----------|----------|
| G-4: Edit Provider Profile | Full section-based redesign (mirrors Care Profile pattern) | Primary |
| G-3: Provider My Profile | Radical simplification (calendar-first) | Secondary |

### Planning Decisions (Confirmed)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Scope Priority** | G-4 first, then G-3 | Edit Profile establishes pattern; My Profile is simplification |
| **My Profile Approach** | Radical simplification | Calendar + engagements + Edit Profile only. Remove all clutter. |
| **Visibility Toggles** | Context-aware by provider type | Different providers have different audiences |
| **Subtype Variation** | Significant | Conditional sections/fields based on provider type |
| **Photo Encouragement** | Context-appropriate | Different messaging for facilities vs. caregivers |

### Visibility Toggle Logic

| Provider Type | Toggle 1 | Toggle 2 |
|---------------|----------|----------|
| **Facilities** (Assisted Living, Memory Care, etc.) | Visible to families | Visible to hiring caregivers |
| **Home Care Agencies** | Visible to families | Visible to hiring caregivers |
| **Independent Caregivers** | Visible to families (direct hire) | Visible to organizations (employment) |

### G-4: Edit Provider Profile — Implementation Plan

**Architecture** (per design-standards.md §0):
- Two-column layout: form sections (60%) + live preview (40%)
- Section-based navigation (all visible, not wizard)
- Real-time preview: "What families see" / "What organizations see"
- Progress indicator based on profile completeness
- Photo upload with context-appropriate encouragement

**Subtype-Specific Sections**:

| Section | Facilities | Home Care | Independent Caregiver |
|---------|------------|-----------|----------------------|
| Basic Info | Name, type, description | Name, type, description | Name, bio, experience |
| Location | Address, service area | City, state, service radius | City, state, service radius |
| Services | Care types, amenities, capacity | Care types, staff size | Care types, specialties |
| Credentials | License, certifications, accreditations | License, insurance | Certifications, background check |
| Availability | Capacity, waitlist | Availability | Schedule, hourly rate |
| Privacy | Dual toggles | Dual toggles | Dual toggles |

**Issues Addressed**: A-179 through A-186 (EP-1 through EP-8)

### G-3: Provider My Profile — Implementation Plan

**Radical Simplification**:
- Remove: Performance insights, activity feed, tips card, profile completion widget, quick actions, recent leads
- Keep: Calendar (PRIMARY), upcoming engagements, Edit Profile button
- Conditional: Matching families preview (only if clean/simple design)

**Target**: Page reduced from 875 lines to <200 lines

**Issues Addressed**: A-171 through A-178 (PP-1 through PP-8)

### Definition of Done

**G-4 (Edit Provider Profile)**:
- [x] Two-column layout with live preview implemented
- [x] Dual visibility toggles (context-aware)
- [x] Subtype-specific sections render correctly
- [x] Progress indicator shows completion %
- [x] Photo upload with encouragement
- [x] Plain language copy (3rd-4th grade level)
- [x] All EP-1 through EP-8 issues resolved

**G-3 (Provider My Profile)**:
- [x] Calendar is first meaningful content above fold
- [x] Page reduced to <250 lines (242 lines, 72% reduction from 875)
- [x] No clutter sections remain (insights, activity, tips removed)
- [x] Clear Edit Profile action visible
- [x] All PP-1 through PP-8 issues resolved

### Handoff Note
Sprint 3 is complete. Both provider profile pages transformed: Edit Profile now mirrors Care Profile pattern with subtype-specific sections and dual visibility toggles; My Profile radically simplified to calendar-first with 72% code reduction. All code committed and pushed. Ready for Sprint 3.5 quality verification.

---

## Sprint 3.5 — Completed ✓

**Date**: January 26, 2025
**Type**: Quality Verification Sprint
**Purpose**: Ensure G-3 and G-4 meet A+ quality before Sprint 4

### Completed Items

| Task | Resolution |
|------|------------|
| **Prisma Schema Alignment** | Fixed ProviderType mismatch - removed ADULT_DAY_CARE and RESPITE_CARE from G-4 (not in Prisma enum) |
| **Helper Function Fix** | Updated isFacility() and isAgency() to match valid ProviderType values |
| **TypeScript Compilation** | Verified clean compilation with `npx tsc --noEmit --skipLibCheck` |
| **Form Validation** | Added comprehensive field-level validation with inline error display |
| **Mobile Responsiveness** | Verified responsive Tailwind patterns in both G-3 and G-4 |

### Validation Added to G-4

| Field | Validation |
|-------|------------|
| Name | Required, non-empty |
| City | Required, non-empty |
| State | Required, selected |
| Care Types | At least one selected |
| Email | Valid format (if provided) |
| Phone | 10-11 digits (if provided) |
| Website | Valid URL format (if provided) |
| ZIP Code | 5 digits (if provided) |

### Deferred Items (Future Sprint)

| Item | Reason | Recommended Sprint |
|------|--------|-------------------|
| **Photo Upload to Cloud Storage** | Currently using base64 data URL - works for demo but not production-scale | Infrastructure sprint |
| **Save/Load Cycle Runtime Test** | Requires running app and manual testing | QA sprint |
| **API Endpoint E2E Verification** | GET/POST/PATCH `/api/providers/me` behavior | QA sprint |
| **Field Character Limits** | Description, bio text length limits | Polish sprint |

### Handoff Note
Sprint 3.5 complete. G-3 and G-4 now have schema alignment, comprehensive form validation, and verified responsive patterns. Photo upload deferred to infrastructure sprint. Ready for Sprint 4 (Homepage + Browse Polish).

---

## Sprint 4 — Completed ✓

**Date**: January 26, 2025
**Type**: Deep Sprint (Homepage + Browse A+ Polish)
**Focus**: Location infrastructure, homepage transformation, browse enhancements

### Overview

Sprint 4 elevated the homepage and browse page from B+ to A+ quality with:
- Best-practice location system (Airbnb/Zillow quality)
- Emotionally resonant copy for 65+ users
- Featured providers section with real data
- Save/heart functionality wired up
- Guidance nudges reinforcing "meet 3-5 providers"

### Phase 1: Location Infrastructure (Foundation)

| Component | Description |
|-----------|-------------|
| **Location Prisma Model** | New `Location` model with city, state, stateName, population, coordinates |
| **US Locations Data** | 400+ US cities with Census population data in `/prisma/data/us-locations.ts` |
| **Search API** | `/api/locations/search` with relevance sorting by population |
| **LocationAutocomplete** | Reusable component with debounced search, keyboard navigation, accessibility |

**Key Files Created**:
- `prisma/schema.prisma` - Added Location model
- `prisma/data/us-locations.ts` - 400+ US cities with coordinates and population
- `app/api/locations/search/route.ts` - Location search API endpoint
- `components/Location/LocationAutocomplete.tsx` - Autocomplete component

### Phase 2: Homepage Transformation

| Change | Before | After |
|--------|--------|-------|
| **Hero Copy** | "Find peace of mind for your family" | "Find the right care for someone you love" |
| **Location Input** | Free text input | LocationAutocomplete with dropdown |
| **Featured Providers** | None | 4 top-rated providers from database |
| **Guidance Section** | Buried "Not sure where to start?" | Prominent guidance banner early on page |
| **Texas References** | "Currently available in Texas" | Removed |
| **Care Types** | Industry jargon | Plain language (e.g., "Help at Home" not "Home Care") |
| **Testimonials** | Generic quotes | Emotional stories ("After Dad's stroke...") |
| **How It Works** | 4 steps | 3 steps + "meet 3-5 providers" tip |

### Phase 3: Browse Page Enhancements

| Feature | Implementation |
|---------|---------------|
| **Save/Heart Wiring** | localStorage persistence, ProviderCard integration |
| **LocationAutocomplete** | Replaced free text input in filter bar |
| **Guidance Nudge** | "Tip: Meet with 3-5 providers" banner when results >= 3 |
| **Selected Location** | Structured city/state for reliable API filtering |

### Cross-Cutting Issues Addressed

| Issue | Resolution |
|-------|------------|
| A-005 CC-2: Texas only language | Removed from homepage |
| A-007 CC-4: Canonical location system | LocationAutocomplete + Location model |
| A-008 CC-5: Heart/save on cards | Wired save functionality on browse page |
| A-040–A-052: Homepage issues | Full transformation |

### Technical Notes

1. **Location Architecture**: Single source of truth pattern established:
   - Static data in `us-locations.ts` (~400 cities, expandable to 30K)
   - API endpoint for frontend consumption
   - Reusable component across all pages
   - Population-based relevance sorting

2. **Save Functionality**: Uses localStorage for unauthenticated users. Can be extended to use `/api/saved-providers` for authenticated users.

3. **Featured Providers**: Fetches from `/api/providers?limit=4&sortBy=rating` on page load.

### Definition of Done

- [x] Location model added to Prisma schema
- [x] 400+ US cities seeded with population data
- [x] LocationAutocomplete component with keyboard navigation
- [x] Homepage hero rewritten for emotional resonance
- [x] Featured providers section showing real data
- [x] Guidance section prominent for unsure users
- [x] Browse save/heart functionality wired
- [x] Browse LocationAutocomplete integrated
- [x] Browse guidance nudge added
- [x] TypeScript compilation verified
- [x] All code committed and pushed

### Sprint 4.5: Consistency Fixes

**Date**: January 26, 2025
**Type**: Quality Assurance Sprint
**Purpose**: Ensure A+ consistency across all location inputs and saved providers

#### Completed Items

| Task | Resolution |
|------|------------|
| **LocationAutocomplete Consistency** | Replaced free-text inputs with LocationAutocomplete on `/care-profile/edit` and `/provider/profile/edit` |
| **useSavedProviders Hook** | Created shared hook (`hooks/useSavedProviders.ts`) for unified localStorage + server sync |
| **Browse Page Hook Migration** | Updated to use shared hook, removed 70+ lines of duplicate code |
| **Provider Detail Page** | Now uses shared hook, has localStorage persistence (was server-only) |

#### Key Files Created/Modified

| File | Change |
|------|--------|
| `hooks/useSavedProviders.ts` | **NEW** - Shared hook for saved providers with localStorage + server sync |
| `app/browse/page.tsx` | Uses shared hook instead of local implementation |
| `app/providers/[id]/page.tsx` | Uses shared hook, now has localStorage persistence |
| `app/care-profile/edit/page.tsx` | Uses LocationAutocomplete instead of free-text |
| `app/provider/profile/edit/page.tsx` | Uses LocationAutocomplete instead of free-text |

#### Architectural Decisions

1. **Saved Providers Pattern**: All pages now use the same localStorage + server sync pattern via `useSavedProviders` hook
2. **Location Input Pattern**: All location inputs now use `LocationAutocomplete` component for consistent UX
3. **Database Fallback**: Location API has static data fallback if database is empty

### Handoff Note
Sprint 4 + 4.5 complete. Platform now has true A+ consistency:
- All location inputs use the same Airbnb/Zillow-quality autocomplete
- All saved providers use unified localStorage + server sync via shared hook
- No split-brain patterns or inconsistent implementations remain

Ready for Sprint 5 (Provider Detail Pages).

---

## Sprint 5 — Completed ✓

**Date**: January 26, 2025
**Type**: Mixed Sprint (Provider Detail Pages + Platform Foundations)
**Focus**: Transform provider detail pages to A+ quality with proper contact gating, Olera Score integration, and claim/takedown flows
**Commits**: `eef6be6`, `0f47d0b`

### Overview

Sprint 5 addresses 24 original issues (A-053 through A-076) plus critical platform foundations:
- **Independent Caregiver** (11 issues): A-053 to A-063
- **Home Care Agency** (7 issues): A-064 to A-070
- **Senior Living / Facility** (6 issues): A-071 to A-076
- **NEW**: Olera Score integration, contact info privacy rules, claim/takedown flows

---

### Core Architecture Decisions

#### Contact Information Privacy Rules

| Provider Type | Profile Pages | Engagement Pages | Cards |
|---------------|---------------|------------------|-------|
| **Organizations** (agencies, facilities) | ✅ Always visible | ✅ Always visible | ✅ Always visible |
| **Individual Caregivers** | ❌ Never public | ✅ Only with active engagement | ❌ Never visible |
| **Families** | ❌ Never public | ✅ Only with active engagement | N/A |

**"Active Engagement" Definition**:
Contact info is visible only when engagement status is one of:
- `ACCEPTED` - Provider accepted the request
- `SCHEDULED` - Meeting/tour has been scheduled
- `COMPLETED` - Engagement finished (contact may still be needed for follow-up)

Contact info is **NOT visible** when status is:
- `PENDING` - Request sent but not yet accepted (no consent)
- `DECLINED` - Provider rejected the request
- `CANCELLED` - Either party cancelled
- `EXPIRED` - Request timed out

**Full Contact Visibility Matrix**:

| Viewer | Subject | Condition | Visible Fields |
|--------|---------|-----------|----------------|
| Family | Organization (agency/facility) | Always | phone, email, website, address |
| Family | Individual Caregiver | ACCEPTED/SCHEDULED/COMPLETED | phone, email |
| Provider (any) | Family | ACCEPTED/SCHEDULED/COMPLETED | phone, email |
| Organization | Individual Caregiver (hiring) | ACCEPTED/SCHEDULED/COMPLETED | phone, email |
| Individual Caregiver | Organization (applying) | Always | phone, email, website |

**Implementation**: Create `ContactInfoDisplay` component with `providerType`, `engagementStatus`, and `viewerRole` props to enforce these rules consistently across all surfaces.

#### Olera Score System

**Name**: Olera Score (primary) or "Olera Trust Score" (acceptable alternative)

**Formula**:
```
Olera Score = (OR × w₁ + GR × w₂ + PC × w₃) ÷ (w₁ + w₂ + w₃)
```

**Components**:
| Input | Description | Scale |
|-------|-------------|-------|
| **OR** (Online Reputation) | Synthesized reputation from directories, reviews, records | 0-5 |
| **GR** (Google Reviews) | Adjusted Google rating accounting for volume | 0-5 |
| **PC** (Profile Completeness) | % of profile fields completed | 0-100% → 0-5 |

**Dynamic Weighting by Review Volume**:
| Review Count | OR Weight | GR Weight | PC Weight |
|--------------|-----------|-----------|-----------|
| 0-5 (Low) | 60% | 30% | 10% |
| 6-20 (Moderate) | 45% | 45% | 10% |
| >20 (High) | 30% | 60% | 10% |

**Key Principles**:
- Non-pay-to-win: Only real data and actions improve score
- Fair to new providers: Low review count doesn't penalize
- Transparent: Clear inputs, visible methodology
- Supports unclaimed providers: Score calculated from available data

**MVP Scope**:
- OR: Use internal Olera review average (we don't have external directory data yet)
- GR: Placeholder/null until Google integration (future sprint)
- PC: Calculate from profile field completion percentage

**Edge Case Handling**:

| Scenario | Handling | Display |
|----------|----------|---------|
| 0 reviews (OR = null) | Use PC-only with 100% weight | "New provider - no reviews yet" badge |
| GR = null (MVP default) | Redistribute: OR 90%, PC 10% | Normal score display |
| PC < 30% | Score still calculated | "Incomplete profile" warning |
| Unclaimed provider | Calculate from available public data | "Unclaimed - score based on public info" |
| All inputs null/empty | Cannot calculate | "Limited data available" (no numeric score) |

**Score Display Thresholds**:

| Score Range | Label | Color | Badge |
|-------------|-------|-------|-------|
| 4.5 - 5.0 | Exceptional | Emerald | ⭐ |
| 4.0 - 4.4 | Excellent | Blue | |
| 3.5 - 3.9 | Very Good | Teal | |
| 3.0 - 3.4 | Good | Amber | |
| 2.0 - 2.9 | Fair | Orange | |
| < 2.0 | Limited Data | Gray | |

**Storage Decision**: Hybrid approach
- Compute on-the-fly for detail pages (always fresh)
- Store `oleraScore` and `oleraScoreUpdatedAt` on Provider model for list pages
- Recalculate on: review submission, profile update, daily background job

#### Claim & Takedown Flows

**Applies to**: Organizations only (agencies, facilities)
**Does NOT apply to**: Individual caregivers, families (never have pre-seeded pages)

**Claim Flow** (exists, enhance):
1. "Claim this profile" CTA on unclaimed provider pages
2. Verification method selection
3. Demo mode: auto-approve; Production: admin review
4. Success → redirect to provider dashboard

**Takedown Flow** (NEW):
1. "Request removal" link on provider page footer
2. TakedownRequestModal with reason selection
3. Submit → queued for admin review
4. Confirmation message: "Your request has been submitted and will be reviewed. We'll notify you of the outcome."
5. DMCA-compliant process

**TakedownRequest Database Model** (NEW):
```prisma
model TakedownRequest {
  id            String          @id @default(cuid())
  providerId    String
  provider      Provider        @relation(fields: [providerId], references: [id])
  reason        TakedownReason
  details       String?         // Additional context from requester
  contactName   String          // Name of person requesting
  contactEmail  String          // Email for notification
  contactPhone  String?         // Optional phone
  proofUrl      String?         // Link to proof of ownership (optional)
  status        TakedownStatus  @default(PENDING)
  createdAt     DateTime        @default(now())
  reviewedAt    DateTime?
  reviewedBy    String?         // Admin user ID
  reviewNotes   String?         // Internal admin notes

  @@index([providerId])
  @@index([status])
}

enum TakedownReason {
  NOT_MY_BUSINESS      // "I don't own or represent this business"
  INCORRECT_INFO       // "The information is incorrect"
  BUSINESS_CLOSED      // "This business has permanently closed"
  PRIVACY_CONCERN      // "Privacy or legal concern"
  DUPLICATE_LISTING    // "This is a duplicate of another listing"
  OTHER                // "Other reason"
}

enum TakedownStatus {
  PENDING   // Awaiting admin review
  APPROVED  // Takedown approved, provider soft-deleted
  DENIED    // Takedown denied with reason
}
```

#### Caregiver "For Organizations" Section Spec

**Purpose**: Help individual caregivers be discovered by organizations for employment.

**Content**:
| Field | Description | Source |
|-------|-------------|--------|
| Employment Status | "Open to opportunities" toggle | New field on Provider |
| Work Preferences | Full-time, Part-time, Live-in, Per diem | New multi-select field |
| Preferred Employers | Home care agencies, Facilities, Direct families | New multi-select field |
| Availability Start | When they can start | Existing or new date field |
| Experience Summary | Years, specialties | Existing provider fields |

**Display Rules**:
- Only shown on Individual Caregiver pages
- Only shown if `openToEmployment` toggle is ON
- Appears as collapsible section after main caregiver info
- CTA: "Send Interview Request" (for logged-in org providers)

**Visibility Toggle Integration**:
- Controlled by existing "Visible to organizations" toggle from Sprint 3
- If toggle OFF, section doesn't render even if `openToEmployment` is ON

---

### Goals

| Goal | Acceptance Criteria |
|------|---------------------|
| **Olera Score Integration** | Score displayed on all provider pages, calculated from OR/GR/PC with dynamic weighting |
| **Contact Info Privacy** | Organizations: always visible. Individuals: only with active engagement. Enforced everywhere. |
| **Pricing Clarity** | "Starting at" replaces "Estimated" globally |
| **Claim Flow Enhancement** | Visible CTA, clear entry point on unclaimed pages |
| **Takedown Flow** | DMCA-compliant request flow with admin queue |
| **Section Hygiene** | Empty sections don't render, sticky nav matches visible sections |
| **Provider-Type Specific** | Each type has appropriate sections, CTAs, and content |

---

### Priority 1: Platform Foundations (Cross-Cutting)

| Task | Description | Components Affected |
|------|-------------|---------------------|
| **Database Schema Updates** | Add TakedownRequest model, add oleraScore/oleraScoreUpdatedAt to Provider, add openToEmployment to Provider | `prisma/schema.prisma` |
| **Olera Score System** | Implement `calculateOleraScore()` with dynamic weighting and edge case handling | `lib/oleraScore.ts`, `components/Trust/OleraScore.tsx` |
| **Contact Info Component** | Create `ContactInfoDisplay` with full visibility matrix by provider type, engagement status, viewer role | `components/Provider/ContactInfoDisplay.tsx` |
| **Takedown Request Flow** | Create modal + API endpoint + database storage | `components/Provider/TakedownRequestModal.tsx`, `app/api/providers/[id]/takedown/route.ts` |
| **Pricing Language Sweep** | Replace "Estimated" → "Starting at" globally | Provider detail, cards, edit forms |
| **Card Contact Audit** | Verify contact info rules applied to all card components | `ProviderCard.tsx`, `UnifiedCard.tsx`, browse/saved/matches pages |
| **Engagement Page Contact Audit** | Apply contact visibility matrix to engagement pages | `app/requests/[id]/page.tsx`, provider-side engagement views |

### Priority 2: Original Issues (A-053 to A-076)

#### Cross-Cutting Fixes

| ID | Issue | Severity | Resolution |
|----|-------|----------|------------|
| A-054 | Contact info visible before engagement | CUT | Use new `ContactInfoDisplay` component with provider-type rules |
| A-057/A-069 | Trust/Olera Score undefined | CUT | Implement Olera Score system with transparent methodology |
| A-067/A-073 | Pricing says "estimated" | PAPER CUT | Global sweep: "Starting at" |
| A-063/A-075 | Empty sections render | PAPER CUT | Conditional rendering for empty arrays/null values |

#### Independent Caregiver (A-053 to A-063)

| ID | Issue | Severity | Resolution |
|----|-------|----------|------------|
| A-053 | "Request detailed pricing" does nothing | CUT | Wire to contact form with pricing inquiry |
| A-055 | Single image only | PAPER CUT | Photo gallery if multiple images |
| A-056 | Pricing tooltips lack explanation | PAPER CUT | Add tooltip for hourly vs package |
| A-058 | CTA copy too wordy | PAPER CUT | "Schedule Interview" / "Send Message" |
| A-059 | Sticky nav missing sections | PAPER CUT | Nav matches rendered sections |
| A-060 | Service area vs location redundant | PAPER CUT | Consolidate to single location section |
| A-061 | No availability section | CUT | Add availability/schedule section |
| A-062 | No employer-facing view | CUT | Add "For Organizations" section |

#### Home Care Agency (A-064 to A-070)

| ID | Issue | Severity | Resolution |
|----|-------|----------|------------|
| A-064 | "Request detailed pricing" lacks guidance | CUT | Context about consultation |
| A-065 | "How it works" too wordy | PAPER CUT | 3 clear steps |
| A-066 | No caregiver profiles | PAPER CUT | "Caregivers on staff" if data exists |
| A-068 | Service area unclear | PAPER CUT | Map or covered cities list |
| A-070 | Reviews need seed data | PAPER CUT | Post-sprint: seed script update |

#### Senior Living / Facility (A-071 to A-076)

| ID | Issue | Severity | Resolution |
|----|-------|----------|------------|
| A-071 | "Live here" unclear | PAPER CUT | Rename to "Community Life" |
| A-072 | Image categorization missing | CUT | Categories: Rooms, Common Areas, Dining |
| A-074 | No "last updated" | PAPER CUT | "Info last verified" timestamp |
| A-076 | CTA clarity | PAPER CUT | "Schedule a Tour" consistently |

---

### Components to Create/Update

**Database/Schema**:
| Component | Purpose | Status |
|-----------|---------|--------|
| `prisma/schema.prisma` | Add TakedownRequest model, oleraScore fields on Provider, openToEmployment field | UPDATE |

**Libraries**:
| Component | Purpose | Status |
|-----------|---------|--------|
| `lib/oleraScore.ts` | Olera Score calculation with dynamic weighting and edge cases | NEW |
| `lib/contactVisibility.ts` | Contact visibility rules by provider type, engagement status, viewer role | NEW |

**Components**:
| Component | Purpose | Status |
|-----------|---------|--------|
| `components/Trust/OleraScore.tsx` | Score display (badge, breakdown, tooltip) with all edge case displays | UPDATE from CredibilityScore |
| `components/Provider/ContactInfoDisplay.tsx` | Privacy-aware contact info using `contactVisibility` rules | NEW |
| `components/Provider/TakedownRequestModal.tsx` | DMCA-compliant takedown request form | NEW |
| `components/Provider/ForOrganizationsSection.tsx` | Caregiver employer-facing section | NEW |
| `components/Provider/AvailabilitySection.tsx` | Caregiver schedule/availability | NEW |
| `components/Provider/ImageGallery.tsx` | Enhanced gallery with categories | UPDATE |

**API Routes**:
| Component | Purpose | Status |
|-----------|---------|--------|
| `app/api/providers/[id]/takedown/route.ts` | POST takedown request, stores in database | NEW |

---

### Definition of Done

**Database & Schema**:
- [x] TakedownRequest model added to Prisma schema
- [x] oleraScore and oleraScoreUpdatedAt fields added to Provider
- [x] openToEmployment field added to Provider (as workPreferences, preferredEmployers, availabilityStart)
- [x] Migration run successfully

**Platform Foundations**:
- [x] Olera Score system with dynamic weighting and all edge cases handled
- [x] Score displays on all provider detail pages with appropriate badges
- [x] `ContactInfoDisplay` enforces full visibility matrix
- [x] Takedown request flow complete with database storage
- [x] "Starting at" pricing language used everywhere

**Contact Privacy Verification**:
- [x] Provider detail pages: orgs always show contact, individuals never
- [x] Cards (browse/saved/matches): orgs show contact, individuals don't
- [x] Engagement pages: contact shown based on status (ACCEPTED/SCHEDULED/COMPLETED only)
- [x] Hiring marketplace: follows same engagement-based rules

**Original Issues**:
- [x] All 24 issues addressed (A-053 through A-076)
- [x] Empty sections don't render
- [x] Sticky nav matches visible sections
- [x] Individual caregivers have "For Organizations" section

**Quality Gates**:
- [x] TypeScript compilation passes
- [x] Prisma generate succeeds
- [x] Privacy rules verified across all surfaces
- [x] Claim/takedown flows tested for organizations
- [x] All code committed and pushed

---

### Completed Components

| Component | Status |
|-----------|--------|
| `lib/oleraScore.ts` | ✅ Created - Olera Score calculation with OR/GR/PC formula and dynamic weighting |
| `lib/contactVisibility.ts` | ✅ Created - Full visibility matrix by provider type, viewer role, engagement status |
| `components/Trust/OleraScore.tsx` | ✅ Created - OleraScore, OleraScoreBadge (with cachedScore optimization), OleraScoreNumber |
| `components/Provider/ContactInfoDisplay.tsx` | ✅ Created - Privacy-aware contact display with locked state |
| `components/Provider/TakedownRequestModal.tsx` | ✅ Created - DMCA-compliant takedown request form |
| `components/Provider/ForOrganizationsSection.tsx` | ✅ Created - Caregiver employer-facing section |
| `components/Provider/AvailabilitySection.tsx` | ✅ Created - Caregiver schedule/availability display |
| `app/api/providers/[id]/takedown/route.ts` | ✅ Created - POST takedown request endpoint |
| `app/api/admin/takedown-requests/route.ts` | ✅ Created - Admin list endpoint with filtering |
| `app/api/admin/takedown-requests/[id]/route.ts` | ✅ Created - Admin approve/deny endpoint |
| `app/admin/takedown-requests/page.tsx` | ✅ Created - Admin review interface |

### Card Components Updated with OleraScoreBadge

| Card Component | Status |
|----------------|--------|
| `ProviderCard.tsx` | ✅ OleraScoreBadge with cachedScore |
| `CaregiverCard.tsx` | ✅ OleraScoreBadge with cachedScore |
| `SavedProviderCard.tsx` | ✅ OleraScoreBadge with cachedScore |
| `EnhancedProviderCard.tsx` | ✅ OleraScoreBadge with cachedScore |
| `OrganizationCard.tsx` | ✅ OleraScoreBadge with cachedScore |

### API Updates

| API Endpoint | Changes |
|--------------|---------|
| `/api/providers` (browse) | Added: priceDescription, workPreferences, preferredEmployers, availabilityStart, oleraScore, oleraScoreUpdatedAt |
| `/api/providers/me` | Added: workPreferences, preferredEmployers, availabilityStart support |
| `/api/providers/[id]/reviews` | Added: Olera Score cache update on review submission |

### Handoff Note
Sprint 5 is complete. Full Olera Score system implemented with caching optimization. Contact visibility enforced across all surfaces using centralized `ContactInfoDisplay` component and `contactVisibility` lib. Takedown flow complete with admin review interface. All 6 card components now display OleraScoreBadge consistently with cached score support for performance. Ready for Sprint 6.

---

### Implementation Order

1. **Database Schema** (must come first)
   - Add TakedownRequest model
   - Add oleraScore fields to Provider
   - Add openToEmployment to Provider
   - Run migration

2. **Core Libraries** (dependencies for components)
   - `lib/oleraScore.ts` with edge case handling
   - `lib/contactVisibility.ts` with full matrix

3. **Platform Components**
   - `OleraScore.tsx` display component
   - `ContactInfoDisplay.tsx` privacy component
   - `TakedownRequestModal.tsx` + API route

4. **Provider Detail Page Updates**
   - Integrate Olera Score display
   - Integrate ContactInfoDisplay
   - Empty section hygiene
   - Sticky nav accuracy
   - Pricing language sweep

5. **Provider-Type Specific**
   - Independent Caregiver: ForOrganizationsSection, AvailabilitySection
   - Home Care Agency: polish and consistency
   - Senior Living: final pass

6. **Cross-Surface Verification**
   - Audit and update all card components
   - Audit and update engagement pages
   - Verify claim CTA on unclaimed pages
   - Add takedown link in footer

---

### Handoff Note
Sprint 5 scope finalized with full specifications for:
- Active engagement status definitions (ACCEPTED/SCHEDULED/COMPLETED)
- Olera Score edge case handling (0 reviews, null GR, low PC)
- TakedownRequest database model
- Full contact visibility matrix
- Caregiver "For Organizations" section spec
- Olera Score storage decision (hybrid: compute + cache)

---

## Sprint 6 — Completed ✓

**Date**: January 26, 2025
**Type**: Mixed Sprint (CTA Flow + Saved + Matches Polish)
**Focus**: Cross-page consistency, EmptyState enhancements, LocationAutocomplete in onboarding, PageHero standardization
**Commits**: `abdc585`

### Overview

Sprint 6 elevated the CTA flow (onboarding), Saved Providers, and Matches pages to A+ quality with:
- LocationAutocomplete integration in all onboarding location inputs
- EmptyState component enhanced with `guidanceMessage`, `size`, and `matches` variant
- PageHero component standardized across Saved and Matches pages
- SavedProvider type updated with Sprint 5 fields (oleraScore, etc.)
- Guidance nudges added to reinforce "meet 3-5 providers" messaging
- Simplified copy throughout for 65+ users

### Phase 1: Onboarding Overlay Fixes (Critical)

| Task | Description | Status |
|------|-------------|--------|
| **LocationAutocomplete Integration** | Replaced free-text location inputs with LocationAutocomplete in all 3 location steps (family, organization, caregiver) | ✅ Complete |
| **Care Type Plain Language** | Replaced jargon labels with plain language (e.g., "Help with daily activities" instead of "Personal Care") | ✅ Complete |
| **Copy Simplification** | Reduced wordiness throughout onboarding wizard | ✅ Complete |

**Key Files Modified**:
- `components/Onboarding/OnboardingWizardOverlay.tsx` - Full LocationAutocomplete integration, plain language care types

### Phase 2: EmptyState Component Enhancement

| Enhancement | Description |
|-------------|-------------|
| **`guidanceMessage` prop** | Optional highlighted message box above CTAs (amber styling) |
| **`size` prop** | "large" variant for 65+ friendly sizing (bigger icons, text, buttons) |
| **`matches` variant** | New pre-built content for matches page empty state |

**Files Modified**:
- `components/UI/EmptyState.tsx` - Added new props and variant

### Phase 3: Saved Providers Page Polish

| Task | Description |
|------|-------------|
| **SavedProvider Type Fix** | Added Sprint 5 fields: oleraScore, priceDescription, claimed, hasMemoryCare, etc. |
| **PageHero Standardization** | Replaced inline hero with PageHero component |
| **EmptyState Integration** | Replaced verbose inline empty state with EmptyState component |
| **Guidance Nudge** | Added "Keep exploring! Experts recommend 3-5 providers" when <3 saved |

**Files Modified**:
- `app/saved/page.tsx` - Full polish with PageHero, EmptyState, guidance nudge

### Phase 4: Matches Page Polish

| Task | Description |
|------|-------------|
| **PageHero Standardization** | Replaced both hero variants with PageHero component |
| **EmptyState Integration** | Replaced verbose inline empty states with EmptyState component |
| **Guidance Nudge** | Added "Keep browsing! See 3-5 matches" when matches <5 |
| **Copy Simplification** | Removed wordy intro sections, reduced cognitive load |

**Files Modified**:
- `app/matches/page.tsx` - Full polish with PageHero, EmptyState, simplified content

### Issues Addressed

#### CTA Flow (Auth + Onboarding)

| ID | Issue | Status |
|----|-------|--------|
| A-077 | AM-1: Text alignment inconsistent | **Done** |
| A-078 | AM-2: Social auth buttons need wiring | **Deferred** (requires OAuth configuration) |
| A-079 | OB-1: Onboarding copy too wordy | **Done** |
| A-080 | OB-2: Free-text inputs should be dropdowns | **Done** (LocationAutocomplete) |
| A-081 | OB-3: Care type uses industry jargon | **Done** |
| A-082 | OB-4: Profile visibility toggle copy too heavy | **Done** |

#### Saved Providers

| ID | Issue | Status |
|----|-------|--------|
| A-097 | SP-1: Provider cards truncated and visually awkward | **Done** |
| A-098 | SP-2: "Schedule Interview" CTA redirects to provider page | **Done** |
| A-099 | SP-3: Empty state too wordy | **Done** |
| A-100 | SP-4: Empty state lacks clear guidance | **Done** |
| A-101 | SP-5: Provider cards show too much information | **Done** |
| A-102 | SP-6: Hero section is B- quality | **Done** |
| A-103 | SP-7: Sort by toggle may not be necessary | **Done** (kept, but streamlined) |

#### Matches Page

| ID | Issue | Status |
|----|-------|--------|
| A-104 | MA-1: Hero section distracting | **Done** |
| A-105 | MA-2: Page doesn't explain why matches matter | **Done** |
| A-106 | MA-3: Page feels overwhelming | **Done** |
| A-107 | MA-4: Design doesn't align with other pages | **Done** |
| A-108 | MA-5: Not optimized for 65+ audience | **Done** |

### Definition of Done

- [x] LocationAutocomplete integrated in all onboarding location inputs
- [x] EmptyState component enhanced with guidanceMessage, size, matches variant
- [x] PageHero used consistently on Saved and Matches pages
- [x] SavedProvider type includes Sprint 5 fields
- [x] Guidance nudges added to Saved (<3) and Matches (<5) pages
- [x] Copy simplified throughout for 65+ users
- [x] TypeScript compilation passes
- [x] All code committed and pushed

### Phase 5: Additional Polish (Post-Pressure Test)

| Task | Description |
|------|-------------|
| **HeroSection.tsx Removal** | Removed unused legacy component `components/Directory/HeroSection.tsx` |
| **Requests Page PageHero** | Updated `/requests` page to use PageHero and EmptyState components for consistency |

**Files Modified**:
- `components/Directory/HeroSection.tsx` - Deleted (unused)
- `app/requests/page.tsx` - Updated with PageHero and EmptyState

### Deferred Items

| Item | Reason | Recommended Sprint |
|------|--------|-------------------|
| A-078: Social auth wiring | Requires OAuth app configuration (Google, Apple, Facebook) | Infrastructure sprint |

### Handoff Note
Sprint 6 is complete. CTA flow, Saved, Matches, and Requests pages elevated to A+ quality with consistent components (PageHero, EmptyState, LocationAutocomplete), guidance nudges, and 65+ optimized copy. Removed unused HeroSection.tsx component. Social auth wiring deferred as it requires external OAuth configuration. Ready for Sprint 7 (Care Profile + Benefits).

---

## Sprint 7 — Completed ✓

**Date**: January 26, 2025
**Type**: Mixed Sprint (Care Profile + Benefits + Data Foundation)
**Focus**: Care Profile simplification, Benefits page alignment, care types source of truth, voice UI polish

### Overview

Sprint 7 addresses 13 original issues (A-109 to A-130) PLUS critical data foundation work discovered during pre-sprint audit:

**Critical Finding**: Benefits page uses care types that don't exist in Prisma schema, causing matching algorithm failures when families use Benefits Finder first.

### Pre-Sprint Audit Results

#### Care Types Inconsistency (CRITICAL)

**Prisma Schema (Source of Truth)**:
```prisma
enum CareType {
  COMPANION_CARE
  PERSONAL_CARE
  SKILLED_NURSING
  MEMORY_CARE
  HOSPICE_CARE
  RESPITE_CARE
  LIVE_IN_CARE
}
```

**Benefits Page (WRONG)**:
| Benefits Page Value | Prisma Enum | Status |
|---------------------|-------------|--------|
| PERSONAL_CARE | PERSONAL_CARE | ✓ Match |
| HOUSEHOLD_HELP | - | ✗ NOT IN SCHEMA |
| HEALTH_MANAGEMENT | - | ✗ NOT IN SCHEMA |
| COMPANIONSHIP | COMPANION_CARE | ✗ WRONG VALUE |
| FINANCIAL_HELP | - | ✗ NOT IN SCHEMA |
| MEMORY_CARE | MEMORY_CARE | ✓ Match |
| MOBILITY_HELP | - | ✗ NOT IN SCHEMA |

**Impact**: When family uses Benefits page first, invalid care types are saved, causing matching to fail.

#### Matching Algorithm Verification

**Family ↔ Provider (`/matches` page)**: ✓ Algorithm is sound - compares `profile.careTypes` with `provider.careTypesOffered`

**Caregiver ↔ Organization (`/api/caregiver/matches`)**: ✓ Algorithm is sound - compares `caregiver.careTypesOffered` with `org.careTypesOffered`

**Both work correctly IF data is consistent** — the problem is the Benefits page writing invalid data.

#### Provider Detail Page Regression Audit

✓ No regressions found. All Sprint 5 components (OleraScore, ContactInfoDisplay, TakedownRequestModal, ForOrganizationsSection) present and working.

#### Voice UI Status

✓ Voice UI present on Benefits page with "Voice input coming soon" label. User directive: Keep visible and polished as demo placeholder.

---

### Sprint 7 Phases

#### Phase 0: Data Foundation (MUST COME FIRST)

| Task | Description | Priority |
|------|-------------|----------|
| **Create `lib/careTypes.ts`** | Single source of truth for care types with labels, icons, descriptions | CRITICAL |
| **Update Benefits Page** | Replace local CARE_TYPES with import from `lib/careTypes.ts` | CRITICAL |
| **Update Onboarding Wizard** | Replace local CARE_TYPES with import from `lib/careTypes.ts` | CRITICAL |
| **Verify Matching** | Confirm both matching algorithms work with aligned data | CRITICAL |

**Care Types Constants Specification**:
```typescript
// lib/careTypes.ts
import { CareType } from "@prisma/client";

export const CARE_TYPE_CONFIG: Record<CareType, {
  label: string;           // Plain language label
  description: string;     // Longer description for tooltips/onboarding
  icon: string;            // Emoji icon
  familyLabel?: string;    // Alternative label for family-facing UI
}> = {
  PERSONAL_CARE: {
    label: "Personal Care",
    description: "Help with daily activities like bathing, dressing, and grooming",
    icon: "✋",
    familyLabel: "Help with daily activities",
  },
  COMPANION_CARE: {
    label: "Companion Care",
    description: "Companionship, conversation, and social support",
    icon: "👥",
    familyLabel: "Companionship and social support",
  },
  SKILLED_NURSING: {
    label: "Skilled Nursing",
    description: "Medical care from a licensed nurse",
    icon: "🏥",
    familyLabel: "Medical care from a nurse",
  },
  MEMORY_CARE: {
    label: "Memory Care",
    description: "Specialized support for memory conditions and dementia",
    icon: "🧠",
    familyLabel: "Memory or dementia support",
  },
  HOSPICE_CARE: {
    label: "Hospice Care",
    description: "Comfort-focused end-of-life care",
    icon: "💜",
    familyLabel: "End-of-life comfort care",
  },
  RESPITE_CARE: {
    label: "Respite Care",
    description: "Short-term relief for family caregivers",
    icon: "🔄",
    familyLabel: "Short-term relief for family caregivers",
  },
  LIVE_IN_CARE: {
    label: "Live-In Care",
    description: "Around-the-clock in-home care",
    icon: "🏠",
    familyLabel: "24/7 in-home care",
  },
};

// Helper to get all care types as array for forms
export const ALL_CARE_TYPES = Object.keys(CARE_TYPE_CONFIG) as CareType[];

// Helper to get care type options for select/checkbox components
export function getCareTypeOptions(useFamilyLabels = false) {
  return ALL_CARE_TYPES.map(type => ({
    value: type,
    label: useFamilyLabels
      ? CARE_TYPE_CONFIG[type].familyLabel || CARE_TYPE_CONFIG[type].label
      : CARE_TYPE_CONFIG[type].label,
    description: CARE_TYPE_CONFIG[type].description,
    icon: CARE_TYPE_CONFIG[type].icon,
  }));
}
```

#### Phase 1: Care Profile Page (`/care-profile`) — Issues A-109 to A-114

| ID | Issue | Severity | Resolution |
|----|-------|----------|------------|
| A-109 | CP-1: Page still too busy | CUT | Remove Active Conversations, Need Help, ProfileCompletionWidget. Keep: Calendar, Quick Stats, Quick Actions |
| A-110 | CP-2: Active conversations unnecessary | CUT | Remove section entirely (conversations in `/requests`) |
| A-111 | CP-3: "Need help" box unnecessary | PAPER CUT | Remove section |
| A-112 | CP-4: "Complete your profile" redundant | PAPER CUT | Remove widget (Edit Profile link in Quick Actions is sufficient) |
| A-113 | CP-5: "Welcome back" should use first name | PAPER CUT | Use `profile.lovedOneName` or user's first name |
| A-114 | CP-6: Calendar needs clearer engagement focus | CUT | Add guidance text, improve empty state |

**Target Architecture**:
- PageHero with user's name and quick stats
- Calendar as primary content (engagement-focused)
- Quick Actions (Edit Profile, Browse Providers, View Matches)
- Remove all clutter sections

#### Phase 2: Benefits Page (`/benefits`) — Issues A-124 to A-130

| ID | Issue | Severity | Resolution |
|----|-------|----------|------------|
| A-124 | BN-1: Dark background inconsistent | CUT | Align with site color system (use PageHero pattern) |
| A-125 | BN-2: Design heavy for 65+ | PAPER CUT | Simplify, larger text, clearer CTAs |
| A-126 | BN-3: "Start Benefits Finder" wrong destination | CUT | Route to Care Profile onboarding with benefits context |
| A-127 | BN-4: "Skip for now" unclear destination | CUT | Clear destination with explanation |
| A-128 | BN-5: Dual value proposition not clear | CUT | Explain: (1) Find benefits, (2) Improve matching |
| A-129 | BN-6: Copy needs simplification | PAPER CUT | Plain language, 3rd-4th grade reading level |
| A-130 | BN-7: LLM UI not fully developed | PAPER CUT | Keep Voice UI visible with "Voice coming soon" label |

**Benefits ↔ Care Profile Integration**:
- Benefits form IS Care Profile onboarding (not separate)
- When user fills Benefits form, data goes to FamilyProfile
- Care types must use Prisma enum (via `lib/careTypes.ts`)
- Form completion updates Care Profile, improving matching

#### Phase 3: Verification & Polish

| Task | Description |
|------|-------------|
| **Matching Verification** | Test that family created via Benefits gets correct matches |
| **Voice UI Polish** | Ensure "Voice coming soon" label is prominent and styled well |
| **Cross-Page Consistency** | Verify Care Profile and Benefits use same components (PageHero, EmptyState) |
| **TypeScript Compilation** | Ensure no type errors |

---

### Components to Create/Update

| Component | Purpose | Status |
|-----------|---------|--------|
| `lib/careTypes.ts` | Single source of truth for CareType enum with labels/icons | NEW |
| `app/care-profile/page.tsx` | Simplify to calendar-first, remove clutter | UPDATE |
| `app/benefits/page.tsx` | Align care types, simplify design, integrate with Care Profile | UPDATE |
| `components/Onboarding/OnboardingWizardOverlay.tsx` | Use `lib/careTypes.ts` instead of local constants | UPDATE |

---

### Handoff Note

Sprint 7 complete. Critical data foundation work done:
- Created `lib/careTypes.ts` as single source of truth for all CareType enum values
- Fixed Benefits page which was using invalid care types (HOUSEHOLD_HELP, COMPANIONSHIP, etc.) that didn't exist in Prisma schema
- Updated OnboardingWizardOverlay to use shared care types
- Care Profile page simplified: removed Active Conversations, Need Help, ProfileCompletionWidget
- Benefits page redesigned: light background, accessible design, clear dual value proposition, Voice UI preserved with "Coming Soon" badge
- Matching algorithm will now work correctly because all components use the same CareType enum

**Files Created**:
- `lib/careTypes.ts` - Single source of truth for care types

**Files Updated**:
- `app/benefits/page.tsx` - Aligned care types, redesigned entry state
- `app/care-profile/page.tsx` - Simplified to calendar-first design
- `components/Onboarding/OnboardingWizardOverlay.tsx` - Uses shared care types

---

### Definition of Done

**Data Foundation**:
- [x] `lib/careTypes.ts` created with all CareType enum values
- [x] Benefits page imports care types from `lib/careTypes.ts`
- [x] Onboarding wizard imports care types from `lib/careTypes.ts`
- [x] No local care type definitions remain (single source of truth)

**Care Profile Page**:
- [x] Active Conversations section removed
- [x] Need Help section removed
- [x] ProfileCompletionWidget removed
- [x] Calendar is primary focus with clear engagement guidance
- [x] Welcome message uses first name (lovedOneName or user's first name)
- [x] All A-109 through A-114 addressed

**Benefits Page**:
- [x] Care types aligned with Prisma schema
- [x] Design consistent with site (light background, accessible)
- [x] Voice UI visible with "Voice Coming Soon" badge
- [x] "Start Benefits Finder" routes correctly to form
- [x] Copy simplified for 65+ audience (larger text, clearer CTAs)
- [x] All A-124 through A-130 addressed

**Verification**:
- [x] Care types now use Prisma enum - matching will work correctly
- [x] TypeScript compilation passes
- [x] All code committed and pushed

### Sprint 7 Self-Critique Fixes (Follow-Up)

**Date**: January 26, 2025
**Commit**: `5825906`

Self-critique revealed 3 additional files needed updating:

| Task | Resolution |
|------|------------|
| **care-profile/edit local CARE_TYPES** | Replaced with `getCareTypeOptions(true)` from `lib/careTypes.ts` |
| **provider/profile/edit local CARE_TYPES** | Replaced with `getCareTypeOptions(false)` from `lib/careTypes.ts` |
| **Benefits Voice UI accessibility** | Added `role="region"`, `aria-label`, `aria-hidden`, `role="status"` for screen reader support |

**Data Foundation Status**: All files now use `lib/careTypes.ts` as single source of truth. No local CARE_TYPES definitions remain.

---

## Sprint 8 — In Progress

**Date**: January 27, 2025
**Type**: Deep Sprint (Provider Onboarding + Leads + Hiring Marketplace)
**Focus**: Ambitious, disciplined improvements to provider experience with A+ quality bar

### Core Purpose

Every change must serve this goal: **Providers clearly understand this is a place to meet with families and with each other to hire caregivers and get hired.**

### Quality Bar

Every change must:
1. **Clearly improve** clarity, usability, or outcomes
2. **Be intentional** — no autopilot fixes
3. **Serve the core purpose** — providers meet families, hire and get hired
4. **Meet A+ quality** — not "fixed" but "excellent"

---

### Phase 1: Provider Onboarding (A-131 to A-144)

**Outcome**: A provider completing onboarding understands exactly what they'll get and what to do next.

#### Global Issues (A-131 to A-134)

| ID | Issue | Intent |
|----|-------|--------|
| A-131 | PO-1: Purpose not explicit enough | Value proposition is unmistakable from the first screen |
| A-132 | PO-2: Core value not obvious | Provider understands: families find you + hiring marketplace access |
| A-133 | PO-3: "Individual Caregiver" label unclear | Clear labeling with brief description |
| A-134 | PO-4: Dual marketplace not introduced | Both subtypes understand their specific opportunity |

#### Care Organization Onboarding (A-135 to A-139)

| ID | Issue | Intent |
|----|-------|--------|
| A-135 | CO-1: Location uses free text | Structured location via LocationAutocomplete |
| A-136 | CO-2: Type of Care missing options | Complete care type options from `lib/careTypes.ts` |
| A-137 | CO-3: Type of Care should be multi-select | Checkbox selection, not radio |
| A-138 | CO-4: Profile visibility copy unclear | Simple, clear toggle explanations |
| A-139 | CO-5: Completion state weak | Celebration + clear next step + value shown |

#### Individual Caregiver Onboarding (A-140 to A-144)

| ID | Issue | Intent |
|----|-------|--------|
| A-140 | CG-1: Framing wrong — user is job-seeking | Reframe as "Find Care Work" |
| A-141 | CG-2: Wrong redirect after onboarding | Send to job-finding page, not generic dashboard |
| A-142 | CG-3: Fields focus on wrong things | Prioritize: availability, preferences, employers |
| A-143 | CG-4: Visibility explanation incomplete | Explain dual visibility: families + organizations |
| A-144 | CG-5: Language needs reframing | Job-seeker language throughout |

---

### Phase 2: Provider Leads (A-145 to A-152)

**Outcome**: A provider viewing leads knows exactly what to do and can act immediately.

| ID | Issue | Intent |
|----|-------|--------|
| A-145 | LP-1: CTAs unclear and weak | Specific, actionable CTAs per provider type |
| A-146 | LP-2: Page purpose unclear | Purpose obvious within 3 seconds |
| A-147 | LP-3: Filters UI oversized | Streamlined, no visual clutter |
| A-148 | LP-4: Duplicate sections | Single consolidated leads list |
| A-149 | LP-5: Cards visually weak | Consistent card pattern with trust signals |
| A-150 | LP-6: Hiring marketplace not surfaced | Visible link for orgs that also hire |
| A-151 | LP-7: Cards don't meet standard | Updated to use established components |
| A-152 | LP-8: "Save lead" is wrong CTA | Changed to "Respond" or "View Details" |

---

### Phase 3: Provider Profile Enhancement

**Outcome**: A provider landing on their profile knows what needs attention and where to go.

| Change | Intent |
|--------|--------|
| Priorities section | Surface what matters (lead count, pending items) |
| Subtype-aware content | Orgs see family inquiries; caregivers see job opportunities |
| Profile strength | Actionable guidance, not just percentage |
| Quick actions | Route to right place based on subtype |

---

### Phase 4: Lead Response Flow

**Outcome**: Responding to a lead is fast, professional, and guided.

| Change | Intent |
|--------|--------|
| Response templates | Providers don't start from blank |
| Context summary | Providers understand who they're responding to |
| Scheduling integration | Meeting can be proposed inline |
| Decline option | Professional exit for poor fits |

---

### Phase 5: Post-Onboarding Value Screen

**Outcome**: New providers see immediate evidence that the platform has demand.

| Change | Intent |
|--------|--------|
| Demand visibility | "X families looking in your area" |
| Subtype-specific | Orgs see family demand; caregivers see job demand |
| Clear next step | Route to profile completion or leads |

---

### Phase 6: Caregiver Job Experience

**Outcome**: Caregivers feel like they're using a job platform, not a generic provider directory.

| Change | Intent |
|--------|--------|
| Language | "Find Work", "Jobs for You", "Apply" |
| Job cards | Designed for job seekers |
| Application awareness | Status visibility where possible |

---

### Phase 7: Naming Consistency

**Outcome**: Same term everywhere for each concept.

| Change | Intent |
|--------|--------|
| Full audit | Page titles, breadcrumbs, nav, CTAs, empty states |
| Alignment | No semantic drift between surfaces |

---

### Dependencies (All Ready)

| Dependency | Status |
|------------|--------|
| LocationAutocomplete | ✅ Done (Sprint 4) |
| Care types constants | ✅ Done (`lib/careTypes.ts`) |
| PageHero | ✅ Done (Sprint 6) |
| EmptyState | ✅ Done (Sprint 6) |
| OleraScoreBadge | ✅ Done (Sprint 5) |

---

### Definition of Done

**Phase 1: Provider Onboarding**
- [ ] Value proposition unmistakable from first screen
- [ ] LocationAutocomplete in all location inputs
- [ ] Care types use `lib/careTypes.ts`
- [ ] Dual marketplace explained during onboarding
- [ ] Caregiver framing reoriented to job-seeking
- [ ] Completion state celebrates and directs to right destination
- [ ] All A-131 through A-144 addressed

**Phase 2: Provider Leads**
- [ ] Page purpose obvious within 3 seconds
- [ ] Cards use consistent pattern with trust signals
- [ ] CTAs are provider-type specific and actionable
- [ ] No duplicate sections or clutter
- [ ] Hiring marketplace surfaced for applicable providers
- [ ] All A-145 through A-152 addressed

**Phase 3: Provider Profile Enhancement**
- [ ] Priorities section shows lead count + links
- [ ] Subtype-aware content renders correctly
- [ ] Profile strength provides actionable guidance
- [ ] Quick actions route to correct destinations

**Phase 4: Lead Response Flow**
- [ ] Response templates available
- [ ] Context summary shown when responding
- [ ] Scheduling can be proposed inline
- [ ] Professional decline option exists

**Phase 5: Post-Onboarding Value**
- [ ] Demand visibility shown after completion
- [ ] Subtype-specific messaging
- [ ] Clear next step CTA

**Phase 6: Caregiver Job Experience**
- [ ] Job-seeker language throughout
- [ ] Job cards feel appropriate
- [ ] Application status visible where data exists

**Phase 7: Naming Consistency**
- [ ] All surfaces audited
- [ ] No semantic drift

**Quality Gates**
- [ ] TypeScript compilation passes
- [ ] No regressions in existing flows
- [ ] A+ quality check on each phase
- [ ] All code committed and pushed

---

### Safeguards

1. **Baseline before starting**: Document current state of key pages
2. **Incremental commits**: One logical unit per commit
3. **TypeScript check**: After each change
4. **Purpose validation**: Before merging, ask "Does this make the platform's purpose clearer?"
5. **Regression check**: Test existing flows after changes

---

### Implementation Order

1. **Phase 1: Provider Onboarding** (A-131 to A-144)
   - Read current state of onboarding pages
   - Implement value proposition and dual marketplace messaging
   - Update location inputs to use LocationAutocomplete
   - Reframe caregiver onboarding as job-seeking
   - Enhance completion states

2. **Phase 2: Provider Leads** (A-145 to A-152)
   - Read current state of leads page
   - Add clear page purpose/hero
   - Update card components and CTAs
   - Consolidate sections
   - Surface hiring marketplace link

3. **Phase 3: Provider Profile Enhancement**
   - Add priorities section with lead counts
   - Implement subtype-aware rendering
   - Add profile strength guidance

4. **Phase 4: Lead Response Flow**
   - Add response templates
   - Add context summary
   - Add scheduling integration
   - Add decline option

5. **Phase 5: Post-Onboarding Value Screen**
   - Create completion screen showing demand
   - Subtype-specific messaging
   - Clear next step routing

6. **Phase 6: Caregiver Job Experience**
   - Update language to job-seeker orientation
   - Improve job card design
   - Add application status visibility

7. **Phase 7: Naming Consistency Sweep**
   - Audit all surfaces
   - Align terminology
   - Final verification and commit

---

## Severity Classification

| Severity | Definition | Typical Effort | Example |
|----------|------------|----------------|---------|
| **GASH** | Requires first-principles redesign. Page is fundamentally broken or unfit for purpose. | 1-2 per sprint | Request page, Edit Care Profile, My Candidates |
| **CUT** | Significant fix needed. Functionality exists but UX/UI is poor or confusing. | 3-5 per sprint | Card redesigns, CTA standardization, hero overhauls |
| **PAPER CUT** | Polish item. Quick fix that improves quality without structural changes. | 10-20 per sprint | Copy edits, color fixes, spacing adjustments |

---

## GASH Pages (Require Full Redesign)

These 7 pages are rated C- or below and require first-principles redesigns, not incremental fixes:

| # | Page | Path | Rating | Primary Issues | Status |
|---|------|------|--------|----------------|--------|
| G-1 | Request / Engagement Page | `/requests/[id]` | C- | Auto-scroll, messaging-first instead of scheduling-first, no guidance | **Done** (Sprint 1) |
| G-2 | Edit Care Profile | `/care-profile/edit` | C-/C+ | **BUG: doesn't save**, survey not profile-builder, poor copy | **Done** (Sprint 2) |
| G-3 | Provider My Profile | `/provider/profile` | C- | Overbuilt, unfocused, not calendar-first | **Done** (Sprint 3) |
| G-4 | Edit Provider Profile | `/provider/profile/edit` | C- | No preview, wrong visibility model, not subtype-aware | **Done** (Sprint 3) |
| G-5 | Find Organizations (Caregiver) | `/providers/browse-organizations` | C- | Design overhaul needed, semantic drift, wrong hero | **Done** (Sprint 1) |
| G-6 | Hire Staff Request | `/provider/hire-staff/[id]` | C- | Severely underdeveloped, no structured prompts | Open |
| G-7 | My Candidates | `/provider/candidates` | C- | Unfinished, no pipeline view, no calendar, no data | Open |

**Treatment**: Each GASH page gets a dedicated mini-spec in `/docs/gash-specs/` before implementation begins.

---

## Master Issue Index

All 217 issues with immutable IDs, organized by execution phase.

### Phase 0: Critical Bugs (Fix Immediately)

| ID | Issue | Page | Severity | Status |
|----|-------|------|----------|--------|
| A-001 | EC-1: Final question redirects without saving | `/care-profile/edit` | GASH | **Done** (Sprint 1) |
| A-002 | HS-4: "View applications" routes to wrong page | `/provider/hire-staff` | CUT | **Done** (Sprint 1) |
| A-003 | DP-1: Duplicate browse pages for same function | Multiple | CUT | **Done** (Sprint 1) |

### Phase 1: Cross-Cutting Standards (Apply Before Page Fixes)

| ID | Issue | Source | Severity | Status |
|----|-------|--------|----------|--------|
| A-004 | CC-1: Reduce wordiness everywhere | Global | PAPER CUT | Open |
| A-005 | CC-2: Remove "Texas only" language | Global | PAPER CUT | Open |
| A-006 | CC-3: Logo incorrect | Global | PAPER CUT | Blocked |
| A-007 | CC-4: Canonical location system | Global | CUT | Open |
| A-008 | CC-5: Heart/save icon on all provider cards | Global | CUT | Open |
| A-009 | CC-6: Trust Score / Olera Score undefined | Global | CUT | Open |
| A-010 | CC-7: Pricing language standardization | Global | PAPER CUT | Open |
| A-011 | CC-8: Empty state hygiene | Global | CUT | Open |
| A-012 | CC-9: CTAs must be provider-type specific | Global | CUT | Open |
| A-013 | CC-10: Contact info gating | Global | CUT | Open |
| A-014 | CC-11: Plain-language care terminology | Global | PAPER CUT | Open |
| A-015 | CC-12: Dropdown-based inputs for data consistency | Global | CUT | Open |
| A-016 | CC-13: 3rd-4th grade reading level | Global | PAPER CUT | Open |
| A-017 | CC-14: Encourage 3-5 provider engagements | Global | CUT | Open |
| A-018 | CC-15: Engagement confirmation flow pattern | Global | CUT | Open |
| A-019 | CC-16: Core platform message consistency | Global | PAPER CUT | Open |
| A-020 | CC-17: Calendar as central engagement destination | Global | CUT | Open |
| A-021 | CC-18: Activity belongs in notifications | Global | CUT | Open |
| A-022 | CC-19: Preferred times and format in engagement flow | Global | CUT | Open |
| A-023 | CC-20: Care Profile as single source of truth | Global | CUT | Open |
| A-024 | CC-21: Profile-builder mental model | Global | GASH | Open |
| A-025 | CC-22: Dual value of Care Profile | Global | PAPER CUT | Open |
| A-026 | CC-23: Provider mode purpose clarity | Global | PAPER CUT | Open |
| A-027 | CC-24: Provider visibility = lever for demand/supply | Global | PAPER CUT | Open |
| A-028 | CC-25: Dual marketplace awareness | Global | PAPER CUT | Open |
| A-029 | CC-26: Card design consistency | Global | CUT | Open |
| A-030 | CC-27: Provider story ladder | Global | PAPER CUT | Open |
| A-031 | CC-28: One unified card system | Global | CUT | Open |
| A-032 | CC-29: Unified color system | Global | CUT | Open |
| A-033 | CC-30: Matching algorithm consistency | Global | CUT | Open |
| A-034 | CC-31: Eliminate duplicate browse pages | Global | CUT | Open |
| A-035 | CC-32: Hiring marketplace core loop | Global | PAPER CUT | Open |
| A-036 | CC-33: Apply flow must explain profile sharing | Global | PAPER CUT | Open |
| A-037 | CC-34: All request pages must be consistent | Global | CUT | Open |
| A-038 | CC-35: Organization hiring goal | Global | PAPER CUT | Open |
| A-039 | CC-36: Separate hiring calendar from family calendar | Global | CUT | Open |

### Phase 2: Homepage (`/`)

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-040 | HP-1: No provider cards on homepage | CUT | Open |
| A-041 | HP-2: Free-text city/ZIP search | CUT | Open |
| A-042 | HP-3: Hero too text-heavy | PAPER CUT | Open |
| A-043 | HP-4: Search bar takes too much vertical space | PAPER CUT | Open |
| A-044 | HP-5: Search input text not visually centered | PAPER CUT | Open |
| A-045 | HP-6: Doesn't support both user modes | CUT | Open |

### Phase 3: Browse Page (`/browse`)

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-046 | BR-1: Filter state doesn't persist from homepage | CUT | Open |
| A-047 | BR-2: Quick filters + filter bar consume too much space | PAPER CUT | Open |
| A-048 | BR-3: Results summary not context-aware | PAPER CUT | Open |
| A-049 | BR-4: No guidance for unsure users | CUT | Open |
| A-050 | BR-5: No save/heart icon on provider cards | CUT | Open |
| A-051 | BR-6: Map pop-up cards underdeveloped | CUT | Open |
| A-052 | BR-7: Map doesn't respond to location state | CUT | Open |

### Phase 4: Provider Detail Pages (`/providers/[id]`)

#### Independent Caregiver

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-053 | IC-1: "Request detailed pricing" does nothing | CUT | Open |
| A-054 | IC-2: Contact info visible before engagement | CUT | Open |
| A-055 | IC-3: Single image only | PAPER CUT | Open |
| A-056 | IC-4: Pricing tooltips lack explanation | PAPER CUT | Open |
| A-057 | IC-5: Trust/Olera Score undefined | CUT | Open |
| A-058 | IC-6: CTA copy too wordy | PAPER CUT | Open |
| A-059 | IC-7: Sticky nav missing sections | PAPER CUT | Open |
| A-060 | IC-8: Service area vs location redundant | PAPER CUT | Open |
| A-061 | IC-9: No availability section | CUT | Open |
| A-062 | IC-10: No employer-facing view | CUT | Open |
| A-063 | IC-11: Empty sections still render | PAPER CUT | Open |

#### Home Care Agency

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-064 | HC-1: "Request detailed pricing" CTA lacks guidance | CUT | Open |
| A-065 | HC-2: "How it works" section too wordy | PAPER CUT | Open |
| A-066 | HC-3: No real caregiver profiles | PAPER CUT | Open |
| A-067 | HC-4: Pricing language says "estimated" | PAPER CUT | Open |
| A-068 | HC-5: Service area definition unclear | PAPER CUT | Open |
| A-069 | HC-6: Trust score undefined | CUT | Open |
| A-070 | HC-7: Reviews section needs seed data | PAPER CUT | Open |

#### Senior Living / Facility

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-071 | SL-1: "Live here" section unclear | PAPER CUT | Open |
| A-072 | SL-2: Image categorization missing | CUT | Open |
| A-073 | SL-3: Pricing language says "estimated" | PAPER CUT | Open |
| A-074 | SL-4: No "last updated" indicator | PAPER CUT | Open |
| A-075 | SL-5: Empty sections still render | PAPER CUT | Open |
| A-076 | SL-6: CTA clarity | PAPER CUT | Open |

### Phase 5: CTA Submission Flow (Auth + Onboarding) — ✓ COMPLETED (Sprint 6)

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-077 | AM-1: Text alignment inconsistent | PAPER CUT | **Done** (Sprint 6) |
| A-078 | AM-2: Social auth buttons need wiring | CUT | Deferred |
| A-079 | OB-1: Onboarding copy too wordy | PAPER CUT | **Done** (Sprint 6) |
| A-080 | OB-2: Free-text inputs should be dropdowns | CUT | **Done** (Sprint 6) |
| A-081 | OB-3: Care type uses industry jargon | PAPER CUT | **Done** (Sprint 6) |
| A-082 | OB-4: Profile visibility toggle copy too heavy | PAPER CUT | **Done** (Sprint 6) |

### Phase 6: Request Page (`/requests/[id]`) — GASH ✓ COMPLETED

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-083 | RQ-1: Auto-scroll to messaging is disorienting | GASH | **Done** (Sprint 1) |
| A-084 | RQ-2: First message is blank/contentless | GASH | **Done** (Sprint 1) |
| A-085 | RQ-3: Page overemphasizes conversation | GASH | **Done** (Sprint 1) |
| A-086 | RQ-4: No guidance to continue engaging providers | GASH | **Done** (Sprint 1) |
| A-087 | RQ-5: Scheduling not centered as primary action | GASH | **Done** (Sprint 1) |
| A-088 | RQ-6: Quick replies overwhelming | CUT | **Done** (Sprint 1) |
| A-089 | RQ-7: Message composer overly complex | CUT | **Done** (Sprint 1) |
| A-090 | RQ-8: Unnecessary icons in messaging | PAPER CUT | **Done** (Sprint 1) |
| A-091 | RQ-9: Copy too complex | PAPER CUT | **Done** (Sprint 1) |
| A-092 | RQ-10: "View Provider" opens in same tab | PAPER CUT | **Done** (Sprint 1) |
| A-093 | RQ-11: "View Provider" shows wrong CTA | CUT | **Done** (Sprint 1) |
| A-094 | RQ-12: "While you wait" sections underdeveloped | CUT | **Done** (Sprint 1) |
| A-095 | RQ-13: Contact information section underdeveloped | CUT | **Done** (Sprint 1) |
| A-096 | RQ-14: Page difficult for 65+ users | GASH | **Done** (Sprint 1) |

### Phase 7: Saved Providers (`/saved`) — ✓ COMPLETED (Sprint 6)

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-097 | SP-1: Provider cards truncated and visually awkward | CUT | **Done** (Sprint 6) |
| A-098 | SP-2: "Schedule Interview" CTA redirects to provider page | CUT | **Done** (Sprint 6) |
| A-099 | SP-3: Empty state too wordy | PAPER CUT | **Done** (Sprint 6) |
| A-100 | SP-4: Empty state lacks clear guidance | CUT | **Done** (Sprint 6) |
| A-101 | SP-5: Provider cards show too much information | PAPER CUT | **Done** (Sprint 6) |
| A-102 | SP-6: Hero section is B- quality | PAPER CUT | **Done** (Sprint 6) |
| A-103 | SP-7: Sort by toggle may not be necessary | PAPER CUT | **Done** (Sprint 6) |

### Phase 8: Matches Page (`/matches`) — ✓ COMPLETED (Sprint 6)

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-104 | MA-1: Hero section distracting | CUT | **Done** (Sprint 6) |
| A-105 | MA-2: Page doesn't explain why matches matter | CUT | **Done** (Sprint 6) |
| A-106 | MA-3: Page feels overwhelming | CUT | **Done** (Sprint 6) |
| A-107 | MA-4: Design doesn't align with other pages | CUT | **Done** (Sprint 6) |
| A-108 | MA-5: Not optimized for 65+ audience | PAPER CUT | **Done** (Sprint 6) |

### Phase 9: Care Profile (`/care-profile`) — COMPLETED ✓

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-109 | CP-1: Page still too busy and overwhelming | CUT | **Done** (Sprint 7) |
| A-110 | CP-2: Active conversations section likely unnecessary | CUT | **Done** (Sprint 7) |
| A-111 | CP-3: "Need help" box may be unnecessary | PAPER CUT | **Done** (Sprint 7) |
| A-112 | CP-4: "Complete your profile" box at bottom is redundant | PAPER CUT | **Done** (Sprint 7) |
| A-113 | CP-5: "Welcome back" should use first name | PAPER CUT | **Done** (Sprint 7) |
| A-114 | CP-6: Calendar needs clearer engagement focus | CUT | **Done** (Sprint 7) |

### Phase 10: Edit Care Profile (`/care-profile/edit`) — GASH ✓ COMPLETED

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-115 | EC-2: Feels like survey, not profile builder | GASH | **Done** (Sprint 2) |
| A-116 | EC-3: Questions too long and poorly written | GASH | **Done** (Sprint 2) |
| A-117 | EC-4: Hero section takes too much vertical space | CUT | **Done** (Sprint 2) |
| A-118 | EC-5: Progress indicators too wide | PAPER CUT | **Done** (Sprint 2) |
| A-119 | EC-6: Questions poorly fitted to viewport | CUT | **Done** (Sprint 2) |
| A-120 | EC-7: Users don't understand profile's value | GASH | **Done** (Sprint 2) |
| A-121 | EC-8: No preview of live profile | GASH | **Done** (Sprint 2) |
| A-122 | EC-9: Privacy controls not clearly explained | CUT | **Done** (Sprint 2) |
| A-123 | EC-10: Profile photo and first name not encouraged | PAPER CUT | **Done** (Sprint 2) |

### Phase 11: Benefits Page (`/benefits`) — COMPLETED ✓

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-124 | BN-1: Dark background may not align with site design | CUT | **Done** (Sprint 7) |
| A-125 | BN-2: Design and wording heavy for 65+ audience | PAPER CUT | **Done** (Sprint 7) |
| A-126 | BN-3: "Start Benefits Finder" goes to wrong destination | CUT | **Done** (Sprint 7) |
| A-127 | BN-4: "Skip for now" leads to unclear destination | CUT | **Done** (Sprint 7) |
| A-128 | BN-5: Dual value proposition not clear | CUT | **Done** (Sprint 7) |
| A-129 | BN-6: Copy needs simplification | PAPER CUT | **Done** (Sprint 7) |
| A-130 | BN-7: LLM UI not fully developed | PAPER CUT | **Done** (Sprint 7) |

### Phase 12: Provider Onboarding (`/provider/onboarding`)

#### Global

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-131 | PO-1: Purpose not explicit enough | CUT | Open |
| A-132 | PO-2: Core value not obvious | CUT | Open |
| A-133 | PO-3: "Individual Caregiver" label may be unclear | PAPER CUT | Open |
| A-134 | PO-4: Dual marketplace not introduced | CUT | Open |

#### Care Organization

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-135 | CO-1: Location uses free text | CUT | Open |
| A-136 | CO-2: Type of Care missing "Home Health" | PAPER CUT | Open |
| A-137 | CO-3: Type of Care should allow "select all that apply" | PAPER CUT | Open |
| A-138 | CO-4: Profile visibility copy unclear | PAPER CUT | Open |
| A-139 | CO-5: "You're all set" state could be stronger | PAPER CUT | Open |

#### Individual Caregiver

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-140 | CG-1: Framing is wrong — user is looking for a job | CUT | Open |
| A-141 | CG-2: After onboarding, caregivers land on wrong page | CUT | Open |
| A-142 | CG-3: Fields focus on wrong things | CUT | Open |
| A-143 | CG-4: Profile visibility explanation incomplete | PAPER CUT | Open |
| A-144 | CG-5: Onboarding language should be reframed | PAPER CUT | Open |

### Phase 13: Provider Leads (`/provider/leads`)

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-145 | LP-1: CTAs unclear and weak | CUT | Open |
| A-146 | LP-2: Page doesn't communicate its purpose | CUT | Open |
| A-147 | LP-3: Filters UI oversized | PAPER CUT | Open |
| A-148 | LP-4: Duplicate sections | PAPER CUT | Open |
| A-149 | LP-5: Cards visually weak and inconsistent | CUT | Open |
| A-150 | LP-6: Hiring marketplace not surfaced | CUT | Open |
| A-151 | LP-7: Matched cards don't meet gold standard | CUT | Open |
| A-152 | LP-8: CTA says "Save lead" — incorrect | CUT | Open |

### Phase 14: Find Organizations — Caregiver (`/provider/organizations`)

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-153 | FO-1: Cards are missing or underdeveloped | CUT | Open |
| A-154 | FO-2: CTAs missing or unclear | CUT | Open |
| A-155 | FO-3: Page may not exist or is hard to find | CUT | Open |
| A-156 | FO-4: Page naming may be unclear | PAPER CUT | Open |
| A-157 | FO-5: Hero color blue, inconsistent | CUT | Open |
| A-158 | FO-6: Hero takes far too much vertical space | CUT | Open |
| A-159 | FO-7: "My Applications" introduces semantic drift | CUT | Open |
| A-160 | FO-8: Purpose not explicit | CUT | Open |
| A-161 | FO-9: Design feels unfinished | CUT | Open |
| A-162 | FO-10: Cards must follow gold standard | CUT | Open |
| A-163 | FO-11: CTAs should be "Apply now" | CUT | Open |

### Phase 15: Provider Requests (`/provider/requests`)

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-164 | PR-1: Yet another new card style | CUT | Open |
| A-165 | PR-2: "View profile" is wrong CTA | CUT | Open |
| A-166 | PR-3: Too much vertical space in header | PAPER CUT | Open |
| A-167 | PR-4: Color too dark, inconsistent | CUT | Open |
| A-168 | PR-5: "35% match" badge needs verification | CUT | Open |
| A-169 | PR-6: Inconsistent color usage | PAPER CUT | Open |
| A-170 | PR-7: Need more explicit guidance | CUT | Open |

### Phase 16: Provider My Profile (`/provider/profile`) — GASH ✓ COMPLETED

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-171 | PP-1: Page doesn't focus on what matters | GASH | **Done** (Sprint 3) |
| A-172 | PP-2: "Complete your profile" widget redundant | CUT | **Done** (Sprint 3) |
| A-173 | PP-3: Inconsistent hero/header styling | CUT | **Done** (Sprint 3) |
| A-174 | PP-4: Poor color choices | CUT | **Done** (Sprint 3) |
| A-175 | PP-5: Quick actions irrelevant | CUT | **Done** (Sprint 3) |
| A-176 | PP-6: Performance insights unnecessary | CUT | **Done** (Sprint 3) |
| A-177 | PP-7: Request activity and recent activity confusing | CUT | **Done** (Sprint 3) |
| A-178 | PP-8: Provider subtype not shaping content | CUT | **Done** (Sprint 3) |

### Phase 17: Edit Provider Profile (`/provider/profile/edit`) — GASH ✓ COMPLETED

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-179 | EP-1: Visibility toggles incorrect | GASH | **Done** (Sprint 3) |
| A-180 | EP-2: No live preview mode | GASH | **Done** (Sprint 3) |
| A-181 | EP-3: Page doesn't explain why filling out matters | GASH | **Done** (Sprint 3) |
| A-182 | EP-4: Profile fields not subtype-specific | CUT | **Done** (Sprint 3) |
| A-183 | EP-5: Fields not clearly optional vs required | CUT | **Done** (Sprint 3) |
| A-184 | EP-6: Fields not framed around value | CUT | **Done** (Sprint 3) |
| A-185 | EP-7: No distinction between minimum viable and enrichment | CUT | **Done** (Sprint 3) |
| A-186 | EP-8: Page feels underdeveloped | CUT | **Done** (Sprint 3) |

### Phase 18: My Opportunities — Caregiver (`/provider/opportunities`)

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-187 | MO-1: Hero too large, dark green inconsistent | CUT | Open |
| A-188 | MO-2: "My Opportunities" may not be intuitive | CUT | Open |
| A-189 | MO-3: Cards must match gold standard | CUT | Open |
| A-190 | MO-4: Need "Apply now" or "Schedule interview" CTAs | CUT | Open |
| A-191 | MO-5: Should guide users toward interviews | CUT | Open |

### Phase 19: Caregiver Browse Organizations (`/caregiver/browse-organizations`)

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-192 | CB-1: Cards not gold standard | CUT | Open |
| A-193 | CB-2: "View opportunities" is unclear CTA | CUT | Open |
| A-194 | CB-3: Semantic drift across pages | PAPER CUT | Open |

### Phase 20: Organization Detail / Apply Flow (`/caregiver/browse-organizations/[id]`)

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-195 | OA-1: Page not delightful or clear | CUT | Open |
| A-196 | OA-2: Doesn't explain profile sharing | CUT | Open |
| A-197 | OA-3: Doesn't explain what org will see | CUT | Open |
| A-198 | OA-4: Doesn't explain goal is interview scheduling | CUT | Open |
| A-199 | OA-5: No guidance to improve profile completeness | PAPER CUT | Open |
| A-200 | OA-6: No guidance to apply to more orgs | PAPER CUT | Open |
| A-201 | OA-7: No reinforcement of core loop | PAPER CUT | Open |

### Phase 21: Hire Care Staff — Organization (`/provider/hire-staff`)

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-202 | HS-1: Purple hero/header inconsistent | CUT | Open |
| A-203 | HS-2: Hero takes excessive vertical space | CUT | Open |
| A-204 | HS-3: "View applications" is incorrect terminology | PAPER CUT | Open |
| A-205 | HS-5: Caregiver cards need gold standard | CUT | Open |
| A-206 | HS-6: Overall presentation feels disconnected | CUT | Open |

### Phase 22: Hire Staff Request (`/provider/hire-staff/[id]`) — GASH

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-207 | HR-1: Page severely underdeveloped | GASH | Open |
| A-208 | HR-2: No clear framing for interview request | GASH | Open |
| A-209 | HR-3: Blank message field instead of structured prompts | GASH | Open |
| A-210 | HR-4: No explicit confirmation of next steps | GASH | Open |
| A-211 | HR-5: No inline rendering of caregiver profile | CUT | Open |
| A-212 | HR-6: No ability to open full caregiver profile | PAPER CUT | Open |
| A-213 | HR-7: Doesn't support org hiring goal | CUT | Open |
| A-214 | HR-8: Disconnected from platform engagement flows | CUT | Open |

### Phase 23: My Candidates (`/provider/candidates`) — GASH

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-215 | MC-1: No matches or candidate cards visible | GASH | Open |
| A-216 | MC-2: Page feels unfinished and outdated | GASH | Open |
| A-217 | MC-3: Doesn't communicate what user should do next | GASH | Open |
| A-218 | MC-4: Doesn't reinforce core purpose | GASH | Open |
| A-219 | MC-5: No pipeline dashboard view | GASH | Open |
| A-220 | MC-6: No dedicated calendar/schedule view | GASH | Open |
| A-221 | MC-7: No seeded demo data | CUT | Open |

---

## Sprint Structure

### Sprint Template

```
Sprint [N]: [Theme]
Duration: [X days]
Type: Deep Sprint | Polish Sprint | Mixed Sprint

Goals:
- [ ] Goal 1
- [ ] Goal 2

Issues:
| ID | Description | Severity | Owner | Status |
|----|-------------|----------|-------|--------|
| A-XXX | ... | ... | ... | Open → In Progress → Done |

QA Gate:
- [ ] All issues verified on deployed preview
- [ ] No regressions introduced
- [ ] Meets design standards (see /docs/design-standards.md)

Rollover (if any):
| ID | Reason |
|----|--------|
```

### Recommended Sprint Sequence

**Sprint 1: Critical Bugs + Request Page GASH**
- Type: Deep Sprint
- A-001 (EC-1 save bug)
- A-002 (HS-4 wrong routing)
- A-003 (DP-1 duplicate pages)
- G-1 (Request page redesign)

**Sprint 2: Edit Care Profile GASH + Global Standards Foundation**
- Type: Deep Sprint
- G-2 (Edit Care Profile redesign)
- A-007, A-031, A-032 (Location system, card system, color system)

**Sprint 3: Provider Profile Pages GASH**
- Type: Deep Sprint
- G-3 (Provider My Profile)
- G-4 (Edit Provider Profile)
- **CRITICAL**: Edit Provider Profile must reference Edit Care Profile patterns (see design-standards.md §0)

**Sprint 4: Homepage + Browse Polish**
- Type: Polish Sprint
- A-040 through A-052 (All homepage and browse issues)

**Sprint 5: Provider Detail Pages**
- Type: Mixed Sprint
- A-053 through A-076 (All provider detail issues)

**Sprint 6: CTA Flow + Saved + Matches**
- Type: Mixed Sprint
- A-077 through A-108 (Auth, onboarding, saved, matches)

**Sprint 7: Care Profile + Benefits + Data Foundation**
- Type: Mixed Sprint
- A-109 through A-130
- **NEW**: Care types source of truth (lib/careTypes.ts)
- **NEW**: Benefits page care types alignment with Prisma schema

**Sprint 8: Provider Onboarding + Leads** — PLANNED
- Type: Mixed Sprint
- A-131 through A-152 (22 issues)
- Focus: Improve provider onboarding flow, fix leads page, integrate LocationAutocomplete

**Sprint 9: Hiring Marketplace (Caregiver Side)**
- Type: Deep Sprint
- G-5 (Find Organizations GASH)
- A-153 through A-201

**Sprint 10: Hiring Marketplace (Organization Side)**
- Type: Deep Sprint
- G-6 (Hire Staff Request GASH)
- G-7 (My Candidates GASH)
- A-202 through A-221

---

## Status Tracking

### Status Definitions

| Status | Meaning |
|--------|---------|
| Open | Not started |
| In Progress | Actively being worked on |
| In Review | Implementation complete, awaiting review |
| Done | Verified and deployed |
| Blocked | Cannot proceed, dependency or question |
| Deferred | Intentionally postponed |

### Status Change Log Template

When updating status, add entry here:

```
[Date] A-XXX: Open → In Progress (started by [name/session])
[Date] A-XXX: In Progress → Done (verified on preview, commit abc123)
```

---

## Verification Checklist

Before marking any issue "Done":

- [ ] Implementation matches issue description
- [ ] No regressions introduced
- [ ] Tested on deployed preview (not just local)
- [ ] Meets design standards (`/docs/design-standards.md`)
- [ ] 65+ accessibility considered (large text, simple language, clear CTAs)
- [ ] Mobile responsive (if applicable)

---

## Handoff Protocol

When switching sessions or handing off work:

1. **Update this file** with current status of all in-progress issues
2. **Add status change log entries** for any status changes made
3. **Note any blockers or open questions** in the relevant issue's Notes field
4. **Commit and push** all changes before ending session
5. **Reference commit hash** in handoff notes

New session should:
1. Read `/docs/page-by-page-audit.md` for full context
2. Read this file for execution status
3. Read `/docs/design-standards.md` for implementation guidelines
4. Check git log for recent commits
5. Continue from current sprint status
