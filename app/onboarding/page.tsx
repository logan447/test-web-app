'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect page - onboarding is now handled via GlobalOnboardingOverlay.
 * This page redirects to home with onboarding param for backwards compatibility.
 */
export default function OnboardingRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home with onboarding param
    // GlobalOnboardingOverlay will handle showing the wizard
    router.replace('/?onboarding=true');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
