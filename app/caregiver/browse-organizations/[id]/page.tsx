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

type Organization = {
  id: string;
  name: string;
  providerType: string;
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
  capacity: number | null;
};

export default function OrganizationDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestMessage, setRequestMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Determine back link
  const fromSaved = searchParams.get('from') === 'saved';
  const backHref = fromSaved ? '/provider/saved' : '/caregiver/browse-organizations';
  const backText = fromSaved ? 'Back to Saved' : 'Back to Browse';

  useEffect(() => {
    if (!session) {
      setAuthModalOpen(true);
      return;
    }
    fetchOrganization();
  }, [session, router, params.id]);

  const fetchOrganization = async () => {
    try {
      const response = await fetch(`/api/providers/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        // Verify it's an organization (not an independent caregiver)
        if (data.providerType === 'INDEPENDENT_CAREGIVER') {
          router.push('/caregiver/browse-organizations');
          return;
        }
        setOrganization(data);
      } else {
        router.push('/caregiver/browse-organizations');
      }
    } catch (err) {
      console.error('Error fetching organization:', err);
      router.push('/caregiver/browse-organizations');
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
      // Get the caregiver's provider profile
      const caregiverProviderResponse = await fetch('/api/providers/me');
      if (!caregiverProviderResponse.ok) {
        showToast.error('Please create a provider profile first');
        setSending(false);
        return;
      }
      const caregiverProviderData = await caregiverProviderResponse.json();

      // Create or get family profile for the caregiver (reuse existing if present)
      let familyProfileId = null;
      const familyProfileResponse = await fetch('/api/family-profiles/me');
      if (familyProfileResponse.ok) {
        const familyProfileData = await familyProfileResponse.json();
        familyProfileId = familyProfileData.id;
      } else {
        // Create minimal family profile for caregiver hiring request
        const createProfileResponse = await fetch('/api/family-profiles/me', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            careTypes: ['COMPANION_CARE'], // Default
            location: caregiverProviderData.address,
            city: caregiverProviderData.city,
            state: caregiverProviderData.state,
            zipCode: caregiverProviderData.zipCode,
            description: `Employment request from ${caregiverProviderData.name}`,
            isPublic: false,
          }),
        });

        if (createProfileResponse.ok) {
          const createdProfile = await createProfileResponse.json();
          familyProfileId = createdProfile.id;
        } else {
          const errorData = await createProfileResponse.json();
          console.error('Failed to create family profile:', errorData);
          showToast.error(errorData.error || 'Failed to prepare employment request');
          setSending(false);
          return;
        }
      }

      if (!familyProfileId) {
        showToast.error('Failed to prepare employment request');
        setSending(false);
        return;
      }

      // Send hiring request to the organization
      // Note: providerId is the organization's ID (params.id) because they are the one receiving the request
      console.log('Sending hiring request with:', {
        familyProfileId,
        providerId: params.id,
        message: requestMessage,
        requestType: 'HIRING'
      });

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyProfileId: familyProfileId,
          providerId: params.id as string, // Organization's provider ID (the one receiving the hiring request)
          message: requestMessage,
          requestType: 'HIRING',
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        showToast.error('Server error: ' + text.substring(0, 100));
        setSending(false);
        return;
      }

      const data = await response.json();

      if (response.ok) {
        showToast.success('Employment request sent!');
        setRequestMessage('');
        router.push('/provider/hiring-requests');
      } else {
        console.error('Failed to send request:', {
          status: response.status,
          data: data
        });
        if (data.requiresUpgrade) {
          setPaywallOpen(true);
        } else {
          const errorMessage = data.details
            ? `${data.error}: ${data.details}`
            : (data.error || 'Failed to send request');
          showToast.error(errorMessage);
        }
      }
    } catch (err: any) {
      console.error('Error sending request:', err);
      showToast.error(err.message || 'Failed to send employment request');
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

  const formatProviderType = (type: string) => {
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

  if (!organization) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <Breadcrumb />

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

        {/* Organization Profile */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {organization.name}
              </h1>
              <p className="text-lg text-primary-600 mb-1">
                {formatProviderType(organization.providerType)}
              </p>
              <p className="text-gray-600">
                {organization.city}, {organization.state}
              </p>
            </div>
            {organization.licensed && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Licensed
              </span>
            )}
          </div>

          {/* About */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
            <p className="text-gray-700 whitespace-pre-line">{organization.description}</p>
          </div>

          {/* Services */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Services Offered</h2>
            <div className="flex flex-wrap gap-2">
              {organization.careTypesOffered.map((type) => (
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
              <h3 className="text-sm font-medium text-gray-500 mb-1">Years in Business</h3>
              <p className="text-gray-900">{organization.yearsInBusiness} years</p>
            </div>
            {organization.capacity && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Capacity</h3>
                <p className="text-gray-900">{organization.capacity} clients</p>
              </div>
            )}
            {organization.serviceRadius && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Service Radius</h3>
                <p className="text-gray-900">{organization.serviceRadius} miles</p>
              </div>
            )}
            {organization.licensed && organization.licenseNumber && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">License Number</h3>
                <p className="text-gray-900">{organization.licenseNumber}</p>
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
                  <a href={`mailto:${organization.email}`} className="text-primary-600 hover:text-primary-700">
                    {organization.email}
                  </a>
                </p>
              </div>
              <div>
                <p className="text-gray-600">Phone:</p>
                <p className="text-gray-900">
                  <a href={`tel:${organization.phone}`} className="text-primary-600 hover:text-primary-700">
                    {organization.phone}
                  </a>
                </p>
              </div>
              {organization.website && (
                <div>
                  <p className="text-gray-600">Website:</p>
                  <p className="text-gray-900">
                    <a
                      href={organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {organization.website}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Send Employment Request */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Employment Opportunity</h2>
          <p className="text-gray-600 mb-4">
            Introduce yourself and express your interest in working for this organization. Contact information will be shared once they accept your request.
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
                placeholder="Tell them about your experience and why you'd like to work for their organization..."
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
          router.push('/caregiver/browse-organizations');
        }}
        defaultView="login"
      />
    </div>
  );
}
