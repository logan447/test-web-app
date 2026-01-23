"use client";

import { useState, useEffect, Suspense, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import MainNav from "@/components/Navigation/MainNav";

// Dynamically import map to avoid SSR issues
const MapView = dynamic(() => import("@/components/Directory/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
      <span className="text-gray-400">Loading map...</span>
    </div>
  ),
});

type Provider = {
  id: string;
  name: string;
  providerType: string;
  address: string;
  city: string;
  state: string;
  description: string | null;
  careTypesOffered: string[];
  averageRating: number | null;
  reviewCount: number;
  priceMin: number | null;
  priceMax: number | null;
  photos: string[];
  coverPhoto: string | null;
  latitude: number | null;
  longitude: number | null;
  claimed?: boolean;
};

// Provider types for filter
const PROVIDER_TYPES = [
  { value: "", label: "All Provider Types" },
  { value: "HOME_CARE", label: "Home Care" },
  { value: "HOME_HEALTH", label: "Home Health" },
  { value: "ASSISTED_LIVING", label: "Assisted Living" },
  { value: "MEMORY_CARE", label: "Memory Care" },
  { value: "NURSING_HOME", label: "Nursing Home" },
  { value: "HOSPICE", label: "Hospice" },
  { value: "INDEPENDENT_LIVING", label: "Independent Living" },
  { value: "REHABILITATION", label: "Rehabilitation" },
  { value: "INDEPENDENT_CAREGIVER", label: "Independent Caregiver" },
];

// Care services for filter
const CARE_SERVICES = [
  { value: "", label: "All Care Services" },
  { value: "COMPANION_CARE", label: "Companion Care" },
  { value: "PERSONAL_CARE", label: "Personal Care" },
  { value: "SKILLED_NURSING", label: "Skilled Nursing" },
  { value: "MEMORY_CARE", label: "Memory Care" },
  { value: "HOSPICE_CARE", label: "Hospice Care" },
  { value: "RESPITE_CARE", label: "Respite Care" },
  { value: "LIVE_IN_CARE", label: "Live-in Care" },
];

// Rating options
const RATING_OPTIONS = [
  { value: "", label: "Any Rating" },
  { value: "4.5", label: "4.5+ Stars" },
  { value: "4", label: "4+ Stars" },
  { value: "3.5", label: "3.5+ Stars" },
  { value: "3", label: "3+ Stars" },
];

// Payment options
const PAYMENT_OPTIONS = [
  { value: "", label: "Any Payment" },
  { value: "private_pay", label: "Private Pay" },
  { value: "medicaid", label: "Medicaid" },
  { value: "medicare", label: "Medicare" },
  { value: "insurance", label: "Long-term Care Insurance" },
];

