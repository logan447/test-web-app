"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import Breadcrumb from "@/components/Navigation/Breadcrumb";
import { showToast } from "@/lib/toast";

// ============================================================================
// Types
// ============================================================================

type Provider = {
  id: string;
  name: string;
  providerType: string;
  description: string | null;
  careTypesOffered: string[];
  address: string | null;
  city: string;
  state: string;
  zipCode: string | null;
  serviceRadius: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  totalCapacity: number | null;
  availableSpots: number | null;
  waitlistAvailable: boolean;
  availableForFamilies: boolean;
  availableForOrganizations: boolean;
  photos: string[];
  coverPhoto: string | null;
};

// ============================================================================
// Constants
// ============================================================================

const PROVIDER_TYPES = [
  { value: "HOME_CARE", label: "Home Care Agency", category: "home" },
  { value: "HOME_HEALTH", label: "Home Health Agency", category: "home" },
  { value: "ASSISTED_LIVING", label: "Assisted Living Facility", category: "facility" },
  { value: "INDEPENDENT_LIVING", label: "Independent Living Community", category: "facility" },
  { value: "MEMORY_CARE", label: "Memory Care Community", category: "facility" },
  { value: "NURSING_HOME", label: "Skilled Nursing Facility", category: "facility" },
  { value: "HOSPICE", label: "Hospice Provider", category: "home" },
  { value: "REHABILITATION", label: "Rehabilitation Center", category: "facility" },
  { value: "INDEPENDENT_CAREGIVER", label: "Independent Caregiver", category: "individual" },
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

// Helper to get provider category
const getProviderCategory = (type: string): "facility" | "home" | "individual" => {
  const providerType = PROVIDER_TYPES.find((p) => p.value === type);
  return (providerType?.category as "facility" | "home" | "individual") || "facility";
};

// ============================================================================
// Main Component
// ============================================================================

export default function ProviderProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form state - Required fields
  const [name, setName] = useState("");
  const [providerType, setProviderType] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [careTypes, setCareTypes] = useState<string[]>([]);

  // Form state - Optional fields
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [serviceRadius, setServiceRadius] = useState("");
  const [totalCapacity, setTotalCapacity] = useState("");
  const [availableSpots, setAvailableSpots] = useState("");
  const [waitlistAvailable, setWaitlistAvailable] = useState(false);
  const [availableForFamilies, setAvailableForFamilies] = useState(true);
  const [availableForOrganizations, setAvailableForOrganizations] = useState(false);

  // Computed category based on provider type
  const category = getProviderCategory(providerType);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProvider();
    }
  }, [status, router]);

  const fetchProvider = async () => {
    try {
      const response = await fetch("/api/providers/me");
      if (response.ok) {
        const data = await response.json();
        setProvider(data);
        // Populate form
        setName(data.name || "");
        setProviderType(data.providerType || "");
        setCity(data.city || "");
        setState(data.state || "");
        setCareTypes(data.careTypesOffered || []);
        setDescription(data.description || "");
        setAddress(data.address || "");
        setZipCode(data.zipCode || "");
        setPhone(data.phone || "");
        setEmail(data.email || "");
        setWebsite(data.website || "");
        setServiceRadius(data.serviceRadius?.toString() || "");
        setTotalCapacity(data.totalCapacity?.toString() || "");
        setAvailableSpots(data.availableSpots?.toString() || "");
        setWaitlistAvailable(data.waitlistAvailable || false);
        setAvailableForFamilies(data.availableForFamilies ?? true);
        setAvailableForOrganizations(data.availableForOrganizations || false);
      }
    } catch (err) {
      console.error("Error fetching provider:", err);
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

    // Validation - Required fields
    if (!name.trim()) {
      setError("Please enter your business/provider name");
      setSaving(false);
      return;
    }
    if (!providerType) {
      setError("Please select a provider type");
      setSaving(false);
      return;
    }
    if (!city.trim() || !state.trim()) {
      setError("Please enter your city and state");
      setSaving(false);
      return;
    }
    if (careTypes.length === 0) {
      setError("Please select at least one care type");
      setSaving(false);
      return;
    }

    const data = {
      name: name.trim(),
      providerType,
      city: city.trim(),
      state: state.trim().toUpperCase(),
      careTypesOffered: careTypes,
      description: description.trim() || null,
      address: address.trim() || null,
      zipCode: zipCode.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      website: website.trim() || null,
      serviceRadius: serviceRadius ? parseInt(serviceRadius) : null,
      totalCapacity: totalCapacity ? parseInt(totalCapacity) : null,
      availableSpots: availableSpots ? parseInt(availableSpots) : null,
      waitlistAvailable,
      availableForFamilies,
      availableForOrganizations,
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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save profile");
      }

      const savedProvider = await response.json();
      setProvider(savedProvider);
      setSuccessMessage("Your provider profile has been saved!");
      showToast.success(provider ? "Profile updated" : "Profile created");
      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
      showToast.error(err instanceof Error ? err.message : "Failed to save profile");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <Breadcrumb />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <Breadcrumb />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {provider ? "Edit Provider Profile" : "Create Provider Profile"}
          </h1>
          <p className="text-gray-600 mt-1">
            Tell families about your services so they can find and connect with you.
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {successMessage}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ================================================================
              SECTION 1: REQUIRED FIELDS
              ================================================================ */}

          {/* Business Name */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {category === "individual" ? "Your Name" : "Business Name"} <span className="text-red-500">*</span>
            </h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={category === "individual" ? "Your full name" : "e.g., Sunrise Senior Living"}
            />
          </div>

          {/* Provider Type */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              What type of care do you provide? <span className="text-red-500">*</span>
            </h2>
            <select
              value={providerType}
              onChange={(e) => setProviderType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select provider type...</option>
              {PROVIDER_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Where are you located? <span className="text-red-500">*</span>
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="San Diego"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="CA"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          {/* Care Types */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              What services do you offer? <span className="text-red-500">*</span>
            </h2>
            <p className="text-sm text-gray-600 mb-4">Select all that apply</p>
            <div className="grid grid-cols-2 gap-3">
              {CARE_TYPES.map((care) => (
                <label
                  key={care.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                    careTypes.includes(care.value)
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={careTypes.includes(care.value)}
                    onChange={() => handleCareTypeToggle(care.value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{care.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ================================================================
              SECTION 2: OPTIONAL FIELDS (Provider-type specific)
              ================================================================ */}

          {providerType && (
            <>
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Optional Information</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Add more details to help families learn about you
                </p>
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {category === "individual" ? "About Yourself" : "About Your Services"}
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  {category === "individual"
                    ? "Tell families about your experience, qualifications, and caregiving approach"
                    : "Describe what makes your organization unique and how you help families"}
                </p>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder={
                    category === "individual"
                      ? "Share your experience and what makes you a great caregiver..."
                      : "Describe your services, philosophy, and what families can expect..."
                  }
                />
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                <p className="text-sm text-gray-600 mb-4">
                  How can families reach you? This will be shared when they connect with you.
                </p>
                <div className="space-y-4">
                  {/* Address - only for facilities and agencies */}
                  {category !== "individual" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="123 Care Lane"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                        <input
                          type="text"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value.slice(0, 5))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="92101"
                          maxLength={5}
                        />
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="contact@example.com"
                      />
                    </div>
                  </div>
                  {/* Website - only for organizations */}
                  {category !== "individual" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="https://www.example.com"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Service Area - for home care and individuals */}
              {(category === "home" || category === "individual") && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Area</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    How far are you willing to travel to provide care?
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={serviceRadius}
                      onChange={(e) => setServiceRadius(e.target.value)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="25"
                      min="0"
                    />
                    <span className="text-gray-600">miles from your location</span>
                  </div>
                </div>
              )}

              {/* Capacity - for facilities only */}
              {category === "facility" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Capacity & Availability</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Let families know about your current availability
                  </p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Capacity</label>
                        <input
                          type="number"
                          value={totalCapacity}
                          onChange={(e) => setTotalCapacity(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="50"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Available Spots</label>
                        <input
                          type="number"
                          value={availableSpots}
                          onChange={(e) => setAvailableSpots(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="5"
                          min="0"
                        />
                      </div>
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={waitlistAvailable}
                        onChange={(e) => setWaitlistAvailable(e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span className="font-medium text-gray-900">Waitlist available</span>
                        <p className="text-sm text-gray-600 mt-1">
                          Families can join a waitlist if currently at capacity
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Availability Options - for independent caregivers only */}
              {category === "individual" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Availability</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    How would you like to be available for work?
                  </p>
                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={availableForFamilies}
                        onChange={(e) => setAvailableForFamilies(e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span className="font-medium text-gray-900">Available for direct hire by families</span>
                        <p className="text-sm text-gray-600 mt-1">
                          Families can find you and send consultation requests directly
                        </p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={availableForOrganizations}
                        onChange={(e) => setAvailableForOrganizations(e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span className="font-medium text-gray-900">Available for hire by care organizations</span>
                        <p className="text-sm text-gray-600 mt-1">
                          Care agencies and facilities can contact you about employment
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving..." : provider ? "Update Profile" : "Create Profile"}
            </button>
            <Link
              href="/provider/dashboard"
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
