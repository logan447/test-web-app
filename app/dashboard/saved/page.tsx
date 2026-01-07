'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import MainNav from '@/components/Navigation/MainNav';
import Link from 'next/link';
import { showToast } from '@/lib/toast';

type SavedProvider = {
  id: string;
  provider: {
    id: string;
    name: string;
    providerType: string;
    description: string | null;
    city: string;
    state: string;
    careTypesOffered: string[];
  };
  notes: string | null;
  createdAt: string;
};

export default function SavedProviders() {
  const { data: session } = useSession();
  const router = useRouter();
  const [providers, setProviders] = useState<SavedProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    fetchSavedProviders();
  }, [session, router]);

  const fetchSavedProviders = async () => {
    try {
      const response = await fetch('/api/saved-providers');
      if (response.ok) {
        const data = await response.json();
        setProviders(data);
      }
    } catch (err) {
      console.error('Error fetching saved providers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (providerId: string) => {
    try {
      const response = await fetch(`/api/saved-providers?providerId=${providerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProviders(prev => prev.filter(p => p.provider.id !== providerId));
        showToast.success('Removed from saved');
      } else {
        throw new Error('Failed to remove');
      }
    } catch (err) {
      console.error('Error removing saved provider:', err);
      showToast.error('Failed to remove from saved');
    }
  };

  const formatProviderType = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const formatCareType = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  if (!session) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">Loading saved providers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Saved Providers</h1>
          <p className="mt-2 text-gray-600">
            Providers you've saved for future reference
          </p>
        </div>

        {/* Results */}
        {providers.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No saved providers
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Start browsing providers and save the ones you're interested in.
            </p>
            <div className="mt-6">
              <Link
                href="/providers"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Browse Providers
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {providers.length} saved provider{providers.length !== 1 ? 's' : ''}
            </p>

            {providers.map((saved) => (
              <div
                key={saved.id}
                className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {saved.provider.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatProviderType(saved.provider.providerType)} • {saved.provider.city}, {saved.provider.state}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(saved.provider.id)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    title="Remove from saved"
                  >
                    <svg className="w-6 h-6 text-red-500 fill-current" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                </div>

                {/* Care Types */}
                {saved.provider.careTypesOffered && saved.provider.careTypesOffered.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Services Offered:</p>
                    <div className="flex flex-wrap gap-2">
                      {saved.provider.careTypesOffered.map((type) => (
                        <span
                          key={type}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {formatCareType(type)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {saved.provider.description && (
                  <div className="mb-4">
                    <p className="text-gray-600">{saved.provider.description}</p>
                  </div>
                )}

                {/* Notes */}
                {saved.notes && (
                  <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">My Notes:</p>
                    <p className="text-gray-900 text-sm">{saved.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-4 pt-4 border-t">
                  <Link
                    href={`/providers/${saved.provider.id}`}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium text-center"
                  >
                    View Profile
                  </Link>
                  <Link
                    href={`/dashboard/requests/new?providerId=${saved.provider.id}`}
                    className="flex-1 px-4 py-2 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50 font-medium text-center"
                  >
                    Request Consultation
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
