'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import MainNav from '@/components/Navigation/MainNav';
import Footer from '@/components/Navigation/Footer';
import Link from 'next/link';
import { showToast } from '@/lib/toast';
import SavedProviderCard from '@/components/Directory/SavedProviderCard';
import PageHero from '@/components/UI/PageHero';
import EmptyState from '@/components/UI/EmptyState';

type SavedProvider = {
  id: string;
  provider: {
    id: string;
    name: string;
    providerType: string;
    description: string | null;
    address?: string;
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
    priceDescription?: string | null;
    claimed?: boolean;
    hasMemoryCare?: boolean;
    hasRespiteCare?: boolean;
    hasHospiceCare?: boolean;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    oleraScore?: number | null;
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
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set());

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
      } else {
        showToast.error('Unable to load saved providers');
      }
    } catch (err) {
      console.error('Error fetching saved providers:', err);
      showToast.error('Unable to load saved providers');
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
    setSelectedForCompare(prev => {
      const next = new Set(prev);
      next.delete(providerId);
      return next;
    });

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

  const toggleCompareSelection = (providerId: string) => {
    setSelectedForCompare(prev => {
      const next = new Set(prev);
      if (next.has(providerId)) {
        next.delete(providerId);
      } else if (next.size < 4) {
        next.add(providerId);
      } else {
        showToast.error('You can compare up to 4 providers at a time');
      }
      return next;
    });
  };

  const handleCompare = () => {
    if (selectedForCompare.size < 2) {
      showToast.error('Select at least 2 providers to compare');
      return;
    }
    const ids = Array.from(selectedForCompare).join(',');
    router.push(`/saved/compare?ids=${ids}`);
  };

  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    if (compareMode) {
      setSelectedForCompare(new Set());
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
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
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
      <PageHero
        title="Saved Providers"
        subtitle="Your shortlist for easy comparison"
        compact
        stats={providers.length > 0 ? [
          { value: providers.length, label: "Saved" },
          { value: requestedProviderIds.size, label: "Contacted" },
          { value: providers.filter(p => p.provider.verified).length, label: "Verified" },
        ] : undefined}
        actions={
          <div className="flex items-center gap-3">
            {providers.length >= 2 && (
              <button
                onClick={toggleCompareMode}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-colors ${
                  compareMode
                    ? 'bg-white text-primary-700 hover:bg-primary-50'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                {compareMode ? 'Cancel' : 'Compare'}
              </button>
            )}
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 bg-white text-primary-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse More
            </Link>
          </div>
        }
      />

      {/* Compare Mode Bar */}
      {compareMode && (
        <div className="sticky top-16 z-40 bg-primary-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-medium">
                  {selectedForCompare.size} of 4 selected
                </span>
                <div className="flex -space-x-2">
                  {Array.from(selectedForCompare).slice(0, 4).map((id) => {
                    const provider = providers.find(p => p.provider.id === id);
                    if (!provider) return null;
                    return (
                      <div
                        key={id}
                        className="w-8 h-8 rounded-full bg-white border-2 border-primary-600 overflow-hidden"
                        title={provider.provider.name}
                      >
                        {provider.provider.coverPhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={provider.provider.coverPhoto}
                            alt={provider.provider.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary-600 text-xs font-bold">
                            {provider.provider.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedForCompare(new Set())}
                  className="px-4 py-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={handleCompare}
                  disabled={selectedForCompare.size < 2}
                  className="px-4 py-1.5 bg-white text-primary-600 rounded-lg text-sm font-semibold hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Compare ({selectedForCompare.size})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Guidance Nudge */}
        {providers.length > 0 && providers.length < 3 && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-sm text-amber-800">
              <span className="font-medium">Keep exploring!</span> Experts recommend saving 3-5 providers to compare before deciding.
            </p>
            <Link href="/browse" className="ml-auto text-sm font-medium text-amber-700 hover:text-amber-800 whitespace-nowrap">
              Browse more →
            </Link>
          </div>
        )}

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
          <EmptyState
            variant="saved"
            size="large"
            guidanceMessage="Experts recommend meeting 3-5 providers before deciding"
            actions={[
              {
                label: "Browse Providers",
                href: "/browse",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
              },
              {
                label: "View Matches",
                href: "/matches",
                variant: "secondary",
              },
            ]}
          />
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
                  compareMode={compareMode}
                  isSelectedForCompare={selectedForCompare.has(saved.provider.id)}
                  onToggleCompare={toggleCompareSelection}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer variant="light" />
    </div>
  );
}
