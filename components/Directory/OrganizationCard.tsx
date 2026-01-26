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

interface OrganizationCardProps {
  organization: {
    id: string;
    name: string;
    providerType: string;
    description?: string | null;
    careTypesOffered?: string[];
    city: string;
    state: string;
    yearsInBusiness?: number;
    licensed?: boolean;
    email?: string;
    phone?: string;
    coverPhoto?: string | null;
    photos?: string[];
    verified?: boolean;
    backgroundChecked?: boolean;
    insuranceVerified?: boolean;
    averageRating?: number | null;
    reviewCount?: number;
    priceMin?: number | null;
    priceMax?: number | null;
  };
  linkHref?: string;
  hasRequest?: boolean;
  className?: string;
}

export default function OrganizationCard({
  organization,
  linkHref,
  hasRequest = false,
  className = "",
}: OrganizationCardProps) {
  // Determine provider category for styling
  const isFacility = FACILITY_TYPES.includes(organization.providerType);
  const isHomeCare = HOME_CARE_TYPES.includes(organization.providerType);

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
    };
    return typeMap[type] || type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Format care type for display
  const formatCareType = (type: string) => {
    return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Get image URL with gradient fallback
  const imageUrl = organization.coverPhoto || organization.photos?.[0] || null;

  // Format price based on provider type
  const formatPrice = () => {
    const { priceMin, priceMax } = organization;
    if (!priceMin && !priceMax) return null;

    const isHourly = isHomeCare;
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
    return "bg-gray-100 text-gray-700";
  };

  const careTypes = organization.careTypesOffered || [];
  const price = formatPrice();
  const href = linkHref || `/providers/browse-organizations/${organization.id}`;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-200 ${className}`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative sm:w-48 h-48 sm:h-auto shrink-0 bg-gray-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={organization.name}
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

          {/* Verified Badge */}
          {organization.verified && (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified
            </div>
          )}

          {/* Request Sent Badge */}
          {hasRequest && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Contacted
            </div>
          )}

          {/* Years in Business Badge */}
          {organization.yearsInBusiness && organization.yearsInBusiness > 0 && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-medium rounded-md shadow-sm">
              {organization.yearsInBusiness} {organization.yearsInBusiness === 1 ? "year" : "years"} in business
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {/* Location */}
          <p className="text-sm text-gray-500 mb-1">
            {organization.city}, {organization.state}
          </p>

          {/* Name */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {organization.name}
          </h3>

          {/* Type & Care Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${getTypeBadgeClasses()}`}>
              {formatProviderType(organization.providerType)}
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
          {organization.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {organization.description}
            </p>
          )}

          {/* Price and Rating Row */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500">Starting at</p>
              <p className="font-semibold text-gray-900">
                {price || "Contact for pricing"}
              </p>
            </div>
            {organization.averageRating && organization.averageRating > 0 && (
              <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                <span className="text-lg font-bold text-gray-900">{organization.averageRating.toFixed(1)}</span>
                {organization.reviewCount && organization.reviewCount > 0 && (
                  <span className="text-sm text-gray-500">({organization.reviewCount})</span>
                )}
              </div>
            )}
          </div>

          {/* CTA Text */}
          <div className="mt-4 flex items-center text-sm font-medium text-primary-600">
            <span>{hasRequest ? "View Conversation" : "View Details"}</span>
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
