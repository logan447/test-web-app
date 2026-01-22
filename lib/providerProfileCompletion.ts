/**
 * Provider Profile Completion & Visibility Gate Configuration
 *
 * Per Sprint 2 Planning and Manual Ch 11:
 * - Visibility is gated by Tier 1 (required) fields
 * - Completion percentage includes both Tier 1 and Tier 2 fields
 * - Payment modes are part of required fields per user requirement
 */

import { ProviderType, PaymentMode } from '@prisma/client';

// ============================================
// Tier 1: Required Fields (Visibility Gate)
// These MUST be complete for the profile to be visible
// Minimal viable profile for onboarding - optimized for quick setup
// ============================================

export const PROVIDER_TIER1_FIELDS = {
  // Core identity - required for all provider types
  name: 'Organization/Facility Name',
  providerType: 'Provider Type',

  // Location - city/state required for matching
  city: 'City',
  state: 'State',

  // Services - required for matching
  careTypesOffered: 'Care Types Offered',
} as const;

// ============================================
// Tier 2: Near-Required Fields (Strongly Encouraged)
// These contribute heavily to completion % and matching
// ============================================

export const PROVIDER_TIER2_FIELDS = {
  // Profile enhancement (moved from Tier 1 for easier onboarding)
  description: 'Description',
  address: 'Street Address',
  zipCode: 'ZIP Code',
  phone: 'Phone Number',
  email: 'Email Address',
  paymentModesAccepted: 'Payment Methods Accepted',

  // Pricing transparency
  priceMin: 'Minimum Price',
  priceMax: 'Maximum Price',

  // Photos (minimum 3 for facilities)
  photos: 'Photos',
  coverPhoto: 'Cover Photo',

  // Licensing & trust
  licenseNumber: 'License Number',
  licensed: 'Licensed Status',

  // Availability
  availableSpots: 'Available Spots',
  totalCapacity: 'Total Capacity',

  // Basic services
  roomFeatures: 'Room Features',
  medicalServices: 'Medical Services',
} as const;

// ============================================
// All Trackable Fields for Completion %
// Organized by section for UI display
// ============================================

export const PROVIDER_PROFILE_SECTIONS = {
  basicInfo: {
    label: 'Basic Information',
    description: 'Core details about your organization',
    fields: {
      name: 'Organization Name',
      providerType: 'Provider Type',
      description: 'Description',
      website: 'Website',
    },
    required: ['name', 'providerType'], // description moved to optional
  },
  location: {
    label: 'Location',
    description: 'Where you provide services',
    fields: {
      address: 'Street Address',
      city: 'City',
      state: 'State',
      zipCode: 'ZIP Code',
      serviceRadius: 'Service Radius',
      latitude: 'Map Location',
      longitude: 'Map Location',
    },
    required: ['city', 'state'], // address/zipCode moved to optional
  },
  contact: {
    label: 'Contact Information',
    description: 'How families can reach you',
    fields: {
      phone: 'Phone Number',
      email: 'Email Address',
      website: 'Website',
    },
    required: [], // phone/email moved to optional for easier onboarding
  },
  services: {
    label: 'Services Offered',
    description: 'Types of care you provide',
    fields: {
      careTypesOffered: 'Care Types',
      detailedMedicalServices: 'Medical Services',
      detailedPersonalCareServices: 'Personal Care Services',
      detailedDailyLivingServices: 'Daily Living Services',
      detailedMemoryCareServices: 'Memory Care Services',
      detailedSocialRecServices: 'Social & Recreation',
    },
    required: ['careTypesOffered'],
  },
  payment: {
    label: 'Payment Options',
    description: 'Accepted payment methods and pricing',
    fields: {
      paymentModesAccepted: 'Payment Methods',
      priceMin: 'Minimum Price',
      priceMax: 'Maximum Price',
      stateWaiverPrograms: 'State Waiver Programs',
      acceptsFinancialAssistance: 'Financial Assistance',
    },
    required: [], // paymentModesAccepted moved to optional
  },
  photos: {
    label: 'Photos & Media',
    description: 'Visual representation of your facility',
    fields: {
      coverPhoto: 'Cover Photo',
      photos: 'Gallery Photos',
      virtualTourUrl: 'Virtual Tour',
    },
    required: [],
    recommendation: 'At least 5 photos for best results',
  },
  licensing: {
    label: 'Licensing & Certifications',
    description: 'Credentials and accreditations',
    fields: {
      licensed: 'Licensed',
      licenseNumber: 'License Number',
      accreditations: 'Accreditations',
      certifications: 'Certifications',
      certificateUrls: 'Certificate Documents',
    },
    required: [],
  },
  capacity: {
    label: 'Capacity & Availability',
    description: 'Current availability for new residents/clients',
    fields: {
      totalCapacity: 'Total Capacity',
      availableSpots: 'Available Spots',
      waitlistAvailable: 'Waitlist Available',
    },
    required: [],
  },
  staff: {
    label: 'Staff & Care Team',
    description: 'Information about your care team',
    fields: {
      staffToResidentRatio: 'Staff Ratio',
      staffCredentials: 'Staff Credentials',
      languagesSpoken: 'Languages Spoken',
      hasRNOnSite: 'RN On-Site',
      allStaffBackgroundChecked: 'Background Checked',
    },
    required: [],
  },
  amenities: {
    label: 'Amenities & Features',
    description: 'What your facility offers',
    fields: {
      roomFeatures: 'Room Features',
      commonAreas: 'Common Areas',
      activitiesOffered: 'Activities',
      dietaryOptions: 'Dietary Options',
      safetySecurityFeatures: 'Safety Features',
    },
    required: [],
  },
} as const;

