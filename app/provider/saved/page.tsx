"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirect from old route to new route
 * /provider/saved → /provider/saved-families
 */
export default function RedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/provider/saved-families");
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
