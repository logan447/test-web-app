"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import PhotoUpload from "@/components/Gallery/PhotoUpload";
import { showToast } from "@/lib/toast";

type Provider = {
  id: string;
  name: string;
  providerType: string;
  description: string;
  careTypesOffered: string[];
  address: string;
  city: string;
  state: string;
  zipCode: string;
  serviceRadius: number | null;
  phone: string;
  email: string;
  website: string;
  yearsInBusiness: number;
  licensed: boolean;
  licenseNumber: string;
  capacity: number | null;
  availableForFamilies: boolean;
  availableForOrganizations: boolean;
  priceMin: number | null;
  priceMax: number | null;
  priceDescription: string | null;
  paymentOptions: string[];
  certifications: string[];
  insuranceVerified: boolean;
  backgroundChecked: boolean;
  totalCapacity: number | null;
  availableSpots: number | null;
  waitlistAvailable: boolean;
  photos: string[];
  coverPhoto: string | null;
  roomFeatures: string[];
  commonAreas: string[];
  medicalServices: string[];
  activitiesOffered: string[];
  dietaryOptions: string[];
};

const PROVIDER_TYPES = [
  { value: "HOME_CARE", label: "Home Care" },
  { value: "HOME_HEALTH", label: "Home Health" },
  { value: "ASSISTED_LIVING", label: "Assisted Living" },
  { value: "INDEPENDENT_LIVING", label: "Independent Living" },
  { value: "MEMORY_CARE", label: "Memory Care" },
  { value: "NURSING_HOME", label: "Nursing Home" },
  { value: "HOSPICE", label: "Hospice" },
  { value: "REHABILITATION", label: "Rehabilitation" },
  { value: "INDEPENDENT_CAREGIVER", label: "Independent Caregiver" },
];

const CARE_TYPES = [
  { value: "COMPANION_CARE", label: "Companion Care" },
  { value: "PERSONAL_CARE", label: "Personal Care" },
  { value: "SKILLED_NURSING", label: "Skilled Nursing" },
  { value: "MEMORY_CARE", label: "Memory Care" },
  { value: "HOSPICE_CARE", label: "Hospice Care" },
  { value: "RESPITE_CARE", label: "Respite Care" },
  { value: "LIVE_IN_CARE", label: "Live-In Care" },
];

const PAYMENT_OPTIONS = [
  "Private Pay",
  "Medicare",
  "Medicaid",
  "Long-Term Care Insurance",
  "Veterans Benefits",
  "Life Insurance",
  "Workers Compensation",
];

const CERTIFICATION_OPTIONS = [
  "Medicare Certified",
  "Medicaid Certified",
  "Joint Commission Accredited",
  "CARF Accredited",
  "State Licensed",
  "BBB Accredited",
  "Senior Living Certification",
  "Memory Care Certified",
];

const ROOM_FEATURES = [
  "Private Bathroom",
  "Semi-Private Bathroom",
  "WiFi Access",
  "Cable TV",
  "Telephone",
  "Air Conditioning",
  "Heating",
  "Wheelchair Accessible",
  "Emergency Call System",
  "Kitchenette",
  "Private Balcony/Patio",
  "Adjustable Bed",
  "Walk-in Shower",
  "Grab Bars",
  "Window Views",
];

const COMMON_AREAS = [
  "Library",
  "Garden/Courtyard",
  "Fitness Center",
  "Swimming Pool",
  "Movie Theater",
  "Arts & Crafts Room",
  "Chapel",
  "Beauty/Barber Shop",
  "Game Room",
  "Outdoor Seating Areas",
];

const MEDICAL_SERVICES = [
  "24/7 Registered Nurse On-Site",
  "24/7 Licensed Practical Nurse",
  "Medication Management",
  "Physical Therapy",
  "Occupational Therapy",
  "Speech Therapy",
  "Memory Care Support",
  "Hospice Care Coordination",
  "Visiting Physician Services",
  "Diabetic Care",
];

const ACTIVITIES = [
  "Arts & Crafts",
  "Music Therapy",
  "Group Exercise Classes",
  "Yoga/Tai Chi",
  "Movie Nights",
  "Book Club",
  "Games & Puzzles",
  "Gardening",
  "Pet Therapy",
  "Live Entertainment",
  "Educational Lectures",
  "Holiday Celebrations",
  "Day Trips/Outings",
  "Religious Services",
  "Social Events",
];

