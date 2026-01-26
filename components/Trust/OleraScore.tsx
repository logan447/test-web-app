"use client";

import { useState } from "react";
import {
  calculateOleraScore,
  OleraScoreInput,
  OleraScoreResult,
  ScoreTier,
  ScoreBadge,
} from "@/lib/oleraScore";

interface OleraScoreProps {
  // Provider data for score calculation
  provider: OleraScoreInput['provider'];
  averageRating: number | null;
  reviewCount: number;
  googleRating?: number | null;

  // Display options
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
  showBreakdown?: boolean;
  showBadges?: boolean;
  className?: string;
}

const sizeStyles = {
  small: {
    container: "w-10 h-10",
    score: "text-sm font-bold",
    label: "text-xs",
    bar: "h-1",
    badge: "text-[10px] px-1.5 py-0.5",
  },
  medium: {
    container: "w-14 h-14",
    score: "text-base font-bold",
    label: "text-sm",
    bar: "h-1.5",
    badge: "text-xs px-2 py-0.5",
  },
  large: {
    container: "w-20 h-20",
    score: "text-xl font-bold",
    label: "text-base",
    bar: "h-2",
    badge: "text-xs px-2 py-1",
  },
};

const tierColors: Record<ScoreTier, {
  bg: string;
  bgLight: string;
  text: string;
  fill: string;
  ring: string;
  border: string;
}> = {
  exceptional: {
    bg: "bg-emerald-500",
    bgLight: "bg-emerald-50",
    text: "text-emerald-700",
    fill: "bg-emerald-500",
    ring: "ring-emerald-200",
    border: "border-emerald-200",
  },
  excellent: {
    bg: "bg-blue-500",
    bgLight: "bg-blue-50",
    text: "text-blue-700",
    fill: "bg-blue-500",
    ring: "ring-blue-200",
    border: "border-blue-200",
  },
  very_good: {
    bg: "bg-teal-500",
    bgLight: "bg-teal-50",
    text: "text-teal-700",
    fill: "bg-teal-500",
    ring: "ring-teal-200",
    border: "border-teal-200",
  },
  good: {
    bg: "bg-amber-500",
    bgLight: "bg-amber-50",
    text: "text-amber-700",
    fill: "bg-amber-500",
    ring: "ring-amber-200",
    border: "border-amber-200",
  },
  fair: {
    bg: "bg-orange-500",
    bgLight: "bg-orange-50",
    text: "text-orange-700",
    fill: "bg-orange-500",
    ring: "ring-orange-200",
    border: "border-orange-200",
  },
  limited_data: {
    bg: "bg-gray-400",
    bgLight: "bg-gray-50",
    text: "text-gray-600",
    fill: "bg-gray-400",
    ring: "ring-gray-200",
    border: "border-gray-200",
  },
  no_data: {
    bg: "bg-gray-300",
    bgLight: "bg-gray-50",
    text: "text-gray-500",
    fill: "bg-gray-300",
    ring: "ring-gray-100",
    border: "border-gray-100",
  },
};

const badgeColors: Record<ScoreBadge['type'], { bg: string; text: string }> = {
  new_provider: { bg: "bg-blue-100", text: "text-blue-700" },
  incomplete_profile: { bg: "bg-orange-100", text: "text-orange-700" },
  unclaimed: { bg: "bg-amber-100", text: "text-amber-700" },
  no_reviews: { bg: "bg-blue-100", text: "text-blue-700" },
};

