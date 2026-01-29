"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// =============================================================================
// ProviderCard - Browse Page Card Component
// =============================================================================
// Design principles:
// 1. Clean, minimal design inspired by Airbnb
// 2. Three-state awareness: unclaimed, claimed incomplete, claimed complete
// 3. Affordability signals via payment badges (Medicare, Medicaid, VA, etc.)
// 4. Mobile-first responsive layout
// 5. Optimized for 65+ users: clarity, trust, simplicity
// =============================================================================

// Provider type categories
const FACILITY_TYPES = [
  "ASSISTED_LIVING",
  "MEMORY_CARE",
  "NURSING_HOME",
  "INDEPENDENT_LIVING",
  "REHABILITATION",
];
const HOME_CARE_TYPES = ["HOME_CARE", "HOME_HEALTH", "HOSPICE"];
const CAREGIVER_TYPES = ["INDEPENDENT_CAREGIVER"];

// Insurance-based subtypes: these are primarily covered by Medicare/Medicaid
// Showing "Starting at $X" would be misleading since families don't typically pay out-of-pocket
const INSURANCE_BASED_TYPES = [
  "HOSPICE",        // Medicare Hospice Benefit covers ~100%
  "NURSING_HOME",   // Medicare (short-term), Medicaid (long-term)
  "REHABILITATION", // Medicare post-acute, commercial insurance
  "HOME_HEALTH",    // Medicare when physician-ordered
];

// Private-pay subtypes: families pay directly, price transparency is helpful
const PRIVATE_PAY_TYPES = [
  "ASSISTED_LIVING",
  "MEMORY_CARE",
  "INDEPENDENT_LIVING",
  "HOME_CARE",
  "INDEPENDENT_CAREGIVER",
];

// Payment mode display configuration
const PAYMENT_MODE_CONFIG: Record<string, { label: string; className: string; priority: number }> = {
  MEDICARE: { label: "Medicare", className: "bg-green-100 text-green-800", priority: 1 },
  MEDICAID: { label: "Medicaid", className: "bg-blue-100 text-blue-800", priority: 2 },
  VA_BENEFITS: { label: "VA Benefits", className: "bg-indigo-100 text-indigo-800", priority: 3 },
  LONG_TERM_CARE_INSURANCE: { label: "LTC Insurance", className: "bg-purple-100 text-purple-800", priority: 4 },
  STATE_WAIVER_PROGRAM: { label: "State Programs", className: "bg-teal-100 text-teal-800", priority: 5 },
  PRIVATE_PAY: { label: "Private Pay", className: "bg-gray-100 text-gray-700", priority: 6 },
};

export interface ProviderCardProps {
  provider: {
    id: string;
    name: string;
    providerType: string;
    city: string;
    state: string;
    description?: string | null;
    averageRating?: number | null;
    reviewCount?: number;
    priceMin?: number | null;
    priceMax?: number | null;
    photos?: string[];
    coverPhoto?: string | null;
    verified?: boolean;
    claimed?: boolean;
    availableSpots?: number | null;
    totalCapacity?: number | null;
    // Payment modes for affordability signals
    paymentModesAccepted?: string[];
    // Location for map fallback when no photos
    latitude?: number | null;
    longitude?: number | null;
  };
  variant?: "horizontal" | "vertical";
  showSaveButton?: boolean;
  isSaved?: boolean;
  onSave?: (providerId: string) => void;
  className?: string;
}

