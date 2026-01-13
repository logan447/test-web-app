'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MainNav from '@/components/Navigation/MainNav';

type VerificationSignals = {
  overallScore: number;
  autoApprove: boolean;
  requiresManualReview: boolean;
  signals: {
    emailDomainMatch: SignalResult;
    emailVerified: SignalResult;
    professionalEmail: SignalResult;
    nameSimilarity: SignalResult;
    accountAge: SignalResult;
    multipleAttempts: SignalResult;
  };
  strengths: string[];
  concerns: string[];
  recommendation: string;
};

type SignalResult = {
  score: number;
  status: 'strong' | 'moderate' | 'weak' | 'fail';
  detail: string;
};

type PendingClaim = {
  id: string;
  attemptedAt: string;
  verificationScore: number;
  signals: VerificationSignals;
  user: {
    id: string;
    email: string;
    name: string;
    accountAge: number;
    createdAt: string;
  };
  provider: {
    id: string;
    name: string;
    email: string;
    website?: string;
    phone?: string;
    city: string;
    state: string;
    providerType: string;
    description?: string;
  };
  ipAddress: string;
  status: string;
};

export default function AdminClaimsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [claims, setClaims] = useState<PendingClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewingClaimId, setReviewingClaimId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchPendingClaims();
    }
  }, [status]);

  const fetchPendingClaims = async () => {
    try {
      const response = await fetch('/api/admin/claims/pending');

      if (response.status === 403) {
        setError('Access denied - admin privileges required');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch claims');
      }

      const data = await response.json();
      setClaims(data.claims);
    } catch (err) {
      console.error('Error fetching claims:', err);
      setError('Failed to load pending claims');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (claimId: string, action: 'approve' | 'reject') => {
    setReviewingClaimId(claimId);
    setError('');

    try {
      const response = await fetch('/api/admin/claims/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId,
          action,
          notes: reviewNotes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Review failed');
      }

      // Remove claim from list
      setClaims(claims.filter((c) => c.id !== claimId));
      setReviewNotes('');
    } catch (err) {
      console.error('Error reviewing claim:', err);
      setError(err instanceof Error ? err.message : 'Failed to review claim');
    } finally {
      setReviewingClaimId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading pending claims...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !claims.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Provider Claim Review Board
          </h1>
          <p className="text-gray-600">
            Review and approve provider profile claim attempts
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="bg-blue-100 px-4 py-2 rounded-lg">
              <span className="text-blue-900 font-semibold">{claims.length}</span>
              <span className="text-blue-700 ml-2">Pending Review</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Claims List */}
        {claims.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Pending Claims</h3>
            <p className="mt-2 text-gray-500">All claims have been reviewed!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {claims.map((claim) => (
              <div key={claim.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Score Header */}
                <div
                  className={`px-6 py-4 ${
                    claim.verificationScore >= 80
                      ? 'bg-green-50 border-l-4 border-green-500'
                      : claim.verificationScore >= 50
                      ? 'bg-yellow-50 border-l-4 border-yellow-500'
                      : 'bg-red-50 border-l-4 border-red-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {claim.provider.name}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {claim.provider.city}, {claim.provider.state} • {claim.provider.providerType}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">
                        {claim.verificationScore}
                      </div>
                      <div className="text-sm text-gray-600">Verification Score</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Claiming</h3>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-gray-600">Name:</dt>
                        <dd className="font-medium text-gray-900">{claim.user.name}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">Email:</dt>
                        <dd className="font-medium text-gray-900">{claim.user.email}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">Account Age:</dt>
                        <dd className="font-medium text-gray-900">{claim.user.accountAge} days</dd>
                      </div>
                      <div>
                        <dt className="text-gray-600">IP Address:</dt>
                        <dd className="font-medium text-gray-900">{claim.ipAddress}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Provider Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Being Claimed</h3>
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt className="text-gray-600">Email:</dt>
                        <dd className="font-medium text-gray-900">{claim.provider.email}</dd>
                      </div>
                      {claim.provider.website && (
                        <div>
                          <dt className="text-gray-600">Website:</dt>
                          <dd className="font-medium text-gray-900">
                            <a
                              href={claim.provider.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:underline"
                            >
                              {claim.provider.website}
                            </a>
                          </dd>
                        </div>
                      )}
                      {claim.provider.phone && (
                        <div>
                          <dt className="text-gray-600">Phone:</dt>
                          <dd className="font-medium text-gray-900">{claim.provider.phone}</dd>
                        </div>
                      )}
                      {claim.provider.description && (
                        <div>
                          <dt className="text-gray-600">Description:</dt>
                          <dd className="text-gray-700 text-xs mt-1">{claim.provider.description}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                {/* Verification Signals */}
                {claim.signals && (
                  <div className="px-6 pb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Signals</h3>

                    {/* Strengths */}
                    {claim.signals.strengths.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-green-900 mb-2">✓ Strengths</h4>
                        <ul className="space-y-1">
                          {claim.signals.strengths.map((strength, idx) => (
                            <li key={idx} className="text-sm text-green-700 flex items-start">
                              <svg className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Concerns */}
                    {claim.signals.concerns.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-red-900 mb-2">⚠ Concerns</h4>
                        <ul className="space-y-1">
                          {claim.signals.concerns.map((concern, idx) => (
                            <li key={idx} className="text-sm text-red-700 flex items-start">
                              <svg className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              {concern}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendation */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">System Recommendation</h4>
                      <p className={`text-sm font-semibold ${
                        claim.signals.recommendation === 'AUTO_APPROVE'
                          ? 'text-green-700'
                          : claim.signals.recommendation === 'MANUAL_REVIEW'
                          ? 'text-yellow-700'
                          : 'text-red-700'
                      }`}>
                        {claim.signals.recommendation.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                <div className="px-6 pb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Internal Notes (Optional)
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add any notes about this decision..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
                  />
                </div>

                {/* Action Buttons */}
                <div className="px-6 pb-6 flex gap-4">
                  <button
                    onClick={() => handleReview(claim.id, 'approve')}
                    disabled={reviewingClaimId === claim.id}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {reviewingClaimId === claim.id ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approve Claim
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleReview(claim.id, 'reject')}
                    disabled={reviewingClaimId === claim.id}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {reviewingClaimId === claim.id ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject Claim
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
