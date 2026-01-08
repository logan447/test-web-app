"use client";

interface CareNeedsData {
  careLevel?: string;
  medicalConditions?: string[];
  mobilityStatus?: string;
  dailyLivingAssistance?: string[];
  additionalNeeds?: string;
}

interface CareNeedsAssessmentProps {
  data: CareNeedsData;
  onDataChange: (field: keyof CareNeedsData, value: any) => void;
}

export default function CareNeedsAssessment({
  data,
  onDataChange,
}: CareNeedsAssessmentProps) {
  const careLevels = [
    {
      value: "independent",
      label: "Independent Living",
      description: "Mostly independent, needs minimal assistance",
    },
    {
      value: "some-assistance",
      label: "Some Assistance",
      description: "Needs help with a few daily tasks",
    },
    {
      value: "moderate-care",
      label: "Moderate Care",
      description: "Requires regular assistance with daily activities",
    },
    {
      value: "memory-care",
      label: "Memory Care",
      description: "Specialized care for dementia or Alzheimer's",
    },
    {
      value: "skilled-nursing",
      label: "Skilled Nursing",
      description: "24/7 medical care and supervision",
    },
    {
      value: "hospice",
      label: "Hospice Care",
      description: "End-of-life comfort care",
    },
  ];

  const medicalConditions = [
    { value: "alzheimers-dementia", label: "Alzheimer's/Dementia" },
    { value: "parkinsons", label: "Parkinson's Disease" },
    { value: "stroke-recovery", label: "Stroke Recovery" },
    { value: "diabetes", label: "Diabetes" },
    { value: "heart-disease", label: "Heart Disease" },
    { value: "mobility-issues", label: "Mobility Issues" },
    { value: "vision-hearing", label: "Vision/Hearing Impairment" },
    { value: "mental-health", label: "Mental Health Needs" },
    { value: "cancer", label: "Cancer" },
    { value: "copd-respiratory", label: "COPD/Respiratory Issues" },
    { value: "arthritis", label: "Arthritis" },
    { value: "kidney-disease", label: "Kidney Disease" },
    { value: "none", label: "None of the above" },
  ];

  const mobilityStatuses = [
    {
      value: "fully-mobile",
      label: "Fully Mobile",
      description: "Can walk independently without assistance",
    },
    {
      value: "uses-cane",
      label: "Uses Cane",
      description: "Walks with cane or similar support",
    },
    {
      value: "uses-walker",
      label: "Uses Walker",
      description: "Requires walker for mobility",
    },
    {
      value: "uses-wheelchair",
      label: "Uses Wheelchair",
      description: "Primary mobility is via wheelchair",
    },
    {
      value: "bedridden",
      label: "Bedridden",
      description: "Limited to bed, requires assistance for movement",
    },
  ];

  const dailyLivingActivities = [
    { value: "bathing", label: "Bathing/Showering" },
    { value: "dressing", label: "Dressing" },
    { value: "eating", label: "Eating/Feeding" },
    { value: "toileting", label: "Toileting" },
    { value: "transferring", label: "Transferring (bed to chair)" },
    { value: "medication", label: "Medication Management" },
    { value: "meal-prep", label: "Meal Preparation" },
    { value: "housekeeping", label: "Light Housekeeping" },
    { value: "laundry", label: "Laundry" },
    { value: "transportation", label: "Transportation" },
    { value: "companionship", label: "Companionship/Social Activities" },
    { value: "financial", label: "Financial Management" },
  ];

  const handleConditionToggle = (value: string) => {
    const currentConditions = data.medicalConditions || [];

    // If selecting "none", clear all other selections
    if (value === "none") {
      onDataChange("medicalConditions", ["none"]);
      return;
    }

    // If selecting something else, remove "none" if it's there
    const withoutNone = currentConditions.filter((c) => c !== "none");

    if (currentConditions.includes(value)) {
      // Remove the value
      const updated = withoutNone.filter((c) => c !== value);
      onDataChange("medicalConditions", updated);
    } else {
      // Add the value
      onDataChange("medicalConditions", [...withoutNone, value]);
    }
  };

  const handleADLToggle = (value: string) => {
    const currentADLs = data.dailyLivingAssistance || [];

    if (currentADLs.includes(value)) {
      const updated = currentADLs.filter((a) => a !== value);
      onDataChange("dailyLivingAssistance", updated);
    } else {
      onDataChange("dailyLivingAssistance", [...currentADLs, value]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Care Needs Assessment
        </h2>
        <p className="text-sm text-gray-600">
          Help us understand the level and type of care needed so we can match
          you with the most appropriate providers.
        </p>
      </div>

      {/* Level of Care Needed */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Level of Care Needed
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="space-y-3">
          {careLevels.map((level) => (
            <label
              key={level.value}
              className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                data.careLevel === level.value
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="careLevel"
                value={level.value}
                checked={data.careLevel === level.value}
                onChange={(e) => onDataChange("careLevel", e.target.value)}
                className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{level.label}</div>
                <div className="text-sm text-gray-600">{level.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Medical Conditions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Specific Medical Conditions
          <span className="text-gray-500 font-normal ml-1">
            (Select all that apply)
          </span>
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          {medicalConditions.map((condition) => (
            <label
              key={condition.value}
              className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                data.medicalConditions?.includes(condition.value)
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                checked={data.medicalConditions?.includes(condition.value) || false}
                onChange={() => handleConditionToggle(condition.value)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
              />
              <span className="text-sm font-medium text-gray-900">
                {condition.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Mobility Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Mobility Status
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="space-y-3">
          {mobilityStatuses.map((status) => (
            <label
              key={status.value}
              className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                data.mobilityStatus === status.value
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="mobilityStatus"
                value={status.value}
                checked={data.mobilityStatus === status.value}
                onChange={(e) => onDataChange("mobilityStatus", e.target.value)}
                className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{status.label}</div>
                <div className="text-sm text-gray-600">{status.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Daily Living Assistance (ADLs) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Daily Living Assistance Needed
          <span className="text-gray-500 font-normal ml-1">
            (Select all that apply)
          </span>
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Also known as Activities of Daily Living (ADLs) and Instrumental ADLs
          (IADLs)
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {dailyLivingActivities.map((activity) => (
            <label
              key={activity.value}
              className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                data.dailyLivingAssistance?.includes(activity.value)
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                checked={data.dailyLivingAssistance?.includes(activity.value) || false}
                onChange={() => handleADLToggle(activity.value)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
              />
              <span className="text-sm font-medium text-gray-900">
                {activity.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Care Needs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Care Needs or Details (Optional)
        </label>
        <textarea
          value={data.additionalNeeds || ""}
          onChange={(e) => onDataChange("additionalNeeds", e.target.value)}
          rows={4}
          placeholder="Please describe any specific care requirements, behavioral needs, dietary restrictions, or other important details that would help providers understand your loved one's situation..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Include information about personality, communication needs, sleep
          patterns, dietary preferences, or anything else that would help
          providers prepare for care.
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
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
          <div className="flex-1">
            <p className="text-sm text-amber-900">
              <span className="font-semibold">Why this matters:</span> Providing
              detailed care needs helps us match you with providers who have the
              right experience, certifications, and resources to provide quality
              care. The more specific you are, the better we can serve you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
