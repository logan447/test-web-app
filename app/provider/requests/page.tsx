'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import MainNav from '@/components/Navigation/MainNav';
import Breadcrumb from '@/components/Navigation/Breadcrumb';
import { showToast } from '@/lib/toast';
import { ProfileCardsSkeleton } from '@/components/UI/Skeleton';
import PaywallModal from '@/components/Paywall/PaywallModal';
import EnhancedFamilyCard from '@/components/Directory/EnhancedFamilyCard';
import FamilyFiltersBar, { FamilyFilters } from '@/components/Directory/FamilyFiltersBar';
import ScrollToTop from '@/components/Directory/ScrollToTop';
import { useProviderIdentity } from '@/hooks/useProviderIdentity';

type FamilyProfile = {
  id: string;
  user: {
    name: string;
    email: string;
    phone: string | null;
  };
  careTypes: string[];
  location: string;
  city: string;
  state: string;
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string | null;
  description: string | null;
  createdAt: string;
  isSaved?: boolean;
};

export default function ProviderRequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profiles, setProfiles] = useState<FamilyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedProfileIds, setSavedProfileIds] = useState<Set<string>>(new Set());
  const [requestedProfileIds, setRequestedProfileIds] = useState<Map<string, string>>(new Map());
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [selectedProfileForUnlock, setSelectedProfileForUnlock] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('newest');

  // Read mode from session (database is source of truth per Manual Ch 2)
  const isProviderMode = session?.user?.activeMode === 'PROVIDER';

  // Check for provider identity - redirects to onboarding if missing (Manual Ch 8)
  const { hasIdentity, loading: identityLoading } = useProviderIdentity({
    requireIdentity: true,
    checkMode: true,
  });

  // Filters
  const [filters, setFilters] = useState<FamilyFilters>({
    city: '',
    state: '',
    careTypes: [],
    budgetMin: 0,
    budgetMax: 15000,
    timeline: '',
  });

  useEffect(() => {
    if (status === 'loading' || identityLoading) return;

    if (!session) {
      router.push('/login');
      return;
    }

    // If mode is family, redirect to family homepage
    if (!isProviderMode) {
      router.push('/');
      return;
    }

    // If no identity, the hook will redirect to onboarding
    if (!hasIdentity) return;

    fetchProfiles();
    fetchSavedProfiles();
    fetchSentRequests();
  }, [session, status, router, isProviderMode, hasIdentity, identityLoading]);

  const fetchProfiles = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.state) params.append('state', filters.state);

      const response = await fetch(`/api/family-profiles?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProfiles(data);
      }
    } catch (err) {
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchProfiles();
  };

  const handleClearFilters = () => {
    setFilters({
      city: '',
      state: '',
      careTypes: [],
      budgetMin: 0,
      budgetMax: 15000,
      timeline: '',
    });
    setLoading(true);
    fetchProfiles();
  };

  const fetchSavedProfiles = async () => {
    try {
      const response = await fetch('/api/saved-families');
      if (response.ok) {
        const savedProfiles = await response.json();
        const ids = new Set<string>(savedProfiles.map((p: any) => p.id));
        setSavedProfileIds(ids);
      }
    } catch (err) {
      console.error('Error fetching saved profiles:', err);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const [sentResponse, receivedResponse] = await Promise.all([
        fetch('/api/requests?type=sent'),
        fetch('/api/requests?type=received')
      ]);

      const profileMap = new Map<string, string>();

      if (sentResponse.ok) {
        const sentRequests = await sentResponse.json();
        sentRequests.forEach((req: any) => {
          if (req.familyProfileId) {
            profileMap.set(req.familyProfileId, req.id);
          }
        });
      }

      if (receivedResponse.ok) {
        const receivedRequests = await receivedResponse.json();
        receivedRequests.forEach((req: any) => {
          if (req.familyProfileId) {
            profileMap.set(req.familyProfileId, req.id);
          }
        });
      }

      setRequestedProfileIds(profileMap);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleToggleSave = async (profileId: string) => {
    const isSaved = savedProfileIds.has(profileId);

    setSavedProfileIds(prev => {
      const next = new Set(prev);
      if (isSaved) {
        next.delete(profileId);
      } else {
        next.add(profileId);
      }
      return next;
    });

    try {
      if (isSaved) {
        const response = await fetch(`/api/saved-families?familyProfileId=${profileId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          showToast.success('Removed from saved');
        } else {
          throw new Error('Failed to unsave');
        }
      } else {
        const response = await fetch('/api/saved-families', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ familyProfileId: profileId }),
        });
        if (response.ok) {
          showToast.success('Saved for later');
        } else {
          throw new Error('Failed to save');
        }
      }
    } catch (err) {
      console.error('Error toggling save:', err);
      showToast.error(isSaved ? 'Failed to remove from saved' : 'Failed to save');
      setSavedProfileIds(prev => {
        const next = new Set(prev);
        if (isSaved) {
          next.add(profileId);
        } else {
          next.delete(profileId);
        }
        return next;
      });
    }
  };

  const handleUpgradeSubscription = async (tier: 'PRO') => {
    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success('Provider membership activated! All features now accessible.');
        setPaywallOpen(false);
      } else {
        throw new Error(data.error || 'Failed to activate membership');
      }
    } catch (err: any) {
      console.error('Error activating membership:', err);
      throw err;
    }
  };

  // Filter and sort profiles
  const getFilteredAndSortedProfiles = () => {
    let filtered = profiles.filter(profile => !requestedProfileIds.has(profile.id));

    // Apply care type filter
    if (filters.careTypes.length > 0) {
      filtered = filtered.filter(profile =>
        profile.careTypes.some(type => filters.careTypes.includes(type))
      );
    }

    // Apply budget filter
    filtered = filtered.filter(profile => {
      const profileMin = profile.budgetMin || 0;
      const profileMax = profile.budgetMax || Infinity;
      return (
        (profileMin <= filters.budgetMax) &&
        (profileMax >= filters.budgetMin)
      );
    });

    // Apply timeline filter
    if (filters.timeline) {
      filtered = filtered.filter(profile => profile.timeline === filters.timeline);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'budget-high':
        filtered.sort((a, b) => (b.budgetMax || 0) - (a.budgetMax || 0));
        break;
      case 'budget-low':
        filtered.sort((a, b) => (a.budgetMin || 0) - (b.budgetMin || 0));
        break;
      default:
        break;
    }

    return filtered;
  };

  if (!session) {
    return null;
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Find Families</h1>
            <p className="mt-2 text-lg text-gray-600">
              Connect with families who need your help
            </p>
          </div>
          <div className="mb-6">
            <div className="animate-pulse bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
          <ProfileCardsSkeleton count={3} />
        </div>
      );
    }

    const filteredProfiles = getFilteredAndSortedProfiles();

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Families</h1>
          <p className="text-lg text-gray-600">
            Connect with families who need your help
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FamilyFiltersBar
            filters={filters}
            onFilterChange={setFilters}
            onSearch={handleSearch}
            onClear={handleClearFilters}
          />
        </div>

        {/* Results Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {filteredProfiles.length} Care Request{filteredProfiles.length !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-gray-600">
                {filteredProfiles.length === profiles.length
                  ? 'Showing all available requests'
                  : `Filtered from ${profiles.length} total requests`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="budget-high">Highest Budget</option>
                <option value="budget-low">Lowest Budget</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredProfiles.length === 0 ? (
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              No care requests found
            </h3>
            <p className="mt-2 text-gray-600">
              {profiles.length === 0
                ? 'No families have posted care requests yet. Check back soon!'
                : 'Try adjusting your search filters to see more results.'}
            </p>
            {(filters.city || filters.state || filters.careTypes.length > 0) && (
              <button
                onClick={handleClearFilters}
                className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <EnhancedFamilyCard
                key={profile.id}
                profile={profile}
                isSaved={savedProfileIds.has(profile.id)}
                hasRequest={requestedProfileIds.has(profile.id)}
                requestId={requestedProfileIds.get(profile.id)}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <Breadcrumb />
      {renderContent()}
      <ScrollToTop />
      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onUpgrade={handleUpgradeSubscription}
      />
    </div>
  );
}

