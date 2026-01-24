"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import Footer from "@/components/Navigation/Footer";
import ProfileCompletionWidget from "@/components/Dashboard/ProfileCompletionWidget";
import EngagementCalendar, { ScheduledEvent } from "@/components/Engagement/EngagementCalendar";

interface DashboardStats {
  pendingRequests: number;
  activeConversations: number;
  savedProviders: number;
  totalRequests: number;
}

interface ActiveRequest {
  id: string;
  status: string;
  createdAt: string;
  provider: {
    id: string;
    name: string;
    providerType: string;
    city: string;
    state: string;
    coverPhoto: string | null;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
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
  const [activeRequests, setActiveRequests] = useState<ActiveRequest[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<ScheduledEvent[]>([]);
  const [loading, setLoading] = useState(true);

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
      const [statsRes, requestsRes, toursRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/requests"),
        fetch("/api/dashboard/tours"),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }

      if (requestsRes.ok) {
        const data = await requestsRes.json();
        // Get active requests (not completed/cancelled)
        const requests = (data.requests || []).filter(
          (r: ActiveRequest) => !["COMPLETED", "CANCELLED", "DECLINED"].includes(r.status)
        );
        setActiveRequests(requests.slice(0, 5));
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

  const userName = session?.user?.name?.split(' ')[0] || 'there';

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      PENDING: { label: "Awaiting Response", color: "bg-amber-100 text-amber-700" },
      ACCEPTED: { label: "Accepted", color: "bg-green-100 text-green-700" },
      TOUR_PROPOSED: { label: "Time Proposed", color: "bg-blue-100 text-blue-700" },
      TOUR_SCHEDULED: { label: "Scheduled", color: "bg-emerald-100 text-emerald-700" },
    };
    const config = statusConfig[status] || { label: status, color: "bg-gray-100 text-gray-700" };
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const hasEngagements = calendarEvents.length > 0 || activeRequests.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      {/* Simplified Hero - Minimal design */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {userName}
              </h1>
              <p className="text-gray-600 mt-1">
                Your care journey at a glance
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find Providers
              </Link>
              <Link
                href="/care-profile/edit"
                className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Empty State - No Engagements */}
        {!hasEngagements && (
          <div className="bg-primary-50 rounded-xl p-8 mb-6 text-center border border-primary-100">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Start Your Care Journey</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven&apos;t connected with any providers yet. Browse our network to find the right care for your loved one.
            </p>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Providers
            </Link>
          </div>
        )}

        {/* Calendar-First Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Calendar & Conversations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Meetings - Calendar at Top */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Upcoming Meetings
                </h2>
                <Link
                  href="/requests"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  View all
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

            {/* Active Conversations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Active Conversations
                  </h2>
                  <Link
                    href="/requests"
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    View all
                  </Link>
                </div>
              </div>
              <div className="p-4">
                {activeRequests.length > 0 ? (
                  <div className="space-y-3">
                    {activeRequests.map((request) => (
                      <Link
                        key={request.id}
                        href={`/requests/${request.id}`}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition border border-gray-100"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                          {request.provider.coverPhoto ? (
                            <img
                              src={request.provider.coverPhoto}
                              alt={request.provider.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {request.provider.name}
                            </h3>
                            {getStatusBadge(request.status)}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {request.provider.city}, {request.provider.state}
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No active conversations yet</p>
                    <Link
                      href="/browse"
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      Browse providers to start connecting
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Quick Stats & Actions */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">At a Glance</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/requests" className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition text-center">
                  <div className="text-2xl font-bold text-primary-600">{stats.pendingRequests}</div>
                  <div className="text-xs text-gray-600">Pending</div>
                </Link>
                <Link href="/requests" className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition text-center">
                  <div className="text-2xl font-bold text-primary-600">{stats.activeConversations}</div>
                  <div className="text-xs text-gray-600">Active</div>
                </Link>
                <Link href="/saved" className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition text-center">
                  <div className="text-2xl font-bold text-primary-600">{stats.savedProviders}</div>
                  <div className="text-xs text-gray-600">Saved</div>
                </Link>
                <Link href="/matches" className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition text-center">
                  <div className="text-2xl font-bold text-primary-600">{calendarEvents.length}</div>
                  <div className="text-xs text-gray-600">Scheduled</div>
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/browse"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Browse Providers</span>
                </Link>
                <Link
                  href="/saved"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">View Saved</span>
                </Link>
                <Link
                  href="/matches"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-900">View Matches</span>
                </Link>
              </div>
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

        {/* Profile Completion - Moved to Bottom */}
        <div className="mt-6">
          <ProfileCompletionWidget />
        </div>
      </main>

      {/* Footer */}
      <Footer variant="light" />
    </div>
  );
}
