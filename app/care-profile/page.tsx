"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import Footer from "@/components/Navigation/Footer";
import ProfileCompletionWidget from "@/components/Dashboard/ProfileCompletionWidget";
import UpcomingToursWidget from "@/components/Dashboard/UpcomingToursWidget";
import EngagementCalendar, { ScheduledEvent } from "@/components/Engagement/EngagementCalendar";
import { ProviderCard } from "@/components/Cards";

interface DashboardStats {
  pendingRequests: number;
  activeConversations: number;
  savedProviders: number;
  totalRequests: number;
}

interface Activity {
  id: string;
  type: "REQUEST" | "MESSAGE" | "PROFILE_UPDATE" | "TOUR_SCHEDULED" | "PROVIDER_SAVED";
  title: string;
  description: string;
  timestamp: string;
  relatedId?: string;
  isUnread: boolean;
}

interface SavedProvider {
  id: string;
  providerId: string;
  createdAt: string;
  provider: {
    id: string;
    name: string;
    providerType: string;
    city: string;
    state: string;
    description: string | null;
    careTypesOffered: string[];
    averageRating: number | null;
    reviewCount: number;
    priceMin: number | null;
    priceMax: number | null;
    coverPhoto: string | null;
    photos: string[];
    claimed: boolean;
  };
}

interface TourData {
  id: string;
  proposedDate: string;
  proposedTime: string;
  status: string;
  request: {
    id: string;
    provider: {
      id: string;
      name: string;
    };
  };
}

/**
 * Care Profile - Family-side overview and quick actions
 *
 * This is an explicit route (not mode-aware) per Manual architecture principles.
 * For provider-side profile, see /provider/profile
 */
