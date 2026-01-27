"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MainNav from "@/components/Navigation/MainNav";
import Footer from "@/components/Navigation/Footer";
import { LocationAutocomplete } from "@/components/Location";
import { formatProviderType } from "@/lib/comparisonUtils";

// Care services options for search
const CARE_SERVICE_OPTIONS = [
  { value: "", label: "Any service" },
  { value: "COMPANION_CARE", label: "Companion Care" },
  { value: "PERSONAL_CARE", label: "Personal Care" },
  { value: "SKILLED_NURSING", label: "Skilled Nursing" },
  { value: "MEMORY_CARE", label: "Memory Care" },
  { value: "HOSPICE_CARE", label: "Hospice Care" },
  { value: "RESPITE_CARE", label: "Respite Care" },
  { value: "LIVE_IN_CARE", label: "Live-in Care" },
];

// Situational care entry cards
const CARE_TYPES = [
  {
    id: "help-at-home",
    name: "Help at Home",
    slug: "HOME_CARE",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: "after-hospital",
    name: "After a Hospital Stay",
    slug: "REHABILITATION",
    color: "bg-green-50 text-green-600 border-green-100",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    id: "memory-concerns",
    name: "Memory Concerns",
    slug: "MEMORY_CARE",
    color: "bg-purple-50 text-purple-600 border-purple-100",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    id: "planning-ahead",
    name: "Planning Ahead",
    slug: "ASSISTED_LIVING",
    color: "bg-primary-50 text-primary-600 border-primary-100",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "long-term-care",
    name: "Long-term Options",
    slug: "NURSING_HOME",
    color: "bg-red-50 text-red-600 border-red-100",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: "end-of-life",
    name: "Comfort Care",
    slug: "HOSPICE",
    color: "bg-amber-50 text-amber-600 border-amber-100",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

// Featured provider type for display
interface FeaturedProvider {
  id: string;
  name: string;
  type: string;
  typeLabel: string;
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  image: string;
  priceFrom?: number;
}

export default function Home() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{ city: string; state: string } | null>(null);
  const [careType, setCareType] = useState("");
  const [careService, setCareService] = useState("");
  const [featuredProviders, setFeaturedProviders] = useState<FeaturedProvider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [providersError, setProvidersError] = useState(false);

  // Sticky search: observe hero text (h1 + subtitle) to trigger sticky mode
  const [showStickySearch, setShowStickySearch] = useState(false);
  const [searchBarHeight, setSearchBarHeight] = useState(0);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const searchFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const heroText = heroTextRef.current;
    if (!heroText) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickySearch(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(heroText);
    return () => observer.disconnect();
  }, []);

  // Measure search bar height for placeholder
  useEffect(() => {
    const form = searchFormRef.current;
    if (!form) return;
    const measure = () => setSearchBarHeight(form.offsetHeight);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Fetch featured providers on mount
  useEffect(() => {
    const fetchFeaturedProviders = async () => {
      try {
        const res = await fetch("/api/providers?limit=4&sortBy=rating");
        if (res.ok) {
          const data = await res.json();
          const providers = (data.providers || []).slice(0, 4).map((p: Record<string, unknown>) => ({
            id: p.id as string,
            name: p.name as string,
            type: p.providerType as string,
            typeLabel: formatProviderType(p.providerType as string),
            city: p.city as string,
            state: p.state as string,
            rating: (p.averageRating as number) || 4.5,
            reviewCount: (p.reviewCount as number) || 0,
            image: (p.coverPhoto as string) || (p.photos as string[])?.[0] || "/placeholder-facility.jpg",
            priceFrom: (p.priceMin as number) || (p.privateRoomMin as number) || undefined,
          }));
          setFeaturedProviders(providers);
        }
      } catch (err) {
        console.error("Failed to fetch featured providers:", err);
        setProvidersError(true);
      } finally {
        setLoadingProviders(false);
      }
    };

    fetchFeaturedProviders();
  }, []);

  const handleLocationChange = (value: string, loc?: { city: string; state: string }) => {
    setLocation(value);
    if (loc) {
      setSelectedLocation({ city: loc.city, state: loc.state });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (selectedLocation) {
      params.set("city", selectedLocation.city);
      params.set("state", selectedLocation.state);
    } else if (location) {
      const parts = location.split(",").map((s) => s.trim());
      if (parts.length >= 2) {
        params.set("city", parts[0]);
        params.set("state", parts[1]);
      } else {
        params.set("city", location);
      }
    }

    if (careType) params.set("type", careType);
    if (careService) params.set("care", careService);

    router.push(`/browse?${params.toString()}`);
  };

  return (
    <>
      <MainNav hidden={showStickySearch} />

      {/* Hero — clear, calm, simple for 65+ families */}
      <section className="relative bg-white overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6 pt-14 pb-10 lg:pt-24 lg:pb-14">
          <div className="max-w-3xl mx-auto text-center">
            {/* Hero text — observed for sticky trigger */}
            <div ref={heroTextRef}>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-5 leading-tight">
                Find Senior Care Near You
              </h1>

              <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                Home care, assisted living, memory care, nursing homes, and more.
              </p>
            </div>

            {/* Search bar — becomes sticky when hero text scrolls out */}
            {/* Placeholder to prevent layout jump when form goes fixed */}
            {showStickySearch && <div style={{ height: searchBarHeight }} className="mb-8" />}

            <form
              ref={searchFormRef}
              onSubmit={handleSearch}
              className={`max-w-3xl mx-auto mb-8 transition-all duration-300 ${
                showStickySearch
                  ? 'fixed top-0 left-0 right-0 z-50 px-4 py-3'
                  : ''
              }`}
            >
              <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-2 ${
                showStickySearch ? 'max-w-3xl mx-auto shadow-xl border-gray-200' : ''
              }`}>
                <div className="flex flex-col md:flex-row md:items-stretch md:divide-x divide-gray-200">
                  {/* Location */}
                  <div className="flex-1 px-4 py-3">
                    <label className={`block text-xs font-semibold text-gray-500 mb-1.5 text-left ${showStickySearch ? 'sr-only' : ''}`}>Where</label>
                    <LocationAutocomplete
                      value={location}
                      onChange={handleLocationChange}
                      placeholder="Enter city"
                      showIcon={false}
                      inputClassName="!border-0 !p-0 !rounded-none focus:!ring-0 text-base h-6 leading-6 text-gray-900 placeholder:text-gray-400"
                      className="w-full"
                    />
                  </div>

                  {/* Provider Type */}
                  <div className="flex-1 px-4 py-3">
                    <label className={`block text-xs font-semibold text-gray-500 mb-1.5 text-left ${showStickySearch ? 'sr-only' : ''}`}>Type of Care</label>
                    <select
                      value={careType}
                      onChange={(e) => setCareType(e.target.value)}
                      className="w-full h-6 text-gray-900 focus:outline-none text-base leading-6 bg-transparent appearance-none cursor-pointer"
                    >
                      <option value="">Any type</option>
                      {CARE_TYPES.map((type) => (
                        <option key={type.id} value={type.slug}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Care Services */}
                  <div className="flex-1 px-4 py-3">
                    <label className={`block text-xs font-semibold text-gray-500 mb-1.5 text-left ${showStickySearch ? 'sr-only' : ''}`}>Care Services</label>
                    <select
                      value={careService}
                      onChange={(e) => setCareService(e.target.value)}
                      className="w-full h-6 text-gray-900 focus:outline-none text-base leading-6 bg-transparent appearance-none cursor-pointer"
                    >
                      {CARE_SERVICE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Search Button */}
                  <div className="px-2 py-2 md:py-0 flex items-center">
                    <button
                      type="submit"
                      className="w-full md:w-auto px-7 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-base"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>Search</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Verified providers</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span>Real reviews</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Every Type of Senior Care — real featured providers */}
      <section className="pt-8 pb-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Explore Every Type of Senior Care
            </h2>
          </div>

          {loadingProviders ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse rounded-xl border border-gray-100 overflow-hidden">
                  <div className="h-40 bg-gray-200" />
                  <div className="p-4">
                    <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : providersError || featuredProviders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Unable to load featured providers right now.</p>
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
              >
                Browse All Providers
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProviders.map((provider) => (
                <Link
                  key={provider.id}
                  href={`/providers/${provider.id}`}
                  className="group rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all bg-white"
                >
                  {/* Provider image */}
                  <div className="relative h-40 bg-gray-100 overflow-hidden">
                    <img
                      src={provider.image}
                      alt={provider.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-facility.jpg";
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="inline-block px-2.5 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 rounded-lg">
                        {provider.typeLabel}
                      </span>
                    </div>
                  </div>

                  {/* Provider info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-base group-hover:text-primary-600 transition-colors mb-1 line-clamp-1">
                      {provider.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {provider.city}, {provider.state}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">{provider.rating.toFixed(1)}</span>
                        {provider.reviewCount > 0 && (
                          <span className="text-sm text-gray-400">({provider.reviewCount})</span>
                        )}
                      </div>
                      {provider.priceFrom && (
                        <span className="text-sm text-gray-500">
                          From ${provider.priceFrom.toLocaleString()}/mo
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-base"
            >
              View all providers
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* What best describes your situation? */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
              What best describes your situation?
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CARE_TYPES.map((type) => (
              <Link
                key={type.id}
                href={`/browse?type=${type.slug}`}
                className="group p-5 bg-white rounded-xl border border-gray-200 hover:border-primary-200 hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${type.color} border transition-transform group-hover:scale-105`}>
                  {type.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {type.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Not sure where to start? */}
      <section className="py-12 bg-primary-50 border-y border-primary-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Not sure where to start?
              </h2>
              <p className="text-gray-600 text-base">
                Answer a few simple questions and we&apos;ll help you choose a provider.
              </p>
            </div>
            <Link
              href="/care-profile/edit"
              className="shrink-0 px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all text-base"
            >
              Help me choose
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works — Search, Schedule, Compare */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
              How it works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Search your area",
                description: "Type your city and see nearby providers with photos, reviews, and prices.",
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
              },
              {
                step: "2",
                title: "Schedule meetings",
                description: "Book tours, video calls, or consultations directly with providers.",
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                step: "3",
                title: "Compare and choose",
                description: "Visit your favorites and pick the best fit for your loved one.",
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-base text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Olera Is Different — 3 core differentiators */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Why Olera is different
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* No spam. No pressure. */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center shadow-sm">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No spam. No pressure.</h3>
              <p className="text-base text-gray-600">
                Your information is only shared with providers you choose.
              </p>
            </div>

            {/* Book meetings directly */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center shadow-sm">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Book meetings directly</h3>
              <p className="text-base text-gray-600">
                Schedule tours or calls directly with providers to compare options.
              </p>
            </div>

            {/* Help paying for care */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center shadow-sm">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Help paying for care</h3>
              <p className="text-base text-gray-600">
                Find benefits and resources to make care more affordable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Become a Provider */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Become a Provider
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {/* Free visibility */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="w-10 h-10 bg-primary-900 rounded-xl flex items-center justify-center text-primary-400 mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Free visibility to families</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Families can find and learn about you at no cost.
              </p>
            </div>

            {/* Flat membership */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="w-10 h-10 bg-primary-900 rounded-xl flex items-center justify-center text-primary-400 mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Flat membership to engage</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                One simple price. No per-lead fees. No surprises.
              </p>
            </div>

            {/* Hiring marketplace */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="w-10 h-10 bg-primary-900 rounded-xl flex items-center justify-center text-primary-400 mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Hiring marketplace</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Facilities and agencies find staff.
                Local caregivers find work.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/for-providers"
              className="px-6 py-3.5 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors text-base text-center"
            >
              Learn more
            </Link>
            <Link
              href="/signup?intent=provider"
              className="px-6 py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors text-base text-center"
            >
              List yourself
            </Link>
          </div>
        </div>
      </section>

      <Footer variant="dark" />
    </>
  );
}
