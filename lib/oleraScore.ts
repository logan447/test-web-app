/**
 * Olera Score Calculation System
 *
 * A transparent, data-driven rating (0-5) that helps families understand
 * provider quality, credibility, and online presence.
 *
 * Formula: Olera Score = (OR × w₁ + GR × w₂ + PC × w₃) ÷ (w₁ + w₂ + w₃)
 *
 * Components:
 * - OR (Online Reputation): Olera platform reviews average (0-5)
 * - GR (Google Reviews): Google rating adjusted for volume (0-5) - null for MVP
 * - PC (Profile Completeness): Percentage of profile fields completed (0-100% → 0-5)
 *
 * Dynamic Weighting by Review Volume:
 * - 0-5 reviews (Low):      OR 60%, GR 30%, PC 10%
 * - 6-20 reviews (Moderate): OR 45%, GR 45%, PC 10%
 * - >20 reviews (High):     OR 30%, GR 60%, PC 10%
 *
 * When GR is null (MVP): Redistribute weights to OR 90%, PC 10%
 */

import { ProviderType } from "@prisma/client";

// Fields used to calculate profile completeness
const PROFILE_FIELDS = {
  // Basic info (weight: 1 each)
  basic: ['name', 'providerType', 'description', 'address', 'city', 'state'],
  // Contact info (weight: 1 each)
  contact: ['phone', 'email', 'website'],
  // Services (weight: 1 each)
  services: ['careTypesOffered'],
  // Trust signals (weight: 1 each)
  trust: ['licensed', 'backgroundChecked', 'insuranceVerified'],
  // Media (weight: 1 each)
  media: ['coverPhoto', 'photos'],
  // Pricing (weight: 1 each)
  pricing: ['priceMin', 'priceMax', 'priceDescription'],
} as const;

// Total number of fields for completeness calculation
const TOTAL_FIELDS = Object.values(PROFILE_FIELDS).flat().length;

export interface OleraScoreInput {
  // Review data
  averageRating: number | null;  // OR - Olera reviews average (0-5)
  googleRating?: number | null;  // GR - Google rating (0-5), null for MVP
  reviewCount: number;           // For dynamic weighting tier determination

  // Profile data for completeness calculation
  provider: {
    name?: string | null;
    providerType?: ProviderType | null;
    description?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    careTypesOffered?: string[] | null;
    licensed?: boolean | null;
    backgroundChecked?: boolean | null;
    insuranceVerified?: boolean | null;
    coverPhoto?: string | null;
    photos?: string[] | null;
    priceMin?: number | null;
    priceMax?: number | null;
    priceDescription?: string | null;
    claimed?: boolean | null;
  };
}

export interface OleraScoreResult {
  score: number | null;           // 0-5 or null if cannot calculate
  tier: ScoreTier;
  label: string;
  color: string;
  breakdown: {
    or: number | null;            // Online Reputation component
    gr: number | null;            // Google Reviews component (null for MVP)
    pc: number;                   // Profile Completeness component (0-5)
    pcPercentage: number;         // Profile completeness as percentage (0-100)
    weights: {
      or: number;
      gr: number;
      pc: number;
    };
    reviewTier: 'low' | 'moderate' | 'high';
  };
  badges: ScoreBadge[];
  tooltip: string;
}

export type ScoreTier = 'exceptional' | 'excellent' | 'very_good' | 'good' | 'fair' | 'limited_data' | 'no_data';

export interface ScoreBadge {
  type: 'new_provider' | 'incomplete_profile' | 'unclaimed' | 'no_reviews';
  label: string;
  color: string;
}

/**
 * Get the review volume tier for dynamic weighting
 */
function getReviewTier(reviewCount: number): 'low' | 'moderate' | 'high' {
  if (reviewCount <= 5) return 'low';
  if (reviewCount <= 20) return 'moderate';
  return 'high';
}

/**
 * Get weights based on review volume and GR availability
 */
