"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { OnboardingIntent, ProviderSubtype } from "@/components/Onboarding";

interface UseOnboardingWizardOptions {
  /**
   * Pre-set intent based on entry point context
   */
  initialIntent?: OnboardingIntent;
  /**
   * Pre-set provider subtype (e.g., for claiming)
   */
  initialProviderSubtype?: ProviderSubtype;
  /**
   * Auto-open if conditions are met (new user, no profile, etc.)
   */
  autoOpen?: boolean;
}

interface UseOnboardingWizardReturn {
  isOpen: boolean;
  open: (intent?: OnboardingIntent, providerSubtype?: ProviderSubtype) => void;
  close: () => void;
  initialIntent: OnboardingIntent;
  initialProviderSubtype: ProviderSubtype;
  /**
   * Whether the user needs onboarding (new signup, no profile)
   */
  needsOnboarding: boolean;
  /**
   * Whether we're still determining if wizard should show
   * Use this to avoid rendering the wizard in a "closed" state during loading
   */
  isLoading: boolean;
}

const ONBOARDING_SHOWN_KEY = "olera_onboarding_shown";
const ONBOARDING_TRIGGER_KEY = "olera_onboarding_trigger";
// Key to persist wizard's open state across component remounts
const ONBOARDING_ACTIVE_KEY = "olera_onboarding_active";

/**
 * Read wizard state from sessionStorage synchronously.
 * This runs during useState initialization to avoid flash.
 */
function getStoredWizardState(): {
  shouldOpen: boolean;
  intent: OnboardingIntent;
  providerSubtype: ProviderSubtype;
} {
  if (typeof window === "undefined") {
    return { shouldOpen: false, intent: null, providerSubtype: null };
  }

  // Check for active state first (persisted open wizard)
  const activeState = sessionStorage.getItem(ONBOARDING_ACTIVE_KEY);
  if (activeState) {
    try {
      const data = JSON.parse(activeState);
      return {
        shouldOpen: true,
        intent: data.intent || null,
        providerSubtype: data.providerSubtype || null,
      };
    } catch {
      sessionStorage.removeItem(ONBOARDING_ACTIVE_KEY);
    }
  }

  // Check for one-time trigger from signup redirect
  const trigger = sessionStorage.getItem(ONBOARDING_TRIGGER_KEY);
  if (trigger) {
    try {
      const data = JSON.parse(trigger);
      // Migrate trigger → active state immediately (synchronously)
      // This ensures consistency even if component remounts
      sessionStorage.removeItem(ONBOARDING_TRIGGER_KEY);
      sessionStorage.setItem(
        ONBOARDING_ACTIVE_KEY,
        JSON.stringify({
          intent: data.intent || null,
          providerSubtype: data.providerSubtype || null,
        })
      );
      return {
        shouldOpen: true,
        intent: data.intent || null,
        providerSubtype: data.providerSubtype || null,
      };
    } catch {
      sessionStorage.removeItem(ONBOARDING_TRIGGER_KEY);
    }
  }

  return { shouldOpen: false, intent: null, providerSubtype: null };
}

/**
 * Hook to manage the onboarding wizard overlay state.
 *
 * Architecture: State is initialized synchronously from sessionStorage
 * to prevent the visible "flash" of the wizard opening after mount.
 * The wizard only renders when auth status is known.
 *
 * Usage:
 * ```tsx
 * const { isOpen, isLoading, close, initialIntent, initialProviderSubtype } = useOnboardingWizard();
 *
 * // Don't render wizard until we know whether to show it
 * if (isLoading) return null;
 *
 * return (
 *   <OnboardingWizardOverlay
 *     isOpen={isOpen}
 *     onClose={close}
 *     initialIntent={initialIntent}
 *     initialProviderSubtype={initialProviderSubtype}
 *   />
 * );
 * ```
 */
