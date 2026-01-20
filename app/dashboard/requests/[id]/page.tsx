"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";

// Inner component that uses useSearchParams
function RedirectContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = params.id;
    const queryString = searchParams.toString();
    const redirectUrl = `/dashboard/my-providers/${id}${queryString ? `?${queryString}` : ''}`;
    router.replace(redirectUrl);
  }, [router, params, searchParams]);

  return null;
}

// Redirect from old /dashboard/requests/[id] to new /dashboard/my-providers/[id]
export default function RequestDetailRedirect() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Redirecting...</p>
      <Suspense fallback={null}>
        <RedirectContent />
      </Suspense>
    </div>
  );
}
