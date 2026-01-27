'use client';

/**
 * Provider Lead Response Page
 *
 * Allows providers to respond to family care inquiries (leads).
 * This is the action taken when clicking "Respond" on the leads page.
 *
 * Flow:
 * 1. Provider clicks "Respond" on a family lead
 * 2. They're directed here with familyId query param
 * 3. They see the family's care needs (non-identifying info)
 * 4. They compose and send an initial outreach message
 * 5. A ConsultRequest is created, visible in /provider/requests
 */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import MainNav from '@/components/Navigation/MainNav';
import Footer from '@/components/Navigation/Footer';
import { showToast } from '@/lib/toast';

interface FamilyProfile {
  id: string;
  city: string;
  state: string;
  careTypes: string[];
  ageRange?: string;
  careLevel?: string;
  description?: string;
  timeline?: string;
  budgetMin?: number;
  budgetMax?: number;
  user?: {
    name: string;
  };
  identityRevealed?: boolean;
}

function NewProviderRequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [family, setFamily] = useState<FamilyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const familyId = searchParams.get('familyId');

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/login?redirect=/provider/requests/new?familyId=' + familyId);
      return;
    }

    if (familyId) {
      fetchFamily();
    }
  }, [status, familyId, router]);

  const fetchFamily = async () => {
    try {
      const response = await fetch(`/api/family-profiles/${familyId}`);
      if (response.ok) {
        const data = await response.json();
        setFamily(data);
      } else {
        setError('Could not load family profile');
      }
    } catch (err) {
      console.error('Error fetching family:', err);
      setError('Failed to load family profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setError('Please write a message');
      return;
    }

    setSending(true);
    setError('');

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyProfileId: familyId,
          message: message.trim(),
          requestType: 'CONSULTATION',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.requiresUpgrade) {
          showToast.error('Provider membership required to send messages');
          router.push('/provider/profile?upgrade=true');
          return;
        }
        throw new Error(data.error || 'Failed to send message');
      }

      showToast.success('Message sent! The family will be notified.');
      router.push('/provider/requests');
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      setSending(false);
    }
  };

  const formatCareType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!familyId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No family selected</h2>
            <p className="text-gray-600 mb-4">Please select a family from the leads page to respond to.</p>
            <Link
              href="/provider/leads"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-medium"
            >
              Browse Leads
            </Link>
          </div>
        </main>
        <Footer variant="light" />
      </div>
    );
  }

  if (!family) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Family not found</h2>
            <p className="text-gray-600 mb-4">{error || 'This care inquiry may no longer be available.'}</p>
            <Link
              href="/provider/leads"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-medium"
            >
              Browse Leads
            </Link>
          </div>
        </main>
        <Footer variant="light" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainNav />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
        {/* Back link */}
        <Link
          href="/provider/leads"
          className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to leads
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Respond to Care Inquiry</h1>

        {/* Family info card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {family.identityRevealed && family.user?.name
                  ? family.user.name
                  : 'Family in ' + family.city}
              </h2>
              <p className="text-gray-600">{family.city}, {family.state}</p>

              {/* Care types */}
              {family.careTypes && family.careTypes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {family.careTypes.map((type) => (
                    <span
                      key={type}
                      className="px-2.5 py-1 bg-primary-50 text-primary-700 text-sm rounded-full"
                    >
                      {formatCareType(type)}
                    </span>
                  ))}
                </div>
              )}

              {/* Additional details */}
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                {family.ageRange && (
                  <p><span className="font-medium">Age range:</span> {family.ageRange}</p>
                )}
                {family.careLevel && (
                  <p><span className="font-medium">Care level:</span> {family.careLevel.replace(/_/g, ' ')}</p>
                )}
                {family.timeline && (
                  <p><span className="font-medium">Timeline:</span> {family.timeline.replace(/_/g, ' ')}</p>
                )}
                {(family.budgetMin || family.budgetMax) && (
                  <p>
                    <span className="font-medium">Budget:</span>{' '}
                    {family.budgetMin && family.budgetMax
                      ? `$${family.budgetMin.toLocaleString()} - $${family.budgetMax.toLocaleString()}/month`
                      : family.budgetMax
                        ? `Up to $${family.budgetMax.toLocaleString()}/month`
                        : `From $${family.budgetMin?.toLocaleString()}/month`}
                  </p>
                )}
              </div>

              {family.description && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{family.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Message</h3>

          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Introduce yourself and explain how you can help
            </label>
            <textarea
              id="message"
              name="message"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Hi! I saw your care inquiry and wanted to reach out. Our facility specializes in... We'd love to learn more about your needs and discuss how we can help."
            />
            <p className="mt-2 text-sm text-gray-500">
              Your provider profile will be shared along with this message.
            </p>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-800 mb-2">Tips for a great response:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Introduce yourself and your organization</li>
              <li>• Address their specific care needs mentioned above</li>
              <li>• Highlight relevant experience or services you offer</li>
              <li>• Suggest a next step (call, tour, meeting)</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {sending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Message'
              )}
            </button>
            <Link
              href="/provider/leads"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Info note */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Once you send a message, this family will appear in your{' '}
            <Link href="/provider/requests" className="text-primary-600 hover:underline">
              Conversations
            </Link>{' '}
            tab.
          </p>
        </div>
      </main>

      <Footer variant="light" />
    </div>
  );
}

export default function NewProviderRequestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <NewProviderRequestContent />
    </Suspense>
  );
}
