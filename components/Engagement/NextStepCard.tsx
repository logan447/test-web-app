"use client";

import { useState } from "react";
import { ProviderType } from "@prisma/client";

interface ActionButton {
  label: string;
  icon: string;
  primary: boolean;
  onClick?: () => void;
  href?: string;
}

interface NextStepCardProps {
  status: string;
  providerName: string;
  providerType: ProviderType;
  hasTourProposed?: boolean;
  hasTourScheduled?: boolean;
  onSuggestTimes?: () => void;
  onSendMessage?: () => void;
}

// Get action label based on provider type
function getActionLabel(providerType: ProviderType): { primary: string; noun: string } {
  const type = providerType as string;
  if (["ASSISTED_LIVING", "MEMORY_CARE", "NURSING_HOME", "INDEPENDENT_LIVING", "REHABILITATION"].includes(type)) {
    return { primary: "Schedule a Tour", noun: "tour" };
  }
  if (["HOME_CARE", "HOME_HEALTH", "HOSPICE"].includes(type)) {
    return { primary: "Schedule a Consultation", noun: "consultation" };
  }
  if (type === "INDEPENDENT_CAREGIVER") {
    return { primary: "Schedule an Interview", noun: "interview" };
  }
  return { primary: "Schedule a Meeting", noun: "meeting" };
}

export default function NextStepCard({
  status,
  providerName,
  providerType,
  hasTourProposed = false,
  hasTourScheduled = false,
  onSuggestTimes,
  onSendMessage,
}: NextStepCardProps) {
  const [showWhatNext, setShowWhatNext] = useState(false);
  const actionLabel = getActionLabel(providerType);

  // Get content based on status
  const getContent = () => {
    if (hasTourScheduled) {
      return {
        icon: (
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        bgColor: "bg-green-50 border-green-200",
        title: `Your ${actionLabel.noun} is confirmed!`,
        description: `Get ready for your visit with ${providerName}. Here's what you can do to prepare.`,
        actions: [
          { label: "Add to Calendar", icon: "calendar", primary: true },
          { label: "Get Directions", icon: "map", primary: false },
        ],
        tips: [
          "Arrive 10-15 minutes early to check in",
          "Bring a list of questions you'd like answered",
          "Consider bringing a family member for a second perspective",
        ],
      };
    }

    if (hasTourProposed) {
      return {
        icon: (
          <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        bgColor: "bg-amber-50 border-amber-200",
        title: "Times have been proposed",
        description: `Check the proposed times and confirm one that works for you, or suggest alternatives.`,
        actions: [
          { label: "Review Times", icon: "clock", primary: true },
          { label: "Suggest Different Times", icon: "refresh", primary: false },
        ],
        tips: [
          "Review the proposed times carefully",
          "Consider your schedule flexibility",
          "Respond promptly to keep the process moving",
        ],
      };
    }

    switch (status) {
      case "PENDING":
        return {
          icon: (
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: "bg-blue-50 border-blue-200",
          title: "While you wait...",
          description: `${providerName} typically responds within 24-48 hours. In the meantime, you can:`,
          actions: [
            { label: "Suggest Times to Meet", icon: "calendar", primary: true, onClick: onSuggestTimes },
            { label: "Send a Message", icon: "chat", primary: false, onClick: onSendMessage },
          ],
          tips: [
            "Suggesting times early can speed up the process",
            "Be specific about your availability",
            "Feel free to send a follow-up message after 48 hours",
          ],
        };
      case "ACCEPTED":
        return {
          icon: (
            <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          bgColor: "bg-primary-50 border-primary-200",
          title: `Ready to ${actionLabel.primary.toLowerCase()}?`,
          description: `${providerName} has accepted your request! The next step is to schedule your ${actionLabel.noun}.`,
          actions: [
            { label: actionLabel.primary, icon: "calendar", primary: true, onClick: onSuggestTimes },
            { label: "Ask a Question First", icon: "chat", primary: false, onClick: onSendMessage },
          ],
          tips: [
            `Scheduling a ${actionLabel.noun} is the best way to learn more`,
            "Come prepared with questions about care options",
            "It's okay to schedule multiple visits with different providers",
          ],
        };
      case "DECLINED":
        return {
          icon: (
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          bgColor: "bg-gray-50 border-gray-200",
          title: "This request was declined",
          description: "Don't worry — there are many other great providers that might be a perfect fit for your needs.",
          actions: [{ label: "Browse More Providers", icon: "search", primary: true, href: "/browse" }],
          tips: [
            "Providers decline for many reasons unrelated to you",
            "Consider reaching out to similar providers in the area",
            "Your saved list might have other good options",
          ],
        };
      case "COMPLETED":
        return {
          icon: (
            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: "bg-emerald-50 border-emerald-200",
          title: "Engagement completed",
          description: `How did your experience with ${providerName} go? Your feedback helps other families.`,
          actions: [
            { label: "Leave a Review", icon: "star", primary: true },
            { label: "Browse More Providers", icon: "search", primary: false, href: "/browse" },
          ],
          tips: [],
        };
      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  return (
    <div className={`rounded-xl border p-6 mb-6 ${content.bgColor}`}>
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="p-2 bg-white rounded-lg shadow-sm">{content.icon}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{content.title}</h3>
          <p className="text-sm text-gray-600">{content.description}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        {content.actions.map((action: ActionButton, index: number) => {
          const buttonClass = `inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
            action.primary
              ? "bg-primary-600 text-white hover:bg-primary-700"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`;

          if (action.href) {
            return (
              <a key={index} href={action.href} className={buttonClass}>
                {action.label}
              </a>
            );
          }

          return (
            <button key={index} onClick={action.onClick} className={buttonClass}>
              {action.label}
            </button>
          );
        })}
      </div>

      {/* What Happens Next - Collapsible */}
      {content.tips.length > 0 && (
        <div className="border-t border-gray-200/50 pt-4">
          <button
            onClick={() => setShowWhatNext(!showWhatNext)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showWhatNext ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            What happens next?
          </button>

          {showWhatNext && (
            <ul className="mt-3 space-y-2">
              {content.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  {tip}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
