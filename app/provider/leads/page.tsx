'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import MainNav from '@/components/Navigation/MainNav';
import Footer from '@/components/Navigation/Footer';
import Breadcrumb from '@/components/Navigation/Breadcrumb';
import { showToast } from '@/lib/toast';
import PaywallModal from '@/components/Paywall/PaywallModal';
import EnhancedFamilyCard from '@/components/Directory/EnhancedFamilyCard';
import FamilyFiltersBar, { FamilyFilters } from '@/components/Directory/FamilyFiltersBar';
import ScrollToTop from '@/components/Directory/ScrollToTop';
import OnboardingPrompt from '@/components/Provider/OnboardingPrompt';
import WelcomeBanner from '@/components/Provider/WelcomeBanner';
import ProfileCompletionBanner from '@/components/Provider/ProfileCompletionBanner';
import { useProviderIdentity } from '@/hooks/useProviderIdentity';
import PageHero from '@/components/UI/PageHero';

type FamilyProfile = {
  id: string;
  user: {
    name: string;
    email: string;
    phone: string | null;
  };
  profilePhoto?: string | null;
  lovedOneName?: string | null;
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
  const [sortBy, setSortBy] = useState<string>('newest');

  const onboardingParam = searchParams.get('onboarding');
  const welcomeParam = searchParams.get('welcome');
  const isOnboarding = onboardingParam === 'true';
  const isWelcome = welcomeParam === 'true';
  const isProviderMode = session?.user?.activeMode === 'PROVIDER';

  const [showWelcome, setShowWelcome] = useState(false);

  const { hasIdentity, needsOnboarding, loading: identityLoading } = useProviderIdentity({
    checkMode: true,
  });

  // Show welcome banner on first load if welcome param is present
  useEffect(() => {
    if (isWelcome && !loading) {
      setShowWelcome(true);
      // Clear the welcome param from URL without refresh
      const url = new URL(window.location.href);
      url.searchParams.delete('welcome');
      window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
    }
  }, [isWelcome, loading]);

  const [filters, setFilters] = useState<FamilyFilters>({
    city: '',
    state: '',
    careTypes: [],
    budgetMin: 0,
    budgetMax: 15000,
    timeline: '',
  });

  useEffect(() => {
    if (isOnboarding) {
      if (status !== 'unauthenticated') {
        fetchProfiles();
        fetchSavedProfiles();
        fetchSentRequests();
        fetchMatchedFamilies();
      }
      return;
    }

    if (status === 'loading' || identityLoading) return;

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (!session) return;

    if (!isProviderMode) {
      router.push('/');
      return;
    }

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

  const getFilteredAndSortedProfiles = () => {
    let filtered = profiles.filter(profile => !requestedProfileIds.has(profile.id));

    if (filters.careTypes.length > 0) {
      filtered = filtered.filter(profile =>
        profile.careTypes.some(type => filters.careTypes.includes(type))
      );
    }

    filtered = filtered.filter(profile => {
      const profileMin = profile.budgetMin || 0;
      const profileMax = profile.budgetMax || Infinity;
      return (
        (profileMin <= filters.budgetMax) &&
        (profileMax >= filters.budgetMin)
      );
    });

    if (filters.timeline) {
      filtered = filtered.filter(profile => profile.timeline === filters.timeline);
    }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="animate-pulse flex items-center justify-between">
              <div className="h-7 bg-gray-200 rounded w-24"></div>
              <div className="h-9 bg-gray-200 rounded w-28"></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl p-6 shadow-sm">
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredProfiles = getFilteredAndSortedProfiles();
  const activeRequestsCount = requestedProfileIds.size;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainNav />
      <Breadcrumb />

      {/* PageHero - Clear page purpose (A-146) */}
      <PageHero
        title="Family Inquiries"
        subtitle="Families looking for care services like yours. Respond to start a conversation."
        variant="primary"
        compact
        stats={[
          { value: matchedFamilies.length, label: "Matched to You" },
          { value: profiles.length, label: "All Inquiries" },
          { value: activeRequestsCount, label: "In Progress" },
        ]}
        actions={
          <Link
            href="/provider/requests"
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-white/30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            View Conversations
          </Link>
        }
      />

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Welcome banner for new users */}
        <WelcomeBanner
          variant="organization"
          isVisible={showWelcome}
          onDismiss={() => setShowWelcome(false)}
        />

        {/* Gentle nudge for onboarding */}
        {needsOnboarding && !showWelcome && (
          <div className="mb-8">
            <OnboardingPrompt context="requests" />
          </div>
        )}

        {/* Profile completion nudge for users who have onboarded but profile isn't complete */}
        {!needsOnboarding && !showWelcome && (
          <ProfileCompletionBanner />
        )}

        {/* Hiring Marketplace CTA for Organizations (A-150) */}
        {hasIdentity && (
          <div className="mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Looking to hire caregivers?</p>
                <p className="text-sm text-gray-600">Browse qualified caregivers in your area</p>
              </div>
            </div>
            <Link
              href="/provider/hire-staff"
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              Find Caregivers
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        {/* Matched Families Section */}
        {hasIdentity && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-full">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Matched Families</h2>
                  <p className="text-sm text-gray-600">Families that match your care services</p>
                </div>
              </div>
              {matchedFamilies.length > 6 && (
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
                  View all
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>

            {matchesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : matchedFamilies.length === 0 ? (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="font-semibold text-gray-900 mb-1">No matched families yet</h3>
                <p className="text-gray-600 text-sm mb-4">Complete your profile to improve matching with families</p>
                <Link
                  href="/provider/profile/edit"
                  className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-medium text-sm transition-colors"
                >
                  Complete Profile
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchedFamilies.slice(0, 6).map((family) => (
                  <div key={family.id} className="bg-white rounded-xl shadow-sm border border-emerald-200 p-5 hover:shadow-md hover:border-primary-200 transition-all duration-200">
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

                    {/* Primary CTA: Respond (A-145, A-152) */}
                    <div className="flex gap-2">
                      <Link
                        href={`/provider/requests/new?familyId=${family.id}`}
                        className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors bg-primary-600 text-white hover:bg-primary-700 text-center"
                      >
                        Respond
                      </Link>
                      <button
                        onClick={() => handleToggleSave(family.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          savedProfileIds.has(family.id)
                            ? 'bg-primary-100 text-primary-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={savedProfileIds.has(family.id) ? 'Saved' : 'Save for later'}
                      >
                        <svg className="w-5 h-5" fill={savedProfileIds.has(family.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    </div>
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

        {/* All Family Inquiries Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Browse All Inquiries</h2>
            <p className="text-sm text-gray-600">Families actively looking for care providers</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Sort:</label>
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

        {/* Filters */}
        <div className="mb-6">
          <FamilyFiltersBar
            filters={filters}
            onFilterChange={setFilters}
            onSearch={handleSearch}
            onClear={handleClearFilters}
          />
        </div>

        {/* Results Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {filteredProfiles.length} Family Inquir{filteredProfiles.length !== 1 ? 'ies' : 'y'}
              </p>
              <p className="text-sm text-gray-600">
                {filteredProfiles.length === profiles.length
                  ? 'Showing all available inquiries'
                  : `Filtered from ${profiles.length} total inquiries`}
              </p>
            </div>
            {filteredProfiles.length !== profiles.length && (
              <button
                onClick={handleClearFilters}
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Results Grid */}
        {filteredProfiles.length === 0 ? (
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="h-8 w-8 text-gray-400"
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
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No family inquiries found
            </h3>
            <p className="text-gray-600 mb-6">
              {profiles.length === 0
                ? 'New families are joining every day. Make sure your profile is complete so they can find you!'
                : 'Try adjusting your filters, or clear them to see all available inquiries.'}
            </p>
            {(filters.city || filters.state || filters.careTypes.length > 0) && (
              <button
                onClick={handleClearFilters}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
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

        <ScrollToTop />
      </main>

      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onUpgrade={handleUpgradeSubscription}
      />

      <Footer variant="light" />
    </div>
  );
}

export default function ProviderLeadsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-white/20 rounded w-1/4 mb-4"></div>
              <div className="h-5 bg-white/20 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl p-6 shadow-sm">
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <ProviderLeadsPageContent />
    </Suspense>
  );
}
