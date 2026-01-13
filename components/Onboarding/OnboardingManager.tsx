'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import FamilyOnboardingModal from './FamilyOnboardingModal';
import ProviderOnboardingModal from './ProviderOnboardingModal';
import ModeSelectionModal from './ModeSelectionModal';

interface OnboardingManagerProps {
  // If true, auto-opens modal when profile is incomplete
  autoOpen?: boolean;
  // If provided, user can manually trigger the modal
  children?: (props: { openOnboarding: () => void }) => React.ReactNode;
}

export default function OnboardingManager({
  autoOpen = false,
  children,
}: OnboardingManagerProps) {
  const { status, data: session } = useSession();
  const router = useRouter();
  const { isComplete, profileType, loading } = useProfileCompletion();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [currentMode, setCurrentMode] = useState<'family' | 'provider'>(profileType);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // Check if user is brand new (needs to select mode)
  useEffect(() => {
    if (status === 'authenticated' && !loading) {
      checkIfNewUser();
    }
  }, [status, loading]);

  const checkIfNewUser = async () => {
    try {
      const response = await fetch('/api/profile/completion-status');
      if (response.ok) {
        const data = await response.json();
        // If profile doesn't exist at all, user is brand new
        if (data.missingFields && data.missingFields.includes('Profile not created')) {
          setIsNewUser(true);
        }
      }
    } catch (error) {
      console.error('Error checking if new user:', error);
    }
  };

  // Update current mode when profile type changes
  useEffect(() => {
    setCurrentMode(profileType);
  }, [profileType]);

  // Auto-open modal if profile is incomplete (only once per session)
  useEffect(() => {
    if (status === 'authenticated' && autoOpen && !loading && !isComplete && !hasAutoOpened) {
      // If user is brand new, show mode selection first
      if (isNewUser) {
        const timer = setTimeout(() => {
          setShowModeSelection(true);
          setHasAutoOpened(true);
        }, 500);
        return () => clearTimeout(timer);
      } else {
        // Existing user with incomplete profile - show onboarding modal
        const timer = setTimeout(() => {
          setIsModalOpen(true);
          setHasAutoOpened(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [status, autoOpen, loading, isComplete, hasAutoOpened, isNewUser]);

  const handleModeSelect = async (mode: 'family' | 'provider') => {
    // Set the mode in the database
    try {
      await fetch('/api/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: mode === 'family' ? 'FAMILY' : 'PROVIDER' }),
      });

      // Update local state
      setCurrentMode(mode);
      setIsNewUser(false);
      setShowModeSelection(false);

      // Show the appropriate onboarding modal
      setIsModalOpen(true);

      // Refresh to update session
      router.refresh();
    } catch (error) {
      console.error('Error setting mode:', error);
    }
  };

  const handleSwitchToProvider = async () => {
    setCurrentMode('provider');
  };

  const handleSwitchToFamily = async () => {
    setCurrentMode('family');
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const openOnboarding = () => {
    setIsModalOpen(true);
  };

  // Don't render anything during loading or if not authenticated
  if (status === 'loading' || status === 'unauthenticated') {
    return children ? <>{children({ openOnboarding })}</> : null;
  }

  return (
    <>
      {children && children({ openOnboarding })}

      {/* Mode Selection Modal - shown first for brand new users */}
      <ModeSelectionModal
        isOpen={showModeSelection}
        onSelectMode={handleModeSelect}
      />

      {/* Onboarding Modals - shown after mode selection */}
      {!showModeSelection && (
        <>
          {currentMode === 'family' ? (
            <FamilyOnboardingModal
              isOpen={isModalOpen}
              onClose={handleClose}
              onSwitchToProvider={handleSwitchToProvider}
            />
          ) : (
            <ProviderOnboardingModal
              isOpen={isModalOpen}
              onClose={handleClose}
              onSwitchToFamily={handleSwitchToFamily}
            />
          )}
        </>
      )}
    </>
  );
}
