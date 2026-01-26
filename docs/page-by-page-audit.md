# Page-by-Page Audit: B- to A+ Transformation

**Started**: January 2025
**Goal**: Comprehensive audit of all pages to achieve best-in-class user experience

---

## Category Tags Reference

| Tag | Meaning |
|-----|---------|
| `UX` | Flow, navigation, interaction design |
| `COPY` | Messaging, clarity, tone |
| `VISUAL` | Styling, spacing, consistency |
| `DATA` | What's displayed, missing fields, seed data |
| `LOGIC` | Behavioral bugs, incorrect states |
| `CTA` | Call-to-action clarity, button placement |
| `GUIDANCE` | Helping users understand what to do next |

---

## Cross-Cutting Issues (Apply Site-Wide)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| CC-1 | **Reduce wordiness everywhere** — Radically simplify copy, use plain language for users with limited reading ability | `COPY` | Open |
| CC-2 | **Remove "Texas only" / "expanding nationwide" language** — Platform is now nationwide | `COPY` | Open |
| CC-3 | **Logo incorrect** — Replace with correct full bird logo site-wide (awaiting screenshot) | `VISUAL` | Blocked |
| CC-4 | **Canonical location system** — Eliminate free-text city/ZIP; implement controlled select from single source of truth for providers, users, search, filtering | `LOGIC` `DATA` | Open |
| CC-5 | **Heart/save icon on all provider cards** — Users should be able to save providers directly from any card (browse, homepage, map popups, etc.). Standard pattern site-wide. | `UX` `CTA` | Open |
| CC-6 | **Trust Score / Olera Score undefined** — Scoring systems lack clear definitions. Must explain: what goes into each score, how they differ, how users should interpret them. Consistent across all provider types. | `UX` `GUIDANCE` | Open |
| CC-7 | **Pricing language standardization** — Use "Starting at" instead of "estimated pricing" site-wide. If no pricing exists, show a well-designed empty state. | `COPY` `UX` | Open |
| CC-8 | **Empty state hygiene** — Sections with no data should not render, or show intentional helpful empty states. No blank/broken sections. | `UX` `VISUAL` | Open |
| CC-9 | **CTAs must be provider-type specific and engagement-oriented** — CTAs should match provider type: "Schedule Tour" (facilities), "Schedule Consultation" (home care), "Schedule Interview" (caregivers). No generic "View details". | `CTA` `UX` | Open |
| CC-10 | **Contact info gating** — Personal contact details should not be visible until mutual engagement acceptance. Privacy-first approach. | `LOGIC` `UX` | Open |
| CC-11 | **Plain-language care terminology** — Replace industry jargon (e.g., "personal care", "skilled nursing") with plain language a 65+ user understands: "Help at home", "Help after hospital discharge", "Assisted living", "Full-time nursing care", "Help with daily activities". | `COPY` `UX` | Open |
| CC-12 | **Dropdown-based inputs for data consistency** — Eliminate free-text inputs where possible. Use dropdowns/autocomplete for: who needs care, city/state, care types. Ensures data quality and search accuracy. | `LOGIC` `DATA` | Open |
| CC-13 | **3rd–4th grade reading level** — All copy site-wide should be written at a 3rd–4th grade reading level. Users should never have to guess what happened, what to do next, or what success looks like. | `COPY` | Open |
| CC-14 | **Encourage 3–5 provider engagements** — Families should be explicitly guided to engage multiple providers (3–5 is normal in senior care). Pages should encourage continued browsing, not feel like dead ends. | `GUIDANCE` `UX` | Open |
| CC-15 | **Engagement confirmation flow pattern** — When user has a profile, clicking "Schedule [X]" should NOT redirect to provider page. Instead, trigger confirmation: "Would you like to share your profile and request a meeting?" This pattern should be consistent site-wide. | `UX` `CTA` | Open |
| CC-16 | **Core platform message consistency** — The platform's core message must be reinforced everywhere: "Meet with 3–5 providers to find the right fit." Olera helps users submit engagements, share info, schedule/track meetings, and compare providers. This mantra guides copy, layout, CTAs, and empty states. | `COPY` `GUIDANCE` | Open |
| CC-17 | **Calendar as central engagement destination** — The calendar should be the core focus of the user journey, clearly showing: scheduled engagements, pending requests, upcoming meetings (virtual or in-person). This is where users track and manage all engagements. | `UX` `GUIDANCE` | Open |
| CC-18 | **Activity belongs in notifications, not scattered sections** — Active conversations and activity logs should live in a centralized notifications feed (top nav icon), not duplicated across multiple pages. | `UX` | Open |
| CC-19 | **Preferred times and format in engagement flow** — Throughout request and scheduling flows, users should be encouraged to share preferred times and format (virtual vs in-person). | `UX` `DATA` | Open |
| CC-20 | **Care Profile as single source of truth** — Care Profile must be the canonical data source for: provider matching, benefits matching, engagement scheduling, onboarding data, benefits finder inputs. One profile, editable from multiple entry points. No duplicate data entry, no conflicting flows. | `DATA` `LOGIC` | Open |
| CC-21 | **Profile-builder mental model (not survey)** — Profile creation should feel like building a Facebook/Airbnb profile, not answering a form. Users should see what their profile looks like, edit inline, and understand they're creating something reusable and valuable. | `UX` `GUIDANCE` | Open |
| CC-22 | **Dual value of Care Profile** — The site does two things with the same profile: 1) Help families meet 3–5 providers, 2) Find benefits to help pay for care. This dual value should be unmistakable everywhere the profile is referenced. | `GUIDANCE` `COPY` | Open |
| CC-23 | **Provider mode purpose clarity** — Make obvious this is a marketplace for scheduling conversations and hiring. Profiles exist to increase visibility and engagement. Core value must be explicit during onboarding. | `GUIDANCE` `COPY` | Open |
| CC-24 | **Provider visibility = lever for demand/supply** — Profile visibility drives: family inquiries (demand) AND caregiver hiring (supply). Visibility settings are levers that providers control to increase opportunities. | `GUIDANCE` `UX` | Open |
| CC-25 | **Dual marketplace awareness** — Provider mode is not just a family leads marketplace. There's also a hiring marketplace where providers browse caregivers for staff. This must be introduced during onboarding. | `GUIDANCE` `UX` | Open |
| CC-26 | **Card design consistency** — All cards across the platform must use consistent visual language and match the best-designed cards. No weak, generic, or inconsistent card styles. | `VISUAL` `UX` | Open |
| CC-27 | **Provider story ladder** — All provider pages must ladder to one obvious story: Create profile → Get discovered → Schedule conversations → Hire or get hired. | `GUIDANCE` `UX` | Open |
| CC-28 | **One unified card system** — Consolidate to a single card design system across entire site: hiring marketplace, provider leads, requests, family-facing views. No more introducing new card styles. | `VISUAL` `UX` | Open |
| CC-29 | **Unified color system** — Color themes must be unified across the platform. No mixing blue with green inconsistently. Color usage should be predictable and meaningful. | `VISUAL` | Open |
| CC-30 | **Matching algorithm consistency** — Matching logic must be verified and consistent across: families ↔ providers, providers ↔ providers (hiring marketplace). Match percentages should be meaningful. | `LOGIC` `DATA` | Open |
| CC-31 | **Eliminate duplicate browse pages** — /provider/organizations and /caregiver/browse-organizations serve the same function. Must consolidate to one canonical page. No parallel pages for same function. | `LOGIC` `UX` | **Done** (Sprint 1) |
| CC-32 | **Hiring marketplace core loop** — For individual caregivers: Create profile once → Apply to 3–5 organizations → Schedule 3–5 interviews → Get hired. UI, copy, CTAs, and navigation must all reinforce this loop. | `GUIDANCE` `UX` | Open |
| CC-33 | **Apply flow must explain profile sharing** — When caregivers apply, page must explicitly state: submitting shares your profile, more information increases hiring chances, goal is to complete 3–5 interviews. | `GUIDANCE` `COPY` | Open |
| CC-34 | **All request pages must be consistent** — Family ↔ provider, provider ↔ caregiver, caregiver ↔ organization request pages must: share consistent layout and visual language, clearly state engagement purpose, drive toward scheduled meetings (not vague messaging). Calendars, reminders, and follow-ups should be first-class concepts. | `UX` `VISUAL` | Open |
| CC-35 | **Organization hiring goal** — Organizations want to interview 3–5 caregivers per week, maintain steady staffing supply, and track interviews/follow-ups easily. All org-facing hiring UX must support this goal. | `GUIDANCE` `UX` | Open |
| CC-36 | **Separate hiring calendar from family engagement calendar** — Hiring and family engagement are different workflows. They need clean separation to avoid confusion. May need dedicated calendar views for each. | `UX` `DATA` | Open |

