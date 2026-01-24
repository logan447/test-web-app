"use client";

import Link from "next/link";
import { ProviderType } from "@prisma/client";

interface EngagementSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerName: string;
  providerType: ProviderType;
  engagementId?: string;
  action: "request_sent" | "tour_scheduled" | "message_sent" | "review_submitted";
}

// Get action-specific content
function getContent(action: string, providerName: string, providerType: ProviderType) {
  const isFacility = ["ASSISTED_LIVING", "MEMORY_CARE", "NURSING_HOME", "INDEPENDENT_LIVING", "REHABILITATION"].includes(providerType);
  const meetingType = isFacility ? "tour" : providerType === "INDEPENDENT_CAREGIVER" ? "interview" : "consultation";

  switch (action) {
    case "request_sent":
      return {
        icon: (
          <svg className="w-16 h-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        title: "Request Sent!",
        subtitle: `Your request has been sent to ${providerName}`,
        description: "They typically respond within 24-48 hours. We'll notify you by email when they reply.",
        tips: [
          `${providerName} will review your care profile`,
          "You'll be notified when they respond",
          `Once accepted, you can schedule a ${meetingType}`,
        ],
        primaryAction: { label: "View Engagement", href: null },
        secondaryAction: { label: "Browse More Providers", href: "/browse" },
      };
    case "tour_scheduled":
      return {
        icon: (
          <svg className="w-16 h-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
        title: `${meetingType.charAt(0).toUpperCase() + meetingType.slice(1)} Scheduled!`,
        subtitle: `You're all set to meet with ${providerName}`,
        description: "Mark your calendar and prepare any questions you'd like to ask.",
        tips: [
          "Arrive 10-15 minutes early",
          "Bring a list of questions",
          "Consider bringing a family member",
        ],
        primaryAction: { label: "Add to Calendar", href: null },
        secondaryAction: { label: "View Details", href: null },
      };
    case "message_sent":
      return {
        icon: (
          <svg className="w-16 h-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        ),
        title: "Message Sent!",
        subtitle: `Your message is on its way to ${providerName}`,
        description: "They'll be notified and can reply directly in the conversation.",
        tips: [],
        primaryAction: null,
        secondaryAction: null,
      };
    case "review_submitted":
      return {
        icon: (
          <svg className="w-16 h-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ),
        title: "Review Submitted!",
        subtitle: "Thank you for sharing your experience",
        description: "Your review helps other families make informed decisions.",
        tips: [],
        primaryAction: null,
        secondaryAction: { label: "Browse Providers", href: "/browse" },
      };
    default:
      return {
        icon: (
          <svg className="w-16 h-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
          </svg>
        ),
        title: "Success!",
        subtitle: "Your action was completed",
        description: "",
        tips: [],
        primaryAction: null,
        secondaryAction: null,
      };
  }
}

export default function EngagementSuccessModal({
  isOpen,
  onClose,
  providerName,
  providerType,
  engagementId,
  action,
}: EngagementSuccessModalProps) {
  if (!isOpen) return null;

  const content = getContent(action, providerName, providerType);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
        {/* Success Icon */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 flex flex-col items-center text-center">
          <div className="mb-4 animate-in zoom-in duration-300">{content.icon}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{content.title}</h2>
          <p className="text-gray-600">{content.subtitle}</p>
        </div>

        {/* Body */}
        <div className="p-6">
          {content.description && (
            <p className="text-center text-gray-600 mb-6">{content.description}</p>
          )}

          {/* Tips */}
          {content.tips.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-gray-900 mb-3">What happens next:</p>
              <ul className="space-y-2">
                {content.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {content.primaryAction && (
              content.primaryAction.href ? (
                <Link
                  href={content.primaryAction.href}
                  className="w-full px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium text-center transition-colors"
                >
                  {content.primaryAction.label}
                </Link>
              ) : engagementId ? (
                <Link
                  href={`/requests/${engagementId}`}
                  className="w-full px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium text-center transition-colors"
                >
                  {content.primaryAction.label}
                </Link>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium transition-colors"
                >
                  {content.primaryAction.label}
                </button>
              )
            )}

            {content.secondaryAction && (
              content.secondaryAction.href ? (
                <Link
                  href={content.secondaryAction.href}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium text-center transition-colors"
                >
                  {content.secondaryAction.label}
                </Link>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  {content.secondaryAction.label}
                </button>
              )
            )}

            {!content.primaryAction && !content.secondaryAction && (
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium transition-colors"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
