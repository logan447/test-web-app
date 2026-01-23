"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface SavedProviderCardProps {
  saved: {
    id: string;
    provider: {
      id: string;
      name: string;
      providerType: string;
      description: string | null;
      city: string;
      state: string;
      careTypesOffered: string[];
      coverPhoto?: string | null;
      photos?: string[];
      verified?: boolean;
      licensed?: boolean;
      insuranceVerified?: boolean;
      backgroundChecked?: boolean;
      averageRating?: number | null;
      reviewCount?: number;
      priceMin?: number | null;
      priceMax?: number | null;
      claimed?: boolean;
    };
    notes: string | null;
    createdAt: string;
  };
  hasRequest: boolean;
  requestId?: string;
  onRemove: (providerId: string) => void;
}

export default function SavedProviderCard({
  saved,
  hasRequest,
  requestId,
  onRemove,
}: SavedProviderCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatProviderType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatCareType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getImageUrl = () => {
    if (saved.provider.coverPhoto) return saved.provider.coverPhoto;
    if (saved.provider.photos && saved.provider.photos.length > 0) return saved.provider.photos[0];
    return "/default-provider-image.jpg";
  };

  const daysSinceSaved = Math.floor(
    (Date.now() - new Date(saved.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group">
      {/* Image with Badges */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <Image
          src={getImageUrl()}
          alt={saved.provider.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setImageError(true)}
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {saved.provider.verified && (
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
          {hasRequest && (
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
          {saved.provider.claimed === false && (
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

        {/* Remove Button Overlay */}
        <div className="absolute top-3 right-3">
          <button
            onClick={() => onRemove(saved.provider.id)}
            className="p-2 rounded-full bg-white/90 hover:bg-white shadow-md hover:shadow-lg transition-all group/btn"
            title="Remove from saved"
          >
            <svg
              className="w-5 h-5 text-red-500 fill-current group-hover/btn:scale-110 transition-transform"
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
            {saved.provider.name}
          </h3>

          <div className="flex items-center gap-2 text-sm mb-2">
            <span className="font-medium text-primary-600">
              {formatProviderType(saved.provider.providerType)}
            </span>
            <span className="text-gray-400">•</span>
            <span className="flex items-center gap-1 text-gray-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              {saved.provider.city}, {saved.provider.state}
            </span>
          </div>

          <p className="text-xs text-gray-500">
            Saved {daysSinceSaved === 0 ? "today" : `${daysSinceSaved} day${daysSinceSaved > 1 ? "s" : ""} ago`}
          </p>
        </div>

        {/* Rating */}
        {saved.provider.averageRating != null && saved.provider.reviewCount && saved.provider.reviewCount > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold text-gray-900">{saved.provider.averageRating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-gray-600">
              ({saved.provider.reviewCount} {saved.provider.reviewCount === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}

        {/* Pricing */}
        {(saved.provider.priceMin || saved.provider.priceMax) && (
          <div className="mb-3">
            <p className="text-lg font-bold text-gray-900">
              {saved.provider.priceMin && saved.provider.priceMax
                ? `$${saved.provider.priceMin.toLocaleString()} - $${saved.provider.priceMax.toLocaleString()}`
                : saved.provider.priceMin
                ? `From $${saved.provider.priceMin.toLocaleString()}`
                : `Up to $${saved.provider.priceMax?.toLocaleString()}`}
              <span className="text-sm font-normal text-gray-600">/month</span>
            </p>
          </div>
        )}

        {/* Care Types */}
        {saved.provider.careTypesOffered && saved.provider.careTypesOffered.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {saved.provider.careTypesOffered.slice(0, 3).map((type) => (
                <span
                  key={type}
                  className="px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-lg"
                >
                  {formatCareType(type)}
                </span>
              ))}
              {saved.provider.careTypesOffered.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                  +{saved.provider.careTypesOffered.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Trust Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {saved.provider.licensed && (
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
          {saved.provider.insuranceVerified && (
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
          {saved.provider.backgroundChecked && (
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

        {/* Description */}
        {saved.provider.description && (
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">
            {saved.provider.description}
          </p>
        )}

        {/* My Notes */}
        {saved.notes && (
          <div className="mb-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-3">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-yellow-900 uppercase tracking-wide mb-1">My Notes</p>
                <p className="text-sm text-yellow-900 line-clamp-2">{saved.notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex gap-2">
            <Link
              href={`/providers/${saved.provider.id}?from=saved`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2.5 bg-white border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 font-semibold text-center transition-colors text-sm"
            >
              View Profile
            </Link>
            {hasRequest && requestId ? (
              <Link
                href={`/requests/${requestId}?from=saved`}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-semibold text-center transition-all shadow-sm hover:shadow-md text-sm"
              >
                View Request
              </Link>
            ) : (
              <Link
                href={`/requests/new?providerId=${saved.provider.id}`}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 font-semibold text-center transition-all shadow-sm hover:shadow-md text-sm"
              >
                Request
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
