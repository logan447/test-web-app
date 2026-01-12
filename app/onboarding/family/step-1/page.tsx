'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FamilyOnboardingStep1() {
  const router = useRouter();
  const [selected, setSelected] = useState('');

  const options = [
    { value: 'myself', label: 'Myself', icon: '👤' },
    { value: 'parent', label: 'My parent', icon: '👨‍👩' },
    { value: 'spouse', label: 'My spouse', icon: '💑' },
    { value: 'other', label: 'Other family member', icon: '👪' },
  ];

  const handleContinue = async () => {
    if (selected) {
      // Save to session storage for now (will save to DB in final step)
      sessionStorage.setItem('onboarding_whoNeedsCare', selected);
    }
    router.push('/onboarding/family/step-2');
  };

  const handleSkip = () => {
    router.push('/onboarding/family/step-2');
  };

  const handleBack = () => {
    router.push('/onboarding/family');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step 1 of 6</span>
            <span className="text-sm text-gray-500">~2 minutes</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '16.67%' }}
            />
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Who needs care?
          </h1>
          <p className="text-gray-600">
            This helps us personalize your experience (optional)
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelected(option.value)}
              className={`p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                selected === option.value
                  ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{option.icon}</span>
                <span className="text-lg font-semibold text-gray-900">
                  {option.label}
                </span>
              </div>
            </button>
          ))}
        </div>

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
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
