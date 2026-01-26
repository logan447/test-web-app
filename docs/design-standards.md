# Design Standards: Olera Platform

**Purpose**: Concrete, implementable rules for achieving A+ quality across all pages
**Source**: Cross-cutting issues (CC-1 through CC-36) from `/docs/page-by-page-audit.md`

---

## 1. Copy Standards

### Reading Level
- **Target**: 3rd-4th grade reading level (CC-13)
- **Audience**: 65+ users, potentially with limited tech literacy
- **Test**: Use Hemingway Editor or similar; aim for Grade 4 or below

### Wordiness Reduction (CC-1)
**Before**: "Please take a moment to complete your profile information so that providers can better understand your care needs and preferences."

**After**: "Finish your profile so providers know what you need."

### Terminology (CC-11)

| Industry Jargon | Plain Language |
|-----------------|----------------|
| Personal care | Help with daily activities |
| Skilled nursing | Full-time nursing care |
| Home health | Help at home |
| Post-acute care | Help after hospital |
| Assisted living | Living with support |
| Memory care | Help for memory loss |
| ADLs | Daily activities |
| Respite care | Short-term care |

### Removed Language (CC-2)
- Remove all "Texas only" references
- Remove all "expanding nationwide" language
- Platform is nationwide — no geographic disclaimers needed

---

## 2. CTA Standards

### Provider-Type Specific CTAs (CC-9)

| Provider Type | Primary CTA |
|---------------|-------------|
| Senior Living Facility | "Schedule Tour" |
| Home Care Agency | "Schedule Consultation" |
| Independent Caregiver | "Schedule Interview" |
| Organization (hiring) | "Schedule Interview" |

**Never use**: "View details", "Learn more", "Contact", "Connect"

### Engagement Confirmation Flow (CC-15)
When user has a profile, clicking a scheduling CTA should:
1. NOT redirect to provider page
2. Show confirmation: "Share your profile and request a meeting?"
3. Include: provider name, engagement type, what's shared
4. Primary button: "Request [Tour/Consultation/Interview]"
5. Secondary: "View profile first"

### Hiring Marketplace CTAs (CC-32)
- Caregiver browsing orgs: "Apply now"
- Organization browsing caregivers: "Schedule Interview"
- Never: "View opportunities", "View applications", "Save lead"

---

## 3. Card Design Standards

### One Unified Card System (CC-28)

All cards across the platform must use this structure:

```
┌─────────────────────────────────────────┐
│  [Image/Avatar]                    [♡]  │
│                                         │
│  [Name/Title]                           │
│  [Subtitle/Type]                        │
│                                         │
│  [Key detail 1]  •  [Key detail 2]      │
│  [Key detail 3]                         │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │     [Primary CTA Button]        │    │
│  └─────────────────────────────────┘    │
│        [Secondary link]                 │
└─────────────────────────────────────────┘
```

### Card Requirements
- Profile image/avatar required (use placeholder if none)
- Heart/save icon in top-right corner (CC-5)
- Maximum 3 key details visible
- CTA must be provider-type specific
- Consistent padding: 16px internal, 12px between cards
- Consistent border-radius: 12px
- Shadow: `0 2px 4px rgba(0,0,0,0.1)`

### Card Contexts
This card design applies to:
- Browse page results
- Homepage provider sections
- Saved providers
- Matches
- Leads (provider view)
- Hiring marketplace (both sides)
- Map pop-ups

---

## 4. Color System (CC-29)

### Primary Palette

| Name | Hex | Usage |
|------|-----|-------|
| Primary Green | `#059669` | Primary buttons, active states |
| Primary Green Light | `#D1FAE5` | Backgrounds, highlights |
| Primary Green Dark | `#047857` | Hover states |
| Neutral 900 | `#111827` | Primary text |
| Neutral 600 | `#4B5563` | Secondary text |
| Neutral 400 | `#9CA3AF` | Placeholder text |
| Neutral 100 | `#F3F4F6` | Backgrounds |
| White | `#FFFFFF` | Cards, modals |