export default function ProviderCard({
  provider,
  variant = "horizontal",
  showSaveButton = false,
  isSaved = false,
  onSave,
  className = "",
}: ProviderCardProps) {
  // Track if the image failed to load (e.g., network error, service unavailable)
  const [imageError, setImageError] = useState(false);

  // Determine provider category
  const isFacility = FACILITY_TYPES.includes(provider.providerType);
  const isHomeCare = HOME_CARE_TYPES.includes(provider.providerType);
  const isCaregiver = CAREGIVER_TYPES.includes(provider.providerType);

  // Insurance-based vs private-pay determines pricing display strategy
  const isInsuranceBased = INSURANCE_BASED_TYPES.includes(provider.providerType);
  const isPrivatePay = PRIVATE_PAY_TYPES.includes(provider.providerType);

  // Determine data state
  const isClaimed = provider.claimed === true;
  const hasPrice = provider.priceMin !== null && provider.priceMin !== undefined;
  const hasPaymentModes = provider.paymentModesAccepted && provider.paymentModesAccepted.length > 0;
  const hasReviews = (provider.reviewCount ?? 0) > 0;
  const hasPhoto = provider.coverPhoto || (provider.photos && provider.photos.length > 0);

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
      INDEPENDENT_CAREGIVER: "Private Caregiver",
    };
    return typeMap[type] || type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Get image URL - use static map as fallback when no photos but lat/lng exists
  const getImageUrl = (): string | null => {
    // First try actual photos
    if (provider.coverPhoto) return provider.coverPhoto;
    if (provider.photos && provider.photos.length > 0) return provider.photos[0];

    // Fall back to static map if we have coordinates
    if (provider.latitude && provider.longitude) {
      // Using OpenStreetMap static map service (no API key required)
      return `https://staticmap.openstreetmap.de/staticmap.php?center=${provider.latitude},${provider.longitude}&zoom=15&size=400x300&maptype=mapnik`;
    }

    return null;
  };

  const imageUrl = getImageUrl();
  const isMapFallback = !provider.coverPhoto && (!provider.photos || provider.photos.length === 0) && imageUrl !== null;

  // Format price based on provider type and data state
  // Insurance-based types (Hospice, Nursing Home, Rehab, Home Health) should NOT show prices
  // because families don't typically pay out-of-pocket for these services
  // Unclaimed providers: we don't know their pricing, so don't show
  const formatPrice = (): { label: string; value: string } | null => {
    // Never show prices for unclaimed providers (we don't have verified pricing)
    if (!isClaimed) return null;

    // Never show prices for insurance-based provider types
    if (isInsuranceBased) return null;

    const { priceMin } = provider;
    if (!priceMin) return null;

    // Home care and caregivers use hourly rates; facilities use monthly
    const isHourly = provider.providerType === "HOME_CARE" || isCaregiver;
    const suffix = isHourly ? "/hr" : "/mo";

    return {
      label: "Starting at",
      value: `$${priceMin.toLocaleString()}${suffix}`,
    };
  };

  // Get the appropriate CTA text based on provider type and claim status
  const getAffordabilityCta = (): string => {
    // Unclaimed providers: neutral CTA since we don't know their payment model
    if (!isClaimed) {
      return "Learn more →";
    }
    // Insurance-based claimed providers
    if (isInsuranceBased) {
      return "Explore coverage →";
    }
    // Private-pay claimed providers without pricing
    return "Explore affordability →";
  };

  // Get payment badges - only for claimed providers (we don't know unclaimed payment models)
  // Limited to 2 badges max to reduce visual clutter for 65+ users
  const getPaymentBadges = () => {
    // Don't show payment badges for unclaimed providers
    if (!isClaimed) return [];

    if (!provider.paymentModesAccepted || provider.paymentModesAccepted.length === 0) {
      return [];
    }
    return provider.paymentModesAccepted
      .filter((mode) => PAYMENT_MODE_CONFIG[mode])
      .sort((a, b) => PAYMENT_MODE_CONFIG[a].priority - PAYMENT_MODE_CONFIG[b].priority)
      .slice(0, 2) // Reduced from 3 to 2 for cleaner cards
      .map((mode) => PAYMENT_MODE_CONFIG[mode]);
  };

  // Get availability text for facilities
  // Only show for claimed providers (unclaimed providers don't have verified availability)
  const getAvailabilityText = () => {
    if (!isFacility) return null;
    if (!isClaimed) return null; // Don't show availability for unclaimed
    const spots = provider.availableSpots;
    if (spots === null || spots === undefined) return null;
    if (spots === 0) return { text: "Waitlist available", className: "text-amber-700 bg-amber-50" };
    return { text: `${spots} ${spots === 1 ? "spot" : "spots"} available`, className: "text-green-700 bg-green-50" };
  };

  const paymentBadges = getPaymentBadges();
  const price = formatPrice();
  const availability = getAvailabilityText();
  const linkHref = `/providers/${provider.id}`;

  // ==========================================================================
  // Horizontal variant (default for browse page)
  // Simplified for 65+ users: clean image, condensed info hierarchy
  // ==========================================================================
  if (variant === "horizontal") {
    return (
      <Link
        href={linkHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200 ${className}`}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Clean photo - no overlays */}
          <div className="relative sm:w-56 h-48 sm:h-auto shrink-0 bg-stone-100">
            {imageUrl && !imageError ? (
              <>
                <Image
                  src={imageUrl}
                  alt={isMapFallback ? `Map of ${provider.name} location` : provider.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 224px"
                  onError={() => setImageError(true)}
                />
                {/* Map view indicator when using map fallback */}
                {isMapFallback && (
                  <div className="absolute bottom-2 left-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm text-xs font-medium text-white rounded">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Map view
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-stone-400">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-xs">Photo not available</span>
                </div>
              </div>
            )}
          </div>

          {/* Content with simplified hierarchy */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col relative">
            {/* Save button - positioned top-right of content area */}
            {showSaveButton && onSave && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSave(provider.id);
                }}
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label={isSaved ? "Remove from saved" : "Save"}
              >
                <svg
                  className={`w-5 h-5 ${isSaved ? "text-red-500 fill-current" : "text-gray-400 hover:text-gray-600"}`}
                  viewBox="0 0 24 24"
                  fill={isSaved ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            )}

            {/* Line 1: Care type · City, State */}
            <p className="text-sm text-gray-500 mb-1">
              {formatProviderType(provider.providerType)} · {provider.city}, {provider.state}
            </p>

            {/* Line 2: Provider name */}
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700 transition-colors mb-2 line-clamp-1 pr-10">
              {provider.name}
            </h3>

            {/* Line 3: Condensed info - rating · reviews · price (all on one line) */}
            <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
              {hasReviews && (
                <>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-medium text-gray-900">{provider.averageRating?.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-400">·</span>
                  <span>{provider.reviewCount} {provider.reviewCount === 1 ? "review" : "reviews"}</span>
                </>
              )}
              {price && (
                <>
                  {hasReviews && <span className="text-gray-400">·</span>}
                  <span className="font-medium text-gray-900">{price.value}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ==========================================================================
  // Vertical variant (for grid views, homepage)
  // Simplified for 65+ users: clean image, condensed info hierarchy
  // ==========================================================================
  return (
    <Link
      href={linkHref}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200 ${className}`}
    >
      {/* Clean photo - no overlays */}
      <div className="relative h-48 bg-stone-100">
        {imageUrl && !imageError ? (
          <>
            <Image
              src={imageUrl}
              alt={isMapFallback ? `Map of ${provider.name} location` : provider.name}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
            {/* Map view indicator when using map fallback */}
            {isMapFallback && (
              <div className="absolute bottom-2 left-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm text-xs font-medium text-white rounded">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Map view
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-stone-400">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-xs">Photo not available</span>
            </div>
          </div>
        )}
      </div>

      {/* Content with simplified hierarchy */}
      <div className="p-4 relative">
        {/* Save button - positioned top-right of content area */}
        {showSaveButton && onSave && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSave(provider.id);
            }}
            className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={isSaved ? "Remove from saved" : "Save"}
          >
            <svg
              className={`w-5 h-5 ${isSaved ? "text-red-500 fill-current" : "text-gray-400 hover:text-gray-600"}`}
              viewBox="0 0 24 24"
              fill={isSaved ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}

        {/* Line 1: Care type · City, State */}
        <p className="text-sm text-gray-500 mb-1">
          {formatProviderType(provider.providerType)} · {provider.city}, {provider.state}
        </p>

        {/* Line 2: Provider name */}
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-700 transition-colors mb-2 line-clamp-1 pr-10">
          {provider.name}
        </h3>

        {/* Line 3: Condensed info - rating · reviews · price (all on one line) */}
        <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
          {hasReviews && (
            <>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-medium text-gray-900">{provider.averageRating?.toFixed(1)}</span>
              </div>
              <span className="text-gray-400">·</span>
              <span>{provider.reviewCount} {provider.reviewCount === 1 ? "review" : "reviews"}</span>
            </>
          )}
          {price && (
            <>
              {hasReviews && <span className="text-gray-400">·</span>}
              <span className="font-medium text-gray-900">{price.value}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
