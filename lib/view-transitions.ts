/**
 * View Transitions Utilities
 *
 * Helper functions for smooth page transitions using the View Transitions API
 */

/**
 * Navigate to a URL with a smooth transition (if supported by browser)
 *
 * @param url - The URL to navigate to
 * @param router - Next.js router instance from useRouter()
 */
export function navigateWithTransition(url: string, router: any) {
  if (typeof document !== 'undefined' && 'startViewTransition' in document) {
    // @ts-ignore - View Transitions API
    document.startViewTransition(() => {
      router.push(url);
    });
  } else {
    // Fallback for browsers without View Transitions support
    router.push(url);
  }
}

/**
 * Check if View Transitions API is supported in the current browser
 */
export function isViewTransitionsSupported(): boolean {
  return typeof document !== 'undefined' && 'startViewTransition' in document;
}

/**
 * Execute a callback with a smooth view transition
 *
 * @param callback - Function to execute during the transition
 * @param fallbackDelay - Delay in ms for browsers without View Transitions (default: 0)
 */
export function withViewTransition(callback: () => void, fallbackDelay: number = 0) {
  if (typeof document !== 'undefined' && 'startViewTransition' in document) {
    // @ts-ignore - View Transitions API
    document.startViewTransition(callback);
  } else {
    // For browsers without View Transitions, use delay if specified
    if (fallbackDelay > 0) {
      setTimeout(callback, fallbackDelay);
    } else {
      callback();
    }
  }
}
