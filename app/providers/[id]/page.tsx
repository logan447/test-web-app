"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ProviderType } from "@prisma/client";
import Footer from "@/components/Navigation/Footer";
import Breadcrumb from "@/components/Navigation/Breadcrumb";
import AuthModal, { PendingAction } from "@/components/Auth/AuthModal";
import SignOutModal from "@/components/Auth/SignOutModal";
import ReviewModal from "@/components/Reviews/ReviewModal";
import ReviewsSection from "@/components/Reviews/ReviewsSection";
import ClaimProviderModal from "@/components/Provider/ClaimProviderModal";
import TakedownRequestModal from "@/components/Provider/TakedownRequestModal";
import ContactInfoDisplay from "@/components/Provider/ContactInfoDisplay";
import OleraScore from "@/components/Trust/OleraScore";
import { ViewerRole, EngagementStatus } from "@/lib/contactVisibility";
import { showToast } from "@/lib/toast";
import EngagementConfirmationModal from "@/components/Engagement/EngagementConfirmationModal";
import { useFamilyProfile, getEngagementType } from "@/hooks/useFamilyProfile";
import { useSavedProviders } from "@/hooks/useSavedProviders";
import { getProviderCTAs } from "@/lib/providerUtils";
import { useProviderIdentity } from "@/hooks/useProviderIdentity";
import ForOrganizationsSection from "@/components/Provider/ForOrganizationsSection";
import AvailabilitySection from "@/components/Provider/AvailabilitySection";
import { LocationAutocomplete } from "@/components/Location";

// All category filter buttons (matches /browse)
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

// Provider type categories
const FACILITY_TYPES = ["ASSISTED_LIVING", "MEMORY_CARE", "NURSING_HOME", "INDEPENDENT_LIVING", "REHABILITATION"];
const HOME_CARE_TYPES = ["HOME_CARE", "HOME_HEALTH", "HOSPICE"];

type Provider = {
  id: string;
  name: string;
  providerType: ProviderType;
  description: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  careTypesOffered: string[];
  licensed: boolean;
  licenseNumber: string | null;
  yearsInBusiness: number | null;
  capacity: number | null;
  serviceRadius: number | null;
  priceMin: number | null;
  priceMax: number | null;
  priceDescription: string | null;
  paymentOptions: string[];
  certifications: string[];
  insuranceVerified: boolean;
  backgroundChecked: boolean;
  totalCapacity: number | null;
  availableSpots: number | null;
  waitlistAvailable: boolean;
  photos: string[];
  coverPhoto: string | null;
  averageRating: number | null;
  reviewCount: number;
  roomFeatures: string[];
  commonAreas: string[];
  medicalServices: string[];
  activitiesOffered: string[];
  dietaryOptions: string[];
  staffToResidentRatio: string | null;
  hasRNOnSite: boolean;
  hasLVNOnSite: boolean;
  allStaffBackgroundChecked: boolean;
  visitingDoctorFrequency: string | null;
  caregiverTraining: string[];
  languagesSpoken: string[];
  latitude: number | null;
  longitude: number | null;
  neighborhoodDescription: string | null;
  nearbyAmenities: string[];
  hasMemoryCare: boolean;
  hasRespiteCare: boolean;
  hasHospiceCare: boolean;
  specialtyPrograms: string[];
  claimed?: boolean;
  verified?: boolean;
  // Caregiver work preferences (Sprint 5)
  workPreferences: string[];
  preferredEmployers: string[];
  availabilityStart: Date | null;
};

type ActiveEngagement = {
  id: string;
  status: EngagementStatus;
} | null;

