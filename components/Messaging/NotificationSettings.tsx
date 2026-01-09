"use client";

import { useState } from "react";

export interface NotificationSettingsData {
  muted: boolean;
  muteUntil?: Date | null;
  emailNotifications: boolean;
}

export interface NotificationSettingsProps {
  currentSettings: NotificationSettingsData;
  onSave: (settings: NotificationSettingsData) => Promise<void>;
  onClose: () => void;
}

export default function NotificationSettings({
  currentSettings,
  onSave,
  onClose,
}: NotificationSettingsProps) {
  const [muted, setMuted] = useState(currentSettings.muted);
  const [muteDuration, setMuteDuration] = useState<string>(() => {
    if (!currentSettings.muted || !currentSettings.muteUntil) return "none";

    const now = new Date();
    const muteUntil = new Date(currentSettings.muteUntil);
    const diffHours = Math.round((muteUntil.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (diffHours <= 1) return "1h";
    if (diffHours <= 8) return "8h";
    if (diffHours <= 24) return "24h";
    return "forever";
  });
  const [emailNotifications, setEmailNotifications] = useState(currentSettings.emailNotifications);
  const [saving, setSaving] = useState(false);

  const calculateMuteUntil = (duration: string): Date | null => {
    if (duration === "none") return null;
    if (duration === "forever") {
      const farFuture = new Date();
      farFuture.setFullYear(farFuture.getFullYear() + 10);
      return farFuture;
    }

    const now = new Date();
    const hours = duration === "1h" ? 1 : duration === "8h" ? 8 : 24;
    return new Date(now.getTime() + hours * 60 * 60 * 1000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const isMuted = muteDuration !== "none";
      const muteUntil = calculateMuteUntil(muteDuration);

      await onSave({
        muted: isMuted,
        muteUntil,
        emailNotifications,
      });

      onClose();
    } catch (error) {
      console.error("Error saving notification settings:", error);
      alert("Failed to save notification settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Notification Settings
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-5">
          {/* Mute Notifications Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Mute notifications
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="muteDuration"
                  value="none"
                  checked={muteDuration === "none"}
                  onChange={(e) => setMuteDuration(e.target.value)}
                  className="w-4 h-4 text-primary-600"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Not muted</div>
                  <div className="text-xs text-gray-500">
                    Receive all notifications
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="muteDuration"
                  value="1h"
                  checked={muteDuration === "1h"}
                  onChange={(e) => setMuteDuration(e.target.value)}
                  className="w-4 h-4 text-primary-600"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">For 1 hour</div>
                  <div className="text-xs text-gray-500">
                    Temporarily mute notifications
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="muteDuration"
                  value="8h"
                  checked={muteDuration === "8h"}
                  onChange={(e) => setMuteDuration(e.target.value)}
                  className="w-4 h-4 text-primary-600"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">For 8 hours</div>
                  <div className="text-xs text-gray-500">
                    Mute during work hours
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="muteDuration"
                  value="24h"
                  checked={muteDuration === "24h"}
                  onChange={(e) => setMuteDuration(e.target.value)}
                  className="w-4 h-4 text-primary-600"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">For 24 hours</div>
                  <div className="text-xs text-gray-500">
                    Mute for a full day
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="muteDuration"
                  value="forever"
                  checked={muteDuration === "forever"}
                  onChange={(e) => setMuteDuration(e.target.value)}
                  className="w-4 h-4 text-primary-600"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Until I turn it back on</div>
                  <div className="text-xs text-gray-500">
                    Mute indefinitely
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Email Notifications Toggle */}
          <div className="pt-3 border-t border-gray-200">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-medium text-gray-900">Email notifications</div>
                <div className="text-sm text-gray-500">
                  Get notified via email for new messages
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full
                  transition-colors duration-200 ease-in-out
                  ${emailNotifications ? "bg-primary-600" : "bg-gray-300"}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
                    ${emailNotifications ? "translate-x-6" : "translate-x-1"}
                  `}
                />
              </button>
            </label>
          </div>

          {/* Info Notice */}
          {muteDuration !== "none" && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-amber-800">
                You won&apos;t receive in-app or push notifications while this conversation is muted.
                {muteDuration === "forever"
                  ? " You can unmute anytime from the settings."
                  : ` Notifications will resume ${
                      muteDuration === "1h" ? "in 1 hour" :
                      muteDuration === "8h" ? "in 8 hours" :
                      "in 24 hours"
                    }.`
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="
              flex-1 px-4 py-2
              border border-gray-300 rounded-lg
              text-gray-700 font-medium
              hover:bg-gray-50
              transition-colors
            "
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="
              flex-1 px-4 py-2
              bg-primary-600 text-white rounded-lg
              font-medium
              hover:bg-primary-700
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
              flex items-center justify-center gap-2
            "
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
