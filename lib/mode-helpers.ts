import { UserRole, UserMode } from "@prisma/client";
import { Session } from "next-auth";

/**
 * Check if user can access provider features
 * All authenticated users can access provider features
 */
export function canAccessProviderFeatures(session: Session | null): boolean {
  return !!session;
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
  return mode === 'PROVIDER' ? '/provider/find-families' : '/';
}

/**
 * Check if user needs provider onboarding
 * No longer required - all users can access provider mode
 */
export function needsProviderOnboarding(session: Session | null): boolean {
  return false;
}
