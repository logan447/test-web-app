"use client";

interface ProfileReviewData {
  profileVisibility?: string;
  shareWithVerifiedOnly?: boolean;
  allowDirectMessages?: boolean;
  showContactInfo?: boolean;
  showFullName?: boolean;
  hideFromSearch?: boolean;
  profileNotes?: string;
}

interface ProfileReviewPreviewProps {
  data: ProfileReviewData;
  onDataChange: (field: keyof ProfileReviewData, value: any) => void;
  profileData?: any; // All the profile data for preview
}

export default function ProfileReviewPreview({
  data,
  onDataChange,
  profileData,
}: ProfileReviewPreviewProps) {
  const visibilityOptions = [
    {
      value: "public",
      label: "Public",
      description: "All verified providers can see and contact you",
      icon: "🌐",
    },
    {
      value: "limited",
      label: "Limited",
      description: "Only providers you contact can see your full profile",
      icon: "🔒",
    },
    {
      value: "private",
      label: "Private",
      description: "Profile hidden from all searches, you contact providers first",
      icon: "🔐",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Review & Privacy Settings
        </h2>
        <p className="text-sm text-gray-600">
          Review your profile information and control who can see it.
        </p>
      </div>

      {/* Profile Visibility */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Profile Visibility
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="space-y-3">
          {visibilityOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                data.profileVisibility === option.value
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="profileVisibility"
                value={option.value}
                checked={data.profileVisibility === option.value}
                onChange={(e) =>
                  onDataChange("profileVisibility", e.target.value)
                }
                className="mt-1 w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-2xl">{option.icon}</span>
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

      {/* Privacy Controls */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Privacy Controls
        </h3>
        <div className="space-y-4">
          {/* Share with Verified Only */}
          <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={data.shareWithVerifiedOnly || false}
              onChange={(e) =>
                onDataChange("shareWithVerifiedOnly", e.target.checked)
              }
              className="mt-1 w-5 h-5 text-primary-600 focus:ring-primary-500 rounded"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-1">
                Share Only with Verified Providers
              </div>
              <div className="text-sm text-gray-600">
                Only show profile to background-checked and licensed providers
              </div>
            </div>
          </label>

          {/* Allow Direct Messages */}
          <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={data.allowDirectMessages || false}
              onChange={(e) =>
                onDataChange("allowDirectMessages", e.target.checked)
              }
              className="mt-1 w-5 h-5 text-primary-600 focus:ring-primary-500 rounded"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-1">
                Allow Direct Messages
              </div>
              <div className="text-sm text-gray-600">
                Let providers send you messages about their services
              </div>
            </div>
          </label>

          {/* Show Contact Info */}
          <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={data.showContactInfo || false}
              onChange={(e) =>
                onDataChange("showContactInfo", e.target.checked)
              }
              className="mt-1 w-5 h-5 text-primary-600 focus:ring-primary-500 rounded"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-1">
                Show Contact Information
              </div>
              <div className="text-sm text-gray-600">
                Display your phone number and email to providers who view your profile
              </div>
            </div>
          </label>

          {/* Show Full Name */}
          <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={data.showFullName || false}
              onChange={(e) =>
                onDataChange("showFullName", e.target.checked)
              }
              className="mt-1 w-5 h-5 text-primary-600 focus:ring-primary-500 rounded"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-1">
                Show Full Name
              </div>
              <div className="text-sm text-gray-600">
                Display your full name (otherwise shows first name only)
              </div>
            </div>
          </label>

          {/* Hide from Search */}
          <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={data.hideFromSearch || false}
              onChange={(e) =>
                onDataChange("hideFromSearch", e.target.checked)
              }
              className="mt-1 w-5 h-5 text-primary-600 focus:ring-primary-500 rounded"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-1">
                Hide from Provider Search Results
              </div>
              <div className="text-sm text-gray-600">
                Only you initiate contact (providers cannot find you in searches)
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Profile Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Private Notes (Optional)
        </label>
        <textarea
          value={data.profileNotes || ""}
          onChange={(e) => onDataChange("profileNotes", e.target.value)}
          rows={4}
          placeholder="Add any private notes for yourself about this care search (these are NEVER shared with providers)"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Use this space for reminders, questions, or anything you want to track privately
        </p>
      </div>

      {/* Profile Summary/Review */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Profile Summary
        </h3>
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-sm font-semibold text-gray-600 mb-2">
                PROFILE COMPLETENESS
              </div>
              <div className="text-2xl font-bold text-primary-600">
                {profileData?.completeness || 0}%
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {profileData?.completeness >= 70
                  ? "Great! Your profile is detailed"
                  : "Add more details to get better matches"}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-sm font-semibold text-gray-600 mb-2">
                VISIBILITY STATUS
              </div>
              <div className="text-lg font-bold text-gray-900">
                {data.profileVisibility === "public"
                  ? "🌐 Public"
                  : data.profileVisibility === "limited"
                  ? "🔒 Limited"
                  : data.profileVisibility === "private"
                  ? "🔐 Private"
                  : "Not Set"}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {data.profileVisibility === "public"
                  ? "Visible to all verified providers"
                  : data.profileVisibility === "limited"
                  ? "Visible only to providers you contact"
                  : data.profileVisibility === "private"
                  ? "Hidden from all searches"
                  : "Please select a visibility setting"}
              </p>
            </div>
          </div>

          {/* Quick Review Checklist */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-sm font-semibold text-gray-600 mb-3">
              QUICK REVIEW CHECKLIST
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className={profileData?.hasAboutLovedOne ? "text-green-600" : "text-gray-400"}>
                  {profileData?.hasAboutLovedOne ? "✓" : "○"}
                </span>
                <span className="text-gray-700">About your loved one</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={profileData?.hasCareNeeds ? "text-green-600" : "text-gray-400"}>
                  {profileData?.hasCareNeeds ? "✓" : "○"}
                </span>
                <span className="text-gray-700">Care needs assessment</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={profileData?.hasLocation ? "text-green-600" : "text-gray-400"}>
                  {profileData?.hasLocation ? "✓" : "○"}
                </span>
                <span className="text-gray-700">Location information</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={profileData?.hasBudget ? "text-green-600" : "text-gray-400"}>
                  {profileData?.hasBudget ? "✓" : "○"}
                </span>
                <span className="text-gray-700">Budget & timeline</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={data.profileVisibility ? "text-green-600" : "text-gray-400"}>
                  {data.profileVisibility ? "✓" : "○"}
                </span>
                <span className="text-gray-700">Privacy settings</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Protection Notice */}
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
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Your Data is Protected
            </h4>
            <p className="text-xs text-blue-800">
              All information is encrypted and stored securely. You can update your
              privacy settings or delete your profile anytime. We never sell your data
              to third parties, and all providers accessing profiles are verified and
              background-checked.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Policy Link */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5"
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
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Review our policies:</span> Read our{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                Terms of Service
              </a>{" "}
              to understand how we protect your information.
            </p>
          </div>
        </div>
      </div>

      {/* What Happens Next */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ✨ What Happens After You Save
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-green-600 font-bold">1.</span>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Profile Goes Live:</span> Your profile
              becomes visible according to your privacy settings
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-600 font-bold">2.</span>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Get Matched:</span> Providers who meet
              your needs can find and contact you (if visibility allows)
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-600 font-bold">3.</span>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Browse Providers:</span> You can search
              our directory and reach out to providers you&apos;re interested in
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-600 font-bold">4.</span>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Stay in Control:</span> Update your
              profile anytime or pause/delete it whenever you want
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