// ============================================
// Field Value Validation
// ============================================

interface ProviderData {
  [key: string]: unknown;
}

/**
 * Check if a field has a valid value
 */
function hasValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'number') return !isNaN(value);
  if (typeof value === 'boolean') return true; // Booleans are always "filled"
  return Boolean(value);
}

/**
 * Check if provider meets Tier 1 (visibility gate) requirements
 * All Tier 1 fields must be complete for visibility
 */
export function meetsVisibilityRequirements(provider: ProviderData): boolean {
  const requiredFields = Object.keys(PROVIDER_TIER1_FIELDS);
  return requiredFields.every(field => hasValue(provider[field]));
}

/**
 * Get list of missing Tier 1 fields (visibility blockers)
 */
export function getMissingRequiredFields(provider: ProviderData): string[] {
  const missing: string[] = [];

  for (const [field, label] of Object.entries(PROVIDER_TIER1_FIELDS)) {
    if (!hasValue(provider[field])) {
      missing.push(label);
    }
  }

  return missing;
}

/**
 * Get completion items for UI display (grouped by section)
 */
export function getCompletionItems(provider: ProviderData) {
  const items: Array<{
    section: string;
    label: string;
    completed: boolean;
    description: string;
    isRequired: boolean;
  }> = [];

  for (const [sectionKey, section] of Object.entries(PROVIDER_PROFILE_SECTIONS)) {
    const sectionFields = Object.keys(section.fields);
    const requiredInSection = section.required || [];

    // Check if section is complete (all fields in section have values)
    const completedFields = sectionFields.filter(f => hasValue(provider[f]));
    const sectionComplete = completedFields.length === sectionFields.length;

    // For display, we show section-level completion
    items.push({
      section: sectionKey,
      label: section.label,
      completed: sectionComplete,
      description: section.description,
      isRequired: requiredInSection.length > 0,
    });
  }

  return items;
}

/**
 * Calculate provider profile completion percentage
 * Uses weighted scoring: required fields worth more than optional
 */
export function calculateProviderCompletionPercentage(provider: ProviderData): number {
  let totalWeight = 0;
  let completedWeight = 0;

  // Tier 1 fields - weight 3 each
  for (const field of Object.keys(PROVIDER_TIER1_FIELDS)) {
    totalWeight += 3;
    if (hasValue(provider[field])) {
      completedWeight += 3;
    }
  }

  // Tier 2 fields - weight 2 each
  for (const field of Object.keys(PROVIDER_TIER2_FIELDS)) {
    totalWeight += 2;
    if (hasValue(provider[field])) {
      completedWeight += 2;
    }
  }

  // Additional fields from sections - weight 1 each
  const tier1And2Fields = new Set([
    ...Object.keys(PROVIDER_TIER1_FIELDS),
    ...Object.keys(PROVIDER_TIER2_FIELDS),
  ]);

  for (const section of Object.values(PROVIDER_PROFILE_SECTIONS)) {
    for (const field of Object.keys(section.fields)) {
      if (!tier1And2Fields.has(field)) {
        totalWeight += 1;
        if (hasValue(provider[field])) {
          completedWeight += 1;
        }
      }
    }
  }

  return Math.round((completedWeight / totalWeight) * 100);
}

