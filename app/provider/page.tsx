"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * Provider landing page - redirects to appropriate destination:
 * - If in provider mode → /provider/dashboard (shows onboarding prompt if needed)
 * - If not in provider mode → /dashboard
 *
 * Per Manual Ch 8: "Maximize visibility, gate by action" - no forced onboarding redirect
 */
export default function ProviderLandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    // Only redirect to login if session status is definitively unauthenticated
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Session is authenticated but data might still be loading
    if (!session) return;

    // Check if user is in provider mode
    const isProviderMode = session.user?.activeMode === "PROVIDER";

    if (!isProviderMode) {
      // Not in provider mode, redirect to family dashboard
      router.push("/dashboard");
      return;
    }

    // In provider mode - go to dashboard (which shows onboarding prompt if needed)
    router.push("/provider/dashboard");
  }, [session, status, router]);

  // Show loading state while determining redirect
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
