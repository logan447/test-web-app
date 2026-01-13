'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import FamilyOnboardingModal from '@/components/Onboarding/FamilyOnboardingModal';
import ProviderOnboardingModal from '@/components/Onboarding/ProviderOnboardingModal';

export default function WelcomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedMode, setSelectedMode] = useState<'family' | 'provider' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Check if user has already completed onboarding
  // Add a small delay to allow new signups to see the welcome page
  useEffect(() => {
    if (status === 'authenticated') {
      // Wait a moment before checking onboarding status
      // This allows new users to see the welcome page
      const timer = setTimeout(() => {
        checkOnboardingStatus();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const checkOnboardingStatus = async () => {
    try {
      const response = await fetch('/api/profile/completion-status');
      if (response.ok) {
        const data = await response.json();
        // If profile is already complete, redirect to dashboard
        if (data.isComplete) {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const handleModeSelect = async (mode: 'family' | 'provider') => {
    setSelectedMode(mode);

    // Set user mode in database
    try {
      await fetch('/api/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: mode === 'family' ? 'FAMILY' : 'PROVIDER' }),
      });
    } catch (error) {
      console.error('Error setting mode:', error);
    }

    // Open onboarding modal
    setIsModalOpen(true);
  };

  const handleSwitchMode = () => {
    const newMode = selectedMode === 'family' ? 'provider' : 'family';
    setSelectedMode(newMode);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // After closing modal, redirect to dashboard
    router.push('/dashboard');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to Olera
          </h1>
          <p className="text-xl text-gray-600">
            Let&apos;s get you started. How can we help you today?
          </p>
        </div>

        {/* Two-Column Choice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Family Option */}
          <button
            onClick={() => handleModeSelect('family')}
            className="group relative bg-white rounded-2xl p-8 shadow-lg border-2 border-transparent hover:border-indigo-600 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
          >
            <div className="text-center">
              {/* Icon */}
              <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
                <svg
                  className="w-10 h-10 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                I&apos;m Looking for Care
              </h2>

              {/* Description */}
              <p className="text-gray-600 mb-6">
                Find the right care provider for yourself or a loved one. Browse options, compare services, and connect with providers.
              </p>

              {/* Button */}
              <div className="inline-flex items-center text-indigo-600 font-semibold group-hover:gap-2 transition-all">
                <span>Get Started</span>
                <svg
                  className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </button>

          {/* Provider Option */}
          <button
            onClick={() => handleModeSelect('provider')}
            className="group relative bg-white rounded-2xl p-8 shadow-lg border-2 border-transparent hover:border-purple-600 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
          >
            <div className="text-center">
              {/* Icon */}
              <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors">
                <svg
                  className="w-10 h-10 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                I&apos;m a Care Provider
              </h2>

              {/* Description */}
              <p className="text-gray-600 mb-6">
                Connect with families looking for care. Build your profile, showcase your services, and grow your business.
              </p>

              {/* Button */}
              <div className="inline-flex items-center text-purple-600 font-semibold group-hover:gap-2 transition-all">
                <span>Get Started</span>
                <svg
                  className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            You can always change this later in your settings
          </p>
        </div>
      </div>

      {/* Onboarding Modals */}
      {selectedMode === 'family' && (
        <FamilyOnboardingModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSwitchToProvider={handleSwitchMode}
        />
      )}

      {selectedMode === 'provider' && (
        <ProviderOnboardingModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSwitchToFamily={handleSwitchMode}
        />
      )}
    </div>
  );
}
