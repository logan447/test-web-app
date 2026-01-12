'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FamilyOnboardingStep2() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');

  // Load from session storage
  useEffect(() => {
    const saved = sessionStorage.getItem('onboarding_careType');
    if (saved) {
      setSelected(JSON.parse(saved));
    }
  }, []);

  const careTypes = [
    { value: 'in-home', label: 'In-home care', description: 'Care provided in your home' },
    { value: 'assisted-living', label: 'Assisted living', description: 'Community living with support' },
    { value: 'memory-care', label: 'Memory care', description: 'Specialized dementia care' },
    { value: 'nursing-home', label: 'Nursing home', description: '24/7 skilled nursing' },
    { value: 'independent-living', label: 'Independent living', description: 'Active senior community' },
    { value: 'not-sure', label: 'Not sure yet', description: 'We can help you decide' },
  ];

  const toggleSelection = (value: string) => {
    setError('');
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const handleContinue = () => {
    if (selected.length === 0) {
      setError('Please select at least one care type');
      return;
    }

    sessionStorage.setItem('onboarding_careType', JSON.stringify(selected));
    router.push('/onboarding/family/step-3');
  };

  const handleSkip = () => {
    // Can't skip required field - show error
    setError('This field is required to find matching providers');
  };

  const handleBack = () => {
    router.push('/onboarding/family/step-1');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step 2 of 6</span>
            <span className="text-sm text-gray-500">~2 minutes</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '33.33%' }}
            />
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            What type of care are you looking for? *
          </h1>
          <p className="text-gray-600">
            Select all that apply
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {careTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => toggleSelection(type.value)}
              className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                selected.includes(type.value)
                  ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    selected.includes(type.value)
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'border-gray-300'
                  }`}
                >
                  {selected.includes(type.value) && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
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
              disabled={selected.length === 0}
              className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${
                selected.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              Continue →
            </button>
          </div>
        </div>

        {/* Required field note */}
        <p className="text-center text-sm text-gray-500 mt-4">
          * Required field
        </p>
      </div>
    </div>
  );
}
