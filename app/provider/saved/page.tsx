'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import MainNav from '@/components/Navigation/MainNav';
import Link from 'next/link';
import { showToast } from '@/lib/toast';
import { ProfileCardsSkeleton } from '@/components/UI/Skeleton';

type SavedFamilyProfile = {
  id: string;
  user: {
    name: string;
    email: string;
    phone: string | null;
  };
  careTypes: string[];
  location: string;
  city: string;
  state: string;
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string | null;
  description: string | null;
  createdAt: string;
  savedAt: string;
  savedId: string;
  notes: string | null;
};

export default function SavedFamilyProfiles() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profiles, setProfiles] = useState<SavedFamilyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedProfileIds, setRequestedProfileIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    fetchSavedProfiles();
    fetchSentRequests();
  }, [session, router]);

  const fetchSavedProfiles = async () => {
    try {
      const response = await fetch('/api/saved-families');
      if (response.ok) {
        const data = await response.json();
        setProfiles(data);
      }
    } catch (err) {
      console.error('Error fetching saved profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const response = await fetch('/api/requests?type=sent');
      if (response.ok) {
        const requests = await response.json();
        const profileIds = new Set<string>(requests.map((req: any) => req.familyProfileId as string));
        setRequestedProfileIds(profileIds);
      }
    } catch (error) {
      console.error('Error fetching sent requests:', error);
    }
  };

  const handleRemove = async (familyProfileId: string) => {
    try {
      const response = await fetch(`/api/saved-families?familyProfileId=${familyProfileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProfiles(prev => prev.filter(p => p.id !== familyProfileId));
        showToast.success('Removed from saved');
      } else {
        throw new Error('Failed to remove');
      }
    } catch (err) {
      console.error('Error removing saved profile:', err);
      showToast.error('Failed to remove from saved');
    }
  };

  const formatCareType = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Budget not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}/mo`;
    if (min) return `$${min.toLocaleString()}+/mo`;
    if (max) return `Up to $${max.toLocaleString()}/mo`;
    return 'Budget not specified';
  };

  if (!session) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/provider/requests"
                className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Browse
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Saved Care Requests</h1>
            <p className="mt-2 text-gray-600">
              Family profiles you&apos;ve saved for follow-up
            </p>
          </div>
          <ProfileCardsSkeleton count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/provider/requests"
              className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Browse
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Saved Care Requests</h1>
          <p className="mt-2 text-gray-600">
            Family profiles you&apos;ve saved for follow-up
          </p>
        </div>

        {/* Results */}
        {profiles.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
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
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No saved care requests
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Start browsing care requests and save the ones you&apos;re interested in.
            </p>
            <div className="mt-6">
              <Link
                href="/provider/requests"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Browse Care Requests
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {profiles.length} saved request{profiles.length !== 1 ? 's' : ''}
            </p>

            {profiles.map((profile) => (
              <div
                key={profile.savedId}
                className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Care Request in {profile.city}, {profile.state}
                      </h3>
                      {requestedProfileIds.has(profile.id) && (
                        <span className="text-xs bg-blue-100 text-blue-800 font-medium px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Request Sent
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Posted {new Date(profile.createdAt).toLocaleDateString()} • Saved {new Date(profile.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary-600">
                        {formatBudget(profile.budgetMin, profile.budgetMax)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemove(profile.id)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      title="Remove from saved"
                    >
                      <svg className="w-6 h-6 text-red-500 fill-current" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Care Types */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Care Types Needed:</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.careTypes.map((type) => (
                      <span
                        key={type}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {formatCareType(type)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                {profile.timeline && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700">Timeline:</p>
                    <p className="text-gray-900">{profile.timeline}</p>
                  </div>
                )}

                {/* Description Preview */}
                {profile.description && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Additional Details:</p>
                    <p className="text-gray-600">{profile.description}</p>
                  </div>
                )}

                {/* Notes */}
                {profile.notes && (
                  <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">My Notes:</p>
                    <p className="text-gray-900 text-sm">{profile.notes}</p>
                  </div>
                )}

                {/* Location */}
                <div className="text-sm text-gray-500 pt-4 border-t">
                  <span className="font-medium">Location:</span> {profile.location}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/provider/requests/${profile.id}`}
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-medium text-center"
                  >
                    Send Request
                  </Link>
                  <Link
                    href={`/provider/requests/${profile.id}`}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 font-medium text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
