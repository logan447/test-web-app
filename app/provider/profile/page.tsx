"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import Footer from "@/components/Navigation/Footer";
import ProfileCompletionWidget from "@/components/Dashboard/ProfileCompletionWidget";
import UpcomingToursWidget from "@/components/Dashboard/UpcomingToursWidget";
import OnboardingPrompt from "@/components/Provider/OnboardingPrompt";
import EngagementCalendar, { ScheduledEvent } from "@/components/Engagement/EngagementCalendar";
import { useProviderIdentity } from "@/hooks/useProviderIdentity";

interface DashboardStats {
  pendingRequests: number;
  activeConversations: number;
  totalRequests: number;
  acceptedRequests: number;
}

interface Activity {
  id: string;
  type: "REQUEST" | "MESSAGE" | "PROFILE_UPDATE" | "TOUR_SCHEDULED";
  title: string;
  description: string;
  timestamp: string;
  relatedId?: string;
  isUnread: boolean;
}

interface ProviderProfile {
  providerType: string;
  name?: string;
  city?: string;
  state?: string;
}

interface AnalyticsData {
  responseRate: number;
  conversionRate: number;
  profileViews: number;
  weeklyTrend: { week: string; requests: number; accepted: number }[];
  totalRequests: number;
  acceptedRequests: number;
  pendingRequests: number;
  upcomingTours: number;
  avgResponseTime: string | null;
}

interface MatchedFamily {
  id: string;
  userId: string;
  user: { name: string | null };
  city: string;
  state: string;
  careTypes: string[];
  seniorName: string | null;
  createdAt: string;
  matchScore: number;
  matchReasons: string[];
}

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

