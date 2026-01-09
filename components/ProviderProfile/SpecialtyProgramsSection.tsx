"use client";

import { useState } from "react";

export interface SpecialtyProgramsData {
  // Special Care Programs (with optional descriptions)
  specialtyPrograms: {
    id: string;
    name: string;
    description?: string;
  }[];

  // Policies
  petPolicy: "allowed" | "service_only" | "not_allowed" | "";
  petPolicyDetails: string;
  visitorPolicy: string;
  smokingPolicy: "non_smoking" | "designated_areas" | "allowed" | "";
  hasTrialPeriod: boolean;
  trialPeriodDuration: string;
}

interface SpecialtyProgramsSectionProps {
  data: SpecialtyProgramsData;
  onChange: (data: SpecialtyProgramsData) => void;
}

const SPECIALTY_PROGRAM_OPTIONS = [
  {
    id: "memory_care",
    name: "Memory Care Program",
    description: "Specialized care for dementia and Alzheimer&apos;s patients",
    icon: "🧠",
    hasDescription: true,
  },
  {
    id: "respite_care",
    name: "Respite Care",
    description: "Temporary care to give family caregivers a break",
    icon: "☀️",
    hasDescription: false,
  },
  {
    id: "hospice_care",
    name: "Hospice Care",
    description: "Compassionate end-of-life care and support",
    icon: "💝",
    hasDescription: false,
  },
  {
    id: "rehabilitation",
    name: "Rehabilitation Services",
    description: "Post-surgery or injury recovery programs",
    icon: "💪",
    hasDescription: false,
  },
  {
    id: "palliative_care",
    name: "Palliative Care",
    description: "Comfort-focused care for serious illness",
    icon: "🤲",
    hasDescription: false,
  },
  {
    id: "veterans_program",
    name: "Veterans Program",
    description: "Specialized services for military veterans",
    icon: "🎖️",
    hasDescription: true,
  },
  {
    id: "lgbtq_affirming",
    name: "LGBTQ+ Affirming",
    description: "Inclusive and welcoming environment for LGBTQ+ seniors",
    icon: "🏳️‍🌈",
    hasDescription: false,
  },
  {
    id: "cultural_specific",
    name: "Cultural-Specific Programs",
    description: "Programs tailored to specific cultural communities",
    icon: "🌍",
    hasDescription: true,
  },
];

const TRIAL_PERIOD_DURATIONS = [
  { value: "", label: "Select duration" },
  { value: "7_days", label: "7 Days" },
  { value: "14_days", label: "14 Days" },
  { value: "30_days", label: "30 Days" },
  { value: "60_days", label: "60 Days" },
  { value: "90_days", label: "90 Days" },
];

