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
  const [requestedProviderIds, setRequestedProviderIds] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    fetchSavedProviders();
    fetchSentRequests();
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

  const fetchSentRequests = async () => {
    try {
      const response = await fetch('/api/requests?type=sent');
      if (response.ok) {
        const requests = await response.json();
        // Build a map from providerId to requestId
        const providerMap = new Map<string, string>();
        requests.forEach((req: any) => {
          if (req.provider?.id) {
            providerMap.set(req.provider.id, req.id);
          }
        });
        setRequestedProviderIds(providerMap);
      }
    } catch (error) {
      console.error('Error fetching sent requests:', error);
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
            Providers you&apos;ve saved for future reference
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
              Start browsing providers and save the ones you&apos;re interested in.
            </p>
            <div className="mt-6">
              <Link
                href="/"
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

            {providers.map((saved) => {
              const requestId = requestedProviderIds.get(saved.provider.id);

              return (
                <div
                  key={saved.id}
                  className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Header with Remove Button */}
                  <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {saved.provider.name}
                        </h3>
                        {requestId && (
                          <span className="text-xs bg-green-100 text-green-800 font-semibold px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Request Sent
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="font-medium text-primary-700">
                          {formatProviderType(saved.provider.providerType)}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {saved.provider.city}, {saved.provider.state}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(saved.provider.id)}
                      className="p-2 rounded-full hover:bg-red-100 transition-colors group"
                      title="Remove from saved"
                    >
                      <svg className="w-6 h-6 text-red-500 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Care Types */}
                    {saved.provider.careTypesOffered && saved.provider.careTypesOffered.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Services Offered</p>
                        <div className="flex flex-wrap gap-2">
                          {saved.provider.careTypesOffered.slice(0, 4).map((type) => (
                            <span
                              key={type}
                              className="px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full"
                            >
                              {formatCareType(type)}
                            </span>
                          ))}
                          {saved.provider.careTypesOffered.length > 4 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                              +{saved.provider.careTypesOffered.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {saved.provider.description && (
                      <div className="mb-4">
                        <p className="text-gray-700 leading-relaxed line-clamp-3">{saved.provider.description}</p>
                      </div>
                    )}

                    {/* Notes */}
                    {saved.notes && (
                      <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-4">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <div>
                            <p className="text-xs font-semibold text-yellow-900 uppercase tracking-wide mb-1">My Notes</p>
                            <p className="text-sm text-yellow-900">{saved.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Saved Date */}
                    <p className="text-xs text-gray-500 mb-4">
                      Saved on {new Date(saved.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="px-6 py-4 bg-gray-50 border-t flex gap-3">
                    <Link
                      href={`/providers/${saved.provider.id}?from=saved`}
                      className="flex-1 px-4 py-2.5 bg-white border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 font-semibold text-center transition-colors"
                    >
                      View Full Profile
                    </Link>
                    {requestId ? (
                      <Link
                        href={`/dashboard/requests/${requestId}?from=saved`}
                        className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-center transition-colors shadow-sm"
                      >
                        View Conversation
                      </Link>
                    ) : (
                      <Link
                        href={`/dashboard/requests/new?providerId=${saved.provider.id}`}
                        className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold text-center transition-colors shadow-sm"
                      >
                        Request Consultation
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
