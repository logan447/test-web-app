"use client";

import { useState } from "react";
import Link from "next/link";

interface FamilyProfile {
  id: string;
  user: {
    name: string;
    email: string;
    phone: string | null;
  };
  careTypes: string[];
  location: string;
  city: string;
  state: string;
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string | null;
  description: string | null;
  createdAt: string;
  isSaved?: boolean;
}

interface EnhancedFamilyCardProps {
  profile: FamilyProfile;
  isSaved: boolean;
  hasRequest: boolean;
  requestId?: string;
  onToggleSave: (profileId: string) => void;
}

export default function EnhancedFamilyCard({
  profile,
  isSaved,
  hasRequest,
  requestId,
  onToggleSave,
}: EnhancedFamilyCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatCareType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return "Budget not specified";
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}/mo`;
    if (min) return `$${min.toLocaleString()}+/mo`;
    if (max) return `Up to $${max.toLocaleString()}/mo`;
    return "Budget not specified";
  };

  const getTimelineBadgeColor = (timeline: string | null) => {
    if (!timeline) return "bg-gray-100 text-gray-700";
    const lower = timeline.toLowerCase();
    if (lower.includes("immediate") || lower.includes("asap")) {
      return "bg-red-100 text-red-700 border-red-200";
    }
    if (lower.includes("1-2 weeks") || lower.includes("soon")) {
      return "bg-orange-100 text-orange-700 border-orange-200";
    }
    if (lower.includes("1-3 months")) {
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  const daysSincePosted = Math.floor(
    (Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group">
      {/* Header with Location and Status */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 border-b border-primary-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <svg
                className="w-5 h-5 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <h3 className="text-lg font-bold text-gray-900">
                {profile.city}, {profile.state}
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              Posted {daysSincePosted === 0 ? "today" : `${daysSincePosted} day${daysSincePosted > 1 ? "s" : ""} ago`}
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={() => onToggleSave(profile.id)}
            className="p-2 rounded-full hover:bg-white/50 transition-colors"
            title={isSaved ? "Remove from saved" : "Save for later"}
          >
            {isSaved ? (
              <svg className="w-6 h-6 text-red-500 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        {/* Budget and Timeline */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <div>
            <p className="text-sm text-gray-600 mb-1">Budget</p>
            <p className="text-xl font-bold text-primary-600">
              {formatBudget(profile.budgetMin, profile.budgetMax)}
            </p>
          </div>
          {profile.timeline && (
            <div>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border ${getTimelineBadgeColor(profile.timeline)}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {profile.timeline}
              </span>
            </div>
          )}
        </div>

        {/* Care Types */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Care Types Needed:</p>
          <div className="flex flex-wrap gap-2">
            {profile.careTypes.map((type) => (
              <span
                key={type}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {formatCareType(type)}
              </span>
            ))}
          </div>
        </div>

        {/* Description Preview */}
        {profile.description && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-1">Additional Details:</p>
            <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
              {profile.description}
            </p>
          </div>
        )}

        {/* Request Status Badge */}
        {hasRequest && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 text-sm bg-green-100 text-green-800 font-medium px-3 py-1.5 rounded-lg border border-green-200">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Request Sent
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          {hasRequest && requestId ? (
            <Link
              href={`/provider/requests/${requestId}`}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 font-semibold text-center transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              View Conversation
            </Link>
          ) : (
            <Link
              href={`/provider/leads/${profile.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 font-semibold text-center transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
