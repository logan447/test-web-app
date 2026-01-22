"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MainNav from "@/components/Navigation/MainNav";
import Breadcrumb from "@/components/Navigation/Breadcrumb";
import { showToast } from "@/lib/toast";

/**
 * Benefits - Help families find financial assistance programs
 *
 * Three states:
 * 1. Entry State - Voice-first UI with option for form fallback
 * 2. Form Fallback - Written questionnaire (synced with Care Profile)
 * 3. Results State - List of matched benefit programs
 *
 * Data persists to Care Profile as the single source of truth.
 */

type CareType =
  | "PERSONAL_CARE"
  | "HOUSEHOLD_HELP"
  | "HEALTH_MANAGEMENT"
  | "COMPANIONSHIP"
  | "FINANCIAL_HELP"
  | "MEMORY_CARE"
  | "MOBILITY_HELP";

const CARE_TYPES = [
  { value: "PERSONAL_CARE" as CareType, icon: "✋", label: "Personal Care", description: "Bathing, dressing, toileting" },
  { value: "HOUSEHOLD_HELP" as CareType, icon: "🏠", label: "Household Help", description: "Meals, cleaning, errands" },
  { value: "HEALTH_MANAGEMENT" as CareType, icon: "❤️", label: "Health Management", description: "Medications, appointments" },
  { value: "COMPANIONSHIP" as CareType, icon: "👥", label: "Companionship", description: "Social visits, emotional support" },
  { value: "FINANCIAL_HELP" as CareType, icon: "💰", label: "Financial Help", description: "Benefits, bills, budgeting" },
  { value: "MEMORY_CARE" as CareType, icon: "🧠", label: "Memory Care", description: "Dementia, Alzheimer's, cognitive support" },
  { value: "MOBILITY_HELP" as CareType, icon: "🚶", label: "Mobility Help", description: "Walking, stairs, transfers" },
];

// Static benefits programs data (would come from API in production)
const BENEFITS_PROGRAMS = [
  { id: 1, name: "Medicaid Home Care", category: "Healthcare", description: "Covers in-home personal care services", eligibility: ["income", "age"], minAge: 65 },
  { id: 2, name: "SNAP (Food Stamps)", category: "Food Assistance", description: "Monthly benefits for groceries", eligibility: ["income"], minAge: null },
  { id: 3, name: "SSI (Supplemental Security Income)", category: "Income", description: "Monthly cash assistance for living expenses", eligibility: ["income", "age"], minAge: 65 },
  { id: 4, name: "Medicare Extra Help", category: "Healthcare", description: "Helps pay Medicare prescription drug costs", eligibility: ["income", "medicare"], minAge: 65 },
  { id: 5, name: "LIHEAP", category: "Utilities", description: "Low Income Home Energy Assistance Program", eligibility: ["income"], minAge: null },
  { id: 6, name: "Veterans Aid & Attendance", category: "Veterans", description: "Monthly pension for veterans needing care", eligibility: ["veteran", "care_needs"], minAge: null },
  { id: 7, name: "Area Agency on Aging Services", category: "Senior Services", description: "Local support services for seniors", eligibility: ["age"], minAge: 60 },
  { id: 8, name: "Community Care Programs", category: "Healthcare", description: "State-sponsored home care assistance", eligibility: ["income", "age", "care_needs"], minAge: 65 },
  { id: 9, name: "Respite Care Programs", category: "Caregiver Support", description: "Temporary relief for family caregivers", eligibility: ["caregiver"], minAge: null },
  { id: 10, name: "Senior Legal Aid", category: "Legal", description: "Free legal services for seniors", eligibility: ["age", "income"], minAge: 60 },
];

type FamilyProfile = {
  id: string;
  careTypes: string[];
  lovedOneAge: number | null;
  city: string;
  state: string;
};

