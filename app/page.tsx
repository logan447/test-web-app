"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import MainNav from "@/components/Navigation/MainNav";
import HeroSection from "@/components/Directory/HeroSection";
import CategoryCards from "@/components/Directory/CategoryCards";
import EnhancedProviderCard from "@/components/Directory/EnhancedProviderCard";
import ProviderCardSkeleton from "@/components/Loading/ProviderCardSkeleton";
import FiltersBar from "@/components/Directory/FiltersBar";
import ActiveFilters from "@/components/Directory/ActiveFilters";
import ResultsHeader from "@/components/Directory/ResultsHeader";
import EmptyState from "@/components/Directory/EmptyState";
import ErrorState from "@/components/Directory/ErrorState";
import TrustFooter from "@/components/Directory/TrustFooter";
import ScrollToTop from "@/components/Directory/ScrollToTop";
import ModeSelectionModal from "@/components/Onboarding/ModeSelectionModal";

// Dynamic import for MapView to avoid SSR issues
const MapView = dynamic(() => import("@/components/Directory/MapView"), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  ),
});

type Provider = {
  id: string;
  name: string;
  providerType: string;
  city: string;
  state: string;
  zipCode: string;
  address: string;
  description: string | null;
  careTypesOffered: string[];
  licensed: boolean;
  insuranceVerified: boolean;
  backgroundChecked: boolean;
  certifications: string[];
  averageRating: number | null;
  reviewCount: number;
  priceMin: number | null;
  priceMax: number | null;
  availableSpots: number | null;
  totalCapacity: number | null;
  photos: string[];
  coverPhoto: string | null;
  latitude: number | null;
  longitude: number | null;
  verified: boolean;
  hasMemoryCare: boolean;
  hasRespiteCare: boolean;
  hasHospiceCare: boolean;
};

