"use client";

import { useState } from "react";
import Link from "next/link";

interface ProfileSummary {
  careTypes: string[];
  location: string;
  budgetRange: string | null;
  timeline: string | null;
  isComplete: boolean;
  missingFields: string[];
}

interface EngagementConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  providerName: string;
  providerType: string;
  engagementType: "consultation" | "tour" | "interview";
  profileSummary: ProfileSummary;
}

export default function EngagementConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  providerName,
  providerType,
  engagementType,
  profileSummary,
}: EngagementConfirmationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acknowledged, setAcknowledged] = useState(true); // Auto-checked

  if (!isOpen) return null;

  const formatCareType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getEngagementLabel = () => {
    switch (engagementType) {
      case "tour":
        return "tour";
      case "interview":
        return "interview";
      case "consultation":
      default:
        return "consultation";
    }
  };

  const getActionLabel = () => {
    switch (engagementType) {
      case "tour":
        return "Schedule Tour";
      case "interview":
        return "Schedule Interview";
      case "consultation":
      default:
        return "Schedule Consultation";
    }
  };

  const handleConfirm = async () => {
    if (!acknowledged) return;

    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Failed to send request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If profile is incomplete, show completion prompt
  if (!profileSummary.isComplete) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
          <div className="p-6 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Complete Your Profile</h2>
              <p className="text-sm text-gray-500">
                Finish your profile so {providerName} can understand your needs.
              </p>
            </div>

            {profileSummary.missingFields.length > 0 && (
              <ul className="space-y-1.5 text-sm text-gray-600">
                {profileSummary.missingFields.map((field) => (
                  <li key={field} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0" />
                    {field}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <Link
                href="/care-profile/edit"
                className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-center transition-colors"
              >
                Complete Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
        <div className="p-6 space-y-5">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {getActionLabel()}
            </h2>
            <p className="text-sm text-gray-500">
              with {providerName}
            </p>
          </div>

          {/* What gets shared — compact list */}
          <div className="border border-gray-200 rounded-lg p-4 space-y-2.5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              What {providerName} will see
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>
                {profileSummary.careTypes.length > 0
                  ? profileSummary.careTypes.map(formatCareType).join(", ")
                  : "Your care needs"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{profileSummary.location || "Your location"}</span>
            </div>
          </div>

          {/* Privacy note — simple text, no box */}
          <p className="text-xs text-gray-400 text-center">
            Your name and contact info stay private until they accept.
          </p>

          {/* Consent checkbox — auto-checked */}
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600">
              I agree to share my care profile with {providerName}.
            </span>
          </label>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!acknowledged || isSubmitting}
              className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </>
              ) : (
                getActionLabel()
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
