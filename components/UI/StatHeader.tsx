"use client";

import { ReactNode } from "react";
import Link from "next/link";

/**
 * StatHeader - Compact stat cards for dashboard headers
 *
 * Used in: Care Profile, Provider Profile, Leads, Requests pages
 */

interface StatCardProps {
  value: string | number;
  label: string;
  icon?: ReactNode;
  href?: string;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  color?: "default" | "primary" | "success" | "warning" | "error";
}

const colorStyles = {
  default: {
    bg: "bg-white",
    icon: "bg-gray-100 text-gray-600",
    value: "text-gray-900",
  },
  primary: {
    bg: "bg-white",
    icon: "bg-primary-100 text-primary-600",
    value: "text-primary-600",
  },
  success: {
    bg: "bg-white",
    icon: "bg-emerald-100 text-emerald-600",
    value: "text-emerald-600",
  },
  warning: {
    bg: "bg-white",
    icon: "bg-amber-100 text-amber-600",
    value: "text-amber-600",
  },
  error: {
    bg: "bg-white",
    icon: "bg-red-100 text-red-600",
    value: "text-red-600",
  },
};

const trendColors = {
  up: "text-emerald-600",
  down: "text-red-600",
  neutral: "text-gray-500",
};

function StatCard({ value, label, icon, href, trend, color = "default" }: StatCardProps) {
  const styles = colorStyles[color];

  const content = (
    <div className={`${styles.bg} rounded-xl border border-gray-200 p-4 lg:p-5 ${href ? "hover:border-primary-300 hover:shadow-md transition-all cursor-pointer" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className={`text-2xl lg:text-3xl font-bold ${styles.value} tabular-nums`}>
            {value}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {label}
          </div>
          {trend && (
            <div className={`text-xs font-medium mt-1 flex items-center gap-1 ${trendColors[trend.direction]}`}>
              {trend.direction === "up" && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {trend.direction === "down" && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              {trend.value}
            </div>
          )}
        </div>
        {icon && (
          <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${styles.icon}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

interface StatHeaderProps {
  stats: StatCardProps[];
  className?: string;
}

export default function StatHeader({ stats, className = "" }: StatHeaderProps) {
  const gridCols = stats.length === 2
    ? "grid-cols-2"
    : stats.length === 3
    ? "grid-cols-2 lg:grid-cols-3"
    : "grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid ${gridCols} gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}

// Export the individual card for custom layouts
export { StatCard };

/**
 * Inline stat display for hero sections
 */
export function InlineStats({ stats, variant = "light" }: { stats: StatCardProps[]; variant?: "light" | "dark" }) {
  const textColor = variant === "dark" ? "text-white" : "text-primary-600";
  const labelColor = variant === "dark" ? "text-gray-300" : "text-gray-600";

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-10">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className={`text-2xl lg:text-3xl font-bold ${textColor}`}>
            {stat.value}
          </div>
          <div className={`text-sm ${labelColor}`}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