export function useOnboardingWizard(
  options: UseOnboardingWizardOptions = {}
): UseOnboardingWizardReturn {
  const { status } = useSession();

  // Initialize state synchronously from sessionStorage to avoid flash
  // This runs once during the first render
  const [storedState] = useState(() => getStoredWizardState());

  // Track if user explicitly closed the wizard (overrides stored state)
  const [userClosed, setUserClosed] = useState(false);

  // For manual open() calls with different intent
  const [manualOpen, setManualOpen] = useState<{
    isOpen: boolean;
    intent: OnboardingIntent;
    providerSubtype: ProviderSubtype;
  } | null>(null);

  // Computed: should the wizard be open?
  // Only show when authenticated AND (has stored state OR manual open) AND user hasn't closed
  const isAuthenticated = status === "authenticated";
  const hasStoredOpen = storedState.shouldOpen && !userClosed;
  const hasManualOpen = !!(manualOpen?.isOpen) && !userClosed;

  const isOpen: boolean = isAuthenticated && (hasStoredOpen || hasManualOpen);

  // Determine intent/providerSubtype (manual takes precedence)
  const intent = manualOpen?.intent ?? storedState.intent ?? options.initialIntent ?? null;
  const providerSubtype =
    manualOpen?.providerSubtype ?? storedState.providerSubtype ?? options.initialProviderSubtype ?? null;

  // Still loading if auth status is loading AND we have something that might open
  const isLoading: boolean = status === "loading" && (storedState.shouldOpen || !!options.autoOpen);

  // Check if user needs onboarding
  const needsOnboarding = isAuthenticated && !hasCompletedOnboarding();

  // Auto-open effect (only for autoOpen option, not for trigger-based)
  useEffect(() => {
    if (options.autoOpen && needsOnboarding && !isOpen && !userClosed) {
      setManualOpen({
        isOpen: true,
        intent: options.initialIntent || null,
        providerSubtype: options.initialProviderSubtype || null,
      });
    }
  }, [options.autoOpen, options.initialIntent, options.initialProviderSubtype, needsOnboarding, isOpen, userClosed]);

  const open = useCallback(
    (newIntent?: OnboardingIntent, newProviderSubtype?: ProviderSubtype) => {
      setUserClosed(false);
      setManualOpen({
        isOpen: true,
        intent: newIntent || options.initialIntent || null,
        providerSubtype: newProviderSubtype || options.initialProviderSubtype || null,
      });
      // Also store in sessionStorage for persistence
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          ONBOARDING_ACTIVE_KEY,
          JSON.stringify({
            intent: newIntent || options.initialIntent || null,
            providerSubtype: newProviderSubtype || options.initialProviderSubtype || null,
          })
        );
      }
    },
    [options.initialIntent, options.initialProviderSubtype]
  );

  const close = useCallback(() => {
    setUserClosed(true);
    setManualOpen(null);
    // Clear persisted state
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(ONBOARDING_ACTIVE_KEY);
    }
    // Mark onboarding as shown
    markOnboardingShown();
  }, []);

  return {
    isOpen,
    open,
    close,
    initialIntent: intent,
    initialProviderSubtype: providerSubtype,
    needsOnboarding,
    isLoading,
  };
}

/**
 * Check if onboarding has been shown to the user in this session
 */
function hasCompletedOnboarding(): boolean {
  if (typeof window === "undefined") return true;
  return sessionStorage.getItem(ONBOARDING_SHOWN_KEY) === "true";
}

/**
 * Mark onboarding as shown for this session
 */
function markOnboardingShown(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ONBOARDING_SHOWN_KEY, "true");
}

/**
 * Set a trigger to open onboarding wizard on next page load.
 * Use this after signup to trigger onboarding on the destination page.
 */
export function triggerOnboardingAfterSignup(
  intent?: OnboardingIntent,
  providerSubtype?: ProviderSubtype
): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    ONBOARDING_TRIGGER_KEY,
    JSON.stringify({ intent, providerSubtype })
  );
}

export default useOnboardingWizard;
