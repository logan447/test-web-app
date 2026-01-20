"use client";

import { useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";

// Redirect from old /dashboard/requests/[id] to new /dashboard/my-providers/[id]
export default function RequestDetailRedirect() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = params.id;
    const queryString = searchParams.toString();
    const redirectUrl = `/dashboard/my-providers/${id}${queryString ? `?${queryString}` : ''}`;
    router.replace(redirectUrl);
  }, [router, params, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Redirecting...</p>
    </div>
  );
}
