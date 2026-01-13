'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

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
  const { update: updateSession } = useSession();
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

  // Claim existing page flow (organizations only)
  const [showClaimResults, setShowClaimResults] = useState(false);
  const [unclaimedProfiles, setUnclaimedProfiles] = useState<any[]>([]);
  const [searchingClaims, setSearchingClaims] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimAutoApproved, setClaimAutoApproved] = useState(false);

  if (!isOpen) return null;

  const handleRoleSelect = async (role: UserRole) => {
    setSelectedRole(role);

    // CRITICAL: Set mode immediately using robust cookie + database endpoint
    try {
      const response = await fetch('/api/mode/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: role === 'family' ? 'FAMILY' : 'PROVIDER' }),
      });

      if (response.ok) {
        // Mode is now in cookie (immediate) and database (persistent)
        await updateSession(); // Update session for compatibility
      }
    } catch (err) {
      console.error('Error setting mode:', err);
      // Continue anyway - user can still proceed
    }

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

  // Search for unclaimed profiles (organizations only)
  const searchUnclaimedProfiles = async () => {
    if (!providerName || !providerCity || providerType !== 'organization') {
      return;
    }

    setSearchingClaims(true);
    setError('');

    try {
      const response = await fetch('/api/providers/search-unclaimed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: providerName,
          city: providerCity,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUnclaimedProfiles(data.profiles || []);
        // ALWAYS show results section, even if empty (to display empty state)
        setShowClaimResults(true);
      }
    } catch (err) {
      console.error('Error searching unclaimed profiles:', err);
    } finally {
      setSearchingClaims(false);
    }
  };

  // Claim an existing provider profile
  const handleClaimProfile = async (providerId: string) => {
    setLoading(true);
    setError('');

    try {
      // Set user mode to PROVIDER
      const modeResponse = await fetch('/api/mode/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'PROVIDER' }),
      });

      if (modeResponse.ok) {
        // Refresh session to reflect mode change
        await updateSession();
      }

      // Claim the profile (sets verificationStatus to 'pending')
      const response = await fetch('/api/providers/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim profile');
      }

      // SUCCESS: Show success message and hide claim results
      // Do NOT redirect - let user finish the modal flow naturally
      setShowClaimResults(false);
      setUnclaimedProfiles([]);
      setClaimSuccess(true); // Show success UI
      setClaimAutoApproved(data.autoApproved || false);

      // Clear any previous errors
      setError('');

      // User can now continue with the form or exit naturally
      // Verification email/admin review depending on auto-approval
    } catch (err) {
      console.error('Error claiming profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to claim profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Skip claiming and continue to create new profile
  const handleSkipClaim = () => {
    setShowClaimResults(false);
    setUnclaimedProfiles([]);
  };

  // Handle exit: Save progress and route to browse
  const handleExit = async () => {
    try {
      // CRITICAL: Set dismissal cookie to prevent modal from reopening
      // This cookie marks that onboarding has been explicitly dismissed/exited
      document.cookie = 'onboarding-dismissed=true; path=/; max-age=31536000; SameSite=Lax';

      // If no role selected yet, default to FAMILY mode
      if (!selectedRole) {
        const modeResponse = await fetch('/api/mode/set', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'FAMILY' }),
        });
        if (modeResponse.ok) {
          await updateSession();
        }
        onComplete();
        await new Promise(resolve => setTimeout(resolve, 50));
        router.push('/providers'); // Route to Find Providers browse page
        return;
      }

      // If family selected, set mode and route to Find Providers
      if (selectedRole === 'family') {
        const modeResponse = await fetch('/api/mode/set', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'FAMILY' }),
        });
        if (modeResponse.ok) {
          await updateSession();
        }
        onComplete();
        await new Promise(resolve => setTimeout(resolve, 50));
        router.push('/providers'); // Route to Find Providers browse page
        return;
      }

      // If provider selected, set mode and route to Find Families
      if (selectedRole === 'provider') {
        const modeResponse = await fetch('/api/mode/set', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'PROVIDER' }),
        });
        if (modeResponse.ok) {
          await updateSession();
        }
        onComplete();
        await new Promise(resolve => setTimeout(resolve, 50));
        router.push('/dashboard/care-profiles'); // Route to Find Families browse page
        return;
      }
    } catch (err) {
      console.error('Error saving on exit:', err);
    }
  };

  const handleFamilySubmit = async () => {
    if (!validateFamilyFields()) return;

    setLoading(true);
    setError('');

    try {
      // CRITICAL: Set dismissal cookie to prevent modal from reopening
      document.cookie = 'onboarding-dismissed=true; path=/; max-age=31536000; SameSite=Lax';

      // Set user mode to FAMILY
      const modeResponse = await fetch('/api/mode/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'FAMILY' }),
      });

      if (modeResponse.ok) {
        // Refresh session to reflect mode change
        await updateSession();
        // Force router to refresh server-side data
      }

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

      // Longer delay to ensure session and router refresh complete before routing
      await new Promise(resolve => setTimeout(resolve, 50));

      router.push('/providers'); // Route to Find Providers browse page
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
      // CRITICAL: Set dismissal cookie to prevent modal from reopening
      document.cookie = 'onboarding-dismissed=true; path=/; max-age=31536000; SameSite=Lax';

      // Set user mode to PROVIDER
      const modeResponse = await fetch('/api/mode/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'PROVIDER' }),
      });

      if (modeResponse.ok) {
        // CRITICAL: Refresh session to reflect mode change
        await updateSession();
        // Force router to refresh server-side data
      }

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

      // Longer delay to ensure session and router refresh complete before routing
      await new Promise(resolve => setTimeout(resolve, 50));

      router.push('/dashboard/care-profiles'); // Route to Find Families browse page
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
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
          {/* X Close Button */}
          <button
            onClick={handleExit}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

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

              <div className="space-y-3">
                <button
                  onClick={handleFamilySubmit}
                  disabled={loading}
                  className="w-full py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creating your profile...' : 'Continue to Browse Providers'}
                </button>

                <button
                  onClick={handleExit}
                  disabled={loading}
                  className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save & Exit
                </button>
              </div>

              <p className="text-center text-sm text-gray-500 mt-4">
                You can complete your profile anytime
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

                    {/* Claim Success Message */}
                    {claimSuccess && (
                      <div className={`p-4 ${claimAutoApproved ? 'bg-green-50 border-2 border-green-200' : 'bg-blue-50 border-2 border-blue-200'} rounded-lg`}>
                        <div className="flex items-start gap-3">
                          <svg className={`w-6 h-6 ${claimAutoApproved ? 'text-green-600' : 'text-blue-600'} flex-shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="flex-1">
                            <h3 className={`font-semibold ${claimAutoApproved ? 'text-green-900' : 'text-blue-900'} mb-1`}>
                              {claimAutoApproved ? 'Profile Claimed & Verified!' : 'Profile Claim Submitted!'}
                            </h3>
                            {claimAutoApproved ? (
                              <>
                                <p className="text-sm text-green-800 mb-2">
                                  Your claim has been automatically verified! You now have full access to edit your profile and view leads.
                                </p>
                                <p className="text-xs text-green-700">
                                  You can continue setting up your account below or close this modal to get started.
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-sm text-blue-800 mb-2">
                                  Your claim is pending admin review. Our team will review your request within 24 hours. You&apos;ll receive an email when your claim is approved.
                                </p>
                                <p className="text-xs text-blue-700">
                                  You can continue setting up your account below. Full access will be unlocked after approval.
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Check for existing profiles button (Organizations only) */}
                    {providerType === 'organization' && providerName && providerCity && !showClaimResults && !claimSuccess && (
                      <div>
                        <button
                          onClick={searchUnclaimedProfiles}
                          disabled={searchingClaims}
                          className="w-full py-3 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                          {searchingClaims ? (
                            <>
                              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12 a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Searching...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                              Check for existing profiles
                            </>
                          )}
                        </button>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          We&apos;ll see if your organization already has a profile you can claim
                        </p>
                      </div>
                    )}

                    {/* Claim Results (Organizations only) */}
                    {showClaimResults && unclaimedProfiles.length > 0 && (
                      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          We found {unclaimedProfiles.length} matching profile{unclaimedProfiles.length > 1 ? 's' : ''}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Is one of these your organization? Claim it to get started faster.
                        </p>

                        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                          {unclaimedProfiles.map((profile) => (
                            <div key={profile.id} className="p-3 bg-white rounded-lg border border-gray-300">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{profile.name}</h4>
                                  <p className="text-sm text-gray-600">{profile.city}{profile.state ? `, ${profile.state}` : ''}</p>
                                  {profile.description && (
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{profile.description}</p>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleClaimProfile(profile.id)}
                                  disabled={loading}
                                  className="ml-3 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                                >
                                  Claim This
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={handleSkipClaim}
                          className="w-full py-2 text-sm text-primary-600 hover:text-primary-700 font-semibold underline"
                        >
                          None of these match - Continue to create new profile
                        </button>
                      </div>
                    )}

                    {/* Show inline message if no matches found - informational only, doesn't block form */}
                    {showClaimResults && unclaimedProfiles.length === 0 && (
                      <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg">
                        <p className="text-sm text-gray-600 text-center">
                          No existing profiles found. Continue below to create a new one.
                        </p>
                      </div>
                    )}

                    {/* Always show care types - not conditional on claim results */}
                    <>
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
                  </>
                )}
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {providerType && !(showClaimResults && unclaimedProfiles.length > 0) && (
                <>
                  <div className="space-y-3">
                    <button
                      onClick={handleProviderSubmit}
                      disabled={loading}
                      className="w-full py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Creating your profile...' : 'Continue to Browse Families'}
                    </button>

                    <button
                      onClick={handleExit}
                      disabled={loading}
                      className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Save & Exit
                    </button>
                  </div>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    You can complete your profile anytime
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
