"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import PaywallModal from "@/components/Paywall/PaywallModal";
import { showToast } from "@/lib/toast";
import { maskContactInfo } from "@/lib/contact-masking";

type ConsultRequest = {
  id: string;
  status: string;
  message: string;
  createdAt: string;
  provider: {
    id: string;
    name: string;
    providerType: string;
    city: string;
    state: string;
    email: string;
    phone: string;
  };
  familyProfile: {
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
  };
  messages: {
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
  }[];
};

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const [request, setRequest] = useState<ConsultRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [paywallOpen, setPaywallOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchRequest();
    }
  }, [status]);

  useEffect(() => {
    scrollToBottom();
  }, [request?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchRequest = async () => {
    try {
      const response = await fetch(`/api/requests/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setRequest(data);
      } else {
        router.push("/dashboard/requests");
      }
    } catch (err) {
      console.error("Error fetching request:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await fetch(`/api/requests/${params.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      if (response.ok) {
        setNewMessage("");
        fetchRequest();
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/requests/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchRequest();
        showToast.success(`Request ${newStatus.toLowerCase()}`);
      } else {
        const data = await response.json();
        if (data.requiresUpgrade) {
          setPaywallOpen(true);
        } else {
          showToast.error(data.error || "Failed to update request");
        }
      }
    } catch (err) {
      console.error("Error updating request:", err);
      showToast.error("Failed to update request");
    }
  };

  const handleUpgradeSubscription = async (tier: 'BASIC' | 'PRO') => {
    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success(`Upgraded to ${tier}!`);
        setPaywallOpen(false);
        // Refresh the page to show updated subscription status
        fetchRequest();
      } else {
        throw new Error(data.error || 'Failed to upgrade');
      }
    } catch (err: any) {
      console.error('Error upgrading subscription:', err);
      throw err;
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

  if (!request) {
    return null;
  }

  const isFamily = session?.user?.role === "FAMILY";
  const isSender = request.sender.id === session?.user?.id;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainNav />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/dashboard/requests" className="text-primary-600 hover:text-primary-700">
            ← Back to Requests
          </Link>
        </div>

        {/* Request Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isFamily ? request.provider.name : request.familyProfile.user.name}
              </h1>
              <p className="text-gray-600">
                {isFamily
                  ? `${request.provider.providerType.split('_').join(' ')} • ${request.provider.city}, ${request.provider.state}`
                  : `${request.familyProfile.city}, ${request.familyProfile.state}`}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
          </div>

          {/* Contact Information */}
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
            {request.status === "ACCEPTED" || request.status === "COMPLETED" ? (
              <div>
                <div className="grid md:grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-600">Name:</p>
                    <p className="text-gray-900">
                      {isFamily ? request.provider.name : request.familyProfile.user.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email:</p>
                    <p className="text-gray-900">
                      <a href={`mailto:${isFamily ? request.provider.email : request.familyProfile.user.email}`} className="text-primary-600 hover:text-primary-700">
                        {isFamily ? request.provider.email : request.familyProfile.user.email}
                      </a>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone:</p>
                    <p className="text-gray-900">
                      {isFamily ? (
                        <a href={`tel:${request.provider.phone}`} className="text-primary-600 hover:text-primary-700">
                          {request.provider.phone}
                        </a>
                      ) : (
                        request.familyProfile.user.phone ? (
                          <a href={`tel:${request.familyProfile.user.phone}`} className="text-primary-600 hover:text-primary-700">
                            {request.familyProfile.user.phone}
                          </a>
                        ) : "Not provided"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Contact information unlocked</span>
                </div>
              </div>
            ) : (
              <div>
                <div className="grid md:grid-cols-2 gap-4 text-sm mb-3">
                  {(() => {
                    const contactToMask = isFamily
                      ? { name: request.provider.name, email: request.provider.email, phone: request.provider.phone }
                      : { name: request.familyProfile.user.name, email: request.familyProfile.user.email, phone: request.familyProfile.user.phone };
                    const masked = maskContactInfo(contactToMask);
                    return (
                      <>
                        <div>
                          <p className="text-gray-600">Name:</p>
                          <p className="text-gray-500">{masked.name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Email:</p>
                          <p className="text-gray-500">{masked.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Phone:</p>
                          <p className="text-gray-500">{masked.phone}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800">Contact information is locked</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Full contact details will be available once both parties accept the consultation request.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions - Only show for recipients, not senders */}
          {!isSender && request.status === "PENDING" && (
            <div className="border-t pt-4 mt-4 flex gap-2">
              <button
                onClick={() => handleStatusUpdate("ACCEPTED")}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Accept Request
              </button>
              <button
                onClick={() => handleStatusUpdate("DECLINED")}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Decline Request
              </button>
            </div>
          )}

          {!isSender && request.status === "ACCEPTED" && (
            <div className="border-t pt-4 mt-4">
              <button
                onClick={() => handleStatusUpdate("COMPLETED")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Mark as Completed
              </button>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="bg-white rounded-lg shadow flex flex-col" style={{ height: "500px" }}>
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          </div>

          {/* Message List */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {/* Initial Request Message */}
            <div className="flex">
              <div className="max-w-[70%]">
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {request.sender.name}
                  </p>
                  <p className="text-gray-700">{request.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Subsequent Messages */}
            {request.messages.map((message) => {
              const isOwnMessage = message.senderId === session?.user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[70%] ${isOwnMessage ? "bg-primary-600" : "bg-gray-100"} rounded-lg p-3`}>
                    <p className={`text-sm ${isOwnMessage ? "text-white" : "text-gray-700"}`}>
                      {message.content}
                    </p>
                    <p className={`text-xs mt-1 ${isOwnMessage ? "text-primary-100" : "text-gray-500"}`}>
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md"
                disabled={request.status === "DECLINED" || request.status === "COMPLETED"}
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim() || request.status === "DECLINED" || request.status === "COMPLETED"}
                className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </form>
            {(request.status === "DECLINED" || request.status === "COMPLETED") && (
              <p className="text-sm text-gray-500 mt-2">
                This conversation is {request.status.toLowerCase()}.
              </p>
            )}
          </div>
        </div>
      </main>

      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onUpgrade={handleUpgradeSubscription}
      />
    </div>
  );
}
