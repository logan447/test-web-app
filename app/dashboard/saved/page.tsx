'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import MainNav from '@/components/Navigation/MainNav';
import Link from 'next/link';
import { showToast } from '@/lib/toast';
import { ProfileCardsSkeleton } from '@/components/UI/Skeleton';
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

function SavedProvidersContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const [providers, setProviders] = useState<SavedProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedProviderIds, setRequestedProviderIds] = useState<Map<string, string>>(new Map());

  const isProviderMode = mode === 'provider';

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }

    // Add default mode if missing
    if (!mode) {
      router.push('/dashboard/saved');
      return;
    }

    // Redirect provider mode to their saved families page
    if (isProviderMode) {
      router.push('/provider/saved');
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
  };

  const handleRemove = async (providerId: string) => {
    // Optimistically remove from UI
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
      // Refetch to restore state on error
      fetchSavedProviders();
  };

  if (!session) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Saved Providers</h1>
            <p className="text-lg text-gray-600">
              Providers you&apos;ve saved for future reference
            </p>
          </div>
          <ProfileCardsSkeleton count={6} />
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Saved Providers</h1>
          <p className="text-lg text-gray-600">
            Providers you&apos;ve saved for future reference
          </p>
        </div>

        {/* Results Count */}
        {providers.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
            <p className="text-lg font-semibold text-gray-900">
              {providers.length} Saved Provider{providers.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Results */}
        {providers.length === 0 ? (
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-300"
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
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              No saved providers
            </h3>
            <p className="mt-2 text-gray-600">
              Start browsing providers and save the ones you&apos;re interested in.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 font-semibold transition-all shadow-sm hover:shadow-md"
              >
                Browse Providers
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((saved) => {
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

export default function SavedProviders() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProfileCardsSkeleton />
        </div>
      </div>
    }>
      <SavedProvidersContent />
    </Suspense>
  );
}
