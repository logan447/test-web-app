"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import Footer from "@/components/Navigation/Footer";
import LocationAutocomplete from "@/components/Location/LocationAutocomplete";
import { showToast } from "@/lib/toast";

// ============================================
// TYPES
// ============================================

type ProviderType =
  | "ASSISTED_LIVING"
  | "INDEPENDENT_LIVING"
  | "MEMORY_CARE"
  | "NURSING_HOME"
  | "HOME_CARE"
  | "HOME_HEALTH"
  | "HOSPICE"
  | "REHABILITATION"
  | "INDEPENDENT_CAREGIVER";

type Provider = {
  id: string;
  name: string;
  providerType: ProviderType;
  description: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string;
  state: string;
  zipCode: string | null;
  serviceRadius: number | null;
  careTypesOffered: string[];
  licensed: boolean;
  licenseNumber: string | null;
  yearsInBusiness: number | null;
  capacity: number | null;
  certifications: string[];
  backgroundChecked: boolean;
  insuranceVerified: boolean;
  photos: string[];
  coverPhoto: string | null;
  isVisible: boolean;
  availableForFamilies: boolean;
  availableForOrganizations: boolean;
};

// ============================================
// CONSTANTS - Plain language, 3rd-4th grade reading level
// ============================================

const PROVIDER_TYPES = {
  facility: [
    { value: "ASSISTED_LIVING", label: "Assisted Living", description: "Help with daily life in a community" },
    { value: "INDEPENDENT_LIVING", label: "Independent Living", description: "Active senior community" },
    { value: "MEMORY_CARE", label: "Memory Care", description: "Care for memory loss" },
    { value: "NURSING_HOME", label: "Nursing Home", description: "24/7 skilled nursing care" },
    { value: "HOSPICE", label: "Hospice", description: "End-of-life comfort care" },
    { value: "REHABILITATION", label: "Rehabilitation", description: "Recovery after hospital" },
  ],
  agency: [
    { value: "HOME_CARE", label: "Home Care Agency", description: "Help at home" },
    { value: "HOME_HEALTH", label: "Home Health Agency", description: "Medical care at home" },
  ],
  individual: [
    { value: "INDEPENDENT_CAREGIVER", label: "Independent Caregiver", description: "Self-employed caregiver" },
  ],
};

const ALL_PROVIDER_TYPES = [
  ...PROVIDER_TYPES.facility,
  ...PROVIDER_TYPES.agency,
  ...PROVIDER_TYPES.individual,
];

const CARE_TYPES = [
  { value: "PERSONAL_CARE", label: "Personal care", description: "Help with bathing, dressing, eating" },
  { value: "COMPANION_CARE", label: "Companionship", description: "Friendly visits and activities" },
  { value: "SKILLED_NURSING", label: "Nursing care", description: "Medical care from nurses" },
  { value: "MEMORY_CARE", label: "Memory care", description: "Help for dementia or Alzheimers" },
  { value: "HOSPICE_CARE", label: "Hospice care", description: "Comfort at end of life" },
  { value: "RESPITE_CARE", label: "Respite care", description: "Short-term care breaks" },
  { value: "LIVE_IN_CARE", label: "Live-in care", description: "24/7 care at home" },
];

const CERTIFICATIONS = [
  { value: "CNA", label: "CNA", description: "Certified Nursing Assistant" },
  { value: "HHA", label: "HHA", description: "Home Health Aide" },
  { value: "LPN", label: "LPN", description: "Licensed Practical Nurse" },
  { value: "RN", label: "RN", description: "Registered Nurse" },
  { value: "CPR", label: "CPR", description: "CPR Certified" },
  { value: "FIRST_AID", label: "First Aid", description: "First Aid Certified" },
  { value: "ALZHEIMERS", label: "Dementia Care", description: "Alzheimers/Dementia Training" },
];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

// ============================================
// HELPER FUNCTIONS
// ============================================

