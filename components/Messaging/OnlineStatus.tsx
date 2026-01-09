"use client";

import { format, formatDistanceToNow } from "date-fns";

export interface OnlineStatusProps {
  isOnline: boolean;
  lastSeen?: Date;
  userName: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function OnlineStatus({
  isOnline,
  lastSeen,
  userName,
  showLabel = true,
  size = "md",
}: OnlineStatusProps) {
  const dotSizes = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const getLastSeenText = (): string => {
    if (!lastSeen) return "Offline";

    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor(
      (now.getTime() - lastSeenDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) {
      return "Active now";
    } else if (diffInMinutes < 60) {
      return `Active ${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      // Less than 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `Active ${hours}h ago`;
    } else {
      // More than 24 hours - show date
      return `Last seen ${format(lastSeenDate, "MMM d 'at' h:mm a")}`;
    }
  };

  if (!showLabel) {
    // Just show the dot indicator
    return (
      <div
        className={`
          ${dotSizes[size]}
          rounded-full
          ${isOnline ? "bg-green-500" : "bg-gray-400"}
          ring-2 ring-white
          shadow-sm
        `}
        aria-label={isOnline ? `${userName} is online` : `${userName} is offline`}
        title={isOnline ? "Online" : getLastSeenText()}
      />
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Status Dot */}
      <div
        className={`
          ${dotSizes[size]}
          rounded-full
          ${isOnline ? "bg-green-500" : "bg-gray-400"}
          shadow-sm
          ${isOnline ? "animate-pulse" : ""}
        `}
        aria-label={isOnline ? "Online" : "Offline"}
      />

      {/* Status Text */}
      <span
        className={`
          ${textSizes[size]}
          font-medium
          ${isOnline ? "text-green-600" : "text-gray-500"}
        `}
      >
        {isOnline ? "Online" : getLastSeenText()}
      </span>
    </div>
  );
}

/**
 * Compact inline version for message lists
 */
export function OnlineStatusBadge({
  isOnline,
  size = "sm",
}: Pick<OnlineStatusProps, "isOnline" | "size">) {
  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  return (
    <div
      className={`
        ${dotSizes[size]}
        rounded-full
        ${isOnline ? "bg-green-500" : "bg-gray-400"}
        shadow-sm
        ${isOnline ? "animate-pulse" : ""}
      `}
      aria-label={isOnline ? "Online" : "Offline"}
    />
  );
}
