"use client";

import { format, addDays, isSameDay, isAfter, startOfToday } from "date-fns";

interface AvailabilitySectionProps {
  availabilityStart?: Date | null;
  workPreferences: string[];
  serviceRadius?: number | null;
  city: string;
  state: string;
  providerName: string;
  className?: string;
}

// Map work preferences to availability indicators
const AVAILABILITY_INDICATORS: Record<string, { label: string; times: string }> = {
  full_time: { label: "Full-Time", times: "Mon-Fri, 8AM-5PM" },
  part_time: { label: "Part-Time", times: "Flexible hours" },
  live_in: { label: "Live-In", times: "24/7 availability" },
  per_diem: { label: "Per Diem", times: "As needed" },
  overnight: { label: "Overnight", times: "Evening & night shifts" },
  weekends: { label: "Weekends", times: "Sat-Sun available" },
};

export default function AvailabilitySection({
  availabilityStart,
  workPreferences,
  serviceRadius,
  city,
  state,
  providerName,
  className = "",
}: AvailabilitySectionProps) {
  const today = startOfToday();

  // Determine availability status
  const isAvailableNow = !availabilityStart || new Date(availabilityStart) <= today;
  const startDate = availabilityStart ? new Date(availabilityStart) : null;

  // Generate a simple week view for illustration
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  // Infer availability from work preferences
  const hasWeekends = workPreferences.includes("weekends");
  const hasOvernight = workPreferences.includes("overnight");
  const isLiveIn = workPreferences.includes("live_in");
  const isFullTime = workPreferences.includes("full_time");
  const isPartTime = workPreferences.includes("part_time");
  const isPerDiem = workPreferences.includes("per_diem");

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Availability Status Card */}
      <div className={`rounded-xl border p-6 ${
        isAvailableNow
          ? "bg-green-50 border-green-200"
          : "bg-amber-50 border-amber-200"
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isAvailableNow ? "bg-green-100" : "bg-amber-100"
          }`}>
            {isAvailableNow ? (
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${
              isAvailableNow ? "text-green-800" : "text-amber-800"
            }`}>
              {isAvailableNow ? "Available Now" : "Available Soon"}
            </h3>
            <p className={`text-sm ${
              isAvailableNow ? "text-green-600" : "text-amber-600"
            }`}>
              {isAvailableNow
                ? `${providerName} is ready to start caring for your loved one`
                : `Starting ${format(startDate!, "MMMM d, yyyy")}`}
            </p>
          </div>
          {!isAvailableNow && startDate && (
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-700">
                {Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))}
              </p>
              <p className="text-xs text-amber-600">days away</p>
            </div>
          )}
        </div>
      </div>

      {/* Week Overview - Simplified */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-base font-semibold text-gray-900 mb-4">Typical Availability</h4>

        {/* Week grid */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((day, idx) => {
            const dayName = format(day, "EEE");
            const isWeekend = idx >= 5;
            // Simplified: show as available based on preferences
            const showAsAvailable =
              isLiveIn ||
              isFullTime ||
              (isPartTime && !isWeekend) ||
              (hasWeekends && isWeekend) ||
              isPerDiem;

            return (
              <div
                key={idx}
                className={`text-center p-2 rounded-lg ${
                  showAsAvailable
                    ? "bg-green-50 border border-green-200"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <p className="text-xs font-medium text-gray-600">{dayName}</p>
                <p className="text-sm font-semibold text-gray-900">{format(day, "d")}</p>
                {showAsAvailable && (
                  <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1" />
                )}
              </div>
            );
          })}
        </div>

        {/* Availability details */}
        <div className="space-y-2">
          {workPreferences.map((pref) => {
            const indicator = AVAILABILITY_INDICATORS[pref];
            if (!indicator) return null;
            return (
              <div
                key={pref}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm font-medium text-gray-900">{indicator.label}</span>
                <span className="text-sm text-gray-500">{indicator.times}</span>
              </div>
            );
          })}
        </div>

        {workPreferences.length === 0 && (
          <p className="text-sm text-gray-500 italic text-center py-4">
            Contact {providerName} to discuss their availability
          </p>
        )}
      </div>

      {/* Service Area */}
      {serviceRadius && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-base font-semibold text-gray-900 mb-4">Service Area</h4>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{serviceRadius} miles</p>
              <p className="text-gray-600">from {city}, {state}</p>
            </div>
          </div>
        </div>
      )}

      {/* Note about scheduling */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900">About Availability</p>
            <p className="text-sm text-blue-700 mt-1">
              Availability shown is general guidance. Actual schedule will be confirmed directly with {providerName}
              after connecting. All caregivers maintain their own calendars.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
