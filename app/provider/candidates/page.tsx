'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import MainNav from '@/components/Navigation/MainNav';
import Footer from '@/components/Navigation/Footer';
import OnboardingPrompt from '@/components/Provider/OnboardingPrompt';
import ProfileCompletionBanner from '@/components/Provider/ProfileCompletionBanner';
import WelcomeBanner from '@/components/Provider/WelcomeBanner';
import PageHero from '@/components/UI/PageHero';
import EmptyState from '@/components/UI/EmptyState';
import { useProviderIdentity } from '@/hooks/useProviderIdentity';
import { showToast } from '@/lib/toast';

type HiringRequest = {
  id: string;
  status: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  provider: {
    id: string;
    name: string;
    providerType: string;
    city?: string;
    state?: string;
    coverPhoto?: string | null;
    yearsInBusiness?: number;
    careTypesOffered?: string[];
    certifications?: string[];
    verified?: boolean;
    backgroundChecked?: boolean;
  };
  familyProfile: {
    user: {
      name: string;
    };
  };
  sender: {
    id: string;
    name: string;
    image?: string | null;
  };
  _count: {
    messages: number;
  };
  appointments?: {
    id: string;
    scheduledAt: string;
    status: string;
  }[];
};

const STATUS_CONFIG = {
  PENDING: {
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    sentLabel: 'Awaiting Response',
    receivedLabel: 'Needs Your Response',
  },
  ACCEPTED: {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    sentLabel: 'In Conversation',
    receivedLabel: 'In Conversation',
  },
  DECLINED: {
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    sentLabel: 'Declined',
    receivedLabel: 'Declined',
  },
  COMPLETED: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    sentLabel: 'Hired',
    receivedLabel: 'Hired',
  },
};

/**
 * Candidates - For organizations to manage hiring engagements with caregivers
 *
 * Shows caregiver candidates that have an engagement relationship with this organization:
 * - Caregivers who applied to the organization
 * - Caregivers the organization reached out to
 * - Active conversations, pending, accepted states
 */
