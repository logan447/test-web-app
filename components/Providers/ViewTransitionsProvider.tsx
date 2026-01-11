'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * ViewTransitionsProvider - Enables smooth page transitions using the View Transitions API
 *
 * This component automatically enables smooth crossfade animations between page navigations
 * in browsers that support the View Transitions API (Chrome 111+, Edge 111+, Safari 18+).
 *
 * For browsers that don't support it, navigation works normally with no impact.
 */
export default function ViewTransitionsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if View Transitions API is supported
    if (typeof document === 'undefined' || !('startViewTransition' in document)) {
      return;
    }

    // Add a marker class to enable CSS-based view transitions
    document.documentElement.classList.add('view-transitions-enabled');

    return () => {
      document.documentElement.classList.remove('view-transitions-enabled');
    };
  }, []);

  // This component is just for setup, it doesn't modify the children
  return <>{children}</>;
}
