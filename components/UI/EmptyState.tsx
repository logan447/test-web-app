"use client";

import Link from "next/link";

type EmptyStateVariant =
  | "default"
  | "search"
  | "messages"
  | "requests"
  | "saved"
  | "notifications"
  | "providers"
  | "families";

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: EmptyStateAction[];
  className?: string;
}

/**
 * EmptyState - Friendly empty state component for when there's no data
 *
 * Features:
 * - Pre-built variants for common scenarios
 * - Customizable title, description, and icon
 * - Action buttons for next steps
 */
export default function EmptyState({
  variant = "default",
  title,
  description,
  icon,
  actions,
  className = "",
}: EmptyStateProps) {
  // Default content based on variant
  const variantContent: Record<
    EmptyStateVariant,
    { title: string; description: string; icon: React.ReactNode }
  > = {
    default: {
      title: "Nothing here yet",
      description: "Check back later for updates.",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      ),
    },
    search: {
      title: "No results found",
      description: "Try adjusting your search or filters to find what you're looking for.",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
    },
    messages: {
      title: "No messages yet",
      description: "When you start a conversation, your messages will appear here.",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
    },
    requests: {
      title: "No requests yet",
      description: "You haven't received any care requests. Keep your profile updated to attract families.",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
    },
    saved: {
      title: "No saved items",
      description: "Items you save will appear here for easy access later.",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
    },
    notifications: {
      title: "All caught up!",
      description: "You have no new notifications.",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
    },
    providers: {
      title: "No providers found",
      description: "We couldn't find providers matching your criteria. Try expanding your search.",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    families: {
      title: "No families found",
      description: "We couldn't find families matching your criteria. Check back soon for new opportunities.",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  };

  const content = variantContent[variant];
  const displayTitle = title || content.title;
  const displayDescription = description || content.description;
  const displayIcon = icon || content.icon;

  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
          {displayIcon}
        </div>
      </div>

      {/* Text content */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{displayTitle}</h3>
      <p className="text-gray-600 max-w-sm mx-auto mb-6">{displayDescription}</p>

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3">
          {actions.map((action, index) => {
            const buttonClass =
              action.variant === "secondary"
                ? "px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                : "px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors";

            if (action.href) {
              return (
                <Link key={index} href={action.href} className={buttonClass}>
                  {action.label}
                </Link>
              );
            }

            return (
              <button key={index} onClick={action.onClick} className={buttonClass}>
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * EmptyStateInline - A compact inline empty state for smaller containers
 */
export function EmptyStateInline({
  message,
  icon,
  action,
  className = "",
}: {
  message: string;
  icon?: React.ReactNode;
  action?: EmptyStateAction;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center gap-3 py-6 text-gray-500 ${className}`}>
      {icon && <span className="text-gray-400">{icon}</span>}
      <span className="text-sm">{message}</span>
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
