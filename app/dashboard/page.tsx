"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import ProfileCompletionWidget from "@/components/Dashboard/ProfileCompletionWidget";
import UpcomingToursWidget from "@/components/Dashboard/UpcomingToursWidget";
import IncompleteProfileBanner from "@/components/Profile/IncompleteProfileBanner";
import OnboardingManager from "@/components/Onboarding/OnboardingManager";

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

function DashboardPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    pendingRequests: 0,
    activeConversations: 0,
    savedProviders: 0,
    totalRequests: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    // Middleware handles mode-based access control
    // Fetch dashboard data
    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activitiesRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/dashboard/activity"),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }

      if (activitiesRes.ok) {
        const data = await activitiesRes.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check activeMode, not base role, to determine what dashboard content to show
  const isFamily = session?.user.activeMode !== 'PROVIDER';
  const isProvider = session?.user.role === "PROVIDER";

  // Show loading state - session not yet loaded
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show structure immediately while data loads
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header - show immediately with correct title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {isFamily ? "My Care Profile" : "Provider Dashboard"}
            </h1>
            <p className="text-lg text-gray-600">
              {isFamily
                ? "Maintain your care profile to help providers understand your needs and match you with the right care."
                : "Connect with families who need your services"}
            </p>
          </div>

          {/* Stats Grid - skeleton */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </div>

          {/* Quick Actions - skeleton */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
                  <div className="h-12 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
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

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <OnboardingManager autoOpen={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {isFamily ? "My Care Profile" : "Provider Dashboard"}
              </h1>
              <p className="text-lg text-gray-600">
                {isFamily
                  ? "Maintain your care profile to help providers understand your needs and match you with the right care."
                  : "Connect with families who need your services"}
              </p>
            </div>
            {isFamily && (
              <Link
                href={"/dashboard/care-profile"}
                className="px-4 py-2 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 font-semibold transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Care Profile
              </Link>
            )}
          </div>
        </div>

        {/* Incomplete Profile Banner */}
        <IncompleteProfileBanner dismissible={true} />

        {/* Profile Completion Widget */}
        <div className="mb-8">
          <ProfileCompletionWidget />
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {isFamily ? "Pending Requests" : "New Requests"}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.pendingRequests}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg
                  className="w-8 h-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <Link
              href={"/dashboard/requests"}
              className="text-sm text-blue-600 hover:text-blue-700 mt-4 inline-block"
            >
              View all requests →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Conversations</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.activeConversations}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg
                  className="w-8 h-8 text-green-600"
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
            </div>
            <Link
              href={"/dashboard/requests"}
              className="text-sm text-blue-600 hover:text-blue-700 mt-4 inline-block"
            >
              View messages →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {isFamily ? "Saved Providers" : "Total Requests"}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {isFamily ? stats.savedProviders : stats.totalRequests}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      isFamily
                        ? "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        : "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    }
                  />
                </svg>
              </div>
            </div>
            <Link
              href={isFamily ? "/dashboard/saved" : "/dashboard/requests"}
              className="text-sm text-blue-600 hover:text-blue-700 mt-4 inline-block"
            >
              {isFamily ? "View saved →" : "View all →"}
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isFamily ? (
              <>
                <Link
                  href={"/"}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition flex items-center"
                >
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Browse Providers
                    </h3>
                    <p className="text-sm text-gray-600">Find care options</p>
                  </div>
                </Link>
                <Link
                  href={"/dashboard/care-profile"}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition flex items-center"
                >
                  <div className="bg-green-100 p-3 rounded-lg mr-4">
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
                    <h3 className="font-semibold text-gray-900">
                      Update Care Profile
                    </h3>
                    <p className="text-sm text-gray-600">Edit your needs</p>
                  </div>
                </Link>
                <Link
                  href={"/dashboard/saved"}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition flex items-center"
                >
                  <div className="bg-purple-100 p-3 rounded-lg mr-4">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Saved Providers
                    </h3>
                    <p className="text-sm text-gray-600">View favorites</p>
                  </div>
                </Link>
                <Link
                  href={"/dashboard/requests"}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition flex items-center"
                >
                  <div className="bg-orange-100 p-3 rounded-lg mr-4">
                    <svg
                      className="w-6 h-6 text-orange-600"
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
                    <h3 className="font-semibold text-gray-900">Messages</h3>
                    <p className="text-sm text-gray-600">View conversations</p>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={"/dashboard/provider-profile"}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition flex items-center"
                >
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Edit Profile
                    </h3>
                    <p className="text-sm text-gray-600">Update services</p>
                  </div>
                </Link>
                <Link
                  href={"/provider/requests"}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition flex items-center"
                >
                  <div className="bg-green-100 p-3 rounded-lg mr-4">
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Find Families
                    </h3>
                    <p className="text-sm text-gray-600">Browse care requests</p>
                  </div>
                </Link>
                <Link
                  href={"/dashboard/requests"}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition flex items-center"
                >
                  <div className="bg-purple-100 p-3 rounded-lg mr-4">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      View Requests
                    </h3>
                    <p className="text-sm text-gray-600">Manage inquiries</p>
                  </div>
                </Link>
                <Link
                  href={"/dashboard/requests"}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition flex items-center"
                >
                  <div className="bg-orange-100 p-3 rounded-lg mr-4">
                    <svg
                      className="w-6 h-6 text-orange-600"
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
                    <h3 className="font-semibold text-gray-900">Messages</h3>
                    <p className="text-sm text-gray-600">Chat with families</p>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Upcoming Tours Widget */}
        <div className="mb-8">
          <UpcomingToursWidget />
        </div>

        {/* Recent Activity with Filters */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Activity
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    filterType === "all"
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType("REQUEST")}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    filterType === "REQUEST"
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Requests
                </button>
                <button
                  onClick={() => setFilterType("MESSAGE")}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    filterType === "MESSAGE"
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Messages
                </button>
                <button
                  onClick={() => setFilterType("TOUR_SCHEDULED")}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    filterType === "TOUR_SCHEDULED"
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Tours
                </button>
                <button
                  onClick={() => setFilterType("PROVIDER_SAVED")}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    filterType === "PROVIDER_SAVED"
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Saved
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {filteredActivities.length > 0 ? (
              <div className="space-y-3">
                {filteredActivities.map((activity) => (
                  <Link
                    key={activity.id}
                    href={activity.relatedId ? `/dashboard/requests/${activity.relatedId}` : "#"}
                    className={`flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition ${
                      activity.isUnread ? "bg-blue-50" : "bg-white border border-gray-100"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {activity.title}
                          {activity.isUnread && (
                            <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
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
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
                <p className="text-gray-500 mb-4">
                  {filterType === "all" ? "No recent activity yet" : `No ${filterType.toLowerCase().replace("_", " ")} activity`}
                </p>
                <Link
                  href={"/"}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Browse providers to get started →
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>
          </div>
        </main>
      </div>
    }>
      <DashboardPageContent />
    </Suspense>
  );
}
