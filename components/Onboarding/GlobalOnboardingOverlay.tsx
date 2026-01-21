'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import OnboardingWizardOverlay from './OnboardingWizardOverlay';
import type { OnboardingIntent } from './OnboardingWizardOverlay';

/**
 * GlobalOnboardingOverlay - URL-triggered onboarding that works on ANY page.
 *
 * This component is completely independent of page-level state.
 * It reads ?onboarding=true from the URL and shows the wizard overlay.
 *
 * After completion:
 * - Marks onboarding complete in database
 * - Removes ?onboarding param from URL
 * - User sees the page they were already on
 *
 * Usage: Add to Providers.tsx (renders on all pages)
 */
export default function GlobalOnboardingOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { status } = useSession();

  // Track if we've ever triggered showing the overlay for this URL
  // This prevents hiding the overlay if conditions change mid-session
  const hasTriggeredRef = useRef(false);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [intent, setIntent] = useState<OnboardingIntent>(null);

  // Check URL params for onboarding trigger
  useEffect(() => {
    const onboardingParam = searchParams.get('onboarding');
    const intentParam = searchParams.get('intent');

    // If we have the onboarding param in URL and haven't triggered yet
    if (onboardingParam === 'true' && !hasTriggeredRef.current) {
      // Set intent immediately
      setIntent(intentParam === 'provider' ? 'provider' : null);

      // Show overlay immediately if not unauthenticated
      // During 'loading' status, we still show because user likely just signed up
      if (status !== 'unauthenticated') {
        hasTriggeredRef.current = true;
        setShowOnboarding(true);
      }
    }

    // If status becomes definitively unauthenticated and we haven't triggered,
    // don't show the overlay (user is logged out)
    if (status === 'unauthenticated' && !hasTriggeredRef.current) {
      setShowOnboarding(false);
    }
  }, [searchParams, status]);

  // Handle onboarding completion
  const handleComplete = () => {
    setShowOnboarding(false);

    // Remove onboarding params from URL without full page reload
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('onboarding');
    newParams.delete('intent');

    const newUrl = newParams.toString()
      ? `${pathname}?${newParams.toString()}`
      : pathname;

    router.replace(newUrl, { scroll: false });
  };

  // Don't render anything if not showing onboarding
  if (!showOnboarding) {
    return null;
  }

  return (
    <OnboardingWizardOverlay
      isOpen={true}
      onClose={handleComplete}
      initialIntent={intent}
      onComplete={handleComplete}
    />
  );
}
