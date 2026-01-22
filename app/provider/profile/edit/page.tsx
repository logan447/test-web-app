"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

/**
 * Provider Profile Edit Page
 *
 * This page acts as a trigger point for the onboarding wizard.
 * It redirects to /provider/profile with URL params that trigger
 * GlobalOnboardingOverlay to display the wizard.
 *
 * Flow:
 * 1. User visits /provider/profile/edit
 * 2. Page redirects to /provider/profile?onboarding=true&intent=provider
 * 3. GlobalOnboardingOverlay reads URL params and shows wizard
 * 4. Wizard overlay appears on top of profile dashboard
 */
export default function ProviderProfileEditPage() {
  const router = useRouter();
  const { status } = useSession();
  const hasTriggered = useRef(false);

  useEffect(() => {
    // Wait for session to load
    if (status === "loading") return;

    // Prevent double triggering
    if (hasTriggered.current) return;

    // Redirect unauthenticated users to login
    if (status === "unauthenticated") {
      router.push("/login?redirect=/provider/profile/edit");
      return;
    }

    // Set trigger and navigate
    hasTriggered.current = true;

    // Navigate to profile page with URL params that trigger GlobalOnboardingOverlay
    // Using replace() so back button doesn't return to this loading page
    router.replace("/provider/profile?onboarding=true&intent=provider");
  }, [status, router]);

  // Brief loading state while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm">Opening profile editor...</p>
      </div>
    </div>
  );
}
