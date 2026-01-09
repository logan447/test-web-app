"use client";

import { useState } from "react";

export interface AmenitiesFeaturesData {
  roomFeatures: string[];
  commonAreas: string[];
  safetySecurityFeatures: string[];
  medicalAmenities: string[];
  activitiesPrograms: string[];
  dietaryOptions: string[];
}

interface AmenitiesFeaturesSectionProps {
  data: AmenitiesFeaturesData;
  onChange: (data: AmenitiesFeaturesData) => void;
}

const AMENITIES_CATEGORIES = {
  roomFeatures: {
    title: "Room Features",
    icon: "🛏️",
    description: "Accommodations and in-room amenities available to residents",
    features: [
      { id: "private_rooms", label: "Private Rooms Available", icon: "🚪" },
      { id: "shared_rooms", label: "Semi-Private/Shared Rooms", icon: "👥" },
      { id: "private_bathrooms", label: "Private Bathrooms", icon: "🚿" },
      { id: "kitchenette", label: "Kitchenette/Mini Fridge", icon: "🍳" },
      { id: "cable_tv", label: "Cable TV", icon: "📺" },
      { id: "wifi", label: "WiFi/Internet Access", icon: "📶" },
      { id: "telephone", label: "In-Room Telephone", icon: "☎️" },
      { id: "emergency_call", label: "Emergency Call System", icon: "🚨" },
      { id: "climate_control", label: "Individual Climate Control", icon: "🌡️" },
      { id: "furnished", label: "Furnished Rooms", icon: "🪑" },
      { id: "balcony_patio", label: "Balcony or Patio", icon: "🏡" },
      { id: "storage", label: "Personal Storage Space", icon: "🗄️" },
    ],
  },
  commonAreas: {
    title: "Common Areas & Facilities",
    icon: "🏛️",
    description: "Shared spaces and facilities available to all residents",
    features: [
      { id: "dining_room", label: "Dining Room", icon: "🍽️" },
      { id: "library", label: "Library/Reading Room", icon: "📚" },
      { id: "tv_movie_room", label: "TV/Movie Room", icon: "🎬" },
      { id: "game_room", label: "Game Room/Recreation Area", icon: "🎮" },
      { id: "fitness_center", label: "Fitness Center/Gym", icon: "💪" },
      { id: "beauty_salon", label: "Beauty Salon/Barber Shop", icon: "💇" },
      { id: "chapel", label: "Chapel/Meditation Room", icon: "🕊️" },
      { id: "outdoor_patio", label: "Outdoor Patio/Terrace", icon: "☀️" },
      { id: "garden", label: "Garden/Courtyard", icon: "🌻" },
      { id: "walking_paths", label: "Walking Paths/Trails", icon: "🚶" },
      { id: "pool", label: "Pool/Spa", icon: "🏊" },
      { id: "parking", label: "Visitor Parking", icon: "🅿️" },
    ],
  },
  safetySecurityFeatures: {
    title: "Safety & Security",
    icon: "🛡️",
    description: "Safety systems and security measures to protect residents",
    features: [
      { id: "monitoring_24_7", label: "24/7 Security Monitoring", icon: "📹" },
      { id: "emergency_response", label: "Emergency Response System", icon: "🆘" },
      { id: "secured_entries", label: "Secured Building Entrances", icon: "🔐" },
      { id: "fire_safety", label: "Fire Safety/Sprinkler System", icon: "🔥" },
      { id: "backup_generator", label: "Backup Power Generator", icon: "⚡" },
      { id: "wheelchair_accessible", label: "Wheelchair Accessible", icon: "♿" },
      { id: "smoke_detectors", label: "Smoke/CO Detectors", icon: "🚨" },
      { id: "well_lit", label: "Well-Lit Common Areas", icon: "💡" },
      { id: "handrails", label: "Handrails/Grab Bars", icon: "🤝" },
      { id: "non_slip", label: "Non-Slip Flooring", icon: "👟" },
    ],
  },
  medicalAmenities: {
    title: "Medical Amenities",
    icon: "⚕️",
    description: "Healthcare facilities and medical equipment available on-site",
    features: [
      { id: "exam_room", label: "On-Site Exam Room", icon: "🏥" },
      { id: "therapy_room", label: "Physical Therapy Room", icon: "🦴" },
      { id: "medication_management", label: "Secure Medication Storage", icon: "💊" },
      { id: "oxygen_available", label: "Oxygen Equipment Available", icon: "🫁" },
      { id: "medical_equipment", label: "Medical Equipment (walkers, wheelchairs)", icon: "🦽" },
      { id: "nurse_station", label: "24/7 Nurse Station", icon: "👨‍⚕️" },
    ],
  },
  activitiesPrograms: {
    title: "Activities & Programs",
    icon: "🎨",
    description: "Recreational activities and programs offered to residents",
    features: [
      { id: "arts_crafts", label: "Arts & Crafts", icon: "🎨" },
      { id: "music_programs", label: "Music Programs/Performances", icon: "🎵" },
      { id: "exercise_classes", label: "Exercise/Fitness Classes", icon: "🏃" },
      { id: "game_nights", label: "Game Nights/Social Events", icon: "🎲" },
      { id: "movie_screenings", label: "Movie Screenings", icon: "🎥" },
      { id: "educational", label: "Educational Classes", icon: "📖" },
      { id: "gardening", label: "Gardening Programs", icon: "🌱" },
      { id: "pet_therapy", label: "Pet Therapy Visits", icon: "🐕" },
      { id: "outings", label: "Community Outings", icon: "🚌" },
      { id: "religious_services", label: "Religious Services", icon: "⛪" },
      { id: "volunteer", label: "Volunteer Opportunities", icon: "🤝" },
    ],
  },
  dietaryOptions: {
    title: "Dining & Dietary Options",
    icon: "🍴",
    description: "Meal services and special dietary accommodations",
    features: [
      { id: "chef_prepared", label: "Chef-Prepared Meals", icon: "👨‍🍳" },
      { id: "special_diets", label: "Special Diet Accommodations", icon: "🥗" },
      { id: "vegetarian", label: "Vegetarian Options", icon: "🥕" },
      { id: "diabetic_friendly", label: "Diabetic-Friendly Meals", icon: "🩺" },
      { id: "low_sodium", label: "Low-Sodium Options", icon: "🧂" },
      { id: "gluten_free", label: "Gluten-Free Options", icon: "🌾" },
      { id: "kosher_halal", label: "Kosher/Halal Options", icon: "🕌" },
      { id: "snacks_available", label: "Snacks Available 24/7", icon: "🍪" },
      { id: "dining_room_service", label: "Restaurant-Style Dining", icon: "🍽️" },
      { id: "private_dining", label: "Private Dining for Families", icon: "🍴" },
    ],
  },
};

