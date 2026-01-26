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

**Current Rating**: C-
**Target Rating**: A+
**Status**: Audited
**Priority**: HIGH — This is one of the most critical pages on the platform

This page is the center of gravity for engagement scheduling and tracking. It currently feels cluttered, ambiguous, and unintentionally designed. Requires substantial redesign.

---

#### Critical (blocks engagement or causes confusion)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| RQ-1 | **Auto-scroll to messaging is disorienting** — Page auto-scrolls into messaging area. Users must scroll up to understand what's happening. Initial viewport should clearly explain: what just happened, what the next step is, what to do now. | `UX` `GUIDANCE` | Open |
| RQ-2 | **First message is blank/contentless** — Message thread opens with empty or meaningless content. First message should always be the request that was just submitted so users understand what was sent. | `UX` `LOGIC` | Open |
| RQ-3 | **Page overemphasizes "conversation" instead of scheduling** — The real goal is confirming and scheduling an engagement (tour, consultation, interview). Messaging should be secondary, not the focal point. | `UX` `GUIDANCE` | Open |
| RQ-4 | **No guidance to continue engaging providers** — No clear guidance encouraging users to complete profile, share more info, or submit additional requests. Page feels like a dead end. See CC-14. | `GUIDANCE` `CTA` | Open |
| RQ-5 | **Scheduling not centered as primary action** — Page must clearly center on: confirming profile was shared, scheduling engagement (tour/consultation/interview, virtual or in-person), showing what happens next. Currently buried or unclear. | `UX` `CTA` | Open |

#### Important (degrades experience)

| # | Issue | Tag | Status |
|---|-------|-----|--------|
| RQ-6 | **Quick replies overwhelming** — Too many options, presented in two lines. Should be one clean row, thoughtfully curated. | `UX` `VISUAL` | Open |
| RQ-7 | **Message composer overly complex** — Bold/italics/code formatting unnecessary. Remove features users won't realistically use. Keep: plain text, attachments, emoji (optional). | `UX` `VISUAL` | Open |
| RQ-8 | **Unnecessary icons in messaging** — Search, download, notifications icons inside messaging are distracting. Remove or minimize. | `VISUAL` `UX` | Open |
| RQ-9 | **Copy too complex** — Text throughout page is too complex. Should be 3rd–4th grade reading level. See CC-13. | `COPY` | Open |
| RQ-10 | **"View Provider" opens in same tab** — Should open in new tab to preserve engagement context. | `UX` `LOGIC` | Open |
| RQ-11 | **"View Provider" shows wrong CTA** — Shows "Connect with [Provider]" which is wrong in this context. Should say "View engagement", "Track request", or "View conversation". | `CTA` `COPY` | Open |
| RQ-12 | **"While you wait" / "What happens next" sections underdeveloped** — These sections have potential but need to be: visually lighter, written in plain language, explicitly instructive (e.g., "Next, we recommend scheduling with 2–4 more providers"). | `GUIDANCE` `COPY` | Open |
| RQ-13 | **Contact information section underdeveloped** — Needs clearer presentation and purpose. | `UX` `DATA` | Open |
| RQ-14 | **Page difficult for 65+ users** — Too many buttons, too many words, unclear hierarchy, no single obvious "next action". Must work for users with minimal tech literacy. | `UX` `GUIDANCE` | Open |

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
