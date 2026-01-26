"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import Footer from "@/components/Navigation/Footer";
import { ProviderCard } from "@/components/Cards";
import { LocationAutocomplete } from "@/components/Location";
import FilterBar, { FilterConfig } from "@/components/Layout/FilterBar";

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

// Primary filters (always visible)
const PRIMARY_FILTER_CONFIGS: FilterConfig[] = [
  {
    id: "providerType",
    label: "Care Type",
    options: [
      { value: "", label: "All Types" },
      { value: "HOME_CARE", label: "Home Care" },
      { value: "HOME_HEALTH", label: "Home Health" },
      { value: "ASSISTED_LIVING", label: "Assisted Living" },
      { value: "MEMORY_CARE", label: "Memory Care" },
      { value: "NURSING_HOME", label: "Nursing Home" },
      { value: "HOSPICE", label: "Hospice" },
      { value: "INDEPENDENT_LIVING", label: "Independent Living" },
      { value: "REHABILITATION", label: "Rehabilitation" },
      { value: "INDEPENDENT_CAREGIVER", label: "Caregiver" },
    ],
  },
];

// Secondary filters (hidden behind "More Filters")
const SECONDARY_FILTER_CONFIGS: FilterConfig[] = [
  {
    id: "rating",
    label: "Rating",
    options: [
      { value: "", label: "Any Rating" },
      { value: "4.5", label: "4.5+ Stars" },
      { value: "4", label: "4+ Stars" },
      { value: "3.5", label: "3.5+ Stars" },
      { value: "3", label: "3+ Stars" },
    ],
  },
  {
    id: "payment",
    label: "Payment",
    options: [
      { value: "", label: "Any Payment" },
      { value: "private_pay", label: "Private Pay" },
      { value: "medicaid", label: "Medicaid" },
      { value: "medicare", label: "Medicare" },
      { value: "insurance", label: "Long-term Insurance" },
    ],
  },
  {
    id: "careService",
    label: "Services",
    options: [
      { value: "", label: "All Services" },
      { value: "COMPANION_CARE", label: "Companion" },
      { value: "PERSONAL_CARE", label: "Personal Care" },
      { value: "SKILLED_NURSING", label: "Skilled Nursing" },
      { value: "MEMORY_CARE", label: "Memory Care" },
      { value: "HOSPICE_CARE", label: "Hospice" },
      { value: "RESPITE_CARE", label: "Respite" },
      { value: "LIVE_IN_CARE", label: "Live-in" },
    ],
  },
];

// Combined for reference
const FILTER_CONFIGS: FilterConfig[] = [...PRIMARY_FILTER_CONFIGS, ...SECONDARY_FILTER_CONFIGS];

