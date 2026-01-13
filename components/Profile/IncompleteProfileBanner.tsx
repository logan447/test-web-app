'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface IncompleteProfileBannerProps {
  dismissible?: boolean; // Whether banner can be dismissed
}

export default function IncompleteProfileBanner({ dismissible = true }: IncompleteProfileBannerProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [profileStatus, setProfileStatus] = useState<{
    isComplete: boolean;
    missingFields: string[];
    profileType: 'family' | 'provider';
  } | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed (only for dismissible banners)
    if (dismissible) {
      const dismissed = localStorage.getItem('profile_banner_dismissed');
      if (dismissed) {
        setIsDismissed(true);
        return;
      }
    }

    // Fetch profile completion status
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/profile/completion-status');
        if (response.ok) {
          const data = await response.json();
          setProfileStatus(data);

          // Show banner only if profile is incomplete
          if (!data.isComplete) {
            setIsVisible(true);
          }
        }
      } catch (error) {
        console.error('Error fetching profile status:', error);
      }
    };

    if (session?.user) {
      fetchStatus();
    }
  }, [session, dismissible]);

  const handleCompleteProfile = () => {
    if (profileStatus?.profileType === 'family') {
      // Redirect to dashboard with query parameter to open profile modal
      router.push('/dashboard?openProfile=true');
    } else {
      // For providers, redirect to dashboard with query parameter
      router.push('/provider/dashboard?openProfile=true');
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    if (dismissible) {
      localStorage.setItem('profile_banner_dismissed', 'true');
    }
  };

  // Don't show if dismissed or if profile is complete
  if (!isVisible || isDismissed || !profileStatus || profileStatus.isComplete) {
    return null;
  }

  const isFamilyProfile = profileStatus.profileType === 'family';
  const isProviderProfile = profileStatus.profileType === 'provider';

  return (
    <div className={`rounded-lg p-4 mb-6 ${
      isProviderProfile && !dismissible
        ? 'bg-red-50 border-2 border-red-200'
        : 'bg-yellow-50 border border-yellow-200'
    }`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {isProviderProfile && !dismissible ? (
            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        <div className="flex-1">
          <h3 className={`font-semibold mb-1 ${
            isProviderProfile && !dismissible ? 'text-red-900' : 'text-yellow-900'
          }`}>
            {isProviderProfile && !dismissible ? (
              'Your profile is incomplete'
            ) : (
              'Complete your profile to get better matches'
            )}
          </h3>

          <p className={`text-sm mb-3 ${
            isProviderProfile && !dismissible ? 'text-red-800' : 'text-yellow-800'
          }`}>
            {isFamilyProfile && (
              'Tell us about your care needs to help providers find you and send you relevant opportunities.'
            )}
            {isProviderProfile && !dismissible && (
              <>Your profile won&apos;t appear in search results until you complete all required fields. Complete your profile now to start receiving inquiries.</>
            )}
            {isProviderProfile && dismissible && (
              'Complete your profile to appear in search results and receive inquiries from families.'
            )}
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCompleteProfile}
              className={`font-semibold py-2 px-4 rounded-lg transition-colors ${
                isProviderProfile && !dismissible
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
            >
              Complete Profile →
            </button>

            {dismissible && (
              <button
                onClick={handleDismiss}
                className={`font-medium py-2 px-4 rounded-lg border-2 transition-colors ${
                  isProviderProfile && !dismissible
                    ? 'border-red-300 text-red-700 hover:bg-red-100'
                    : 'border-yellow-300 text-yellow-700 hover:bg-yellow-100'
                }`}
              >
                Dismiss
              </button>
            )}
          </div>
        </div>

        {dismissible && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-yellow-600 hover:text-yellow-800"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
