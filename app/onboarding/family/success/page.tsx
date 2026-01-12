'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function FamilyOnboardingSuccess() {
  const router = useRouter();

  const handleBrowseProviders = () => {
    router.push('/providers');
  };

  const handleCompleteProfile = () => {
    router.push('/dashboard/care-profile');
  };

  const handleViewProfile = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 md:p-12">
        {/* Success icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            You&apos;re all set!
          </h1>
          <p className="text-xl text-gray-600">
            Your care profile is complete
          </p>
        </div>

        {/* What&apos;s next */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="font-semibold text-blue-900 mb-3">What happens next?</h2>
          <ul className="space-y-2 text-sm text-blue-900">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-1">✓</span>
              <span>
                <span className="font-semibold">Providers can now see you&apos;re looking for care</span> in your area
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-1">✓</span>
              <span>
                You&apos;ll appear in search results for providers offering the care types you selected
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-1">✓</span>
              <span>
                Qualified providers can reach out with availability and information
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-1">✓</span>
              <span>
                You can browse providers and request consultations anytime
              </span>
            </li>
          </ul>
        </div>

        {/* CTA buttons */}
        <div className="space-y-3">
          <button
            onClick={handleBrowseProviders}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Browse Care Providers →
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleCompleteProfile}
              className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-300 transition-colors duration-200"
            >
              Add More Details
            </button>

            <button
              onClick={handleViewProfile}
              className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-300 transition-colors duration-200"
            >
              View My Dashboard
            </button>
          </div>
        </div>

        {/* Privacy reminder */}
        <p className="text-center text-sm text-gray-500 mt-6">
          You can update your profile or change your visibility settings anytime from your dashboard.
        </p>
      </div>
    </div>
  );
}