---

## Page Audits

### 1. Homepage — `/`

**Current Rating**: B-
**Target Rating**: A+
**Status**: Audited

#### Critical (blocks engagement or causes confusion)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| HP-1 | **No provider cards on homepage** — Users can't immediately browse options like Airbnb/Zillow; major opportunity gap. Add sections: "Popular near you", "Available now", "Recently reviewed", "Care options in [City]" | `UX` `CTA` | Open |
| HP-2 | **Free-text city/ZIP search** — Needs controlled select from canonical location list (see CC-4) | `LOGIC` `DATA` | Open |

#### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| HP-3 | Hero too text-heavy, search-bar dominant — Simplify, reduce words, clearer visual guidance that this is a browseable care directory | `COPY` `VISUAL` | Open |
| HP-4 | Search bar takes too much vertical space | `VISUAL` | Open |
| HP-5 | Search input text not visually centered (labels are centered, inputs are not) | `VISUAL` | Open |
| HP-6 | Doesn't clearly support both user modes (users who know what they want vs. overwhelmed/unsure users) — Keep "Not sure where to start" pathway but also emphasize immediate browsing via cards | `UX` `GUIDANCE` | Open |

#### Keep (working well)
- How It Works section
- Trust indicators section
- "Are You a Care Provider" section
- Trust & Safety section
- Footer structure
- Search bar structure (just needs visual tweaks)

#### Notes
- May return to test search behavior, validate card interactions, audit flows triggered from homepage CTAs

---

### 2. Browse / City Page — `/browse`

**Current Rating**: B-
**Target Rating**: A+
**Status**: Audited

#### Critical (blocks engagement or causes confusion)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| BR-1 | **Filter state doesn't persist from homepage** — City/state, care type, and timing entered on homepage resets to empty on /browse. Breaks continuity and creates friction. Must reflect user's intent from homepage. | `LOGIC` `UX` | Open |

#### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| BR-2 | **Quick filters + filter bar consume too much vertical space** — Feels redundant and visually heavy. Consolidate quick filters into main filter bar, or visually minimize one while keeping functionality. | `VISUAL` `UX` | Open |
| BR-3 | **Results summary not context-aware** — "56 providers found" should read "56 providers found in Houston, Texas" (if location set) or "56 providers found in the United States" (if no location). | `COPY` `UX` | Open |
| BR-4 | **No guidance for unsure users** — Page can feel overwhelming for families who don't know what they need. Add subtle, supportive CTA encouraging care profile creation and explaining it improves matching. | `GUIDANCE` `CTA` | Open |
| BR-5 | **No save/heart icon on provider cards** — Users should be able to save providers directly from /browse. Heart icon should be standard on all provider cards site-wide. | `UX` `CTA` | Open |
| BR-6 | **Map pop-up cards underdeveloped** — Currently lack provider image, key details, and context-aware CTA. Should include image, summary details, and CTA like "Schedule Tour" / "Schedule Consultation" / "Schedule Interview" based on provider type. | `UX` `CTA` | Open |
| BR-7 | **Map doesn't respond to location state** — When no location selected: show U.S. map view. When location selected: zoom smoothly into relevant city/region. Reinforces geographic context. | `UX` `VISUAL` | Open |

#### Keep (working well)
- Provider cards are strong overall
- Map placement is good
- Filter bar structure (just needs consolidation)
- Quick filter concept (just needs space optimization)

#### Notes
- Filter persistence ties to CC-4 (canonical location system)
- Heart/save icon is a cross-cutting pattern for all cards

---

### 3. Provider Detail Pages — `/providers/[id]`

Provider detail pages are reviewed across three provider types. Issues are categorized by type where specific, with cross-cutting issues noted above.

---

#### 3a. Independent Caregiver Provider Page

**Current Rating**: B-
**Target Rating**: A+
**Status**: Audited

##### Critical (blocks engagement or causes confusion)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| IC-1 | **"Request detailed pricing" does nothing** — Clicking this has no meaningful result. Should guide users toward scheduling an engagement (interview/consult) and clarify that pricing requires discussion. | `CTA` `LOGIC` | Open |
| IC-2 | **Contact info visible before engagement** — Independent caregiver contact details should not be visible until mutual engagement acceptance (see CC-10). | `LOGIC` `UX` | Open |

##### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| IC-3 | **Single image only** — Independent caregivers should be able to upload multiple photos with carousel browsing, same as organization pages. | `UX` `VISUAL` | Open |
| IC-4 | **Pricing tooltips lack explanation** — Estimated pricing needs tooltips explaining: where pricing comes from, what it represents, how it differs from actual negotiated pricing. | `GUIDANCE` `COPY` | Open |
| IC-5 | **Trust/Olera Score undefined** — See CC-6. Scoring systems underdeveloped and unclear on this page. | `GUIDANCE` `UX` | Open |
| IC-6 | **CTA copy too wordy** — "Create a free account" + explanation could be simplified or combined into a tighter message. | `COPY` `CTA` | Open |
| IC-7 | **Sticky nav missing sections** — Customer Q&A, Quick Facts, and other visible sections not represented in sticky navigation. | `UX` | Open |
| IC-8 | **Service area vs location redundant** — Combine into single "Service Area" section defined by zip codes served or mile radius. | `UX` `VISUAL` | Open |
| IC-9 | **No availability section** — Families need to understand when this caregiver is generally available. Add availability block. | `DATA` `UX` | Open |
| IC-10 | **No employer-facing view** — Independent caregivers need a provider-facing rendering (for organizations hiring them) showing: availability, resume/experience, skills, certifications. | `UX` `DATA` | Open |
| IC-11 | **Empty sections still render** — Sections with no data should not render at all (see CC-8). | `VISUAL` `UX` | Open |

##### Keep (working well)
- Profile image looks good
- Verified badge is strong and clear
- Overall visual structure is solid
- Sticky navigation scrolls correctly
- CTA direction is right ("Connect with [Name]")
- Page feels human and personal

---

#### 3b. Home Care Agency Provider Page

**Current Rating**: B-
**Target Rating**: A+
**Status**: Audited

##### Critical (blocks engagement or causes confusion)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| HC-1 | **"Request detailed pricing" CTA lacks guidance** — Needs next steps and should guide toward scheduling a consultation. | `CTA` `GUIDANCE` | Open |

##### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| HC-2 | **"How it works" section too wordy** — Content is good but could be tighter. Consider icons or light visuals to reduce text density. | `COPY` `VISUAL` | Open |
| HC-3 | **No real caregiver profiles** — Agencies should eventually add real caregiver profiles. "Our caregiver standards" is a good fallback/empty state for now. | `DATA` `UX` | Open |
| HC-4 | **Pricing language says "estimated"** — Replace with "Starting at" pricing (see CC-7). If no pricing exists, show well-designed empty state. | `COPY` | Open |
| HC-5 | **Service area definition unclear** — Combine headquarters location + service radius/zip codes into unified service area section. | `UX` `DATA` | Open |
| HC-6 | **Trust score undefined** — Same issue as independent caregivers. Needs definition and rationale (see CC-6). | `GUIDANCE` `UX` | Open |
| HC-7 | **Reviews section needs seed data** — Seed sample reviews to validate layout and UX. | `DATA` | Open |

##### Keep (working well)
- Image carousel works well
- Pricing presentation is clear (with language caveat)
- Sticky navigation is strong
- "How it works" section is helpful (just needs tightening)
- "Our caregiver standards" is a strong fallback

---

#### 3c. Senior Living / Facility Provider Page

**Current Rating**: B-
**Target Rating**: A+
**Status**: Audited

##### Critical (blocks engagement or causes confusion)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| SL-1 | **"Live here" section unclear** — Remove or clarify what this section means and its purpose. | `COPY` `UX` | Open |

##### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| SL-2 | **Image categorization missing** — Allow photos to be tagged (rooms, common areas, dining, activities). Encourage providers to upload images for each category. | `UX` `DATA` | Open |
| SL-3 | **Pricing language says "estimated"** — Use "Starting at" pricing consistently (see CC-7). For unclaimed profiles, show thoughtful empty state. | `COPY` | Open |
| SL-4 | **No "last updated" indicator** — Show when provider last updated their profile. Helps users assess data freshness. | `DATA` `UX` | Open |
| SL-5 | **Empty sections still render** — Sections with no data should not render (see CC-8). | `VISUAL` `UX` | Open |
| SL-6 | **CTA clarity** — Continue aligning CTAs with engagement type (tour, consult). See CC-9. | `CTA` | Open |

##### Keep (working well)
- Image carousel is strong
- Living options and services structure is good
- CTA placement is appropriate
- Visuals feel important and are handled well

---

#### Provider Pages — Cross-Cutting Summary

All provider pages share these characteristics:
- **Visually strong** and directionally correct
- **B- rating** due to: missing clarity, underdeveloped interaction flows, inconsistent data handling, lack of guidance at key decision points
- **Clear path to A+** with the changes outlined above

Key cross-cutting issues affecting all provider types:
- CC-6: Trust/Olera Score definition
- CC-7: Pricing language standardization
- CC-8: Empty state hygiene
- CC-9: Provider-type specific CTAs
- CC-10: Contact info gating

---

### 4. CTA Submission Flow — Auth + Onboarding

**Flow**: Provider Page → Schedule Tour CTA → Auth Modal → Onboarding → Request Page
**Current Rating**: B/B+
**Target Rating**: A
**Status**: Audited

This audit covers the authentication and onboarding steps when a logged-out user clicks a CTA on a provider page. The request page itself is audited separately.

---

#### 4a. Authentication Modal

**Status**: Audited

##### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| AM-1 | **Text alignment inconsistent** — "Your data is protected" and "By continuing you agree…" text has mixed alignment. Should be consistently left-aligned or center-aligned throughout. | `VISUAL` | Open |

##### Polish (future phase)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| AM-2 | **Social auth buttons need wiring** — Apple, Google, Facebook buttons look good but need future implementation. Define behavior and flows for each provider. | `LOGIC` | Open |

##### Keep (working well)
- Auth modal appears correctly when clicking Schedule Tour
- Apple, Google, Facebook options are present
- Email + password option is good
- Overall structure and tone are solid

---

#### 4b. Onboarding Module (Post-Auth)

**Title**: "Complete your profile to contact [Provider Name]"
**Status**: Audited

##### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| OB-1 | **Onboarding copy too wordy** — Text is slightly too verbose for new users. Aim for shorter, simpler sentences with less cognitive load. See CC-1. | `COPY` | Open |
| OB-2 | **Free-text inputs should be dropdowns** — "Who needs care" and "City/State" should be dropdowns or autocomplete, not free text. See CC-12. | `LOGIC` `DATA` | Open |
| OB-3 | **Care type uses industry jargon** — Replace technical terms with plain-language options. See CC-11. | `COPY` `UX` | Open |
| OB-4 | **Profile visibility toggle copy too heavy** — Concept is correct and necessary, but copy is too long and visually heavy. Should be shorter, more visually simple, clear and reassuring without over-explaining. | `COPY` `VISUAL` | Open |

##### Keep (working well)
- Contextual copy referencing the specific provider is excellent
- "About your care search" is the right framing
- Flow correctly blocks engagement until a profile exists
- "Connect" button works correctly and routes to request page

---

#### CTA Flow — Summary

The CTA → Auth → Onboarding flow is **directionally strong and mostly correct**. Current rating: **B/B+**.

To reach A-level polish:
- Visual alignment cleanup in auth modal
- Dropdown-based inputs for data consistency
- Plain-language care terminology
- Shorter, calmer onboarding copy
- Simplified profile visibility controls

---

### 5. Request / Engagement Page — `/requests/[id]`

**Current Rating**: ~~C-~~ → **A-** (Sprint 1 redesign)
**Target Rating**: A+
**Status**: **Redesigned** (Sprint 1)
**Priority**: HIGH — This is one of the most critical pages on the platform

~~This page is the center of gravity for engagement scheduling and tracking. It currently feels cluttered, ambiguous, and unintentionally designed. Requires substantial redesign.~~

**Sprint 1 Redesign Complete**: First-principles redesign implemented. Page reduced from 1359 to 706 lines. Now scheduling-first with messages collapsed by default. Removed: auto-scroll, rich text editor, typing indicators, presence detection, message search/export, video call, quick replies. Added: clear status confirmation, "What happens next" guidance, "Continue Exploring" section.

---

#### Critical (blocks engagement or causes confusion)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| RQ-1 | **Auto-scroll to messaging is disorienting** — Page auto-scrolls into messaging area. Users must scroll up to understand what's happening. Initial viewport should clearly explain: what just happened, what the next step is, what to do now. | `UX` `GUIDANCE` | **Done** (Sprint 1) |
| RQ-2 | **First message is blank/contentless** — Message thread opens with empty or meaningless content. First message should always be the request that was just submitted so users understand what was sent. | `UX` `LOGIC` | **Done** (Sprint 1) |
| RQ-3 | **Page overemphasizes "conversation" instead of scheduling** — The real goal is confirming and scheduling an engagement (tour, consultation, interview). Messaging should be secondary, not the focal point. | `UX` `GUIDANCE` | **Done** (Sprint 1) |
| RQ-4 | **No guidance to continue engaging providers** — No clear guidance encouraging users to complete profile, share more info, or submit additional requests. Page feels like a dead end. See CC-14. | `GUIDANCE` `CTA` | **Done** (Sprint 1) |
| RQ-5 | **Scheduling not centered as primary action** — Page must clearly center on: confirming profile was shared, scheduling engagement (tour/consultation/interview, virtual or in-person), showing what happens next. Currently buried or unclear. | `UX` `CTA` | **Done** (Sprint 1) |

#### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| RQ-6 | **Quick replies overwhelming** — Too many options, presented in two lines. Should be one clean row, thoughtfully curated. | `UX` `VISUAL` | **Done** (Sprint 1) |
| RQ-7 | **Message composer overly complex** — Bold/italics/code formatting unnecessary. Remove features users won't realistically use. Keep: plain text, attachments, emoji (optional). | `UX` `VISUAL` | **Done** (Sprint 1) |
| RQ-8 | **Unnecessary icons in messaging** — Search, download, notifications icons inside messaging are distracting. Remove or minimize. | `VISUAL` `UX` | **Done** (Sprint 1) |
| RQ-9 | **Copy too complex** — Text throughout page is too complex. Should be 3rd–4th grade reading level. See CC-13. | `COPY` | **Done** (Sprint 1) |
| RQ-10 | **"View Provider" opens in same tab** — Should open in new tab to preserve engagement context. | `UX` `LOGIC` | **Done** (Sprint 1) |
| RQ-11 | **"View Provider" shows wrong CTA** — Shows "Connect with [Provider]" which is wrong in this context. Should say "View engagement", "Track request", or "View conversation". | `CTA` `COPY` | **Done** (Sprint 1) |
| RQ-12 | **"While you wait" / "What happens next" sections underdeveloped** — These sections have potential but need to be: visually lighter, written in plain language, explicitly instructive (e.g., "Next, we recommend scheduling with 2–4 more providers"). | `GUIDANCE` `COPY` | **Done** (Sprint 1) |
| RQ-13 | **Contact information section underdeveloped** — Needs clearer presentation and purpose. | `UX` `DATA` | **Done** (Sprint 1) |
| RQ-14 | **Page difficult for 65+ users** — Too many buttons, too many words, unclear hierarchy, no single obvious "next action". Must work for users with minimal tech literacy. | `UX` `GUIDANCE` | **Done** (Sprint 1) |

#### Keep (working well)
- Request → Provider Response → Schedule → Meet progress indicator is strong
- "View Provider" button concept is useful (just needs fixes)

---

#### Request Page — Redesign Requirements (Non-Negotiable)

The redesigned `/requests/[id]` page must:

1. **Clearly confirm** that a request was sent
2. **Explain what happens next** in simple language
3. **Make scheduling the engagement the primary action**
4. **Support both virtual and in-person** engagements
5. **Provide calendar integration** and reminders (Google Calendar)
6. **Encourage submitting multiple requests** (see CC-14)
7. **Reduce messaging to a supporting role** — calm, obvious, secondary to scheduling
8. **Loop users back into browsing** and matching

