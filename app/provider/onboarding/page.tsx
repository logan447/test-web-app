'use client';

/**
 * Provider Onboarding Route - Redirect to Leads Page with Onboarding
 *
 * This route redirects to the provider leads page with onboarding overlay.
 * New providers will see the onboarding wizard overlay on the leads page.
 *
 * This redirect ensures backwards compatibility for any bookmarks
 * or old links that point to /provider/onboarding.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function ProviderOnboarding() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      // Not logged in - redirect to login with return URL to leads with onboarding
      router.push('/login?redirect=/provider/leads?onboarding=true&intent=provider');
      return;
    }

    // Authenticated - redirect to leads page with onboarding overlay
    router.replace('/provider/leads?onboarding=true&intent=provider');
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