export default function OleraScore({
  provider,
  averageRating,
  reviewCount,
  googleRating,
  size = "medium",
  showLabel = true,
  showBreakdown = false,
  showBadges = true,
  className = "",
}: OleraScoreProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate the score
  const result = calculateOleraScore({
    averageRating,
    googleRating,
    reviewCount,
    provider,
  });

  const styles = sizeStyles[size];
  const colors = tierColors[result.tier];

  // Format score for display
  const displayScore = result.score !== null ? result.score.toFixed(1) : "—";

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-3">
        {/* Circular Score Badge */}
        <div
          className={`${styles.container} ${colors.bgLight} rounded-full flex items-center justify-center ring-2 ${colors.ring} cursor-help relative`}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          aria-label={`Olera Score: ${displayScore} out of 5. ${result.label}`}
        >
          <div className="flex flex-col items-center">
            <span className={`${styles.score} ${colors.text}`}>{displayScore}</span>
            {size !== "small" && (
              <span className="text-[10px] text-gray-400">/5</span>
            )}
          </div>

          {/* Star icon for exceptional */}
          {result.tier === "exceptional" && (
            <div className="absolute -top-1 -right-1">
              <span className="text-yellow-500 text-sm">⭐</span>
            </div>
          )}
        </div>

        {/* Label and Description */}
        {showLabel && (
          <div className="flex flex-col">
            <span className={`${styles.label} font-semibold ${colors.text}`}>
              {result.label}
            </span>
            {size === "large" && result.score !== null && (
              <span className="text-xs text-gray-500">
                Based on {reviewCount} review{reviewCount !== 1 ? "s" : ""} &amp; profile
              </span>
            )}
          </div>
        )}
      </div>

      {/* Badges */}
      {showBadges && result.badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {result.badges.map((badge, index) => (
            <span
              key={index}
              className={`${styles.badge} ${badgeColors[badge.type].bg} ${badgeColors[badge.type].text} rounded-full font-medium`}
            >
              {badge.label}
            </span>
          ))}
        </div>
      )}

      {/* Breakdown */}
      {showBreakdown && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-xs font-medium text-gray-700 mb-2">Score Breakdown</p>

          {/* Reviews component */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Reviews</span>
              <span className={result.breakdown.or !== null ? colors.text : "text-gray-400"}>
                {result.breakdown.or !== null
                  ? `${result.breakdown.or.toFixed(1)}/5`
                  : "No reviews"}
              </span>
            </div>
            <div className={`w-full bg-gray-200 rounded-full ${styles.bar}`}>
              <div
                className={`${result.breakdown.or !== null ? colors.fill : "bg-gray-300"} ${styles.bar} rounded-full transition-all duration-500`}
                style={{ width: `${((result.breakdown.or ?? 0) / 5) * 100}%` }}
              />
            </div>

            {/* Google Reviews (if available) */}
            {result.breakdown.gr !== null && (
              <>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-gray-600">Google Reviews</span>
                  <span className={colors.text}>{result.breakdown.gr.toFixed(1)}/5</span>
                </div>
                <div className={`w-full bg-gray-200 rounded-full ${styles.bar}`}>
                  <div
                    className={`${colors.fill} ${styles.bar} rounded-full transition-all duration-500`}
                    style={{ width: `${(result.breakdown.gr / 5) * 100}%` }}
                  />
                </div>
              </>
            )}

            {/* Profile Completeness */}
            <div className="flex items-center justify-between text-xs mt-2">
              <span className="text-gray-600">Profile Complete</span>
              <span className={result.breakdown.pcPercentage >= 70 ? "text-emerald-600" : "text-gray-500"}>
                {result.breakdown.pcPercentage}%
              </span>
            </div>
            <div className={`w-full bg-gray-200 rounded-full ${styles.bar}`}>
              <div
                className={`${result.breakdown.pcPercentage >= 70 ? "bg-emerald-500" : "bg-gray-400"} ${styles.bar} rounded-full transition-all duration-500`}
                style={{ width: `${result.breakdown.pcPercentage}%` }}
              />
            </div>
          </div>

          {/* Weight info */}
          <p className="text-[10px] text-gray-400 mt-3">
            Weights: Reviews {Math.round(result.breakdown.weights.or * 100)}%
            {result.breakdown.weights.gr > 0 && `, Google ${Math.round(result.breakdown.weights.gr * 100)}%`}
            , Profile {Math.round(result.breakdown.weights.pc * 100)}%
          </p>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-0 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg max-w-xs whitespace-pre-line">
          {result.tooltip}
          <div className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
        </div>
      )}
    </div>
  );
}

/**
 * Compact inline version for cards
 */
export function OleraScoreBadge({
  provider,
  averageRating,
  reviewCount,
  googleRating,
  className = "",
}: Omit<OleraScoreProps, "size" | "showLabel" | "showBreakdown" | "showBadges">) {
  const result = calculateOleraScore({
    averageRating,
    googleRating,
    reviewCount,
    provider,
  });

  const colors = tierColors[result.tier];
  const displayScore = result.score !== null ? result.score.toFixed(1) : "—";

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${colors.bgLight} border ${colors.border} ${className}`}
      title={result.tooltip}
    >
      <div className={`w-5 h-5 rounded-full ${colors.bg} flex items-center justify-center`}>
        <span className="text-[10px] font-bold text-white">{displayScore}</span>
      </div>
      <span className={`text-xs font-medium ${colors.text}`}>{result.label}</span>
      {result.tier === "exceptional" && <span className="text-xs">⭐</span>}
    </div>
  );
}

/**
 * Minimal version showing just the score number
 */
export function OleraScoreNumber({
  provider,
  averageRating,
  reviewCount,
  googleRating,
  className = "",
}: Omit<OleraScoreProps, "size" | "showLabel" | "showBreakdown" | "showBadges">) {
  const result = calculateOleraScore({
    averageRating,
    googleRating,
    reviewCount,
    provider,
  });

  const colors = tierColors[result.tier];
  const displayScore = result.score !== null ? result.score.toFixed(1) : "—";

  return (
    <span
      className={`${colors.text} font-semibold ${className}`}
      title={result.tooltip}
    >
      {displayScore}
    </span>
  );
}
