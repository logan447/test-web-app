"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
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

const PROVIDER_TYPES = [
  { value: "", label: "All Care Types" },
  { value: "HOME_CARE", label: "Home Care (Non-medical)" },
  { value: "HOME_CARE_MEDICAL", label: "Home Care (Medical)" },
  { value: "ASSISTED_LIVING", label: "Assisted Living" },
  { value: "MEMORY_CARE", label: "Memory Care" },
  { value: "NURSING_HOME", label: "Nursing Home" },
  { value: "HOSPICE", label: "Hospice" },
  { value: "INDEPENDENT_LIVING", label: "Independent Living" },
  { value: "INDEPENDENT_CAREGIVER", label: "Independent Caregiver" },
];

// City descriptions for SEO
const CITY_DESCRIPTIONS: Record<string, string> = {
  Houston: "Houston, Texas, is located near Galveston Bay and the Gulf of Mexico, and it serves as the seat and largest city of Harris County. It is the principal city of the Greater Houston metropolitan area, which is the fifth-most populous metropolitan statistical area in the United States and the second-most populous in Texas after Dallas-Fort Worth.",
  Dallas: "Dallas is a major city in Texas and is the cultural and economic hub of the Dallas-Fort Worth metropolitan area, the fourth largest metropolitan area in the United States.",
  Austin: "Austin is the capital city of Texas and serves as the cultural and economic center of the Austin-Round Rock metropolitan statistical area, which is the 28th most populous metropolitan area in the United States.",
  "San Antonio": "San Antonio is a major city in south-central Texas with a rich colonial heritage. It's home to the Alamo, an 18th-century Spanish mission preserved as a museum.",
};

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showMap, setShowMap] = useState(true);

  // Filters
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [state, setState] = useState(searchParams.get("state") || "TX");
  const [providerType, setProviderType] = useState(searchParams.get("type") || "");
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);

  // Get display label for provider type
  const selectedTypeLabel = useMemo(() => {
    const found = PROVIDER_TYPES.find((t) => t.value === providerType);
    return found ? found.label : "All Care Types";
  }, [providerType]);

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    const newCity = searchParams.get("city") || "";
    const newState = searchParams.get("state") || "TX";
    const newType = searchParams.get("type") || "";

    setCity(newCity);
    setState(newState);
    setProviderType(newType);

    fetchProviders(newCity, newState, newType);
  }, [searchParams]);

  const fetchProviders = async (
    filterCity = city,
    filterState = state,
    filterType = providerType
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCity) params.append("city", filterCity);
      if (filterState) params.append("state", filterState);
      if (filterType) params.append("providerType", filterType);
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
    router.push(`/browse?${params.toString()}`);
  };

  const handleClearLocation = () => {
    setCity("");
    const params = new URLSearchParams();
    if (state) params.set("state", state);
    if (providerType) params.set("type", providerType);
    router.push(`/browse?${params.toString()}`);
    fetchProviders("", state, providerType);
  };

  const handleTypeSelect = (value: string) => {
    setProviderType(value);
    setTypeDropdownOpen(false);
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (state) params.set("state", state);
    if (value) params.set("type", value);
    router.push(`/browse?${params.toString()}`);
    fetchProviders(city, state, value);
  };

  const formatProviderType = (type: string) => {
    const found = PROVIDER_TYPES.find((t) => t.value === type);
    if (found) return found.label;
    return type
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatPrice = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    if (min && max) return `$${min}–$${max} / hr`;
    if (min) return `From $${min} / hr`;
    if (max) return `Up to $${max} / hr`;
    return null;
  };

  // Build breadcrumb
  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...(providerType ? [{ label: formatProviderType(providerType), href: `/browse?type=${providerType}` }] : []),
    ...(state ? [{ label: state, href: `/browse?state=${state}${providerType ? `&type=${providerType}` : ""}` }] : []),
    ...(city ? [{ label: city, href: null }] : []),
  ];

  // Get city description
  const cityDescription = city ? CITY_DESCRIPTIONS[city] || null : null;

  // Build SEO title
  const seoTitle = city && providerType
    ? `Best ${formatProviderType(providerType)} near me in ${city}, ${state}`
    : city
    ? `Best Senior Care near me in ${city}, ${state}`
    : providerType
    ? `Best ${formatProviderType(providerType)} in ${state}`
    : `Browse Senior Care Providers in ${state}`;

  // Providers with coordinates for map
  const mappableProviders = providers.filter((p) => p.latitude && p.longitude);

  return (
    <>
      <MainNav />

      <div className="min-h-screen bg-white">
        {/* Header with Breadcrumb and Filters */}
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm mb-4">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {breadcrumbs.map((crumb, idx) => (
                <span key={idx} className="flex items-center gap-2">
                  {idx > 0 && <span className="text-gray-400">›</span>}
                  {crumb.href ? (
                    <Link href={crumb.href} className="text-primary-600 hover:underline">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-gray-900">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Care Type Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-full font-medium text-sm hover:bg-primary-700 transition-colors"
                >
                  {selectedTypeLabel}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {typeDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setTypeDropdownOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                      {PROVIDER_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => handleTypeSelect(type.value)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                            providerType === type.value ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-700"
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Location Input */}
              <div className="relative flex-1 max-w-xs">
                <input
                  type="text"
                  value={city ? `${city}, ${state}` : ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    const parts = val.split(",").map((s) => s.trim());
                    setCity(parts[0] || "");
                    if (parts[1]) setState(parts[1]);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Enter city, state"
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                />
                {city && (
                  <button
                    onClick={handleClearLocation}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Map Toggle (mobile) */}
              <button
                onClick={() => setShowMap(!showMap)}
                className="lg:hidden px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {showMap ? "Hide Map" : "Show Map"}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* SEO Title and Description */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{seoTitle}</h1>
            {cityDescription && (
              <div className="text-gray-600 text-sm">
                <p className={showFullDescription ? "" : "line-clamp-2"}>
                  {cityDescription}
                </p>
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-primary-600 hover:text-primary-700 font-medium mt-1 flex items-center gap-1"
                >
                  {showFullDescription ? "Show less" : "Read more"}
                  <svg
                    className={`w-4 h-4 transition-transform ${showFullDescription ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Split Layout: Results + Map */}
          <div className="flex gap-6">
            {/* Results List */}
            <div className={`flex-1 ${showMap ? "lg:w-1/2" : "w-full"}`}>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                      <div className="flex gap-4">
                        <div className="w-60 h-44 bg-gray-200 rounded-lg shrink-0"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : providers.length > 0 ? (
                <div className="space-y-4">
                  {providers.map((provider) => (
                    <div
                      key={provider.id}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row">
                        {/* Image */}
                        <div className="relative sm:w-60 h-48 sm:h-auto shrink-0">
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
                            <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Verified
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4 flex flex-col">
                          {/* Address */}
                          <p className="text-sm text-gray-500 mb-1">
                            {provider.address}, {provider.city} {provider.state}
                          </p>

                          {/* Name + Save */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {provider.name}
                            </h3>
                            <button className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </button>
                          </div>

                          {/* Care Type Tag */}
                          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full mb-3 w-fit">
                            {formatProviderType(provider.providerType)}
                          </span>

                          {/* Description */}
                          {provider.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                              {provider.description}
                            </p>
                          )}

                          {/* Price and Rating */}
                          <div className="flex items-center justify-between mt-auto mb-4">
                            <div>
                              <p className="text-xs text-gray-500">Estimated Pricing</p>
                              <p className="font-semibold text-gray-900">
                                {formatPrice(provider.priceMin, provider.priceMax) || "Contact for pricing"}
                              </p>
                            </div>
                            {provider.averageRating && provider.averageRating > 0 && (
                              <div className="flex items-center gap-1">
                                <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                </svg>
                                <span className="text-xl font-bold text-gray-900">{provider.averageRating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>

                          {/* CTA Button */}
                          <Link
                            href={`/providers/${provider.id}`}
                            target="_blank"
                            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white text-center font-semibold rounded-lg transition-colors"
                          >
                            Go to provider page
                          </Link>
                        </div>
                      </div>
                    </div>
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
                    onClick={() => {
                      setCity("");
                      setProviderType("");
                      router.push("/browse");
                      fetchProviders("", state, "");
                    }}
                    className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            {/* Map */}
            {showMap && (
              <div className="hidden lg:block lg:w-1/2 h-[calc(100vh-200px)] sticky top-24 rounded-xl overflow-hidden border border-gray-200">
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      }
    >
      <BrowseContent />
    </Suspense>
  );
}