// Sort options
const SORT_OPTIONS = [
  { value: "", label: "Recommended" },
  { value: "rating_high", label: "Highest Rated" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

// Quick filter chips for common searches (using existing filter fields)
const QUICK_FILTERS: Array<{ id: string; label: string; filter: Record<string, string> }> = [
  { id: "top_rated", label: "Top Rated (4.5+)", filter: { rating: "4.5" } },
  { id: "memory", label: "Memory Care", filter: { providerType: "MEMORY_CARE" } },
  { id: "home", label: "In-Home Care", filter: { providerType: "HOME_CARE" } },
  { id: "assisted", label: "Assisted Living", filter: { providerType: "ASSISTED_LIVING" } },
  { id: "nursing", label: "Nursing Home", filter: { providerType: "NURSING_HOME" } },
];

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // Helper functions for initial state (must be declared before useState calls)
  const getInitialLocation = (): string => {
    const locationParam = searchParams.get("location");
    if (locationParam) return locationParam;

    const city = searchParams.get("city");
    const state = searchParams.get("state");
    if (city && state) return `${city}, ${state}`;
    if (city) return city;
    return "";
  };

  const getInitialSelectedLocation = (): { city: string; state: string } | null => {
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    if (city && state) return { city, state };
    return null;
  };

  // State declarations
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [showMap, setShowMap] = useState(true);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [savedProviderIds, setSavedProviderIds] = useState<Set<string>>(new Set());
  const [selectedLocation, setSelectedLocation] = useState<{ city: string; state: string } | null>(getInitialSelectedLocation());
  const [location, setLocation] = useState(getInitialLocation());
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    providerType: searchParams.get("type") || "",
    rating: searchParams.get("rating") || "",
    payment: searchParams.get("payment") || "",
    careService: searchParams.get("care") || "",
  });
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "");

  // Fetch providers
  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // Use selectedLocation if available, otherwise parse location string
      if (selectedLocation) {
        params.append("city", selectedLocation.city);
        params.append("state", selectedLocation.state);
      } else if (location) {
        const parts = location.split(",").map((s) => s.trim());
        if (parts[0]) params.append("city", parts[0]);
        if (parts[1]) params.append("state", parts[1]);
      }

      if (filterValues.providerType) params.append("providerType", filterValues.providerType);
      if (filterValues.careService) params.append("careType", filterValues.careService);
      if (filterValues.rating) params.append("minRating", filterValues.rating);
      if (filterValues.payment) params.append("insurance", filterValues.payment);
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
  }, [location, selectedLocation, filterValues, sortBy]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // Sync URL with filters
  useEffect(() => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (filterValues.providerType) params.set("type", filterValues.providerType);
    if (filterValues.careService) params.set("care", filterValues.careService);
    if (filterValues.rating) params.set("rating", filterValues.rating);
    if (filterValues.payment) params.set("payment", filterValues.payment);
    if (sortBy) params.set("sort", sortBy);

    const newUrl = params.toString() ? `/browse?${params.toString()}` : "/browse";
    router.replace(newUrl, { scroll: false });
  }, [location, filterValues, sortBy, router]);

  // Handle filter change
  const handleFilterChange = (filterId: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [filterId]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setLocation("");
    setFilterValues({
      providerType: "",
      rating: "",
      payment: "",
      careService: "",
    });
    setSortBy("");
  };

  const hasActiveFilters = Boolean(location) || Object.values(filterValues).some((v) => v !== "");

  // Load saved providers from localStorage and server (if authenticated)
  useEffect(() => {
    // First, load from localStorage for immediate display
    const saved = localStorage.getItem("savedProviders");
    if (saved) {
      try {
        const ids = JSON.parse(saved);
        setSavedProviderIds(new Set(ids));
      } catch (e) {
        console.error("Failed to parse saved providers:", e);
      }
    }

    // If authenticated, also fetch from server and merge
    const fetchServerSaved = async () => {
      if (session?.user) {
        try {
          const response = await fetch("/api/saved-providers");
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
              const serverIds = data.map((s: { providerId: string }) => s.providerId);
              setSavedProviderIds((prev) => {
                const merged = new Set([...prev, ...serverIds]);
                // Sync merged set back to localStorage
                localStorage.setItem("savedProviders", JSON.stringify([...merged]));
                return merged;
              });
            }
          }
        } catch (err) {
          console.error("Failed to fetch server saved providers:", err);
        }
      }
    };

    fetchServerSaved();
  }, [session?.user]);

  // Handle save/unsave provider
  const handleSaveProvider = useCallback(async (providerId: string) => {
    const isCurrentlySaved = savedProviderIds.has(providerId);

    // Optimistically update UI
    setSavedProviderIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(providerId)) {
        newSet.delete(providerId);
      } else {
        newSet.add(providerId);
      }
      // Persist to localStorage
      localStorage.setItem("savedProviders", JSON.stringify([...newSet]));
      return newSet;
    });

    // If authenticated, also persist to server
    if (session?.user) {
      try {
        if (isCurrentlySaved) {
          // Remove from server
          await fetch(`/api/saved-providers?providerId=${providerId}`, {
            method: "DELETE",
          });
        } else {
          // Save to server
          await fetch("/api/saved-providers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ providerId }),
          });
        }
      } catch (err) {
        console.error("Failed to sync save to server:", err);
        // Note: We don't revert the optimistic update - localStorage still has the change
      }
    }
  }, [savedProviderIds, session?.user]);

  // Handle location autocomplete selection
  const handleLocationChange = (value: string, loc?: { city: string; state: string }) => {
    setLocation(value);
    if (loc) {
      setSelectedLocation({ city: loc.city, state: loc.state });
    } else {
      setSelectedLocation(null);
    }
  };

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
        {/* Compact Filter Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 py-3">
            {/* Primary Filter Row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Location Input with Autocomplete */}
              <div className="w-44 sm:w-52">
                <LocationAutocomplete
                  value={location}
                  onChange={handleLocationChange}
                  placeholder="City, State"
                  className="w-full"
                  inputClassName="py-2 text-sm"
                  size="default"
                />
              </div>

              {/* Primary Filter - Care Type */}
              {PRIMARY_FILTER_CONFIGS.map((filter) => (
                <select
                  key={filter.id}
                  value={filterValues[filter.id] || ""}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                    filterValues[filter.id]
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-300 bg-white text-gray-700"
                  }`}
                >
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ))}

              {/* More Filters Button */}
              <button
                onClick={() => setShowMoreFilters(!showMoreFilters)}
                className={`flex items-center gap-1 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  showMoreFilters || filterValues.rating || filterValues.payment || filterValues.careService
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Filters
                {(filterValues.rating || filterValues.payment || filterValues.careService) && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">
                    {[filterValues.rating, filterValues.payment, filterValues.careService].filter(Boolean).length}
                  </span>
                )}
              </button>

              {/* Clear All */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Clear
                </button>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Sort */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white text-gray-700"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Secondary Filters (Expandable) */}
            {showMoreFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                {SECONDARY_FILTER_CONFIGS.map((filter) => (
                  <select
                    key={filter.id}
                    value={filterValues[filter.id] || ""}
                    onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                    className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                      filterValues[filter.id]
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-300 bg-white text-gray-700"
                    }`}
                  >
                    {filter.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results Header */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            {/* Title Row */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                {location && (
                  <p className="text-sm text-gray-500 mt-1">
                    Showing care providers near {location}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
              {/* Map Toggle (mobile) */}
              <button
                onClick={() => setShowMap(!showMap)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                {showMap ? "Hide Map" : "Show Map"}
              </button>
              </div>
            </div>

            {/* Quick Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500 mr-1">Quick filters:</span>
              {QUICK_FILTERS.map((quickFilter) => {
                const isActive = Object.entries(quickFilter.filter).some(
                  ([key, value]) => filterValues[key] === value
                );
                return (
                  <button
                    key={quickFilter.id}
                    onClick={() => {
                      if (isActive) {
                        // Remove the filter
                        const newValues = { ...filterValues };
                        Object.keys(quickFilter.filter).forEach((key) => {
                          newValues[key] = "";
                        });
                        setFilterValues(newValues);
                      } else {
                        // Apply the filter
                        setFilterValues({
                          ...filterValues,
                          ...quickFilter.filter,
                        });
                      }
                    }}
                    className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                      isActive
                        ? "bg-primary-600 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:border-primary-300 hover:text-primary-600"
                    }`}
                  >
                    {quickFilter.label}
                  </button>
                );
              })}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500">Active:</span>
                {location && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {location}
                    <button
                      onClick={() => setLocation("")}
                      className="ml-1 hover:text-primary-900"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {Object.entries(filterValues).map(([key, value]) => {
                  if (!value) return null;
                  const config = FILTER_CONFIGS.find((c) => c.id === key);
                  const option = config?.options.find((o) => o.value === value);
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                    >
                      {option?.label || value}
                      <button
                        onClick={() => handleFilterChange(key, "")}
                        className="ml-1 hover:text-primary-900"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  );
                })}
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <div className="flex gap-6">
            {/* Results */}
            <div className={`flex-1 ${showMap ? "lg:w-1/2" : "w-full"}`}>
              {loading ? (
                // Loading state
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
                // Results - list view
                <div className="space-y-4">
                  {/* Guidance Nudge */}
                  {providers.length >= 3 && (
                    <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-primary-800">
                          <span className="font-medium">Tip:</span> Meet with 3-5 providers to compare and find the best fit for your family.
                        </p>
                      </div>
                      <Link
                        href="/care-profile/edit"
                        className="shrink-0 text-sm font-medium text-primary-700 hover:text-primary-800"
                      >
                        Create profile
                      </Link>
                    </div>
                  )}

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
                      showSaveButton={true}
                      isSaved={savedProviderIds.has(provider.id)}
                      onSave={handleSaveProvider}
                    />
                  ))}
                </div>
              ) : (
                // Empty state - improved with more helpful messaging
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No providers found</h3>
                  <p className="text-gray-500 mb-2 max-w-md mx-auto">
                    We couldn&apos;t find any care providers matching your criteria.
                  </p>
                  <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
                    Try adjusting your filters, searching for a different location, or broadening your search.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={clearFilters}
                      className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Clear All Filters
                    </button>
                    <button
                      onClick={() => setLocation("")}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Search All Locations
                    </button>
                  </div>
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

      {/* Footer */}
      <Footer variant="light" />
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
