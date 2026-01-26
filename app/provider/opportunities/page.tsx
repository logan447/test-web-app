'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import MainNav from '@/components/Navigation/MainNav';
import Footer from '@/components/Navigation/Footer';
import OnboardingPrompt from '@/components/Provider/OnboardingPrompt';
import { useProviderIdentity } from '@/hooks/useProviderIdentity';

type HiringRequest = {
  id: string;
  status: string;
  message: string;
  createdAt: string;
  provider: {
    id: string;
    name: string;
    providerType: string;
    city?: string;
    state?: string;
    coverPhoto?: string;
  };
  familyProfile?: {
    user: {
      name: string;
    };
  };
  sender: {
    id: string;
    name: string;
  };
  senderProvider?: {
    id: string;
    name: string;
    providerType: string;
    city?: string;
    state?: string;
    coverPhoto?: string;
  };
  _count: {
    messages: number;
  };
};

type OrganizationMatch = {
  id: string;
  name: string;
  providerType: string;
  city: string;
  state: string;
  description: string | null;
  coverPhoto: string | null;
  photos: string[];
  isHiring: boolean;
  matchScore: number;
  matchReasons: string[];
  careTypesOffered: string[];
};

export default function OpportunitiesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [receivedRequests, setReceivedRequests] = useState<HiringRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<HiringRequest[]>([]);
  const [organizationMatches, setOrganizationMatches] = useState<OrganizationMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  const { needsOnboarding, hasIdentity, loading: identityLoading } = useProviderIdentity({
    checkMode: true,
  });

  useEffect(() => {
    if (status === 'loading' || identityLoading) return;

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchRequests();
      fetchOrganizationMatches();
    }
  }, [status, identityLoading]);

  const fetchRequests = async () => {
    try {
      const [receivedRes, sentRes] = await Promise.all([
        fetch('/api/requests?type=received&requestType=HIRING'),
        fetch('/api/requests?type=sent&requestType=HIRING'),
      ]);

      if (receivedRes.ok) {
        const receivedData = await receivedRes.json();
        setReceivedRequests(receivedData);
      }

      if (sentRes.ok) {
        const sentData = await sentRes.json();
        setSentRequests(sentData);
      }
    } catch (err) {
      console.error('Error fetching hiring requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizationMatches = async () => {
    try {
      setMatchesLoading(true);
      const response = await fetch('/api/caregiver/matches');
      if (response.ok) {
        const data = await response.json();
        setOrganizationMatches(data);
      }
    } catch (err) {
      console.error('Error fetching organization matches:', err);
    } finally {
      setMatchesLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800';
      case 'ACCEPTED':
        return 'bg-emerald-100 text-emerald-800';
      case 'DECLINED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string, isReceived: boolean) => {
    switch (status) {
      case 'PENDING':
        return isReceived ? 'Awaiting your response' : 'Waiting for reply';
      case 'ACCEPTED':
        return 'In conversation';
      case 'DECLINED':
        return 'Declined';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  };

  const formatProviderType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  if (loading || status === 'loading' || identityLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-white/20 rounded w-1/3 mb-4"></div>
              <div className="h-5 bg-white/20 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl p-6">
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeRequests = receivedRequests.filter(r => r.status === 'ACCEPTED');
  const pendingReceived = receivedRequests.filter(r => r.status === 'PENDING');
  const requests = activeTab === 'received' ? receivedRequests : sentRequests;

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">My Opportunities</h1>
              <p className="text-primary-100 text-lg">
                Manage your job opportunities and connect with care organizations
              </p>
            </div>
            <Link
              href="/providers/browse-organizations"
              className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Organizations
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">{activeRequests.length}</div>
              <div className="text-primary-100 text-sm">Active Conversations</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">{pendingReceived.length}</div>
              <div className="text-primary-100 text-sm">Pending Responses</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">{organizationMatches.length}</div>
              <div className="text-primary-100 text-sm">Organization Matches</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Onboarding prompt for incomplete profiles */}
        {needsOnboarding && (
          <div className="mb-8">
            <OnboardingPrompt context="requests" />
          </div>
        )}

        {/* Organization Matches Section */}
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
                  <h2 className="text-xl font-bold text-gray-900">Organizations Looking for You</h2>
                  <p className="text-sm text-gray-600">Matched based on your skills, location, and availability</p>
                </div>
              </div>
              <Link
                href="/providers/browse-organizations"
                className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
              >
                View all
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {matchesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse bg-white rounded-xl p-4">
                    <div className="h-24 bg-gray-200 rounded-lg mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : organizationMatches.length === 0 ? (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="font-semibold text-gray-900 mb-1">No matches yet</h3>
                <p className="text-gray-600 text-sm mb-4">Complete your profile to get matched with organizations</p>
                <Link
                  href="/provider/profile/edit"
                  className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-medium text-sm transition-colors"
                >
                  Complete Profile
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {organizationMatches.slice(0, 4).map((org) => (
                  <Link
                    key={org.id}
                    href={`/providers/${org.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100"
                  >
                    {/* Image */}
                    <div className="relative h-28 bg-gradient-to-br from-primary-100 to-primary-200">
                      {org.coverPhoto || org.photos?.[0] ? (
                        <img
                          src={org.coverPhoto || org.photos[0]}
                          alt={org.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-10 h-10 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      )}
                      {/* Match Score Badge */}
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full">
                          {org.matchScore}% match
                        </span>
                      </div>
                      {org.isHiring && (
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                            Hiring
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1 mb-1">
                        {org.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {formatProviderType(org.providerType)} • {org.city}, {org.state}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {org.matchReasons.slice(0, 2).map((reason, idx) => (
                          <span key={idx} className="text-xs text-emerald-600 flex items-center gap-0.5">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        {hasIdentity && organizationMatches.length > 0 && (
          <div className="border-b border-gray-200 mb-8"></div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="border-b border-gray-100">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('received')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors relative ${
                  activeTab === 'received'
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  Organizations Reaching Out
                  {receivedRequests.length > 0 && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
                      {receivedRequests.length}
                    </span>
                  )}
                </div>
                {activeTab === 'received' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors relative ${
                  activeTab === 'sent'
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Your Applications
                  {sentRequests.length > 0 && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                      {sentRequests.length}
                    </span>
                  )}
                </div>
                {activeTab === 'sent' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></div>
                )}
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {requests.length === 0 ? (
              <div className="text-center py-12">
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
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {activeTab === 'sent'
                    ? 'No applications sent yet'
                    : 'No opportunities received yet'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {activeTab === 'received'
                    ? needsOnboarding
                      ? 'Complete your caregiver profile to be discovered by organizations looking to hire.'
                      : 'Organizations looking for caregivers will appear here when they reach out.'
                    : 'Browse organizations and apply to positions that interest you.'}
                </p>
                {activeTab === 'received' && needsOnboarding ? (
                  <Link
                    href="/provider/profile/edit"
                    className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Complete Your Profile
                  </Link>
                ) : activeTab === 'sent' ? (
                  <Link
                    href="/providers/browse-organizations"
                    className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Browse Organizations
                  </Link>
                ) : null}
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => {
                  // Determine the organization info (could be from provider or senderProvider)
                  const orgInfo = activeTab === 'received'
                    ? request.senderProvider || request.provider
                    : request.provider;

                  return (
                    <div
                      key={request.id}
                      className="group bg-gray-50 hover:bg-white rounded-xl p-5 transition-all border border-transparent hover:border-gray-200 hover:shadow-sm"
                    >
                      <div className="flex gap-4">
                        {/* Organization Image */}
                        <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200">
                          {orgInfo?.coverPhoto ? (
                            <img
                              src={orgInfo.coverPhoto}
                              alt={orgInfo.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                {orgInfo?.name || 'Unknown Organization'}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {orgInfo?.providerType && formatProviderType(orgInfo.providerType)}
                                {orgInfo?.city && orgInfo?.state && ` • ${orgInfo.city}, ${orgInfo.state}`}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              {request._count?.messages > 0 && (
                                <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-medium">
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                  </svg>
                                  {request._count.messages} new
                                </div>
                              )}
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                {getStatusText(request.status, activeTab === 'received')}
                              </span>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{request.message}</p>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {activeTab === 'sent' ? 'Applied' : 'Received'} {new Date(request.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                            <div className="flex gap-2">
                              {request.status === 'PENDING' && activeTab === 'received' && (
                                <Link
                                  href={`/provider/opportunities/${request.id}`}
                                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                                >
                                  Respond
                                </Link>
                              )}
                              <Link
                                href={`/provider/opportunities/${request.id}`}
                                className="text-sm font-medium text-primary-600 hover:text-primary-700"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer variant="light" />
    </div>
  );
}
