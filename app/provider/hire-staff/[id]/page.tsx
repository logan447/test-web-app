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

type Caregiver = {
  id: string;
  name: string;
  description: string;
  careTypesOffered: string[];
  city: string;
  state: string;
  address: string;
  zipCode: string;
  email: string;
  phone: string;
  yearsInBusiness: number;
  licensed: boolean;
  licenseNumber: string | null;
  serviceRadius: number | null;
  website: string | null;
};

export default function CaregiverHireDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [caregiver, setCaregiver] = useState<Caregiver | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestMessage, setRequestMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Determine back link based on where user came from
  const fromSaved = searchParams.get('from') === 'saved';
  const backHref = fromSaved ? '/provider/saved' : '/provider/hire-staff';
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

    fetchCaregiver();
  }, [session, status, router, params.id]);

  const fetchCaregiver = async () => {
    try {
      const response = await fetch(`/api/providers/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        // Verify it's an independent caregiver available for organizations
        if (data.providerType !== 'INDEPENDENT_CAREGIVER' || !data.availableForOrganizations) {
          router.push('/provider/hire-staff');
          return;
        }
        setCaregiver(data);
      } else {
        router.push('/provider/hire-staff');
      }
    } catch (err) {
      console.error('Error fetching caregiver:', err);
      router.push('/provider/hire-staff');
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
      // Get the organization's provider profile to create family profile for the request
      const orgProviderResponse = await fetch('/api/providers/me');
      if (!orgProviderResponse.ok) {
        showToast.error('Please create a provider profile first');
        setSending(false);
        return;
      }
      const orgProviderData = await orgProviderResponse.json();

      // Create or get family profile for the organization (reuse existing if present)
      let familyProfileId = null;
      const familyProfileResponse = await fetch('/api/family-profiles/me');
      if (familyProfileResponse.ok) {
        const familyProfileData = await familyProfileResponse.json();
        familyProfileId = familyProfileData.id;
      } else {
        // Create minimal family profile for organization hiring
        const createProfileResponse = await fetch('/api/family-profiles/me', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            careTypes: ['COMPANION_CARE'], // Default
            location: orgProviderData.address,
            city: orgProviderData.city,
            state: orgProviderData.state,
            zipCode: orgProviderData.zipCode,
            description: `Hiring request from ${orgProviderData.name}`,
            isPublic: false,
          }),
        });

        if (createProfileResponse.ok) {
          const createdProfile = await createProfileResponse.json();
          familyProfileId = createdProfile.id;
        }
      }

      if (!familyProfileId) {
        showToast.error('Failed to prepare hiring request');
        setSending(false);
        return;
      }

      // Send hiring request (consultation request)
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyProfileId: familyProfileId,
          providerId: caregiver?.id,
          message: requestMessage,
          requestType: 'HIRING',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success('Hiring request sent!');
        setRequestMessage('');
        router.push('/provider/hiring-requests');
      } else {
        if (data.requiresUpgrade) {
          setPaywallOpen(true);
        } else {
          showToast.error(data.error || 'Failed to send request');
        }
      }
    } catch (err) {
      console.error('Error sending request:', err);
      showToast.error('Failed to send hiring request');
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

  if (!caregiver) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <Breadcrumb currentPage={caregiver.name} />

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

        {/* Caregiver Profile */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {caregiver.name}
              </h1>
              <p className="text-gray-600">
                {caregiver.city}, {caregiver.state}
              </p>
            </div>
            {caregiver.licensed && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Licensed
              </span>
            )}
          </div>

          {/* About */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
            <p className="text-gray-700 whitespace-pre-line">{caregiver.description}</p>
          </div>

          {/* Care Types */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Care Types Offered</h2>
            <div className="flex flex-wrap gap-2">
              {caregiver.careTypesOffered.map((type) => (
                <span
                  key={type}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {formatCareType(type)}
                </span>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Experience</h3>
              <p className="text-gray-900">{caregiver.yearsInBusiness} years</p>
            </div>
            {caregiver.serviceRadius && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Service Radius</h3>
                <p className="text-gray-900">{caregiver.serviceRadius} miles</p>
              </div>
            )}
            {caregiver.licensed && caregiver.licenseNumber && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">License Number</h3>
                <p className="text-gray-900">{caregiver.licenseNumber}</p>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Email:</p>
                <p className="text-gray-900">
                  <a href={`mailto:${caregiver.email}`} className="text-primary-600 hover:text-primary-700">
                    {caregiver.email}
                  </a>
                </p>
              </div>
              <div>
                <p className="text-gray-600">Phone:</p>
                <p className="text-gray-900">
                  <a href={`tel:${caregiver.phone}`} className="text-primary-600 hover:text-primary-700">
                    {caregiver.phone}
                  </a>
                </p>
              </div>
              {caregiver.website && (
                <div>
                  <p className="text-gray-600">Website:</p>
                  <p className="text-gray-900">
                    <a
                      href={caregiver.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {caregiver.website}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Send Hiring Request */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Send Hiring Request</h2>
          <p className="text-gray-600 mb-4">
            Introduce your organization and describe the employment opportunity. Contact information will be shared once they accept your request.
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
                placeholder="Tell them about your organization and the position you're hiring for..."
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={sending}
                className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 disabled:opacity-50 font-medium"
              >
                {sending ? 'Sending...' : 'Send Hiring Request'}
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
          router.push('/provider/hire-staff');
        }}
        defaultView="login"
      />
    </div>
  );
}
