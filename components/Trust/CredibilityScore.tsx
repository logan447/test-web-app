"use client";

import { calculateTrustScore, getTrustLevel } from "./TrustBadges";

interface CredibilityScoreProps {
  verified?: boolean;
  licensed?: boolean;
  insuranceVerified?: boolean;
  backgroundChecked?: boolean;
  claimed?: boolean;
  averageRating?: number | null;
  reviewCount?: number;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
  showBreakdown?: boolean;
  className?: string;
}

const sizeStyles = {
  small: {
    container: "w-8 h-8",
    score: "text-xs font-bold",
    label: "text-xs",
    bar: "h-1",
  },
  medium: {
    container: "w-12 h-12",
    score: "text-sm font-bold",
    label: "text-sm",
    bar: "h-1.5",
  },
  large: {
    container: "w-16 h-16",
    score: "text-lg font-bold",
    label: "text-base",
    bar: "h-2",
  },
};

const colorClasses = {
  emerald: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    fill: "bg-emerald-500",
    ring: "ring-emerald-200",
  },
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    fill: "bg-blue-500",
    ring: "ring-blue-200",
  },
  amber: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    fill: "bg-amber-500",
    ring: "ring-amber-200",
  },
  gray: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    fill: "bg-gray-400",
    ring: "ring-gray-200",
  },
};

export default function CredibilityScore({
  verified = false,
  licensed = false,
  insuranceVerified = false,
  backgroundChecked = false,
  claimed = false,
  averageRating = null,
  reviewCount = 0,
  size = "medium",
  showLabel = true,
  showBreakdown = false,
  className = "",
}: CredibilityScoreProps) {
  const score = calculateTrustScore({
    verified,
    licensed,
    insuranceVerified,
    backgroundChecked,
    claimed,
    averageRating,
    reviewCount,
  });

  const { level, color, description } = getTrustLevel(score);
  const styles = sizeStyles[size];
  const colors = colorClasses[color as keyof typeof colorClasses];

  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        {/* Circular Score Badge */}
        <div
          className={`${styles.container} ${colors.bg} rounded-full flex items-center justify-center ring-2 ${colors.ring}`}
          title={`Trust Score: ${score}/100 - ${description}`}
        >
          <span className={`${styles.score} ${colors.text}`}>{score}</span>
        </div>

        {/* Label and Description */}
        {showLabel && (
          <div className="flex flex-col">
            <span className={`${styles.label} font-semibold ${colors.text}`}>
              {level}
            </span>
            {size === "large" && (
              <span className="text-xs text-gray-500">{description}</span>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {showBreakdown && (
        <div className="mt-3 space-y-2">
          <div className={`w-full bg-gray-200 rounded-full ${styles.bar}`}>
            <div
              className={`${colors.fill} ${styles.bar} rounded-full transition-all duration-500`}
              style={{ width: `${score}%` }}
            />
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${verified ? "bg-blue-500" : "bg-gray-300"}`}
              />
              Verified Profile
            </div>
            <div className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${licensed ? "bg-emerald-500" : "bg-gray-300"}`}
              />
              Licensed
            </div>
            <div className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${insuranceVerified ? "bg-purple-500" : "bg-gray-300"}`}
              />
              Insurance Verified
            </div>
            <div className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${backgroundChecked ? "bg-teal-500" : "bg-gray-300"}`}
              />
              Background Checked
            </div>
            <div className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${(averageRating ?? 0) >= 4 ? "bg-yellow-500" : "bg-gray-300"}`}
              />
              High Rating
            </div>
            <div className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${(reviewCount ?? 0) >= 5 ? "bg-pink-500" : "bg-gray-300"}`}
              />
              Multiple Reviews
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact inline version for cards
export function CredibilityBadge({
  score,
  className = "",
}: {
  score: number;
  className?: string;
}) {
  const { level, color } = getTrustLevel(score);
  const colors = colorClasses[color as keyof typeof colorClasses];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${colors.bg} ${className}`}
      title={`Trust Score: ${score}/100`}
    >
      <div className={`w-4 h-4 rounded-full ${colors.fill} flex items-center justify-center`}>
        <span className="text-[10px] font-bold text-white">{score}</span>
      </div>
      <span className={`text-xs font-medium ${colors.text}`}>{level}</span>
    </div>
  );
}
