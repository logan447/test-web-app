"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import Footer from "@/components/Navigation/Footer";
import PageHero from "@/components/UI/PageHero";
import EmptyState from "@/components/UI/EmptyState";
import EngagementCalendar, { ScheduledEvent } from "@/components/Engagement/EngagementCalendar";
import { showToast } from "@/lib/toast";

interface DashboardStats {
  pendingRequests: number;
  activeConversations: number;
  savedProviders: number;
  totalRequests: number;
}

interface FamilyProfile {
  lovedOneName?: string;
  completionPercentage?: number;
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
 * Care Profile - Family-side dashboard
 *
 * Sprint 7 Simplified Design:
 * - Calendar-first layout
 * - Quick Stats for overview
 * - Quick Actions for navigation
 * - Removed: Active Conversations (use /requests), Need Help, ProfileCompletionWidget
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
  const [familyProfile, setFamilyProfile] = useState<FamilyProfile | null>(null);
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
      const [statsRes, profileRes, toursRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/family-profiles/me"),
        fetch("/api/dashboard/tours"),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }

      if (profileRes.ok) {
        const data = await profileRes.json();
        setFamilyProfile(data);
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
      showToast.error("Unable to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-3"></div>
              <div className="h-5 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-white rounded-xl shadow mb-6"></div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="h-32 bg-white rounded-xl shadow"></div>
              <div className="h-32 bg-white rounded-xl shadow"></div>
              <div className="h-32 bg-white rounded-xl shadow"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Use loved one's name if available, otherwise user's first name
  const displayName = familyProfile?.lovedOneName || session?.user?.name?.split(" ")[0] || "there";
  const hasScheduledEvents = calendarEvents.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainNav />

      {/* Page Hero with personalized greeting */}
      <PageHero
        title={`Welcome back, ${displayName}`}
        subtitle="Your care journey at a glance"
        stats={[
          { value: stats.pendingRequests, label: "Pending" },
          { value: stats.activeConversations, label: "Active" },
          { value: stats.savedProviders, label: "Saved" },
        ]}
        actions={
          <div className="flex gap-3">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Providers
            </Link>
            <Link
              href="/care-profile/edit"
              className="inline-flex items-center gap-2 bg-white text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </Link>
          </div>
        }
      />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Calendar Section - Primary Focus */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Scheduled Meetings
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Tours, consultations, and interviews with providers
              </p>
            </div>
            <Link
              href="/requests"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View all meetings
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {hasScheduledEvents ? (
            <EngagementCalendar
              events={calendarEvents}
              variant="full"
              onEventClick={(event) => {
                if (event.engagementId) {
                  router.push(`/requests/${event.engagementId}`);
                }
              }}
            />
          ) : (
            <EmptyState
              variant="default"
              title="No upcoming meetings"
              description="When you schedule tours or consultations with providers, they'll appear here."
              guidanceMessage="Experts recommend meeting with 3-5 providers before making a decision."
              size="default"
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              actions={[
                {
                  label: "Browse Providers",
                  href: "/browse",
                  variant: "primary",
                },
                {
                  label: "View Matches",
                  href: "/matches",
                  variant: "secondary",
                },
              ]}
            />
          )}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Browse Providers */}
          <Link
            href="/browse"
            className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-primary-200 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-700 transition-colors">
              Browse Providers
            </h3>
            <p className="text-sm text-gray-600">
              Search and filter care providers in your area
            </p>
          </Link>

          {/* Saved Providers */}
          <Link
            href="/saved"
            className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-primary-200 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center mb-4 group-hover:bg-rose-200 transition-colors">
              <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-700 transition-colors">
              Saved Providers
              {stats.savedProviders > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">({stats.savedProviders})</span>
              )}
            </h3>
            <p className="text-sm text-gray-600">
              Review providers you&apos;ve bookmarked
            </p>
          </Link>

          {/* View Matches */}
          <Link
            href="/matches"
            className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-primary-200 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-700 transition-colors">
              View Matches
            </h3>
            <p className="text-sm text-gray-600">
              See providers matched to your care needs
            </p>
          </Link>
        </div>

        {/* Messaging & Requests Link */}
        <div className="mt-8 bg-gray-50 rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Messages & Requests</h3>
                <p className="text-sm text-gray-600">
                  {stats.pendingRequests > 0
                    ? `${stats.pendingRequests} pending, ${stats.activeConversations} active conversations`
                    : "View and manage your provider communications"}
                </p>
              </div>
            </div>
            <Link
              href="/requests"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </main>

      <Footer variant="light" />
    </div>
  );
}
