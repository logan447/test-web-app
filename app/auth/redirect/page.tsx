"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthRedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") {
      console.log('[AuthRedirect] Loading session...');
      return;
    }

    if (!session) {
      console.log('[AuthRedirect] No session found');
      router.replace("/login");
      return;
    }

    const mode = session.user?.activeMode;
    console.log('[AuthRedirect] Logged in as mode:', mode);

    // Redirect based on user mode
    if (mode === 'PROVIDER') {
      console.log('[AuthRedirect] PROVIDER → /provider/requests');
      window.location.href = '/provider/requests';
    } else {
      console.log('[AuthRedirect] FAMILY → /');
      window.location.href = '/';
    }
  }, [session, status, router]);

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
