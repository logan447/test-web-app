'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProviderOnboardingRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to welcome page which will open the modal
    router.push('/welcome');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-pulse text-gray-600">Redirecting to onboarding...</div>
    </div>
  );
}
