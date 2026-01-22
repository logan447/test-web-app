"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MainNav from "@/components/Navigation/MainNav";
import Breadcrumb from "@/components/Navigation/Breadcrumb";
import Link from "next/link";
import EnhancedProviderCard from "@/components/Directory/EnhancedProviderCard";

/**
 * Matches Page - Combined view of Active Requests + Algorithmic Matches
 *
 * Section 1: Active Requests - inbound + outbound requests between families and providers
 * Section 2: Recommended Matches - algorithm-based matches where no outreach has occurred
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

type ActiveRequest = {
  id: string;
  status: string;
  createdAt: string;
  type: 'sent' | 'received';
  provider: Provider;
};

export default function MatchesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [familyProfile, setFamilyProfile] = useState<FamilyProfile | null>(null);
  const [matchedProviders, setMatchedProviders] = useState<MatchedProvider[]>([]);
  const [activeRequests, setActiveRequests] = useState<ActiveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [engagedProviderIds, setEngagedProviderIds] = useState<Set<string>>(new Set());

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

      // Fetch active requests (both sent and received)
      const requestsData = await fetchActiveRequests();

      // Only fetch matches if profile has care types
      if (profile.careTypes && profile.careTypes.length > 0) {
        await fetchMatches(profile, requestsData.engagedIds);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveRequests = async () => {
    const engagedIds = new Set<string>();
    const allRequests: ActiveRequest[] = [];

    try {
      // Fetch sent requests
      const sentResponse = await fetch("/api/requests?type=sent");
      if (sentResponse.ok) {
        const sentRequests = await sentResponse.json();
        sentRequests.forEach((req: any) => {
          // Only include active (not declined/completed/cancelled)
          if (!['DECLINED', 'COMPLETED', 'CANCELLED'].includes(req.status)) {
            allRequests.push({
              ...req,
              type: 'sent' as const,
            });
          }
          // Track all engaged provider IDs (including declined) to exclude from matches
          if (req.providerId) {
            engagedIds.add(req.providerId);
          }
        });
      }

      // Fetch received requests (from providers reaching out to family)
      const receivedResponse = await fetch("/api/requests?type=received");
      if (receivedResponse.ok) {
        const receivedRequests = await receivedResponse.json();
        receivedRequests.forEach((req: any) => {
          if (!['DECLINED', 'COMPLETED', 'CANCELLED'].includes(req.status)) {
            allRequests.push({
              ...req,
              type: 'received' as const,
            });
          }
          if (req.providerId) {
            engagedIds.add(req.providerId);
          }
        });
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
    }

    setActiveRequests(allRequests);
    setEngagedProviderIds(engagedIds);
    return { requests: allRequests, engagedIds };
  };

  const fetchMatches = async (profile: FamilyProfile, engagedIds: Set<string>) => {
    try {
      // Fetch all providers
      const providersResponse = await fetch("/api/providers");
      if (!providersResponse.ok) return;

      const allProviders: Provider[] = await providersResponse.json();

      // Filter out providers we already have engagements with, then score
      const scored = allProviders
        .filter(provider => !engagedIds.has(provider.id))
        .map(provider => scoreProvider(provider, profile))
        .filter(p => p.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore);

      setMatchedProviders(scored);
    } catch (err) {
      console.error("Error fetching matches:", err);
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
      matchScore: Math.min(score, 100),
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

  // No profile or no care types - show empty state
  if (!familyProfile || !familyProfile.careTypes || familyProfile.careTypes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <Breadcrumb />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Matches</h1>
            <p className="text-lg text-gray-600">
              Your active requests and recommended providers
            </p>
          </div>

          {/* Active Requests section - show even without profile */}
          {activeRequests.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Active Requests</h2>
                  <p className="text-sm text-gray-600">Providers you&apos;re currently connected with</p>
                </div>
              </div>
              {renderActiveRequests()}
            </div>
          )}

          {/* Empty State for matches */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
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
                Complete Care Profile
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
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

  // Helper to render active requests section
  function renderActiveRequests() {
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
      <div className="grid md:grid-cols-2 gap-6">
        {activeRequests.map((request) => (
          <Link
            key={request.id}
            href={`/requests/${request.id}`}
            className="block"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {request.provider?.name || 'Provider'}
                      </h3>
                      {request.type === 'received' && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                          Reached out to you
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {request.provider?.city}, {request.provider?.state}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[request.status] || 'bg-gray-100 text-gray-800'}`}>
                    {statusLabel[request.status] || request.status}
                  </span>
                </div>

                {request.provider?.careTypesOffered && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {request.provider.careTypesOffered.slice(0, 3).map((type) => (
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
                  Started {new Date(request.createdAt).toLocaleDateString()}
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
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <Breadcrumb />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Matches</h1>
          <p className="text-lg text-gray-600">
            Your active requests and recommended providers
            {familyProfile.city && familyProfile.state && (
              <span> in {familyProfile.city}, {familyProfile.state}</span>
            )}
          </p>
        </div>

        {/* Section 1: Active Requests */}
        {activeRequests.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Active Requests</h2>
                <p className="text-sm text-gray-600">
                  {activeRequests.length} active conversation{activeRequests.length !== 1 ? 's' : ''} with providers
                </p>
              </div>
            </div>
            {renderActiveRequests()}
          </div>
        )}

        {/* Divider if both sections have content */}
        {activeRequests.length > 0 && matchedProviders.length > 0 && (
          <div className="border-b border-gray-200 mb-10"></div>
        )}

        {/* Section 2: Recommended Matches */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-full">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recommended Matches</h2>
              <p className="text-sm text-gray-600">
                Providers that match your care needs (no outreach yet)
              </p>
            </div>
          </div>

          {/* Care types filter display */}
          {familyProfile.careTypes.length > 0 && (
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

          {matchedProviders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No new matches found
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {activeRequests.length > 0
                  ? "You've already connected with providers that match your criteria. Browse all providers to find more options."
                  : "We couldn't find providers that match your current criteria. Try broadening your search or browsing all providers."
                }
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
            <>
              {/* Results count */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
                <p className="text-lg font-semibold text-gray-900">
                  {matchedProviders.length} Match{matchedProviders.length !== 1 ? 'es' : ''} Found
                </p>
                <p className="text-sm text-gray-600">
                  Sorted by match score
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {matchedProviders.map((provider) => (
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
                      linkHref={`/providers/${provider.id}`}
                      hasRequestSent={false}
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
                ))}
              </div>

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
        </div>
      </main>
    </div>
  );
}
