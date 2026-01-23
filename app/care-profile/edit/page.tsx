"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";

type CareProfile = {
  id: string;
  careTypes: string[];
  location: string;
  city: string;
  state: string;
  zipCode: string;
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string | null;
  description: string | null;
  isPublic: boolean;
};

const CARE_TYPES = [
  { value: "PERSONAL_CARE", label: "Personal Care", description: "Help with daily activities like bathing, dressing, and meals" },
  { value: "COMPANION_CARE", label: "Companion Care", description: "Social companionship and light housekeeping" },
  { value: "SKILLED_NURSING", label: "Skilled Nursing", description: "Medical care from licensed nurses" },
  { value: "MEMORY_CARE", label: "Memory Care", description: "Specialized care for dementia and Alzheimer's" },
  { value: "HOSPICE_CARE", label: "Hospice Care", description: "End-of-life comfort care" },
  { value: "RESPITE_CARE", label: "Respite Care", description: "Temporary relief for primary caregivers" },
  { value: "LIVE_IN_CARE", label: "Live-In Care", description: "24/7 in-home care support" },
];

const TIMELINES = [
  { value: "Immediately", label: "Immediately", description: "Need care right now" },
  { value: "Within 1 month", label: "Within 1 month", description: "Planning to start soon" },
  { value: "Within 3 months", label: "Within 3 months", description: "Researching options" },
  { value: "Within 6 months", label: "Within 6 months", description: "Planning ahead" },
  { value: "Planning ahead", label: "6+ months", description: "Future planning" },
];