The scheduling action should feel: **obvious, calm, supportive, not visually overwhelming**.

---

### 6. Saved Providers Page — `/saved`

**Current Rating**: B-
**Target Rating**: A+
**Status**: Audited

This page should reinforce the platform's core message: meet with 3–5 providers to find the right fit. Currently needs simplification and card redesign.

---

#### Critical (blocks engagement or causes confusion)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| SP-1 | **Provider cards truncated and visually awkward** — Content is cut off, CTAs like "Scheduled Interview" don't fit card width. Significant UI issue requiring card redesign. | `VISUAL` `UX` | Open |
| SP-2 | **"Schedule Interview" CTA redirects to provider page** — Should NOT redirect. Should trigger confirmation flow if user has profile: "Would you like to share your profile and request a meeting?" See CC-15. | `CTA` `UX` | Open |

#### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| SP-3 | **Empty state too wordy and overwhelming** — "Tips for finding the right care" are directionally good but need to be much shorter. Focus almost entirely on scheduling and meeting 3–5 providers. | `COPY` `GUIDANCE` | Open |
| SP-4 | **Empty state lacks clear guidance** — Should clearly guide users: browse providers, submit engagement requests, track and schedule meetings. Elevate scheduling as primary action. | `GUIDANCE` `CTA` | Open |
| SP-5 | **Provider cards show too much information** — Information should be pared down to what supports the next action. Cards should feel clean, scannable, and calm. | `VISUAL` `UX` | Open |
| SP-6 | **Hero section is B- quality** — Acceptable but could be improved or possibly removed if it doesn't advance the scheduling journey. | `VISUAL` `UX` | Open |

#### Polish (consider removing)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| SP-7 | **Sort by toggle may not be necessary** — Could be removed if it adds noise without value. | `UX` | Open |

#### Keep (working well)
- "View details" works well and correctly opens provider page in new tab
- "Browse Providers" and "View Matches" actions are strong and should remain prominent
- "Schedule Interview" CTA is directionally correct (just needs confirmation flow fix)

---

#### Saved Page — Design Principles

**Why meetups matter** (context for design decisions):
- Families need to assess care level fit
- Confirm pricing and payment modes
- Check availability
- Compare providers across types (home care, assisted living, caregivers)
- Make informed, non-rushed decisions

**Olera's value**: Help families manage multiple engagements at once, not push toward the first provider who responds.

**Page should reinforce**:
- Scheduling engagements
- Tracking active engagements
- Comparing options
- "Elder care as a journey" education (subtle, secondary to action)

---

### 7. Matches Page — `/matches`

**Current Rating**: B- / C+
**Target Rating**: A+
**Status**: Audited

Functionality is largely present, but the page feels overwhelming and visually heavy. Issues are primarily design and framing, not missing functionality.

---

#### Critical (blocks engagement or causes confusion)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| MA-1 | **Hero section distracting and not thoughtful** — Dark green color doesn't align with broader design language. Consumes too much initial viewport. | `VISUAL` `UX` | Open |
| MA-2 | **Page doesn't explain why matches matter** — Doesn't clearly reinforce platform's goal: schedule 3–5 meetings with relevant providers to compare care level, pricing, availability, and fit. | `GUIDANCE` `COPY` | Open |

#### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| MA-3 | **Page feels overwhelming and visually heavy** — Too much copy and visual density above the fold. First screen should be immediately understandable and calm. | `VISUAL` `UX` | Open |
| MA-4 | **Design doesn't align with other pages** — Moving between tabs feels abrupt, not seamless. Any redesign must align visually with platform design system. | `VISUAL` `UX` | Open |
| MA-5 | **Not optimized for 65+ audience** — Needs larger text, fewer words, simple direct language (~3rd grade reading level), clear obvious next actions. | `UX` `COPY` | Open |

#### Keep (working well)
- Sections for personalizing matches, recommended matches, active conversations
- Matching toggles and edit options are directionally correct

---

### 8. Care Profile Page — `/care-profile`

**Current Rating**: B-
**Target Rating**: A+
**Status**: Audited

Improving, but still too busy and overwhelming. Calendar is very strong and should be the central focus.

---

#### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| CP-1 | **Page still too busy and overwhelming** — Needs reduction in visual and cognitive load. Should feel calmer and more intentional. | `VISUAL` `UX` | Open |
| CP-2 | **Active conversations section likely unnecessary** — Activity should live in notifications feed instead. See CC-18. | `UX` | Open |
| CP-3 | **"Need help" box may be unnecessary** — Could be removed to simplify. Evaluate if it adds value. | `UX` | Open |
| CP-4 | **"Complete your profile" box at bottom is redundant** — Given the Edit Profile CTA exists, this is duplicate. Should be removed. | `UX` `VISUAL` | Open |
| CP-5 | **"Welcome back" should use first name** — Currently may show email/username. Should use first name once collected. | `COPY` `DATA` | Open |
| CP-6 | **Calendar needs clearer engagement focus** — Should clearly show: scheduled engagements, pending requests, upcoming meetings (virtual or in-person). This is the destination of the user journey. See CC-17. | `UX` `GUIDANCE` | Open |

#### Keep (working well)
- Calendar surfaced prominently (very strong)
- "At a glance" and quick actions are useful
- Top toggle between Edit Profile and Find Providers makes sense
- "Start your care journey to find providers" is directionally correct

---

#### Care Profile — Design Principles

**Page should clearly communicate**:
- "This is where you track and manage all your engagements"
- Calendar is the central outcome of the user journey
- Encouragement to accumulate 3–5 meetings to compare options

**Remove or relocate**:
- Active conversations → Notifications
- Redundant "Complete your profile" box
- Potentially "Need help" box

---

### 9. Edit Care Profile Page — `/care-profile/edit`

**Current Rating**: C- / C+
**Target Rating**: A+
**Status**: Audited
**Priority**: CRITICAL — Mission-critical page requiring full redesign

This page is underdeveloped, confusing, and not aligned with the platform's core goal. The experience feels like a survey rather than building a meaningful profile. Requires an A+-level rebuild, not incremental fixes.

---

#### Critical (blocks engagement or causes confusion)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| EC-1 | **CRITICAL BUG: Final question redirects without saving** — On the final question, user is redirected back to Care Profile page without saving. Broken and confusing experience. | `LOGIC` | **Done** (Sprint 1) |
| EC-2 | **Feels like a survey, not a profile builder** — Users cannot see what their profile looks like. Should resemble creating a Facebook/Airbnb profile, not a linear questionnaire. See CC-21. | `UX` `GUIDANCE` | Open |
| EC-3 | **Questions too long and poorly written** — Written above 3rd-grade reading level. Not appropriate for 65+ users. See CC-13. | `COPY` | Open |
| EC-4 | **Hero section takes too much vertical space** — Far too much viewport consumed before useful content. | `VISUAL` `UX` | Open |

#### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| EC-5 | **Progress indicators too wide and visually heavy** — Care type, location, budget indicators are directionally good but not optimized for clarity or scannability. | `VISUAL` `UX` | Open |
| EC-6 | **Questions poorly fitted to viewport** — Content doesn't fit well on screen, creating awkward scrolling and reading experience. | `VISUAL` `UX` | Open |
| EC-7 | **Users don't understand profile's value** — Page doesn't explain why the profile matters: scheduling 3–5 meetings, avoiding repeating their story, pre-qualifying needs, increasing response speed, improving match quality. | `GUIDANCE` `COPY` | Open |
| EC-8 | **No preview of live profile** — Users should be able to see their profile as providers will see it. | `UX` | Open |
| EC-9 | **Privacy controls not clearly explained** — Users need reassurance about what's shared and when. | `GUIDANCE` `UX` | Open |
| EC-10 | **Profile photo and first name not encouraged** — Should encourage (but not require) adding photo and first name to increase engagement success. | `UX` `GUIDANCE` | Open |

#### Keep (working well)
- Progress/status indicators concept (care type, location, budget) is directionally good
- "Back to dashboard" concept may be needed (role should be reconsidered)

---

#### Edit Care Profile — Redesign Requirements (Non-Negotiable)

**Data & Architecture**:
This page must operate as the **single source of truth** for:
- Provider matching
- Benefits matching
- Engagement scheduling
- Onboarding data
- Benefits finder inputs
- Future platform features

