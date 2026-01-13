'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import FamilyOnboardingModal from './FamilyOnboardingModal';
import ProviderOnboardingModal from './ProviderOnboardingModal';

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
  const { status } = useSession();
  const { isComplete, profileType, loading } = useProfileCompletion();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<'family' | 'provider'>(profileType);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  // Update current mode when profile type changes
  useEffect(() => {
    setCurrentMode(profileType);
  }, [profileType]);

  // Auto-open modal if profile is incomplete (only once per session)
  useEffect(() => {
    if (status === 'authenticated' && autoOpen && !loading && !isComplete && !hasAutoOpened) {
      // Wait a brief moment before showing modal (better UX)
      const timer = setTimeout(() => {
        setIsModalOpen(true);
        setHasAutoOpened(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [status, autoOpen, loading, isComplete, hasAutoOpened]);

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
  );
}
