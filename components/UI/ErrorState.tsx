"use client";

import { Component, ReactNode } from "react";
import Link from "next/link";

type ErrorVariant = "default" | "network" | "notFound" | "permission" | "server";

interface ErrorStateProps {
  variant?: ErrorVariant;
  title?: string;
  description?: string;
  onRetry?: () => void;
  showHomeLink?: boolean;
  className?: string;
}

/**
 * ErrorState - Friendly error display component
 *
 * Features:
 * - Pre-built variants for common error scenarios
 * - Retry functionality
 * - Accessible error messaging
 */
export default function ErrorState({
  variant = "default",
  title,
  description,
  onRetry,
  showHomeLink = true,
  className = "",
}: ErrorStateProps) {
  const variantContent: Record<
    ErrorVariant,
    { title: string; description: string; icon: ReactNode }
  > = {
    default: {
      title: "Something went wrong",
      description: "We encountered an unexpected error. Please try again.",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    network: {
      title: "Connection problem",
      description: "Please check your internet connection and try again.",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
          />
        </svg>
      ),
    },
    notFound: {
      title: "Page not found",
      description: "The page you're looking for doesn't exist or has been moved.",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    permission: {
      title: "Access denied",
      description: "You don't have permission to view this content.",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
    },
    server: {
      title: "Server error",
      description: "Our servers are having issues. Please try again in a few minutes.",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
          />
        </svg>
      ),
    },
  };

  const content = variantContent[variant];
  const displayTitle = title || content.title;
  const displayDescription = description || content.description;

  return (
    <div
      className={`text-center py-12 px-4 ${className}`}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-red-400">
          {content.icon}
        </div>
      </div>

      {/* Text content */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{displayTitle}</h3>
      <p className="text-gray-600 max-w-sm mx-auto mb-6">{displayDescription}</p>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </button>
        )}
        {showHomeLink && (
          <Link
            href="/"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Go Home
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * ErrorBoundary - React error boundary for catching render errors
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorState
          variant="default"
          title="Something went wrong"
          description="An error occurred while rendering this component."
          onRetry={this.handleRetry}
          showHomeLink={true}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * ErrorInline - A compact inline error display
 */
export function ErrorInline({
  message,
  onRetry,
  className = "",
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center gap-3 py-4 px-4 bg-red-50 border border-red-100 rounded-lg ${className}`}
      role="alert"
    >
      <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="text-sm text-red-700">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-red-600 hover:text-red-700 font-medium underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}
