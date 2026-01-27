"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import Footer from "@/components/Navigation/Footer";
import EngagementCalendar, { ScheduledEvent } from "@/components/Engagement/EngagementCalendar";
import { useProviderIdentity } from "@/hooks/useProviderIdentity";

interface TourData {
  id: string;
  proposedDate: string;
  proposedTime: string;
  status: string;
  request: {
    id: string;
    sender: { id: string; name: string };
    familyProfile?: { id: string; lovedOneName?: string };
  };
}

interface QuickStats {
  pendingRequests: number;
  activeConversations: number;
  newLeads?: number;
  matchedFamilies?: number;
}

interface Provider {
  id: string;
  name: string;
  providerType: string;
  city?: string;
  state?: string;
  profilePhoto?: string;
  description?: string;
  careTypesOffered?: string[];
  isVisible?: boolean;
}

// Helper to determine if provider is an individual caregiver
const isIndividualCaregiver = (type: string) => type === "INDEPENDENT_CAREGIVER";

// Calculate profile completion percentage
const calculateProfileCompletion = (provider: Provider | null): { percentage: number; missing: string[] } => {
  if (!provider) return { percentage: 0, missing: [] };

  const fields = [
    { key: "name", label: "Organization/Name", weight: 20 },
    { key: "city", label: "Location", weight: 15 },
    { key: "description", label: "Description", weight: 20 },
    { key: "profilePhoto", label: "Profile photo", weight: 25 },
    { key: "careTypesOffered", label: "Care types", weight: 20, isArray: true },
  ];

  let completed = 0;
  const missing: string[] = [];

  for (const field of fields) {
    const value = provider[field.key as keyof Provider];
    if (field.isArray) {
      if (Array.isArray(value) && value.length > 0) {
        completed += field.weight;
      } else {
        missing.push(field.label);
      }
    } else if (value) {
      completed += field.weight;
    } else {
      missing.push(field.label);
    }
  }

  return { percentage: completed, missing };
};

