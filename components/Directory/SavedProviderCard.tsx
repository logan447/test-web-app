"use client";

import Link from "next/link";
import Image from "next/image";

// Provider type categories for styling (matching ProviderCard gold standard)
const FACILITY_TYPES = [
  "ASSISTED_LIVING",
  "MEMORY_CARE",
  "NURSING_HOME",
  "INDEPENDENT_LIVING",
  "REHABILITATION",
];
const HOME_CARE_TYPES = ["HOME_CARE", "HOME_HEALTH", "HOSPICE"];
const CAREGIVER_TYPES = ["INDEPENDENT_CAREGIVER"];

interface SavedProviderCardProps {
  saved: {
    id: string;
    provider: {
      id: string;
      name: string;
      providerType: string;
      description?: string | null;
      city: string;
      state: string;
      careTypesOffered?: string[];
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
      hasMemoryCare?: boolean;
      hasRespiteCare?: boolean;
      hasHospiceCare?: boolean;
    };
    notes?: string | null;
    createdAt: string;
  };
  hasRequest: boolean;
  requestId?: string;
  onRemove: (providerId: string) => void;
  compareMode?: boolean;
  isSelectedForCompare?: boolean;
  onToggleCompare?: (providerId: string) => void;
}

export default function SavedProviderCard({
  saved,
  hasRequest,
  requestId,
  onRemove,
  compareMode = false,
  isSelectedForCompare = false,
  onToggleCompare,
}: SavedProviderCardProps) {
  const provider = saved.provider;

  // Determine provider category for styling
  const isFacility = FACILITY_TYPES.includes(provider.providerType);
  const isHomeCare = HOME_CARE_TYPES.includes(provider.providerType);
  const isCaregiver = CAREGIVER_TYPES.includes(provider.providerType);

  // Format provider type for display
  const formatProviderType = (type: string) => {
    const typeMap: Record<string, string> = {
      HOME_CARE: "Home Care",
      HOME_HEALTH: "Home Health",
      ASSISTED_LIVING: "Assisted Living",
      MEMORY_CARE: "Memory Care",
      NURSING_HOME: "Nursing Home",
      HOSPICE: "Hospice",
      INDEPENDENT_LIVING: "Independent Living",
      REHABILITATION: "Rehabilitation",
      INDEPENDENT_CAREGIVER: "Independent Caregiver",
    };
    return typeMap[type] || type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Format care type for display
  const formatCareType = (type: string) => {
    return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Get image URL with gradient fallback
  const imageUrl = provider.coverPhoto || provider.photos?.[0] || null;

  // Format price based on provider type
  const formatPrice = () => {
    const { priceMin, priceMax } = provider;
    if (!priceMin && !priceMax) return null;

    const isHourly = isHomeCare || isCaregiver;
    const suffix = isHourly ? "/hr" : "/mo";

    if (priceMin && priceMax) {
      return `$${priceMin.toLocaleString()}-$${priceMax.toLocaleString()}${suffix}`;
    }
    if (priceMin) return `From $${priceMin.toLocaleString()}${suffix}`;
    if (priceMax) return `Up to $${priceMax.toLocaleString()}${suffix}`;
    return null;
  };

  // Get provider type badge colors
  const getTypeBadgeClasses = () => {
    if (isFacility) return "bg-primary-100 text-primary-700";
    if (isHomeCare) return "bg-blue-100 text-blue-700";
    if (isCaregiver) return "bg-purple-100 text-purple-700";
    return "bg-gray-100 text-gray-700";
  };

  // Get specialty badges
  const getSpecialtyBadges = () => {
    const badges: { label: string; className: string }[] = [];
    if (provider.hasMemoryCare) {
      badges.push({ label: "Memory Care", className: "bg-purple-50 text-purple-700 border border-purple-200" });
    }
    if (provider.hasRespiteCare) {
      badges.push({ label: "Respite Care", className: "bg-green-50 text-green-700 border border-green-200" });
    }
    if (provider.hasHospiceCare) {
      badges.push({ label: "Hospice Care", className: "bg-blue-50 text-blue-700 border border-blue-200" });
    }
    return badges;
  };

  // Get provider-type-specific CTA text
  const getProviderCTA = () => {
    const typeMap: Record<string, string> = {
      ASSISTED_LIVING: "Schedule a Tour",
      MEMORY_CARE: "Schedule a Tour",
      NURSING_HOME: "Schedule a Tour",
      INDEPENDENT_LIVING: "Schedule a Tour",
      REHABILITATION: "Schedule a Tour",
      HOME_CARE: "Request a Consultation",
      HOME_HEALTH: "Request a Consultation",
      HOSPICE: "Request a Consultation",
      INDEPENDENT_CAREGIVER: "Schedule an Interview",
    };
    return typeMap[provider.providerType] || "View Details";
  };

  const specialtyBadges = getSpecialtyBadges();
  const careTypes = provider.careTypesOffered || [];
  const price = formatPrice();

  const daysSinceSaved = Math.floor(
    (Date.now() - new Date(saved.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className={`group bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${
      isSelectedForCompare ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200 hover:border-primary-200'
    }`}>
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative sm:w-48 h-48 sm:h-auto shrink-0 bg-gray-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={provider.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 192px"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}

          {/* Compare Checkbox */}
          {compareMode && onToggleCompare && (
            <button
              onClick={() => onToggleCompare(provider.id)}
              className={`absolute top-2 left-2 z-10 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                isSelectedForCompare
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white/90 text-gray-400 hover:bg-white hover:text-primary-600 shadow-sm'
              }`}
            >
              {isSelectedForCompare ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              )}
            </button>
          )}

          {/* Verified Badge */}
          {(provider.verified || provider.claimed) && (
            <div className={`absolute top-2 flex items-center gap-1 px-2 py-1 bg-primary-600 text-white text-xs font-medium rounded-full ${compareMode ? 'left-11' : 'left-2'}`}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified
            </div>
          )}

          {/* Request Sent Badge */}
          {hasRequest && (
            <div className="absolute top-2 right-10 flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Contacted
            </div>
          )}

          {/* Remove Button */}
          <button
            onClick={() => onRemove(provider.id)}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-colors"
            title="Remove from saved"
          >
            <svg
              className="w-5 h-5 text-red-500 fill-current"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {/* Location */}
          <p className="text-sm text-gray-500 mb-1">
            {provider.city}, {provider.state}
          </p>

          {/* Name */}
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
            {provider.name}
          </h3>

          {/* Saved timestamp */}
          <p className="text-xs text-gray-400 mb-2">
            Saved {daysSinceSaved === 0 ? "today" : `${daysSinceSaved} day${daysSinceSaved > 1 ? "s" : ""} ago`}
          </p>

          {/* Type & Care Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${getTypeBadgeClasses()}`}>
              {formatProviderType(provider.providerType)}
            </span>
            {careTypes.slice(0, 2).map((care) => (
              <span key={care} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                {formatCareType(care)}
              </span>
            ))}
            {careTypes.length > 2 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                +{careTypes.length - 2} more
              </span>
            )}
          </div>

          {/* Description */}
          {provider.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {provider.description}
            </p>
          )}

          {/* Specialty Badges */}
          {specialtyBadges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {specialtyBadges.map((badge) => (
                <span key={badge.label} className={`px-2 py-0.5 text-xs font-medium rounded ${badge.className}`}>
                  {badge.label}
                </span>
              ))}
            </div>
          )}

          {/* My Notes */}
          {saved.notes && (
            <div className="mb-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-2">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <p className="text-sm text-yellow-900 line-clamp-2">{saved.notes}</p>
              </div>
            </div>
          )}

          {/* Price and Rating Row */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500">Starting at</p>
              <p className="font-semibold text-gray-900">
                {price || "Contact for pricing"}
              </p>
            </div>
            {provider.averageRating && provider.averageRating > 0 && (
              <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                <span className="text-lg font-bold text-gray-900">{provider.averageRating.toFixed(1)}</span>
                {provider.reviewCount && provider.reviewCount > 0 && (
                  <span className="text-sm text-gray-500">({provider.reviewCount})</span>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            <Link
              href={`/providers/${provider.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
            >
              View Details
            </Link>
            {hasRequest && requestId ? (
              <Link
                href={`/requests/${requestId}`}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors"
              >
                View Conversation
              </Link>
            ) : (
              <Link
                href={`/providers/${provider.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm transition-colors"
              >
                {getProviderCTA()}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
