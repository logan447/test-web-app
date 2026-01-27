"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ProviderType } from "@prisma/client";
import MainNav from "@/components/Navigation/MainNav";
import Footer from "@/components/Navigation/Footer";
import AuthModal, { PendingAction } from "@/components/Auth/AuthModal";
import ReviewModal from "@/components/Reviews/ReviewModal";
import ReviewsSection from "@/components/Reviews/ReviewsSection";
import ClaimProviderModal from "@/components/Provider/ClaimProviderModal";
import TakedownRequestModal from "@/components/Provider/TakedownRequestModal";
import ContactInfoDisplay from "@/components/Provider/ContactInfoDisplay";
import OleraScore from "@/components/Trust/OleraScore";
import { ViewerRole, EngagementStatus } from "@/lib/contactVisibility";
import { showToast } from "@/lib/toast";
import FacilityTabs from "@/components/Provider/tabs/FacilityTabs";
import HomeCareAgencyTabs from "@/components/Provider/tabs/HomeCareAgencyTabs";
import EngagementConfirmationModal from "@/components/Engagement/EngagementConfirmationModal";
import { useFamilyProfile, getEngagementType } from "@/hooks/useFamilyProfile";
import { useSavedProviders } from "@/hooks/useSavedProviders";
import { getProviderCTAs } from "@/lib/providerUtils";
import { useProviderIdentity } from "@/hooks/useProviderIdentity";
import ForOrganizationsSection from "@/components/Provider/ForOrganizationsSection";
import AvailabilitySection from "@/components/Provider/AvailabilitySection";

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

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const { isSaved, toggleSave } = useSavedProviders();
  const [saving, setSaving] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | undefined>(undefined);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [takedownModalOpen, setTakedownModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [activeEngagement, setActiveEngagement] = useState<ActiveEngagement>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [activeSection, setActiveSection] = useState("rating");
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [questions, setQuestions] = useState<Array<{ id: string; content: string; likeCount: number; answer: string | null; answeredAt: string | null; createdAt: string; user: { name: string | null } }>>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const { getProfileSummary } = useFamilyProfile();

  // Get provider identity for accurate viewer role derivation (only fetches if in provider mode)
  const { identity: providerIdentity } = useProviderIdentity({ checkMode: true });

  // Contact form state - only message is actually used by the API
  const [contactMessage, setContactMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /**
   * Derive viewer role for contact visibility.
   * Memoized to avoid recalculation on every render.
   *
   * Rules:
   * - Anonymous users: 'anonymous'
   * - Family mode users: 'family'
   * - Provider mode (individual caregiver): 'individual_caregiver'
   * - Provider mode (organization): 'organization'
   */
  const viewerRole = useMemo((): ViewerRole => {
    if (!session?.user) return 'anonymous';

    // Family mode users are always 'family'
    if (session.user.activeMode === 'FAMILY') return 'family';

    // Provider mode users - check their provider type
    if (session.user.activeMode === 'PROVIDER' && providerIdentity?.type) {
      // Individual caregivers viewing other providers
      if (providerIdentity.type === 'INDEPENDENT_CAREGIVER') {
        return 'individual_caregiver';
      }
      // Organization providers (agencies, facilities)
      return 'organization';
    }

    // Default fallback for provider mode without identity
    return 'organization';
  }, [session?.user?.activeMode, providerIdentity?.type]);

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

    // Show confirmation modal instead of submitting directly
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
          message: contactMessage || 'I would like to learn more about your services.',
          contactReason: 'Request information',
        }),
      });

      if (response.ok) {
        const engagement = await response.json();
        showToast.success('Meeting scheduled! Check your meetings page for details.');
        router.push(`/requests/${engagement.id}`);
      } else {
        throw new Error('Failed to send request');
      }
    } catch (error) {
      showToast.error('Failed to send request');
      throw error; // Re-throw so modal knows it failed
    } finally {
      setSubmitting(false);
    }
  };

  const formatProviderType = (type: string) => {
    return type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
  };

  const allPhotos = provider ? [provider.coverPhoto, ...provider.photos].filter(Boolean) as string[] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <MainNav />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="flex gap-8">
              <div className="w-96 h-72 bg-gray-200 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                <div className="flex gap-4">
                  <div className="flex-1 h-24 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1 h-24 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!provider) return null;

  return (
    <div className="min-h-screen bg-white">
      <MainNav />

      {/* Header with Back Button & Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/browse"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go back and explore more
            </Link>

            <nav className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <Link href="/" className="text-primary-600 hover:underline">Home</Link>
              <span className="text-gray-400">›</span>
              <Link href={`/browse?type=${provider.providerType}`} className="text-primary-600 hover:underline">
                {formatProviderType(provider.providerType)}
              </Link>
              <span className="text-gray-400">›</span>
              <Link href={`/browse?state=${provider.state}`} className="text-primary-600 hover:underline">{provider.state}</Link>
              <span className="text-gray-400">›</span>
              <Link href={`/browse?city=${provider.city}&state=${provider.state}`} className="text-primary-600 hover:underline">{provider.city}</Link>
              <span className="text-gray-400">›</span>
              <span className="text-gray-900">{provider.name}</span>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Photo & Info */}
          <div className="lg:w-2/3">
            {/* Hero Section with Photo */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              {/* Photo Gallery */}
              <div className="md:w-96 shrink-0">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                  {allPhotos.length > 0 ? (
                    <>
                      <img
                        src={allPhotos[currentPhotoIndex]}
                        alt={provider.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Verified Badge */}
                      {provider.claimed && (
                        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-full shadow-lg">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </div>
                      )}
                      {/* Photo Counter */}
                      {allPhotos.length > 1 && (
                        <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 text-white text-sm rounded-full">
                          {currentPhotoIndex + 1}/{allPhotos.length}
                        </div>
                      )}
                      {/* Navigation Arrows */}
                      {allPhotos.length > 1 && (
                        <>
                          <button
                            onClick={() => setCurrentPhotoIndex((prev) => (prev === 0 ? allPhotos.length - 1 : prev - 1))}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setCurrentPhotoIndex((prev) => (prev === allPhotos.length - 1 ? 0 : prev + 1))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <svg className="w-20 h-20 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Provider Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{provider.name}</h1>
                  <button
                    onClick={handleSaveToggle}
                    disabled={saving}
                    className={`p-2 rounded-full border transition-colors ${
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

                <p className="text-gray-600 mb-3">{provider.address}, {provider.city} {provider.state}</p>

                {/* Provider Type and Trust Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                    {formatProviderType(provider.providerType)}
                  </span>
                  {provider.claimed && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                  {provider.backgroundChecked && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Background Checked
                    </span>
                  )}
                  {provider.licensed && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Licensed
                    </span>
                  )}
                </div>

                {/* Pricing & Rating Cards */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Pricing Card */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                      Starting at
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {provider.priceMin && provider.priceMax
                        ? `$${provider.priceMin}–$${provider.priceMax} / hr`
                        : provider.priceMin
                        ? `From $${provider.priceMin} / hr`
                        : 'Contact for pricing'}
                    </p>
                  </div>

                  {/* Rating Card */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                    <p className="text-4xl font-bold text-gray-900 mb-1">
                      {provider.averageRating?.toFixed(1) || 'N/A'}
                    </p>
                    {provider.averageRating && (
                      <div className="flex items-center justify-center gap-0.5 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-5 h-5 ${star <= Math.round(provider.averageRating!) ? 'text-primary-600 fill-current' : 'text-gray-300'}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                    )}
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Claim Link */}
                {!provider.claimed && (
                  <p className="text-sm text-gray-500">
                    Is this your business?{' '}
                    <button onClick={() => setClaimModalOpen(true)} className="text-primary-600 hover:underline font-medium">
                      Manage this page
                    </button>
                    .
                  </p>
                )}

                {/* Takedown Request Link (organizations only) */}
                {provider.providerType !== 'INDEPENDENT_CAREGIVER' && (
                  <p className="text-xs text-gray-400 mt-2">
                    <button
                      onClick={() => setTakedownModalOpen(true)}
                      className="hover:text-gray-600 hover:underline"
                    >
                      Request page removal
                    </button>
                  </p>
                )}
              </div>
            </div>

            {/* Section Navigation - Sticky */}
            <div className="sticky top-16 z-10 bg-white border-b border-gray-200 -mx-4 px-4 mb-8">
              <nav className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
                {[
                  { id: "rating", label: "Rating & Reviews" },
                  ...(FACILITY_TYPES.includes(provider.providerType)
                    ? [
                        { id: "living-options", label: "Living Options" },
                        { id: "care-medical", label: "Care & Medical" },
                        { id: "how-it-works", label: "How It Works" },
                      ]
                    : HOME_CARE_TYPES.includes(provider.providerType)
                    ? [
                        { id: "caregivers", label: "Caregivers" },
                        { id: "how-it-works", label: "How It Works" },
                        { id: "services", label: "Services" },
                      ]
                    : [
                        { id: "about", label: "About" },
                        { id: "services", label: "Services" },
                        { id: "how-it-works", label: "How It Works" },
                      ]),
                  { id: "pricing", label: "Pricing" },
                  { id: "location", label: "Location" },
                ].map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                      setActiveSection(section.id);
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                      activeSection === section.id
                        ? "bg-primary-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {section.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* All Sections - Scrollable Layout */}
            {(() => {
              const isFacility = FACILITY_TYPES.includes(provider.providerType);
              const isHomeCare = HOME_CARE_TYPES.includes(provider.providerType);

              return (
                <div className="space-y-8">
                  {/* Rating & Reviews Section */}
                  <section id="rating" className="space-y-6 scroll-mt-36">
                      {/* Olera Score Panel */}
                      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-100 p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Olera Score</h3>
                            <p className="text-sm text-gray-600 max-w-md">
                              A transparent score based on reviews, profile completeness, and verification to help you make informed decisions.
                            </p>
                            <button
                              onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
                              className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-2 inline-flex items-center gap-1"
                            >
                              {showScoreBreakdown ? 'Hide details' : 'How the Olera Score works'}
                              <svg className={`w-4 h-4 transition-transform ${showScoreBreakdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                          <div className="mt-4 pt-4 border-t border-primary-100">
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

                      {/* Reviews Section */}
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <ReviewsSection
                          providerId={provider.id}
                          averageRating={provider.averageRating}
                          reviewCount={provider.reviewCount}
                          onWriteReview={() => setReviewModalOpen(true)}
                        />
                      </div>

                      {/* Q&A Section */}
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-4">
                          Customer Questions & Answers
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
                                      {q.user.name || 'Anonymous'} · {new Date(q.createdAt).toLocaleDateString()}
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

                        {/* Ask a question form */}
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

                  {/* Type-specific sections */}
                  {isFacility ? (
                    <>
                      {/* Living Options Section */}
                      <section id="living-options" className="scroll-mt-36">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Living Options</h2>
                        <FacilityTabs provider={provider} activeTab="living" />
                      </section>
                      {/* Care & Medical Section */}
                      <section id="care-medical" className="scroll-mt-36">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Care & Medical</h2>
                        <FacilityTabs provider={provider} activeTab="care" />
                      </section>
                      {/* How It Works — Facility */}
                      <section id="how-it-works" className="scroll-mt-36 space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">How It Works</h2>
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                          <div className="grid gap-6">
                            {[
                              { step: "1", title: "Schedule a Tour", desc: "Visit in person to see the community, meet staff, and ask questions about daily life and care options." },
                              { step: "2", title: "Meet the Team", desc: "Speak with care coordinators about specific needs, medical requirements, and level of care." },
                              { step: "3", title: "Compare Options", desc: "Visit 3–5 communities to compare environments, services, pricing, and overall fit." },
                              { step: "4", title: "Make Your Decision", desc: "Choose the community that feels right and begin the move-in process with their admissions team." },
                            ].map((item) => (
                              <div key={item.step} className="flex gap-4">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                                  <span className="text-primary-700 font-bold text-sm">{item.step}</span>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Expect</h3>
                          <ul className="space-y-3">
                            {[
                              "Tours typically last 45–60 minutes and can include a meal",
                              "Bring a list of medications and care needs for accurate assessments",
                              "Ask about staff-to-resident ratios, activities, and emergency protocols",
                              "Request a written cost breakdown including all fees before committing",
                              "Most communities offer a trial stay or respite option to test the fit",
                            ].map((item, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                                <svg className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </section>
                    </>
                  ) : isHomeCare ? (
                    <>
                      {/* Our Caregivers Section */}
                      <section id="caregivers" className="scroll-mt-36">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Our Caregivers</h2>
                        <HomeCareAgencyTabs provider={provider} activeTab="caregivers" />
                      </section>
                      {/* How It Works Section */}
                      <section id="how-it-works" className="scroll-mt-36">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">How It Works</h2>
                        <HomeCareAgencyTabs provider={provider} activeTab="how-it-works" />
                      </section>
                      {/* Services Section */}
                      <section id="services" className="scroll-mt-36">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Services</h2>
                        <HomeCareAgencyTabs provider={provider} activeTab="services" />
                      </section>
                    </>
                  ) : (
                    <>
                      {/* About Section - Default for caregivers */}
                      <section id="about" className="space-y-6 scroll-mt-36">
                  {/* Description Block */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">About {provider.name}</h2>
                    {provider.description ? (
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">{provider.description}</p>
                    ) : (
                      <p className="text-gray-500 italic">No description available.</p>
                    )}
                  </div>

                  {/* Quick Facts - Only show if any data exists */}
                  {(provider.yearsInBusiness || provider.licensed || provider.backgroundChecked ||
                    provider.insuranceVerified || provider.capacity || provider.totalCapacity ||
                    provider.serviceRadius) && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Facts</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {provider.yearsInBusiness && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Years in Business</p>
                            <p className="font-medium text-gray-900">{provider.yearsInBusiness}+ years</p>
                          </div>
                        </div>
                      )}
                      {provider.licensed && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Licensed</p>
                            <p className="font-medium text-gray-900">State Licensed</p>
                          </div>
                        </div>
                      )}
                      {provider.backgroundChecked && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Background Check</p>
                            <p className="font-medium text-gray-900">Verified</p>
                          </div>
                        </div>
                      )}
                      {provider.insuranceVerified && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Insurance</p>
                            <p className="font-medium text-gray-900">Verified</p>
                          </div>
                        </div>
                      )}
                      {(provider.capacity || provider.totalCapacity) && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Capacity</p>
                            <p className="font-medium text-gray-900">{provider.capacity || provider.totalCapacity} residents</p>
                          </div>
                        </div>
                      )}
                      {provider.serviceRadius && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Service Area</p>
                            <p className="font-medium text-gray-900">{provider.serviceRadius} mile radius</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  )}

                  {/* Languages & Certifications */}
                  {(provider.languagesSpoken?.length > 0 || provider.certifications?.length > 0) && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      {provider.languagesSpoken?.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">Languages Spoken</h3>
                          <div className="flex flex-wrap gap-2">
                            {provider.languagesSpoken.map((lang) => (
                              <span key={lang} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {provider.certifications?.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">Certifications & Credentials</h3>
                          <div className="flex flex-wrap gap-2">
                            {provider.certifications.map((cert) => (
                              <span key={cert} className="px-3 py-1.5 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Staff Info */}
                  {(provider.staffToResidentRatio || provider.hasRNOnSite || provider.hasLVNOnSite ||
                    provider.allStaffBackgroundChecked || provider.visitingDoctorFrequency) && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Information</h3>
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
                            <span className="text-gray-600">Licensed Vocational Nurse (LVN) On-Site</span>
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
                      </section>

                      {/* Availability Section - Caregivers only */}
                      {provider.providerType === 'INDEPENDENT_CAREGIVER' && (
                        <section id="availability" className="scroll-mt-36">
                          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Availability</h2>
                          <AvailabilitySection
                            availabilityStart={provider.availabilityStart}
                            workPreferences={provider.workPreferences || []}
                            serviceRadius={provider.serviceRadius}
                            city={provider.city}
                            state={provider.state}
                            providerName={provider.name}
                          />
                        </section>
                      )}

                      {/* For Organizations Section - Caregivers only, visible to organization viewers */}
                      {provider.providerType === 'INDEPENDENT_CAREGIVER' && viewerRole === 'organization' && (
                        <section id="for-organizations" className="scroll-mt-36">
                          <ForOrganizationsSection
                            workPreferences={provider.workPreferences || []}
                            preferredEmployers={provider.preferredEmployers || []}
                            availabilityStart={provider.availabilityStart}
                            certifications={provider.certifications || []}
                            yearsInBusiness={provider.yearsInBusiness}
                            languagesSpoken={provider.languagesSpoken || []}
                            providerName={provider.name}
                          />
                        </section>
                      )}

                      {/* Services Section - Default for caregivers */}
                      <section id="services" className="space-y-6 scroll-mt-36">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Services</h2>
                          {/* Care Types */}
                          <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Care Services</h2>
                            {provider.careTypesOffered?.length > 0 ? (
                              <div className="grid grid-cols-2 gap-3">
                                {provider.careTypesOffered.map((care) => (
                                  <div key={care} className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg">
                                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-primary-700 font-medium">{formatProviderType(care)}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 italic">No services listed.</p>
                            )}
                          </div>

                          {/* Specialty Programs */}
                          {(provider.hasMemoryCare || provider.hasRespiteCare || provider.hasHospiceCare || provider.specialtyPrograms?.length > 0) && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Specialty Programs</h3>
                              <div className="grid grid-cols-2 gap-3">
                                {provider.hasMemoryCare && (
                                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    <span className="text-purple-700 font-medium">Memory Care</span>
                                  </div>
                                )}
                                {provider.hasRespiteCare && (
                                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    <span className="text-green-700 font-medium">Respite Care</span>
                                  </div>
                                )}
                                {provider.hasHospiceCare && (
                                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <span className="text-blue-700 font-medium">Hospice Care</span>
                                  </div>
                                )}
                                {provider.specialtyPrograms?.map((program) => (
                                  <div key={program} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                    <span className="text-amber-700 font-medium">{program}</span>
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
                                    <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {service}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Activities */}
                          {provider.activitiesOffered?.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activities & Programs</h3>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {provider.activitiesOffered.map((activity) => (
                                  <div key={activity} className="flex items-center gap-2 text-sm text-gray-700">
                                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {activity}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Amenities */}
                          {(provider.roomFeatures?.length > 0 || provider.commonAreas?.length > 0 || provider.dietaryOptions?.length > 0) && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities & Features</h3>

                              {provider.roomFeatures?.length > 0 && (
                                <div className="mb-6">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Room Features</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {provider.roomFeatures.map((feature) => (
                                      <span key={feature} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">
                                        {feature}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {provider.commonAreas?.length > 0 && (
                                <div className="mb-6">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Common Areas</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {provider.commonAreas.map((area) => (
                                      <span key={area} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">
                                        {area}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {provider.dietaryOptions?.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Dietary Options</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {provider.dietaryOptions.map((option) => (
                                      <span key={option} className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-full">
                                        {option}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                      </section>

                      {/* How It Works — Caregiver */}
                      <section id="how-it-works" className="scroll-mt-36 space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">How It Works</h2>
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                          <div className="grid gap-6">
                            {[
                              { step: "1", title: "Review Their Profile", desc: "Read about their experience, certifications, and specialties to see if they match your needs." },
                              { step: "2", title: "Schedule an Interview", desc: "Meet in person or by video to discuss care needs, availability, and expectations." },
                              { step: "3", title: "Compare Candidates", desc: "Interview 3–5 caregivers to find the right personality and skill fit for your family." },
                              { step: "4", title: "Start a Trial Period", desc: "Begin with a short trial to make sure the caregiver is the right match before committing long-term." },
                            ].map((item) => (
                              <div key={item.step} className="flex gap-4">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                                  <span className="text-primary-700 font-bold text-sm">{item.step}</span>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Expect</h3>
                          <ul className="space-y-3">
                            {[
                              "Initial interviews typically last 30–45 minutes",
                              "Prepare a clear list of daily care tasks and scheduling needs",
                              "Ask about their experience with conditions relevant to your situation",
                              "Discuss backup plans for days the caregiver is unavailable",
                              "Agree on a communication routine for updates and check-ins",
                            ].map((item, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                                <svg className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </section>
                    </>
                  )}

                  {/* Pricing Section - Shared across all types */}
                  <section id="pricing" className="space-y-6 scroll-mt-36">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Pricing</h2>
                  {/* Main Pricing Card */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing Information</h2>

                    {(provider.priceMin || provider.priceMax) ? (
                      <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 mb-6">
                        <p className="text-sm text-primary-600 font-medium mb-1">
                          {HOME_CARE_TYPES.includes(provider.providerType) || provider.providerType === 'INDEPENDENT_CAREGIVER'
                            ? 'Hourly Rate' : 'Starting Monthly Cost'}
                        </p>
                        <p className="text-4xl font-bold text-primary-700">
                          {provider.priceMin && provider.priceMax
                            ? `$${provider.priceMin.toLocaleString()} – $${provider.priceMax.toLocaleString()}`
                            : provider.priceMin
                            ? `From $${provider.priceMin.toLocaleString()}`
                            : `Up to $${provider.priceMax?.toLocaleString()}`}
                        </p>
                        <p className="text-sm text-primary-600 mt-1">
                          {HOME_CARE_TYPES.includes(provider.providerType) || provider.providerType === 'INDEPENDENT_CAREGIVER'
                            ? 'per hour' : 'per month'}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-6 mb-6">
                        <p className="text-gray-600 font-medium">Contact for pricing information</p>
                        <p className="text-sm text-gray-500 mt-1">Pricing varies based on care needs</p>
                      </div>
                    )}

                    {/* Payment types — always show for clarity */}
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Accepted Payment Methods</h3>
                      {provider.paymentOptions?.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {provider.paymentOptions.map((option) => (
                            <div key={option} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-gray-700 text-sm font-medium">{option}</span>
                            </div>
                          ))}
                        </div>
                      ) : provider.providerType === 'INDEPENDENT_CAREGIVER' ? (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700 text-sm font-medium">Private Pay</span>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Contact provider for payment details</p>
                      )}
                    </div>

                    {provider.priceDescription && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">What&apos;s Included</h3>
                        <p className="text-gray-600">{provider.priceDescription}</p>
                      </div>
                    )}

                    <a
                      href="#rating"
                      className="block w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors text-center"
                    >
                      Request Detailed Pricing
                    </a>
                  </div>

                  {/* Availability Section */}
                  {(provider.availableSpots !== null || provider.totalCapacity || provider.waitlistAvailable) && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {provider.totalCapacity && (
                          <div className="p-4 bg-gray-50 rounded-lg text-center">
                            <p className="text-3xl font-bold text-gray-900">{provider.totalCapacity}</p>
                            <p className="text-sm text-gray-500">Total Capacity</p>
                          </div>
                        )}
                        {provider.availableSpots !== null && (
                          <div className={`p-4 rounded-lg text-center ${provider.availableSpots > 0 ? 'bg-green-50' : 'bg-amber-50'}`}>
                            <p className={`text-3xl font-bold ${provider.availableSpots > 0 ? 'text-green-600' : 'text-amber-600'}`}>
                              {provider.availableSpots > 0 ? provider.availableSpots : 'Full'}
                            </p>
                            <p className={`text-sm ${provider.availableSpots > 0 ? 'text-green-600' : 'text-amber-600'}`}>
                              {provider.availableSpots > 0 ? 'Spots Available' : 'Currently'}
                            </p>
                          </div>
                        )}
                      </div>
                      {provider.waitlistAvailable && provider.availableSpots === 0 && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-blue-700 font-medium">Waitlist available - Contact to be added</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pricing Disclaimer */}
                  <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-amber-800">Pricing Disclaimer</p>
                        <p className="text-sm text-amber-700 mt-1">
                          Prices shown are estimates and may vary based on level of care needed, room type, and additional services.
                          Contact the provider directly for accurate, personalized pricing.
                        </p>
                      </div>
                    </div>
                  </div>
                  </section>

                  {/* Location Section */}
                  <section id="location" className="space-y-6 scroll-mt-36">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">Location</h2>
                  {/* Map Section */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Map Placeholder */}
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
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-gray-900 font-medium">{provider.address}</p>
                            <p className="text-gray-600">{provider.city}, {provider.state} {provider.zipCode}</p>
                          </div>
                        </div>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${provider.address}, ${provider.city}, ${provider.state} ${provider.zipCode}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          Get Directions
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information - Privacy-Aware */}
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

                  {/* Neighborhood Info */}
                  {(provider.neighborhoodDescription || provider.nearbyAmenities?.length > 0) && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Area</h3>

                      {provider.neighborhoodDescription && (
                        <p className="text-gray-600 mb-6">{provider.neighborhoodDescription}</p>
                      )}

                      {provider.nearbyAmenities?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Nearby Amenities</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {provider.nearbyAmenities.map((amenity) => (
                              <div key={amenity} className="flex items-center gap-2 text-sm text-gray-700">
                                <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {amenity}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Service Area (integrated into Location for caregivers/home care) */}
                  {provider.serviceRadius && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Area</h3>
                      <div className="flex items-center gap-3 mb-4 p-3 bg-primary-50 rounded-lg">
                        <svg className="w-5 h-5 text-primary-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <p className="text-sm text-primary-700">
                          Serves within <span className="font-semibold">{provider.serviceRadius} miles</span> of {provider.city}, {provider.state}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Check if you&apos;re in the service area</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter your city or zip code"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                showToast.success(`Contact ${provider.name} to confirm availability in your area.`);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => showToast.success(`Contact ${provider.name} to confirm availability in your area.`)}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            Check
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  </section>
                </div>
              );
            })()}
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:w-1/3">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 text-center mb-6">
                  Connect with {provider.name}
                </h2>

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  {session?.user ? (
                    <>
                      {/* Logged in - show simplified form */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <p className="text-sm text-green-800">
                            Your care profile will be shared securely. Contact info stays private until they accept.
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Message (optional)
                        </label>
                        <textarea
                          rows={4}
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder="Tell them about your care needs or any questions you have..."
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Not logged in - show prompt to sign in */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                        <svg className="w-10 h-10 text-blue-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <p className="text-sm text-blue-900 font-medium mb-1">
                          Create a free account to connect
                        </p>
                        <p className="text-xs text-blue-700">
                          Your profile helps providers understand your needs
                        </p>
                      </div>
                    </>
                  )}

                  <p className="text-xs text-gray-500">
                    By continuing, you agree to our{' '}
                    <Link href="/terms" className="text-primary-600 hover:underline">TOS</Link>
                    {' '}&{' '}
                    <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.
                  </p>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : activeEngagement ? 'View Conversation' : getProviderCTAs(provider.providerType).primary}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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

      {/* Engagement Confirmation Modal */}
      <EngagementConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmedContactSubmit}
        providerName={provider.name}
        providerType={provider.providerType}
        engagementType={getEngagementType(provider.providerType)}
        profileSummary={getProfileSummary()}
      />

      {/* Takedown Request Modal (only for organizations) */}
      {provider.providerType !== 'INDEPENDENT_CAREGIVER' && (
        <TakedownRequestModal
          isOpen={takedownModalOpen}
          onClose={() => setTakedownModalOpen(false)}
          providerId={provider.id}
          providerName={provider.name}
        />
      )}

      {/* Footer */}
      <Footer variant="light" />
    </div>
  );
}
