'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import OnboardingWizardOverlay from './OnboardingWizardOverlay';
import type { OnboardingIntent, ProviderSubtype, PendingActionContext } from './OnboardingWizardOverlay';
import { showToast } from '@/lib/toast';

/**
 * GlobalOnboardingOverlay - URL-triggered onboarding that works on ANY page.
 *
 * This component is completely independent of page-level state.
 * It reads ?onboarding=true from the URL and shows the wizard overlay.
 *
 * After completion:
 * - For provider intent: redirects to /provider/leads
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
  const { data: session, status, update: updateSession } = useSession();

  // Track if we've ever triggered showing the overlay for this URL
  // This prevents hiding the overlay if conditions change mid-session
  const hasTriggeredRef = useRef(false);

  // Track if handleComplete has already been called to prevent double execution
  // This can happen because OnboardingWizardOverlay calls both onComplete and onClose
  const isCompletingRef = useRef(false);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [intent, setIntent] = useState<OnboardingIntent>(null);
  const [providerSubtype, setProviderSubtype] = useState<ProviderSubtype>(null);
  const [pendingAction, setPendingAction] = useState<PendingActionContext | undefined>(undefined);
  const [isCreatingEngagement, setIsCreatingEngagement] = useState(false);

  // Check URL params for onboarding trigger
  useEffect(() => {
    const onboardingParam = searchParams.get('onboarding');
    const intentParam = searchParams.get('intent');
    const providerSubtypeParam = searchParams.get('providerSubtype');

    // If we have the onboarding param in URL and haven't triggered yet
    if (onboardingParam === 'true' && !hasTriggeredRef.current) {
      // Set intent from URL param - determines which wizard step to start on
      // - 'provider' → provider subtype selection (or skip if providerSubtype provided)
      // - 'family' → family fields (skip intent question)
      // - null → show intent question first
      const resolvedIntent: OnboardingIntent =
        intentParam === 'provider' ? 'provider' :
        intentParam === 'family' ? 'family' :
        null;
      setIntent(resolvedIntent);

      // Set provider subtype if provided (skips subtype selection step)
      // - 'individual' → skip to individual caregiver fields
      // - 'organization' → skip to organization fields
      const resolvedSubtype: ProviderSubtype =
        providerSubtypeParam === 'individual' ? 'individual' :
        providerSubtypeParam === 'organization' ? 'organization' :
        null;
      setProviderSubtype(resolvedSubtype);

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
    // Prevent double execution - OnboardingWizardOverlay calls both onComplete and onClose
    if (isCompletingRef.current) {
      console.log('[GlobalOnboarding] handleComplete already running, skipping duplicate call');
      return;
    }
    isCompletingRef.current = true;

    setShowOnboarding(false);

    // Provider intent: redirect to provider home base (leads)
    if (intent === 'provider') {
      showToast.success('Welcome! Start connecting with families who match your services.');
      router.push('/provider/leads');
      return;
    }

    // Family intent with pending action: create engagement (profile-as-request model)
    // The profile itself becomes the request - no separate form needed
    if (pendingAction && pendingAction.type === 'contact') {
      setIsCreatingEngagement(true);

      try {
        console.log('[GlobalOnboarding] Starting engagement creation flow');
        console.log('[GlobalOnboarding] Pending action:', JSON.stringify(pendingAction));

        // Step 1: Verify family profile exists before attempting engagement creation
        // This helps diagnose if the issue is profile not existing vs other errors
        console.log('[GlobalOnboarding] Step 1: Verifying family profile exists...');
        const profileCheckResponse = await fetch('/api/family-profiles/me');
        if (!profileCheckResponse.ok) {
          const profileStatus = profileCheckResponse.status;
          console.error(`[GlobalOnboarding] Profile check failed with status ${profileStatus}`);
          if (profileStatus === 401) {
            throw new Error('Session expired. Please refresh and try again.');
          } else if (profileStatus === 404) {
            throw new Error('Family profile not found. Please complete onboarding again.');
          } else {
            throw new Error(`Profile check failed: status ${profileStatus}`);
          }
        }
        const profileData = await profileCheckResponse.json();
        console.log('[GlobalOnboarding] Profile verified:', { id: profileData.id, userId: profileData.userId });

        // Step 2: Ensure user is in Family mode before creating engagement
        // This handles the edge case where a provider completed family onboarding
        // but is still in provider mode
        const currentMode = session?.user?.activeMode || 'FAMILY';
        if (currentMode === 'PROVIDER') {
          console.log('[GlobalOnboarding] Step 2: User in Provider mode, switching to Family mode...');
          const modeResponse = await fetch('/api/user/mode', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: 'FAMILY' }),
          });

          if (!modeResponse.ok) {
            console.error('[GlobalOnboarding] Failed to switch mode');
            throw new Error('Failed to switch to Family mode. Please try again.');
          }

          // Update the session so subsequent API calls use the new mode
          await updateSession({ activeMode: 'FAMILY' });
          console.log('[GlobalOnboarding] Mode switched to Family');
        }

        // Step 3: Create engagement
        console.log('[GlobalOnboarding] Step 3: Creating engagement...');
        console.log('[GlobalOnboarding] Provider ID:', pendingAction.providerId);

        const response = await fetch('/api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            providerId: pendingAction.providerId,
            contactReason: pendingAction.contactReason || 'Request consultation',
            // Message is required in schema - use empty string, user can add details later
            message: '',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[GlobalOnboarding] Engagement creation failed:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData.error,
            details: errorData.details,
            fullResponse: errorData
          });

          // Provide specific error message based on error type
          if (response.status === 401) {
            throw new Error('Session expired. Please refresh the page and try again.');
          } else if (response.status === 400) {
            throw new Error(errorData.error || 'Invalid request. Please try again.');
          } else if (response.status === 500) {
            throw new Error(errorData.details || errorData.error || 'Server error. Please try again.');
          } else {
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
          }
        }

        const engagement = await response.json();
        console.log('[GlobalOnboarding] Engagement created successfully:', { id: engagement.id });

        // Validate engagement has an ID before redirecting
        if (!engagement?.id) {
          throw new Error('Engagement created but missing ID');
        }

        // Clean up URL params
        cleanupUrlParams();

        // Show success and redirect to engagement page
        showToast.success(`Connected with ${pendingAction.providerName}!`);
        router.push(`/requests/${engagement.id}`);
        return;
      } catch (error: any) {
        console.error('[GlobalOnboarding] Failed to create engagement:', error.message);
        // Show the actual error message instead of generic one
        showToast.error(error.message || 'Unable to connect right now. Please try again from the provider page.');

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
    newParams.delete('providerSubtype');
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
      initialProviderSubtype={providerSubtype}
      pendingAction={pendingAction}
      onComplete={handleComplete}
    />
  );
}
