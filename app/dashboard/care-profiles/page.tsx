"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";

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
};

export default function BrowseFamiliesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profiles, setProfiles] = useState<FamilyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState("");
  const [searchState, setSearchState] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProfiles();
    }
  }, [status]);

  const fetchProfiles = async () => {
    try {
      const params = new URLSearchParams();
      if (searchCity) params.append("city", searchCity);
      if (searchState) params.append("state", searchState);

      const response = await fetch(`/api/family-profiles?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProfiles(data);
      }
    } catch (err) {
      console.error("Error fetching profiles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchProfiles();
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/dashboard" className="text-primary-600 hover:text-primary-700">
              ← Back to Dashboard
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Families</h1>

          {/* Search Filters - skeleton */}
          <div className="bg-white rounded-lg shadow p-6 mb-6 animate-pulse">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Profiles Grid - skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-primary-600 hover:text-primary-700">
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Families</h1>

        {/* Search Filters */}
        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter city"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                value={searchState}
                onChange={(e) => setSearchState(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="CA"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        {/* Profiles List */}
        {profiles.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">
              No family care profiles found. Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <div key={profile.id} className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {profile.user.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {profile.city}, {profile.state}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Posted {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-1">
                      Care Types
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {profile.careTypes.map((type) => (
                        <span
                          key={type}
                          className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs"
                        >
                          {type.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>

                  {(profile.budgetMin || profile.budgetMax) && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 mb-1">
                        Budget
                      </h4>
                      <p className="text-sm text-gray-900">
                        ${profile.budgetMin?.toLocaleString() || "0"} - $
                        {profile.budgetMax?.toLocaleString() || "Flexible"}
                        /month
                      </p>
                    </div>
                  )}

                  {profile.timeline && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 mb-1">
                        Timeline
                      </h4>
                      <p className="text-sm text-gray-900">{profile.timeline}</p>
                    </div>
                  )}

                  {profile.description && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 mb-1">
                        Description
                      </h4>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {profile.description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Email:</span>
                    <a
                      href={`mailto:${profile.user.email}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      Contact
                    </a>
                  </div>
                  {profile.user.phone && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Phone:</span>
                      <a
                        href={`tel:${profile.user.phone}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {profile.user.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
