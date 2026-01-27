"use client";

import { useState } from "react";
import { formatEngagementType, type EngagementType } from "@/lib/engagementUtils";

interface EngagementCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (feedback: CompletionFeedback) => Promise<void>;
  engagementType: EngagementType | string;
  providerName: string;
  isProvider: boolean;
  engagementDate?: string;
}

export interface CompletionFeedback {
  rating: number;
  outcome: string;
  notes: string;
  wouldRecommend: boolean;
  followUpNeeded: boolean;
}

const OUTCOME_OPTIONS = {
  provider: [
    { value: "moved_forward", label: "Moving forward with services" },
    { value: "considering", label: "Family is still considering" },
    { value: "not_a_fit", label: "Not a good fit" },
    { value: "scheduling_followup", label: "Scheduling follow-up" },
    { value: "other", label: "Other" },
  ],
  family: [
    { value: "chose_provider", label: "Chose this provider" },
    { value: "considering", label: "Still considering" },
    { value: "exploring_others", label: "Exploring other options" },
    { value: "scheduling_followup", label: "Scheduling follow-up" },
    { value: "other", label: "Other" },
  ],
};

export default function EngagementCompletionModal({
  isOpen,
  onClose,
  onComplete,
  engagementType,
  providerName,
  isProvider,
  engagementDate,
}: EngagementCompletionModalProps) {
  const [step, setStep] = useState<"feedback" | "success">("feedback");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [followUpNeeded, setFollowUpNeeded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const engagementLabel = formatEngagementType(engagementType as EngagementType);
  const outcomeOptions = isProvider ? OUTCOME_OPTIONS.provider : OUTCOME_OPTIONS.family;

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await onComplete({
        rating,
        outcome,
        notes,
        wouldRecommend: wouldRecommend ?? true,
        followUpNeeded,
      });
      setStep("success");
    } catch (error) {
      console.error("Failed to complete engagement:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep("feedback");
    setRating(0);
    setOutcome("");
    setNotes("");
    setWouldRecommend(null);
    setFollowUpNeeded(false);
    onClose();
  };

  // Success step
  if (step === "success") {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {engagementLabel} Completed!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for your feedback. This helps improve the care matching experience.
            </p>

            {/* Next Steps */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Suggested Next Steps</h3>
              <ul className="space-y-2">
                {!isProvider && (
                  <>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Leave a review to help other families</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Compare with other providers if still deciding</span>
                    </li>
                  </>
                )}
                {isProvider && (
                  <>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Send a follow-up message if appropriate</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>View other family inquiries in your area</span>
                    </li>
                  </>
                )}
                {followUpNeeded && (
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Schedule your follow-up meeting</span>
                  </li>
                )}
              </ul>
            </div>

            <button
              onClick={handleClose}
              className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Feedback step
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-6 border-b border-primary-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-xl">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Complete {engagementLabel}</h2>
              <p className="text-sm text-primary-700">
                {isProvider ? `With ${providerName}'s family` : `With ${providerName}`}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Engagement Date */}
          {engagementDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 bg-gray-50 rounded-lg p-3">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{engagementLabel} date: <strong>{engagementDate}</strong></span>
            </div>
          )}

          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              How was the {engagementLabel.toLowerCase()}? *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <svg
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-300"
                    } transition-colors`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </button>
              ))}
              <span className="text-sm text-gray-500 ml-2">
                {rating > 0 && (
                  <>
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Very Good"}
                    {rating === 5 && "Excellent"}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Outcome */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              What was the outcome?
            </label>
            <div className="grid grid-cols-1 gap-2">
              {outcomeOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    outcome === option.value
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="outcome"
                    value={option.value}
                    checked={outcome === option.value}
                    onChange={(e) => setOutcome(e.target.value)}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Would Recommend (family only) */}
          {!isProvider && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Would you recommend this provider?
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setWouldRecommend(true)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                    wouldRecommend === true
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setWouldRecommend(false)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                    wouldRecommend === false
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                  </svg>
                  No
                </button>
              </div>
            </div>
          )}

          {/* Follow-up needed */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={followUpNeeded}
                onChange={(e) => setFollowUpNeeded(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Follow-up needed</span>
            </label>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Additional Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder={`Any notes about the ${engagementLabel.toLowerCase()}...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">{notes.length}/500</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Completing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mark as Completed
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
