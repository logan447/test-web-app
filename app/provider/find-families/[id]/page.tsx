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
  // Identity (only present if engagement ACCEPTED)
  user?: {
    name: string;
    email: string;
    phone: string | null;
  };
  lovedOneName?: string;
  identityRevealed: boolean;
  // Location
  location: string;
  city: string;
  state: string;
  zipCode: string;
  // Care recipient info
  ageRange: string | null;
  relationship: string | null;
  livingSituation: string | null;
  gender: string | null;
  profilePhoto: string | null;
  // Care needs
  careTypes: string[];
  careLevel: string | null;
  medicalConditions: string[];
  mobilityStatus: string | null;
  dailyLivingAssistance: string[];
  additionalNeeds: string | null;
  // Personality & preferences
  personalityTraits: string[];
  hobbiesInterests: string[];
  communicationPreferences: string[];
  culturalBackground: string | null;
  religiousPreferences: string | null;
  languagePreferences: string[];
  petPreferences: string | null;
  // Location preferences
  careSettingPreference: string | null;
  proximityImportance: string | null;
  neighborhoodPreferences: string | null;
  // Contact preferences (methods, not actual contact)
  preferredContactMethods: string[];
  bestTimeToContact: string[];
  tourPreference: string | null;
  communicationFrequency: string | null;
  // Budget & timeline
  budgetMin: number | null;
  budgetMax: number | null;
  budgetFlexibility: string | null;
  paymentMethods: string[];
  financialAssistanceNeeded: string | null;
  careUrgency: string | null;
  preferredStartDate: string | null;
  careDuration: string | null;
  scheduleFlexibility: string | null;
  timeline: string | null;
  insurance: string | null;
  // Description
  description: string | null;
  profileNotes: string | null;
  // Metadata
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
            <div className="flex items-start gap-4">
              {/* Profile Photo (if available and user opted in) */}
              {profile.profilePhoto && (
                <img
                  src={profile.profilePhoto}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Care Request in {profile.city}, {profile.state}
                </h1>
                <p className="text-gray-600">
                  Posted {new Date(profile.createdAt).toLocaleDateString()}
                </p>
                {/* Identity revealed badge */}
                {profile.identityRevealed && profile.user && (
                  <div className="mt-2 inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Contact Unlocked - {profile.user.name}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-primary-600">
                {formatBudget(profile.budgetMin, profile.budgetMax)}
              </p>
              {profile.careUrgency && (
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                  profile.careUrgency.toLowerCase().includes('immediate')
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {profile.careUrgency}
                </span>
              )}
            </div>
          </div>

          {/* Contact Info (only shown if identity revealed) */}
          {profile.identityRevealed && profile.user && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{profile.user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <a href={`mailto:${profile.user.email}`} className="font-medium text-primary-600 hover:underline">
                    {profile.user.email}
                  </a>
                </div>
                {profile.user.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <a href={`tel:${profile.user.phone}`} className="font-medium text-primary-600 hover:underline">
                      {profile.user.phone}
                    </a>
                  </div>
                )}
                {profile.lovedOneName && (
                  <div>
                    <p className="text-sm text-gray-600">Care Recipient</p>
                    <p className="font-medium">{profile.lovedOneName}</p>
                  </div>
                )}
              </div>
            </div>
          )}

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

          {/* Care Recipient Info */}
          {(profile.ageRange || profile.relationship || profile.livingSituation || profile.gender) && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Care Recipient</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {profile.ageRange && (
                  <div>
                    <p className="text-sm text-gray-600">Age Range</p>
                    <p className="font-medium">{profile.ageRange}</p>
                  </div>
                )}
                {profile.relationship && (
                  <div>
                    <p className="text-sm text-gray-600">Relationship</p>
                    <p className="font-medium">{profile.relationship}</p>
                  </div>
                )}
                {profile.gender && (
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="font-medium">{profile.gender}</p>
                  </div>
                )}
                {profile.livingSituation && (
                  <div>
                    <p className="text-sm text-gray-600">Living Situation</p>
                    <p className="font-medium">{profile.livingSituation}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Care Needs Assessment */}
          {(profile.careLevel || profile.medicalConditions?.length > 0 || profile.mobilityStatus || profile.dailyLivingAssistance?.length > 0) && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Care Needs</h2>
              <div className="space-y-3">
                {profile.careLevel && (
                  <div>
                    <p className="text-sm text-gray-600">Care Level</p>
                    <p className="font-medium">{profile.careLevel}</p>
                  </div>
                )}
                {profile.mobilityStatus && (
                  <div>
                    <p className="text-sm text-gray-600">Mobility</p>
                    <p className="font-medium">{profile.mobilityStatus}</p>
                  </div>
                )}
                {profile.medicalConditions && profile.medicalConditions.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Medical Conditions</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.medicalConditions.map((condition) => (
                        <span key={condition} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.dailyLivingAssistance && profile.dailyLivingAssistance.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Assistance Needed</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.dailyLivingAssistance.map((item) => (
                        <span key={item} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.additionalNeeds && (
                  <div>
                    <p className="text-sm text-gray-600">Additional Needs</p>
                    <p className="text-gray-700">{profile.additionalNeeds}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Personality & Preferences */}
          {(profile.personalityTraits?.length > 0 || profile.hobbiesInterests?.length > 0 || profile.languagePreferences?.length > 0 || profile.culturalBackground || profile.petPreferences) && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Personality & Preferences</h2>
              <div className="space-y-3">
                {profile.personalityTraits && profile.personalityTraits.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Personality</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.personalityTraits.map((trait) => (
                        <span key={trait} className="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.hobbiesInterests && profile.hobbiesInterests.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Hobbies & Interests</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.hobbiesInterests.map((hobby) => (
                        <span key={hobby} className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded">
                          {hobby}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.languagePreferences && profile.languagePreferences.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Languages</p>
                    <p className="font-medium">{profile.languagePreferences.join(', ')}</p>
                  </div>
                )}
                {profile.culturalBackground && (
                  <div>
                    <p className="text-sm text-gray-600">Cultural Background</p>
                    <p className="font-medium">{profile.culturalBackground}</p>
                  </div>
                )}
                {profile.petPreferences && (
                  <div>
                    <p className="text-sm text-gray-600">Pet Preferences</p>
                    <p className="font-medium">{profile.petPreferences}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Location & Preferences */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Area</p>
                <p className="font-medium">{profile.city}, {profile.state} {profile.zipCode}</p>
              </div>
              {profile.careSettingPreference && (
                <div>
                  <p className="text-sm text-gray-600">Care Setting</p>
                  <p className="font-medium">{profile.careSettingPreference}</p>
                </div>
              )}
              {profile.neighborhoodPreferences && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Neighborhood Preferences</p>
                  <p className="font-medium">{profile.neighborhoodPreferences}</p>
                </div>
              )}
            </div>
          </div>

          {/* Budget & Timeline */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Budget & Timeline</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Budget</p>
                <p className="font-medium">{formatBudget(profile.budgetMin, profile.budgetMax)}</p>
              </div>
              {profile.budgetFlexibility && (
                <div>
                  <p className="text-sm text-gray-600">Flexibility</p>
                  <p className="font-medium">{profile.budgetFlexibility}</p>
                </div>
              )}
              {profile.timeline && (
                <div>
                  <p className="text-sm text-gray-600">Timeline</p>
                  <p className="font-medium">{profile.timeline}</p>
                </div>
              )}
              {profile.preferredStartDate && (
                <div>
                  <p className="text-sm text-gray-600">Preferred Start</p>
                  <p className="font-medium">{profile.preferredStartDate}</p>
                </div>
              )}
              {profile.careDuration && (
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">{profile.careDuration}</p>
                </div>
              )}
              {profile.insurance && (
                <div>
                  <p className="text-sm text-gray-600">Insurance</p>
                  <p className="font-medium">{profile.insurance}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Preferences */}
          {(profile.preferredContactMethods?.length > 0 || profile.bestTimeToContact?.length > 0 || profile.tourPreference) && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Communication Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.preferredContactMethods && profile.preferredContactMethods.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Preferred Contact Methods</p>
                    <p className="font-medium">{profile.preferredContactMethods.join(', ')}</p>
                  </div>
                )}
                {profile.bestTimeToContact && profile.bestTimeToContact.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Best Time to Contact</p>
                    <p className="font-medium">{profile.bestTimeToContact.join(', ')}</p>
                  </div>
                )}
                {profile.tourPreference && (
                  <div>
                    <p className="text-sm text-gray-600">Tour Preference</p>
                    <p className="font-medium">{profile.tourPreference}</p>
                  </div>
                )}
              </div>
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
