"use client";

import { useEffect } from "react";
import { useOnboardingWizard, triggerOnboardingAfterSignup } from "@/hooks/useOnboardingWizard";
import OnboardingWizardOverlay from "./OnboardingWizardOverlay";

/**
 * Component that listens for onboarding triggers and renders the wizard overlay.
 * Add this to your root layout to enable onboarding across the app.
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
    close,
    initialIntent,
    initialProviderSubtype,
  } = useOnboardingWizard({ autoOpen: true });

  return (
    <OnboardingWizardOverlay
      isOpen={isOpen}
      onClose={close}
      initialIntent={initialIntent}
      initialProviderSubtype={initialProviderSubtype}
    />
  );
}

// Re-export the trigger function for convenience
export { triggerOnboardingAfterSignup };
