"use client";

import Link from "next/link";
import { useState } from "react";

interface OnboardingPromptProps {
  // Optional: Customize the message for the specific context
  context?: "dashboard" | "requests" | "saved" | "default";
  // Optional: Allow dismissal (remembers in session)
  dismissible?: boolean;
}

/**
 * Gentle nudge component for provider onboarding (Manual Ch 8)
 *
 * Philosophy: "Maximize visibility, gate by action"
 * - Show a helpful prompt, not a blocker
 * - User can dismiss and continue exploring
 * - Provides clear value proposition for completing onboarding
 */
export default function OnboardingPrompt({
  context = "default",
  dismissible = true,
}: OnboardingPromptProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const contextMessages: Record<string, { title: string; description: string }> = {
    dashboard: {
      title: "Complete your provider profile",
      description:
        "Set up your profile to appear in family searches and receive care requests.",
    },
    requests: {
      title: "Start receiving family requests",
      description:
        "Complete your provider profile to connect with families looking for care.",
    },
    saved: {
      title: "Connect with families you've saved",
      description:
        "Complete your provider profile to reach out to families and offer your services.",
    },
    default: {
      title: "Set up your provider profile",
      description:
        "Complete your profile to unlock all provider features and connect with families.",
    },
  };

  const { title, description } = contextMessages[context] || contextMessages.default;

  return (
    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-primary-800">{title}</h3>
          <p className="mt-1 text-sm text-primary-700">{description}</p>
          <div className="mt-3 flex gap-3">
            <Link
              href="/provider/onboarding"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Complete Profile
            </Link>
            {dismissible && (
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-700 bg-white border border-primary-300 rounded-md hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Maybe Later
              </button>
            )}
          </div>
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="ml-4 text-primary-400 hover:text-primary-600"
            aria-label="Dismiss"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
