'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CARE_TYPES = [
  { value: 'MEMORY_CARE', label: 'Memory care' },
  { value: 'PERSONAL_CARE', label: 'Personal care' },
  { value: 'SKILLED_NURSING', label: 'Skilled nursing' },
  { value: 'RESPITE_CARE', label: 'Respite care' },
  { value: 'HOSPICE_CARE', label: 'Hospice care' },
  { value: 'REHABILITATION', label: 'Rehabilitation' },
  { value: 'COMPANION_CARE', label: 'Companion care' },
  { value: 'LIVE_IN_CARE', label: 'Live-in care' },
];

export default function ProviderOnboardingStep3() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('provider_onboarding_careTypes');
    if (saved) setSelected(JSON.parse(saved));
  }, []);

  const toggleSelection = (value: string) => {
    setError('');
    setSelected(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleContinue = () => {
    if (selected.length === 0) {
      setError('Please select at least one care type');
      return;
    }
    sessionStorage.setItem('provider_onboarding_careTypes', JSON.stringify(selected));
    router.push('/provider/onboarding/step-4');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8 max-h-screen overflow-y-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step 3 of 9</span>
            <span className="text-sm text-gray-500">~5 minutes</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '33.33%' }} />
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            What care do you provide? *
          </h1>
          <p className="text-gray-600">Select all that apply</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {CARE_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => toggleSelection(type.value)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selected.includes(type.value)
                  ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  selected.includes(type.value) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
                }`}>
                  {selected.includes(type.value) && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="font-medium text-gray-900">{type.label}</span>
              </div>
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => router.push('/provider/onboarding/step-2')} className="sm:w-32 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-300">
            ← Back
          </button>
          <div className="flex-1 flex gap-3">
            <button onClick={() => setError('Care types are required')} className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-300">
              Skip
            </button>
            <button
              onClick={handleContinue}
              disabled={selected.length === 0}
              className={`flex-1 font-semibold py-3 px-6 rounded-lg ${
                selected.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
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