function getWeights(reviewTier: 'low' | 'moderate' | 'high', hasGoogleRating: boolean): { or: number; gr: number; pc: number } {
  if (!hasGoogleRating) {
    // MVP mode: No Google rating, redistribute to OR
    return { or: 0.90, gr: 0, pc: 0.10 };
  }

  switch (reviewTier) {
    case 'low':
      return { or: 0.60, gr: 0.30, pc: 0.10 };
    case 'moderate':
      return { or: 0.45, gr: 0.45, pc: 0.10 };
    case 'high':
      return { or: 0.30, gr: 0.60, pc: 0.10 };
  }
}

/**
 * Calculate profile completeness percentage
 */
export function calculateProfileCompleteness(provider: OleraScoreInput['provider']): number {
  let filledFields = 0;

  // Check basic fields
  if (provider.name) filledFields++;
  if (provider.providerType) filledFields++;
  if (provider.description && provider.description.length > 20) filledFields++;
  if (provider.address) filledFields++;
  if (provider.city) filledFields++;
  if (provider.state) filledFields++;

  // Check contact fields
  if (provider.phone) filledFields++;
  if (provider.email) filledFields++;
  if (provider.website) filledFields++;

  // Check services
  if (provider.careTypesOffered && provider.careTypesOffered.length > 0) filledFields++;

  // Check trust signals
  if (provider.licensed) filledFields++;
  if (provider.backgroundChecked) filledFields++;
  if (provider.insuranceVerified) filledFields++;

  // Check media
  if (provider.coverPhoto) filledFields++;
  if (provider.photos && provider.photos.length > 0) filledFields++;

  // Check pricing
  if (provider.priceMin != null) filledFields++;
  if (provider.priceMax != null) filledFields++;
  if (provider.priceDescription) filledFields++;

  return Math.round((filledFields / TOTAL_FIELDS) * 100);
}

/**
 * Get score tier based on numeric score
 */
function getScoreTier(score: number | null): ScoreTier {
  if (score === null) return 'no_data';
  if (score >= 4.5) return 'exceptional';
  if (score >= 4.0) return 'excellent';
  if (score >= 3.5) return 'very_good';
  if (score >= 3.0) return 'good';
  if (score >= 2.0) return 'fair';
  return 'limited_data';
}

/**
 * Get display properties for a score tier
 */
function getTierDisplay(tier: ScoreTier): { label: string; color: string } {
  switch (tier) {
    case 'exceptional':
      return { label: 'Exceptional', color: 'emerald' };
    case 'excellent':
      return { label: 'Excellent', color: 'blue' };
    case 'very_good':
      return { label: 'Very Good', color: 'teal' };
    case 'good':
      return { label: 'Good', color: 'amber' };
    case 'fair':
      return { label: 'Fair', color: 'orange' };
    case 'limited_data':
      return { label: 'Limited Data', color: 'gray' };
    case 'no_data':
      return { label: 'No Data', color: 'gray' };
  }
}

/**
 * Generate tooltip text explaining the score
 */
function generateTooltip(result: Omit<OleraScoreResult, 'tooltip'>): string {
  if (result.score === null) {
    return 'Not enough information to calculate an Olera Score. Complete more of your profile to get a score.';
  }

  const parts = [
    `Olera Score: ${result.score.toFixed(1)}/5 (${result.label})`,
    '',
    'Based on:',
  ];

  if (result.breakdown.or !== null) {
    parts.push(`• Reviews: ${result.breakdown.or.toFixed(1)}/5 (${Math.round(result.breakdown.weights.or * 100)}% weight)`);
  } else {
    parts.push('• Reviews: No reviews yet');
  }

  if (result.breakdown.gr !== null) {
    parts.push(`• Google: ${result.breakdown.gr.toFixed(1)}/5 (${Math.round(result.breakdown.weights.gr * 100)}% weight)`);
  }

  parts.push(`• Profile: ${result.breakdown.pcPercentage}% complete (${Math.round(result.breakdown.weights.pc * 100)}% weight)`);

  if (result.badges.length > 0) {
    parts.push('');
    result.badges.forEach(badge => parts.push(`ℹ️ ${badge.label}`));
  }

  return parts.join('\n');
}

/**
 * Calculate the Olera Score with full breakdown
 */
