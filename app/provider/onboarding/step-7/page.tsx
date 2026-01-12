'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProviderOnboardingStep7() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const charMin = 50;
  const charMax = 500;

  useEffect(() => {
    const saved = sessionStorage.getItem('provider_onboarding_description');
    if (saved) setDescription(saved);
  }, []);

  const handleContinue = () => {
    if (description.trim().length < charMin) {
      setError(`Description must be at least ${charMin} characters`);
      return;
    }

    sessionStorage.setItem('provider_onboarding_description', description.trim());
    router.push('/provider/onboarding/step-8');
  };

  const charCount = description.length;
  const isValid = charCount >= charMin && charCount <= charMax;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step 7 of 9</span>
            <span className="text-sm text-gray-500">~5 minutes</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '77.78%' }} />
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Tell families about your services *
          </h1>
          <p className="text-gray-600">
            What makes you special? ({charMin}-{charMax} characters)
          </p>
        </div>

        <div className="mb-2">
          <textarea
            value={description}
            onChange={(e) => {
              if (e.target.value.length <= charMax) {
                setDescription(e.target.value);
                setError('');
              }
            }}
            placeholder="Example: We provide compassionate, personalized care in a warm, home-like environment. Our experienced staff specializes in memory care and offers 24/7 nursing support..."
            rows={8}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none resize-none"
          />
          <div className="flex justify-between items-center mt-2">
            <span className={`text-sm ${
              charCount < charMin ? 'text-red-600' :
              charCount > charMax ? 'text-red-600' :
              'text-green-600'
            }`}>
              {charCount < charMin && `${charMin - charCount} more characters needed`}
              {charCount >= charMin && charCount <= charMax && '✓ Good length'}
              {charCount > charMax && 'Too long'}
            </span>
            <span className="text-sm text-gray-500">{charCount}/{charMax}</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button onClick={() => router.push('/provider/onboarding/step-6')} className="sm:w-32 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-300">
            ← Back
          </button>
          <div className="flex-1 flex gap-3">
            <button onClick={() => setError('Description is required')} className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-300">
              Skip
            </button>
            <button
              onClick={handleContinue}
              disabled={!isValid}
              className={`flex-1 font-semibold py-3 px-6 rounded-lg ${
                !isValid ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
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
