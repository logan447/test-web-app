'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import MainNav from '@/components/Navigation/MainNav';
import Footer from '@/components/Navigation/Footer';
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
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestMessage, setRequestMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const backHref = '/providers/browse-organizations';

  useEffect(() => {
    if (!session) {
      setAuthModalOpen(true);
      return;
    }
    fetchOrganization();
  }, [session, params.id]);

  const fetchOrganization = async () => {
    try {
      const response = await fetch(`/api/providers/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.providerType === 'INDEPENDENT_CAREGIVER') {
          router.push(backHref);
          return;
        }
        setOrganization(data);
      } else {
        router.push(backHref);
      }
    } catch (err) {
      console.error('Error fetching organization:', err);
      router.push(backHref);
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
      const caregiverProviderResponse = await fetch('/api/providers/me');
      if (!caregiverProviderResponse.ok) {
        showToast.error('Please create a provider profile first');
        setSending(false);
        return;
      }
      const caregiverProviderData = await caregiverProviderResponse.json();

      let familyProfileId = null;
      const familyProfileResponse = await fetch('/api/family-profiles/me');
      if (familyProfileResponse.ok) {
        const familyProfileData = await familyProfileResponse.json();
        familyProfileId = familyProfileData.id;
      } else {
        const createProfileResponse = await fetch('/api/family-profiles/me', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            careTypes: ['COMPANION_CARE'],
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
          showToast.error(errorData.error || 'Failed to prepare application');
          setSending(false);
          return;
        }
      }

      if (!familyProfileId) {
        showToast.error('Failed to prepare application');
        setSending(false);
        return;
      }

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyProfileId: familyProfileId,
          providerId: params.id as string,
          message: requestMessage,
          requestType: 'HIRING',
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        showToast.error('Server error occurred');
        setSending(false);
        return;
      }

      const data = await response.json();

      if (response.ok) {
        showToast.success('Application sent! Track responses in My Opportunities.');
        setRequestMessage('');
        router.push('/provider/opportunities');
      } else {
        if (data.requiresUpgrade) {
          setPaywallOpen(true);
        } else {
          showToast.error(data.error || 'Failed to send application');
        }
      }
    } catch (err: any) {
      showToast.error(err.message || 'Failed to send application');
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
        showToast.success('Membership activated!');
        setPaywallOpen(false);
        await handleSendRequest(new Event('submit') as any);
      } else {
        throw new Error(data.error || 'Failed to activate membership');
      }
    } catch (err: any) {
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
    return (
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          router.push(backHref);
        }}
        defaultView="login"
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
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

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to organizations
        </Link>

        {/* Organization Profile */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {organization.name}
                </h1>
                <p className="text-primary-600 font-medium mb-1">
                  {formatProviderType(organization.providerType)}
                </p>
                <p className="text-gray-600">
                  {organization.city}, {organization.state}
                </p>
              </div>
              {organization.licensed && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Licensed
                </span>
              )}
            </div>

            {/* About */}
            {organization.description && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-2">About</h2>
                <p className="text-gray-700">{organization.description}</p>
              </div>
            )}

            {/* Services */}
            {organization.careTypesOffered?.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-2">Services</h2>
                <div className="flex flex-wrap gap-2">
                  {organization.careTypesOffered.map((type) => (
                    <span
                      key={type}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {formatCareType(type)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {organization.yearsInBusiness > 0 && (
                <div>
                  <p className="text-gray-500">Years in Business</p>
                  <p className="font-medium text-gray-900">{organization.yearsInBusiness}</p>
                </div>
              )}
              {organization.capacity && (
                <div>
                  <p className="text-gray-500">Capacity</p>
                  <p className="font-medium text-gray-900">{organization.capacity} clients</p>
                </div>
              )}
              {organization.serviceRadius && (
                <div>
                  <p className="text-gray-500">Service Area</p>
                  <p className="font-medium text-gray-900">{organization.serviceRadius} mile radius</p>
                </div>
              )}
              {organization.licenseNumber && (
                <div>
                  <p className="text-gray-500">License #</p>
                  <p className="font-medium text-gray-900">{organization.licenseNumber}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Apply Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Apply to {organization.name}</h2>
          <p className="text-sm text-gray-600 mb-6">
            Stand out by sharing why you&apos;re a great fit for their team.
          </p>

          <form onSubmit={handleSendRequest}>
            {/* Structured prompts */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your introduction
              </label>

              {/* Suggested topics */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Consider including:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Years of caregiving experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Types of care you specialize in</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Relevant certifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Your availability</span>
                  </div>
                </div>
              </div>

              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={`Hi, I'm interested in joining ${organization.name}. I have [X years] of experience in caregiving, specializing in [care types]. I hold [certifications] and am available [availability]. I'd love to discuss how I can contribute to your team.`}
                required
              />
            </div>

            {/* What happens next */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-emerald-900 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                What happens next
              </h3>
              <ul className="text-sm text-emerald-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 text-xs font-semibold shrink-0">1</span>
                  <span>Your profile and message are sent to {organization.name}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 text-xs font-semibold shrink-0">2</span>
                  <span>They review your experience (typically within 2-3 business days)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 text-xs font-semibold shrink-0">3</span>
                  <span>If interested, they&apos;ll reach out to schedule an interview</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={sending}
                className="flex-1 bg-primary-600 text-white py-3.5 rounded-xl hover:bg-primary-700 disabled:opacity-50 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Application...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Application
                  </>
                )}
              </button>
              <Link
                href={backHref}
                className="px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Application Tracking */}
        <div className="mt-6 bg-gray-50 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Track all your applications</p>
              <p className="text-sm text-gray-600">View status and responses in My Opportunities</p>
            </div>
          </div>
          <Link
            href="/provider/opportunities"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
          >
            View
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Tip */}
        <div className="mt-4 text-center text-sm text-gray-500">
          Tip: Caregivers who apply to 3-5 organizations get hired 2x faster.</div>
      </div>

      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onUpgrade={handleUpgradeSubscription}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          router.push(backHref);
        }}
        defaultView="login"
      />

      <Footer variant="light" />
    </div>
  );
}
