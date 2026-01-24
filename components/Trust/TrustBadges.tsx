"use client";

interface TrustBadgesProps {
  verified?: boolean;
  licensed?: boolean;
  insuranceVerified?: boolean;
  backgroundChecked?: boolean;
  claimed?: boolean;
  size?: "small" | "medium" | "large";
  variant?: "badges" | "compact" | "inline";
  showLabels?: boolean;
  className?: string;
}

const badgeConfigs = {
  verified: {
    label: "Verified",
    shortLabel: "Verified",
    color: "blue",
    icon: (
      <path
        fillRule="evenodd"
        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    ),
  },
  licensed: {
    label: "Licensed",
    shortLabel: "Licensed",
    color: "emerald",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  insuranceVerified: {
    label: "Insurance Verified",
    shortLabel: "Insured",
    color: "purple",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    ),
  },
  backgroundChecked: {
    label: "Background Checked",
    shortLabel: "BG Check",
    color: "teal",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    ),
  },
  claimed: {
    label: "Claimed Profile",
    shortLabel: "Claimed",
    color: "amber",
    icon: (
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    ),
  },
};

const colorClasses = {
  blue: {
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    icon: "text-blue-600",
    dot: "bg-blue-500",
  },
  emerald: {
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: "text-emerald-600",
    dot: "bg-emerald-500",
  },
  purple: {
    badge: "bg-purple-100 text-purple-700 border-purple-200",
    icon: "text-purple-600",
    dot: "bg-purple-500",
  },
  teal: {
    badge: "bg-teal-100 text-teal-700 border-teal-200",
    icon: "text-teal-600",
    dot: "bg-teal-500",
  },
  amber: {
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    icon: "text-amber-600",
    dot: "bg-amber-500",
  },
};

const sizeClasses = {
  small: {
    badge: "px-2 py-0.5 text-xs",
    icon: "w-3 h-3",
    gap: "gap-1",
  },
  medium: {
    badge: "px-2.5 py-1 text-xs",
    icon: "w-4 h-4",
    gap: "gap-1.5",
  },
  large: {
    badge: "px-3 py-1.5 text-sm",
    icon: "w-5 h-5",
    gap: "gap-2",
  },
};

export default function TrustBadges({
  verified = false,
  licensed = false,
  insuranceVerified = false,
  backgroundChecked = false,
  claimed = false,
  size = "medium",
  variant = "badges",
  showLabels = true,
  className = "",
}: TrustBadgesProps) {
  const activeBadges = [
    { key: "verified", active: verified },
    { key: "licensed", active: licensed },
    { key: "insuranceVerified", active: insuranceVerified },
    { key: "backgroundChecked", active: backgroundChecked },
    { key: "claimed", active: claimed },
  ].filter((b) => b.active);

  if (activeBadges.length === 0) return null;

  const sizes = sizeClasses[size];

  if (variant === "compact") {
    // Compact: Just colored dots with tooltip-style info
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {activeBadges.map(({ key }) => {
          const config = badgeConfigs[key as keyof typeof badgeConfigs];
          const colors = colorClasses[config.color as keyof typeof colorClasses];
          return (
            <div
              key={key}
              className={`${colors.dot} w-2 h-2 rounded-full`}
              title={config.label}
            />
          );
        })}
        <span className="text-xs text-gray-500">
          {activeBadges.length} verification{activeBadges.length !== 1 ? "s" : ""}
        </span>
      </div>
    );
  }

  if (variant === "inline") {
    // Inline: Icon-only badges in a row
    return (
      <div className={`flex items-center ${sizes.gap} ${className}`}>
        {activeBadges.map(({ key }) => {
          const config = badgeConfigs[key as keyof typeof badgeConfigs];
          const colors = colorClasses[config.color as keyof typeof colorClasses];
          const isFilled = key === "verified" || key === "claimed";
          return (
            <div
              key={key}
              className={`${colors.icon} flex items-center justify-center`}
              title={config.label}
            >
              <svg
                className={sizes.icon}
                fill={isFilled ? "currentColor" : "none"}
                viewBox="0 0 20 20"
                stroke={isFilled ? "none" : "currentColor"}
              >
                {config.icon}
              </svg>
            </div>
          );
        })}
      </div>
    );
  }

  // Default: Full badges with labels
  return (
    <div className={`flex flex-wrap items-center ${sizes.gap} ${className}`}>
      {activeBadges.map(({ key }) => {
        const config = badgeConfigs[key as keyof typeof badgeConfigs];
        const colors = colorClasses[config.color as keyof typeof colorClasses];
        const isFilled = key === "verified" || key === "claimed";
        return (
          <span
            key={key}
            className={`inline-flex items-center ${sizes.gap} ${sizes.badge} ${colors.badge} rounded-full font-medium border`}
          >
            <svg
              className={sizes.icon}
              fill={isFilled ? "currentColor" : "none"}
              viewBox="0 0 20 20"
              stroke={isFilled ? "none" : "currentColor"}
            >
              {config.icon}
            </svg>
            {showLabels && (
              <span>{size === "small" ? config.shortLabel : config.label}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

// Calculate trust score based on verifications (0-100)
export function calculateTrustScore(props: {
  verified?: boolean;
  licensed?: boolean;
  insuranceVerified?: boolean;
  backgroundChecked?: boolean;
  claimed?: boolean;
  averageRating?: number | null;
  reviewCount?: number;
}): number {
  let score = 0;

  // Verification badges (50 points total)
  if (props.verified) score += 15;
  if (props.licensed) score += 10;
  if (props.insuranceVerified) score += 10;
  if (props.backgroundChecked) score += 10;
  if (props.claimed) score += 5;

  // Rating contribution (30 points)
  if (props.averageRating) {
    score += (props.averageRating / 5) * 30;
  }

  // Review count (20 points)
  if (props.reviewCount) {
    score += Math.min(props.reviewCount * 2, 20);
  }

  return Math.round(Math.min(score, 100));
}

// Get trust level label
export function getTrustLevel(score: number): {
  level: string;
  color: string;
  description: string;
} {
  if (score >= 80) {
    return {
      level: "Highly Trusted",
      color: "emerald",
      description: "This provider has excellent verification and reviews",
    };
  } else if (score >= 60) {
    return {
      level: "Well Verified",
      color: "blue",
      description: "This provider has good verification status",
    };
  } else if (score >= 40) {
    return {
      level: "Partially Verified",
      color: "amber",
      description: "This provider has some verifications",
    };
  } else {
    return {
      level: "Limited Info",
      color: "gray",
      description: "Limited verification information available",
    };
  }
}
