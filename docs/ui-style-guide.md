# Olera UI Style Guide

> **Authoritative Source**: This document defines the visual foundation for the Olera platform.
> All implementation should align with these specifications.
>
> **Reference**: Master Platform Manual Chapter 4 (UI & Design Language)
>
> **Last Updated**: January 19, 2026

---

## Overview

This style guide establishes the visual foundation for the Olera platform. It ensures consistency across all pages and components, creating a cohesive experience that feels intentional and professional.

**Design Philosophy** (Manual Ch 4.1):
1. Clarity over cleverness
2. Warmth with professionalism
3. Progressive disclosure
4. Consistent patterns
5. Mobile-first, desktop-enhanced
6. Accessible by default
7. Speed communicates quality

**Quality Bar**: Every screen should meet a consumer-grade quality bar comparable to Airbnb, Zillow, and LinkedIn.

---

## Color Palette

### Primary Colors (Olera Teal)

The primary teal communicates warmth, trust, and care — core brand values.

| Token | Hex | Usage |
|-------|-----|-------|
| `primary-50` | `#F0FDFA` | Very light backgrounds, subtle highlights |
| `primary-100` | `#CCFBF1` | Light backgrounds, badges, selected states |
| `primary-200` | `#99F6E4` | Hover backgrounds |
| `primary-300` | `#5EEAD4` | Decorative elements |
| `primary-400` | `#2DD4BF` | Secondary emphasis |
| `primary-500` | `#14B8A6` | Medium emphasis |
| **`primary-600`** | **`#0D9488`** | **PRIMARY — buttons, links, accents** |
| `primary-700` | `#0F766E` | Hover states for primary |
| `primary-800` | `#115E59` | Active/pressed states |
| `primary-900` | `#134E4A` | Dark emphasis |

### Secondary Colors (Neutral Grays)

| Token | Hex | Usage |
|-------|-----|-------|
| `secondary-50` | `#F9FAFB` | Section backgrounds |
| `secondary-100` | `#F3F4F6` | Card backgrounds, inputs |
| `secondary-200` | `#E5E7EB` | Borders |
| `secondary-300` | `#D1D5DB` | Disabled states |
| `secondary-400` | `#9CA3AF` | Muted text, placeholders |
| `secondary-500` | `#6B7280` | Secondary text |
| `secondary-600` | `#4B5563` | Hover states |
| `secondary-700` | `#374151` | Emphasized secondary text |
| `secondary-800` | `#1F2937` | Strong text |
| `secondary-900` | `#111827` | Primary text |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#10B981` | Confirmations, verified badges, completed states |
| `success-light` | `#D1FAE5` | Success backgrounds |
| `warning` | `#F59E0B` | Cautions, pending states |
| `warning-light` | `#FEF3C7` | Warning backgrounds |
| `error` | `#EF4444` | Errors, destructive actions |
| `error-light` | `#FEE2E2` | Error backgrounds |
| `info` | `#3B82F6` | Informational messages |
| `info-light` | `#DBEAFE` | Info backgrounds |

### Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `text-primary` | `#111827` | Primary text, headings |
| `text-secondary` | `#6B7280` | Secondary text, descriptions |
| `text-muted` | `#9CA3AF` | Muted text, placeholders |

### Accent Backgrounds

| Token | Hex | Usage |
|-------|-----|-------|
| `cream-50` | `#FFFBF5` | Warm section backgrounds |
| `cream-100` | `#FEF7ED` | Hero backgrounds |
| `cream-200` | `#FDF2E1` | Accent sections |

---

## Typography

### Font Family

**Primary Font**: Inter

```css
font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

Inter is loaded via `next/font/google` for optimal performance.

### Type Scale (16px base)

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 12px | 16px | Captions, timestamps |
| `text-sm` | 14px | 20px | Secondary text, labels |
| `text-base` | 16px | 24px | Body text (minimum for readability) |
| `text-lg` | 18px | 28px | Emphasized body, card titles |
| `text-xl` | 20px | 28px | Section headers |
| `text-2xl` | 24px | 32px | Page section titles |
| `text-3xl` | 30px | 36px | Page titles |
| `text-4xl` | 36px | 40px | Hero headlines |

### Typography Rules

- Body text: Never below 16px
- Interactive labels: Never below 14px
- Line height: Minimum 1.5x font size for body text
- Font weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

---

## Spacing System

Uses a 4px base unit aligned with Tailwind's default scale.

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight inline spacing |
| `space-2` | 8px | Related element gaps, icon padding |
| `space-3` | 12px | Form field spacing |
| `space-4` | 16px | Standard padding, card gaps |
| `space-5` | 20px | Medium section padding |
| `space-6` | 24px | Card padding, section gaps |
| `space-8` | 32px | Section margins |
| `space-10` | 40px | Large section breaks |
| `space-12` | 48px | Major section breaks |
| `space-16` | 64px | Page section padding |

### Layout Patterns

- Card padding: `space-6` (24px)
- Form field gaps: `space-4` (16px)
- Section separation: `space-8` to `space-12` (32-48px)
- Page margins (mobile): `space-4` (16px)
- Page margins (desktop): `space-6` to `space-8` (24-32px)

---

## Logo & Branding

### Logo Assets

| Asset | Path | Usage |
|-------|------|-------|
| Bird Mark (inline) | `/public/bird-logo.svg` | Header, navigation |
| Favicon | `/public/favicon.svg` | Browser tab icon |
| OG Image | `/public/og-image.svg` | Social sharing |

### Logo Usage

```jsx
<Link href="/" className="flex items-center gap-2">
  <img src="/bird-logo.svg" alt="" className="w-8 h-8" aria-hidden="true" />
  <span className="text-2xl font-bold text-gray-900">Olera</span>
