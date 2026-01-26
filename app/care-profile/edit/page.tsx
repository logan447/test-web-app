"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import Footer from "@/components/Navigation/Footer";

// ============================================
// TYPES
// ============================================

type CareProfile = {
  id: string;
  // Photo & Basics
  profilePhoto: string | null;
  lovedOneName: string | null;
  relationship: string | null;
  ageRange: string | null;
  gender: string | null;
  // Care Needs
  careTypes: string[];
  careLevel: string | null;
  medicalConditions: string[];
  mobilityStatus: string | null;
  dailyLivingAssistance: string[];
  additionalNeeds: string | null;
  // Location
  city: string;
  state: string;
  zipCode: string;
  location: string;
  careSettingPreference: string | null;
  // Budget & Timeline
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string | null;
  // Preferences
  hobbiesInterests: string[];
  languagePreferences: string[];
  culturalBackground: string | null;
  // Privacy
  isPublic: boolean;
  description: string | null;
};

// ============================================
// CONSTANTS - Plain language, 3rd-4th grade reading level
// ============================================

const CARE_TYPES = [
  { value: "PERSONAL_CARE", label: "Help with daily tasks", description: "Bathing, dressing, eating" },
  { value: "COMPANION_CARE", label: "Companionship", description: "Someone to spend time with" },
  { value: "SKILLED_NURSING", label: "Nursing care", description: "Medical help from a nurse" },
  { value: "MEMORY_CARE", label: "Memory care", description: "Help for memory loss" },
  { value: "HOSPICE_CARE", label: "End-of-life care", description: "Comfort and support" },
  { value: "RESPITE_CARE", label: "Short-term help", description: "Give family a break" },
  { value: "LIVE_IN_CARE", label: "Live-in care", description: "24/7 help at home" },
];

const CARE_LEVELS = [
  { value: "LIGHT", label: "Light help", description: "A few hours a week" },
  { value: "MODERATE", label: "Regular help", description: "Several hours daily" },
  { value: "EXTENSIVE", label: "Lots of help", description: "Most of the day" },
  { value: "FULL_TIME", label: "Full-time care", description: "Around the clock" },
];

const TIMELINES = [
  { value: "IMMEDIATELY", label: "Right now" },
  { value: "WITHIN_1_MONTH", label: "Within a month" },
  { value: "WITHIN_3_MONTHS", label: "In 1-3 months" },
  { value: "PLANNING_AHEAD", label: "Just planning" },
];

const RELATIONSHIPS = [
  { value: "PARENT", label: "Parent" },
  { value: "SPOUSE", label: "Spouse" },
  { value: "GRANDPARENT", label: "Grandparent" },
  { value: "SIBLING", label: "Sibling" },
  { value: "OTHER_RELATIVE", label: "Other relative" },
  { value: "FRIEND", label: "Friend" },
  { value: "SELF", label: "Myself" },
];

const AGE_RANGES = [
  { value: "UNDER_65", label: "Under 65" },
  { value: "65_74", label: "65-74" },
  { value: "75_84", label: "75-84" },
  { value: "85_PLUS", label: "85 or older" },
];

const CARE_SETTINGS = [
  { value: "AT_HOME", label: "At home", description: "Care in their own home" },
  { value: "FACILITY", label: "Care facility", description: "Assisted living or nursing home" },
  { value: "EITHER", label: "Not sure yet", description: "Still deciding" },
];

