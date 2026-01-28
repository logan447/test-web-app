// ============================================
// Provider Comparison Utilities
// Sprint 16: Provider Comparison Tool
// ============================================

export interface ComparisonProvider {
  id: string;
  name: string;
  providerType: string;
  description: string | null;
  city: string;
  state: string;
  careTypesOffered: string[];
  coverPhoto?: string | null;
  photos?: string[];
  verified?: boolean;
  licensed?: boolean;
  insuranceVerified?: boolean;
  backgroundChecked?: boolean;
  averageRating?: number | null;
  reviewCount?: number;
  priceMin?: number | null;
  priceMax?: number | null;
  // Additional fields for comparison
  roomFeatures?: string[];
  commonAreas?: string[];
  medicalServices?: string[];
  activitiesOffered?: string[];
  dietaryOptions?: string[];
  languagesSpoken?: string[];
  capacity?: number | null;
  availableSpots?: number | null;
  yearsInBusiness?: number | null;
}

export interface ComparisonCategory {
  id: string;
  label: string;
  fields: ComparisonField[];
}

export interface ComparisonField {
  id: string;
  label: string;
  getValue: (provider: ComparisonProvider) => string | number | boolean | string[] | null | undefined;
  format?: (value: unknown, provider?: ComparisonProvider) => string;
  highlight?: "highest" | "lowest" | "boolean" | "array-count";
}

// Format provider type for display
export function formatProviderType(type: string): string {
  const typeMap: Record<string, string> = {
    HOME_CARE: "Home Care",
    HOME_HEALTH: "Home Health",
    ASSISTED_LIVING: "Assisted Living",
    INDEPENDENT_LIVING: "Independent Living",
    MEMORY_CARE: "Memory Care",
    NURSING_HOME: "Nursing Home",
    HOSPICE: "Hospice",
    REHABILITATION: "Rehabilitation",
    INDEPENDENT_CAREGIVER: "Private Caregiver",
  };
  return typeMap[type] || type.replace(/_/g, " ");
}

// Format care type for display
export function formatCareType(type: string): string {
  const typeMap: Record<string, string> = {
    COMPANION_CARE: "Companion Care",
    PERSONAL_CARE: "Personal Care",
    SKILLED_NURSING: "Skilled Nursing",
    MEMORY_CARE: "Memory Care",
    HOSPICE_CARE: "Hospice Care",
    RESPITE_CARE: "Respite Care",
    LIVE_IN_CARE: "Live-In Care",
  };
  return typeMap[type] || type.replace(/_/g, " ");
}

