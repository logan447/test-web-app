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
  claimedAt?: string | null;
  verified?: boolean;
  // Caregiver work preferences (Sprint 5)
  workPreferences: string[];
  preferredEmployers: string[];
  availabilityStart: Date | null;
  // Units and photos (provider detail redesign)
  units?: ProviderUnit[];
  providerPhotos?: ProviderPhoto[];
};

type ProviderUnit = {
  id: string;
  name: string;
  unitType: string;
  description: string | null;
  sqFt: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  basePrice: number | null;
  maxPrice: number | null;
  priceNote: string | null;
  status: string;
  features: string[];
  careLevel: string | null;
  highlighted: boolean;
  sortOrder: number;
};

type ProviderPhoto = {
  id: string;
  url: string;
  category: string;
  caption: string | null;
  altText: string | null;
  featured: boolean;
  sortOrder: number;
};

// Subtype-specific "What to Expect" content for unclaimed pages
const WHAT_TO_EXPECT: Record<string, { heading: string; body: string }> = {
  ASSISTED_LIVING: {
    heading: 'What to expect at an assisted living community',
    body: 'Assisted living communities provide a home-like setting with support for daily activities like bathing, dressing, and medication management. Most offer private or shared apartments, communal dining, social activities, and 24-hour staff. Residents typically maintain independence while having help available when needed.',
  },
  MEMORY_CARE: {
    heading: 'What to expect at a memory care community',
    body: 'Memory care communities specialize in supporting people living with Alzheimer\u2019s, dementia, or other memory conditions. They feature secured environments, structured daily routines, and staff trained in memory care techniques. Programs often include cognitive therapies, sensory activities, and personalized care plans.',
  },
  NURSING_HOME: {
    heading: 'What to expect at a skilled nursing facility',
    body: 'Skilled nursing facilities provide round-the-clock medical care supervised by registered nurses and physicians. They serve residents who need ongoing medical attention, rehabilitation after surgery or illness, or long-term care for chronic conditions. Most accept Medicare and Medicaid.',
  },
  REHABILITATION: {
    heading: 'What to expect at a rehabilitation center',
    body: 'Rehabilitation centers provide short-term intensive therapy \u2014 physical, occupational, and speech \u2014 to help patients recover after surgery, stroke, injury, or illness. Stays typically range from a few days to several weeks. The goal is returning home safely and independently.',
  },
  HOSPICE: {
    heading: 'What to expect at an inpatient hospice facility',
    body: 'Inpatient hospice facilities provide comfort-focused care for people with terminal illness when symptoms can\u2019t be managed at home. The focus is on pain management, emotional support, and quality of life \u2014 for both patients and families. Most stays are covered by Medicare hospice benefit.',
  },
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

      {/* ===================== HERO ===================== */}
      {/*
        Deterministic rendering rule (no claimed/unclaimed branching):
        1. Has photos → Photo gallery
        2. No photos but has coordinates → Map fallback
        3. No photos and no coordinates → Building placeholder
      */}
      <div ref={heroRef} className="relative">
        {allPhotos.length > 0 ? (
          <>
            {/* Mobile: gentle carousel */}
            <div className="md:hidden relative aspect-[4/3] overflow-hidden bg-stone-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={allPhotos[currentPhotoIndex]} alt={provider.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-white/70 text-sm font-medium mb-1">{formatProviderType(provider.providerType)}</p>
                <h1 className="text-2xl font-bold leading-tight">{provider.name}</h1>
                <p className="text-white/70 text-sm mt-1">{provider.city}, {provider.state}</p>
              </div>
              {allPhotos.length > 1 && (
                <>
                  <button onClick={() => setCurrentPhotoIndex((prev) => (prev === 0 ? allPhotos.length - 1 : prev - 1))} className="absolute left-3 top-1/3 w-12 h-12 bg-white/80 active:bg-white rounded-full flex items-center justify-center shadow-lg" aria-label="Previous photo">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button onClick={() => setCurrentPhotoIndex((prev) => (prev === allPhotos.length - 1 ? 0 : prev + 1))} className="absolute right-3 top-1/3 w-12 h-12 bg-white/80 active:bg-white rounded-full flex items-center justify-center shadow-lg" aria-label="Next photo">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </>
              )}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button onClick={handleSaveToggle} disabled={saving} className="w-11 h-11 bg-white/80 active:bg-white rounded-full flex items-center justify-center shadow-lg" aria-label={isProviderSaved ? 'Unsave' : 'Save'}>
                  <svg className={`w-5 h-5 ${isProviderSaved ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} viewBox="0 0 24 24" stroke="currentColor" fill={isProviderSaved ? 'currentColor' : 'none'} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </button>
              </div>
              {/* See all photos — large, obvious for 65+ */}
              {allPhotos.length > 1 && (
                <button onClick={() => setPhotoTourOpen(true)} className="absolute bottom-6 right-6 px-5 py-2.5 bg-white text-gray-900 text-sm font-semibold rounded-xl shadow-lg">
                  See all {allPhotos.length} photos
                </button>
              )}
            </div>

            {/* Desktop: 4-photo mosaic with generous gaps */}
            <div className="hidden md:block">
              <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-none overflow-hidden" style={{ height: '420px' }}>
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
                      <div className="w-full h-full bg-stone-200" />
                    )}
                  </div>
                ))}
              </div>
              {/* Desktop controls below the mosaic, not overlaid */}
              <div className="max-w-5xl mx-auto px-6 -mt-14 relative z-10 flex items-center justify-between">
                <div />
                <div className="flex items-center gap-3">
                  <button onClick={handleSaveToggle} disabled={saving} className={`h-10 px-5 bg-white/95 hover:bg-white rounded-full shadow-lg flex items-center gap-2 text-sm font-semibold transition-colors ${isProviderSaved ? 'text-red-500' : 'text-gray-700'}`}>
                    <svg className={`w-4 h-4 ${isProviderSaved ? 'fill-current' : ''}`} viewBox="0 0 24 24" stroke="currentColor" fill={isProviderSaved ? 'currentColor' : 'none'} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    {isProviderSaved ? 'Saved' : 'Save'}
                  </button>
                  {allPhotos.length > 1 && (
                    <button onClick={() => setPhotoTourOpen(true)} className="h-10 px-5 bg-white/95 hover:bg-white rounded-full shadow-lg text-sm font-semibold text-gray-700 transition-colors">
                      See all {allPhotos.length} photos
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : provider.latitude && provider.longitude ? (
          /* No photos but has coordinates — show map fallback */
          <div className="relative bg-stone-100" style={{ height: '340px' }}>
            <iframe
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${provider.longitude - 0.01}%2C${provider.latitude - 0.005}%2C${provider.longitude + 0.01}%2C${provider.latitude + 0.005}&layer=mapnik&marker=${provider.latitude}%2C${provider.longitude}`}
              title="Location"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-50 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-sm font-medium text-gray-700 rounded-lg shadow-sm">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Map view
              </span>
            </div>
          </div>
        ) : (
          /* No photos and no coordinates — building placeholder */
          <div className="h-48 md:h-64 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-12 h-12 text-stone-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              <p className="text-stone-400 text-base font-medium">{provider.name}</p>
            </div>
          </div>
        )}
      </div>

      {/* ===================== ANCHOR NAV ===================== */}
      <div className={`sticky z-30 bg-white border-b border-gray-200 transition-all top-[52px]`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <nav className="flex-1 flex items-center gap-1 overflow-x-auto -mb-px" style={{ scrollbarWidth: 'none' }}>
              {anchorSections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className={`px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeSection === sec.id ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </nav>
            <div className={`shrink-0 transition-all duration-200 py-2 ${showStickyBar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <button onClick={handleContactSubmit} disabled={submitting} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors text-sm whitespace-nowrap">
                {submitting ? 'Sending...' : ctaLabel}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== MAIN CONTENT ===================== */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 pb-28">

        {/* ==================== OVERVIEW ==================== */}
        <section id="overview" ref={(el) => { sectionRefs.current['overview'] = el; }} className="scroll-mt-28 mb-16">

          {/* Trust bar — one signal, calm */}
          <div className="mb-8">
            <p className="text-sm text-gray-500">
              {provider.claimed
                ? <span className="inline-flex items-center gap-1.5"><svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg><span className="text-primary-700 font-medium">Verified provider</span></span>
                : 'Community-reported information'}
            </p>
          </div>

          {/* Name + location — Desktop (mobile gets it in hero overlay or below map) */}
          <div className="mb-8">
            {/* Mobile name for unclaimed (no hero overlay) */}
            {!provider.claimed && (
              <div className="md:hidden mb-6">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-1">{provider.name}</h1>
                <p className="text-base text-gray-600">{formatProviderType(provider.providerType)} &middot; {provider.city}, {provider.state}</p>
              </div>
            )}
            {/* Desktop name */}
            <div className="hidden md:block">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2">{provider.name}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-gray-600">
                <span>{formatProviderType(provider.providerType)}</span>
                <span className="text-gray-300">&middot;</span>
                <span>{provider.city}, {provider.state}</span>
                {provider.averageRating != null && provider.reviewCount > 0 && (
                  <>
                    <span className="text-gray-300">&middot;</span>
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                      <span className="font-semibold text-gray-900">{provider.averageRating.toFixed(1)}</span>
                      <span>({provider.reviewCount} {provider.reviewCount === 1 ? 'review' : 'reviews'})</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Key facts — generous cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
              <p className="text-sm text-gray-500 mb-1">{provider.providerType === 'HOSPICE' ? 'Cost' : 'Starting from'}</p>
              <p className="text-xl font-bold text-gray-900">{provider.providerType === 'HOSPICE' ? 'Medicare' : provider.priceMin ? `$${provider.priceMin.toLocaleString()}/${priceUnit}` : 'Contact us'}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
              <p className="text-sm text-gray-500 mb-1">{isFacility ? 'Availability' : 'Service area'}</p>
              <p className="text-xl font-bold text-gray-900">{isFacility ? (provider.availableSpots != null ? (provider.availableSpots > 0 ? `${provider.availableSpots} spots` : 'Waitlist') : 'Contact') : (provider.serviceRadius ? `${provider.serviceRadius} mi` : provider.city)}</p>
            </div>
            {isFacility && provider.staffToResidentRatio && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
                <p className="text-sm text-gray-500 mb-1">Staff ratio</p>
                <p className="text-xl font-bold text-gray-900">{provider.staffToResidentRatio}</p>
              </div>
            )}
            {(provider.yearsInBusiness || provider.totalCapacity) && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
                <p className="text-sm text-gray-500 mb-1">{provider.yearsInBusiness ? 'Experience' : 'Capacity'}</p>
                <p className="text-xl font-bold text-gray-900">{provider.yearsInBusiness ? `${provider.yearsInBusiness} years` : `${provider.totalCapacity} beds`}</p>
              </div>
            )}
          </div>

          {/* About — warm, spacious */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-10 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">About {provider.name}</h2>
            <p className="text-gray-700 leading-loose text-base max-w-3xl">
              {provider.description || `${provider.name} is a ${formatProviderType(provider.providerType).toLowerCase()} provider in ${provider.city}, ${provider.state}. ${isFacility ? 'Schedule a free tour to see their community and meet the care team.' : isHomeCare ? 'Schedule a free consultation to discuss your care needs.' : 'Reach out to learn about their experience and availability.'}`}
            </p>

            {/* Inline review quote */}
            {provider.averageRating != null && provider.averageRating >= 4.0 && provider.reviewCount >= 5 && (
              <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4">
                <svg className="w-8 h-8 text-stone-300 shrink-0 mt-1" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11h4v10H0z" /></svg>
                <div>
                  <p className="text-gray-600 italic leading-relaxed text-base">{isFacility ? '"The staff genuinely care. We felt at home from the first visit."' : '"Professional, compassionate, and reliable. We couldn\'t ask for more."'}</p>
                  <p className="text-sm text-gray-400 mt-3">From a family review on Olera</p>
                </div>
              </div>
            )}
          </div>

          {/* What to Expect — unclaimed pages only, warm editorial */}
          {!provider.claimed && isFacility && WHAT_TO_EXPECT[provider.providerType] && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-10 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">{WHAT_TO_EXPECT[provider.providerType].heading}</h2>
              <p className="text-gray-700 leading-loose text-base max-w-3xl">
                {WHAT_TO_EXPECT[provider.providerType].body}
              </p>
            </div>
          )}

          {/* How It Works — gentle reassurance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse communities</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Compare options in your area. Save the ones that feel right.</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{isFacility ? 'Schedule a free tour' : 'Request a consultation'}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{isFacility ? 'Visit in person to see the community and meet the team.' : 'Connect directly to discuss your care needs.'}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose the right fit</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Take your time. The right fit matters more than the first fit.</p>
            </div>
          </div>

          {/* Primary CTA — warm, not transactional */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-10 text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">{isFacility ? 'See it for yourself' : isHomeCare ? 'Let\u2019s find the right care' : 'Let\u2019s connect'}</h3>
            <p className="text-gray-600 text-base mb-6 max-w-lg mx-auto leading-relaxed">{isFacility ? 'A free, no-obligation tour is the best way to know if this community is right for your family.' : 'A free consultation helps you understand their approach. No commitment needed.'}</p>
            <button onClick={handleContactSubmit} disabled={submitting} className="w-full sm:w-auto px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-colors disabled:opacity-50 text-lg">
              {submitting ? 'Sending...' : ctaLabel}
            </button>
            <p className="mt-4 text-sm text-gray-400">Free &middot; No obligation &middot; Takes 30 seconds</p>
            {provider.phone && !isCaregiver && (
              <p className="mt-4 pt-4 border-t border-gray-100">
                <a href={`tel:${provider.phone}`} className="text-base text-gray-600 hover:text-gray-800 font-medium">Or call {provider.phone}</a>
              </p>
            )}
          </div>

          {/* Claim banner — prominent for unclaimed, motivating not shaming */}
          {!provider.claimed && !isCaregiver && (
            <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you manage {provider.name}?</h3>
              <p className="text-gray-600 text-sm mb-4 max-w-md mx-auto leading-relaxed">Claim this page to update your information, add photos, and connect with families looking for care.</p>
              <button onClick={() => setClaimModalOpen(true)} className="px-8 py-3 border-2 border-primary-600 text-primary-700 font-semibold rounded-2xl hover:bg-primary-50 transition-colors">
                Claim this page
              </button>
            </div>
          )}
        </section>

        {/* ==================== ROOMS & PRICING ==================== */}
        <section id={isFacility ? 'rooms' : 'pricing'} ref={(el) => { sectionRefs.current[isFacility ? 'rooms' : 'pricing'] = el; }} className="scroll-mt-28 mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">{isFacility ? 'Rooms & pricing' : 'Pricing'}</h2>

          {/* Unit cards from ProviderUnit data — calm, photo + name + price */}
          {isFacility && provider.units && provider.units.length > 0 ? (
            <div className="space-y-6 mb-8">
              {provider.units.map((unit) => (
                <div key={unit.id} className="bg-white rounded-2xl border border-gray-200 p-8">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{unit.name}</h3>
                      {unit.description && (
                        <p className="text-gray-600 text-sm leading-relaxed mb-3">{unit.description}</p>
                      )}
                      {/* Availability — simple text, not dots */}
                      <p className={`text-sm font-medium ${unit.status === 'AVAILABLE' ? 'text-emerald-700' : unit.status === 'WAITLIST' ? 'text-amber-700' : 'text-gray-500'}`}>
                        {unit.status === 'AVAILABLE' ? 'Available' : unit.status === 'WAITLIST' ? 'Waitlist' : unit.status === 'COMING_SOON' ? 'Coming soon' : 'Occupied'}
                      </p>
                    </div>
                    <div className="md:text-right shrink-0">
                      {unit.basePrice ? (
                        <p className="text-2xl font-bold text-gray-900">
                          ${unit.basePrice.toLocaleString()}<span className="text-base font-normal text-gray-400">/mo</span>
                        </p>
                      ) : (
                        <p className="text-lg font-medium text-gray-500">Contact for pricing</p>
                      )}
                      {unit.priceNote && (
                        <p className="text-sm text-gray-500 mt-1">{unit.priceNote}</p>
                      )}
                    </div>
                  </div>
                  {/* Details — progressive reveal */}
                  {(unit.sqFt || unit.features.length > 0) && (
                    <>
                      <button onClick={() => toggleSection(`unit-${unit.id}`)} className="mt-4 text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors">
                        {expandedSections[`unit-${unit.id}`] ? 'Hide details' : 'View details'}
                      </button>
                      {expandedSections[`unit-${unit.id}`] && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mb-4">
                            {unit.sqFt && <span>{unit.sqFt} sq ft</span>}
                            {unit.bedrooms != null && <span>{unit.bedrooms === 0 ? 'Studio' : `${unit.bedrooms} bed`}</span>}
                            {unit.bathrooms != null && <span>{unit.bathrooms} bath</span>}
                          </div>
                          {unit.features.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {unit.features.map((f) => (
                                <span key={f} className="px-3 py-1.5 bg-stone-50 text-gray-700 text-sm rounded-full">{f}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : isFacility && !provider.claimed ? (
            /* Unclaimed facility: generic prompt */
            <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 text-center">
              <p className="text-gray-600 text-base mb-2">Pricing varies by room type and care level.</p>
              <p className="text-gray-500 text-sm">Contact {provider.name} directly to learn about room options and current pricing.</p>
            </div>
          ) : isFacility ? (
            /* Claimed facility without units: fallback with price range */
            <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
              {provider.priceMin && (
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  From ${provider.priceMin.toLocaleString()}<span className="text-base font-normal text-gray-400">/mo</span>
                </p>
              )}
              <p className="text-gray-600 text-sm">Ask about specific room options and pricing during your tour.</p>
            </div>
          ) : null}

          {/* Non-facility pricing */}
          {!isFacility && provider.priceMin && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-bold text-gray-900">${provider.priceMin.toLocaleString()}</span>
                <span className="text-lg text-gray-400">/ {priceUnit}</span>
              </div>
              <p className="text-gray-600 text-sm mb-6">Actual cost depends on care level and services needed.</p>
              <button onClick={handleContactSubmit} disabled={submitting} className="w-full sm:w-auto px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors">
                {ctaLabel}
              </button>
            </div>
          )}

          {/* Payment methods — collapsible */}
          {provider.paymentOptions?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <button onClick={() => toggleSection('payment')} className="w-full px-8 py-6 flex items-center justify-between text-left">
                <h3 className="text-lg font-semibold text-gray-900">Payment methods accepted</h3>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.payment ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {expandedSections.payment && (
                <div className="px-8 pb-6 -mt-2">
                  <div className="flex flex-wrap gap-2">
                    {provider.paymentOptions.map((opt) => (
                      <span key={opt} className="px-3 py-1.5 bg-stone-50 text-gray-700 text-sm rounded-full">{opt}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="text-sm text-gray-400 mt-6">Prices are estimates. Contact the provider for personalized pricing based on care needs.</p>
        </section>

        {/* ==================== CARE & STAFF ==================== */}
        <section id="care" ref={(el) => { sectionRefs.current['care'] = el; }} className="scroll-mt-28 mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Care &amp; staff</h2>

          {/* Key care highlights — always visible, calm stone icons */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {provider.hasRNOnSite && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-stone-100 rounded-2xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">RN on-site</p>
                    <p className="text-sm text-gray-600">Registered nurse available</p>
                  </div>
                </div>
              )}
              {provider.hasLVNOnSite && !provider.hasRNOnSite && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-stone-100 rounded-2xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Licensed nurse on-site</p>
                    <p className="text-sm text-gray-600">LVN available for care support</p>
                  </div>
                </div>
              )}
              {provider.staffToResidentRatio && isFacility && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-stone-100 rounded-2xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{provider.staffToResidentRatio} staff ratio</p>
                    <p className="text-sm text-gray-500">Staff-to-resident ratio</p>
                  </div>
                </div>
              )}
              {provider.allStaffBackgroundChecked && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-stone-100 rounded-2xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Background checked</p>
                    <p className="text-sm text-gray-500">All staff verified</p>
                  </div>
                </div>
              )}
              {provider.languagesSpoken?.length >= 2 && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-stone-100 rounded-2xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Multilingual</p>
                    <p className="text-sm text-gray-500">{provider.languagesSpoken.slice(0, 3).join(', ')}</p>
                  </div>
                </div>
              )}
              {provider.licensed && (isHomeCare || provider.providerType === 'HOSPICE') && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-stone-100 rounded-2xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
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
        <section id="reviews" ref={(el) => { sectionRefs.current['reviews'] = el; }} className="scroll-mt-28 mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Reviews</h2>

          {/* Simplified rating header — one number, one count */}
          {provider.averageRating != null && provider.reviewCount > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-900">{provider.averageRating.toFixed(1)}</p>
                  <div className="flex items-center gap-0.5 mt-1 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className={`w-5 h-5 ${star <= Math.round(provider.averageRating!) ? 'text-amber-400 fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Based on {provider.reviewCount} {provider.reviewCount === 1 ? 'review' : 'reviews'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Reviews list */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <ReviewsSection
              providerId={provider.id}
              averageRating={provider.averageRating}
              reviewCount={provider.reviewCount}
              onWriteReview={() => setReviewModalOpen(true)}
            />
          </div>

          {/* Q&A — collapsible, calmer styling */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mt-6">
            <button onClick={() => toggleSection('qa')} className="w-full px-8 py-6 flex items-center justify-between text-left">
              <h3 className="text-lg font-semibold text-gray-900">Questions &amp; answers</h3>
              <div className="flex items-center gap-3">
                {questions.length > 0 && <span className="text-sm text-gray-500">{questions.length}</span>}
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.qa ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </button>
            {expandedSections.qa && (
              <div className="px-8 pb-8 -mt-2">
                {questions.length > 0 ? (
                  <div className="space-y-4 mb-6">
                    {questions.map((q) => (
                      <div key={q.id} className="py-4 border-b border-gray-100 last:border-0">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-gray-600 font-medium text-sm shrink-0">
                            Q
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium">{q.content}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {q.user.name || 'Anonymous'} &middot; {new Date(q.createdAt).toLocaleDateString()}
                            </p>
                            {q.answer && (
                              <div className="mt-3 ml-2 pl-4 border-l-2 border-gray-200">
                                <p className="text-sm font-semibold text-gray-700 mb-1">Provider answer</p>
                                <p className="text-sm text-gray-600 leading-relaxed">{q.answer}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-6">No questions yet. Be the first to ask!</p>
                )}

                <div className="pt-4 border-t border-gray-100">
                  <textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Ask a question about this provider..."
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none mb-3"
                  />
                  <button
                    onClick={handleSubmitQuestion}
                    disabled={submittingQuestion || newQuestion.trim().length < 5}
                    className="w-full py-3 bg-stone-100 text-gray-700 font-medium rounded-xl hover:bg-stone-200 transition-colors disabled:opacity-50"
                  >
                    {submittingQuestion ? 'Posting...' : 'Post your question'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Inline CTA repeat — warm, not colored background */}
        <div className="bg-white rounded-2xl border border-gray-200 p-10 mb-16 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            {provider.providerType === 'HOSPICE' ? 'Your family deserves compassionate support'
              : provider.providerType === 'REHABILITATION' ? 'Recovery starts with the right team'
              : isFacility ? `Interested in ${provider.name}?`
              : isHomeCare ? 'Find the right care for your loved one'
              : 'Find the right caregiver'}
          </h3>
          <p className="text-base text-gray-600 mb-6 max-w-lg mx-auto leading-relaxed">
            {provider.providerType === 'HOSPICE' ? 'A free consultation helps you understand their approach — no commitment needed.' :
             provider.providerType === 'REHABILITATION' ? 'Visit to meet the therapy team and see the facility firsthand.' :
             isFacility ? 'A tour is the best way to see if this community feels right. It\'s free and there\'s no obligation.' :
             isHomeCare ? 'A free consultation helps you understand their services — no commitment needed.' :
             'A quick meeting helps you see if they\'re the right fit — no commitment needed.'}
          </p>
          <button
            onClick={handleContactSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-colors disabled:opacity-50 text-lg"
          >
            {submitting ? 'Sending...' : ctaLabel}
          </button>
          <p className="text-sm text-gray-400 mt-4">Free &middot; No obligation &middot; Takes 30 seconds</p>
        </div>

        {/* ==================== LOCATION ==================== */}
        <section id="location" ref={(el) => { sectionRefs.current['location'] = el; }} className="scroll-mt-28 mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">Location</h2>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Map */}
            <div className="relative h-64 bg-gray-100">
              {provider.latitude && provider.longitude ? (
                <iframe
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${provider.longitude - 0.008}%2C${provider.latitude - 0.005}%2C${provider.longitude + 0.008}%2C${provider.latitude + 0.005}&layer=mapnik&marker=${provider.latitude}%2C${provider.longitude}`}
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
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-gray-700 text-sm font-medium rounded-xl transition-colors flex items-center gap-2 shrink-0 ml-4"
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
          {/* Comparison nudge — warm, not primary-colored */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Finding the right fit</h3>
            <p className="text-base text-gray-600 leading-relaxed">
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
          {/* Photo grid — uses ProviderPhoto data when available, else falls back to allPhotos */}
          <div className="max-w-4xl mx-auto px-6 py-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Photos</h2>
            <p className="text-sm text-gray-500 mb-10">{allPhotos.length} photo{allPhotos.length !== 1 ? 's' : ''}</p>

            {provider.providerPhotos && provider.providerPhotos.length > 0 ? (
              (() => {
                // Group by category from ProviderPhoto data
                const categoryNames: Record<string, string> = {
                  EXTERIOR: 'Exterior', ENTRANCE: 'Entrance', LOBBY: 'Lobby & reception',
                  COMMON_AREA: 'Common areas', LIVING_ROOM: 'Living spaces', DINING: 'Dining',
                  BEDROOM: 'Rooms', BATHROOM: 'Bathrooms', KITCHEN: 'Kitchen', OUTDOOR: 'Outdoors',
                  GARDEN: 'Garden & grounds', COURTYARD: 'Courtyard', ACTIVITY: 'Activities',
                  THERAPY: 'Therapy & wellness', FITNESS: 'Fitness', SALON: 'Salon',
                  CHAPEL: 'Chapel', STAFF: 'Team', OTHER: 'More photos',
                };
                const groups = new Map<string, ProviderPhoto[]>();
                provider.providerPhotos.forEach((p) => {
                  const label = categoryNames[p.category] || 'More photos';
                  if (!groups.has(label)) groups.set(label, []);
                  groups.get(label)!.push(p);
                });
                return (
                  <div className="space-y-12">
                    {Array.from(groups.entries()).map(([label, photos]) => (
                      <div key={label}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{label}</h3>
                        <div className={`grid gap-5 ${photos.length >= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 max-w-2xl'}`}>
                          {photos.map((photo) => (
                            <div key={photo.id}>
                              <div className="rounded-2xl overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={photo.url} alt={photo.altText || `${provider.name} — ${label}`} className="w-full object-cover" style={{ maxHeight: '420px' }} />
                              </div>
                              {photo.caption && (
                                <p className="text-sm text-gray-500 mt-2 px-1">{photo.caption}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()
            ) : (
              /* Fallback: ungrouped allPhotos */
              <div className="space-y-6">
                {allPhotos.map((photo, idx) => (
                  <div key={idx}>
                    <div className="rounded-2xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo} alt={`${provider.name} photo ${idx + 1}`} className="w-full object-cover" style={{ maxHeight: '420px' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA at bottom */}
            <div className="mt-12 text-center pb-10">
              <p className="text-gray-600 text-base mb-4">Like what you see?</p>
              <button
                onClick={() => { setPhotoTourOpen(false); handleContactSubmit(new Event('click') as unknown as React.FormEvent); }}
                className="px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-colors text-lg"
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