export function calculateOleraScore(input: OleraScoreInput): OleraScoreResult {
  const { averageRating, googleRating, reviewCount, provider } = input;

  // Calculate profile completeness
  const pcPercentage = calculateProfileCompleteness(provider);
  const pcScore = (pcPercentage / 100) * 5; // Convert to 0-5 scale

  // Determine review tier and weights
  const reviewTier = getReviewTier(reviewCount);
  const hasGoogleRating = googleRating != null && googleRating > 0;
  const weights = getWeights(reviewTier, hasGoogleRating);

  // Collect badges
  const badges: ScoreBadge[] = [];

  // Check for unclaimed provider
  if (!provider.claimed) {
    badges.push({
      type: 'unclaimed',
      label: 'Unclaimed - score based on public info',
      color: 'amber',
    });
  }

  // Check for no reviews
  if (reviewCount === 0 || averageRating === null) {
    badges.push({
      type: 'no_reviews',
      label: 'New provider - no reviews yet',
      color: 'blue',
    });
  }

  // Check for incomplete profile
  if (pcPercentage < 30) {
    badges.push({
      type: 'incomplete_profile',
      label: 'Incomplete profile',
      color: 'orange',
    });
  }

  // Calculate score
  let score: number | null = null;

  // Edge case: No data at all (no reviews AND very incomplete profile)
  if ((averageRating === null || reviewCount === 0) && pcPercentage < 20) {
    // Cannot calculate a meaningful score
    const tier = getScoreTier(null);
    const display = getTierDisplay(tier);

    const result: Omit<OleraScoreResult, 'tooltip'> = {
      score: null,
      tier,
      label: display.label,
      color: display.color,
      breakdown: {
        or: null,
        gr: googleRating ?? null,
        pc: pcScore,
        pcPercentage,
        weights,
        reviewTier,
      },
      badges,
    };

    return {
      ...result,
      tooltip: generateTooltip(result),
    };
  }

  // Edge case: No reviews but decent profile - use PC only
  if (averageRating === null || reviewCount === 0) {
    score = pcScore;
  } else {
    // Normal calculation
    let weightedSum = 0;
    let totalWeight = 0;

    // Add OR component
    if (averageRating !== null) {
      weightedSum += averageRating * weights.or;
      totalWeight += weights.or;
    }

    // Add GR component (if available)
    if (hasGoogleRating) {
      weightedSum += googleRating! * weights.gr;
      totalWeight += weights.gr;
    }

    // Add PC component
    weightedSum += pcScore * weights.pc;
    totalWeight += weights.pc;

    // Calculate final score
    score = totalWeight > 0 ? weightedSum / totalWeight : null;
  }

  // Round to 1 decimal place
  if (score !== null) {
    score = Math.round(score * 10) / 10;
    // Clamp to 0-5 range
    score = Math.max(0, Math.min(5, score));
  }

  const tier = getScoreTier(score);
  const display = getTierDisplay(tier);

  const result: Omit<OleraScoreResult, 'tooltip'> = {
    score,
    tier,
    label: display.label,
    color: display.color,
    breakdown: {
      or: averageRating,
      gr: googleRating ?? null,
      pc: pcScore,
      pcPercentage,
      weights,
      reviewTier,
    },
    badges,
  };

  return {
    ...result,
    tooltip: generateTooltip(result),
  };
}

/**
 * Quick helper to get just the numeric score
 */
export function getOleraScoreValue(input: OleraScoreInput): number | null {
  return calculateOleraScore(input).score;
}

/**
 * Get color class for Tailwind based on score tier
 */
export function getScoreColorClass(tier: ScoreTier, variant: 'bg' | 'text' | 'border' = 'bg'): string {
  const colorMap: Record<ScoreTier, Record<string, string>> = {
    exceptional: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-500' },
    excellent: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-500' },
    very_good: { bg: 'bg-teal-500', text: 'text-teal-600', border: 'border-teal-500' },
    good: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-500' },
    fair: { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-500' },
    limited_data: { bg: 'bg-gray-400', text: 'text-gray-500', border: 'border-gray-400' },
    no_data: { bg: 'bg-gray-300', text: 'text-gray-400', border: 'border-gray-300' },
  };

  return colorMap[tier][variant];
}
