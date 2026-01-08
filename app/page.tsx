"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import MainNav from "@/components/Navigation/MainNav";
import HeroSection from "@/components/Directory/HeroSection";
import CategoryCards from "@/components/Directory/CategoryCards";
import EnhancedProviderCard from "@/components/Directory/EnhancedProviderCard";
import ProviderCardSkeleton from "@/components/Loading/ProviderCardSkeleton";

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
  const { data: session } = useSession();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [providerType, setProviderType] = useState("");
  const [careType, setCareType] = useState("");
  const [requestedProviderIds, setRequestedProviderIds] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    fetchProviders();
    if (session) {
      fetchSentRequests();
    }
  }, [session]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (city) params.append("city", city);
      if (state) params.append("state", state);
      if (providerType) params.append("providerType", providerType);
      if (careType) params.append("careType", careType);

      const response = await fetch(`/api/providers?${params.toString()}`);
      const data = await response.json();

      // Handle API errors gracefully
      if (response.ok && Array.isArray(data)) {
        setProviders(data);
      } else {
        console.error("Failed to fetch providers:", data);
        setProviders([]);
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
      setProviders([]);
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
        {/* Advanced Filters (Collapsible) */}
        <details className="bg-white rounded-lg shadow mb-8">
          <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-900 hover:text-primary-600 transition-smooth flex items-center justify-between">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Advanced Filters
            </span>
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>

          <div className="px-6 pb-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Keywords
                  </label>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Provider name or keywords..."
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
                    placeholder="e.g., CA, NY"
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
                  className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-smooth"
                >
                  Apply Filters
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCity("");
                    setState("");
                    setProviderType("");
                    setCareType("");
                    fetchProviders();
                  }}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-smooth"
                >
                  Clear All
                </button>
              </div>
            </form>
          </div>
        </details>

        {/* Results */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ProviderCardSkeleton key={i} />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 mb-4">No providers found. Try adjusting your search criteria.</p>
            <Link
              href="/dashboard"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => {
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

        {providers.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Showing {providers.length} provider{providers.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
