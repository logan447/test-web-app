'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { showToast } from '@/lib/toast';

interface Provider {
  id: string;
  name: string;
  providerType: string;
  city: string;
  state: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  claimed: boolean;
}

interface TakedownRequest {
  id: string;
  providerId: string;
  provider: Provider;
  reason: string;
  details: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  proofUrl: string | null;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewNotes: string | null;
  createdAt: string;
}

interface Counts {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

const REASON_LABELS: Record<string, string> = {
  NOT_MY_BUSINESS: 'Not My Business',
  INCORRECT_INFO: 'Incorrect Information',
  BUSINESS_CLOSED: 'Business Closed',
  PRIVACY_CONCERN: 'Privacy Concern',
  DUPLICATE_LISTING: 'Duplicate Listing',
  OTHER: 'Other',
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  DENIED: 'bg-red-100 text-red-800',
};

export default function TakedownRequestsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<TakedownRequest[]>([]);
  const [counts, setCounts] = useState<Counts>({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [selectedRequest, setSelectedRequest] = useState<TakedownRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/takedown-requests?status=${statusFilter}`);

      if (!response.ok) {
        if (response.status === 403) {
          showToast.error('Admin access required');
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      setRequests(data.requests);
      setCounts(data.counts);
    } catch (error) {
      console.error('Error fetching takedown requests:', error);
      showToast.error('Failed to load takedown requests');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, router]);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (sessionStatus === 'authenticated') {
      fetchRequests();
    }
  }, [sessionStatus, fetchRequests, router]);

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/takedown-requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reviewNotes }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process request');
      }

      showToast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      setSelectedRequest(null);
      setReviewNotes('');
      fetchRequests();
    } catch (error) {
      console.error('Error processing request:', error);
      showToast.error(error instanceof Error ? error.message : 'Failed to process request');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatProviderType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Takedown Requests</h1>
              <p className="text-sm text-gray-500 mt-1">
                Review and manage listing takedown requests
              </p>
            </div>
            <Link
              href="/admin"
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Admin
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'PENDING'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Pending ({counts.pending})
          </button>
          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'APPROVED'
                ? 'bg-green-100 text-green-800'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Approved ({counts.approved})
          </button>
          <button
            onClick={() => setStatusFilter('DENIED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'DENIED'
                ? 'bg-red-100 text-red-800'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Denied ({counts.rejected})
          </button>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-gray-200 text-gray-800'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            All ({counts.total})
          </button>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">No {statusFilter.toLowerCase()} takedown requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Provider Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <Link
                        href={`/providers/${request.provider.id}`}
                        target="_blank"
                        className="text-lg font-semibold text-gray-900 hover:text-primary-600"
                      >
                        {request.provider.name}
                      </Link>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {formatProviderType(request.provider.providerType)}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${STATUS_STYLES[request.status]}`}>
                        {request.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mb-4">
                      {request.provider.city}, {request.provider.state}
                      {request.provider.claimed && (
                        <span className="ml-2 text-green-600 font-medium">Claimed</span>
                      )}
                    </p>

                    {/* Request Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Reason</p>
                        <p className="font-medium text-gray-900">{REASON_LABELS[request.reason] || request.reason}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Submitted</p>
                        <p className="font-medium text-gray-900">{formatDate(request.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Contact</p>
                        <p className="font-medium text-gray-900">{request.contactName}</p>
                        <p className="text-gray-600">{request.contactEmail}</p>
                      </div>
                      {request.details && (
                        <div className="col-span-2">
                          <p className="text-gray-500">Details</p>
                          <p className="text-gray-700">{request.details}</p>
                        </div>
                      )}
                      {request.proofUrl && (
                        <div className="col-span-2">
                          <p className="text-gray-500">Proof URL</p>
                          <a
                            href={request.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700"
                          >
                            {request.proofUrl}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Review Info (for reviewed requests) */}
                    {request.reviewedAt && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                          Reviewed on {formatDate(request.reviewedAt)}
                        </p>
                        {request.reviewNotes && (
                          <p className="text-sm text-gray-700 mt-1">
                            <span className="font-medium">Notes:</span> {request.reviewNotes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {request.status === 'PENDING' && (
                    <div className="shrink-0">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
                      >
                        Review
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Review Takedown Request</h2>
              <p className="text-sm text-gray-500 mt-1">
                For: {selectedRequest.provider.name}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Request Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Request Details</p>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Reason:</dt>
                    <dd className="font-medium">{REASON_LABELS[selectedRequest.reason]}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">From:</dt>
                    <dd className="font-medium">{selectedRequest.contactName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Email:</dt>
                    <dd>{selectedRequest.contactEmail}</dd>
                  </div>
                </dl>
                {selectedRequest.details && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">{selectedRequest.details}</p>
                  </div>
                )}
              </div>

              {/* Review Notes */}
              <div>
                <label htmlFor="reviewNotes" className="block text-sm font-medium text-gray-700 mb-2">
                  Review Notes (Optional)
                </label>
                <textarea
                  id="reviewNotes"
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add internal notes about your decision..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setReviewNotes('');
                }}
                disabled={processing}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction('reject')}
                disabled={processing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={() => handleAction('approve')}
                disabled={processing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
