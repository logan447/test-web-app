"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MainNav from "@/components/Navigation/MainNav";
import Breadcrumb from "@/components/Navigation/Breadcrumb";
import Link from "next/link";
import { showToast } from "@/lib/toast";
import EnhancedProviderCard from "@/components/Directory/EnhancedProviderCard";

/**
 * Matches - Algorithmic provider matches for families
 *
 * Shows providers that algorithmically match the family's care profile.
 * Matching is based on care types, location, and other profile factors.
 */

type FamilyProfile = {
  id: string;
  careTypes: string[];
  city: string;
  state: string;
  zipCode: string;
  lovedOneAge: number | null;
  budget: string | null;
};

type Provider = {
  id: string;
  name: string;
  description: string | null;
  providerType: string;
  careTypesOffered: string[];
  city: string;
  state: string;
  zipCode: string;
  coverPhoto: string | null;
  photos: string[];
  verified: boolean;
  backgroundChecked: boolean;
  insuranceVerified: boolean;
  licensed: boolean;
  certifications: string[];
  averageRating: number | null;
  reviewCount: number;
  priceMin: number | null;
  priceMax: number | null;
  availableSpots: number | null;
  totalCapacity: number | null;
  hasMemoryCare: boolean;
  hasRespiteCare: boolean;
  hasHospiceCare: boolean;
  claimed?: boolean;
  yearsInBusiness?: number;
  serviceRadius?: number | null;
};

type MatchedProvider = Provider & {
  matchScore: number;
  matchReasons: string[];
};

type SavedProvider = Provider & {
  savedAt: string;
};

type ActiveEngagement = {
  id: string;
  status: string;
  createdAt: string;
  provider: Provider;
};

type TabType = 'matched' | 'my-providers';

