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

function getContent(action: string, providerName: string, providerType: ProviderType) {
  const isFacility = ["ASSISTED_LIVING", "MEMORY_CARE", "NURSING_HOME", "INDEPENDENT_LIVING", "REHABILITATION"].includes(providerType);
  const meetingType = isFacility ? "tour" : providerType === "INDEPENDENT_CAREGIVER" ? "interview" : "consultation";

  switch (action) {
    case "request_sent":
      return {
        title: "Request Sent",
        subtitle: `${providerName} will review your profile and respond.`,
        note: "You'll get an email when they reply.",
        primaryAction: { label: "Check Status", href: null },
        secondaryAction: { label: "Browse More Providers", href: "/browse" },
      };
    case "tour_scheduled":
      return {
        title: `${meetingType.charAt(0).toUpperCase() + meetingType.slice(1)} Scheduled`,
        subtitle: `You're set to meet with ${providerName}.`,
        note: "Bring a list of questions and arrive a few minutes early.",
        primaryAction: { label: "View Details", href: null },
        secondaryAction: null,
      };
    case "message_sent":
      return {
        title: "Message Sent",
        subtitle: `${providerName} will be notified.`,
        note: null,
        primaryAction: null,
        secondaryAction: null,
      };
    case "review_submitted":
      return {
        title: "Review Submitted",
        subtitle: "Thank you for sharing your experience.",
        note: null,
        primaryAction: null,
        secondaryAction: { label: "Browse Providers", href: "/browse" },
      };
    default:
      return {
        title: "Done",
        subtitle: "",
        note: null,
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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl">
        <div className="p-6 space-y-5">
          {/* Success icon */}
          <div className="text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{content.title}</h2>
            <p className="text-sm text-gray-500">{content.subtitle}</p>
          </div>

          {/* Note */}
          {content.note && (
            <p className="text-sm text-gray-500 text-center">{content.note}</p>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2.5">
            {content.primaryAction && (
              content.primaryAction.href ? (
                <Link
                  href={content.primaryAction.href}
                  className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-center transition-colors"
                >
                  {content.primaryAction.label}
                </Link>
              ) : engagementId ? (
                <Link
                  href={`/requests/${engagementId}`}
                  className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-center transition-colors"
                >
                  {content.primaryAction.label}
                </Link>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
                >
                  {content.primaryAction.label}
                </button>
              )
            )}

            {content.secondaryAction && (
              content.secondaryAction.href ? (
                <Link
                  href={content.secondaryAction.href}
                  className="w-full px-4 py-2.5 text-gray-600 hover:text-gray-900 font-medium text-center transition-colors text-sm"
                >
                  {content.secondaryAction.label}
                </Link>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2.5 text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm"
                >
                  {content.secondaryAction.label}
                </button>
              )
            )}

            {!content.primaryAction && !content.secondaryAction && (
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
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