export default function ProviderProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [calendarEvents, setCalendarEvents] = useState<ScheduledEvent[]>([]);
  const [stats, setStats] = useState<QuickStats>({ pendingRequests: 0, activeConversations: 0, newLeads: 0, matchedFamilies: 0 });
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);

  const { needsOnboarding, loading: identityLoading } = useProviderIdentity({ checkMode: true });

  // Determine if this is a caregiver (job-seeker) vs organization
  const isCaregiver = provider ? isIndividualCaregiver(provider.providerType) : false;
  const profileCompletion = calculateProfileCompletion(provider);

  useEffect(() => {
    if (status === "loading" || identityLoading) return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (!session) return;
    fetchDashboardData();
  }, [session, status, router, identityLoading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, toursRes, providerRes, leadsRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/dashboard/tours"),
        fetch("/api/providers/me"),
        fetch("/api/provider/matches"),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(prev => ({
          ...prev,
          pendingRequests: data.stats?.pendingRequests ?? 0,
          activeConversations: data.stats?.activeConversations ?? 0,
        }));
      }

      if (providerRes.ok) {
        const data = await providerRes.json();
        setProvider(data);
      }

      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setStats(prev => ({
          ...prev,
          matchedFamilies: Array.isArray(data) ? data.length : 0,
        }));
      }

      if (toursRes.ok) {
        const data = await toursRes.json();
        const tours: TourData[] = data.tours || [];
        const events: ScheduledEvent[] = tours.map((tour) => ({
          id: tour.id,
          date: new Date(tour.proposedDate),
          title: tour.request.familyProfile?.lovedOneName
            ? `Tour with ${tour.request.familyProfile.lovedOneName}'s family`
            : `Tour with ${tour.request.sender.name}`,
          type: "tour" as const,
          familyName: tour.request.sender.name,
          familyProfileId: tour.request.familyProfile?.id,
          engagementId: tour.request.id,
        }));
        setCalendarEvents(events);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </main>
      </div>
    );
  }

  const userName = session?.user?.name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainNav />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {/* Simple Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {userName}
            </h1>
            <p className="text-gray-600 mt-1">
              {isCaregiver ? "Your job search dashboard" : "Your provider dashboard"}
            </p>
          </div>
          <Link
            href="/provider/profile/edit"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </Link>
        </div>

        {/* Priorities Section - Shows items needing attention */}
        {(stats.pendingRequests > 0 || (stats.matchedFamilies ?? 0) > 0) && (
          <div className="mb-6 space-y-3">
            {stats.pendingRequests > 0 && (
              <Link
                href="/provider/requests"
                className="block bg-amber-50 border border-amber-200 rounded-xl p-4 hover:bg-amber-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">🔔</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-amber-900">
                      {stats.pendingRequests} {stats.pendingRequests === 1 ? "request" : "requests"} awaiting response
                    </p>
                    <p className="text-sm text-amber-700">Respond to keep conversations moving</p>
                  </div>
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )}
            {!isCaregiver && (stats.matchedFamilies ?? 0) > 0 && (
              <Link
                href="/provider/leads"
                className="block bg-emerald-50 border border-emerald-200 rounded-xl p-4 hover:bg-emerald-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">👨‍👩‍👧</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-emerald-900">
                      {stats.matchedFamilies} {stats.matchedFamilies === 1 ? "family" : "families"} matched to you
                    </p>
                    <p className="text-sm text-emerald-700">Respond to start a conversation</p>
                  </div>
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )}
          </div>
        )}

        {/* Profile Strength Indicator */}
        {profileCompletion.percentage < 100 && (
          <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-gray-900">Profile strength: {profileCompletion.percentage}%</p>
                <p className="text-sm text-gray-600">Complete your profile to get more responses</p>
              </div>
              <Link
                href="/provider/profile/edit"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                Complete →
              </Link>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${profileCompletion.percentage}%` }}
              />
            </div>
            {profileCompletion.missing.length > 0 && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Add:</span>{" "}
                {profileCompletion.missing.slice(0, 3).join(", ")}
                {profileCompletion.missing.length > 3 && ` +${profileCompletion.missing.length - 3} more`}
              </div>
            )}
          </div>
        )}

        {/* Onboarding Alert */}
        {needsOnboarding && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-medium text-amber-800">Complete your profile</p>
                <p className="text-sm text-amber-700 mt-1">
                  {isCaregiver ? "Add details so employers can find you." : "Add details to help families find you."}
                </p>
                <Link
                  href="/provider/profile/edit"
                  className="inline-block mt-2 text-sm font-medium text-amber-700 hover:text-amber-800"
                >
                  Get started →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link
            href="/provider/requests"
            className="bg-white rounded-xl p-4 border border-gray-200 hover:border-emerald-300 transition-colors"
          >
            <div className="text-3xl font-bold text-gray-900">{stats.pendingRequests}</div>
            <div className="text-sm text-gray-600">New requests</div>
          </Link>
          <Link
            href="/provider/requests"
            className="bg-white rounded-xl p-4 border border-gray-200 hover:border-emerald-300 transition-colors"
          >
            <div className="text-3xl font-bold text-gray-900">{stats.activeConversations}</div>
            <div className="text-sm text-gray-600">Active conversations</div>
          </Link>
        </div>

        {/* Calendar - Primary Feature */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Your Schedule
          </h2>
          {calendarEvents.length > 0 ? (
            <EngagementCalendar
              events={calendarEvents}
              variant="full"
              onEventClick={(event) => {
                if (event.engagementId) {
                  router.push(`/provider/requests/${event.engagementId}`);
                }
              }}
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="font-medium">No upcoming tours</p>
              <p className="text-sm mt-1">Tours you schedule will appear here</p>
            </div>
          )}
        </div>

        {/* Quick Links - Subtype-aware */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {isCaregiver ? (
            <Link
              href="/provider/opportunities"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-emerald-300 transition-colors text-center"
            >
              <svg className="w-6 h-6 mx-auto mb-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Find Work</span>
            </Link>
          ) : (
            <Link
              href="/provider/leads"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-emerald-300 transition-colors text-center"
            >
              <svg className="w-6 h-6 mx-auto mb-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Find Families</span>
            </Link>
          )}
          <Link
            href="/provider/requests"
            className="bg-white rounded-lg p-4 border border-gray-200 hover:border-emerald-300 transition-colors text-center"
          >
            <svg className="w-6 h-6 mx-auto mb-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Messages</span>
          </Link>
          {isCaregiver ? (
            <Link
              href="/provider/requests"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-emerald-300 transition-colors text-center"
            >
              <svg className="w-6 h-6 mx-auto mb-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Requests</span>
            </Link>
          ) : (
            <Link
              href="/provider/hire-staff"
              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-emerald-300 transition-colors text-center"
            >
              <svg className="w-6 h-6 mx-auto mb-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Hire Staff</span>
            </Link>
          )}
          <Link
            href="/provider/profile/edit"
            className="bg-white rounded-lg p-4 border border-gray-200 hover:border-emerald-300 transition-colors text-center"
          >
            <svg className="w-6 h-6 mx-auto mb-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Settings</span>
          </Link>
        </div>
      </main>

      <Footer variant="light" />
    </div>
  );
}
