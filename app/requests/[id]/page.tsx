"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import MainNav from "@/components/Navigation/MainNav";
import Footer from "@/components/Navigation/Footer";
import Breadcrumb from "@/components/Navigation/Breadcrumb";
import PaywallModal from "@/components/Paywall/PaywallModal";
import ContactInfoDisplay from "@/components/Provider/ContactInfoDisplay";
import SchedulingForm from "@/components/Engagement/SchedulingForm";
import { showToast } from "@/lib/toast";
import { ProviderType } from "@prisma/client";
import {
  getEngagementConfigForProvider,
  FACILITY_PROVIDER_TYPES,
  HOME_CARE_PROVIDER_TYPES,
  CAREGIVER_PROVIDER_TYPES,
} from "@/lib/engagementUtils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
    coverPhoto?: string | null;
    photos?: string[];
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRequestLabel(providerType: ProviderType): { label: string; noun: string } {
  const pt = providerType as string;
  if ((FACILITY_PROVIDER_TYPES as readonly string[]).includes(pt)) {
    return { label: "Tour request", noun: "tour" };
  }
  if ((HOME_CARE_PROVIDER_TYPES as readonly string[]).includes(pt)) {
    return { label: "Consultation request", noun: "consultation" };
  }
  if ((CAREGIVER_PROVIDER_TYPES as readonly string[]).includes(pt)) {
    return { label: "Interview request", noun: "interview" };
  }
  return { label: "Consultation request", noun: "consultation" };
}

function getSchedulingHeading(noun: string, providerName: string): string {
  switch (noun) {
    case "tour":
      return `When would you like to visit ${providerName}?`;
    case "interview":
      return `When would you like to meet ${providerName}?`;
    default:
      return `When works for your consultation with ${providerName}?`;
  }
}