### Forbidden Colors
- **No blue heroes/headers** (currently on some pages)
- **No purple heroes/headers** (currently on hire-staff)
- **No dark green that doesn't match primary green**

### Color Rules
1. Heroes/headers: White or Neutral 100 background only
2. Primary actions: Primary Green only
3. Secondary actions: Neutral with green hover
4. Error states: Red (TBD exact shade)
5. Success states: Primary Green

---

## 5. Layout Standards

### Hero Sections
- **Maximum height**: 200px (including padding)
- **Content**: Title (max 8 words) + subtitle (max 15 words) + optional single CTA
- **Background**: White or Neutral 100 only

### Vertical Spacing
- Section spacing: 48px
- Card grid gap: 16px
- Internal card padding: 16px
- Button vertical padding: 12px

### Viewport Rules
- First meaningful content must be above the fold
- No hero should push primary content below 400px scroll
- Calendar, if present, should be immediately visible

---

## 6. Empty State Standards (CC-8)

### Rules
1. Sections with no data must NOT render as blank/broken
2. Two acceptable treatments:
   - **Option A**: Hide section entirely
   - **Option B**: Show intentional empty state with guidance

### Empty State Template
```
┌─────────────────────────────────────────┐
│                                         │
│           [Relevant Icon]               │
│                                         │
│      [Short explanation - 1 line]       │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │      [Action Button]            │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### Examples

**Saved Providers (empty)**:
- Icon: Heart outline
- Text: "No saved providers yet"
- CTA: "Browse Providers"

**Calendar (empty)**:
- Icon: Calendar outline
- Text: "No upcoming meetings"
- CTA: "Find Providers"

**Matches (empty)**:
- Icon: Sparkles/match icon
- Text: "Complete your profile to see matches"
- CTA: "Finish Profile"

---

## 7. Pricing Standards (CC-7)

### Language
- Use: "Starting at $X"
- Never use: "Estimated pricing", "Approximately", "Around"

### Empty State
When no pricing exists:
```
┌─────────────────────────────────────────┐
│  Pricing                                │
│                                         │
│  Contact for pricing                    │
│  [Schedule Consultation]                │
└─────────────────────────────────────────┘
```

### Tooltips
Pricing displays should include tooltip explaining:
- What "Starting at" means (lowest tier/simplest service)
- That actual pricing requires conversation
- That scheduling a meeting gets accurate pricing

---

## 8. Form Input Standards (CC-12)

### Dropdown-Based Inputs Required For:
- Who needs care (fixed options)
- City/State (autocomplete from canonical list)
- Care type (fixed options with plain language)
- Timing/urgency (fixed options)
- Provider type (fixed options)

### Free Text Allowed For:
- Names
- Email
- Phone
- Additional notes/messages
- Bio/description (with character limit)

### Location System (CC-4)
- Single source of truth for all locations
- Structured select/autocomplete only
- No free-text city/ZIP entry
- Consistent across: search, filters, profiles, onboarding

---

## 9. Engagement Flow Standards

### Core Message (CC-16)
Every page should reinforce: "Meet with 3-5 providers to find the right fit"

### Engagement Encouragement (CC-14)
After any engagement action, guide users to continue:
- "Great! Now find 2-4 more providers to compare"
- Show "Browse more providers" CTA
- Never make a page feel like a dead end

### Calendar-First (CC-17)
The calendar should be:
- Central focus on Care Profile and Provider Profile pages
- Immediately visible (not below fold)
- Show: scheduled meetings, pending requests, upcoming events

### Request Pages (CC-34)
All request pages (family↔provider, provider↔caregiver, caregiver↔org) must share:
- Consistent layout
- Clear engagement purpose
- Drive toward scheduled meetings
- Calendar integration
- Reminder options

---

## 10. Privacy & Contact Standards (CC-10)

### Contact Info Gating
Personal contact details (phone, email, address) should NOT be visible until:
- Engagement request accepted by both parties
- OR user explicitly chooses to share

### Profile Sharing Explanation (CC-33)
When users submit applications/requests, page must state:
- "Submitting shares your profile with [Name]"
- What information is shared
- That goal is scheduling a meeting

---

## 11. Provider Mode Standards

### Story Ladder (CC-27)
All provider pages must support this narrative:
1. Create profile
2. Get discovered
3. Schedule conversations
4. Hire or get hired

### Visibility as Lever (CC-24)
Profile visibility controls should explain:
- Visibility to families = more inquiries (demand)
- Visibility to organizations = more hiring opportunities (supply)
- Both are levers the provider controls

### Dual Marketplace (CC-25)
Provider mode serves two markets:
1. Family leads (families seeking care)
2. Hiring marketplace (orgs hiring caregivers / caregivers seeking jobs)

Both must be:
- Introduced during onboarding
- Accessible from navigation
- Clearly distinguished

---

## 12. Hiring Marketplace Standards

### Caregiver Core Loop (CC-32)
1. Create profile once
2. Apply to 3-5 organizations
3. Schedule 3-5 interviews
4. Get hired

UI, copy, CTAs, and navigation must all reinforce this loop.

### Organization Hiring Goal (CC-35)
Organizations want to:
- Interview 3-5 caregivers per week
- Maintain steady staffing supply
- Track interviews and follow-ups easily

### Separate Calendars (CC-36)
- Family engagement calendar: tours, consultations
- Hiring calendar: interviews with caregivers
- May need separate views to avoid confusion

---

## 13. Accessibility Standards

### 65+ Optimization
- Minimum body text: 16px
- Minimum button text: 14px
- Minimum touch target: 44x44px
- High contrast (4.5:1 minimum)
- Simple, direct language
- One obvious next action per screen

### Cognitive Load
- Maximum 3 options before progressive disclosure
- Maximum 5 navigation items visible at once
- Clear visual hierarchy with single focal point
- No jargon or technical terms

---

## 14. Score/Rating Standards (CC-6)

### Trust Score / Olera Score
Must include clear explanation:
- What factors contribute to score
- How score is calculated
- What a "good" score looks like
- Consistent definition across all provider types

### Match Percentage (CC-30)
- Algorithm must be verified and consistent
- Same logic for: families↔providers, providers↔providers
- Show explanation on hover/click: "Based on care needs, location, and availability"

---

## 15. Implementation Checklist

Before any page is considered "done", verify:

### Copy
- [ ] 3rd-4th grade reading level
- [ ] No industry jargon
- [ ] No Texas/nationwide disclaimers
- [ ] Concise (under half original word count)

### Visual
- [ ] Hero under 200px
- [ ] Uses approved color palette only
- [ ] Cards match unified card system
- [ ] Consistent spacing (48/16/12px)

### UX
- [ ] Clear single next action
- [ ] Empty states handled intentionally
- [ ] CTAs are provider-type specific
- [ ] Engagement confirmation flows work
- [ ] Calendar visible if applicable

### Accessibility
- [ ] 65+ friendly (size, contrast, language)
- [ ] Single obvious focal point
- [ ] No dead ends — always path forward

### Platform Consistency
- [ ] Reinforces "meet 3-5 providers" message
- [ ] Supports relevant story ladder
- [ ] Integrates with Care Profile as source of truth
- [ ] Privacy controls explained where needed

---

## Quick Reference

### CTA Cheat Sheet
| Context | CTA Text |
|---------|----------|
| Facility detail page | Schedule Tour |
| Home care detail page | Schedule Consultation |
| Caregiver detail page | Schedule Interview |
| Saved provider card | Schedule [Type] |
| Browse results card | Schedule [Type] |
| Caregiver applying to org | Apply Now |
| Org reaching out to caregiver | Schedule Interview |

### Color Cheat Sheet
| Element | Color |
|---------|-------|
| Primary button | `#059669` |
| Button hover | `#047857` |
| Page background | `#FFFFFF` or `#F3F4F6` |
| Primary text | `#111827` |
| Secondary text | `#4B5563` |
| Card shadow | `rgba(0,0,0,0.1)` |

### Spacing Cheat Sheet
| Context | Value |
|---------|-------|
| Section gap | 48px |
| Card grid gap | 16px |
| Card internal padding | 16px |
| Button padding (v) | 12px |
| Button padding (h) | 24px |
