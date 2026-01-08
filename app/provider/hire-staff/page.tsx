'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import MainNav from '@/components/Navigation/MainNav';
import Link from 'next/link';
import AuthModal from '@/components/Auth/AuthModal';

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
};

export default function HireStaffPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [requestedCaregiverIds, setRequestedCaregiverIds] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (!session) {
      setAuthModalOpen(true);
      return;
    }

    // Check if user has organization-type provider profile
    checkProviderType();
  }, [session]);

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

  const formatCareType = (type: string) => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hire Care Staff</h1>
          <p className="text-gray-600">
            Browse independent caregivers available for employment by your organization
          </p>
        </div>

        {caregivers.length === 0 ? (
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No caregivers available</h3>
            <p className="mt-2 text-sm text-gray-500">
              There are currently no independent caregivers available for hire in your area.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caregivers.map((caregiver) => {
              const requestId = requestedCaregiverIds.get(caregiver.id);
              const linkHref = requestId
                ? `/dashboard/requests/${requestId}`
                : `/provider/hire-staff/${caregiver.id}`;

              return (
                <Link
                  key={caregiver.id}
                  href={linkHref}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h3 className="text-xl font-semibold text-gray-900 flex-1 min-w-0">
                      {caregiver.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {caregiver.licensed && (
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

                  <p className="text-sm text-gray-600 mb-3">
                    {caregiver.city}, {caregiver.state}
                  </p>

                  <p className="text-gray-700 text-sm mb-4 line-clamp-3 flex-grow">
                    {caregiver.description}
                  </p>

                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-500 mb-2">Care Types</h4>
                    <div className="flex flex-wrap gap-1">
                      {caregiver.careTypesOffered.slice(0, 3).map((type) => (
                        <span
                          key={type}
                          className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded"
                        >
                          {formatCareType(type)}
                        </span>
                      ))}
                      {caregiver.careTypesOffered.length > 3 && (
                        <span className="text-xs px-2 py-1 text-gray-500">
                          +{caregiver.careTypesOffered.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{caregiver.yearsInBusiness}</span> years of experience
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
