'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import MainNav from '@/components/Navigation/MainNav';
import Link from 'next/link';
import { showToast } from '@/lib/toast';
import { ProfileCardsSkeleton } from '@/components/UI/Skeleton';
import SavedFamilyCard from '@/components/Directory/SavedFamilyCard';

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

function SavedFamilyProfilesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profiles, setProfiles] = useState<SavedFamilyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedProfileIds, setRequestedProfileIds] = useState<Map<string, string>>(new Map());
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push('/login');
      return;
    }
    fetchSavedProfiles();
    fetchSentRequests();
  }, [session, status, router]);

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
        // Build a map from familyProfileId to requestId
        const profileMap = new Map<string, string>();
        requests.forEach((req: any) => {
          if (req.familyProfileId) {
            profileMap.set(req.familyProfileId, req.id);
          }
        });
        setRequestedProfileIds(profileMap);
      }
    } catch (error) {
      console.error('Error fetching sent requests:', error);
    }
  };

  const handleRemove = async (familyProfileId: string) => {
    // Optimistically remove from UI
    setProfiles(prev => prev.filter(p => p.id !== familyProfileId));

    try {
      const response = await fetch(`/api/saved-families?familyProfileId=${familyProfileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast.success('Removed from saved');
      } else {
        throw new Error('Failed to remove');
      }
    } catch (err) {
      console.error('Error removing saved profile:', err);
      showToast.error('Failed to remove from saved');
      // Refetch to restore state on error
      fetchSavedProfiles();
    }
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Saved Families</h1>
            <p className="text-lg text-gray-600">
              Family profiles you&apos;ve saved for future reference and follow-up
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Saved Families</h1>
          <p className="text-lg text-gray-600">
            Family profiles you&apos;ve saved for future reference and follow-up
          </p>
        </div>

        {/* Results Count */}
        {profiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
            <p className="text-lg font-semibold text-gray-900">
              {profiles.length} Saved {profiles.length !== 1 ? 'Families' : 'Family'}
            </p>
          </div>
        )}

        {/* Results */}
        {profiles.length === 0 ? (
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
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              No saved families
            </h3>
            <p className="mt-2 text-gray-600">
              Start browsing family profiles and save the ones you&apos;re interested in connecting with.
            </p>
            <div className="mt-6">
              <Link
                href="/provider/requests"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 font-semibold transition-all shadow-sm hover:shadow-md"
              >
                Browse Families
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => {
              const requestId = requestedProfileIds.get(profile.id);

              return (
                <SavedFamilyCard
                  key={profile.savedId}
                  profile={profile}
                  hasRequest={!!requestId}
                  requestId={requestId}
                  onRemove={handleRemove}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SavedFamilyProfiles() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProfileCardsSkeleton />
        </div>
      </div>
    }>
      <SavedFamilyProfilesContent />
    </Suspense>
  );
}