const MOBILITY_OPTIONS = [
  { value: "INDEPENDENT", label: "Gets around on their own" },
  { value: "SOME_HELP", label: "Needs some help moving" },
  { value: "WHEELCHAIR", label: "Uses a wheelchair" },
  { value: "BEDRIDDEN", label: "Mostly in bed" },
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function EditCareProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<CareProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  // Form state - Photo & Basics
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [lovedOneName, setLovedOneName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [gender, setGender] = useState("");

  // Form state - Care Needs
  const [careTypes, setCareTypes] = useState<string[]>([]);
  const [careLevel, setCareLevel] = useState("");
  const [mobilityStatus, setMobilityStatus] = useState("");
  const [additionalNeeds, setAdditionalNeeds] = useState("");

  // Form state - Location
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [careSettingPreference, setCareSettingPreference] = useState("");

  // Form state - Budget & Timeline
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [timeline, setTimeline] = useState("");

  // Form state - Preferences
  const [hobbiesInterests, setHobbiesInterests] = useState("");
  const [languagePreferences, setLanguagePreferences] = useState<string[]>([]);
  const [culturalBackground, setCulturalBackground] = useState("");

  // Form state - Privacy
  const [isPublic, setIsPublic] = useState(false);
  const [description, setDescription] = useState("");

  // Section collapse state
  const [expandedSections, setExpandedSections] = useState({
    preferences: false,
  });

  // ============================================
  // EFFECTS
  // ============================================

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
          // Populate form from existing profile
          setProfilePhoto(data.profilePhoto || null);
          setLovedOneName(data.lovedOneName || "");
          setRelationship(data.relationship || "");
          setAgeRange(data.ageRange || "");
          setGender(data.gender || "");
          setCareTypes(data.careTypes || []);
          setCareLevel(data.careLevel || "");
          setMobilityStatus(data.mobilityStatus || "");
          setAdditionalNeeds(data.additionalNeeds || "");
          setCity(data.city || "");
          setState(data.state || "");
          setZipCode(data.zipCode || "");
          setCareSettingPreference(data.careSettingPreference || "");
          setBudgetMin(data.budgetMin?.toString() || "");
          setBudgetMax(data.budgetMax?.toString() || "");
          setTimeline(data.timeline || "");
          setHobbiesInterests(data.hobbiesInterests?.join(", ") || "");
          setLanguagePreferences(data.languagePreferences || []);
          setCulturalBackground(data.culturalBackground || "");
          setIsPublic(data.isPublic || false);
          setDescription(data.description || "");
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handleCareTypeToggle = (type: string) => {
    setCareTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In production, upload to storage and get URL
      // For now, create a local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMessage("");

    // Validation
    if (careTypes.length === 0) {
      setError("Please select at least one type of care needed");
      setSaving(false);
      return;
    }

    if (!city || !state || !zipCode) {
      setError("Please fill in the location");
      setSaving(false);
      return;
    }

    const data = {
      profilePhoto,
      lovedOneName: lovedOneName || null,
      relationship: relationship || null,
      ageRange: ageRange || null,
      gender: gender || null,
      careTypes,
      careLevel: careLevel || null,
      mobilityStatus: mobilityStatus || null,
      additionalNeeds: additionalNeeds || null,
      location: `${city}, ${state} ${zipCode}`,
      city,
      state,
      zipCode,
      careSettingPreference: careSettingPreference || null,
      budgetMin: budgetMin ? parseInt(budgetMin) : null,
      budgetMax: budgetMax ? parseInt(budgetMax) : null,
      timeline: timeline || null,
      hobbiesInterests: hobbiesInterests ? hobbiesInterests.split(",").map(s => s.trim()).filter(Boolean) : [],
      languagePreferences,
      culturalBackground: culturalBackground || null,
      isPublic,
      description: description || null,
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

      if (!savedProfile || !savedProfile.id) {
        throw new Error("Save appeared to succeed but no profile was returned");
      }

      setProfile(savedProfile);
      setSuccessMessage("Profile saved!");
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

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const calculateProgress = () => {
    let filled = 0;
    let total = 6; // Required + encouraged fields

    if (careTypes.length > 0) filled++;
    if (city && state && zipCode) filled++;
    if (lovedOneName) filled++;
    if (profilePhoto) filled++;
    if (careLevel) filled++;
    if (relationship) filled++;

    return Math.round((filled / total) * 100);
  };

  const progress = calculateProgress();

  const getDisplayName = () => {
    if (lovedOneName) return lovedOneName;
    if (relationship === "SELF") return "You";
    return "Your loved one";
  };

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-white rounded-xl p-6 h-48"></div>
                <div className="bg-white rounded-xl p-6 h-64"></div>
              </div>
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl p-6 h-96"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      {/* Compact Hero - Under 200px */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/care-profile"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {profile ? "Edit Your Care Profile" : "Build Your Care Profile"}
          </h1>
          <p className="text-gray-600 mt-1">
            Help providers understand your needs. Complete profiles get 3x more responses.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800 font-medium">{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* LEFT COLUMN: Form Sections */}
            <div className="lg:col-span-3 space-y-6">

              {/* SECTION 1: Photo & Basics */}
              <section className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Who needs care?</h2>
                <p className="text-sm text-gray-600 mb-6">Providers respond faster when they know who they&apos;re helping.</p>

                {/* Photo Upload */}
                <div className="flex items-start gap-6 mb-6">
                  <div className="shrink-0">
                    <div className="relative">
                      {profilePhoto ? (
                        <img
                          src={profilePhoto}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover border-4 border-primary-100"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-gray-200 flex items-center justify-center">
                          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      <label className="absolute -bottom-1 -right-1 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-1">Add a photo</p>
                    <p className="text-sm text-gray-500">Profiles with photos get 3x more responses from providers.</p>
                  </div>
                </div>

                {/* Name & Relationship */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Their name</label>
                    <input
                      type="text"
                      value={lovedOneName}
                      onChange={(e) => setLovedOneName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your relationship</label>
                    <select
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select...</option>
                      {RELATIONSHIPS.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Age & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age range</label>
                    <select
                      value={ageRange}
                      onChange={(e) => setAgeRange(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select...</option>
                      {AGE_RANGES.map((a) => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select...</option>
                      <option value="FEMALE">Female</option>
                      <option value="MALE">Male</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* SECTION 2: Care Needs */}
              <section className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">What kind of care?</h2>
                <p className="text-sm text-gray-600 mb-6">Select all that apply.</p>

                {/* Care Types */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {CARE_TYPES.map((care) => (
                    <label
                      key={care.value}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        careTypes.includes(care.value)
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={careTypes.includes(care.value)}
                        onChange={() => handleCareTypeToggle(care.value)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mr-3 ${
                        careTypes.includes(care.value)
                          ? "bg-primary-600 border-primary-600"
                          : "border-gray-300"
                      }`}>
                        {careTypes.includes(care.value) && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 text-sm">{care.label}</span>
                        <p className="text-xs text-gray-500">{care.description}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Care Level */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">How much help is needed?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CARE_LEVELS.map((level) => (
                      <label
                        key={level.value}
                        className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${
                          careLevel === level.value
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="careLevel"
                          value={level.value}
                          checked={careLevel === level.value}
                          onChange={(e) => setCareLevel(e.target.value)}
                          className="sr-only"
                        />
                        <span className="font-medium text-sm text-gray-900">{level.label}</span>
                        <p className="text-xs text-gray-500 mt-0.5">{level.description}</p>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Mobility */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobility</label>
                  <select
                    value={mobilityStatus}
                    onChange={(e) => setMobilityStatus(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select...</option>
                    {MOBILITY_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </section>

              {/* SECTION 3: Location */}
              <section className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Where is care needed?</h2>
                <p className="text-sm text-gray-600 mb-6">We&apos;ll show you providers nearby.</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="CA"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value.slice(0, 5))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="92101"
                      maxLength={5}
                    />
                  </div>
                </div>

                {/* Care Setting */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Where would you like care?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {CARE_SETTINGS.map((setting) => (
                      <label
                        key={setting.value}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          careSettingPreference === setting.value
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="careSetting"
                          value={setting.value}
                          checked={careSettingPreference === setting.value}
                          onChange={(e) => setCareSettingPreference(e.target.value)}
                          className="sr-only"
                        />
                        <span className="font-medium text-gray-900">{setting.label}</span>
                        <p className="text-xs text-gray-500 mt-0.5">{setting.description}</p>
                      </label>
                    ))}
                  </div>
                </div>
              </section>

              {/* SECTION 4: Budget & Timeline */}
              <section className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Budget &amp; timing</h2>
                <p className="text-sm text-gray-600 mb-6">Optional, but helps providers give accurate quotes.</p>

                {/* Budget */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly budget</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Min"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">When do you need care?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TIMELINES.map((t) => (
                      <label
                        key={t.value}
                        className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${
                          timeline === t.value
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="timeline"
                          value={t.value}
                          checked={timeline === t.value}
                          onChange={(e) => setTimeline(e.target.value)}
                          className="sr-only"
                        />
                        <span className="font-medium text-sm text-gray-900">{t.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </section>

              {/* SECTION 5: Preferences (Collapsible) */}
              <section className="bg-white rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setExpandedSections(prev => ({ ...prev, preferences: !prev.preferences }))}
                  className="w-full p-6 flex items-center justify-between text-left"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
                    <p className="text-sm text-gray-600">Optional details for better matches</p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.preferences ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedSections.preferences && (
                  <div className="px-6 pb-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hobbies &amp; interests</label>
                      <input
                        type="text"
                        value={hobbiesInterests}
                        onChange={(e) => setHobbiesInterests(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Reading, gardening, music..."
                      />
                      <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cultural background</label>
                      <input
                        type="text"
                        value={culturalBackground}
                        onChange={(e) => setCulturalBackground(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Any preferences..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Anything else providers should know?</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                        placeholder="Special routines, medical notes, preferences..."
                      />
                    </div>
                  </div>
                )}
              </section>

              {/* SECTION 6: Privacy */}
              <section className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Privacy</h2>
                <p className="text-sm text-gray-600 mb-6">Control who can see your profile.</p>

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
                    <span className="font-medium text-gray-900">Let providers find me</span>
                    <p className="text-sm text-gray-600 mt-0.5">
                      When on, providers in your area can see your profile and reach out. When off, only providers you contact can see your info.
                    </p>
                  </div>
                </label>
              </section>

              {/* Save Button */}
              <div className="flex justify-end">
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
              </div>
            </div>

            {/* RIGHT COLUMN: Live Preview */}
            <div className="lg:col-span-2">
              <div ref={previewRef} className="lg:sticky lg:top-8 space-y-6">
                {/* Progress Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">Profile completion</span>
                    <span className={`text-lg font-bold ${progress >= 80 ? "text-green-600" : progress >= 50 ? "text-amber-600" : "text-gray-600"}`}>
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${progress >= 80 ? "bg-green-500" : progress >= 50 ? "bg-amber-500" : "bg-gray-400"}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  {progress < 80 && (
                    <p className="text-sm text-gray-600 mt-3">
                      {!profilePhoto && "Add a photo, "}
                      {!lovedOneName && "add a name, "}
                      {careTypes.length === 0 && "select care types, "}
                      {(!city || !state || !zipCode) && "add location "}
                      to improve your profile.
                    </p>
                  )}
                </div>

                {/* Live Preview Card */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-600">What providers see</p>
                  </div>
                  <div className="p-5">
                    {/* Preview Header */}
                    <div className="flex items-start gap-4 mb-4">
                      {profilePhoto ? (
                        <img
                          src={profilePhoto}
                          alt="Profile"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {getDisplayName()}
                        </h3>
                        {ageRange && (
                          <p className="text-sm text-gray-600">
                            {AGE_RANGES.find(a => a.value === ageRange)?.label}
                            {gender && `, ${gender === "MALE" ? "Male" : gender === "FEMALE" ? "Female" : "Other"}`}
                          </p>
                        )}
                        {city && state && (
                          <p className="text-sm text-gray-500">{city}, {state}</p>
                        )}
                      </div>
                    </div>

                    {/* Care Types */}
                    {careTypes.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Needs help with</p>
                        <div className="flex flex-wrap gap-1.5">
                          {careTypes.map((type) => (
                            <span key={type} className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium">
                              {CARE_TYPES.find(c => c.value === type)?.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Details */}
                    <div className="space-y-2 text-sm">
                      {careLevel && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {CARE_LEVELS.find(l => l.value === careLevel)?.label}
                        </div>
                      )}
                      {timeline && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {TIMELINES.find(t => t.value === timeline)?.label}
                        </div>
                      )}
                      {(budgetMin || budgetMax) && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          ${budgetMin || "?"} - ${budgetMax || "?"}/mo
                        </div>
                      )}
                      {careSettingPreference && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          {CARE_SETTINGS.find(s => s.value === careSettingPreference)?.label}
                        </div>
                      )}
                    </div>

                    {/* Empty state */}
                    {careTypes.length === 0 && !city && !lovedOneName && (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">Fill in your profile to see a preview</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Why complete */}
                <div className="bg-primary-50 rounded-xl border border-primary-100 p-5">
                  <h3 className="font-semibold text-primary-900 mb-3">Why complete your profile?</h3>
                  <ul className="space-y-2 text-sm text-primary-800">
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Get matched with the right providers
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Providers respond faster to complete profiles
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Find benefits to help pay for care
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer variant="light" />
    </div>
  );
}