export default function CareProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    pendingRequests: 0,
    activeConversations: 0,
    savedProviders: 0,
    totalRequests: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [savedProvidersList, setSavedProvidersList] = useState<SavedProvider[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<ScheduledEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (!session) return;

    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activitiesRes, savedRes, toursRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/dashboard/activity"),
        fetch("/api/saved-providers"),
        fetch("/api/dashboard/tours"),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }

      if (activitiesRes.ok) {
        const data = await activitiesRes.json();
        setActivities(data.activities || []);
      }

      if (savedRes.ok) {
        const data = await savedRes.json();
        setSavedProvidersList(Array.isArray(data) ? data.slice(0, 3) : []);
      }

      if (toursRes.ok) {
        const data = await toursRes.json();
        const tours: TourData[] = data.tours || [];
        // Convert tours to calendar events
        const events: ScheduledEvent[] = tours.map((tour) => ({
          id: tour.id,
          date: new Date(tour.proposedDate),
          title: `Tour at ${tour.request.provider.name}`,
          type: "tour" as const,
          providerName: tour.request.provider.name,
          providerId: tour.request.provider.id,
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
        {/* Skeleton Hero */}
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse">
              <div className="h-10 bg-white/20 rounded-lg w-1/3 mb-4"></div>
              <div className="h-5 bg-white/20 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="h-32 bg-white rounded-xl shadow"></div>
              <div className="h-32 bg-white rounded-xl shadow"></div>
              <div className="h-32 bg-white rounded-xl shadow"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const filteredActivities = filterType === "all"
    ? activities
    : activities.filter(a => a.type === filterType);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "REQUEST":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "MESSAGE":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case "PROFILE_UPDATE":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case "TOUR_SCHEDULED":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "PROVIDER_SAVED":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "REQUEST": return "bg-blue-100 text-blue-600";
      case "MESSAGE": return "bg-green-100 text-green-600";
      case "PROFILE_UPDATE": return "bg-purple-100 text-purple-600";
      case "TOUR_SCHEDULED": return "bg-orange-100 text-orange-600";
      case "PROVIDER_SAVED": return "bg-pink-100 text-pink-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const userName = session?.user?.name?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      {/* Hero Header - Cleaner design */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {userName}
              </h1>
              <p className="text-primary-100 text-lg">
                Track your care search progress and manage provider connections
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-5 py-3 rounded-xl font-medium hover:bg-white/20 transition-colors border border-white/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find Providers
              </Link>
              <Link
                href="/care-profile/edit"
                className="inline-flex items-center gap-2 bg-white text-primary-700 px-5 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Quick Stats in Hero */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Link href="/requests" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors border border-white/10">
              <div className="text-3xl font-bold">{stats.pendingRequests}</div>
              <div className="text-primary-100 text-sm">Pending Requests</div>
            </Link>
            <Link href="/requests" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors border border-white/10">
              <div className="text-3xl font-bold">{stats.activeConversations}</div>
              <div className="text-primary-100 text-sm">Active Conversations</div>
            </Link>
            <Link href="/saved" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors border border-white/10">
              <div className="text-3xl font-bold">{stats.savedProviders}</div>
              <div className="text-primary-100 text-sm">Saved Providers</div>
            </Link>
            <Link href="/matches" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors border border-white/10">
              <div className="text-3xl font-bold">{stats.totalRequests}</div>
              <div className="text-primary-100 text-sm">Total Connections</div>
            </Link>
          </div>

          {/* Journey Progress */}
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-white font-semibold mb-4">Your Care Journey</h3>
            <div className="flex items-center justify-between relative">
              {/* Progress Line */}
              <div className="absolute left-0 right-0 top-5 h-1 bg-white/20 -z-0" />
              <div
                className="absolute left-0 top-5 h-1 bg-white transition-all duration-500 -z-0"
                style={{
                  width: `${
                    stats.totalRequests > 0
                      ? calendarEvents.length > 0
                        ? stats.activeConversations > 0
                          ? "100%"
                          : "66%"
                        : "33%"
                      : stats.savedProviders > 0
                      ? "16%"
                      : "0%"
                  }`,
                }}
              />

              {/* Step 1: Research */}
              <div className="flex flex-col items-center z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    stats.savedProviders > 0 ? "bg-white text-primary-600" : "bg-white/30 text-white"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <span className="text-xs text-white/80 mt-2">Research</span>
              </div>

              {/* Step 2: Connect */}
              <div className="flex flex-col items-center z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    stats.totalRequests > 0 ? "bg-white text-primary-600" : "bg-white/30 text-white"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="text-xs text-white/80 mt-2">Connect</span>
              </div>

              {/* Step 3: Schedule */}
              <div className="flex flex-col items-center z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    calendarEvents.length > 0 ? "bg-white text-primary-600" : "bg-white/30 text-white"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs text-white/80 mt-2">Schedule</span>
              </div>

              {/* Step 4: Decide */}
              <div className="flex flex-col items-center z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    stats.activeConversations > 0 && calendarEvents.length > 0 ? "bg-white text-primary-600" : "bg-white/30 text-white"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs text-white/80 mt-2">Decide</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Completion Widget */}
        <div className="mb-8">
          <ProfileCompletionWidget />
        </div>

        {/* Saved Providers Preview */}
        {savedProvidersList.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Your Saved Providers
              </h2>
              <Link
                href="/saved"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                View all
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {savedProvidersList.map((saved) => (
                <ProviderCard
                  key={saved.id}
                  provider={{
                    id: saved.provider.id,
                    name: saved.provider.name,
                    providerType: saved.provider.providerType,
                    city: saved.provider.city,
                    state: saved.provider.state,
                    description: saved.provider.description,
                    careTypesOffered: saved.provider.careTypesOffered,
                    averageRating: saved.provider.averageRating,
                    reviewCount: saved.provider.reviewCount,
                    priceMin: saved.provider.priceMin,
                    priceMax: saved.provider.priceMax,
                    coverPhoto: saved.provider.coverPhoto,
                    photos: saved.provider.photos,
                    claimed: saved.provider.claimed,
                  }}
                  variant="vertical"
                />
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/browse"
              className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all flex items-center"
            >
              <div className="bg-primary-100 p-3 rounded-xl mr-4 group-hover:bg-primary-200 transition-colors">
                <svg
                  className="w-6 h-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                  Browse Providers
                </h3>
                <p className="text-sm text-gray-600">Find care options</p>
              </div>
            </Link>
            <Link
              href="/care-profile/edit"
              className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all flex items-center"
            >
              <div className="bg-green-100 p-3 rounded-xl mr-4 group-hover:bg-green-200 transition-colors">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                  Update Care Profile
                </h3>
                <p className="text-sm text-gray-600">Edit your needs</p>
              </div>
            </Link>
            <Link
              href="/saved"
              className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all flex items-center"
            >
              <div className="bg-pink-100 p-3 rounded-xl mr-4 group-hover:bg-pink-200 transition-colors">
                <svg
                  className="w-6 h-6 text-pink-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                  Saved Providers
                </h3>
                <p className="text-sm text-gray-600">View favorites</p>
              </div>
            </Link>
            <Link
              href="/requests"
              className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all flex items-center"
            >
              <div className="bg-blue-100 p-3 rounded-xl mr-4 group-hover:bg-blue-200 transition-colors">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                  Messages
                </h3>
                <p className="text-sm text-gray-600">View conversations</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Activity Feed */}
          <div className="lg:col-span-2 space-y-8">
            {/* Engagement Calendar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Your Schedule
                </h2>
                <Link
                  href="/requests"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Manage Engagements
                </Link>
              </div>
              <EngagementCalendar
                events={calendarEvents}
                variant="compact"
                onEventClick={(event) => {
                  if (event.engagementId) {
                    router.push(`/requests/${event.engagementId}`);
                  }
                }}
              />
            </div>

            {/* Recent Activity with Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Recent Activity
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "all", label: "All" },
                      { key: "REQUEST", label: "Requests" },
                      { key: "MESSAGE", label: "Messages" },
                      { key: "TOUR_SCHEDULED", label: "Tours" },
                    ].map((filter) => (
                      <button
                        key={filter.key}
                        onClick={() => setFilterType(filter.key)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          filterType === filter.key
                            ? "bg-primary-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6">
                {filteredActivities.length > 0 ? (
                  <div className="space-y-3">
                    {filteredActivities.slice(0, 5).map((activity) => (
                      <Link
                        key={activity.id}
                        href={activity.relatedId ? `/requests/${activity.relatedId}` : "#"}
                        className={`flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition ${
                          activity.isUnread ? "bg-primary-50 border border-primary-100" : "bg-white border border-gray-100"
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {activity.title}
                              {activity.isUnread && (
                                <span className="ml-2 inline-block w-2 h-2 bg-primary-600 rounded-full"></span>
                              )}
                            </h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {new Date(activity.timestamp).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {activity.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {filterType === "all" ? "No recent activity yet" : `No ${filterType.toLowerCase().replace("_", " ")} activity`}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start browsing providers to see activity here
                    </p>
                    <Link
                      href="/browse"
                      className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Browse providers
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Tours Widget */}
            <UpcomingToursWidget />

            {/* Care Search Progress */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Your Care Search</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Providers Contacted</span>
                  <span className="font-semibold text-gray-900">{stats.totalRequests}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tours Scheduled</span>
                  <span className="font-semibold text-gray-900">{calendarEvents.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Saved for Later</span>
                  <span className="font-semibold text-gray-900">{stats.savedProviders}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link
                  href="/matches"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  View recommended matches
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-primary-600 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-primary-900">Tips for Finding Care</h3>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-primary-800">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Complete your care profile for better matches
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Schedule tours to visit facilities in person
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Ask about staff-to-resident ratios
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Compare at least 3 providers before deciding
                </li>
              </ul>
            </div>

            {/* Need Help Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Our care advisors are here to help you find the right care solution.
              </p>
              <a
                href="mailto:support@olera.com"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer variant="light" />
    </div>
  );
}
