'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import MainNav from '@/components/Navigation/MainNav';
import Breadcrumb from '@/components/Navigation/Breadcrumb';
import Link from 'next/link';
import { showToast } from '@/lib/toast';
import AuthModal from '@/components/Auth/AuthModal';
import PaywallModal from '@/components/Paywall/PaywallModal';

type FamilyProfile = {
  id: string;
  user: {
    name: string;
    email: string;
    phone: string | null;
  };
  careTypes: string[];
  location: string;
  city: string;
  state: string;
  zipCode: string;
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string | null;
  insurance: string | null;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
};

export default function FamilyProfileDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<FamilyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestMessage, setRequestMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Determine back link based on where user came from
  const fromSaved = searchParams.get('from') === 'saved';
  const backHref = fromSaved ? '/provider/saved-families' : '/provider/find-families';
  const backText = fromSaved ? 'Back to Saved' : 'Back to Browse';

  useEffect(() => {
    // Wait for session to load
    if (status === 'loading') return;

    // Only show auth modal if definitively unauthenticated
    if (status === 'unauthenticated') {
      setAuthModalOpen(true);
      return;
    }

    // Session is authenticated but data might still be loading
    if (!session) return;

    fetchProfile();
  }, [session, status, router, params.id]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/family-profiles/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        router.push('/provider/find-families');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      router.push('/provider/find-families');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestMessage.trim()) {
      showToast.error('Please enter a message');
      return;
    }

    setSending(true);
    try {
      // First, get the provider associated with this user
      const providerResponse = await fetch('/api/providers/me');
      if (!providerResponse.ok) {
        showToast.error('Please create a provider profile first');
        setSending(false);
        return;
      }
      const providerData = await providerResponse.json();

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyProfileId: profile?.id,
          providerId: providerData.id,
          message: requestMessage,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success('Consultation request sent!');
        setRequestMessage('');
        router.push('/dashboard/requests');
      } else {
        if (data.requiresUpgrade) {
          setPaywallOpen(true);
        } else {
          showToast.error(data.error || 'Failed to send request');
        }
      }
    } catch (err) {
      console.error('Error sending request:', err);
      showToast.error('Failed to send consultation request');
    } finally {
      setSending(false);
    }
  };

  const handleUpgradeSubscription = async (tier: 'PRO') => {
    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success('Provider membership activated!');
        setPaywallOpen(false);
        // Retry sending the request
        await handleSendRequest(new Event('submit') as any);
      } else {
        throw new Error(data.error || 'Failed to activate membership');
      }
    } catch (err: any) {
      console.error('Error activating membership:', err);
      throw err;
    }
  };

  const formatCareType = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Budget not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}/mo`;
    if (min) return `$${min.toLocaleString()}+/mo`;
    if (max) return `Up to $${max.toLocaleString()}/mo`;
    return 'Budget not specified';
  };

  if (!session) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <Breadcrumb />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <Breadcrumb currentPage={`Request in ${profile.city}`} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href={backHref}
            className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {backText}
          </Link>
        </div>

        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Care Request in {profile.city}, {profile.state}
              </h1>
              <p className="text-gray-600">
                Posted {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-primary-600">
                {formatBudget(profile.budgetMin, profile.budgetMax)}
              </p>
            </div>
          </div>

          {/* Care Types */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Care Types Needed</h2>
            <div className="flex flex-wrap gap-2">
              {profile.careTypes.map((type) => (
                <span
                  key={type}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {formatCareType(type)}
                </span>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Location</h2>
            <p className="text-gray-700">{profile.location}</p>
            <p className="text-gray-600">
              {profile.city}, {profile.state} {profile.zipCode}
            </p>
          </div>

          {/* Timeline */}
          {profile.timeline && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Timeline</h2>
              <p className="text-gray-700">{profile.timeline}</p>
            </div>
          )}

          {/* Insurance */}
          {profile.insurance && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Insurance</h2>
              <p className="text-gray-700">{profile.insurance}</p>
            </div>
          )}

          {/* Description */}
          {profile.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Additional Details</h2>
              <p className="text-gray-700 whitespace-pre-line">{profile.description}</p>
            </div>
          )}
        </div>

        {/* Send Consultation Request */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Send Consultation Request</h2>
          <p className="text-gray-600 mb-4">
            Introduce yourself and your services to this family. Contact information will be shared once they accept your request.
          </p>
          <form onSubmit={handleSendRequest}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Message *
              </label>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Tell them about your services and why you&apos;d be a great fit for their needs..."
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={sending}
                className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 disabled:opacity-50 font-medium"
              >
                {sending ? 'Sending...' : 'Send Request'}
              </button>
              <Link
                href={backHref}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 font-medium"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>

      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onUpgrade={handleUpgradeSubscription}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          router.push('/provider/find-families');
        }}
        defaultView="login"
      />
    </div>
  );
}
