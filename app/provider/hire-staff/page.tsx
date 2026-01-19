'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import MainNav from '@/components/Navigation/MainNav';
import Breadcrumb from '@/components/Navigation/Breadcrumb';
import Link from 'next/link';
import AuthModal from '@/components/Auth/AuthModal';
import { ProfileCardsSkeleton } from '@/components/UI/Skeleton';
import CaregiverCard from '@/components/Directory/CaregiverCard';

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
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [requestedCaregiverIds, setRequestedCaregiverIds] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    // Wait for session to load
    if (status === 'loading') return;

    // Only show auth modal if definitively unauthenticated
    if (status === 'unauthenticated') {
      setAuthModalOpen(true);
      return;
    }

    // Session is authenticated but data might still be loading
    if (!session) return;

    // Check if user has organization-type provider profile
    checkProviderType();
  }, [session, status]);

  const checkProviderType = async () => {
    try {
      const response = await fetch('/api/providers/me');
      if (response.ok) {
        const provider = await response.json();
        if (provider.providerType === 'INDEPENDENT_CAREGIVER') {
          // Redirect if user is an independent caregiver, not an organization
          router.push('/provider/requests');
          return;
        }
        // User has organization profile, fetch caregivers
        fetchCaregivers();
        fetchSentRequests();
      } else {
        // No provider profile, redirect to create one
        router.push('/dashboard/provider-profile');
      }
    } catch (err) {
      console.error('Error checking provider type:', err);
      setLoading(false);
    }
  };

  const fetchCaregivers = async () => {
    try {
      const response = await fetch('/api/providers?availableForOrganizations=true');
      if (response.ok) {
        const data = await response.json();
        setCaregivers(data);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <Breadcrumb />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Hire Care Staff</h1>
            <p className="text-lg text-gray-600">
              Browse independent caregivers available for employment by your organization
            </p>
          </div>
          <ProfileCardsSkeleton count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <Breadcrumb />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Hire Care Staff</h1>
          <p className="text-lg text-gray-600">
            Browse independent caregivers available for employment by your organization
          </p>
        </div>

        {/* Results Count */}
        {caregivers.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
            <p className="text-lg font-semibold text-gray-900">
              {caregivers.length} Caregiver{caregivers.length !== 1 ? 's' : ''} Available
            </p>
          </div>
        )}

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
            <h3 className="mt-4 text-xl font-semibold text-gray-900">No caregivers available</h3>
            <p className="mt-2 text-gray-600">
              There are currently no independent caregivers available for hire in your area.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caregivers.map((caregiver) => {
              const requestId = requestedCaregiverIds.get(caregiver.id);
              const linkHref = requestId
                ? `/dashboard/requests/${requestId}`
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

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          router.push('/');
        }}
        defaultView="login"
      />
    </div>
  );
}
