"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
};

export default function ProviderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Determine back link based on where user came from
  const fromSaved = searchParams.get('from') === 'saved';
  const backHref = fromSaved ? '/dashboard/saved' : '/providers';
  const backText = fromSaved ? '← Back to Saved Providers' : '← Back to Browse Providers';

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
          href={backHref}
          className="text-primary-600 hover:text-primary-700 mb-6 inline-block"
        >
          {backText}
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="border-b pb-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{provider.name}</h1>
                <p className="text-lg text-primary-600 mb-2">
                  {formatProviderType(provider.providerType)}
                </p>
                <p className="text-gray-600">
                  📍 {provider.address}, {provider.city}, {provider.state} {provider.zipCode}
                </p>
              </div>
            </div>

            {/* Trust Badges & Availability */}
            <div className="flex flex-wrap gap-2">
              {provider.licensed && (
                <span className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Licensed
                </span>
              )}

              {provider.insuranceVerified && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Insured
                </span>
              )}

              {provider.backgroundChecked && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Background Checked
                </span>
              )}

              {Array.isArray(provider.certifications) && provider.certifications.map((cert) => (
                <span
                  key={cert}
                  className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {cert}
                </span>
              ))}

              {/* Availability Badge */}
              {provider.availableSpots !== null && provider.availableSpots > 0 && (
                <span className="bg-green-50 text-green-700 border border-green-300 px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {provider.availableSpots} {provider.availableSpots === 1 ? 'spot' : 'spots'} available
                </span>
              )}

              {provider.availableSpots === 0 && provider.totalCapacity && (
                <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  Currently at capacity
                </span>
              )}

              {provider.waitlistAvailable && provider.availableSpots === 0 && (
                <span className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full text-sm font-medium">
                  Waitlist available
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

          {/* Pricing */}
          {(provider.priceMin || provider.priceMax || provider.priceDescription || provider.paymentOptions.length > 0) && (
            <div className="mb-6 bg-primary-50 border border-primary-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Pricing & Payment</h2>

              {/* Price Range */}
              {(provider.priceMin || provider.priceMax) && (
                <div className="mb-4">
                  <p className="text-2xl font-bold text-primary-700">
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

              {/* Price Description */}
              {provider.priceDescription && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">What&apos;s included:</p>
                  <p className="text-gray-600">{provider.priceDescription}</p>
                </div>
              )}

              {/* Payment Options */}
              {Array.isArray(provider.paymentOptions) && provider.paymentOptions.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Payment options accepted:</p>
                  <div className="flex flex-wrap gap-2">
                    {provider.paymentOptions.map((option) => (
                      <span
                        key={option}
                        className="bg-white text-primary-700 px-3 py-1 rounded-full text-sm border border-primary-300"
                      >
                        {option}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact for Pricing fallback */}
              {!provider.priceMin && !provider.priceMax && (
                <p className="text-gray-700 italic">Contact for pricing information</p>
              )}
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
