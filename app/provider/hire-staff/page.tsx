'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import MainNav from '@/components/Navigation/MainNav';
import Breadcrumb from '@/components/Navigation/Breadcrumb';
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

  // Read mode from session (database is source of truth per Manual Ch 2)
  const isProviderMode = session?.user?.activeMode === 'PROVIDER';

  // Check for provider identity (Manual Ch 8: gentle nudges, not forced redirects)
  const { needsOnboarding, loading: identityLoading } = useProviderIdentity({
    checkMode: true,
  });

  useEffect(() => {
    // Wait for session to load
    if (status === 'loading' || identityLoading) return;

    // Redirect to login if unauthenticated (middleware also handles this)
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Session is authenticated but data might still be loading
    if (!session) return;

    // Note: No mode-based redirect per Manual Ch 2 (explicit routes).
    // This is a provider-specific page, but accessible to any authenticated user.
    // OnboardingPrompt below handles incomplete profiles with gentle nudges.

    // Fetch data (even if no identity - show empty states with prompt)
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
      // Fetch caregivers regardless of profile status
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
        // API returns { providers: [], pagination: {} } - extract the array
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

  // Don't render until session is available (let middleware handle auth redirects)
  if (!session) {
    return null;
  }

  // Render content based on loading state
  const renderContent = () => {
    if (loading) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Hire Care Staff</h1>
            <p className="text-lg text-gray-600">
              Browse independent caregivers available for employment
            </p>
          </div>
          <ProfileCardsSkeleton count={6} />
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Hire Care Staff</h1>
          <p className="text-lg text-gray-600">
            Browse independent caregivers available for employment
          </p>
        </div>

        {/* Gentle nudge for onboarding (Manual Ch 8) */}
        {needsOnboarding && <OnboardingPrompt context="hire" />}

        {/* Info banner for independent caregivers */}
        {isIndependentCaregiver && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-blue-900">Looking to work with organizations?</p>
                <p className="text-sm text-blue-700 mt-1">
                  As an independent caregiver, organizations can find and contact you through your profile.
                  Make sure your profile is complete and shows you&apos;re available for organization employment.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        {caregivers.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
            <p className="text-lg font-semibold text-gray-900">
              {caregivers.length} Caregiver{caregivers.length !== 1 ? 's' : ''} Available
            </p>
          </div>
        )}

        {/* Results */}
        {caregivers.length === 0 ? (
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-300"
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
            <h3 className="mt-4 text-xl font-semibold text-gray-900">No caregivers available yet</h3>
            <p className="mt-2 text-gray-600 max-w-md mx-auto">
              Independent caregivers who are available for organization employment will appear here.
              Check back soon as more caregivers join the platform.
            </p>
            <Link
              href="/provider/find-families"
              className="mt-6 inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors"
            >
              Browse Family Requests Instead
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caregivers.map((caregiver) => {
              const requestId = requestedCaregiverIds.get(caregiver.id);
              const linkHref = requestId
                ? `/dashboard/my-providers/${requestId}`
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
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <Breadcrumb />
      {renderContent()}
    </div>
  );
}
