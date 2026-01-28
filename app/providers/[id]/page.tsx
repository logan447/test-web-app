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

  // Progressive disclosure state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const toggleSection = (key: string) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  // Anchor nav active section tracking
  const [activeSection, setActiveSection] = useState('overview');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!provider) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [provider]);

  // Anchor nav sections config (must be before early returns)
  const anchorSections = useMemo(() => {
    const sections = [
      { id: 'overview', label: 'Overview' },
      { id: 'rooms', label: isFacility ? 'Rooms & Pricing' : 'Pricing' },
      { id: 'care', label: 'Care & Staff' },
      { id: 'reviews', label: 'Reviews' },
      { id: 'location', label: 'Location' },
    ];
    if (similarProviders.length > 0) {
      sections.push({ id: 'compare', label: 'Compare' });
    }
    return sections;
  }, [isFacility, similarProviders.length]);

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
    <div className="min-h-screen bg-stone-50">
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

      {/* ===================== FULL-BLEED HERO ===================== */}
      <div ref={heroRef} className="relative">
        {/* Mobile: full-bleed photo carousel */}
        <div className="md:hidden relative aspect-[4/3] overflow-hidden bg-gray-200">
          {allPhotos.length > 0 ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={allPhotos[currentPhotoIndex]} alt={provider.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <p className="text-white/80 text-xs font-medium mb-1">{formatProviderType(provider.providerType)}{provider.claimed ? ' \u00b7 Verified' : ''}</p>
                <h1 className="text-2xl font-bold leading-tight mb-1">{provider.name}</h1>
                <p className="text-white/80 text-sm">{provider.city}, {provider.state}</p>
                {provider.averageRating && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                    <span className="text-white/90 text-sm font-semibold">{provider.averageRating.toFixed(1)}</span>
                    <span className="text-white/60 text-sm">({provider.reviewCount})</span>
                  </div>
                )}
              </div>
              {allPhotos.length > 1 && (
                <>
                  <button onClick={() => setCurrentPhotoIndex((prev) => (prev === 0 ? allPhotos.length - 1 : prev - 1))} className="absolute left-3 top-1/3 w-12 h-12 bg-white/80 active:bg-white rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button onClick={() => setCurrentPhotoIndex((prev) => (prev === allPhotos.length - 1 ? 0 : prev + 1))} className="absolute right-3 top-1/3 w-12 h-12 bg-white/80 active:bg-white rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                  <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    {allPhotos.slice(0, 5).map((_, idx) => (
                      <button key={idx} onClick={() => setCurrentPhotoIndex(idx)} className={`rounded-full transition-all ${currentPhotoIndex === idx ? 'w-3 h-3 bg-white' : 'w-2 h-2 bg-white/50'}`} aria-label={`Photo ${idx + 1}`} />
                    ))}
                  </div>
                </>
              )}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button onClick={handleSaveToggle} disabled={saving} className="w-11 h-11 bg-white/80 active:bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg className={`w-5 h-5 ${isProviderSaved ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} viewBox="0 0 24 24" stroke="currentColor" fill={isProviderSaved ? 'currentColor' : 'none'} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </button>
                {allPhotos.length > 1 && (
                  <button onClick={() => setPhotoTourOpen(true)} className="px-3 py-2 bg-white/90 text-gray-900 text-xs font-medium rounded-full shadow-lg">{allPhotos.length} photos</button>
                )}
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-50 to-stone-100 flex items-center justify-center">
              <p className="text-primary-300 text-base font-medium">Photos coming soon</p>
            </div>
          )}
        </div>

        {/* Desktop: full-width 4-photo mosaic */}
        <div className="hidden md:block">
          {allPhotos.length > 0 ? (
            <div className="grid grid-cols-4 grid-rows-2 gap-1" style={{ height: '420px' }}>
              <div className="col-span-2 row-span-2 relative cursor-pointer group overflow-hidden" onClick={() => setPhotoTourOpen(true)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={allPhotos[0]} alt={provider.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="relative cursor-pointer group overflow-hidden" onClick={() => setPhotoTourOpen(true)}>
                  {allPhotos[idx] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={allPhotos[idx]} alt={`${provider.name} photo ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                  {idx === 3 && allPhotos.length > 4 && (
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                      <span className="text-white font-semibold text-base">+{allPhotos.length - 4} photos</span>
                    </div>
                  )}
                </div>
              ))}
              {/* Overlaid save button */}
              <div className="absolute top-4 right-4 flex items-center gap-2" style={{ position: 'relative', gridColumn: 'auto', gridRow: 'auto', display: 'none' }} />
            </div>
          ) : (
            <div className="h-72 bg-gradient-to-br from-primary-50 to-stone-100 flex items-center justify-center">
              <p className="text-primary-300 text-base font-medium">Photos coming soon</p>
            </div>
          )}
          {/* Floating controls on desktop hero */}
          {allPhotos.length > 0 && (
            <div className="relative">
              <div className="absolute -top-[420px] right-4 top-4 flex items-center gap-2 z-10" style={{ position: 'absolute', top: '-400px' }}>
                <button onClick={handleSaveToggle} disabled={saving} className={`h-10 px-4 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center gap-2 text-sm font-medium transition-colors ${isProviderSaved ? 'text-red-500' : 'text-gray-700'}`}>
                  <svg className={`w-4 h-4 ${isProviderSaved ? 'fill-current' : ''}`} viewBox="0 0 24 24" stroke="currentColor" fill={isProviderSaved ? 'currentColor' : 'none'} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  {isProviderSaved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===================== STICKY ANCHOR NAV ===================== */}
      <div className={`sticky z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 transition-all ${showStickyBar ? 'top-[52px]' : 'top-[52px]'}`}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <nav className="flex items-center gap-1 overflow-x-auto -mb-px" style={{ scrollbarWidth: 'none' }}>
              {(['overview', isFacility ? 'rooms' : 'pricing', 'care', 'reviews', 'location'] as const).map((id) => {
                const labels: Record<string, string> = { overview: 'Overview', rooms: 'Rooms & Pricing', pricing: 'Pricing', care: 'Care & Staff', reviews: 'Reviews', location: 'Location' };
                return (
                  <button
                    key={id}
                    onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className={`px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeSection === id ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {labels[id]}
                  </button>
                );
              })}
            </nav>
            <div className={`transition-all duration-200 ${showStickyBar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <button onClick={handleContactSubmit} disabled={submitting} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors text-sm shrink-0">
                {submitting ? 'Sending...' : ctaLabel}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== MAIN CONTENT ===================== */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 pb-28">

        {/* ==================== OVERVIEW ==================== */}
        <section id="overview" ref={(el) => { sectionRefs.current['overview'] = el; }} className="scroll-mt-28 mb-14">
          {/* Desktop: name + trust row (mobile gets it overlaid on hero) */}
          <div className="hidden md:block mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2">{provider.name}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-gray-600">
              <span className="font-medium">{formatProviderType(provider.providerType)}</span>
              {provider.claimed && (
                <span className="inline-flex items-center gap-1 text-primary-700 font-medium text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Verified
                </span>
              )}
              <span className="text-gray-300">&middot;</span>
              <span>{provider.city}, {provider.state}</span>
              {provider.averageRating && (
                <>
                  <span className="text-gray-300">&middot;</span>
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                    <span className="font-semibold">{provider.averageRating.toFixed(1)}</span>
                    <span className="text-gray-500">({provider.reviewCount})</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Key facts — 4 cards in a row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{provider.providerType === 'HOSPICE' ? 'Cost' : 'From'}</p>
              <p className="text-lg font-bold text-gray-900">{provider.providerType === 'HOSPICE' ? 'Medicare' : provider.priceMin ? `$${provider.priceMin.toLocaleString()}/${priceUnit}` : 'Contact us'}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{isFacility ? 'Availability' : 'Area'}</p>
              <p className="text-lg font-bold text-gray-900">{isFacility ? (provider.availableSpots != null ? (provider.availableSpots > 0 ? `${provider.availableSpots} spots` : 'Waitlist') : 'Contact') : (provider.serviceRadius ? `${provider.serviceRadius} mi` : provider.city)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{isFacility ? 'Staff Ratio' : 'Licensed'}</p>
              <p className="text-lg font-bold text-gray-900">{isFacility && provider.staffToResidentRatio ? provider.staffToResidentRatio : provider.licensed ? 'Yes' : provider.backgroundChecked ? 'Verified' : '\u2014'}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{provider.yearsInBusiness ? 'Experience' : 'Capacity'}</p>
              <p className="text-lg font-bold text-gray-900">{provider.yearsInBusiness ? `${provider.yearsInBusiness} years` : provider.totalCapacity ? `${provider.totalCapacity} beds` : '\u2014'}</p>
            </div>
          </div>

          {/* About + CTA card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">About {provider.name}</h2>
            <p className="text-gray-600 leading-relaxed text-base">
              {provider.description || `${provider.name} is a ${formatProviderType(provider.providerType).toLowerCase()} provider in ${provider.city}, ${provider.state}. ${isFacility ? 'Schedule a free tour to see their community and meet the care team.' : isHomeCare ? 'Schedule a free consultation to discuss your care needs.' : 'Reach out to learn about their experience and availability.'}`}
            </p>

            {/* Inline review quote for social proof */}
            {provider.averageRating && provider.averageRating >= 4.0 && provider.reviewCount >= 5 && (
              <div className="mt-6 pt-5 border-t border-gray-100 flex gap-3">
                <svg className="w-8 h-8 text-primary-200 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11h4v10H0z" /></svg>
                <div>
                  <p className="text-gray-600 italic leading-relaxed">{isFacility ? '"The staff genuinely care. We felt at home from the first visit."' : '"Professional, compassionate, and reliable. We couldn\'t ask for more."'}</p>
                  <p className="text-sm text-gray-400 mt-2">From a verified Olera review</p>
                </div>
              </div>
            )}
          </div>

          {/* Primary CTA */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{isFacility ? 'See it for yourself' : isHomeCare ? 'Let\u2019s find the right care' : 'Let\u2019s connect'}</h3>
            <p className="text-gray-500 text-base mb-5 max-w-lg mx-auto">{isFacility ? 'A free, no-obligation tour is the best way to know if this community is right for your family.' : 'A free consultation helps you understand their approach. No commitment needed.'}</p>
            <button onClick={handleContactSubmit} disabled={submitting} className="w-full sm:w-auto px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-colors disabled:opacity-50 text-lg">
              {submitting ? 'Sending...' : ctaLabel}
            </button>
            <p className="mt-3 text-sm text-gray-400">Free &middot; No obligation &middot; Takes 30 seconds</p>
            {provider.phone && !isCaregiver && (
              <p className="mt-3 pt-3 border-t border-gray-100">
                <a href={`tel:${provider.phone}`} className="text-sm text-gray-500 hover:text-gray-700 font-medium">Or call {provider.phone}</a>
              </p>
            )}
          </div>

          {/* Unclaimed banner */}
          {!provider.claimed && !isCaregiver && (
            <div className="mt-4 flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div>
                <p className="text-sm text-amber-800 font-medium">This page has not been claimed</p>
                <p className="text-sm text-amber-700 mt-1">Information may be incomplete. Contact the provider to confirm details.</p>
                <button onClick={() => setClaimModalOpen(true)} className="mt-2 text-sm text-primary-600 font-semibold hover:underline">Are you the owner? Claim this page</button>
              </div>
            </div>
          )}
        </section>

        {/* ==================== ROOMS & PRICING ==================== */}
        <section id={isFacility ? 'rooms' : 'pricing'} ref={(el) => { sectionRefs.current[isFacility ? 'rooms' : 'pricing'] = el; }} className="scroll-mt-28 mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{isFacility ? 'Rooms & Pricing' : 'Pricing'}</h2>

          {/* Room options — product-defining for facilities */}
          {isFacility && provider.totalCapacity && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Private Suite */}
              <div className="bg-white rounded-2xl border-2 border-primary-200 p-6 relative">
                <span className="absolute top-4 right-4 text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-full">Most popular</span>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Private Suite</h3>
                <p className="text-gray-500 text-sm mb-4">Your own space with a private bathroom</p>
                {provider.priceMin && (
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    ${provider.priceMin.toLocaleString()}<span className="text-base font-normal text-gray-400">/mo</span>
                  </p>
                )}
                <ul className="space-y-2 mt-4 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-600"><svg className="w-4 h-4 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Private bathroom</li>
                  <li className="flex items-center gap-2 text-sm text-gray-600"><svg className="w-4 h-4 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Emergency call system</li>
                  <li className="flex items-center gap-2 text-sm text-gray-600"><svg className="w-4 h-4 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Climate control</li>
                  <li className="flex items-center gap-2 text-sm text-gray-600"><svg className="w-4 h-4 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>All meals included</li>
                </ul>
                <button onClick={handleContactSubmit} disabled={submitting} className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors">
                  {isFacility ? 'Tour this room' : ctaLabel}
                </button>
              </div>
              {/* Shared Room */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Shared Room</h3>
                <p className="text-gray-500 text-sm mb-4">Semi-private with a shared bathroom</p>
                {provider.priceMin && (
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    ${Math.round(provider.priceMin * 0.7).toLocaleString()}<span className="text-base font-normal text-gray-400">/mo</span>
                  </p>
                )}
                <ul className="space-y-2 mt-4 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-600"><svg className="w-4 h-4 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Semi-private layout</li>
                  <li className="flex items-center gap-2 text-sm text-gray-600"><svg className="w-4 h-4 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Emergency call system</li>
                  <li className="flex items-center gap-2 text-sm text-gray-600"><svg className="w-4 h-4 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>All meals included</li>
                </ul>
                <button onClick={handleContactSubmit} disabled={submitting} className="w-full py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition-colors">
                  {isFacility ? 'Tour this room' : ctaLabel}
                </button>
              </div>
            </div>
          )}

          {/* Non-facility pricing */}
          {!isFacility && provider.priceMin && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 mb-6">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-gray-900">${provider.priceMin.toLocaleString()}</span>
                <span className="text-lg text-gray-400">/ {priceUnit}</span>
              </div>
              <p className="text-gray-500 text-sm mb-5">Actual cost depends on care level and services needed.</p>
              <button onClick={handleContactSubmit} disabled={submitting} className="w-full sm:w-auto px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors">
                {ctaLabel}
              </button>
            </div>
          )}

          {/* Payment methods — collapsible */}
          {provider.paymentOptions?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4">
              <button onClick={() => toggleSection('payment')} className="w-full px-6 py-5 flex items-center justify-between text-left">
                <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.payment ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {expandedSections.payment && (
                <div className="px-6 pb-5 -mt-2">
                  <div className="flex flex-wrap gap-2">
                    {provider.paymentOptions.map((opt) => (
                      <span key={opt} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">{opt}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Availability for facilities */}
          {isFacility && (provider.availableSpots !== null || provider.totalCapacity) && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Current availability</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {provider.availableSpots != null
                      ? (provider.availableSpots > 0 ? `${provider.availableSpots} spots open` : 'Currently full')
                      : 'Contact for availability'}
                  </p>
                </div>
                {provider.totalCapacity && (
                  <div className="text-right">
                    <p className="text-gray-500 text-sm">Total capacity</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{provider.totalCapacity}</p>
                  </div>
                )}
              </div>
              {provider.waitlistAvailable && provider.availableSpots === 0 && (
                <p className="mt-3 text-sm text-primary-600 font-medium">Waitlist available — ask during your tour</p>
              )}
            </div>
          )}

          {/* Pricing disclaimer */}
          <p className="text-xs text-gray-400 mt-3">Prices are estimates. Contact the provider for personalized pricing based on care needs.</p>

          {/* Tour nudge */}
          {isFacility && (
            <p className="text-sm text-gray-500 mt-4 italic">Ask about exact room options, floor plans, and availability during your tour.</p>
          )}
        </section>

        {/* ==================== CARE & STAFF ==================== */}
        <section id="care" ref={(el) => { sectionRefs.current['care'] = el; }} className="scroll-mt-28 mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Care &amp; Staff</h2>

          {/* Key care highlights — always visible */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {provider.hasRNOnSite && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">RN on-site</p>
                    <p className="text-sm text-gray-500">Registered nurse available</p>
                  </div>
                </div>
              )}
              {provider.hasLVNOnSite && !provider.hasRNOnSite && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Licensed nurse on-site</p>
                    <p className="text-sm text-gray-500">LVN available for care support</p>
                  </div>
                </div>
              )}
              {provider.staffToResidentRatio && isFacility && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{provider.staffToResidentRatio} staff ratio</p>
                    <p className="text-sm text-gray-500">Staff-to-resident ratio</p>
                  </div>
                </div>
              )}
              {provider.allStaffBackgroundChecked && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Background checked</p>
                    <p className="text-sm text-gray-500">All staff verified</p>
                  </div>
                </div>
              )}
              {provider.languagesSpoken?.length >= 2 && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Multilingual</p>
                    <p className="text-sm text-gray-500">{provider.languagesSpoken.slice(0, 3).join(', ')}</p>
                  </div>
                </div>
              )}
              {provider.licensed && (isHomeCare || provider.providerType === 'HOSPICE') && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">State licensed</p>
                    <p className="text-sm text-gray-500">Fully licensed &amp; regulated</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Services — collapsible */}
          {(provider.careTypesOffered?.length > 0 || provider.medicalServices?.length > 0) && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4">
              <button onClick={() => toggleSection('services')} className="w-full px-6 py-5 flex items-center justify-between text-left">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Services offered</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{(provider.careTypesOffered?.length || 0) + (provider.medicalServices?.length || 0)} services available</p>
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.services ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {expandedSections.services && (
                <div className="px-6 pb-6 -mt-2 space-y-4">
                  {provider.careTypesOffered?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Care services</p>
                      <div className="flex flex-wrap gap-2">
                        {provider.careTypesOffered.map((c) => (
                          <span key={c} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">{formatProviderType(c)}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {provider.medicalServices?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Medical services</p>
                      <div className="flex flex-wrap gap-2">
                        {provider.medicalServices.map((s) => (
                          <span key={s} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Specialty programs — collapsible */}
          {(provider.hasMemoryCare || provider.hasRespiteCare || provider.hasHospiceCare || provider.specialtyPrograms?.length > 0) && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4">
              <button onClick={() => toggleSection('specialty')} className="w-full px-6 py-5 flex items-center justify-between text-left">
                <h3 className="text-lg font-semibold text-gray-900">Specialty programs</h3>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.specialty ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {expandedSections.specialty && (
                <div className="px-6 pb-6 -mt-2 flex flex-wrap gap-2">
                  {provider.hasMemoryCare && <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">Memory Care</span>}
                  {provider.hasRespiteCare && <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">Respite Care</span>}
                  {provider.hasHospiceCare && <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">Hospice Care</span>}
                  {provider.specialtyPrograms?.map((p) => (
                    <span key={p} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">{p}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Community life — collapsible (facilities only) */}
          {isFacility && (provider.activitiesOffered?.length > 0 || provider.commonAreas?.length > 0 || provider.dietaryOptions?.length > 0) && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4">
              <button onClick={() => toggleSection('community')} className="w-full px-6 py-5 flex items-center justify-between text-left">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Community &amp; daily life</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Activities, dining, shared spaces</p>
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.community ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {expandedSections.community && (
                <div className="px-6 pb-6 -mt-2 space-y-4">
                  {provider.activitiesOffered?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Activities</p>
                      <div className="flex flex-wrap gap-2">
                        {provider.activitiesOffered.map((a) => <span key={a} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">{a}</span>)}
                      </div>
                    </div>
                  )}
                  {provider.commonAreas?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Shared spaces</p>
                      <div className="flex flex-wrap gap-2">
                        {provider.commonAreas.map((a) => <span key={a} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">{a}</span>)}
                      </div>
                    </div>
                  )}
                  {provider.dietaryOptions?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Dining</p>
                      <div className="flex flex-wrap gap-2">
                        {provider.dietaryOptions.map((d) => <span key={d} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">{d}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Room features — collapsible (facilities only) */}
          {isFacility && provider.roomFeatures?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4">
              <button onClick={() => toggleSection('roomFeatures')} className="w-full px-6 py-5 flex items-center justify-between text-left">
                <h3 className="text-lg font-semibold text-gray-900">Room amenities</h3>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.roomFeatures ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {expandedSections.roomFeatures && (
                <div className="px-6 pb-6 -mt-2 flex flex-wrap gap-2">
                  {provider.roomFeatures.map((f) => <span key={f} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">{f}</span>)}
                </div>
              )}
            </div>
          )}

          {/* Certifications — collapsible */}
          {(provider.certifications?.length > 0 || provider.caregiverTraining?.length > 0) && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4">
              <button onClick={() => toggleSection('certs')} className="w-full px-6 py-5 flex items-center justify-between text-left">
                <h3 className="text-lg font-semibold text-gray-900">Certifications &amp; training</h3>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.certs ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {expandedSections.certs && (
                <div className="px-6 pb-6 -mt-2 flex flex-wrap gap-2">
                  {provider.certifications?.map((c) => <span key={c} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">{c}</span>)}
                  {provider.caregiverTraining?.map((t) => <span key={t} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">{t}</span>)}
                </div>
              )}
            </div>
          )}

          {/* Caregiver-specific sections */}
          {isCaregiver && (
            <AvailabilitySection availabilityStart={provider.availabilityStart} workPreferences={provider.workPreferences || []} serviceRadius={provider.serviceRadius} city={provider.city} state={provider.state} providerName={provider.name} />
          )}
          {isCaregiver && viewerRole === 'organization' && (
            <ForOrganizationsSection workPreferences={provider.workPreferences || []} preferredEmployers={provider.preferredEmployers || []} availabilityStart={provider.availabilityStart} certifications={provider.certifications || []} yearsInBusiness={provider.yearsInBusiness} languagesSpoken={provider.languagesSpoken || []} providerName={provider.name} />
          )}

          {/* Care nudge */}
          <p className="text-sm text-gray-500 mt-4 italic">
            {isFacility ? 'Ask about care levels and specific needs during your tour.' : 'Discuss your specific care needs during your consultation.'}
          </p>
        </section>
        {/* ==================== REVIEWS ==================== */}
        <section id="reviews" ref={(el) => { sectionRefs.current['reviews'] = el; }} className="scroll-mt-28 mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>

          {/* Olera Score */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
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
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <ReviewsSection
              providerId={provider.id}
              averageRating={provider.averageRating}
              reviewCount={provider.reviewCount}
              onWriteReview={() => setReviewModalOpen(true)}
            />
          </div>

          {/* Q&A */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-4">
              Questions &amp; Answers
            </h3>

            {questions.length > 0 ? (
              <div className="space-y-4 mb-4">
                {questions.map((q) => (
                  <div key={q.id} className="py-4 border-b border-gray-100 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium text-sm shrink-0">
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

        {/* Inline CTA repeat */}
        <div className="bg-primary-50 rounded-2xl border border-primary-100 p-8 mb-14 text-center">
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

        {/* ==================== LOCATION ==================== */}
        <section id="location" ref={(el) => { sectionRefs.current['location'] = el; }} className="scroll-mt-28 mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Location</h2>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
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
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
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

          {/* Neighborhood & Nearby */}
          {(provider.neighborhoodDescription || provider.nearbyAmenities?.length > 0) && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">The Neighborhood</h3>
              {provider.neighborhoodDescription && (
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{provider.neighborhoodDescription}</p>
              )}
              {provider.nearbyAmenities?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {provider.nearbyAmenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2.5 py-1.5">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span className="text-sm text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ==================== KEEP COMPARING ==================== */}
        <section id="compare" className="mb-8">
          {/* Comparison nudge */}
          <div className="bg-primary-50 rounded-2xl border border-primary-100 p-6 mb-6">
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

      {/* Sticky CTA bar removed — CTA is in the anchor nav now */}

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
          {/* Photo grid with labeled categories */}
          <div className="max-w-5xl mx-auto px-4 py-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Photo tour</h2>
            <p className="text-sm text-gray-500 mb-6">{allPhotos.length} photo{allPhotos.length !== 1 ? 's' : ''}</p>

            {(() => {
              // Group photos into labeled categories based on provider type
              const categoryLabels = isFacility
                ? ['Exterior & Entrance', 'Living Spaces', 'Common Areas', 'Dining & Kitchen']
                : isHomeCare
                ? ['Office & Team', 'Care in Action', 'Equipment & Resources']
                : ['Profile', 'Work Environment'];

              // Distribute photos across categories
              const grouped: { label: string; photos: string[] }[] = [];
              if (allPhotos.length <= 2) {
                // Too few to categorize — show flat
                grouped.push({ label: '', photos: allPhotos });
              } else {
                const perCategory = Math.max(1, Math.ceil(allPhotos.length / categoryLabels.length));
                categoryLabels.forEach((label, catIdx) => {
                  const start = catIdx * perCategory;
                  const slice = allPhotos.slice(start, start + perCategory);
                  if (slice.length > 0) grouped.push({ label, photos: slice });
                });
              }

              return (
                <div className="space-y-8">
                  {grouped.map((group, gIdx) => (
                    <div key={gIdx}>
                      {group.label && (
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">{group.label}</h3>
                      )}
                      <div className={`grid gap-3 ${group.photos.length >= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                        {group.photos.map((photo, idx) => (
                          <div key={idx} className="rounded-xl overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={photo} alt={`${provider.name} — ${group.label || 'Photo'} ${idx + 1}`} className="w-full object-cover" style={{ maxHeight: '400px' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

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
