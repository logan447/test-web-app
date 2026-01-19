"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useProviderIdentity } from "@/hooks/useProviderIdentity";

/**
 * Provider landing page - redirects to appropriate destination:
 * - If user has provider identity → /provider/dashboard
 * - If user doesn't have provider identity → /provider/onboarding
 * - If not in provider mode → /dashboard
 */
export default function ProviderLandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { hasIdentity, loading: identityLoading } = useProviderIdentity({
    requireIdentity: false,
    checkMode: false,
  });

  useEffect(() => {
    if (status === "loading" || identityLoading) return;

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

    // In provider mode - check for identity
    if (hasIdentity) {
      router.push("/provider/dashboard");
    } else {
      router.push("/provider/onboarding");
    }
  }, [session, status, router, hasIdentity, identityLoading]);

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
