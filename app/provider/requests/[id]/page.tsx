"use client";

import { useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";

/**
 * Redirect from old route to new route
 * /provider/requests/[id] → /provider/find-families/[id]
 */
export default function RedirectPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = params.id;
    const queryString = searchParams.toString();
    const newUrl = `/provider/find-families/${id}${queryString ? `?${queryString}` : ''}`;
    router.replace(newUrl);
  }, [router, params, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
