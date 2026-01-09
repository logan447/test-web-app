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
      className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover-lift block"
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
        </div>

        {/* Availability Badge */}
        {provider.availableSpots !== null && provider.availableSpots > 0 && (
          <div className="absolute top-3 right-3">
            <span className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
              {provider.availableSpots} {provider.availableSpots === 1 ? "spot" : "spots"} available
            </span>
          </div>
        )}
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

        {/* Trust Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {provider.licensed && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
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
            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
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
            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Verified
            </span>
          )}
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
