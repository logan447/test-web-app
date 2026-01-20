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
}

const ONBOARDING_SHOWN_KEY = "olera_onboarding_shown";
const ONBOARDING_TRIGGER_KEY = "olera_onboarding_trigger";

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

  // Check if user needs onboarding (simple check - can be expanded)
  const needsOnboarding = status === "authenticated" && !hasCompletedOnboarding();

  // Check for onboarding trigger from signup redirect
  useEffect(() => {
    if (typeof window === "undefined") return;

    const trigger = sessionStorage.getItem(ONBOARDING_TRIGGER_KEY);
    if (trigger && status === "authenticated") {
      try {
        const triggerData = JSON.parse(trigger);
        setIntent(triggerData.intent || null);
        setProviderSubtype(triggerData.providerSubtype || null);
        setIsOpen(true);
        // Clear trigger after use
        sessionStorage.removeItem(ONBOARDING_TRIGGER_KEY);
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
