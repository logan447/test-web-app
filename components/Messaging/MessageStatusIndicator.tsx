"use client";

export type MessageStatus = "SENT" | "DELIVERED" | "READ";

export interface MessageStatusIndicatorProps {
  status: MessageStatus;
  size?: "sm" | "md";
}

export default function MessageStatusIndicator({
  status,
  size = "sm",
}: MessageStatusIndicatorProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
  };

  // Single checkmark for SENT
  if (status === "SENT") {
    return (
      <svg
        className={`${sizeClasses[size]} text-gray-400`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-label="Sent"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M5 13l4 4L19 7"
        />
      </svg>
    );
  }

  // Double checkmark for DELIVERED (gray)
  if (status === "DELIVERED") {
    return (
      <svg
        className={`${sizeClasses[size]} text-gray-400`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        aria-label="Delivered"
      >
        {/* First checkmark */}
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M1 13l4 4L15 7"
        />
        {/* Second checkmark (offset) */}
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M7 13l4 4L21 7"
        />
      </svg>
    );
  }

  // Double checkmark for READ (blue)
  if (status === "READ") {
    return (
      <svg
        className={`${sizeClasses[size]} text-blue-500`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        aria-label="Read"
      >
        {/* First checkmark */}
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M1 13l4 4L15 7"
        />
        {/* Second checkmark (offset) */}
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M7 13l4 4L21 7"
        />
      </svg>
    );
  }

  return null;
}

/**
 * Tooltip text helper for message status
 */
export function getStatusTooltip(status: MessageStatus): string {
  switch (status) {
    case "SENT":
      return "Sent";
    case "DELIVERED":
      return "Delivered";
    case "READ":
      return "Read";
    default:
      return "";
  }
}
