"use client";

import Link from "next/link";
import { ReactNode } from "react";

/**
 * UnifiedCard - Base card component providing consistent styling
 * Used as a wrapper by ProviderCard and FamilyCard for visual consistency
 */

export interface UnifiedCardProps {
  children: ReactNode;
  href?: string;
  variant?: "default" | "compact";
  className?: string;
  onClick?: () => void;
  openInNewTab?: boolean;
}

export default function UnifiedCard({
  children,
  href,
  variant = "default",
  className = "",
  onClick,
  openInNewTab = false,
}: UnifiedCardProps) {
  const baseClasses = `
    bg-white rounded-xl border border-gray-200 overflow-hidden
    shadow-sm hover:shadow-md hover:border-primary-200
    transition-all duration-200
    ${variant === "compact" ? "p-4" : ""}
    ${className}
  `.trim().replace(/\s+/g, " ");

  if (href) {
    return (
      <Link
        href={href}
        target={openInNewTab ? "_blank" : undefined}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
        className={`block ${baseClasses}`}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`w-full text-left ${baseClasses}`}
      >
        {children}
      </button>
    );
  }

  return <div className={baseClasses}>{children}</div>;
}

// Shared badge styles for consistency across cards
export const BadgeStyles = {
  // Primary type badges (provider types)
  primary: "bg-primary-100 text-primary-700",

  // Secondary type badges (care types, etc.)
  secondary: "bg-gray-100 text-gray-700",

  // Status badges
  success: "bg-green-100 text-green-700 border border-green-200",
  warning: "bg-amber-100 text-amber-700 border border-amber-200",
  info: "bg-blue-100 text-blue-700 border border-blue-200",
  error: "bg-red-100 text-red-700 border border-red-200",

  // Specialty care badges
  memoryCare: "bg-purple-50 text-purple-700 border border-purple-200",
  respiteCare: "bg-green-50 text-green-700 border border-green-200",
  hospiceCare: "bg-blue-50 text-blue-700 border border-blue-200",

  // Verified/claimed badge
  verified: "bg-primary-600 text-white",

  // Urgency badges (for timeline)
  urgent: "bg-red-100 text-red-700 border border-red-200",
  soon: "bg-orange-100 text-orange-700 border border-orange-200",
  flexible: "bg-blue-100 text-blue-700 border border-blue-200",
};

// Shared CTA button styles
export const CTAStyles = {
  primary: `
    inline-flex items-center justify-center gap-2
    px-4 py-2.5 rounded-lg font-semibold
    bg-primary-600 text-white
    hover:bg-primary-700 transition-colors
    shadow-sm hover:shadow-md
  `.trim().replace(/\s+/g, " "),

  secondary: `
    inline-flex items-center justify-center gap-2
    px-4 py-2.5 rounded-lg font-semibold
    bg-gray-100 text-gray-700
    hover:bg-gray-200 transition-colors
  `.trim().replace(/\s+/g, " "),

  success: `
    inline-flex items-center justify-center gap-2
    px-4 py-2.5 rounded-lg font-semibold
    bg-green-600 text-white
    hover:bg-green-700 transition-colors
    shadow-sm hover:shadow-md
  `.trim().replace(/\s+/g, " "),

  outline: `
    inline-flex items-center justify-center gap-2
    px-4 py-2.5 rounded-lg font-semibold
    border border-primary-600 text-primary-600
    hover:bg-primary-50 transition-colors
  `.trim().replace(/\s+/g, " "),
};

// Save button component for consistency
export function SaveButton({
  isSaved,
  onSave,
  size = "md",
}: {
  isSaved: boolean;
  onSave: () => void;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-2.5",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSave();
      }}
      className={`${sizeClasses[size]} rounded-full bg-white/90 hover:bg-white shadow-sm transition-colors`}
      title={isSaved ? "Remove from saved" : "Save"}
    >
      <svg
        className={`${iconSizes[size]} ${isSaved ? "text-red-500 fill-current" : "text-gray-600"}`}
        viewBox="0 0 24 24"
        fill={isSaved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}

// Rating display component for consistency
export function RatingDisplay({
  rating,
  reviewCount,
  size = "md",
}: {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: { star: "w-4 h-4", text: "text-sm", review: "text-xs" },
    md: { star: "w-5 h-5", text: "text-base font-semibold", review: "text-sm" },
    lg: { star: "w-6 h-6", text: "text-lg font-bold", review: "text-sm" },
  };

  return (
    <div className="flex items-center gap-1">
      <svg className={`${sizes[size].star} text-yellow-400 fill-current`} viewBox="0 0 20 20">
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
      </svg>
      <span className={`${sizes[size].text} text-gray-900`}>{rating.toFixed(1)}</span>
      {reviewCount !== undefined && reviewCount > 0 && (
        <span className={`${sizes[size].review} text-gray-500`}>({reviewCount})</span>
      )}
    </div>
  );
}

// Location display component for consistency
export function LocationDisplay({
  city,
  state,
  address,
  size = "md",
}: {
  city: string;
  state: string;
  address?: string;
  size?: "sm" | "md";
}) {
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <p className={`${textSize} text-gray-600 flex items-center gap-1`}>
      <svg className={`${iconSize} flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span>{address ? `${address}, ` : ""}{city}, {state}</span>
    </p>
  );
}

// Badge component for consistent badge styling
export function Badge({
  children,
  variant = "secondary",
  size = "md",
  icon,
}: {
  children: ReactNode;
  variant?: keyof typeof BadgeStyles;
  size?: "sm" | "md";
  icon?: ReactNode;
}) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";

  return (
    <span className={`inline-flex items-center gap-1 ${sizeClasses} font-medium rounded-md ${BadgeStyles[variant]}`}>
      {icon}
      {children}
    </span>
  );
}
