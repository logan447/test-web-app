"use client";

import { Fragment, useState, useEffect, useCallback, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// ============================================================================
// Types
// ============================================================================

export type OnboardingIntent = "family" | "provider" | null;
export type ProviderSubtype = "organization" | "individual" | null;

// Context for actions that triggered signup (for contextual handoff)
export interface PendingActionContext {
  type: 'save' | 'review' | 'contact';
  providerId: string;
  providerName?: string;
  contactReason?: string;
}

export type WizardStep =
  | "intent" // Ask: family or provider?
  | "provider-subtype" // Ask: organization or individual?
  | "family-fields" // Collect: name, location, care type
  | "family-visibility" // Confirm: family profile visibility
  | "provider-org-fields" // Collect: org name, location, provider type
  | "provider-individual-fields" // Collect: name, location, services
  | "provider-visibility" // Confirm: provider profile visibility
  | "complete"; // Done

export interface OnboardingData {
  // Intent
  intent: OnboardingIntent;
  providerSubtype: ProviderSubtype;

  // Family fields (Profile Card Minimum)
  familyName?: string;
  familyLocation?: string;
  familyCareType?: string;

  // Provider Org fields (Profile Card Minimum)
  orgName?: string;
  orgLocation?: string;
  orgProviderType?: string;

  // Individual Caregiver fields (Profile Card Minimum)
  caregiverName?: string;
  caregiverLocation?: string;
  caregiverServices?: string[];

  // Visibility settings
  isVisible?: boolean;
  isPublic?: boolean; // For family profiles
  availableForFamilies?: boolean; // For individual caregivers
  availableForOrganizations?: boolean; // For individual caregivers
}

interface OnboardingWizardOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Pre-set intent to skip the intent selection step.
   * Use when entry point makes intent clear (e.g., /for-providers CTA)
   */
  initialIntent?: OnboardingIntent;
  /**
   * Pre-set provider subtype to skip subtype selection.
   * Use when claiming a provider listing (always organization)
   */
  initialProviderSubtype?: ProviderSubtype;
  /**
   * Pending action that triggered signup (for contextual handoff).
   * When present, wizard shows context-aware messaging.
   */
  pendingAction?: PendingActionContext;
  /**
   * Callback when wizard completes successfully
   */
  onComplete?: (data: OnboardingData) => void;
}

// ============================================================================
// Constants
// ============================================================================

const CARE_TYPES = [
  { value: "PERSONAL_CARE", label: "Personal Care" },
  { value: "COMPANION_CARE", label: "Companion Care" },
  { value: "SKILLED_NURSING", label: "Skilled Nursing" },
  { value: "MEMORY_CARE", label: "Memory Care" },
  { value: "HOSPICE_CARE", label: "Hospice Care" },
  { value: "RESPITE_CARE", label: "Respite Care" },
  { value: "LIVE_IN_CARE", label: "Live-In Care" },
];

const PROVIDER_TYPES = [
  "Assisted Living Facility",
  "Memory Care Community",
  "Skilled Nursing Facility",
  "Home Care Agency",
  "Adult Day Center",
  "Hospice Provider",
  "Independent Living Community",
  "Continuing Care Retirement Community",
];

// Map display names to ProviderType enum values
const PROVIDER_TYPE_MAP: Record<string, string> = {
  "Assisted Living Facility": "ASSISTED_LIVING",
  "Memory Care Community": "MEMORY_CARE",
  "Skilled Nursing Facility": "NURSING_HOME",
  "Home Care Agency": "HOME_CARE",
  "Adult Day Center": "HOME_CARE", // No specific enum, closest match
  "Hospice Provider": "HOSPICE",
  "Independent Living Community": "INDEPENDENT_LIVING",
  "Continuing Care Retirement Community": "ASSISTED_LIVING", // No specific enum, closest match
};

