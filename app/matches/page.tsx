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

export default function MatchesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [familyProfile, setFamilyProfile] = useState<FamilyProfile | null>(null);
  const [matchedProviders, setMatchedProviders] = useState<MatchedProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedProviderIds, setRequestedProviderIds] = useState<Map<string, string>>(new Map());

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
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <Breadcrumb />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Matches</h1>
          <p className="text-lg text-gray-600">
            Providers matched to your care needs
            {familyProfile.city && familyProfile.state && (
              <span> in {familyProfile.city}, {familyProfile.state}</span>
            )}
          </p>
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
      </main>
    </div>
  );
}
