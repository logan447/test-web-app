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