const isFacility = (type: ProviderType): boolean => {
  return ["ASSISTED_LIVING", "INDEPENDENT_LIVING", "MEMORY_CARE", "NURSING_HOME", "HOSPICE", "REHABILITATION"].includes(type);
};

const isAgency = (type: ProviderType): boolean => {
  return ["HOME_CARE", "HOME_HEALTH"].includes(type);
};

const isCaregiver = (type: ProviderType): boolean => {
  return type === "INDEPENDENT_CAREGIVER";
};

const getProviderCategory = (type: ProviderType): "facility" | "agency" | "individual" => {
  if (isFacility(type)) return "facility";
  if (isAgency(type)) return "agency";
  return "individual";
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function EditProviderProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const previewRef = useRef<HTMLDivElement>(null);

  // Core state
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form state - Basic Info
  const [name, setName] = useState("");
  const [providerType, setProviderType] = useState<ProviderType>("HOME_CARE");
  const [description, setDescription] = useState("");
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);

  // Form state - Location
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [serviceRadius, setServiceRadius] = useState("");

  // Form state - Services
  const [careTypesOffered, setCareTypesOffered] = useState<string[]>([]);
  const [yearsInBusiness, setYearsInBusiness] = useState("");
  const [capacity, setCapacity] = useState("");

  // Form state - Credentials
  const [licensed, setLicensed] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [backgroundChecked, setBackgroundChecked] = useState(false);
  const [insuranceVerified, setInsuranceVerified] = useState(false);

  // Form state - Contact
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");

  // Form state - Privacy (dual toggles)
  const [availableForFamilies, setAvailableForFamilies] = useState(true);
  const [availableForOrganizations, setAvailableForOrganizations] = useState(false);

  // Section collapse state
  const [expandedSections, setExpandedSections] = useState({
    credentials: true,
    contact: false,
  });

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/provider/profile/edit");
    } else if (status === "authenticated") {
      fetchProvider();
    }
  }, [status, router]);

  const fetchProvider = async () => {
    try {
      const res = await fetch("/api/providers/me");

      if (res.ok) {
        const data = await res.json();
        setProvider(data);
        populateForm(data);
      } else if (res.status === 404) {
        // Create new provider
        const createRes = await fetch("/api/providers/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: session?.user?.name || "New Provider",
            providerType: "HOME_CARE",
            city: "",
            state: "",
          }),
        });

        if (createRes.ok) {
          const newProvider = await createRes.json();
          setProvider(newProvider);
          populateForm(newProvider);
        }
      }
    } catch (err) {
      console.error("Error fetching provider:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (data: Provider) => {
    setName(data.name || "");
    setProviderType(data.providerType || "HOME_CARE");
    setDescription(data.description || "");
    setCoverPhoto(data.coverPhoto || null);
    setAddress(data.address || "");
    setCity(data.city || "");
    setState(data.state || "");
    setZipCode(data.zipCode || "");
    setServiceRadius(data.serviceRadius?.toString() || "");
    setCareTypesOffered(data.careTypesOffered || []);
    setYearsInBusiness(data.yearsInBusiness?.toString() || "");
    setCapacity(data.capacity?.toString() || "");
    setLicensed(data.licensed || false);
    setLicenseNumber(data.licenseNumber || "");
    setCertifications(data.certifications || []);
    setBackgroundChecked(data.backgroundChecked || false);
    setInsuranceVerified(data.insuranceVerified || false);
    setEmail(data.email || "");
    setPhone(data.phone || "");
    setWebsite(data.website || "");
    setAvailableForFamilies(data.availableForFamilies ?? true);
    setAvailableForOrganizations(data.availableForOrganizations ?? false);
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handleCareTypeToggle = (type: string) => {
    setCareTypesOffered((prev) => {
      const newTypes = prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type];
      // Clear error when at least one service is selected
      if (newTypes.length > 0 && fieldErrors.careTypes) {
        setFieldErrors((prevErrors) => ({ ...prevErrors, careTypes: "" }));
      }
      return newTypes;
    });
  };

  const handleCertificationToggle = (cert: string) => {
    setCertifications((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validation helpers
  const validateEmail = (value: string): boolean => {
    if (!value) return true; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const validatePhone = (value: string): boolean => {
    if (!value) return true; // Optional field
    const digitsOnly = value.replace(/\D/g, "");
    return digitsOnly.length >= 10 && digitsOnly.length <= 11;
  };

  const validateUrl = (value: string): boolean => {
    if (!value) return true; // Optional field
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const validateZipCode = (value: string): boolean => {
    if (!value) return true; // Optional field
    return /^\d{5}$/.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMessage("");
    setFieldErrors({});

    // Collect all validation errors
    const errors: Record<string, string> = {};

    // Required fields
    if (!name.trim()) {
      errors.name = "Name is required";
    }

    if (!city.trim()) {
      errors.city = "City is required";
    }

    if (!state) {
      errors.state = "State is required";
    }

    if (careTypesOffered.length === 0) {
      errors.careTypes = "Select at least one service";
    }

    // Optional field format validation
    if (email && !validateEmail(email)) {
      errors.email = "Enter a valid email address";
    }

    if (phone && !validatePhone(phone)) {
      errors.phone = "Enter a valid phone number";
    }

    if (website && !validateUrl(website)) {
      errors.website = "Enter a valid URL (e.g., https://example.com)";
    }

    if (zipCode && !validateZipCode(zipCode)) {
      errors.zipCode = "Enter a 5-digit ZIP code";
    }

    // If there are validation errors, show them and stop
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the errors below");
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const data = {
      name,
      providerType,
      description: description || null,
      coverPhoto,
      address: address || null,
      city,
      state,
      zipCode: zipCode || null,
      serviceRadius: serviceRadius ? parseInt(serviceRadius) : null,
      careTypesOffered,
      yearsInBusiness: yearsInBusiness ? parseInt(yearsInBusiness) : null,
      capacity: capacity ? parseInt(capacity) : null,
      licensed,
      licenseNumber: licenseNumber || null,
      certifications,
      backgroundChecked,
      insuranceVerified,
      email: email || null,
      phone: phone || null,
      website: website || null,
      availableForFamilies,
      availableForOrganizations,
      isVisible: availableForFamilies || availableForOrganizations,
    };

    try {
      const res = await fetch("/api/providers/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save");
      }

      const savedProvider = await res.json();
      setProvider(savedProvider);
      setSuccessMessage("Profile saved!");
      showToast.success("Profile saved!");
      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        router.push("/provider/profile");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
      showToast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const category = getProviderCategory(providerType);
  const isIndividual = category === "individual";
  const isFacilityType = category === "facility";

  const calculateProgress = () => {
    let filled = 0;
    let total = 6;

    if (name) filled++;
    if (city && state) filled++;
    if (careTypesOffered.length > 0) filled++;
    if (coverPhoto) filled++;
    if (description) filled++;
    if (isIndividual ? certifications.length > 0 : licensed) filled++;

    return Math.round((filled / total) * 100);
  };

  const progress = calculateProgress();

  const getVisibilityEncouragement = () => {
    if (isIndividual) {
      return "Complete profiles get 3x more interview requests.";
    }
    return "Complete profiles get 3x more family inquiries.";
  };

  const getPhotoEncouragement = () => {
    if (isIndividual) {
      return "Caregivers with photos get 3x more interview requests.";
    }
    if (isFacilityType) {
      return "Facilities with photos get 3x more tour requests.";
    }
    return "Agencies with photos get 3x more consultation requests.";
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

      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/provider/profile"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {provider ? "Edit Your Profile" : "Build Your Profile"}
          </h1>
          <p className="text-gray-600 mt-1">{getVisibilityEncouragement()}</p>
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

              {/* SECTION 1: Photo & Basic Info */}
              <section className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  {isIndividual ? "About you" : "About your organization"}
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  {isIndividual
                    ? "Help families and organizations learn about you."
                    : "Help families learn about your services."}
                </p>

                {/* Photo Upload */}
                <div className="flex items-start gap-6 mb-6">
                  <div className="shrink-0">
                    <div className="relative">
                      {coverPhoto ? (
                        <img
                          src={coverPhoto}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover border-4 border-primary-100"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-gray-200 flex items-center justify-center">
                          {isIndividual ? (
                            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          ) : (
                            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          )}
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
                    <p className="text-sm text-gray-500">{getPhotoEncouragement()}</p>
                  </div>
                </div>

                {/* Name & Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isIndividual ? "Your name" : "Organization name"} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: "" }));
                      }}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        fieldErrors.name ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder={isIndividual ? "Your full name" : "Organization name"}
                    />
                    {fieldErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={providerType}
                      onChange={(e) => setProviderType(e.target.value as ProviderType)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <optgroup label="Facilities">
                        {PROVIDER_TYPES.facility.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Agencies">
                        {PROVIDER_TYPES.agency.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Individual">
                        {PROVIDER_TYPES.individual.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isIndividual ? "About you" : "About your organization"}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    placeholder={isIndividual
                      ? "Tell families about your experience, skills, and what makes you a great caregiver..."
                      : "Tell families about your services, mission, and what makes you special..."
                    }
                  />
                </div>

                {/* Years of Experience (Individual/Agency) */}
                {!isFacilityType && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Years of experience
                    </label>
                    <input
                      type="number"
                      value={yearsInBusiness}
                      onChange={(e) => setYearsInBusiness(e.target.value)}
                      className="w-32 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="5"
                      min="0"
                    />
                  </div>
                )}
              </section>

              {/* SECTION 2: Location */}
              <section className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Location</h2>
                <p className="text-sm text-gray-600 mb-6">
                  {isFacilityType
                    ? "Where is your facility located?"
                    : "Where do you provide care?"}
                </p>

                {/* Address (Facility only) */}
                {isFacilityType && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="123 Main Street"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City, State <span className="text-red-500">*</span>
                    </label>
                    <LocationAutocomplete
                      value={city && state ? `${city}, ${state}` : city || ""}
                      onChange={(value, location) => {
                        if (location) {
                          setCity(location.city);
                          setState(location.state);
                          if (fieldErrors.city) setFieldErrors(prev => ({ ...prev, city: "" }));
                          if (fieldErrors.state) setFieldErrors(prev => ({ ...prev, state: "" }));
                        } else {
                          // User is typing, parse manually if possible
                          const parts = value.split(",").map(s => s.trim());
                          if (parts.length >= 2) {
                            setCity(parts[0]);
                            setState(parts[1].toUpperCase().slice(0, 2));
                          } else {
                            setCity(value);
                          }
                        }
                      }}
                      placeholder="Start typing a city..."
                      error={(fieldErrors.city || fieldErrors.state) ? "City and state are required" : undefined}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => {
                        setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5));
                        if (fieldErrors.zipCode) setFieldErrors(prev => ({ ...prev, zipCode: "" }));
                      }}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        fieldErrors.zipCode ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="92101"
                      maxLength={5}
                    />
                    {fieldErrors.zipCode && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.zipCode}</p>
                    )}
                  </div>
                </div>

                {/* Service Radius (Non-facility) */}
                {!isFacilityType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service area (miles)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={serviceRadius}
                        onChange={(e) => setServiceRadius(e.target.value)}
                        className="w-24 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="25"
                        min="1"
                      />
                      <span className="text-sm text-gray-500">miles from {city || "your city"}</span>
                    </div>
                  </div>
                )}

                {/* Capacity (Facility only) */}
                {isFacilityType && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className="w-24 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="50"
                        min="1"
                      />
                      <span className="text-sm text-gray-500">residents</span>
                    </div>
                  </div>
                )}
              </section>

              {/* SECTION 3: Services */}
              <section className={`bg-white rounded-xl border p-6 ${fieldErrors.careTypes ? "border-red-300" : "border-gray-200"}`}>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  {isIndividual ? "What care do you provide?" : "Services offered"}
                </h2>
                <p className="text-sm text-gray-600 mb-2">Select all that apply. <span className="text-red-500">*</span></p>
                {fieldErrors.careTypes && (
                  <p className="text-sm text-red-600 mb-4">{fieldErrors.careTypes}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CARE_TYPES.map((care) => (
                    <label
                      key={care.value}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        careTypesOffered.includes(care.value)
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={careTypesOffered.includes(care.value)}
                        onChange={() => handleCareTypeToggle(care.value)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mr-3 ${
                        careTypesOffered.includes(care.value)
                          ? "bg-primary-600 border-primary-600"
                          : "border-gray-300"
                      }`}>
                        {careTypesOffered.includes(care.value) && (
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
              </section>

              {/* SECTION 4: Credentials */}
              <section className="bg-white rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setExpandedSections((prev) => ({ ...prev, credentials: !prev.credentials }))}
                  className="w-full p-6 flex items-center justify-between text-left"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {isIndividual ? "Credentials & training" : "Licensing & credentials"}
                    </h2>
                    <p className="text-sm text-gray-600">Build trust with verified qualifications</p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.credentials ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedSections.credentials && (
                  <div className="px-6 pb-6 space-y-6">
                    {/* License (Organizations) */}
                    {!isIndividual && (
                      <div>
                        <label className="flex items-center gap-3 cursor-pointer mb-3">
                          <input
                            type="checkbox"
                            checked={licensed}
                            onChange={(e) => setLicensed(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="font-medium text-gray-900">State licensed</span>
                        </label>
                        {licensed && (
                          <input
                            type="text"
                            value={licenseNumber}
                            onChange={(e) => setLicenseNumber(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="License number"
                          />
                        )}
                      </div>
                    )}

                    {/* Certifications */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        {isIndividual ? "Your certifications" : "Staff certifications"}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {CERTIFICATIONS.map((cert) => (
                          <button
                            key={cert.value}
                            type="button"
                            onClick={() => handleCertificationToggle(cert.value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              certifications.includes(cert.value)
                                ? "bg-primary-100 text-primary-700 border-2 border-primary-500"
                                : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
                            }`}
                          >
                            {cert.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Verification flags */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={backgroundChecked}
                          onChange={(e) => setBackgroundChecked(e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-gray-900">Background check completed</span>
                      </label>
                      {!isIndividual && (
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={insuranceVerified}
                            onChange={(e) => setInsuranceVerified(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-gray-900">Liability insurance verified</span>
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </section>

              {/* SECTION 5: Contact (Collapsible) */}
              <section className="bg-white rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setExpandedSections((prev) => ({ ...prev, contact: !prev.contact }))}
                  className="w-full p-6 flex items-center justify-between text-left"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Contact info</h2>
                    <p className="text-sm text-gray-600">Optional - shared after families connect</p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.contact ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedSections.contact && (
                  <div className="px-6 pb-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: "" }));
                        }}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          fieldErrors.email ? "border-red-500 bg-red-50" : "border-gray-300"
                        }`}
                        placeholder="contact@example.com"
                      />
                      {fieldErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: "" }));
                        }}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          fieldErrors.phone ? "border-red-500 bg-red-50" : "border-gray-300"
                        }`}
                        placeholder="(555) 123-4567"
                      />
                      {fieldErrors.phone && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>
                      )}
                    </div>
                    {!isIndividual && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                        <input
                          type="url"
                          value={website}
                          onChange={(e) => {
                            setWebsite(e.target.value);
                            if (fieldErrors.website) setFieldErrors(prev => ({ ...prev, website: "" }));
                          }}
                          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                            fieldErrors.website ? "border-red-500 bg-red-50" : "border-gray-300"
                          }`}
                          placeholder="https://example.com"
                        />
                        {fieldErrors.website && (
                          <p className="mt-1 text-sm text-red-600">{fieldErrors.website}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* SECTION 6: Privacy - Dual Toggles */}
              <section className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Visibility</h2>
                <p className="text-sm text-gray-600 mb-6">Control who can find your profile.</p>

                {/* Toggle 1: Families */}
                <div className="space-y-4">
                  <label className="flex items-start gap-4 cursor-pointer p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <div className="relative shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={availableForFamilies}
                        onChange={(e) => setAvailableForFamilies(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">
                        {isIndividual ? "Available for direct hire by families" : "Visible to families"}
                      </span>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {isIndividual
                          ? "Families looking for caregivers can find and contact you directly."
                          : isFacilityType
                            ? "Families can find your facility and request tours."
                            : "Families can find your agency and request consultations."}
                      </p>
                    </div>
                  </label>

                  {/* Toggle 2: Organizations (context-aware) */}
                  {isIndividual ? (
                    <label className="flex items-start gap-4 cursor-pointer p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <div className="relative shrink-0 mt-0.5">
                        <input
                          type="checkbox"
                          checked={availableForOrganizations}
                          onChange={(e) => setAvailableForOrganizations(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Available for employment by organizations</span>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Care agencies and facilities looking to hire can find and interview you.
                        </p>
                      </div>
                    </label>
                  ) : (
                    <label className="flex items-start gap-4 cursor-pointer p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <div className="relative shrink-0 mt-0.5">
                        <input
                          type="checkbox"
                          checked={availableForOrganizations}
                          onChange={(e) => setAvailableForOrganizations(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Hiring caregivers</span>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Caregivers looking for work can see you&apos;re hiring and apply for positions.
                        </p>
                      </div>
                    </label>
                  )}
                </div>

                {!availableForFamilies && !availableForOrganizations && (
                  <p className="text-sm text-amber-600 mt-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Your profile is hidden. Turn on at least one option to be found.
                  </p>
                )}
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
                      {!coverPhoto && "Add a photo, "}
                      {!description && "add a description, "}
                      {careTypesOffered.length === 0 && "select services "}
                      to improve your profile.
                    </p>
                  )}
                </div>

                {/* Live Preview Card */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-600">
                      {isIndividual
                        ? availableForOrganizations
                          ? "What organizations see"
                          : "What families see"
                        : "What families see"}
                    </p>
                  </div>
                  <div className="p-5">
                    {/* Preview Header */}
                    <div className="flex items-start gap-4 mb-4">
                      {coverPhoto ? (
                        <img
                          src={coverPhoto}
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
                          {name || (isIndividual ? "Your Name" : "Organization Name")}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {ALL_PROVIDER_TYPES.find((t) => t.value === providerType)?.label}
                        </p>
                        {city && state && (
                          <p className="text-sm text-gray-500">{city}, {state}</p>
                        )}
                      </div>
                    </div>

                    {/* Description Preview */}
                    {description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{description}</p>
                    )}

                    {/* Services */}
                    {careTypesOffered.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Services</p>
                        <div className="flex flex-wrap gap-1.5">
                          {careTypesOffered.map((type) => (
                            <span key={type} className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium">
                              {CARE_TYPES.find((c) => c.value === type)?.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Details */}
                    <div className="space-y-2 text-sm">
                      {yearsInBusiness && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {yearsInBusiness} years experience
                        </div>
                      )}
                      {certifications.length > 0 && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                          {certifications.slice(0, 3).map((c) => CERTIFICATIONS.find((cert) => cert.value === c)?.label).join(", ")}
                          {certifications.length > 3 && ` +${certifications.length - 3}`}
                        </div>
                      )}
                      {backgroundChecked && (
                        <div className="flex items-center gap-2 text-green-600">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Background verified
                        </div>
                      )}
                    </div>

                    {/* Empty state */}
                    {!name && careTypesOffered.length === 0 && !city && (
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
                      {isIndividual ? "Get more interview requests" : "Get more family inquiries"}
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {isIndividual ? "Stand out to employers" : "Build trust with families"}
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {isIndividual ? "Show your qualifications" : "Show your credentials"}
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
