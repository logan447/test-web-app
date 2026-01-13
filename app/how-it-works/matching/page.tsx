'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HowMatchingWorks() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            How Olera Matches Families with Providers
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Overview */}
          <div>
            <p className="text-lg text-gray-700 leading-relaxed">
              Olera helps you find the right care by matching families with providers based on location, care type, and availability.
            </p>
          </div>

          {/* How it works */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">How matching works:</h2>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">✓ Location</h3>
                  <p className="text-gray-600">We show you providers in your city who can serve your area.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">✓ Care Type</h3>
                  <p className="text-gray-600">We match you with providers offering the specific type of care you need (memory care, assisted living, home care, etc.).</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">✓ Availability</h3>
                  <p className="text-gray-600">We only show providers who are actively accepting inquiries and ready to help.</p>
                </div>
              </div>
            </div>
          </div>

          {/* For Families */}
          <div className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">For Families:</h2>
            <ol className="space-y-3 list-decimal list-inside text-gray-700">
              <li>Tell us what type of care you need</li>
              <li>Tell us where you&apos;re located</li>
              <li>Tell us about specific care needs</li>
              <li>We&apos;ll show you all matching providers in your area</li>
              <li>Request consultations with providers you like</li>
            </ol>
          </div>

          {/* For Providers */}
          <div className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">For Providers:</h2>
            <ol className="space-y-3 list-decimal list-inside text-gray-700">
              <li>Tell us what care you provide</li>
              <li>Tell us where you&apos;re located</li>
              <li>Make your profile visible</li>
              <li>Families looking for your services can find you and reach out</li>
            </ol>
          </div>

          {/* Privacy */}
          <div className="border-t pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Privacy & Control:</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>You control your visibility - turn your profile on or off anytime</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Only users looking for what you offer will see you</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>Your contact information is never shared without your permission</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="border-t pt-8">
            <div className="bg-indigo-50 rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ready to find the right care?
              </h3>
              <p className="text-gray-600 mb-4">
                Create your profile to get matched with providers in your area
              </p>
              <div className="flex gap-3 justify-center">
                <Link
                  href="/signup"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  href="/providers"
                  className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border-2 border-gray-300 transition-colors"
                >
                  Browse Providers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
