"use client";

/**
 * HomeCareAgencyTabs - Specialized tab content for home care agencies
 * (Home Care, Home Health, Hospice)
 */

interface HomeCareAgencyData {
  // Basic info
  name: string;
  description: string | null;
  yearsInBusiness: number | null;

  // Service area
  serviceRadius: number | null;
  city: string;
  state: string;

  // Care services
  careTypesOffered: string[];
  medicalServices: string[];
  hasMemoryCare: boolean;
  hasRespiteCare: boolean;
  hasHospiceCare: boolean;
  specialtyPrograms: string[];

  // Caregiver info
  allStaffBackgroundChecked: boolean;
  caregiverTraining: string[];
  certifications: string[];
  languagesSpoken: string[];

  // Credentials
  licensed: boolean;
  licenseNumber: string | null;
  insuranceVerified: boolean;

  // Pricing
  priceMin: number | null;
  priceMax: number | null;
  priceDescription: string | null;
  paymentOptions: string[];
}

interface HomeCareAgencyTabsProps {
  provider: HomeCareAgencyData;
  activeTab: string;
}

// Our Caregivers Tab
export function OurCaregiversTab({ provider }: { provider: HomeCareAgencyData }) {
  return (
    <div className="space-y-6">
      {/* Caregiver Standards */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Our Caregiver Standards</h2>
        <p className="text-gray-600 mb-6">
          Every caregiver at {provider.name} meets our rigorous standards for quality and reliability.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${provider.allStaffBackgroundChecked ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${provider.allStaffBackgroundChecked ? 'bg-green-100' : 'bg-gray-200'}`}>
                <svg className={`w-5 h-5 ${provider.allStaffBackgroundChecked ? 'text-green-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Background Checked</p>
                <p className="text-sm text-gray-500">
                  {provider.allStaffBackgroundChecked ? 'All caregivers verified' : 'Information not available'}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${provider.licensed ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${provider.licensed ? 'bg-green-100' : 'bg-gray-200'}`}>
                <svg className={`w-5 h-5 ${provider.licensed ? 'text-green-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Licensed Agency</p>
                <p className="text-sm text-gray-500">
                  {provider.licensed ? `License #${provider.licenseNumber || 'Verified'}` : 'License status unknown'}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${provider.insuranceVerified ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${provider.insuranceVerified ? 'bg-green-100' : 'bg-gray-200'}`}>
                <svg className={`w-5 h-5 ${provider.insuranceVerified ? 'text-green-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Insured & Bonded</p>
                <p className="text-sm text-gray-500">
                  {provider.insuranceVerified ? 'Coverage verified' : 'Information not available'}
                </p>
              </div>
            </div>
          </div>

          {provider.yearsInBusiness && (
            <div className="p-4 rounded-lg bg-primary-50 border border-primary-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-100">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Established {provider.yearsInBusiness}+ Years</p>
                  <p className="text-sm text-gray-500">Serving families since {new Date().getFullYear() - provider.yearsInBusiness}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Training & Certifications */}
      {(provider.caregiverTraining.length > 0 || provider.certifications.length > 0) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Training & Certifications</h3>

          {provider.caregiverTraining.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Caregiver Training</p>
              <div className="flex flex-wrap gap-2">
                {provider.caregiverTraining.map((training) => (
                  <span key={training} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
                    {training}
                  </span>
                ))}
              </div>
            </div>
          )}

          {provider.certifications.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Agency Certifications</p>
              <div className="flex flex-wrap gap-2">
                {provider.certifications.map((cert) => (
                  <span key={cert} className="px-3 py-1.5 bg-amber-50 text-amber-700 text-sm rounded-full border border-amber-200">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Languages */}
      {provider.languagesSpoken.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Languages Spoken</h3>
          <p className="text-gray-600 mb-3">Our caregivers can communicate in multiple languages.</p>
          <div className="flex flex-wrap gap-2">
            {provider.languagesSpoken.map((lang) => (
              <span key={lang} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// How It Works Tab
export function HowItWorksTab({ provider }: { provider: HomeCareAgencyData }) {
  const steps = [
    {
      number: 1,
      title: "Initial Consultation",
      description: "We'll discuss your care needs, preferences, and answer any questions you have about our services.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      number: 2,
      title: "Care Assessment",
      description: "A care coordinator will visit to assess your loved one's needs and develop a personalized care plan.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      number: 3,
      title: "Caregiver Matching",
      description: "We'll match you with a caregiver whose skills and personality best fit your needs and preferences.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      number: 4,
      title: "Begin Care",
      description: "Care begins with regular check-ins and communication to ensure satisfaction and adjust the plan as needed.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Process Steps */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">How We Work</h2>
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-primary-200 hidden md:block" />

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.number} className="relative flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-lg z-10">
                  {step.number}
                </div>
                <div className="flex-1 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Area */}
      {provider.serviceRadius && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Area</h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{provider.serviceRadius} miles</p>
              <p className="text-gray-600">Service radius from {provider.city}, {provider.state}</p>
            </div>
          </div>
        </div>
      )}

      {/* What to Expect */}
      <div className="bg-primary-50 rounded-xl border border-primary-200 p-6">
        <h3 className="text-lg font-semibold text-primary-900 mb-3">What to Expect</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-primary-800">
            <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Meet your caregiver before care begins</span>
          </li>
          <li className="flex items-start gap-2 text-primary-800">
            <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Regular updates and communication</span>
          </li>
          <li className="flex items-start gap-2 text-primary-800">
            <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Flexible scheduling based on your needs</span>
          </li>
          <li className="flex items-start gap-2 text-primary-800">
            <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>24/7 support for emergencies</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

// Services Tab
export function ServicesTab({ provider }: { provider: HomeCareAgencyData }) {
  return (
    <div className="space-y-6">
      {/* Care Types */}
      {provider.careTypesOffered.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Care Services</h2>
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

      {/* Specialty Programs */}
      {(provider.hasMemoryCare || provider.hasRespiteCare || provider.hasHospiceCare || provider.specialtyPrograms.length > 0) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Specialized Care</h3>
          <div className="grid grid-cols-2 gap-3">
            {provider.hasMemoryCare && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="text-purple-700 font-medium">Memory Care</span>
              </div>
            )}
            {provider.hasRespiteCare && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-green-700 font-medium">Respite Care</span>
              </div>
            )}
            {provider.hasHospiceCare && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-blue-700 font-medium">Hospice Care</span>
              </div>
            )}
            {provider.specialtyPrograms.map((program) => (
              <div key={program} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span className="text-amber-700 font-medium">{program}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
    </div>
  );
}

export default function HomeCareAgencyTabs({ provider, activeTab }: HomeCareAgencyTabsProps) {
  switch (activeTab) {
    case "caregivers":
      return <OurCaregiversTab provider={provider} />;
    case "how-it-works":
      return <HowItWorksTab provider={provider} />;
    case "services":
      return <ServicesTab provider={provider} />;
    default:
      return null;
  }
}
