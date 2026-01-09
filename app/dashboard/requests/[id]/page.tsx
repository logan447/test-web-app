"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import PaywallModal from "@/components/Paywall/PaywallModal";
import { showToast } from "@/lib/toast";
import { maskContactInfo } from "@/lib/contact-masking";
import Tooltip from "@/components/UI/Tooltip";
import ModernMessageBubble from "@/components/Messaging/ModernMessageBubble";
import MessageTimestamp, { groupMessagesByDate, shouldGroupMessages } from "@/components/Messaging/MessageTimestamp";

type ConsultRequest = {
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
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [request, setRequest] = useState<ConsultRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [paywallOpen, setPaywallOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine back link based on where user came from and request type
  const fromSaved = searchParams.get('from') === 'saved';
  const isProviderMode = (session?.user?.activeMode || 'FAMILY') === 'PROVIDER';
  const isHiringRequest = request?.requestType === 'HIRING';

  const backHref = fromSaved
    ? (isProviderMode ? '/provider/saved' : '/dashboard/saved')
    : isHiringRequest
      ? '/provider/hiring-requests'
      : '/dashboard/requests';

  const backText = fromSaved
    ? '← Back to Saved'
    : isHiringRequest
      ? '← Back to Hiring Requests'
      : '← Back to My Requests';

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchRequest();
      markAsViewed();
    }
  }, [status]);

  const markAsViewed = async () => {
    try {
      await fetch('/api/notifications/mark-viewed', {
        method: 'POST',
      });
    } catch (err) {
      console.error("Error marking as viewed:", err);
    }
  };

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

  const handleUpgradeSubscription = async (tier: 'PRO') => {
    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success('Provider membership activated!');
        setPaywallOpen(false);
        // Refresh the page to show updated subscription status
        fetchRequest();
      } else {
        throw new Error(data.error || 'Failed to activate membership');
      }
    } catch (err: any) {
      console.error('Error activating membership:', err);
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

  const getCombinedBadgeText = (requestType: string | undefined, isSender: boolean, status: string) => {
    // Simplified, user-friendly status messages
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

  const getStatusTooltip = (status: string, isSender: boolean) => {
    switch (status) {
      case "PENDING":
        if (!isSender) {
          return "This request is awaiting your response. Accept or decline to continue.";
        } else {
          return "Waiting for the other party to respond to your request.";
        }
      case "ACCEPTED":
        return "Request accepted! Contact information is now unlocked. Continue the conversation in messages.";
      case "DECLINED":
        return "This request was declined. No further action is needed.";
      case "COMPLETED":
        return "This conversation has been marked as completed.";
      default:
        return "";
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

  const isFamily = (session?.user?.activeMode || 'FAMILY') === "FAMILY";
  const isSender = request.sender.id === session?.user?.id;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainNav />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href={backHref} className="text-primary-600 hover:text-primary-700">
            {backText}
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
            <Tooltip content={getStatusTooltip(request.status, isSender)}>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)} cursor-help`}>
                {getCombinedBadgeText(request.requestType, isSender, request.status)}
              </span>
            </Tooltip>
          </div>

          {/* Contact Information */}
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
            {(() => {
              // Determine if contact should be visible
              const requestAccepted = request.status === "ACCEPTED" || request.status === "COMPLETED";
              const isOrganizationProvider = isFamily && request.provider.providerType !== "INDEPENDENT_CAREGIVER";
              const shouldShowContact = requestAccepted || isOrganizationProvider;

              if (shouldShowContact) {
                return (
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
                      <span>
                        {requestAccepted
                          ? "Contact information unlocked"
                          : "Organization contact info visible"}
                      </span>
                    </div>
                  </div>
                );
              }

              // Show masked contact
              return (
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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800">Contact info will appear after you connect</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Once you both agree to connect, you&apos;ll be able to see phone numbers and email addresses.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              );
            })()}
          </div>

          {/* Actions - Only show for recipients, not senders */}
          {!isSender && request.status === "PENDING" && (
            <div className="border-t pt-4 mt-4 flex gap-2">
              <button
                onClick={() => handleStatusUpdate("ACCEPTED")}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Yes, Let&apos;s Connect
              </button>
              <button
                onClick={() => handleStatusUpdate("DECLINED")}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                No Thanks
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
        <div className="bg-white rounded-lg shadow flex flex-col overflow-hidden" style={{ height: "600px" }}>
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Messages</h2>
            {request.status === "PENDING" && !isSender && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                <p className="text-sm text-yellow-800">
                  <strong>Action needed:</strong> Review the request above and decide if you&apos;d like to connect. Once you accept, you can exchange messages and see contact information.
                </p>
              </div>
            )}
            {request.status === "PENDING" && isSender && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                <p className="text-sm text-blue-800">
                  <strong>Waiting for reply:</strong> Your request has been sent. You&apos;ll be notified when they respond.
                </p>
              </div>
            )}
            {request.status === "ACCEPTED" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                <p className="text-sm text-green-800">
                  <strong>Connected!</strong> You can now exchange messages below and see contact information above.
                </p>
              </div>
            )}
            {request.status === "DECLINED" && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
                <p className="text-sm text-gray-700">
                  <strong>Declined:</strong> This conversation was declined and is now closed.
                </p>
              </div>
            )}
            {request.status === "COMPLETED" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                <p className="text-sm text-blue-800">
                  <strong>Completed:</strong> This conversation has been marked as complete and is now closed.
                </p>
              </div>
            )}
          </div>

          {/* Message List */}
          <div className="flex-grow overflow-y-auto p-4 bg-gray-50" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}>
            {(() => {
              // Combine initial message with subsequent messages for proper grouping
              const allMessages = [
                {
                  id: `initial-${request.id}`,
                  senderId: request.sender.id,
                  content: request.message,
                  createdAt: request.createdAt,
                },
                ...request.messages,
              ];

              // Group messages by date
              const messageGroups = groupMessagesByDate(allMessages);

              return messageGroups.map((group, groupIdx) => (
                <div key={group.date.toISOString()}>
                  {/* Date Header */}
                  <MessageTimestamp date={group.date} />

                  {/* Messages for this date */}
                  <div className="space-y-0.5">
                    {group.messages.map((message, messageIdx) => {
                      const isOwnMessage = message.senderId === session?.user?.id;
                      const previousMessage = messageIdx > 0 ? group.messages[messageIdx - 1] : null;
                      const showAvatar = !shouldGroupMessages(message, previousMessage);

                      // Get sender name
                      const senderName = isOwnMessage
                        ? session?.user?.name || "You"
                        : request.sender.id === message.senderId
                        ? request.sender.name
                        : "Unknown";

                      return (
                        <ModernMessageBubble
                          key={message.id}
                          content={message.content}
                          isOwn={isOwnMessage}
                          senderName={senderName}
                          timestamp={new Date(message.createdAt)}
                          showAvatar={showAvatar}
                          showName={false}
                          status={isOwnMessage ? "SENT" : undefined}
                        />
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t bg-white">
            <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
              <div className="flex-grow">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    // Send on Enter (but allow Shift+Enter for new lines)
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e as any);
                    }
                  }}
                  placeholder="Type a message..."
                  rows={1}
                  className="
                    w-full px-4 py-3
                    border border-gray-300 rounded-2xl
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    resize-none max-h-32
                    disabled:bg-gray-100 disabled:cursor-not-allowed
                  "
                  disabled={request.status === "DECLINED" || request.status === "COMPLETED"}
                  style={{
                    minHeight: "48px",
                    maxHeight: "128px",
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={sending || !newMessage.trim() || request.status === "DECLINED" || request.status === "COMPLETED"}
                className="
                  bg-primary-600 text-white
                  w-12 h-12
                  rounded-full
                  flex items-center justify-center
                  hover:bg-primary-700
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                  shadow-md hover:shadow-lg
                  flex-shrink-0
                "
                aria-label="Send message"
              >
                {sending ? (
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                )}
              </button>
            </form>
            {(request.status === "DECLINED" || request.status === "COMPLETED") && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                This conversation is {request.status.toLowerCase()}
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
