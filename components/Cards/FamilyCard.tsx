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
      return "bg-red-50 text-red-700 border border-red-200";
    }
    if (lower.includes("1-2 weeks") || lower.includes("soon") || lower.includes("within")) {
      return "bg-orange-50 text-orange-700 border border-orange-200";
    }
    if (lower.includes("1-3 months") || lower.includes("month")) {
      return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    }
    return "bg-blue-50 text-blue-700 border border-blue-200";
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
    <div className={`group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-200 ${className}`}>
      <div className="flex flex-col sm:flex-row">
        {/* Profile Photo Section */}
        <div className="relative sm:w-40 h-40 sm:h-auto shrink-0 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
          {profile.profilePhoto && !imageError ? (
            <img
              src={profile.profilePhoto}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">{initials}</span>
            </div>
          )}

          {/* Request Sent Badge */}
          {hasRequest && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Contacted
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {/* Location */}
          <p className="text-sm text-gray-500 mb-1">
            {profile.city}, {profile.state}
          </p>

          {/* Name */}
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
            {displayName}
            {lovedOneDisplay && (
              <span className="font-normal text-gray-600">
                {" "}seeking care for {lovedOneDisplay}
              </span>
            )}
            {!lovedOneDisplay && "'s Family"}
          </h3>

          {/* Posted timestamp */}
          <p className="text-xs text-gray-400 mb-2">
            Posted {daysSincePosted === 0 ? "today" : `${daysSincePosted} day${daysSincePosted > 1 ? "s" : ""} ago`}
          </p>

          {/* Care Types Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {profile.careTypes.slice(0, 3).map((type) => (
              <span
                key={type}
                className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-200"
              >
                {formatCareType(type)}
              </span>
            ))}
            {profile.careTypes.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                +{profile.careTypes.length - 3} more
              </span>
            )}
          </div>

          {/* Description */}
          {profile.description && variant === "default" && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {profile.description}
            </p>
          )}

          {/* Budget and Timeline Row */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500">Budget</p>
              <p className="font-semibold text-gray-900">
                {formatBudget(profile.budgetMin, profile.budgetMax)}
              </p>
            </div>
            {profile.timeline && (
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getTimelineBadgeClasses(profile.timeline)}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {profile.timeline}
              </span>
            )}
          </div>

          {/* CTA Text */}
          <Link
            href={linkHref}
            className="mt-4 flex items-center text-sm font-medium text-primary-600"
          >
            <span>{hasRequest ? "View Conversation" : "View Details"}</span>
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Save Button (if enabled) */}
        {onSave && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSave(profile.id);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-colors"
            title={isSaved ? "Remove from saved" : "Save"}
          >
            <svg
              className={`w-5 h-5 ${isSaved ? "text-red-500 fill-current" : "text-gray-600"}`}
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
  );
}
