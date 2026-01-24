"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import Footer from "@/components/Navigation/Footer";
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
    coverPhoto?: string | null;
  };
  sender: {
    name: string;
  };
  messages?: any[];
  _count?: {
    messages: number;
  };
};

/**
 * Requests - Family-side engagement management
 */
export default function RequestsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<ConsultRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"sent" | "received">("sent");

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
      setRequests(prev => prev.filter(r => r.id !== requestId));

      const response = await fetch(`/api/requests/${requestId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        fetchRequests();
      }
    } catch (err) {
      console.error("Error deleting request:", err);
      fetchRequests();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "ACCEPTED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "DECLINED":
        return "bg-red-100 text-red-800 border-red-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCombinedBadgeText = (status: string, activeTab: string) => {
    if (status === "PENDING") {
      return activeTab === "sent" ? "Waiting for reply" : "Needs your response";
    } else if (status === "ACCEPTED") {
      return "Connected";
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
          return "Waiting for the provider to respond to your request.";
        }
      case "ACCEPTED":
        return "Request accepted! Contact information is now unlocked.";
      case "DECLINED":
        return "This request was declined.";
      case "COMPLETED":
        return "This engagement has been marked as completed.";
      default:
        return "";
    }
  };

  const pendingCount = requests.filter(r => r.status === "PENDING").length;
  const acceptedCount = requests.filter(r => r.status === "ACCEPTED").length;

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        {/* Hero Skeleton */}
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse">
              <div className="h-10 bg-white/20 rounded-lg w-1/3 mb-4"></div>
              <div className="h-5 bg-white/20 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-xl p-6 shadow-sm">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 p-2 rounded-lg">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">Messages & Requests</h1>
              </div>
              <p className="text-primary-100 text-lg">
                Manage your provider connections and conversations
              </p>
            </div>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Request
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{requests.length}</div>
              <div className="text-blue-100 text-sm">Total</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{pendingCount}</div>
              <div className="text-blue-100 text-sm">Pending</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{acceptedCount}</div>
              <div className="text-blue-100 text-sm">Connected</div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-1.5 inline-flex">
          <button
            onClick={() => setActiveTab("sent")}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "sent"
                ? "bg-primary-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Your Requests
            </span>
          </button>
          <button
            onClick={() => setActiveTab("received")}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "received"
                ? "bg-primary-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              Provider Outreach
            </span>
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-blue-500"
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
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {activeTab === "sent"
                ? "No requests sent yet"
                : "No provider outreach yet"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {activeTab === "sent"
                ? "Browse providers and send an engagement request to get started."
                : "Providers you've connected with will appear here when they reach out."}
            </p>
            {activeTab === "sent" && (
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 font-semibold transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Providers
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-primary-200 transition-all duration-200"
              >
                <div className="p-6">
                  <div className="flex gap-4">
                    {/* Provider Image */}
                    <div className="shrink-0">
                      {request.provider.coverPhoto ? (
                        <img
                          src={request.provider.coverPhoto}
                          alt={request.provider.name}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                          <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {request.provider.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {request.provider.city}, {request.provider.state}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {request._count && request._count.messages > 0 && (
                            <div className="flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                              <span>{request._count.messages} new</span>
                            </div>
                          )}
                          <Tooltip content={getStatusTooltip(request.status, activeTab)}>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(request.status)} cursor-help`}>
                              {getCombinedBadgeText(request.status, activeTab)}
                            </span>
                          </Tooltip>
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 mb-3">
                        {activeTab === "sent"
                          ? `Sent to ${request.provider.name}`
                          : `From: ${request.sender.name}`} • {new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>

                      <p className="text-gray-700 line-clamp-2 mb-4">{request.message}</p>

                      <div className="flex flex-wrap gap-2">
                        {request.status === "PENDING" && activeTab === "received" && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(request.id, "ACCEPTED")}
                              className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm font-semibold transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Accept
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(request.id, "DECLINED")}
                              className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-semibold transition-colors"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        <Link
                          href={`/requests/${request.id}`}
                          className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 px-4 py-2 rounded-lg hover:bg-primary-100 text-sm font-semibold transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          View Conversation
                        </Link>
                        <button
                          onClick={() => handleDelete(request.id)}
                          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors ml-auto"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer variant="light" />
    </div>
  );
}
