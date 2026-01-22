"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CompletionItem {
  label: string;
  completed: boolean;
  description: string;
  action: string;
}

interface ProfileCompletionData {
  completionPercentage: number;
  completedCount: number;
  totalCount: number;
  items: CompletionItem[];
  mode: "FAMILY" | "PROVIDER";
}

export default function ProfileCompletionWidget() {
  const [data, setData] = useState<ProfileCompletionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
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

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (!data || data.completionPercentage === 100) {
    return null; // Don't show if profile is complete
  }

  const isProvider = data.mode === "PROVIDER";
  const profileUrl = isProvider ? "/provider/profile" : "/care-profile/edit";

  const getProgressColor = () => {
    if (data.completionPercentage >= 80) return "bg-green-500";
    if (data.completionPercentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getProgressTextColor = () => {
    if (data.completionPercentage >= 80) return "text-green-700";
    if (data.completionPercentage >= 50) return "text-yellow-700";
    return "text-red-700";
  };

  const incompleteItems = data.items.filter((item) => !item.completed);

  return (
    <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg shadow-md border-2 border-primary-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-3 rounded-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Complete Your Profile
              </h3>
              <p className="text-sm text-gray-600">
                {data.completedCount} of {data.totalCount} sections completed
              </p>
            </div>
          </div>
          <div className={`text-2xl font-bold ${getProgressTextColor()}`}>
            {data.completionPercentage}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor()} transition-all duration-500 rounded-full`}
              style={{ width: `${data.completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Motivation Message */}
        {isProvider ? (
          <div className="mt-4 bg-white rounded-lg p-4 border-l-4 border-primary-600">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Complete your profile to unlock more opportunities
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  A complete profile improves your visibility to families, enables better matching, and gives you access to the hiring marketplace.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 bg-white rounded-lg p-4 border-l-4 border-blue-600">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Get better matches with a complete profile
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Providers can better understand your needs with detailed
                  information about your loved one.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expandable Items List */}
      {incompleteItems.length > 0 && (
        <div className="border-t border-primary-200">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-6 py-3 flex items-center justify-between hover:bg-white/50 transition"
          >
            <span className="text-sm font-medium text-gray-700">
              {expanded ? "Hide" : "Show"} incomplete items (
              {incompleteItems.length})
            </span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {expanded && (
            <div className="px-6 pb-4 space-y-2">
              {incompleteItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg"
                >
                  <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 mt-0.5"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CTA Button */}
      <div className="px-6 pb-6 pt-2">
        <Link
          href={profileUrl}
          className="block w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition shadow-md hover:shadow-lg"
        >
          Complete Your Profile
        </Link>
      </div>
    </div>
  );
}
