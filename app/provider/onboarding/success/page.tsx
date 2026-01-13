'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Family {
  id: string;
  city: string;
  state: string;
  careType: string[];
  careNeeds: string[];
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string | null;
  whoNeedsCare: string | null;
  createdAt: Date;
}

export default function ProviderOnboardingSuccess() {
  const router = useRouter();
  const [matches, setMatches] = useState<Family[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // Get profile data from session storage
        const careTypes = sessionStorage.getItem('provider_onboarding_careTypes');
        const city = sessionStorage.getItem('provider_onboarding_city');
        const state = sessionStorage.getItem('provider_onboarding_state');

        if (careTypes && city) {
          const careTypesArray = JSON.parse(careTypes);
          setProfileData({ careTypes: careTypesArray, city, state });

          // Fetch matching families
          const response = await fetch('/api/matching/families', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              city,
              careTypes: careTypesArray,
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

  const formatCareType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Budget flexible';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}/mo`;
    if (min) return `From $${min.toLocaleString()}/mo`;
    if (max) return `Up to $${max.toLocaleString()}/mo`;
    return 'Budget flexible';
  };

  const getUrgencyBadge = (timeline: string | null) => {
    if (!timeline) return null;
    const lower = timeline.toLowerCase();
    if (lower.includes('asap') || lower.includes('immediate')) {
      return <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-800 rounded">Urgent</span>;
    }
    if (lower.includes('1-3') || lower.includes('soon')) {
      return <span className="text-xs font-medium px-2 py-1 bg-orange-100 text-orange-800 rounded">Within 3 months</span>;
    }
    return <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded">{timeline}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-8 md:p-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Your profile is live!
          </h1>
          <p className="text-xl text-gray-600">
            You&apos;re all set to connect with families
          </p>
        </div>

        {/* Matched Families Section */}
        {!loading && matchCount > 0 && (
          <div className="mb-8">
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-indigo-900">
                  {matchCount} {matchCount === 1 ? 'Family' : 'Families'} Looking for Your Services!
                </h2>
              </div>
              <p className="text-sm text-indigo-800">
                These families in {profileData?.city} are seeking the care types you offer
              </p>
            </div>

            {/* Family Cards */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {matches.map((family, index) => (
                <div
                  key={family.id}
                  className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                >
                  {/* Header with urgency */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold text-gray-900">
                        Family in {family.city}
                      </span>
                    </div>
                  </div>

                  {/* Care Types */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Looking for:</p>
                    <div className="flex flex-wrap gap-1">
                      {family.careType.slice(0, 2).map((type, i) => (
                        <span
                          key={i}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                        >
                          {formatCareType(type)}
                        </span>
                      ))}
                      {family.careType.length > 2 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          +{family.careType.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Care Needs */}
                  {family.careNeeds && family.careNeeds.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Needs:</p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {family.careNeeds.slice(0, 2).join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Budget */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-900">
                      {formatBudget(family.budgetMin, family.budgetMax)}
                    </p>
                  </div>

                  {/* Timeline */}
                  {family.timeline && (
                    <div className="mb-3">
                      {getUrgencyBadge(family.timeline)}
                    </div>
                  )}

                  {/* Match badge */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Match
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {matchCount > 3 && (
              <div className="text-center">
                <button
                  onClick={() => router.push('/provider/families')}
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
                  Families are searching
                </h3>
                <p className="text-sm text-blue-800 mb-3">
                  Families in {profileData.city} are actively looking for care. While you wait:
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Complete your profile to stand out</li>
                  <li>• Add photos and detailed descriptions</li>
                  <li>• Check back regularly for new matches</li>
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
                <span className="font-semibold">Families can now find you</span> in search results when looking for your services
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-1">✓</span>
              <span>
                You&apos;ll receive consultation requests from families in your area
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-1">✓</span>
              <span>
                Your profile is visible to families seeking the care types you offer
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-1">✓</span>
              <span>
                You can browse families looking for care and reach out to them
              </span>
            </li>
          </ul>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/provider/families')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            {matchCount > 0 ? `Browse ${matchCount} Matching Families` : 'Browse Families Looking for Care'} →
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => router.push('/provider/profile')}
              className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-300 transition-colors"
            >
              Enhance My Profile
            </button>

            <button
              onClick={() => router.push('/provider/requests')}
              className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-300 transition-colors"
            >
              View My Inbox
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          You can update your profile or visibility settings anytime from your dashboard.
        </p>
      </div>
    </div>
  );
}