export default function BenefitsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pageState, setPageState] = useState<"entry" | "form" | "results">("entry");
  const [selectedCareTypes, setSelectedCareTypes] = useState<CareType[]>([]);
  const [familyProfile, setFamilyProfile] = useState<FamilyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [matchedPrograms, setMatchedPrograms] = useState<typeof BENEFITS_PROGRAMS>([]);

  // Fetch family profile on mount
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchFamilyProfile();
    }
  }, [status, router]);

  const fetchFamilyProfile = async () => {
    try {
      const response = await fetch("/api/family-profiles/me");
      if (response.ok) {
        const data = await response.json();
        setFamilyProfile(data);
        // Pre-populate selected care types from profile
        if (data.careTypes && data.careTypes.length > 0) {
          setSelectedCareTypes(data.careTypes as CareType[]);
        }
      }
    } catch (err) {
      console.error("Error fetching family profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle care type selection
  const toggleCareType = (careType: CareType) => {
    setSelectedCareTypes(prev =>
      prev.includes(careType)
        ? prev.filter(ct => ct !== careType)
        : [...prev, careType]
    );
  };

  // Save selections to Care Profile and find matching programs
  const handleContinue = async () => {
    if (selectedCareTypes.length === 0) {
      showToast.error("Please select at least one care need");
      return;
    }

    setSaving(true);
    try {
      // Update family profile with selected care types
      const response = await fetch("/api/family-profiles/me", {
        method: familyProfile ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careTypes: selectedCareTypes,
          // Keep existing profile data
          ...(familyProfile && {
            lovedOneName: familyProfile.lovedOneAge ? `Loved One` : undefined,
            city: familyProfile.city,
            state: familyProfile.state,
          }),
        }),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setFamilyProfile(updatedProfile);

        // Match programs based on profile
        matchPrograms(updatedProfile);
        setPageState("results");
        showToast.success("Care needs saved to your profile");
      } else {
        showToast.error("Failed to save care needs");
      }
    } catch (err) {
      console.error("Error saving care needs:", err);
      showToast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // Simple matching algorithm based on profile data
  const matchPrograms = (profile: FamilyProfile) => {
    const age = profile.lovedOneAge;
    const hasCareNeeds = selectedCareTypes.length > 0;

    // Filter programs based on eligibility
    const matched = BENEFITS_PROGRAMS.filter(program => {
      // Check age requirement
      if (program.minAge && (!age || age < program.minAge)) {
        // Still show program but it may have different eligibility
        return true;
      }

      // Check if care needs match
      if (program.eligibility.includes("care_needs") && !hasCareNeeds) {
        return false;
      }

      return true;
    });

    // Sort by relevance (programs matching age first)
    matched.sort((a, b) => {
      const aMatchesAge = !a.minAge || (age && age >= a.minAge);
      const bMatchesAge = !b.minAge || (age && age >= b.minAge);
      if (aMatchesAge && !bMatchesAge) return -1;
      if (!aMatchesAge && bMatchesAge) return 1;
      return 0;
    });

    setMatchedPrograms(matched);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <Breadcrumb />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  // Entry State - Voice-first UI
  if (pageState === "entry") {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <MainNav />

        <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
          {/* Greeting text */}
          <div className="text-center mb-12 max-w-lg">
            <h1 className="text-2xl md:text-3xl font-medium text-white leading-relaxed">
              Hi{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}! I can help find benefits to reduce senior care costs. Tell me who needs care and where you&apos;re located.
            </h1>
          </div>

          {/* Voice button - placeholder */}
          <div className="relative mb-8">
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 cursor-pointer hover:scale-105 transition-transform">
              <div className="w-40 h-40 rounded-full border-4 border-blue-400/30 flex items-center justify-center">
                {/* Sound wave animation placeholder */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-1 bg-white rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 24 + 12}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            {/* Outer glow ring */}
            <div className="absolute inset-0 -m-2 rounded-full border-2 border-blue-500/20 animate-ping" style={{ animationDuration: '2s' }} />
          </div>

          {/* Coming soon notice */}
          <p className="text-cyan-400 text-sm mb-6">
            Voice input coming soon
          </p>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={() => setPageState("form")}
              className="w-full px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Fill Out Form Instead
            </button>
            <button
              onClick={() => router.push("/care-profile")}
              className="w-full px-6 py-3 bg-transparent text-gray-400 rounded-lg font-medium hover:text-white transition-colors"
            >
              Skip for Now
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Form Fallback State
  if (pageState === "form") {
    return (
      <div className="min-h-screen bg-[#F5F3EF]">
        <MainNav />
        <Breadcrumb />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setPageState("entry")}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/care-profile")}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <span className="text-gray-400">|</span>
              <span className="font-semibold text-gray-900">Care Needs</span>
            </div>
            <div className="w-10" /> {/* Spacer for alignment */}
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-gray-200 rounded-full mb-8">
            <div className="h-full w-1/2 bg-primary-600 rounded-full transition-all" />
          </div>

          {/* Form content */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              What kind of help is most needed?
            </h1>
            <p className="text-gray-600">
              Select 1 or more. This helps us find relevant benefits.
              {familyProfile?.careTypes && familyProfile.careTypes.length > 0 && (
                <span className="block text-sm text-primary-600 mt-1">
                  Your current selections from Care Profile are pre-selected.
                </span>
              )}
            </p>
          </div>

          {/* Care type selection grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {CARE_TYPES.map((item) => {
              const isSelected = selectedCareTypes.includes(item.value);
              return (
                <button
                  key={item.value}
                  onClick={() => toggleCareType(item.value)}
                  className={`flex flex-col items-center p-4 rounded-xl transition-all text-center ${
                    isSelected
                      ? "bg-primary-100 border-2 border-primary-600 shadow-md"
                      : "bg-white border-2 border-transparent shadow-sm hover:shadow-md"
                  }`}
                >
                  <span className="text-3xl mb-2">{item.icon}</span>
                  <span className={`font-semibold ${isSelected ? "text-primary-700" : "text-gray-900"}`}>
                    {item.label}
                  </span>
                  <span className="text-xs text-gray-500">{item.description}</span>
                  {isSelected && (
                    <span className="mt-2 text-primary-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPageState("entry")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              onClick={handleContinue}
              disabled={saving || selectedCareTypes.length === 0}
              className={`px-8 py-3 rounded-full font-semibold flex items-center gap-2 transition-colors ${
                selectedCareTypes.length > 0
                  ? "bg-primary-600 text-white hover:bg-primary-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Find Benefits
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Results State
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <MainNav />
      <Breadcrumb />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/care-profile")}
            className="text-primary-600 font-medium hover:text-primary-700"
          >
            Done
          </button>
          <button
            onClick={() => setPageState("form")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit needs
          </button>
        </div>

        {/* Results title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Benefits</h1>
          <div className="text-primary-600 text-xl font-semibold mb-2">
            We found {matchedPrograms.length} programs that may help
          </div>
          <p className="text-gray-600">
            Based on your care needs
            {familyProfile?.city && familyProfile?.state && (
              <> in {familyProfile.city}, {familyProfile.state}</>
            )}
            {familyProfile?.lovedOneAge && (
              <>, for someone {familyProfile.lovedOneAge} years old</>
            )}
          </p>
        </div>

        {/* Selected care types */}
        {selectedCareTypes.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Care needs:</p>
            <div className="flex flex-wrap gap-2">
              {selectedCareTypes.map(ct => {
                const careType = CARE_TYPES.find(c => c.value === ct);
                return careType ? (
                  <span
                    key={ct}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                  >
                    {careType.icon} {careType.label}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Programs section */}
        <div className="mb-4">
          <p className="text-gray-500 text-sm font-medium">Programs you may qualify for</p>
        </div>

        {/* Program list */}
        <div className="space-y-3">
          {matchedPrograms.map((program) => (
            <button
              key={program.id}
              className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-left group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{program.name}</h3>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {program.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{program.description}</p>
                {program.minAge && familyProfile?.lovedOneAge && familyProfile.lovedOneAge >= program.minAge && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Meets age requirement ({program.minAge}+)
                  </p>
                )}
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => router.push("/care-profile")}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Back to Care Profile
          </button>
          <button
            onClick={() => setPageState("form")}
            className="w-full px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors border border-primary-600"
          >
            Update Care Needs
          </button>
        </div>
      </main>
    </div>
  );
}
