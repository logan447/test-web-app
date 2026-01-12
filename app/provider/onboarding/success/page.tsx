'use client';

import { useRouter } from 'next/navigation';

export default function ProviderOnboardingSuccess() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 md:p-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Your profile is live!
          </h1>
          <p className="text-xl text-gray-600">
            You're all set to connect with families
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="font-semibold text-blue-900 mb-3">What happens next?</h2>
          <ul className="space-y-2 text-sm text-blue-900">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-1">✓</span>
              <span>
                <span className="font-semibold">Families can now find you</span> in search results when looking for your services
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-1">✓</span>
              <span>
                You'll receive consultation requests from families in your area
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-1">✓</span>
              <span>
                Your profile is visible to families seeking the care types you offer
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-1">✓</span>
              <span>
                You can browse families looking for care and reach out to them
              </span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/provider/families')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Browse Families Looking for Care →
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => router.push('/provider/profile')}
              className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-300 transition-colors"
            >
              Add More Details
            </button>

            <button
              onClick={() => router.push('/provider/requests')}
              className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-300 transition-colors"
            >
              View My Inbox
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          You can update your profile or visibility settings anytime from your dashboard.
        </p>
      </div>
    </div>
  );
}
