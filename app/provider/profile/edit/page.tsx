"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import MainNav from "@/components/Navigation/MainNav";
import Breadcrumb from "@/components/Navigation/Breadcrumb";
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
  careTypesOffered: string[];
  isVisible: boolean;
  _completion?: {
    meetsVisibility: boolean;
    missingRequired: string[];
    completionPercentage: number;
  };
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

// Care Types
const CARE_TYPES = [
  { value: "PERSONAL_CARE", label: "Personal Care" },
  { value: "COMPANION_CARE", label: "Companion Care" },
  { value: "SKILLED_NURSING", label: "Skilled Nursing" },
  { value: "MEMORY_CARE", label: "Memory Care" },
  { value: "HOSPICE_CARE", label: "Hospice Care" },
  { value: "RESPITE_CARE", label: "Respite Care" },
  { value: "LIVE_IN_CARE", label: "Live-In Care" },
];

export default function ProviderProfileEditPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Simple form state
  const [formData, setFormData] = useState({
    name: "",
    providerType: "",
    description: "",
    city: "",
    state: "",
    phone: "",
    email: "",
    careTypesOffered: [] as string[],
  });

  // Fetch or create provider profile
  const fetchOrCreateProvider = useCallback(async () => {
    try {
      const res = await fetch("/api/providers/me");

      if (res.ok) {
        const data = await res.json();
        setProvider(data);
        setFormData({
          name: data.name || "",
          providerType: data.providerType || "",
          description: data.description || "",
          city: data.city || "",
          state: data.state || "",
          phone: data.phone || "",
          email: data.email || "",
          careTypesOffered: data.careTypesOffered || [],
        });
      } else if (res.status === 404) {
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
          setFormData({
            name: newProvider.name || "",
            providerType: newProvider.providerType || "",
            description: newProvider.description || "",
            city: newProvider.city || "",
            state: newProvider.state || "",
            phone: newProvider.phone || "",
            email: newProvider.email || "",
            careTypesOffered: newProvider.careTypesOffered || [],
          });
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/providers/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const updatedProvider = await res.json();
        setProvider(updatedProvider);
        showToast.success("Profile saved!");
      } else {
        const error = await res.json();
        showToast.error(error.message || "Failed to save");
      }
    } catch (error) {
      console.error("Error saving:", error);
      showToast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const toggleCareType = (value: string) => {
    setFormData(prev => ({
      ...prev,
      careTypesOffered: prev.careTypesOffered.includes(value)
        ? prev.careTypesOffered.filter(t => t !== value)
        : [...prev.careTypesOffered, value]
    }));
  };

  const handleToggleVisibility = async () => {
    if (!provider) return;

    try {
      const res = await fetch("/api/providers/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !provider.isVisible }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProvider(updated);
        showToast.success(updated.isVisible ? "Profile is now visible" : "Profile hidden");
      } else {
        const error = await res.json();
        if (error.missingFields) {
          showToast.error(`Complete required fields first: ${error.missingFields.join(", ")}`);
        } else {
          showToast.error(error.message || "Failed to update");
        }
      }
    } catch (error) {
      showToast.error("Failed to update visibility");
    }
  };

  // Check if required fields are complete
  const isComplete = formData.name && formData.providerType && formData.city && formData.state && formData.careTypesOffered.length > 0;
  const missingFields = [];
  if (!formData.name) missingFields.push("Name");
  if (!formData.providerType) missingFields.push("Provider Type");
  if (!formData.city) missingFields.push("City");
  if (!formData.state) missingFields.push("State");
  if (formData.careTypesOffered.length === 0) missingFields.push("Care Types");

  if (loading) {
    return (
      <>
        <MainNav />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <MainNav />
      <Breadcrumb />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
            <p className="text-gray-500 mt-1">Help families find you by completing your profile</p>
          </div>

          {/* Visibility Card */}
          <div className={`mb-6 p-4 rounded-xl border-2 ${
            provider?.isVisible
              ? "bg-green-50 border-green-200"
              : "bg-amber-50 border-amber-200"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {provider?.isVisible ? (
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  )}
                  <span className="font-medium text-gray-900">
                    {provider?.isVisible ? "Visible to families" : "Hidden from search"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {provider?.isVisible
                    ? "Families can find and contact you"
                    : isComplete
                      ? "Toggle on to appear in search results"
                      : `Complete these fields: ${missingFields.join(", ")}`
                  }
                </p>
              </div>
              <button
                onClick={handleToggleVisibility}
                disabled={!isComplete && !provider?.isVisible}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  provider?.isVisible ? "bg-green-500" : "bg-gray-300"
                } ${!isComplete && !provider?.isVisible ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  provider?.isVisible ? "translate-x-6" : ""
                }`} />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
            {/* Basic Info */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Your organization name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provider Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.providerType}
                    onChange={(e) => setFormData({ ...formData, providerType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select type...</option>
                    {PROVIDER_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Tell families about your services..."
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select...</option>
                    {US_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Care Services */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Care Services <span className="text-red-500">*</span>
              </h2>
              <p className="text-sm text-gray-500 mb-3">Select all that apply</p>
              <div className="flex flex-wrap gap-2">
                {CARE_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => toggleCareType(type.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.careTypesOffered.includes(type.value)
                        ? "bg-primary-100 text-primary-700 border-2 border-primary-500"
                        : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="contact@example.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Completion Status */}
          {!isComplete && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Almost there!</strong> Complete these fields to make your profile visible: {missingFields.join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
