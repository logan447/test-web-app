import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export interface ProfileCompletionStatus {
  isComplete: boolean;
  profileType: 'family' | 'provider';
  missingFields: string[];
  loading: boolean;
  mode: string;
}

export function useProfileCompletion() {
  const { data: session, status } = useSession();
  const [completionStatus, setCompletionStatus] = useState<ProfileCompletionStatus>({
    isComplete: true,
    profileType: 'family',
    missingFields: [],
    loading: true,
    mode: 'FAMILY',
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      setCompletionStatus({
        isComplete: true,
        profileType: 'family',
        missingFields: [],
        loading: false,
        mode: 'FAMILY',
      });
      return;
    }

    checkProfileCompletion();
  }, [status, session]);

  const checkProfileCompletion = async () => {
    try {
      const response = await fetch('/api/profile/completion-status');
      if (response.ok) {
        const data = await response.json();
        setCompletionStatus({
          isComplete: data.isComplete,
          profileType: data.profileType,
          missingFields: data.missingFields || [],
          loading: false,
          mode: data.mode,
        });
      } else {
        setCompletionStatus(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error checking profile completion:', error);
      setCompletionStatus(prev => ({ ...prev, loading: false }));
    }
  };

  return completionStatus;
}
