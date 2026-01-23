"use client";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

/**
 * Skeleton - Base skeleton loading component
 *
 * Features:
 * - Multiple variants for different content types
 * - Customizable dimensions
 * - Animation options
 */
export default function Skeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
}: SkeletonProps) {
  const baseClasses = "bg-gray-200";

  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "",
    rounded: "rounded-lg",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "skeleton-wave",
    none: "",
  };

  const style: React.CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * SkeletonText - Text content skeleton with multiple lines
 */
export function SkeletonText({
  lines = 3,
  lastLineWidth = "60%",
  className = "",
}: {
  lines?: number;
  lastLineWidth?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          height={16}
          width={index === lines - 1 ? lastLineWidth : "100%"}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonAvatar - Avatar skeleton with optional text
 */
export function SkeletonAvatar({
  size = 40,
  withText = false,
  textLines = 2,
  className = "",
}: {
  size?: number;
  withText?: boolean;
  textLines?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Skeleton variant="circular" width={size} height={size} />
      {withText && (
        <div className="flex-1">
          <SkeletonText lines={textLines} />
        </div>
      )}
    </div>
  );
}

/**
 * SkeletonCard - Generic card skeleton
 */
export function SkeletonCard({
  hasImage = true,
  imageHeight = 160,
  className = "",
}: {
  hasImage?: boolean;
  imageHeight?: number;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden animate-pulse ${className}`}>
      {hasImage && <Skeleton height={imageHeight} />}
      <div className="p-4 space-y-3">
        <Skeleton variant="text" height={20} width="75%" />
        <Skeleton variant="text" height={16} width="50%" />
        <SkeletonText lines={2} />
      </div>
    </div>
  );
}

/**
 * SkeletonTable - Table skeleton
 */
export function SkeletonTable({
  rows = 5,
  columns = 4,
  className = "",
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={`animate-pulse ${className}`}>
      {/* Header */}
      <div className="flex gap-4 pb-4 border-b border-gray-200">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton
            key={`header-${index}`}
            variant="text"
            height={16}
            className="flex-1"
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="flex gap-4 py-4 border-b border-gray-100"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              variant="text"
              height={14}
              className="flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * SkeletonList - List skeleton
 */
export function SkeletonList({
  items = 3,
  hasAvatar = true,
  className = "",
}: {
  items?: number;
  hasAvatar?: boolean;
  className?: string;
}) {
  return (
    <div className={`space-y-4 animate-pulse ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-start gap-3">
          {hasAvatar && <Skeleton variant="circular" width={40} height={40} />}
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" height={16} width="60%" />
            <Skeleton variant="text" height={14} width="80%" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * SkeletonForm - Form skeleton
 */
export function SkeletonForm({
  fields = 4,
  className = "",
}: {
  fields?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-6 animate-pulse ${className}`}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton variant="text" height={14} width={100} />
          <Skeleton variant="rounded" height={42} />
        </div>
      ))}
      <Skeleton variant="rounded" height={48} width={120} />
    </div>
  );
}

/**
 * SkeletonStats - Stats/metrics skeleton
 */
export function SkeletonStats({
  items = 4,
  className = "",
}: {
  items?: number;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${items} gap-4 animate-pulse ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="bg-white rounded-xl p-4 border border-gray-100">
          <Skeleton variant="text" height={12} width="60%" className="mb-2" />
          <Skeleton variant="text" height={28} width="40%" />
        </div>
      ))}
    </div>
  );
}