/**
 * Get completion summary for dashboard display
 */
export function getProviderCompletionSummary(provider: ProviderData) {
  const meetsVisibility = meetsVisibilityRequirements(provider);
  const missingRequired = getMissingRequiredFields(provider);
  const completionPercentage = calculateProviderCompletionPercentage(provider);
  const items = getCompletionItems(provider);

  const completedSections = items.filter(i => i.completed).length;
  const totalSections = items.length;

  return {
    meetsVisibility,
    missingRequired,
    completionPercentage,
    completedSections,
    totalSections,
    items,
    // Nudge messages based on state
    nudgeMessage: getNudgeMessage(meetsVisibility, completionPercentage, missingRequired),
    // Next action suggestion
    nextAction: getNextAction(meetsVisibility, missingRequired, items),
  };
}

/**
 * Get contextual nudge message
 */
function getNudgeMessage(
  meetsVisibility: boolean,
  completionPercentage: number,
  missingRequired: string[]
): string {
  if (!meetsVisibility) {
    if (missingRequired.length === 1) {
      return `Add ${missingRequired[0]} to make your profile visible to families`;
    }
    return `Complete ${missingRequired.length} required fields to unlock profile visibility`;
  }

  if (completionPercentage < 50) {
    return 'Complete profiles get 3x more inquiries. Add more details to stand out.';
  }

  if (completionPercentage < 80) {
    return 'Great progress! Adding photos and services details will help families find you.';
  }

  if (completionPercentage < 100) {
    return 'Almost there! A few more details will maximize your profile visibility.';
  }

  return 'Your profile is complete. Families can easily find and contact you.';
}

/**
 * Get suggested next action
 */
function getNextAction(
  meetsVisibility: boolean,
  missingRequired: string[],
  items: ReturnType<typeof getCompletionItems>
): { label: string; section: string } | null {
  // If visibility not met, prioritize first missing required field
  if (!meetsVisibility && missingRequired.length > 0) {
    // Map the missing label back to a section (updated for minimal viable profile)
    const fieldToSection: Record<string, string> = {
      'Organization/Facility Name': 'basicInfo',
      'Provider Type': 'basicInfo',
      'City': 'location',
      'State': 'location',
      'Care Types Offered': 'services',
    };

    const section = fieldToSection[missingRequired[0]] || 'basicInfo';
    return { label: `Add ${missingRequired[0]}`, section };
  }

  // Otherwise suggest first incomplete section
  const incompleteSection = items.find(i => !i.completed);
  if (incompleteSection) {
    return { label: `Complete ${incompleteSection.label}`, section: incompleteSection.section };
  }

  return null;
}

// ============================================
// Payment Mode Labels
// ============================================

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  PRIVATE_PAY: 'Private Pay',
  MEDICARE: 'Medicare',
  MEDICAID: 'Medicaid',
  LONG_TERM_CARE_INSURANCE: 'Long-Term Care Insurance',
  VA_BENEFITS: 'VA Benefits',
  STATE_WAIVER_PROGRAM: 'State Waiver Programs',
};

export const PAYMENT_MODE_DESCRIPTIONS: Record<PaymentMode, string> = {
  PRIVATE_PAY: 'Out-of-pocket payment from residents or families',
  MEDICARE: 'Federal health insurance for 65+ or disabilities',
  MEDICAID: 'State/federal program for limited income seniors',
  LONG_TERM_CARE_INSURANCE: 'Private insurance for long-term care costs',
  VA_BENEFITS: 'Benefits for veterans and eligible dependents',
  STATE_WAIVER_PROGRAM: 'Home and community-based service waivers',
};