All data must persist and reconcile across: Onboarding, Edit Care Profile, Benefits Finder, Matching algorithms, Engagement requests. See CC-20.

**Structural Changes**:
- Shift from survey flow → **section-based profile builder**
- Each section should:
  - Show what providers will see
  - Be editable inline
  - Clearly explain why the information matters
  - Allow users to preview their live profile as others see it

**Content & Language**:
- Rewrite ALL copy for: 3rd-grade reading level, 65+ accessibility, minimal jargon
- Replace industry terms with plain language:
  - "Help at home"
  - "Help after hospital"
  - "Living with support"
  - "Full-time care"

**Visual & Functional Enhancements**:
- Encourage (but do not require): profile photo, first name
- Clearly explain privacy controls
- Show how completing profile: increases matches, speeds up scheduling, reduces back-and-forth

**Integration Requirements**:
Must work seamlessly with:
- Care Profile view page
- Benefits Finder
- Provider matching
- Engagement requests

**No duplicate data entry. No conflicting flows. No broken saves or redirects.**

---

#### Edit Care Profile — North Star

The Care Profile exists to:
1. Help users schedule 3–5 meetings with providers
2. Avoid telling their story repeatedly
3. Pre-qualify care needs, availability, and payment
4. Increase response speed from providers
5. Improve match quality and engagement success

**This must be made obvious to the user.**

---

### 10. Benefits Page — `/benefits`

**Current Rating**: B- / C+
**Target Rating**: A
**Status**: Audited

Promising but still overwhelming. Page should feel like a natural extension of the Care Profile, not a separate product.

---

#### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| BN-1 | **Dark background may not align with site design** — Current look feels more complex and darker than rest of platform. Simpler, lighter design may improve readability and comfort for 65+ users. | `VISUAL` `UX` | Open |
| BN-2 | **Design and wording heavy for 65+ audience** — Page is acceptable but overwhelming. Needs simplification for target demographic. | `COPY` `UX` | Open |
| BN-3 | **"Start Benefits Finder" goes to wrong destination** — Should take users into the Care Profile editing experience, which is the correct entry point for collecting benefit-relevant data. | `CTA` `LOGIC` | Open |
| BN-4 | **"Skip for now" leads to unclear destination** — Needs clearer guidance and intent. Should not dump users into unrelated flows. | `CTA` `UX` | Open |
| BN-5 | **Dual value proposition not clear** — Page must clearly communicate: Benefits Finder uses the same Care Profile, helps identify local/state/federal benefits, reduces cost of care. Profile is reusable across provider matching AND benefits matching. See CC-22. | `GUIDANCE` `COPY` | Open |
| BN-6 | **Copy needs simplification** — Reduce wording overall. Rewrite for 3rd-grade reading level, 65+ accessibility. Focus on outcomes: "Lower the cost of care", "Find programs that help pay", "Use the same profile—no extra work". | `COPY` | Open |

#### Polish (acceptable for now)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| BN-7 | **LLM UI not fully developed** — Acceptable for now, but will need refinement in future phase. | `UX` | Open |

#### Keep (working well)
- Page concept is valid and valuable
- Benefits finder as a feature has strong potential

---

#### Benefits Page — Core Messaging

The site does two primary things:
1. **Helps families meet with 3–5 providers** to find the right care
2. **Uses that same profile to find benefits** that help pay for care

The Benefits page should reinforce this clearly and simply.

**Key points to communicate**:
- Benefits Finder uses the same Care Profile
- No extra work—one profile, two purposes
- Helps identify local, state, and federal benefits
- Reduces the cost of care services

---

#### Benefits Page — Integration Requirements

This page should feel like a natural extension of Care Profile, not a separate product.

Must integrate deeply with:
- Care Profile (shared data source)
- Provider matching
- Engagement scheduling

**Final direction**: Keep page, but simplify layout, clarify CTAs, tighten copy, align flow with Care Profile.

---

## Provider Mode Pages

Provider Mode is a strong foundation but needs: clearer framing of purpose, better onboarding guidance, stronger card design, role-appropriate landing pages, and consistent emphasis on meetings, hiring, and engagement.

**Core story all pages must support**: Create profile → Get discovered → Schedule conversations → Hire or get hired.

---

### 11. Provider Mode Onboarding — `/provider/onboarding`

**Current Rating**: B- / C+
**Target Rating**: A+
**Status**: Audited

The onboarding split between Care Organization and Individual Caregiver is directionally correct. UI is solid, but purpose is not explicit enough.

---

#### 11a. Global Onboarding Issues

##### Critical (blocks engagement or causes confusion)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| PO-1 | **Purpose not explicit enough** — Onboarding doesn't clearly explain: why users are creating a profile, what they gain, how it leads to meetings/hiring/getting hired. See CC-23. | `GUIDANCE` `COPY` | Open |
| PO-2 | **Core value not obvious** — This is a marketplace for scheduling conversations and hiring. Profiles exist to increase visibility and engagement. Not communicated clearly. | `GUIDANCE` `UX` | Open |

##### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| PO-3 | **"Individual Caregiver" label may be unclear** — For job seekers, this term may not resonate. Consider pressure-testing terminology. | `COPY` | Open |
| PO-4 | **Dual marketplace not introduced** — Users don't learn during onboarding that there's both a family leads marketplace AND a hiring marketplace. See CC-25. | `GUIDANCE` | Open |

##### Keep (working well)
- Split between Care Organization and Individual Caregiver is directionally correct
- UI is solid

---

#### 11b. Care Organization Onboarding

##### Critical (blocks engagement or causes confusion)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| CO-1 | **Location uses free text** — Must use single source of truth. Dropdowns or structured selection only. See CC-4. | `LOGIC` `DATA` | Open |

##### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| CO-2 | **Type of Care missing "Home Health"** — This is a common care type that should be included. | `DATA` | Open |
| CO-3 | **Type of Care should allow "select all that apply"** — Many organizations span multiple categories. | `UX` `DATA` | Open |
| CO-4 | **Profile visibility copy unclear** — Should explain how visibility drives: family inquiries (demand) AND caregiver hiring (supply). Profiles are levers. See CC-24. | `GUIDANCE` `COPY` | Open |
| CO-5 | **"You're all set" state could be stronger** — Should reinforce why profile matters and set expectations for what comes next. | `GUIDANCE` `COPY` | Open |

##### Keep (working well)
- Organization Name as free text is fine
- Profile visibility frame is well-designed (just needs clearer copy)

---

#### 11c. Individual Caregiver Onboarding

##### Critical (blocks engagement or causes confusion)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| CG-1 | **Framing is wrong — user is looking for a job** — "About your services" feels wrong. This should feel like creating a professional profile to be discovered and hired. | `COPY` `UX` | Open |
| CG-2 | **After onboarding, caregivers land on wrong page** — Should NOT land on family leads. Should land on "Find Organizations" or equivalent for browsing hiring orgs. | `LOGIC` `UX` | Open |

##### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| CG-3 | **Fields focus on wrong things** — Should be: name, location (structured, no free text), skills (job-relevant). Not "services offered" like an org. | `COPY` `DATA` | Open |
| CG-4 | **Profile visibility explanation incomplete** — Should explain profile will be seen by: families hiring directly AND organizations hiring staff. Visibility = more opportunities. | `GUIDANCE` `COPY` | Open |
| CG-5 | **Onboarding language should be reframed** — Use "Tell us about yourself" and "Create a profile families and organizations can hire from". | `COPY` | Open |

---

### 12. Leads Page (Organizations) — `/provider/leads`

**Current Rating**: B- / C+
**Target Rating**: A+
**Status**: Audited

Defaulting organizations to Leads page is correct. Core structure exists but needs significant refinement.

---

#### Critical (blocks engagement or causes confusion)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| LP-1 | **CTAs unclear and weak** — Should be action-oriented: "Schedule a meeting", "Request conversation". Not "View details". See CC-9. | `CTA` `UX` | Open |
| LP-2 | **Page doesn't communicate its purpose** — Must clearly state: this is where providers connect with families and initiate conversations. | `GUIDANCE` `COPY` | Open |

#### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| LP-3 | **Filters UI oversized, boxy, inefficient** — Takes too much space without providing proportional value. | `VISUAL` `UX` | Open |
| LP-4 | **Duplicate sections ("40 care requests" boxes)** — Unnecessary repetition. Consolidate or remove. | `VISUAL` `UX` | Open |
| LP-5 | **Cards visually weak and inconsistent** — Don't match gold standard used elsewhere (city/provider cards). Light green headers feel generic and distracting. See CC-26. | `VISUAL` `UX` | Open |
| LP-6 | **Hiring marketplace not surfaced** — Page should make obvious there's also a hiring marketplace where providers can browse caregivers when they need staff. | `GUIDANCE` `UX` | Open |

#### Keep (working well)
- Defaulting organizations to Leads page is correct
- Header summary (available / matched / in progress) is good
- "Matched with Families" section is directionally right

---

### 13. Find Organizations Page (Caregivers) — `/provider/organizations` or equivalent

**Current Rating**: C+
**Target Rating**: A+
**Status**: Audited

This is where individual caregivers should land after onboarding to browse hiring organizations and apply.

---

#### Critical (blocks engagement or causes confusion)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| FO-1 | **Cards are missing or underdeveloped** — Page needs proper organization cards that caregivers can browse. | `UX` `VISUAL` | Open |
| FO-2 | **CTAs missing or unclear** — Need clear CTAs like "Apply" or "Express interest". | `CTA` `UX` | Open |
| FO-3 | **Page may not exist or is hard to find** — Caregivers need a clear path to this page after onboarding. | `UX` `LOGIC` | Open |

#### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| FO-4 | **Page naming may be unclear** — "Find Organizations" or "Browse Hiring Organizations" should clearly signal this is for job seekers. | `COPY` | Open |

---

### Provider Mode — Planned Deep Dives

The following pages require individual detailed audits:

1. **Provider Leads Page** — `/provider/leads` (started above, needs expansion)
2. **Provider Request Page** — `/provider/requests/[id]`
3. **Provider Profile Page** — `/provider/profile` and `/provider/profile/edit`
4. **Hiring Marketplace Pages**:
   - Find Organizations (for caregivers)
   - Find Care Staff / Candidates (for orgs)
   - My Opportunities (for caregivers)
   - My Candidates (for orgs)

---

### Provider Mode — Design Principles

**Revenue impact**: These pages directly impact monetization. Providers decide whether to pay based on:
- Lead quality
- Clarity
- Ease of engagement

**All provider pages should**:
- Use consistent card designs (gold standard)
- Reinforce that the platform exists to schedule meetings
- Make clear that profiles reduce friction and speed engagement
- Support the story ladder: Create profile → Get discovered → Schedule conversations → Hire or get hired

---

### 14. Leads Page — Extended Audit (`/provider/leads`)

**Current Rating**: C+ (updated from B-/C+)
**Target Rating**: A+
**Status**: Audited (expanded)

Building on initial audit, this captures additional card and CTA issues.

---

#### Critical (blocks engagement or causes confusion)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| LP-7 | **Matched cards don't meet gold standard** — No profile images, minimal information, inconsistent layout vs. cards used elsewhere (city pages, provider cards). See CC-28. | `VISUAL` `UX` | Open |
| LP-8 | **CTA says "Save lead" — incorrect** — CTA must reflect intended action: "Schedule a consultation", "Schedule a tour", "Schedule an interview". Platform's purpose is facilitating meetings. | `CTA` `UX` | Open |

#### Notes
- "Matched" section is critical — providers land here first
- All cards across all sections must be reconciled to gold standard
- Previous issues (LP-1 through LP-6) still apply

---

### 15. Provider Requests Page — `/provider/requests`

**Current Rating**: C+
**Target Rating**: A+
**Status**: Audited

Directionally correct, but inconsistent and visually messy.

---

#### Critical (blocks engagement or causes confusion)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| PR-1 | **Yet another new card style** — This must stop. Cards should match global card standard. See CC-28. | `VISUAL` `UX` | Open |
| PR-2 | **"View profile" is wrong CTA** — Should be subtype-specific: Facility → "Schedule a tour", Home care → "Schedule a consultation", Individual caregiver → "Schedule an interview". See CC-9. | `CTA` `UX` | Open |

#### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| PR-3 | **Too much vertical space in header** — Header is oversized and wastes viewport. | `VISUAL` `UX` | Open |
| PR-4 | **Color too dark, inconsistent with other pages** — Doesn't align with platform color system. | `VISUAL` | Open |
| PR-5 | **"35% match" badge needs verification** — Matching algorithm must be verified and consistent. See CC-30. | `LOGIC` `DATA` | Open |
| PR-6 | **Inconsistent color usage (blue mixed with green)** — Color themes must be unified. See CC-29. | `VISUAL` | Open |
| PR-7 | **Need more explicit guidance** — Should guide users toward outreach, scheduling meetings, moving engagements forward. | `GUIDANCE` `UX` | Open |

#### Keep (working well)
- Toggle between "Families reaching out" and "Your outreach" makes sense

---

### 16. My Profile Page (Provider) — `/provider/profile`

**Current Rating**: C-
**Target Rating**: A+
**Status**: Audited
**Priority**: HIGH — One of the weakest pages reviewed

This page is overbuilt and unfocused. Needs radical simplification.

---

#### Critical (blocks engagement or causes confusion)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| PP-1 | **Page doesn't focus on what matters** — Should focus almost entirely on: calendar, upcoming and scheduled engagements. Currently cluttered with irrelevant sections. | `UX` `GUIDANCE` | Open |
| PP-2 | **"Complete your profile" widget poorly designed and redundant** — There's already an Edit Profile button. Widget is unnecessary clutter. | `UX` `VISUAL` | Open |

#### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| PP-3 | **Inconsistent and awkward hero/header styling** — Visual design doesn't align with platform standards. | `VISUAL` | Open |
| PP-4 | **Poor color choices** — Colors feel off and inconsistent. See CC-29. | `VISUAL` | Open |
| PP-5 | **Quick actions irrelevant and misaligned with goals** — Actions shown don't support the core purpose of scheduling meetings. | `UX` `GUIDANCE` | Open |
| PP-6 | **Performance insights unnecessary** — Adds clutter without clear value. | `UX` | Open |
| PP-7 | **Request activity and recent activity confusing/redundant** — These should live in notifications, not on this page. See CC-18. | `UX` | Open |
| PP-8 | **Provider subtype not shaping content** — What's shown should vary based on provider type. | `UX` `DATA` | Open |

---

#### My Profile — Required Direction

This page should mirror the family Care Profile philosophy:
- **Simple**
- **Action-oriented**
- **Calendar-first**

Focus almost entirely on:
- Calendar
- Upcoming and scheduled engagements
- Clear path to Edit Profile

Remove or relocate:
- Performance insights
- Request activity → Notifications
- Recent activity → Notifications
- Redundant "Complete your profile" widget

---

### 17. Edit Provider Profile Page — `/provider/profile/edit`

**Current Rating**: C- (barely passing)
**Target Rating**: A+
**Status**: Audited
**Priority**: HIGH — Requires full overhaul

This page feels underdeveloped and not delightful. Does not anticipate user needs.

---

#### Critical (blocks engagement or causes confusion)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| EP-1 | **Visibility toggles incorrect** — Must be split into two separate toggles: visibility to Families AND visibility to Organizations (for hiring). | `LOGIC` `UX` | Open |
| EP-2 | **No live preview mode** — Providers should see what their public profile looks like. Preview should update as edits are made and be openable in separate tab. | `UX` | Open |
| EP-3 | **Page doesn't explain why filling out matters** — Must clearly communicate how completing profile increases meetings, hiring, and demand/supply balance. | `GUIDANCE` `COPY` | Open |

#### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| EP-4 | **Profile fields not subtype-specific** — Fields should adapt based on: facilities, agencies, home care, individual caregivers. | `UX` `DATA` | Open |
| EP-5 | **Fields not clearly optional vs required** — Users need to understand what's minimum viable vs. optional enrichment. | `UX` `GUIDANCE` | Open |
| EP-6 | **Fields not framed around value** — Each field should explain how it improves matching and engagement. | `GUIDANCE` `COPY` | Open |
| EP-7 | **No distinction between minimum viable and enrichment** — Should clearly separate: minimum viable profile (for visibility) vs. optional enrichment fields (to improve matching). | `UX` `GUIDANCE` | Open |
| EP-8 | **Page feels underdeveloped and not delightful** — UX doesn't anticipate user needs or guide them effectively. | `UX` | Open |

---

#### Edit Provider Profile — Required Direction