export default function SpecialtyProgramsSection({
  data,
  onChange,
}: SpecialtyProgramsSectionProps) {
  const [expandedPrograms, setExpandedPrograms] = useState<string[]>([]);

  const isProgramSelected = (programId: string) => {
    return data.specialtyPrograms.some((p) => p.id === programId);
  };

  const getProgramDescription = (programId: string) => {
    const program = data.specialtyPrograms.find((p) => p.id === programId);
    return program?.description || "";
  };

  const toggleProgram = (programId: string, programName: string) => {
    const isCurrentlySelected = isProgramSelected(programId);

    if (isCurrentlySelected) {
      // Remove program
      onChange({
        ...data,
        specialtyPrograms: data.specialtyPrograms.filter((p) => p.id !== programId),
      });
      setExpandedPrograms(expandedPrograms.filter((id) => id !== programId));
    } else {
      // Add program
      onChange({
        ...data,
        specialtyPrograms: [
          ...data.specialtyPrograms,
          { id: programId, name: programName, description: "" },
        ],
      });
    }
  };

  const updateProgramDescription = (programId: string, description: string) => {
    onChange({
      ...data,
      specialtyPrograms: data.specialtyPrograms.map((p) =>
        p.id === programId ? { ...p, description } : p
      ),
    });
  };

  const toggleExpandProgram = (programId: string) => {
    setExpandedPrograms((prev) =>
      prev.includes(programId)
        ? prev.filter((id) => id !== programId)
        : [...prev, programId]
    );
  };

  return (
    <div className="space-y-8">
      {/* Specialty Programs */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Specialty Care Programs
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Select all specialized programs and services you offer. Add descriptions to highlight what makes your programs unique.
        </p>

        <div className="space-y-3">
          {SPECIALTY_PROGRAM_OPTIONS.map((program) => {
            const isSelected = isProgramSelected(program.id);
            const isExpanded = expandedPrograms.includes(program.id);

            return (
              <div
                key={program.id}
                className={`border-2 rounded-lg overflow-hidden transition-all ${
                  isSelected
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                {/* Program Header */}
                <label className="flex items-start p-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleProgram(program.id, program.name)}
                    className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{program.icon}</span>
                      <span className="font-medium text-gray-900 text-sm">
                        {program.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {program.description}
                    </p>
                  </div>
                  {isSelected && program.hasDescription && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleExpandProgram(program.id);
                      }}
                      className="ml-2 text-primary-600 hover:text-primary-700 text-xs font-medium"
                    >
                      {isExpanded ? "Hide Details" : "Add Details"}
                    </button>
                  )}
                </label>

                {/* Program Description (for selected programs with hasDescription) */}
                {isSelected && program.hasDescription && isExpanded && (
                  <div className="border-t border-gray-200 p-4 bg-white">
                    <label
                      htmlFor={`${program.id}-description`}
                      className="block text-xs font-medium text-gray-700 mb-2"
                    >
                      Describe your {program.name.toLowerCase()} *
                    </label>
                    <textarea
                      id={`${program.id}-description`}
                      value={getProgramDescription(program.id)}
                      onChange={(e) =>
                        updateProgramDescription(program.id, e.target.value)
                      }
                      placeholder={`Describe the specifics of your ${program.name.toLowerCase()}, including services offered, staff training, environment features, and what makes it special...`}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Tip: Be specific about what makes your program unique and effective.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Policies */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Facility Policies
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Help families understand your facility&apos;s policies on important topics.
        </p>

        <div className="space-y-6">
          {/* Pet Policy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              🐾 Pet Policy
            </label>
            <div className="space-y-2">
              <label className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="petPolicy"
                  value="allowed"
                  checked={data.petPolicy === "allowed"}
                  onChange={(e) =>
                    onChange({ ...data, petPolicy: e.target.value as any })
                  }
                  className="mt-0.5 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    Pets Allowed
                  </span>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Residents can bring their pets (with restrictions)
                  </p>
                </div>
              </label>
              <label className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="petPolicy"
                  value="service_only"
                  checked={data.petPolicy === "service_only"}
                  onChange={(e) =>
                    onChange({ ...data, petPolicy: e.target.value as any })
                  }
                  className="mt-0.5 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    Service Animals Only
                  </span>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Only certified service animals permitted
                  </p>
                </div>
              </label>
              <label className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="petPolicy"
                  value="not_allowed"
                  checked={data.petPolicy === "not_allowed"}
                  onChange={(e) =>
                    onChange({ ...data, petPolicy: e.target.value as any })
                  }
                  className="mt-0.5 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    No Pets Allowed
                  </span>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Pets are not permitted in the facility
                  </p>
                </div>
              </label>
            </div>

            {data.petPolicy === "allowed" && (
              <div className="mt-3">
                <label
                  htmlFor="pet-policy-details"
                  className="block text-xs font-medium text-gray-700 mb-2"
                >
                  Pet Restrictions & Requirements
                </label>
                <textarea
                  id="pet-policy-details"
                  value={data.petPolicyDetails}
                  onChange={(e) =>
                    onChange({ ...data, petPolicyDetails: e.target.value })
                  }
                  placeholder="e.g., Dogs and cats under 25 lbs, current vaccinations required, pet deposit $500, maximum 2 pets per resident..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}
          </div>

          {/* Smoking Policy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              🚭 Smoking Policy
            </label>
            <div className="space-y-2">
              <label className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="smokingPolicy"
                  value="non_smoking"
                  checked={data.smokingPolicy === "non_smoking"}
                  onChange={(e) =>
                    onChange({ ...data, smokingPolicy: e.target.value as any })
                  }
                  className="mt-0.5 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    Non-Smoking Facility
                  </span>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Smoking not permitted anywhere on premises
                  </p>
                </div>
              </label>
              <label className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="smokingPolicy"
                  value="designated_areas"
                  checked={data.smokingPolicy === "designated_areas"}
                  onChange={(e) =>
                    onChange({ ...data, smokingPolicy: e.target.value as any })
                  }
                  className="mt-0.5 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    Designated Smoking Areas
                  </span>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Smoking allowed in designated outdoor areas only
                  </p>
                </div>
              </label>
              <label className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="smokingPolicy"
                  value="allowed"
                  checked={data.smokingPolicy === "allowed"}
                  onChange={(e) =>
                    onChange({ ...data, smokingPolicy: e.target.value as any })
                  }
                  className="mt-0.5 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    Smoking Allowed
                  </span>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Smoking permitted in designated areas
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Visitor Policy */}
          <div>
            <label
              htmlFor="visitor-policy"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              👥 Visitor Policy
            </label>
            <textarea
              id="visitor-policy"
              value={data.visitorPolicy}
              onChange={(e) =>
                onChange({ ...data, visitorPolicy: e.target.value })
              }
              placeholder="Describe your visitor policy including visiting hours, check-in procedures, number of visitors allowed, any COVID-19 protocols, etc..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Example: &quot;Visitors welcome daily 8am-8pm. Please check in at front desk. Maximum 4 visitors per resident. Proof of vaccination required.&quot;
            </p>
          </div>

          {/* Trial Period */}
          <div>
            <label className="flex items-start space-x-3 mb-3">
              <input
                type="checkbox"
                checked={data.hasTrialPeriod}
                onChange={(e) =>
                  onChange({ ...data, hasTrialPeriod: e.target.checked })
                }
                className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  ⏱️ Trial Period Available
                </span>
                <p className="text-xs text-gray-600 mt-0.5">
                  We offer a trial period for new residents to ensure it&apos;s the right fit
                </p>
              </div>
            </label>

            {data.hasTrialPeriod && (
              <div className="ml-7">
                <label
                  htmlFor="trial-period-duration"
                  className="block text-xs font-medium text-gray-700 mb-2"
                >
                  Trial Period Duration
                </label>
                <select
                  id="trial-period-duration"
                  value={data.trialPeriodDuration}
                  onChange={(e) =>
                    onChange({ ...data, trialPeriodDuration: e.target.value })
                  }
                  className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {TRIAL_PERIOD_DURATIONS.map((duration) => (
                    <option key={duration.value} value={duration.value}>
                      {duration.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      {(data.specialtyPrograms.length > 0 ||
        data.petPolicy ||
        data.smokingPolicy ||
        data.visitorPolicy ||
        data.hasTrialPeriod) && (
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
                Specialty Programs & Policies Summary
              </h4>
              <div className="text-sm text-green-800 space-y-1">
                {data.specialtyPrograms.length > 0 && (
                  <p>• {data.specialtyPrograms.length} specialty program(s) offered</p>
                )}
                {data.petPolicy && (
                  <p>
                    • Pet Policy:{" "}
                    {data.petPolicy === "allowed"
                      ? "Pets Allowed"
                      : data.petPolicy === "service_only"
                      ? "Service Animals Only"
                      : "No Pets"}
                  </p>
                )}
                {data.smokingPolicy && (
                  <p>
                    • Smoking:{" "}
                    {data.smokingPolicy === "non_smoking"
                      ? "Non-Smoking Facility"
                      : data.smokingPolicy === "designated_areas"
                      ? "Designated Areas"
                      : "Allowed"}
                  </p>
                )}
                {data.visitorPolicy && <p>• Visitor policy provided</p>}
                {data.hasTrialPeriod && (
                  <p>
                    • Trial Period: {data.trialPeriodDuration ? data.trialPeriodDuration.replace("_", " ") : "Available"}
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
