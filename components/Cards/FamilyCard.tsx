"use client";

import { useState } from "react";
import Link from "next/link";

export interface FamilyCardProps {
  profile: {
    id: string;
    user: {
      name: string;
      email?: string;
    };
    profilePhoto?: string | null;
    lovedOneName?: string | null;
    careTypes: string[];
    city: string;
    state: string;
    budgetMin?: number | null;
    budgetMax?: number | null;
    timeline?: string | null;
    description?: string | null;
    createdAt: string;
  };
  hasRequest?: boolean;
  requestId?: string;
  isSaved?: boolean;
  onSave?: (profileId: string) => void;
  variant?: "default" | "compact";
  className?: string;
}

export default function FamilyCard({
  profile,
  hasRequest = false,
  requestId,
  isSaved = false,
  onSave,
  variant = "default",
  className = "",
}: FamilyCardProps) {
  const [imageError, setImageError] = useState(false);

  // Format care type for display
  const formatCareType = (type: string) => {
    return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Format budget range
  const formatBudget = (min: number | null | undefined, max: number | null | undefined) => {
    if (!min && !max) return "Budget flexible";
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}/mo`;
    if (min) return `$${min.toLocaleString()}+/mo`;
    if (max) return `Up to $${max.toLocaleString()}/mo`;
    return "Budget flexible";
  };

  // Get timeline badge styling based on urgency
  const getTimelineBadgeClasses = (timeline: string | null | undefined) => {
    if (!timeline) return "bg-gray-100 text-gray-700";
    const lower = timeline.toLowerCase();
    if (lower.includes("immediate") || lower.includes("asap") || lower.includes("urgent")) {
      return "bg-red-100 text-red-700 border-red-200";
    }
    if (lower.includes("1-2 weeks") || lower.includes("soon") || lower.includes("within")) {
      return "bg-orange-100 text-orange-700 border-orange-200";
    }
    if (lower.includes("1-3 months") || lower.includes("month")) {
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  // Calculate days since profile was created
  const daysSincePosted = Math.floor(
    (Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Get display name (first name only for privacy)
  const displayName = profile.user.name?.split(" ")[0] || "Family";
  const lovedOneDisplay = profile.lovedOneName
    ? profile.lovedOneName === "Self"
      ? "themselves"
      : profile.lovedOneName.split(" ")[0]
    : null;

  // Get initials for avatar
  const initials = displayName.charAt(0).toUpperCase();

  const linkHref = hasRequest && requestId
    ? `/provider/requests/${requestId}`
    : `/provider/leads/${profile.id}`;

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-200 ${className}`}>
      {/* Header with Profile Photo */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 border-b border-primary-200">
        <div className="flex items-start gap-4">
          {/* Profile Photo */}
          <div className="flex-shrink-0">
            {profile.profilePhoto && !imageError ? (
              <img
                src={profile.profilePhoto}
                alt=""
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center border-2 border-white shadow-md">
                <span className="text-xl font-bold text-white">{initials}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">
              {displayName}
              {lovedOneDisplay && (
                <span className="font-normal text-gray-600">
                  {" "}seeking care for {lovedOneDisplay}
                </span>
              )}
              {!lovedOneDisplay && "'s Family"}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <svg className="w-4 h-4 text-primary-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{profile.city}, {profile.state}</span>
              <span className="text-gray-400">•</span>
              <span>{daysSincePosted === 0 ? "Today" : `${daysSincePosted}d ago`}</span>
            </div>
          </div>

          {/* Save Button */}
          {onSave && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSave(profile.id);
              }}
              className="p-2 rounded-full hover:bg-white/50 transition-colors flex-shrink-0"
              title={isSaved ? "Remove from saved" : "Save for later"}
            >
              <svg
                className={`w-5 h-5 ${isSaved ? "text-red-500 fill-current" : "text-gray-500 hover:text-red-500"}`}
                viewBox="0 0 24 24"
                fill={isSaved ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5">
        {/* Budget and Timeline Row */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Budget</p>
            <p className="text-lg font-bold text-primary-600">
              {formatBudget(profile.budgetMin, profile.budgetMax)}
            </p>
          </div>
          {profile.timeline && (
            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border ${getTimelineBadgeClasses(profile.timeline)}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {profile.timeline}
            </span>
          )}
        </div>

        {/* Care Types */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Care Types Needed
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.careTypes.map((type) => (
              <span
                key={type}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatCareType(type)}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        {profile.description && variant === "default" && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Additional Details
            </p>
            <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
              {profile.description}
            </p>
          </div>
        )}

        {/* Request Status */}
        {hasRequest && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 text-sm bg-green-100 text-green-800 font-medium px-3 py-1.5 rounded-lg border border-green-200">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Request Sent
            </span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t border-gray-100">
          <Link
            href={linkHref}
            target={hasRequest ? undefined : "_blank"}
            rel={hasRequest ? undefined : "noopener noreferrer"}
            className={`flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg font-semibold text-center transition-all shadow-sm hover:shadow-md ${
              hasRequest
                ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                : "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white"
            }`}
          >
            {hasRequest ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                View Conversation
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Details
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
