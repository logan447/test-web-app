"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import MainNav from "@/components/Navigation/MainNav";

type Provider = {
  id: string;
  name: string;
  providerType: string;
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
};

const PROVIDER_TYPES = [
  { value: "", label: "All Types" },
  { value: "ASSISTED_LIVING", label: "Assisted Living" },
  { value: "MEMORY_CARE", label: "Memory Care" },
  { value: "HOME_CARE", label: "Home Care" },
  { value: "NURSING_HOME", label: "Nursing Home" },
  { value: "HOSPICE", label: "Hospice" },
  { value: "RESPITE_CARE", label: "Respite Care" },
  { value: "INDEPENDENT_CAREGIVER", label: "Independent Caregiver" },
];

const US_STATES = [
  "", "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [state, setState] = useState(searchParams.get("state") || "");
  const [providerType, setProviderType] = useState(searchParams.get("type") || "");
  const [careType, setCareType] = useState(searchParams.get("careType") || "");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchProviders();
  }, []);

  // Re-fetch when URL params change
  useEffect(() => {
    const newCity = searchParams.get("city") || "";
    const newState = searchParams.get("state") || "";
    const newType = searchParams.get("type") || "";
    const newCareType = searchParams.get("careType") || "";

    setCity(newCity);
    setState(newState);
    setProviderType(newType);
    setCareType(newCareType);

    fetchProviders(newCity, newState, newType, newCareType);
  }, [searchParams]);

  const fetchProviders = async (
    filterCity = city,
    filterState = state,
    filterType = providerType,
    filterCareType = careType
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCity) params.append("city", filterCity);
      if (filterState) params.append("state", filterState);
      if (filterType) params.append("providerType", filterType);
      if (filterCareType) params.append("careType", filterCareType);
      params.append("sortBy", sortBy);
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
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (state) params.set("state", state);
    if (providerType) params.set("type", providerType);
    if (careType) params.set("careType", careType);
    router.push(`/browse?${params.toString()}`);
    fetchProviders();
  };

  const handleClearFilters = () => {
    setCity("");
    setState("");
    setProviderType("");
    setCareType("");
    router.push("/browse");
    fetchProviders("", "", "", "");
  };

  const formatProviderType = (type: string) => {
    return type
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatPrice = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}/mo`;
    if (min) return `From $${min.toLocaleString()}/mo`;
    if (max) return `Up to $${max.toLocaleString()}/mo`;
    return null;
  };

  const hasActiveFilters = city || state || providerType || careType;

  return (
    <>
      <MainNav />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Browse Care Providers</h1>
                <p className="text-gray-600 mt-1">
                  {loading ? "Searching..." : `${totalCount} providers found`}
                </p>
              </div>
              <Link
                href="/"
                className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Any city"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Any</option>
                  {US_STATES.filter(s => s).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider Type</label>
                <select
                  value={providerType}
                  onChange={(e) => setProviderType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {PROVIDER_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Search
              </button>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : providers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <Link
                  key={provider.id}
                  href={`/providers/${provider.id}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200">
                    {provider.coverPhoto || provider.photos?.[0] ? (
                      <img
                        src={provider.coverPhoto || provider.photos[0]}
                        alt={provider.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-16 h-16 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}
                    {/* Type Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
                        {formatProviderType(provider.providerType)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                        {provider.name}
                      </h3>
                      {provider.averageRating && provider.averageRating > 0 && (
                        <div className="flex items-center gap-1 text-sm shrink-0">
                          <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                          <span className="font-medium">{provider.averageRating.toFixed(1)}</span>
                          <span className="text-gray-400">({provider.reviewCount})</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      {provider.city}, {provider.state}
                    </p>

                    {provider.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {provider.description}
                      </p>
                    )}

                    {/* Price & Care Types */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      {formatPrice(provider.priceMin, provider.priceMax) ? (
                        <span className="text-sm font-medium text-gray-900">
                          {formatPrice(provider.priceMin, provider.priceMax)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Contact for pricing</span>
                      )}
                      {provider.careTypesOffered.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {provider.careTypesOffered.length} service{provider.careTypesOffered.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No providers found</h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search filters or browse all providers.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    }>
      <BrowseContent />
    </Suspense>
  );
}
