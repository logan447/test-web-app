'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProviderOnboardingStep5() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setPhone(sessionStorage.getItem('provider_onboarding_phone') || '');
    setWebsite(sessionStorage.getItem('provider_onboarding_website') || '');
  }, []);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handleContinue = () => {
    if (!phone.trim() || !website.trim()) {
      setError('Phone and website are required');
      return;
    }

    sessionStorage.setItem('provider_onboarding_phone', phone.trim());
    sessionStorage.setItem('provider_onboarding_website', website.trim());
    router.push('/provider/onboarding/step-6');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step 5 of 9</span>
            <span className="text-sm text-gray-500">~5 minutes</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '55.56%' }} />
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Contact information *
          </h1>
          <p className="text-gray-600">How families can reach you</p>
        </div>

        <div className="space-y-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(formatPhone(e.target.value)); setError(''); }}
              placeholder="(555) 123-4567"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website *</label>
            <input
              type="url"
              value={website}
              onChange={(e) => { setWebsite(e.target.value); setError(''); }}
              placeholder="https://www.yourwebsite.com"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
            />
            <p className="text-sm text-gray-500 mt-1">Include https://</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => router.push('/provider/onboarding/step-4')} className="sm:w-32 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-300">
            ← Back
          </button>
          <div className="flex-1 flex gap-3">
            <button onClick={() => setError('Contact info is required')} className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-300">
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
