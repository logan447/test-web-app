"use client";

import Link from "next/link";
import { ProviderType } from "@prisma/client";
import EngagementProgressIndicator from "./EngagementProgressIndicator";

interface FamilyProfile {
  user: {
    name: string;
  };
  city: string;
  state: string;
}

interface ProviderEngagementHeaderProps {
  familyProfile: FamilyProfile;
  providerType: ProviderType;
  status: string;
  hasTourProposed?: boolean;
  hasTourScheduled?: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
}

// Get contextual header message based on status (provider perspective)
function getHeaderMessage(status: string, familyName: string, hasTourScheduled: boolean): { title: string; subtitle: string } {
  if (hasTourScheduled) {
    return {
      title: "Meeting scheduled!",
      subtitle: `Your visit with ${familyName} is confirmed`,
    };
  }

  switch (status) {
    case "PENDING":
      return {
        title: "New inquiry received",
        subtitle: `${familyName} is interested in your services`,
      };
    case "ACCEPTED":
      return {
        title: "You're connected!",
        subtitle: `Schedule a time to meet with ${familyName}`,
      };
    case "DECLINED":
      return {
        title: "Request declined",
        subtitle: "This inquiry has been closed",
      };
    case "COMPLETED":
      return {
        title: "Engagement completed",
        subtitle: `Thank you for connecting with ${familyName}`,
      };
    default:
      return {
        title: `Inquiry from ${familyName}`,
        subtitle: "Track your engagement progress below",
      };
  }
}

export default function ProviderEngagementHeader({
  familyProfile,
  providerType,
  status,
  hasTourProposed = false,
  hasTourScheduled = false,
  scheduledDate,
  scheduledTime,
}: ProviderEngagementHeaderProps) {
  const familyName = familyProfile.user.name;
  const { title, subtitle } = getHeaderMessage(status, familyName, hasTourScheduled);

  // Get background style based on status
  const getBackgroundStyle = () => {
    if (hasTourScheduled) {
      return "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200";
    }
    switch (status) {
      case "PENDING":
        return "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200";
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

        {/* Status Badge */}
        {status === "PENDING" && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-amber-800">Action Required</span>
          </div>
        )}
      </div>

      {/* Family Info Bar */}
      <div className="flex items-center gap-4 p-4 bg-white/70 rounded-lg mb-6">
        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">{familyName}</h2>
          <p className="text-sm text-gray-600">
            {familyProfile.city}, {familyProfile.state}
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
