"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import Footer from "@/components/Navigation/Footer";
import Breadcrumb from "@/components/Navigation/Breadcrumb";
import { showToast } from "@/lib/toast";

type OpportunityRequest = {
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
    description?: string;
    coverPhoto?: string;
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
  senderProvider?: {
    id: string;
    name: string;
    providerType: string;
    city: string;
    state: string;
    email?: string;
    phone?: string;
    coverPhoto?: string;
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
 * Opportunity Detail Page - For caregivers viewing their application details
 *
 * Shows the conversation and details for a hiring request between the caregiver
 * and an organization they applied to, or an organization that reached out to them.
 */
export default function OpportunityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const [request, setRequest] = useState<OpportunityRequest | null>(null);
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
        showToast.error("Failed to load opportunity details");
        router.push("/provider/opportunities");
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
        showToast.success("Opportunity accepted! You can now exchange messages.");
      } else {
        showToast.error("Failed to accept opportunity");
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
        showToast.success("Opportunity declined");
      } else {
        showToast.error("Failed to decline opportunity");
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

  const getStatusText = (status: string, isSender: boolean) => {
    if (status === "PENDING") {
      return isSender ? "Waiting for response" : "Awaiting your response";
    } else if (status === "ACCEPTED") {
      return "In conversation";
    } else if (status === "DECLINED") {
      return "Declined";
    } else if (status === "COMPLETED") {
      return "Completed";
    }
    return status;
  };

  const formatProviderType = (type: string) => {
    return type
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="bg-white rounded-xl p-6 mb-6">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return null;
  }

  const isSender = request.sender.id === session?.user?.id;
  const requestAccepted = request.status === "ACCEPTED" || request.status === "COMPLETED";

  // Determine the organization info - could be from provider or senderProvider
  const organizationInfo = isSender
    ? request.provider
    : request.senderProvider || request.provider;

  const organizationName = organizationInfo?.name || "Organization";
  const organizationLocation = organizationInfo
    ? `${organizationInfo.city}, ${organizationInfo.state}`
    : "";
  const organizationType = organizationInfo?.providerType
    ? formatProviderType(organizationInfo.providerType)
    : "";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainNav />
      <Breadcrumb currentPage={organizationName} />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/provider/opportunities"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 font-medium"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to My Opportunities
        </Link>

        {/* Organization Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {/* Organization Banner */}
          <div className="h-24 bg-gradient-to-br from-primary-500 to-primary-700 relative">
            {organizationInfo?.coverPhoto && (
              <img
                src={organizationInfo.coverPhoto}
                alt=""
                className="w-full h-full object-cover opacity-50"
              />
            )}
          </div>

          <div className="p-6 -mt-8 relative">
            {/* Organization Icon */}
            <div className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center mb-4 border border-gray-100">
              <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{organizationName}</h1>
                <p className="text-primary-600 font-medium">{organizationType}</p>
                <p className="text-gray-600">{organizationLocation}</p>
              </div>
              <span className={`self-start px-4 py-1.5 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                {getStatusText(request.status, isSender)}
              </span>
            </div>

            {/* Action Buttons for Pending Requests (when organization reached out to caregiver) */}
            {request.status === "PENDING" && !isSender && (
              <div className="border-t border-gray-100 pt-6 mt-6">
                <p className="text-sm text-gray-600 mb-4">
                  {organizationName} is interested in hiring you. Review their message below and respond.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleAccept}
                    className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-xl hover:bg-emerald-700 font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Accept & Start Conversation
                  </button>
                  <button
                    onClick={handleDecline}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            )}

            {/* Waiting indicator for sent applications */}
            {request.status === "PENDING" && isSender && (
              <div className="border-t border-gray-100 pt-6 mt-6">
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-amber-900">Waiting for response</p>
                      <p className="text-sm text-amber-700 mt-1">
                        {organizationName} typically responds within 2-3 business days. You'll be notified when they reply.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information (shown when accepted) */}
        {requestAccepted && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Contact Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Email</p>
                <p className="text-gray-900 font-medium">{organizationInfo?.email || "Not provided"}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Phone</p>
                <p className="text-gray-900 font-medium">{organizationInfo?.phone || "Not provided"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Original Message / Application */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            {isSender ? "Your Application" : "Their Message"}
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">{request.message}</p>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            {isSender ? "Sent" : "Received"} on {new Date(request.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Messages Section */}
        {request.messages && request.messages.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Conversation</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {request.messages.map((message) => {
                const isOwnMessage = message.senderId === session?.user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        isOwnMessage
                          ? "bg-primary-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={`text-xs mt-1.5 ${
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Send a Message</h3>
            <div className="space-y-3">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                rows={3}
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="bg-primary-600 text-white px-6 py-2.5 rounded-xl hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-colors flex items-center gap-2"
                >
                  {sending ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Helpful tip */}
        {requestAccepted && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Tip: Be responsive to messages. Organizations appreciate quick replies.
            </p>
          </div>
        )}
      </main>

      <Footer variant="light" />
    </div>
  );
}
