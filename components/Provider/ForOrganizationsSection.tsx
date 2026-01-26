"use client";

import { format } from "date-fns";

interface ForOrganizationsSectionProps {
  workPreferences: string[];
  preferredEmployers: string[];
  availabilityStart?: Date | null;
  certifications: string[];
  yearsInBusiness?: number | null;
  languagesSpoken: string[];
  providerName: string;
  className?: string;
}

// Labels for work preferences
const WORK_PREFERENCE_LABELS: Record<string, { label: string; description: string }> = {
  full_time: { label: "Full-Time", description: "40+ hours per week" },
  part_time: { label: "Part-Time", description: "20-30 hours per week" },
  live_in: { label: "Live-In", description: "24-hour care with accommodations" },
  per_diem: { label: "Per Diem", description: "As-needed shifts" },
  overnight: { label: "Overnight", description: "Evening/night shifts available" },
  weekends: { label: "Weekends", description: "Saturday and Sunday availability" },
};

// Labels for preferred employers
const EMPLOYER_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  home_care_agencies: {
    label: "Home Care Agencies",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  facilities: {
    label: "Care Facilities",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    ),
  },
  direct_families: {
    label: "Direct with Families",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
};

export default function ForOrganizationsSection({
  workPreferences,
  preferredEmployers,
  availabilityStart,
  certifications,
  yearsInBusiness,
  languagesSpoken,
  providerName,
  className = "",
}: ForOrganizationsSectionProps) {
  // Don't render if no relevant data
  const hasData =
    workPreferences.length > 0 ||
    preferredEmployers.length > 0 ||
    availabilityStart ||
    certifications.length > 0;

  if (!hasData) {
    return null;
  }

  // Determine availability status
  const isAvailableNow = !availabilityStart || new Date(availabilityStart) <= new Date();
  const availabilityText = isAvailableNow
    ? "Available Now"
    : `Available ${format(new Date(availabilityStart!), "MMMM d, yyyy")}`;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">For Hiring Organizations</h3>
            <p className="text-sm text-gray-600">
              {providerName} is open to employment opportunities. Here&apos;s what they&apos;re looking for.
            </p>
          </div>
          {/* Availability Badge */}
          <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            isAvailableNow
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}>
            {availabilityText}
          </div>
        </div>
      </div>

      {/* Work Preferences */}
      {workPreferences.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-base font-semibold text-gray-900 mb-4">Work Preferences</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {workPreferences.map((pref) => {
              const prefInfo = WORK_PREFERENCE_LABELS[pref] || { label: pref, description: "" };
              return (
                <div
                  key={pref}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{prefInfo.label}</p>
                    {prefInfo.description && (
                      <p className="text-xs text-gray-500">{prefInfo.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Preferred Employers */}
      {preferredEmployers.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-base font-semibold text-gray-900 mb-4">Open to Working With</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {preferredEmployers.map((employer) => {
              const empInfo = EMPLOYER_LABELS[employer] || {
                label: employer,
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              };
              return (
                <div
                  key={employer}
                  className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100"
                >
                  <div className="text-blue-600">{empInfo.icon}</div>
                  <span className="font-medium text-blue-900">{empInfo.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Qualifications */}
      {(certifications.length > 0 || yearsInBusiness || languagesSpoken.length > 0) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-base font-semibold text-gray-900 mb-4">Quick Qualifications</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {yearsInBusiness && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{yearsInBusiness}+</p>
                <p className="text-xs text-gray-500">Years Experience</p>
              </div>
            )}
            {certifications.length > 0 && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{certifications.length}</p>
                <p className="text-xs text-gray-500">Certifications</p>
              </div>
            )}
            {languagesSpoken.length > 0 && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{languagesSpoken.length}</p>
                <p className="text-xs text-gray-500">Languages</p>
              </div>
            )}
          </div>

          {/* Certification Tags */}
          {certifications.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Certifications:</p>
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert) => (
                  <span
                    key={cert}
                    className="px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languagesSpoken.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Languages:</p>
              <div className="flex flex-wrap gap-2">
                {languagesSpoken.map((lang) => (
                  <span
                    key={lang}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CTA for Organizations */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold mb-1">Interested in hiring {providerName}?</h4>
            <p className="text-indigo-100 text-sm">
              Send an interview request to connect and discuss opportunities.
            </p>
          </div>
          <button
            className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Request Interview
          </button>
        </div>
      </div>
    </div>
  );
}
