"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import Tooltip from "@/components/UI/Tooltip";

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

function RequestsPageContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<ConsultRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Provider mode users see "received" (families contacting them), Family mode sees "sent" (to providers)
  const isProviderMode = session?.user?.activeMode === 'PROVIDER';
  const [activeTab, setActiveTab] = useState<"sent" | "received">(
    isProviderMode ? "received" : "sent"
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchRequests();
      markAsViewed();
    }
  }, [status, activeTab]);

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
        return "bg-yellow-100 text-yellow-800";
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
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
    const isFamily = (session?.user?.activeMode || 'FAMILY') === 'FAMILY';

    switch (status) {
      case "PENDING":
        if (activeTab === "received") {
          return "This request is awaiting your response. Accept or decline to continue.";
        } else {
          return "Waiting for the other party to respond to your request.";
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

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const isFamily = (session?.user?.activeMode || 'FAMILY') === 'FAMILY';

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isFamily ? "My Providers" : "My Families"}
          </h1>
          <p className="text-lg text-gray-600">
            {isFamily
              ? "Track your consultation requests with care providers. View responses, start conversations, and manage your connections."
              : "Manage consultation requests from families seeking care. Respond to inquiries and connect with potential clients."}
          </p>
        </div>

        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("received")}
              className={`pb-4 border-b-2 font-medium ${
                activeTab === "received"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {isFamily ? "Received from Providers" : "Received from Families"}
            </button>
            <button
              onClick={() => setActiveTab("sent")}
              className={`pb-4 border-b-2 font-medium ${
                activeTab === "sent"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {isFamily ? "Sent to Providers" : "Sent to Families"}
            </button>
          </nav>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-300"
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
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              {activeTab === "sent" ? "No requests sent yet" : "No requests received yet"}
            </h3>
            <p className="mt-2 text-gray-600">
              {activeTab === "sent"
                ? isFamily
                  ? "Start browsing providers and send consultation requests to connect with the right care."
                  : "You haven't sent any requests to families yet."
                : isFamily
                ? "When providers respond to your requests, they'll appear here."
                : "When families send you consultation requests, they'll appear here."}
            </p>
            {isFamily && activeTab === "sent" && (
              <div className="mt-6">
                <Link
                  href="/"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 font-semibold transition-all shadow-sm hover:shadow-md"
                >
                  Browse Providers
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {requests.map((request) => {
              const providerData = isFamily ? request.provider : null;
              const familyData = !isFamily ? request.familyProfile : null;
              const displayName = isFamily ? providerData?.name : familyData?.user.name;
              const displayLocation = isFamily
                ? `${providerData?.city}, ${providerData?.state}`
                : familyData ? `${familyData.city}, ${familyData.state}` : "";
              const imageUrl = providerData?.coverPhoto || providerData?.photos?.[0] || "/default-provider-image.jpg";

              return (
                <div
                  key={request.id}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Image Section */}
                  {isFamily && (
                    <div className="relative h-36 bg-gray-200 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={displayName || "Provider"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Status Badge Overlay */}
                      <div className="absolute top-3 left-3">
                        <Tooltip content={getStatusTooltip(request.status, activeTab)}>
                          <span className={`px-3 py-1.5 rounded-md text-xs font-semibold ${getStatusColor(request.status)} cursor-help shadow-sm`}>
                            {getCombinedBadgeText(request.status, activeTab)}
                          </span>
                        </Tooltip>
                      </div>

                      {/* New Messages Badge */}
                      {request._count && request._count.messages > 0 && (
                        <div className="absolute top-3 right-3">
                          <div className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            <span>{request._count.messages}</span>
                          </div>
                        </div>
                      )}

                      {/* Request Date Badge */}
                      <div className="absolute bottom-3 right-3">
                        <span className="bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm">
                          {new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Content Section */}
                  <div className="p-5">
                    {/* Header */}
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1 mb-1">
                        {displayName}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {displayLocation}
                      </p>
                      {!isFamily && (
                        <div className="flex items-center gap-2 mt-2">
                          {request._count && request._count.messages > 0 && (
                            <div className="flex items-center gap-1 bg-red-100 text-red-800 px-2.5 py-1 rounded-md text-xs font-medium">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                              <span>{request._count.messages}</span>
                            </div>
                          )}
                          <Tooltip content={getStatusTooltip(request.status, activeTab)}>
                            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${getStatusColor(request.status)} cursor-help`}>
                              {getCombinedBadgeText(request.status, activeTab)}
                            </span>
                          </Tooltip>
                        </div>
                      )}
                    </div>

                    {/* Request Info */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {activeTab === "sent"
                          ? `Sent to ${displayName}`
                          : `From ${request.sender.name}`} • {new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed line-clamp-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                        {request.message}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    {request.status === "PENDING" && activeTab === "received" && (
                      <div className="flex gap-2 mb-3 pb-3 border-b border-gray-100">
                        <button
                          onClick={() => handleStatusUpdate(request.id, "ACCEPTED")}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(request.id, "DECLINED")}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    )}

                    {/* View Request & Delete */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/requests/${request.id}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 font-medium transition-colors text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        View Details
                      </Link>
                      <button
                        onClick={() => handleDelete(request.id)}
                        className="bg-white border border-gray-200 text-gray-600 p-2.5 rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                        title="Delete request"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function RequestsPage() {
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
      <RequestsPageContent />
    </Suspense>
  );
}
