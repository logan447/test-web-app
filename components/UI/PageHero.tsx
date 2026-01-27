"use client";

import { ReactNode } from "react";

/**
 * PageHero - Standardized hero section component
 *
 * Variants:
 * - primary: Teal gradient (default for most pages)
 * - soft: Calm light background with subtle border — preferred for 65+ audience
 * - light: White/gray gradient (homepage style)
 * - dark: Dark gradient (provider CTA sections)
 * - minimal: No gradient, just padding
 */

interface StatItem {
  value: string | number;
  label: string;
  suffix?: string;
}

interface PageHeroProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  variant?: "primary" | "soft" | "light" | "dark" | "minimal";
  stats?: StatItem[];
  badge?: {
    text: string;
    variant?: "default" | "success" | "warning" | "info";
  };
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  className?: string;
  compact?: boolean;
}

const variantStyles = {
  primary: "bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white",
  soft: "bg-white border-b border-gray-200 text-gray-900",
  light: "bg-gradient-to-b from-white to-gray-50 text-gray-900",
  dark: "bg-gray-900 text-white",
  minimal: "bg-white text-gray-900",
};

const subtitleStyles = {
  primary: "text-primary-100",
  soft: "text-gray-500",
  light: "text-gray-600",
  dark: "text-gray-400",
  minimal: "text-gray-600",
};

const statStyles = {
  primary: {
    value: "text-white",
    label: "text-primary-200",
    suffix: "text-yellow-400",
  },
  soft: {
    value: "text-primary-700",
    label: "text-gray-500",
    suffix: "text-primary-500",
  },
  light: {
    value: "text-primary-600",
    label: "text-gray-600",
    suffix: "text-yellow-500",
  },
  dark: {
    value: "text-white",
    label: "text-gray-400",
    suffix: "text-yellow-400",
  },
  minimal: {
    value: "text-primary-600",
    label: "text-gray-600",
    suffix: "text-yellow-500",
  },
};

const badgeVariants = {
  default: "bg-white/20 text-white border-white/30",
  success: "bg-emerald-100 text-emerald-800 border-emerald-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  info: "bg-blue-100 text-blue-800 border-blue-200",
};

export default function PageHero({
  title,
  subtitle,
  children,
  variant = "primary",
  stats,
  badge,
  breadcrumb,
  actions,
  className = "",
  compact = false,
}: PageHeroProps) {
  const paddingClass = compact ? "py-8 lg:py-12" : "py-12 lg:py-16";

  return (
    <div className={`${variantStyles[variant]} ${paddingClass} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        {breadcrumb && (
          <div className="mb-4">
            {breadcrumb}
          </div>
        )}

        {/* Badge */}
        {badge && (
          <div className="mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${badgeVariants[badge.variant || "default"]}`}>
              {badge.text}
            </span>
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className={`text-lg ${subtitleStyles[variant]} max-w-2xl`}>
                {subtitle}
              </p>
            )}
          </div>

          {/* Actions */}
          {actions && (
            <div className="flex flex-wrap gap-3">
              {actions}
            </div>
          )}
        </div>

        {/* Custom children content */}
        {children && (
          <div className="mt-6">
            {children}
          </div>
        )}

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className={`mt-8 grid grid-cols-2 ${stats.length === 3 ? 'md:grid-cols-3' : stats.length >= 4 ? 'md:grid-cols-4' : ''} gap-6 lg:gap-8`}>
            {stats.map((stat, index) => (
              <div key={index} className="text-center lg:text-left">
                <div className={`text-2xl lg:text-3xl font-bold ${statStyles[variant].value}`}>
                  {stat.value}
                  {stat.suffix && (
                    <span className={statStyles[variant].suffix}>{stat.suffix}</span>
                  )}
                </div>
                <div className={`text-sm ${statStyles[variant].label}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact stat display for inline use
 */
export function StatBar({ stats, className = "" }: { stats: StatItem[]; className?: string }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-6 lg:gap-10 ${className}`}>
      {stats.map((stat, index) => (
        <div key={index} className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-primary-600">
            {stat.value}
            {stat.suffix && <span className="text-yellow-500">{stat.suffix}</span>}
          </span>
          <span className="text-sm text-gray-600">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
