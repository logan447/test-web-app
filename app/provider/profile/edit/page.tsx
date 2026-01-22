"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import MainNav from "@/components/Navigation/MainNav";
import { triggerOnboardingAfterSignup } from "@/components/Onboarding";

/**
 * Provider Profile Edit Page
 *
 * This page triggers the onboarding wizard overlay for profile editing.
 * The overlay appears on top of the profile page, preserving context.
 */
export default function ProviderProfileEditPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Redirect to profile page and trigger onboarding overlay
    router.push("/provider/profile");

    // Small delay to ensure navigation completes before triggering overlay
    setTimeout(() => {
      triggerOnboardingAfterSignup('provider');
    }, 100);
  }, [status, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile editor...</p>
        </div>
      </div>
    </div>
  );
}
