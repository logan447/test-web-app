"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Provider = {
  id: string;
  name: string;
  providerType: string;
  description: string;
  services: string[];
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  yearsInBusiness: number;
  licenseNumber: string;
  isActive: boolean;
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

const SERVICES = [
  "Personal Care",
  "Medication Management",
  "Meal Preparation",
  "Transportation",
  "Companionship",
  "Light Housekeeping",
  "Bathing Assistance",
  "Dementia Care",
  "Skilled Nursing",
  "Physical Therapy",
  "Occupational Therapy",
  "24/7 Care",
];

export default function ProviderProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

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
        setSelectedServices(data.services || []);
        setEditing(false);
      } else if (response.status === 404) {
        // Provider profile doesn't exist yet
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
      services: selectedServices,
      address: formData.get("address"),
      city: formData.get("city"),
      state: formData.get("state"),
      zipCode: formData.get("zipCode"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      website: formData.get("website") || "",
      yearsInBusiness: parseInt(formData.get("yearsInBusiness") as string) || 0,
      licenseNumber: formData.get("licenseNumber") || "",
      isActive: true,
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

      fetchProvider();
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
      setSaving(false);
    }
  };

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Olera
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-primary-600"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-primary-600 hover:text-primary-700"
          >
            ← Back to Dashboard
          </Link>
        </div>

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
              <h3 className="text-sm font-medium text-gray-500">Services</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {provider.services.map((service) => (
                  <span
                    key={service}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                  >
                    {service}
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
              <div>
                <h3 className="text-sm font-medium text-gray-500">License Number</h3>
                <p className="text-gray-900">{provider.licenseNumber || "N/A"}</p>
              </div>
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
                Services Offered *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SERVICES.map((service) => (
                  <label key={service} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service)}
                      onChange={() => toggleService(service)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{service}</span>
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
                  License Number
                </label>
                <input
                  name="licenseNumber"
                  type="text"
                  defaultValue={provider?.licenseNumber}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

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
