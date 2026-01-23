"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import Tooltip from "@/components/UI/Tooltip";
import OnboardingPrompt from "@/components/Provider/OnboardingPrompt";
import { useProviderIdentity } from "@/hooks/useProviderIdentity";

type ConsultRequest = {
  id: string;
  status: string;
  message: string;
  createdAt: string;
  provider: {
    name: string;
    city: string;
    state: string;
  };
  familyProfile?: {
    user: {
      name: string;
    };
    city: string;
    state: string;
  };
  sender: {
    name: string;
  };
  messages?: any[];
  _count?: {
    messages: number;
  };
};

type MatchedFamily = {
  id: string;
  userId: string;
  user: {
    name: string;
  };
  city: string;
  state: string;
  careTypes: string[];
  seniorName?: string;
  createdAt: string;
  matchScore?: number;
  matchReasons?: string[];
};

/**
 * Provider Requests - Provider-side engagement management
 *
 * Shows families that have an engagement relationship with this provider:
 * - Families who submitted a request to the provider
 * - Families the provider reached out to
 * - Active conversations, pending, accepted states
 *
 * This is an explicit route (not mode-aware) per Manual architecture principles.
 */
export default function ProviderRequestsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<ConsultRequest[]>([]);
  const [matchedFamilies, setMatchedFamilies] = useState<MatchedFamily[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(true);

  // Default to "received" for providers (families reaching out to them)
  const [activeTab, setActiveTab] = useState<"sent" | "received">("received");

  // Check for provider identity (Manual Ch 8: gentle nudges, not forced redirects)
  const { needsOnboarding, loading: identityLoading } = useProviderIdentity({
    checkMode: true,
  });

  useEffect(() => {
    if (status === "loading" || identityLoading) return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchRequests();
      fetchMatchedFamilies();
      markAsViewed();
    }
  }, [status, activeTab, identityLoading]);

  const markAsViewed = async () => {
    try {
      await fetch('/api/notifications/mark-viewed', {
        method: 'POST',
      });
    } catch (err) {
      console.error("Error marking as viewed:", err);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/requests?type=${activeTab}&requestType=CONSULTATION`);
      if (response.ok) {
        const data = await response.json();
        // Filter out DECLINED requests so deleted requests don't reappear
        setRequests(data.filter((req: ConsultRequest) => req.status !== "DECLINED"));
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchedFamilies = async () => {
    setMatchesLoading(true);
    try {
      // Fetch family profiles that match this provider's care types
      const response = await fetch('/api/provider/matches');
      if (response.ok) {
        const data = await response.json();
        setMatchedFamilies(data);
      }
    } catch (err) {
      console.error("Error fetching matched families:", err);
    } finally {
      setMatchesLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchRequests();
      }
    } catch (err) {
      console.error("Error updating request:", err);
    }
  };

  const handleDelete = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this request? This will notify the other party that the request was declined.')) {
      return;
    }

    try {
      // Optimistically remove from UI
      setRequests(prev => prev.filter(r => r.id !== requestId));

      const response = await fetch(`/api/requests/${requestId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // If delete failed, refetch to restore state
        fetchRequests();
      }
    } catch (err) {
      console.error("Error deleting request:", err);
      // Refetch to restore state on error
      fetchRequests();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-800";
      case "ACCEPTED":
        return "bg-emerald-100 text-emerald-800";
      case "DECLINED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCombinedBadgeText = (status: string, activeTab: string) => {
    // Simplified, user-friendly status messages
    if (status === "PENDING") {
      return activeTab === "sent" ? "Waiting for reply" : "Needs your response";
    } else if (status === "ACCEPTED") {
      return "Conversation started";
    } else if (status === "DECLINED") {
      return "Declined";
    } else if (status === "COMPLETED") {
      return "Completed";
    }
    return status;
  };

  const getStatusTooltip = (status: string, activeTab: string) => {
    switch (status) {
      case "PENDING":
        if (activeTab === "received") {
          return "This request is awaiting your response. Accept or decline to continue.";
        } else {
          return "Waiting for the family to respond to your outreach.";
        }
      case "ACCEPTED":
        return "Request accepted! Contact information is now unlocked. Continue the conversation in messages.";
      case "DECLINED":
        return "This request was declined. No further action is needed.";
      case "COMPLETED":
        return "This consultation has been marked as completed.";
      default:
        return "";
    }
  };

  // Calculate stats for the header
  const pendingCount = requests.filter(r => r.status === "PENDING").length;
  const activeCount = requests.filter(r => r.status === "ACCEPTED").length;
  const totalMessages = requests.reduce((acc, r) => acc + (r._count?.messages || 0), 0);

  // Skeleton Loading Component
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-24"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="flex gap-2">
        <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
        <div className="h-10 bg-gray-200 rounded-xl w-28"></div>
      </div>
    </div>
  );

  const SkeletonMatchCard = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      </div>
      <div className="flex gap-1 mb-3">
        <div className="h-5 bg-gray-200 rounded w-16"></div>
        <div className="h-5 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
    </div>
  );

  if (status === "loading" || identityLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        {/* Skeleton Hero */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse">
              <div className="h-10 bg-white/20 rounded w-48 mb-3"></div>
              <div className="h-6 bg-white/20 rounded w-96 mb-8"></div>
              <div className="grid grid-cols-3 gap-6 max-w-2xl">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                    <div className="h-8 bg-white/20 rounded w-12 mb-2"></div>
                    <div className="h-4 bg-white/20 rounded w-20"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      {/* Hero Header with Gradient */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-3">Family Connections</h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl">
            Manage your family connections and discover new care opportunities
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold">{matchedFamilies.length}</p>
                  <p className="text-sm text-blue-200">Matched Families</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/30 rounded-xl">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                  <p className="text-sm text-blue-200">Pending</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/30 rounded-xl">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeCount}</p>
                  <p className="text-sm text-blue-200">Active</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalMessages}</p>
                  <p className="text-sm text-blue-200">Messages</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Onboarding prompt for incomplete profiles */}
        {needsOnboarding && (
          <div className="mb-8">
            <OnboardingPrompt context="requests" />
          </div>
        )}

        {/* Matched Families Section */}
        {!needsOnboarding && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Matched Families</h2>
                  <p className="text-sm text-gray-600">Families looking for care that match your services</p>
                </div>
              </div>
              <Link
                href="/provider/leads"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                View All
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {matchesLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => <SkeletonMatchCard key={i} />)}
              </div>
            ) : matchedFamilies.length > 0 ? (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {matchedFamilies.slice(0, 3).map((family) => (
                    <div key={family.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{family.user.name}</h3>
                          <p className="text-sm text-gray-600">{family.city}, {family.state}</p>
                        </div>
                        {family.matchScore && (
                          <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full">
                            {family.matchScore}% match
                          </span>
                        )}
                      </div>
                      {family.careTypes && family.careTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {family.careTypes.slice(0, 2).map((type) => (
                            <span key={type} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">
                              {type.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
                            </span>
                          ))}
                          {family.careTypes.length > 2 && (
                            <span className="text-gray-500 text-xs px-2 py-1">+{family.careTypes.length - 2} more</span>
                          )}
                        </div>
                      )}
                      {family.matchReasons && family.matchReasons.length > 0 && (
                        <p className="text-xs text-gray-500 mb-3 line-clamp-1">{family.matchReasons[0]}</p>
                      )}
                      <Link
                        href={`/provider/leads/${family.id}`}
                        className="block w-full text-center bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 text-sm font-medium transition-colors"
                      >
                        View Profile
                      </Link>
                    </div>
                  ))}
                </div>
                {matchedFamilies.length > 3 && (
                  <div className="mt-4 text-center">
                    <Link
                      href="/provider/leads"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      See {matchedFamilies.length - 3} more matched families →
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">No matched families yet. Complete your profile to appear in search results.</p>
                <Link
                  href="/provider/leads"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Browse All Families →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tabs Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200 px-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("received")}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "received"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  Families Reaching Out
                </span>
              </button>
              <button
                onClick={() => setActiveTab("sent")}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "sent"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Your Outreach
                </span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : requests.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {activeTab === "sent"
                    ? "No outreach sent yet"
                    : "No requests received yet"}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {activeTab === "received"
                    ? needsOnboarding
                      ? "Complete your provider profile to appear in family searches and start receiving care requests."
                      : "Families looking for care providers will appear here when they reach out to you."
                    : "Browse family care requests and reach out to families who need your services."}
                </p>
                {activeTab === "received" && needsOnboarding && (
                  <Link
                    href="/provider/profile/edit"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-medium transition-colors"
                  >
                    Complete Your Profile
                  </Link>
                )}
                {activeTab === "sent" && (
                  <Link
                    href="/provider/leads"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-medium transition-colors"
                  >
                    Browse Family Requests
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-semibold text-lg">
                            {(request.familyProfile?.user.name || "F")[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.familyProfile?.user.name || "Family"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {request.familyProfile
                              ? `${request.familyProfile.city}, ${request.familyProfile.state}`
                              : ""}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activeTab === "sent"
                              ? `To: ${request.familyProfile?.user.name || "Family"}`
                              : `From: ${request.sender.name}`} •{" "}
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {request._count && request._count.messages > 0 && (
                          <div className="flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-medium">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            <span>{request._count.messages} new</span>
                          </div>
                        )}
                        <Tooltip content={getStatusTooltip(request.status, activeTab)}>
                          <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(request.status)} cursor-help`}>
                            {getCombinedBadgeText(request.status, activeTab)}
                          </span>
                        </Tooltip>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">{request.message}</p>

                    <div className="flex gap-3 flex-wrap">
                      {request.status === "PENDING" && activeTab === "received" && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(request.id, "ACCEPTED")}
                            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 text-sm font-medium transition-colors"
                          >
                            Yes, Let&apos;s Connect
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(request.id, "DECLINED")}
                            className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors"
                          >
                            No Thanks
                          </button>
                        </>
                      )}
                      <Link
                        href={`/provider/requests/${request.id}`}
                        className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleDelete(request.id)}
                        className="ml-auto text-red-600 hover:text-red-700 px-4 py-2.5 text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