// Sort options
const SORT_OPTIONS = [
  { value: "", label: "Recommended" },
  { value: "rating_high", label: "Highest Rated" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

// Dropdown Component
function FilterDropdown({
  label,
  value,
  options,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label || label;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors min-w-[140px] ${
          value
            ? "border-primary-500 bg-primary-50 text-primary-700"
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        <span className="truncate">{selectedLabel}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 max-h-64 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                  value === option.value ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [showMap, setShowMap] = useState(true);

  // Filters - default to empty (show all)
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [providerType, setProviderType] = useState(searchParams.get("type") || "");
  const [careService, setCareService] = useState(searchParams.get("care") || "");
  const [minRating, setMinRating] = useState(searchParams.get("rating") || "");
  const [payment, setPayment] = useState(searchParams.get("payment") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "");

  // Fetch providers
  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // Parse location into city and state
      if (location) {
        const parts = location.split(",").map((s) => s.trim());
        if (parts[0]) params.append("city", parts[0]);
        if (parts[1]) params.append("state", parts[1]);
      }

      if (providerType) params.append("providerType", providerType);
      if (careService) params.append("careType", careService);
      if (minRating) params.append("minRating", minRating);
      if (payment) params.append("insurance", payment);
      if (sortBy) params.append("sortBy", sortBy);
      params.append("limit", "50");

      const response = await fetch(`/api/providers?${params.toString()}`);
      const data = await response.json();

      if (response.ok && data.providers) {
        setProviders(data.providers);
        setTotalCount(data.pagination?.total || data.providers.length);
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
    } finally {
      setLoading(false);
    }
  }, [location, providerType, careService, minRating, payment, sortBy]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // Sync URL with filters
  useEffect(() => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (providerType) params.set("type", providerType);
    if (careService) params.set("care", careService);
    if (minRating) params.set("rating", minRating);
    if (payment) params.set("payment", payment);
    if (sortBy) params.set("sort", sortBy);

    const newUrl = params.toString() ? `/browse?${params.toString()}` : "/browse";
    router.replace(newUrl, { scroll: false });
  }, [location, providerType, careService, minRating, payment, sortBy, router]);

  // Format functions
  const formatProviderType = (type: string) => {
    const found = PROVIDER_TYPES.find((t) => t.value === type);
    if (found) return found.label;
    return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatPrice = (min: number | null, max: number | null, type: string) => {
    if (!min && !max) return null;
    // Home care/caregivers show hourly, facilities show monthly
    const isHourly = ["HOME_CARE", "HOME_HEALTH", "INDEPENDENT_CAREGIVER"].includes(type);
    const suffix = isHourly ? "/hr" : "/mo";
    if (min && max) return `$${min.toLocaleString()}-$${max.toLocaleString()}${suffix}`;
    if (min) return `From $${min.toLocaleString()}${suffix}`;
    if (max) return `Up to $${max.toLocaleString()}${suffix}`;
    return null;
  };

  // Clear all filters
  const clearFilters = () => {
    setLocation("");
    setProviderType("");
    setCareService("");
    setMinRating("");
    setPayment("");
    setSortBy("");
  };

  const hasActiveFilters = location || providerType || careService || minRating || payment;

  // Providers with coordinates for map
  const mappableProviders = providers.filter((p) => p.latitude && p.longitude);

  // Build title
  const title = location
    ? `${totalCount} Provider${totalCount !== 1 ? "s" : ""} in ${location}`
    : `${totalCount} Provider${totalCount !== 1 ? "s" : ""} Found`;

  return (
    <>
      <MainNav />

      <div className="min-h-screen bg-gray-50">
        {/* Filter Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Location Input */}
              <div className="relative">
                <div className="flex items-center">
                  <svg className="absolute left-3 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, State (e.g. San Diego, CA)"
                    className="w-64 pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {location && (
                    <button
                      onClick={() => setLocation("")}
                      className="absolute right-2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Provider Type Filter */}
              <FilterDropdown
                label="Provider Type"
                value={providerType}
                options={PROVIDER_TYPES}
                onChange={setProviderType}
              />

              {/* Rating Filter */}
              <FilterDropdown
                label="Rating"
                value={minRating}
                options={RATING_OPTIONS}
                onChange={setMinRating}
              />

              {/* Payment Filter */}
              <FilterDropdown
                label="Payment"
                value={payment}
                options={PAYMENT_OPTIONS}
                onChange={setPayment}
              />

              {/* Care Service Filter */}
              <FilterDropdown
                label="Care Service"
                value={careService}
                options={CARE_SERVICES}
                onChange={setCareService}
              />

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Clear All
                </button>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <FilterDropdown
                  label="Recommended"
                  value={sortBy}
                  options={SORT_OPTIONS}
                  onChange={setSortBy}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            <button
              onClick={() => setShowMap(!showMap)}
              className="lg:hidden px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {showMap ? "Hide Map" : "Show Map"}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <div className="flex gap-6">
            {/* Results List */}
            <div className={`flex-1 ${showMap ? "lg:w-1/2" : "w-full"}`}>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                      <div className="flex gap-4">
                        <div className="w-48 h-36 bg-gray-200 rounded-lg shrink-0" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                          <div className="h-6 bg-gray-200 rounded w-2/3 mb-3" />
                          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : providers.length > 0 ? (
                <div className="space-y-4">
                  {providers.map((provider) => (
                    <Link
                      key={provider.id}
                      href={`/providers/${provider.id}`}
                      className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row">
                        {/* Image */}
                        <div className="relative sm:w-48 h-48 sm:h-auto shrink-0">
                          {provider.coverPhoto || provider.photos?.[0] ? (
                            <img
                              src={provider.coverPhoto || provider.photos[0]}
                              alt={provider.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                              <svg className="w-12 h-12 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                          )}
                          {/* Verified Badge */}
                          {provider.claimed && (
                            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Verified
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4">
                          {/* Location */}
                          <p className="text-sm text-gray-500 mb-1">
                            {provider.address ? `${provider.address}, ` : ""}{provider.city}, {provider.state}
                          </p>

                          {/* Name */}
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600">
                            {provider.name}
                          </h3>

                          {/* Care Types */}
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                              {formatProviderType(provider.providerType)}
                            </span>
                            {provider.careTypesOffered.slice(0, 2).map((care) => (
                              <span key={care} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                {care.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                              </span>
                            ))}
                            {provider.careTypesOffered.length > 2 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                                +{provider.careTypesOffered.length - 2} more
                              </span>
                            )}
                          </div>

                          {/* Description */}
                          {provider.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                              {provider.description}
                            </p>
                          )}

                          {/* Price and Rating Row */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-500">Estimated Pricing</p>
                              <p className="font-semibold text-gray-900">
                                {formatPrice(provider.priceMin, provider.priceMax, provider.providerType) || "Contact for pricing"}
                              </p>
                            </div>
                            {provider.averageRating && provider.averageRating > 0 && (
                              <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                                <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                </svg>
                                <span className="text-lg font-bold text-gray-900">{provider.averageRating.toFixed(1)}</span>
                                {provider.reviewCount > 0 && (
                                  <span className="text-sm text-gray-500">({provider.reviewCount})</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No providers found</h3>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your filters or search for a different location.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>

            {/* Map */}
            {showMap && (
              <div className="hidden lg:block lg:w-1/2 h-[calc(100vh-180px)] sticky top-32 rounded-xl overflow-hidden border border-gray-200">
                {mappableProviders.length > 0 ? (
                  <MapView
                    providers={mappableProviders.map((p) => ({
                      id: p.id,
                      name: p.name,
                      latitude: p.latitude!,
                      longitude: p.longitude!,
                      providerType: p.providerType,
                      city: p.city,
                      state: p.state,
                    }))}
                    onMarkerClick={(id) => {
                      const element = document.getElementById(`provider-${id}`);
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p>No locations to display</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      }
    >
      <BrowseContent />
    </Suspense>
  );
}
