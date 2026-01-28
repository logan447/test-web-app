"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import Footer from "@/components/Navigation/Footer";
import { ProviderCard } from "@/components/Cards";
import { LocationAutocomplete } from "@/components/Location";
import WelcomeBanner from "@/components/Provider/WelcomeBanner";
import { useSavedProviders } from "@/hooks/useSavedProviders";
import AuthModal from "@/components/Auth/AuthModal";
import SignOutModal from "@/components/Auth/SignOutModal";
import NotificationDropdown from "@/components/Navigation/NotificationDropdown";
import { showToast } from "@/lib/toast";

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
  availableSpots?: number | null;
  paymentModesAccepted?: string[];
};

// All category filter buttons (shown in expanded toolbar — no "More" dropdown)
const ALL_CARE_CATEGORIES = [
  { label: "Home Care", type: "HOME_CARE" },
  { label: "Assisted Living", type: "ASSISTED_LIVING" },
  { label: "Memory Care", type: "MEMORY_CARE" },
  { label: "Nursing Homes", type: "NURSING_HOME" },
  { label: "Independent Living", type: "INDEPENDENT_LIVING" },
  { label: "Rehab", type: "REHABILITATION" },
  { label: "Hospice", type: "HOSPICE" },
  { label: "Private Caregivers", type: "INDEPENDENT_CAREGIVER" },
];

// Care services for search bar
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

