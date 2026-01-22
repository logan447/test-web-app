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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {badge === "required" && (
              <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                Required
              </span>
            )}
            {badge === "complete" && (
              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Complete
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="pt-4">{children}</div>
        </div>
      )}
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

  // Quick Start modal state
  const [showQuickStart, setShowQuickStart] = useState(false);

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
    priceMin: "",
    priceMax: "",
    priceDescription: "",
    privateRoomMin: "",
    privateRoomMax: "",
    semiPrivateRoomMin: "",
    semiPrivateRoomMax: "",
    includedServices: [],
    additionalServices: [],
    communityFee: "",
    securityDeposit: "",
    applicationFee: "",
  });

  const [amenitiesData, setAmenitiesData] = useState<AmenitiesFeaturesData>({
    roomFeatures: [],
    commonAreas: [],
    medicalAmenities: [],
    activitiesOffered: [],
    dietaryOptions: [],
    safetySecurityFeatures: [],
  });

  const [staffData, setStaffData] = useState<StaffInformationData>({
    staffToResidentRatio: "",
    daytimeStaffRatio: "",
    eveningStaffRatio: "",
    nightStaffRatio: "",
    staffCredentials: [],
    staffTrainingDescription: "",
    hasRNOnSite: false,
    hasLVNOnSite: false,
    hasOnCallPhysician: false,
    hasPharmacyPartnership: false,
    allStaffBackgroundChecked: false,
    visitingDoctorFrequency: "",
    languagesSpoken: [],
  });

  const [certificationData, setCertificationData] = useState<CertificationsLicensingData>({
    licensed: false,
    licenseNumber: "",
    certifications: [],
    certificateUrls: [],
    accreditations: [],
    awards: [],
    insuranceVerified: false,
    backgroundChecked: false,
  });

  const [specialtyData, setSpecialtyData] = useState<SpecialtyProgramsData>({
    hasMemoryCare: false,
    hasRespiteCare: false,
    hasHospiceCare: false,
    specialtyPrograms: [],
  });

  const [virtualTourData, setVirtualTourData] = useState<VirtualTourData>({
    virtualTourUrl: "",
    virtualTourType: "none",
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

        // Check if Quick Start needed (missing required fields)
        if (data._completion && !data._completion.meetsVisibility) {
          setShowQuickStart(true);
        }
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
          setShowQuickStart(true); // New provider needs Quick Start
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
      priceMin: data.priceMin?.toString() || "",
      priceMax: data.priceMax?.toString() || "",
      priceDescription: (data.priceDescription as string) || "",
      privateRoomMin: data.privateRoomMin?.toString() || "",
      privateRoomMax: data.privateRoomMax?.toString() || "",
      semiPrivateRoomMin: data.semiPrivateRoomMin?.toString() || "",
      semiPrivateRoomMax: data.semiPrivateRoomMax?.toString() || "",
      includedServices: (data.includedServices as string[]) || [],
      additionalServices: data.additionalServicesJson ? JSON.parse(data.additionalServicesJson as string) : [],
      communityFee: data.communityFee?.toString() || "",
      securityDeposit: data.securityDeposit?.toString() || "",
      applicationFee: data.applicationFee?.toString() || "",
    });

    setAmenitiesData({
      roomFeatures: (data.roomFeatures as string[]) || [],
      commonAreas: (data.commonAreas as string[]) || [],
      medicalAmenities: (data.medicalAmenities as string[]) || [],
      activitiesOffered: (data.activitiesOffered as string[]) || [],
      dietaryOptions: (data.dietaryOptions as string[]) || [],
      safetySecurityFeatures: (data.safetySecurityFeatures as string[]) || [],
    });

    setStaffData({
      staffToResidentRatio: (data.staffToResidentRatio as string) || "",
      daytimeStaffRatio: (data.daytimeStaffRatio as string) || "",
      eveningStaffRatio: (data.eveningStaffRatio as string) || "",
      nightStaffRatio: (data.nightStaffRatio as string) || "",
      staffCredentials: (data.staffCredentials as string[]) || [],
      staffTrainingDescription: (data.staffTrainingDescription as string) || "",
      hasRNOnSite: (data.hasRNOnSite as boolean) || false,
      hasLVNOnSite: (data.hasLVNOnSite as boolean) || false,
      hasOnCallPhysician: (data.hasOnCallPhysician as boolean) || false,
      hasPharmacyPartnership: (data.hasPharmacyPartnership as boolean) || false,
      allStaffBackgroundChecked: (data.allStaffBackgroundChecked as boolean) || false,
      visitingDoctorFrequency: (data.visitingDoctorFrequency as string) || "",
      languagesSpoken: (data.languagesSpoken as string[]) || [],
    });

    setCertificationData({
      licensed: (data.licensed as boolean) || false,
      licenseNumber: (data.licenseNumber as string) || "",
      certifications: (data.certifications as string[]) || [],
      certificateUrls: (data.certificateUrls as string[]) || [],
      accreditations: (data.accreditations as string[]) || [],
      awards: data.awardsJson ? JSON.parse(data.awardsJson as string) : [],
      insuranceVerified: (data.insuranceVerified as boolean) || false,
      backgroundChecked: (data.backgroundChecked as boolean) || false,
    });

    setSpecialtyData({
      hasMemoryCare: (data.hasMemoryCare as boolean) || false,
      hasRespiteCare: (data.hasRespiteCare as boolean) || false,
      hasHospiceCare: (data.hasHospiceCare as boolean) || false,
      specialtyPrograms: data.specialtyProgramsJson ? JSON.parse(data.specialtyProgramsJson as string) : [],
    });

    setVirtualTourData({
      virtualTourUrl: (data.virtualTourUrl as string) || "",
      virtualTourType: (data.virtualTourType as string) || "none",
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

      // Pricing
      priceMin: pricingData.priceMin ? parseFloat(pricingData.priceMin) : null,
      priceMax: pricingData.priceMax ? parseFloat(pricingData.priceMax) : null,
      priceDescription: pricingData.priceDescription || null,
      privateRoomMin: pricingData.privateRoomMin ? parseFloat(pricingData.privateRoomMin) : null,
      privateRoomMax: pricingData.privateRoomMax ? parseFloat(pricingData.privateRoomMax) : null,
      semiPrivateRoomMin: pricingData.semiPrivateRoomMin ? parseFloat(pricingData.semiPrivateRoomMin) : null,
      semiPrivateRoomMax: pricingData.semiPrivateRoomMax ? parseFloat(pricingData.semiPrivateRoomMax) : null,
      includedServices: pricingData.includedServices,
      additionalServicesJson: pricingData.additionalServices.length > 0 ? JSON.stringify(pricingData.additionalServices) : null,
      communityFee: pricingData.communityFee ? parseFloat(pricingData.communityFee) : null,
      securityDeposit: pricingData.securityDeposit ? parseFloat(pricingData.securityDeposit) : null,
      applicationFee: pricingData.applicationFee ? parseFloat(pricingData.applicationFee) : null,

      // Amenities
      roomFeatures: amenitiesData.roomFeatures,
      commonAreas: amenitiesData.commonAreas,
      medicalAmenities: amenitiesData.medicalAmenities,
      activitiesOffered: amenitiesData.activitiesOffered,
      dietaryOptions: amenitiesData.dietaryOptions,
      safetySecurityFeatures: amenitiesData.safetySecurityFeatures,

      // Staff
      staffToResidentRatio: staffData.staffToResidentRatio || null,
      daytimeStaffRatio: staffData.daytimeStaffRatio || null,
      eveningStaffRatio: staffData.eveningStaffRatio || null,
      nightStaffRatio: staffData.nightStaffRatio || null,
      staffCredentials: staffData.staffCredentials,
      staffTrainingDescription: staffData.staffTrainingDescription || null,
      hasRNOnSite: staffData.hasRNOnSite,
      hasLVNOnSite: staffData.hasLVNOnSite,
      hasOnCallPhysician: staffData.hasOnCallPhysician,
      hasPharmacyPartnership: staffData.hasPharmacyPartnership,
      allStaffBackgroundChecked: staffData.allStaffBackgroundChecked,
      visitingDoctorFrequency: staffData.visitingDoctorFrequency || null,
      languagesSpoken: staffData.languagesSpoken,

      // Certifications
      licensed: certificationData.licensed,
      licenseNumber: certificationData.licenseNumber || null,
      certifications: certificationData.certifications,
      certificateUrls: certificationData.certificateUrls,
      accreditations: certificationData.accreditations,
      awardsJson: certificationData.awards.length > 0 ? JSON.stringify(certificationData.awards) : null,
      insuranceVerified: certificationData.insuranceVerified,
      backgroundChecked: certificationData.backgroundChecked,

      // Specialty
      hasMemoryCare: specialtyData.hasMemoryCare,
      hasRespiteCare: specialtyData.hasRespiteCare,
      hasHospiceCare: specialtyData.hasHospiceCare,
      specialtyProgramsJson: specialtyData.specialtyPrograms.length > 0 ? JSON.stringify(specialtyData.specialtyPrograms) : null,

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

  // Quick Start completion handler
  const handleQuickStartComplete = async (data: {
    providerType: string;
    name: string;
    city: string;
    state: string;
    careTypesOffered: string[];
    availableForFamilies: boolean;
    availableForOrganizations: boolean;
  }) => {
    try {
      const res = await fetch("/api/providers/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const updatedProvider = await res.json();
        setProvider(updatedProvider);
        populateFormFromProvider(updatedProvider);
        setShowQuickStart(false);
        showToast.success("Profile setup complete!");
      } else {
        const error = await res.json();
        showToast.error(error.message || "Failed to save");
      }
    } catch (error) {
      console.error("Error in Quick Start:", error);
      showToast.error("Failed to save");
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <Breadcrumb />

          {/* Page Header */}
          <div className="mb-8">
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
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form Sections */}
            <div className="lg:col-span-2 space-y-4">
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
              <ProviderProfileCompleteness items={getCompletionItems()} />

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

      {/* Quick Start Modal */}
      {showQuickStart && (
        <QuickStartModal
          initialName={basicInfo.name}
          initialProviderType={basicInfo.providerType}
          onComplete={handleQuickStartComplete}
          onDismiss={() => setShowQuickStart(false)}
        />
      )}
    </>
  );
}

// Quick Start Modal Component (inline for now, can extract later)
function QuickStartModal({
  initialName,
  initialProviderType,
  onComplete,
  onDismiss,
}: {
  initialName: string;
  initialProviderType: string;
  onComplete: (data: {
    providerType: string;
    name: string;
    city: string;
    state: string;
    careTypesOffered: string[];
    availableForFamilies: boolean;
    availableForOrganizations: boolean;
  }) => void;
  onDismiss: () => void;
}) {
  const [step, setStep] = useState<"subtype" | "details" | "visibility">("subtype");
  const [subtype, setSubtype] = useState<"individual" | "organization">(
    initialProviderType === "INDEPENDENT_CAREGIVER" ? "individual" : "organization"
  );
  const [name, setName] = useState(initialName);
  const [providerType, setProviderType] = useState(initialProviderType || "HOME_CARE");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [careTypes, setCareTypes] = useState<string[]>([]);
  const [visibleToFamilies, setVisibleToFamilies] = useState(true);
  const [visibleToOrgs, setVisibleToOrgs] = useState(false);

  const CARE_TYPES = [
    "Personal Care",
    "Companionship",
    "Meal Preparation",
    "Medication Reminders",
    "Light Housekeeping",
    "Transportation",
    "Respite Care",
    "Dementia Care",
    "Post-Surgery Care",
    "Hospice Support",
  ];

  const handleNext = () => {
    if (step === "subtype") {
      if (subtype === "individual") {
        setProviderType("INDEPENDENT_CAREGIVER");
      }
      setStep("details");
    } else if (step === "details") {
      setStep("visibility");
    } else {
      // Complete
      onComplete({
        providerType: subtype === "individual" ? "INDEPENDENT_CAREGIVER" : providerType,
        name,
        city,
        state,
        careTypesOffered: careTypes,
        availableForFamilies: visibleToFamilies,
        availableForOrganizations: visibleToOrgs,
      });
    }
  };

  const handleBack = () => {
    if (step === "details") {
      setStep("subtype");
    } else if (step === "visibility") {
      setStep("details");
    }
  };

  const canProceed = () => {
    if (step === "subtype") return true;
    if (step === "details") {
      return name && city && state && careTypes.length > 0;
    }
    return true;
  };

  const getStepNumber = () => {
    if (step === "subtype") return 1;
    if (step === "details") return 2;
    return 3;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Quick Setup</h2>
            <p className="text-sm text-gray-500">Step {getStepNumber()} of 3</p>
          </div>
          <button
            onClick={onDismiss}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="h-1 bg-gray-200 rounded-full">
            <div
              className="h-1 bg-primary-600 rounded-full transition-all duration-300"
              style={{ width: `${(getStepNumber() / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Step 1: Subtype */}
          {step === "subtype" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">What type of care provider are you?</h3>

              <button
                onClick={() => setSubtype("organization")}
                className={`w-full p-4 border-2 rounded-xl text-left transition-colors ${
                  subtype === "organization"
                    ? "border-primary-600 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🏢</div>
                  <div>
                    <div className="font-semibold text-gray-900">Care Organization</div>
                    <div className="text-sm text-gray-600">Facility, agency, or company providing care services</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSubtype("individual")}
                className={`w-full p-4 border-2 rounded-xl text-left transition-colors ${
                  subtype === "individual"
                    ? "border-primary-600 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">👤</div>
                  <div>
                    <div className="font-semibold text-gray-900">Individual Caregiver</div>
                    <div className="text-sm text-gray-600">Independent professional providing care services</div>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === "details" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                {subtype === "individual" ? "Tell us about yourself" : "Tell us about your organization"}
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {subtype === "individual" ? "Your Name" : "Organization Name"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder={subtype === "individual" ? "Enter your name" : "Enter organization name"}
                />
              </div>

              {subtype === "organization" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type of Care <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={providerType}
                    onChange={(e) => setProviderType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {PROVIDER_TYPES.filter(t => t.value !== "INDEPENDENT_CAREGIVER").map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Services You Offer <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CARE_TYPES.map((type) => (
                    <label
                      key={type}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                        careTypes.includes(type)
                          ? "border-primary-600 bg-primary-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={careTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCareTypes([...careTypes, type]);
                          } else {
                            setCareTypes(careTypes.filter((t) => t !== type));
                          }
                        }}
                        className="sr-only"
                      />
                      <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                        careTypes.includes(type)
                          ? "bg-primary-600 border-primary-600 text-white"
                          : "border-gray-300"
                      }`}>
                        {careTypes.includes(type) && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Visibility */}
          {step === "visibility" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Who should see your profile?</h3>
              <p className="text-sm text-gray-600">You can change these settings anytime</p>

              <label
                className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  visibleToFamilies
                    ? "border-primary-600 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={visibleToFamilies}
                  onChange={(e) => setVisibleToFamilies(e.target.checked)}
                  className="sr-only"
                />
                <span className={`mt-1 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                  visibleToFamilies
                    ? "bg-primary-600 border-primary-600 text-white"
                    : "border-gray-300"
                }`}>
                  {visibleToFamilies && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                <div>
                  <div className="font-medium text-gray-900">Families looking for care</div>
                  <div className="text-sm text-gray-600">Appear in family searches and receive inquiries</div>
                </div>
              </label>

              <label
                className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  visibleToOrgs
                    ? "border-primary-600 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={visibleToOrgs}
                  onChange={(e) => setVisibleToOrgs(e.target.checked)}
                  className="sr-only"
                />
                <span className={`mt-1 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                  visibleToOrgs
                    ? "bg-primary-600 border-primary-600 text-white"
                    : "border-gray-300"
                }`}>
                  {visibleToOrgs && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                <div>
                  <div className="font-medium text-gray-900">
                    {subtype === "individual" ? "Organizations hiring caregivers" : "We're hiring caregivers"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {subtype === "individual"
                      ? "Appear in hiring searches by care organizations"
                      : "Show your organization is looking to hire caregivers"
                    }
                  </div>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={step === "subtype" ? onDismiss : handleBack}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            {step === "subtype" ? "Skip for now" : "Back"}
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === "visibility" ? "Complete Setup" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
