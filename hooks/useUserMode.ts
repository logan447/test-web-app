'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

type UserMode = 'FAMILY' | 'PROVIDER';

/**
 * useUserMode Hook
 *
 * Reliable mode detection that works immediately on client-side
 * Reads from user-mode-display cookie (set by /api/mode/set)
 *
 * This is the SOURCE OF TRUTH for UI display
 * Falls back to session if cookie not present
 */
export function useUserMode(): UserMode {
  const { data: session } = useSession();
  const [mode, setMode] = useState<UserMode>('FAMILY');

  useEffect(() => {
    // Read mode from client-readable cookie
    const cookies = document.cookie.split(';');
    const modeCookie = cookies.find(c => c.trim().startsWith('user-mode-display='));

    if (modeCookie) {
      const cookieValue = modeCookie.split('=')[1] as UserMode;
      setMode(cookieValue);
    } else if (session?.user?.activeMode) {
      // Fallback to session if cookie not present
      setMode(session.user.activeMode as UserMode);
    }
  }, [session]);

  return mode;
}

/**
 * getCookieValue - Utility function
 * Read cookie value directly (synchronous)
 */
export function getModeFromCookie(): UserMode | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  const modeCookie = cookies.find(c => c.trim().startsWith('user-mode-display='));

  if (modeCookie) {
    return modeCookie.split('=')[1].trim() as UserMode;
  }

  return null;
}
