import { UserRole, UserMode } from "@prisma/client";
import { Session } from "next-auth";

/**
 * Check if user can access provider features
 * Compatibility: Works with both old role-based and new identity-based system
 */
export function canAccessProviderFeatures(session: Session | null): boolean {
  if (!session) return false;

  // New system: check for provider identity
  if (session.user.hasProviderIdentity) return true;

  // Old system: check role for backwards compatibility
  if (session.user.role === 'PROVIDER') return true;

  return false;
}

/**
 * Get current active mode
 * Compatibility: Falls back to role if activeMode not set
 */
export function getCurrentMode(session: Session | null): UserMode {
  if (!session) return 'FAMILY';

  // Use activeMode if available
  if (session.user.activeMode) {
    return session.user.activeMode;
  }

  // Fall back to role for backwards compatibility
  return session.user.role === 'PROVIDER' ? 'PROVIDER' : 'FAMILY';
}

/**
 * Check if user is in provider mode
 */
export function isProviderMode(session: Session | null): boolean {
  return getCurrentMode(session) === 'PROVIDER';
}

/**
 * Check if user is in family mode
 */
export function isFamilyMode(session: Session | null): boolean {
  return getCurrentMode(session) === 'FAMILY';
}

/**
 * Get landing page URL based on mode
 */
export function getModeLandingPage(mode: UserMode): string {
  return mode === 'PROVIDER' ? '/provider/requests' : '/';
}

/**
 * Check if user needs provider onboarding
 */
export function needsProviderOnboarding(session: Session | null): boolean {
  if (!session) return false;

  // If trying to access provider mode without provider identity
  return isProviderMode(session) && !session.user.hasProviderIdentity;
}
