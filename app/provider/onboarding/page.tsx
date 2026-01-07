'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProviderOnboarding() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'ORGANIZATION' | 'INDIVIDUAL' | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
  }, [session, router]);

  const handleCreateIdentity = async () => {
    if (!selectedType) {
      setError('Please select a provider type');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/provider-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create provider identity');
        setIsCreating(false);
        return;
      }

      // Update session to reflect new provider identity
      await update({ activeMode: 'PROVIDER' });

      // Redirect to provider requests page
      router.push('/provider/requests');
      router.refresh();

    } catch (error) {
      console.error('Error creating provider identity:', error);
      setError('An unexpected error occurred');
      setIsCreating(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Provider Mode
          </h1>
          <p className="text-gray-600">
            Choose how you&apos;d like to get started as a care provider on Olera
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-8">
          <div className="space-y-6">
            {/* Option 1: Create New Provider Profile */}
            <div className="border rounded-lg p-6 hover:border-primary-500 transition-colors">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Create New Provider Profile
              </h2>
              <p className="text-gray-600 mb-4">
                Start fresh by creating a new provider profile. This is ideal if you&apos;re new to Olera or want to create a separate listing.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Provider Type
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="providerType"
                        value="ORGANIZATION"
                        checked={selectedType === 'ORGANIZATION'}
                        onChange={(e) => setSelectedType('ORGANIZATION')}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-900">
                          Organization
                        </span>
                        <span className="block text-xs text-gray-500">
                          Care facility, agency, or healthcare organization
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="providerType"
                        value="INDIVIDUAL"
                        checked={selectedType === 'INDIVIDUAL'}
                        onChange={(e) => setSelectedType('INDIVIDUAL')}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium text-gray-900">
                          Individual Caregiver
                        </span>
                        <span className="block text-xs text-gray-500">
                          Independent caregiver or healthcare professional
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleCreateIdentity}
                  disabled={!selectedType || isCreating}
                  className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Continue'}
                </button>
              </div>
            </div>

            {/* Option 2: Claim Existing Listing (Placeholder) */}
            <div className="border rounded-lg p-6 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Claim Existing Listing
              </h2>
              <p className="text-gray-600 mb-4">
                Already have a provider listing on Olera? Claim it to manage your profile and respond to care requests.
              </p>
              <button
                disabled
                className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t text-center">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
