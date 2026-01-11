'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

/**
 * ProgressBarContent - Internal component that uses useSearchParams
 */
function ProgressBarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Page change detected - finish the progress bar
    NProgress.done();
  }, [pathname, searchParams]);

  return null;
}

/**
 * ProgressBar - Shows a subtle loading bar at the top during page navigation
 *
 * This is what modern websites like GitHub, YouTube, and Linear use.
 * Provides instant page switching with a visual indicator for loading states.
 */
export default function ProgressBar() {
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

  return (
    <Suspense fallback={null}>
      <ProgressBarContent />
    </Suspense>
  );
}
