"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MainNav from "@/components/Navigation/MainNav";
import Footer from "@/components/Navigation/Footer";
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

// Category styling
const CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  Healthcare: { bg: "bg-emerald-100", text: "text-emerald-700", icon: "🏥" },
  "Food Assistance": { bg: "bg-orange-100", text: "text-orange-700", icon: "🍎" },
  Income: { bg: "bg-green-100", text: "text-green-700", icon: "💵" },
  Utilities: { bg: "bg-blue-100", text: "text-blue-700", icon: "⚡" },
  Veterans: { bg: "bg-indigo-100", text: "text-indigo-700", icon: "🎖️" },
  "Senior Services": { bg: "bg-purple-100", text: "text-purple-700", icon: "👴" },
  "Caregiver Support": { bg: "bg-pink-100", text: "text-pink-700", icon: "💝" },
  Legal: { bg: "bg-slate-100", text: "text-slate-700", icon: "⚖️" },
};

// Static benefits programs data (would come from API in production)
const BENEFITS_PROGRAMS = [
  { id: 1, name: "Medicaid Home Care", category: "Healthcare", description: "Covers in-home personal care services", eligibility: ["income", "age"], minAge: 65, savings: "$2,000-$5,000/mo" },
  { id: 2, name: "SNAP (Food Stamps)", category: "Food Assistance", description: "Monthly benefits for groceries", eligibility: ["income"], minAge: null, savings: "$200-$400/mo" },
  { id: 3, name: "SSI (Supplemental Security Income)", category: "Income", description: "Monthly cash assistance for living expenses", eligibility: ["income", "age"], minAge: 65, savings: "$914/mo max" },
  { id: 4, name: "Medicare Extra Help", category: "Healthcare", description: "Helps pay Medicare prescription drug costs", eligibility: ["income", "medicare"], minAge: 65, savings: "$5,000+/yr" },
  { id: 5, name: "LIHEAP", category: "Utilities", description: "Low Income Home Energy Assistance Program", eligibility: ["income"], minAge: null, savings: "$500-$1,500/yr" },
  { id: 6, name: "Veterans Aid & Attendance", category: "Veterans", description: "Monthly pension for veterans needing care", eligibility: ["veteran", "care_needs"], minAge: null, savings: "$2,000+/mo" },
  { id: 7, name: "Area Agency on Aging Services", category: "Senior Services", description: "Local support services for seniors", eligibility: ["age"], minAge: 60, savings: "Varies" },
  { id: 8, name: "Community Care Programs", category: "Healthcare", description: "State-sponsored home care assistance", eligibility: ["income", "age", "care_needs"], minAge: 65, savings: "$3,000+/mo" },
  { id: 9, name: "Respite Care Programs", category: "Caregiver Support", description: "Temporary relief for family caregivers", eligibility: ["caregiver"], minAge: null, savings: "$500-$2,000/mo" },
  { id: 10, name: "Senior Legal Aid", category: "Legal", description: "Free legal services for seniors", eligibility: ["age", "income"], minAge: 60, savings: "$200+/hr" },
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900 flex flex-col">
        <MainNav />

        <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
          {/* Stats banner */}
          <div className="flex items-center gap-6 mb-8 text-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">$15K+</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Avg. Annual Savings</div>
            </div>
            <div className="w-px h-12 bg-gray-700" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">50+</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Programs Available</div>
            </div>
            <div className="w-px h-12 bg-gray-700" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">2 min</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">To Complete</div>
            </div>
          </div>

          {/* Greeting text */}
          <div className="text-center mb-10 max-w-xl">
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-relaxed mb-4">
              Find Benefits to Reduce Care Costs
            </h1>
            <p className="text-lg text-gray-300">
              Hi{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}! Let&apos;s find programs that can help cover senior care expenses.
            </p>
          </div>

          {/* Voice button - placeholder */}
          <div className="relative mb-8">
            <div className="w-52 h-52 rounded-full bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 flex items-center justify-center shadow-2xl shadow-primary-500/40 cursor-pointer hover:scale-105 transition-transform">
              <div className="w-44 h-44 rounded-full border-4 border-white/20 flex items-center justify-center backdrop-blur-sm">
                {/* Sound wave animation */}
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-white rounded-full"
                      style={{
                        height: `${16 + Math.sin(i * 0.8) * 20}px`,
                        animation: `pulse 1s ease-in-out ${i * 0.1}s infinite alternate`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            {/* Outer glow rings */}
            <div className="absolute inset-0 -m-3 rounded-full border-2 border-primary-400/30 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-0 -m-6 rounded-full border border-primary-400/20 animate-ping" style={{ animationDuration: '3s' }} />
          </div>

          {/* Coming soon notice */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8">
            <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span className="text-primary-300 text-sm font-medium">Voice input coming soon</span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <button
              onClick={() => setPageState("form")}
              className="w-full px-6 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Start Benefits Finder
            </button>
            <button
              onClick={() => router.push("/care-profile")}
              className="w-full px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/20 transition-colors border border-white/20"
            >
              Skip for Now
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex items-center gap-6 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>100% Free</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No Obligations</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Form Fallback State
  if (pageState === "form") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <MainNav />

        {/* Progress Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setPageState("entry")}
                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="text-center">
                <span className="text-sm text-gray-500">Step 1 of 2</span>
                <h2 className="font-semibold text-gray-900">Select Care Needs</h2>
              </div>
              <button
                onClick={() => router.push("/care-profile")}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all" />
            </div>
          </div>
        </div>

        <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Form content */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              What kind of help is most needed?
            </h1>
            <p className="text-gray-600">
              Select all that apply. This helps us match you with the right programs.
            </p>
            {familyProfile?.careTypes && familyProfile.careTypes.length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-sm text-primary-600 bg-primary-50 px-3 py-2 rounded-lg">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Pre-selected from your Care Profile
              </div>
            )}
          </div>

          {/* Care type selection grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {CARE_TYPES.map((item) => {
              const isSelected = selectedCareTypes.includes(item.value);
              return (
                <button
                  key={item.value}
                  onClick={() => toggleCareType(item.value)}
                  className={`relative flex items-start gap-4 p-5 rounded-2xl transition-all text-left ${
                    isSelected
                      ? "bg-primary-50 border-2 border-primary-500 shadow-md ring-2 ring-primary-500/20"
                      : "bg-white border-2 border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300"
                  }`}
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    isSelected ? "bg-primary-100" : "bg-gray-100"
                  }`}>
                    {item.icon}
                  </div>
                  <div className="flex-grow min-w-0">
                    <span className={`font-semibold block ${isSelected ? "text-primary-700" : "text-gray-900"}`}>
                      {item.label}
                    </span>
                    <span className="text-sm text-gray-500 line-clamp-2">{item.description}</span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected count indicator */}
          {selectedCareTypes.length > 0 && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-700 font-bold">{selectedCareTypes.length}</span>
                </div>
                <div>
                  <p className="font-medium text-emerald-800">
                    {selectedCareTypes.length} care {selectedCareTypes.length === 1 ? "need" : "needs"} selected
                  </p>
                  <p className="text-sm text-emerald-600">
                    We&apos;ll find programs that match these needs
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Fixed bottom navigation */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setPageState("entry")}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              onClick={handleContinue}
              disabled={saving || selectedCareTypes.length === 0}
              className={`px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg ${
                selectedCareTypes.length > 0
                  ? "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-xl"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              }`}
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Finding Programs...
                </>
              ) : (
                <>
                  Find My Benefits
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results State
  const totalSavings = matchedPrograms.reduce((acc, p) => {
    const match = p.savings.match(/\$?([\d,]+)/);
    return acc + (match ? parseInt(match[1].replace(",", "")) : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainNav />

      {/* Success Hero */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-primary-700 text-white">
        <div className="max-w-3xl mx-auto px-4 py-10 text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Great News!</h1>
          <p className="text-xl text-emerald-100 mb-6">
            We found <span className="font-bold text-white">{matchedPrograms.length} programs</span> that may help reduce your care costs
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold">{matchedPrograms.length}</div>
              <div className="text-sm text-emerald-200">Programs Found</div>
            </div>
            <div className="w-px h-12 bg-white/30" />
            <div className="text-center">
              <div className="text-3xl font-bold">${totalSavings.toLocaleString()}+</div>
              <div className="text-sm text-emerald-200">Potential Savings/yr</div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow max-w-3xl mx-auto px-4 py-8 w-full">
        {/* Selected care types */}
        {selectedCareTypes.length > 0 && (
          <div className="mb-6 bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-700">Based on your care needs:</p>
              <button
                onClick={() => setPageState("form")}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Edit
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedCareTypes.map(ct => {
                const careType = CARE_TYPES.find(c => c.value === ct);
                return careType ? (
                  <span
                    key={ct}
                    className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium flex items-center gap-1.5"
                  >
                    <span>{careType.icon}</span>
                    {careType.label}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Programs section header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Programs You May Qualify For</h2>
          <span className="text-sm text-gray-500">{matchedPrograms.length} programs</span>
        </div>

        {/* Program list - Enhanced cards */}
        <div className="space-y-4">
          {matchedPrograms.map((program) => {
            const categoryStyle = CATEGORY_STYLES[program.category] || { bg: "bg-gray-100", text: "text-gray-700", icon: "📋" };
            const meetsAge = program.minAge && familyProfile?.lovedOneAge && familyProfile.lovedOneAge >= program.minAge;

            return (
              <div
                key={program.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden group cursor-pointer"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Category Icon */}
                    <div className={`w-12 h-12 rounded-xl ${categoryStyle.bg} flex items-center justify-center text-2xl flex-shrink-0`}>
                      {categoryStyle.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {program.name}
                          </h3>
                          <span className={`inline-block px-2.5 py-0.5 ${categoryStyle.bg} ${categoryStyle.text} text-xs font-medium rounded-full mt-1`}>
                            {program.category}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-bold text-emerald-600">{program.savings}</div>
                          <div className="text-xs text-gray-500">Est. savings</div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{program.description}</p>

                      {/* Eligibility indicators */}
                      <div className="flex flex-wrap items-center gap-2">
                        {meetsAge && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Meets age requirement
                          </span>
                        )}
                        {program.eligibility.includes("income") && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg">
                            Income-based
                          </span>
                        )}
                        {program.eligibility.includes("veteran") && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg">
                            Veterans only
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <svg className="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800">Eligibility may vary</p>
              <p className="text-sm text-amber-700 mt-1">
                These programs have specific requirements. Contact each program directly to confirm your eligibility and apply.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push("/care-profile")}
            className="flex-1 px-6 py-3.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Save to Care Profile
          </button>
          <button
            onClick={() => setPageState("form")}
            className="flex-1 px-6 py-3.5 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors border border-gray-300"
          >
            Update Care Needs
          </button>
        </div>
      </main>

      {/* Footer */}
      <Footer variant="light" />
    </div>
  );
}
