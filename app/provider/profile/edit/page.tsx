"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import MainNav from "@/components/Navigation/MainNav";
import Breadcrumb from "@/components/Navigation/Breadcrumb";
import ProviderProfileCompleteness from "@/components/ProviderProfile/ProviderProfileCompleteness";
import VisibilityGateWidget from "@/components/ProviderProfile/VisibilityGateWidget";
import AboutUsSection, { AboutUsData } from "@/components/ProviderProfile/AboutUsSection";
import CareServicesSection, { CareServicesData } from "@/components/ProviderProfile/CareServicesSection";
import PricingStructureSection, { PricingStructureData } from "@/components/ProviderProfile/PricingStructureSection";
import AmenitiesFeaturesSection, { AmenitiesFeaturesData } from "@/components/ProviderProfile/AmenitiesFeaturesSection";
import StaffInformationSection, { StaffInformationData } from "@/components/ProviderProfile/StaffInformationSection";
import CertificationsLicensingSection, { CertificationsLicensingData } from "@/components/ProviderProfile/CertificationsLicensingSection";
import SpecialtyProgramsSection, { SpecialtyProgramsData } from "@/components/ProviderProfile/SpecialtyProgramsSection";
import VirtualTourSection, { VirtualTourData } from "@/components/ProviderProfile/VirtualTourSection";
import { showToast } from "@/lib/toast";

// Types
interface Provider {
  id: string;
  userId: string;
  name: string;
  providerType: string;
  description: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  serviceRadius: number | null;
  careTypesOffered: string[];
  isVisible: boolean;
  availableForFamilies: boolean;
  availableForOrganizations: boolean;
  // Additional fields
  [key: string]: unknown;
  // Completion summary from API
  _completion?: {
    meetsVisibility: boolean;
    missingRequired: string[];
    completionPercentage: number;
    completedSections: number;
    totalSections: number;
    items: Array<{
      section: string;
      label: string;
      completed: boolean;
      description: string;
      isRequired: boolean;
    }>;
    nudgeMessage: string;
  };
}

// Collapsible Section Component
function CollapsibleSection({
  title,
  description,
  isExpanded,
  onToggle,
  children,
  badge,
}: {
  title: string;
  description?: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: "required" | "complete" | "incomplete";
}) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border transition-all ${
      isExpanded ? "border-primary-200 shadow-md" : "border-gray-200"
    }`}>
      <button
        type="button"
        onClick={onToggle}
        className={`w-full px-5 py-4 flex items-center justify-between text-left transition-colors rounded-t-xl ${
          isExpanded ? "bg-primary-50/50" : "hover:bg-gray-50"
        }`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            {badge === "required" && (
              <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                Required
              </span>
            )}
            {badge === "complete" && (
              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Complete
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
        <div className={`flex-shrink-0 ml-4 p-1 rounded-full transition-colors ${
          isExpanded ? "bg-primary-100" : "bg-gray-100"
        }`}>
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${
              isExpanded ? "rotate-180 text-primary-600" : "text-gray-500"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${
        isExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
      }`}>
        <div className="px-5 pb-5 border-t border-gray-100">
          <div className="pt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

// Provider Type Options
const PROVIDER_TYPES = [
  { value: "ASSISTED_LIVING", label: "Assisted Living" },
  { value: "INDEPENDENT_LIVING", label: "Independent Living" },
  { value: "MEMORY_CARE", label: "Memory Care" },
  { value: "NURSING_HOME", label: "Nursing Home" },
  { value: "HOME_CARE", label: "Home Care" },
  { value: "HOME_HEALTH", label: "Home Health" },
  { value: "HOSPICE", label: "Hospice" },
  { value: "ADULT_DAY_CARE", label: "Adult Day Care" },
  { value: "RESPITE_CARE", label: "Respite Care" },
  { value: "INDEPENDENT_CAREGIVER", label: "Independent Caregiver" },
];

