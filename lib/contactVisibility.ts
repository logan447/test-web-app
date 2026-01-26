/**
 * Contact Visibility Rules
 *
 * Implements the full contact visibility matrix based on:
 * - Provider type (organization vs individual caregiver)
 * - Viewer role (family, provider, organization)
 * - Engagement status
 *
 * Rules:
 * | Viewer | Subject | Condition | Visible Fields |
 * |--------|---------|-----------|----------------|
 * | Family | Organization (agency/facility) | Always | phone, email, website, address |
 * | Family | Individual Caregiver | ACCEPTED/SCHEDULED/COMPLETED only | phone, email |
 * | Provider (any) | Family | ACCEPTED/SCHEDULED/COMPLETED only | phone, email |
 * | Organization | Individual Caregiver (hiring) | ACCEPTED/SCHEDULED/COMPLETED only | phone, email |
 * | Individual Caregiver | Organization (applying) | Always | phone, email, website |
 *
 * "Active Engagement" statuses that allow contact visibility:
 * - ACCEPTED: Provider accepted the request
 * - SCHEDULED: Meeting/tour has been scheduled
 * - COMPLETED: Engagement finished (contact may still be needed for follow-up)
 *
 * Statuses that DO NOT allow contact visibility:
 * - PENDING: Request sent but not yet accepted (no consent)
 * - DECLINED: Provider rejected the request
 * - CANCELLED: Either party cancelled
 * - EXPIRED: Request timed out
 */

import { ProviderType } from "@prisma/client";

// Provider types that are considered "organizations" (always show contact)
export const ORGANIZATION_PROVIDER_TYPES: ProviderType[] = [
  'ASSISTED_LIVING',
  'MEMORY_CARE',
  'NURSING_HOME',
  'INDEPENDENT_LIVING',
  'REHABILITATION',
  'HOME_CARE',
  'HOME_HEALTH',
  'HOSPICE',
];

// Provider types that are considered "individual caregivers" (gated contact)
export const INDIVIDUAL_PROVIDER_TYPES: ProviderType[] = [
  'INDEPENDENT_CAREGIVER',
];

// Engagement statuses that allow contact visibility
export const CONTACT_VISIBLE_STATUSES = [
  'ACCEPTED',
  'SCHEDULED',
  'COMPLETED',
] as const;

// Engagement statuses that do NOT allow contact visibility
export const CONTACT_HIDDEN_STATUSES = [
  'PENDING',
  'DECLINED',
  'CANCELLED',
  'EXPIRED',
] as const;

export type EngagementStatus =
  | typeof CONTACT_VISIBLE_STATUSES[number]
  | typeof CONTACT_HIDDEN_STATUSES[number];

export type ViewerRole = 'family' | 'organization' | 'individual_caregiver' | 'anonymous';

export type SubjectType = 'organization' | 'individual_caregiver' | 'family';

export interface ContactVisibilityInput {
  // Who is viewing
  viewerRole: ViewerRole;

  // What type of entity they're viewing
  subjectType: SubjectType;

  // For provider subjects, what type
  providerType?: ProviderType;

  // Current engagement status (if any)
  engagementStatus?: EngagementStatus | null;

  // Context: is this on a profile page, card, or engagement page?
  context: 'profile_page' | 'card' | 'engagement_page';
}

export interface ContactVisibilityResult {
  canShowPhone: boolean;
  canShowEmail: boolean;
  canShowWebsite: boolean;
  canShowAddress: boolean;
  reason: string;
}

/**
 * Check if a provider type is an organization (non-gated contact)
 */
export function isOrganizationType(providerType: ProviderType): boolean {
  return ORGANIZATION_PROVIDER_TYPES.includes(providerType);
}

/**
 * Check if a provider type is an individual caregiver (gated contact)
 */
export function isIndividualType(providerType: ProviderType): boolean {
  return INDIVIDUAL_PROVIDER_TYPES.includes(providerType);
}

/**
 * Check if an engagement status allows contact visibility
 */
export function isActiveEngagementStatus(status: EngagementStatus | null | undefined): boolean {
  if (!status) return false;
  return (CONTACT_VISIBLE_STATUSES as readonly string[]).includes(status);
}

/**
 * Determine contact visibility based on the full matrix
 */
