"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MainNav from "@/components/Navigation/MainNav";
import Footer from "@/components/Navigation/Footer";
import { LocationAutocomplete } from "@/components/Location";
import { formatProviderType } from "@/lib/comparisonUtils";

// Situational care entry cards — literal, unmistakable imagery for 65+ users
// Photos must instantly communicate the situation without reading
// Compact cards with minimal text for reduced cognitive load
const CARE_SITUATIONS = [
  {
    id: "help-at-home",
    name: "Help at Home",
    slug: "HOME_CARE",
    description: "Daily support in your home",
    // Caregiver or family member helping older adult at home - warm, domestic, non-clinical
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=400&h=300&fit=crop&crop=faces",
    fallbackColor: "bg-primary-50",
  },
  {
    id: "after-hospital",
    name: "After a Hospital Stay",
    slug: "REHABILITATION",
    description: "Rehab and recovery help",
    // Physical therapist helping elderly patient with exercises - clearly rehab
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=faces",
    fallbackColor: "bg-teal-50",
  },
  {
    id: "memory-concerns",
    name: "Memory Concerns",
    slug: "MEMORY_CARE",
    description: "Specialized memory care",
    // Older adult in caring conversation with family member - human, reassuring
    image: "https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=400&h=300&fit=crop&crop=faces",
    fallbackColor: "bg-amber-50",
  },
  {
    id: "planning-ahead",
    name: "Planning Ahead",
    slug: "ASSISTED_LIVING",
    description: "Explore options early",
    // Person reviewing documents/laptop - calm planning and research
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop&crop=faces",
    fallbackColor: "bg-sky-50",
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
        // Only fetch providers with photos for homepage (polished experience)
        const res = await fetch("/api/providers?limit=4&sortBy=rating_high&hasPhotos=true");
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
            image: (p.coverPhoto as string) || (p.photos as string[])?.[0] || "/placeholder-facility.svg",
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

    router.push(`/browse?${params.toString()}`);
  };

  return (
    <>
      <MainNav hidden={showStickySearch} />

      {/* Hero — clear, calm, simple for 65+ families */}
      <section className="relative bg-white">
        <div className="relative max-w-7xl mx-auto px-6 pt-10 pb-6 lg:pt-16 lg:pb-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Hero text — observed for sticky trigger */}
            <div ref={heroTextRef}>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-5 leading-tight">
                Find Senior Care Near You
              </h1>

              <p className="text-xl text-gray-600 mb-6 leading-relaxed max-w-2xl mx-auto">
                Home care, assisted living, memory care, nursing homes, and more.
              </p>
            </div>

            {/* Search bar — becomes sticky when hero text scrolls out */}
            {/* Placeholder to prevent layout jump when form goes fixed */}
            {showStickySearch && <div style={{ height: searchBarHeight }} className="mb-8" />}

            <form
              ref={searchFormRef}
              onSubmit={handleSearch}
              className={`max-w-lg mx-auto transition-all duration-300 ${
                showStickySearch
                  ? 'fixed top-0 left-0 right-0 z-50 px-4 py-3'
                  : ''
              }`}
            >
              <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-2 ${
                showStickySearch ? 'max-w-md mx-auto shadow-xl' : ''
              }`}>
                <div className="flex items-center gap-2">
                  {/* Geolocation button - prominent, easy to discover */}
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          async (position) => {
                            try {
                              const res = await fetch(
                                `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
                              );
                              const data = await res.json();
                              const city = data.address?.city || data.address?.town || data.address?.village || "";
                              const state = data.address?.state || "";
                              if (city && state) {
                                setLocation(`${city}, ${state}`);
                                setSelectedLocation({ city, state });
                              }
                            } catch {
                              // Silently fail
                            }
                          },
                          () => {}
                        );
                      }
                    }}
                    className="p-3 text-primary-500 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-colors shrink-0 group"
                    title="Use my current location"
                    aria-label="Use my current location"
                  >
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>

                  {/* Location input */}
                  <div className="flex-1 py-2">
                    <LocationAutocomplete
                      value={location}
                      onChange={handleLocationChange}
                      placeholder="Enter your city or ZIP code"
                      showIcon={false}
                      inputClassName="!border-0 !p-0 !rounded-none focus:!ring-0 text-lg text-gray-900 placeholder:text-gray-400"
                      className="w-full"
                    />
                  </div>

                  {/* Get Started Button */}
                  <button
                    type="submit"
                    className="px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shrink-0"
                  >
                    <span>Get Started</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Dual-path guidance + Situation cards */}
      <section className="pt-4 pb-8 bg-white">
        <div className="max-w-2xl mx-auto px-6">
          {/* "Or" divider with guidance text */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-gray-600 text-base font-medium">or tell us what brings you here</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Situation cards — compact, accessible layout with text below images */}
          <div className="grid grid-cols-2 gap-3">
            {CARE_SITUATIONS.map((situation) => (
              <Link
                key={situation.id}
                href={`/browse?type=${situation.slug}`}
                className="group block rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-200"
              >
                {/* Image container - 2:1 aspect ratio for compact view */}
                <div className={`aspect-[2/1] overflow-hidden ${situation.fallbackColor}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={situation.image}
                    alt={situation.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Text area below image - minimal, scannable */}
                <div className="p-2.5">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors leading-tight">
                    {situation.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">
                    {situation.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Local Care Options — featured providers */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Explore Local Care Options
            </h2>
          </div>

          {loadingProviders ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse rounded-xl border border-gray-100 overflow-hidden bg-white">
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
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all bg-white"
                >
                  {/* Provider image */}
                  <div className="relative h-40 bg-gray-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={provider.image}
                      alt={provider.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-facility.svg";
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

      {/* How It Works — Search, Schedule, Compare */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
              How it works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "Search your area",
                description: "See nearby providers with photos, reviews, and prices.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
              },
              {
                title: "Talk to providers",
                description: "Book tours or calls to ask questions and confirm fit.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ),
              },
              {
                title: "Start care",
                description: "Choose the provider that works best for your needs.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-base text-gray-600 leading-relaxed max-w-xs mx-auto">{item.description}</p>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Free consultations and tours</h3>
              <p className="text-base text-gray-600">
                Talk directly with providers to get pricing and care details.
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
