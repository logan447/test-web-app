'use client';

import { useState } from 'react';

interface ModeSelectionModalProps {
  isOpen: boolean;
  onSelectMode: (mode: 'family' | 'provider') => void;
}

export default function ModeSelectionModal({
  isOpen,
  onSelectMode,
}: ModeSelectionModalProps) {
  const [selectedMode, setSelectedMode] = useState<'family' | 'provider' | null>(null);

  if (!isOpen) return null;

  const handleContinue = () => {
    if (selectedMode) {
      onSelectMode(selectedMode);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8">
          {/* Header */}
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
              onClick={() => setSelectedMode('family')}
              className={`group relative rounded-2xl p-8 shadow-lg border-2 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
                selectedMode === 'family'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-transparent bg-white hover:border-indigo-600'
              }`}
            >
              <div className="text-center">
                {/* Icon */}
                <div className={`mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full transition-colors ${
                  selectedMode === 'family'
                    ? 'bg-indigo-200'
                    : 'bg-indigo-100 group-hover:bg-indigo-200'
                }`}>
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

                {/* Checkmark if selected */}
                {selectedMode === 'family' && (
                  <div className="flex items-center justify-center gap-2 text-indigo-600 font-semibold">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Selected</span>
                  </div>
                )}
              </div>
            </button>

            {/* Provider Option */}
            <button
              onClick={() => setSelectedMode('provider')}
              className={`group relative rounded-2xl p-8 shadow-lg border-2 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
                selectedMode === 'provider'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-transparent bg-white hover:border-purple-600'
              }`}
            >
              <div className="text-center">
                {/* Icon */}
                <div className={`mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full transition-colors ${
                  selectedMode === 'provider'
                    ? 'bg-purple-200'
                    : 'bg-purple-100 group-hover:bg-purple-200'
                }`}>
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

                {/* Checkmark if selected */}
                {selectedMode === 'provider' && (
                  <div className="flex items-center justify-center gap-2 text-purple-600 font-semibold">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Selected</span>
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <button
              onClick={handleContinue}
              disabled={!selectedMode}
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
                selectedMode
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
            <p className="text-sm text-gray-500 mt-4">
              You can always change this later in your settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
