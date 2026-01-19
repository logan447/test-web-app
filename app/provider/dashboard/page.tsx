"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import Breadcrumb from "@/components/Navigation/Breadcrumb";
import ProfileCompletionWidget from "@/components/Dashboard/ProfileCompletionWidget";
import UpcomingToursWidget from "@/components/Dashboard/UpcomingToursWidget";
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
}

export default function ProviderDashboardPage() {
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

  // Read mode from session (database is source of truth per Manual Ch 2)
  const isProviderMode = session?.user?.activeMode === 'PROVIDER';

  // Check for provider identity - redirects to onboarding if missing (Manual Ch 8)
  const { hasIdentity, loading: identityLoading } = useProviderIdentity({
    requireIdentity: true,
    checkMode: true,
  });

  useEffect(() => {
    if (status === "loading" || identityLoading) return;

    if (!session) {
      router.push("/login");
      return;
    }

    // If mode is family, redirect to family dashboard
    if (!isProviderMode) {
      router.push('/dashboard');
      return;
    }

    // If no identity, the hook will redirect to onboarding
    if (!hasIdentity) return;

    // Fetch dashboard data
    fetchDashboardData();
  }, [session, status, router, isProviderMode, hasIdentity, identityLoading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activitiesRes, profileRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/dashboard/activity"),
        fetch("/api/providers/me"),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }

      if (activitiesRes.ok) {
        const data = await activitiesRes.json();
        setActivities(data.activities || []);
      }

      if (profileRes.ok) {
        const profile = await profileRes.json();
        setProviderProfile(profile);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <Breadcrumb />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const filteredActivities = filterType === "all"
    ? activities
    : activities.filter(a => a.type === filterType);

  // Determine provider type for customization
  const isIndependentCaregiver = providerProfile?.providerType === 'INDEPENDENT_CAREGIVER';
  const isHomeCareFacility = providerProfile?.providerType === 'HOME_CARE';
  const isOrganization = !isIndependentCaregiver;

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

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <Breadcrumb />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isIndependentCaregiver ? "Caregiver Dashboard" : "Provider Dashboard"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isIndependentCaregiver
              ? "Find families and organizations seeking caregivers"
              : "Connect with families who need your services"}
          </p>
        </div>

        {/* Profile Completion Widget */}
        <div className="mb-8">
          <ProfileCompletionWidget />
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">New Requests</p>
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
              href="/provider/requests"
              className="text-sm text-blue-600 hover:text-blue-700 mt-4 inline-block"
            >
              View requests →
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
              href="/dashboard/requests"
              className="text-sm text-blue-600 hover:text-blue-700 mt-4 inline-block"
            >
              View messages →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Accepted Requests</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.acceptedRequests}
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <Link
              href="/dashboard/requests"
              className="text-sm text-blue-600 hover:text-blue-700 mt-4 inline-block"
            >
              View all →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalRequests}
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <Link
              href="/dashboard/requests"
              className="text-sm text-blue-600 hover:text-blue-700 mt-4 inline-block"
            >
              View history →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/dashboard/provider-profile"
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
                <h3 className="font-semibold text-gray-900">Edit Profile</h3>
                <p className="text-sm text-gray-600">Update services</p>
              </div>
            </Link>

            {/* Conditional second action based on provider type */}
            {isIndependentCaregiver ? (
              <Link
                href="/caregiver/browse-organizations"
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Browse Organizations</h3>
                  <p className="text-sm text-gray-600">Find employment</p>
                </div>
              </Link>
            ) : isHomeCareFacility ? (
              <Link
                href="/provider/hire-staff"
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
                  <h3 className="font-semibold text-gray-900">Hire Care Staff</h3>
                  <p className="text-sm text-gray-600">Find caregivers</p>
                </div>
              </Link>
            ) : (
              <Link
                href="/provider/requests"
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
                  <h3 className="font-semibold text-gray-900">Find Families</h3>
                  <p className="text-sm text-gray-600">Browse care requests</p>
                </div>
              </Link>
            )}

            <Link
              href="/dashboard/requests"
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
                <h3 className="font-semibold text-gray-900">View Requests</h3>
                <p className="text-sm text-gray-600">Manage inquiries</p>
              </div>
            </Link>
            <Link
              href="/dashboard/requests"
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
                <p className="text-sm text-gray-600">
                  {isIndependentCaregiver ? "Chat with clients" : "Chat with families"}
                </p>
              </div>
            </Link>
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
                  {filterType === "all" ? "No recent activity yet" : `No ${filterType.toLowerCase()} activity`}
                </p>
                {isIndependentCaregiver ? (
                  <Link
                    href="/caregiver/browse-organizations"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Browse organizations to get started →
                  </Link>
                ) : (
                  <Link
                    href="/provider/requests"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Find families to get started →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

