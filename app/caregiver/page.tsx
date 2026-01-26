"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Caregiver landing page - redirects to browse organizations
 * This page exists to handle breadcrumb navigation from child routes
 */
export default function CaregiverLandingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to browse organizations (main caregiver feature)
    router.push("/providers/browse-organizations");
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
