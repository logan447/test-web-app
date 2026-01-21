'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import OnboardingWizardOverlay from './OnboardingWizardOverlay';
import type { OnboardingIntent, PendingActionContext } from './OnboardingWizardOverlay';
import { showToast } from '@/lib/toast';

/**
 * GlobalOnboardingOverlay - URL-triggered onboarding that works on ANY page.
 *
 * This component is completely independent of page-level state.
 * It reads ?onboarding=true from the URL and shows the wizard overlay.
 *
 * After completion:
 * - For provider intent: redirects to /provider/find-families
 * - For family intent with pending action: creates engagement and redirects
 * - Otherwise: cleans up URL params
 *
 * Profile-as-Request Model:
 * When a user completes onboarding with a pending action (contact/consult/tour),
 * we automatically create an engagement by sharing their profile with the provider.
 * No separate contact form is needed.
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
  const [isCreatingEngagement, setIsCreatingEngagement] = useState(false);

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
  const handleComplete = async () => {
    setShowOnboarding(false);

    // Provider intent: redirect to provider home base (find-families)
    if (intent === 'provider') {
      router.push('/provider/find-families');
      return;
    }

    // Family intent with pending action: create engagement (profile-as-request model)
    // The profile itself becomes the request - no separate form needed
    if (pendingAction && pendingAction.type === 'contact') {
      setIsCreatingEngagement(true);

      try {
        // Create engagement by sharing profile with provider
        const response = await fetch('/api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            providerId: pendingAction.providerId,
            contactReason: pendingAction.contactReason || 'Request consultation',
            // Message is optional - user can add details on engagement page
            message: null,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create engagement');
        }

        const engagement = await response.json();

        // Clean up URL params
        cleanupUrlParams();

        // Show success and redirect to engagement page
        showToast.success(`Connected with ${pendingAction.providerName}!`);
        router.push(`/dashboard/my-providers/${engagement.id}`);
        return;
      } catch (error) {
        console.error('Failed to create engagement:', error);
        showToast.error('Something went wrong. Please try again.');

        // Clean up URL and stay on page - user can retry via CTA
        cleanupUrlParams();
        return;
      } finally {
        setIsCreatingEngagement(false);
      }
    }

    // Handle save action (no engagement needed)
    if (pendingAction && pendingAction.type === 'save') {
      try {
        await fetch('/api/saved-providers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ providerId: pendingAction.providerId }),
        });
        showToast.success(`Saved ${pendingAction.providerName}`);
      } catch (error) {
        console.error('Failed to save provider:', error);
      }
      cleanupUrlParams();
      return;
    }

    // Handle review action - still needs the review modal (different model)
    if (pendingAction && pendingAction.type === 'review') {
      // Store in sessionStorage so provider page can open review modal
      sessionStorage.setItem('pendingOnboardingAction', JSON.stringify(pendingAction));
      cleanupUrlParams();

      // Dispatch event for provider page to open review modal
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('onboardingComplete', {
          detail: pendingAction
        }));
      }, 300);
      return;
    }

    // Default: just clean up params
    cleanupUrlParams();
  };

  // Helper to clean up URL params
  const cleanupUrlParams = () => {
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
