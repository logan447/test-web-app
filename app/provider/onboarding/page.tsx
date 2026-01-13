'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function ProviderOnboardingWelcome() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleGetStarted = () => {
    router.push('/provider/onboarding/step-1');
  };

  const handleSkip = () => {
    router.push('/provider/requests');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8 md:p-12">
        <div className="text-center">
          {/* Icon/Illustration */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Welcome to Olera for Providers
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-600 mb-6">
            Connect with families seeking care in your area
          </p>

          {/* Description */}
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
            Complete your profile to start receiving consultation requests from families looking for care services. It takes just 5 minutes.
          </p>

          {/* Benefits */}
          <div className="mb-8 text-left max-w-md mx-auto space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-700">Get discovered by families in your area</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-700">Receive consultation requests directly</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-700">Showcase your services and expertise</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleSkip}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200"
            >
              Skip for Now
            </button>
            <button
              onClick={handleGetStarted}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition-colors duration-200 shadow-sm"
            >
              Get Started →
            </button>
          </div>

          {/* Time estimate */}
          <p className="text-sm text-gray-500 mt-6">
            ⏱️ Takes about 5 minutes to complete
          </p>
        </div>
      </div>
    </div>
  );
}
