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

interface ProviderNextStepCardProps {
  status: string;
  familyName: string;
  providerType: ProviderType;
  hasTourProposed?: boolean;
  hasTourScheduled?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onProposeTimes?: () => void;
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

export default function ProviderNextStepCard({
  status,
  familyName,
  providerType,
  hasTourProposed = false,
  hasTourScheduled = false,
  onAccept,
  onDecline,
  onProposeTimes,
  onSendMessage,
}: ProviderNextStepCardProps) {
  const [showWhatNext, setShowWhatNext] = useState(false);
  const actionLabel = getActionLabel(providerType);

  // Get content based on status (provider perspective)
  const getContent = () => {
    if (hasTourScheduled) {
      return {
        icon: (
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        bgColor: "bg-green-50 border-green-200",
        title: `${actionLabel.noun.charAt(0).toUpperCase() + actionLabel.noun.slice(1)} confirmed!`,
        description: `Get ready to meet with ${familyName}. Make sure you're prepared to showcase your services.`,
        actions: [
          { label: "Add to Calendar", icon: "calendar", primary: true },
          { label: "Send a Reminder", icon: "bell", primary: false, onClick: onSendMessage },
        ],
        tips: [
          "Review any notes or messages from the family beforehand",
          "Prepare materials about your services and pricing",
          "Be ready to answer questions about care options",
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
        description: `Waiting for ${familyName} to confirm a time, or propose alternatives.`,
        actions: [
          { label: "View Proposed Times", icon: "clock", primary: true, onClick: onProposeTimes },
          { label: "Send a Message", icon: "chat", primary: false, onClick: onSendMessage },
        ],
        tips: [
          "Families typically respond within 24-48 hours",
          "You can send a friendly follow-up if needed",
          "Consider offering alternative times if they don't respond",
        ],
      };
    }

    switch (status) {
      case "PENDING":
        return {
          icon: (
            <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          ),
          bgColor: "bg-amber-50 border-amber-200",
          title: "New inquiry — respond now",
          description: `${familyName} is interested in your services. Accept to start the conversation.`,
          actions: [
            { label: "Accept & Connect", icon: "check", primary: true, onClick: onAccept },
            { label: "Decline", icon: "x", primary: false, onClick: onDecline },
          ],
          tips: [
            "Responding quickly increases conversion rates",
            "Review the family's message before responding",
            "You can message after accepting to learn more about their needs",
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
          title: `Ready to schedule a ${actionLabel.noun}?`,
          description: `You're connected with ${familyName}! Propose times for a ${actionLabel.noun} to move forward.`,
          actions: [
            { label: `Propose ${actionLabel.noun.charAt(0).toUpperCase() + actionLabel.noun.slice(1)} Times`, icon: "calendar", primary: true, onClick: onProposeTimes },
            { label: "Send a Message First", icon: "chat", primary: false, onClick: onSendMessage },
          ],
          tips: [
            `Scheduling a ${actionLabel.noun} quickly shows professionalism`,
            "Offer multiple time options for flexibility",
            "Ask questions to understand their specific needs",
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
          title: "Inquiry declined",
          description: "This inquiry has been closed. Focus on other potential families.",
          actions: [{ label: "View Other Inquiries", icon: "list", primary: true, href: "/provider/requests" }],
          tips: [],
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
          description: `Your engagement with ${familyName} is complete. Great job!`,
          actions: [
            { label: "View Other Inquiries", icon: "list", primary: true, href: "/provider/requests" },
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
            Tips for success
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
