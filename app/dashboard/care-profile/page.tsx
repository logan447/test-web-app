"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import ProgressIndicator from "@/components/CareProfile/ProgressIndicator";
import WarmIntroduction from "@/components/CareProfile/WarmIntroduction";
import ProfileCompleteness from "@/components/CareProfile/ProfileCompleteness";
import PrivacyReassurance from "@/components/CareProfile/PrivacyReassurance";
import AboutLovedOneSection from "@/components/CareProfile/AboutLovedOneSection";
import CareNeedsAssessment from "@/components/CareProfile/CareNeedsAssessment";
import PersonalityPreferences from "@/components/CareProfile/PersonalityPreferences";

type CareProfile = {
  id: string;
  // About loved one
  profilePhoto?: string | null;
  lovedOneName?: string | null;
  ageRange?: string | null;
  gender?: string | null;
  livingSituation?: string | null;
  relationship?: string | null;
  // Care needs assessment
  careLevel?: string | null;
  medicalConditions?: string[];
  mobilityStatus?: string | null;
  dailyLivingAssistance?: string[];
  additionalNeeds?: string | null;
  // Personality & preferences
  personalityTraits?: string[];
  hobbiesInterests?: string[];
  communicationPreferences?: string[];
  culturalBackground?: string | null;
  religiousPreferences?: string | null;
  languagePreferences?: string[];
  petPreferences?: string | null;
  // Care needs
  careTypes: string[];
  location: string;
  city: string;
  state: string;
  zipCode: string;
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string | null;
  insurance: string | null;
  description: string | null;
  isPublic: boolean;
};

