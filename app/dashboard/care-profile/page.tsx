"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import Breadcrumb from "@/components/Navigation/Breadcrumb";
import ProgressIndicator from "@/components/CareProfile/ProgressIndicator";
import WarmIntroduction from "@/components/CareProfile/WarmIntroduction";
import ProfileCompleteness from "@/components/CareProfile/ProfileCompleteness";
import PrivacyReassurance from "@/components/CareProfile/PrivacyReassurance";
import AboutLovedOneSection from "@/components/CareProfile/AboutLovedOneSection";
import CareNeedsAssessment from "@/components/CareProfile/CareNeedsAssessment";
import PersonalityPreferences from "@/components/CareProfile/PersonalityPreferences";
import BudgetTimeline from "@/components/CareProfile/BudgetTimeline";
import LocationContactPreferences from "@/components/CareProfile/LocationContactPreferences";
import ProfileReviewPreview from "@/components/CareProfile/ProfileReviewPreview";

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
  // Location & contact preferences
  careSettingPreference?: string | null;
  proximityImportance?: string | null;
  proximityDetails?: string | null;
  neighborhoodPreferences?: string | null;
  preferredContactMethods?: string[];
  bestTimeToContact?: string[];
  tourPreference?: string | null;
  communicationFrequency?: string | null;
  additionalContactNotes?: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  // Enhanced budget & timeline
  budgetFlexibility?: string | null;
  paymentMethods?: string[];
  budgetIncludes?: string | null;
  financialAssistanceNeeded?: string | null;
  careUrgency?: string | null;
  preferredStartDate?: string | null;
  careDuration?: string | null;
  scheduleFlexibility?: string | null;
  timeline: string | null;
  insurance: string | null;
  description: string | null;
  // Review & privacy settings
  profileVisibility?: string | null;
  shareWithVerifiedOnly?: boolean;
  allowDirectMessages?: boolean;
  showContactInfo?: boolean;
  showFullName?: boolean;
  hideFromSearch?: boolean;
  profileNotes?: string | null;
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
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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

  // Budget & timeline state
  const [budgetTimeline, setBudgetTimeline] = useState({
    budgetMin: profile?.budgetMin || undefined,
    budgetMax: profile?.budgetMax || undefined,
    budgetFlexibility: profile?.budgetFlexibility || "",
    paymentMethods: profile?.paymentMethods || [],
    budgetIncludes: profile?.budgetIncludes || "",
    financialAssistanceNeeded: profile?.financialAssistanceNeeded || "",
    careUrgency: profile?.careUrgency || "",
    preferredStartDate: profile?.preferredStartDate || "",
    careDuration: profile?.careDuration || "",
    scheduleFlexibility: profile?.scheduleFlexibility || "",
  });

  // Location & contact preferences state
  const [locationContact, setLocationContact] = useState({
    careSettingPreference: profile?.careSettingPreference || "",
    proximityImportance: profile?.proximityImportance || "",
    proximityDetails: profile?.proximityDetails || "",
    neighborhoodPreferences: profile?.neighborhoodPreferences || "",
    preferredContactMethods: profile?.preferredContactMethods || [],
    bestTimeToContact: profile?.bestTimeToContact || [],
    tourPreference: profile?.tourPreference || "",
    communicationFrequency: profile?.communicationFrequency || "",
    additionalContactNotes: profile?.additionalContactNotes || "",
  });

  // Review & privacy settings state
  const [reviewPrivacy, setReviewPrivacy] = useState({
    profileVisibility: profile?.profileVisibility || "limited",
    shareWithVerifiedOnly: profile?.shareWithVerifiedOnly !== undefined ? profile.shareWithVerifiedOnly : true,
    allowDirectMessages: profile?.allowDirectMessages !== undefined ? profile.allowDirectMessages : true,
    showContactInfo: profile?.showContactInfo || false,
    showFullName: profile?.showFullName || false,
    hideFromSearch: profile?.hideFromSearch || false,
    profileNotes: profile?.profileNotes || "",
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
          // Update budgetTimeline state with fetched data
          setBudgetTimeline({
            budgetMin: data.budgetMin || undefined,
            budgetMax: data.budgetMax || undefined,
            budgetFlexibility: data.budgetFlexibility || "",
            paymentMethods: data.paymentMethods || [],
            budgetIncludes: data.budgetIncludes || "",
            financialAssistanceNeeded: data.financialAssistanceNeeded || "",
            careUrgency: data.careUrgency || "",
            preferredStartDate: data.preferredStartDate || "",
            careDuration: data.careDuration || "",
            scheduleFlexibility: data.scheduleFlexibility || "",
          });
          // Update locationContact state with fetched data
          setLocationContact({
            careSettingPreference: data.careSettingPreference || "",
            proximityImportance: data.proximityImportance || "",
            proximityDetails: data.proximityDetails || "",
            neighborhoodPreferences: data.neighborhoodPreferences || "",
            preferredContactMethods: data.preferredContactMethods || [],
            bestTimeToContact: data.bestTimeToContact || [],
            tourPreference: data.tourPreference || "",
            communicationFrequency: data.communicationFrequency || "",
            additionalContactNotes: data.additionalContactNotes || "",
          });
          // Update reviewPrivacy state with fetched data
          setReviewPrivacy({
            profileVisibility: data.profileVisibility || "limited",
            shareWithVerifiedOnly: data.shareWithVerifiedOnly !== undefined ? data.shareWithVerifiedOnly : true,
            allowDirectMessages: data.allowDirectMessages !== undefined ? data.allowDirectMessages : true,
            showContactInfo: data.showContactInfo || false,
            showFullName: data.showFullName || false,
            hideFromSearch: data.hideFromSearch || false,
            profileNotes: data.profileNotes || "",
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
    setSuccessMessage("");
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const careTypes = formData.getAll("careTypes");

    // Validate required fields
    const errors: Record<string, string> = {};

    if (careTypes.length === 0) {
      errors.careTypes = "Please select at least one care type";
    }

    if (!formData.get("location")) {
      errors.location = "Location is required";
    }

    if (!formData.get("city")) {
      errors.city = "City is required";
    }

    if (!formData.get("state")) {
      errors.state = "State is required";
    }

    if (!formData.get("zipCode")) {
      errors.zipCode = "Zip code is required";
    }

    if (!reviewPrivacy.profileVisibility) {
      errors.profileVisibility = "Please select a privacy setting";
    }

    // If there are errors, scroll to the first error and show them
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fill in all required fields");
      setSaving(false);

      // Scroll to first error and focus on it
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement ||
                          document.querySelector(`[data-field="${firstErrorField}"]`) as HTMLElement;
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });

        // Focus on the element after scrolling
        setTimeout(() => {
          if (errorElement instanceof HTMLInputElement || errorElement instanceof HTMLTextAreaElement) {
            errorElement.focus();
          } else {
            // If it's a container, find the first focusable element inside
            const focusable = errorElement.querySelector('input, textarea, select, button') as HTMLElement;
            if (focusable) {
              focusable.focus();
            }
          }
        }, 500);
      }
      return;
    }

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
      // Location & contact preferences
      careSettingPreference: locationContact.careSettingPreference || null,
      proximityImportance: locationContact.proximityImportance || null,
      proximityDetails: locationContact.proximityDetails || null,
      neighborhoodPreferences: locationContact.neighborhoodPreferences || null,
      preferredContactMethods: locationContact.preferredContactMethods,
      bestTimeToContact: locationContact.bestTimeToContact,
      tourPreference: locationContact.tourPreference || null,
      communicationFrequency: locationContact.communicationFrequency || null,
      additionalContactNotes: locationContact.additionalContactNotes || null,
      budgetMin: budgetTimeline.budgetMin || null,
      budgetMax: budgetTimeline.budgetMax || null,
      // Enhanced budget & timeline
      budgetFlexibility: budgetTimeline.budgetFlexibility || null,
      paymentMethods: budgetTimeline.paymentMethods,
      budgetIncludes: budgetTimeline.budgetIncludes || null,
      financialAssistanceNeeded: budgetTimeline.financialAssistanceNeeded || null,
      careUrgency: budgetTimeline.careUrgency || null,
      preferredStartDate: budgetTimeline.preferredStartDate || null,
      careDuration: budgetTimeline.careDuration || null,
      scheduleFlexibility: budgetTimeline.scheduleFlexibility || null,
      timeline: formData.get("timeline") || null,
      insurance: formData.get("insurance") || null,
      description: formData.get("description") || null,
      // Review & privacy settings
      profileVisibility: reviewPrivacy.profileVisibility || null,
      shareWithVerifiedOnly: reviewPrivacy.shareWithVerifiedOnly,
      allowDirectMessages: reviewPrivacy.allowDirectMessages,
      showContactInfo: reviewPrivacy.showContactInfo,
      showFullName: reviewPrivacy.showFullName,
      hideFromSearch: reviewPrivacy.hideFromSearch,
      profileNotes: reviewPrivacy.profileNotes || null,
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
      setSuccessMessage(
        profile
          ? "Your care profile has been updated successfully!"
          : "Your care profile has been created successfully!"
      );

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (err) {
      setError("Failed to save care profile. Please try again.");

      // Scroll to error message
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      label: "Location & contact preferences",
      completed: !!(locationContact.careSettingPreference && locationContact.preferredContactMethods.length > 0),
      required: false,
    },
    {
      label: "Budget & payment info",
      completed: !!(budgetTimeline.budgetMin && budgetTimeline.budgetMax && budgetTimeline.paymentMethods.length > 0),
      required: false,
    },
    {
      label: "Timeline & urgency",
      completed: !!(budgetTimeline.careUrgency && budgetTimeline.careDuration),
      required: false,
    },
    {
      label: "Privacy settings configured",
      completed: !!reviewPrivacy.profileVisibility,
      required: true,
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
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <Breadcrumb />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading Skeleton */}
          <div className="animate-pulse space-y-6">
            {/* Header Skeleton */}
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>

            {/* Form Skeleton */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>

              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>

              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <div className="h-12 bg-gray-200 rounded w-40"></div>
                <div className="h-12 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip to main content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <MainNav />
      <Breadcrumb />

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 flex items-center gap-2 hover:gap-3 transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div
            role="alert"
            aria-live="polite"
            className="bg-green-50 border-2 border-green-500 text-green-800 p-4 rounded-lg mb-6 animate-fade-in shadow-sm"
          >
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold">{successMessage}</p>
                <p className="text-sm text-green-700 mt-1">You can now browse providers or update your profile anytime.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="bg-red-50 border-2 border-red-500 text-red-800 p-4 rounded-lg mb-6 animate-fade-in shadow-sm"
          >
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold">{error}</p>
                {Object.keys(fieldErrors).length > 0 && (
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                    {Object.entries(fieldErrors).map(([field, message]) => (
                      <li key={field}>{message}</li>
                    ))}
                  </ul>
                )}
              </div>
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
            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Left: Form */}
              <div className="lg:col-span-2 order-2 lg:order-1">
                <form
                  onSubmit={handleSubmit}
                  className="bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8"
                  aria-label="Care profile form"
                  noValidate
                >
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
            <div data-field="careTypes">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                What type of help do you need?
                <span className="text-red-500 ml-1">*</span>
              </h2>
              <p className="text-sm text-gray-600 mb-3">Check all that apply</p>
              {fieldErrors.careTypes && (
                <p className="text-sm text-red-600 mb-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {fieldErrors.careTypes}
                </p>
              )}
              <div className={`space-y-2 ${fieldErrors.careTypes ? "ring-2 ring-red-500 rounded-lg p-3" : ""}`}>
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
                    aria-required="true"
                    aria-invalid={!!fieldErrors.location}
                    aria-describedby={fieldErrors.location ? "location-error" : undefined}
                    defaultValue={profile?.location || ""}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 transition-all ${
                      fieldErrors.location
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {fieldErrors.location && (
                    <p id="location-error" className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {fieldErrors.location}
                    </p>
                  )}
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
                      aria-required="true"
                      aria-invalid={!!fieldErrors.city}
                      aria-describedby={fieldErrors.city ? "city-error" : undefined}
                      defaultValue={profile?.city || ""}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 transition-all ${
                        fieldErrors.city
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {fieldErrors.city && (
                      <p id="city-error" className="text-sm text-red-600 mt-1">{fieldErrors.city}</p>
                    )}
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
                      aria-required="true"
                      aria-invalid={!!fieldErrors.state}
                      aria-describedby={fieldErrors.state ? "state-error" : undefined}
                      defaultValue={profile?.state || ""}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 transition-all ${
                        fieldErrors.state
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="CA"
                    />
                    {fieldErrors.state && (
                      <p id="state-error" className="text-sm text-red-600 mt-1">{fieldErrors.state}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zip Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      required
                      aria-required="true"
                      aria-invalid={!!fieldErrors.zipCode}
                      aria-describedby={fieldErrors.zipCode ? "zipCode-error" : undefined}
                      defaultValue={profile?.zipCode || ""}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 transition-all ${
                        fieldErrors.zipCode
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {fieldErrors.zipCode && (
                      <p id="zipCode-error" className="text-sm text-red-600 mt-1">{fieldErrors.zipCode}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Location & Contact Preferences Section */}
            <LocationContactPreferences
              data={locationContact}
              onDataChange={(field, value) => {
                setLocationContact((prev) => ({ ...prev, [field]: value }));
              }}
            />

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Budget & Timeline Section */}
            <BudgetTimeline
              data={budgetTimeline}
              onDataChange={(field, value) => {
                setBudgetTimeline((prev) => ({ ...prev, [field]: value }));
              }}
            />

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Review & Privacy Settings Section */}
            <ProfileReviewPreview
              data={reviewPrivacy}
              onDataChange={(field, value) => {
                setReviewPrivacy((prev) => ({ ...prev, [field]: value }));
              }}
              profileData={{
                completeness: Math.round((completenessItems.filter(item => item.completed).length / completenessItems.length) * 100),
                hasAboutLovedOne: !!(aboutLovedOne.lovedOneName || aboutLovedOne.ageRange || aboutLovedOne.relationship),
                hasCareNeeds: !!(careNeeds.careLevel && careNeeds.mobilityStatus),
                hasLocation: !!(profile?.city && profile?.state && profile?.zipCode),
                hasBudget: !!(budgetTimeline.budgetMin && budgetTimeline.budgetMax),
              }}
              errors={fieldErrors}
            />

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Additional Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Details</h2>
              <div className="space-y-4">
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
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                aria-busy={saving}
                aria-label={saving ? "Saving care profile" : (profile ? "Update care profile" : "Create care profile")}
                className="w-full sm:w-auto sm:flex-none bg-primary-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </span>
                ) : profile ? "Update Profile" : "Create Profile"}
              </button>
              {profile && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setError("");
                    setFieldErrors({});
                    setSuccessMessage("");
                  }}
                  aria-label="Cancel editing and return to view mode"
                  className="w-full sm:w-auto sm:flex-none bg-white border-2 border-gray-300 text-gray-700 px-6 sm:px-8 py-3 rounded-lg hover:border-gray-400 hover:bg-gray-50 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Helpful Footer Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Need help?</span> You can save your progress anytime and come back later to complete your profile. Fields marked with <span className="text-red-500">*</span> are required.
                  </p>
                </div>
              </div>
            </div>
          </form>
              </div>

              {/* Right: Sidebar */}
              <div className="lg:col-span-1 order-1 lg:order-2 space-y-4 lg:space-y-6">
                {/* Profile Completeness */}
                <ProfileCompleteness items={completenessItems} />

                {/* Privacy Reassurance - Hide on mobile, show on desktop */}
                <div className="hidden lg:block">
                  <PrivacyReassurance />
                </div>
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
