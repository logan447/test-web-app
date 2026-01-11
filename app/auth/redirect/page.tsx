"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function AuthRedirectPage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.activeMode === 'PROVIDER') {
      window.location.replace('/provider/requests');
    } else {
      window.location.replace('/');
    }
  }, [session, status]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
        {status === "loading" && <p className="text-sm text-gray-500 mt-2">Loading session...</p>}
        {session && <p className="text-sm text-gray-500 mt-2">Mode: {session.user?.activeMode}</p>}
      </div>
    </div>
  );
}
