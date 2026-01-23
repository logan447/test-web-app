# Olera Design System

> **Version**: 2.0 - Platform Elevation
> **Last Updated**: January 23, 2026
> **Reference**: Based on current browse/provider pages + brand screenshots

---

## Design Philosophy

**The Emotional Context**: Users arrive stressed, often in crisis. Every design decision must ask: *Does this reduce anxiety or add to it?*

### Core Principles

1. **Calm Authority** — Professional without being cold, trustworthy without being corporate
2. **Progressive Disclosure** — Show what's needed now, reveal depth on demand
3. **Decision Enablement** — Every page should move users closer to confident action
4. **Respect for Time** — Assume users are juggling caregiving, work, and life
5. **Simplicity First** — Prefer the simpler solution that achieves the same outcome

### Quality Bar

Every screen should feel clearly professional, cohesive, and trustworthy. The platform should be obviously better than generic marketplace templates.

---

## Color Palette

### Primary — Olera Teal

The primary teal communicates warmth, trust, and care. It's derived from the brand logo.

| Token | Hex | Usage |
|-------|-----|-------|
| `primary-50` | `#F0FDFA` | Very light backgrounds, subtle highlights |
| `primary-100` | `#CCFBF1` | Light backgrounds, selected states, badges |
| `primary-200` | `#99F6E4` | Hover backgrounds |
| `primary-300` | `#5EEAD4` | Decorative elements |
| `primary-400` | `#2DD4BF` | Secondary emphasis |
| `primary-500` | `#14B8A6` | Medium emphasis, active filter borders |
| **`primary-600`** | **`#0D9488`** | **PRIMARY — buttons, links, accents** |
| `primary-700` | `#0F766E` | Hover states for primary buttons |
| `primary-800` | `#115E59` | Active/pressed states |
| `primary-900` | `#134E4A` | Dark text on light teal backgrounds |

### Neutral — Grays

| Token | Hex | Usage |
|-------|-----|-------|
| `gray-50` | `#F9FAFB` | Page backgrounds, card backgrounds |
| `gray-100` | `#F3F4F6` | Input backgrounds, dividers |
| `gray-200` | `#E5E7EB` | Borders, separators |
| `gray-300` | `#D1D5DB` | Disabled states, inactive borders |
| `gray-400` | `#9CA3AF` | Placeholder text, muted icons |
| `gray-500` | `#6B7280` | Secondary text |
| `gray-600` | `#4B5563` | Body text, labels |
| `gray-700` | `#374151` | Emphasized text |
| `gray-800` | `#1F2937` | Headings |
| `gray-900` | `#111827` | Primary text, highest contrast |

### Semantic Colors

| Purpose | Color | Light BG | Usage |
|---------|-------|----------|-------|
| **Success** | `#10B981` | `#D1FAE5` | Verified, available, completed |
| **Warning** | `#F59E0B` | `#FEF3C7` | Attention needed, urgent timeline |
| **Error** | `#EF4444` | `#FEE2E2` | Errors, destructive actions |
| **Info** | `#3B82F6` | `#DBEAFE` | Informational, neutral status |

### Provider Type Colors

Consistent visual coding for provider types:

| Provider Type | Badge BG | Badge Text | Icon BG |
|---------------|----------|------------|---------|
| Facilities (Assisted Living, Memory Care, Nursing) | `primary-100` | `primary-700` | `primary-50` |
| Home Care Agencies | `blue-100` | `blue-700` | `blue-50` |
| Independent Caregivers | `purple-100` | `purple-700` | `purple-50` |

### Specialty Care Colors

| Specialty | Badge BG | Badge Text |
|-----------|----------|------------|
| Memory Care | `purple-50` | `purple-700` |
| Respite Care | `green-50` | `green-700` |
| Hospice Care | `blue-50` | `blue-700` |
| Other Specialties | `amber-50` | `amber-700` |

---

## Typography

### Font Family

**Primary**: Inter (loaded via `next/font/google`)

