"use client";

interface AmenitiesSectionProps {
  roomFeatures: string[];
  commonAreas: string[];
  medicalServices: string[];
  activitiesOffered: string[];
  dietaryOptions: string[];
}

export default function AmenitiesSection({
  roomFeatures,
  commonAreas,
  medicalServices,
  activitiesOffered,
  dietaryOptions,
}: AmenitiesSectionProps) {
  // Don't render if no amenities are provided
  const hasAmenities =
    roomFeatures.length > 0 ||
    commonAreas.length > 0 ||
    medicalServices.length > 0 ||
    activitiesOffered.length > 0 ||
    dietaryOptions.length > 0;

  if (!hasAmenities) {
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
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Amenities & Services
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Room Features */}
        {roomFeatures.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <h3 className="font-semibold text-gray-900">Room Features</h3>
            </div>
            <ul className="space-y-2">
              {roomFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckIcon />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Common Areas */}
        {commonAreas.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h3 className="font-semibold text-gray-900">Common Areas</h3>
            </div>
            <ul className="space-y-2">
              {commonAreas.map((area) => (
                <li key={area} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckIcon />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Medical Services */}
        {medicalServices.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
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
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <h3 className="font-semibold text-gray-900">Medical Services</h3>
            </div>
            <ul className="space-y-2">
              {medicalServices.map((service) => (
                <li key={service} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckIcon />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Activities */}
        {activitiesOffered.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
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
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="font-semibold text-gray-900">Activities & Programs</h3>
            </div>
            <ul className="space-y-2">
              {activitiesOffered.map((activity) => (
                <li key={activity} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckIcon />
                  <span>{activity}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Dietary Options */}
        {dietaryOptions.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <h3 className="font-semibold text-gray-900">Dining Options</h3>
            </div>
            <ul className="space-y-2">
              {dietaryOptions.map((option) => (
                <li key={option} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckIcon />
                  <span>{option}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
