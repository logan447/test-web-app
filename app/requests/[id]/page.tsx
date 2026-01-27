"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import Footer from "@/components/Navigation/Footer";
import PaywallModal from "@/components/Paywall/PaywallModal";
import ContactInfoDisplay from "@/components/Provider/ContactInfoDisplay";
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

  // Messaging state
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
        showToast.success(newStatus === "ACCEPTED" ? "Connected!" : "Meeting declined");
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
    if (providerType === "HOME_CARE" || providerType === "HOME_HEALTH") {
      return "consultation";
    }
    return "interview";
  };

  const getEngagementCTA = (providerType: ProviderType) => {
    const type = getEngagementType(providerType);
    return type === "tour" ? "Schedule Tour" : type === "consultation" ? "Schedule Consultation" : "Schedule Interview";
  };

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

  const engagementType = getEngagementType(request.provider.providerType);

  const allMessages = [
    { id: "initial", senderId: request.sender.id, content: request.message, createdAt: request.createdAt },
    ...request.messages,
  ];
  const recentMessages = allMessages.slice(-10);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainNav />

      <main className="flex-grow max-w-2xl w-full mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/care-profile" className="hover:text-gray-600 transition-colors">
            My Requests
          </Link>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-600">{request.provider.name}</span>
        </nav>

        {/* ============================================ */}
        {/* HERO: Success Banner + Provider Card         */}
        {/* ============================================ */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          {/* Success / Status Banner */}
          {isPending && (
            <div className="bg-primary-50 px-6 py-4 flex items-center gap-3 border-b border-primary-100">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-primary-900">Request sent</p>
                <p className="text-sm text-primary-700">
                  {request.provider.name} will review and respond. You&apos;ll get an email.
                </p>
              </div>
            </div>
          )}
          {isAccepted && !confirmedTour && (
            <div className="bg-green-50 px-6 py-4 flex items-center gap-3 border-b border-green-100">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-green-900">Connected</p>
                <p className="text-sm text-green-700">
                  {request.provider.name} accepted. Schedule your {engagementType} below.
                </p>
              </div>
            </div>
          )}
          {confirmedTour && (
            <div className="bg-primary-50 px-6 py-4 flex items-center gap-3 border-b border-primary-100">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-primary-900">
                  {engagementType.charAt(0).toUpperCase() + engagementType.slice(1)} confirmed
                </p>
                <p className="text-sm text-primary-700">
                  {formatDate(confirmedTour.proposedDate)} at {formatTime(confirmedTour.proposedTime)}
                </p>
              </div>
            </div>
          )}
          {isDeclined && (
            <div className="bg-gray-50 px-6 py-4 flex items-center gap-3 border-b border-gray-200">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Request declined</p>
                <p className="text-sm text-gray-500">
                  This request is no longer active.
                </p>
              </div>
            </div>
          )}

          {/* Provider Card */}
          <div className="p-6">
            <div className="flex items-start gap-4">
              {/* Provider avatar/initial */}
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-primary-700">
                  {request.provider.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 mb-0.5">
                  {request.provider.name}
                </h1>
                <p className="text-sm text-gray-500 mb-2">
                  {formatProviderType(request.provider.providerType)} &middot; {request.provider.city}, {request.provider.state}
                </p>
                <div className="flex items-center gap-3 text-sm">
                  <Link
                    href={`/providers/${request.provider.id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View Profile
                  </Link>
                  <span className="text-gray-300">&middot;</span>
                  <span className="text-gray-400">
                    Sent {formatRelativeDate(request.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* PROGRESS TIMELINE (for pending requests)    */}
        {/* ============================================ */}
        {isPending && isSender && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">What happens next</h2>
            <div className="space-y-4">
              {[
                { label: "Request sent", done: true, detail: "Your care profile was shared" },
                { label: `${request.provider.name} reviews your request`, done: false, detail: "Usually 24\u201348 hours" },
                { label: `Schedule your ${engagementType}`, done: false, detail: "Pick a time that works for you" },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.done
                        ? "bg-primary-600"
                        : "border-2 border-gray-300 bg-white"
                    }`}>
                      {step.done ? (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-xs font-semibold text-gray-400">{i + 1}</span>
                      )}
                    </div>
                    {i < 2 && (
                      <div className={`w-0.5 h-6 mt-1 ${step.done ? "bg-primary-200" : "bg-gray-200"}`} />
                    )}
                  </div>
                  <div className="pt-0.5">
                    <p className={`text-sm font-medium ${step.done ? "text-gray-900" : "text-gray-600"}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* ACCEPT/DECLINE (for pending recipients)     */}
        {/* ============================================ */}
        {isPending && !isSender && (
          <div className="bg-white rounded-xl border-2 border-primary-200 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-2">Respond to this request</h2>
            <p className="text-sm text-gray-500 mb-4">
              Accept to share contact info and start scheduling.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleStatusUpdate("ACCEPTED")}
                className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Accept
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
        {/* PRIMARY ACTION: Schedule Meeting             */}
        {/* ============================================ */}
        {(isAccepted || isCompleted) && !confirmedTour && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-1">{getEngagementCTA(request.provider.providerType)}</h2>
            <p className="text-sm text-gray-500 mb-4">
              Propose a time. {request.provider.name} will confirm.
            </p>

            {/* Pending tour proposals */}
            {pendingTours.length > 0 && (
              <div className="mb-4 space-y-3">
                {pendingTours.map((tour) => (
                  <div key={tour.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatDate(tour.proposedDate)} at {formatTime(tour.proposedTime)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {tour.proposedBy === session?.user?.id ? "Waiting for response" : "Proposed by them"}
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
                Propose a Time
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
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      value={proposedTime}
                      onChange={(e) => setProposedTime(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
        {/* CONFIRMED MEETING DETAILS                   */}
        {/* ============================================ */}
        {confirmedTour && confirmedTour.notes && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-2">Meeting Details</h2>
            <p className="text-sm text-gray-600">{confirmedTour.notes}</p>
          </div>
        )}

        {/* ============================================ */}
        {/* CONTACT INFO (once accepted)                */}
        {/* ============================================ */}
        {(isAccepted || isCompleted) && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Contact Information</h2>
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

        {/* ============================================ */}
        {/* MESSAGES                                     */}
        {/* ============================================ */}
        {!isDeclined && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            <button
              onClick={() => setShowMessages(!showMessages)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="font-medium text-gray-900">Messages</span>
                {allMessages.length > 1 && (
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
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
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="px-5 py-2.5 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 transition-colors"
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
        {/* KEEP EXPLORING                               */}
        {/* ============================================ */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
          <p className="text-sm text-gray-500 mb-3">
            {isDeclined
              ? "There are many great providers in your area."
              : "Most families meet with 3\u20135 providers before deciding."}
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
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