**Best-in-class profile editing experience**:
- Clear distinction between minimum viable profile (for visibility) and optional enrichment fields (to improve matching)
- Strong subtype awareness (facilities, agencies, home care, individual caregivers)
- Live preview mode that updates as edits are made
- Openable in separate tab

**Visibility model**:
- Split into two separate toggles:
  - Visible to Families (for leads)
  - Visible to Organizations (for hiring marketplace)

**Framing**:
Page must clearly answer:
- Why filling this out matters
- How it increases meetings, hiring, and demand/supply balance

**Goal should be explicit**:
- Help providers meet 3–5 families per week
- Help providers meet 3–5 caregivers per week
- Keep supply and demand balanced

---

### Provider-Side Pages — Summary

| Page | Rating | Priority | Key Issue |
|------|--------|----------|-----------|
| Leads (expanded) | C+ | High | Card system, wrong CTAs |
| Requests | C+ | High | Inconsistent cards, wrong CTAs, color issues |
| My Profile | C- | High | Overbuilt, unfocused, not calendar-first |
| Edit Profile | C- | High | No preview, wrong visibility model, not subtype-aware |

**Cross-cutting requirements**:
- One card system across entire platform (CC-28)
- Consistent color system (CC-29)
- CTAs always reflect next real-world action
- Every page ladders to: Create profile → get matched → schedule meetings → track engagements

**This is core revenue-driving UX. Treat these as first-class, high-leverage surfaces.**

---

## Hiring Marketplace Pages (Caregiver Job Seeking)

This section covers the experience for individual caregivers seeking jobs. Overall theme: confusing navigation, inconsistent language, duplicate pages, weak CTAs, and lack of guidance toward interviews.

**Core loop that must be reinforced**: Create profile → Apply to 3–5 orgs → Schedule 3–5 interviews → Get hired (CC-32)

---

### 18. Find Organizations Page — `/provider/organizations`

**Current Rating**: C-
**Target Rating**: A+
**Status**: Audited
**Priority**: HIGH — Needs full overhaul in design and framing

---

#### Critical (blocks engagement or causes confusion)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| FO-5 | **Hero color blue, inconsistent with site** — Visual language doesn't match platform design system. See CC-29. | `VISUAL` | Open |
| FO-6 | **Hero takes far too much vertical space** — Wastes viewport, pushes content down. | `VISUAL` `UX` | Open |
| FO-7 | **"My Applications" introduces semantic drift** — Confusing language. Caregivers think in terms of "looking for orgs that are hiring" and "applying for interviews", not "applications". | `COPY` `UX` | Open |
| FO-8 | **Purpose not explicit** — Page must clearly state: Apply to 3–5 organizations, schedule 3–5 interviews, get hired. See CC-32. | `GUIDANCE` `COPY` | Open |

#### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| FO-9 | **Design feels unfinished and visually confusing** — Overall UX needs significant polish. | `VISUAL` `UX` | Open |
| FO-10 | **Cards must follow gold standard** — When seeded data is added, cards must match platform card system. See CC-28. | `VISUAL` `UX` | Open |
| FO-11 | **CTAs should be "Apply now"** — Not generic actions. Clear, action-oriented language. | `CTA` | Open |

---

### 19. My Opportunities Page — `/provider/opportunities`

**Current Rating**: C+
**Target Rating**: A+
**Status**: Audited

Directionally correct but needs clarity, better guidance, and cleaner design.

---

#### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| MO-1 | **Hero too large, dark green inconsistent** — Visual weight overwhelms content. Color doesn't align with platform. See CC-29. | `VISUAL` `UX` | Open |
| MO-2 | **"My Opportunities" may not be intuitive** — Should clearly communicate: organizations interested in you, places you've applied, interviews you're scheduling. | `COPY` `GUIDANCE` | Open |
| MO-3 | **Cards must match gold standard** — Closer to usable but still not meeting platform standard. See CC-28. | `VISUAL` `UX` | Open |
| MO-4 | **Need "Apply now" or "Schedule interview" CTAs** — Current CTAs are unclear and generic. | `CTA` | Open |
| MO-5 | **Should guide users toward interviews** — Page purpose is moving caregivers toward scheduled interviews. | `GUIDANCE` `UX` | Open |

---

### 20. CRITICAL: Duplicate Browse Pages

**Priority**: CRITICAL — Must fix immediately

---

#### Critical Issue

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| DP-1 | **Duplicate pages for same function** — /caregiver/browse-organizations and /provider/organizations serve the same purpose. Clicking "View All" from My Opportunities routes to /caregiver/browse-organizations, which is different from /provider/organizations. This duplication is extremely confusing and unacceptable. See CC-31. | `LOGIC` `UX` | **Done** (Sprint 1) |

#### Required Action
- Consolidate to ONE canonical page for caregivers browsing hiring organizations
- Suggested: Keep /provider/browse-organizations (or similar)
- Remove or redirect all other variants
- No parallel caregiver vs provider browse pages for the same function

---

### 21. Caregiver Browse Organizations — `/caregiver/browse-organizations`

**Current Rating**: C+
**Target Rating**: A+ (or consolidate into canonical page)
**Status**: Audited

Better than /provider/organizations but still has issues.

---

#### What Works
- Better hero sizing and color (closer to correct)
- Clear structure: "Organizations looking for you" (matched) + "Browse all organizations"
- Match percentage is useful

#### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| CB-1 | **Cards not gold standard** — Must match platform card system. See CC-28. | `VISUAL` `UX` | Open |
| CB-2 | **"View opportunities" is unclear CTA** — Should be "Apply now". Clear, action-oriented. | `CTA` `COPY` | Open |
| CB-3 | **Semantic drift across pages** — Language inconsistency with other hiring pages must be eliminated. | `COPY` | Open |

---

### 22. Organization Detail / Apply Flow — `/caregiver/browse-organizations/[id]`

**Current Rating**: C-
**Target Rating**: A+
**Status**: Audited
**Priority**: HIGH — Core conversion page for hiring marketplace

This page must be reframed as an Apply + Schedule Interview page.

---

#### Critical (blocks engagement or causes confusion)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| OA-1 | **Page not delightful or clear** — UX feels unfinished and doesn't guide user effectively. | `UX` | Open |
| OA-2 | **Doesn't explain profile sharing** — Must explicitly state: "Submitting this request shares your profile with [Organization]". See CC-33. | `GUIDANCE` `COPY` | Open |
| OA-3 | **Doesn't explain what org will see** — Caregivers need to know what information is shared. | `GUIDANCE` `COPY` | Open |
| OA-4 | **Doesn't explain goal is interview scheduling** — Primary purpose must be obvious. | `GUIDANCE` `COPY` | Open |

#### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| OA-5 | **No guidance to improve profile completeness** — Should encourage adding more info to increase hiring chances. | `GUIDANCE` `UX` | Open |
| OA-6 | **No guidance to apply to more orgs** — After submission, should guide users back to apply to more organizations. | `GUIDANCE` `UX` | Open |
| OA-7 | **No reinforcement of core loop** — Must reinforce: Apply → Interview → Compare → Get hired. See CC-32. | `GUIDANCE` | Open |

---

### Hiring Marketplace — Summary

| Page | Rating | Priority | Key Issue |
|------|--------|----------|-----------|
| Find Organizations | C- | High | Design overhaul, semantic drift |
| My Opportunities | C+ | Medium | Hero, unclear purpose, weak CTAs |
| Duplicate Pages | CRITICAL | Immediate | Must consolidate to one canonical page |
| Caregiver Browse Orgs | C+ | Medium | Cards, CTAs, semantic drift |
| Apply Flow | C- | High | No profile sharing explanation, no guidance |

**Required Actions**:
1. Eliminate duplicate browse pages (CC-31)
2. Standardize language across all hiring pages
3. Apply gold standard card design everywhere (CC-28)
4. Replace generic CTAs with "Apply now" / "Schedule interview"
5. Redesign apply pages to explain: profile sharing, interview scheduling, next steps
6. Make hiring journey obvious, simple, intentional (CC-32)

**This section is core to marketplace value and requires a thoughtful, unified redesign to reach A+ quality.**

---

## Hiring Marketplace Pages (Organization Hiring View)

This section covers the hiring marketplace from the care organization perspective. Core issue: the experience does not clearly or effectively support the organization's primary goal of interviewing and hiring individual caregivers efficiently.

**Organization hiring goal**: Interview 3–5 caregivers per week, maintain steady staffing supply, track interviews and follow-ups easily (CC-35)

