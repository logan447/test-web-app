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

export default function ProviderOnboardingStep4() {
  const router = useRouter();
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setStreet(sessionStorage.getItem('provider_onboarding_street') || '');
    setCity(sessionStorage.getItem('provider_onboarding_city') || '');
    setState(sessionStorage.getItem('provider_onboarding_state') || '');
    setZipCode(sessionStorage.getItem('provider_onboarding_zipCode') || '');
  }, []);

  const handleContinue = () => {
    if (!street.trim() || !city.trim() || !state || !zipCode.trim()) {
      setError('All location fields are required');
      return;
    }
    if (!/^\d{5}$/.test(zipCode)) {
      setError('ZIP code must be 5 digits');
      return;
    }

    sessionStorage.setItem('provider_onboarding_street', street.trim());
    sessionStorage.setItem('provider_onboarding_city', city.trim());
    sessionStorage.setItem('provider_onboarding_state', state);
    sessionStorage.setItem('provider_onboarding_zipCode', zipCode.trim());
    router.push('/provider/onboarding/step-5');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step 4 of 9</span>
            <span className="text-sm text-gray-500">~5 minutes</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '44.44%' }} />
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Where are you located? *
          </h1>
          <p className="text-gray-600">Your business address</p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
            <input
              type="text"
              value={street}
              onChange={(e) => { setStreet(e.target.value); setError(''); }}
              placeholder="123 Main Street"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => { setCity(e.target.value); setError(''); }}
                placeholder="City"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => { setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5)); setError(''); }}
                placeholder="12345"
                maxLength={5}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
            <select
              value={state}
              onChange={(e) => { setState(e.target.value); setError(''); }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none bg-white"
            >
              <option value="">Select a state</option>
              {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => router.push('/provider/onboarding/step-3')} className="sm:w-32 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-300">
            ← Back
          </button>
          <div className="flex-1 flex gap-3">
            <button onClick={() => setError('Location is required')} className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-300">
              Skip
            </button>
            <button
              onClick={handleContinue}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg"
            >
              Continue →
            </button>
          </div>
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">* Required fields</p>
      </div>
    </div>
  );
}
