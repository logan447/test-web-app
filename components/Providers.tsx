"use client";

import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import ToastProvider from "./Providers/ToastProvider";
import GlobalOnboardingOverlay from "./Onboarding/GlobalOnboardingOverlay";

/**
 * Global providers wrapper.
 *
 * Includes GlobalOnboardingOverlay which:
 * - Reads ?onboarding=true from URL on ANY page
 * - Shows overlay independent of page-level state
 * - Removes param after completion
 *
 * This ensures onboarding works reliably regardless of which page the user lands on.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider />
      {children}
      {/* Global onboarding overlay - reads URL params, independent of page state */}
      <Suspense fallback={null}>
        <GlobalOnboardingOverlay />
      </Suspense>
    </SessionProvider>
  );
}
