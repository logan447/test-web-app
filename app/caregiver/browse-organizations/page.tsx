'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import MainNav from '@/components/Navigation/MainNav';
import Link from 'next/link';
import AuthModal from '@/components/Auth/AuthModal';

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
          router.push('/provider/requests');
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

  const formatCareType = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const formatProviderType = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  if (!session) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Care Organizations</h1>
          <p className="text-gray-600">
            Find care organizations that may be hiring caregivers in your area
          </p>
        </div>

        {organizations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No organizations found</h3>
            <p className="mt-2 text-sm text-gray-500">
              There are currently no care organizations in your area.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => {
              const requestId = requestedOrganizationIds.get(org.id);
              const linkHref = requestId
                ? `/dashboard/requests/${requestId}`
                : `/caregiver/browse-organizations/${org.id}`;

              return (
                <Link
                  key={org.id}
                  href={linkHref}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h3 className="text-xl font-semibold text-gray-900 flex-1 min-w-0">
                      {org.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {org.licensed && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded whitespace-nowrap">
                          Licensed
                        </span>
                      )}
                      {requestId && (
                        <span className="text-xs bg-blue-100 text-blue-800 font-medium px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Request Sent
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-primary-600 mb-2">
                    {formatProviderType(org.providerType)}
                  </p>

                  <p className="text-sm text-gray-600 mb-3">
                    {org.city}, {org.state}
                  </p>

                  <p className="text-gray-700 text-sm mb-4 line-clamp-3 flex-grow">
                    {org.description}
                  </p>

                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-500 mb-2">Services Offered</h4>
                    <div className="flex flex-wrap gap-1">
                      {org.careTypesOffered.slice(0, 3).map((type) => (
                        <span
                          key={type}
                          className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded"
                        >
                          {formatCareType(type)}
                        </span>
                      ))}
                      {org.careTypesOffered.length > 3 && (
                        <span className="text-xs px-2 py-1 text-gray-500">
                          +{org.careTypesOffered.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{org.yearsInBusiness}</span> years in business
                  </div>
                </Link>
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
