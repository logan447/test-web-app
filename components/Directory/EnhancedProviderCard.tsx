"use client";

import Link from "next/link";
import Image from "next/image";

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
  };
  linkHref: string;
  hasRequestSent?: boolean;
}

export default function EnhancedProviderCard({
  provider,
  linkHref,
  hasRequestSent = false,
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

  return (
    <Link
      href={linkHref}
      className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden block transform hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
        <Image
          src={getImageUrl()}
          alt={provider.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Gradient Overlay for Better Badge Visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2 max-w-[calc(100%-6rem)]">
          {provider.verified && (
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
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
            <span className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Request Sent
            </span>
          )}
        </div>

        {/* Availability Badge */}
        {provider.availableSpots !== null && provider.availableSpots > 0 && (
          <div className="absolute top-3 right-3">
            <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
              {provider.availableSpots} {provider.availableSpots === 1 ? "spot" : "spots"} available
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2 leading-tight">
            {provider.name}
          </h3>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-200">
              {formatProviderType(provider.providerType)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <span className="font-medium">{provider.city}, {provider.state}</span>
          </div>
        </div>

        {/* Rating & Reviews */}
        {provider.averageRating != null && provider.reviewCount > 0 && (
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200">
              <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-bold text-gray-900">{provider.averageRating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-gray-600 font-medium">
              ({provider.reviewCount} {provider.reviewCount === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}

        {/* Pricing */}
        {(provider.priceMin || provider.priceMax) && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">Starting at</p>
            <p className="text-2xl font-bold text-gray-900">
              {provider.priceMin && provider.priceMax
                ? `$${provider.priceMin.toLocaleString()}`
                : provider.priceMin
                ? `$${provider.priceMin.toLocaleString()}`
                : `$${provider.priceMax?.toLocaleString()}`}
              <span className="text-sm font-medium text-gray-500">/month</span>
            </p>
            {provider.priceMin && provider.priceMax && (
              <p className="text-xs text-gray-500 mt-0.5">up to ${provider.priceMax.toLocaleString()}/month</p>
            )}
          </div>
        )}

        {/* Key Amenities */}
        {keyAmenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {keyAmenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-purple-200"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {amenity}
              </span>
            ))}
          </div>
        )}

        {/* Trust Badges */}
        <div className="flex flex-wrap gap-3 mb-4">
          {provider.licensed && (
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-700 font-medium">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Licensed
            </span>
          )}
          {provider.insuranceVerified && (
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-700 font-medium">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Insured
            </span>
          )}
          {provider.backgroundChecked && (
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-700 font-medium">
              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Background Checked
            </span>
          )}
        </div>

        {/* View Details CTA */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 group-hover:from-primary-700 group-hover:to-primary-800 rounded-xl transition-all">
            <span className="text-sm font-bold text-white">View Full Profile</span>
            <svg
              className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
