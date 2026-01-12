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
    <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden group transform hover:-translate-y-1">
      {/* Header with Location and Status */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-5 relative overflow-hidden">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>

        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white leading-tight">
                  {profile.city}, {profile.state}
                </h3>
                <p className="text-xs text-white/90 font-medium mt-0.5">
                  Posted {daysSincePosted === 0 ? "today" : `${daysSincePosted} day${daysSincePosted > 1 ? "s" : ""} ago`}
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={() => onToggleSave(profile.id)}
            className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all hover:scale-110"
            title={isSaved ? "Remove from saved" : "Save for later"}
          >
            {isSaved ? (
              <svg className="w-6 h-6 text-white fill-current drop-shadow-lg" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-white hover:scale-110 transition-transform drop-shadow-lg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
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
        <div className="flex items-center justify-between mb-5 pb-5 border-b border-gray-100">
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">Budget Range</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatBudget(profile.budgetMin, profile.budgetMax)}
            </p>
          </div>
          {profile.timeline && (
            <div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border shadow-sm ${getTimelineBadgeColor(profile.timeline)}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {profile.timeline}
              </span>
            </div>
          )}
        </div>

        {/* Care Types */}
        <div className="mb-5">
          <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider flex items-center gap-2">
            <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Care Types Needed
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.careTypes.map((type) => (
              <span
                key={type}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-sm font-semibold rounded-xl border border-blue-200 shadow-sm"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {formatCareType(type)}
              </span>
            ))}
          </div>
        </div>

        {/* Description Preview */}
        {profile.description && (
          <div className="mb-5">
            <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Additional Details</p>
            <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
              {profile.description}
            </p>
          </div>
        )}

        {/* Request Status Badge */}
        {hasRequest && (
          <div className="mb-5">
            <span className="inline-flex items-center gap-2 text-sm bg-gradient-to-r from-green-50 to-green-100 text-green-800 font-bold px-4 py-2.5 rounded-xl border border-green-200 shadow-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
        <div className="pt-4 border-t border-gray-100">
          {hasRequest && requestId ? (
            <Link
              href={`/dashboard/requests/${requestId}`}
              className="flex items-center justify-center gap-2.5 w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3.5 rounded-xl hover:from-green-700 hover:to-green-800 font-bold text-center transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              View Conversation
            </Link>
          ) : (
            <Link
              href={`/provider/requests/${profile.id}`}
              className="flex items-center justify-center gap-2.5 w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3.5 rounded-xl hover:from-primary-700 hover:to-primary-800 font-bold text-center transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              Send Request
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