// Format price range for display
export function formatPriceRange(min?: number | null, max?: number | null): string {
  if (!min && !max) return "Contact for pricing";
  if (min && max) {
    if (min === max) return `$${min.toLocaleString()}/mo`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}/mo`;
  }
  if (min) return `From $${min.toLocaleString()}/mo`;
  if (max) return `Up to $${max.toLocaleString()}/mo`;
  return "Contact for pricing";
}

// Format rating for display
export function formatRating(rating?: number | null, reviewCount?: number): string {
  if (!rating) return "No reviews yet";
  const stars = rating.toFixed(1);
  const reviews = reviewCount ? ` (${reviewCount} review${reviewCount !== 1 ? "s" : ""})` : "";
  return `${stars} stars${reviews}`;
}

// Get comparison categories with fields
export function getComparisonCategories(): ComparisonCategory[] {
  return [
    {
      id: "overview",
      label: "Overview",
      fields: [
        {
          id: "providerType",
          label: "Type",
          getValue: (p) => p.providerType,
          format: (v) => formatProviderType(v as string),
        },
        {
          id: "location",
          label: "Location",
          getValue: (p) => `${p.city}, ${p.state}`,
        },
        {
          id: "yearsInBusiness",
          label: "Years in Business",
          getValue: (p) => p.yearsInBusiness,
          format: (v) => (v ? `${v} years` : "Not specified"),
          highlight: "highest",
        },
      ],
    },
    {
      id: "pricing",
      label: "Pricing",
      fields: [
        {
          id: "priceRange",
          label: "Monthly Rate",
          getValue: (p) => p.priceMin || p.priceMax || null,
          format: (_, p) => formatPriceRange((p as ComparisonProvider).priceMin, (p as ComparisonProvider).priceMax),
          highlight: "lowest",
        },
      ],
    },
    {
      id: "ratings",
      label: "Ratings & Reviews",
      fields: [
        {
          id: "averageRating",
          label: "Rating",
          getValue: (p) => p.averageRating,
          format: (v, p) => formatRating(v as number | null, (p as ComparisonProvider).reviewCount),
          highlight: "highest",
        },
        {
          id: "reviewCount",
          label: "Number of Reviews",
          getValue: (p) => p.reviewCount,
          format: (v) => (v ? `${v} reviews` : "No reviews"),
          highlight: "highest",
        },
      ],
    },
    {
      id: "verification",
      label: "Trust & Verification",
      fields: [
        {
          id: "verified",
          label: "Verified",
          getValue: (p) => p.verified,
          highlight: "boolean",
        },
        {
          id: "licensed",
          label: "Licensed",
          getValue: (p) => p.licensed,
          highlight: "boolean",
        },
        {
          id: "insuranceVerified",
          label: "Insurance Verified",
          getValue: (p) => p.insuranceVerified,
          highlight: "boolean",
        },
        {
          id: "backgroundChecked",
          label: "Background Checked",
          getValue: (p) => p.backgroundChecked,
          highlight: "boolean",
        },
      ],
    },
    {
      id: "services",
      label: "Care Services",
      fields: [
        {
          id: "careTypesOffered",
          label: "Care Types",
          getValue: (p) => p.careTypesOffered,
          format: (v) => (v as string[])?.map(formatCareType).join(", ") || "Not specified",
          highlight: "array-count",
        },
      ],
    },
    {
      id: "capacity",
      label: "Capacity",
      fields: [
        {
          id: "capacity",
          label: "Total Capacity",
          getValue: (p) => p.capacity,
          format: (v) => (v ? `${v} residents` : "Not specified"),
        },
        {
          id: "availableSpots",
          label: "Available Spots",
          getValue: (p) => p.availableSpots,
          format: (v) => (v !== null && v !== undefined ? `${v} available` : "Contact provider"),
          highlight: "highest",
        },
      ],
    },
    {
      id: "amenities",
      label: "Amenities & Features",
      fields: [
        {
          id: "roomFeatures",
          label: "Room Features",
          getValue: (p) => p.roomFeatures,
          format: (v) => (v as string[])?.length ? `${(v as string[]).length} features` : "Not specified",
          highlight: "array-count",
        },
        {
          id: "commonAreas",
          label: "Common Areas",
          getValue: (p) => p.commonAreas,
          format: (v) => (v as string[])?.length ? `${(v as string[]).length} areas` : "Not specified",
          highlight: "array-count",
        },
        {
          id: "activitiesOffered",
          label: "Activities",
          getValue: (p) => p.activitiesOffered,
          format: (v) => (v as string[])?.length ? `${(v as string[]).length} activities` : "Not specified",
          highlight: "array-count",
        },
      ],
    },
    {
      id: "medical",
      label: "Medical Services",
      fields: [
        {
          id: "medicalServices",
          label: "Medical Services",
          getValue: (p) => p.medicalServices,
          format: (v) => (v as string[])?.length ? `${(v as string[]).length} services` : "Not specified",
          highlight: "array-count",
        },
      ],
    },
  ];
}

// Determine which provider has the "best" value for a field
export function getBestValue(
  providers: ComparisonProvider[],
  field: ComparisonField
): string | null {
  if (!field.highlight) return null;

  const values = providers.map((p) => ({
    id: p.id,
    value: field.getValue(p),
  }));

  switch (field.highlight) {
    case "highest": {
      const numericValues = values.filter((v) => typeof v.value === "number" && v.value !== null);
      if (numericValues.length === 0) return null;
      const max = Math.max(...numericValues.map((v) => v.value as number));
      return numericValues.find((v) => v.value === max)?.id || null;
    }
    case "lowest": {
      const numericValues = values.filter((v) => typeof v.value === "number" && v.value !== null && v.value > 0);
      if (numericValues.length === 0) return null;
      const min = Math.min(...numericValues.map((v) => v.value as number));
      return numericValues.find((v) => v.value === min)?.id || null;
    }
    case "boolean": {
      // All true values are equally "best"
      return null;
    }
    case "array-count": {
      const arrayValues = values.filter((v) => Array.isArray(v.value));
      if (arrayValues.length === 0) return null;
      const maxLength = Math.max(...arrayValues.map((v) => (v.value as unknown[]).length));
      if (maxLength === 0) return null;
      return arrayValues.find((v) => (v.value as unknown[]).length === maxLength)?.id || null;
    }
    default:
      return null;
  }
}

// Calculate a simple comparison score for quick insights
export function calculateComparisonScore(provider: ComparisonProvider): number {
  let score = 0;

  // Rating (up to 25 points)
  if (provider.averageRating) {
    score += (provider.averageRating / 5) * 25;
  }

  // Verification badges (up to 20 points)
  if (provider.verified) score += 5;
  if (provider.licensed) score += 5;
  if (provider.insuranceVerified) score += 5;
  if (provider.backgroundChecked) score += 5;

  // Review count (up to 15 points)
  if (provider.reviewCount) {
    score += Math.min(provider.reviewCount / 10, 15);
  }

  // Care types offered (up to 10 points)
  if (provider.careTypesOffered) {
    score += Math.min(provider.careTypesOffered.length * 2, 10);
  }

  // Amenities (up to 15 points)
  const amenityCount =
    (provider.roomFeatures?.length || 0) +
    (provider.commonAreas?.length || 0) +
    (provider.activitiesOffered?.length || 0);
  score += Math.min(amenityCount, 15);

  // Medical services (up to 10 points)
  if (provider.medicalServices) {
    score += Math.min(provider.medicalServices.length * 2, 10);
  }

  // Availability bonus (5 points)
  if (provider.availableSpots && provider.availableSpots > 0) {
    score += 5;
  }

  return Math.round(score);
}

// Generate comparison insights
export function generateComparisonInsights(providers: ComparisonProvider[]): string[] {
  const insights: string[] = [];

  if (providers.length < 2) return insights;

  // Rating comparison
  const withRatings = providers.filter((p) => p.averageRating);
  if (withRatings.length > 0) {
    const highest = withRatings.reduce((a, b) =>
      (a.averageRating || 0) > (b.averageRating || 0) ? a : b
    );
    if (highest.averageRating && highest.averageRating >= 4) {
      insights.push(`${highest.name} has the highest rating at ${highest.averageRating.toFixed(1)} stars`);
    }
  }

  // Price comparison
  const withPrices = providers.filter((p) => p.priceMin || p.priceMax);
  if (withPrices.length > 1) {
    const minPrice = Math.min(
      ...withPrices.map((p) => p.priceMin || p.priceMax || Infinity)
    );
    const cheapest = withPrices.find(
      (p) => (p.priceMin || p.priceMax) === minPrice
    );
    if (cheapest && minPrice !== Infinity) {
      insights.push(`${cheapest.name} has the lowest starting price at $${minPrice.toLocaleString()}/mo`);
    }
  }

  // Verification comparison
  const fullyVerified = providers.filter(
    (p) => p.verified && p.licensed && p.insuranceVerified && p.backgroundChecked
  );
  if (fullyVerified.length > 0 && fullyVerified.length < providers.length) {
    insights.push(
      `${fullyVerified.map((p) => p.name).join(" and ")} ${fullyVerified.length === 1 ? "has" : "have"} all verification badges`
    );
  }

  // Availability comparison
  const withAvailability = providers.filter(
    (p) => p.availableSpots && p.availableSpots > 0
  );
  if (withAvailability.length > 0) {
    const mostAvailable = withAvailability.reduce((a, b) =>
      (a.availableSpots || 0) > (b.availableSpots || 0) ? a : b
    );
    if (mostAvailable.availableSpots) {
      insights.push(`${mostAvailable.name} has ${mostAvailable.availableSpots} spots available`);
    }
  }

  // Reviews comparison
  const withReviews = providers.filter((p) => p.reviewCount && p.reviewCount > 0);
  if (withReviews.length > 0) {
    const mostReviewed = withReviews.reduce((a, b) =>
      (a.reviewCount || 0) > (b.reviewCount || 0) ? a : b
    );
    if (mostReviewed.reviewCount && mostReviewed.reviewCount > 5) {
      insights.push(`${mostReviewed.name} has the most reviews (${mostReviewed.reviewCount})`);
    }
  }

  return insights.slice(0, 4); // Return top 4 insights
}
