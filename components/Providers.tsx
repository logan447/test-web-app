"use client";

import { SessionProvider } from "next-auth/react";
import ToastProvider from "./Providers/ToastProvider";
import { OnboardingTrigger } from "./Onboarding";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider />
      {children}
      {/* Global onboarding wizard overlay - listens for triggers after signup */}
      <OnboardingTrigger />
    </SessionProvider>
  );
}
