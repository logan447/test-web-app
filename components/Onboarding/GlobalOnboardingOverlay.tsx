'use client';

import { useEffect, useState } from 'react';
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

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [intent, setIntent] = useState<OnboardingIntent>(null);

  // Check URL params for onboarding trigger
  useEffect(() => {
    const onboardingParam = searchParams.get('onboarding');
    const intentParam = searchParams.get('intent');

    // Show overlay if URL has onboarding param and user is NOT explicitly unauthenticated
    // We use !== 'unauthenticated' instead of === 'authenticated' because after a fresh
    // signup redirect, status might still be 'loading' even though user IS authenticated
    if (onboardingParam === 'true' && status !== 'unauthenticated') {
      setIntent(intentParam === 'provider' ? 'provider' : null);
      setShowOnboarding(true);
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
