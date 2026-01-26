'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect: /caregiver/browse-organizations → /providers/browse-organizations
 * This page has been consolidated. All caregiver job-seeking flows now use
 * the canonical /providers/browse-organizations path.
 */
export default function RedirectToCanonicalBrowseOrganizations() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/providers/browse-organizations');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
