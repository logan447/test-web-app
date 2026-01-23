"use client";

/**
 * FacilityTabs - Specialized tab content for senior living facilities
 * (Assisted Living, Memory Care, Nursing Home, Independent Living, Rehabilitation)
 */

interface FacilityData {
  // Basic info
  name: string;
  description: string | null;
  yearsInBusiness: number | null;

  // Capacity and availability
  totalCapacity: number | null;
  availableSpots: number | null;
  waitlistAvailable: boolean;

  // Staff info
  staffToResidentRatio: string | null;
  hasRNOnSite: boolean;
  hasLVNOnSite: boolean;
  allStaffBackgroundChecked: boolean;
  visitingDoctorFrequency: string | null;

  // Care programs
  hasMemoryCare: boolean;
  hasRespiteCare: boolean;
  hasHospiceCare: boolean;
  specialtyPrograms: string[];
  careTypesOffered: string[];
  medicalServices: string[];

  // Amenities
  roomFeatures: string[];
  commonAreas: string[];
  activitiesOffered: string[];
  dietaryOptions: string[];

  // Credentials
  licensed: boolean;
  licenseNumber: string | null;
  certifications: string[];
  insuranceVerified: boolean;
  languagesSpoken: string[];

  // Pricing
  priceMin: number | null;
  priceMax: number | null;
  priceDescription: string | null;
  paymentOptions: string[];
}

interface FacilityTabsProps {
  provider: FacilityData;
  activeTab: string;
}

// Living Options Tab - specific to facilities
export function LivingOptionsTab({ provider }: { provider: FacilityData }) {
  return (
    <div className="space-y-6">
      {/* Availability Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Availability</h2>
        <div className="grid grid-cols-2 gap-4">
          {provider.totalCapacity && (
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-3xl font-bold text-gray-900">{provider.totalCapacity}</p>
              <p className="text-sm text-gray-500">Total Capacity</p>
            </div>
          )}
          <div className={`p-4 rounded-lg text-center ${
            provider.availableSpots !== null && provider.availableSpots > 0
              ? 'bg-green-50'
              : 'bg-amber-50'
          }`}>
            <p className={`text-3xl font-bold ${
              provider.availableSpots !== null && provider.availableSpots > 0
                ? 'text-green-600'
                : 'text-amber-600'
            }`}>
              {provider.availableSpots !== null && provider.availableSpots > 0
                ? provider.availableSpots
                : 'Full'}
            </p>
            <p className={`text-sm ${
              provider.availableSpots !== null && provider.availableSpots > 0
                ? 'text-green-600'
                : 'text-amber-600'
            }`}>
              {provider.availableSpots !== null && provider.availableSpots > 0
                ? 'Spots Available'
                : 'Currently'}
            </p>
          </div>
        </div>
        {provider.waitlistAvailable && provider.availableSpots === 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-blue-700 font-medium">Waitlist available - Contact to be added</span>
          </div>
        )}
      </div>

      {/* Care Levels */}
      {provider.careTypesOffered.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Care Levels Offered</h3>
          <p className="text-sm text-gray-600 mb-4">
            This community offers multiple levels of care to meet changing needs.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {provider.careTypesOffered.map((care) => (
              <div key={care} className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-primary-700 font-medium">
                  {care.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Room Amenities */}
      {provider.roomFeatures.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Features</h3>
          <div className="flex flex-wrap gap-2">
            {provider.roomFeatures.map((feature) => (
              <span key={feature} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Life Here Tab - activities and community life
export function LifeHereTab({ provider }: { provider: FacilityData }) {
  return (
    <div className="space-y-6">
      {/* Activities */}
      {provider.activitiesOffered.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Activities & Programs</h2>
          <p className="text-gray-600 mb-4">
            Our community offers a variety of activities designed to promote engagement, wellness, and social connection.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {provider.activitiesOffered.map((activity) => (
              <div key={activity} className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {activity}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Areas */}
      {provider.commonAreas.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Areas & Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {provider.commonAreas.map((area) => (
              <span key={area} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Dining */}
      {provider.dietaryOptions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dining & Nutrition</h3>
          <p className="text-gray-600 mb-4">
            We accommodate a variety of dietary needs and preferences.
          </p>
          <div className="flex flex-wrap gap-2">
            {provider.dietaryOptions.map((option) => (
              <span key={option} className="px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-full border border-green-200">
                {option}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Care & Medical Tab - staff and medical info
export function CareServicesTab({ provider }: { provider: FacilityData }) {
  return (
    <div className="space-y-6">
      {/* Staff Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Staff & Care Team</h2>
        <div className="space-y-3">
          {provider.staffToResidentRatio && (
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Staff to Resident Ratio</span>
              <span className="font-semibold text-gray-900">{provider.staffToResidentRatio}</span>
            </div>
          )}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Registered Nurse (RN) On-Site</span>
            <span className={`font-semibold ${provider.hasRNOnSite ? 'text-green-600' : 'text-gray-500'}`}>
              {provider.hasRNOnSite ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Licensed Vocational Nurse (LVN) On-Site</span>
            <span className={`font-semibold ${provider.hasLVNOnSite ? 'text-green-600' : 'text-gray-500'}`}>
              {provider.hasLVNOnSite ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">All Staff Background Checked</span>
            <span className={`font-semibold ${provider.allStaffBackgroundChecked ? 'text-green-600' : 'text-gray-500'}`}>
              {provider.allStaffBackgroundChecked ? 'Yes' : 'No'}
            </span>
          </div>
          {provider.visitingDoctorFrequency && (
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-600">Visiting Doctor</span>
              <span className="font-semibold text-gray-900">{provider.visitingDoctorFrequency}</span>
            </div>
          )}
        </div>
      </div>

      {/* Medical Services */}
      {provider.medicalServices.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Services</h3>
          <div className="grid grid-cols-2 gap-2">
            {provider.medicalServices.map((service) => (
              <div key={service} className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {service}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Specialty Programs */}
      {(provider.hasMemoryCare || provider.hasRespiteCare || provider.hasHospiceCare || provider.specialtyPrograms.length > 0) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Specialty Programs</h3>
          <div className="grid grid-cols-2 gap-3">
            {provider.hasMemoryCare && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="text-purple-700 font-medium">Memory Care</span>
              </div>
            )}
            {provider.hasRespiteCare && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-green-700 font-medium">Respite Care</span>
              </div>
            )}
            {provider.hasHospiceCare && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-blue-700 font-medium">Hospice Care</span>
              </div>
            )}
            {provider.specialtyPrograms.map((program) => (
              <div key={program} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span className="text-amber-700 font-medium">{program}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FacilityTabs({ provider, activeTab }: FacilityTabsProps) {
  switch (activeTab) {
    case "living":
      return <LivingOptionsTab provider={provider} />;
    case "life":
      return <LifeHereTab provider={provider} />;
    case "care":
      return <CareServicesTab provider={provider} />;
    default:
      return null;
  }
}
