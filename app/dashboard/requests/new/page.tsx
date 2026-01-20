"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Inner component that uses useSearchParams
function RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const queryString = searchParams.toString();
    const redirectUrl = `/dashboard/my-providers/new${queryString ? `?${queryString}` : ''}`;
    router.replace(redirectUrl);
  }, [router, searchParams]);

  return null;
}

// Redirect from old /dashboard/requests/new to new /dashboard/my-providers/new
export default function NewRequestRedirect() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Redirecting...</p>
      <Suspense fallback={null}>
        <RedirectContent />
      </Suspense>
    </div>
  );
}
