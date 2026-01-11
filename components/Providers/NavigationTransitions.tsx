'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * NavigationTransitions - Intercepts all navigation and wraps it in smooth View Transitions
 *
 * This provides the same delightful smooth feel as mode switching for ALL page navigation
 */
export default function NavigationTransitions({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only run on client side and if View Transitions are supported
    if (typeof window === 'undefined' || !('startViewTransition' in document)) {
      return;
    }

    // Intercept all Link clicks and wrap in View Transitions
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Find the closest anchor tag
      const anchor = target.closest('a');

      if (!anchor) return;

      // Check if it's an internal link (same origin)
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      // Check if it's a different page (not just hash change)
      const url = new URL(href, window.location.href);
      if (url.pathname === pathname && !url.search) {
        return;
      }

      // Prevent default navigation
      e.preventDefault();

      // Perform navigation with smooth transition
      // @ts-ignore
      document.startViewTransition(() => {
        router.push(href);
      });
    };

    // Add click listener
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [router, pathname]);

  return <>{children}</>;
}
