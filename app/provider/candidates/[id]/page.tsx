"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import Breadcrumb from "@/components/Navigation/Breadcrumb";
import { showToast } from "@/lib/toast";
import { maskContactInfo } from "@/lib/contact-masking";

type HiringRequest = {
  id: string;
  status: string;
  message: string;
  createdAt: string;
  requestType?: string;
  provider: {
    id: string;
    name: string;
    providerType: string;
    city: string;
    state: string;
    email: string;
    phone: string;
  };
  familyProfile?: {
    user: {
      name: string;
      email: string;
      phone: string | null;
    };
    city: string;
    state: string;
  };
  sender: {
    id: string;
    name: string;
    email?: string;
  };
  messages: {
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
    status: string;
  }[];
};

/**
 * Candidate Detail Page - For organizations viewing hiring engagement details
 *
 * Shows the conversation and details for a hiring request between the organization
 * and an individual caregiver.
 */
export default function CandidateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const [request, setRequest] = useState<HiringRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (params.id) {
      fetchRequest(params.id as string);
    }
  }, [status, params.id, router]);

  const fetchRequest = async (id: string) => {
    try {
      const response = await fetch(`/api/requests/${id}`);
      if (response.ok) {
        const data = await response.json();
        setRequest(data);
      } else {
        showToast.error("Failed to load request details");
        router.push("/provider/candidates");
      }
    } catch (error) {
      console.error("Error fetching request:", error);
      showToast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (request?.messages?.length) {
      scrollToBottom();
    }
  }, [request?.messages]);

  const handleAccept = async () => {
    if (!request) return;

    try {
      const response = await fetch(`/api/requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACCEPTED" }),
      });

      if (response.ok) {
        setRequest({ ...request, status: "ACCEPTED" });
        showToast.success("Request accepted! You can now view contact details.");
      } else {
        showToast.error("Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      showToast.error("An error occurred");
    }
  };

  const handleDecline = async () => {
    if (!request) return;

    try {
      const response = await fetch(`/api/requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DECLINED" }),
      });

      if (response.ok) {
        setRequest({ ...request, status: "DECLINED" });
        showToast.success("Request declined");
      } else {
        showToast.error("Failed to decline request");
      }
    } catch (error) {
      console.error("Error declining request:", error);
      showToast.error("An error occurred");
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !request || sending) return;

    setSending(true);
    try {
      const response = await fetch(`/api/requests/${request.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      if (response.ok) {
        const message = await response.json();
        setRequest({
          ...request,
          messages: [...(request.messages || []), message],
        });
        setNewMessage("");
        showToast.success("Message sent");
      } else {
        showToast.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      showToast.error("An error occurred");
    } finally {
      setSending(false);
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

  const getCombinedBadgeText = (status: string, isSender: boolean) => {
    if (status === "PENDING") {
      return isSender ? "Waiting for reply" : "Needs your response";
    } else if (status === "ACCEPTED") {
      return "Conversation started";
    } else if (status === "DECLINED") {
      return "Declined";
    } else if (status === "COMPLETED") {
      return "Completed";
    }
    return status;
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!request) {
    return null;
  }

  const isSender = request.sender.id === session?.user?.id;
  const requestAccepted = request.status === "ACCEPTED" || request.status === "COMPLETED";

  // Determine the "other party" - either the caregiver (provider) or the sender
  const otherPartyName = isSender
    ? request.provider.name
    : request.sender.name;
  const otherPartyLocation = `${request.provider.city}, ${request.provider.state}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainNav />
      <Breadcrumb currentPage={otherPartyName} />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/provider/candidates"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to My Candidates
        </Link>

        {/* Request Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{otherPartyName}</h1>
              <p className="text-gray-600">{otherPartyLocation}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
              {getCombinedBadgeText(request.status, isSender)}
            </span>
          </div>

          {/* Contact Information */}
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
            {requestAccepted ? (
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Name:</p>
                  <p className="text-gray-900">{otherPartyName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Email:</p>
                  <p className="text-gray-900">{request.provider.email || request.sender.email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-gray-600">Phone:</p>
                  <p className="text-gray-900">{request.provider.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-gray-600">Location:</p>
                  <p className="text-gray-900">{otherPartyLocation}</p>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  Contact information is hidden until the request is accepted.
                  {!isSender && request.status === "PENDING" && (
                    <span> Accept the request to view contact details.</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons for Pending Requests */}
          {request.status === "PENDING" && !isSender && (
            <div className="border-t pt-4 mt-4 flex gap-4">
              <button
                onClick={handleAccept}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-medium transition"
              >
                Accept Request
              </button>
              <button
                onClick={handleDecline}
                className="flex-1 bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 font-medium transition"
              >
                Decline
              </button>
            </div>
          )}
        </div>

        {/* Original Message */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Original Request</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{request.message}</p>
          <p className="text-sm text-gray-500 mt-2">
            Sent on {new Date(request.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Messages Section */}
        {request.messages && request.messages.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Messages</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {request.messages.map((message) => {
                const isOwnMessage = message.senderId === session?.user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isOwnMessage
                          ? "bg-primary-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwnMessage ? "text-primary-200" : "text-gray-500"
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Message Input (only if request is accepted) */}
        {requestAccepted && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Send a Message</h3>
            <div className="flex gap-2">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                rows={3}
                className="flex-grow border rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={sending || !newMessage.trim()}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition self-end"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
