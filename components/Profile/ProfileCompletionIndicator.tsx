'use client';

import { useProfileCompletion } from '@/hooks/useProfileCompletion';

interface ProfileCompletionIndicatorProps {
  onClick?: () => void;
  className?: string;
}

export default function ProfileCompletionIndicator({
  onClick,
  className = '',
}: ProfileCompletionIndicatorProps) {
  const { isComplete, missingFields, loading } = useProfileCompletion();

  if (loading || isComplete) return null;

  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 ${className}`}
      title={`Complete your profile - Missing: ${missingFields.join(', ')}`}
    >
      {/* Red notification dot */}
      <div className="relative">
        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
        <div className="absolute inset-0 w-2 h-2 bg-red-600 rounded-full animate-ping opacity-75" />
      </div>

      {/* Optional text label */}
      <span className="text-sm font-medium text-red-600">
        Complete Profile
      </span>
    </button>
  );
}

// Simplified version - just the dot
export function ProfileCompletionDot() {
  const { isComplete, loading } = useProfileCompletion();

  if (loading || isComplete) return null;

  return (
    <div className="relative inline-flex">
      <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
      <div className="absolute inset-0 w-2 h-2 bg-red-600 rounded-full animate-ping opacity-75" />
    </div>
  );
}
