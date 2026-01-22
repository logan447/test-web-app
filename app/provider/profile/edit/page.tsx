"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import MainNav from "@/components/Navigation/MainNav";
import { useOnboardingWizard } from "@/hooks/useOnboardingWizard";

// Key used by onboarding system to track if wizard was shown
const ONBOARDING_SHOWN_KEY = "olera_onboarding_shown";

/**
 * Provider Profile Edit Page
 *
 * This page directly triggers the onboarding wizard overlay for profile editing.
 * It stays on this page (not redirecting) and opens the overlay.
 */
export default function ProviderProfileEditPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { open, isOpen } = useOnboardingWizard();
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login?redirect=/provider/profile/edit");
      return;
    }

    // Only trigger once
    if (!hasTriggered && !isOpen) {
      setHasTriggered(true);
      // Clear the "shown" flag so edit mode can reopen the wizard
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(ONBOARDING_SHOWN_KEY);
      }
      // Directly open the wizard with provider intent
      open("provider");
    }
  }, [status, router, hasTriggered, isOpen, open]);

  // Handle wizard close - go back to profile
  const handleClose = () => {
    router.push("/provider/profile");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile editor...</p>
          <button
            onClick={handleClose}
            className="mt-4 text-primary-600 hover:text-primary-700 underline"
          >
            Cancel and go back
          </button>
        </div>
      </div>
    </div>
  );
}
