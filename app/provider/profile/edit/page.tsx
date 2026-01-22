"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { triggerOnboardingAfterSignup } from "@/components/Onboarding";

// Key used by onboarding system to track if wizard was shown
const ONBOARDING_SHOWN_KEY = "olera_onboarding_shown";

/**
 * Provider Profile Edit Page
 *
 * This page acts as a trigger point for the onboarding wizard.
 * It sets the sessionStorage trigger and navigates to /provider/profile
 * where the OnboardingTrigger in the root layout will display the overlay.
 *
 * Flow:
 * 1. User visits /provider/profile/edit
 * 2. Page clears "shown" flag and sets onboarding trigger
 * 3. Page navigates to /provider/profile
 * 4. OnboardingTrigger reads trigger from sessionStorage
 * 5. Wizard overlay appears on top of profile dashboard
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

    // Clear the "shown" flag so wizard can reopen for editing
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(ONBOARDING_SHOWN_KEY);
    }

    // Set the onboarding trigger - no subtype passed, wizard will ask if unknown
    // or use existing provider type from profile
    triggerOnboardingAfterSignup("provider");

    // Navigate to profile page where overlay will appear
    // Using replace() so back button doesn't return to this loading page
    router.replace("/provider/profile");
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
