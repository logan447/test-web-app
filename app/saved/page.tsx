'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import MainNav from '@/components/Navigation/MainNav';
import Link from 'next/link';
import { showToast } from '@/lib/toast';
import SavedProviderCard from '@/components/Directory/SavedProviderCard';

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
    coverPhoto?: string | null;
    photos?: string[];
    verified?: boolean;
    licensed?: boolean;
    insuranceVerified?: boolean;
    backgroundChecked?: boolean;
    averageRating?: number | null;
    reviewCount?: number;
    priceMin?: number | null;
    priceMax?: number | null;
  };
  notes: string | null;
  createdAt: string;
};

export default function SavedProvidersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [providers, setProviders] = useState<SavedProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedProviderIds, setRequestedProviderIds] = useState<Map<string, string>>(new Map());
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'rating'>('recent');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    fetchSavedProviders();
    fetchSentRequests();
  }, [session, status, router]);

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
    setProviders(prev => prev.filter(p => p.provider.id !== providerId));

    try {
      const response = await fetch(`/api/saved-providers?providerId=${providerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast.success('Removed from saved');
      } else {
        throw new Error('Failed to remove');
      }
    } catch (err) {
      console.error('Error removing saved provider:', err);
      showToast.error('Failed to remove from saved');
      fetchSavedProviders();
    }
  };

  const sortedProviders = [...providers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.provider.name.localeCompare(b.provider.name);
      case 'rating':
        return (b.provider.averageRating || 0) - (a.provider.averageRating || 0);
      case 'recent':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  if (!session) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        {/* Hero Skeleton */}
        <div className="bg-gradient-to-br from-pink-600 via-pink-700 to-rose-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse">
              <div className="h-10 bg-white/20 rounded-lg w-1/3 mb-4"></div>
              <div className="h-5 bg-white/20 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-xl p-6 shadow-sm">
                <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-pink-600 via-pink-700 to-rose-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-2 rounded-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">Saved Providers</h1>
              </div>
              <p className="text-pink-100 text-lg">
                Your shortlist of care providers for easy comparison
              </p>
            </div>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 bg-white text-pink-700 px-6 py-3 rounded-xl font-semibold hover:bg-pink-50 transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse More
            </Link>
          </div>

          {/* Stats */}
          {providers.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold">{providers.length}</div>
                <div className="text-pink-100 text-sm">Saved</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold">{requestedProviderIds.size}</div>
                <div className="text-pink-100 text-sm">Contacted</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold">
                  {providers.filter(p => p.provider.verified).length}
                </div>
                <div className="text-pink-100 text-sm">Verified</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {providers.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                {[
                  { key: 'recent', label: 'Recent' },
                  { key: 'name', label: 'Name' },
                  { key: 'rating', label: 'Rating' },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setSortBy(option.key as typeof sortBy)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      sortBy === option.key
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{providers.length}</span> saved provider{providers.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Results */}
        {providers.length === 0 ? (
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-pink-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No saved providers yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start browsing care providers and save the ones you&apos;re interested in to compare them later.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/browse"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-semibold transition-all shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Providers
              </Link>
              <Link
                href="/matches"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
              >
                View Matches
              </Link>
            </div>

            {/* Tips */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">Tips for finding the right care</h4>
              <div className="grid sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
                <div className="flex items-start gap-3">
                  <div className="bg-primary-100 p-2 rounded-lg shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Look for verified badges</p>
                    <p className="text-xs text-gray-600">Verified providers have confirmed credentials</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary-100 p-2 rounded-lg shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Read reviews carefully</p>
                    <p className="text-xs text-gray-600">Look for specific feedback from families</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary-100 p-2 rounded-lg shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Schedule tours</p>
                    <p className="text-xs text-gray-600">Visit facilities before making decisions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProviders.map((saved) => {
              const requestId = requestedProviderIds.get(saved.provider.id);

              return (
                <SavedProviderCard
                  key={saved.id}
                  saved={saved}
                  hasRequest={!!requestId}
                  requestId={requestId}
                  onRemove={handleRemove}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
