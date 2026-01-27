"use client";

import Link from "next/link";
import { ProviderType } from "@prisma/client";
import EngagementProgressIndicator from "./EngagementProgressIndicator";

interface Provider {
  id: string;
  name: string;
  providerType: ProviderType;
  city: string;
  state: string;
}

interface EngagementHeaderProps {
  provider: Provider;
  status: string;
  hasTourProposed?: boolean;
  hasTourScheduled?: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
}

// Get contextual header message based on status
function getHeaderMessage(status: string, providerName: string, hasTourScheduled: boolean): { title: string; subtitle: string } {
  if (hasTourScheduled) {
    return {
      title: "You're all set!",
      subtitle: `Your visit with ${providerName} is scheduled`,
    };
  }

  switch (status) {
    case "PENDING":
      return {
        title: "Your meeting request is on its way!",
        subtitle: `Waiting for ${providerName} to respond`,
      };
    case "ACCEPTED":
      return {
        title: `Great news! ${providerName} wants to connect`,
        subtitle: "Schedule a time to meet and learn more",
      };
    case "DECLINED":
      return {
        title: "This meeting was declined",
        subtitle: "You can explore other providers that might be a good fit",
      };
    case "COMPLETED":
      return {
        title: "Engagement completed",
        subtitle: `Thank you for connecting with ${providerName}`,
      };
    default:
      return {
        title: `Connecting with ${providerName}`,
        subtitle: "Track your engagement progress below",
      };
  }
}

// Format provider type for display
function formatProviderType(type: string): string {
  return type
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export default function EngagementHeader({
  provider,
  status,
  hasTourProposed = false,
  hasTourScheduled = false,
  scheduledDate,
  scheduledTime,
}: EngagementHeaderProps) {
  const { title, subtitle } = getHeaderMessage(status, provider.name, hasTourScheduled);

  // Get background style based on status
  const getBackgroundStyle = () => {
    if (hasTourScheduled) {
      return "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200";
    }
    switch (status) {
      case "PENDING":
        return "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200";
      case "ACCEPTED":
        return "bg-gradient-to-r from-primary-50 to-purple-50 border-primary-200";
      case "DECLINED":
        return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200";
      case "COMPLETED":
        return "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200";
      default:
        return "bg-white border-gray-200";
    }
  };

  return (
    <div className={`rounded-xl border p-6 mb-6 ${getBackgroundStyle()}`}>
      {/* Header Content */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
          <p className="text-gray-600">{subtitle}</p>
        </div>

        {/* Provider Link */}
        <Link
          href={`/providers/${provider.id}`}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors text-sm font-medium text-gray-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          View Provider
        </Link>
      </div>

      {/* Provider Info Bar */}
      <div className="flex items-center gap-4 p-4 bg-white/70 rounded-lg mb-6">
        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">{provider.name}</h2>
          <p className="text-sm text-gray-600">
            {formatProviderType(provider.providerType)} • {provider.city}, {provider.state}
          </p>
        </div>

        {/* Scheduled Date/Time Badge */}
        {hasTourScheduled && scheduledDate && scheduledTime && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="text-sm">
              <p className="font-medium text-green-800">{scheduledDate}</p>
              <p className="text-green-600">{scheduledTime}</p>
            </div>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <EngagementProgressIndicator
        status={status}
        hasTourProposed={hasTourProposed}
        hasTourScheduled={hasTourScheduled}
      />
    </div>
  );
}
