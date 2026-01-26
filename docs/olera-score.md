# Olera Score

> A transparent, data-driven rating (0-5) that helps families understand provider quality, credibility, and online presence.

---

## What It Measures

The Olera Score combines three components:

| Component | Description | Scale |
|-----------|-------------|-------|
| **OR** (Online Reputation) | Synthesized reputation from Olera reviews, directories, official records | 0-5 |
| **GR** (Google Reviews) | Adjusted Google rating accounting for volume and recency | 0-5 |
| **PC** (Profile Completeness) | How complete and up-to-date the provider's Olera profile is | 0-100% → 0-5 |

---

## Calculation Formula

```
Olera Score = (OR × w₁ + GR × w₂ + PC × w₃) ÷ (w₁ + w₂ + w₃)
```

### Dynamic Weighting by Review Volume

Weights shift based on how much review data is available:

| Review Count | Tier | OR Weight (w₁) | GR Weight (w₂) | PC Weight (w₃) |
|--------------|------|----------------|----------------|----------------|
| 0-5 | Low | 60% | 30% | 10% |
| 6-20 | Moderate | 45% | 45% | 10% |
| >20 | High | 30% | 60% | 10% |

**Why dynamic weighting?**
- Prevents new providers from being unfairly penalized
- Rewards established providers with strong review histories
- Profile Completeness always contributes (10%) regardless of review volume

---

## Example Calculation

A provider with:
- 15 reviews (moderate tier)
- Online Reputation: 4.2
- Google Reviews: 3.8
- Profile Completeness: 85% (= 4.25 on 0-5 scale)

**Calculation**:
```
Olera Score = (4.2 × 0.45 + 3.8 × 0.45 + 4.25 × 0.10) ÷ 1.0
            = (1.89 + 1.71 + 0.425)
            = 4.025 ≈ 4.0
```

---

## MVP Implementation

For MVP, we use available data:

| Component | MVP Source | Future Enhancement |
|-----------|------------|-------------------|
| **OR** | Average of Olera platform reviews | External directory aggregation |
| **GR** | Placeholder (null) | Google Places API integration |
| **PC** | Profile field completion % | Weighted by field importance |

### Profile Completeness Calculation

Fields counted for completeness:
- Basic: name, type, description, address
- Contact: phone, email, website
- Services: careTypesOffered, certifications
- Trust: licensed, backgroundChecked, insuranceVerified
- Media: photos, coverPhoto
- Pricing: priceMin, priceMax, priceDescription

Formula: `(filledFields / totalFields) × 5`

---

## Score Display Guidelines

### Badge Variants

| Score Range | Label | Color |
|-------------|-------|-------|
| 4.5-5.0 | Exceptional | Emerald |
| 4.0-4.4 | Excellent | Blue |
| 3.5-3.9 | Very Good | Teal |
| 3.0-3.4 | Good | Amber |
| 2.0-2.9 | Fair | Orange |
| <2.0 | Limited Data | Gray |

### Display Rules

1. **Always show score** on claimed provider pages
2. **Show "Limited Data" indicator** on unclaimed providers with insufficient data
3. **Never show 0 or N/A** - always provide meaningful context
4. **Include tooltip** explaining what the score means

---

## How Providers Improve Their Score

| Action | Impact |
|--------|--------|
| Complete profile fields | Direct PC improvement |
| Encourage family reviews on Olera | Improves OR |
| Respond to reviews | Signals engagement |
| Maintain Google reviews | Improves GR (when integrated) |
| Verify credentials | Adds trust signals (bonus points) |

**Important**: Payment cannot improve scores. Only real data and actions can.

---

## Unclaimed Provider Handling

Unclaimed providers (seeded from public data):

1. **Score is calculated** from available data (typically low due to incomplete profile)
2. **"Unclaimed" badge** displayed alongside score
3. **Call-to-action**: "Claim this profile to improve your score"
4. **Tooltip**: "This provider hasn't claimed their profile. Score is based on public information only."

---

## Technical Implementation

### Location
- Calculation: `lib/oleraScore.ts`
- Display: `components/Trust/OleraScore.tsx`

### Function Signature
```typescript
interface OleraScoreInput {
  averageRating: number | null;  // OR - Olera reviews average
  googleRating?: number | null;  // GR - Google rating (future)
  reviewCount: number;           // For dynamic weighting
  profileCompleteness: number;   // PC - 0-100 percentage
  // Trust bonuses (additive)
  verified?: boolean;
  licensed?: boolean;
  insuranceVerified?: boolean;
  backgroundChecked?: boolean;
}

function calculateOleraScore(input: OleraScoreInput): {
  score: number;        // 0-5
  tier: string;         // "Exceptional" | "Excellent" | etc.
  breakdown: {
    or: number;
    gr: number | null;
    pc: number;
    weights: { or: number; gr: number; pc: number };
  };
}
```

---

## Design Principles

1. **Fair**: New providers aren't punished for limited history
2. **Balanced**: Established providers benefit from verified reviews
3. **Transparent**: Clear inputs, visible methodology
4. **Non-pay-to-win**: No payment-based score manipulation
5. **Actionable**: Providers know exactly how to improve

---

*Last Updated: January 26, 2025*
