'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

export default function FamilyOnboardingStep3() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [error, setError] = useState('');

  // Load from session storage
  useEffect(() => {
    const savedCity = sessionStorage.getItem('onboarding_city');
    const savedState = sessionStorage.getItem('onboarding_state');
    if (savedCity) setCity(savedCity);
    if (savedState) setState(savedState);
  }, []);

  const handleContinue = () => {
    if (!city.trim()) {
      setError('Please enter a city');
      return;
    }
    if (!state) {
      setError('Please select a state');
      return;
    }

    sessionStorage.setItem('onboarding_city', city.trim());
    sessionStorage.setItem('onboarding_state', state);
    router.push('/onboarding/family/step-4');
  };

  const handleSkip = () => {
    // Can't skip required field - show error
    setError('Location is required to find matching providers in your area');
  };

  const handleBack = () => {
    router.push('/onboarding/family/step-2');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step 3 of 6</span>
            <span className="text-sm text-gray-500">~2 minutes</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '50%' }}
            />
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Where are you located? *
          </h1>
          <p className="text-gray-600">
            We'll show you providers in your area
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6 mb-6">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              id="city"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setError('');
              }}
              placeholder="Enter city name"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
              State *
            </label>
            <select
              id="state"
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none transition-colors bg-white"
            >
              <option value="">Select a state</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
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
              disabled={!city.trim() || !state}
              className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${
                !city.trim() || !state
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
          * Required fields
        </p>
      </div>
    </div>
  );
}