---

### 23. Hire Care Staff Page — `/provider/hire-staff`

**Current Rating**: C+
**Target Rating**: A+
**Status**: Audited

---

#### Critical (blocks engagement or causes confusion)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| HS-1 | **Purple hero/header inconsistent with brand** — Visually jarring and disconnected from rest of site. See CC-29. | `VISUAL` | Open |
| HS-2 | **Hero takes excessive vertical space** — Pushes meaningful content below the fold. | `VISUAL` `UX` | Open |
| HS-3 | **"View applications" is incorrect terminology** — From org perspective, should be "View candidates". | `COPY` `UX` | **Done** (Sprint 1) |
| HS-4 | **"View applications" routes to wrong page** — Currently routes to Family Connections instead of My Candidates. Critical navigation bug. | `LOGIC` `UX` | **Done** (Sprint 1) |

#### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| HS-5 | **Caregiver cards need gold standard design** — Cards with "Schedule interview" are directionally correct but must match platform card standard. See CC-28. | `VISUAL` `UX` | Open |
| HS-6 | **Overall presentation feels disconnected** — Page doesn't align with rest of platform visually or functionally. | `VISUAL` `UX` | Open |

#### Keep (working well)
- "Schedule interview" CTA direction is correct

---

### 24. Hire Staff Request Page — `/provider/hire-staff/[id]`

**Current Rating**: C-
**Target Rating**: A+
**Status**: Audited
**Priority**: HIGH — Severely underdeveloped, mission-critical for organizational customers

This page does not guide organizations toward successful hiring outcomes. It feels disconnected from the rest of the platform's engagement flows.

---

#### Critical (blocks engagement or causes confusion)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| HR-1 | **Page severely underdeveloped** — Does not support organization's real goal of efficient hiring. | `UX` | Open |
| HR-2 | **No clear framing that this is to request/schedule an interview** — Purpose must be explicit. | `GUIDANCE` `COPY` | Open |
| HR-3 | **Blank message field instead of structured prompts** — Should have prompts for: interview type (phone/video/in-person), preferred times/availability, role expectations/requirements. | `UX` `GUIDANCE` | Open |
| HR-4 | **No explicit confirmation of next steps** — Users don't know what happens after submission. | `GUIDANCE` `UX` | Open |

#### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| HR-5 | **No inline rendering of caregiver profile details** — Should show relevant info (skills, availability, experience) without leaving page. | `UX` `DATA` | Open |
| HR-6 | **No ability to open full caregiver profile in new tab** — Should have easy access to full profile while composing request. | `UX` | Open |
| HR-7 | **Doesn't support org hiring goal** — Should help orgs interview 3–5 caregivers/week, maintain staffing supply, track interviews. See CC-35. | `GUIDANCE` `UX` | Open |
| HR-8 | **Disconnected from platform engagement flows** — Should share consistent patterns with other request pages. See CC-34. | `UX` | Open |

---

#### Hire Staff Request Page — Required Overhaul

This page should be reimagined as an **Interview Request & Scheduling Hub**.

**Must-Have Elements**:
- Clear framing that this action is to request and schedule an interview
- Inline rendering of relevant caregiver profile details (skills, availability, experience)
- Ability to open full caregiver profile in new tab
- Structured prompts instead of blank message field:
  - Interview type (phone / video / in-person)
  - Preferred times or availability windows
  - Role expectations or key requirements
- Explicit confirmation of next steps after submission

**UX Goals**:
- Reduce friction
- Increase interview scheduling success
- Make organization feel confident they are engaging quality candidates
- Reinforce that platform exists to make hiring easy, fast, and trackable

---

### Organization Hiring — Summary

| Page | Rating | Priority | Key Issue |
|------|--------|----------|-----------|
| Hire Care Staff | C+ | High | Brand inconsistent, wrong terminology, broken navigation |
| Hire Staff Request | C- | High | Severely underdeveloped, no structured prompts, no guidance |

**This flow is mission-critical for organizational customers.**

Be ambitious and thoughtful in redesigning it so it genuinely helps organizations hire great caregivers and makes Olera indispensable in their staffing workflow.

---

### 25. My Candidates Page — `/provider/candidates`

**Current Rating**: C-
**Target Rating**: A+
**Status**: Audited
**Priority**: HIGH — Requires major redesign from first principles

This page looks outdated, lacks seeded data, and does not guide the user toward the platform's primary outcome: requesting interviews and successfully scheduling them on a calendar.

---

#### Critical (blocks engagement or causes confusion)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| MC-1 | **No matches or candidate cards visible** — Cannot evaluate if cards meet gold standard. No seeded demo data. | `DATA` `UX` | Open |
| MC-2 | **Page feels unfinished and outdated** — Does not meet modern UX standards. | `VISUAL` `UX` | Open |
| MC-3 | **Doesn't communicate what user should do next** — No clear guidance toward action. | `GUIDANCE` `UX` | Open |
| MC-4 | **Doesn't reinforce core purpose** — Should clearly communicate: find candidates, request interviews, schedule 3–5/week, track interviews and follow-ups. See CC-35. | `GUIDANCE` `COPY` | Open |

#### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| MC-5 | **No pipeline dashboard view** — Organizations need to see: who they're considering, where each candidate is in the process, what interviews are scheduled, what still needs scheduling. | `UX` `DATA` | Open |
| MC-6 | **No dedicated calendar/schedule view for hiring interviews** — Needs calendar showing: upcoming interviews, pending requests, quick actions (reschedule, message, cancel, add to Google Calendar). See CC-36. | `UX` | Open |
| MC-7 | **No seeded demo data** — Page cannot be fully evaluated without representative data. | `DATA` | Open |

---

#### My Candidates — Required Redesign (First Principles)

**Do not optimize around what exists today.** Take a first-principles approach.

**Page should function as a Hiring Pipeline Dashboard.**

Organization should immediately understand:
- Who they are considering
- Where each candidate is in the process
- What interviews are scheduled (and what still needs scheduling)
- What actions to take next

**Page should make it easy to**:
- Initiate interview requests quickly
- Track pending responses
- Confirm interview times
- Send calendar invites
- Follow up if candidate hasn't responded

---

#### Calendar / Scheduling Requirement

This page needs a **dedicated calendar or schedule view** for hiring interviews.

**Calendar should support**:
- Upcoming interviews (time, candidate, role, type: video/phone/in-person)
- Pending interview requests (awaiting confirmation)
- Quick actions from events (reschedule, message, cancel, add to Google Calendar)

**Note**: This may be separate from family-engagement calendar since hiring and family engagement are different workflows. See CC-36.

---

#### My Candidates — Design Direction

**Requirements**:
- Simple, modern, highly guided, outcome-driven
- Thoughtful decisions across: UX/UI layout, copy/terminology, data structures, event states
- Seeded demo data so page can be fully evaluated

**This is not incremental edits — this is a full redesign to make this page clearly useful and best-in-class for organizations hiring caregivers.**

**The My Candidates page must become a place where organizations can reliably**:
1. View candidates in a structured pipeline
2. Request and schedule interviews quickly
3. Track everything through a calendar-first experience
4. Move candidates toward hiring with minimal friction

Be ambitious, creative, and intentional. This page should make it obvious that Olera is built to help organizations hire caregivers through structured engagements and scheduling—not just browsing lists.

---

### Organization Hiring — Updated Summary

| Page | Rating | Priority | Key Issue |
|------|--------|----------|-----------|
| Hire Care Staff | C+ | High | Brand inconsistent, wrong terminology, broken navigation |
| Hire Staff Request | C- | High | Severely underdeveloped, no structured prompts, no guidance |
| My Candidates | C- | High | Unfinished, no pipeline view, no calendar, no seeded data |

**All three pages are mission-critical for organizational customers and require ambitious, first-principles redesigns.**

---

<!-- Template for additional pages:

### [Page Number]. [Page Name] — `[URL path]`

**Current Rating**: [X]
**Target Rating**: A+
**Status**: Audited

#### Critical (blocks engagement or causes confusion)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| [ID]-1 | Description | `TAG` | Open |

#### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| [ID]-1 | Description | `TAG` | Open |

#### Polish (nice-to-have refinements)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| [ID]-1 | Description | `TAG` | Open |

#### Keep (working well)
- Item 1
- Item 2

#### Notes
- Additional context

-->
