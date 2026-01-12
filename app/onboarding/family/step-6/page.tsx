'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function FamilyOnboardingStep6() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isPublic, setIsPublic] = useState(true); // Default to ON (opt-out)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleComplete = async () => {
    setLoading(true);
    setError('');

    try {
      // Gather all onboarding data from session storage
      const whoNeedsCare = sessionStorage.getItem('onboarding_whoNeedsCare');
      const careType = JSON.parse(sessionStorage.getItem('onboarding_careType') || '[]');
      const city = sessionStorage.getItem('onboarding_city');
      const state = sessionStorage.getItem('onboarding_state');
      const careNeeds = JSON.parse(sessionStorage.getItem('onboarding_careNeeds') || '[]');
      const careNeedsOther = sessionStorage.getItem('onboarding_careNeedsOther');
      const budget = sessionStorage.getItem('onboarding_budget');
      const timeline = sessionStorage.getItem('onboarding_timeline');

      // Add "Other" to careNeeds if specified
      const allCareNeeds = careNeedsOther
        ? [...careNeeds, careNeedsOther]
        : careNeeds;

      // Save to database via API
      const response = await fetch('/api/onboarding/family/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          whoNeedsCare,
          careType,
          city,
          state,
          careNeeds: allCareNeeds,
          budget,
          timeline,
          isPublic,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      // Clear session storage
      sessionStorage.removeItem('onboarding_whoNeedsCare');
      sessionStorage.removeItem('onboarding_careType');
      sessionStorage.removeItem('onboarding_city');
      sessionStorage.removeItem('onboarding_state');
      sessionStorage.removeItem('onboarding_careNeeds');
      sessionStorage.removeItem('onboarding_careNeedsOther');
      sessionStorage.removeItem('onboarding_budget');
      sessionStorage.removeItem('onboarding_timeline');

      // Redirect to success page
      router.push('/onboarding/family/success');
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError('Failed to save your profile. Please try again.');
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding/family/step-5');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step 6 of 6</span>
            <span className="text-sm text-gray-500">Almost done!</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Make your profile visible?
          </h1>
          <p className="text-gray-600">
            Choose who can see your care profile
          </p>
        </div>

        {/* Visibility options */}
        <div className="space-y-4 mb-8">
          <button
            onClick={() => setIsPublic(true)}
            className={`w-full p-6 rounded-lg border-2 transition-all duration-200 text-left ${
              isPublic
                ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                  isPublic
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'border-gray-300'
                }`}
              >
                {isPublic && (
                  <div className="w-3 h-3 bg-white rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  ✓ Make my profile visible to providers
                </h3>
                <p className="text-sm text-gray-600">
                  Qualified care providers in your area can see you're looking for care and reach out with availability. <span className="font-semibold text-green-700">Recommended</span>
                </p>
                <p className="text-sm text-indigo-600 mt-2">
                  ⚡ Get responses up to 10x faster
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setIsPublic(false)}
            className={`w-full p-6 rounded-lg border-2 transition-all duration-200 text-left ${
              !isPublic
                ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                  !isPublic
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'border-gray-300'
                }`}
              >
                {!isPublic && (
                  <div className="w-3 h-3 bg-white rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Keep my profile private
                </h3>
                <p className="text-sm text-gray-600">
                  You'll browse and contact providers yourself. Providers cannot see your profile or contact you first.
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Privacy note */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Your privacy matters.</span> You can change this setting anytime from your dashboard. Your personal contact information is never shared without your permission.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleBack}
            disabled={loading}
            className="sm:w-32 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Back
          </button>

          <button
            onClick={handleComplete}
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Complete Profile →'}
          </button>
        </div>
      </div>
    </div>
  );
}
