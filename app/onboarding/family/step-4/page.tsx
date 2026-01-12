'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FamilyOnboardingStep4() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [otherText, setOtherText] = useState('');
  const [error, setError] = useState('');

  // Load from session storage
  useEffect(() => {
    const saved = sessionStorage.getItem('onboarding_careNeeds');
    const savedOther = sessionStorage.getItem('onboarding_careNeedsOther');
    if (saved) {
      setSelected(JSON.parse(saved));
    }
    if (savedOther) {
      setOtherText(savedOther);
    }
  }, []);

  const careNeeds = [
    { value: 'alzheimers-dementia', label: "Alzheimer's/Dementia" },
    { value: 'mobility-issues', label: 'Mobility issues' },
    { value: 'diabetes', label: 'Diabetes' },
    { value: 'heart-disease', label: 'Heart disease' },
    { value: 'stroke-recovery', label: 'Stroke recovery' },
    { value: 'cancer-care', label: 'Cancer care' },
    { value: 'parkinsons', label: "Parkinson's disease" },
    { value: 'respiratory', label: 'Respiratory conditions (COPD, etc.)' },
    { value: 'arthritis', label: 'Arthritis' },
    { value: 'vision-hearing', label: 'Vision or hearing impairment' },
    { value: 'mental-health', label: 'Mental health support' },
    { value: 'fall-risk', label: 'Fall risk/prevention' },
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
    if (selected.length === 0 && !otherText.trim()) {
      setError('Please select at least one care need or specify other needs');
      return;
    }

    sessionStorage.setItem('onboarding_careNeeds', JSON.stringify(selected));
    if (otherText.trim()) {
      sessionStorage.setItem('onboarding_careNeedsOther', otherText.trim());
    }
    router.push('/onboarding/family/step-5');
  };

  const handleSkip = () => {
    // Can't skip required field - show error
    setError('This information is required to match you with the right providers');
  };

  const handleBack = () => {
    router.push('/onboarding/family/step-3');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8 max-h-screen overflow-y-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step 4 of 6</span>
            <span className="text-sm text-gray-500">~2 minutes</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '66.67%' }}
            />
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            What are their care needs? *
          </h1>
          <p className="text-gray-600">
            Select all conditions or care needs that apply
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {careNeeds.map((need) => (
            <button
              key={need.value}
              onClick={() => toggleSelection(need.value)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                selected.includes(need.value)
                  ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    selected.includes(need.value)
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'border-gray-300'
                  }`}
                >
                  {selected.includes(need.value) && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span className="font-medium text-gray-900">{need.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Other field */}
        <div className="mb-6">
          <label htmlFor="other" className="block text-sm font-medium text-gray-700 mb-2">
            Other care needs (optional)
          </label>
          <textarea
            id="other"
            value={otherText}
            onChange={(e) => {
              setOtherText(e.target.value);
              setError('');
            }}
            placeholder="Describe any other specific care needs..."
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none transition-colors resize-none"
          />
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
              disabled={selected.length === 0 && !otherText.trim()}
              className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${
                selected.length === 0 && !otherText.trim()
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