type SimilarProvider = {
  id: string;
  name: string;
  providerType: ProviderType;
  city: string;
  state: string;
  priceMin: number | null;
  averageRating: number | null;
  reviewCount: number;
  coverPhoto: string | null;
  claimed: boolean;
};

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const { isSaved, toggleSave } = useSavedProviders();
  const [saving, setSaving] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<"login" | "signup">("signup");
  const [authIntent, setAuthIntent] = useState<"provider" | "family" | undefined>(undefined);
  const [authProviderSubtype, setAuthProviderSubtype] = useState<"organization" | "individual" | undefined>(undefined);
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | undefined>(undefined);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [takedownModalOpen, setTakedownModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [activeEngagement, setActiveEngagement] = useState<ActiveEngagement>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [questions, setQuestions] = useState<Array<{ id: string; content: string; likeCount: number; answer: string | null; answeredAt: string | null; createdAt: string; user: { name: string | null } }>>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const { getProfileSummary } = useFamilyProfile();

  // Similar providers
  const [similarProviders, setSimilarProviders] = useState<SimilarProvider[]>([]);

  // Sticky CTA bar visibility
  const [showStickyBar, setShowStickyBar] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // Photo tour overlay
  const [photoTourOpen, setPhotoTourOpen] = useState(false);

  // Toolbar state (matches /browse)
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [switchingMode, setSwitchingMode] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuProviderType, setMenuProviderType] = useState<string | null>(null);
  const [searchLocation, setSearchLocation] = useState("");
  const [searchProviderType, setSearchProviderType] = useState("");
  const [searchCareService, setSearchCareService] = useState("");
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Get provider identity for accurate viewer role derivation (only fetches if in provider mode)
  const { identity: providerIdentity } = useProviderIdentity({ checkMode: true });

  const [submitting, setSubmitting] = useState(false);

  /**
   * Derive viewer role for contact visibility.
   */
  const viewerRole = useMemo((): ViewerRole => {
    if (!session?.user) return 'anonymous';
    if (session.user.activeMode === 'FAMILY') return 'family';
    if (session.user.activeMode === 'PROVIDER' && providerIdentity?.type) {
      if (providerIdentity.type === 'INDEPENDENT_CAREGIVER') return 'individual_caregiver';
      return 'organization';
    }
    return 'organization';
  }, [session?.user?.activeMode, providerIdentity?.type]);

  // Toolbar effects (matches /browse)
  useEffect(() => {
    if (!session) return;
    const fetchProviderProfile = async () => {
      try {
        const response = await fetch("/api/providers/me");
        if (response.ok) {
          const p = await response.json();
          setMenuProviderType(p.providerType);
        }
      } catch (error) {
        console.error("Error fetching provider profile:", error);
      }
    };
    fetchProviderProfile();
  }, [session]);

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

  useEffect(() => {
    if (!searchExpanded) return;
    const handleClick = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setSearchExpanded(false);
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClick);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClick);
    };
  }, [searchExpanded]);

  // Show sticky CTA bar after scrolling past hero
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 0);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      if (newMode === "PROVIDER" && !menuProviderType) {
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

  const handleToolbarSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchExpanded(false);
    const params = new URLSearchParams();
    if (searchLocation) params.set("location", searchLocation);
    if (searchProviderType) params.set("type", searchProviderType);
    if (searchCareService) params.set("care", searchCareService);
    router.push(`/browse${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleToolbarCategoryClick = (type: string) => {
    router.push(`/browse?type=${type}`);
  };

  useEffect(() => {
    fetchProvider();
    fetchQuestions();
    if (session?.user) {
      checkActiveEngagement();
    }
  }, [session]);

  const fetchProvider = async () => {
    try {
      const response = await fetch(`/api/providers/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProvider(data);
      } else {
        showToast.error("Provider not found");
        router.push("/browse");
      }
    } catch (error) {
      console.error("Error fetching provider:", error);
      showToast.error("Unable to load provider. Please try again.");
      router.push("/browse");
    } finally {
      setLoading(false);
    }
  };

  // Fetch similar providers (same type + city, excluding current)
  useEffect(() => {
    if (!provider) return;
    const fetchSimilar = async () => {
      try {
        const searchParams = new URLSearchParams({
          providerType: provider.providerType,
          city: provider.city,
          state: provider.state,
          limit: "4",
        });
        const res = await fetch(`/api/providers?${searchParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          const providers = (data.providers || data || [])
            .filter((p: SimilarProvider) => p.id !== provider.id)
            .slice(0, 3);
          setSimilarProviders(providers);
        }
      } catch {
        // Non-critical
      }
    };
    fetchSimilar();
  }, [provider?.id, provider?.providerType, provider?.city, provider?.state]);

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`/api/providers/${params.id}/questions`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      }
    } catch {
      // Questions are non-critical; silently fail
    }
  };

  const handleSubmitQuestion = async () => {
    if (!session?.user) {
      setAuthModalOpen(true);
      return;
    }
    if (!newQuestion.trim() || newQuestion.trim().length < 5) {
      showToast.error("Question must be at least 5 characters.");
      return;
    }
    setSubmittingQuestion(true);
    try {
      const res = await fetch(`/api/providers/${params.id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newQuestion }),
      });
      if (res.ok) {
        setNewQuestion("");
        showToast.success("Question posted!");
        fetchQuestions();
      } else {
        const data = await res.json();
        showToast.error(data.error || "Failed to post question");
      }
    } catch {
      showToast.error("Failed to post question");
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const checkActiveEngagement = async () => {
    try {
      const response = await fetch(`/api/engagements/check?providerId=${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setActiveEngagement(data.activeEngagement);
      }
    } catch (error) {
      console.error('Error checking engagement:', error);
    }
  };

  const providerId = params.id as string;
  const isProviderSaved = isSaved(providerId);

  const handleSaveToggle = async () => {
    if (!session?.user) {
      setPendingAction({ type: 'save', providerId, providerName: provider?.name });
      setAuthModalOpen(true);
      return;
    }
    setSaving(true);
    try {
      await toggleSave(providerId);
      showToast.success(isProviderSaved ? 'Removed from saved' : 'Provider saved');
    } catch (error) {
      showToast.error('Failed to update saved status');
    } finally {
      setSaving(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      setPendingAction({
        type: 'contact',
        providerId: params.id as string,
        providerName: provider?.name,
      });
      setAuthModalOpen(true);
      return;
    }
    if (activeEngagement) {
      router.push(`/requests/${activeEngagement.id}`);
      return;
    }
    setConfirmModalOpen(true);
  };

  const handleConfirmedContactSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: params.id,
          message: 'I would like to learn more about your services.',
          contactReason: 'Request information',
        }),
      });
      if (response.ok) {
        const engagement = await response.json();
        showToast.success('Request sent! You\'ll hear back soon.');
        router.push(`/requests/${engagement.id}`);
      } else {
        throw new Error('Failed to send request');
      }
    } catch (error) {
      showToast.error('Failed to send request');
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const formatProviderType = (type: string) => {
    return type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
  };

  const allPhotos = provider ? [provider.coverPhoto, ...provider.photos].filter(Boolean) as string[] : [];

  const isFacility = provider ? FACILITY_TYPES.includes(provider.providerType) : false;
  const isHomeCare = provider ? HOME_CARE_TYPES.includes(provider.providerType) : false;
  const isCaregiver = provider?.providerType === 'INDEPENDENT_CAREGIVER';

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-2.5">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/olera-logo.jpg" alt="" className="w-7 h-7" aria-hidden="true" />
                <span className="text-xl font-bold text-gray-900 hidden sm:inline">Olera</span>
              </Link>
              <div className="flex-1" />
              <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="aspect-[16/9] md:aspect-[2.5/1] bg-gray-200 rounded-xl"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="h-20 bg-gray-200 rounded-xl"></div>
              <div className="h-20 bg-gray-200 rounded-xl"></div>
              <div className="h-20 bg-gray-200 rounded-xl"></div>
              <div className="h-20 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!provider) return null;

  const ctaLabel = activeEngagement
    ? (activeEngagement.status === 'PENDING' ? 'Check Status' : 'Go to Conversation')
    : getProviderCTAs(provider.providerType).primary;

  const priceUnit = (HOME_CARE_TYPES.includes(provider.providerType) || isCaregiver) ? 'hr' : 'mo';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Overlay when search is expanded */}
      {searchExpanded && (
        <div
          className="fixed inset-0 bg-black/20 z-30 transition-opacity"
          onClick={() => setSearchExpanded(false)}
        />
      )}

      {/* ===================== STICKY TOOLBAR ===================== */}
      <div ref={toolbarRef} className="bg-white border-b border-gray-200 sticky top-0 z-40">
        {/* Expanded state: top bar (logo + categories + hamburger) + full search card */}
        <div className={`transition-all duration-300 ease-in-out ${
          searchExpanded ? "max-h-[280px] opacity-100 overflow-visible" : "max-h-0 opacity-0 overflow-hidden"
        }`}>
          {/* Top bar: Logo + category buttons + hamburger */}
          <div className="max-w-7xl mx-auto px-4 pt-3 pb-1">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/olera-logo.jpg" alt="" className="w-7 h-7" aria-hidden="true" />
                <span className="text-xl font-bold text-gray-900 hidden sm:inline">Olera</span>
              </Link>
              <div className="flex-1 flex items-center justify-center gap-1 flex-wrap overflow-hidden">
                {ALL_CARE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.type}
                    onClick={() => handleToolbarCategoryClick(cat.type)}
                    className="px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap text-gray-700 hover:bg-gray-100"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
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

          {/* Full search bar */}
          <div className="max-w-3xl mx-auto px-4 pt-2 pb-3">
            <form onSubmit={handleToolbarSearch}>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
                <div className="flex flex-col md:flex-row md:items-stretch md:divide-x divide-gray-200">
                  <div className="flex-1 px-4 py-3">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 text-left">Where</label>
                    <LocationAutocomplete
                      value={searchLocation}
                      onChange={(value) => setSearchLocation(value)}
                      placeholder="Enter city"
                      showIcon={false}
                      inputClassName="!border-0 !p-0 !rounded-none focus:!ring-0 text-base h-6 leading-6 text-gray-900 placeholder:text-gray-400"
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1 px-4 py-3">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 text-left">Type of Care</label>
                    <select
                      value={searchProviderType}
                      onChange={(e) => setSearchProviderType(e.target.value)}
                      className={`w-full h-6 focus:outline-none text-base leading-6 bg-transparent appearance-none cursor-pointer ${searchProviderType ? 'text-gray-900' : 'text-gray-400'}`}
                    >
                      {PROVIDER_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 px-4 py-3">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 text-left">Care Services</label>
                    <select
                      value={searchCareService}
                      onChange={(e) => setSearchCareService(e.target.value)}
                      className={`w-full h-6 focus:outline-none text-base leading-6 bg-transparent appearance-none cursor-pointer ${searchCareService ? 'text-gray-900' : 'text-gray-400'}`}
                    >
                      {CARE_SERVICE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
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
          </div>
        </div>

        {/* Collapsed toolbar row */}
        <div className={`transition-all duration-300 ease-in-out ${
          searchExpanded ? "max-h-0 opacity-0 overflow-hidden" : "max-h-20 opacity-100"
        }`}>
          <div className="max-w-7xl mx-auto px-4 py-2.5">
            <div className="relative flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/olera-logo.jpg" alt="" className="w-7 h-7" aria-hidden="true" />
                <span className="text-xl font-bold text-gray-900 hidden sm:inline">Olera</span>
              </Link>
              <div className="flex-1 lg:flex-none lg:absolute lg:left-1/2 lg:-translate-x-1/2 flex items-center gap-2 min-w-0 lg:min-w-[540px] lg:max-w-[640px]">
                <button
                  type="button"
                  onClick={() => setSearchExpanded(true)}
                  className="flex-1 min-w-0 flex items-center bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex-1 min-w-0 flex items-center divide-x divide-gray-200">
                    <span className={`px-4 py-2.5 text-sm font-medium truncate flex-1 ${searchLocation ? 'text-gray-800' : 'text-gray-400'}`}>
                      {searchLocation || "Enter city"}
                    </span>
                    <span className={`hidden md:block px-4 py-2.5 text-sm font-medium truncate flex-1 ${searchProviderType ? 'text-gray-800' : 'text-gray-400'}`}>
                      {PROVIDER_TYPE_OPTIONS.find(o => o.value === searchProviderType)?.label || "Any type"}
                    </span>
                    <span className={`hidden lg:block px-4 py-2.5 text-sm font-medium truncate flex-1 ${searchCareService ? 'text-gray-800' : 'text-gray-400'}`}>
                      {CARE_SERVICE_OPTIONS.find(o => o.value === searchCareService)?.label || "Any service"}
                    </span>
                  </div>
                  <div className="m-1.5 p-2 bg-primary-600 rounded-xl shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </button>
              </div>
              <div className="hidden lg:block flex-1" />
              <Link
                href="/for-providers"
                className="hidden md:block text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors shrink-0"
              >
                Become a provider
              </Link>
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
                          {menuProviderType ? (
                            <>
                              <Link href="/provider/leads" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>Leads</Link>
                              <Link href="/provider/requests" className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>
                                <span>Requests</span>
                                {unreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{unreadCount > 9 ? "9+" : unreadCount}</span>}
                              </Link>
                              <Link href="/provider/profile" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setHamburgerOpen(false)}>My Profile</Link>
                              <div className="border-t border-gray-100 my-1" />
                              {menuProviderType === "INDEPENDENT_CAREGIVER" ? (
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

      {/* ===================== MAIN CONTENT — Single Column ===================== */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-28">

        {/* ==================== 1. HERO SECTION ==================== */}
        <div ref={heroRef}>
          {/* Photo Gallery — 3-photo mosaic (desktop) / carousel (mobile) */}
          {allPhotos.length > 0 ? (
            <>
              {/* Mobile: single photo carousel */}
              <div className="md:hidden relative aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={allPhotos[currentPhotoIndex]} alt={provider.name} className="w-full h-full object-cover" />
                {provider.claimed && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-primary-600 text-white text-xs font-medium rounded-full shadow-lg">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    Verified
                  </div>
                )}
                {allPhotos.length > 1 && (
                  <>
                    <button onClick={() => setCurrentPhotoIndex((prev) => (prev === 0 ? allPhotos.length - 1 : prev - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={() => setCurrentPhotoIndex((prev) => (prev === allPhotos.length - 1 ? 0 : prev + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <button onClick={() => setPhotoTourOpen(true)} className="absolute bottom-3 right-3 px-3 py-1.5 bg-white/90 hover:bg-white text-gray-900 text-xs font-medium rounded-lg shadow-lg flex items-center gap-1.5 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                      All {allPhotos.length} photos
                    </button>
                  </>
                )}
              </div>

              {/* Desktop: 3-photo mosaic grid */}
              <div className="hidden md:grid grid-cols-3 grid-rows-2 gap-2 rounded-xl overflow-hidden mb-6" style={{ height: '340px' }}>
                {/* Hero photo — spans 2 rows */}
                <div className="col-span-2 row-span-2 relative cursor-pointer group" onClick={() => setPhotoTourOpen(true)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={allPhotos[0]} alt={provider.name} className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
                  {provider.claimed && (
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-full shadow-lg">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      Verified
                    </div>
                  )}
                </div>
                {/* Top-right photo */}
                <div className="relative cursor-pointer group" onClick={() => setPhotoTourOpen(true)}>
                  {allPhotos[1] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={allPhotos[1]} alt={`${provider.name} photo 2`} className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>
                {/* Bottom-right photo with "View all" overlay */}
                <div className="relative cursor-pointer group" onClick={() => setPhotoTourOpen(true)}>
                  {allPhotos[2] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={allPhotos[2]} alt={`${provider.name} photo 3`} className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                  {allPhotos.length > 3 && (
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <span className="text-white font-semibold text-sm flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        View all {allPhotos.length} photos
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="relative aspect-[16/9] md:aspect-[2.5/1] rounded-xl overflow-hidden bg-gray-100 mb-6">
              <div className="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-primary-200 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-primary-300 text-sm font-medium">Photos coming soon</p>
                </div>
              </div>
            </div>
          )}

          {/* Provider Identity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
            {/* Name + Save */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{provider.name}</h1>
                <p className="text-gray-500 text-sm">{provider.address}, {provider.city}, {provider.state} {provider.zipCode}</p>
              </div>
              <button
                onClick={handleSaveToggle}
                disabled={saving}
                className={`p-2.5 rounded-full border transition-colors shrink-0 ml-4 ${
                  isProviderSaved
                    ? 'border-red-200 text-red-500 hover:bg-red-50'
                    : 'border-gray-300 text-gray-400 hover:text-red-500 hover:border-red-200'
                }`}
              >
                <span className="sr-only">{isProviderSaved ? 'Unsave' : 'Save'}</span>
                <svg className={`w-5 h-5 ${isProviderSaved ? 'fill-current' : ''}`} viewBox="0 0 24 24" stroke="currentColor" fill={isProviderSaved ? 'currentColor' : 'none'} strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            {/* Compact trust row: type + verified + rating — all inline */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-5 text-sm">
              <span className="text-gray-600 font-medium">{formatProviderType(provider.providerType)}</span>
              {provider.claimed && (
                <span className="inline-flex items-center gap-1 text-primary-700 font-medium">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Verified
                </span>
              )}
              <span className="text-gray-300">&middot;</span>
              {provider.averageRating ? (
                <span className="inline-flex items-center gap-1 text-gray-700">
                  <svg className="w-4 h-4 text-primary-600 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                  <span className="font-semibold">{provider.averageRating.toFixed(1)}</span>
                  <span className="text-gray-500">({provider.reviewCount} review{provider.reviewCount !== 1 ? 's' : ''})</span>
                </span>
              ) : (
                <span className="text-gray-400">No reviews yet</span>
              )}
            </div>

            {/* Full-width primary CTA */}
            <button
              onClick={handleContactSubmit}
              disabled={submitting}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 text-base"
            >
              {submitting ? 'Sending...' : ctaLabel}
            </button>

            {/* Secondary actions: phone + reassurance */}
            <div className="mt-3 flex items-center justify-center gap-4 text-sm">
              {provider.phone && provider.providerType !== 'INDEPENDENT_CAREGIVER' && (
                <>
                  <a href={`tel:${provider.phone}`} className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-900 font-medium">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    {provider.phone}
                  </a>
                  <span className="text-gray-300">&middot;</span>
                </>
              )}
              <span className="text-gray-500">Free to use &middot; No obligation</span>
            </div>

            {/* Unclaimed provider banner — only orgs/agencies, never caregivers */}
            {!provider.claimed && !isCaregiver && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-amber-800 font-medium">This page has not been claimed</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Information shown is from public records and may be incomplete.
                      Contact the provider directly to confirm details.
                    </p>
                    <button
                      onClick={() => setClaimModalOpen(true)}
                      className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-semibold hover:underline"
                    >
                      Are you the owner? Claim this page
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ==================== 2. QUICK FACTS — 3 cards ==================== */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {/* Fact 1: Price (all types) */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 font-medium mb-1">
              {provider.providerType === 'HOSPICE' ? 'Cost' : 'Starting at'}
            </p>
            <p className="text-lg font-bold text-gray-900">
              {provider.providerType === 'HOSPICE' ? 'Medicare covered'
                : provider.priceMin ? `$${provider.priceMin.toLocaleString()}/${priceUnit}`
                : 'Contact us'}
            </p>
          </div>

          {/* Fact 2: Availability / Service Area */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 font-medium mb-1">
              {isFacility ? 'Availability' : isCaregiver ? 'Service Area' : 'Service Area'}
            </p>
            <p className="text-lg font-bold text-gray-900">
              {isFacility
                ? (provider.availableSpots != null
                  ? (provider.availableSpots > 0 ? `${provider.availableSpots} spots` : 'Waitlist')
                  : 'Contact us')
                : (provider.serviceRadius ? `${provider.serviceRadius} mi radius` : provider.city)}
            </p>
          </div>

          {/* Fact 3: Key credential per subtype */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 font-medium mb-1">
              {provider.providerType === 'MEMORY_CARE' ? 'Memory Program'
                : provider.providerType === 'REHABILITATION' ? 'Staff Ratio'
                : isFacility ? 'Staff Ratio'
                : provider.providerType === 'HOSPICE' ? 'RN On-Site'
                : isHomeCare ? 'Licensed'
                : 'Background Check'}
            </p>
            <p className="text-lg font-bold text-gray-900">
              {provider.providerType === 'MEMORY_CARE'
                ? (provider.hasMemoryCare ? 'Specialized' : 'Contact us')
                : (provider.providerType === 'REHABILITATION' || (isFacility && provider.staffToResidentRatio))
                ? (provider.staffToResidentRatio || 'Contact us')
                : provider.providerType === 'HOSPICE'
                ? (provider.hasRNOnSite ? 'Yes' : 'Contact us')
                : isHomeCare
                ? (provider.licensed ? 'Yes' : 'Contact us')
                : (provider.backgroundChecked ? 'Verified' : 'Ask me')}
            </p>
          </div>
        </div>

        {/* ==================== 2b. HIGHLIGHTED FEATURES ==================== */}
        {(() => {
          // Auto-generate features from provider data
          const features: { icon: string; title: string; desc: string }[] = [];

          // Nursing / medical staff
          if (provider.hasRNOnSite) {
            features.push({ icon: 'nurse', title: 'Registered nurse on-site', desc: 'A licensed RN is available on-site for medical needs and oversight.' });
          } else if (provider.hasLVNOnSite) {
            features.push({ icon: 'nurse', title: 'Licensed nurse on-site', desc: 'A licensed vocational nurse is available on-site for care support.' });
          }

          // Staff ratio
          if (provider.staffToResidentRatio && isFacility) {
            features.push({ icon: 'staff', title: `${provider.staffToResidentRatio} staff-to-resident ratio`, desc: 'Dedicated staffing ensures personalized attention for each resident.' });
          }

          // Memory care program
          if (provider.hasMemoryCare && provider.providerType !== 'MEMORY_CARE') {
            features.push({ icon: 'memory', title: 'Memory care program', desc: 'Specialized programming and secure spaces for residents with memory needs.' });
          } else if (provider.providerType === 'MEMORY_CARE' && provider.specialtyPrograms?.length > 0) {
            features.push({ icon: 'memory', title: 'Specialized memory programs', desc: `Includes ${provider.specialtyPrograms.slice(0, 2).join(' and ').toLowerCase()}.` });
          }

          // Dining / dietary options
          if (provider.dietaryOptions?.length > 0) {
            features.push({ icon: 'dining', title: 'Dietary accommodations', desc: `Offers ${provider.dietaryOptions.slice(0, 3).join(', ').toLowerCase()} options.` });
          }

          // Outdoor / common areas
          if (provider.commonAreas?.some(a => /garden|outdoor|patio|courtyard/i.test(a))) {
            features.push({ icon: 'outdoor', title: 'Outdoor spaces', desc: 'Includes gardens, patios, or courtyards for fresh air and relaxation.' });
          }

          // Activities
          if (provider.activitiesOffered?.length >= 3) {
            features.push({ icon: 'activities', title: 'Active lifestyle programs', desc: `${provider.activitiesOffered.length}+ activities including ${provider.activitiesOffered.slice(0, 2).join(' and ').toLowerCase()}.` });
          }

          // Background checked (caregivers)
          if (isCaregiver && provider.backgroundChecked) {
            features.push({ icon: 'verified', title: 'Background verified', desc: 'This caregiver has passed a background check for your peace of mind.' });
          }

          // All staff background checked (orgs)
          if (!isCaregiver && provider.allStaffBackgroundChecked) {
            features.push({ icon: 'verified', title: 'All staff background checked', desc: 'Every team member has passed a comprehensive background check.' });
          }

          // Medical services (rehab, home health)
          if (provider.medicalServices?.length >= 2 && (provider.providerType === 'REHABILITATION' || provider.providerType === 'HOME_HEALTH')) {
            features.push({ icon: 'medical', title: 'Comprehensive therapy services', desc: `Offers ${provider.medicalServices.slice(0, 3).join(', ').toLowerCase()}.` });
          }

          // Licensed
          if (provider.licensed && (isHomeCare || provider.providerType === 'HOSPICE')) {
            features.push({ icon: 'license', title: 'State licensed', desc: 'Fully licensed and regulated by your state\'s health department.' });
          }

          // Languages
          if (provider.languagesSpoken?.length >= 2) {
            features.push({ icon: 'language', title: 'Multilingual staff', desc: `Staff speaks ${provider.languagesSpoken.slice(0, 3).join(', ')}.` });
          }

          // Limit to 3 features
          const displayFeatures = features.slice(0, 3);

          if (displayFeatures.length === 0) return null;

          const iconMap: Record<string, React.ReactNode> = {
            nurse: <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" /></svg>,
            staff: <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
            memory: <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
            dining: <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.126-6 .37" /></svg>,
            outdoor: <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>,
            activities: <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
            verified: <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
            medical: <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
            license: <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
            language: <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" /></svg>,
          };

          return (
            <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">What stands out</h2>
              <div className="divide-y divide-gray-100">
                {displayFeatures.map((feat, idx) => (
                  <div key={idx} className={`flex items-start gap-4 ${idx > 0 ? 'pt-4' : ''} ${idx < displayFeatures.length - 1 ? 'pb-4' : ''}`}>
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                      {iconMap[feat.icon] || iconMap.verified}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{feat.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

        {/* ==================== 3. ABOUT ==================== */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">About {provider.name}</h2>
          {provider.description ? (
            <p className="text-gray-700 whitespace-pre-line leading-relaxed text-base">{provider.description}</p>
          ) : (
            <p className="text-gray-500 text-base leading-relaxed">
              {provider.name} is {['INDEPENDENT_CAREGIVER', 'INDEPENDENT_LIVING'].includes(provider.providerType) ? 'an' : 'a'} {formatProviderType(provider.providerType).toLowerCase()} located in {provider.city}, {provider.state}.
              {provider.providerType === 'ASSISTED_LIVING' && ' Contact them to learn about their living options, care levels, and community atmosphere.'}
              {provider.providerType === 'MEMORY_CARE' && ' Contact them to learn about their memory care programs, staff training, and secure environment.'}
              {provider.providerType === 'NURSING_HOME' && ' Contact them to learn about their skilled nursing services, rehabilitation programs, and daily care.'}
              {provider.providerType === 'INDEPENDENT_LIVING' && ' Contact them to learn about their community, amenities, and lifestyle programs.'}
              {provider.providerType === 'REHABILITATION' && ' Contact them to learn about their therapy programs, recovery plans, and length of stay.'}
              {provider.providerType === 'HOSPICE' && ' Contact them to learn about their comfort care approach, family support, and services.'}
              {(provider.providerType === 'HOME_CARE' || provider.providerType === 'HOME_HEALTH') && ' Contact them to learn about their services, caregiver matching, and scheduling.'}
              {isCaregiver && ' Reach out to learn about their experience, availability, and care approach.'}
            </p>
          )}
        </section>

        {/* ==================== 4. HOW IT WORKS ==================== */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How It Works</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(provider.providerType === 'HOSPICE' ? [
              { step: "1", title: "Request a consultation", desc: "A care team will discuss your family's needs and goals." },
              { step: "2", title: "Meet the hospice team", desc: "Learn about their approach to comfort, dignity, and support." },
              { step: "3", title: "Compare providers", desc: "Speak with 2\u20133 hospice providers to find the right fit." },
              { step: "4", title: "Begin services", desc: "Care is coordinated around your family's schedule and wishes." },
            ] : provider.providerType === 'REHABILITATION' ? [
              { step: "1", title: "Get a referral", desc: "Your doctor or hospital team provides a referral." },
              { step: "2", title: "Visit the facility", desc: "Tour the rehab center and meet the therapy team." },
              { step: "3", title: "Compare programs", desc: "Evaluate 2\u20133 programs for therapy approach and outcomes." },
              { step: "4", title: "Begin recovery", desc: "Start your therapy program with a personalized plan." },
            ] : isFacility ? [
              { step: "1", title: "Schedule a tour", desc: "Visit to see the community and meet the staff." },
              { step: "2", title: "Meet the care team", desc: "Discuss needs, medical requirements, and budget." },
              { step: "3", title: "Compare options", desc: "Visit 3\u20135 providers to find the best fit." },
              { step: "4", title: "Make your decision", desc: "Choose the right community and begin move-in." },
            ] : isHomeCare ? [
              { step: "1", title: "Request a consultation", desc: "Share your care needs so the agency can prepare." },
              { step: "2", title: "Meet your care team", desc: "Discuss scheduling, services, and preferences." },
              { step: "3", title: "Compare options", desc: "Talk to 3\u20135 agencies to compare services and fit." },
              { step: "4", title: "Start care", desc: "Begin a trial period and adjust as needed." },
            ] : [
              { step: "1", title: "Review their profile", desc: "Check experience, certifications, and specialties." },
              { step: "2", title: "Schedule a meeting", desc: "Meet in person or by video to discuss care needs." },
              { step: "3", title: "Compare candidates", desc: "Meet 3\u20135 caregivers to find the right fit." },
              { step: "4", title: "Start a trial", desc: "Begin with a short trial before committing." },
            ]).map((item) => (
              <li key={item.step} className="flex gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary-700 font-bold text-sm">{item.step}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                  <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="text-sm text-gray-500 mt-4 pt-3 border-t border-gray-100">
            <span className="font-medium text-gray-600">Tip:</span>{' '}
            {provider.providerType === 'HOSPICE'
              ? 'Speaking with 2\u20133 hospice providers helps you find the team that feels right for your family.'
              : provider.providerType === 'REHABILITATION'
              ? 'Comparing 2\u20133 rehab programs helps you find the therapy approach that fits your recovery goals.'
              : 'Comparing 3\u20135 providers helps you see different care styles and feel confident in your choice.'}
          </p>
        </section>

        {/* ==================== 5. SERVICES & CARE (Flattened) ==================== */}
        <section className="space-y-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Services &amp; Care</h2>

          {/* Care Types — all provider types */}
          {provider.careTypesOffered?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Care Services</h3>
              <div className="grid grid-cols-2 gap-3">
                {provider.careTypesOffered.map((care) => (
                  <div key={care} className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg">
                    <svg className="w-5 h-5 text-primary-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-primary-700 font-medium text-sm">{formatProviderType(care)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specialty Programs */}
          {(provider.hasMemoryCare || provider.hasRespiteCare || provider.hasHospiceCare || provider.specialtyPrograms?.length > 0) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Specialty Programs</h3>
              <div className="grid grid-cols-2 gap-3">
                {provider.hasMemoryCare && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <svg className="w-5 h-5 text-purple-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="text-purple-700 font-medium text-sm">Memory Care</span>
                  </div>
                )}
                {provider.hasRespiteCare && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                    <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-green-700 font-medium text-sm">Respite Care</span>
                  </div>
                )}
                {provider.hasHospiceCare && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-blue-700 font-medium text-sm">Hospice Care</span>
                  </div>
                )}
                {provider.specialtyPrograms?.map((program) => (
                  <div key={program} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <span className="text-amber-700 font-medium text-sm">{program}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medical Services */}
          {provider.medicalServices?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Services</h3>
              <div className="grid grid-cols-2 gap-2">
                {provider.medicalServices.map((service) => (
                  <div key={service} className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-primary-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {service}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Staff Information (Facility + Home Care) */}
          {(provider.staffToResidentRatio || provider.hasRNOnSite || provider.hasLVNOnSite ||
            provider.allStaffBackgroundChecked || provider.visitingDoctorFrequency) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff &amp; Care Team</h3>
              <div className="space-y-3">
                {provider.staffToResidentRatio && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Staff to Resident Ratio</span>
                    <span className="font-medium text-gray-900">{provider.staffToResidentRatio}</span>
                  </div>
                )}
                {provider.hasRNOnSite && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Registered Nurse (RN) On-Site</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                )}
                {provider.hasLVNOnSite && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Licensed Vocational Nurse (LVN)</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                )}
                {provider.allStaffBackgroundChecked && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">All Staff Background Checked</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                )}
                {provider.visitingDoctorFrequency && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Visiting Doctor</span>
                    <span className="font-medium text-gray-900">{provider.visitingDoctorFrequency}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Facility: Amenities & Daily Life */}
          {isFacility && (provider.activitiesOffered?.length > 0 || provider.roomFeatures?.length > 0 || provider.commonAreas?.length > 0 || provider.dietaryOptions?.length > 0) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities &amp; Daily Life</h3>

              {provider.roomFeatures?.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Room Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.roomFeatures.map((f) => (
                      <span key={f} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">{f}</span>
                    ))}
                  </div>
                </div>
              )}

              {provider.commonAreas?.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Common Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.commonAreas.map((a) => (
                      <span key={a} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {provider.activitiesOffered?.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Activities &amp; Programs</h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.activitiesOffered.map((act) => (
                      <span key={act} className="px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-full">{act}</span>
                    ))}
                  </div>
                </div>
              )}

              {provider.dietaryOptions?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Dietary Options</h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.dietaryOptions.map((d) => (
                      <span key={d} className="px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-full">{d}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Caregiver: Availability */}
          {isCaregiver && (
            <AvailabilitySection
              availabilityStart={provider.availabilityStart}
              workPreferences={provider.workPreferences || []}
              serviceRadius={provider.serviceRadius}
              city={provider.city}
              state={provider.state}
              providerName={provider.name}
            />
          )}

          {/* Caregiver: For Organizations */}
          {isCaregiver && viewerRole === 'organization' && (
            <ForOrganizationsSection
              workPreferences={provider.workPreferences || []}
              preferredEmployers={provider.preferredEmployers || []}
              availabilityStart={provider.availabilityStart}
              certifications={provider.certifications || []}
              yearsInBusiness={provider.yearsInBusiness}
              languagesSpoken={provider.languagesSpoken || []}
              providerName={provider.name}
            />
          )}

          {/* Languages & Certifications */}
          {(provider.languagesSpoken?.length > 0 || provider.certifications?.length > 0 || provider.caregiverTraining?.length > 0) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {provider.certifications?.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Certifications &amp; Credentials</h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.certifications.map((cert) => (
                      <span key={cert} className="px-3 py-1.5 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">{cert}</span>
                    ))}
                  </div>
                </div>
              )}
              {provider.caregiverTraining?.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Training</h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.caregiverTraining.map((t) => (
                      <span key={t} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {provider.languagesSpoken?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Languages Spoken</h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.languagesSpoken.map((lang) => (
                      <span key={lang} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">{lang}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty state for services */}
          {!provider.careTypesOffered?.length && !provider.medicalServices?.length && !provider.hasMemoryCare && !provider.hasRespiteCare && !provider.hasHospiceCare && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <p className="text-gray-500 text-base">
                This provider hasn&apos;t added detailed service information yet.
                {provider.providerType === 'HOSPICE' ? ' Ask about their care approach and family support during your consultation.'
                  : provider.providerType === 'REHABILITATION' ? ' Ask about therapy programs and recovery plans during your visit.'
                  : isFacility ? ' Ask about services and care levels during your tour.'
                  : isHomeCare ? ' Ask about services and caregiver matching during your consultation.'
                  : ' Ask about their experience and specialties during your meeting.'}
              </p>
            </div>
          )}
        </section>

        {/* ==================== 6. PRICING & PAYMENT ==================== */}
        <section className="space-y-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Pricing &amp; Payment</h2>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {/* Main price */}
            {provider.priceMin ? (
              <div className="bg-gray-50 rounded-xl p-5 mb-5">
                <p className="text-sm text-gray-500 font-medium mb-1">Starting at</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${provider.priceMin.toLocaleString()}
                  <span className="text-lg font-normal text-gray-500 ml-1">/ {priceUnit}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">Actual cost depends on level of care and services needed.</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-5 mb-5">
                <p className="text-gray-600 font-medium">Contact for pricing</p>
                <p className="text-sm text-gray-500 mt-1">Pricing varies based on care needs.</p>
              </div>
            )}

            {/* Payment methods */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Accepted Payment Methods</h3>
              {provider.paymentOptions?.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {provider.paymentOptions.map((option) => (
                    <div key={option} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 text-sm font-medium">{option}</span>
                    </div>
                  ))}
                </div>
              ) : isCaregiver ? (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 text-sm font-medium">Private Pay</span>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Contact provider for payment details.</p>
              )}
            </div>

            {provider.priceDescription && (
              <div className="mb-5 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">What&apos;s Included</h3>
                <p className="text-gray-600 text-sm">{provider.priceDescription}</p>
              </div>
            )}

            {/* Availability (Facility) */}
            {isFacility && (provider.availableSpots !== null || provider.totalCapacity || provider.waitlistAvailable) && (
              <div className="pt-5 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Availability</h3>
                <div className="grid grid-cols-2 gap-4">
                  {provider.totalCapacity && (
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-gray-900">{provider.totalCapacity}</p>
                      <p className="text-sm text-gray-500">Total Capacity</p>
                    </div>
                  )}
                  {provider.availableSpots !== null && (
                    <div className={`p-4 rounded-lg text-center ${provider.availableSpots > 0 ? 'bg-green-50' : 'bg-amber-50'}`}>
                      <p className={`text-2xl font-bold ${provider.availableSpots > 0 ? 'text-green-600' : 'text-amber-600'}`}>
                        {provider.availableSpots > 0 ? provider.availableSpots : 'Full'}
                      </p>
                      <p className={`text-sm ${provider.availableSpots > 0 ? 'text-green-600' : 'text-amber-600'}`}>
                        {provider.availableSpots > 0 ? 'Spots Available' : 'Currently'}
                      </p>
                    </div>
                  )}
                </div>
                {provider.waitlistAvailable && provider.availableSpots === 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-blue-700 font-medium">Waitlist available — Contact to be added</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pricing disclaimer */}
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-amber-700">
                Prices shown are estimates and may vary based on level of care, room type, and additional services.
                Contact the provider directly for personalized pricing.
              </p>
            </div>
          </div>
        </section>

        {/* ==================== 7. REVIEWS & TRUST ==================== */}
        <section className="space-y-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Reviews &amp; Trust</h2>

          {/* Olera Score */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Olera Score</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm">
                  Based on reviews, profile completeness, and verification.
                </p>
                <button
                  onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-1.5 inline-flex items-center gap-1"
                >
                  {showScoreBreakdown ? 'Hide details' : 'How the Olera Score works'}
                  <svg className={`w-3.5 h-3.5 transition-transform ${showScoreBreakdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <OleraScore
                provider={provider}
                averageRating={provider.averageRating}
                reviewCount={provider.reviewCount}
                size="large"
                showLabel={true}
                showBreakdown={false}
                showBadges={true}
              />
            </div>
            {showScoreBreakdown && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <OleraScore
                  provider={provider}
                  averageRating={provider.averageRating}
                  reviewCount={provider.reviewCount}
                  size="medium"
                  showLabel={false}
                  showBreakdown={true}
                  showBadges={false}
                />
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <ReviewsSection
              providerId={provider.id}
              averageRating={provider.averageRating}
              reviewCount={provider.reviewCount}
              onWriteReview={() => setReviewModalOpen(true)}
            />
          </div>

          {/* Q&A */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-4">
              Questions &amp; Answers
            </h3>

            {questions.length > 0 ? (
              <div className="space-y-4 mb-4">
                {questions.map((q) => (
                  <div key={q.id} className="py-4 border-b border-gray-100 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-medium text-sm shrink-0">
                        Q
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{q.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {q.user.name || 'Anonymous'} &middot; {new Date(q.createdAt).toLocaleDateString()}
                        </p>
                        {q.answer && (
                          <div className="mt-3 ml-2 pl-4 border-l-2 border-primary-200">
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-xs font-semibold text-primary-600">Provider Answer</span>
                            </div>
                            <p className="text-sm text-gray-700">{q.answer}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-4">No questions yet. Be the first to ask!</p>
            )}

            <div className="pt-4 border-t border-gray-100">
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Ask a question about this provider..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none mb-2"
              />
              <button
                onClick={handleSubmitQuestion}
                disabled={submittingQuestion || newQuestion.trim().length < 5}
                className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {submittingQuestion ? 'Posting...' : 'Post Your Question'}
              </button>
            </div>
          </div>
        </section>

        {/* Inline CTA repeat — after reviews is a natural decision point */}
        <div className="bg-primary-50 rounded-xl border border-primary-200 p-6 mb-6 text-center">
          <h3 className="text-lg font-semibold text-primary-900 mb-2">
            {provider.providerType === 'HOSPICE' ? 'Your family deserves compassionate support'
              : provider.providerType === 'REHABILITATION' ? 'Recovery starts with the right team'
              : isFacility ? `Interested in ${provider.name}?`
              : isHomeCare ? 'Find the right care for your loved one'
              : 'Find the right caregiver'}
          </h3>
          <p className="text-sm text-primary-700 mb-4">
            {provider.providerType === 'HOSPICE' ? 'A free consultation helps you understand their approach — no commitment needed.' :
             provider.providerType === 'REHABILITATION' ? 'Visit to meet the therapy team and see the facility firsthand.' :
             isFacility ? 'A tour is the best way to see if this community feels right. It\'s free and there\'s no obligation.' :
             isHomeCare ? 'A free consultation helps you understand their services — no commitment needed.' :
             'A quick meeting helps you see if they\'re the right fit — no commitment needed.'}
          </p>
          <button
            onClick={handleContactSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            {submitting ? 'Sending...' : ctaLabel}
          </button>
          <p className="text-xs text-primary-600 mt-3">Free to use &middot; No obligation &middot; Takes 30 seconds</p>
        </div>

        {/* ==================== 8. LOCATION ==================== */}
        <section className="space-y-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Location</h2>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Map */}
            <div className="relative h-64 bg-gray-100">
              {provider.latitude && provider.longitude ? (
                <iframe
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(`${provider.address}, ${provider.city}, ${provider.state} ${provider.zipCode}`)}&zoom=15`}
                  title="Location Map"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-gray-500 font-medium">{provider.city}, {provider.state}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Address & Directions */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-900 font-medium">{provider.address}</p>
                  <p className="text-gray-600">{provider.city}, {provider.state} {provider.zipCode}</p>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${provider.address}, ${provider.city}, ${provider.state} ${provider.zipCode}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shrink-0 ml-4"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Directions
                </a>
              </div>

              {/* Service area for home care / caregivers */}
              {provider.serviceRadius && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <p className="text-sm text-gray-600">
                    Serves within <span className="font-medium">{provider.serviceRadius} miles</span> of {provider.city}, {provider.state}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          {provider.providerType !== 'INDEPENDENT_CAREGIVER' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <ContactInfoDisplay
                phone={provider.phone}
                email={provider.email}
                website={provider.website}
                address={`${provider.address}, ${provider.city}, ${provider.state} ${provider.zipCode}`}
                providerType={provider.providerType}
                viewerRole={viewerRole}
                engagementStatus={activeEngagement?.status}
                context="profile_page"
                layout="vertical"
                showLabels={true}
                showIcons={true}
              />
            </div>
          )}

          {/* Neighborhood */}
          {(provider.neighborhoodDescription || provider.nearbyAmenities?.length > 0) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Area</h3>
              {provider.neighborhoodDescription && (
                <p className="text-gray-600 mb-4">{provider.neighborhoodDescription}</p>
              )}
              {provider.nearbyAmenities?.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {provider.nearbyAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-primary-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {amenity}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ==================== 9. KEEP COMPARING ==================== */}
        <section className="mb-6">
          {/* Comparison nudge */}
          <div className="bg-primary-50 rounded-xl border border-primary-100 p-6 mb-6">
            <h3 className="text-lg font-semibold text-primary-900 mb-2">Finding the right fit</h3>
            <p className="text-sm text-primary-700 leading-relaxed">
              {provider.providerType === 'HOSPICE'
                ? 'Finding the right hospice team is deeply personal. We encourage you to speak with 2\u20133 providers to find the team that best supports your family. Save providers you like, and use your consultations to ask about their approach, staff, and family support.'
                : provider.providerType === 'REHABILITATION'
                ? 'Your recovery depends on finding the right therapy program. Compare 2\u20133 rehab centers to evaluate their approach, outcomes, and environment. Save providers you like, and use your visits to ask about therapy plans and expected length of stay.'
                : `Most families speak with 5\u201310 providers before choosing. We encourage you to compare options \u2014 the right fit matters more than the first fit. Save providers you like, and use your ${isFacility ? 'tours' : isHomeCare ? 'consultations' : 'meetings'} to ask about care, pricing, and availability.`}
            </p>
          </div>

          {/* Similar Providers */}
          {similarProviders.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar providers nearby</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {similarProviders.map((sp) => (
                  <Link
                    key={sp.id}
                    href={`/providers/${sp.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-[3/2] bg-gray-100 relative">
                      {sp.coverPhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sp.coverPhoto} alt={sp.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                          <svg className="w-10 h-10 text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-gray-900 text-sm truncate">{sp.name}</p>
                      <p className="text-xs text-gray-500">{sp.city}, {sp.state}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {sp.averageRating ? `${sp.averageRating.toFixed(1)} stars` : 'No reviews'}
                        </span>
                        {sp.priceMin && (
                          <span className="text-xs font-medium text-gray-700">
                            From ${sp.priceMin.toLocaleString()}/{priceUnit}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link
                  href={`/browse?type=${provider.providerType}&location=${encodeURIComponent(`${provider.city}, ${provider.state}`)}`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  View all {formatProviderType(provider.providerType).toLowerCase()} providers in {provider.city} &rarr;
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Takedown link */}
        {provider.providerType !== 'INDEPENDENT_CAREGIVER' && (
          <p className="text-xs text-gray-400 mb-6">
            <button
              onClick={() => setTakedownModalOpen(true)}
              className="hover:text-gray-600 hover:underline"
            >
              Request page removal
            </button>
          </p>
        )}
      </div>

      {/* ===================== STICKY CTA BAR ===================== */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 transition-transform duration-300 ${
        showStickyBar ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate text-sm">{provider.name}</p>
            <p className="text-xs text-gray-500 truncate">
              {formatProviderType(provider.providerType)} &middot; {provider.city}, {provider.state}
              {isFacility && provider.availableSpots != null && (
                provider.availableSpots > 0
                  ? <span className="text-green-600 font-medium"> &middot; {provider.availableSpots} spot{provider.availableSpots !== 1 ? 's' : ''} available</span>
                  : <span className="text-amber-600 font-medium"> &middot; Waitlist only</span>
              )}
            </p>
          </div>
          {provider.phone && provider.providerType !== 'INDEPENDENT_CAREGIVER' && (
            <a
              href={`tel:${provider.phone}`}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call
            </a>
          )}
          <button
            onClick={handleContactSubmit}
            disabled={submitting}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 text-sm shrink-0"
          >
            {submitting ? 'Sending...' : ctaLabel}
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: formatProviderType(provider.providerType), href: `/browse?type=${provider.providerType}` },
          { label: provider.state, href: `/browse?state=${provider.state}` },
          { label: provider.city, href: `/browse?city=${provider.city}&state=${provider.state}` },
          { label: provider.name, href: `/providers/${provider.id}` },
        ]}
      />

      {/* Footer */}
      <Footer variant="light" />

      {/* ===================== PHOTO TOUR OVERLAY ===================== */}
      {photoTourOpen && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
            <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
              <button onClick={() => setPhotoTourOpen(false)} className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium text-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back
              </button>
              <p className="text-sm font-semibold text-gray-900">{provider.name}</p>
              <div className="flex items-center gap-3">
                <button onClick={handleSaveToggle} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
                  <svg className={`w-4 h-4 ${isProviderSaved ? 'fill-red-500 text-red-500' : ''}`} viewBox="0 0 24 24" stroke="currentColor" fill={isProviderSaved ? 'currentColor' : 'none'} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  {isProviderSaved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
          </div>
          {/* Photo grid */}
          <div className="max-w-5xl mx-auto px-4 py-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Photo tour</h2>
            <p className="text-sm text-gray-500 mb-6">{allPhotos.length} photo{allPhotos.length !== 1 ? 's' : ''}</p>
            <div className="space-y-3">
              {allPhotos.map((photo, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt={`${provider.name} photo ${idx + 1}`} className="w-full object-cover" style={{ maxHeight: '500px' }} />
                </div>
              ))}
            </div>
            {/* CTA at bottom of photo tour */}
            <div className="mt-8 text-center pb-8">
              <p className="text-gray-600 mb-3">Like what you see?</p>
              <button
                onClick={() => { setPhotoTourOpen(false); handleContactSubmit(new Event('click') as unknown as React.FormEvent); }}
                className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
              >
                {ctaLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODALS ===================== */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingAction(undefined);
        }}
        defaultView="signup"
        intent="family"
        pendingAction={pendingAction}
      />

      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        providerId={provider.id}
        providerName={provider.name}
        onReviewSubmitted={fetchProvider}
      />

      <ClaimProviderModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        providerId={provider.id}
        providerName={provider.name}
        onClaimSuccess={() => {
          showToast.success('Provider claimed successfully!');
          router.push('/provider/profile');
        }}
      />

      <EngagementConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmedContactSubmit}
        providerName={provider.name}
        providerType={provider.providerType}
        engagementType={getEngagementType(provider.providerType)}
        profileSummary={getProfileSummary()}
      />

      {provider.providerType !== 'INDEPENDENT_CAREGIVER' && (
        <TakedownRequestModal
          isOpen={takedownModalOpen}
          onClose={() => setTakedownModalOpen(false)}
          providerId={provider.id}
          providerName={provider.name}
        />
      )}

      <SignOutModal
        isOpen={signOutModalOpen}
        onClose={() => setSignOutModalOpen(false)}
      />
    </div>
  );
}
