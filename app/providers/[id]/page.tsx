"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild, Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ProviderType } from "@prisma/client";
import MainNav from "@/components/Navigation/MainNav";
import AuthModal, { PendingAction } from "@/components/Auth/AuthModal";
import ReviewModal from "@/components/Reviews/ReviewModal";
import ClaimProviderModal from "@/components/Provider/ClaimProviderModal";
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
};

type ActiveEngagement = {
  id: string;
  status: string;
} | null;

// Rating bar component
function RatingBar({ label, value, maxValue = 5 }: { label: string; value: number; maxValue?: number }) {
  const percentage = (value / maxValue) * 100;
  const segments = 5;

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-700 w-48">{label}: {value.toFixed(1)} / {maxValue}</span>
      <div className="flex-1 flex gap-0.5">
        {Array.from({ length: segments }).map((_, i) => {
          const segmentStart = (i / segments) * 100;
          const segmentEnd = ((i + 1) / segments) * 100;
          const fillPercentage = Math.max(0, Math.min(100, ((percentage - segmentStart) / (segmentEnd - segmentStart)) * 100));

          return (
            <div key={i} className="flex-1 h-2 bg-gray-200 rounded-sm overflow-hidden">
              <div
                className="h-full bg-primary-600 transition-all duration-500"
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | undefined>(undefined);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [activeEngagement, setActiveEngagement] = useState<ActiveEngagement>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState(0);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    details: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProvider();
    if (session?.user) {
      checkIfSaved();
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

  const handleSaveToggle = async () => {
    if (!session?.user) {
      setPendingAction({ type: 'save', providerId: params.id as string, providerName: provider?.name });
      setAuthModalOpen(true);
      return;
    }

    setSaving(true);
    try {
      if (isSaved) {
        await fetch(`/api/saved-providers?providerId=${params.id}`, { method: 'DELETE' });
        setIsSaved(false);
        showToast.success('Removed from saved');
      } else {
        await fetch('/api/saved-providers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ providerId: params.id }),
        });
        setIsSaved(true);
        showToast.success('Provider saved');
      }
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

    setSubmitting(true);
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: params.id,
          message: contactForm.details || 'I would like to learn more about your services.',
          contactReason: 'Request information',
        }),
      });

      if (response.ok) {
        const engagement = await response.json();
        showToast.success('Request sent successfully!');
        router.push(`/requests/${engagement.id}`);
      } else {
        throw new Error('Failed to send request');
      }
    } catch (error) {
      showToast.error('Failed to send request');
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

  // Mock rating breakdown (in real app, fetch from reviews)
  const ratingBreakdown = {
    communitySentiment: 5.0,
    value: 4.2,
    informationAvailability: 5.0,
  };

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
                      isSaved
                        ? 'border-red-200 text-red-500 hover:bg-red-50'
                        : 'border-gray-300 text-gray-400 hover:text-red-500 hover:border-red-200'
                    }`}
                  >
                    <span className="sr-only">{isSaved ? 'Unsave' : 'Save'}</span>
                    <svg className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} viewBox="0 0 24 24" stroke="currentColor" fill={isSaved ? 'currentColor' : 'none'} strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>

                <p className="text-gray-600 mb-3">{provider.address}, {provider.city} {provider.state}</p>

                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full mb-6">
                  {formatProviderType(provider.providerType)}
                </span>

                {/* Pricing & Rating Cards */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Pricing Card */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                      Estimated Pricing
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
              </div>
            </div>

            {/* Tab Navigation */}
            <TabGroup selectedIndex={selectedTab} onChange={setSelectedTab}>
              <TabList className="flex border-b border-gray-200 mb-6">
                {['Rating', 'About', 'Services', 'Pricing', 'Location'].map((tab) => (
                  <Tab
                    key={tab}
                    className={({ selected }) =>
                      `px-6 py-3 text-sm font-medium border-b-2 -mb-px transition-colors focus:outline-none ${
                        selected
                          ? 'border-primary-600 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`
                    }
                  >
                    {tab}
                  </Tab>
                ))}
              </TabList>

              <TabPanels>
                {/* Rating Tab */}
                <TabPanel className="space-y-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                        {provider.averageRating?.toFixed(1) || 'N/A'}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">{provider.name} Rating</h2>
                        <button className="text-sm text-primary-600 hover:underline">
                          Learn about how the Olera Score is calculated
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <RatingBar label="Community sentiment" value={ratingBreakdown.communitySentiment} />
                      <RatingBar label="Value" value={ratingBreakdown.value} />
                      <RatingBar label="Information Availability" value={ratingBreakdown.informationAvailability} />
                    </div>

                    <button
                      onClick={() => setReviewModalOpen(true)}
                      className="mt-6 px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Add review
                    </button>
                  </div>

                  {/* Q&A Section */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-4">
                      Customer Questions & Answers
                    </h3>
                    <div className="py-4 border-b border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-medium text-sm">
                          Q
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">What services do you offer?</p>
                          <p className="text-xs text-gray-500 mt-1">Sample User · today · <span className="text-primary-600">User</span></p>
                          <div className="flex items-center gap-4 mt-2">
                            <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                              Like (0)
                            </button>
                            <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              Reply (0)
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="w-full mt-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                      Post Your Question
                    </button>
                  </div>
                </TabPanel>

                {/* About Tab */}
                <TabPanel>
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">About {provider.name}</h2>
                    {provider.description ? (
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">{provider.description}</p>
                    ) : (
                      <p className="text-gray-500 italic">No description available.</p>
                    )}

                    {provider.certifications?.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Certifications</h3>
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
                </TabPanel>

                {/* Services Tab */}
                <TabPanel>
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Services Offered</h2>
                    {provider.careTypesOffered?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {provider.careTypesOffered.map((care) => (
                          <span key={care} className="px-4 py-2 bg-primary-50 text-primary-700 text-sm font-medium rounded-xl">
                            {formatProviderType(care)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No services listed.</p>
                    )}

                    {provider.medicalServices?.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Medical Services</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {provider.medicalServices.map((service) => (
                            <div key={service} className="flex items-center gap-2 text-sm text-gray-600">
                              <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {service}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabPanel>

                {/* Pricing Tab */}
                <TabPanel>
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing Information</h2>

                    {(provider.priceMin || provider.priceMax) && (
                      <div className="bg-primary-50 rounded-xl p-6 mb-6">
                        <p className="text-3xl font-bold text-primary-700">
                          {provider.priceMin && provider.priceMax
                            ? `$${provider.priceMin.toLocaleString()} – $${provider.priceMax.toLocaleString()}`
                            : provider.priceMin
                            ? `From $${provider.priceMin.toLocaleString()}`
                            : `Up to $${provider.priceMax?.toLocaleString()}`}
                          <span className="text-lg font-medium text-primary-600"> / month</span>
                        </p>
                      </div>
                    )}

                    {provider.priceDescription && (
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">What&apos;s included</h3>
                        <p className="text-gray-600">{provider.priceDescription}</p>
                      </div>
                    )}

                    {provider.paymentOptions?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Options</h3>
                        <div className="flex flex-wrap gap-2">
                          {provider.paymentOptions.map((option) => (
                            <span key={option} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                              {option}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabPanel>

                {/* Location Tab */}
                <TabPanel>
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
                    <div className="flex items-start gap-3 mb-4">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <p className="text-gray-900 font-medium">{provider.address}</p>
                        <p className="text-gray-600">{provider.city}, {provider.state} {provider.zipCode}</p>
                      </div>
                    </div>

                    {provider.neighborhoodDescription && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">About the Neighborhood</h3>
                        <p className="text-gray-600">{provider.neighborhoodDescription}</p>
                      </div>
                    )}

                    {provider.nearbyAmenities?.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Nearby Amenities</h3>
                        <div className="flex flex-wrap gap-2">
                          {provider.nearbyAmenities.map((amenity) => (
                            <span key={amenity} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabPanel>
              </TabPanels>
            </TabGroup>
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:w-1/3">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 text-center mb-6">
                  Connect with {provider.name}
                </h2>

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.fullName}
                      onChange={(e) => setContactForm({ ...contactForm, fullName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional details (optional)
                    </label>
                    <textarea
                      rows={4}
                      value={contactForm.details}
                      onChange={(e) => setContactForm({ ...contactForm, details: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                  </div>

                  <p className="text-xs text-gray-500">
                    By submitting your information, you agree to our{' '}
                    <Link href="/terms" className="text-primary-600 hover:underline">TOS</Link>
                    {' '}&{' '}
                    <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.
                  </p>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : activeEngagement ? 'View Conversation' : 'Submit'}
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
    </div>
  );
}
