"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Provider = {
  id: string;
  name: string;
  providerType: string;
  description: string | null;
  email: string;
  phone: string;
  website: string | null;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  careTypesOffered: string[];
  licensed: boolean;
  licenseNumber: string | null;
  yearsInBusiness: number | null;
  capacity: number | null;
  serviceRadius: number | null;
};

export default function ProviderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProvider();
  }, []);

  const fetchProvider = async () => {
    try {
      const response = await fetch(`/api/providers/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProvider(data);
      } else {
        router.push("/providers");
      }
    } catch (error) {
      console.error("Error fetching provider:", error);
      router.push("/providers");
    } finally {
      setLoading(false);
    }
  };

  const formatProviderType = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading provider...</p>
      </div>
    );
  }

  if (!provider) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Olera
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/providers" className="text-gray-700 hover:text-primary-600">
                Browse Providers
              </Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-primary-600">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Provider Profile */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/providers"
          className="text-primary-600 hover:text-primary-700 mb-6 inline-block"
        >
          ← Back to Providers
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="border-b pb-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{provider.name}</h1>
                <p className="text-lg text-primary-600 mb-2">
                  {formatProviderType(provider.providerType)}
                </p>
                <p className="text-gray-600">
                  📍 {provider.address}, {provider.city}, {provider.state} {provider.zipCode}
                </p>
              </div>
              {provider.licensed && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  ✓ Licensed
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {provider.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">About</h2>
              <p className="text-gray-700 whitespace-pre-line">{provider.description}</p>
            </div>
          )}

          {/* Care Types */}
          {provider.careTypesOffered.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Care Services Offered</h2>
              <div className="flex flex-wrap gap-2">
                {provider.careTypesOffered.map((care) => (
                  <span
                    key={care}
                    className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm"
                  >
                    {formatProviderType(care)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Phone:</span> {provider.phone}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Email:</span> {provider.email}
                </p>
                {provider.website && (
                  <p className="text-gray-700">
                    <span className="font-medium">Website:</span>{" "}
                    <a
                      href={provider.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      {provider.website}
                    </a>
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Details</h3>
              <div className="space-y-2">
                {provider.yearsInBusiness && (
                  <p className="text-gray-700">
                    <span className="font-medium">Years in Business:</span> {provider.yearsInBusiness}
                  </p>
                )}
                {provider.capacity && (
                  <p className="text-gray-700">
                    <span className="font-medium">Capacity:</span> {provider.capacity} patients/residents
                  </p>
                )}
                {provider.serviceRadius && (
                  <p className="text-gray-700">
                    <span className="font-medium">Service Radius:</span> {provider.serviceRadius} miles
                  </p>
                )}
                {provider.licenseNumber && (
                  <p className="text-gray-700">
                    <span className="font-medium">License #:</span> {provider.licenseNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="border-t pt-6">
            <div className="flex gap-4">
              <Link
                href={`/dashboard/requests/new?providerId=${provider.id}`}
                className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 font-medium"
              >
                Request Consultation
              </Link>
              <button
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 font-medium"
              >
                Save Provider
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