// US States
const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export default function ProviderProfileEditPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Provider data state
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState<string[]>(["basicInfo"]);

  // Form state for basic fields (not using section components)
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    providerType: "",
    description: "",
    website: "",
  });

  const [location, setLocation] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    serviceRadius: "",
  });

  const [contact, setContact] = useState({
    phone: "",
    email: "",
  });

  // Section data for complex components
  const [aboutUsData, setAboutUsData] = useState<AboutUsData>({
    establishedYear: "",
    facilityHistory: "",
    missionStatement: "",
    whatMakesUsUnique: "",
  });

  const [careServicesData, setCareServicesData] = useState<CareServicesData>({
    careTypes: [],
    medicalServices: [],
    personalCareServices: [],
    dailyLivingServices: [],
    memoryCareServices: [],
    socialRecreationServices: [],
  });

  const [pricingData, setPricingData] = useState<PricingStructureData>({
    privateRoomMin: null,
    privateRoomMax: null,
    semiPrivateRoomMin: null,
    semiPrivateRoomMax: null,
    includedServices: [],
    additionalServices: [],
    communityFee: null,
    securityDeposit: null,
    applicationFee: null,
    acceptsFinancialAssistance: false,
    financialAssistanceTypes: [],
    offersPaymentPlans: false,
    paymentPlanDetails: "",
  });

  const [amenitiesData, setAmenitiesData] = useState<AmenitiesFeaturesData>({
    roomFeatures: [],
    commonAreas: [],
    safetySecurityFeatures: [],
    medicalAmenities: [],
    activitiesPrograms: [],
    dietaryOptions: [],
  });

  const [staffData, setStaffData] = useState<StaffInformationData>({
    daytimeRatio: "",
    eveningRatio: "",
    nightRatio: "",
    credentials: [],
    staffTrainingDescription: "",
    hasOnCallPhysician: false,
    hasPharmacyPartnership: false,
    visitingDoctorFrequency: "",
    languagesSpoken: [],
  });

  const [certificationData, setCertificationData] = useState<CertificationsLicensingData>({
    licensed: false,
    licenseNumber: "",
    certificateUrls: [],
    accreditations: [],
    awards: [],
  });

  const [specialtyData, setSpecialtyData] = useState<SpecialtyProgramsData>({
    specialtyPrograms: [],
    petPolicy: "",
    petPolicyDetails: "",
    visitorPolicy: "",
    smokingPolicy: "",
    hasTrialPeriod: false,
    trialPeriodDuration: "",
  });

  const [virtualTourData, setVirtualTourData] = useState<VirtualTourData>({
    virtualTourUrl: "",
    virtualTourType: "",
    brochureUrl: "",
    floorPlanUrls: [],
  });

  // Visibility state
  const [visibilityUpdating, setVisibilityUpdating] = useState(false);

  // Fetch or create provider profile
  const fetchOrCreateProvider = useCallback(async () => {
    try {
      const res = await fetch("/api/providers/me");

      if (res.ok) {
        const data = await res.json();
        setProvider(data);
        populateFormFromProvider(data);
      } else if (res.status === 404) {
        // No provider - create blank record
        const createRes = await fetch("/api/providers/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: session?.user?.name || "New Provider",
            providerType: "HOME_CARE",
          }),
        });

        if (createRes.ok) {
          const newProvider = await createRes.json();
          setProvider(newProvider);
          populateFormFromProvider(newProvider);
        } else {
          showToast.error("Failed to create provider profile");
        }
      } else if (res.status === 401) {
        router.push("/login?redirect=/provider/profile/edit");
        return;
      }
    } catch (error) {
      console.error("Error fetching provider:", error);
      showToast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.name, router]);

  // Populate form state from provider data
  const populateFormFromProvider = (data: Provider) => {
    setBasicInfo({
      name: data.name || "",
      providerType: data.providerType || "",
      description: data.description || "",
      website: data.website || "",
    });

    setLocation({
      address: data.address || "",
      city: data.city || "",
      state: data.state || "",
      zipCode: data.zipCode || "",
      serviceRadius: data.serviceRadius?.toString() || "",
    });

    setContact({
      phone: data.phone || "",
      email: data.email || "",
    });

    setAboutUsData({
      establishedYear: (data.establishedYear as string) || "",
      facilityHistory: (data.facilityHistory as string) || "",
      missionStatement: (data.missionStatement as string) || "",
      whatMakesUsUnique: (data.whatMakesUsUnique as string) || "",
    });

    setCareServicesData({
      // Map from API field names to component field names
      careTypes: data.careTypesOffered || [],
      medicalServices: (data.detailedMedicalServices as string[]) || [],
      personalCareServices: (data.detailedPersonalCareServices as string[]) || [],
      dailyLivingServices: (data.detailedDailyLivingServices as string[]) || [],
      memoryCareServices: (data.detailedMemoryCareServices as string[]) || [],
      socialRecreationServices: (data.detailedSocialRecServices as string[]) || [],
    });

    setPricingData({
      privateRoomMin: (data.privateRoomMin as number) || null,
      privateRoomMax: (data.privateRoomMax as number) || null,
      semiPrivateRoomMin: (data.semiPrivateRoomMin as number) || null,
      semiPrivateRoomMax: (data.semiPrivateRoomMax as number) || null,
      includedServices: (data.includedServices as string[]) || [],
      additionalServices: data.additionalServicesJson ? JSON.parse(data.additionalServicesJson as string) : [],
      communityFee: (data.communityFee as number) || null,
      securityDeposit: (data.securityDeposit as number) || null,
      applicationFee: (data.applicationFee as number) || null,
      acceptsFinancialAssistance: (data.acceptsFinancialAssistance as boolean) || false,
      financialAssistanceTypes: (data.financialAssistanceTypes as string[]) || [],
      offersPaymentPlans: (data.offersPaymentPlans as boolean) || false,
      paymentPlanDetails: (data.paymentPlanDetails as string) || "",
    });

    setAmenitiesData({
      roomFeatures: (data.roomFeatures as string[]) || [],
      commonAreas: (data.commonAreas as string[]) || [],
      safetySecurityFeatures: (data.safetySecurityFeatures as string[]) || [],
      medicalAmenities: (data.medicalAmenities as string[]) || [],
      activitiesPrograms: (data.activitiesOffered as string[]) || [], // API uses activitiesOffered
      dietaryOptions: (data.dietaryOptions as string[]) || [],
    });

    setStaffData({
      daytimeRatio: (data.daytimeStaffRatio as string) || "", // API uses daytimeStaffRatio
      eveningRatio: (data.eveningStaffRatio as string) || "", // API uses eveningStaffRatio
      nightRatio: (data.nightStaffRatio as string) || "", // API uses nightStaffRatio
      credentials: (data.staffCredentials as string[]) || [], // API uses staffCredentials
      staffTrainingDescription: (data.staffTrainingDescription as string) || "",
      hasOnCallPhysician: (data.hasOnCallPhysician as boolean) || false,
      hasPharmacyPartnership: (data.hasPharmacyPartnership as boolean) || false,
      visitingDoctorFrequency: (data.visitingDoctorFrequency as string) || "",
      languagesSpoken: (data.languagesSpoken as string[]) || [],
    });

    setCertificationData({
      licensed: (data.licensed as boolean) || false,
      licenseNumber: (data.licenseNumber as string) || "",
      certificateUrls: (data.certificateUrls as string[]) || [],
      accreditations: (data.accreditations as string[]) || [],
      awards: data.awardsJson ? JSON.parse(data.awardsJson as string) : [],
    });

    setSpecialtyData({
      specialtyPrograms: data.specialtyProgramsJson ? JSON.parse(data.specialtyProgramsJson as string) : [],
      petPolicy: (data.petPolicy as "allowed" | "service_only" | "not_allowed" | "") || "",
      petPolicyDetails: (data.petPolicyDetails as string) || "",
      visitorPolicy: (data.visitorPolicy as string) || "",
      smokingPolicy: (data.smokingPolicy as "non_smoking" | "designated_areas" | "allowed" | "") || "",
      hasTrialPeriod: (data.hasTrialPeriod as boolean) || false,
      trialPeriodDuration: (data.trialPeriodDuration as string) || "",
    });

    setVirtualTourData({
      virtualTourUrl: (data.virtualTourUrl as string) || "",
      virtualTourType: (data.virtualTourType as "youtube" | "vimeo" | "custom" | "") || "",
      brochureUrl: (data.brochureUrl as string) || "",
      floorPlanUrls: (data.floorPlanUrls as string[]) || [],
    });
  };

  // Auth check and data fetch
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login?redirect=/provider/profile/edit");
      return;
    }

    if (status === "authenticated") {
      fetchOrCreateProvider();
    }
  }, [status, router, fetchOrCreateProvider]);

  // Track changes
  useEffect(() => {
    if (provider) {
      setHasChanges(true);
    }
  }, [basicInfo, location, contact, aboutUsData, careServicesData, pricingData, amenitiesData, staffData, certificationData, specialtyData, virtualTourData]);

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  // Build payload for save
  const buildSavePayload = () => {
    return {
      // Basic info
      name: basicInfo.name,
      providerType: basicInfo.providerType,
      description: basicInfo.description || null,
      website: basicInfo.website || null,

      // Location
      address: location.address || null,
      city: location.city || null,
      state: location.state || null,
      zipCode: location.zipCode || null,
      serviceRadius: location.serviceRadius ? parseInt(location.serviceRadius) : null,

      // Contact
      phone: contact.phone || null,
      email: contact.email || null,

      // About
      establishedYear: aboutUsData.establishedYear || null,
      facilityHistory: aboutUsData.facilityHistory || null,
      missionStatement: aboutUsData.missionStatement || null,
      whatMakesUsUnique: aboutUsData.whatMakesUsUnique || null,

      // Services - map from component field names to API field names
      careTypesOffered: careServicesData.careTypes,
      detailedMedicalServices: careServicesData.medicalServices,
      detailedPersonalCareServices: careServicesData.personalCareServices,
      detailedDailyLivingServices: careServicesData.dailyLivingServices,
      detailedMemoryCareServices: careServicesData.memoryCareServices,
      detailedSocialRecServices: careServicesData.socialRecreationServices,

      // Pricing - values are already number | null from the component
      priceMin: pricingData.privateRoomMin, // Use privateRoomMin as the general priceMin
      priceMax: pricingData.privateRoomMax, // Use privateRoomMax as the general priceMax
      privateRoomMin: pricingData.privateRoomMin,
      privateRoomMax: pricingData.privateRoomMax,
      semiPrivateRoomMin: pricingData.semiPrivateRoomMin,
      semiPrivateRoomMax: pricingData.semiPrivateRoomMax,
      includedServices: pricingData.includedServices,
      additionalServicesJson: pricingData.additionalServices.length > 0 ? JSON.stringify(pricingData.additionalServices) : null,
      communityFee: pricingData.communityFee,
      securityDeposit: pricingData.securityDeposit,
      applicationFee: pricingData.applicationFee,
      acceptsFinancialAssistance: pricingData.acceptsFinancialAssistance,
      financialAssistanceTypes: pricingData.financialAssistanceTypes,
      offersPaymentPlans: pricingData.offersPaymentPlans,
      paymentPlanDetails: pricingData.paymentPlanDetails || null,

      // Amenities - map from component field names to API field names
      roomFeatures: amenitiesData.roomFeatures,
      commonAreas: amenitiesData.commonAreas,
      medicalAmenities: amenitiesData.medicalAmenities,
      activitiesOffered: amenitiesData.activitiesPrograms, // Component uses activitiesPrograms
      dietaryOptions: amenitiesData.dietaryOptions,
      safetySecurityFeatures: amenitiesData.safetySecurityFeatures,

      // Staff - map from component field names to API field names
      daytimeStaffRatio: staffData.daytimeRatio || null, // Component uses daytimeRatio
      eveningStaffRatio: staffData.eveningRatio || null, // Component uses eveningRatio
      nightStaffRatio: staffData.nightRatio || null, // Component uses nightRatio
      staffCredentials: staffData.credentials, // Component uses credentials
      staffTrainingDescription: staffData.staffTrainingDescription || null,
      hasOnCallPhysician: staffData.hasOnCallPhysician,
      hasPharmacyPartnership: staffData.hasPharmacyPartnership,
      visitingDoctorFrequency: staffData.visitingDoctorFrequency || null,
      languagesSpoken: staffData.languagesSpoken,

      // Certifications
      licensed: certificationData.licensed,
      licenseNumber: certificationData.licenseNumber || null,
      certificateUrls: certificationData.certificateUrls,
      accreditations: certificationData.accreditations,
      awardsJson: certificationData.awards.length > 0 ? JSON.stringify(certificationData.awards) : null,

      // Specialty - map from component field names to API field names
      specialtyProgramsJson: specialtyData.specialtyPrograms.length > 0 ? JSON.stringify(specialtyData.specialtyPrograms) : null,
      petPolicy: specialtyData.petPolicy || null,
      petPolicyDetails: specialtyData.petPolicyDetails || null,
      visitorPolicy: specialtyData.visitorPolicy || null,
      smokingPolicy: specialtyData.smokingPolicy || null,
      hasTrialPeriod: specialtyData.hasTrialPeriod,
      trialPeriodDuration: specialtyData.trialPeriodDuration || null,

      // Virtual Tour
      virtualTourUrl: virtualTourData.virtualTourUrl || null,
      virtualTourType: virtualTourData.virtualTourType || null,
      brochureUrl: virtualTourData.brochureUrl || null,
      floorPlanUrls: virtualTourData.floorPlanUrls,
    };
  };

  // Save handler
  const handleSave = async () => {
    setSaving(true);

    try {
      const payload = buildSavePayload();

      const res = await fetch("/api/providers/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updatedProvider = await res.json();
        setProvider(updatedProvider);
        setHasChanges(false);
        showToast.success("Profile saved successfully");
      } else {
        const error = await res.json();
        showToast.error(error.message || "Failed to save profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      showToast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // Visibility toggle handler
  const handleToggleVisibility = async (visible: boolean) => {
    setVisibilityUpdating(true);

    try {
      const res = await fetch("/api/providers/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: visible }),
      });

      if (res.ok) {
        const updatedProvider = await res.json();
        setProvider(updatedProvider);
        showToast.success(visible ? "Profile is now visible" : "Profile is now hidden");
      } else {
        const error = await res.json();
        if (error.missingFields) {
          showToast.error(`Missing required fields: ${error.missingFields.join(", ")}`);
        } else {
          showToast.error(error.message || "Failed to update visibility");
        }
      }
    } catch (error) {
      console.error("Error updating visibility:", error);
      showToast.error("Failed to update visibility");
    } finally {
      setVisibilityUpdating(false);
    }
  };

  // Get completion items for sidebar
  const getCompletionItems = () => {
    if (!provider?._completion?.items) {
      return [];
    }

    return provider._completion.items.map((item) => ({
      label: item.label,
      completed: item.completed,
      required: item.isRequired,
    }));
  };

  // Loading state
  if (loading) {
    return (
      <>
        <MainNav />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your profile...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <MainNav />

      {/* Breadcrumb - outside content container for full-width styling */}
      <Breadcrumb />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Provider Profile</h1>
                <p className="text-gray-600 mt-1">
                  Complete your profile to help families find you
                </p>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm"
              >
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Form Sections */}
            <div className="lg:col-span-2 space-y-3">
              {/* Basic Information */}
              <CollapsibleSection
                title="Basic Information"
                description="Core details about your organization"
                isExpanded={expandedSections.includes("basicInfo")}
                onToggle={() => toggleSection("basicInfo")}
                badge={basicInfo.name && basicInfo.providerType ? "complete" : "required"}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={basicInfo.name}
                      onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your organization name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Provider Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={basicInfo.providerType}
                      onChange={(e) => setBasicInfo({ ...basicInfo, providerType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select provider type</option>
                      {PROVIDER_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={basicInfo.description}
                      onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Tell families about your organization..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      value={basicInfo.website}
                      onChange={(e) => setBasicInfo({ ...basicInfo, website: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="https://www.example.com"
                    />
                  </div>
                </div>
              </CollapsibleSection>

              {/* Location */}
              <CollapsibleSection
                title="Location"
                description="Where you provide services"
                isExpanded={expandedSections.includes("location")}
                onToggle={() => toggleSection("location")}
                badge={location.city && location.state ? "complete" : "required"}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={location.address}
                      onChange={(e) => setLocation({ ...location, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={location.city}
                        onChange={(e) => setLocation({ ...location, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={location.state}
                        onChange={(e) => setLocation({ ...location, state: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select state</option>
                        {US_STATES.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={location.zipCode}
                        onChange={(e) => setLocation({ ...location, zipCode: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="12345"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Radius (miles)
                      </label>
                      <input
                        type="number"
                        value={location.serviceRadius}
                        onChange={(e) => setLocation({ ...location, serviceRadius: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="25"
                      />
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              {/* Contact Information */}
              <CollapsibleSection
                title="Contact Information"
                description="How families can reach you"
                isExpanded={expandedSections.includes("contact")}
                onToggle={() => toggleSection("contact")}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="contact@example.com"
                    />
                  </div>
                </div>
              </CollapsibleSection>

              {/* Care Services */}
              <CollapsibleSection
                title="Care Services"
                description="Types of care you provide"
                isExpanded={expandedSections.includes("services")}
                onToggle={() => toggleSection("services")}
                badge={careServicesData.careTypes.length > 0 ? "complete" : "required"}
              >
                <CareServicesSection
                  data={careServicesData}
                  onChange={setCareServicesData}
                />
              </CollapsibleSection>

              {/* About Us */}
              <CollapsibleSection
                title="About Us"
                description="Your story and mission"
                isExpanded={expandedSections.includes("about")}
                onToggle={() => toggleSection("about")}
              >
                <AboutUsSection
                  data={aboutUsData}
                  onChange={setAboutUsData}
                />
              </CollapsibleSection>

              {/* Pricing */}
              <CollapsibleSection
                title="Pricing & Fees"
                description="Cost information for families"
                isExpanded={expandedSections.includes("pricing")}
                onToggle={() => toggleSection("pricing")}
              >
                <PricingStructureSection
                  data={pricingData}
                  onChange={setPricingData}
                />
              </CollapsibleSection>

              {/* Amenities */}
              <CollapsibleSection
                title="Amenities & Features"
                description="What your facility offers"
                isExpanded={expandedSections.includes("amenities")}
                onToggle={() => toggleSection("amenities")}
              >
                <AmenitiesFeaturesSection
                  data={amenitiesData}
                  onChange={setAmenitiesData}
                />
              </CollapsibleSection>

              {/* Staff */}
              <CollapsibleSection
                title="Staff & Care Team"
                description="Information about your team"
                isExpanded={expandedSections.includes("staff")}
                onToggle={() => toggleSection("staff")}
              >
                <StaffInformationSection
                  data={staffData}
                  onChange={setStaffData}
                />
              </CollapsibleSection>

              {/* Certifications */}
              <CollapsibleSection
                title="Licensing & Certifications"
                description="Credentials and accreditations"
                isExpanded={expandedSections.includes("certifications")}
                onToggle={() => toggleSection("certifications")}
              >
                <CertificationsLicensingSection
                  data={certificationData}
                  onChange={setCertificationData}
                />
              </CollapsibleSection>

              {/* Specialty Programs */}
              <CollapsibleSection
                title="Specialty Programs"
                description="Specialized care offerings"
                isExpanded={expandedSections.includes("specialty")}
                onToggle={() => toggleSection("specialty")}
              >
                <SpecialtyProgramsSection
                  data={specialtyData}
                  onChange={setSpecialtyData}
                />
              </CollapsibleSection>

              {/* Virtual Tour */}
              <CollapsibleSection
                title="Virtual Tour & Media"
                description="Videos and virtual experiences"
                isExpanded={expandedSections.includes("virtualTour")}
                onToggle={() => toggleSection("virtualTour")}
              >
                <VirtualTourSection
                  data={virtualTourData}
                  onChange={setVirtualTourData}
                />
              </CollapsibleSection>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Profile Completeness */}
              <ProviderProfileCompleteness
                items={getCompletionItems()}
                completionPercentage={provider?._completion?.completionPercentage}
                completedSections={provider?._completion?.completedSections}
                totalSections={provider?._completion?.totalSections}
              />

              {/* Visibility Gate */}
              <VisibilityGateWidget
                isVisible={provider?.isVisible || false}
                meetsVisibility={provider?._completion?.meetsVisibility || false}
                missingRequired={provider?._completion?.missingRequired || []}
                nudgeMessage={provider?._completion?.nudgeMessage || ""}
                completionPercentage={provider?._completion?.completionPercentage || 0}
                onToggleVisibility={handleToggleVisibility}
                isUpdating={visibilityUpdating}
              />

              {/* Save Button (Mobile) */}
              <div className="lg:hidden">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
