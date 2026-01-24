'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import MainNav from '@/components/Navigation/MainNav';
import Footer from '@/components/Navigation/Footer';
import Link from 'next/link';
import { ProfileCardsSkeleton } from '@/components/UI/Skeleton';
import CaregiverCard from '@/components/Directory/CaregiverCard';
import OnboardingPrompt from '@/components/Provider/OnboardingPrompt';
import { useProviderIdentity } from '@/hooks/useProviderIdentity';

type Caregiver = {
  id: string;
  name: string;
  description: string;
  careTypesOffered: string[];
  city: string;
  state: string;
  yearsInBusiness: number;
  licensed: boolean;
  email: string;
  phone: string;
  coverPhoto?: string | null;
  photos?: string[];
  verified?: boolean;
  backgroundChecked?: boolean;
  certifications?: string[];
  averageRating?: number | null;
  reviewCount?: number;
};

export default function HireStaffPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedCaregiverIds, setRequestedCaregiverIds] = useState<Map<string, string>>(new Map());
  const [isIndependentCaregiver, setIsIndependentCaregiver] = useState(false);
  const [filters, setFilters] = useState({
    city: '',
    careType: '',
  });

  const isProviderMode = session?.user?.activeMode === 'PROVIDER';
  const { needsOnboarding, loading: identityLoading } = useProviderIdentity({
    checkMode: true,
  });

  useEffect(() => {
    if (status === 'loading' || identityLoading) return;

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (!session) return;

    checkProviderType();
  }, [session, status, router, isProviderMode, identityLoading]);

  const checkProviderType = async () => {
    try {
      const response = await fetch('/api/providers/me');
      if (response.ok) {
        const provider = await response.json();
        if (provider.providerType === 'INDEPENDENT_CAREGIVER') {
          setIsIndependentCaregiver(true);
        }
      }
      fetchCaregivers();
      fetchSentRequests();
    } catch (err) {
      console.error('Error checking provider type:', err);
      fetchCaregivers();
    }
  };

  const fetchCaregivers = async () => {
    try {
      const response = await fetch('/api/providers?availableForOrganizations=true');
      if (response.ok) {
        const data = await response.json();
        setCaregivers(data.providers || []);
      }
    } catch (err) {
      console.error('Error fetching caregivers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const [sentResponse, receivedResponse] = await Promise.all([
        fetch('/api/requests?type=sent'),
        fetch('/api/requests?type=received')
      ]);

      const caregiverMap = new Map<string, string>();

      if (sentResponse.ok) {
        const sentRequests = await sentResponse.json();
        sentRequests.forEach((req: any) => {
          if (req.providerId) {
            caregiverMap.set(req.providerId, req.id);
          }
        });
      }

      if (receivedResponse.ok) {
        const receivedRequests = await receivedResponse.json();
        receivedRequests.forEach((req: any) => {
          if (req.providerId) {
            caregiverMap.set(req.providerId, req.id);
          }
        });
      }

      setRequestedCaregiverIds(caregiverMap);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  if (!session) {
    return null;
  }

  const contactedCount = requestedCaregiverIds.size;
  const verifiedCount = caregivers.filter(c => c.verified || c.backgroundChecked).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        {/* Skeleton Hero */}
        <div className="bg-gradient-to-br from-violet-600 via-violet-700 to-purple-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse">
              <div className="h-10 bg-white/20 rounded-lg w-1/3 mb-4"></div>
              <div className="h-5 bg-white/20 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProfileCardsSkeleton count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-violet-600 via-violet-700 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-2 rounded-lg">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">Hire Care Staff</h1>
              </div>
              <p className="text-violet-100 text-lg">
                Browse qualified independent caregivers available for employment
              </p>
            </div>
            <Link
              href="/provider/requests"
              className="inline-flex items-center gap-2 bg-white text-violet-700 px-6 py-3 rounded-xl font-semibold hover:bg-violet-50 transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              View Applications
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{caregivers.length}</div>
              <div className="text-violet-100 text-sm">Available</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{verifiedCount}</div>
              <div className="text-violet-100 text-sm">Verified</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{contactedCount}</div>
              <div className="text-violet-100 text-sm">Contacted</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Onboarding Prompt */}
        {needsOnboarding && (
          <div className="mb-8">
            <OnboardingPrompt context="hire" />
          </div>
        )}

        {/* Info banner for independent caregivers */}
        {isIndependentCaregiver && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-blue-900">Looking to work with organizations?</p>
                <p className="text-sm text-blue-700 mt-1">
                  As an independent caregiver, organizations can find and contact you through your profile.
                  Make sure your profile shows you&apos;re available for organization employment.
                </p>
                <Link
                  href="/provider/organizations"
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 mt-2"
                >
                  Browse Organizations
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        {caregivers.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {caregivers.length} Caregiver{caregivers.length !== 1 ? 's' : ''} Available
                </p>
                <p className="text-sm text-gray-600">
                  Independent caregivers open to employment opportunities
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {caregivers.length === 0 ? (
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-violet-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No caregivers available yet</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Independent caregivers who are available for organization employment will appear here.
              Check back soon as more caregivers join the platform.
            </p>
            <Link
              href="/provider/leads"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 font-semibold transition-colors"
            >
              Browse Family Requests Instead
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caregivers.map((caregiver) => {
              const requestId = requestedCaregiverIds.get(caregiver.id);
              const linkHref = requestId
                ? `/provider/candidates/${requestId}`
                : `/provider/hire-staff/${caregiver.id}`;

              return (
                <CaregiverCard
                  key={caregiver.id}
                  caregiver={caregiver}
                  linkHref={linkHref}
                  hasRequest={!!requestId}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer variant="light" />
    </div>
  );
}
