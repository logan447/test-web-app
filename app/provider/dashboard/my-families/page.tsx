"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import Breadcrumb from "@/components/Navigation/Breadcrumb";
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

/**
 * My Families - Provider-side engagement management
 *
 * Shows families that have an engagement relationship with this provider:
 * - Families who submitted a request to the provider
 * - Families the provider reached out to
 * - Active conversations, pending, accepted states
 *
 * This is an explicit route (not mode-aware) per Manual architecture principles.
 */
export default function MyFamiliesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<ConsultRequest[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading || status === "loading" || identityLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <Breadcrumb />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            My Families
          </h1>
          <p className="text-lg text-gray-600">
            Manage your family care connections and requests
          </p>
        </div>

        {/* Onboarding prompt for incomplete profiles */}
        {needsOnboarding && (
          <OnboardingPrompt context="requests" />
        )}

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
              Families Reaching Out
            </button>
            <button
              onClick={() => setActiveTab("sent")}
              className={`pb-4 border-b-2 font-medium ${
                activeTab === "sent"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Your Outreach
            </button>
          </nav>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-300 mb-4"
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
                href="/provider/onboarding"
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium"
              >
                Complete Your Profile
              </Link>
            )}
            {activeTab === "sent" && (
              <Link
                href="/provider/find-families"
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium"
              >
                Browse Family Requests
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-4">
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
                  <div className="flex flex-col items-end gap-2">
                    {request._count && request._count.messages > 0 && (
                      <div className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <span>{request._count.messages} new message{request._count.messages > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    <Tooltip content={getStatusTooltip(request.status, activeTab)}>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)} cursor-help`}>
                        {getCombinedBadgeText(request.status, activeTab)}
                      </span>
                    </Tooltip>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{request.message}</p>

                <div className="flex gap-2 flex-wrap">
                  {request.status === "PENDING" && activeTab === "received" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(request.id, "ACCEPTED")}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                      >
                        Yes, Let&apos;s Connect
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(request.id, "DECLINED")}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
                      >
                        No Thanks
                      </button>
                    </>
                  )}
                  <Link
                    href={`/provider/dashboard/my-families/${request.id}`}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm"
                  >
                    View Request
                  </Link>
                  <button
                    onClick={() => handleDelete(request.id)}
                    className="ml-auto bg-white border border-red-300 text-red-600 px-4 py-2 rounded-md hover:bg-red-50 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
