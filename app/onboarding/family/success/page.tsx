'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Provider {
  id: string;
  name: string;
  providerType: string;
  city: string;
  state: string;
  careTypesOffered: string[];
  primaryPhoto?: string;
  averageRating?: number;
  reviewCount?: number;
  priceMin?: number;
  priceMax?: number;
}

export default function FamilyOnboardingSuccess() {
  const router = useRouter();
  const [matches, setMatches] = useState<Provider[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // Get profile data from session storage
        const careType = sessionStorage.getItem('onboarding_careType');
        const city = sessionStorage.getItem('onboarding_city');
        const state = sessionStorage.getItem('onboarding_state');

        if (careType && city) {
          const careTypes = JSON.parse(careType);
          setProfileData({ careTypes, city, state });

          // Fetch matching providers
          const response = await fetch('/api/matching/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              city,
              careTypes,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setMatches(data.matches.slice(0, 3)); // Top 3
            setMatchCount(data.count);
          }
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const handleBrowseProviders = () => {
    router.push('/providers');
  };

  const handleCompleteProfile = () => {
    router.push('/dashboard/care-profile');
  };

  const handleViewProfile = () => {
    router.push('/dashboard');
  };

  const formatProviderType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatPrice = (min?: number, max?: number) => {
    if (!min && !max) return null;
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}/mo`;
    if (min) return `From $${min.toLocaleString()}/mo`;
    if (max) return `Up to $${max.toLocaleString()}/mo`;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-8 md:p-12">
        {/* Success icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            You&apos;re all set!
          </h1>
          <p className="text-xl text-gray-600">
            Your care profile is complete
          </p>
        </div>

        {/* Matched Providers Section */}
        {!loading && matchCount > 0 && (
          <div className="mb-8">
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-indigo-900">
                  {matchCount} {matchCount === 1 ? 'Provider Matches' : 'Providers Match'} Your Needs!
                </h2>
              </div>
              <p className="text-sm text-indigo-800">
                These providers in {profileData?.city} offer the care types you&apos;re looking for
              </p>
            </div>

            {/* Provider Cards */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {matches.map((provider) => (
                <Link
                  key={provider.id}
                  href={`/providers/${provider.id}`}
                  className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                >
                  {/* Photo */}
                  {provider.primaryPhoto && (
                    <div className="aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <img
                        src={provider.primaryPhoto}
                        alt={provider.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Name & Type */}
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                    {provider.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {formatProviderType(provider.providerType)}
                  </p>

                  {/* Rating */}
                  {provider.averageRating && (
                    <div className="flex items-center gap-1 mb-2">
                      <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900">
                        {provider.averageRating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({provider.reviewCount || 0})
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  {formatPrice(provider.priceMin, provider.priceMax) && (
                    <p className="text-sm font-medium text-gray-900">
                      {formatPrice(provider.priceMin, provider.priceMax)}
                    </p>
                  )}

                  {/* Location */}
                  <p className="text-xs text-gray-500 mt-2">
                    {provider.city}, {provider.state}
                  </p>

                  {/* Match badge */}
                  <div className="mt-3 inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Match
                  </div>
                </Link>
              ))}
            </div>

            {matchCount > 3 && (
              <div className="text-center">
                <button
                  onClick={handleBrowseProviders}
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                  View all {matchCount} matches →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Zero matches state */}
        {!loading && matchCount === 0 && profileData && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  Building your matches
                </h3>
                <p className="text-sm text-blue-800 mb-3">
                  We&apos;re actively adding providers in {profileData.city}. In the meantime:
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Browse all providers in your area</li>
                  <li>• Complete your profile for better matching</li>
                  <li>• Check back soon for new matches</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* What's next */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="font-semibold text-blue-900 mb-3">What happens next?</h2>
          <ul className="space-y-2 text-sm text-blue-900">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-1">✓</span>
              <span>
                <span className="font-semibold">Providers can now see you&apos;re looking for care</span> in your area
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-1">✓</span>
              <span>
                You&apos;ll appear in search results for providers offering the care types you selected
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-1">✓</span>
              <span>
                Qualified providers can reach out with availability and information
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-1">✓</span>
              <span>
                You can browse providers and request consultations anytime
              </span>
            </li>
          </ul>
        </div>

        {/* CTA buttons */}
        <div className="space-y-3">
          <button
            onClick={handleBrowseProviders}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            {matchCount > 0 ? `View All ${matchCount} Matches` : 'Browse Care Providers'} →
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleViewProfile}
              className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-300 transition-colors duration-200"
            >
              View My Dashboard
            </button>

            <button
              onClick={handleCompleteProfile}
              className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-300 transition-colors duration-200"
            >
              Enhance My Profile
            </button>
          </div>
        </div>

        {/* Privacy reminder */}
        <p className="text-center text-sm text-gray-500 mt-6">
          You can update your profile or change your visibility settings anytime from your dashboard.
        </p>
      </div>
    </div>
  );
}
