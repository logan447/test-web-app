"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";

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
};

export default function RequestsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<ConsultRequest[]>([]);
  const [loading, setLoading] = useState(true);
  // Default to "sent" for families (they send to providers), "received" for providers (they receive from families)
  const [activeTab, setActiveTab] = useState<"sent" | "received">(
    (session?.user?.activeMode || 'FAMILY') === "FAMILY" ? "sent" : "received"
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchRequests();
    }
  }, [status, activeTab]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/requests?type=${activeTab}`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
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
    if (!confirm('Are you sure you want to delete this request? This will mark it as declined.')) {
      return;
    }

    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchRequests();
      }
    } catch (err) {
      console.error("Error deleting request:", err);
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

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const isFamily = (session?.user?.activeMode || 'FAMILY') === 'FAMILY';

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-primary-600 hover:text-primary-700">
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Consultation Requests</h1>

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
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">
              {activeTab === "sent"
                ? "You haven't sent any consultation requests yet."
                : "No consultation requests yet."}
            </p>
            {isFamily && activeTab === "sent" && (
              <Link
                href="/providers"
                className="inline-block bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
              >
                Browse Providers
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {isFamily ? request.provider.name : request.familyProfile?.user.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {isFamily
                        ? `${request.provider.city}, ${request.provider.state}`
                        : request.familyProfile
                        ? `${request.familyProfile.city}, ${request.familyProfile.state}`
                        : ""}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activeTab === "sent"
                        ? `To: ${isFamily ? request.provider.name : request.familyProfile?.user.name}`
                        : `From: ${request.sender.name}`} •{" "}
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{request.message}</p>

                <div className="flex gap-2 flex-wrap">
                  {request.status === "PENDING" && activeTab === "received" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(request.id, "ACCEPTED")}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(request.id, "DECLINED")}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  <Link
                    href={`/dashboard/requests/${request.id}`}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm"
                  >
                    View Details
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
