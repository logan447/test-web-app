'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import MainNav from '@/components/Navigation/MainNav';
import Footer from '@/components/Navigation/Footer';
import Breadcrumb from '@/components/Navigation/Breadcrumb';
import PageHero from '@/components/UI/PageHero';
import Link from 'next/link';
import Image from 'next/image';
import { showToast } from '@/lib/toast';
import AuthModal from '@/components/Auth/AuthModal';
import PaywallModal from '@/components/Paywall/PaywallModal';
import { OleraScoreBadge } from '@/components/Trust/OleraScore';

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
  coverPhoto?: string | null;
  photos?: string[];
  verified?: boolean;
  backgroundChecked?: boolean;
  insuranceVerified?: boolean;
  certifications?: string[];
  averageRating?: number | null;
  reviewCount?: number;
  priceMin?: number | null;
  priceMax?: number | null;
  priceDescription?: string | null;
  claimed?: boolean;
  oleraScore?: number | null;
};

type OrgProvider = {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  zipCode: string;
};

const INTERVIEW_PROMPTS = [
  {
    id: 'schedule',
    label: 'Schedule Interview',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    template: `Hi [NAME],

I'd like to schedule an interview to discuss a potential employment opportunity at our organization.

Would you be available for a [phone call / video chat / in-person meeting] this week? Please let me know what times work best for you.

Looking forward to connecting!`,
  },
  {
    id: 'position',
    label: 'Describe Position',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    template: `Hi [NAME],

We have an exciting employment opportunity that matches your experience and qualifications.

Position: [Job Title]
Schedule: [Full-time / Part-time / Flexible]
Location: [On-site at our facility / Client homes / Hybrid]
Compensation: [Competitive hourly rate / Salary details]

We're looking for caregivers who share our commitment to quality care. If this sounds like a good fit, I'd love to discuss further.

Let me know if you're interested!`,
  },
  {
    id: 'learn',
    label: 'Learn More',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    template: `Hi [NAME],

I came across your profile and I'm impressed by your experience in [care type]. Our organization is always looking to connect with talented caregivers.

Could you tell me more about:
- Your availability and scheduling preferences
- Your experience with [specific care needs]
- What you're looking for in an employer

I'd love to learn more about your background and see if there might be a good fit.

Thank you!`,
  },
];