const CAREGIVER_SERVICES = [
  { label: "Personal Care", value: "PERSONAL_CARE" },
  { label: "Companionship", value: "COMPANION_CARE" },
  { label: "Skilled Nursing", value: "SKILLED_NURSING" },
  { label: "Memory Care", value: "MEMORY_CARE" },
  { label: "Hospice Care", value: "HOSPICE_CARE" },
  { label: "Respite Care", value: "RESPITE_CARE" },
  { label: "Live-In Care", value: "LIVE_IN_CARE" },
];

// ============================================================================
// Helper Functions
// ============================================================================

function getStepNumber(step: WizardStep, data: OnboardingData): number {
  if (step === "intent") return 1;
  if (step === "provider-subtype") return 2;
  if (step === "family-fields") return 2;
  if (step === "family-visibility") return 3;
  if (step === "provider-org-fields") return 3;
  if (step === "provider-individual-fields") return 3;
  if (step === "provider-visibility") return 4;
  if (step === "complete") return data.intent === "family" ? 4 : 5;
  return 1;
}

function getTotalSteps(data: OnboardingData): number {
  if (data.intent === "family") return 3; // intent + fields + visibility
  if (data.intent === "provider") return 4; // intent + subtype + fields + visibility
  return 3; // default
}

function getStepTitle(step: WizardStep): string {
  switch (step) {
    case "intent":
      return "Welcome to Olera";
    case "provider-subtype":
      return "Tell us about yourself";
    case "family-fields":
      return "About your care search";
    case "family-visibility":
      return "Profile visibility";
    case "provider-org-fields":
      return "About your organization";
    case "provider-individual-fields":
      return "About your services";
    case "provider-visibility":
      return "Profile visibility";
    case "complete":
      return "You're all set!";
    default:
      return "Onboarding";
  }
}

// ============================================================================
// Step Components
// ============================================================================

interface StepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: (selectedValue?: Partial<OnboardingData>) => void;
  onBack?: () => void;
  onSkip: () => void;
  pendingAction?: PendingActionContext;
}

