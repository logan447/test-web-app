/**
 * Care Types - Single Source of Truth
 *
 * This file provides the authoritative definition of care types for the entire platform.
 * All UI components should import from here rather than defining local constants.
 *
 * The CareType enum is defined in Prisma schema - this file provides labels, icons,
 * and descriptions for UI rendering.
 */

import { CareType } from "@prisma/client";

/**
 * Configuration for each care type including display labels, icons, and descriptions.
 */
export const CARE_TYPE_CONFIG: Record<
  CareType,
  {
    label: string; // Standard label for provider-facing UI
    description: string; // Longer description for tooltips/onboarding
    icon: string; // Emoji icon for visual identification
    familyLabel: string; // Plain language label for family-facing UI (65+ friendly)
  }
> = {
  PERSONAL_CARE: {
    label: "Personal Care",
    description:
      "Help with daily activities like bathing, dressing, and grooming",
    icon: "✋",
    familyLabel: "Help with daily activities (bathing, dressing)",
  },
  COMPANION_CARE: {
    label: "Companion Care",
    description: "Companionship, conversation, and social support",
    icon: "👥",
    familyLabel: "Companionship and social support",
  },
  SKILLED_NURSING: {
    label: "Skilled Nursing",
    description: "Medical care from a licensed nurse",
    icon: "🏥",
    familyLabel: "Medical care from a nurse",
  },
  MEMORY_CARE: {
    label: "Memory Care",
    description: "Specialized support for memory conditions and dementia",
    icon: "🧠",
    familyLabel: "Memory or dementia support",
  },
  HOSPICE_CARE: {
    label: "Hospice Care",
    description: "Comfort-focused end-of-life care",
    icon: "💜",
    familyLabel: "End-of-life comfort care",
  },
  RESPITE_CARE: {
    label: "Respite Care",
    description: "Short-term relief for family caregivers",
    icon: "🔄",
    familyLabel: "Short-term relief for family caregivers",
  },
  LIVE_IN_CARE: {
    label: "Live-In Care",
    description: "Around-the-clock in-home care",
    icon: "🏠",
    familyLabel: "24/7 in-home care",
  },
};

/**
 * All care types as an array, useful for iteration in forms.
 */
export const ALL_CARE_TYPES = Object.keys(CARE_TYPE_CONFIG) as CareType[];

/**
 * Get care type options formatted for select/checkbox components.
 *
 * @param useFamilyLabels - If true, uses plain language labels for family-facing UI
 * @returns Array of options with value, label, description, and icon
 */
export function getCareTypeOptions(useFamilyLabels = false) {
  return ALL_CARE_TYPES.map((type) => ({
    value: type,
    label: useFamilyLabels
      ? CARE_TYPE_CONFIG[type].familyLabel
      : CARE_TYPE_CONFIG[type].label,
    description: CARE_TYPE_CONFIG[type].description,
    icon: CARE_TYPE_CONFIG[type].icon,
  }));
}

/**
 * Get a single care type's display information.
 *
 * @param type - The CareType enum value
 * @param useFamilyLabel - If true, returns the family-friendly label
 * @returns The care type configuration or undefined if not found
 */
export function getCareTypeInfo(type: CareType, useFamilyLabel = false) {
  const config = CARE_TYPE_CONFIG[type];
  if (!config) return undefined;

  return {
    ...config,
    displayLabel: useFamilyLabel ? config.familyLabel : config.label,
  };
}

/**
 * Get display label for a care type.
 *
 * @param type - The CareType enum value
 * @param useFamilyLabel - If true, returns the family-friendly label
 * @returns The display label string
 */
export function getCareTypeLabel(type: CareType, useFamilyLabel = false) {
  const config = CARE_TYPE_CONFIG[type];
  if (!config) return type; // Fallback to enum value
  return useFamilyLabel ? config.familyLabel : config.label;
}

/**
 * Validate that a value is a valid CareType.
 *
 * @param value - The value to validate
 * @returns True if the value is a valid CareType
 */
export function isValidCareType(value: string): value is CareType {
  return ALL_CARE_TYPES.includes(value as CareType);
}
