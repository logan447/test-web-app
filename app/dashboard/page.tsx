'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/**
 * Dashboard Redirect Page
 *
 * Mode-aware redirect to the appropriate home page:
 * - FAMILY mode → / (browse providers)
 * - PROVIDER mode → /provider/leads (family inquiries)
 *
 * This page exists to handle any legacy links to /dashboard.
 */
export default function DashboardRedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }

    // Redirect based on active mode
    const mode = session?.user?.activeMode;
    if (mode === 'PROVIDER') {
      router.replace('/provider/leads');
    } else {
      // Default to family mode (browse providers)
      router.replace('/');
    }
  }, [status, session, router]);

  // Show minimal loading state while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm">Redirecting...</p>
      </div>
    </div>
  );
}
