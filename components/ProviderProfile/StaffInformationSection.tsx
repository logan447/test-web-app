"use client";

import { useState } from "react";

export interface StaffInformationData {
  // Staff-to-Resident Ratios (split by shift)
  daytimeRatio: string;
  eveningRatio: string;
  nightRatio: string;

  // Staff Credentials
  credentials: string[];

  // Staff Training Description
  staffTrainingDescription: string;

  // Medical Support
  hasOnCallPhysician: boolean;
  hasPharmacyPartnership: boolean;

  // Visiting Doctor Frequency
  visitingDoctorFrequency: string;

  // Languages Spoken
  languagesSpoken: string[];
}

interface StaffInformationSectionProps {
  data: StaffInformationData;
  onChange: (data: StaffInformationData) => void;
}

const STAFF_CREDENTIALS = [
  {
    id: "rn",
    label: "Registered Nurses (RN)",
    description: "RN on staff or on-site",
    icon: "👩‍⚕️",
  },
  {
    id: "lvn",
    label: "Licensed Vocational Nurses (LVN)",
    description: "LVN on staff or on-site",
    icon: "👨‍⚕️",
  },
  {
    id: "cna",
    label: "Certified Nursing Assistants (CNA)",
    description: "CNAs providing direct care",
    icon: "🩺",
  },
  {
    id: "memory_care_specialist",
    label: "Memory Care Specialists",
    description: "Trained in dementia/Alzheimer&apos;s care",
    icon: "🧠",
  },
  {
    id: "physical_therapist",
    label: "Physical Therapists",
    description: "PT on staff or available",
    icon: "💪",
  },
  {
    id: "occupational_therapist",
    label: "Occupational Therapists",
    description: "OT on staff or available",
    icon: "🖐️",
  },
  {
    id: "activity_director",
    label: "Activity Directors",
    description: "Professional activity coordinators",
    icon: "🎨",
  },
  {
    id: "all_background_checked",
    label: "All Staff Background Checked",
    description: "Complete background screening for all employees",
    icon: "✅",
  },
  {
    id: "all_cpr_certified",
    label: "All Staff CPR Certified",
    description: "Current CPR and first aid certification",
    icon: "🚑",
  },
];

const VISITING_DOCTOR_FREQUENCIES = [
  { value: "", label: "Select frequency" },
  { value: "Daily", label: "Daily" },
  { value: "Multiple times per week", label: "Multiple times per week" },
  { value: "Weekly", label: "Weekly" },
  { value: "Bi-weekly", label: "Bi-weekly" },
  { value: "Monthly", label: "Monthly" },
  { value: "As needed", label: "As needed" },
  { value: "Not available", label: "Not available" },
];

const LANGUAGES = [
  "English",
  "Spanish",
  "Mandarin",
  "Cantonese",
  "Tagalog",
  "Vietnamese",
  "Korean",
  "Japanese",
  "Arabic",
  "Russian",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Hindi",
  "Other",
];

