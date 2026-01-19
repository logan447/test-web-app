"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ProviderIdentity {
  id: string;
  type: string;
  onboardingComplete: boolean;
  providerId?: string | null;
}

interface UseProviderIdentityOptions {
  // Redirect to onboarding if no identity exists
  requireIdentity?: boolean;
  // Only redirect if user is in provider mode
  checkMode?: boolean;
}

interface UseProviderIdentityReturn {
  identity: ProviderIdentity | null;
  hasIdentity: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to check and manage provider identity (Manual Ch 8)
 *
 * Usage:
 * - Provider pages should use this to gate access
 * - Redirects to /provider/onboarding if no identity and requireIdentity=true
 */
export function useProviderIdentity(
  options: UseProviderIdentityOptions = {}
): UseProviderIdentityReturn {
  const { requireIdentity = false, checkMode = true } = options;
  const { data: session, status } = useSession();
  const router = useRouter();

  const [identity, setIdentity] = useState<ProviderIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isProviderMode = session?.user?.activeMode === "PROVIDER";

  const fetchIdentity = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/provider-identity");

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated, let middleware handle
          return;
        }
        throw new Error("Failed to fetch provider identity");
      }

      const data = await response.json();

      if (data.hasIdentity) {
        setIdentity(data.providerIdentity);
      } else {
        setIdentity(null);

        // Redirect to onboarding if required and user is in provider mode
        if (requireIdentity && (!checkMode || isProviderMode)) {
          router.push("/provider/onboarding");
        }
      }
    } catch (err) {
      console.error("Error fetching provider identity:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait for session to load
    if (status === "loading") return;

    // Not authenticated
    if (!session) {
      setLoading(false);
      return;
    }

    // If checkMode is true and user is not in provider mode, skip check
    if (checkMode && !isProviderMode) {
      setLoading(false);
      return;
    }

    fetchIdentity();
  }, [session, status, isProviderMode, checkMode, requireIdentity]);

  return {
    identity,
    hasIdentity: !!identity,
    loading: status === "loading" || loading,
    error,
    refetch: fetchIdentity,
  };
}

export default useProviderIdentity;
