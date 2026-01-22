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
 * Candidates - For organizations to manage hiring engagements with caregivers
 *
 * Shows caregiver candidates that have an engagement relationship with this organization:
 * - Caregivers who applied to the organization
 * - Caregivers the organization reached out to
 * - Active conversations, pending, accepted states
 *
 * This page is accessible without a complete profile (shows empty state with prompt).
 */
export default function CandidatesPage() {
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
    // Simplified, user-friendly status messages for hiring/employment
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Candidates</h1>
          <p className="text-lg text-gray-600">
            Manage your hiring conversations with independent caregivers
          </p>
        </div>

        {/* Onboarding prompt for incomplete profiles */}
        {needsOnboarding && (
          <OnboardingPrompt context="requests" />
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('received')}
              className={`${
                activeTab === 'received'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Interested in You ({receivedRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`${
                activeTab === 'sent'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Your Outreach ({sentRequests.length})
            </button>
          </nav>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {activeTab === 'received' ? 'No candidates yet' : 'No outreach sent yet'}
            </h3>
            <p className="mt-2 text-gray-600 max-w-md mx-auto">
              {activeTab === 'received'
                ? needsOnboarding
                  ? 'Complete your organization profile to be discovered by caregivers looking for positions.'
                  : 'Caregivers who are interested in working with your organization will appear here.'
                : 'Browse available caregivers and reach out to start a conversation.'}
            </p>
            {activeTab === 'received' && needsOnboarding ? (
              <Link
                href="/provider/onboarding"
                className="mt-6 inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors"
              >
                Complete Your Profile
              </Link>
            ) : (
              <Link
                href="/provider/hire-staff"
                className="mt-6 inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors"
              >
                Browse Caregivers
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Link
                key={request.id}
                href={`/provider/candidates/${request.id}`}
                className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {activeTab === 'received'
                        ? `From: ${request.sender.name}`
                        : `To: ${request.provider.name}`}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getCombinedBadgeText(request.status, activeTab)}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 line-clamp-2">{request.message}</p>

                {request._count.messages > 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    {request._count.messages > 1 ? `${request._count.messages} unread messages` : `${request._count.messages} unread message`}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
