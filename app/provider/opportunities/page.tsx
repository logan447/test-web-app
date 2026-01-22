'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import MainNav from '@/components/Navigation/MainNav';
import Breadcrumb from '@/components/Navigation/Breadcrumb';
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
  };
  familyProfile: {
    user: {
      name: string;
    };
  };
  sender: {
    id: string;
    name: string;
  };
  _count: {
    messages: number;
  };
};

/**
 * Opportunities - For independent caregivers to manage job engagements
 *
 * Shows job opportunities (hiring requests) where:
 * - Organizations reached out to the caregiver
 * - Caregiver applied to organizations
 * - Active conversations, pending, accepted states
 *
 * This page is accessible without a complete profile (shows empty state with prompt).
 */
export default function OpportunitiesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [receivedRequests, setReceivedRequests] = useState<HiringRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<HiringRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  // Check for provider identity (Manual Ch 8: gentle nudges, not forced redirects)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'DECLINED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCombinedBadgeText = (status: string, activeTab: string) => {
    if (status === 'PENDING') {
      return activeTab === 'sent' ? 'Waiting for reply' : 'Needs your response';
    } else if (status === 'ACCEPTED') {
      return 'Conversation started';
    } else if (status === 'DECLINED') {
      return 'Declined';
    } else if (status === 'COMPLETED') {
      return 'Completed';
    }
    return status;
  };

  if (loading || status === 'loading' || identityLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <Breadcrumb />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const requests = activeTab === 'received' ? receivedRequests : sentRequests;

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <Breadcrumb />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Opportunities</h1>
          <p className="text-lg text-gray-600">
            Manage your job opportunities and conversations with care organizations
          </p>
        </div>

        {/* Onboarding prompt for incomplete profiles */}
        {needsOnboarding && (
          <OnboardingPrompt context="requests" />
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('received')}
              className={`pb-4 border-b-2 font-medium ${
                activeTab === 'received'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Organizations Reaching Out
              {receivedRequests.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
                  {receivedRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`pb-4 border-b-2 font-medium ${
                activeTab === 'sent'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Your Applications
              {sentRequests.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                  {sentRequests.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Content */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-300 mb-4"
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
            {activeTab === 'received' && needsOnboarding && (
              <Link
                href="/provider/profile/edit"
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium"
              >
                Complete Your Profile
              </Link>
            )}
            {activeTab === 'sent' && (
              <Link
                href="/provider/organizations"
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium"
              >
                Browse Organizations
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.provider.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {request.provider.providerType?.split('_').join(' ')}
                      {request.provider.city && request.provider.state &&
                        ` • ${request.provider.city}, ${request.provider.state}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activeTab === 'sent'
                        ? `Applied on ${new Date(request.createdAt).toLocaleDateString()}`
                        : `Received on ${new Date(request.createdAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {request._count && request._count.messages > 0 && (
                      <div className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <span>{request._count.messages} new</span>
                      </div>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getCombinedBadgeText(request.status, activeTab)}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 line-clamp-2">{request.message}</p>

                <div className="flex gap-2">
                  <Link
                    href={`/provider/opportunities/${request.id}`}
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 text-sm font-medium"
                  >
                    View Details
                  </Link>
                  {request.status === 'PENDING' && activeTab === 'received' && (
                    <button
                      onClick={() => {/* Handle quick response */}}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm"
                    >
                      Respond
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
