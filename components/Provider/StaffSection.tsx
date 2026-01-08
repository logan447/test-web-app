"use client";

interface StaffSectionProps {
  staffToResidentRatio?: string | null;
  hasRNOnSite: boolean;
  hasLVNOnSite: boolean;
  allStaffBackgroundChecked: boolean;
  visitingDoctorFrequency?: string | null;
  caregiverTraining: string[];
  languagesSpoken: string[];
}

export default function StaffSection({
  staffToResidentRatio,
  hasRNOnSite,
  hasLVNOnSite,
  allStaffBackgroundChecked,
  visitingDoctorFrequency,
  caregiverTraining,
  languagesSpoken,
}: StaffSectionProps) {
  // Don't render if no staff information is provided
  const hasStaffInfo =
    staffToResidentRatio ||
    hasRNOnSite ||
    hasLVNOnSite ||
    allStaffBackgroundChecked ||
    visitingDoctorFrequency ||
    caregiverTraining.length > 0 ||
    languagesSpoken.length > 0;

  if (!hasStaffInfo) {
    return null;
  }

  const CheckIcon = () => (
    <svg
      className="w-5 h-5 text-green-600 flex-shrink-0"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );

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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900">
          Staff & Caregiving Information
        </h2>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Staff to Resident Ratio */}
            {staffToResidentRatio && (
              <div className="flex items-start gap-3">
                <div className="bg-primary-100 rounded-full p-2 mt-0.5">
                  <svg
                    className="w-5 h-5 text-primary-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Staff-to-Resident Ratio</p>
                  <p className="text-2xl font-bold text-primary-700 mt-1">
                    {staffToResidentRatio}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Ensuring personalized care and attention
                  </p>
                </div>
              </div>
            )}

            {/* Medical Staff Credentials */}
            {(hasRNOnSite || hasLVNOnSite) && (
              <div>
                <p className="font-medium text-gray-900 mb-2">Medical Staff On-Site</p>
                <div className="space-y-2">
                  {hasRNOnSite && (
                    <div className="flex items-center gap-2">
                      <CheckIcon />
                      <span className="text-sm text-gray-700">
                        Registered Nurse (RN) On-Site
                      </span>
                    </div>
                  )}
                  {hasLVNOnSite && (
                    <div className="flex items-center gap-2">
                      <CheckIcon />
                      <span className="text-sm text-gray-700">
                        Licensed Vocational Nurse (LVN) On-Site
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Background Checks */}
            {allStaffBackgroundChecked && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                <CheckIcon />
                <span className="text-sm font-medium text-gray-900">
                  All Staff Background Checked
                </span>
              </div>
            )}

            {/* Visiting Doctor */}
            {visitingDoctorFrequency && (
              <div>
                <p className="font-medium text-gray-900 mb-1">Visiting Doctor</p>
                <p className="text-sm text-gray-700">{visitingDoctorFrequency} visits</p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Caregiver Training */}
            {caregiverTraining.length > 0 && (
              <div>
                <p className="font-medium text-gray-900 mb-2">
                  Staff Training & Certifications
                </p>
                <div className="space-y-2">
                  {caregiverTraining.map((training) => (
                    <div key={training} className="flex items-center gap-2">
                      <CheckIcon />
                      <span className="text-sm text-gray-700">{training}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages Spoken */}
            {languagesSpoken.length > 0 && (
              <div>
                <p className="font-medium text-gray-900 mb-2">Languages Spoken</p>
                <div className="flex flex-wrap gap-2">
                  {languagesSpoken.map((language) => (
                    <span
                      key={language}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
