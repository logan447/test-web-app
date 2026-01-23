"use client";

import { useState, useEffect, Suspense, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import MainNav from "@/components/Navigation/MainNav";
import { ProviderCard } from "@/components/Cards";

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
  // Support both "location" param and separate "city"/"state" params (from homepage)
  const getInitialLocation = () => {
    const locationParam = searchParams.get("location");
    if (locationParam) return locationParam;

    const city = searchParams.get("city");
    const state = searchParams.get("state");
    if (city && state) return `${city}, ${state}`;
    if (city) return city;
    return "";
  };
  const [location, setLocation] = useState(getInitialLocation());
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
                    <ProviderCard
                      key={provider.id}
                      provider={{
                        id: provider.id,
                        name: provider.name,
                        providerType: provider.providerType,
                        city: provider.city,
                        state: provider.state,
                        description: provider.description,
                        careTypesOffered: provider.careTypesOffered,
                        averageRating: provider.averageRating,
                        reviewCount: provider.reviewCount,
                        priceMin: provider.priceMin,
                        priceMax: provider.priceMax,
                        coverPhoto: provider.coverPhoto,
                        photos: provider.photos,
                        claimed: provider.claimed,
                      }}
                      variant="horizontal"
                    />
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
