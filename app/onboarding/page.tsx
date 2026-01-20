'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import OnboardingWizardOverlay from '@/components/Onboarding/OnboardingWizardOverlay';
import type { OnboardingIntent } from '@/components/Onboarding/OnboardingWizardOverlay';

/**
 * Dedicated Onboarding Page
 *
 * Simple, single-purpose page that handles the onboarding wizard.
 * No overlays, no complex state - just the wizard as the main content.
 *
 * URL params:
 * - intent: 'provider' | 'family' (determines initial wizard step)
 *
 * Flow:
 * 1. AuthModal redirects here after signup: /onboarding?intent=provider
 * 2. This page shows the wizard
 * 3. After completion, redirects to final destination
 */
function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [isReady, setIsReady] = useState(false);

  // Read intent from URL param
  const intentParam = searchParams.get('intent');
  const intent: OnboardingIntent = intentParam === 'provider' ? 'provider' : null;

  // Wait for auth to be determined
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      // Not logged in - redirect to login
      router.push('/login');
      return;
    }

    // Authenticated - show the wizard
    setIsReady(true);
  }, [status, router]);

  // Handle onboarding completion - redirect to final destination
  const handleComplete = () => {
    if (intent === 'provider') {
      window.location.href = '/provider/find-families';
    } else {
      window.location.href = '/';
    }
  };

  // Show loading while checking auth
  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Render the wizard as a full-page modal (always open)
  return (
    <OnboardingWizardOverlay
      isOpen={true}
      onClose={handleComplete}
      initialIntent={intent}
      onComplete={handleComplete}
    />
  );
}

// Wrapper with Suspense (required for useSearchParams)
export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