```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

### Type Scale

| Class | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `text-xs` | 12px | 16px | 400/500 | Timestamps, badges, captions |
| `text-sm` | 14px | 20px | 400/500 | Secondary text, labels |
| `text-base` | 16px | 24px | 400/500 | Body text (minimum readable) |
| `text-lg` | 18px | 28px | 500/600 | Card titles, emphasized body |
| `text-xl` | 20px | 28px | 600 | Section headers |
| `text-2xl` | 24px | 32px | 600/700 | Page section titles |
| `text-3xl` | 30px | 36px | 700 | Page titles |
| `text-4xl` | 36px | 40px | 700 | Hero headlines, large numbers |

### Typography Rules

- Body text: Never below 16px
- Interactive labels: Never below 14px
- Line height: Minimum 1.5x for body text
- Truncate long text with `line-clamp-*` utilities

---

## Spacing

Uses Tailwind's 4px base unit.

### Standard Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `p-4` / `gap-4` | 16px | Standard padding, small card gaps |
| `p-5` | 20px | Card content padding |
| `p-6` | 24px | Large card padding, section padding |
| `gap-3` | 12px | Tight element gaps |
| `gap-6` | 24px | Card grids, section gaps |
| `gap-8` | 32px | Major section breaks |

### Layout Containers

- Max width: `max-w-7xl` (1280px)
- Page padding: `px-4` (mobile) / `px-6` (desktop)
- Section spacing: `py-8` to `py-12`

---

## Components

### Buttons

#### Primary Button
Main CTAs, form submissions.

```html
<button class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3
               rounded-full font-semibold transition-colors shadow-sm">
  Get Started
</button>
```

- Background: `primary-600` → `primary-700` on hover
- Text: white
- Shape: Pill (`rounded-full`)
- Shadow: `shadow-sm`

#### Secondary Button
Secondary actions, outline style.

```html
<button class="bg-white border-2 border-primary-600 text-primary-600
               px-6 py-3 rounded-full font-semibold hover:bg-primary-50">
  Learn More
</button>
```

#### Ghost Button
Tertiary actions, minimal visual weight.

```html
<button class="text-primary-600 px-4 py-2 rounded-lg font-medium
               hover:bg-primary-50 transition-colors">
  Cancel
</button>
```

#### Small Buttons
Use `px-4 py-2 text-sm` for compact contexts.

### Cards

#### Standard Card
```html
<div class="bg-white rounded-xl border border-gray-200 shadow-sm
            hover:shadow-lg transition-shadow">
  <!-- content with p-5 or p-6 -->
</div>
```

#### Interactive Card (Link)
```html
<a class="block bg-white rounded-xl border border-gray-200
          hover:border-primary-200 hover:shadow-lg transition-all">
  <!-- content -->
</a>
```

### Provider Cards (Browse Page Pattern)

Horizontal layout for list views:

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────┐                                                │
│  │         │  [Location - small, gray]                      │
│  │  Image  │  [Name - lg, semibold]                         │
│  │  w-48   │  [Type badge] [Care badges...] [+N more]       │
│  │         │  [Description - 2 lines, gray]                 │
│  │         │  ─────────────────────────────────────────     │
│  │         │  Estimated Pricing          ┌─────────────┐    │
│  │         │  $X,XXX - $X,XXX/mo         │ ★ 4.8 (12) │    │
│  └─────────┘                             └─────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

- Image: `w-48` fixed width, full height
- Verified badge: Top-left overlay on image, `primary-600` bg
- Care type badges: Primary type uses `primary-100/700`, others use `gray-100/600`
- Rating: `gray-50` background pill with star icon

### Form Inputs

```html
<input class="w-full px-4 py-2.5 border border-gray-300 rounded-lg
              text-base focus:ring-2 focus:ring-primary-500
              focus:border-primary-500 placeholder:text-gray-400" />
```

- Border radius: `rounded-lg` (8px)
- Focus: 2px ring in `primary-500`
- Min height: 44px (accessibility)

### Filter Dropdowns

```html
<button class="flex items-center justify-between gap-2 px-4 py-2.5
               border rounded-lg text-sm font-medium min-w-[140px]
               border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
  <span>Filter Label</span>
  <ChevronIcon />
</button>

<!-- Active state -->
<button class="... border-primary-500 bg-primary-50 text-primary-700">
```

### Badges

#### Status Badges
```html
<!-- Verified -->
<span class="inline-flex items-center gap-1 px-2 py-1 bg-primary-600
             text-white text-xs font-medium rounded-full">
  <CheckIcon class="w-3 h-3" />
  Verified
</span>

<!-- Available -->
<span class="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-md">
  3 spots available
</span>
```

#### Care Type Badges
```html
<!-- Primary type -->
<span class="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded">
  Home Care
</span>

