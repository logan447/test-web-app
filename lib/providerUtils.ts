import { ProviderType } from '@prisma/client';
import {
  FACILITY_PROVIDER_TYPES,
  HOME_CARE_PROVIDER_TYPES,
  CAREGIVER_PROVIDER_TYPES,
  getEngagementConfigForProvider,
  supportsScheduledEvents,
} from './engagementUtils';

/**
 * Get context-appropriate CTA text based on provider type
 * Uses the centralized engagement system for consistency
 */
export function getProviderCTAs(providerType: ProviderType) {
  const engagementConfig = getEngagementConfigForProvider(providerType);

  // Facility types (schedule tours)
  if (FACILITY_PROVIDER_TYPES.includes(providerType as typeof FACILITY_PROVIDER_TYPES[number])) {
    return {
      primary: engagementConfig.actionLabel,
      secondary: 'Request Information',
      saved: 'View Details',
      contact: 'Contact Facility',
      requestType: 'CONSULTATION' as const,
      tourEnabled: true,
      engagementType: engagementConfig.type,
    };
  }

  // Home care agency (request consultation)
  if (HOME_CARE_PROVIDER_TYPES.includes(providerType as typeof HOME_CARE_PROVIDER_TYPES[number])) {
    return {
      primary: engagementConfig.actionLabel,
      secondary: 'Learn More',
      saved: 'View Details',
      contact: 'Contact Agency',
      requestType: 'CONSULTATION' as const,
      tourEnabled: false,
      engagementType: engagementConfig.type,
    };
  }

  // Individual caregiver (request interview/connect)
  if (CAREGIVER_PROVIDER_TYPES.includes(providerType as typeof CAREGIVER_PROVIDER_TYPES[number])) {
    return {
      primary: engagementConfig.actionLabel,
      secondary: 'View Profile',
      saved: 'View Details',
      contact: 'Message Caregiver',
      requestType: 'HIRING' as const,
      tourEnabled: false,
      engagementType: engagementConfig.type,
    };
  }

  // Default fallback
  return {
    primary: engagementConfig.actionLabel,
    secondary: 'Learn More',
    saved: 'View Details',
    contact: 'Contact Provider',
    requestType: 'CONSULTATION' as const,
    tourEnabled: false,
    engagementType: engagementConfig.type,
  };
}

/**
 * Get facility type display name
 */
export function getProviderTypeDisplay(providerType: ProviderType): string {
  const typeMap: Record<ProviderType, string> = {
    ASSISTED_LIVING: 'Assisted Living Facility',
    MEMORY_CARE: 'Memory Care Facility',
    NURSING_HOME: 'Nursing Home',
    INDEPENDENT_LIVING: 'Independent Living Community',
    HOME_CARE: 'Home Care Agency',
    HOME_HEALTH: 'Home Health Agency',
    HOSPICE: 'Hospice Care',
    REHABILITATION: 'Rehabilitation Facility',
    INDEPENDENT_CAREGIVER: 'Individual Caregiver',
  };

  return typeMap[providerType] || 'Care Provider';
}

/**
 * Determine if provider type supports tours (scheduled events)
 * Uses the centralized engagement system
 */
export function supportsTours(providerType: ProviderType): boolean {
  return supportsScheduledEvents(providerType) &&
    FACILITY_PROVIDER_TYPES.includes(providerType as typeof FACILITY_PROVIDER_TYPES[number]);
}

// Re-export engagement utilities for convenience
export { getEngagementConfigForProvider, supportsScheduledEvents } from './engagementUtils';