const DIETARY_OPTIONS = [
  "Vegetarian Options",
  "Vegan Options",
  "Gluten-Free Options",
  "Diabetic-Friendly Meals",
  "Low-Sodium Options",
  "Heart-Healthy Meals",
  "Kosher Meals",
  "Halal Meals",
];

export default function ProviderProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [selectedCareTypes, setSelectedCareTypes] = useState<string[]>([]);
  const [selectedPaymentOptions, setSelectedPaymentOptions] = useState<string[]>([]);
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [licensed, setLicensed] = useState(false);
  const [insuranceVerified, setInsuranceVerified] = useState(false);
  const [backgroundChecked, setBackgroundChecked] = useState(false);
  const [waitlistAvailable, setWaitlistAvailable] = useState(false);
  const [providerType, setProviderType] = useState("");
  const [availableForFamilies, setAvailableForFamilies] = useState(true);
  const [availableForOrganizations, setAvailableForOrganizations] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [selectedRoomFeatures, setSelectedRoomFeatures] = useState<string[]>([]);
  const [selectedCommonAreas, setSelectedCommonAreas] = useState<string[]>([]);
  const [selectedMedicalServices, setSelectedMedicalServices] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedDietaryOptions, setSelectedDietaryOptions] = useState<string[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProvider();
    }
  }, [status]);

  const fetchProvider = async () => {
    try {
      const response = await fetch("/api/providers/me");
      if (response.ok) {
        const data = await response.json();
        setProvider(data);
        setSelectedCareTypes(data.careTypesOffered || []);
        setSelectedPaymentOptions(data.paymentOptions || []);
        setSelectedCertifications(data.certifications || []);
        setLicensed(data.licensed || false);
        setInsuranceVerified(data.insuranceVerified || false);
        setBackgroundChecked(data.backgroundChecked || false);
        setWaitlistAvailable(data.waitlistAvailable || false);
        setProviderType(data.providerType || "");
        setAvailableForFamilies(data.availableForFamilies !== undefined ? data.availableForFamilies : true);
        setAvailableForOrganizations(data.availableForOrganizations || false);
        setPhotos(data.photos || []);
        setCoverPhoto(data.coverPhoto || null);
        setSelectedRoomFeatures(data.roomFeatures || []);
        setSelectedCommonAreas(data.commonAreas || []);
        setSelectedMedicalServices(data.medicalServices || []);
        setSelectedActivities(data.activitiesOffered || []);
        setSelectedDietaryOptions(data.dietaryOptions || []);
        setEditing(false);
      } else if (response.status === 404) {
        setEditing(true);
      }
    } catch (err) {
      console.error("Error fetching provider:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      providerType: formData.get("providerType"),
      description: formData.get("description"),
      careTypesOffered: selectedCareTypes,
      address: formData.get("address"),
      city: formData.get("city"),
      state: formData.get("state"),
      zipCode: formData.get("zipCode"),
      serviceRadius: formData.get("serviceRadius") ? parseInt(formData.get("serviceRadius") as string) : null,
      phone: formData.get("phone"),
      email: formData.get("email"),
      website: formData.get("website") || "",
      yearsInBusiness: parseInt(formData.get("yearsInBusiness") as string) || 0,
      licensed: licensed,
      licenseNumber: formData.get("licenseNumber") || "",
      capacity: formData.get("capacity") ? parseInt(formData.get("capacity") as string) : null,
      availableForFamilies: availableForFamilies,
      availableForOrganizations: availableForOrganizations,
      priceMin: formData.get("priceMin") ? parseInt(formData.get("priceMin") as string) : null,
      priceMax: formData.get("priceMax") ? parseInt(formData.get("priceMax") as string) : null,
      priceDescription: formData.get("priceDescription") || null,
      paymentOptions: selectedPaymentOptions,
      certifications: selectedCertifications,
      insuranceVerified: insuranceVerified,
      backgroundChecked: backgroundChecked,
      totalCapacity: formData.get("totalCapacity") ? parseInt(formData.get("totalCapacity") as string) : null,
      availableSpots: formData.get("availableSpots") ? parseInt(formData.get("availableSpots") as string) : null,
      waitlistAvailable: waitlistAvailable,
      photos: photos,
      coverPhoto: coverPhoto,
      roomFeatures: selectedRoomFeatures,
      commonAreas: selectedCommonAreas,
      medicalServices: selectedMedicalServices,
      activitiesOffered: selectedActivities,
      dietaryOptions: selectedDietaryOptions,
    };

    try {
      const url = provider ? `/api/providers/${provider.id}` : "/api/providers/me";
      const method = provider ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to save profile");
      }

      showToast.success(provider ? "Profile updated" : "Profile created");
      fetchProvider();
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
      showToast.error(err.message || "Failed to save profile");
      setSaving(false);
    }
  };

  const toggleCareType = (careType: string) => {
    setSelectedCareTypes((prev) =>
      prev.includes(careType)
        ? prev.filter((s) => s !== careType)
        : [...prev, careType]
    );
  };

  const togglePaymentOption = (option: string) => {
    setSelectedPaymentOptions((prev) =>
      prev.includes(option)
        ? prev.filter((s) => s !== option)
        : [...prev, option]
    );
  };

  const toggleCertification = (cert: string) => {
    setSelectedCertifications((prev) =>
      prev.includes(cert)
        ? prev.filter((s) => s !== cert)
        : [...prev, cert]
    );
  };

  const toggleRoomFeature = (feature: string) => {
    setSelectedRoomFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((s) => s !== feature)
        : [...prev, feature]
    );
  };

  const toggleCommonArea = (area: string) => {
    setSelectedCommonAreas((prev) =>
      prev.includes(area)
        ? prev.filter((s) => s !== area)
        : [...prev, area]
    );
  };

  const toggleMedicalService = (service: string) => {
    setSelectedMedicalServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const toggleActivity = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((s) => s !== activity)
        : [...prev, activity]
    );
  };

  const toggleDietaryOption = (option: string) => {
    setSelectedDietaryOptions((prev) =>
      prev.includes(option)
        ? prev.filter((s) => s !== option)
        : [...prev, option]
    );
  };

  const handlePhotosChange = (newPhotos: string[], newCoverPhoto: string | null) => {
    setPhotos(newPhotos);
    setCoverPhoto(newCoverPhoto);
  };

  const formatCareType = (type: string) => {
    return CARE_TYPES.find(c => c.value === type)?.label || type;
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {provider ? "My Provider Profile" : "Create Provider Profile"}
          </h1>
          {provider && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              Edit Profile
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {!editing && provider ? (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="text-lg text-gray-900">{provider.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Provider Type</h3>
              <p className="text-lg text-gray-900">
                {PROVIDER_TYPES.find((t) => t.value === provider.providerType)?.label}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="text-gray-900">{provider.description}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Care Types Offered</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {provider.careTypesOffered.map((type) => (
                  <span
                    key={type}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                  >
                    {formatCareType(type)}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Location</h3>
              <p className="text-gray-900">
                {provider.address}<br />
                {provider.city}, {provider.state} {provider.zipCode}
              </p>
            </div>
            {provider.serviceRadius && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Service Radius</h3>
                <p className="text-gray-900">{provider.serviceRadius} miles</p>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="text-gray-900">{provider.phone}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="text-gray-900">{provider.email}</p>
              </div>
            </div>
            {provider.website && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Website</h3>
                <a
                  href={provider.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  {provider.website}
                </a>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Years in Business</h3>
                <p className="text-gray-900">{provider.yearsInBusiness}</p>
              </div>
              {provider.capacity && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Capacity</h3>
                  <p className="text-gray-900">{provider.capacity} clients</p>
                </div>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Licensed</h3>
                <p className="text-gray-900">{provider.licensed ? "Yes" : "No"}</p>
              </div>
              {provider.licenseNumber && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">License Number</h3>
                  <p className="text-gray-900">{provider.licenseNumber}</p>
                </div>
              )}
            </div>
            {(provider.priceMin || provider.priceMax || provider.priceDescription || provider.paymentOptions.length > 0) && (
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Pricing & Payment</h3>
                {(provider.priceMin || provider.priceMax) && (
                  <div className="mb-3">
                    <p className="text-lg font-semibold text-gray-900">
                      {provider.priceMin && provider.priceMax ? (
                        `$${provider.priceMin.toLocaleString()} - $${provider.priceMax.toLocaleString()}/month`
                      ) : provider.priceMin ? (
                        `Starting from $${provider.priceMin.toLocaleString()}/month`
                      ) : (
                        `Up to $${provider.priceMax?.toLocaleString()}/month`
                      )}
                    </p>
                  </div>
                )}
                {provider.priceDescription && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">{provider.priceDescription}</p>
                  </div>
                )}
                {provider.paymentOptions.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Payment options accepted:</p>
                    <div className="flex flex-wrap gap-2">
                      {provider.paymentOptions.map((option) => (
                        <span
                          key={option}
                          className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs"
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {(provider.certifications.length > 0 || provider.insuranceVerified || provider.backgroundChecked) && (
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Trust & Verification</h3>
                <div className="space-y-2">
                  {provider.certifications.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2">Certifications:</p>
                      <div className="flex flex-wrap gap-2">
                        {provider.certifications.map((cert) => (
                          <span
                            key={cert}
                            className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2">
                    {provider.insuranceVerified && (
                      <span className="text-xs text-gray-700 flex items-center gap-1">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Insurance Verified
                      </span>
                    )}
                    {provider.backgroundChecked && (
                      <span className="text-xs text-gray-700 flex items-center gap-1">
                        <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Background Checked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
            {(provider.totalCapacity || provider.availableSpots !== null) && (
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Capacity & Availability</h3>
                <div className="space-y-2">
                  {provider.totalCapacity && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Total Capacity:</span> {provider.totalCapacity} {provider.totalCapacity === 1 ? 'spot' : 'spots'}
                    </p>
                  )}
                  {provider.availableSpots !== null && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Currently Available:</span> {provider.availableSpots} {provider.availableSpots === 1 ? 'spot' : 'spots'}
                    </p>
                  )}
                  {provider.waitlistAvailable && (
                    <p className="text-sm text-gray-700 flex items-center gap-1">
                      <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Waitlist available
                    </p>
                  )}
                </div>
              </div>
            )}
            {provider.providerType === "INDEPENDENT_CAREGIVER" && (
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Availability</h3>
                <div className="space-y-1">
                  {provider.availableForFamilies && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Available for direct hire by families
                    </div>
                  )}
                  {provider.availableForOrganizations && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Available for hire by care organizations
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business/Provider Name *
              </label>
              <input
                name="name"
                type="text"
                required
                defaultValue={provider?.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider Type *
              </label>
              <select
                name="providerType"
                required
                value={providerType}
                onChange={(e) => setProviderType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select type</option>
                {PROVIDER_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                required
                rows={4}
                defaultValue={provider?.description}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Describe your services and what makes you unique..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Care Types Offered * (Select all that apply)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CARE_TYPES.map((careType) => (
                  <label key={careType.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedCareTypes.includes(careType.value)}
                      onChange={() => toggleCareType(careType.value)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{careType.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                name="address"
                type="text"
                required
                defaultValue={provider?.address}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  name="city"
                  type="text"
                  required
                  defaultValue={provider?.city}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  name="state"
                  type="text"
                  required
                  defaultValue={provider?.state}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="CA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  name="zipCode"
                  type="text"
                  required
                  defaultValue={provider?.zipCode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Radius (miles)
              </label>
              <input
                name="serviceRadius"
                type="number"
                min="0"
                defaultValue={provider?.serviceRadius || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="How many miles do you serve?"
              />
              <p className="text-sm text-gray-500 mt-1">
                The geographic area you&apos;re willing to serve from your location
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  name="phone"
                  type="tel"
                  required
                  defaultValue={provider?.phone}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={provider?.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                name="website"
                type="url"
                defaultValue={provider?.website}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://example.com"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years in Business *
                </label>
                <input
                  name="yearsInBusiness"
                  type="number"
                  min="0"
                  required
                  defaultValue={provider?.yearsInBusiness}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity (number of clients)
                </label>
                <input
                  name="capacity"
                  type="number"
                  min="0"
                  defaultValue={provider?.capacity || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="How many clients can you serve?"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={licensed}
                  onChange={(e) => setLicensed(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Licensed Provider</span>
              </label>
            </div>

            {licensed && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Number
                </label>
                <input
                  name="licenseNumber"
                  type="text"
                  defaultValue={provider?.licenseNumber}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            )}

            {/* Pricing Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing & Payment Information</h3>
              <p className="text-sm text-gray-600 mb-4">
                Help families understand your costs. This information is optional but increases transparency and trust.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Price (per month)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      name="priceMin"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={provider?.priceMin || ''}
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md"
                      placeholder="4500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Price (per month)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      name="priceMax"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={provider?.priceMax || ''}
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md"
                      placeholder="7000"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What&apos;s Included in the Price
                </label>
                <textarea
                  name="priceDescription"
                  rows={3}
                  defaultValue={provider?.priceDescription || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Example: 24/7 care, meals, housekeeping, medication management, activities..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Options Accepted (Select all that apply)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PAYMENT_OPTIONS.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedPaymentOptions.includes(option)}
                        onChange={() => togglePaymentOption(option)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Trust & Verification Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Trust & Verification</h3>
              <p className="text-sm text-gray-600 mb-4">
                Build trust with families by showcasing your certifications and verifications.
              </p>

              <div className="space-y-4 mb-4">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={insuranceVerified}
                    onChange={(e) => setInsuranceVerified(e.target.checked)}
                    className="mt-1 rounded border-gray-300"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Insurance Verified</span>
                    <p className="text-xs text-gray-500 mt-1">
                      Your business has verified liability and/or professional insurance
                    </p>
                  </div>
                </label>
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={backgroundChecked}
                    onChange={(e) => setBackgroundChecked(e.target.checked)}
                    className="mt-1 rounded border-gray-300"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Background Checks Completed</span>
                    <p className="text-xs text-gray-500 mt-1">
                      All staff members have completed background checks
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications & Accreditations (Select all that apply)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CERTIFICATION_OPTIONS.map((cert) => (
                    <label key={cert} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedCertifications.includes(cert)}
                        onChange={() => toggleCertification(cert)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{cert}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Capacity & Availability Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Capacity & Availability</h3>
              <p className="text-sm text-gray-600 mb-4">
                Let families know about your current availability.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Capacity
                  </label>
                  <input
                    name="totalCapacity"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={provider?.totalCapacity || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Total number of spots/beds"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currently Available Spots
                  </label>
                  <input
                    name="availableSpots"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={provider?.availableSpots || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Number of spots available now"
                  />
                </div>
              </div>

              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={waitlistAvailable}
                  onChange={(e) => setWaitlistAvailable(e.target.checked)}
                  className="mt-1 rounded border-gray-300"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Waitlist Available</span>
                  <p className="text-xs text-gray-500 mt-1">
                    Families can join a waitlist if currently at capacity
                  </p>
                </div>
              </label>
            </div>

            {/* Photo Upload Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Photos</h3>
              <p className="text-sm text-gray-600 mb-4">
                Add photos of your facility, staff, and amenities to help families get a better sense of your services.
              </p>
              <PhotoUpload
                photos={photos}
                coverPhoto={coverPhoto}
                onPhotosChange={handlePhotosChange}
              />
            </div>

            {/* Amenities & Services Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Amenities & Services</h3>
              <p className="text-sm text-gray-600 mb-4">
                Help families understand what makes your facility special by selecting all amenities and services you offer.
              </p>

              {/* Room Features */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">Room Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {ROOM_FEATURES.map((feature) => (
                    <label key={feature} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedRoomFeatures.includes(feature)}
                        onChange={() => toggleRoomFeature(feature)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Common Areas */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">Common Areas</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {COMMON_AREAS.map((area) => (
                    <label key={area} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedCommonAreas.includes(area)}
                        onChange={() => toggleCommonArea(area)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{area}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Medical Services */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">Medical Services</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {MEDICAL_SERVICES.map((service) => (
                    <label key={service} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedMedicalServices.includes(service)}
                        onChange={() => toggleMedicalService(service)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Activities */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">Activities & Programs</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {ACTIVITIES.map((activity) => (
                    <label key={activity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedActivities.includes(activity)}
                        onChange={() => toggleActivity(activity)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{activity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dietary Options */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-3">Dining Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {DIETARY_OPTIONS.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedDietaryOptions.includes(option)}
                        onChange={() => toggleDietaryOption(option)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {providerType === "INDEPENDENT_CAREGIVER" && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Availability Options</h3>
                <p className="text-sm text-gray-600 mb-4">
                  As an independent caregiver, choose how you want to be available for work:
                </p>
                <div className="space-y-3">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={availableForFamilies}
                      onChange={(e) => setAvailableForFamilies(e.target.checked)}
                      className="mt-1 rounded border-gray-300"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Available for direct hire by families</span>
                      <p className="text-xs text-gray-500 mt-1">
                        Families can find you and send consultation requests directly
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={availableForOrganizations}
                      onChange={(e) => setAvailableForOrganizations(e.target.checked)}
                      className="mt-1 rounded border-gray-300"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Available for hire by care organizations</span>
                      <p className="text-xs text-gray-500 mt-1">
                        Care organizations can find you and send hiring requests as an employee
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 disabled:opacity-50 font-medium"
              >
                {saving ? "Saving..." : provider ? "Update Profile" : "Create Profile"}
              </button>
              {provider && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setError("");
                  }}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
