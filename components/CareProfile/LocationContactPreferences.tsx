"use client";

interface LocationContactData {
  careSettingPreference?: string;
  proximityImportance?: string;
  proximityDetails?: string;
  neighborhoodPreferences?: string;
  preferredContactMethods?: string[];
  bestTimeToContact?: string[];
  tourPreference?: string;
  communicationFrequency?: string;
  additionalContactNotes?: string;
}

interface LocationContactPreferencesProps {
  data: LocationContactData;
  onDataChange: (field: keyof LocationContactData, value: any) => void;
}

export default function LocationContactPreferences({
  data,
  onDataChange,
}: LocationContactPreferencesProps) {
  const careSettings = [
    {
      value: "in-home",
      label: "In-Home Care",
      description: "Care provided in loved one's current home",
    },
    {
      value: "family-home",
      label: "Family Member's Home",
      description: "Moving in with family who will coordinate care",
    },
    {
      value: "assisted-living",
      label: "Assisted Living Facility",
      description: "Independent living with assistance available",
    },
    {
      value: "memory-care",
      label: "Memory Care Facility",
      description: "Specialized facility for dementia/Alzheimer's",
    },
    {
      value: "nursing-home",
      label: "Nursing Home",
      description: "24/7 skilled nursing care in facility",
    },
    {
      value: "independent-living",
      label: "Independent Living Community",
      description: "Senior community with minimal care needs",
    },
    {
      value: "flexible",
      label: "Flexible / Open to Options",
      description: "Will consider various care settings",
    },
  ];

  const proximityOptions = [
    {
      value: "very-important",
      label: "Very Important",
      description: "Must be within a specific distance",
    },
    {
      value: "somewhat-important",
      label: "Somewhat Important",
      description: "Prefer nearby but willing to travel",
    },
    {
      value: "not-important",
      label: "Not Important",
      description: "Quality of care matters more than location",
    },
  ];

  const contactMethods = [
    { value: "phone", label: "Phone Call", icon: "📞" },
    { value: "text", label: "Text Message", icon: "💬" },
    { value: "email", label: "Email", icon: "📧" },
    { value: "video-call", label: "Video Call", icon: "📹" },
    { value: "in-person", label: "In-Person Meeting", icon: "🤝" },
  ];

  const bestTimes = [
    { value: "morning", label: "Morning (8am-12pm)" },
    { value: "afternoon", label: "Afternoon (12pm-5pm)" },
    { value: "evening", label: "Evening (5pm-8pm)" },
    { value: "anytime", label: "Anytime" },
    { value: "weekdays-only", label: "Weekdays Only" },
    { value: "weekends-ok", label: "Weekends OK" },
  ];

  const tourPreferences = [
    {
      value: "asap",
      label: "As Soon As Possible",
      description: "Ready to schedule tours immediately",
    },
    {
      value: "scheduled",
      label: "Scheduled Appointments",
      description: "Prefer to schedule tours in advance",
    },
    {
      value: "virtual-first",
      label: "Virtual Tours First",
      description: "Start with video tours before in-person visits",
    },
    {
      value: "not-ready",
      label: "Not Ready Yet",
      description: "Just gathering information for now",
    },
  ];

  const communicationFrequencies = [
    {
      value: "daily",
      label: "Daily Updates",
      description: "Want frequent communication during search",
    },
    {
      value: "few-times-week",
      label: "Few Times Per Week",
      description: "Regular check-ins and updates",
    },
    {
      value: "weekly",
      label: "Weekly",
      description: "Once a week is sufficient",
    },
    {
      value: "as-needed",
      label: "As Needed",
      description: "Only contact when there's something important",
    },
  ];

  const handleContactMethodToggle = (value: string) => {
    const current = data.preferredContactMethods || [];

    if (current.includes(value)) {
      const updated = current.filter((m) => m !== value);
      onDataChange("preferredContactMethods", updated);
    } else {
      onDataChange("preferredContactMethods", [...current, value]);
    }
  };

  const handleBestTimeToggle = (value: string) => {
    const current = data.bestTimeToContact || [];

    if (current.includes(value)) {
      const updated = current.filter((t) => t !== value);
      onDataChange("bestTimeToContact", updated);
    } else {
      onDataChange("bestTimeToContact", [...current, value]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Location & Contact Preferences
        </h2>
        <p className="text-sm text-gray-600">
          Help providers understand your location needs and how you prefer to communicate.
        </p>
      </div>

      {/* Care Setting Preference */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Preferred Care Setting
          <span className="text-gray-500 font-normal ml-1">
            (Where would care be provided?)
          </span>
        </label>
        <div className="space-y-3">
          {careSettings.map((setting) => (
            <label
              key={setting.value}
              className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                data.careSettingPreference === setting.value
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="careSettingPreference"
                value={setting.value}
                checked={data.careSettingPreference === setting.value}
                onChange={(e) =>
                  onDataChange("careSettingPreference", e.target.value)
                }
                className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">
                  {setting.label}
                </div>
                <div className="text-sm text-gray-600">{setting.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Proximity Importance */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          How Important is Proximity to Family?
        </label>
        <div className="space-y-3">
          {proximityOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                data.proximityImportance === option.value
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="proximityImportance"
                value={option.value}
                checked={data.proximityImportance === option.value}
                onChange={(e) =>
                  onDataChange("proximityImportance", e.target.value)
                }
                className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">
                  {option.label}
                </div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Proximity Details */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Proximity Details (Optional)
        </label>
        <textarea
          value={data.proximityDetails || ""}
          onChange={(e) => onDataChange("proximityDetails", e.target.value)}
          rows={3}
          placeholder="e.g., 'Must be within 30 minutes of downtown Seattle' or 'Close to children in San Francisco Bay Area' or 'Prefer walkable neighborhood'"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
        />
      </div>

      {/* Neighborhood Preferences */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Neighborhood or Area Preferences (Optional)
        </label>
        <textarea
          value={data.neighborhoodPreferences || ""}
          onChange={(e) =>
            onDataChange("neighborhoodPreferences", e.target.value)
          }
          rows={3}
          placeholder="e.g., 'Quiet suburban area' or 'Near parks and nature' or 'Active senior community' or 'Close to cultural activities'"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-6"></div>

      {/* Contact Preferences Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Preferences
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Let providers know how and when to reach you
        </p>

        {/* Preferred Contact Methods */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How Would You Like Providers to Contact You?
            <span className="text-gray-500 font-normal ml-1">
              (Select all that apply)
            </span>
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            {contactMethods.map((method) => (
              <label
                key={method.value}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  data.preferredContactMethods?.includes(method.value)
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={
                    data.preferredContactMethods?.includes(method.value) || false
                  }
                  onChange={() => handleContactMethodToggle(method.value)}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                />
                <span className="text-2xl">{method.icon}</span>
                <span className="text-sm font-medium text-gray-900">
                  {method.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Best Times to Contact */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Best Times to Contact
            <span className="text-gray-500 font-normal ml-1">
              (Select all that apply)
            </span>
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            {bestTimes.map((time) => (
              <label
                key={time.value}
                className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  data.bestTimeToContact?.includes(time.value)
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={data.bestTimeToContact?.includes(time.value) || false}
                  onChange={() => handleBestTimeToggle(time.value)}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                />
                <span className="text-sm font-medium text-gray-900">
                  {time.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Tour Preference */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tour/Visit Preferences
          </label>
          <div className="space-y-3">
            {tourPreferences.map((pref) => (
              <label
                key={pref.value}
                className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  data.tourPreference === pref.value
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="tourPreference"
                  value={pref.value}
                  checked={data.tourPreference === pref.value}
                  onChange={(e) =>
                    onDataChange("tourPreference", e.target.value)
                  }
                  className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{pref.label}</div>
                  <div className="text-sm text-gray-600">{pref.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Communication Frequency */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Preferred Communication Frequency
          </label>
          <div className="space-y-3">
            {communicationFrequencies.map((freq) => (
              <label
                key={freq.value}
                className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  data.communicationFrequency === freq.value
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="communicationFrequency"
                  value={freq.value}
                  checked={data.communicationFrequency === freq.value}
                  onChange={(e) =>
                    onDataChange("communicationFrequency", e.target.value)
                  }
                  className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{freq.label}</div>
                  <div className="text-sm text-gray-600">{freq.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Contact Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Contact Notes (Optional)
          </label>
          <textarea
            value={data.additionalContactNotes || ""}
            onChange={(e) =>
              onDataChange("additionalContactNotes", e.target.value)
            }
            rows={3}
            placeholder="Any other details about how or when to contact you? (e.g., 'Please don't call during work hours' or 'Email preferred for initial contact' or 'Include my spouse on all communications')"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
          />
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-indigo-900">
              <span className="font-semibold">Clear communication leads to better matches:</span>{" "}
              Providers who know your location needs and communication preferences can
              respond more effectively. Sharing your availability and preferred contact
              methods helps everyone save time and find the right fit faster.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