function formatProviderType(type: string) {
  return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTime(timeStr: string) {
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

function formatRelativeDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const [request, setRequest] = useState<ConsultRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [paywallOpen, setPaywallOpen] = useState(false);

  // Messaging
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scheduling (only used in PENDING state where form is collapsible)
  const [showScheduler, setShowScheduler] = useState(false);
  const [proposing, setProposing] = useState(false);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

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

  const handleScheduleSubmit = async (data: {
    date: string;
    time: string;
    format: "in_person" | "video";
    note?: string;
  }) => {
    setProposing(true);
    try {
      const response = await fetch(`/api/requests/${params.id}/tours`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposedDate: new Date(data.date).toISOString(),
          proposedTime: data.time,
          isVideoCall: data.format === "video",
          notes: data.note || undefined,
        }),
      });

      if (response.ok) {
        showToast.success("Your preferred time has been sent!");
        setShowScheduler(false);
        fetchRequest();
      } else {
        showToast.error("Could not send your preferred time");
      }
    } catch (err) {
      showToast.error("Could not send your preferred time");
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
        showToast.success("Time declined");
        fetchRequest();
      }
    } catch (err) {
      showToast.error("Failed to decline time");
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

  // ---------------------------------------------------------------------------
  // Loading & empty states
  // ---------------------------------------------------------------------------

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!request) return null;

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------

  const isSender = request.sender.id === session?.user?.id;
  const isAccepted = request.status === "ACCEPTED";
  const isCompleted = request.status === "COMPLETED";
  const isDeclined = request.status === "DECLINED";
  const isPending = request.status === "PENDING";

  const tours = request.tourAppointments || [];
  const pendingTours = tours.filter(t => t.status === "PROPOSED" || t.status === "PENDING");
  const confirmedTour = tours.find(t => t.status === "ACCEPTED" || t.status === "CONFIRMED");
  const hasSuggestedTime = tours.some(t => t.proposedBy === session?.user?.id);

  const engagementConfig = getEngagementConfigForProvider(request.provider.providerType);
  const requestLabel = getRequestLabel(request.provider.providerType);

  const providerImage = request.provider.coverPhoto || (request.provider.photos && request.provider.photos[0]);

  const allMessages = [
    { id: "initial", senderId: request.sender.id, content: request.message, createdAt: request.createdAt },
    ...request.messages,
  ];
  const recentMessages = allMessages.slice(-10);

  // Auto-open messages when there are replies
  const shouldAutoOpenMessages = allMessages.length > 1;

  // ---------------------------------------------------------------------------
  // Sub-renders
  // ---------------------------------------------------------------------------

  /** Provider hero with large cover photo and status overlay */
  function renderProviderHero() {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Cover photo — large and emotional */}
        <div className="relative h-40 sm:h-48 bg-gradient-to-br from-primary-100 to-primary-200">
          {providerImage ? (
            <Image
              src={providerImage}
              alt={request!.provider.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-16 h-16 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}

          {/* Status overlay — large, unmissable */}
          <div className="absolute bottom-0 left-0 right-0">
            {isPending && (
              <div className="bg-white/95 backdrop-blur-sm px-6 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-gray-900">
                  Request sent — waiting for response
                </p>
              </div>
            )}
            {isAccepted && !confirmedTour && (
              <div className="bg-emerald-600 px-6 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-white">
                  {request!.provider.name} accepted — pick a time below
                </p>
              </div>
            )}
            {confirmedTour && (
              <div className="bg-emerald-600 px-6 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-semibold text-white">
                    {requestLabel.noun.charAt(0).toUpperCase() + requestLabel.noun.slice(1)} confirmed
                  </p>
                  <p className="text-sm text-emerald-100">
                    {formatDate(confirmedTour.proposedDate)} at {formatTime(confirmedTour.proposedTime)}
                  </p>
                </div>
              </div>
            )}
            {isDeclined && (
              <div className="bg-gray-700 px-6 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-white">
                  This request is no longer active
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Provider info */}
        <div className="px-6 py-5">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            {request!.provider.name}
          </h1>
          <p className="text-base text-gray-500 mb-3">
            {formatProviderType(request!.provider.providerType)} &middot; {request!.provider.city}, {request!.provider.state}
          </p>
          <div className="flex items-center gap-3 text-[15px]">
            <a
              href={`/providers/${request!.provider.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
            >
              View profile
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <span className="text-gray-300">&middot;</span>
            <span className="text-gray-400">
              Sent {formatRelativeDate(request!.createdAt)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  /** Pending tour proposals — accept/decline buttons */
  function renderPendingProposals() {
    if (pendingTours.length === 0) return null;
    return (
      <div className="space-y-3 mb-5">
        {pendingTours.map((tour) => (
          <div key={tour.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-gray-900 text-base">
                  {formatDate(tour.proposedDate)} at {formatTime(tour.proposedTime)}
                </p>
                <p className="text-[15px] text-gray-500 mt-0.5">
                  {tour.proposedBy === session?.user?.id ? "Sent — waiting for response" : "Proposed by them"}
                </p>
              </div>
              {tour.proposedBy !== session?.user?.id && (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleAcceptTour(tour.id)}
                    className="px-5 py-2.5 bg-emerald-600 text-white text-[15px] font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineTour(tour.id)}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 text-[15px] font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  /** Messages — auto-opens when there are replies */
  function renderMessages() {
    if (isDeclined) return null;
    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <button
          onClick={() => setShowMessages(!showMessages)}
          className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="font-semibold text-gray-900 text-base">Messages</span>
            {allMessages.length > 1 && (
              <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {allMessages.length}
              </span>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${showMessages || shouldAutoOpenMessages ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {(showMessages || shouldAutoOpenMessages) && (
          <div className="border-t border-gray-200">
            <div className="max-h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {recentMessages.map((msg) => {
                const isOwn = msg.senderId === session?.user?.id;
                return (
                  <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      isOwn
                        ? "bg-primary-600 text-white rounded-br-md"
                        : "bg-white border border-gray-200 text-gray-900 rounded-bl-md"
                    }`}>
                      <p className="text-[15px] whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isOwn ? "text-primary-200" : "text-gray-400"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {(isAccepted || isPending) && (
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex gap-2">
                  <input
                    id="message-input"
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1 px-4 py-3.5 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="px-6 py-3.5 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 transition-colors font-medium text-base"
                  >
                    {sending ? "..." : "Send"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    );
  }

  /** Browse more providers CTA */
  function renderBrowseMore() {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
        <p className="text-base text-gray-600 mb-4">
          {isDeclined
            ? "There are other great providers in your area."
            : "Most families meet with 3\u20135 providers before deciding."}
        </p>
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold text-base rounded-xl transition-colors"
        >
          Browse More Providers
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    );
  }

  // ===========================================================================
  // PAGE LAYOUT
  // ===========================================================================

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainNav />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "My Requests", href: "/requests" },
          { label: request.provider.name, href: `/requests/${request.id}` },
        ]}
      />

      <main className="flex-grow max-w-2xl w-full mx-auto px-4 py-8 space-y-6">

        {/* Provider hero — always first */}
        {renderProviderHero()}

        {/* ============================================================ */}
        {/* PENDING + SENDER                                             */}
        {/* Reassurance page: "it worked, relax, browse more"            */}
        {/* ============================================================ */}
        {isPending && isSender && (
          <>
            {/* What happens next — main content */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 pt-6 pb-2">
                <h2 className="text-lg font-bold text-gray-900 mb-1">What happens next</h2>
                <p className="text-base text-gray-500">
                  Providers typically respond within 1–2 days.
                </p>
              </div>

              <div className="px-6 pb-6 pt-4">
                <div className="space-y-4">
                  {[
                    { text: "Your request was sent", done: true, detail: `Sent ${formatRelativeDate(request.createdAt)}` },
                    { text: `${request.provider.name} reviews your request`, done: false, detail: "They'll accept or respond with questions" },
                    { text: `You pick a time for your ${requestLabel.noun}`, done: false, detail: "We'll notify you when they respond" },
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-4">
                      {step.done ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-sm font-semibold text-gray-400">{i + 1}</span>
                        </div>
                      )}
                      <div>
                        <p className={`text-base ${step.done ? "text-gray-900 font-semibold" : "text-gray-700 font-medium"}`}>
                          {step.text}
                        </p>
                        <p className="text-[15px] text-gray-400 mt-0.5">{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional: suggest a time early */}
              <div className="border-t border-gray-100 px-6 py-5 bg-gray-50/50">
                {hasSuggestedTime ? (
                  <div className="space-y-3">
                    <p className="text-[15px] font-medium text-gray-600">Your suggested times</p>
                    {renderPendingProposals()}
                  </div>
                ) : !showScheduler ? (
                  <button
                    onClick={() => setShowScheduler(true)}
                    className="w-full text-left flex items-center gap-3 text-primary-600 hover:text-primary-700 font-medium text-base"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Want to get ahead? Suggest a time now
                  </button>
                ) : (
                  <div>
                    <p className="text-[15px] font-medium text-gray-600 mb-4">Suggest a time</p>
                    <SchedulingForm
                      noun={requestLabel.noun}
                      providerName={request.provider.name}
                      submitting={proposing}
                      onSubmit={handleScheduleSubmit}
                      onCancel={() => setShowScheduler(false)}
                      prominent={false}
                    />
                  </div>
                )}
              </div>
            </div>

            {renderMessages()}
            {renderBrowseMore()}
          </>
        )}

        {/* ============================================================ */}
        {/* PENDING + RECIPIENT                                          */}
        {/* Accept or decline — clear, prominent action                  */}
        {/* ============================================================ */}
        {isPending && !isSender && (
          <>
            <div className="bg-white rounded-2xl border-2 border-primary-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Respond to this request</h2>
              <p className="text-base text-gray-500 mb-5">
                Accept to share contact info and start scheduling.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleStatusUpdate("ACCEPTED")}
                  className="flex-1 bg-emerald-600 text-white py-4 rounded-xl font-semibold text-base hover:bg-emerald-700 transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleStatusUpdate("DECLINED")}
                  className="px-6 py-4 rounded-xl font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-base"
                >
                  Decline
                </button>
              </div>
            </div>

            {renderMessages()}
          </>
        )}

        {/* ============================================================ */}
        {/* ACCEPTED — no confirmed meeting yet                          */}
        {/* Scheduling page: form open by default, green submit button   */}
        {/* ============================================================ */}
        {(isAccepted || isCompleted) && !confirmedTour && (
          <>
            <div className="bg-white rounded-2xl border-2 border-emerald-200 overflow-hidden shadow-sm">
              <div className="p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {getSchedulingHeading(requestLabel.noun, request.provider.name)}
                </h2>
                <p className="text-base text-gray-500 mb-6">
                  Choose a date, time, and format. {request.provider.name} will confirm.
                </p>

                {renderPendingProposals()}

                {/* Form always open — this IS the page */}
                <SchedulingForm
                  noun={requestLabel.noun}
                  providerName={request.provider.name}
                  submitting={proposing}
                  onSubmit={handleScheduleSubmit}
                  prominent={true}
                />
              </div>
            </div>

            {/* Contact info */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Contact information</h2>
              <ContactInfoDisplay
                phone={request.provider.phone}
                email={request.provider.email}
                providerType={request.provider.providerType}
                viewerRole="family"
                engagementStatus={request.status}
                context="engagement_page"
                layout="vertical"
                showLabels={false}
                showIcons={true}
              />
            </div>

            {renderMessages()}
            {renderBrowseMore()}
          </>
        )}

        {/* ============================================================ */}
        {/* CONFIRMED — meeting scheduled                                */}
        {/* Milestone card: large date, location, preparation tips       */}
        {/* ============================================================ */}
        {confirmedTour && (isAccepted || isCompleted) && (
          <>
            <div className="bg-white rounded-2xl border-2 border-emerald-200 overflow-hidden shadow-sm">
              {/* Confirmation header */}
              <div className="bg-emerald-50 px-6 py-5 border-b border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg font-bold text-emerald-900">
                    Your {requestLabel.noun} is confirmed
                  </p>
                </div>
              </div>

              {/* Appointment details — large and scannable */}
              <div className="px-6 py-6 space-y-4">
                <div className="flex items-start gap-4">
                  <svg className="w-6 h-6 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(confirmedTour.proposedDate)}
                    </p>
                    <p className="text-base text-gray-500">at {formatTime(confirmedTour.proposedTime)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <svg className="w-6 h-6 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-base font-medium text-gray-900">{request.provider.name}</p>
                    <p className="text-[15px] text-gray-500">{request.provider.city}, {request.provider.state}</p>
                  </div>
                </div>

                {confirmedTour.notes && (
                  <div className="flex items-start gap-4">
                    <svg className="w-6 h-6 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <p className="text-base text-gray-700">{confirmedTour.notes}</p>
                  </div>
                )}
              </div>

              {/* Preparation tips */}
              <div className="border-t border-gray-100 px-6 py-5 bg-gray-50/50">
                <p className="text-[15px] font-medium text-gray-600 mb-3">Before you go</p>
                <ul className="space-y-2.5 text-base text-gray-700">
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 mt-1 flex-shrink-0">&#x2022;</span>
                    Write down your top 3 questions (costs, daily routine, staff availability)
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 mt-1 flex-shrink-0">&#x2022;</span>
                    Bring a family member if you&apos;d like a second perspective
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-500 mt-1 flex-shrink-0">&#x2022;</span>
                    Check your email for any updates from {request.provider.name}
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact info — prominent for confirmed meetings */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Need to reach {request.provider.name}?</h2>
              <p className="text-[15px] text-gray-500 mb-4">Call or email if your plans change.</p>
              <ContactInfoDisplay
                phone={request.provider.phone}
                email={request.provider.email}
                providerType={request.provider.providerType}
                viewerRole="family"
                engagementStatus={request.status}
                context="engagement_page"
                layout="vertical"
                showLabels={false}
                showIcons={true}
              />
            </div>

            {renderMessages()}
            {renderBrowseMore()}
          </>
        )}

        {/* ============================================================ */}
        {/* DECLINED — minimal, redirect to browse                       */}
        {/* ============================================================ */}
        {isDeclined && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              There are other great options nearby
            </h2>
            <p className="text-base text-gray-500 mb-6 max-w-sm mx-auto">
              Many families find the right fit after meeting a few providers. Keep exploring.
            </p>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-base rounded-xl transition-colors"
            >
              Browse Providers
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

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
