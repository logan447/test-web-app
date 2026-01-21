'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import OnboardingWizardOverlay from './OnboardingWizardOverlay';
import type { OnboardingIntent, PendingActionContext } from './OnboardingWizardOverlay';

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
  const [pendingAction, setPendingAction] = useState<PendingActionContext | undefined>(undefined);

  // Check URL params for onboarding trigger
  useEffect(() => {
    const onboardingParam = searchParams.get('onboarding');
    const intentParam = searchParams.get('intent');

    // If we have the onboarding param in URL and haven't triggered yet
    if (onboardingParam === 'true' && !hasTriggeredRef.current) {
      // Set intent from URL param - determines which wizard step to start on
      // - 'provider' → provider subtype selection
      // - 'family' → family fields (skip intent question)
      // - null → show intent question first
      const resolvedIntent: OnboardingIntent =
        intentParam === 'provider' ? 'provider' :
        intentParam === 'family' ? 'family' :
        null;
      setIntent(resolvedIntent);

      // Read pending action context (for contextual handoff)
      const actionType = searchParams.get('action');
      const actionProviderId = searchParams.get('actionProviderId');
      if (actionType && actionProviderId) {
        setPendingAction({
          type: actionType as 'save' | 'review' | 'contact',
          providerId: actionProviderId,
          providerName: searchParams.get('actionProviderName') || undefined,
          contactReason: searchParams.get('actionContactReason') || undefined,
        });
      }

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

    // Provider intent: redirect to provider home base (find-families)
    if (intent === 'provider') {
      router.push('/provider/find-families');
      router.refresh();
      return;
    }

    // Family intent with pending action: trigger action execution seamlessly
    // Option B: No page reload - dispatch event so page can open modal immediately
    if (pendingAction) {
      // Store action in sessionStorage as backup (in case event is missed)
      sessionStorage.setItem('pendingOnboardingAction', JSON.stringify(pendingAction));

      // Clean up URL params
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('onboarding');
      newParams.delete('intent');
      newParams.delete('action');
      newParams.delete('actionProviderId');
      newParams.delete('actionProviderName');
      newParams.delete('actionContactReason');

      const newUrl = newParams.toString()
        ? `${pathname}?${newParams.toString()}`
        : pathname;

      // Use router.replace (no reload) + dispatch custom event for seamless transition
      router.replace(newUrl, { scroll: false });

      // Dispatch custom event so provider page can open contact form immediately
      // Small delay to ensure URL is updated first
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('onboardingComplete', {
          detail: pendingAction
        }));
      }, 100);
      return;
    }

    // Default: just clean up all params
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('onboarding');
    newParams.delete('intent');
    newParams.delete('action');
    newParams.delete('actionProviderId');
    newParams.delete('actionProviderName');
    newParams.delete('actionContactReason');

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
      pendingAction={pendingAction}
      onComplete={handleComplete}
    />
  );
}