export default function CandidatesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [receivedRequests, setReceivedRequests] = useState<HiringRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<HiringRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'received' | 'sent'>('all');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  const { needsOnboarding, loading: identityLoading } = useProviderIdentity({
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
      } else {
        showToast.error('Unable to load incoming applications');
      }

      if (sentRes.ok) {
        const sentData = await sentRes.json();
        setSentRequests(sentData);
      } else {
        showToast.error('Unable to load your outreach');
      }
    } catch (err) {
      console.error('Error fetching hiring requests:', err);
      showToast.error('Unable to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const formatCareType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (loading || status === 'loading' || identityLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-white/20 rounded w-1/4 mb-2"></div>
              <div className="h-5 bg-white/20 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl p-6">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Combine and filter requests based on tab and status
  const allRequests = [
    ...receivedRequests.map((r) => ({ ...r, direction: 'received' as const })),
    ...sentRequests.map((r) => ({ ...r, direction: 'sent' as const })),
  ].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

  let filteredRequests = allRequests;
  if (activeTab !== 'all') {
    filteredRequests = filteredRequests.filter((r) => r.direction === activeTab);
  }
  if (statusFilter) {
    filteredRequests = filteredRequests.filter((r) => r.status === statusFilter);
  }

  // Stats
  const totalCandidates = allRequests.length;
  const pendingCount = allRequests.filter((r) => r.status === 'PENDING').length;
  const activeCount = allRequests.filter((r) => r.status === 'ACCEPTED').length;
  const hiredCount = allRequests.filter((r) => r.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      {/* Hero using PageHero for consistency */}
      <PageHero
        title="My Candidates"
        subtitle="Manage your hiring pipeline and conversations with caregivers"
        variant="primary"
        compact
        stats={[
          { value: totalCandidates, label: 'Total' },
          { value: pendingCount, label: 'Pending' },
          { value: activeCount, label: 'Active' },
          { value: hiredCount, label: 'Hired' },
        ]}
        actions={
          <Link
            href="/provider/hire-staff"
            className="inline-flex items-center gap-2 bg-white text-primary-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Find Caregivers
          </Link>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome banner for new users */}
        <WelcomeBanner variant="organization" isVisible={showWelcome} onDismiss={() => setShowWelcome(false)} />

        {/* Onboarding prompt for incomplete profiles */}
        {needsOnboarding && !showWelcome && (
          <div className="mb-8">
            <OnboardingPrompt context="requests" />
          </div>
        )}

        {/* Profile completion nudge */}
        {!needsOnboarding && !showWelcome && <ProfileCompletionBanner />}

        {/* Pipeline Dashboard */}
        {totalCandidates > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => setStatusFilter(statusFilter === 'PENDING' ? null : 'PENDING')}
              className={`p-4 rounded-xl border-2 transition-all ${
                statusFilter === 'PENDING'
                  ? 'border-amber-400 bg-amber-50'
                  : 'border-gray-200 bg-white hover:border-amber-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-sm font-medium text-gray-600">Pending</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </button>
            <button
              onClick={() => setStatusFilter(statusFilter === 'ACCEPTED' ? null : 'ACCEPTED')}
              className={`p-4 rounded-xl border-2 transition-all ${
                statusFilter === 'ACCEPTED'
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-green-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-gray-600">Active</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
            </button>
            <button
              onClick={() => setStatusFilter(statusFilter === 'COMPLETED' ? null : 'COMPLETED')}
              className={`p-4 rounded-xl border-2 transition-all ${
                statusFilter === 'COMPLETED'
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm font-medium text-gray-600">Hired</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{hiredCount}</p>
            </button>
            <button
              onClick={() => setStatusFilter(statusFilter === 'DECLINED' ? null : 'DECLINED')}
              className={`p-4 rounded-xl border-2 transition-all ${
                statusFilter === 'DECLINED'
                  ? 'border-gray-400 bg-gray-100'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-sm font-medium text-gray-600">Declined</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {allRequests.filter((r) => r.status === 'DECLINED').length}
              </p>
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="border-b border-gray-100">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 px-4 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
                  activeTab === 'all'
                    ? 'border-primary-600 text-primary-600 bg-primary-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                All Candidates ({allRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('received')}
                className={`flex-1 px-4 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
                  activeTab === 'received'
                    ? 'border-primary-600 text-primary-600 bg-primary-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Applied to You ({receivedRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`flex-1 px-4 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
                  activeTab === 'sent'
                    ? 'border-primary-600 text-primary-600 bg-primary-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Your Outreach ({sentRequests.length})
              </button>
            </nav>
          </div>

          {/* Filter indicator */}
          {statusFilter && (
            <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing:{' '}
                <span className="font-medium">
                  {statusFilter === 'PENDING'
                    ? 'Pending'
                    : statusFilter === 'ACCEPTED'
                    ? 'Active'
                    : statusFilter === 'COMPLETED'
                    ? 'Hired'
                    : 'Declined'}
                </span>
              </span>
              <button onClick={() => setStatusFilter(null)} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Clear filter
              </button>
            </div>
          )}
        </div>

        {/* Candidate List */}
        {filteredRequests.length === 0 ? (
          <EmptyState
            variant="default"
            size="large"
            title={
              statusFilter
                ? `No ${statusFilter.toLowerCase()} candidates`
                : activeTab === 'received'
                ? 'No applications yet'
                : activeTab === 'sent'
                ? 'No outreach yet'
                : 'Start building your team'
            }
            description={
              statusFilter
                ? 'Try clearing the filter to see all candidates.'
                : activeTab === 'received'
                ? needsOnboarding
                  ? 'Complete your organization profile so caregivers can discover you and express interest in joining your team.'
                  : 'When caregivers are interested in joining your organization, their applications will appear here.'
                : activeTab === 'sent'
                ? 'Browse available caregivers and reach out to start a conversation about employment opportunities.'
                : 'Find qualified independent caregivers who are open to employment, or wait for caregivers to apply to your organization.'
            }
            icon={
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
            actions={
              statusFilter
                ? [{ label: 'Clear Filter', onClick: () => setStatusFilter(null), variant: 'secondary' }]
                : needsOnboarding && activeTab === 'received'
                ? [{ label: 'Complete Your Profile', href: '/provider/profile/edit', variant: 'primary' }]
                : [
                    { label: 'Browse Caregivers', href: '/provider/hire-staff', variant: 'primary' },
                    { label: 'View Your Profile', href: '/provider/profile', variant: 'secondary' },
                  ]
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => {
              const statusConfig = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
              const isReceived = request.direction === 'received';
              const displayName = isReceived ? request.sender.name : request.provider.name;
              const provider = request.provider;
              const imageUrl = provider?.coverPhoto || null;

              return (
                <Link
                  key={request.id}
                  href={`/provider/candidates/${request.id}`}
                  className="block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex gap-4">
                      {/* Profile Image */}
                      <div className="shrink-0">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                          {imageUrl ? (
                            <Image src={imageUrl} alt={displayName} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                              <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{displayName}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              {provider?.city && provider?.state && (
                                <span>
                                  {provider.city}, {provider.state}
                                </span>
                              )}
                              {provider?.yearsInBusiness && (
                                <>
                                  <span>•</span>
                                  <span>{provider.yearsInBusiness} years exp</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}
                            >
                              {statusConfig.icon}
                              {isReceived ? statusConfig.receivedLabel : statusConfig.sentLabel}
                            </span>
                            <span className="text-xs text-gray-500">{getTimeAgo(request.updatedAt || request.createdAt)}</span>
                          </div>
                        </div>

                        {/* Tags Row */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded ${
                              isReceived ? 'bg-blue-100 text-blue-700' : 'bg-primary-100 text-primary-700'
                            }`}
                          >
                            {isReceived ? 'Applied to you' : 'Your outreach'}
                          </span>
                          {provider?.verified && (
                            <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded border border-green-200">
                              Verified
                            </span>
                          )}
                          {provider?.backgroundChecked && (
                            <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded border border-green-200">
                              Background Checked
                            </span>
                          )}
                          {provider?.careTypesOffered?.slice(0, 2).map((type) => (
                            <span key={type} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              {formatCareType(type)}
                            </span>
                          ))}
                        </div>

                        {/* Message Preview */}
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{request.message}</p>

                        {/* Footer Row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {request._count.messages > 0 && (
                              <div className="flex items-center gap-1.5 text-sm text-primary-600">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                  />
                                </svg>
                                <span className="font-medium">
                                  {request._count.messages} {request._count.messages === 1 ? 'message' : 'messages'}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-medium text-primary-600 flex items-center gap-1">
                            View Details
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        {totalCandidates > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <Link
                href="/provider/hire-staff"
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary-200 hover:bg-primary-50 transition-colors"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Find More Caregivers</p>
                  <p className="text-sm text-gray-500">Browse available talent</p>
                </div>
              </Link>
              <Link
                href="/provider/requests"
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary-200 hover:bg-primary-50 transition-colors"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Family Consultations</p>
                  <p className="text-sm text-gray-500">View client inquiries</p>
                </div>
              </Link>
              <Link
                href="/provider/profile"
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary-200 hover:bg-primary-50 transition-colors"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Your Profile</p>
                  <p className="text-sm text-gray-500">Update organization info</p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer variant="light" />
    </div>
  );
}
