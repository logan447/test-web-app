'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import MainNav from '@/components/Navigation/MainNav';
import Link from 'next/link';
import { showToast } from '@/lib/toast';

type FamilyProfile = {
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
  isSaved?: boolean;
};

export default function ProviderRequests() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profiles, setProfiles] = useState<FamilyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [searchState, setSearchState] = useState('');
  const [savedProfileIds, setSavedProfileIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    fetchProfiles();
    fetchSavedProfiles();
  }, [session, router]);

  const fetchProfiles = async () => {
    try {
      const params = new URLSearchParams();
      if (searchCity) params.append('city', searchCity);
      if (searchState) params.append('state', searchState);

      const response = await fetch(`/api/family-profiles?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProfiles(data);
      }
    } catch (err) {
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchProfiles();
  };

  const handleClear = () => {
    setSearchCity('');
    setSearchState('');
    setLoading(true);
    fetchProfiles();
  };

  const fetchSavedProfiles = async () => {
    try {
      const response = await fetch('/api/saved-families');
      if (response.ok) {
        const savedProfiles = await response.json();
        const ids = new Set(savedProfiles.map((p: any) => p.id));
        setSavedProfileIds(ids);
      }
    } catch (err) {
      console.error('Error fetching saved profiles:', err);
    }
  };

  const handleToggleSave = async (profileId: string) => {
    const isSaved = savedProfileIds.has(profileId);

    // Optimistic update
    setSavedProfileIds(prev => {
      const next = new Set(prev);
      if (isSaved) {
        next.delete(profileId);
      } else {
        next.add(profileId);
      }
      return next;
    });

    try {
      if (isSaved) {
        // Unsave
        const response = await fetch(`/api/saved-families?familyProfileId=${profileId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          showToast.success('Removed from saved');
        } else {
          throw new Error('Failed to unsave');
        }
      } else {
        // Save
        const response = await fetch('/api/saved-families', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ familyProfileId: profileId }),
        });
        if (response.ok) {
          showToast.success('Saved for later');
        } else {
          throw new Error('Failed to save');
        }
      }
    } catch (err) {
      console.error('Error toggling save:', err);
      showToast.error(isSaved ? 'Failed to remove from saved' : 'Failed to save');
      // Revert optimistic update on error
      setSavedProfileIds(prev => {
        const next = new Set(prev);
        if (isSaved) {
          next.add(profileId);
        } else {
          next.delete(profileId);
        }
        return next;
      });
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
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">Loading care requests...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Browse Care Requests</h1>
          <p className="mt-2 text-gray-600">
            Connect with families seeking care services in your area
          </p>
        </div>

        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  placeholder="Enter city"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={searchState}
                  onChange={(e) => setSearchState(e.target.value)}
                  placeholder="e.g., CA, NY"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Clear
                </button>
              </div>
            </div>
          </form>
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No care requests found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchCity || searchState
                ? 'Try adjusting your search filters'
                : 'No families have posted care requests yet. Check back soon!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Found {profiles.length} care request{profiles.length !== 1 ? 's' : ''}
            </p>

            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      Care Request in {profile.city}, {profile.state}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Posted {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary-600">
                        {formatBudget(profile.budgetMin, profile.budgetMax)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleSave(profile.id)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      title={savedProfileIds.has(profile.id) ? 'Remove from saved' : 'Save for later'}
                    >
                      {savedProfileIds.has(profile.id) ? (
                        <svg className="w-6 h-6 text-red-500 fill-current" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                      )}
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
                    <p className="text-gray-600 line-clamp-2">{profile.description}</p>
                  </div>
                )}

                {/* Action Button */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Location:</span> {profile.location}
                  </div>
                  <button
                    className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
                  >
                    View Full Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
