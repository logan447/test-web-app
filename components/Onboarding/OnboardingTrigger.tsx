"use client";

import {
  useOnboardingWizard,
  triggerOnboardingAfterSignup,
  openOnboardingOverlay,
} from "@/hooks/useOnboardingWizard";
import OnboardingWizardOverlay from "./OnboardingWizardOverlay";

/**
 * Component that listens for onboarding triggers and renders the wizard overlay.
 * Add this to your root layout to enable onboarding across the app.
 *
 * Architecture: Uses synchronous state initialization to avoid the
 * "flash" of the wizard opening after mount. The wizard is not rendered
 * at all during the loading state, so the first visible render shows
 * the correct open/closed state.
 *
 * Usage in layout.tsx:
 * ```tsx
 * import { OnboardingTrigger } from "@/components/Onboarding";
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <OnboardingTrigger />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export default function OnboardingTrigger() {
  const {
    isOpen,
    isLoading,
    close,
    initialIntent,
    initialProviderSubtype,
  } = useOnboardingWizard();

  // Don't render during loading to avoid flash
  // The overlay will render in its correct state once auth is determined
  if (isLoading) {
    return null;
  }

  return (
    <OnboardingWizardOverlay
      isOpen={isOpen}
      onClose={close}
      initialIntent={initialIntent}
      initialProviderSubtype={initialProviderSubtype}
    />
  );
}

// Re-export the trigger functions for convenience
export { triggerOnboardingAfterSignup, openOnboardingOverlay };
