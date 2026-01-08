"use client";

import ProfilePhotoUpload from "./ProfilePhotoUpload";

interface AboutLovedOneData {
  profilePhoto?: string | null;
  lovedOneName?: string;
  ageRange?: string;
  gender?: string;
  livingSituation?: string;
  relationship?: string;
}

interface AboutLovedOneSectionProps {
  data: AboutLovedOneData;
  onDataChange: (field: keyof AboutLovedOneData, value: any) => void;
}

export default function AboutLovedOneSection({
  data,
  onDataChange,
}: AboutLovedOneSectionProps) {
  const ageRanges = [
    { value: "", label: "Select age range" },
    { value: "under-65", label: "Under 65" },
    { value: "65-69", label: "65-69 years" },
    { value: "70-74", label: "70-74 years" },
    { value: "75-79", label: "75-79 years" },
    { value: "80-84", label: "80-84 years" },
    { value: "85-89", label: "85-89 years" },
    { value: "90-94", label: "90-94 years" },
    { value: "95-plus", label: "95+ years" },
  ];

  const genderOptions = [
    { value: "", label: "Prefer not to say" },
    { value: "female", label: "Female" },
    { value: "male", label: "Male" },
    { value: "non-binary", label: "Non-binary" },
    { value: "other", label: "Other" },
  ];

  const livingSituations = [
    { value: "", label: "Select living situation" },
    { value: "alone", label: "Living alone" },
    { value: "with-family", label: "Living with family" },
    { value: "with-spouse", label: "Living with spouse/partner" },
    { value: "assisted-living", label: "Currently in assisted living" },
    { value: "hospital", label: "Currently in hospital" },
    { value: "other", label: "Other" },
  ];

  const relationships = [
    { value: "", label: "Select your relationship" },
    { value: "adult-child", label: "Adult child (son/daughter)" },
    { value: "spouse", label: "Spouse/Partner" },
    { value: "sibling", label: "Sibling" },
    { value: "grandchild", label: "Grandchild" },
    { value: "other-family", label: "Other family member" },
    { value: "friend", label: "Friend" },
    { value: "legal-guardian", label: "Legal guardian" },
    { value: "social-worker", label: "Social worker/Case manager" },
    { value: "self", label: "Self (care for myself)" },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          About Your Loved One
        </h2>
        <p className="text-sm text-gray-600">
          Tell us a bit about the person who needs care. This helps providers
          understand and prepare for their specific needs.
        </p>
      </div>

      {/* Photo Upload */}
      <ProfilePhotoUpload
        currentPhoto={data.profilePhoto}
        onPhotoChange={(photo) => onDataChange("profilePhoto", photo)}
      />

      {/* Name Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          First Name (Optional)
          <span className="text-gray-500 font-normal ml-1">
            - Helps personalize communication
          </span>
        </label>
        <input
          type="text"
          value={data.lovedOneName || ""}
          onChange={(e) => onDataChange("lovedOneName", e.target.value)}
          placeholder="e.g., Mary, John, Mom, Dad"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          You can use a first name, nickname, or relationship (like &quot;Mom&quot;)
        </p>
      </div>

      {/* Age Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Age Range
        </label>
        <select
          value={data.ageRange || ""}
          onChange={(e) => onDataChange("ageRange", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {ageRanges.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gender (Optional)
        </label>
        <select
          value={data.gender || ""}
          onChange={(e) => onDataChange("gender", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {genderOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Some providers specialize in gender-specific care
        </p>
      </div>

      {/* Living Situation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Living Situation
        </label>
        <select
          value={data.livingSituation || ""}
          onChange={(e) => onDataChange("livingSituation", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {livingSituations.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Relationship */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Relationship to Care Recipient
        </label>
        <select
          value={data.relationship || ""}
          onChange={(e) => onDataChange("relationship", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {relationships.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          This helps providers understand your decision-making authority
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
              <span className="font-semibold">Why we ask:</span> These details help
              providers prepare appropriate care plans and ensure they have the right
              experience and resources for your loved one&apos;s specific needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
