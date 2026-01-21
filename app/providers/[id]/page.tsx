"use client";

import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import { Dialog, Transition } from "@headlessui/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ProviderType } from "@prisma/client";
import MainNav from "@/components/Navigation/MainNav";
import Breadcrumb from "@/components/Navigation/Breadcrumb";
import AuthModal, { PendingAction } from "@/components/Auth/AuthModal";
import PhotoGallery from "@/components/Gallery/PhotoGallery";
import ReviewsSection from "@/components/Reviews/ReviewsSection";
import ReviewModal from "@/components/Reviews/ReviewModal";
import AmenitiesSection from "@/components/Provider/AmenitiesSection";
import StaffSection from "@/components/Provider/StaffSection";
import LocationSection from "@/components/Provider/LocationSection";
import SpecialtyCareSection from "@/components/Provider/SpecialtyCareSection";
import ProviderCTASection from "@/components/Provider/ProviderCTASection";
import EnhancedContactModal, { ContactFormData } from "@/components/Provider/EnhancedContactModal";
import ClaimProviderModal from "@/components/Provider/ClaimProviderModal";
import ProviderDetailSkeleton from "@/components/Loading/ProviderDetailSkeleton";
import { showToast } from "@/lib/toast";

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
  contactRevealed?: boolean;
};

// Type for active engagement
type ActiveEngagement = {
  id: string;
  status: string;
  createdAt: string;
  providerName: string;
} | null;

