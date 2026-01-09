"use client";

import { useEffect, useState } from "react";

export interface VideoCallNotificationProps {
  callerName: string;
  callerAvatar?: string;
  meetingLink: string;
  platform: "zoom" | "google" | "custom";
  onJoin: () => void;
  onDismiss: () => void;
}

export default function VideoCallNotification({
  callerName,
  callerAvatar,
  meetingLink,
  platform,
  onJoin,
  onDismiss,
}: VideoCallNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10);

    // Play notification sound (optional)
    // You could add audio here: new Audio('/notification.mp3').play();
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  const getPlatformInfo = () => {
    switch (platform) {
      case "zoom":
        return {
          name: "Zoom",
          color: "blue",
          bgColor: "bg-blue-100",
          textColor: "text-blue-600",
        };
      case "google":
        return {
          name: "Google Meet",
          color: "green",
          bgColor: "bg-green-100",
          textColor: "text-green-600",
        };
      case "custom":
        return {
          name: "Video Call",
          color: "purple",
          bgColor: "bg-purple-100",
          textColor: "text-purple-600",
        };
    }
  };

  const platformInfo = getPlatformInfo();

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full mx-4 sm:mx-0
        transform transition-all duration-300 ease-out
        ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}
      `}
    >
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header with platform badge */}
        <div className={`${platformInfo.bgColor} px-4 py-2 border-b border-gray-200`}>
          <div className="flex items-center gap-2">
            <svg className={`w-4 h-4 ${platformInfo.textColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span className={`text-sm font-medium ${platformInfo.textColor}`}>
              {platformInfo.name} Call
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start gap-3 mb-4">
            {/* Caller Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-lg shadow-sm flex-shrink-0">
              {callerAvatar ? (
                <img
                  src={callerAvatar}
                  alt={callerName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                callerName.charAt(0).toUpperCase()
              )}
            </div>

            {/* Call Info */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 mb-1">
                {callerName}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                has started a video call
              </div>

              {/* Animated ringing indicator */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs text-gray-500">
                  Calling...
                </span>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onJoin}
              className="
                flex-1 px-4 py-2.5
                bg-green-600 text-white
                rounded-lg
                font-medium
                hover:bg-green-700
                active:bg-green-800
                transition-colors
                flex items-center justify-center gap-2
                shadow-sm
              "
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Join Call
            </button>
            <button
              onClick={handleDismiss}
              className="
                px-4 py-2.5
                bg-gray-200 text-gray-700
                rounded-lg
                font-medium
                hover:bg-gray-300
                transition-colors
                flex items-center justify-center
              "
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Meeting Link (copyable) */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={meetingLink}
                readOnly
                className="
                  flex-1 px-2 py-1
                  text-xs
                  bg-gray-50
                  border border-gray-200
                  rounded
                  text-gray-600
                  truncate
                "
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(meetingLink);
                }}
                className="
                  px-2 py-1
                  text-xs
                  bg-gray-100
                  hover:bg-gray-200
                  text-gray-700
                  rounded
                  transition-colors
                "
                title="Copy link"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
