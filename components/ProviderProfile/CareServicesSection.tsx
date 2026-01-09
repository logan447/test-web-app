"use client";

import { useState } from "react";

export interface CareServicesData {
  // High-level care types (original)
  careTypes: string[];

  // Detailed services by category
  medicalServices: string[];
  personalCareServices: string[];
  dailyLivingServices: string[];
  memoryCareServices: string[];
  socialRecreationServices: string[];
}

interface CareServicesSectionProps {
  data: CareServicesData;
  onChange: (data: CareServicesData) => void;
}

const CARE_TYPES = [
  {
    value: "HOME_CARE",
    label: "Home Care",
    description: "Non-medical assistance with daily activities in the client's home",
    icon: "🏡"
  },
  {
    value: "HOME_HEALTH",
    label: "Home Health",
    description: "Skilled nursing and therapy services provided at home",
    icon: "🏥"
  },
  {
    value: "ASSISTED_LIVING",
    label: "Assisted Living",
    description: "Residential care with personal care services and activities",
    icon: "🏘️"
  },
  {
    value: "INDEPENDENT_LIVING",
    label: "Independent Living",
    description: "Housing for active seniors with community amenities",
    icon: "🏢"
  },
  {
    value: "MEMORY_CARE",
    label: "Memory Care",
    description: "Specialized care for dementia and Alzheimer's patients",
    icon: "🧠"
  },
  {
    value: "NURSING_HOME",
    label: "Nursing Home",
    description: "24/7 skilled nursing care for complex medical needs",
    icon: "🏨"
  },
  {
    value: "HOSPICE",
    label: "Hospice",
    description: "Compassionate end-of-life care and support",
    icon: "💝"
  },
  {
    value: "REHABILITATION",
    label: "Rehabilitation",
    description: "Short-term recovery care after surgery or illness",
    icon: "💪"
  },
];

const SERVICE_CATEGORIES = {
  medical: {
    title: "Medical Services",
    icon: "⚕️",
    description: "Clinical and nursing services provided by licensed medical professionals",
    services: [
      { id: "nursing_24_7", label: "24/7 Nursing Care", description: "Round-the-clock registered or licensed nurses" },
      { id: "medication_management", label: "Medication Management", description: "Administration and monitoring of medications" },
      { id: "physical_therapy", label: "Physical Therapy", description: "Rehabilitation exercises and mobility training" },
      { id: "occupational_therapy", label: "Occupational Therapy", description: "Daily living skills and adaptive techniques" },
      { id: "speech_therapy", label: "Speech Therapy", description: "Communication and swallowing therapy" },
      { id: "wound_care", label: "Wound Care", description: "Professional treatment of wounds and pressure sores" },
      { id: "iv_therapy", label: "IV Therapy", description: "Intravenous medication and hydration" },
      { id: "dialysis", label: "Dialysis", description: "Kidney dialysis services or transportation" },
    ],
  },
  personal: {
    title: "Personal Care",
    icon: "🫧",
    description: "Hands-on assistance with personal hygiene and self-care activities",
    services: [
      { id: "bathing", label: "Bathing Assistance", description: "Help with showers, baths, and personal hygiene" },
      { id: "dressing", label: "Dressing Assistance", description: "Help selecting and putting on clothing" },
      { id: "grooming", label: "Grooming", description: "Hair care, shaving, nail care, and appearance" },
      { id: "toileting", label: "Toileting Assistance", description: "Bathroom assistance and incontinence care" },
      { id: "mobility", label: "Mobility Assistance", description: "Help with walking, standing, and positioning" },
      { id: "transfers", label: "Transfer Assistance", description: "Safe transfers between bed, chair, wheelchair" },
    ],
  },
  dailyLiving: {
    title: "Daily Living Support",
    icon: "🏠",
    description: "Assistance with household tasks and everyday activities",
    services: [
      { id: "meals", label: "Meal Preparation", description: "Cooking, serving, and dietary accommodations" },
      { id: "housekeeping", label: "Housekeeping", description: "Cleaning, tidying, and home maintenance" },
      { id: "laundry", label: "Laundry", description: "Washing, drying, and folding clothes and linens" },
      { id: "transportation", label: "Transportation", description: "Rides to appointments, errands, and outings" },
      { id: "shopping", label: "Grocery Shopping", description: "Shopping assistance and delivery" },
      { id: "med_reminders", label: "Medication Reminders", description: "Reminders to take prescribed medications" },
    ],
  },
  memoryCare: {
    title: "Memory Care",
    icon: "🧩",
    description: "Specialized services for cognitive impairment and dementia care",
    services: [
      { id: "secure_environment", label: "Secure Environment", description: "Safe, monitored spaces with controlled access" },
      { id: "cognitive_activities", label: "Cognitive Activities", description: "Brain stimulation and memory exercises" },
      { id: "behavioral_management", label: "Behavioral Management", description: "Trained staff for challenging behaviors" },
      { id: "wandering_prevention", label: "Wandering Prevention", description: "Monitoring systems and safety protocols" },
    ],
  },
  socialRecreation: {
    title: "Social & Recreation",
    icon: "🎨",
    description: "Activities, programs, and social engagement opportunities",
    services: [
      { id: "group_activities", label: "Group Activities", description: "Social events and group programs" },
      { id: "exercise", label: "Exercise Programs", description: "Fitness classes and physical activities" },
      { id: "arts_crafts", label: "Arts & Crafts", description: "Creative activities and projects" },
      { id: "music_therapy", label: "Music Therapy", description: "Therapeutic music sessions and performances" },
      { id: "pet_therapy", label: "Pet Therapy", description: "Animal-assisted therapy and visits" },
      { id: "religious", label: "Religious Services", description: "Spiritual care and religious activities" },
      { id: "outings", label: "Outings & Field Trips", description: "Community excursions and events" },
    ],
  },
};

