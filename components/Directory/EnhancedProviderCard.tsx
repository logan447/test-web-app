"use client";

import Link from "next/link";
import Image from "next/image";
import { CredibilityBadge } from "@/components/Trust/CredibilityScore";
import { calculateTrustScore } from "@/components/Trust/TrustBadges";

interface EnhancedProviderCardProps {
  provider: {
    id: string;
    name: string;
    providerType: string;
    city: string;
    state: string;
    description: string | null;
    careTypesOffered: string[];
    licensed: boolean;
    insuranceVerified: boolean;
    backgroundChecked: boolean;
    certifications: string[];
    averageRating: number | null;
    reviewCount: number;
    priceMin: number | null;
    priceMax: number | null;
    availableSpots: number | null;
    totalCapacity: number | null;
    photos: string[];
    coverPhoto: string | null;
    verified: boolean;
    hasMemoryCare: boolean;
    hasRespiteCare: boolean;
    hasHospiceCare: boolean;
    claimed?: boolean;
  };
  linkHref: string;
  hasRequestSent?: boolean;
  isSaved?: boolean;
  onSave?: (providerId: string) => void;
}

export default function EnhancedProviderCard({
  provider,
  linkHref,
  hasRequestSent = false,
  isSaved = false,
  onSave,
}: EnhancedProviderCardProps) {
  const formatProviderType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getImageUrl = () => {
    if (provider.coverPhoto) return provider.coverPhoto;
    if (provider.photos && provider.photos.length > 0) return provider.photos[0];
    return "/default-provider-image.jpg";
  };

  const getKeyAmenities = () => {
    const amenities = [];
    if (provider.hasMemoryCare) amenities.push("Memory Care");
    if (provider.hasRespiteCare) amenities.push("Respite Care");
    if (provider.hasHospiceCare) amenities.push("Hospice Care");
    return amenities.slice(0, 3);
  };

  const keyAmenities = getKeyAmenities();

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSave) {
      onSave(provider.id);
    }
  };

  return (
    <Link
      href={linkHref}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden block"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <Image
          src={getImageUrl()}
          alt={provider.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {provider.verified && (
            <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Verified
            </span>
          )}
          {hasRequestSent && (
            <span className="bg-green-600 text-white px-2 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Request Sent
            </span>
          )}
          {provider.claimed === false && (
            <span className="bg-gray-600 text-white px-2 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              Unclaimed
            </span>
          )}
        </div>

        {/* Right side: Save button and Availability Badge */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
          {/* Save/Heart Button */}
          {onSave && (
            <button
              onClick={handleSaveClick}
              className="p-2 rounded-full bg-white/90 hover:bg-white shadow-md hover:shadow-lg transition-all"
              title={isSaved ? "Remove from saved" : "Save provider"}
            >
              <svg
                className={`w-5 h-5 transition-colors ${
                  isSaved ? "text-red-500 fill-current" : "text-gray-400 hover:text-red-500"
                }`}
                viewBox="0 0 24 24"
                fill={isSaved ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
          )}

          {/* Availability Badge */}
          {provider.availableSpots !== null && provider.availableSpots > 0 && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
              {provider.availableSpots} {provider.availableSpots === 1 ? "spot" : "spots"} available
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
              {provider.name}
            </h3>
          </div>

          <p className="text-sm text-primary-600 font-medium mb-1">
            {formatProviderType(provider.providerType)}
          </p>

          <p className="text-sm text-gray-600 flex items-center gap-1">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {provider.city}, {provider.state}
          </p>
        </div>

        {/* Rating & Reviews */}
        {provider.averageRating != null && provider.reviewCount > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold text-gray-900">{provider.averageRating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-gray-600">
              ({provider.reviewCount} {provider.reviewCount === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}

        {/* Pricing */}
        {(provider.priceMin || provider.priceMax) && (
          <div className="mb-3">
            <p className="text-lg font-bold text-gray-900">
              {provider.priceMin && provider.priceMax
                ? `$${provider.priceMin.toLocaleString()} - $${provider.priceMax.toLocaleString()}`
                : provider.priceMin
                ? `From $${provider.priceMin.toLocaleString()}`
                : `Up to $${provider.priceMax?.toLocaleString()}`}
              <span className="text-sm font-normal text-gray-600">/month</span>
            </p>
          </div>
        )}

        {/* Key Amenities */}
        {keyAmenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {keyAmenities.map((amenity) => (
              <span
                key={amenity}
                className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-medium"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}

        {/* Trust Score & Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {/* Credibility Badge */}
          <CredibilityBadge
            score={calculateTrustScore({
              verified: provider.verified,
              licensed: provider.licensed,
              insuranceVerified: provider.insuranceVerified,
              backgroundChecked: provider.backgroundChecked,
              claimed: provider.claimed,
              averageRating: provider.averageRating,
              reviewCount: provider.reviewCount,
            })}
          />

          {/* Individual Trust Indicators */}
          <div className="flex items-center gap-1.5 ml-auto">
            {provider.licensed && (
              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center" title="Licensed">
                <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            )}
            {provider.insuranceVerified && (
              <span className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center" title="Insurance Verified">
                <svg className="w-3 h-3 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
            )}
            {provider.backgroundChecked && (
              <span className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center" title="Background Checked">
                <svg className="w-3 h-3 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
            )}
          </div>
        </div>

        {/* View Details Button */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm font-medium text-primary-600">
            <span>View Details</span>
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
