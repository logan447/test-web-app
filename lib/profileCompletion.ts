/**
 * Profile Completion Utilities
 *
 * Per Manual Ch 6 and Sprint 2 task 2.0.2:
 * - Visibility is based on Profile Card Minimum Fields, NOT a fixed percentage
 * - Completion percentage is for UX feedback only (separate from visibility gate)
 */

/**
 * Profile Card Minimum fields required for visibility (Family)
 * These are the minimum fields needed to render a profile card
 */
export const FAMILY_PROFILE_CARD_MINIMUM = {
  lovedOneName: "Who needs care",
  location: "Location",
  careTypes: "Care type",
} as const;

/**
 * All trackable fields for completion percentage calculation
 * Grouped by section for UI display
 */
export const FAMILY_PROFILE_FIELDS = {
  // Core fields (Profile Card Minimum)
  core: {
    lovedOneName: "Who needs care",
    city: "City",
    state: "State",
    careTypes: "Care types",
  },
  // About loved one
  aboutLovedOne: {
    ageRange: "Age range",
    gender: "Gender",
    relationship: "Your relationship",
    livingSituation: "Living situation",
  },
  // Care needs
  careNeeds: {
    careLevel: "Level of care",
    medicalConditions: "Medical conditions",
    mobilityStatus: "Mobility status",
    dailyLivingAssistance: "Daily living assistance",
  },
  // Preferences
  preferences: {
    personalityTraits: "Personality",
    hobbiesInterests: "Hobbies & interests",
    culturalBackground: "Cultural background",
    languagePreferences: "Language preferences",
  },
  // Budget & timeline
  budgetTimeline: {
    budgetMin: "Budget minimum",
    budgetMax: "Budget maximum",
    timeline: "Timeline",
    careUrgency: "Urgency",
  },
  // Contact preferences
  contact: {
    preferredContactMethods: "Contact methods",
    bestTimeToContact: "Best time to contact",
    tourPreference: "Tour preference",
  },
} as const;

interface FamilyProfileData {
  lovedOneName?: string | null;
  city?: string | null;
  state?: string | null;
  location?: string | null;
  careTypes?: string[] | null;
  ageRange?: string | null;
  gender?: string | null;
  relationship?: string | null;
  livingSituation?: string | null;
  careLevel?: string | null;
  medicalConditions?: string[] | null;
  mobilityStatus?: string | null;
  dailyLivingAssistance?: string[] | null;
  personalityTraits?: string[] | null;
  hobbiesInterests?: string[] | null;
  culturalBackground?: string | null;
  languagePreferences?: string[] | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  timeline?: string | null;
  careUrgency?: string | null;
  preferredContactMethods?: string[] | null;
  bestTimeToContact?: string[] | null;
  tourPreference?: string | null;
}

/**
 * Check if a field has a valid value
 */
function hasValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return !isNaN(value);
  return Boolean(value);
}

/**
 * Check if profile meets Profile Card Minimum requirements for visibility
 *
 * Family Profile Card Minimum:
 * - lovedOneName (who needs care)
 * - location (city OR state OR location string)
 * - careTypes (at least one care type)
 */
export function meetsProfileCardMinimum(profile: FamilyProfileData): boolean {
  const hasName = hasValue(profile.lovedOneName);
  const hasLocation =
    hasValue(profile.city) ||
    hasValue(profile.state) ||
    hasValue(profile.location);
  const hasCareType =
    Array.isArray(profile.careTypes) && profile.careTypes.length > 0;

  return hasName && hasLocation && hasCareType;
}

/**
 * Get list of missing Profile Card Minimum fields
 * Returns human-readable field names for UI display
 */
export function getMissingCardMinimumFields(
  profile: FamilyProfileData
): string[] {
  const missing: string[] = [];

  if (!hasValue(profile.lovedOneName)) {
    missing.push(FAMILY_PROFILE_CARD_MINIMUM.lovedOneName);
  }

  const hasLocation =
    hasValue(profile.city) ||
    hasValue(profile.state) ||
    hasValue(profile.location);
  if (!hasLocation) {
    missing.push(FAMILY_PROFILE_CARD_MINIMUM.location);
  }

  if (!Array.isArray(profile.careTypes) || profile.careTypes.length === 0) {
    missing.push(FAMILY_PROFILE_CARD_MINIMUM.careTypes);
  }

  return missing;
}

/**
 * Calculate profile completion percentage (0-100)
 * This is for UX feedback only, separate from visibility rules
 */
export function calculateCompletionPercentage(
  profile: FamilyProfileData
): number {
  const allFields = [
    // Core fields (weighted higher)
    { field: profile.lovedOneName, weight: 2 },
    { field: profile.city, weight: 2 },
    { field: profile.state, weight: 2 },
    { field: profile.careTypes, weight: 2 },
    // About loved one
    { field: profile.ageRange, weight: 1 },
    { field: profile.gender, weight: 1 },
    { field: profile.relationship, weight: 1 },
    { field: profile.livingSituation, weight: 1 },
    // Care needs
    { field: profile.careLevel, weight: 1 },
    { field: profile.medicalConditions, weight: 1 },
    { field: profile.mobilityStatus, weight: 1 },
    { field: profile.dailyLivingAssistance, weight: 1 },
    // Preferences
    { field: profile.personalityTraits, weight: 1 },
    { field: profile.hobbiesInterests, weight: 1 },
    { field: profile.culturalBackground, weight: 1 },
    { field: profile.languagePreferences, weight: 1 },
    // Budget & timeline
    { field: profile.budgetMin, weight: 1 },
    { field: profile.budgetMax, weight: 1 },
    { field: profile.timeline, weight: 1 },
    { field: profile.careUrgency, weight: 1 },
    // Contact
    { field: profile.preferredContactMethods, weight: 1 },
    { field: profile.bestTimeToContact, weight: 1 },
    { field: profile.tourPreference, weight: 1 },
  ];

  const totalWeight = allFields.reduce((sum, f) => sum + f.weight, 0);
  const completedWeight = allFields.reduce(
    (sum, f) => sum + (hasValue(f.field) ? f.weight : 0),
    0
  );

  return Math.round((completedWeight / totalWeight) * 100);
}

/**
 * Validate visibility change request
 * Returns error message if visibility cannot be enabled, null if OK
 */
export function validateVisibilityChange(
  profile: FamilyProfileData,
  requestedVisibility: boolean
): string | null {
  // Turning off visibility is always allowed
  if (!requestedVisibility) {
    return null;
  }

  // Check Profile Card Minimum for enabling visibility
  const missingFields = getMissingCardMinimumFields(profile);
  if (missingFields.length > 0) {
    return `Add ${missingFields.join(", ")} to make your profile visible to providers`;
  }

  return null;
}
