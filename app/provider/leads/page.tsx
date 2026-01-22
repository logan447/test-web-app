'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import MainNav from '@/components/Navigation/MainNav';
import Breadcrumb from '@/components/Navigation/Breadcrumb';
import { showToast } from '@/lib/toast';
import { ProfileCardsSkeleton } from '@/components/UI/Skeleton';
import PaywallModal from '@/components/Paywall/PaywallModal';
import EnhancedFamilyCard from '@/components/Directory/EnhancedFamilyCard';
import FamilyFiltersBar, { FamilyFilters } from '@/components/Directory/FamilyFiltersBar';
import ScrollToTop from '@/components/Directory/ScrollToTop';
import OnboardingPrompt from '@/components/Provider/OnboardingPrompt';
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

type MatchedFamily = {
  id: string;
  userId: string;
  user: { name: string | null };
  city: string;
  state: string;
  careTypes: string[];
  seniorName: string | null;
  createdAt: string;
  matchScore: number;
  matchReasons: string[];
};

function ProviderLeadsPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profiles, setProfiles] = useState<FamilyProfile[]>([]);
  const [matchedFamilies, setMatchedFamilies] = useState<MatchedFamily[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [savedProfileIds, setSavedProfileIds] = useState<Set<string>>(new Set());
  const [requestedProfileIds, setRequestedProfileIds] = useState<Map<string, string>>(new Map());
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [selectedProfileForUnlock, setSelectedProfileForUnlock] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('newest');

  // Check if onboarding is in progress (GlobalOnboardingOverlay handles this)
  // Don't redirect during onboarding - let the overlay complete first
  // NOTE: Check this BEFORE any other conditions to ensure overlay has a chance to show
  const onboardingParam = searchParams.get('onboarding');
  const isOnboarding = onboardingParam === 'true';

  // Read mode from session (database is source of truth per Manual Ch 2)
  const isProviderMode = session?.user?.activeMode === 'PROVIDER';

  // Check for provider identity (Manual Ch 8: gentle nudges, not forced redirects)
  const { hasIdentity, needsOnboarding, loading: identityLoading } = useProviderIdentity({
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
    // CRITICAL: If onboarding is in progress, skip ALL redirects
    // GlobalOnboardingOverlay will handle the wizard, and mode will be set after completion
    // We still fetch data so the page is ready when onboarding completes
    if (isOnboarding) {
      // Only fetch data if we have some session (even loading)
      if (status !== 'unauthenticated') {
        fetchProfiles();
        fetchSavedProfiles();
        fetchSentRequests();
        fetchMatchedFamilies();
      }
      return;
    }

    if (status === 'loading' || identityLoading) return;

    // Only redirect to login if session status is definitively unauthenticated
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Session is authenticated but data might still be loading
    if (!session) return;

    // Redirect non-provider users to home (only when NOT onboarding)
    if (!isProviderMode) {
      router.push('/');
      return;
    }

    // Fetch data (even if no identity - show empty states with prompt)
    fetchProfiles();
    fetchSavedProfiles();
    fetchSentRequests();
    fetchMatchedFamilies();
  }, [session, status, router, isProviderMode, identityLoading, isOnboarding]);

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

  const fetchMatchedFamilies = async () => {
    try {
      setMatchesLoading(true);
      const response = await fetch('/api/provider/matches');
      if (response.ok) {
        const data = await response.json();
        setMatchedFamilies(data);
      }
    } catch (err) {
      console.error('Error fetching matched families:', err);
    } finally {
      setMatchesLoading(false);
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
            <h1 className="text-4xl font-bold text-gray-900">Leads</h1>
            <p className="mt-2 text-lg text-gray-600">
              Discover families who need your care services
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Leads</h1>
          <p className="text-lg text-gray-600">
            Discover families who need your care services
          </p>
        </div>

        {/* Gentle nudge for onboarding (Manual Ch 8) */}
        {needsOnboarding && <OnboardingPrompt context="requests" />}

        {/* Matched Families Section - Algorithm-based matches */}
        {hasIdentity && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-full">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Matched Families</h2>
                <p className="text-sm text-gray-600">Families that match your care services based on our algorithm</p>
              </div>
            </div>

            {matchesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : matchedFamilies.length === 0 ? (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="mt-3 text-gray-600">No matched families yet. Complete your profile to improve matching.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchedFamilies.slice(0, 6).map((family) => (
                  <div key={family.id} className="bg-white rounded-xl shadow-sm border border-emerald-100 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{family.user?.name || 'Anonymous Family'}</h3>
                        <p className="text-sm text-gray-600">{family.city}, {family.state}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {family.matchScore}% match
                      </div>
                    </div>

                    {family.seniorName && (
                      <p className="text-sm text-gray-600 mb-2">Care for: {family.seniorName}</p>
                    )}

                    <div className="flex flex-wrap gap-1 mb-3">
                      {family.careTypes.slice(0, 3).map((type) => (
                        <span key={type} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {type.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-1 mb-4">
                      {family.matchReasons.slice(0, 2).map((reason, idx) => (
                        <div key={idx} className="flex items-center gap-1 text-xs text-emerald-600">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {reason}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        // If not saved, save and potentially open request flow
                        if (!savedProfileIds.has(family.id)) {
                          handleToggleSave(family.id);
                        }
                        showToast.success('Added to saved families');
                      }}
                      className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                        savedProfileIds.has(family.id)
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      {savedProfileIds.has(family.id) ? 'Saved' : 'Save Lead'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        {hasIdentity && matchedFamilies.length > 0 && (
          <div className="border-b border-gray-200 mb-8"></div>
        )}

        {/* All Care Requests Section */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">All Care Requests</h2>

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

// Wrapper with Suspense (required for useSearchParams)
export default function ProviderLeadsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <Breadcrumb />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProfileCardsSkeleton count={3} />
        </div>
      </div>
    }>
      <ProviderLeadsPageContent />
    </Suspense>
  );
}