export default function CareServicesSection({ data, onChange }: CareServicesSectionProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["medical", "personal"]);

  const toggleCareType = (value: string) => {
    const newCareTypes = data.careTypes.includes(value)
      ? data.careTypes.filter((t) => t !== value)
      : [...data.careTypes, value];
    onChange({ ...data, careTypes: newCareTypes });
  };

  const toggleService = (category: keyof typeof SERVICE_CATEGORIES, serviceId: string) => {
    const categoryMap = {
      medical: "medicalServices",
      personal: "personalCareServices",
      dailyLiving: "dailyLivingServices",
      memoryCare: "memoryCareServices",
      socialRecreation: "socialRecreationServices",
    } as const;

    const field = categoryMap[category];
    const currentServices = data[field] || [];
    const newServices = currentServices.includes(serviceId)
      ? currentServices.filter((s) => s !== serviceId)
      : [...currentServices, serviceId];

    onChange({ ...data, [field]: newServices });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const getServiceCount = (category: keyof typeof SERVICE_CATEGORIES) => {
    const categoryMap = {
      medical: data.medicalServices?.length || 0,
      personal: data.personalCareServices?.length || 0,
      dailyLiving: data.dailyLivingServices?.length || 0,
      memoryCare: data.memoryCareServices?.length || 0,
      socialRecreation: data.socialRecreationServices?.length || 0,
    };
    return categoryMap[category];
  };

  return (
    <div className="space-y-8">
      {/* High-Level Care Types */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Primary Care Setting *</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select the primary type of care your facility or service provides
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CARE_TYPES.map((type) => (
            <label
              key={type.value}
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                data.careTypes.includes(type.value)
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={data.careTypes.includes(type.value)}
                onChange={() => toggleCareType(type.value)}
                className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{type.icon}</span>
                  <span className="font-medium text-gray-900">{type.label}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{type.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Detailed Services */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Services Offered</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select all specific services you provide. This helps families find exactly what they need.
        </p>

        <div className="space-y-3">
          {Object.entries(SERVICE_CATEGORIES).map(([categoryKey, category]) => {
            const isExpanded = expandedCategories.includes(categoryKey);
            const serviceCount = getServiceCount(categoryKey as keyof typeof SERVICE_CATEGORIES);
            const totalServices = category.services.length;

            return (
              <div
                key={categoryKey}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white"
              >
                {/* Category Header */}
                <button
                  type="button"
                  onClick={() => toggleCategory(categoryKey)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 text-left">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{category.title}</h4>
                      <p className="text-xs text-gray-600 mt-0.5">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {serviceCount > 0 && (
                      <span className="text-xs font-medium text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
                        {serviceCount} selected
                      </span>
                    )}
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        isExpanded ? "transform rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Services List */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {category.services.map((service) => {
                        const categoryMap = {
                          medical: data.medicalServices || [],
                          personal: data.personalCareServices || [],
                          dailyLiving: data.dailyLivingServices || [],
                          memoryCare: data.memoryCareServices || [],
                          socialRecreation: data.socialRecreationServices || [],
                        };
                        const isSelected = categoryMap[categoryKey as keyof typeof categoryMap].includes(
                          service.id
                        );

                        return (
                          <label
                            key={service.id}
                            className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${
                              isSelected
                                ? "border-primary-400 bg-white shadow-sm"
                                : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() =>
                                toggleService(
                                  categoryKey as keyof typeof SERVICE_CATEGORIES,
                                  service.id
                                )
                              }
                              className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <div className="ml-3">
                              <span className="text-sm font-medium text-gray-900 block">
                                {service.label}
                              </span>
                              <span className="text-xs text-gray-600">{service.description}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    {/* Select All / Deselect All */}
                    <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const categoryMap = {
                            medical: "medicalServices",
                            personal: "personalCareServices",
                            dailyLiving: "dailyLivingServices",
                            memoryCare: "memoryCareServices",
                            socialRecreation: "socialRecreationServices",
                          } as const;
                          const field = categoryMap[categoryKey as keyof typeof categoryMap];
                          const allServiceIds = category.services.map((s) => s.id);
                          onChange({ ...data, [field]: allServiceIds });
                        }}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Select All
                      </button>
                      <span className="text-xs text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={() => {
                          const categoryMap = {
                            medical: "medicalServices",
                            personal: "personalCareServices",
                            dailyLiving: "dailyLivingServices",
                            memoryCare: "memoryCareServices",
                            socialRecreation: "socialRecreationServices",
                          } as const;
                          const field = categoryMap[categoryKey as keyof typeof categoryMap];
                          onChange({ ...data, [field]: [] });
                        }}
                        className="text-xs text-gray-600 hover:text-gray-700 font-medium"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      {(data.careTypes.length > 0 ||
        (data.medicalServices?.length || 0) > 0 ||
        (data.personalCareServices?.length || 0) > 0 ||
        (data.dailyLivingServices?.length || 0) > 0 ||
        (data.memoryCareServices?.length || 0) > 0 ||
        (data.socialRecreationServices?.length || 0) > 0) && (
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
              <h4 className="text-sm font-semibold text-green-900 mb-1">Services Summary</h4>
              <p className="text-sm text-green-800">
                You&apos;ve selected {data.careTypes.length} care type(s) and{" "}
                {(data.medicalServices?.length || 0) +
                  (data.personalCareServices?.length || 0) +
                  (data.dailyLivingServices?.length || 0) +
                  (data.memoryCareServices?.length || 0) +
                  (data.socialRecreationServices?.length || 0)}{" "}
                detailed service(s). Great job! Detailed service information helps families make
                informed decisions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
