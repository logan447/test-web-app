"use client";

import { useEffect, useState } from "react";

export type NotificationType = "message" | "tour" | "status" | "info";

export interface SmartNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  actionLabel?: string;
  onAction?: () => void;
}

export interface SmartNotificationBannerProps {
  notification: SmartNotification;
  onDismiss: (id: string) => void;
  autoDismissDelay?: number; // in milliseconds
}

export default function SmartNotificationBanner({
  notification,
  onDismiss,
  autoDismissDelay = 5000,
}: SmartNotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10);

    // Auto dismiss
    if (autoDismissDelay > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoDismissDelay);

      return () => clearTimeout(timer);
    }
  }, [autoDismissDelay]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300); // Match animation duration
  };

  const getIcon = () => {
    switch (notification.type) {
      case "message":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case "tour":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "status":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "info":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getColorClasses = () => {
    switch (notification.type) {
      case "message":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "tour":
        return "bg-purple-50 border-purple-200 text-purple-800";
      case "status":
        return "bg-green-50 border-green-200 text-green-800";
      case "info":
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getIconColorClass = () => {
    switch (notification.type) {
      case "message":
        return "text-blue-600";
      case "tour":
        return "text-purple-600";
      case "status":
        return "text-green-600";
      case "info":
        return "text-gray-600";
    }
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-md w-full mx-4 sm:mx-0
        transform transition-all duration-300 ease-out
        ${isVisible && !isExiting ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}
      `}
    >
      <div
        className={`
          rounded-lg shadow-lg border
          ${getColorClasses()}
          p-4
        `}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 ${getIconColorClass()}`}>
            {getIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm mb-0.5">
              {notification.title}
            </div>
            <div className="text-sm opacity-90">
              {notification.message}
            </div>

            {/* Action Button */}
            {notification.actionLabel && notification.onAction && (
              <button
                onClick={() => {
                  notification.onAction!();
                  handleDismiss();
                }}
                className="
                  mt-2 text-sm font-medium underline
                  hover:no-underline
                  transition-all
                "
              >
                {notification.actionLabel}
              </button>
            )}
          </div>

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="
              flex-shrink-0
              hover:opacity-70
              transition-opacity
            "
            aria-label="Dismiss notification"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar for auto-dismiss */}
        {autoDismissDelay > 0 && (
          <div className="mt-3 h-1 bg-black bg-opacity-10 rounded-full overflow-hidden">
            <div
              className="h-full bg-current opacity-30 transition-all"
              style={{
                width: "100%",
                animation: `progressShrink ${autoDismissDelay}ms linear`,
              }}
            />
          </div>
        )}
      </div>

      {/* Inline styles for animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes progressShrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `
      }} />
    </div>
  );
}