function IntentStep({ data, onUpdate, onNext, onSkip }: StepProps) {
  const handleSelect = (intent: OnboardingIntent) => {
    onUpdate({ intent });
    // Auto-advance after selection - pass intent directly to avoid stale closure
    setTimeout(() => onNext({ intent }), 150);
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600 text-center">
        Help us personalize your experience. What brings you to Olera?
      </p>

      <div className="space-y-4">
        <button
          type="button"
          onClick={() => handleSelect("family")}
          className={`w-full p-6 border-2 rounded-xl text-left transition-all hover:border-primary-500 hover:bg-primary-50 ${
            data.intent === "family"
              ? "border-primary-600 bg-primary-50"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                I&apos;m looking for care
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Find quality care providers for yourself or a loved one
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleSelect("provider")}
          className={`w-full p-6 border-2 rounded-xl text-left transition-all hover:border-primary-500 hover:bg-primary-50 ${
            data.intent === "provider"
              ? "border-primary-600 bg-primary-50"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                I&apos;m a care provider
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Connect with families seeking care services
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="text-center pt-4">
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

function ProviderSubtypeStep({ data, onUpdate, onNext, onBack, onSkip }: StepProps) {
  const handleSelect = (subtype: ProviderSubtype) => {
    onUpdate({ providerSubtype: subtype });
    // Auto-advance after selection - pass subtype directly to avoid stale closure
    setTimeout(() => onNext({ providerSubtype: subtype }), 150);
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600 text-center">
        What type of care provider are you?
      </p>

      <div className="space-y-4">
        <button
          type="button"
          onClick={() => handleSelect("organization")}
          className={`w-full p-6 border-2 rounded-xl text-left transition-all hover:border-primary-500 hover:bg-primary-50 ${
            data.providerSubtype === "organization"
              ? "border-primary-600 bg-primary-50"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Care Organization
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Facility, agency, or healthcare organization
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleSelect("individual")}
          className={`w-full p-6 border-2 rounded-xl text-left transition-all hover:border-primary-500 hover:bg-primary-50 ${
            data.providerSubtype === "individual"
              ? "border-primary-600 bg-primary-50"
              : "border-gray-200"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Individual Caregiver
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Independent caregiver or healthcare professional
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="flex justify-between items-center pt-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-gray-500 hover:text-gray-700 ml-auto"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

function FamilyFieldsStep({ data, onUpdate, onNext, onBack, onSkip }: StepProps) {
  const [localData, setLocalData] = useState({
    familyName: data.familyName || "",
    familyCity: "",
    familyState: "",
    familyCareType: data.familyCareType || "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Compose location for display/storage
      const familyLocation = `${localData.familyCity}, ${localData.familyState}`;
      const formData = {
        familyName: localData.familyName,
        familyLocation,
        familyCareType: localData.familyCareType,
      };
      onUpdate(formData);

      // Create family profile HERE instead of in handleNext
      // This ensures we block on failure and show proper error
      const profileData = {
        lovedOneName: localData.familyName,
        careTypes: localData.familyCareType ? [localData.familyCareType] : [],
        location: familyLocation,
        city: localData.familyCity,
        state: localData.familyState,
        zipCode: "",
      };

      // Check if profile already exists
      const checkResponse = await fetch("/api/family-profiles/me");
      const profileExists = checkResponse.ok;

      // Create or update profile
      const response = await fetch("/api/family-profiles/me", {
        method: profileExists ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[Onboarding] Failed to save family profile:", errorData);

        // Show user-friendly error
        if (response.status === 401) {
          setError("Session expired. Please refresh and try again.");
        } else if (errorData.error) {
          setError(errorData.error);
        } else {
          setError("Unable to save your profile. Please try again.");
        }
        return;
      }

      console.log("[Onboarding] Family profile saved successfully");

      // Profile saved successfully - now advance to complete step
      onNext(formData);
    } catch (err) {
      console.error("[Onboarding] Error saving family profile:", err);
      setError("Unable to save your profile. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = localData.familyName && localData.familyCity && localData.familyState && localData.familyCareType;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-gray-600 text-center">
        Tell us a bit about your care search so we can help you find the right providers.
      </p>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="familyName" className="block text-sm font-medium text-gray-700 mb-1">
            Who needs care?
          </label>
          <input
            id="familyName"
            type="text"
            placeholder="e.g., My mother, My father, Myself"
            value={localData.familyName}
            onChange={(e) => setLocalData({ ...localData, familyName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="familyCity" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              id="familyCity"
              type="text"
              placeholder="Austin"
              value={localData.familyCity}
              onChange={(e) => setLocalData({ ...localData, familyCity: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="familyState" className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              id="familyState"
              type="text"
              placeholder="TX"
              value={localData.familyState}
              onChange={(e) => setLocalData({ ...localData, familyState: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="familyCareType" className="block text-sm font-medium text-gray-700 mb-1">
            What type of care are you looking for?
          </label>
          <select
            id="familyCareType"
            value={localData.familyCareType}
            onChange={(e) => setLocalData({ ...localData, familyCareType: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select care type...</option>
            {CARE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          ) : (
            "Continue"
          )}
        </button>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onSkip}
          disabled={isSubmitting}
          className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          Skip for now
        </button>
      </div>
    </form>
  );
}

function ProviderOrgFieldsStep({ data, onUpdate, onNext, onBack, onSkip }: StepProps) {
  const [localData, setLocalData] = useState({
    orgName: data.orgName || "",
    orgLocation: data.orgLocation || "",
    orgProviderType: data.orgProviderType || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(localData);
    // Pass form data directly to avoid stale closure
    onNext(localData);
  };

  const isValid = localData.orgName && localData.orgLocation && localData.orgProviderType;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-gray-600 text-center">
        Tell us about your organization so families can find you.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-1">
            Organization name
          </label>
          <input
            id="orgName"
            type="text"
            placeholder="e.g., Sunrise Senior Living"
            value={localData.orgName}
            onChange={(e) => setLocalData({ ...localData, orgName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="orgLocation" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            id="orgLocation"
            type="text"
            placeholder="City, State (e.g., Austin, TX)"
            value={localData.orgLocation}
            onChange={(e) => setLocalData({ ...localData, orgLocation: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="orgProviderType" className="block text-sm font-medium text-gray-700 mb-1">
            Type of care you provide
          </label>
          <select
            id="orgProviderType"
            value={localData.orgProviderType}
            onChange={(e) => setLocalData({ ...localData, orgProviderType: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select provider type...</option>
            {PROVIDER_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          disabled={!isValid}
          className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Skip for now
        </button>
      </div>
    </form>
  );
}

function ProviderIndividualFieldsStep({ data, onUpdate, onNext, onBack, onSkip }: StepProps) {
  const [localData, setLocalData] = useState({
    caregiverName: data.caregiverName || "",
    caregiverLocation: data.caregiverLocation || "",
    caregiverServices: data.caregiverServices || [] as string[],
  });

  const handleServiceToggle = (serviceValue: string) => {
    const services = localData.caregiverServices.includes(serviceValue)
      ? localData.caregiverServices.filter((s) => s !== serviceValue)
      : [...localData.caregiverServices, serviceValue];
    setLocalData({ ...localData, caregiverServices: services });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(localData);
    // Pass form data directly to avoid stale closure
    onNext(localData);
  };

  const isValid =
    localData.caregiverName &&
    localData.caregiverLocation &&
    localData.caregiverServices.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-gray-600 text-center">
        Tell us about yourself so families can find you.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="caregiverName" className="block text-sm font-medium text-gray-700 mb-1">
            Your name
          </label>
          <input
            id="caregiverName"
            type="text"
            placeholder="Your full name"
            value={localData.caregiverName}
            onChange={(e) => setLocalData({ ...localData, caregiverName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="caregiverLocation" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            id="caregiverLocation"
            type="text"
            placeholder="City, State (e.g., Austin, TX)"
            value={localData.caregiverLocation}
            onChange={(e) => setLocalData({ ...localData, caregiverLocation: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Services you offer (select all that apply)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CAREGIVER_SERVICES.map((service) => (
              <button
                key={service.value}
                type="button"
                onClick={() => handleServiceToggle(service.value)}
                className={`p-3 text-sm rounded-lg border-2 transition-all ${
                  localData.caregiverServices.includes(service.value)
                    ? "border-primary-600 bg-primary-50 text-primary-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {service.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          disabled={!isValid}
          className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Skip for now
        </button>
      </div>
    </form>
  );
}

function FamilyVisibilityStep({ data, onUpdate, onNext, onBack }: StepProps) {
  const [isPublic, setIsPublic] = useState(data.isPublic ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ isPublic });
    onNext({ isPublic });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-gray-600 text-center">
        Choose who can discover your care profile on Olera.
      </p>

      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <div>
            <span className="font-medium text-gray-900">Make my profile visible to providers</span>
            <p className="text-sm text-gray-600 mt-1">
              Care providers can find your profile and reach out to offer their services. You control who you respond to.
            </p>
          </div>
        </label>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <p className="text-sm text-blue-800">
          <strong>Privacy first:</strong> Your contact info is never shared until you choose to connect with a provider.
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </form>
  );
}

function ProviderVisibilityStep({ data, onUpdate, onNext, onBack }: StepProps) {
  // For organizations: visibleToFamilies = main visibility, hiringCaregivers = availableForOrganizations
  // For individuals: availableForFamilies and availableForOrganizations are the two options
  const [visibleToFamilies, setVisibleToFamilies] = useState(data.isVisible ?? true);
  const [hiringCaregivers, setHiringCaregivers] = useState(data.availableForOrganizations ?? true);
  const [availableForFamilies, setAvailableForFamilies] = useState(data.availableForFamilies ?? true);
  const [availableForOrganizations, setAvailableForOrganizations] = useState(data.availableForOrganizations ?? true);

  const isIndividual = data.providerSubtype === "individual";
  const isOrganization = data.providerSubtype === "organization";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let visibilityData;

    if (isIndividual) {
      // For individuals: isVisible is true if either option is checked
      visibilityData = {
        isVisible: availableForFamilies || availableForOrganizations,
        availableForFamilies,
        availableForOrganizations,
      };
    } else {
      // For organizations: isVisible = visibleToFamilies, availableForOrganizations = hiringCaregivers
      visibilityData = {
        isVisible: visibleToFamilies,
        availableForFamilies: true,
        availableForOrganizations: hiringCaregivers,
      };
    }

    onUpdate(visibilityData);
    onNext(visibilityData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-gray-600 text-center">
        {isIndividual
          ? "Choose who can find and contact you on Olera."
          : "Choose who can discover your organization on Olera."}
      </p>

      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        {/* Organization options - two equal-level checkboxes */}
        {isOrganization && (
          <>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={visibleToFamilies}
                onChange={(e) => setVisibleToFamilies(e.target.checked)}
                className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <span className="font-medium text-gray-900">Make our profile visible to families</span>
                <p className="text-sm text-gray-600 mt-1">
                  Families searching for care can find and contact you
                </p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hiringCaregivers}
                onChange={(e) => setHiringCaregivers(e.target.checked)}
                className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <span className="font-medium text-gray-900">We&apos;re hiring caregivers</span>
                <p className="text-sm text-gray-600 mt-1">
                  Individual caregivers seeking employment can find and contact you
                </p>
              </div>
            </label>
          </>
        )}

        {/* Individual caregiver options - two equal-level checkboxes */}
        {isIndividual && (
          <>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={availableForFamilies}
                onChange={(e) => setAvailableForFamilies(e.target.checked)}
                className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <span className="font-medium text-gray-900">Families seeking direct hire</span>
                <p className="text-sm text-gray-600 mt-1">
                  Families can contact you directly about care needs
                </p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={availableForOrganizations}
                onChange={(e) => setAvailableForOrganizations(e.target.checked)}
                className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <span className="font-medium text-gray-900">Care organizations hiring staff</span>
                <p className="text-sm text-gray-600 mt-1">
                  Agencies and facilities can contact you about employment
                </p>
              </div>
            </label>
          </>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <p className="text-sm text-blue-800">
          <strong>You&apos;re in control:</strong> You can change these settings anytime from your profile.
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </form>
  );
}

function CompleteStep({ data, onNext, pendingAction }: StepProps) {
  const [countdown, setCountdown] = useState(3);
  const hasTriggeredRef = useRef(false);

  // Auto-redirect after countdown
  useEffect(() => {
    if (hasTriggeredRef.current) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            onNext();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onNext]);

  const getMessage = () => {
    // Contextual message when there's a pending action (engagement will be created)
    if (pendingAction) {
      if (pendingAction.type === 'contact') {
        return `Your profile has been shared with ${pendingAction.providerName}. Redirecting to your conversation...`;
      }
      if (pendingAction.type === 'save') {
        return `Saving ${pendingAction.providerName} to your list...`;
      }
      if (pendingAction.type === 'review') {
        return `Opening review form for ${pendingAction.providerName}...`;
      }
    }
    // Default messages with redirect indication
    if (data.intent === "family") {
      return "You're ready to start exploring care providers in your area.";
    }
    if (data.providerSubtype === "organization") {
      return "Your organization profile is set up. Families can now find you.";
    }
    return "Your caregiver profile is set up. Families can now find you.";
  };

  const getRedirectText = () => {
    if (pendingAction) {
      return "Redirecting to your conversation...";
    }
    if (data.intent === "provider") {
      return "Redirecting to find families...";
    }
    return "Redirecting...";
  };

  return (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {pendingAction ? "You're connected!" : "Welcome to Olera!"}
        </h3>
        <p className="text-gray-600">{getMessage()}</p>
      </div>

      {/* Auto-redirect indicator */}
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
        <p className="text-sm text-gray-500">{getRedirectText()}</p>
      </div>

      {/* Skip waiting button */}
      <button
        type="button"
        onClick={() => {
          if (!hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            onNext();
          }
        }}
        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        Continue now
      </button>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function OnboardingWizardOverlay({
  isOpen,
  onClose,
  initialIntent,
  initialProviderSubtype,
  pendingAction,
  onComplete,
}: OnboardingWizardOverlayProps) {
  const { data: session, update } = useSession();
  const router = useRouter();

  // Compute initial step based on intent/providerSubtype
  const computeInitialStep = (intent: OnboardingIntent, subtype: ProviderSubtype): WizardStep => {
    if (intent === "family") return "family-fields";
    if (intent === "provider" && subtype === "organization") return "provider-org-fields";
    if (intent === "provider" && subtype === "individual") return "provider-individual-fields";
    if (intent === "provider") return "provider-subtype";
    return "intent";
  };

  const [data, setData] = useState<OnboardingData>({
    intent: initialIntent || null,
    providerSubtype: initialProviderSubtype || null,
  });

  const [currentStep, setCurrentStep] = useState<WizardStep>(() =>
    computeInitialStep(initialIntent || null, initialProviderSubtype || null)
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track whether we've initialized for THIS open session
  // This prevents the step from resetting mid-flow when isOpen toggles due to session updates
  const hasInitializedRef = useRef(false);

  // Initialize state ONCE when wizard opens, not on every dependency change
  // This is critical: the session update during provider-org-fields step can cause
  // useSession to re-render, which might toggle isOpen, which would previously
  // reset the wizard back to step 1. Now we only initialize once per open.
  useEffect(() => {
    if (isOpen && !hasInitializedRef.current) {
      // First time opening - initialize state
      setData({
        intent: initialIntent || null,
        providerSubtype: initialProviderSubtype || null,
      });
      setCurrentStep(computeInitialStep(initialIntent || null, initialProviderSubtype || null));
      hasInitializedRef.current = true;
    } else if (!isOpen && hasInitializedRef.current) {
      // Wizard closed - reset the flag so next open will reinitialize
      hasInitializedRef.current = false;
    }
  }, [isOpen, initialIntent, initialProviderSubtype]);

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleNext = useCallback(async (selectedValue?: Partial<OnboardingData>) => {
    switch (currentStep) {
      case "intent":
        // Use passed intent to avoid stale closure, fallback to state
        const selectedIntent = selectedValue?.intent ?? data.intent;
        if (selectedIntent === "family") {
          setCurrentStep("family-fields");
        } else if (selectedIntent === "provider") {
          setCurrentStep("provider-subtype");
        }
        break;

      case "provider-subtype":
        // Use passed subtype to avoid stale closure, fallback to state
        const selectedSubtype = selectedValue?.providerSubtype ?? data.providerSubtype;
        if (selectedSubtype === "organization") {
          setCurrentStep("provider-org-fields");
        } else if (selectedSubtype === "individual") {
          setCurrentStep("provider-individual-fields");
        }
        break;

      case "family-fields":
        // Profile creation is now handled in FamilyFieldsStep with proper error handling
        // This case is only reached after profile is successfully saved
        setCurrentStep("family-visibility");
        break;

      case "family-visibility":
        // Update the family profile with visibility settings
        setIsSubmitting(true);
        try {
          const isPublic = selectedValue?.isPublic ?? data.isPublic ?? true;
          await fetch("/api/family-profiles/me", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isPublic }),
          });
          console.log("[Onboarding] Family visibility saved:", { isPublic });
        } catch (error) {
          console.error("[Onboarding] Failed to save family visibility:", error);
          // Continue anyway - user can update later
        } finally {
          setIsSubmitting(false);
        }
        setCurrentStep("complete");
        break;

      case "provider-org-fields":
      case "provider-individual-fields":
        // Create provider identity AND provider profile
        setIsSubmitting(true);
        try {
          // Step 1: Create ProviderIdentity (backward compatibility)
          const identityResponse = await fetch("/api/provider-identity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: data.providerSubtype === "organization" ? "ORGANIZATION" : "INDIVIDUAL",
            }),
          });

          if (!identityResponse.ok) {
            const errorData = await identityResponse.json().catch(() => ({}));
            if (identityResponse.status === 400 && errorData.error?.includes("already exists")) {
              console.log("[Onboarding] Provider identity already exists, continuing");
            } else {
              throw new Error(errorData.error || "Failed to create provider identity");
            }
          }

          // Step 2: Create Provider profile with onboarding data
          // Use passed data to avoid stale closure
          const orgName = selectedValue?.orgName ?? data.orgName;
          const orgLocation = selectedValue?.orgLocation ?? data.orgLocation;
          const orgProviderType = selectedValue?.orgProviderType ?? data.orgProviderType;
          const caregiverName = selectedValue?.caregiverName ?? data.caregiverName;
          const caregiverLocation = selectedValue?.caregiverLocation ?? data.caregiverLocation;
          const caregiverServices = selectedValue?.caregiverServices ?? data.caregiverServices;

          // Parse location into city and state
          const locationStr = data.providerSubtype === "organization" ? orgLocation : caregiverLocation;
          const [city, state] = (locationStr || "").split(",").map(s => s.trim());

          // Determine provider type
          let providerType: string;
          if (data.providerSubtype === "individual") {
            providerType = "INDEPENDENT_CAREGIVER";
          } else {
            providerType = PROVIDER_TYPE_MAP[orgProviderType || ""] || "HOME_CARE";
          }

          // Build provider data
          const providerData = {
            name: data.providerSubtype === "organization" ? orgName : caregiverName,
            providerType,
            city: city || "",
            state: state || "",
            careTypesOffered: caregiverServices || [],
          };

          console.log("[Onboarding] Creating provider profile:", providerData);

          const providerResponse = await fetch("/api/providers/me", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(providerData),
          });

          if (!providerResponse.ok) {
            const errorData = await providerResponse.json().catch(() => ({}));
            if (providerResponse.status === 400 && errorData.error?.includes("already exists")) {
              console.log("[Onboarding] Provider profile already exists, continuing");
            } else {
              console.error("[Onboarding] Failed to create provider profile:", errorData);
              // Don't throw - allow user to continue even if profile creation fails
              // They can complete their profile later in provider dashboard
            }
          } else {
            console.log("[Onboarding] Provider profile created successfully");
          }

          // Step 3: Update session to provider mode
          await update({ activeMode: "PROVIDER" });

          setCurrentStep("provider-visibility");
        } catch (error) {
          console.error("[Onboarding] Error during provider onboarding:", error);
          // Still advance to visibility step - user can fix profile later
          setCurrentStep("provider-visibility");
        } finally {
          setIsSubmitting(false);
        }
        break;

      case "provider-visibility":
        // Update the provider profile with visibility settings
        setIsSubmitting(true);
        try {
          const isVisible = selectedValue?.isVisible ?? data.isVisible ?? true;
          const availableForFamilies = selectedValue?.availableForFamilies ?? data.availableForFamilies ?? true;
          const availableForOrganizations = selectedValue?.availableForOrganizations ?? data.availableForOrganizations ?? false;

          // Try to get existing provider to update
          const meResponse = await fetch("/api/providers/me");
          if (meResponse.ok) {
            const provider = await meResponse.json();
            await fetch(`/api/providers/${provider.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                isVisible,
                availableForFamilies,
                availableForOrganizations,
              }),
            });
            console.log("[Onboarding] Provider visibility saved:", { isVisible, availableForFamilies, availableForOrganizations });
          }
        } catch (error) {
          console.error("[Onboarding] Failed to save provider visibility:", error);
          // Continue anyway - user can update later
        } finally {
          setIsSubmitting(false);
        }
        setCurrentStep("complete");
        break;

      case "complete":
        // Mark onboarding complete in database (single source of truth)
        try {
          await fetch("/api/user/onboarding-complete", { method: "POST" });
        } catch (error) {
          console.error("Failed to mark onboarding complete:", error);
          // Continue anyway - don't block user from using the app
        }

        // Notify parent and close
        // Parent page handles URL param removal and any navigation
        onComplete?.(data);
        onClose();
        break;
    }
  }, [currentStep, data, onClose, onComplete, router, update]);

  const handleBack = useCallback(() => {
    switch (currentStep) {
      case "provider-subtype":
        setCurrentStep("intent");
        break;
      case "family-fields":
        setCurrentStep("intent");
        break;
      case "family-visibility":
        setCurrentStep("family-fields");
        break;
      case "provider-org-fields":
      case "provider-individual-fields":
        setCurrentStep("provider-subtype");
        break;
      case "provider-visibility":
        if (data.providerSubtype === "organization") {
          setCurrentStep("provider-org-fields");
        } else {
          setCurrentStep("provider-individual-fields");
        }
        break;
    }
  }, [currentStep, data.providerSubtype]);

  const handleSkip = useCallback(() => {
    onClose();
    // Stay on current page or go to default
    if (data.intent === "provider") {
      router.push("/provider/leads");
    }
  }, [data.intent, onClose, router]);

  const stepProps: StepProps = {
    data,
    onUpdate: updateData,
    onNext: handleNext,
    onBack: currentStep !== "intent" && !initialIntent ? handleBack : undefined,
    onSkip: handleSkip,
    pendingAction,
  };

  const renderStep = () => {
    switch (currentStep) {
      case "intent":
        return <IntentStep {...stepProps} />;
      case "provider-subtype":
        return <ProviderSubtypeStep {...stepProps} />;
      case "family-fields":
        return <FamilyFieldsStep {...stepProps} />;
      case "family-visibility":
        return <FamilyVisibilityStep {...stepProps} />;
      case "provider-org-fields":
        return <ProviderOrgFieldsStep {...stepProps} />;
      case "provider-individual-fields":
        return <ProviderIndividualFieldsStep {...stepProps} />;
      case "provider-visibility":
        return <ProviderVisibilityStep {...stepProps} />;
      case "complete":
        return <CompleteStep {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      {/* onClose={() => {}} prevents backdrop click and Escape from closing
          User can still close via X button or Skip - those call onClose explicitly */}
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Contextual Banner - shows when user has a pending action */}
                {pendingAction && currentStep !== "complete" && (
                  <div className="bg-primary-50 border border-primary-200 rounded-lg px-4 py-3 mb-4">
                    <p className="text-sm text-primary-800 text-center">
                      {pendingAction.type === 'contact' && (
                        <>Complete your profile to {pendingAction.contactReason?.toLowerCase() || 'contact'} <strong>{pendingAction.providerName}</strong></>
                      )}
                      {pendingAction.type === 'save' && (
                        <>Complete your profile to save <strong>{pendingAction.providerName}</strong></>
                      )}
                      {pendingAction.type === 'review' && (
                        <>Complete your profile to review <strong>{pendingAction.providerName}</strong></>
                      )}
                    </p>
                  </div>
                )}

                {/* Step Indicator */}
                {currentStep !== "complete" && (
                  <div className="flex items-center justify-center gap-2 mb-6">
                    {Array.from({ length: getTotalSteps(data) }, (_, i) => (
                      <div
                        key={i}
                        className={`h-2 rounded-full transition-all ${
                          i + 1 <= getStepNumber(currentStep, data)
                            ? "w-8 bg-primary-600"
                            : "w-2 bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Title */}
                <Dialog.Title
                  as="h2"
                  className="text-2xl font-bold text-center text-gray-900 mb-6"
                >
                  {getStepTitle(currentStep)}
                </Dialog.Title>

                {/* Loading Overlay */}
                {isSubmitting && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-2xl">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                )}

                {/* Step Content */}
                {renderStep()}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
