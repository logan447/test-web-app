"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MainNav from "@/components/Navigation/MainNav";
import Link from "next/link";
import EnhancedProviderCard from "@/components/Directory/EnhancedProviderCard";

/**
 * Matches Page - Combined view of Recommended Matches + Active Engagements
 *
 * Section 1: Recommended Matches - algorithm-based matches where no outreach has occurred
 * Section 2: Active Matches - inbound + outbound engagements between families and providers
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
  _count?: {
    messages: number;
  };
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
      const profileResponse = await fetch("/api/family-profiles/me");
      if (!profileResponse.ok) {
        setLoading(false);
        return;
      }

      const profile = await profileResponse.json();
      setFamilyProfile(profile);

      const requestsData = await fetchActiveRequests();

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
      const sentResponse = await fetch("/api/requests?type=sent");
      if (sentResponse.ok) {
        const sentRequests = await sentResponse.json();
        sentRequests.forEach((req: any) => {
          if (!['DECLINED', 'COMPLETED', 'CANCELLED'].includes(req.status)) {
            allRequests.push({ ...req, type: 'sent' as const });
          }
          if (req.providerId) {
            engagedIds.add(req.providerId);
          }
        });
      }

      const receivedResponse = await fetch("/api/requests?type=received");
      if (receivedResponse.ok) {
        const receivedRequests = await receivedResponse.json();
        receivedRequests.forEach((req: any) => {
          if (!['DECLINED', 'COMPLETED', 'CANCELLED'].includes(req.status)) {
            allRequests.push({ ...req, type: 'received' as const });
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
      const providersResponse = await fetch("/api/providers");
      if (!providersResponse.ok) return;

      const allProviders: Provider[] = await providersResponse.json();

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

  const scoreProvider = (provider: Provider, profile: FamilyProfile): MatchedProvider => {
    let score = 0;
    const reasons: string[] = [];

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

    if (provider.state === profile.state) {
      score += 20;
      if (provider.city === profile.city) {
        score += 30;
        reasons.push("In your city");
      } else {
        reasons.push("In your state");
      }
    }

    if (provider.serviceRadius && provider.zipCode && profile.zipCode) {
      if (provider.zipCode.substring(0, 3) === profile.zipCode.substring(0, 3)) {
        score += 15;
        reasons.push("Serves your area");
      }
    }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-800';
      case 'ACCEPTED': case 'APPROVED': return 'bg-emerald-100 text-emerald-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string, type: string) => {
    if (status === 'PENDING') {
      return type === 'sent' ? 'Awaiting Response' : 'Needs Response';
    }
    if (status === 'ACCEPTED' || status === 'APPROVED') return 'Connected';
    if (status === 'IN_PROGRESS') return 'In Progress';
    return status;
  };

  // Loading state with skeleton
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-white/20 rounded w-1/3 mb-4"></div>
              <div className="h-5 bg-white/20 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
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

  // Calculate stats
  const pendingCount = activeRequests.filter(r => r.status === 'PENDING').length;
  const activeCount = activeRequests.filter(r => r.status === 'ACCEPTED' || r.status === 'APPROVED').length;

  // No profile or no care types - show empty state
  if (!familyProfile || !familyProfile.careTypes || familyProfile.careTypes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />

        {/* Hero Header */}
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">My Matches</h1>
                <p className="text-primary-100 text-lg">
                  Find care providers that match your needs
                </p>
              </div>
              <Link
                href="/browse"
                className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Providers
              </Link>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Active Matches section - show even without profile */}
          {activeRequests.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Active Connections</h2>
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
              Complete your care profile to get matched
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Tell us about your care needs and preferences to receive personalized provider recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/care-profile/edit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Complete Care Profile
              </Link>
              <Link
                href="/browse"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                Browse Providers
              </Link>
            </div>
          </div>

          {/* How Matching Works */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">How Matching Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-600 font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Complete Your Profile</h3>
                <p className="text-sm text-gray-600">
                  Tell us about your care needs, location, budget, and preferences.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-600 font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Get Matched</h3>
                <p className="text-sm text-gray-600">
                  Our algorithm finds providers that match your specific requirements.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-600 font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Connect</h3>
                <p className="text-sm text-gray-600">
                  Review matches and reach out to providers that interest you.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  function renderActiveRequests() {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeRequests.map((request) => (
          <Link
            key={request.id}
            href={`/requests/${request.id}`}
            className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all overflow-hidden"
          >
            {/* Provider Image */}
            <div className="relative h-32 bg-gradient-to-br from-primary-100 to-primary-200">
              {request.provider?.coverPhoto ? (
                <img
                  src={request.provider.coverPhoto}
                  alt={request.provider.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                  {getStatusLabel(request.status, request.type)}
                </span>
              </div>
              {/* Unread Badge */}
              {request._count?.messages && request._count.messages > 0 && (
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    {request._count.messages}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {request.provider?.name || 'Provider'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {request.provider?.city}, {request.provider?.state}
                  </p>
                </div>
                {request.type === 'received' && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full shrink-0">
                    Reached out
                  </span>
                )}
              </div>

              {request.provider?.careTypesOffered && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {request.provider.careTypesOffered.slice(0, 2).map((type) => (
                    <span key={type} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {type.replace(/_/g, ' ')}
                    </span>
                  ))}
                  {request.provider.careTypesOffered.length > 2 && (
                    <span className="text-xs text-gray-500">+{request.provider.careTypesOffered.length - 2}</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="text-primary-600 font-medium flex items-center gap-1">
                  View
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">My Matches</h1>
              <p className="text-primary-100 text-lg">
                Your recommended providers and active connections
                {familyProfile.city && familyProfile.state && (
                  <span> in {familyProfile.city}, {familyProfile.state}</span>
                )}
              </p>
            </div>
            <Link
              href="/browse"
              className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse All
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">{matchedProviders.length}</div>
              <div className="text-primary-100 text-sm">Recommended Matches</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">{activeCount}</div>
              <div className="text-primary-100 text-sm">Active Connections</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">{pendingCount}</div>
              <div className="text-primary-100 text-sm">Pending Responses</div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
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
              className="text-primary-600 hover:text-primary-700 text-sm font-medium ml-2"
            >
              Edit
            </Link>
          </div>
        )}

        {/* Section 1: Recommended Matches */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-full">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
                <p className="text-sm text-gray-600">Providers that match your care needs</p>
              </div>
            </div>
          </div>

          {matchedProviders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No new matches found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {activeRequests.length > 0
                  ? "You've already connected with providers matching your criteria. Browse all providers to find more options."
                  : "We couldn't find providers that match your current criteria. Try browsing all providers."}
              </p>
              <Link
                href="/browse"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors"
              >
                Browse All Providers
              </Link>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {matchedProviders.length} Match{matchedProviders.length !== 1 ? 'es' : ''} Found
                    </p>
                    <p className="text-sm text-gray-600">Sorted by match score</p>
                  </div>
                  <Link
                    href="/browse"
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Browse all →
                  </Link>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchedProviders.map((provider) => (
                  <div key={provider.id} className="relative">
                    <div className="absolute top-4 right-4 z-10">
                      <div className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm ${
                        provider.matchScore >= 80 ? 'bg-emerald-100 text-emerald-800' :
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

                    {provider.matchReasons.length > 0 && (
                      <div className="mt-2 px-4">
                        <div className="flex flex-wrap gap-1">
                          {provider.matchReasons.slice(0, 2).map((reason, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full flex items-center gap-1"
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
            </>
          )}
        </div>

        {/* Divider */}
        {activeRequests.length > 0 && matchedProviders.length > 0 && (
          <div className="border-b border-gray-200 mb-10"></div>
        )}

        {/* Section 2: Active Connections */}
        {activeRequests.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Active Connections</h2>
                <p className="text-sm text-gray-600">
                  {activeRequests.length} conversation{activeRequests.length !== 1 ? 's' : ''} with providers
                </p>
              </div>
            </div>
            {renderActiveRequests()}
          </div>
        )}
      </main>
    </div>
  );
}
