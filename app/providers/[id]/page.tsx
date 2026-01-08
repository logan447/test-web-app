"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import MainNav from "@/components/Navigation/MainNav";
import AuthModal from "@/components/Auth/AuthModal";
import { showToast } from "@/lib/toast";

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
  const { data: session } = useSession();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    fetchProvider();
    if (session?.user?.role === "FAMILY") {
      checkIfSaved();
    }
  }, [session]);

  const fetchProvider = async () => {
    try {
      const response = await fetch(`/api/providers/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProvider(data);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching provider:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    try {
      const response = await fetch('/api/saved-providers');
      if (response.ok) {
        const savedProviders = await response.json();
        const isProviderSaved = savedProviders.some((sp: any) => sp.provider.id === params.id);
        setIsSaved(isProviderSaved);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleSaveToggle = async () => {
    if (!session?.user) {
      setAuthModalOpen(true);
      return;
    }

    setSaving(true);
    try {
      if (isSaved) {
        // Unsave
        const response = await fetch(`/api/saved-providers?providerId=${params.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIsSaved(false);
          showToast.success('Removed from saved');
        } else {
          throw new Error('Failed to unsave');
        }
      } else {
        // Save
        const response = await fetch('/api/saved-providers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ providerId: params.id }),
        });

        if (response.ok) {
          setIsSaved(true);
          showToast.success('Provider saved');
        } else {
          const data = await response.json();
          throw new Error(data.error || 'Failed to save');
        }
      }
    } catch (error: any) {
      showToast.error(error.message || 'Failed to update saved status');
    } finally {
      setSaving(false);
    }
  };

  const formatProviderType = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="flex items-center justify-center py-24">
          <p className="text-gray-600">Loading provider...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      {/* Provider Profile */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="text-primary-600 hover:text-primary-700 mb-6 inline-block"
        >
          ← Back to Browse Providers
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
          {Array.isArray(provider.careTypesOffered) && provider.careTypesOffered.length > 0 && (
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
              {session?.user?.role === "FAMILY" && (
                <button
                  onClick={handleSaveToggle}
                  disabled={saving}
                  className={`px-6 py-3 rounded-md font-medium transition-colors flex items-center gap-2 ${
                    isSaved
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } disabled:opacity-50`}
                >
                  <svg className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill={isSaved ? 'currentColor' : 'none'}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {saving ? 'Saving...' : (isSaved ? 'Saved' : 'Save Provider')}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultView="login"
      />
    </div>
  );
}
