'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

/**
 * Redirect: /caregiver/browse-organizations/[id] → /providers/browse-organizations/[id]
 * Detail pages have been consolidated to the canonical path.
 */
export default function RedirectToCanonicalOrganizationDetail() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (params.id) {
      router.replace(`/providers/browse-organizations/${params.id}`);
    } else {
      router.replace('/providers/browse-organizations');
    }
  }, [router, params.id]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
