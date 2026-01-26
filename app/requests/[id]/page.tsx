"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import Footer from "@/components/Navigation/Footer";
import PaywallModal from "@/components/Paywall/PaywallModal";
import { showToast } from "@/lib/toast";
import { ProviderType } from "@prisma/client";

type ConsultRequest = {
  id: string;
  status: string;
  message: string;
  createdAt: string;
  requestType?: string;
  provider: {
    id: string;
    name: string;
    providerType: ProviderType;
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
  tourAppointments?: {
    id: string;
    proposedBy: string;
    proposedDate: string;
    proposedTime: string;
    status: string;
    notes: string | null;
  }[];
};

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const [request, setRequest] = useState<ConsultRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [paywallOpen, setPaywallOpen] = useState(false);

  // Simple messaging state
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tour scheduling state
  const [showScheduler, setShowScheduler] = useState(false);
  const [proposedDate, setProposedDate] = useState("");
  const [proposedTime, setProposedTime] = useState("");
  const [schedulingNote, setSchedulingNote] = useState("");
  const [proposing, setProposing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchRequest();
    }
  }, [status]);

  const fetchRequest = async () => {
    try {
      const response = await fetch(`/api/requests/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setRequest(data);
        // Mark messages as read
        fetch(`/api/requests/${params.id}/messages/read`, { method: "PATCH" });
      } else {
        router.push("/requests");
      }
    } catch (err) {
      console.error("Error fetching request:", err);
    } finally {
      setLoading(false);
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
        showToast.success(newStatus === "ACCEPTED" ? "Connected!" : "Request declined");
      } else {
        const data = await response.json();
        if (data.requiresUpgrade) {
          setPaywallOpen(true);
        } else {
          showToast.error(data.error || "Something went wrong");
        }
      }
    } catch (err) {
      showToast.error("Something went wrong");
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
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (err) {
      showToast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleProposeTour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposedDate || !proposedTime) {
      showToast.error("Please select a date and time");
      return;
    }

    setProposing(true);
    try {
      const response = await fetch(`/api/requests/${params.id}/tours`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposedDate: new Date(proposedDate).toISOString(),
          proposedTime,
          notes: schedulingNote || undefined,
        }),
      });

      if (response.ok) {
        showToast.success("Meeting time proposed!");
        setShowScheduler(false);
        setProposedDate("");
        setProposedTime("");
        setSchedulingNote("");
        fetchRequest();
      } else {
        showToast.error("Failed to propose meeting time");
      }
    } catch (err) {
      showToast.error("Failed to propose meeting time");
    } finally {
      setProposing(false);
    }
  };

  const handleAcceptTour = async (tourId: string) => {
    try {
      const response = await fetch(`/api/requests/${params.id}/tours/${tourId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACCEPTED" }),
      });

      if (response.ok) {
        showToast.success("Meeting confirmed!");
        fetchRequest();
      }
    } catch (err) {
      showToast.error("Failed to confirm meeting");
    }
  };

  const handleDeclineTour = async (tourId: string) => {
    try {
      const response = await fetch(`/api/requests/${params.id}/tours/${tourId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DECLINED" }),
      });

      if (response.ok) {
        showToast.success("Meeting time declined");
        fetchRequest();
      }
    } catch (err) {
      showToast.error("Failed to decline meeting");
    }
  };

  const handleUpgradeSubscription = async (tier: 'PRO') => {
    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      if (response.ok) {
        showToast.success('Membership activated!');
        setPaywallOpen(false);
        fetchRequest();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to activate');
      }
    } catch (err: any) {
      throw err;
    }
  };

  // Helper functions
  const getEngagementType = (providerType: ProviderType) => {
    // Facility types → tour
    if (
      providerType === "ASSISTED_LIVING" ||
      providerType === "INDEPENDENT_LIVING" ||
      providerType === "MEMORY_CARE" ||
      providerType === "NURSING_HOME" ||
      providerType === "HOSPICE" ||
      providerType === "REHABILITATION"
    ) {
      return "tour";
    }
    // Home care types → consultation
    if (providerType === "HOME_CARE" || providerType === "HOME_HEALTH") {
      return "consultation";
    }
    // Individual caregiver → interview
    return "interview";
  };

  const getEngagementCTA = (providerType: ProviderType) => {
    const type = getEngagementType(providerType);
    return type === "tour" ? "Schedule Tour" : type === "consultation" ? "Schedule Consultation" : "Schedule Interview";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    // Convert 24h to 12h format
    const [hours, minutes] = timeStr.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!request) return null;

  const isSender = request.sender.id === session?.user?.id;
  const isAccepted = request.status === "ACCEPTED";
  const isCompleted = request.status === "COMPLETED";
  const isDeclined = request.status === "DECLINED";
  const isPending = request.status === "PENDING";

  const tours = request.tourAppointments || [];
  const pendingTours = tours.filter(t => t.status === "PROPOSED" || t.status === "PENDING");
  const confirmedTour = tours.find(t => t.status === "ACCEPTED" || t.status === "CONFIRMED");

  const engagementType = getEngagementType(request.provider.providerType);

  // Messages to display (limit to recent for simplicity)
  const allMessages = [
    { id: "initial", senderId: request.sender.id, content: request.message, createdAt: request.createdAt },
    ...request.messages,
  ];
  const recentMessages = allMessages.slice(-10);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainNav />

      <main className="flex-grow max-w-2xl w-full mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/care-profile"
          className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        {/* ============================================ */}
        {/* SECTION 1: Confirmation + Status */}
        {/* ============================================ */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          {/* Status indicator */}
          {isPending && (
            <div className="flex items-center gap-2 text-amber-600 mb-4">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Waiting for response</span>
            </div>
          )}
          {isAccepted && !confirmedTour && (
            <div className="flex items-center gap-2 text-green-600 mb-4">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Connected! Ready to schedule.</span>
            </div>
          )}
          {confirmedTour && (
            <div className="flex items-center gap-2 text-primary-600 mb-4">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Meeting scheduled</span>
            </div>
          )}
          {isDeclined && (
            <div className="flex items-center gap-2 text-gray-500 mb-4">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Request declined</span>
            </div>
          )}

          {/* Provider name and type */}
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {request.provider.name}
          </h1>
          <p className="text-gray-600 mb-4">
            {request.provider.providerType.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())} • {request.provider.city}, {request.provider.state}
          </p>

          {/* View full profile link */}
          <Link
            href={`/providers/${request.provider.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
          >
            View full profile
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>

        {/* ============================================ */}
        {/* SECTION 2: What Happens Next (for PENDING) */}
        {/* ============================================ */}
        {isPending && isSender && (
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-6 mb-6">
            <h2 className="font-semibold text-primary-900 mb-3">What happens next</h2>
            <ol className="space-y-2 text-sm text-primary-800">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary-200 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span>{request.provider.name} reviews your request</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary-200 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span>If they accept, you can schedule a {engagementType}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary-200 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <span>You&apos;ll get an email when they respond</span>
              </li>
            </ol>
          </div>
        )}

        {/* ============================================ */}
        {/* SECTION 3: Accept/Decline (for PENDING recipients) */}
        {/* ============================================ */}
        {isPending && !isSender && (
          <div className="bg-white rounded-xl border-2 border-amber-200 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-2">Respond to this request</h2>
            <p className="text-sm text-gray-600 mb-4">
              Accept to share contact information and schedule a meeting.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleStatusUpdate("ACCEPTED")}
                className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Accept Request
              </button>
              <button
                onClick={() => handleStatusUpdate("DECLINED")}
                className="px-6 py-3 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* SECTION 4: Scheduled Meeting (if confirmed) */}
        {/* ============================================ */}
        {confirmedTour && (
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-primary-900 mb-1">
                  {engagementType.charAt(0).toUpperCase() + engagementType.slice(1)} Scheduled
                </h2>
                <p className="text-primary-800">
                  {formatDate(confirmedTour.proposedDate)} at {formatTime(confirmedTour.proposedTime)}
                </p>
                {confirmedTour.notes && (
                  <p className="text-sm text-primary-700 mt-2">Note: {confirmedTour.notes}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* SECTION 5: Schedule Meeting (PRIMARY ACTION) */}
        {/* ============================================ */}
        {(isAccepted || isCompleted) && !confirmedTour && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-2">{getEngagementCTA(request.provider.providerType)}</h2>
            <p className="text-sm text-gray-600 mb-4">
              Propose times that work for you. {request.provider.name} will confirm.
            </p>

            {/* Pending tour proposals */}
            {pendingTours.length > 0 && (
              <div className="mb-4 space-y-3">
                {pendingTours.map((tour) => (
                  <div key={tour.id} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatDate(tour.proposedDate)} at {formatTime(tour.proposedTime)}
                        </p>
                        <p className="text-sm text-amber-700">
                          {tour.proposedBy === session?.user?.id ? "Waiting for response" : "They proposed this time"}
                        </p>
                      </div>
                      {tour.proposedBy !== session?.user?.id && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptTour(tour.id)}
                            className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleDeclineTour(tour.id)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Propose new time */}
            {!showScheduler ? (
              <button
                onClick={() => setShowScheduler(true)}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Propose Times
              </button>
            ) : (
              <form onSubmit={handleProposeTour} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={proposedDate}
                      onChange={(e) => setProposedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      value={proposedTime}
                      onChange={(e) => setProposedTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
                  <input
                    type="text"
                    value={schedulingNote}
                    onChange={(e) => setSchedulingNote(e.target.value)}
                    placeholder="e.g., I prefer morning times"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={proposing}
                    className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
                  >
                    {proposing ? "Sending..." : "Send Proposal"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowScheduler(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ============================================ */}
        {/* SECTION 6: Contact Information */}
        {/* ============================================ */}
        {(isAccepted || isCompleted) && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${request.provider.email}`} className="text-primary-600 hover:underline">
                  {request.provider.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${request.provider.phone}`} className="text-primary-600 hover:underline">
                  {request.provider.phone}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* SECTION 7: Messages (Collapsed by default) */}
        {/* ============================================ */}
        {!isDeclined && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            <button
              onClick={() => setShowMessages(!showMessages)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="font-medium text-gray-900">Messages</span>
                {allMessages.length > 1 && (
                  <span className="text-sm text-gray-500">({allMessages.length})</span>
                )}
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${showMessages ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showMessages && (
              <div className="border-t border-gray-200">
                {/* Message list */}
                <div className="max-h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {recentMessages.map((msg) => {
                    const isOwn = msg.senderId === session?.user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            isOwn
                              ? "bg-primary-600 text-white rounded-br-md"
                              : "bg-white border border-gray-200 text-gray-900 rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isOwn ? "text-primary-200" : "text-gray-400"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Simple message input */}
                {(isAccepted || isPending) && (
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 transition-colors"
                      >
                        {sending ? "..." : "Send"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================ */}
        {/* SECTION 8: Continue Exploring */}
        {/* ============================================ */}
        <div className="bg-gray-100 rounded-xl p-6 text-center">
          <h3 className="font-medium text-gray-900 mb-2">
            {isDeclined ? "Find other providers" : "Keep exploring"}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {isDeclined
              ? "There are many great providers that could be a good fit."
              : "Most families meet with 3-5 providers before deciding. Keep looking to compare your options."}
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Browse More Providers
          </Link>
        </div>
      </main>

      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onUpgrade={handleUpgradeSubscription}
      />

      <Footer variant="light" />
    </div>
  );
}
