/**
 * Engagement Type System
 *
 * "Engagement" is the umbrella term for all provider-family interactions.
 * Specific types include:
 * - Tour: Facility visits (for facility providers)
 * - Consultation: Service discussions (for home care organizations)
 * - Interview: Individual caregiver meetings
 */

// Engagement types matching Prisma schema
export type EngagementType = "TOUR" | "CONSULTATION" | "INTERVIEW" | "INQUIRY" | "OUTREACH";

// Scheduled event types
export type ScheduledEventType = "TOUR" | "CONSULTATION" | "INTERVIEW";

// Provider types that support each engagement type
export const FACILITY_PROVIDER_TYPES = [
  "ASSISTED_LIVING",
  "MEMORY_CARE",
  "NURSING_HOME",
  "INDEPENDENT_LIVING",
  "REHABILITATION",
] as const;

export const HOME_CARE_PROVIDER_TYPES = [
  "HOME_CARE",
  "HOME_HEALTH",
  "HOSPICE",
] as const;

export const CAREGIVER_PROVIDER_TYPES = [
  "INDEPENDENT_CAREGIVER",
] as const;

/**
 * Get the primary engagement type for a provider type
 */
export function getEngagementTypeForProvider(providerType: string): EngagementType {
  if (FACILITY_PROVIDER_TYPES.includes(providerType as typeof FACILITY_PROVIDER_TYPES[number])) {
    return "TOUR";
  }
  if (CAREGIVER_PROVIDER_TYPES.includes(providerType as typeof CAREGIVER_PROVIDER_TYPES[number])) {
    return "INTERVIEW";
  }
  return "CONSULTATION";
}

/**
 * Configuration for engagement type display and behavior
 */
export interface EngagementConfig {
  type: EngagementType;
  label: string;
  actionLabel: string;
  scheduleLabel: string;
  proposalLabel: string;
  completedLabel: string;
  icon: "calendar" | "users" | "message-circle" | "briefcase";
  supportsScheduling: boolean;
  description: string;
}

const ENGAGEMENT_CONFIGS: Record<EngagementType, EngagementConfig> = {
  TOUR: {
    type: "TOUR",
    label: "Tour",
    actionLabel: "Schedule a Visit",
    scheduleLabel: "Schedule Tour",
    proposalLabel: "Tour Invitation",
    completedLabel: "Tour Completed",
    icon: "calendar",
    supportsScheduling: true,
    description: "Visit the facility in person",
  },
  CONSULTATION: {
    type: "CONSULTATION",
    label: "Consultation",
    actionLabel: "Request a Consultation",
    scheduleLabel: "Schedule Consultation",
    proposalLabel: "Consultation Invitation",
    completedLabel: "Consultation Completed",
    icon: "message-circle",
    supportsScheduling: true,
    description: "Discuss care needs and services",
  },
  INTERVIEW: {
    type: "INTERVIEW",
    label: "Interview",
    actionLabel: "Request a Meeting",
    scheduleLabel: "Schedule Interview",
    proposalLabel: "Interview Invitation",
    completedLabel: "Interview Completed",
    icon: "users",
    supportsScheduling: true,
    description: "Meet the caregiver",
  },
  INQUIRY: {
    type: "INQUIRY",
    label: "Inquiry",
    actionLabel: "Send Inquiry",
    scheduleLabel: "Follow Up",
    proposalLabel: "Inquiry",
    completedLabel: "Inquiry Resolved",
    icon: "message-circle",
    supportsScheduling: false,
    description: "Ask a general question",
  },
  OUTREACH: {
    type: "OUTREACH",
    label: "Outreach",
    actionLabel: "Reach Out",
    scheduleLabel: "Schedule Follow-up",
    proposalLabel: "Provider Outreach",
    completedLabel: "Outreach Completed",
    icon: "briefcase",
    supportsScheduling: true,
    description: "Provider-initiated contact",
  },
};

/**
 * Get engagement configuration by type
 */
export function getEngagementConfig(type: EngagementType): EngagementConfig {
  return ENGAGEMENT_CONFIGS[type] || ENGAGEMENT_CONFIGS.CONSULTATION;
}

/**
 * Get engagement configuration for a provider type
 */
export function getEngagementConfigForProvider(providerType: string): EngagementConfig {
  const engagementType = getEngagementTypeForProvider(providerType);
  return getEngagementConfig(engagementType);
}

/**
 * Get the CTA (Call to Action) text for a provider
 */
export function getProviderCTAText(providerType: string): string {
  return getEngagementConfigForProvider(providerType).actionLabel;
}

/**
 * Check if a provider type supports scheduled events (tours/consultations/interviews)
 */
export function supportsScheduledEvents(providerType: string): boolean {
  return getEngagementConfigForProvider(providerType).supportsScheduling;
}

/**
 * Format engagement type for display (lowercase with proper casing)
 */
export function formatEngagementType(type: EngagementType | string): string {
  const config = getEngagementConfig(type.toUpperCase() as EngagementType);
  return config?.label || type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

/**
 * Get engagement type from lowercase string (from hooks/useFamilyProfile)
 */
export function normalizeEngagementType(type: string): EngagementType {
  const normalized = type.toUpperCase();
  if (Object.keys(ENGAGEMENT_CONFIGS).includes(normalized)) {
    return normalized as EngagementType;
  }
  return "CONSULTATION";
}

/**
 * Get plural form of engagement type
 */
export function getEngagementTypePlural(type: EngagementType): string {
  const labels: Record<EngagementType, string> = {
    TOUR: "Tours",
    CONSULTATION: "Consultations",
    INTERVIEW: "Interviews",
    INQUIRY: "Inquiries",
    OUTREACH: "Outreach",
  };
  return labels[type] || "Engagements";
}

/**
 * Get the scheduled event section title for provider dashboard
 */
export function getScheduledEventsSectionTitle(providerType: string): string {
  const config = getEngagementConfigForProvider(providerType);
  return `Scheduled ${getEngagementTypePlural(config.type)}`;
}

/**
 * Engagement status labels for UI
 */
export const ENGAGEMENT_STATUS_LABELS = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  DECLINED: "Declined",
  CANCELLED: "Cancelled",
} as const;

/**
 * Get status badge color classes
 */
export function getStatusBadgeClasses(status: string): string {
  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    ACCEPTED: "bg-green-100 text-green-800 border-green-200",
    ACTIVE: "bg-blue-100 text-blue-800 border-blue-200",
    COMPLETED: "bg-gray-100 text-gray-800 border-gray-200",
    DECLINED: "bg-red-100 text-red-800 border-red-200",
    CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
  };
  return statusColors[status] || "bg-gray-100 text-gray-700 border-gray-200";
}
