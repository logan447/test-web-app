"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface ProviderIdentity {
  id: string;
  type: string;
  onboardingComplete: boolean;
  providerId?: string | null;
}

interface UseProviderIdentityOptions {
  // DEPRECATED: Auto-redirect removed per Manual Ch 8 (gentle nudges, not forced redirects)
  // This option is now ignored - use needsOnboarding return value and show prompts instead
  requireIdentity?: boolean;
  // Only check if user is in provider mode
  checkMode?: boolean;
}

interface UseProviderIdentityReturn {
  identity: ProviderIdentity | null;
  hasIdentity: boolean;
  // True when user is in provider mode but has no identity - use to show prompts
  needsOnboarding: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to check and manage provider identity (Manual Ch 8)
 *
 * Philosophy: "Maximize visibility, gate by action" — users can explore all
 * provider pages freely. Show gentle prompts to complete onboarding instead
 * of forcing redirects.
 *
 * Usage:
 * - Call this hook on provider pages
 * - Check `needsOnboarding` to show a dismissible prompt/CTA
 * - DO NOT block page content or force redirects
 */
export function useProviderIdentity(
  options: UseProviderIdentityOptions = {}
): UseProviderIdentityReturn {
  const { checkMode = true } = options;
  const { data: session, status } = useSession();

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
        // No redirect - pages should show gentle prompts instead (Manual Ch 8)
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
  }, [session, status, isProviderMode, checkMode]);

  // User needs onboarding if they're in provider mode but have no identity
  const needsOnboarding = isProviderMode && !identity && !loading;

  return {
    identity,
    hasIdentity: !!identity,
    needsOnboarding,
    loading: status === "loading" || loading,
    error,
    refetch: fetchIdentity,
  };
}

export default useProviderIdentity;
