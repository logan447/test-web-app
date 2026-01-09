import { ProviderType } from '@prisma/client';

/**
 * Get context-appropriate CTA text based on provider type
 */
export function getProviderCTAs(providerType: ProviderType) {
  // Facility types (schedule tours)
  const facilityTypes: ProviderType[] = [
    'ASSISTED_LIVING',
    'MEMORY_CARE',
    'NURSING_HOME',
    'INDEPENDENT_LIVING',
    'REHABILITATION',
    'HOSPICE',
  ];

  // Home care agency (request consultation)
  const homecareTypes: ProviderType[] = ['HOME_CARE', 'HOME_HEALTH'];

  // Individual caregiver (request interview/connect)
  const caregiverTypes: ProviderType[] = ['INDEPENDENT_CAREGIVER'];

  if (facilityTypes.includes(providerType)) {
    return {
      primary: 'Schedule a Tour',
      secondary: 'Request Information',
      saved: 'View Details',
      contact: 'Contact Facility',
      requestType: 'CONSULTATION' as const,
      tourEnabled: true,
    };
  }

  if (homecareTypes.includes(providerType)) {
    return {
      primary: 'Request Consultation',
      secondary: 'Learn More',
      saved: 'View Details',
      contact: 'Contact Agency',
      requestType: 'CONSULTATION' as const,
      tourEnabled: false,
    };
  }

  if (caregiverTypes.includes(providerType)) {
    return {
      primary: 'Request Interview',
      secondary: 'View Profile',
      saved: 'View Details',
      contact: 'Message Caregiver',
      requestType: 'HIRING' as const,
      tourEnabled: false,
    };
  }

  // Default fallback
  return {
    primary: 'Request Information',
    secondary: 'Learn More',
    saved: 'View Details',
    contact: 'Contact Provider',
    requestType: 'CONSULTATION' as const,
    tourEnabled: false,
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
 * Determine if provider type supports tours
 */
export function supportsTours(providerType: ProviderType): boolean {
  const tourSupportedTypes: ProviderType[] = [
    'ASSISTED_LIVING',
    'MEMORY_CARE',
    'NURSING_HOME',
    'INDEPENDENT_LIVING',
    'REHABILITATION',
  ];

  return tourSupportedTypes.includes(providerType);
}
