"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

const LOCAL_STORAGE_KEY = "savedProviders";

/**
 * useSavedProviders - Unified hook for managing saved providers
 *
 * Provides consistent localStorage + server sync behavior:
 * - Always stores in localStorage for immediate persistence
 * - If authenticated, also syncs with server
 * - Merges server data on mount for cross-device sync
 *
 * This ensures consistent UX across browse page, provider detail, etc.
 */
export function useSavedProviders() {
  const { data: session } = useSession();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load saved providers from localStorage and merge with server (if authenticated)
  useEffect(() => {
    const loadSavedProviders = async () => {
      // 1. First load from localStorage for immediate display
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const ids = JSON.parse(stored);
          if (Array.isArray(ids)) {
            setSavedIds(new Set(ids));
          }
        }
      } catch (e) {
        console.error("Failed to parse saved providers from localStorage:", e);
      }

      // 2. If authenticated, merge with server data
      if (session?.user) {
        try {
          const response = await fetch("/api/saved-providers");
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
              const serverIds = data.map(
                (s: { providerId: string }) => s.providerId
              );

              setSavedIds((prev) => {
                const merged = new Set([...prev, ...serverIds]);
                // Sync merged set back to localStorage
                localStorage.setItem(
                  LOCAL_STORAGE_KEY,
                  JSON.stringify([...merged])
                );
                return merged;
              });
            }
          }
        } catch (err) {
          console.error("Failed to fetch saved providers from server:", err);
        }
      }

      setIsLoading(false);
    };

    loadSavedProviders();
  }, [session?.user]);

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
   * Updates both localStorage and server (if authenticated)
   */
  const toggleSave = useCallback(
    async (providerId: string): Promise<void> => {
      const isCurrentlySaved = savedIds.has(providerId);

      // Optimistically update UI and localStorage
      setSavedIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(providerId)) {
          newSet.delete(providerId);
        } else {
          newSet.add(providerId);
        }
        // Persist to localStorage
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...newSet]));
        return newSet;
      });

      // If authenticated, also sync to server
      if (session?.user) {
        try {
          if (isCurrentlySaved) {
            // Remove from server
            await fetch(`/api/saved-providers?providerId=${providerId}`, {
              method: "DELETE",
            });
          } else {
            // Save to server
            await fetch("/api/saved-providers", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ providerId }),
            });
          }
        } catch (err) {
          console.error("Failed to sync save to server:", err);
          // Don't revert - localStorage still has the change
        }
      }
    },
    [savedIds, session?.user]
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