export default function Home() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [matchedProviders, setMatchedProviders] = useState<Provider[]>([]);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [providerType, setProviderType] = useState("");
  const [careType, setCareType] = useState("");
  const [requestedProviderIds, setRequestedProviderIds] = useState<Map<string, string>>(new Map());

  // Mode selection for new users
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // Advanced filters
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(15000);
  const [minRating, setMinRating] = useState<number>(0);
  const [availability, setAvailability] = useState<string>("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [insurance, setInsurance] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);

  // Sort option
  const [sortBy, setSortBy] = useState<string>("newest");

  // View toggle (list/map)
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Check if user is brand new (needs mode selection)
  useEffect(() => {
    if (status === 'authenticated' && session) {
      checkIfNewUser();
    }
  }, [status, session]);

  const checkIfNewUser = async () => {
    try {
      const response = await fetch('/api/profile/completion-status');
      if (response.ok) {
        const data = await response.json();
        // If profile doesn't exist at all, user is brand new
        if (data.missingFields && data.missingFields.includes('Profile not created')) {
          setIsNewUser(true);
          setShowModeSelection(true);
        }
      }
    } catch (error) {
      console.error('Error checking if new user:', error);
    }
  };

  const handleModeSelect = async (mode: 'family' | 'provider') => {
    // Set the mode in the database
    try {
      const selectedMode = mode === 'family' ? 'FAMILY' : 'PROVIDER';

      await fetch('/api/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: selectedMode }),
      });

      // Close modal and update state
      setShowModeSelection(false);
      setIsNewUser(false);

      // Update the NextAuth session with the new activeMode
      await update({ activeMode: selectedMode });

      // Redirect to dashboard - session is now updated
      router.push('/dashboard');
    } catch (error) {
      console.error('Error setting mode:', error);
    }
  };

  useEffect(() => {
    fetchProviders();
    if (session) {
      fetchSentRequests();
      fetchMatches();
    } else {
      setMatchesLoading(false);
    }
  }, [session]);

  const fetchProviders = async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (city) params.append("city", city);
      if (state) params.append("state", state);
      if (providerType) params.append("providerType", providerType);
      if (careType) params.append("careType", careType);

      // Advanced filters
      if (priceMin > 0) params.append("priceMin", priceMin.toString());
      if (priceMax < 15000) params.append("priceMax", priceMax.toString());
      if (minRating > 0) params.append("minRating", minRating.toString());
      if (availability) params.append("availability", availability);
      if (amenities.length > 0) params.append("amenities", amenities.join(","));
      if (insurance.length > 0) params.append("insurance", insurance.join(","));
      if (languages.length > 0) params.append("languages", languages.join(","));

      // Sort option
      if (sortBy) params.append("sortBy", sortBy);

      const response = await fetch(`/api/providers?${params.toString()}`);
      const data = await response.json();

      // Handle API errors gracefully
      if (response.ok && Array.isArray(data)) {
        setProviders(data);
        setError(false);
      } else {
        console.error("Failed to fetch providers:", data);
        setProviders([]);
        setError(true);
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
      setProviders([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const response = await fetch('/api/requests?type=sent');
      if (response.ok) {
        const requests = await response.json();
        // Build a map from providerId to requestId
        const providerMap = new Map<string, string>();
        requests.forEach((req: any) => {
          if (req.provider?.id) {
            providerMap.set(req.provider.id, req.id);
          }
        });
        setRequestedProviderIds(providerMap);
      }
    } catch (error) {
      console.error('Error fetching sent requests:', error);
    }
  };

  const fetchMatches = async () => {
    setMatchesLoading(true);
    try {
      // First, get the family's care profile
      const profileResponse = await fetch('/api/care-profiles');
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.profile && profileData.profile.careType && profileData.profile.careType.length > 0) {
          setHasProfile(true);

          // Fetch matched providers
          const matchResponse = await fetch('/api/matching/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              city: profileData.profile.city,
              careTypes: profileData.profile.careType,
            }),
          });

          if (matchResponse.ok) {
            const matchData = await matchResponse.json();
            setMatchedProviders(matchData.matches || []);
          }
        } else {
          setHasProfile(false);
        }
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setMatchesLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProviders();
  };

  const formatProviderType = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const handleHeroSearch = (heroCity: string, heroState: string, heroCareType: string) => {
    setCity(heroCity);
    setState(heroState);
    setCareType(heroCareType);
    // Trigger search after state update
    setTimeout(() => fetchProviders(), 0);
  };

  const handleCategoryClick = (selectedProviderType: string) => {
    // Clear other filters and set the selected provider type
    setSearch("");
    setCity("");
    setState("");
    setProviderType(selectedProviderType);
    setCareType("");
    // Trigger search after state update
    setTimeout(() => fetchProviders(), 0);
    // Scroll to results
    window.scrollTo({ top: 800, behavior: "smooth" });
  };

  // Advanced filter handlers
  const handleApplyFilters = () => {
    fetchProviders();
  };

  const handleClearAllFilters = () => {
    setSearch("");
    setCity("");
    setState("");
    setProviderType("");
    setCareType("");
    setPriceMin(0);
    setPriceMax(15000);
    setMinRating(0);
    setAvailability("");
    setAmenities([]);
    setInsurance([]);
    setLanguages([]);
    setSortBy("newest");
    setTimeout(() => fetchProviders(), 0);
  };

  const handleRemovePriceFilter = () => {
    setPriceMin(0);
    setPriceMax(15000);
    setTimeout(() => fetchProviders(), 0);
  };

  const handleRemoveRatingFilter = () => {
    setMinRating(0);
    setTimeout(() => fetchProviders(), 0);
  };

  const handleRemoveAvailabilityFilter = () => {
    setAvailability("");
    setTimeout(() => fetchProviders(), 0);
  };

  const handleRemoveAmenity = (amenity: string) => {
    setAmenities(amenities.filter((a) => a !== amenity));
    setTimeout(() => fetchProviders(), 0);
  };

  const handleRemoveInsurance = (ins: string) => {
    setInsurance(insurance.filter((i) => i !== ins));
    setTimeout(() => fetchProviders(), 0);
  };

  const handleRemoveLanguage = (lang: string) => {
    setLanguages(languages.filter((l) => l !== lang));
    setTimeout(() => fetchProviders(), 0);
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setTimeout(() => fetchProviders(), 0);
  };

  // Check if any filters are active
  const hasActiveFilters = Boolean(
    search ||
    city ||
    state ||
    providerType ||
    careType ||
    priceMin > 0 ||
    priceMax < 15000 ||
    minRating > 0 ||
    availability ||
    amenities.length > 0 ||
    insurance.length > 0 ||
    languages.length > 0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      {/* Hero Section */}
      <HeroSection
        onSearch={handleHeroSearch}
        initialCity={city}
        initialState={state}
        initialCareType={careType}
        totalProviders={1000}
      />

      {/* Category Cards */}
      {!loading && providers.length === 0 && !search && !city && !state && !providerType && !careType && (
        <CategoryCards onCategoryClick={handleCategoryClick} />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Basic Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Keywords
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Provider name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g., CA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider Type
                </label>
                <select
                  value={providerType}
                  onChange={(e) => setProviderType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Types</option>
                  <option value="HOME_CARE">Home Care</option>
                  <option value="HOME_HEALTH">Home Health</option>
                  <option value="ASSISTED_LIVING">Assisted Living</option>
                  <option value="INDEPENDENT_LIVING">Independent Living</option>
                  <option value="MEMORY_CARE">Memory Care</option>
                  <option value="NURSING_HOME">Nursing Home</option>
                  <option value="HOSPICE">Hospice</option>
                  <option value="REHABILITATION">Rehabilitation</option>
                  <option value="INDEPENDENT_CAREGIVER">Independent Caregiver</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Care Type
                </label>
                <select
                  value={careType}
                  onChange={(e) => setCareType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Care Types</option>
                  <option value="COMPANION_CARE">Companion Care</option>
                  <option value="PERSONAL_CARE">Personal Care</option>
                  <option value="SKILLED_NURSING">Skilled Nursing</option>
                  <option value="MEMORY_CARE">Memory Care</option>
                  <option value="HOSPICE_CARE">Hospice Care</option>
                  <option value="RESPITE_CARE">Respite Care</option>
                  <option value="LIVE_IN_CARE">Live-In Care</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-smooth font-medium"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-smooth font-medium"
              >
                Clear All
              </button>
            </div>
          </form>
        </div>

        {/* Two-column layout: Filters + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar: Filters */}
          <div className="lg:col-span-1">
            <FiltersBar
              priceMin={priceMin}
              priceMax={priceMax}
              minRating={minRating}
              availability={availability}
              amenities={amenities}
              insurance={insurance}
              languages={languages}
              onPriceChange={(min, max) => {
                setPriceMin(min);
                setPriceMax(max);
              }}
              onRatingChange={setMinRating}
              onAvailabilityChange={setAvailability}
              onAmenitiesChange={setAmenities}
              onInsuranceChange={setInsurance}
              onLanguagesChange={setLanguages}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearAllFilters}
            />
          </div>

          {/* Right Column: Results Header + Active Filters + Results */}
          <div className="lg:col-span-3">
            {/* Results Header - Only show when there are results */}
            {!loading && !error && providers.length > 0 && (
              <ResultsHeader
                count={providers.length}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            )}

            {/* Active Filters */}
            <ActiveFilters
              priceMin={priceMin}
              priceMax={priceMax}
              minRating={minRating}
              availability={availability}
              amenities={amenities}
              insurance={insurance}
              languages={languages}
              onRemovePriceFilter={handleRemovePriceFilter}
              onRemoveRatingFilter={handleRemoveRatingFilter}
              onRemoveAvailabilityFilter={handleRemoveAvailabilityFilter}
              onRemoveAmenity={handleRemoveAmenity}
              onRemoveInsurance={handleRemoveInsurance}
              onRemoveLanguage={handleRemoveLanguage}
              onClearAll={handleClearAllFilters}
            />

            {/* Your Matches Section */}
            {session && hasProfile && !matchesLoading && matchedProviders.length > 0 && (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6 mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <h2 className="text-xl font-bold text-indigo-900">
                      Your Matches ({matchedProviders.length})
                    </h2>
                  </div>
                  <p className="text-sm text-indigo-800">
                    These providers match your care needs and are located in your area
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {matchedProviders.slice(0, 6).map((provider) => {
                    const requestId = requestedProviderIds.get(provider.id);
                    const linkHref = requestId ? `/dashboard/requests/${requestId}` : `/providers/${provider.id}`;

                    return (
                      <EnhancedProviderCard
                        key={provider.id}
                        provider={provider}
                        linkHref={linkHref}
                        hasRequestSent={!!requestId}
                      />
                    );
                  })}
                </div>

                {matchedProviders.length > 6 && (
                  <div className="text-center mb-8">
                    <button
                      onClick={() => {
                        // Show all matches by scrolling to the "All Providers" section
                        window.scrollTo({ top: document.getElementById('all-providers')?.offsetTop || 0, behavior: 'smooth' });
                      }}
                      className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                    >
                      View all {matchedProviders.length} matches →
                    </button>
                  </div>
                )}

                <div className="border-t-2 border-gray-200 my-8"></div>

                <h2 className="text-xl font-bold text-gray-900 mb-4" id="all-providers">
                  All Providers
                </h2>
              </div>
            )}

            {/* Results */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <ProviderCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <ErrorState onRetry={fetchProviders} />
            ) : providers.length === 0 ? (
              <EmptyState
                hasActiveFilters={hasActiveFilters}
                onClearFilters={handleClearAllFilters}
              />
            ) : viewMode === "map" ? (
              <MapView providers={providers} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers
                  .filter(p => {
                    // Filter out matched providers to avoid duplicates
                    if (session && hasProfile && matchedProviders.length > 0) {
                      return !matchedProviders.some(mp => mp.id === p.id);
                    }
                    return true;
                  })
                  .map((provider) => {
                    const requestId = requestedProviderIds.get(provider.id);
                    const linkHref = requestId ? `/dashboard/requests/${requestId}` : `/providers/${provider.id}`;

                    return (
                      <EnhancedProviderCard
                        key={provider.id}
                        provider={provider}
                        linkHref={linkHref}
                        hasRequestSent={!!requestId}
                      />
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Trust Footer */}
      <TrustFooter />

      {/* Scroll to Top Button */}
      <ScrollToTop />

      {/* Mode Selection Modal for new users */}
      <ModeSelectionModal
        isOpen={showModeSelection}
        onSelectMode={handleModeSelect}
      />
    </div>
  );
}
