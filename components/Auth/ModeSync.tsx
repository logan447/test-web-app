'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';

/**
 * ModeSync Component
 *
 * Ensures user mode cookie is synced with session on page load
 * This handles cases where user logs in and cookie isn't set yet
 *
 * Place this component in the root layout
 */
export default function ModeSync() {
  const { data: session, status } = useSession();
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    // Only sync once per session load
    if (status === 'authenticated' && session?.user?.activeMode && !hasSyncedRef.current) {
      hasSyncedRef.current = true;

      // Sync mode cookie with session
      fetch('/api/mode/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: session.user.activeMode }),
      }).catch(err => {
        console.error('Failed to sync mode cookie:', err);
      });
    }
  }, [status, session]);

  return null; // This component doesn't render anything
}
