"use client";

import { SessionProvider } from "next-auth/react";
import ToastProvider from "./Providers/ToastProvider";

/**
 * Global providers wrapper.
 *
 * Note: Onboarding is now handled via URL parameters (?onboarding=true)
 * on individual pages (homepage, Find Families), not via a global trigger.
 * This eliminates race conditions and stale sessionStorage issues.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider />
      {children}
    </SessionProvider>
  );
}