// Sort options (filter modal)
const SORT_OPTIONS = [
  { value: "", label: "Recommended" },
  { value: "rating_high", label: "Highest Rated" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

// Rating options (filter modal)
const RATING_OPTIONS = [
  { value: "", label: "Any Rating" },
  { value: "4.5", label: "4.5+ Stars" },
  { value: "4", label: "4+ Stars" },
  { value: "3.5", label: "3.5+ Stars" },
  { value: "3", label: "3+ Stars" },
];

// Payment options (filter modal)
const PAYMENT_OPTIONS = [
  { value: "", label: "Any Payment" },
  { value: "private_pay", label: "Private Pay" },
  { value: "medicaid", label: "Medicaid" },
  { value: "medicare", label: "Medicare" },
  { value: "insurance", label: "Long-term Insurance" },
];

// Provider type options for search bar select
const PROVIDER_TYPE_OPTIONS = [
  { value: "", label: "Any type" },
  { value: "HOME_CARE", label: "Home Care" },
  { value: "HOME_HEALTH", label: "Home Health" },
  { value: "ASSISTED_LIVING", label: "Assisted Living" },
  { value: "MEMORY_CARE", label: "Memory Care" },
  { value: "NURSING_HOME", label: "Nursing Home" },
  { value: "HOSPICE", label: "Hospice" },
  { value: "INDEPENDENT_LIVING", label: "Independent Living" },
  { value: "REHABILITATION", label: "Rehabilitation" },
  { value: "INDEPENDENT_CAREGIVER", label: "Caregiver" },
];

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, update: updateSession } = useSession();

  // Auth & save state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<"login" | "signup">("signup");
  const [authIntent, setAuthIntent] = useState<"provider" | "family" | undefined>(undefined);
  const [authProviderSubtype, setAuthProviderSubtype] = useState<"organization" | "individual" | undefined>(undefined);
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);
  const { isSaved, toggleSave } = useSavedProviders({
    onAuthRequired: () => setAuthModalOpen(true),
  });

  // Hamburger menu state
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [switchingMode, setSwitchingMode] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [providerType, setProviderType] = useState<string | null>(null);

  // Toolbar state
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Helper functions for initial state
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

  // Data & filter state
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [showMap, setShowMap] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<{ city: string; state: string } | null>(getInitialSelectedLocation());
  const [location, setLocation] = useState(getInitialLocation());
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    providerType: searchParams.get("type") || "",
    rating: searchParams.get("rating") || "",
    payment: searchParams.get("payment") || "",
    careService: searchParams.get("care") || "",
  });
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "");
  const [showWelcome, setShowWelcome] = useState(false);

  // Welcome param
  const isWelcome = searchParams.get("welcome") === "true";

  useEffect(() => {
    if (isWelcome && !loading) {
      setShowWelcome(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("welcome");
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
    }
  }, [isWelcome, loading]);

  // Auto-expand search when arriving from situation cards (has type but no location)
  // This provides continuity from homepage selection and prompts for location entry
  const arrivedFromSituationCard = searchParams.get("type") && !searchParams.get("city") && !searchParams.get("location");
  const [shouldAutoFocus, setShouldAutoFocus] = useState(!!arrivedFromSituationCard);

  // Detect arrival from homepage search bar (has location but no type selected)
  // These users need gentle visual guidance toward the care category options
  const arrivedFromHomepageSearch = (searchParams.get("city") || searchParams.get("location")) && !searchParams.get("type");
  const [showCategoryAnimation, setShowCategoryAnimation] = useState(!!arrivedFromHomepageSearch);

  useEffect(() => {
    if (arrivedFromSituationCard) {
      setSearchExpanded(true);
    }
  }, [arrivedFromSituationCard]);

  // Auto-expand search and trigger category animation for homepage search arrivals
  useEffect(() => {
    if (arrivedFromHomepageSearch) {
      setSearchExpanded(true);
      // Clear animation state after it completes (animation duration + buffer)
      const timer = setTimeout(() => {
        setShowCategoryAnimation(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [arrivedFromHomepageSearch]);

  // Fetch provider type for hamburger menu
  useEffect(() => {
    if (!session) return;
    const fetchProviderProfile = async () => {
      try {
        const response = await fetch("/api/providers/me");
        if (response.ok) {
          const provider = await response.json();
          setProviderType(provider.providerType);
        }
      } catch (error) {
        console.error("Error fetching provider profile:", error);
      }
    };
    fetchProviderProfile();
  }, [session]);

  // Fetch unread count
  useEffect(() => {
    if (!session) return;
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch("/api/notifications/unread-count");
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.total || 0);
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [session]);

  // Close hamburger on outside click
  useEffect(() => {
    if (!hamburgerOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-hamburger-menu]")) {
        setHamburgerOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [hamburgerOpen]);

  // Close expanded toolbar on outside click
  useEffect(() => {
    if (!searchExpanded) return;
    const handleClick = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setSearchExpanded(false);
      }
    };
    // Delay to avoid catching the focus click itself
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClick);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClick);
    };
  }, [searchExpanded]);

  // Mode switching handler
  const handleModeSwitch = async (newMode: "FAMILY" | "PROVIDER") => {
    if (switchingMode) return;
    setSwitchingMode(true);
    try {
      const response = await fetch("/api/user/mode", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: newMode }),
      });
      if (!response.ok) throw new Error("Failed to switch mode");
      const result = await response.json();
      await updateSession({ activeMode: newMode });
      showToast.success(`Switched to ${newMode === "PROVIDER" ? "Provider" : "Family"} mode`);
      if (newMode === "PROVIDER" && !providerType) {
        router.push("/provider/leads?onboarding=true&intent=provider");
        return;
      }
      router.push(result.data.landingPage);
    } catch (error) {
      console.error("MODE SWITCH ERROR:", error);
      showToast.error("Failed to switch mode. Please try again.");
    } finally {
      setSwitchingMode(false);
    }
  };

  const triggerProviderOnboarding = (subtype?: "individual" | "organization") => {
    setAuthIntent("provider");
    setAuthProviderSubtype(subtype);
    setAuthModalView("signup");
    setAuthModalOpen(true);
  };

  const currentMode = session?.user?.activeMode || "FAMILY";
  const isProviderMode = currentMode === "PROVIDER";

  // Fetch providers
  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
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
      showToast.error("Unable to load providers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [location, selectedLocation, filterValues, sortBy]);

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

  // Handlers
  const handleFilterChange = (filterId: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [filterId]: value }));
  };

  const handleCategoryClick = (type: string) => {
    // Toggle: if already selected, deselect; otherwise select
    handleFilterChange("providerType", filterValues.providerType === type ? "" : type);
  };

  const clearFilters = () => {
    setLocation("");
    setSelectedLocation(null);
    setFilterValues({ providerType: "", rating: "", payment: "", careService: "" });
    setSortBy("");
  };

  const clearAdvancedFilters = () => {
    setFilterValues({ providerType: "", rating: "", payment: "", careService: "" });
    setSortBy("");
  };

  const handleLocationChange = (value: string, loc?: { city: string; state: string }) => {
    setLocation(value);
    setSelectedLocation(loc ? { city: loc.city, state: loc.state } : null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchExpanded(false);
    // Fetching is automatic via useEffect when state changes
  };

  // Derived values
  const hasActiveFilters = Boolean(location) || Object.values(filterValues).some((v) => v !== "") || Boolean(sortBy);
  const advancedFilterCount = [...Object.values(filterValues), sortBy].filter(Boolean).length;
  const mappableProviders = providers.filter((p) => p.latitude && p.longitude);

  const locationLabel = location || "the United States";
  const resultTitle = loading
    ? `Care providers in ${locationLabel}`
    : `${totalCount} care provider${totalCount !== 1 ? "s" : ""} in ${locationLabel}`;

  return (
    <>
      {/* Overlay when search is expanded */}
      {searchExpanded && (
        <div
          className="fixed inset-0 bg-black/20 z-30 transition-opacity"
          onClick={() => setSearchExpanded(false)}
        />
      )}

      {/* Sticky Browse Toolbar */}
      <div ref={toolbarRef} className="bg-white border-b border-gray-200 sticky top-0 z-40">
        {/* Expanded state: top bar (logo + categories + hamburger) + full search card */}
        <div className={`transition-all duration-300 ease-in-out ${
          searchExpanded ? "max-h-[280px] opacity-100 overflow-visible" : "max-h-0 opacity-0 overflow-hidden"
        }`}>
          {/* Top bar: Logo + category buttons + hamburger */}
          <div className="max-w-7xl mx-auto px-4 pt-3 pb-1">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/olera-logo.jpg" alt="" className="w-7 h-7" aria-hidden="true" />
                <span className="text-xl font-bold text-gray-900 hidden sm:inline">Olera</span>
              </Link>

              {/* Category buttons — centered in remaining space */}
              <div className="flex-1 flex items-center justify-center gap-1 flex-wrap overflow-hidden">
                {ALL_CARE_CATEGORIES.map((cat, index) => (
                  <button
                    key={cat.type}
                    onClick={() => {
                      handleCategoryClick(cat.type);
                      setShowCategoryAnimation(false);
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
                      filterValues.providerType === cat.type
                        ? "bg-primary-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    } ${showCategoryAnimation ? "category-highlight-animation" : ""}`}
                    style={showCategoryAnimation ? { animationDelay: `${index * 120}ms` } : undefined}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Hamburger pill */}
              <div className="relative shrink-0" data-hamburger-menu>
                <button
                  onClick={() => setHamburgerOpen(!hamburgerOpen)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-full hover:shadow-md transition-all"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <div className="w-7 h-7 bg-gray-400 rounded-full flex items-center justify-center">
                    {session ? (
                      <span className="text-xs font-medium text-white">
                        {session.user?.name?.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Full search bar (location-only, matching homepage) */}
          <div className="max-w-lg mx-auto px-4 pt-2 pb-3">
            <form onSubmit={handleSearch}>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
                <div className="flex items-center gap-2">
                  {/* Location icon */}
                  <div className="p-3 text-primary-500 shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>

                  {/* Location input with Zillow-style dropdown */}
                  <div className="flex-1 min-w-0 py-2">
                    <LocationAutocomplete
                      value={location}
                      onChange={handleLocationChange}
                      placeholder="Enter your city or ZIP code"
                      showIcon={false}
                      showCurrentLocation={true}
                      autoFocus={shouldAutoFocus}
                      inputClassName="!border-0 !p-0 !rounded-none focus:!ring-0 focus:!outline-none !shadow-none text-lg text-gray-900 placeholder:text-gray-400 truncate search-input-clean"
                      className="w-full"
                      onFocus={() => setShouldAutoFocus(false)}
                    />
                  </div>

                  {/* Search Button */}
                  <button
                    type="submit"
                    className="px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 whitespace-nowrap"
                  >
                    <span>Search</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Collapsed toolbar row: logo + condensed search bar (centered) + Filters + hamburger */}
        <div className={`transition-all duration-300 ease-in-out ${
          searchExpanded ? "max-h-0 opacity-0 overflow-hidden" : "max-h-20 opacity-100"
        }`}>
          <div className="max-w-7xl mx-auto px-4 py-2.5">
            <div className="relative flex items-center gap-3">
              {/* Logo — left */}
              <Link href="/" className="flex items-center gap-2 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/olera-logo.jpg" alt="" className="w-7 h-7" aria-hidden="true" />
                <span className="text-xl font-bold text-gray-900 hidden sm:inline">Olera</span>
              </Link>

              {/* Search bar + Filters — absolutely centered on desktop */}
              <div className="flex-1 lg:flex-none lg:absolute lg:left-1/2 lg:-translate-x-1/2 flex items-center gap-2 min-w-0 lg:min-w-[400px] lg:max-w-[480px]">
                <button
                  type="button"
                  onClick={() => setSearchExpanded(true)}
                  className="flex-1 min-w-0 flex items-center gap-1 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer pl-1.5 pr-1.5 py-1.5"
                >
                  <div className="p-2 text-primary-500 shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className={`flex-1 min-w-0 py-1.5 pr-2 text-sm font-medium truncate text-left ${location ? 'text-gray-800' : 'text-gray-500'}`}>
                    {location || "Enter city or ZIP code"}
                  </span>
                  <div className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 text-sm whitespace-nowrap">
                    <span>Search</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>

                {/* Filters pill — only visible in collapsed state */}
                <button
                  onClick={() => setFilterModalOpen(true)}
                  className={`flex items-center gap-2 px-4 py-2.5 border rounded-full text-sm font-medium transition-colors shrink-0 ${
                    advancedFilterCount > 0
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <span className="hidden sm:inline">Filters</span>
                  {advancedFilterCount > 0 && (
                    <span className="bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {advancedFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Right side — Become a provider + Hamburger */}
              <div className="hidden lg:block flex-1" />
              <Link
                href="/for-providers"
                className="hidden md:block text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors shrink-0"
              >
                Become a provider
              </Link>

              {/* Hamburger pill */}
              <div className="relative shrink-0" data-hamburger-menu>
              <button
                onClick={() => setHamburgerOpen(!hamburgerOpen)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-full hover:shadow-md transition-all"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <div className="w-7 h-7 bg-gray-400 rounded-full flex items-center justify-center">
                  {session ? (
                    <span className="text-xs font-medium text-white">
                      {session.user?.name?.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  )}
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount > 9 ? "!" : unreadCount}
                  </span>
                )}
              </button>

              {/* Hamburger dropdown */}
              {hamburgerOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-xl border border-gray-100 py-2 z-50">
                  {session ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{session.user?.name}</p>
                        <p className="text-xs text-gray-500 break-words">{session.user?.email}</p>
                        <div className="mt-1.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            isProviderMode ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                          }`}>
                            {isProviderMode ? "Provider Mode" : "Family Mode"}
                          </span>
                        </div>
                      </div>

                      {isProviderMode ? (
                        <>
                          {providerType ? (
                            <>
                              <Link href="/provider/leads" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>Leads</Link>
                              <Link href="/provider/requests" className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>
                                <span>Requests</span>
                                {unreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{unreadCount > 9 ? "9+" : unreadCount}</span>}
                              </Link>
                              <Link href="/provider/profile" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>My Profile</Link>
                              <div className="border-t border-gray-100 my-1" />
                              {providerType === "INDEPENDENT_CAREGIVER" ? (
                                <>
                                  <Link href="/providers/browse-organizations" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>Find Organizations</Link>
                                  <Link href="/provider/opportunities" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>My Opportunities</Link>
                                </>
                              ) : (
                                <>
                                  <Link href="/provider/hire-staff" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>Hire Care Staff</Link>
                                  <Link href="/provider/candidates" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>My Candidates</Link>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <Link href="/provider/leads" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>Leads</Link>
                              <Link href="/provider/requests" className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>
                                <span>Requests</span>
                                {unreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{unreadCount > 9 ? "9+" : unreadCount}</span>}
                              </Link>
                              <Link href="/provider/profile" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>My Profile</Link>
                              <div className="border-t border-gray-100 my-1" />
                              <Link href="/provider/hire-staff" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>Hire Care Staff</Link>
                              <button onClick={() => { setHamburgerOpen(false); triggerProviderOnboarding("individual"); }} className="block w-full text-left px-4 py-2.5 text-sm text-primary-600 hover:bg-gray-50 font-medium">Become a Caregiver</button>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <Link href="/browse" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>Browse Providers</Link>
                          <Link href="/saved" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>Saved</Link>
                          <Link href="/matches" className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>
                            <span>Matches</span>
                            {unreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{unreadCount > 9 ? "9+" : unreadCount}</span>}
                          </Link>
                          <Link href="/care-profile" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>Care Profile</Link>
                          <Link href="/benefits" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>Benefits</Link>
                        </>
                      )}

                      <div className="border-t border-gray-100 my-1" />
                      {isProviderMode ? (
                        <button onClick={() => { handleModeSwitch("FAMILY"); setHamburgerOpen(false); }} disabled={switchingMode} className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                          {switchingMode ? "Switching..." : "Switch to Family Mode"}
                        </button>
                      ) : (
                        <button onClick={() => { handleModeSwitch("PROVIDER"); setHamburgerOpen(false); }} disabled={switchingMode} className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                          {switchingMode ? "Switching..." : "Switch to Provider Mode"}
                        </button>
                      )}
                      <Link href="/settings" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>Settings</Link>
                      <div className="border-t border-gray-100 my-1" />
                      <button onClick={() => { setHamburgerOpen(false); setSignOutModalOpen(true); }} className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Log out</button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setHamburgerOpen(false); triggerProviderOnboarding("organization"); }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        List your organization
                      </button>
                      <button
                        onClick={() => { setHamburgerOpen(false); triggerProviderOnboarding("individual"); }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Find caregiver work
                      </button>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={() => { setHamburgerOpen(false); setAuthIntent("family"); setAuthProviderSubtype(undefined); setAuthModalView("signup"); setAuthModalOpen(true); }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Log in / Sign up
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Filter Modal */}
      {filterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFilterModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
              <div />
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button onClick={() => setFilterModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6 space-y-6 overflow-y-auto flex-1">
              {/* Type of Care */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Type of Care</h3>
                <div className="flex flex-wrap gap-2">
                  {PROVIDER_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleFilterChange("providerType", opt.value)}
                      className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-colors ${
                        filterValues.providerType === opt.value
                          ? "border-primary-600 bg-primary-600 text-white"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Care Services */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Care Services</h3>
                <div className="flex flex-wrap gap-2">
                  {CARE_SERVICE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleFilterChange("careService", opt.value)}
                      className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-colors ${
                        filterValues.careService === opt.value
                          ? "border-primary-600 bg-primary-600 text-white"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort by */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Sort by</h3>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-colors ${
                        sortBy === opt.value
                          ? "border-primary-600 bg-primary-600 text-white"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Rating</h3>
                <div className="flex flex-wrap gap-2">
                  {RATING_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleFilterChange("rating", opt.value)}
                      className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-colors ${
                        filterValues.rating === opt.value
                          ? "border-primary-600 bg-primary-600 text-white"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Payment</h3>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleFilterChange("payment", opt.value)}
                      className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-colors ${
                        filterValues.payment === opt.value
                          ? "border-primary-600 bg-primary-600 text-white"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
              <button
                onClick={clearAdvancedFilters}
                className="text-sm font-semibold text-gray-900 underline hover:no-underline"
              >
                Clear all
              </button>
              <button
                onClick={() => setFilterModalOpen(false)}
                className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                Show {totalCount} provider{totalCount !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50">
        {/* Welcome banner */}
        {showWelcome && (
          <div className="max-w-7xl mx-auto px-4 pt-4">
            <WelcomeBanner
              variant="family"
              isVisible={showWelcome}
              onDismiss={() => setShowWelcome(false)}
            />
          </div>
        )}

        {/* Results header + Filters */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-bold text-gray-900">
              {resultTitle}
            </h1>

            <div className="flex items-center gap-2 shrink-0">
              {/* Map toggle (mobile) */}
              <button
                onClick={() => setShowMap(!showMap)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                {showMap ? "Hide Map" : "Show Map"}
              </button>
            </div>
          </div>

          {/* Tip — inline, above results */}
          {!loading && providers.length >= 3 && (
            <p className="text-sm text-gray-500 mt-1">
              Meet with at least 5 providers to compare and find the best fit.
            </p>
          )}
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <div className="flex gap-6">
            {/* Results list */}
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
                        averageRating: provider.averageRating,
                        reviewCount: provider.reviewCount,
                        priceMin: provider.priceMin,
                        priceMax: provider.priceMax,
                        coverPhoto: provider.coverPhoto,
                        photos: provider.photos,
                        claimed: provider.claimed,
                        availableSpots: provider.availableSpots,
                        paymentModesAccepted: provider.paymentModesAccepted,
                        latitude: provider.latitude,
                        longitude: provider.longitude,
                      }}
                      variant="horizontal"
                      showSaveButton={true}
                      isSaved={isSaved(provider.id)}
                      onSave={toggleSave}
                    />
                  ))}
                </div>
              ) : (
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
                      onClick={() => { setLocation(""); setSelectedLocation(null); }}
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
              <div className="hidden lg:flex lg:flex-col lg:w-1/2 lg:gap-1.5 sticky top-20" style={{ height: "calc(100vh - 120px)" }}>
                <div className="flex-1 rounded-xl overflow-hidden border border-gray-200">
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
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer variant="light" />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => { setAuthModalOpen(false); setAuthIntent(undefined); setAuthProviderSubtype(undefined); }}
        defaultView={authModalView}
        intent={authIntent || "family"}
        providerSubtype={authProviderSubtype}
      />
      <SignOutModal
        isOpen={signOutModalOpen}
        onClose={() => setSignOutModalOpen(false)}
      />
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
