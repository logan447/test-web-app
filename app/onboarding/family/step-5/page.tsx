'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FamilyOnboardingStep5() {
  const router = useRouter();
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');

  // Load from session storage
  useEffect(() => {
    const savedBudget = sessionStorage.getItem('onboarding_budget');
    const savedTimeline = sessionStorage.getItem('onboarding_timeline');
    if (savedBudget) setBudget(savedBudget);
    if (savedTimeline) setTimeline(savedTimeline);
  }, []);

  const budgetOptions = [
    { value: 'under-3000', label: 'Under $3,000/month' },
    { value: '3000-5000', label: '$3,000 - $5,000/month' },
    { value: '5000-7000', label: '$5,000 - $7,000/month' },
    { value: '7000-10000', label: '$7,000 - $10,000/month' },
    { value: 'over-10000', label: 'Over $10,000/month' },
    { value: 'not-sure', label: 'Not sure yet' },
  ];

  const timelineOptions = [
    { value: 'asap', label: 'ASAP (within 2 weeks)' },
    { value: '1-3-months', label: '1-3 months' },
    { value: '3-6-months', label: '3-6 months' },
    { value: '6plus-months', label: '6+ months' },
    { value: 'just-exploring', label: 'Just exploring options' },
  ];

  const handleContinue = () => {
    if (budget) {
      sessionStorage.setItem('onboarding_budget', budget);
    }
    if (timeline) {
      sessionStorage.setItem('onboarding_timeline', timeline);
    }
    router.push('/onboarding/family/step-6');
  };

  const handleSkip = () => {
    router.push('/onboarding/family/step-6');
  };

  const handleBack = () => {
    router.push('/onboarding/family/step-4');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step 5 of 6</span>
            <span className="text-sm text-gray-500">~2 minutes</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '83.33%' }}
            />
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Budget & Timeline
          </h1>
          <p className="text-gray-600">
            Help us find options that fit your needs (optional)
          </p>
        </div>

        {/* Budget section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            What's your monthly budget?
          </h2>
          <div className="space-y-2">
            {budgetOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setBudget(option.value)}
                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  budget === option.value
                    ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      budget === option.value
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {budget === option.value && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="font-medium text-gray-900">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            When do you need care?
          </h2>
          <div className="space-y-2">
            {timelineOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeline(option.value)}
                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  timeline === option.value
                    ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      timeline === option.value
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {timeline === option.value && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="font-medium text-gray-900">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
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
