'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProviderOnboardingStep2() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('provider_onboarding_businessName');
    if (saved) setBusinessName(saved);
  }, []);

  const handleContinue = () => {
    if (!businessName.trim()) {
      setError('Business/organization name is required');
      return;
    }

    sessionStorage.setItem('provider_onboarding_businessName', businessName.trim());
    router.push('/provider/onboarding/step-3');
  };

  const handleSkip = () => {
    setError('Business name is required to create your profile');
  };

  const handleBack = () => {
    router.push('/provider/onboarding/step-1');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step 2 of 9</span>
            <span className="text-sm text-gray-500">~5 minutes</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: '22.22%' }} />
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            What's your business name? *
          </h1>
          <p className="text-gray-600">
            Enter your organization or business name as you'd like it to appear
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
            Business/Organization Name *
          </label>
          <input
            type="text"
            id="businessName"
            value={businessName}
            onChange={(e) => {
              setBusinessName(e.target.value);
              setError('');
            }}
            placeholder="e.g., Sunrise Senior Care, Comfort Home Care, etc."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none transition-colors"
          />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={handleBack} className="sm:w-32 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-300 transition-colors duration-200">
            ← Back
          </button>
          <div className="flex-1 flex gap-3">
            <button onClick={handleSkip} className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-300 transition-colors duration-200">
              Skip
            </button>
            <button
              onClick={handleContinue}
              disabled={!businessName.trim()}
              className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${
                !businessName.trim() ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              Continue →
            </button>
          </div>
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">* Required field</p>
      </div>
    </div>
  );
}
