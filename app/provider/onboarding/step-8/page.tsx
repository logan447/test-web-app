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

export default function ProviderOnboardingStep8() {
  const router = useRouter();
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseState, setLicenseState] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setLicenseNumber(sessionStorage.getItem('provider_onboarding_licenseNumber') || '');
    setLicenseState(sessionStorage.getItem('provider_onboarding_licenseState') || '');
  }, []);

  const handleContinue = () => {
    if (!licenseNumber.trim() || !licenseState) {
      setError('License number and state are required');
      return;
    }

    sessionStorage.setItem('provider_onboarding_licenseNumber', licenseNumber.trim());
    sessionStorage.setItem('provider_onboarding_licenseState', licenseState);
    router.push('/provider/onboarding/step-9');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step 8 of 9</span>
            <span className="text-sm text-gray-500">Almost done!</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '88.89%' }} />
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            License & Certification *
          </h1>
          <p className="text-gray-600">
            Required for credibility and trust
          </p>
        </div>

        <div className="space-y-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              License/Certification Number *
            </label>
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => { setLicenseNumber(e.target.value); setError(''); }}
              placeholder="Enter your license or certification number"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              This may be a state license, Medicare certification, or accreditation number
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issuing State *
            </label>
            <select
              value={licenseState}
              onChange={(e) => { setLicenseState(e.target.value); setError(''); }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none bg-white"
            >
              <option value="">Select a state</option>
              {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Why is this required?</span> License verification helps families trust your services. We may verify this information to display a "Verified" badge on your profile.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => router.push('/provider/onboarding/step-7')} className="sm:w-32 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-300">
            ← Back
          </button>
          <div className="flex-1 flex gap-3">
            <button onClick={() => setError('License information is required')} className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-300">
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
