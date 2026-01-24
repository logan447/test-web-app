"use client";

import Link from "next/link";
import { formatEngagementType, type EngagementType } from "@/lib/engagementUtils";
import type { CompletionFeedback } from "./EngagementCompletionModal";

interface PostEngagementSummaryProps {
  engagementType: EngagementType | string;
  providerName: string;
  providerId: string;
  completedAt: string;
  feedback?: CompletionFeedback;
  isProvider: boolean;
  hasLeftReview?: boolean;
  onLeaveReview?: () => void;
}

export default function PostEngagementSummary({
  engagementType,
  providerName,
  providerId,
  completedAt,
  feedback,
  isProvider,
  hasLeftReview = false,
  onLeaveReview,
}: PostEngagementSummaryProps) {
  const engagementLabel = formatEngagementType(engagementType as EngagementType);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getOutcomeLabel = (outcome: string) => {
    const labels: Record<string, string> = {
      moved_forward: "Moving forward with services",
      chose_provider: "Chose this provider",
      considering: "Still considering",
      exploring_others: "Exploring other options",
      scheduling_followup: "Follow-up scheduled",
      not_a_fit: "Not a good fit",
      other: "Other",
    };
    return labels[outcome] || outcome;
  };

  const getRatingLabel = (rating: number) => {
    const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
    return labels[rating] || "";
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-primary-50 rounded-2xl border border-blue-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-primary-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{engagementLabel} Completed</h3>
            <p className="text-sm text-blue-100">{formatDate(completedAt)}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Summary Stats */}
        {feedback && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Rating */}
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Rating</p>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${star <= feedback.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
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
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">{getRatingLabel(feedback.rating)}</span>
              </div>
            </div>

            {/* Outcome */}
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Outcome</p>
              <p className="text-sm font-medium text-gray-900">
                {feedback.outcome ? getOutcomeLabel(feedback.outcome) : "Not specified"}
              </p>
            </div>
          </div>
        )}

        {/* Feedback badges */}
        {feedback && (
          <div className="flex flex-wrap gap-2 mb-6">
            {feedback.wouldRecommend && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                Would Recommend
              </span>
            )}
            {feedback.followUpNeeded && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Follow-up Needed
              </span>
            )}
          </div>
        )}

        {/* Notes */}
        {feedback?.notes && (
          <div className="bg-white rounded-xl p-4 border border-gray-100 mb-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Notes</p>
            <p className="text-sm text-gray-700">{feedback.notes}</p>
          </div>
        )}

        {/* Next Steps */}
        <div className="border-t border-blue-200 pt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Next Steps</h4>
          <div className="space-y-3">
            {!isProvider && !hasLeftReview && onLeaveReview && (
              <button
                onClick={onLeaveReview}
                className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Leave a Review</p>
                    <p className="text-xs text-gray-500">Help other families with your experience</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {!isProvider && hasLeftReview && (
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-green-900">Review Submitted</p>
                  <p className="text-xs text-green-700">Thank you for your feedback!</p>
                </div>
              </div>
            )}

            <Link
              href={isProvider ? "/provider/leads" : "/browse"}
              className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">
                    {isProvider ? "View More Families" : "Explore More Providers"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isProvider ? "Find more care opportunities" : "Compare your options"}
                  </p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {feedback?.followUpNeeded && (
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-amber-900">Follow-up Reminder</p>
                  <p className="text-xs text-amber-700">Don&apos;t forget to schedule your follow-up meeting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