export default function AmenitiesFeaturesSection({
  data,
  onChange,
}: AmenitiesFeaturesSectionProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "roomFeatures",
    "commonAreas",
  ]);

  const toggleFeature = (
    category: keyof typeof AMENITIES_CATEGORIES,
    featureId: string
  ) => {
    const categoryMap = {
      roomFeatures: "roomFeatures",
      commonAreas: "commonAreas",
      safetySecurityFeatures: "safetySecurityFeatures",
      medicalAmenities: "medicalAmenities",
      activitiesPrograms: "activitiesPrograms",
      dietaryOptions: "dietaryOptions",
    } as const;

    const field = categoryMap[category];
    const currentFeatures = data[field] || [];
    const newFeatures = currentFeatures.includes(featureId)
      ? currentFeatures.filter((f) => f !== featureId)
      : [...currentFeatures, featureId];

    onChange({ ...data, [field]: newFeatures });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const getFeatureCount = (category: keyof typeof AMENITIES_CATEGORIES) => {
    const categoryMap = {
      roomFeatures: data.roomFeatures?.length || 0,
      commonAreas: data.commonAreas?.length || 0,
      safetySecurityFeatures: data.safetySecurityFeatures?.length || 0,
      medicalAmenities: data.medicalAmenities?.length || 0,
      activitiesPrograms: data.activitiesPrograms?.length || 0,
      dietaryOptions: data.dietaryOptions?.length || 0,
    };
    return categoryMap[category];
  };

  const getTotalFeatureCount = () => {
    return (
      (data.roomFeatures?.length || 0) +
      (data.commonAreas?.length || 0) +
      (data.safetySecurityFeatures?.length || 0) +
      (data.medicalAmenities?.length || 0) +
      (data.activitiesPrograms?.length || 0) +
      (data.dietaryOptions?.length || 0)
    );
  };

  return (
    <div className="space-y-6">
      {/* Amenities Guidance */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Showcase Your Amenities
            </h4>
            <p className="text-sm text-blue-800">
              Highlighting your amenities and features helps families visualize life at your
              facility. Profiles with detailed amenities get 3x more inquiries.
            </p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {Object.entries(AMENITIES_CATEGORIES).map(([categoryKey, category]) => {
          const isExpanded = expandedCategories.includes(categoryKey);
          const featureCount = getFeatureCount(
            categoryKey as keyof typeof AMENITIES_CATEGORIES
          );
          const totalFeatures = category.features.length;

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
                  {featureCount > 0 && (
                    <span className="text-xs font-medium text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
                      {featureCount} selected
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

              {/* Features Grid */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {category.features.map((feature) => {
                      const categoryMap = {
                        roomFeatures: data.roomFeatures || [],
                        commonAreas: data.commonAreas || [],
                        safetySecurityFeatures: data.safetySecurityFeatures || [],
                        medicalAmenities: data.medicalAmenities || [],
                        activitiesPrograms: data.activitiesPrograms || [],
                        dietaryOptions: data.dietaryOptions || [],
                      };
                      const isSelected = categoryMap[
                        categoryKey as keyof typeof categoryMap
                      ].includes(feature.id);

                      return (
                        <label
                          key={feature.id}
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
                              toggleFeature(
                                categoryKey as keyof typeof AMENITIES_CATEGORIES,
                                feature.id
                              )
                            }
                            className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <div className="ml-3">
                            <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              <span>{feature.icon}</span>
                              {feature.label}
                            </span>
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
                          roomFeatures: "roomFeatures",
                          commonAreas: "commonAreas",
                          safetySecurityFeatures: "safetySecurityFeatures",
                          medicalAmenities: "medicalAmenities",
                          activitiesPrograms: "activitiesPrograms",
                          dietaryOptions: "dietaryOptions",
                        } as const;
                        const field = categoryMap[categoryKey as keyof typeof categoryMap];
                        const allFeatureIds = category.features.map((f) => f.id);
                        onChange({ ...data, [field]: allFeatureIds });
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
                          roomFeatures: "roomFeatures",
                          commonAreas: "commonAreas",
                          safetySecurityFeatures: "safetySecurityFeatures",
                          medicalAmenities: "medicalAmenities",
                          activitiesPrograms: "activitiesPrograms",
                          dietaryOptions: "dietaryOptions",
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

      {/* Summary */}
      {getTotalFeatureCount() > 0 && (
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
                Amenities Summary
              </h4>
              <p className="text-sm text-green-800">
                You&apos;ve highlighted {getTotalFeatureCount()} amenities and features. This
                comprehensive showcase helps families understand what makes your facility special!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