export default function EditCareProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<CareProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form state
  const [careTypes, setCareTypes] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [budgetMin, setBudgetMin] = useState<string>("");
  const [budgetMax, setBudgetMax] = useState<string>("");
  const [timeline, setTimeline] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  // Current step for progressive form
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/care-profiles");
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setProfile(data);
          setCareTypes(data.careTypes || []);
          setCity(data.city || "");
          setState(data.state || "");
          setZipCode(data.zipCode || "");
          setBudgetMin(data.budgetMin?.toString() || "");
          setBudgetMax(data.budgetMax?.toString() || "");
          setTimeline(data.timeline || "");
          setDescription(data.description || "");
          setIsPublic(data.isPublic || false);
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCareTypeToggle = (type: string) => {
    setCareTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMessage("");

    // Validation
    if (careTypes.length === 0) {
      setError("Please select at least one care type");
      setSaving(false);
      setCurrentStep(1);
      return;
    }

    if (!city || !state || !zipCode) {
      setError("Please fill in all location fields");
      setSaving(false);
      setCurrentStep(2);
      return;
    }

    const data = {
      careTypes,
      location: `${city}, ${state} ${zipCode}`,
      city,
      state,
      zipCode,
      budgetMin: budgetMin ? parseInt(budgetMin) : null,
      budgetMax: budgetMax ? parseInt(budgetMax) : null,
      timeline: timeline || null,
      description: description || null,
      isPublic,
    };

    try {
      const method = profile ? "PATCH" : "POST";
      const response = await fetch("/api/care-profiles", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save profile");
      }

      const savedProfile = await response.json();
      setProfile(savedProfile);
      setSuccessMessage("Your care profile has been saved!");
      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        router.push("/care-profile");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return careTypes.length > 0;
      case 2:
        return city && state && zipCode;
      case 3:
        return true; // Budget is optional
      case 4:
        return true; // Additional details are optional
      default:
        return true;
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        {/* Hero Skeleton */}
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-white/20 rounded-lg w-1/2 mb-4"></div>
              <div className="h-5 bg-white/20 rounded w-2/3"></div>
            </div>
          </div>
        </div>
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
          <div className="animate-pulse space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/care-profile"
            className="inline-flex items-center gap-2 text-primary-100 hover:text-white mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {profile ? "Edit Your Care Profile" : "Create Your Care Profile"}
          </h1>
          <p className="text-primary-100 text-lg">
            Help us understand your care needs to match you with the right providers
          </p>

          {/* Progress Steps */}
          <div className="mt-8">
            <div className="flex items-center justify-between max-w-md">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <button
                    onClick={() => setCurrentStep(step)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      currentStep === step
                        ? "bg-white text-primary-700"
                        : currentStep > step
                        ? "bg-primary-400 text-white"
                        : "bg-white/20 text-white/70"
                    }`}
                  >
                    {currentStep > step ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step
                    )}
                  </button>
                  {step < 4 && (
                    <div className={`w-12 h-1 mx-2 rounded ${currentStep > step ? "bg-primary-400" : "bg-white/20"}`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between max-w-md mt-2 text-xs text-primary-100">
              <span>Care Type</span>
              <span>Location</span>
              <span>Budget</span>
              <span>Details</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-green-800 font-medium">{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-full">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-red-800">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Care Types */}
          {currentStep === 1 && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  What type of care do you need?
                </h2>
                <p className="text-gray-600">Select all that apply to your situation</p>
              </div>

              <div className="space-y-3">
                {CARE_TYPES.map((care) => (
                  <label
                    key={care.value}
                    className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      careTypes.includes(care.value)
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={careTypes.includes(care.value)}
                      onChange={() => handleCareTypeToggle(care.value)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 mr-4 mt-0.5 ${
                      careTypes.includes(care.value)
                        ? "bg-primary-600 border-primary-600"
                        : "border-gray-300"
                    }`}>
                      {careTypes.includes(care.value) && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <span className={`font-semibold ${careTypes.includes(care.value) ? "text-primary-700" : "text-gray-900"}`}>
                        {care.label}
                      </span>
                      <p className="text-sm text-gray-600 mt-0.5">{care.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Where are you looking for care?
                </h2>
                <p className="text-gray-600">Enter the location where care will be provided</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="e.g. San Diego"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="CA"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value.slice(0, 5))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="92101"
                      maxLength={5}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Budget & Timeline */}
          {currentStep === 3 && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Budget & Timeline
                </h2>
                <p className="text-gray-600">Help providers understand your requirements (optional)</p>
              </div>

              <div className="space-y-6">
                {/* Budget */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Monthly Budget Range</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                      <input
                        type="number"
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="Minimum"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                      <input
                        type="number"
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="Maximum"
                      />
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">When do you need care?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {TIMELINES.map((option) => (
                      <label
                        key={option.value}
                        className={`flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          timeline === option.value
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="timeline"
                          value={option.value}
                          checked={timeline === option.value}
                          onChange={(e) => setTimeline(e.target.value)}
                          className="sr-only"
                        />
                        <span className={`font-semibold ${timeline === option.value ? "text-primary-700" : "text-gray-900"}`}>
                          {option.label}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">{option.description}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Additional Details */}
          {currentStep === 4 && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Additional Details
                </h2>
                <p className="text-gray-600">Share any other information that might help providers</p>
              </div>

              <div className="space-y-6">
                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tell us more about your care needs
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                    placeholder="Share details about your loved one's condition, preferences, daily routines, or any special requirements..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    This helps providers understand your unique situation
                  </p>
                </div>

                {/* Visibility */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <label className="flex items-start gap-4 cursor-pointer">
                    <div className="relative shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Make my profile visible to providers</span>
                      <p className="text-sm text-gray-600 mt-1">
                        When enabled, care providers can find your profile and reach out to you. When disabled, only providers you contact can see your information.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Summary */}
                <div className="bg-primary-50 rounded-xl p-5 border border-primary-200">
                  <h3 className="font-semibold text-primary-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Profile Summary
                  </h3>
                  <div className="space-y-2 text-sm text-primary-800">
                    <p><strong>Care Types:</strong> {careTypes.map(ct => ct.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')).join(', ') || 'None selected'}</p>
                    <p><strong>Location:</strong> {city && state ? `${city}, ${state} ${zipCode}` : 'Not specified'}</p>
                    {budgetMin && budgetMax && <p><strong>Budget:</strong> ${budgetMin} - ${budgetMax}/month</p>}
                    {timeline && <p><strong>Timeline:</strong> {timeline}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={prevStep}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${
                currentStep === 1
                  ? "invisible"
                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Profile
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
