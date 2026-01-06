"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function CreateProviderPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const careTypes = formData.getAll("careTypes");

    const data = {
      name: formData.get("name"),
      providerType: formData.get("providerType"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      website: formData.get("website") || null,
      address: formData.get("address"),
      city: formData.get("city"),
      state: formData.get("state"),
      zipCode: formData.get("zipCode"),
      description: formData.get("description") || null,
      careTypesOffered: careTypes,
      serviceRadius: formData.get("serviceRadius") ? parseInt(formData.get("serviceRadius") as string) : null,
      licensed: formData.get("licensed") === "on",
      licenseNumber: formData.get("licenseNumber") || null,
      yearsInBusiness: formData.get("yearsInBusiness") ? parseInt(formData.get("yearsInBusiness") as string) : null,
      capacity: formData.get("capacity") ? parseInt(formData.get("capacity") as string) : null,
      userId: session?.user?.id || null,
    };

    try {
      const response = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create provider");
      }

      const provider = await response.json();
      router.push(`/providers/${provider.id}`);
    } catch (err) {
      setError("Failed to create provider. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Olera
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-primary-600">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add Your Provider Profile</h1>

        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider Type *
                </label>
                <select
                  name="providerType"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select type</option>
                  <option value="HOME_CARE">Home Care</option>
                  <option value="HOME_HEALTH">Home Health</option>
                  <option value="ASSISTED_LIVING">Assisted Living</option>
                  <option value="INDEPENDENT_LIVING">Independent Living</option>
                  <option value="MEMORY_CARE">Memory Care</option>
                  <option value="NURSING_HOME">Nursing Home</option>
                  <option value="HOSPICE">Hospice</option>
                  <option value="REHABILITATION">Rehabilitation</option>
                  <option value="INDEPENDENT_CAREGIVER">Independent Caregiver</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Tell families about your services..."
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="CA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Radius (miles)
                </label>
                <input
                  type="number"
                  name="serviceRadius"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., 25"
                />
              </div>
            </div>
          </div>

          {/* Care Types */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Care Services Offered</h2>
            <div className="space-y-2">
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
                    className="rounded border-gray-300 text-primary-600 mr-2"
                  />
                  <span className="text-sm text-gray-700">{care.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Details</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="licensed"
                  className="rounded border-gray-300 text-primary-600 mr-2"
                />
                <label className="text-sm text-gray-700">Licensed Provider</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Number
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years in Business
                  </label>
                  <input
                    type="number"
                    name="yearsInBusiness"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity (patients/residents)
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 disabled:opacity-50 font-medium"
            >
              {loading ? "Creating..." : "Create Provider Profile"}
            </button>
            <Link
              href="/dashboard"
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