export default function ProviderProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    pendingRequests: 0,
    activeConversations: 0,
    totalRequests: 0,
    acceptedRequests: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentLeads, setRecentLeads] = useState<MatchedFamily[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<ScheduledEvent[]>([]);

  const isProviderMode = session?.user?.activeMode === 'PROVIDER';
  const { hasIdentity, needsOnboarding, loading: identityLoading } = useProviderIdentity({
    checkMode: true,
  });

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
      const [statsRes, activitiesRes, profileRes, analyticsRes, leadsRes, toursRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/dashboard/activity"),
        fetch("/api/providers/me"),
        fetch("/api/provider/analytics"),
        fetch("/api/provider/matches"),
        fetch("/api/dashboard/tours"),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(prev => ({
          ...prev,
          pendingRequests: data.stats?.pendingRequests ?? 0,
          activeConversations: data.stats?.activeConversations ?? 0,
          totalRequests: data.stats?.totalRequests ?? 0,
          acceptedRequests: data.stats?.acceptedRequests ?? 0,
        }));
      }

      if (activitiesRes.ok) {
        const data = await activitiesRes.json();
        setActivities(data.activities || []);
      }

      if (profileRes.ok) {
        const profile = await profileRes.json();
        setProviderProfile(profile);
      }

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }

      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setRecentLeads(Array.isArray(data) ? data.slice(0, 3) : []);
      }

      if (toursRes.ok) {
        const data = await toursRes.json();
        const tours: TourData[] = data.tours || [];
        // Convert tours to calendar events
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
        {/* Skeleton Hero */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse">
              <div className="h-10 bg-white/20 rounded-lg w-1/3 mb-4"></div>
              <div className="h-5 bg-white/20 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="h-32 bg-white rounded-xl shadow"></div>
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

  const isIndependentCaregiver = providerProfile?.providerType === 'INDEPENDENT_CAREGIVER';
  const isHomeCareFacility = providerProfile?.providerType === 'HOME_CARE';

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
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const userName = session?.user?.name?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-2 rounded-lg">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  Welcome back, {userName}
                </h1>
              </div>
              <p className="text-emerald-100 text-lg">
                Manage your provider profile and connect with families
              </p>
            </div>
            <Link
              href="/provider/profile/edit"
              className="inline-flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </Link>
          </div>

          {/* Quick Stats in Hero */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Link href="/provider/leads" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500/30 p-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.pendingRequests}</div>
                  <div className="text-emerald-100 text-sm">New Requests</div>
                </div>
              </div>
            </Link>
            <Link href="/provider/requests" className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.activeConversations}</div>
                  <div className="text-emerald-100 text-sm">Active Chats</div>
                </div>
              </div>
            </Link>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-400/30 p-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.acceptedRequests}</div>
                  <div className="text-emerald-100 text-sm">Connected</div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalRequests}</div>
                  <div className="text-emerald-100 text-sm">Total Requests</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Onboarding Prompt */}
        {needsOnboarding && (
          <div className="mb-8">
            <OnboardingPrompt context="dashboard" />
          </div>
        )}

        {/* Profile Completion Widget */}
        <div className="mb-8">
          <ProfileCompletionWidget />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/provider/profile/edit"
              className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all flex items-center"
            >
              <div className="bg-emerald-100 p-3 rounded-xl mr-4 group-hover:bg-emerald-200 transition-colors">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                  Edit Profile
                </h3>
                <p className="text-sm text-gray-600">Update services</p>
              </div>
            </Link>

            {isIndependentCaregiver ? (
              <Link
                href="/provider/organizations"
                className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all flex items-center"
              >
                <div className="bg-blue-100 p-3 rounded-xl mr-4 group-hover:bg-blue-200 transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                    Browse Organizations
                  </h3>
                  <p className="text-sm text-gray-600">Find employment</p>
                </div>
              </Link>
            ) : isHomeCareFacility ? (
              <Link
                href="/provider/hire-staff"
                className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all flex items-center"
              >
                <div className="bg-blue-100 p-3 rounded-xl mr-4 group-hover:bg-blue-200 transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                    Hire Care Staff
                  </h3>
                  <p className="text-sm text-gray-600">Find caregivers</p>
                </div>
              </Link>
            ) : (
              <Link
                href="/provider/leads"
                className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all flex items-center"
              >
                <div className="bg-blue-100 p-3 rounded-xl mr-4 group-hover:bg-blue-200 transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                    Find Families
                  </h3>
                  <p className="text-sm text-gray-600">Browse care requests</p>
                </div>
              </Link>
            )}

            <Link
              href="/provider/requests"
              className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all flex items-center"
            >
              <div className="bg-purple-100 p-3 rounded-xl mr-4 group-hover:bg-purple-200 transition-colors">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                  View Requests
                </h3>
                <p className="text-sm text-gray-600">Manage inquiries</p>
              </div>
            </Link>

            <Link
              href="/provider/requests"
              className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all flex items-center"
            >
              <div className="bg-orange-100 p-3 rounded-xl mr-4 group-hover:bg-orange-200 transition-colors">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
                  Messages
                </h3>
                <p className="text-sm text-gray-600">
                  {isIndependentCaregiver ? "Chat with clients" : "Chat with families"}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Analytics Insights Section */}
        {analytics && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Performance Insights
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Response Rate */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    analytics.responseRate >= 80 ? 'bg-green-100 text-green-700' :
                    analytics.responseRate >= 50 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {analytics.responseRate >= 80 ? 'Excellent' : analytics.responseRate >= 50 ? 'Good' : 'Needs work'}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{analytics.responseRate}%</div>
                <div className="text-sm text-gray-600">Response Rate</div>
                <div className="mt-2 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${analytics.responseRate}%` }}
                  />
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    analytics.conversionRate >= 70 ? 'bg-green-100 text-green-700' :
                    analytics.conversionRate >= 40 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {analytics.conversionRate >= 70 ? 'High' : analytics.conversionRate >= 40 ? 'Average' : 'Building'}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{analytics.conversionRate}%</div>
                <div className="text-sm text-gray-600">Conversion Rate</div>
                <div className="mt-2 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-emerald-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${analytics.conversionRate}%` }}
                  />
                </div>
              </div>

              {/* Profile Views */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{analytics.profileViews}</div>
                <div className="text-sm text-gray-600">Profile Views</div>
                <div className="mt-2 text-xs text-gray-500">All time</div>
              </div>

              {/* Upcoming Tours */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{analytics.upcomingTours}</div>
                <div className="text-sm text-gray-600">Scheduled Tours</div>
                <div className="mt-2 text-xs text-gray-500">Upcoming</div>
              </div>
            </div>

            {/* Weekly Trend Mini Chart */}
            {analytics.weeklyTrend.length > 0 && (
              <div className="mt-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Request Activity (Last 4 Weeks)</h3>
                <div className="flex items-end justify-between gap-2 h-24">
                  {analytics.weeklyTrend.map((week, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col items-center gap-1 mb-2">
                        <div
                          className="w-full max-w-[40px] bg-emerald-200 rounded-t"
                          style={{
                            height: `${Math.max(week.accepted * 15, 4)}px`,
                          }}
                          title={`${week.accepted} accepted`}
                        />
                        <div
                          className="w-full max-w-[40px] bg-emerald-600 rounded-t"
                          style={{
                            height: `${Math.max((week.requests - week.accepted) * 15, week.requests > 0 ? 4 : 0)}px`,
                          }}
                          title={`${week.requests - week.accepted} pending/other`}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{week.week}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-emerald-600 rounded" />
                    <span>Requests</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-emerald-200 rounded" />
                    <span>Accepted</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Leads Section */}
        {recentLeads.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Matching Families
              </h2>
              <Link
                href="/provider/leads"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                View all
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/provider/leads`}
                  className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-emerald-100 text-emerald-700 w-10 h-10 rounded-full flex items-center justify-center font-semibold">
                      {lead.user?.name?.charAt(0) || "?"}
                    </div>
                    <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                      {lead.matchScore}% match
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {lead.seniorName ? `Care for ${lead.seniorName}` : lead.user?.name || "Family"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {lead.city}, {lead.state}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {lead.careTypes.slice(0, 2).map((type) => (
                      <span
                        key={type}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                      >
                        {type.replace(/_/g, " ")}
                      </span>
                    ))}
                    {lead.careTypes.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{lead.careTypes.length - 2} more
                      </span>
                    )}
                  </div>
                  {lead.matchReasons.length > 0 && (
                    <p className="text-xs text-emerald-600 mt-2">
                      {lead.matchReasons[0]}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Activity Feed */}
          <div className="lg:col-span-2">
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
                            ? "bg-emerald-600 text-white"
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
                    {filteredActivities.map((activity) => (
                      <Link
                        key={activity.id}
                        href={activity.relatedId ? `/provider/requests/${activity.relatedId}` : "#"}
                        className={`flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition ${
                          activity.isUnread ? "bg-emerald-50 border border-emerald-100" : "bg-white border border-gray-100"
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
                                <span className="ml-2 inline-block w-2 h-2 bg-emerald-600 rounded-full"></span>
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
                      {filterType === "all" ? "No recent activity yet" : `No ${filterType.toLowerCase()} activity`}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Complete your profile to start receiving care requests
                    </p>
                    {isIndependentCaregiver ? (
                      <Link
                        href="/provider/organizations"
                        className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Browse organizations
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ) : (
                      <Link
                        href="/provider/leads"
                        className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Find families
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Engagement Calendar */}
            {calendarEvents.length > 0 ? (
              <EngagementCalendar
                events={calendarEvents}
                variant="compact"
                onEventClick={(event) => {
                  if (event.engagementId) {
                    router.push(`/provider/requests/${event.engagementId}`);
                  }
                }}
              />
            ) : (
              <UpcomingToursWidget />
            )}

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-xl p-6 border border-emerald-200">
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-emerald-600 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-900">Tips for Success</h3>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-emerald-800">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Complete your profile with photos
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Respond to inquiries within 24 hours
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Ask for reviews from families
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Keep your availability up to date
                </li>
              </ul>
            </div>

            {/* Need Help Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Our provider support team is here to help you succeed.
              </p>
              <a
                href="mailto:providers@olera.com"
                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Provider Support
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