export default function ProviderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, update: updateSession } = useSession();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authIntent, setAuthIntent] = useState<"family" | "provider">("family");
  const [pendingAction, setPendingAction] = useState<PendingAction | undefined>(undefined);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactReason, setContactReason] = useState("Ask a question");
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [activeEngagement, setActiveEngagement] = useState<ActiveEngagement>(null);
  const [checkingEngagement, setCheckingEngagement] = useState(false);
  const [creatingEngagement, setCreatingEngagement] = useState(false);

  // Confirmation modal state for existing users
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingContactReason, setPendingContactReason] = useState<string | null>(null);

  // Mode-awareness state
  const [hasProviderIdentity, setHasProviderIdentity] = useState(false);
  const [switchingMode, setSwitchingMode] = useState(false);

  // Derived mode state
  const currentMode = session?.user?.activeMode || 'FAMILY';
  const isProviderMode = currentMode === 'PROVIDER';
  const isIndependentCaregiver = provider?.providerType === 'INDEPENDENT_CAREGIVER';

  // Check if user has provider identity (for mode switch eligibility)
  useEffect(() => {
    if (!session?.user) return;

    const checkProviderIdentity = async () => {
      try {
        const response = await fetch('/api/provider-identity');
        if (response.ok) {
          const data = await response.json();
          setHasProviderIdentity(data.hasIdentity);
        }
      } catch (error) {
        console.error('Error checking provider identity:', error);
      }
    };

    checkProviderIdentity();
  }, [session?.user]);

  // Handle mode switch
  const handleSwitchMode = async (targetMode: 'FAMILY' | 'PROVIDER') => {
    setSwitchingMode(true);
    try {
      // Step 1: Update mode in database
      const response = await fetch('/api/user/mode', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: targetMode }),
      });

      if (!response.ok) {
        throw new Error('Failed to switch mode');
      }

      // Step 2: Update NextAuth session with new mode
      await updateSession({ activeMode: targetMode });

      // Step 3: Show success message
      showToast.success(`Switched to ${targetMode === 'FAMILY' ? 'Family' : 'Provider'} mode`);

      // Step 4: If switching to Family mode and we have a pending contact action,
      // close modal and re-trigger the CTA flow to check for family profile
      if (targetMode === 'FAMILY' && pendingContactReason) {
        const savedReason = pendingContactReason;
        setConfirmModalOpen(false);
        setPendingContactReason(null);

        // Small delay to let the session update propagate, then re-check profile
        setTimeout(async () => {
          // Check if family profile exists
          const profileResponse = await fetch('/api/family-profiles/me');
          if (!profileResponse.ok) {
            // No profile - trigger onboarding
            triggerOnboardingWithAction(savedReason);
          } else {
            const profile = await profileResponse.json();
            // Check MVP fields
            const hasName = profile.lovedOneName && profile.lovedOneName.trim().length > 0;
            const hasLocation = (profile.city && profile.city.trim().length > 0) ||
                               (profile.state && profile.state.trim().length > 0);
            const hasCareTypes = profile.careTypes && profile.careTypes.length > 0;

            if (!hasName || !hasLocation || !hasCareTypes) {
              // Profile incomplete - trigger onboarding
              triggerOnboardingWithAction(savedReason);
            } else {
              // Profile complete - show confirmation modal again (now they can proceed)
              setPendingContactReason(savedReason);
              setConfirmModalOpen(true);
            }
          }
        }, 200);
      } else {
        // Just close modal and refresh
        setConfirmModalOpen(false);
        setPendingContactReason(null);
        setTimeout(() => {
          router.refresh();
        }, 100);
      }
    } catch (error) {
      console.error('Error switching mode:', error);
      showToast.error('Failed to switch mode. Please try again.');
    } finally {
      setSwitchingMode(false);
    }
  };

  useEffect(() => {
    fetchProvider();
    if (session?.user?.role === "FAMILY") {
      checkIfSaved();
      checkActiveEngagement();
    }
  }, [session]);

  // Check for pending review actions after onboarding completes
  // Note: 'contact' and 'save' actions are now handled by GlobalOnboardingOverlay
  // which creates engagements/saves directly and redirects appropriately.
  // This effect only handles 'review' actions which still need the modal.
  useEffect(() => {
    if (!session?.user || !provider) return;

    // Check sessionStorage for review action
    const storedAction = sessionStorage.getItem('pendingOnboardingAction');
    if (!storedAction) return;

    let action: PendingAction | null = null;
    try {
      action = JSON.parse(storedAction) as PendingAction;
      sessionStorage.removeItem('pendingOnboardingAction');
    } catch (e) {
      console.error('Failed to parse pending action:', e);
      sessionStorage.removeItem('pendingOnboardingAction');
      return;
    }

    // Only handle review actions here
    if (!action || action.providerId !== params.id || action.type !== 'review') return;

    // Open review modal after a brief delay
    setTimeout(() => {
      setReviewModalOpen(true);
    }, 300);
  }, [session, provider, params.id]);

  // Listen for onboardingComplete event for review actions only
  // Note: This event is only dispatched for 'review' actions now
  useEffect(() => {
    const handleOnboardingComplete = (event: CustomEvent<PendingAction>) => {
      const action = event.detail;
      if (!action || action.providerId !== params.id) return;

      // Clear sessionStorage since we're handling it via event
      sessionStorage.removeItem('pendingOnboardingAction');

      // Only handle review actions (contact/save are handled by GlobalOnboardingOverlay)
      if (action.type === 'review') {
        setReviewModalOpen(true);
      }
    };

    window.addEventListener('onboardingComplete', handleOnboardingComplete as EventListener);
    return () => {
      window.removeEventListener('onboardingComplete', handleOnboardingComplete as EventListener);
    };
  }, [params.id]);

  // Save handler specifically for post-onboarding (doesn't open auth modal)
  const handleSaveAfterOnboarding = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/saved-providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId: params.id }),
      });

      if (response.ok) {
        setIsSaved(true);
        showToast.success('Provider saved');
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }
    } catch (error: any) {
      showToast.error(error.message || 'Failed to save provider');
    } finally {
      setSaving(false);
    }
  };

  const fetchProvider = async () => {
    try {
      const response = await fetch(`/api/providers/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProvider(data);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching provider:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    try {
      const response = await fetch('/api/saved-providers');
      if (response.ok) {
        const savedProviders = await response.json();
        const isProviderSaved = savedProviders.some((sp: any) => sp.provider.id === params.id);
        setIsSaved(isProviderSaved);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  // Check if user has an active engagement with this provider
  const checkActiveEngagement = async () => {
    if (!params.id) return;

    setCheckingEngagement(true);
    try {
      const response = await fetch(`/api/engagements/check?providerId=${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setActiveEngagement(data.activeEngagement);
      }
    } catch (error) {
      console.error('Error checking engagement:', error);
    } finally {
      setCheckingEngagement(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!session?.user) {
      setAuthIntent("family");
      setPendingAction({
        type: 'save',
        providerId: params.id as string,
        providerName: provider?.name,
      });
      setAuthModalOpen(true);
      return;
    }

    setSaving(true);
    try {
      if (isSaved) {
        // Unsave
        const response = await fetch(`/api/saved-providers?providerId=${params.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIsSaved(false);
          showToast.success('Removed from saved');
        } else {
          throw new Error('Failed to unsave');
        }
      } else {
        // Save
        const response = await fetch('/api/saved-providers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ providerId: params.id }),
        });

        if (response.ok) {
          setIsSaved(true);
          showToast.success('Provider saved');
        } else {
          const data = await response.json();
          throw new Error(data.error || 'Failed to save');
        }
      }
    } catch (error: any) {
      showToast.error(error.message || 'Failed to update saved status');
    } finally {
      setSaving(false);
    }
  };

  const handleWriteReview = () => {
    if (!session?.user) {
      setAuthIntent("family");
      setPendingAction({
        type: 'review',
        providerId: params.id as string,
        providerName: provider?.name,
      });
      setAuthModalOpen(true);
      return;
    }
    setReviewModalOpen(true);
  };

  const handleReviewSubmitted = () => {
    // Refresh provider data to update average rating and review count
    fetchProvider();
  };

  const handleClaimClick = () => {
    if (!session?.user) {
      setAuthIntent("provider");
      setAuthModalOpen(true);
      return;
    }
    setClaimModalOpen(true);
  };

  const handleClaimSuccess = () => {
    // Refresh provider data and redirect to provider dashboard
    showToast.success('Provider claimed successfully!');
    router.push('/dashboard/provider-profile');
  };

  // Profile-as-request model: handleOpenRequestForm
  // - Active engagement exists → redirect to it
  // - Logged in + profile complete → create engagement instantly
  // - Logged in + profile incomplete → trigger onboarding
  // - Logged out → show auth modal
  const handleOpenRequestForm = async (reason: string) => {
    // If active engagement exists, redirect to it
    if (activeEngagement) {
      showToast.success(`You already have an active conversation with ${provider?.name}`);
      router.push(`/dashboard/my-providers/${activeEngagement.id}`);
      return;
    }

    // If not logged in, show auth modal (will flow through onboarding)
    if (!session?.user) {
      setAuthIntent("family");
      setPendingAction({
        type: 'contact',
        providerId: params.id as string,
        providerName: provider?.name,
        contactReason: reason,
      });
      setAuthModalOpen(true);
      return;
    }

    // User is logged in - check mode first
    // If user is in Provider mode, show confirmation modal with mode switch prompt
    // instead of triggering family onboarding
    if (isProviderMode) {
      setPendingContactReason(reason);
      setConfirmModalOpen(true);
      return;
    }

    // User is in Family mode - check profile completeness
    setCreatingEngagement(true);
    try {
      // Check if family profile exists and is complete
      const profileResponse = await fetch('/api/family-profiles/me');

      if (!profileResponse.ok) {
        // No profile - trigger onboarding
        triggerOnboardingWithAction(reason);
        return;
      }

      const profile = await profileResponse.json();

      // Check MVP fields: lovedOneName, city/state, careTypes
      const hasName = profile.lovedOneName && profile.lovedOneName.trim().length > 0;
      const hasLocation = (profile.city && profile.city.trim().length > 0) ||
                         (profile.state && profile.state.trim().length > 0);
      const hasCareTypes = profile.careTypes && profile.careTypes.length > 0;

      if (!hasName || !hasLocation || !hasCareTypes) {
        // Profile incomplete - trigger onboarding
        triggerOnboardingWithAction(reason);
        return;
      }

      // Profile complete - show confirmation modal before creating engagement
      setPendingContactReason(reason);
      setConfirmModalOpen(true);
    } catch (error: any) {
      console.error('Error creating engagement:', error);
      showToast.error(error.message || 'Something went wrong');
    } finally {
      setCreatingEngagement(false);
    }
  };

  // Handle confirmed engagement creation (after user confirms in modal)
  const handleConfirmEngagement = async () => {
    if (!pendingContactReason) return;

    setConfirmModalOpen(false);
    setCreatingEngagement(true);

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: params.id,
          contactReason: pendingContactReason,
          message: '', // Message is required in schema - user can add details on engagement page
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create engagement');
      }

      const engagement = await response.json();

      showToast.success(`Connected with ${provider?.name}!`);
      router.push(`/dashboard/my-providers/${engagement.id}`);
    } catch (error: any) {
      console.error('Error creating engagement:', error);
      showToast.error(error.message || 'Something went wrong');
    } finally {
      setCreatingEngagement(false);
      setPendingContactReason(null);
    }
  };

  // Helper to trigger onboarding with pending action
  const triggerOnboardingWithAction = (reason: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('onboarding', 'true');
    params.set('intent', 'family');
    params.set('action', 'contact');
    params.set('actionProviderId', provider?.id || '');
    params.set('actionProviderName', provider?.name || '');
    params.set('actionContactReason', reason);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.push(newUrl);
    router.refresh();
  };

  const handleContactSubmit = async (formData: ContactFormData) => {
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: provider?.id,
          message: formData.message,
          contactReason: formData.contactReason,
          preferredContactMethod: formData.preferredContactMethod,
          preferredTourDate: formData.preferredTourDate,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send request');
      }

      const createdRequest = await response.json();
      setContactModalOpen(false);

      // Show contextual success message based on the action type
      const successMessages: Record<string, string> = {
        'Ask a question': 'Question sent!',
        'Request consultation': 'Consultation requested!',
        'Request interview': 'Interview requested!',
        'Schedule a tour': 'Tour request sent!',
      };
      const baseMessage = successMessages[formData.contactReason] || 'Request sent!';
      showToast.success(`${baseMessage} Redirecting to your conversation...`);

      // Redirect to the engagement detail page (the specific request thread)
      setTimeout(() => {
        router.push(`/dashboard/my-providers/${createdRequest.id}`);
      }, 500);
    } catch (error: any) {
      showToast.error(error.message || 'Failed to send request');
      throw error;
    }
  };

  const formatProviderType = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <Breadcrumb />
        <ProviderDetailSkeleton />
      </div>
    );
  }

  if (!provider) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <Breadcrumb currentPage={provider.name} />

      {/* Provider Profile */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Main content - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 fade-in">
          {/* Header */}
          <div className="border-b pb-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{provider.name}</h1>
                <p className="text-lg text-primary-600 mb-2">
                  {formatProviderType(provider.providerType)}
                </p>
                <p className="text-gray-600">
                  📍 {provider.address}, {provider.city}, {provider.state} {provider.zipCode}
                </p>
              </div>
              {/* Save Button - visible for all users */}
              <button
                onClick={handleSaveToggle}
                disabled={saving}
                className={`flex-shrink-0 p-3 rounded-full transition-colors ${
                  isSaved
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } disabled:opacity-50`}
                title={isSaved ? 'Remove from saved' : 'Save provider'}
              >
                <svg className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill={isSaved ? 'currentColor' : 'none'}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            {/* Trust Badges & Availability */}
            <div className="flex flex-wrap gap-2">
              {provider.licensed && (
                <span className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Licensed
                </span>
              )}

              {provider.insuranceVerified && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Insured
                </span>
              )}

              {provider.backgroundChecked && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Background Checked
                </span>
              )}

              {Array.isArray(provider.certifications) && provider.certifications.map((cert) => (
                <span
                  key={cert}
                  className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {cert}
                </span>
              ))}

              {/* Availability Badge */}
              {provider.availableSpots !== null && provider.availableSpots > 0 && (
                <span className="bg-green-50 text-green-700 border border-green-300 px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {provider.availableSpots} {provider.availableSpots === 1 ? 'spot' : 'spots'} available
                </span>
              )}

              {provider.availableSpots === 0 && provider.totalCapacity && (
                <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  Currently at capacity
                </span>
              )}

              {provider.waitlistAvailable && provider.availableSpots === 0 && (
                <span className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full text-sm font-medium">
                  Waitlist available
                </span>
              )}

              {provider.claimed === true && (
                <span className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Claimed
                </span>
              )}

              {provider.claimed === false && (
                <span className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Unclaimed Profile
                </span>
              )}
            </div>
          </div>

          {/* Claim This Listing Banner - for unclaimed providers */}
          {provider.claimed === false && (
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-5 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Is this your business?</h3>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Claim this listing to manage your profile, respond to inquiries, and connect with families.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClaimClick}
                  className="w-full sm:w-auto px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Claim This Listing
                </button>
              </div>
            </div>
          )}

          {/* Photo Gallery */}
          {(provider.photos.length > 0 || provider.coverPhoto) && (
            <PhotoGallery
              photos={provider.photos}
              coverPhoto={provider.coverPhoto}
              providerName={provider.name}
            />
          )}

          {/* Description */}
          {provider.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">About</h2>
              <p className="text-gray-700 whitespace-pre-line">{provider.description}</p>
            </div>
          )}

          {/* Pricing */}
          {(provider.priceMin || provider.priceMax || provider.priceDescription || provider.paymentOptions.length > 0) && (
            <div className="mb-6 bg-primary-50 border border-primary-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Pricing & Payment</h2>

              {/* Price Range */}
              {(provider.priceMin || provider.priceMax) && (
                <div className="mb-4">
                  <p className="text-2xl font-bold text-primary-700">
                    {provider.priceMin && provider.priceMax ? (
                      `$${provider.priceMin.toLocaleString()} - $${provider.priceMax.toLocaleString()}/month`
                    ) : provider.priceMin ? (
                      `Starting from $${provider.priceMin.toLocaleString()}/month`
                    ) : (
                      `Up to $${provider.priceMax?.toLocaleString()}/month`
                    )}
                  </p>
                </div>
              )}

              {/* Price Description */}
              {provider.priceDescription && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">What&apos;s included:</p>
                  <p className="text-gray-600">{provider.priceDescription}</p>
                </div>
              )}

              {/* Payment Options */}
              {Array.isArray(provider.paymentOptions) && provider.paymentOptions.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Payment options accepted:</p>
                  <div className="flex flex-wrap gap-2">
                    {provider.paymentOptions.map((option) => (
                      <span
                        key={option}
                        className="bg-white text-primary-700 px-3 py-1 rounded-full text-sm border border-primary-300"
                      >
                        {option}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact for Pricing fallback */}
              {!provider.priceMin && !provider.priceMax && (
                <p className="text-gray-700 italic">Contact for pricing information</p>
              )}
            </div>
          )}

          {/* Care Types */}
          {Array.isArray(provider.careTypesOffered) && provider.careTypesOffered.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Care Services Offered</h2>
              <div className="flex flex-wrap gap-2">
                {provider.careTypesOffered.map((care) => (
                  <span
                    key={care}
                    className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm"
                  >
                    {formatProviderType(care)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Amenities Section */}
          <AmenitiesSection
            roomFeatures={provider.roomFeatures}
            commonAreas={provider.commonAreas}
            medicalServices={provider.medicalServices}
            activitiesOffered={provider.activitiesOffered}
            dietaryOptions={provider.dietaryOptions}
          />

          {/* Staff Section */}
          <StaffSection
            staffToResidentRatio={provider.staffToResidentRatio}
            hasRNOnSite={provider.hasRNOnSite}
            hasLVNOnSite={provider.hasLVNOnSite}
            allStaffBackgroundChecked={provider.allStaffBackgroundChecked}
            visitingDoctorFrequency={provider.visitingDoctorFrequency}
            caregiverTraining={provider.caregiverTraining}
            languagesSpoken={provider.languagesSpoken}
          />

          {/* Location Section */}
          <LocationSection
            address={provider.address}
            city={provider.city}
            state={provider.state}
            zipCode={provider.zipCode}
            latitude={provider.latitude}
            longitude={provider.longitude}
            neighborhoodDescription={provider.neighborhoodDescription}
            nearbyAmenities={provider.nearbyAmenities}
          />

          {/* Specialty Care Section */}
          <SpecialtyCareSection
            hasMemoryCare={provider.hasMemoryCare}
            hasRespiteCare={provider.hasRespiteCare}
            hasHospiceCare={provider.hasHospiceCare}
            specialtyPrograms={provider.specialtyPrograms}
            languagesSpoken={provider.languagesSpoken}
          />

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
              {/* Show contact info if revealed (organizations always, individual caregivers after acceptance) */}
              {provider.contactRevealed !== false ? (
                <div className="space-y-2">
                  {provider.phone && (
                    <p className="text-gray-700">
                      <span className="font-medium">Phone:</span> {provider.phone}
                    </p>
                  )}
                  {provider.email && (
                    <p className="text-gray-700">
                      <span className="font-medium">Email:</span> {provider.email}
                    </p>
                  )}
                  {provider.website && (
                    <p className="text-gray-700">
                      <span className="font-medium">Website:</span>{" "}
                      <a
                        href={provider.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline"
                      >
                        {provider.website}
                      </a>
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Contact info protected</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Send a consultation request to connect with this caregiver. Contact details will be shared once they accept.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Details</h3>
              <div className="space-y-2">
                {provider.yearsInBusiness && (
                  <p className="text-gray-700">
                    <span className="font-medium">Years in Business:</span> {provider.yearsInBusiness}
                  </p>
                )}
                {provider.capacity && (
                  <p className="text-gray-700">
                    <span className="font-medium">Capacity:</span> {provider.capacity} patients/residents
                  </p>
                )}
                {provider.serviceRadius && (
                  <p className="text-gray-700">
                    <span className="font-medium">Service Radius:</span> {provider.serviceRadius} miles
                  </p>
                )}
                {provider.licenseNumber && (
                  <p className="text-gray-700">
                    <span className="font-medium">License #:</span> {provider.licenseNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <ReviewsSection
            providerId={provider.id}
            averageRating={provider.averageRating}
            reviewCount={provider.reviewCount}
            onWriteReview={handleWriteReview}
          />

        </div>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="lg:col-span-1 mt-6 lg:mt-0">
          <div className="lg:sticky lg:top-24">
            <ProviderCTASection
              providerId={provider.id}
              providerName={provider.name}
              providerType={provider.providerType}
              phone={provider.phone}
              hasPricing={!!(provider.priceMin || provider.priceMax)}
              onOpenRequestForm={handleOpenRequestForm}
              activeEngagement={activeEngagement}
              isLoading={checkingEngagement || creatingEngagement}
            />
          </div>
        </div>
      </div>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingAction(undefined);
        }}
        defaultView="signup"
        intent={authIntent}
        pendingAction={pendingAction}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        providerId={provider.id}
        providerName={provider.name}
        onReviewSubmitted={handleReviewSubmitted}
      />

      {/* Enhanced Contact Modal */}
      <EnhancedContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        providerId={provider.id}
        providerName={provider.name}
        defaultReason={contactReason}
        onSubmit={handleContactSubmit}
      />

      {/* Claim Provider Modal */}
      <ClaimProviderModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        providerId={provider.id}
        providerName={provider.name}
        onClaimSuccess={handleClaimSuccess}
      />

      {/* Engagement Confirmation Modal */}
      <Transition appear show={confirmModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => {
            setConfirmModalOpen(false);
            setPendingContactReason(null);
          }}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold text-gray-900 text-center"
                  >
                    Connect with {provider.name}?
                  </Dialog.Title>

                  <div className="mt-4 space-y-4">
                    {/* Action summary */}
                    <div className="bg-primary-50 rounded-lg p-4">
                      <p className="text-sm text-primary-800 text-center">
                        <span className="font-medium">{pendingContactReason}</span>
                      </p>
                    </div>

                    {/* Mode mismatch warning: Provider mode trying to contact for care */}
                    {isProviderMode && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm text-amber-800">
                              You&apos;re currently browsing as a <span className="font-semibold">Provider</span>.
                              To contact this provider for care services, switch to Family mode.
                            </p>
                            <button
                              type="button"
                              onClick={() => handleSwitchMode('FAMILY')}
                              disabled={switchingMode}
                              className="mt-2 text-sm font-medium text-amber-700 hover:text-amber-800 underline disabled:opacity-50"
                            >
                              {switchingMode ? 'Switching...' : 'Switch to Family Mode'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Hiring suggestion: Family mode looking at independent caregiver with provider identity */}
                    {!isProviderMode && isIndependentCaregiver && hasProviderIdentity && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm text-blue-800">
                              Looking to <span className="font-semibold">hire</span> this caregiver for your organization?
                              Switch to Provider mode to send a hiring request.
                            </p>
                            <button
                              type="button"
                              onClick={() => handleSwitchMode('PROVIDER')}
                              disabled={switchingMode}
                              className="mt-2 text-sm font-medium text-blue-700 hover:text-blue-800 underline disabled:opacity-50"
                            >
                              {switchingMode ? 'Switching...' : 'Switch to Provider Mode'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Profile sharing notice (only show if not in provider mode - they can't proceed anyway) */}
                    {!isProviderMode && (
                      <div className="flex items-start gap-3 text-sm text-gray-600">
                        <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>
                          Your care profile will be shared with <span className="font-medium">{provider.name}</span> so they can better understand your needs and respond to your request.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setConfirmModalOpen(false);
                        setPendingContactReason(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                      onClick={handleConfirmEngagement}
                      disabled={creatingEngagement || isProviderMode}
                    >
                      {creatingEngagement ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Connecting...
                        </span>
                      ) : isProviderMode ? (
                        "Switch Mode First"
                      ) : (
                        "Connect & Share Profile"
                      )}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
