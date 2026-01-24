"use client";

import { getTrendIndicator } from "@/lib/analyticsUtils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: "primary" | "green" | "blue" | "yellow" | "red" | "gray";
  size?: "sm" | "md" | "lg";
}

export default function StatCard({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  icon,
  color = "primary",
  size = "md",
}: StatCardProps) {
  const trend = change !== undefined ? getTrendIndicator(change) : undefined;

  const colorStyles = {
    primary: {
      bg: "bg-primary-50",
      iconBg: "bg-primary-100",
      iconText: "text-primary-600",
      accent: "text-primary-600",
    },
    green: {
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      iconText: "text-green-600",
      accent: "text-green-600",
    },
    blue: {
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
      accent: "text-blue-600",
    },
    yellow: {
      bg: "bg-amber-50",
      iconBg: "bg-amber-100",
      iconText: "text-amber-600",
      accent: "text-amber-600",
    },
    red: {
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      iconText: "text-red-600",
      accent: "text-red-600",
    },
    gray: {
      bg: "bg-gray-50",
      iconBg: "bg-gray-100",
      iconText: "text-gray-600",
      accent: "text-gray-600",
    },
  };

  const sizeStyles = {
    sm: {
      padding: "p-4",
      title: "text-xs",
      value: "text-xl",
      icon: "w-8 h-8",
      iconInner: "w-4 h-4",
    },
    md: {
      padding: "p-5",
      title: "text-sm",
      value: "text-2xl",
      icon: "w-10 h-10",
      iconInner: "w-5 h-5",
    },
    lg: {
      padding: "p-6",
      title: "text-sm",
      value: "text-3xl",
      icon: "w-12 h-12",
      iconInner: "w-6 h-6",
    },
  };

  const styles = colorStyles[color];
  const sizes = sizeStyles[size];

  return (
    <div className={`${styles.bg} rounded-2xl ${sizes.padding} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`${sizes.title} font-medium text-gray-600 mb-1`}>{title}</p>
          <p className={`${sizes.value} font-bold text-gray-900`}>{value}</p>

          {/* Trend indicator */}
          {change !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              {trend === "up" && (
                <span className="inline-flex items-center text-green-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </span>
              )}
              {trend === "down" && (
                <span className="inline-flex items-center text-red-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </span>
              )}
              <span className={`text-xs font-medium ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-500"}`}>
                {change > 0 ? "+" : ""}{change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-gray-500">{changeLabel}</span>
              )}
            </div>
          )}

          {/* Subtitle */}
          {subtitle && !change && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>

        {/* Icon */}
        {icon && (
          <div className={`${sizes.icon} ${styles.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <div className={`${sizes.iconInner} ${styles.iconText}`}>
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
