"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const PENDING_SAVE_KEY = "pendingSaveProvider";

/**
 * useSavedProviders - Unified hook for managing saved providers
 *
 * Requires authentication to save:
 * - If not signed in, clicking save stores the provider ID and redirects to login
 * - After login, the pending save is completed and user returns to the original page
 * - All persistence is server-side for authenticated users
 */
export function useSavedProviders() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load saved providers from server and process any pending save from pre-login redirect
  useEffect(() => {
    const loadSavedProviders = async () => {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      // 1. Load from server
      try {
        const response = await fetch("/api/saved-providers");
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const serverIds = data.map(
              (s: { providerId: string }) => s.providerId
            );
            setSavedIds(new Set(serverIds));
          }
        }
      } catch (err) {
        console.error("Failed to fetch saved providers from server:", err);
      }

      // 2. Process any pending save from pre-login redirect
      try {
        const pendingId = localStorage.getItem(PENDING_SAVE_KEY);
        if (pendingId) {
          localStorage.removeItem(PENDING_SAVE_KEY);
          await fetch("/api/saved-providers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ providerId: pendingId }),
          });
          setSavedIds((prev) => new Set([...prev, pendingId]));
        }
      } catch (err) {
        console.error("Failed to process pending save:", err);
      }

      setIsLoading(false);
    };

    if (status !== "loading") {
      loadSavedProviders();
    }
  }, [session?.user, status]);

  /**
   * Check if a provider is saved
   */
  const isSaved = useCallback(
    (providerId: string): boolean => {
      return savedIds.has(providerId);
    },
    [savedIds]
  );

  /**
   * Toggle save/unsave a provider
   * Requires authentication — redirects to login if not signed in
   */
  const toggleSave = useCallback(
    async (providerId: string): Promise<void> => {
      // If not authenticated, store pending save and redirect to login
      if (!session?.user) {
        localStorage.setItem(PENDING_SAVE_KEY, providerId);
        const callbackUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
        router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        return;
      }

      const isCurrentlySaved = savedIds.has(providerId);

      // Optimistically update UI
      setSavedIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(providerId)) {
          newSet.delete(providerId);
        } else {
          newSet.add(providerId);
        }
        return newSet;
      });

      // Sync to server
      try {
        if (isCurrentlySaved) {
          await fetch(`/api/saved-providers?providerId=${providerId}`, {
            method: "DELETE",
          });
        } else {
          await fetch("/api/saved-providers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ providerId }),
          });
        }
      } catch (err) {
        console.error("Failed to sync save to server:", err);
        // Revert on failure
        setSavedIds((prev) => {
          const reverted = new Set(prev);
          if (isCurrentlySaved) {
            reverted.add(providerId);
          } else {
            reverted.delete(providerId);
          }
          return reverted;
        });
      }
    },
    [savedIds, session?.user, pathname, searchParams, router]
  );

  /**
   * Save a provider (no-op if already saved)
   */
  const save = useCallback(
    async (providerId: string): Promise<void> => {
      if (!savedIds.has(providerId)) {
        await toggleSave(providerId);
      }
    },
    [savedIds, toggleSave]
  );

  /**
   * Unsave a provider (no-op if not saved)
   */
  const unsave = useCallback(
    async (providerId: string): Promise<void> => {
      if (savedIds.has(providerId)) {
        await toggleSave(providerId);
      }
    },
    [savedIds, toggleSave]
  );

  return {
    savedIds,
    isLoading,
    isSaved,
    toggleSave,
    save,
    unsave,
  };
}

export default useSavedProviders;
