'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProviderOnboardingStep1() {
  const router = useRouter();
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');

  // Load from session storage
  useEffect(() => {
    const saved = sessionStorage.getItem('provider_onboarding_providerType');
    if (saved) setSelected(saved);
  }, []);

  const providerTypes = [
    { value: 'INDEPENDENT_CAREGIVER', label: 'Independent Caregiver', description: 'Self-employed caregiver' },
    { value: 'HOME_CARE', label: 'Home Care Agency', description: 'In-home care services' },
    { value: 'HOME_HEALTH', label: 'Home Health Agency', description: 'Medical home health' },
    { value: 'HOSPICE', label: 'Hospice', description: 'End-of-life care' },
    { value: 'INDEPENDENT_LIVING', label: 'Independent Living', description: 'Active senior community' },
    { value: 'ASSISTED_LIVING', label: 'Assisted Living', description: 'Residential care facility' },
    { value: 'MEMORY_CARE', label: 'Memory Care', description: 'Specialized dementia care' },
    { value: 'NURSING_HOME', label: 'Nursing Home', description: 'Skilled nursing facility' },
    { value: 'REHABILITATION', label: 'Rehab Center', description: 'Rehabilitation services' },
  ];

  const handleContinue = () => {
    if (!selected) {
      setError('Please select a provider type');
      return;
    }

    sessionStorage.setItem('provider_onboarding_providerType', selected);
    router.push('/provider/onboarding/step-2');
  };

  const handleSkip = () => {
    setError('Provider type is required to create your profile');
  };

  const handleBack = () => {
    router.push('/provider/onboarding');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full p-8 max-h-screen overflow-y-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step 1 of 9</span>
            <span className="text-sm text-gray-500">~5 minutes</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '11.11%' }}
            />
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            What type of provider are you? *
          </h1>
          <p className="text-gray-600">
            Select the option that best describes your organization or services
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {providerTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => {
                setSelected(type.value);
                setError('');
              }}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                selected === type.value
                  ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selected === type.value
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'border-gray-300'
                  }`}
                >
                  {selected === type.value && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{type.label}</div>
                  <div className="text-sm text-gray-600">{type.description}</div>
                </div>
              </div>
            </button>
          ))}
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
            className="sm:w-32 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-300 transition-colors duration-200"
          >
            ← Back
          </button>

          <div className="flex-1 flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-300 transition-colors duration-200"
            >
              Skip
            </button>

            <button
              onClick={handleContinue}
              disabled={!selected}
              className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${
                !selected
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
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