export default function CareProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<CareProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // About loved one state
  const [aboutLovedOne, setAboutLovedOne] = useState({
    profilePhoto: profile?.profilePhoto || null,
    lovedOneName: profile?.lovedOneName || "",
    ageRange: profile?.ageRange || "",
    gender: profile?.gender || "",
    livingSituation: profile?.livingSituation || "",
    relationship: profile?.relationship || "",
  });

  // Care needs assessment state
  const [careNeeds, setCareNeeds] = useState({
    careLevel: profile?.careLevel || "",
    medicalConditions: profile?.medicalConditions || [],
    mobilityStatus: profile?.mobilityStatus || "",
    dailyLivingAssistance: profile?.dailyLivingAssistance || [],
    additionalNeeds: profile?.additionalNeeds || "",
  });

  // Personality & preferences state
  const [personality, setPersonality] = useState({
    personalityTraits: profile?.personalityTraits || [],
    hobbiesInterests: profile?.hobbiesInterests || [],
    communicationPreferences: profile?.communicationPreferences || [],
    culturalBackground: profile?.culturalBackground || "",
    religiousPreferences: profile?.religiousPreferences || "",
    languagePreferences: profile?.languagePreferences || [],
    petPreferences: profile?.petPreferences || "",
  });

  // Define steps for progress tracking
  const totalSteps = 3; // Will expand in future sprints
  const steps = [
    { number: 1, title: "Care Needs", completed: currentStep > 1 },
    { number: 2, title: "Location & Budget", completed: currentStep > 2 },
    { number: 3, title: "Additional Details", completed: currentStep > 3 },
  ];

  // Step configurations
  const stepConfig = {
    1: {
      title: "What type of care do you need?",
      description: "Let us know what kind of help your loved one needs. You can select multiple care types to find the best match.",
    },
    2: {
      title: "Where are you looking for care?",
      description: "Tell us where you'd like care to be provided and what you can spend each month. This helps us find providers in your area within your budget.",
    },
    3: {
      title: "Tell us more about your situation",
      description: "Share additional details like your timeline and any special needs. This information helps providers prepare to give the best care possible.",
    },
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/care-profiles");
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setProfile(data);
          setIsPublic(data.isPublic || false);
          // Update aboutLovedOne state with fetched data
          setAboutLovedOne({
            profilePhoto: data.profilePhoto || null,
            lovedOneName: data.lovedOneName || "",
            ageRange: data.ageRange || "",
            gender: data.gender || "",
            livingSituation: data.livingSituation || "",
            relationship: data.relationship || "",
          });
          // Update careNeeds state with fetched data
          setCareNeeds({
            careLevel: data.careLevel || "",
            medicalConditions: data.medicalConditions || [],
            mobilityStatus: data.mobilityStatus || "",
            dailyLivingAssistance: data.dailyLivingAssistance || [],
            additionalNeeds: data.additionalNeeds || "",
          });
          // Update personality state with fetched data
          setPersonality({
            personalityTraits: data.personalityTraits || [],
            hobbiesInterests: data.hobbiesInterests || [],
            communicationPreferences: data.communicationPreferences || [],
            culturalBackground: data.culturalBackground || "",
            religiousPreferences: data.religiousPreferences || "",
            languagePreferences: data.languagePreferences || [],
            petPreferences: data.petPreferences || "",
          });
        } else {
          setEditing(true); // No profile exists, start in edit mode
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const careTypes = formData.getAll("careTypes");

    const data = {
      // About loved one
      profilePhoto: aboutLovedOne.profilePhoto,
      lovedOneName: aboutLovedOne.lovedOneName || null,
      ageRange: aboutLovedOne.ageRange || null,
      gender: aboutLovedOne.gender || null,
      livingSituation: aboutLovedOne.livingSituation || null,
      relationship: aboutLovedOne.relationship || null,
      // Care needs assessment
      careLevel: careNeeds.careLevel || null,
      medicalConditions: careNeeds.medicalConditions,
      mobilityStatus: careNeeds.mobilityStatus || null,
      dailyLivingAssistance: careNeeds.dailyLivingAssistance,
      additionalNeeds: careNeeds.additionalNeeds || null,
      // Personality & preferences
      personalityTraits: personality.personalityTraits,
      hobbiesInterests: personality.hobbiesInterests,
      communicationPreferences: personality.communicationPreferences,
      culturalBackground: personality.culturalBackground || null,
      religiousPreferences: personality.religiousPreferences || null,
      languagePreferences: personality.languagePreferences,
      petPreferences: personality.petPreferences || null,
      // Care needs
      careTypes,
      location: formData.get("location"),
      city: formData.get("city"),
      state: formData.get("state"),
      zipCode: formData.get("zipCode"),
      budgetMin: formData.get("budgetMin") ? parseInt(formData.get("budgetMin") as string) : null,
      budgetMax: formData.get("budgetMax") ? parseInt(formData.get("budgetMax") as string) : null,
      timeline: formData.get("timeline") || null,
      insurance: formData.get("insurance") || null,
      description: formData.get("description") || null,
      isPublic: isPublic,
    };

    try {
      const method = profile ? "PATCH" : "POST";
      const response = await fetch("/api/care-profiles", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      const savedProfile = await response.json();
      setProfile(savedProfile);
      setEditing(false);
    } catch (err) {
      setError("Failed to save care profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const formatCareType = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Calculate profile completeness
  const completenessItems = [
    {
      label: "About your loved one",
      completed: !!(aboutLovedOne.lovedOneName || aboutLovedOne.ageRange || aboutLovedOne.relationship),
      required: false,
    },
    {
      label: "Care needs assessment",
      completed: !!(careNeeds.careLevel && careNeeds.mobilityStatus),
      required: true,
    },
    {
      label: "Personality & preferences",
      completed: !!(personality.personalityTraits.length > 0 || personality.hobbiesInterests.length > 0 || personality.languagePreferences.length > 0),
      required: false,
    },
    {
      label: "Care types selected",
      completed: !!(profile?.careTypes && profile.careTypes.length > 0),
      required: true,
    },
    {
      label: "Location information",
      completed: !!(profile?.city && profile?.state && profile?.zipCode),
      required: true,
    },
    {
      label: "Budget range",
      completed: !!(profile?.budgetMin && profile?.budgetMax),
      required: false,
    },
    {
      label: "Timeline provided",
      completed: !!profile?.timeline,
      required: false,
    },
    {
      label: "Insurance information",
      completed: !!profile?.insurance,
      required: false,
    },
    {
      label: "Description added",
      completed: !!profile?.description,
      required: false,
    },
  ];

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 flex items-center gap-2 hover:gap-3 transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6 animate-fade-in">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {editing ? (
          <>
            {/* Progress Indicator */}
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={totalSteps}
              steps={steps}
            />

            {/* Warm Introduction */}
            <WarmIntroduction
              currentStep={currentStep}
              stepTitle={stepConfig[currentStep as keyof typeof stepConfig].title}
              stepDescription={stepConfig[currentStep as keyof typeof stepConfig].description}
            />

            {/* Two-column layout: Form + Sidebar */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left: Form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-8">
            {/* About Your Loved One Section */}
            <AboutLovedOneSection
              data={aboutLovedOne}
              onDataChange={(field, value) => {
                setAboutLovedOne((prev) => ({ ...prev, [field]: value }));
              }}
            />

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Care Needs Assessment Section */}
            <CareNeedsAssessment
              data={careNeeds}
              onDataChange={(field, value) => {
                setCareNeeds((prev) => ({ ...prev, [field]: value }));
              }}
            />

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Personality & Preferences Section */}
            <PersonalityPreferences
              data={personality}
              onDataChange={(field, value) => {
                setPersonality((prev) => ({ ...prev, [field]: value }));
              }}
            />

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Care Types Needed */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What type of help do you need?</h2>
              <p className="text-sm text-gray-600 mb-3">Check all that apply</p>
              <div className="space-y-2">
                {[
                  { value: "COMPANION_CARE", label: "Companion Care" },
                  { value: "PERSONAL_CARE", label: "Personal Care" },
                  { value: "SKILLED_NURSING", label: "Skilled Nursing" },
                  { value: "MEMORY_CARE", label: "Memory Care" },
                  { value: "HOSPICE_CARE", label: "Hospice Care" },
                  { value: "RESPITE_CARE", label: "Respite Care" },
                  { value: "LIVE_IN_CARE", label: "Live-In Care" },
                ].map((care) => (
                  <label key={care.value} className="flex items-center">
                    <input
                      type="checkbox"
                      name="careTypes"
                      value={care.value}
                      defaultChecked={profile?.careTypes.includes(care.value)}
                      className="rounded border-gray-300 text-primary-600 mr-2"
                    />
                    <span className="text-sm text-gray-700">{care.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Address/Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    defaultValue={profile?.location || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      defaultValue={profile?.city || ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      maxLength={2}
                      defaultValue={profile?.state || ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="CA"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zip Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      required
                      defaultValue={profile?.zipCode || ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Budget */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What you can spend each month</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum (per month)
                  </label>
                  <input
                    type="number"
                    name="budgetMin"
                    defaultValue={profile?.budgetMin || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Example: $2,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum (per month)
                  </label>
                  <input
                    type="number"
                    name="budgetMax"
                    defaultValue={profile?.budgetMax || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Example: $5,000"
                  />
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    When do you need help to start?
                  </label>
                  <input
                    type="text"
                    name="timeline"
                    defaultValue={profile?.timeline || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Examples: Right away, In 2 weeks, Next month"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Do you have insurance coverage?
                  </label>
                  <input
                    type="text"
                    name="insurance"
                    defaultValue={profile?.insurance || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Examples: Medicare, Medicaid, Private insurance, or None"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tell us about your loved one
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    defaultValue={profile?.description || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Share information about their needs, personality, or preferences that would help caregivers provide the best care..."
                  />
                </div>
              </div>
            </div>

            {/* Profile Visibility */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Who can see your information?</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <span className="block text-sm font-medium text-gray-900">
                      Let caregivers find and message me
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      When checked, caregivers can see your profile and send you messages.
                      When unchecked, only caregivers you contact can see your information.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 sm:flex-none bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-sm hover:shadow-md"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : profile ? "Update Profile" : "Create Profile"}
              </button>
              {profile && (
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 sm:flex-none bg-white border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:border-gray-400 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
              </div>

              {/* Right: Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Profile Completeness */}
                <ProfileCompleteness items={completenessItems} />

                {/* Privacy Reassurance */}
                <PrivacyReassurance />
              </div>
            </div>
          </>
        ) : profile ? (
          <>
            {/* Header with Edit Button */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Care Profile</h1>
                <p className="text-gray-600">Your care needs and preferences</p>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md flex items-center gap-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            </div>

            {/* Two-column layout: Profile Info + Sidebar */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left: Profile Information */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-6">
            {/* Care Types */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Care Types Needed</h2>
              <div className="flex flex-wrap gap-2">
                {profile.careTypes.map((care) => (
                  <span
                    key={care}
                    className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm"
                  >
                    {formatCareType(care)}
                  </span>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Location</h2>
              <p className="text-gray-700">{profile.location}</p>
              <p className="text-gray-600">
                {profile.city}, {profile.state} {profile.zipCode}
              </p>
            </div>

            {/* Budget */}
            {(profile.budgetMin || profile.budgetMax) && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Budget</h2>
                <p className="text-gray-700">
                  ${profile.budgetMin?.toLocaleString() || "N/A"} - ${profile.budgetMax?.toLocaleString() || "N/A"} per month
                </p>
              </div>
            )}

            {/* Timeline */}
            {profile.timeline && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Timeline</h2>
                <p className="text-gray-700">{profile.timeline}</p>
              </div>
            )}

            {/* Insurance */}
            {profile.insurance && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Insurance</h2>
                <p className="text-gray-700">{profile.insurance}</p>
              </div>
            )}

            {/* Description */}
            {profile.description && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Description & Special Needs</h2>
                <p className="text-gray-700 whitespace-pre-line">{profile.description}</p>
              </div>
            )}
                </div>
              </div>

              {/* Right: Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Profile Completeness */}
                <ProfileCompleteness items={completenessItems} />
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