<!-- Secondary types -->
<span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
  Memory Care
</span>

<!-- Overflow -->
<span class="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
  +3 more
</span>
```

### Rating Display

```html
<div class="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
  <StarIcon class="w-5 h-5 text-yellow-400 fill-current" />
  <span class="text-lg font-bold text-gray-900">4.8</span>
  <span class="text-sm text-gray-500">(127)</span>
</div>
```

---

## Page Patterns

### Browse/List Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [Sticky Filter Bar]                                        │
│  Location | Type | Rating | Payment | Care Service | Sort   │
├─────────────────────────────────────────────────────────────┤
│  [Results Header: "X Providers in Location"]                │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────┐  ┌──────────────────────────┐ │
│  │                          │  │                          │ │
│  │     Provider Cards       │  │         Map              │ │
│  │      (scrollable)        │  │       (sticky)           │ │
│  │                          │  │                          │ │
│  └──────────────────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Provider Detail Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [Back Button]  [Breadcrumb: Home > Type > State > City]    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐  ┌──────────────┐ │
│  │  Photo + Info Hero                   │  │              │ │
│  │  [Gallery] [Name, Location, Type]    │  │   Contact    │ │
│  │  [Pricing Card] [Rating Card]        │  │     Form     │ │
│  ├──────────────────────────────────────┤  │   (sticky)   │ │
│  │  [Tab Navigation]                    │  │              │ │
│  │  Rating | About | Services | ...     │  │              │ │
│  ├──────────────────────────────────────┤  │              │ │
│  │  [Tab Content]                       │  │              │ │
│  │  Content cards with consistent       │  │              │ │
│  │  styling and spacing                 │  │              │ │
│  └──────────────────────────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Provider Type-Specific Guidelines

### Facilities (Assisted Living, Memory Care, Nursing Home)

**Key Information to Highlight:**
- Room availability and waitlist status
- Staff-to-resident ratio
- Care levels offered (Independent → Skilled)
- Activities and dining programs
- Touring availability

**Engagement CTA**: "Schedule Tour" or "Request Info"

### Home Care Agencies

**Key Information to Highlight:**
- Service coverage area (map)
- Caregiver qualifications and training
- Care services offered
- How matching works
- Response time

**Engagement CTA**: "Request Consultation" or "Get Care Assessment"

### Independent Caregivers

**Key Information to Highlight:**
- Personal background and approach
- Availability calendar
- Experience and specialties
- Certifications and references
- Hourly rate range

**Engagement CTA**: "Request Interview" or "Send Message"

---

## Accessibility

| Requirement | Standard |
|-------------|----------|
| Color contrast | WCAG AA (4.5:1 text, 3:1 UI) |
| Touch targets | 44x44px minimum |
| Focus indicators | Visible ring on all interactive elements |
| Keyboard navigation | All actions reachable via keyboard |

---

## Animation & Transitions

- **Default transition**: `transition-colors` or `transition-all` with 150-300ms
- **Hover lift**: `hover:shadow-lg` + optional `hover:-translate-y-0.5`
- **Loading states**: Use skeleton placeholders with shimmer animation
- **Avoid**: Excessive motion, auto-playing animations

---

## Logo Usage

### Files
- Bird mark: `/public/bird-logo.svg`
- Favicon: `/public/favicon.svg`

### Implementation
```jsx
<Link href="/" className="flex items-center gap-2">
  <img src="/bird-logo.svg" alt="" className="w-8 h-8" aria-hidden="true" />
  <span className="text-2xl font-bold text-gray-900">Olera</span>
</Link>
```

- Bird mark colors: `primary-600` and `primary-700`
- Wordmark: `text-gray-900`, `font-bold`
- Standard size: 32px (header), 24px (mobile)

---

## Implementation Checklist

When building new pages or components:

- [ ] Uses correct primary color (`primary-600` for main actions)
- [ ] Card borders are `border-gray-200`, not darker
- [ ] Interactive cards have hover state (`hover:shadow-lg`, `hover:border-primary-200`)
- [ ] Buttons use pill shape (`rounded-full`) for primary/secondary
- [ ] Input focus states use `primary-500` ring
- [ ] Text hierarchy follows type scale
- [ ] Touch targets are 44px minimum
- [ ] Loading states use skeletons, not spinners (except inline)
- [ ] Empty states have clear guidance and action

---

*This document is the authoritative source for Olera's visual design system.*