export default function StaffInformationSection({
  data,
  onChange,
}: StaffInformationSectionProps) {
  const [showAllLanguages, setShowAllLanguages] = useState(false);

  const toggleCredential = (credentialId: string) => {
    const newCredentials = data.credentials.includes(credentialId)
      ? data.credentials.filter((c) => c !== credentialId)
      : [...data.credentials, credentialId];
    onChange({ ...data, credentials: newCredentials });
  };

  const toggleLanguage = (language: string) => {
    const newLanguages = data.languagesSpoken.includes(language)
      ? data.languagesSpoken.filter((l) => l !== language)
      : [...data.languagesSpoken, language];
    onChange({ ...data, languagesSpoken: newLanguages });
  };

  const displayedLanguages = showAllLanguages ? LANGUAGES : LANGUAGES.slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Staff-to-Resident Ratios */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Staff-to-Resident Ratio
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Provide your typical staff-to-resident ratios by shift. Example: 1:5 means 1 staff member for every 5 residents.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="daytime-ratio"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              ☀️ Daytime (6am - 2pm)
            </label>
            <input
              type="text"
              id="daytime-ratio"
              value={data.daytimeRatio}
              onChange={(e) => onChange({ ...data, daytimeRatio: e.target.value })}
              placeholder="1:5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label
              htmlFor="evening-ratio"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              🌆 Evening (2pm - 10pm)
            </label>
            <input
              type="text"
              id="evening-ratio"
              value={data.eveningRatio}
              onChange={(e) => onChange({ ...data, eveningRatio: e.target.value })}
              placeholder="1:6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label
              htmlFor="night-ratio"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              🌙 Night (10pm - 6am)
            </label>
            <input
              type="text"
              id="night-ratio"
              value={data.nightRatio}
              onChange={(e) => onChange({ ...data, nightRatio: e.target.value })}
              placeholder="1:8"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Tip: Lower ratios (e.g., 1:4) indicate more personalized care and attention.
        </p>
      </div>

      {/* Staff Credentials */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Staff Credentials & Qualifications
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Select all credentials and qualifications that apply to your staff team.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STAFF_CREDENTIALS.map((credential) => (
            <label
              key={credential.id}
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                data.credentials.includes(credential.id)
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={data.credentials.includes(credential.id)}
                onChange={() => toggleCredential(credential.id)}
                className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{credential.icon}</span>
                  <span className="font-medium text-gray-900 text-sm">
                    {credential.label}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">{credential.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Staff Training Description */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Staff Training Programs
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Describe your staff training programs, ongoing education, and development initiatives.
        </p>
        <textarea
          value={data.staffTrainingDescription}
          onChange={(e) =>
            onChange({ ...data, staffTrainingDescription: e.target.value })
          }
          placeholder="Example: All staff complete a comprehensive 40-hour orientation covering resident care, safety protocols, and emergency procedures. We provide ongoing training in dementia care, infection control, and person-centered care approaches. Staff attend quarterly continuing education sessions and annual CPR recertification."
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
        <p className="text-xs text-gray-500 mt-2">
          💡 Include orientation length, specialty training topics, and continuing education frequency.
        </p>
      </div>

      {/* Medical Support */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Medical Support & Services
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Provide details about medical support available to residents.
        </p>

        {/* Visiting Doctor Frequency */}
        <div className="mb-5">
          <label
            htmlFor="visiting-doctor"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            👨‍⚕️ Visiting Doctor Frequency
          </label>
          <select
            id="visiting-doctor"
            value={data.visitingDoctorFrequency}
            onChange={(e) =>
              onChange({ ...data, visitingDoctorFrequency: e.target.value })
            }
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {VISITING_DOCTOR_FREQUENCIES.map((freq) => (
              <option key={freq.value} value={freq.value}>
                {freq.label}
              </option>
            ))}
          </select>
        </div>

        {/* Medical Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label
            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
              data.hasOnCallPhysician
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <input
              type="checkbox"
              checked={data.hasOnCallPhysician}
              onChange={(e) =>
                onChange({ ...data, hasOnCallPhysician: e.target.checked })
              }
              className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <div className="ml-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">📞</span>
                <span className="font-medium text-gray-900 text-sm">
                  On-Call Physician
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Doctor available 24/7 for emergencies and consultations
              </p>
            </div>
          </label>

          <label
            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
              data.hasPharmacyPartnership
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <input
              type="checkbox"
              checked={data.hasPharmacyPartnership}
              onChange={(e) =>
                onChange({ ...data, hasPharmacyPartnership: e.target.checked })
              }
              className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <div className="ml-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">💊</span>
                <span className="font-medium text-gray-900 text-sm">
                  Pharmacy Partnership
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Partnership with pharmacy for medication management and delivery
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Languages Spoken */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Languages Spoken by Staff
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Select all languages your staff can communicate in. This helps families find culturally appropriate care.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {displayedLanguages.map((language) => (
            <label
              key={language}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                data.languagesSpoken.includes(language)
                  ? "border-primary-400 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={data.languagesSpoken.includes(language)}
                onChange={() => toggleLanguage(language)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-900">{language}</span>
            </label>
          ))}
        </div>
        {!showAllLanguages && LANGUAGES.length > 6 && (
          <button
            type="button"
            onClick={() => setShowAllLanguages(true)}
            className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            + Show {LANGUAGES.length - 6} more languages
          </button>
        )}
        {showAllLanguages && (
          <button
            type="button"
            onClick={() => setShowAllLanguages(false)}
            className="mt-3 text-sm text-gray-600 hover:text-gray-700 font-medium"
          >
            Show fewer languages
          </button>
        )}
      </div>

      {/* Summary */}
      {(data.daytimeRatio ||
        data.eveningRatio ||
        data.nightRatio ||
        data.credentials.length > 0 ||
        data.staffTrainingDescription ||
        data.visitingDoctorFrequency ||
        data.hasOnCallPhysician ||
        data.hasPharmacyPartnership ||
        data.languagesSpoken.length > 0) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-green-900 mb-1">
                Staff Information Summary
              </h4>
              <div className="text-sm text-green-800 space-y-1">
                {(data.daytimeRatio || data.eveningRatio || data.nightRatio) && (
                  <p>
                    • Staff ratios:{" "}
                    {[
                      data.daytimeRatio && `Daytime ${data.daytimeRatio}`,
                      data.eveningRatio && `Evening ${data.eveningRatio}`,
                      data.nightRatio && `Night ${data.nightRatio}`,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
                {data.credentials.length > 0 && (
                  <p>• {data.credentials.length} staff credential(s) selected</p>
                )}
                {data.languagesSpoken.length > 0 && (
                  <p>• {data.languagesSpoken.length} language(s) spoken by staff</p>
                )}
                {data.visitingDoctorFrequency && (
                  <p>• Visiting doctor: {data.visitingDoctorFrequency}</p>
                )}
                {(data.hasOnCallPhysician || data.hasPharmacyPartnership) && (
                  <p>
                    • Additional support:{" "}
                    {[
                      data.hasOnCallPhysician && "On-call physician",
                      data.hasPharmacyPartnership && "Pharmacy partnership",
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
