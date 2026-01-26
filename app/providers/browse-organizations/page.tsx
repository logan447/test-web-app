'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import MainNav from '@/components/Navigation/MainNav';
import Footer from '@/components/Navigation/Footer';
import Link from 'next/link';
import AuthModal from '@/components/Auth/AuthModal';

type Organization = {
  id: string;
  name: string;
  providerType: string;
  description: string;
  careTypesOffered: string[];
  city: string;
  state: string;
  yearsInBusiness: number;
  licensed: boolean;
  email: string;
  phone: string;
  coverPhoto?: string | null;
  photos?: string[];
  verified?: boolean;
  backgroundChecked?: boolean;
  insuranceVerified?: boolean;
};

type MatchedOrganization = {
  id: string;
  name: string;
  providerType: string;
  city: string;
  state: string;
  careTypesOffered: string[];
  matchScore: number;
  matchReasons: string[];
  coverPhoto?: string | null;
};

export default function BrowseOrganizationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [matchedOrgs, setMatchedOrgs] = useState<MatchedOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [requestedOrgIds, setRequestedOrgIds] = useState<Map<string, string>>(new Map());
  const [filters, setFilters] = useState({ city: '', state: '' });

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      setAuthModalOpen(true);
      return;
    }

    checkProviderType();
  }, [status]);

  const checkProviderType = async () => {
    try {
      const response = await fetch('/api/providers/me');
      if (response.ok) {
        const provider = await response.json();
        if (provider.providerType !== 'INDEPENDENT_CAREGIVER') {
          router.push('/provider/leads');
          return;
        }
        fetchOrganizations();
        fetchMatches();
        fetchSentHiringRequests();
      } else {
        router.push('/provider/profile/edit');
      }
    } catch (err) {
      console.error('Error checking provider type:', err);
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.state) params.append('state', filters.state);

      const response = await fetch(`/api/providers?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const orgs = (data.providers || data).filter((p: Organization) =>
          p.providerType !== 'INDEPENDENT_CAREGIVER'
        );
        setOrganizations(orgs);
      }
    } catch (err) {
      console.error('Error fetching organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      setMatchesLoading(true);
      const response = await fetch('/api/caregiver/matches');
      if (response.ok) {
        const data = await response.json();
        setMatchedOrgs(data);
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setMatchesLoading(false);
    }
  };

  const fetchSentHiringRequests = async () => {
    try {
      const [sentResponse, receivedResponse] = await Promise.all([
        fetch('/api/requests?type=sent&requestType=HIRING'),
        fetch('/api/requests?type=received&requestType=HIRING')
      ]);

      const orgMap = new Map<string, string>();

      if (sentResponse.ok) {
        const sentRequests = await sentResponse.json();
        sentRequests.forEach((req: any) => {
          if (req.providerId) {
            orgMap.set(req.providerId, req.id);
          }
        });
      }

      if (receivedResponse.ok) {
        const receivedRequests = await receivedResponse.json();
        receivedRequests.forEach((req: any) => {
          if (req.providerId) {
            orgMap.set(req.providerId, req.id);
          }
        });
      }

      setRequestedOrgIds(orgMap);
    } catch (error) {
      console.error('Error fetching hiring requests:', error);
    }
  };

  const formatProviderType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  const handleSearch = () => {
    setLoading(true);
    fetchOrganizations();
  };

  const inProgressCount = requestedOrgIds.size;
  const targetRemaining = Math.max(0, 5 - inProgressCount);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          router.push('/');
        }}
        defaultView="login"
      />
    );
  }

  return (
    <>
      <MainNav />

      <div className="min-h-screen bg-gray-50">
        {/* Compact Hero - White/Neutral per design standards */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Find Organizations Hiring
                </h1>
                <p className="text-gray-600 mt-1">
                  Apply to 3-5 organizations, schedule interviews, get hired
                </p>
              </div>

              {/* Progress toward goal */}
              {inProgressCount > 0 && (
                <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3">
                  <div className="text-sm text-primary-800">
                    <span className="font-semibold">{inProgressCount} of 5</span> applications in progress
                    {targetRemaining > 0 && (
                      <span className="text-primary-600 ml-1">• Apply to {targetRemaining} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <div className="text-2xl font-bold text-gray-900">{organizations.length}</div>
              <div className="text-sm text-gray-600">Organizations</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <div className="text-2xl font-bold text-primary-600">{matchedOrgs.length}</div>
              <div className="text-sm text-gray-600">Matched to You</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <div className="text-2xl font-bold text-primary-600">{inProgressCount}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </div>

          {/* Matches Section */}
          {matchedOrgs.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Organizations Looking for You</h2>
                  <p className="text-sm text-gray-600">Based on your skills and location</p>
                </div>
              </div>

              {matchesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse bg-white rounded-xl p-5 border border-gray-100">
                      <div className="h-20 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matchedOrgs.slice(0, 6).map((org) => {
                    const requestId = requestedOrgIds.get(org.id);
                    return (
                      <div
                        key={org.id}
                        className="bg-white rounded-xl p-5 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {org.name}
                            </h3>
                            <p className="text-sm text-gray-500">{formatProviderType(org.providerType)}</p>
                            <p className="text-sm text-gray-600">{org.city}, {org.state}</p>
                          </div>
                          <div className="flex items-center gap-1 bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-sm font-medium">
                            {org.matchScore}% match
                          </div>
                        </div>

                        {org.matchReasons?.length > 0 && (
                          <div className="space-y-1 mb-4">
                            {org.matchReasons.slice(0, 2).map((reason, idx) => (
                              <div key={idx} className="flex items-center gap-1 text-xs text-gray-600">
                                <svg className="w-3 h-3 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {reason}
                              </div>
                            ))}
                          </div>
                        )}

                        {requestId ? (
                          <Link
                            href={`/provider/opportunities/${requestId}`}
                            className="block w-full text-center py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                          >
                            View Conversation
                          </Link>
                        ) : (
                          <Link
                            href={`/providers/browse-organizations/${org.id}`}
                            className="block w-full text-center py-2 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                          >
                            Apply Now
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Divider */}
          {matchedOrgs.length > 0 && (
            <div className="border-b border-gray-200 mb-8"></div>
          )}

          {/* Browse All Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-5">All Organizations</h2>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    placeholder="Any city"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={filters.state}
                    onChange={(e) => setFilters({ ...filters, state: e.target.value.toUpperCase().slice(0, 2) })}
                    placeholder="TX"
                    maxLength={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-5 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-100">
                    <div className="h-36 bg-gray-200 rounded-t-xl"></div>
                    <div className="p-4">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : organizations.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No organizations found</h3>
                <p className="text-gray-600">Try adjusting your search filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organizations.map((org) => {
                  const requestId = requestedOrgIds.get(org.id);
                  return (
                    <div
                      key={org.id}
                      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col"
                    >
                      {/* Image */}
                      <div className="relative h-36 bg-gradient-to-br from-gray-100 to-gray-200">
                        {org.coverPhoto || org.photos?.[0] ? (
                          <img
                            src={org.coverPhoto || org.photos?.[0]}
                            alt={org.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                        )}
                        {/* Status Badge */}
                        {requestId && (
                          <div className="absolute top-3 right-3 bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                            In Progress
                          </div>
                        )}
                        {/* Type Badge */}
                        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                          {formatProviderType(org.providerType)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {org.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {org.city}, {org.state}
                        </p>

                        {org.description && (
                          <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
                            {org.description}
                          </p>
                        )}

                        {/* Trust Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {org.licensed && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Licensed
                            </span>
                          )}
                          {org.verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Verified
                            </span>
                          )}
                        </div>

                        {/* CTA */}
                        {requestId ? (
                          <Link
                            href={`/provider/opportunities/${requestId}`}
                            className="block w-full text-center py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                          >
                            View Conversation
                          </Link>
                        ) : (
                          <Link
                            href={`/providers/browse-organizations/${org.id}`}
                            className="block w-full text-center py-2.5 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                          >
                            Apply Now
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Guidance footer */}
          {organizations.length > 0 && (
            <div className="mt-12 bg-primary-50 border border-primary-100 rounded-xl p-6 text-center">
              <h3 className="font-semibold text-primary-900 mb-2">
                Tip: Apply to multiple organizations
              </h3>
              <p className="text-primary-700 text-sm">
                Most caregivers who apply to 3-5 organizations get hired faster.
                Your profile is shared when you apply, so organizations can review your experience right away.
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer variant="light" />
    </>
  );
}
