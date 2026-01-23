"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import MainNav from "@/components/Navigation/MainNav";
import { ProviderCard } from "@/components/Cards";
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

// Filter configurations
const FILTER_CONFIGS: FilterConfig[] = [
  {
    id: "providerType",
    label: "Provider Type",
    options: [
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
    ],
  },
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
      { value: "insurance", label: "Long-term Care Insurance" },
    ],
  },
  {
    id: "careService",
    label: "Care Service",
    options: [
      { value: "", label: "All Care Services" },
      { value: "COMPANION_CARE", label: "Companion Care" },
      { value: "PERSONAL_CARE", label: "Personal Care" },
      { value: "SKILLED_NURSING", label: "Skilled Nursing" },
      { value: "MEMORY_CARE", label: "Memory Care" },
      { value: "HOSPICE_CARE", label: "Hospice Care" },
      { value: "RESPITE_CARE", label: "Respite Care" },
      { value: "LIVE_IN_CARE", label: "Live-in Care" },
    ],
  },
];

// Sort options
const SORT_OPTIONS = [
  { value: "", label: "Recommended" },
  { value: "rating_high", label: "Highest Rated" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

// View mode type
type ViewMode = "list" | "grid";

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [showMap, setShowMap] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

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

      // Parse location into city and state
      if (location) {
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
  }, [location, filterValues, sortBy]);

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

  const hasActiveFilters = location || Object.values(filterValues).some((v) => v !== "");

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
        <FilterBar
          showLocationFilter={true}
          location={location}
          onLocationChange={setLocation}
          locationPlaceholder="City, State (e.g. San Diego, CA)"
          filters={FILTER_CONFIGS}
          values={filterValues}
          onFilterChange={handleFilterChange}
          showSort={true}
          sortOptions={SORT_OPTIONS}
          sortValue={sortBy}
          onSortChange={setSortBy}
          onClearAll={clearFilters}
          hasActiveFilters={hasActiveFilters}
          sticky={true}
        />

        {/* Results Header */}
        <div className="max-w-7xl mx-auto px-4 py-4">
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
              {/* View Toggle */}
              <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  title="List view"
                  aria-label="Switch to list view"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  title="Grid view"
                  aria-label="Switch to grid view"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>

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
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <div className="flex gap-6">
            {/* Results */}
            <div className={`flex-1 ${showMap ? "lg:w-1/2" : "w-full"}`}>
              {loading ? (
                // Loading state - adapts to view mode
                viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                        <div className="h-48 bg-gray-200" />
                        <div className="p-5">
                          <div className="h-3 bg-gray-200 rounded w-1/4 mb-2" />
                          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                          <div className="h-4 bg-gray-200 rounded w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
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
                )
              ) : providers.length > 0 ? (
                // Results - grid or list view
                viewMode === "grid" ? (
                  <div className={`grid gap-4 ${showMap ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}>
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
                        variant="vertical"
                      />
                    ))}
                  </div>
                ) : (
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
                )
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
