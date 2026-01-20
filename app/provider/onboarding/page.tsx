'use client';

/**
 * Provider Onboarding Route Reconciliation (Manual Ch 3)
 *
 * This route is DEPRECATED in favor of the shared onboarding wizard overlay.
 * It now redirects to /provider/find-families and triggers the onboarding overlay.
 *
 * Per Manual Ch 3 "Route Reconciliation":
 * - Direct navigation to /provider/onboarding → Redirect to /provider/find-families + trigger overlay
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { triggerOnboardingAfterSignup } from '@/components/Onboarding';

export default function ProviderOnboarding() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      // Not logged in - redirect to login with return URL
      router.push('/login?redirect=/provider/find-families');
      return;
    }

    // Authenticated - trigger onboarding wizard and redirect to provider landing
    triggerOnboardingAfterSignup('provider');
    router.replace('/provider/find-families');
  }, [status, router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Setting up your provider account...</p>
      </div>
    </div>
  );
}
