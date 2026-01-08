"use client";

interface SpecialtyCareSectionProps {
  hasMemoryCare: boolean;
  hasRespiteCare: boolean;
  hasHospiceCare: boolean;
  specialtyPrograms: string[];
  languagesSpoken: string[];
}

export default function SpecialtyCareSection({
  hasMemoryCare,
  hasRespiteCare,
  hasHospiceCare,
  specialtyPrograms,
  languagesSpoken,
}: SpecialtyCareSectionProps) {
  // Don't render if no specialty care information is provided
  const hasSpecialtyCare = hasMemoryCare || hasRespiteCare || hasHospiceCare;
  const hasAnyContent =
    hasSpecialtyCare ||
    specialtyPrograms.length > 0 ||
    languagesSpoken.length > 0;

  if (!hasAnyContent) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <svg
          className="w-6 h-6 text-primary-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900">
          Specialty Care & Programs
        </h2>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        {/* Specialty Care Types */}
        {hasSpecialtyCare && (
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-900 mb-3">
              Specialized Care Services
            </h3>
            <div className="flex flex-wrap gap-3">
              {hasMemoryCare && (
                <div className="bg-purple-100 border border-purple-300 rounded-lg px-4 py-3 flex items-center gap-3">
                  <svg
                    className="w-6 h-6 text-purple-700 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold text-purple-900">Memory Care</p>
                    <p className="text-xs text-purple-700">
                      Specialized dementia & Alzheimer&apos;s care
                    </p>
                  </div>
                </div>
              )}

              {hasRespiteCare && (
                <div className="bg-blue-100 border border-blue-300 rounded-lg px-4 py-3 flex items-center gap-3">
                  <svg
                    className="w-6 h-6 text-blue-700 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold text-blue-900">Respite Care</p>
                    <p className="text-xs text-blue-700">
                      Short-term relief for family caregivers
                    </p>
                  </div>
                </div>
              )}

              {hasHospiceCare && (
                <div className="bg-teal-100 border border-teal-300 rounded-lg px-4 py-3 flex items-center gap-3">
                  <svg
                    className="w-6 h-6 text-teal-700 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold text-teal-900">Hospice Care</p>
                    <p className="text-xs text-teal-700">
                      Compassionate end-of-life support
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Specialty Programs */}
          {specialtyPrograms.length > 0 && (
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">
                Specialty Programs
              </h3>
              <div className="space-y-2">
                {specialtyPrograms.map((program, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <svg
                      className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{program}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages Spoken */}
          {languagesSpoken.length > 0 && (
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">
                Languages Spoken by Staff
              </h3>
              <div className="flex flex-wrap gap-2">
                {languagesSpoken.map((language, index) => (
                  <span
                    key={index}
                    className="bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                      />
                    </svg>
                    {language}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-3">
                Culturally sensitive care with multilingual staff support
              </p>
            </div>
          )}
        </div>

        {/* Empty state if only showing languages (no specialty care or programs) */}
        {!hasSpecialtyCare && specialtyPrograms.length === 0 && languagesSpoken.length > 0 && (
          <div className="border-t border-gray-200 mt-4 pt-4">
            <p className="text-sm text-gray-600 text-center">
              Contact us to learn about additional specialty programs
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
