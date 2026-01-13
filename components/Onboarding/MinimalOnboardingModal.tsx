'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface MinimalOnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

type UserRole = 'family' | 'provider' | null;
type ProviderType = 'individual' | 'organization' | null;

export default function MinimalOnboardingModal({
  isOpen,
  onComplete,
}: MinimalOnboardingModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [providerType, setProviderType] = useState<ProviderType>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Family fields
  const [familyCity, setFamilyCity] = useState('');
  const [careType, setCareType] = useState('');

  // Provider fields
  const [providerName, setProviderName] = useState('');
  const [providerCity, setProviderCity] = useState('');
  const [selectedCareTypes, setSelectedCareTypes] = useState<string[]>([]);
  const [hiringCaregivers, setHiringCaregivers] = useState(false);

  if (!isOpen) return null;

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep(2);
  };

  const handleProviderTypeSelect = (type: ProviderType) => {
    setProviderType(type);
  };

  const toggleCareType = (type: string) => {
    setSelectedCareTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const validateFamilyFields = () => {
    if (!familyCity.trim()) {
      setError('Please enter your city');
      return false;
    }
    if (!careType) {
      setError('Please select a care type');
      return false;
    }
    return true;
  };

  const validateProviderFields = () => {
    if (!providerType) {
      setError('Please select individual or organization');
      return false;
    }
    if (!providerName.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!providerCity.trim()) {
      setError('Please enter your city');
      return false;
    }
    if (selectedCareTypes.length === 0) {
      setError('Please select at least one care type');
      return false;
    }
    return true;
  };

  const handleFamilySubmit = async () => {
    if (!validateFamilyFields()) return;

    setLoading(true);
    setError('');

    try {
      // Set user mode to FAMILY
      await fetch('/api/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'FAMILY' }),
      });

      // Create minimal family profile
      const mappedCareType = mapCareTypeToEnum(careType);
      const response = await fetch('/api/onboarding/family/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: familyCity,
          state: '', // Will be filled in later via Edit Profile
          careType: [careType], // Keep user-friendly string for family profile
          careNeeds: [careType], // Use careType as initial care need
          minimalOnboarding: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create profile');
      }

      onComplete();
      router.push('/dashboard');
    } catch (err) {
      console.error('Error creating family profile:', err);
      setError('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSubmit = async () => {
    if (!validateProviderFields()) return;

    setLoading(true);
    setError('');

    try {
      // Set user mode to PROVIDER
      await fetch('/api/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'PROVIDER' }),
      });

      // Create minimal provider profile
      // Map user-friendly care type strings to CareType enum values
      const mappedCareTypes = selectedCareTypes.map(mapCareTypeToEnum);

      const response = await fetch('/api/onboarding/provider/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: providerName,
          city: providerCity,
          careTypes: mappedCareTypes, // Send enum values
          providerType: providerType === 'individual' ? 'INDEPENDENT_CAREGIVER' : 'HOME_CARE',
          isHiringCaregivers: providerType === 'organization' ? hiringCaregivers : false,
          minimalOnboarding: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to create profile');
      }

      onComplete();
      router.push('/dashboard');
    } catch (err) {
      console.error('Error creating provider profile:', err);
      setError('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const careTypeOptions = [
    'Alzheimer\'s / Dementia',
    'Physical Disability',
    'Developmental Disability',
    'Mental Health',
    'Elderly Care',
    'Respite Care',
    'Hospice Care',
    'Other',
  ];

  // Map user-friendly care type strings to CareType enum values
  const mapCareTypeToEnum = (careType: string): string => {
    const mapping: Record<string, string> = {
      'Alzheimer\'s / Dementia': 'MEMORY_CARE',
      'Physical Disability': 'PERSONAL_CARE',
      'Developmental Disability': 'PERSONAL_CARE',
      'Mental Health': 'COMPANION_CARE',
      'Elderly Care': 'COMPANION_CARE',
      'Respite Care': 'RESPITE_CARE',
      'Hospice Care': 'HOSPICE_CARE',
      'Other': 'COMPANION_CARE',
    };
    return mapping[careType] || 'COMPANION_CARE';
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
          {/* Step 1: Role Selection */}
          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Welcome to Olera
                </h1>
                <p className="text-xl text-gray-600">
                  What best describes you?
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Family Option */}
                <button
                  onClick={() => handleRoleSelect('family')}
                  className="group p-8 rounded-xl border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                    <svg
                      className="w-10 h-10 text-blue-600 group-hover:text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    I&apos;m Looking for Care
                  </h3>
                  <p className="text-gray-600">
                    Find the right care provider for yourself or a loved one. Browse options, compare services, and connect with providers.
                  </p>
                </button>

                {/* Provider Option */}
                <button
                  onClick={() => handleRoleSelect('provider')}
                  className="group p-8 rounded-xl border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                    <svg
                      className="w-10 h-10 text-purple-600 group-hover:text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    I&apos;m a Care Provider
                  </h3>
                  <p className="text-gray-600">
                    Connect with families looking for care. Build your profile, showcase your services, and grow your business.
                  </p>
                </button>
              </div>

              <p className="text-center text-sm text-gray-500">
                You can always change this later in your settings
              </p>
            </>
          )}

          {/* Step 2: Family Minimal Fields */}
          {step === 2 && selectedRole === 'family' && (
            <>
              <div className="mb-8">
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Tell us about your care needs
                </h2>
                <p className="text-gray-600">
                  Just a few quick details to get you started
                </p>
              </div>

              <div className="space-y-6 mb-6">
                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What city are you located in? *
                  </label>
                  <input
                    type="text"
                    value={familyCity}
                    onChange={(e) => setFamilyCity(e.target.value)}
                    placeholder="Enter your city"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Care Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What type of care are you looking for? *
                  </label>
                  <select
                    value={careType}
                    onChange={(e) => setCareType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select care type</option>
                    {careTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleFamilySubmit}
                disabled={loading}
                className="w-full py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating your profile...' : 'Continue to Dashboard'}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                You&apos;ll be able to add more details later
              </p>
            </>
          )}

          {/* Step 2: Provider Minimal Fields */}
          {step === 2 && selectedRole === 'provider' && (
            <>
              <div className="mb-8">
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Tell us about your services
                </h2>
                <p className="text-gray-600">
                  Just a few quick details to get you started
                </p>
              </div>

              <div className="space-y-6 mb-6">
                {/* Provider Type */}
                {!providerType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Are you an individual caregiver or an organization? *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleProviderTypeSelect('individual')}
                        className="p-4 border-2 border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-center"
                      >
                        <div className="font-semibold text-gray-900">Individual</div>
                        <div className="text-sm text-gray-600 mt-1">Independent caregiver</div>
                      </button>
                      <button
                        onClick={() => handleProviderTypeSelect('organization')}
                        className="p-4 border-2 border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-center"
                      >
                        <div className="font-semibold text-gray-900">Organization</div>
                        <div className="text-sm text-gray-600 mt-1">Agency or facility</div>
                      </button>
                    </div>
                  </div>
                )}

                {providerType && (
                  <>
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {providerType === 'individual' ? 'Your full name *' : 'Organization name *'}
                      </label>
                      <input
                        type="text"
                        value={providerName}
                        onChange={(e) => setProviderName(e.target.value)}
                        placeholder={providerType === 'individual' ? 'Enter your name' : 'Enter organization name'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What city are you located in? *
                      </label>
                      <input
                        type="text"
                        value={providerCity}
                        onChange={(e) => setProviderCity(e.target.value)}
                        placeholder="Enter your city"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    {/* Care Types */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What types of care do you provide? * (Select all that apply)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {careTypeOptions.map((type) => (
                          <label
                            key={type}
                            className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCareTypes.includes(type)}
                              onChange={() => toggleCareType(type)}
                              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Hiring Caregivers (Organizations only) */}
                    {providerType === 'organization' && (
                      <div>
                        <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={hiringCaregivers}
                            onChange={(e) => setHiringCaregivers(e.target.checked)}
                            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                          />
                          <div>
                            <div className="font-medium text-gray-900">We hire caregivers</div>
                            <div className="text-sm text-gray-600">Check if you&apos;re looking to hire staff</div>
                          </div>
                        </label>
                      </div>
                    )}
                  </>
                )}
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {providerType && (
                <>
                  <button
                    onClick={handleProviderSubmit}
                    disabled={loading}
                    className="w-full py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Creating your profile...' : 'Continue to Dashboard'}
                  </button>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    You&apos;ll be able to add more details later
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
