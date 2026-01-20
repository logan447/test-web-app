"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect from old /dashboard/requests to new /dashboard/my-providers
export default function RequestsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/my-providers");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Redirecting...</p>
    </div>
  );
}
