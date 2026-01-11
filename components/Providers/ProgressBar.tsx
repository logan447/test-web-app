'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

/**
 * ProgressBar - Shows a subtle loading bar at the top during page navigation
 *
 * This is what modern websites like GitHub, YouTube, and Linear use.
 * Provides instant page switching with a visual indicator for loading states.
 */
export default function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Configure nprogress
    NProgress.configure({
      showSpinner: false,  // No spinner, just the bar
      trickleSpeed: 100,    // Smooth animation
      minimum: 0.08,        // Start at 8%
      easing: 'ease',       // Smooth easing
      speed: 300            // Animation speed
    });
  }, []);

  useEffect(() => {
    // Page change detected - finish the progress bar
    NProgress.done();
  }, [pathname, searchParams]);

  return null;
}
