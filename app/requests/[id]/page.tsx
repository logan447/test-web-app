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
import { showToast } from "@/lib/toast";
import { ProviderType } from "@prisma/client";
import {
  getEngagementConfigForProvider,
  FACILITY_PROVIDER_TYPES,
  HOME_CARE_PROVIDER_TYPES,
  CAREGIVER_PROVIDER_TYPES,
} from "@/lib/engagementUtils";

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

function getRequestLabel(providerType: ProviderType): { label: string; noun: string } {
  const pt = providerType as string;
  if ((FACILITY_PROVIDER_TYPES as readonly string[]).includes(pt)) {
    return { label: "Visit request", noun: "visit" };
  }
  if ((HOME_CARE_PROVIDER_TYPES as readonly string[]).includes(pt)) {
    return { label: "Call request", noun: "call" };
  }
  if ((CAREGIVER_PROVIDER_TYPES as readonly string[]).includes(pt)) {
    return { label: "Meeting request", noun: "meeting" };
  }
  return { label: "Meeting request", noun: "meeting" };
}

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const [request, setRequest] = useState<ConsultRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [paywallOpen, setPaywallOpen] = useState(false);

  // Messaging state
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Meeting scheduling state
  const [showScheduler, setShowScheduler] = useState(false);
  const [proposedDate, setProposedDate] = useState("");
  const [proposedTime, setProposedTime] = useState("");
  const [schedulingNote, setSchedulingNote] = useState("");
  const [proposing, setProposing] = useState(false);

  // Post-suggestion next steps flow
  const [showNextSteps, setShowNextSteps] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

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
        showToast.success("Your preferred time has been sent!");
        setShowScheduler(false);
        setProposedDate("");
        setProposedTime("");
        setSchedulingNote("");
        setShowNextSteps(true);
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

  const toggleStep = (step: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(step)) next.delete(step);
      else next.add(step);
      return next;
    });
  };

  // Helper functions
  const formatProviderType = (type: string) => {
    return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const formatRelativeDate = (dateStr: string) => {
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
  const hasSuggestedTime = tours.some(t => t.proposedBy === session?.user?.id);

  const engagementConfig = getEngagementConfigForProvider(request.provider.providerType);
  const requestLabel = getRequestLabel(request.provider.providerType);

  const providerImage = request.provider.coverPhoto || (request.provider.photos && request.provider.photos[0]);

  const allMessages = [
    { id: "initial", senderId: request.sender.id, content: request.message, createdAt: request.createdAt },
    ...request.messages,
  ];
  const recentMessages = allMessages.slice(-10);

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

        {/* ================================================ */}
        {/* PROVIDER HERO CARD                               */}
        {/* ================================================ */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Status Banner */}
          {isPending && (
            <div className="bg-primary-50 px-6 py-4 flex items-center gap-3 border-b border-primary-100">
              <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-primary-900 text-[15px]">{requestLabel.label} sent</p>
                <p className="text-sm text-primary-700">
                  They typically respond within 1–2 days.
                </p>
              </div>
            </div>
          )}
          {isAccepted && !confirmedTour && (
            <div className="bg-green-50 px-6 py-4 flex items-center gap-3 border-b border-green-100">
              <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-green-900 text-[15px]">{request.provider.name} accepted</p>
                <p className="text-sm text-green-700">
                  Pick a time for your {requestLabel.noun}.
                </p>
              </div>
            </div>
          )}
          {confirmedTour && (
            <div className="bg-primary-50 px-6 py-4 flex items-center gap-3 border-b border-primary-100">
              <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-primary-900 text-[15px]">
                  {requestLabel.noun.charAt(0).toUpperCase() + requestLabel.noun.slice(1)} confirmed
                </p>
                <p className="text-sm text-primary-700">
                  {formatDate(confirmedTour.proposedDate)} at {formatTime(confirmedTour.proposedTime)}
                </p>
              </div>
            </div>
          )}
          {isDeclined && (
            <div className="bg-gray-100 px-6 py-4 flex items-center gap-3 border-b border-gray-200">
              <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-700 text-[15px]">Request no longer active</p>
                <p className="text-sm text-gray-500">
                  Other great options are available in your area.
                </p>
              </div>
            </div>
          )}

          {/* Provider Info */}
          <div className="p-6">
            <div className="flex items-start gap-4">
              {/* Provider Avatar — real image or fallback */}
              {providerImage ? (
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                  <Image
                    src={providerImage}
                    alt={request.provider.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-primary-700">
                    {request.provider.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 mb-0.5">
                  {request.provider.name}
                </h1>
                <p className="text-sm text-gray-500 mb-3">
                  {formatProviderType(request.provider.providerType)} &middot; {request.provider.city}, {request.provider.state}
                </p>
                <div className="flex items-center gap-3 text-sm">
                  <a
                    href={`/providers/${request.provider.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
                  >
                    View Profile
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <span className="text-gray-300">&middot;</span>
                  <span className="text-gray-400">
                    Sent {formatRelativeDate(request.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================ */}
        {/* SUGGEST TIMES (pending sender)                   */}
        {/* ================================================ */}
        {isPending && isSender && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Suggest a {requestLabel.noun} time
              </h2>
              <p className="text-[15px] text-gray-500 mb-5">
                Share your availability so scheduling is faster once they respond.
              </p>

              {/* Pending proposals already sent */}
              {pendingTours.length > 0 && (
                <div className="mb-5 space-y-3">
                  {pendingTours.map((tour) => (
                    <div key={tour.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 text-[15px]">
                            {formatDate(tour.proposedDate)} at {formatTime(tour.proposedTime)}
                          </p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {tour.proposedBy === session?.user?.id ? "Sent — waiting for response" : "Proposed by them"}
                          </p>
                        </div>
                        {tour.proposedBy !== session?.user?.id && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAcceptTour(tour.id)}
                              className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800"
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

              {/* Suggest a time form */}
              {!showScheduler ? (
                <button
                  onClick={() => setShowScheduler(true)}
                  className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-semibold text-[15px] hover:bg-primary-700 transition-colors"
                >
                  Suggest a Time
                </button>
              ) : (
                <form onSubmit={handleProposeTour} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                      <input
                        type="date"
                        value={proposedDate}
                        onChange={(e) => setProposedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Time</label>
                      <input
                        type="time"
                        value={proposedTime}
                        onChange={(e) => setProposedTime(e.target.value)}
                        className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 text-base"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Note (optional)
                    </label>
                    <input
                      type="text"
                      value={schedulingNote}
                      onChange={(e) => setSchedulingNote(e.target.value)}
                      placeholder="e.g., Mornings work best"
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 text-base"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={proposing}
                      className="flex-1 bg-primary-600 text-white py-3.5 rounded-xl font-semibold text-[15px] hover:bg-primary-700 disabled:opacity-50 transition-colors"
                    >
                      {proposing ? "Sending..." : "Send Preferred Time"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowScheduler(false)}
                      className="px-6 py-3.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* What happens next — clean timeline */}
            <div className="border-t border-gray-100 px-6 py-5 bg-gray-50/50">
              <p className="text-sm font-medium text-gray-600 mb-3">What happens next</p>
              <div className="space-y-3">
                {[
                  { text: "Request sent", done: true },
                  { text: "Provider reviews (1–2 days)", done: false },
                  { text: `You confirm your ${requestLabel.noun}`, done: false },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {step.done ? (
                      <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-gray-400">{i + 1}</span>
                      </div>
                    )}
                    <span className={`text-[15px] ${step.done ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                      {step.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================ */}
        {/* POST-SUGGESTION NEXT STEPS GUIDE                 */}
        {/* Shows after user suggests a time                 */}
        {/* ================================================ */}
        {isPending && isSender && (hasSuggestedTime || showNextSteps) && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 pt-6 pb-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                While you wait, a few things to do
              </h2>
              <p className="text-[15px] text-gray-500">
                These help your provider respond faster and make your {requestLabel.noun} more productive.
              </p>
            </div>

            <div className="p-4 space-y-2">
              {/* Step 1: Complete care profile */}
              <button
                onClick={() => toggleStep(1)}
                className="w-full text-left"
              >
                <div className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${
                  completedSteps.has(1) ? "bg-green-50" : "bg-gray-50 hover:bg-gray-100"
                }`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    completedSteps.has(1) ? "bg-green-600" : "border-2 border-gray-300"
                  }`}>
                    {completedSteps.has(1) ? (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-xs font-bold text-gray-400">1</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-[15px] ${completedSteps.has(1) ? "text-green-800" : "text-gray-900"}`}>
                      Complete your care profile
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Providers respond faster when they can see your care needs and preferences upfront.
                    </p>
                    {!completedSteps.has(1) && (
                      <Link
                        href="/profile"
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 mt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Go to your profile
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>
              </button>

              {/* Step 2: Send a message with questions */}
              <button
                onClick={() => toggleStep(2)}
                className="w-full text-left"
              >
                <div className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${
                  completedSteps.has(2) ? "bg-green-50" : "bg-gray-50 hover:bg-gray-100"
                }`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    completedSteps.has(2) ? "bg-green-600" : "border-2 border-gray-300"
                  }`}>
                    {completedSteps.has(2) ? (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-xs font-bold text-gray-400">2</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-[15px] ${completedSteps.has(2) ? "text-green-800" : "text-gray-900"}`}>
                      Send your questions ahead of time
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Ask about care services, costs, availability, or anything on your mind.
                    </p>
                    {!completedSteps.has(2) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMessages(true);
                          setTimeout(() => {
                            document.getElementById("message-input")?.focus();
                          }, 200);
                        }}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 mt-2"
                      >
                        Open messages
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </button>

              {/* Step 3: Prepare for your visit */}
              <button
                onClick={() => toggleStep(3)}
                className="w-full text-left"
              >
                <div className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${
                  completedSteps.has(3) ? "bg-green-50" : "bg-gray-50 hover:bg-gray-100"
                }`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    completedSteps.has(3) ? "bg-green-600" : "border-2 border-gray-300"
                  }`}>
                    {completedSteps.has(3) ? (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-xs font-bold text-gray-400">3</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-[15px] ${completedSteps.has(3) ? "text-green-800" : "text-gray-900"}`}>
                      Start preparing for your {requestLabel.noun}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Write down your top questions and bring a family member if you&apos;d like. Check your email for confirmation details.
                    </p>
                  </div>
                </div>
              </button>

              {/* Step 4: Reach out to more providers */}
              <button
                onClick={() => toggleStep(4)}
                className="w-full text-left"
              >
                <div className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${
                  completedSteps.has(4) ? "bg-green-50" : "bg-gray-50 hover:bg-gray-100"
                }`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    completedSteps.has(4) ? "bg-green-600" : "border-2 border-gray-300"
                  }`}>
                    {completedSteps.has(4) ? (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-xs font-bold text-gray-400">4</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-[15px] ${completedSteps.has(4) ? "text-green-800" : "text-gray-900"}`}>
                      Reach out to a few more providers
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Families who meet 3–5 providers feel more confident in their choice.
                    </p>
                    {!completedSteps.has(4) && (
                      <Link
                        href="/browse"
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 mt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Browse providers
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ================================================ */}
        {/* ACCEPT / DECLINE (for pending recipients)        */}
        {/* ================================================ */}
        {isPending && !isSender && (
          <div className="bg-white rounded-2xl border-2 border-primary-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Respond to this request</h2>
            <p className="text-[15px] text-gray-500 mb-5">
              Accept to share contact info and start scheduling.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleStatusUpdate("ACCEPTED")}
                className="flex-1 bg-primary-600 text-white py-3.5 rounded-xl font-semibold text-[15px] hover:bg-primary-700 transition-colors"
              >
                Accept
              </button>
              <button
                onClick={() => handleStatusUpdate("DECLINED")}
                className="px-6 py-3.5 rounded-xl font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        )}

        {/* ================================================ */}
        {/* SCHEDULE MEETING (accepted, no confirmed)        */}
        {/* ================================================ */}
        {(isAccepted || isCompleted) && !confirmedTour && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Pick a time for your {requestLabel.noun}
              </h2>
              <p className="text-[15px] text-gray-500 mb-5">
                Choose a date and time. {request.provider.name} will confirm.
              </p>

              {/* Pending tour proposals */}
              {pendingTours.length > 0 && (
                <div className="mb-5 space-y-3">
                  {pendingTours.map((tour) => (
                    <div key={tour.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 text-[15px]">
                            {formatDate(tour.proposedDate)} at {formatTime(tour.proposedTime)}
                          </p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {tour.proposedBy === session?.user?.id ? "Sent — waiting for response" : "Proposed by them"}
                          </p>
                        </div>
                        {tour.proposedBy !== session?.user?.id && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAcceptTour(tour.id)}
                              className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800"
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
                  className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-semibold text-[15px] hover:bg-primary-700 transition-colors"
                >
                  Suggest a Time
                </button>
              ) : (
                <form onSubmit={handleProposeTour} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                      <input
                        type="date"
                        value={proposedDate}
                        onChange={(e) => setProposedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Time</label>
                      <input
                        type="time"
                        value={proposedTime}
                        onChange={(e) => setProposedTime(e.target.value)}
                        className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 text-base"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Note (optional)</label>
                    <input
                      type="text"
                      value={schedulingNote}
                      onChange={(e) => setSchedulingNote(e.target.value)}
                      placeholder="e.g., Mornings work best"
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 text-base"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={proposing}
                      className="flex-1 bg-primary-600 text-white py-3.5 rounded-xl font-semibold text-[15px] hover:bg-primary-700 disabled:opacity-50 transition-colors"
                    >
                      {proposing ? "Sending..." : "Send Preferred Time"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowScheduler(false)}
                      className="px-6 py-3.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ================================================ */}
        {/* CONFIRMED MEETING DETAILS                        */}
        {/* ================================================ */}
        {confirmedTour && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Your {requestLabel.noun} details
            </h2>
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-900 font-medium text-[15px]">
                {formatDate(confirmedTour.proposedDate)} at {formatTime(confirmedTour.proposedTime)}
              </p>
            </div>
            {confirmedTour.notes && (
              <p className="text-sm text-gray-500 ml-8">{confirmedTour.notes}</p>
            )}
            <div className="mt-4 p-4 bg-primary-50 rounded-xl">
              <p className="text-sm text-primary-800">
                Write down a few questions beforehand. It&apos;s fine to bring a family member along.
              </p>
            </div>
          </div>
        )}

        {/* ================================================ */}
        {/* CONTACT INFO (once accepted)                     */}
        {/* ================================================ */}
        {(isAccepted || isCompleted) && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact information</h2>
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
        )}

        {/* ================================================ */}
        {/* MESSAGES                                          */}
        {/* ================================================ */}
        {!isDeclined && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <button
              onClick={() => setShowMessages(!showMessages)}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="font-semibold text-gray-900 text-[15px]">Messages</span>
                {allMessages.length > 1 && (
                  <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {allMessages.length}
                  </span>
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
                <div className="max-h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {recentMessages.map((msg) => {
                    const isOwn = msg.senderId === session?.user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
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

                {(isAccepted || isPending) && (
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex gap-2">
                      <input
                        id="message-input"
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Ask a question..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
                      />
                      <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="px-5 py-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 transition-colors font-medium"
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

        {/* ================================================ */}
        {/* BROWSE MORE PROVIDERS                             */}
        {/* ================================================ */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <p className="text-[15px] text-gray-600 mb-4">
            {isDeclined
              ? "There are other great providers in your area."
              : "Most families meet with 3\u20135 providers before deciding."}
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold text-[15px] rounded-xl transition-colors"
          >
            Browse More Providers
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
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
