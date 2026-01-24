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
  const [acknowledged, setAcknowledged] = useState(false);

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
        return "facility tour";
      case "interview":
        return "caregiver interview";
      case "consultation":
      default:
        return "consultation request";
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

  // If profile is incomplete, show completion prompt instead
  if (!profileSummary.isComplete) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 border-b border-amber-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Complete Your Profile</h2>
                <p className="text-sm text-amber-700">Required before contacting providers</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              To connect with <span className="font-semibold text-gray-900">{providerName}</span>,
              please complete your care profile first. This helps providers understand your needs
              and respond more effectively.
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Missing information:</p>
              <ul className="space-y-1">
                {profileSummary.missingFields.map((field) => (
                  <li key={field} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {field}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-6 border-b border-primary-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-xl">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Confirm Your Request</h2>
              <p className="text-sm text-primary-700">Review what will be shared with {providerName}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* What will be shared */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Your Care Profile Will Be Shared
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              {/* Care Types */}
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Care Types</p>
                  <p className="text-sm text-gray-600">
                    {profileSummary.careTypes.length > 0
                      ? profileSummary.careTypes.map(formatCareType).join(", ")
                      : "Not specified"}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-600">{profileSummary.location || "Not specified"}</p>
                </div>
              </div>

              {/* Budget */}
              {profileSummary.budgetRange && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Budget Range</p>
                    <p className="text-sm text-gray-600">{profileSummary.budgetRange}</p>
                  </div>
                </div>
              )}

              {/* Timeline */}
              {profileSummary.timeline && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-primary-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Timeline</p>
                    <p className="text-sm text-gray-600">{profileSummary.timeline}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-green-900 mb-1">Your Identity is Protected</p>
                <p className="text-sm text-green-800">
                  Your name, email, and phone number will only be shared after {providerName} accepts
                  your {getEngagementLabel()}. Until then, your care needs are shared anonymously.
                </p>
              </div>
            </div>
          </div>

          {/* Acknowledgment Checkbox */}
          <label className="flex items-start gap-3 mb-6 cursor-pointer group">
            <div className="mt-0.5">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </div>
            <span className="text-sm text-gray-700 group-hover:text-gray-900">
              I understand that my care profile will be shared with {providerName} and agree to proceed
              with this {getEngagementLabel()}.
            </span>
          </label>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
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
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Request
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
