'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import MainNav from '@/components/Navigation/MainNav';
import Breadcrumb from '@/components/Navigation/Breadcrumb';
import Link from 'next/link';
import AuthModal from '@/components/Auth/AuthModal';
import { ProfileCardsSkeleton } from '@/components/UI/Skeleton';
import OrganizationCard from '@/components/Directory/OrganizationCard';

type Organization = {
  id: string;
  name: string;
  providerType: string;
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
  insuranceVerified?: boolean;
};

export default function BrowseOrganizationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [requestedOrganizationIds, setRequestedOrganizationIds] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (!session) {
      setAuthModalOpen(true);
      return;
    }

    // Check if user is an independent caregiver
    checkProviderType();
  }, [session]);

  const checkProviderType = async () => {
    try {
      const response = await fetch('/api/providers/me');
      if (response.ok) {
        const provider = await response.json();
        if (provider.providerType !== 'INDEPENDENT_CAREGIVER') {
          // Redirect if user is not an independent caregiver
          router.push('/provider/find-families');
          return;
        }
        // User is independent caregiver, fetch organizations
        fetchOrganizations();
        fetchSentHiringRequests();
      } else {
        // No provider profile, redirect to create one
        router.push('/dashboard/provider-profile');
      }
    } catch (err) {
      console.error('Error checking provider type:', err);
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      // Fetch all organization-type providers (exclude independent caregivers)
      const response = await fetch('/api/providers');
      if (response.ok) {
        const allProviders = await response.json();
        // Filter to only include organization types
        const orgs = allProviders.filter((p: Organization) =>
          p.providerType !== 'INDEPENDENT_CAREGIVER'
        );
        setOrganizations(orgs);
      }
    } catch (err) {
      console.error('Error fetching organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSentHiringRequests = async () => {
    try {
      const [sentResponse, receivedResponse] = await Promise.all([
        fetch('/api/requests?type=sent&requestType=HIRING'),
        fetch('/api/requests?type=received&requestType=HIRING')
      ]);

      const orgMap = new Map<string, string>();

      if (sentResponse.ok) {
        const sentRequests = await sentResponse.json();
        sentRequests.forEach((req: any) => {
          if (req.providerId) {
            orgMap.set(req.providerId, req.id);
          }
        });
      }

      if (receivedResponse.ok) {
        const receivedRequests = await receivedResponse.json();
        receivedRequests.forEach((req: any) => {
          if (req.providerId) {
            orgMap.set(req.providerId, req.id);
          }
        });
      }

      setRequestedOrganizationIds(orgMap);
    } catch (error) {
      console.error('Error fetching hiring requests:', error);
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Care Organizations</h1>
            <p className="text-lg text-gray-600">
              Find care organizations that may be hiring caregivers in your area
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Care Organizations</h1>
          <p className="text-lg text-gray-600">
            Find care organizations that may be hiring caregivers in your area
          </p>
        </div>

        {/* Results Count */}
        {organizations.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
            <p className="text-lg font-semibold text-gray-900">
              {organizations.length} Organization{organizations.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {organizations.length === 0 ? (
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">No organizations found</h3>
            <p className="mt-2 text-gray-600">
              There are currently no care organizations in your area.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => {
              const requestId = requestedOrganizationIds.get(org.id);
              const linkHref = requestId
                ? `/dashboard/requests/${requestId}`
                : `/caregiver/browse-organizations/${org.id}`;

              return (
                <OrganizationCard
                  key={org.id}
                  organization={org}
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