export function getContactVisibility(input: ContactVisibilityInput): ContactVisibilityResult {
  const { viewerRole, subjectType, providerType, engagementStatus, context } = input;

  // Anonymous users see nothing
  if (viewerRole === 'anonymous') {
    return {
      canShowPhone: false,
      canShowEmail: false,
      canShowWebsite: false,
      canShowAddress: false,
      reason: 'Sign in to view contact information',
    };
  }

  // Family viewing organization: ALWAYS visible
  if (viewerRole === 'family' && subjectType === 'organization') {
    return {
      canShowPhone: true,
      canShowEmail: true,
      canShowWebsite: true,
      canShowAddress: true,
      reason: 'Organization contact information is public',
    };
  }

  // Family viewing individual caregiver: Only with active engagement
  if (viewerRole === 'family' && subjectType === 'individual_caregiver') {
    const hasActiveEngagement = isActiveEngagementStatus(engagementStatus);

    // On profile pages and cards: NEVER show contact for individuals
    if (context === 'profile_page' || context === 'card') {
      return {
        canShowPhone: false,
        canShowEmail: false,
        canShowWebsite: false,
        canShowAddress: false,
        reason: 'Contact an individual caregiver to connect',
      };
    }

    // On engagement pages: Only if active
    if (context === 'engagement_page' && hasActiveEngagement) {
      return {
        canShowPhone: true,
        canShowEmail: true,
        canShowWebsite: false,
        canShowAddress: false,
        reason: 'Contact information shared after acceptance',
      };
    }

    return {
      canShowPhone: false,
      canShowEmail: false,
      canShowWebsite: false,
      canShowAddress: false,
      reason: engagementStatus === 'PENDING'
        ? 'Contact info will be shared once your request is accepted'
        : 'Contact an individual caregiver to connect',
    };
  }

  // Provider viewing family: Only with active engagement
  if ((viewerRole === 'organization' || viewerRole === 'individual_caregiver') && subjectType === 'family') {
    const hasActiveEngagement = isActiveEngagementStatus(engagementStatus);

    if (hasActiveEngagement) {
      return {
        canShowPhone: true,
        canShowEmail: true,
        canShowWebsite: false,
        canShowAddress: false,
        reason: 'Contact information shared after acceptance',
      };
    }

    return {
      canShowPhone: false,
      canShowEmail: false,
      canShowWebsite: false,
      canShowAddress: false,
      reason: engagementStatus === 'PENDING'
        ? 'Contact info will be shared once you accept the request'
        : 'Accept a family request to view their contact information',
    };
  }

  // Organization viewing individual caregiver (hiring): Only with active engagement
  if (viewerRole === 'organization' && subjectType === 'individual_caregiver') {
    const hasActiveEngagement = isActiveEngagementStatus(engagementStatus);

    // On profile pages and cards: NEVER show contact for individuals
    if (context === 'profile_page' || context === 'card') {
      return {
        canShowPhone: false,
        canShowEmail: false,
        canShowWebsite: false,
        canShowAddress: false,
        reason: 'Send an interview request to connect',
      };
    }

    // On engagement pages: Only if active
    if (context === 'engagement_page' && hasActiveEngagement) {
      return {
        canShowPhone: true,
        canShowEmail: true,
        canShowWebsite: false,
        canShowAddress: false,
        reason: 'Contact information shared after acceptance',
      };
    }

    return {
      canShowPhone: false,
      canShowEmail: false,
      canShowWebsite: false,
      canShowAddress: false,
      reason: 'Send an interview request to connect',
    };
  }

  // Individual caregiver viewing organization (applying): ALWAYS visible
  if (viewerRole === 'individual_caregiver' && subjectType === 'organization') {
    return {
      canShowPhone: true,
      canShowEmail: true,
      canShowWebsite: true,
      canShowAddress: true,
      reason: 'Organization contact information is public',
    };
  }

  // Default: no visibility
  return {
    canShowPhone: false,
    canShowEmail: false,
    canShowWebsite: false,
    canShowAddress: false,
    reason: 'Contact information not available',
  };
}

/**
 * Helper to determine subject type from provider type
 */
export function getSubjectTypeFromProviderType(providerType: ProviderType): SubjectType {
  if (isIndividualType(providerType)) {
    return 'individual_caregiver';
  }
  return 'organization';
}

/**
 * Helper to check if any contact info can be shown
 */
export function canShowAnyContactInfo(result: ContactVisibilityResult): boolean {
  return result.canShowPhone || result.canShowEmail || result.canShowWebsite || result.canShowAddress;
}

/**
 * Simplified helper for common use case: viewing a provider
 */
export function canViewProviderContact(
  providerType: ProviderType,
  viewerRole: ViewerRole,
  engagementStatus?: EngagementStatus | null,
  context: 'profile_page' | 'card' | 'engagement_page' = 'profile_page'
): ContactVisibilityResult {
  return getContactVisibility({
    viewerRole,
    subjectType: getSubjectTypeFromProviderType(providerType),
    providerType,
    engagementStatus,
    context,
  });
}

/**
 * Simplified helper for provider viewing a family
 */
export function canViewFamilyContact(
  viewerRole: 'organization' | 'individual_caregiver',
  engagementStatus?: EngagementStatus | null
): ContactVisibilityResult {
  return getContactVisibility({
    viewerRole,
    subjectType: 'family',
    engagementStatus,
    context: 'engagement_page',
  });
}
