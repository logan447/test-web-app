"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
}

const ONBOARDING_SHOWN_KEY = "olera_onboarding_shown";
const ONBOARDING_TRIGGER_KEY = "olera_onboarding_trigger";

// Minimum time (ms) the wizard must stay open after trigger-based opening
// This prevents race conditions with other effects that might try to close it
const WIZARD_OPEN_PROTECTION_MS = 500;

/**
 * Hook to manage the onboarding wizard overlay state.
 *
 * Usage:
 * ```tsx
 * const { isOpen, open, close, initialIntent, initialProviderSubtype } = useOnboardingWizard();
 *
 * return (
 *   <>
 *     <button onClick={() => open("provider")}>Become a Provider</button>
 *     <OnboardingWizardOverlay
 *       isOpen={isOpen}
 *       onClose={close}
 *       initialIntent={initialIntent}
 *       initialProviderSubtype={initialProviderSubtype}
 *     />
 *   </>
 * );
 * ```
 */
export function useOnboardingWizard(
  options: UseOnboardingWizardOptions = {}
): UseOnboardingWizardReturn {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [intent, setIntent] = useState<OnboardingIntent>(options.initialIntent || null);
  const [providerSubtype, setProviderSubtype] = useState<ProviderSubtype>(
    options.initialProviderSubtype || null
  );

  // Ref to track whether wizard is in a "protected open" state
  // This prevents race conditions from closing the wizard prematurely
  const openProtectionRef = useRef<number | null>(null);
  // Ref to track if trigger was already processed in this session
  const triggerProcessedRef = useRef(false);

  // Check if user needs onboarding (simple check - can be expanded)
  const needsOnboarding = status === "authenticated" && !hasCompletedOnboarding();

  // Check for onboarding trigger from signup redirect
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only process trigger once per hook instance to prevent race conditions
    if (triggerProcessedRef.current) return;

    const trigger = sessionStorage.getItem(ONBOARDING_TRIGGER_KEY);
    if (trigger && status === "authenticated") {
      try {
        const triggerData = JSON.parse(trigger);
        // Mark as processed BEFORE setting state to prevent double-processing
        triggerProcessedRef.current = true;
        // Clear trigger from storage immediately
        sessionStorage.removeItem(ONBOARDING_TRIGGER_KEY);

        setIntent(triggerData.intent || null);
        setProviderSubtype(triggerData.providerSubtype || null);
        setIsOpen(true);

        // Set protection timestamp - close() will be blocked for a short period
        openProtectionRef.current = Date.now();
      } catch {
        // Invalid trigger data, ignore
        sessionStorage.removeItem(ONBOARDING_TRIGGER_KEY);
      }
    }
  }, [status]);

  // Auto-open if enabled and needed
  useEffect(() => {
    if (options.autoOpen && needsOnboarding && !isOpen) {
      setIsOpen(true);
    }
  }, [options.autoOpen, needsOnboarding, isOpen]);

  const open = useCallback(
    (newIntent?: OnboardingIntent, newProviderSubtype?: ProviderSubtype) => {
      setIntent(newIntent || options.initialIntent || null);
      setProviderSubtype(newProviderSubtype || options.initialProviderSubtype || null);
      setIsOpen(true);
    },
    [options.initialIntent, options.initialProviderSubtype]
  );

  const close = useCallback(() => {
    // Check if we're in the protection period after trigger-based opening
    if (openProtectionRef.current !== null) {
      const elapsed = Date.now() - openProtectionRef.current;
      if (elapsed < WIZARD_OPEN_PROTECTION_MS) {
        // Still in protection period - ignore close attempt
        // This prevents race conditions with other effects
        return;
      }
      // Protection period expired - clear the ref
      openProtectionRef.current = null;
    }

    setIsOpen(false);
    // Mark onboarding as shown (even if not completed)
    markOnboardingShown();
  }, []);

  return {
    isOpen,
    open,
    close,
    initialIntent: intent,
    initialProviderSubtype: providerSubtype,
    needsOnboarding,
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
