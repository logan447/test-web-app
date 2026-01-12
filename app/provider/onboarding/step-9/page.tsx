'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function ProviderOnboardingStep9() {
  const router = useRouter();
  const { data: session } = useSession();
  const [providerType, setProviderType] = useState('');
  const [availableForFamilies, setAvailableForFamilies] = useState(true); // Default ON
  const [availableForOrganizations, setAvailableForOrganizations] = useState(true); // Default ON
  const [hiringCaregivers, setHiringCaregivers] = useState(true); // Default ON
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedType = sessionStorage.getItem('provider_onboarding_providerType');
    if (savedType) setProviderType(savedType);
  }, []);

  const isIndividualCaregiver = providerType === 'INDEPENDENT_CAREGIVER';
  const isOrganization = providerType !== 'INDEPENDENT_CAREGIVER';

  const handleComplete = async () => {
    setLoading(true);
    setError('');

    try {
      // Gather all onboarding data
      const onboardingData = {
        providerType: sessionStorage.getItem('provider_onboarding_providerType'),
        businessName: sessionStorage.getItem('provider_onboarding_businessName'),
        careTypes: JSON.parse(sessionStorage.getItem('provider_onboarding_careTypes') || '[]'),
        street: sessionStorage.getItem('provider_onboarding_street'),
        city: sessionStorage.getItem('provider_onboarding_city'),
        state: sessionStorage.getItem('provider_onboarding_state'),
        zipCode: sessionStorage.getItem('provider_onboarding_zipCode'),
        phone: sessionStorage.getItem('provider_onboarding_phone'),
        website: sessionStorage.getItem('provider_onboarding_website'),
        photoPreview: sessionStorage.getItem('provider_onboarding_photoPreview'),
        description: sessionStorage.getItem('provider_onboarding_description'),
        licenseNumber: sessionStorage.getItem('provider_onboarding_licenseNumber'),
        licenseState: sessionStorage.getItem('provider_onboarding_licenseState'),
        availableForFamilies,
        availableForOrganizations: isIndividualCaregiver ? availableForOrganizations : false,
        hiringCaregivers: isOrganization ? hiringCaregivers : false,
      };

      // Save via API
      const response = await fetch('/api/onboarding/provider/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onboardingData),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      // Clear session storage
      Object.keys(sessionStorage).filter(key => key.startsWith('provider_onboarding_')).forEach(key => {
        sessionStorage.removeItem(key);
      });

      router.push('/provider/onboarding/success');
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError('Failed to save your profile. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step 9 of 9</span>
            <span className="text-sm text-gray-500">Final step!</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Visibility Settings
          </h1>
          <p className="text-gray-600">
            Choose who can see your profile and contact you
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {/* Visible to Families */}
          <div className="border-2 border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Visible to families
                </h3>
                <p className="text-sm text-gray-600">
                  Families looking for care can find you in search results and request consultations
                </p>
              </div>
              <button
                onClick={() => setAvailableForFamilies(!availableForFamilies)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  availableForFamilies ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  availableForFamilies ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          {/* Available for Organizations (Caregivers only) */}
          {isIndividualCaregiver && (
            <div className="border-2 border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Available for organizations
                  </h3>
                  <p className="text-sm text-gray-600">
                    Care organizations can find you and send hiring opportunities
                  </p>
                </div>
                <button
                  onClick={() => setAvailableForOrganizations(!availableForOrganizations)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    availableForOrganizations ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    availableForOrganizations ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          )}

          {/* Actively Hiring Caregivers (Organizations only) */}
          {isOrganization && (
            <div className="border-2 border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Actively hiring caregivers
                  </h3>
                  <p className="text-sm text-gray-600">
                    Caregivers can see you&apos;re hiring and apply to work with you
                  </p>
                </div>
                <button
                  onClick={() => setHiringCaregivers(!hiringCaregivers)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    hiringCaregivers ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    hiringCaregivers ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">You can change these anytime.</span> Update your visibility settings from your dashboard whenever you need to.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push('/provider/onboarding/step-8')}
            disabled={loading}
            className="sm:w-32 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-300 transition-colors disabled:opacity-50"
          >
            ← Back
          </button>

          <button
            onClick={handleComplete}
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Complete Profile →'}
          </button>
        </div>
      </div>
    </div>
  );
}
