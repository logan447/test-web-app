"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CompletionItem {
  label: string;
  completed: boolean;
  description: string;
}

interface ProfileCompletionData {
  completionPercentage: number;
  completedCount: number;
  totalCount: number;
  items: CompletionItem[];
  missingRequired?: string[];
  nudgeMessage?: string;
}

/**
 * Lightweight profile completion banner for provider pages
 *
 * Shows a compact progress indicator with specific missing fields
 * Used on: leads, opportunities, requests, candidates pages
 */
export default function ProfileCompletionBanner() {
  const [data, setData] = useState<ProfileCompletionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem("profile-completion-banner-dismissed");
    if (isDismissed) {
      setDismissed(true);
      setLoading(false);
      return;
    }
    fetchCompletion();
  }, []);

  const fetchCompletion = async () => {
    try {
      const response = await fetch("/api/dashboard/profile-completion");
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Failed to fetch profile completion:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem("profile-completion-banner-dismissed", "true");
    setDismissed(true);
  };

  if (loading || dismissed) {
    return null;
  }

  // Don't show if profile is complete or nearly complete (90%+)
  if (!data || data.completionPercentage >= 90) {
    return null;
  }

  const incompleteItems = data.items.filter((item) => !item.completed);
  const topMissing = incompleteItems.slice(0, 2);

  const getProgressColor = () => {
    if (data.completionPercentage >= 70) return "bg-emerald-500";
    if (data.completionPercentage >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  const getBorderColor = () => {
    if (data.completionPercentage >= 70) return "border-emerald-200";
    if (data.completionPercentage >= 40) return "border-amber-200";
    return "border-red-200";
  };

  const getBgColor = () => {
    if (data.completionPercentage >= 70) return "bg-emerald-50";
    if (data.completionPercentage >= 40) return "bg-amber-50";
    return "bg-red-50";
  };

  return (
    <div className={`${getBgColor()} border ${getBorderColor()} rounded-xl p-4 mb-6`}>
      {/* Mobile: dismiss button at top right */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0">
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 transform -rotate-90">
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${data.completionPercentage} 100`}
                    className={getProgressColor().replace("bg-", "text-")}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                  {data.completionPercentage}%
                </span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">
                Boost your visibility
              </p>
              <p className="text-sm text-gray-600 line-clamp-2">
                {data.nudgeMessage || "Complete your profile to get more inquiries"}
              </p>
            </div>
          </div>

          {topMissing.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {topMissing.map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 text-xs bg-white px-2.5 py-1 rounded-full border border-gray-200 text-gray-700"
                >
                  <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="truncate">{item.label}</span>
                </span>
              ))}
              {incompleteItems.length > 2 && (
                <span className="text-xs text-gray-500 px-2 py-1">
                  +{incompleteItems.length - 2} more
                </span>
              )}
            </div>
          )}

          {/* Mobile: CTA button below content */}
          <div className="mt-4 sm:hidden">
            <Link
              href="/provider/profile/edit"
              className="inline-flex items-center justify-center gap-1.5 w-full bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Complete Profile
            </Link>
          </div>
        </div>

        {/* Desktop: actions on the side */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <Link
            href="/provider/profile/edit"
            className="inline-flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Complete
          </Link>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile: just dismiss button */}
        <button
          onClick={handleDismiss}
          className="sm:hidden text-gray-400 hover:text-gray-600 p-1 flex-shrink-0"
          aria-label="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
