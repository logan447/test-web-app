"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
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

export default function ProviderProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [selectedCareTypes, setSelectedCareTypes] = useState<string[]>([]);
  const [licensed, setLicensed] = useState(false);

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
        setLicensed(data.licensed || false);
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
                defaultValue={provider?.providerType}
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
                The geographic area you're willing to serve from your location
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