</Link>
```

### Logo Guidelines

- Bird mark uses `primary-600` (#0D9488) and `primary-700` (#0F766E)
- Wordmark "Olera" uses `text-gray-900` (#111827)
- Minimum clear space: 8px around logo
- Standard sizes: 32px (header), 24px (mobile header)

---

## Component Patterns

### Buttons

**Primary Button** — Main CTAs, form submissions

```html
<button class="btn-primary">Get Started</button>
<button class="btn-primary-sm">Save</button>
```

- Background: `primary-600`
- Hover: `primary-700`
- Text: white
- Shape: Pill (`rounded-pill` / 9999px)
- Padding: `px-6 py-3` (default), `px-4 py-2` (small)

**Secondary Button** — Secondary actions

```html
<button class="btn-secondary">Learn More</button>
```

- Background: white
- Border: 2px `primary-600`
- Text: `primary-600`
- Shape: Pill

**Ghost Button** — Tertiary actions

```html
<button class="btn-ghost">Cancel</button>
```

- Background: transparent
- Hover: `primary-50`
- Text: `primary-600`

### Cards

```html
<div class="card p-6">
  <!-- Card content -->
</div>

<div class="card-interactive p-6">
  <!-- Clickable card content -->
</div>
```

- Background: white
- Border: 1px `gray-100`
- Border radius: `rounded-xl` (12px)
- Shadow: `shadow-card` (subtle)
- Hover shadow: `shadow-card-hover` (elevated)
- Padding: `p-6` (24px)

### Form Inputs

```html
<label class="label">Email Address</label>
<input type="email" class="input" placeholder="you@example.com" />
<p class="error-message">Please enter a valid email</p>
```

- Border: 1px `gray-300`
- Border radius: `rounded-lg` (8px)
- Focus: 2px ring `primary-500`
- Error: Border `error`, ring `error`
- Padding: `px-4 py-3`
- Min height: 44px (accessibility)

---

## Utility Classes

### Available in globals.css

| Class | Purpose |
|-------|---------|
| `.btn-primary` | Primary button |
| `.btn-primary-sm` | Small primary button |
| `.btn-secondary` | Secondary button |
| `.btn-secondary-sm` | Small secondary button |
| `.btn-ghost` | Ghost/tertiary button |
| `.card` | Static card container |
| `.card-interactive` | Clickable card with hover lift |
| `.input` | Form input field |
| `.input-error` | Input error state |
| `.label` | Form label |
| `.error-message` | Error message text |
| `.focus-ring` | Focus indicator |
| `.transition-smooth` | Smooth transition (300ms) |
| `.hover-lift` | Hover elevation effect |
| `.fade-in` | Fade in animation |
| `.slide-in` | Slide in animation |
| `.scale-in` | Scale in animation |
| `.skeleton` | Loading skeleton |

---

## Responsive Breakpoints

| Name | Width | Primary Context |
|------|-------|-----------------|
| `mobile` | < 640px | Phones (portrait) |
| `sm` | ≥ 640px | Phones (landscape), small tablets |
| `md` | ≥ 768px | Tablets |
| `lg` | ≥ 1024px | Laptops, small desktops |
| `xl` | ≥ 1280px | Desktops |
| `2xl` | ≥ 1536px | Large monitors |

### Mobile-First Rules

- Default styles target mobile
- Add complexity at larger breakpoints
- Touch targets: Minimum 44x44px
- Hover states are enhancements, not requirements

---

## Accessibility Requirements

| Requirement | Standard |
|-------------|----------|
| Color contrast | WCAG AA (4.5:1 text, 3:1 UI) |
| Touch targets | 44x44px minimum |
| Focus indicators | Visible on all interactive elements |
| Text scaling | Supports 200% zoom |
| Screen reader | Logical reading order, semantic HTML |
| Keyboard navigation | All actions reachable via keyboard |

---

## Implementation Notes

### Files Modified in Sprint 0

| File | Changes |
|------|---------|
| `tailwind.config.ts` | Color palette, font family, border radius, shadows |
| `app/globals.css` | Component utility classes |
| `app/layout.tsx` | Inter font loading |
| `public/bird-logo.svg` | Brand bird mark |
| `public/favicon.svg` | Updated favicon |
| `public/og-image.svg` | Updated social image |
| `components/Navigation/MainNav.tsx` | Logo integration |

### Approximations & Placeholders

The following are intentional approximations made during Sprint 0:

1. **Bird Logo**: Simplified SVG approximation based on reference screenshot. Not a pixel-perfect reproduction — captures visual intent (teal bird/leaf mark suggesting care and growth).

2. **Cream Background**: Color extracted from screenshot hero section. May be refined if original hex values are provided.

### Design Source of Truth

- **Visual Reference**: Screenshot provided January 19, 2026 (homepage)
- **Specification Reference**: Master Platform Manual Chapter 4
- **This Document**: Implementation documentation for developers

---

## Cross-References

- **Manual Ch 4**: Full design specifications and rationale
- **Sprint Plan Task 0.8**: Design System Foundation scope
- **Sprint 9**: UI Polish (micro-interactions, animations, advanced responsive)

---

*This document is a living reference. Update when design decisions change.*
