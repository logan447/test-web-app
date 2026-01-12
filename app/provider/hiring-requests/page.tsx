'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import MainNav from '@/components/Navigation/MainNav';
import EnhancedHiringRequestCard from '@/components/Directory/EnhancedHiringRequestCard';

type HiringRequest = {
  id: string;
  status: string;
  message: string;
  createdAt: string;
  provider?: {
    id: string;
    name: string;
    providerType: string;
    coverPhoto?: string;
    photos?: string[];
    city?: string;
    state?: string;
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
  _count: {
    messages: number;
  };
};

export default function HiringRequestsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [receivedRequests, setReceivedRequests] = useState<HiringRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<HiringRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchRequests();
    }
  }, [status]);

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

  // Show loading state - session not yet loaded
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show structure immediately while data loads
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header - show immediately */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Hiring Requests</h1>
            <p className="text-lg text-gray-600">
              Manage hiring requests from caregivers interested in joining your team. Review applications, start conversations, and connect with qualified candidates.
            </p>
          </div>

          {/* Tabs - skeleton */}
          <div className="border-b border-gray-200 mb-6">
            <div className="animate-pulse -mb-px flex space-x-8">
              <div className="h-10 bg-gray-200 rounded w-32"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
          </div>

          {/* Content - skeleton */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-12 animate-pulse">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const requests = activeTab === 'received' ? receivedRequests : sentRequests;
  const isProviderMode = (session?.user?.activeMode || 'FAMILY') === 'PROVIDER';

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Hiring Requests</h1>
          <p className="text-lg text-gray-600">
            Manage hiring requests from caregivers interested in joining your team. Review applications, start conversations, and connect with qualified candidates.
          </p>
        </div>

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
              Received ({receivedRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`${
                activeTab === 'sent'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Sent ({sentRequests.length})
            </button>
          </nav>
        </div>

        {/* Requests Grid */}
        {requests.length === 0 ? (
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">No hiring requests</h3>
            <p className="mt-2 text-gray-600">
              {activeTab === 'received'
                ? 'When caregivers express interest in joining your organization, their requests will appear here.'
                : 'You haven\'t sent any hiring requests yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => (
              <EnhancedHiringRequestCard
                key={request.id}
                request={request}
                activeTab={activeTab}
                linkHref={`/dashboard/requests/${request.id}`}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
