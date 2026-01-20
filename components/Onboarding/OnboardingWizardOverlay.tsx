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

export type WizardStep =
  | "intent" // Ask: family or provider?
  | "provider-subtype" // Ask: organization or individual?
  | "family-fields" // Collect: name, location, care type
  | "provider-org-fields" // Collect: org name, location, provider type
  | "provider-individual-fields" // Collect: name, location, services
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

const CAREGIVER_SERVICES = [
  "Personal Care",
  "Companionship",
  "Meal Preparation",
  "Medication Reminders",
  "Light Housekeeping",
  "Transportation",
  "Dementia Care",
  "Respite Care",
];

// ============================================================================
// Helper Functions
// ============================================================================

function getStepNumber(step: WizardStep, data: OnboardingData): number {
  if (step === "intent") return 1;
  if (step === "provider-subtype") return 2;
  if (step === "family-fields") return 2;
  if (step === "provider-org-fields") return 3;
  if (step === "provider-individual-fields") return 3;
  if (step === "complete") return data.intent === "family" ? 3 : 4;
  return 1;
}

function getTotalSteps(data: OnboardingData): number {
  if (data.intent === "family") return 2; // intent + fields
  if (data.intent === "provider") return 3; // intent + subtype + fields
  return 2; // default
}

function getStepTitle(step: WizardStep): string {
  switch (step) {
    case "intent":
      return "Welcome to Olera";
    case "provider-subtype":
      return "Tell us about yourself";
    case "family-fields":
      return "About your care search";
    case "provider-org-fields":
      return "About your organization";
    case "provider-individual-fields":
      return "About your services";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Compose location for display/storage
    const familyLocation = `${localData.familyCity}, ${localData.familyState}`;
    const formData = {
      familyName: localData.familyName,
      familyLocation,
      familyCareType: localData.familyCareType,
    };
    onUpdate(formData);
    // Pass form data directly to avoid stale closure
    onNext(formData);
  };

  const isValid = localData.familyName && localData.familyCity && localData.familyState && localData.familyCareType;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-gray-600 text-center">
        Tell us a bit about your care search so we can help you find the right providers.
      </p>

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

  const handleServiceToggle = (service: string) => {
    const services = localData.caregiverServices.includes(service)
      ? localData.caregiverServices.filter((s) => s !== service)
      : [...localData.caregiverServices, service];
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
                key={service}
                type="button"
                onClick={() => handleServiceToggle(service)}
                className={`p-3 text-sm rounded-lg border-2 transition-all ${
                  localData.caregiverServices.includes(service)
                    ? "border-primary-600 bg-primary-50 text-primary-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {service}
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

function CompleteStep({ data, onNext }: StepProps) {
  const getMessage = () => {
    if (data.intent === "family") {
      return "You're ready to start exploring care providers in your area.";
    }
    if (data.providerSubtype === "organization") {
      return "Your organization profile is set up. Families can now find you.";
    }
    return "Your caregiver profile is set up. Families can now find you.";
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
          Welcome to Olera!
        </h3>
        <p className="text-gray-600">{getMessage()}</p>
      </div>

      <button
        type="button"
        onClick={() => onNext()}
        className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
      >
        {data.intent === "family" ? "Start Exploring" : "Start Finding Families"}
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
        // Save family profile data to FamilyProfile via API
        setIsSubmitting(true);
        try {
          // Use passed data to avoid stale closure, fallback to state
          const familyName = selectedValue?.familyName ?? data.familyName;
          const familyLocation = selectedValue?.familyLocation ?? data.familyLocation;
          const familyCareType = selectedValue?.familyCareType ?? data.familyCareType;

          // Parse location into city and state
          const [city, state] = (familyLocation || "").split(",").map(s => s.trim());

          // First check if profile exists
          const checkResponse = await fetch("/api/family-profiles/me");
          const profileExists = checkResponse.ok;

          // Prepare profile data
          const profileData = {
            lovedOneName: familyName,
            careTypes: familyCareType ? [familyCareType] : [],
            location: familyLocation || "",
            city: city || "",
            state: state || "",
            zipCode: "", // Can be filled in later
          };

          // Create or update profile
          const response = await fetch("/api/family-profiles/me", {
            method: profileExists ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profileData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to save family profile:", errorData);
            // Continue anyway - profile can be completed later
          }

          setCurrentStep("complete");
        } catch (error) {
          console.error("Error saving family profile:", error);
          // Continue to complete step even on error - user can fill details later
          setCurrentStep("complete");
        } finally {
          setIsSubmitting(false);
        }
        break;

      case "provider-org-fields":
      case "provider-individual-fields":
        // Create provider identity
        setIsSubmitting(true);
        try {
          const response = await fetch("/api/provider-identity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: data.providerSubtype === "organization" ? "ORGANIZATION" : "INDIVIDUAL",
            }),
          });

          if (!response.ok) {
            // Check if identity already exists (400 error)
            // This can happen if user retries or there was a partial completion
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 400 && errorData.error?.includes("already exists")) {
              // Identity exists - that's fine, continue to complete
              console.log("Provider identity already exists, continuing to complete");
            } else {
              throw new Error(errorData.error || "Failed to create provider identity");
            }
          }

          // Update session to provider mode (safe to call even if already in provider mode)
          await update({ activeMode: "PROVIDER" });

          setCurrentStep("complete");
        } catch (error) {
          console.error("Error creating provider identity:", error);
          // Still advance to complete on error - user can fix profile later
          // This prevents getting stuck in a loop
          setCurrentStep("complete");
        } finally {
          setIsSubmitting(false);
        }
        break;

      case "complete":
        // Close and redirect to appropriate destination
        onComplete?.(data);
        onClose();

        if (data.intent === "family") {
          router.push("/");
        } else {
          // Provider users go to Find Families page to start connecting
          // Use router.push for client-side navigation (no full page reload)
          router.push("/provider/find-families");
        }
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
      case "provider-org-fields":
      case "provider-individual-fields":
        setCurrentStep("provider-subtype");
        break;
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    onClose();
    // Stay on current page or go to default
    if (data.intent === "provider") {
      router.push("/provider/find-families");
    }
  }, [data.intent, onClose, router]);

  const stepProps: StepProps = {
    data,
    onUpdate: updateData,
    onNext: handleNext,
    onBack: currentStep !== "intent" && !initialIntent ? handleBack : undefined,
    onSkip: handleSkip,
  };

  const renderStep = () => {
    switch (currentStep) {
      case "intent":
        return <IntentStep {...stepProps} />;
      case "provider-subtype":
        return <ProviderSubtypeStep {...stepProps} />;
      case "family-fields":
        return <FamilyFieldsStep {...stepProps} />;
      case "provider-org-fields":
        return <ProviderOrgFieldsStep {...stepProps} />;
      case "provider-individual-fields":
        return <ProviderIndividualFieldsStep {...stepProps} />;
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