export default function MatchesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [familyProfile, setFamilyProfile] = useState<FamilyProfile | null>(null);
  const [matchedProviders, setMatchedProviders] = useState<MatchedProvider[]>([]);
  const [savedProviders, setSavedProviders] = useState<SavedProvider[]>([]);
  const [activeEngagements, setActiveEngagements] = useState<ActiveEngagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedProviderIds, setRequestedProviderIds] = useState<Map<string, string>>(new Map());
  const [activeTab, setActiveTab] = useState<TabType>('matched');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      // Fetch family profile
      const profileResponse = await fetch("/api/family-profiles/me");
      if (!profileResponse.ok) {
        setLoading(false);
        return;
      }

      const profile = await profileResponse.json();
      setFamilyProfile(profile);

      // Only fetch providers if profile has care types
      if (profile.careTypes && profile.careTypes.length > 0) {
        await fetchMatches(profile);
      }

      // Fetch existing requests to know which providers already have engagement
      await fetchExistingRequests();

      // Fetch saved providers and active engagements
      await Promise.all([
        fetchSavedProviders(),
        fetchActiveEngagements(),
      ]);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedProviders = async () => {
    try {
      const response = await fetch("/api/saved-providers");
      if (response.ok) {
        const data = await response.json();
        setSavedProviders(data);
      }
    } catch (err) {
      console.error("Error fetching saved providers:", err);
    }
  };

  const fetchActiveEngagements = async () => {
    try {
      const response = await fetch("/api/requests?type=sent");
      if (response.ok) {
        const requests = await response.json();
        // Filter to only active engagements (not declined or completed)
        const active = requests.filter((req: any) =>
          !['DECLINED', 'COMPLETED', 'CANCELLED'].includes(req.status)
        );
        setActiveEngagements(active);
      }
    } catch (err) {
      console.error("Error fetching active engagements:", err);
    }
  };

  const fetchMatches = async (profile: FamilyProfile) => {
    try {
      // Fetch all providers
      const providersResponse = await fetch("/api/providers");
      if (!providersResponse.ok) return;

      const allProviders: Provider[] = await providersResponse.json();

      // Filter and score providers based on profile match
      const scored = allProviders
        .map(provider => scoreProvider(provider, profile))
        .filter(p => p.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore);

      setMatchedProviders(scored);
    } catch (err) {
      console.error("Error fetching matches:", err);
    }
  };

  const fetchExistingRequests = async () => {
    try {
      const response = await fetch("/api/requests?type=sent");
      if (response.ok) {
        const requests = await response.json();
        const map = new Map<string, string>();
        requests.forEach((req: any) => {
          if (req.providerId) {
            map.set(req.providerId, req.id);
          }
        });
        setRequestedProviderIds(map);
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  // Simple matching algorithm
  const scoreProvider = (provider: Provider, profile: FamilyProfile): MatchedProvider => {
    let score = 0;
    const reasons: string[] = [];

    // Care type match (most important)
    const careTypeMatches = profile.careTypes.filter(ct =>
      provider.careTypesOffered.includes(ct)
    );
    if (careTypeMatches.length > 0) {
      score += careTypeMatches.length * 30;
      if (careTypeMatches.length === profile.careTypes.length) {
        reasons.push("Offers all your required care types");
      } else {
        reasons.push(`Offers ${careTypeMatches.length} of your care types`);
      }
    }

    // Location match
    if (provider.state === profile.state) {
      score += 20;
      if (provider.city === profile.city) {
        score += 30;
        reasons.push("In your city");
      } else {
        reasons.push("In your state");
      }
    }

    // Service radius (if provider serves your area)
    if (provider.serviceRadius && provider.zipCode && profile.zipCode) {
      // Simple check - in production would use actual distance calculation
      if (provider.zipCode.substring(0, 3) === profile.zipCode.substring(0, 3)) {
        score += 15;
        reasons.push("Serves your area");
      }
    }

    // Trust signals
    if (provider.verified) {
      score += 10;
      reasons.push("Verified provider");
    }
    if (provider.backgroundChecked) {
      score += 10;
      reasons.push("Background checked");
    }
    if (provider.insuranceVerified) {
      score += 5;
    }
    if (provider.licensed) {
      score += 5;
      reasons.push("Licensed");
    }

    // Experience
    if (provider.yearsInBusiness && provider.yearsInBusiness >= 5) {
      score += 10;
      reasons.push(`${provider.yearsInBusiness}+ years experience`);
    }

    return {
      ...provider,
      matchScore: Math.min(score, 100), // Cap at 100
      matchReasons: reasons,
    };
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <Breadcrumb />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // No profile or no care types
  if (!familyProfile || !familyProfile.careTypes || familyProfile.careTypes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <Breadcrumb />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Matches</h1>
            <p className="text-lg text-gray-600">
              Providers matched to your care needs
            </p>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No matches yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Complete your care profile to start receiving personalized provider matches based on your specific needs and preferences.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/care-profile/edit"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Complete Care Profile
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Browse All Providers
              </Link>
            </div>
          </div>

          {/* How Matching Works */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              How Matching Works
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Complete Your Profile</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Tell us about your care needs, location, budget, and preferences.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Get Matched</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Our algorithm finds providers that match your specific requirements.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Connect</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Review matches and reach out to providers that interest you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const myProvidersCount = savedProviders.length + activeEngagements.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <Breadcrumb />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Matches & Providers</h1>
          <p className="text-lg text-gray-600">
            Your personalized provider matches and saved providers
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('matched')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'matched'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Matched Providers
                {matchedProviders.length > 0 && (
                  <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs">
                    {matchedProviders.length}
                  </span>
                )}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('my-providers')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'my-providers'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                My Providers
                {myProvidersCount > 0 && (
                  <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs">
                    {myProvidersCount}
                  </span>
                )}
              </span>
            </button>
          </nav>
        </div>

        {/* Matched Providers Tab */}
        {activeTab === 'matched' && (
          <>
            {/* Care types filter display */}
            {familyProfile && familyProfile.careTypes.length > 0 && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">Matching for:</span>
                {familyProfile.careTypes.map(ct => (
                  <span
                    key={ct}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                  >
                    {ct.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                  </span>
                ))}
                <Link
                  href="/care-profile/edit"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Edit
                </Link>
              </div>
            )}

            {/* Results count */}
            {matchedProviders.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
                <p className="text-lg font-semibold text-gray-900">
                  {matchedProviders.length} Match{matchedProviders.length !== 1 ? 'es' : ''} Found
                </p>
                <p className="text-sm text-gray-600">
                  Sorted by match score
                </p>
              </div>
            )}

            {matchedProviders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No matching providers found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  We couldn&apos;t find providers that match your current criteria. Try broadening your search or browsing all providers.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors"
                  >
                    Browse All Providers
                  </Link>
                  <Link
                    href="/care-profile/edit"
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                  >
                    Edit Care Profile
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {matchedProviders.map((provider) => {
                  const requestId = requestedProviderIds.get(provider.id);
                  const linkHref = requestId ? `/requests/${requestId}` : `/providers/${provider.id}`;

                  return (
                    <div key={provider.id} className="relative">
                      {/* Match score badge */}
                      <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1">
                        <div className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm ${
                          provider.matchScore >= 80 ? 'bg-green-100 text-green-800' :
                          provider.matchScore >= 60 ? 'bg-blue-100 text-blue-800' :
                          provider.matchScore >= 40 ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {provider.matchScore}% Match
                        </div>
                      </div>

                      <EnhancedProviderCard
                        provider={provider}
                        linkHref={linkHref}
                        hasRequestSent={!!requestId}
                      />

                      {/* Match reasons */}
                      {provider.matchReasons.length > 0 && (
                        <div className="mt-2 px-4 pb-4">
                          <div className="flex flex-wrap gap-2">
                            {provider.matchReasons.slice(0, 3).map((reason, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full flex items-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Browse all CTA */}
            <div className="mt-8 text-center">
              <Link
                href="/"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
              >
                Browse all providers
                <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </>
        )}

        {/* My Providers Tab */}
        {activeTab === 'my-providers' && (
          <>
            {/* Active Engagements Section */}
            {activeEngagements.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Active Conversations</h2>
                    <p className="text-sm text-gray-600">Providers you&apos;re currently connected with</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {activeEngagements.map((engagement) => {
                    const statusColors: Record<string, string> = {
                      PENDING: 'bg-amber-100 text-amber-800',
                      APPROVED: 'bg-green-100 text-green-800',
                      IN_PROGRESS: 'bg-blue-100 text-blue-800',
                    };
                    const statusLabel: Record<string, string> = {
                      PENDING: 'Awaiting Response',
                      APPROVED: 'Connected',
                      IN_PROGRESS: 'In Progress',
                    };

                    return (
                      <Link
                        key={engagement.id}
                        href={`/requests/${engagement.id}`}
                        className="block"
                      >
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {engagement.provider?.name || 'Provider'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {engagement.provider?.city}, {engagement.provider?.state}
                                </p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[engagement.status] || 'bg-gray-100 text-gray-800'}`}>
                                {statusLabel[engagement.status] || engagement.status}
                              </span>
                            </div>

                            {engagement.provider?.careTypesOffered && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {engagement.provider.careTypesOffered.slice(0, 3).map((type) => (
                                  <span key={type} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                                    {type.replace(/_/g, ' ')}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center text-sm text-gray-500">
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Started {new Date(engagement.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
                            <span className="text-sm font-medium text-primary-600 flex items-center">
                              View conversation
                              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Saved Providers Section */}
            {savedProviders.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-pink-100 rounded-full">
                    <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Saved Providers</h2>
                    <p className="text-sm text-gray-600">Providers you&apos;ve saved for later</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {savedProviders.map((provider) => {
                    const requestId = requestedProviderIds.get(provider.id);
                    const linkHref = requestId ? `/requests/${requestId}` : `/providers/${provider.id}`;

                    return (
                      <EnhancedProviderCard
                        key={provider.id}
                        provider={provider}
                        linkHref={linkHref}
                        hasRequestSent={!!requestId}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty state for My Providers */}
            {activeEngagements.length === 0 && savedProviders.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No saved providers yet
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Browse providers and save ones you&apos;re interested in to easily find them later.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Browse Providers
                  </Link>
                  <button
                    onClick={() => setActiveTab('matched')}
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                  >
                    View Matches
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
