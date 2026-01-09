"use client";

import { useState } from "react";

export interface VideoCallButtonProps {
  onStartCall: (platform: "zoom" | "google" | "custom") => Promise<string>;
  disabled?: boolean;
}

export default function VideoCallButton({
  onStartCall,
  disabled = false,
}: VideoCallButtonProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleStartCall = async (platform: "zoom" | "google" | "custom") => {
    setIsGenerating(true);
    try {
      await onStartCall(platform);
      setShowOptions(false);
    } catch (error) {
      console.error("Error starting video call:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowOptions(!showOptions)}
        disabled={disabled || isGenerating}
        className="
          inline-flex items-center gap-2
          px-4 py-2
          bg-primary-600 text-white
          rounded-lg
          hover:bg-primary-700
          active:bg-primary-800
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
          font-medium text-sm
          shadow-sm
        "
        title="Start video call"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        {isGenerating ? "Generating..." : "Start Video Call"}
      </button>

      {/* Platform Selection Dropdown */}
      {showOptions && !isGenerating && (
        <div className="absolute bottom-full mb-2 left-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10">
          <div className="px-4 py-2 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">Choose platform</p>
            <p className="text-xs text-gray-500 mt-0.5">
              A meeting link will be sent in the chat
            </p>
          </div>

          <div className="py-1">
            {/* Zoom Option */}
            <button
              type="button"
              onClick={() => handleStartCall("zoom")}
              className="
                w-full px-4 py-2.5
                flex items-center gap-3
                hover:bg-gray-50
                transition-colors
                text-left
              "
            >
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9-9-4.03-9-9zm18 0c0-4.42-3.58-8-8-8s-8 3.58-8 8 3.58 8 8 8 8-3.58 8-8z" />
                  <path d="M15.5 10.5L13 12v-2a1 1 0 00-1-1H7a1 1 0 00-1 1v4a1 1 0 001 1h5a1 1 0 001-1v-2l2.5 1.5a.5.5 0 00.5-.5v-3a.5.5 0 00-.5-.5z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Zoom</div>
                <div className="text-xs text-gray-500">Start a Zoom meeting</div>
              </div>
            </button>

            {/* Google Meet Option */}
            <button
              type="button"
              onClick={() => handleStartCall("google")}
              className="
                w-full px-4 py-2.5
                flex items-center gap-3
                hover:bg-gray-50
                transition-colors
                text-left
              "
            >
              <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  <path d="M15 8.5l-4.5 4.5L8 10.5 6.5 12l4 4 6-6z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Google Meet</div>
                <div className="text-xs text-gray-500">Start a Google Meet</div>
              </div>
            </button>

            {/* Custom Link Option */}
            <button
              type="button"
              onClick={() => handleStartCall("custom")}
              className="
                w-full px-4 py-2.5
                flex items-center gap-3
                hover:bg-gray-50
                transition-colors
                text-left
              "
            >
              <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Custom Link</div>
                <div className="text-xs text-gray-500">Generate a meeting link</div>
              </div>
            </button>
          </div>

          <div className="px-4 py-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowOptions(false)}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showOptions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  );
}
