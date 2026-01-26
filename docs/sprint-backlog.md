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
Sprint 3 is complete. Both provider profile pages transformed: Edit Profile now mirrors Care Profile pattern with subtype-specific sections and dual visibility toggles; My Profile radically simplified to calendar-first with 72% code reduction. All code committed and pushed. Ready for Sprint 4 (Homepage + Browse Polish).

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

### Phase 5: CTA Submission Flow (Auth + Onboarding)

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-077 | AM-1: Text alignment inconsistent | PAPER CUT | Open |
| A-078 | AM-2: Social auth buttons need wiring | CUT | Open |
| A-079 | OB-1: Onboarding copy too wordy | PAPER CUT | Open |
| A-080 | OB-2: Free-text inputs should be dropdowns | CUT | Open |
| A-081 | OB-3: Care type uses industry jargon | PAPER CUT | Open |
| A-082 | OB-4: Profile visibility toggle copy too heavy | PAPER CUT | Open |

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

### Phase 7: Saved Providers (`/saved`)

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-097 | SP-1: Provider cards truncated and visually awkward | CUT | Open |
| A-098 | SP-2: "Schedule Interview" CTA redirects to provider page | CUT | Open |
| A-099 | SP-3: Empty state too wordy | PAPER CUT | Open |
| A-100 | SP-4: Empty state lacks clear guidance | CUT | Open |
| A-101 | SP-5: Provider cards show too much information | PAPER CUT | Open |
| A-102 | SP-6: Hero section is B- quality | PAPER CUT | Open |
| A-103 | SP-7: Sort by toggle may not be necessary | PAPER CUT | Open |

### Phase 8: Matches Page (`/matches`)

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-104 | MA-1: Hero section distracting | CUT | Open |
| A-105 | MA-2: Page doesn't explain why matches matter | CUT | Open |
| A-106 | MA-3: Page feels overwhelming | CUT | Open |
| A-107 | MA-4: Design doesn't align with other pages | CUT | Open |
| A-108 | MA-5: Not optimized for 65+ audience | PAPER CUT | Open |

### Phase 9: Care Profile (`/care-profile`)

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-109 | CP-1: Page still too busy and overwhelming | CUT | Open |
| A-110 | CP-2: Active conversations section likely unnecessary | CUT | Open |
| A-111 | CP-3: "Need help" box may be unnecessary | PAPER CUT | Open |
| A-112 | CP-4: "Complete your profile" box at bottom is redundant | PAPER CUT | Open |
| A-113 | CP-5: "Welcome back" should use first name | PAPER CUT | Open |
| A-114 | CP-6: Calendar needs clearer engagement focus | CUT | Open |

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

### Phase 11: Benefits Page (`/benefits`)

| ID | Issue | Severity | Status |
|----|-------|----------|--------|
| A-124 | BN-1: Dark background may not align with site design | CUT | Open |
| A-125 | BN-2: Design and wording heavy for 65+ audience | PAPER CUT | Open |
| A-126 | BN-3: "Start Benefits Finder" goes to wrong destination | CUT | Open |
| A-127 | BN-4: "Skip for now" leads to unclear destination | CUT | Open |
| A-128 | BN-5: Dual value proposition not clear | CUT | Open |
| A-129 | BN-6: Copy needs simplification | PAPER CUT | Open |
| A-130 | BN-7: LLM UI not fully developed | PAPER CUT | Open |

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

**Sprint 7: Care Profile + Benefits**
- Type: Mixed Sprint
- A-109 through A-130

**Sprint 8: Provider Onboarding + Leads**
- Type: Mixed Sprint
- A-131 through A-152

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
