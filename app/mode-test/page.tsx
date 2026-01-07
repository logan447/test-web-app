"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ModeTestPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [switching, setSwitching] = useState(false);

  const handleModeSwitch = async (newMode: 'FAMILY' | 'PROVIDER') => {
    if (switching) return;

    try {
      setSwitching(true);
      console.log('Switching to mode:', newMode);

      const response = await fetch('/api/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode }),
      });

      const data = await response.json();
      console.log('Mode switch response:', data);

      if (!response.ok) {
        if (data.needsOnboarding) {
          alert('You need to complete provider onboarding first!');
          router.push('/provider/onboarding');
          return;
        }
        alert('Error: ' + data.error);
        return;
      }

      await update({ activeMode: newMode });
      alert(`Successfully switched to ${newMode} mode!`);
      router.refresh();
    } catch (error) {
      console.error('Error switching mode:', error);
      alert('Failed to switch mode');
    } finally {
      setSwitching(false);
    }
  };

  const currentMode = (session?.user as any)?.activeMode || 'FAMILY';
  const isProviderMode = currentMode === 'PROVIDER';
  const hasProviderIdentity = (session?.user as any)?.hasProviderIdentity;
  const role = (session?.user as any)?.role;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-6">Dual-Mode System Test</h1>

        {!session ? (
          <div className="text-red-600">
            <p className="font-semibold">❌ Not logged in!</p>
            <p className="mt-2">Please go to the home page and log in first.</p>
            <a href="/" className="text-blue-600 underline mt-4 block">Go to Home</a>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
              <h2 className="font-semibold text-lg mb-3">Session Data:</h2>
              <div className="space-y-1 text-sm font-mono">
                <p><strong>Email:</strong> {session.user?.email}</p>
                <p><strong>Name:</strong> {session.user?.name}</p>
                <p><strong>Role:</strong> {role}</p>
                <p><strong>Active Mode:</strong> <span className="font-bold text-blue-600">{currentMode}</span></p>
                <p><strong>Has Provider Identity:</strong> {String(hasProviderIdentity)}</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded p-4 mb-6">
              <h2 className="font-semibold text-lg mb-3">Current Mode:</h2>
              <p className="text-2xl font-bold text-green-600">{currentMode}</p>
            </div>

            <div className="space-y-4">
              <h2 className="font-semibold text-lg">Switch Mode:</h2>

              {isProviderMode ? (
                <button
                  onClick={() => handleModeSwitch('FAMILY')}
                  disabled={switching}
                  className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {switching ? 'Switching...' : '← Switch to Family Mode'}
                </button>
              ) : (
                <button
                  onClick={() => handleModeSwitch('PROVIDER')}
                  disabled={switching || !hasProviderIdentity}
                  className="w-full py-3 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  title={!hasProviderIdentity ? 'You need a provider profile to switch to provider mode' : ''}
                >
                  {switching ? 'Switching...' : '→ Switch to Provider Mode'}
                </button>
              )}

              {!hasProviderIdentity && !isProviderMode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ No Provider Identity</strong><br/>
                    You don't have a provider profile yet. Create one to access provider features.
                  </p>
                  <a
                    href="/provider/onboarding"
                    className="mt-3 inline-block bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                  >
                    Create Provider Profile
                  </a>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t">
              <a href="/" className="text-blue-600 underline">← Back to Home</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