export default function CaregiverHireDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [caregiver, setCaregiver] = useState<Caregiver | null>(null);
  const [orgProvider, setOrgProvider] = useState<OrgProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestMessage, setRequestMessage] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Determine back link based on where user came from
  const fromSaved = searchParams.get('from') === 'saved';
  const backHref = fromSaved ? '/provider/leads' : '/provider/hire-staff';
  const backText = fromSaved ? 'Back to Saved' : 'Back to Browse Caregivers';

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      setAuthModalOpen(true);
      return;
    }

    if (!session) return;

    fetchCaregiver();
  }, [session, status, router, params.id]);

  const fetchCaregiver = async () => {
    try {
      const [caregiverRes, orgRes] = await Promise.all([
        fetch(`/api/providers/${params.id}`),
        fetch('/api/providers/me'),
      ]);

      if (caregiverRes.ok) {
        const data = await caregiverRes.json();
        if (data.providerType !== 'INDEPENDENT_CAREGIVER' || !data.availableForOrganizations) {
          showToast.error('This caregiver is not available for employment');
          router.push('/provider/hire-staff');
          return;
        }
        setCaregiver(data);
      } else {
        showToast.error('Caregiver not found');
        router.push('/provider/hire-staff');
        return;
      }

      if (orgRes.ok) {
        const orgData = await orgRes.json();
        setOrgProvider(orgData);
      }
    } catch (err) {
      console.error('Error fetching caregiver:', err);
      showToast.error('Failed to load caregiver profile');
      router.push('/provider/hire-staff');
    } finally {
      setLoading(false);
    }
  };

  const handlePromptSelect = (promptId: string) => {
    const prompt = INTERVIEW_PROMPTS.find((p) => p.id === promptId);
    if (prompt && caregiver) {
      setSelectedPrompt(promptId);
      const message = prompt.template.replace(/\[NAME\]/g, caregiver.name.split(' ')[0]);
      setRequestMessage(message);
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
      // Get or create family profile for the organization
      let familyProfileId = null;
      const familyProfileResponse = await fetch('/api/family-profiles/me');
      if (familyProfileResponse.ok) {
        const familyProfileData = await familyProfileResponse.json();
        familyProfileId = familyProfileData.id;
      } else if (orgProvider) {
        // Create minimal family profile for organization hiring
        const createProfileResponse = await fetch('/api/family-profiles/me', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            careTypes: ['COMPANION_CARE'],
            location: orgProvider.address,
            city: orgProvider.city,
            state: orgProvider.state,
            zipCode: orgProvider.zipCode,
            description: `Hiring request from ${orgProvider.name}`,
            isPublic: false,
          }),
        });

        if (createProfileResponse.ok) {
          const createdProfile = await createProfileResponse.json();
          familyProfileId = createdProfile.id;
        }
      }

      if (!familyProfileId) {
        showToast.error('Please create a provider profile first');
        setSending(false);
        return;
      }

      // Send hiring request
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
        showToast.success('Hiring request sent successfully!');
        setRequestMessage('');
        router.push('/provider/candidates');
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
    return type
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatPrice = () => {
    if (!caregiver) return null;
    const { priceMin, priceMax } = caregiver;
    if (!priceMin && !priceMax) return null;
    if (priceMin && priceMax) return `$${priceMin}-$${priceMax}/hr`;
    if (priceMin) return `From $${priceMin}/hr`;
    if (priceMax) return `Up to $${priceMax}/hr`;
    return null;
  };

  if (!session) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-6 bg-white/20 rounded w-1/4 mb-4"></div>
              <div className="h-10 bg-white/20 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="animate-pulse bg-white rounded-xl p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div>
              <div className="animate-pulse bg-white rounded-xl p-6">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!caregiver) return null;

  const imageUrl = caregiver.coverPhoto || caregiver.photos?.[0] || null;
  const price = formatPrice();

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      {/* Hero Header */}
      <PageHero
        title="Request Interview"
        subtitle={`Connect with ${caregiver.name} about employment opportunities`}
        variant="primary"
        compact
        breadcrumb={
          <nav className="flex items-center gap-2 text-sm text-white/80">
            <Link href="/provider/hire-staff" className="hover:text-white">Hire Staff</Link>
            <span>›</span>
            <span className="text-white">{caregiver.name}</span>
          </nav>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Request Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interview Request Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Send Interview Request</h2>
                <p className="text-gray-600 mt-1">
                  Reach out to {caregiver.name.split(' ')[0]} to discuss potential employment at your organization.
                </p>
              </div>

              {/* Message Templates */}
              <div className="p-6 bg-gray-50 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-3">Quick start with a template:</p>
                <div className="flex flex-wrap gap-2">
                  {INTERVIEW_PROMPTS.map((prompt) => (
                    <button
                      key={prompt.id}
                      type="button"
                      onClick={() => handlePromptSelect(prompt.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedPrompt === prompt.id
                          ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                          : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-200 hover:bg-primary-50'
                      }`}
                    >
                      {prompt.icon}
                      {prompt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Form */}
              <form onSubmit={handleSendRequest} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={requestMessage}
                    onChange={(e) => {
                      setRequestMessage(e.target.value);
                      setSelectedPrompt(null);
                    }}
                    rows={10}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Introduce your organization and describe the employment opportunity..."
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Include details about the position, schedule, and what makes your organization a great place to work.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={sending || !requestMessage.trim()}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sending ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Send Interview Request
                      </>
                    )}
                  </button>
                  <Link
                    href={backHref}
                    className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>

            {/* What Happens Next */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What Happens Next?</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold text-sm">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Request Sent</p>
                    <p className="text-sm text-gray-600">
                      {caregiver.name.split(' ')[0]} will receive a notification about your interview request.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold text-sm">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Review & Response</p>
                    <p className="text-sm text-gray-600">
                      They&apos;ll review your organization and respond to your request, usually within 24-48 hours.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold text-sm">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Schedule Interview</p>
                    <p className="text-sm text-gray-600">
                      Once accepted, you can schedule an interview and continue the conversation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Caregiver Profile Preview */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Photo */}
              <div className="relative h-48 bg-gray-100">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={caregiver.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    <svg className="w-16 h-16 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  {caregiver.verified && (
                    <span className="px-2 py-1 bg-primary-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                  {caregiver.backgroundChecked && (
                    <span className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                      Background Checked
                    </span>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{caregiver.name}</h3>
                    <p className="text-gray-600">
                      {caregiver.city}, {caregiver.state}
                    </p>
                  </div>
                  <OleraScoreBadge
                    provider={{
                      name: caregiver.name,
                      providerType: 'INDEPENDENT_CAREGIVER',
                      description: caregiver.description,
                      address: caregiver.address,
                      city: caregiver.city,
                      state: caregiver.state,
                      phone: caregiver.phone,
                      email: caregiver.email,
                      website: caregiver.website,
                      careTypesOffered: caregiver.careTypesOffered,
                      licensed: caregiver.licensed,
                      backgroundChecked: caregiver.backgroundChecked,
                      insuranceVerified: caregiver.insuranceVerified,
                      coverPhoto: caregiver.coverPhoto,
                      photos: caregiver.photos,
                      priceMin: caregiver.priceMin,
                      priceMax: caregiver.priceMax,
                      priceDescription: caregiver.priceDescription,
                      claimed: caregiver.claimed,
                    }}
                    averageRating={caregiver.averageRating ?? null}
                    reviewCount={caregiver.reviewCount ?? 0}
                    cachedScore={caregiver.oleraScore}
                  />
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="px-2 py-0.5 text-xs font-medium rounded bg-primary-100 text-primary-700">
                    Independent Caregiver
                  </span>
                  {caregiver.licensed && (
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded border border-green-200">
                      Licensed
                    </span>
                  )}
                  {caregiver.yearsInBusiness > 0 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      {caregiver.yearsInBusiness} years exp
                    </span>
                  )}
                </div>

                {/* Care Types */}
                {caregiver.careTypesOffered.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">Care Specialties</p>
                    <div className="flex flex-wrap gap-1.5">
                      {caregiver.careTypesOffered.slice(0, 4).map((type) => (
                        <span key={type} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {formatCareType(type)}
                        </span>
                      ))}
                      {caregiver.careTypesOffered.length > 4 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                          +{caregiver.careTypesOffered.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {caregiver.certifications && caregiver.certifications.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">Certifications</p>
                    <div className="flex flex-wrap gap-1.5">
                      {caregiver.certifications.slice(0, 3).map((cert) => (
                        <span key={cert} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded border border-green-200">
                          {cert}
                        </span>
                      ))}
                      {caregiver.certifications.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                          +{caregiver.certifications.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Price */}
                {price && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">Rates</p>
                    <p className="font-semibold text-gray-900">{price}</p>
                  </div>
                )}
              </div>

              {/* View Full Profile Link */}
              <div className="px-5 pb-5">
                <Link
                  href={`/caregiver/${caregiver.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  View Full Profile
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h4 className="font-semibold text-gray-900 mb-4">At a Glance</h4>
              <div className="space-y-3">
                {caregiver.yearsInBusiness > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{caregiver.yearsInBusiness} Years Experience</p>
                      <p className="text-xs text-gray-500">Professional caregiving</p>
                    </div>
                  </div>
                )}
                {caregiver.serviceRadius && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{caregiver.serviceRadius} Mile Radius</p>
                      <p className="text-xs text-gray-500">Service area</p>
                    </div>
                  </div>
                )}
                {caregiver.reviewCount && caregiver.reviewCount > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{caregiver.reviewCount} Reviews</p>
                      <p className="text-xs text-gray-500">From families & organizations</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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
          router.push('/provider/hire-staff');
        }}
        defaultView="login"
      />

      <Footer variant="light" />
    </div>
  );
}
