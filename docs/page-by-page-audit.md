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
