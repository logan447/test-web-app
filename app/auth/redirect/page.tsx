"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthRedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log('[AuthRedirect] Status:', status);
    console.log('[AuthRedirect] Session:', session);

    if (status === "loading") {
      console.log('[AuthRedirect] Still loading session...');
      return;
    }

    if (!session) {
      console.log('[AuthRedirect] No session, redirecting to login');
      // Clear the login flag
      sessionStorage.removeItem('justLoggedIn');
      router.replace("/login");
      return;
    }

    const mode = session.user?.activeMode;
    console.log('[AuthRedirect] User mode:', mode);

    // Clear the "just logged in" flag
    sessionStorage.removeItem('justLoggedIn');

    // Redirect based on user mode - use window.location for full page reload
    if (mode === 'PROVIDER') {
      console.log('[AuthRedirect] Redirecting to /provider/requests');
      window.location.href = '/provider/requests';
    } else {
      console.log('[AuthRedirect] Redirecting to home');
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
