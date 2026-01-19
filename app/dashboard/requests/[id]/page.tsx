"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import Breadcrumb from "@/components/Navigation/Breadcrumb";
import PaywallModal from "@/components/Paywall/PaywallModal";
import { showToast } from "@/lib/toast";
import { maskContactInfo } from "@/lib/contact-masking";
import Tooltip from "@/components/UI/Tooltip";
import ModernMessageBubble from "@/components/Messaging/ModernMessageBubble";
import MessageTimestamp, { groupMessagesByDate, shouldGroupMessages } from "@/components/Messaging/MessageTimestamp";
import TypingIndicator from "@/components/Messaging/TypingIndicator";
import OnlineStatus from "@/components/Messaging/OnlineStatus";
import FileAttachment, { Attachment } from "@/components/Messaging/FileAttachment";
import AttachmentGallery from "@/components/Messaging/AttachmentGallery";
import QuickRepliesBar from "@/components/Messaging/QuickRepliesBar";
import TourProposal from "@/components/Messaging/TourProposal";
import ToursSection from "@/components/Messaging/ToursSection";
import RichTextInput from "@/components/Messaging/RichTextInput";
import MessageSearch, { SearchFilters } from "@/components/Messaging/MessageSearch";
import ConversationExport from "@/components/Messaging/ConversationExport";
import NotificationSettings, { NotificationSettingsData } from "@/components/Messaging/NotificationSettings";
import SmartNotificationBanner, { SmartNotification } from "@/components/Messaging/SmartNotificationBanner";
import VideoCallButton from "@/components/Messaging/VideoCallButton";
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
    status: string;
    deliveredAt: string | null;
    readAt: string | null;
    attachments?: any; // JSON field for attachments
  }[];
  tourAppointments?: {
    id: string;
    proposedBy: string;
    proposedDate: string;
    proposedTime: string;
    status: string;
    notes: string | null;
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

  // Real-time presence and typing indicators
  const [presence, setPresence] = useState<{
    otherUser: { id: string; name: string; lastSeen: string | null };
    isOnline: boolean;
    isTyping: boolean;
  } | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // File attachments
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);

  // Image gallery
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<Attachment[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Tour scheduling

  // Message search
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({ query: "" });
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const searchResultRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Conversation export
  const [showExportModal, setShowExportModal] = useState(false);

  // Notification settings (Sprint 9)
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettingsData>({
    muted: false,
    muteUntil: null,
    emailNotifications: true,
  });
  const [smartNotifications, setSmartNotifications] = useState<SmartNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

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
        // Mark messages as read after fetching
        markMessagesAsRead();
      } else {
        router.push("/dashboard/requests");
      }
    } catch (err) {
      console.error("Error fetching request:", err);
    } finally {
      setLoading(false);
    }
  };

  // Mark all messages in this conversation as read
  const markMessagesAsRead = async () => {
    try {
      await fetch(`/api/requests/${params.id}/messages/read`, {
        method: "PATCH",
      });
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  // Fetch presence (online/typing status)
  const fetchPresence = async () => {
    try {
      const response = await fetch(`/api/requests/${params.id}/presence`);
      if (response.ok) {
        const data = await response.json();
        setPresence(data);
      }
    } catch (err) {
      console.error("Error fetching presence:", err);
    }
  };

  // Send typing status
  const sendTypingStatus = async (isTyping: boolean) => {
    try {
      await fetch(`/api/requests/${params.id}/typing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTyping }),
      });
    } catch (err) {
      console.error("Error sending typing status:", err);
    }
  };

  // Poll for presence updates every 3 seconds
  useEffect(() => {
    if (status === "authenticated" && request) {
      fetchPresence();
      const interval = setInterval(fetchPresence, 3000);
      return () => clearInterval(interval);
    }
  }, [status, request?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && pendingAttachments.length === 0) return;

    // Clear typing indicator when sending
    sendTypingStatus(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    setSending(true);
    try {
      const response = await fetch(`/api/requests/${params.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage,
          attachments: pendingAttachments,
        }),
      });

      if (response.ok) {
        setNewMessage("");
        setPendingAttachments([]);
        fetchRequest();
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  // Handle typing in message input
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Send typing indicator
    if (value.trim()) {
      sendTypingStatus(true);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing indicator after 3 seconds of no typing
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStatus(false);
      }, 3000);
    } else {
      // Clear typing if message is empty
      sendTypingStatus(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  // Handle file attachments
  const handleFilesSelected = (files: Attachment[]) => {
    setPendingAttachments((prev) => [...prev, ...files]);
  };

  const handleRemoveAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle image gallery
  const handleImageClick = (messageAttachments: Attachment[], imageIndex: number) => {
    const images = messageAttachments.filter((a) => a.type.startsWith("image/"));
    setGalleryImages(images);
    setGalleryIndex(imageIndex);
    setGalleryOpen(true);
  };

  // Handle quick reply selection
  const handleQuickReply = (text: string) => {
    setNewMessage(text);
  };

  // Handle tour proposal
  const handleProposeTour = async (date: Date, time: string, notes?: string) => {
    try {
      const response = await fetch(`/api/requests/${params.id}/tours`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposedDate: date.toISOString(),
          proposedTime: time,
          notes,
        }),
      });

      if (response.ok) {
        fetchRequest(); // Refresh to show new tour
        showToast.success("Tour proposal sent!");
      } else {
        showToast.error("Failed to propose tour");
      }
    } catch (err) {
      console.error("Error proposing tour:", err);
      showToast.error("Failed to propose tour");
    }
  };

  // Handle tour acceptance
  const handleAcceptTour = async (tourId: string) => {
    try {
      const response = await fetch(`/api/requests/${params.id}/tours/${tourId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACCEPTED" }),
      });

      if (response.ok) {
        fetchRequest(); // Refresh to show updated tour
        showToast.success("Tour confirmed!");
      } else {
        showToast.error("Failed to accept tour");
      }
    } catch (err) {
      console.error("Error accepting tour:", err);
      showToast.error("Failed to accept tour");
    }
  };

  // Handle tour decline
  const handleDeclineTour = async (tourId: string) => {
    try {
      const response = await fetch(`/api/requests/${params.id}/tours/${tourId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DECLINED" }),
      });

      if (response.ok) {
        fetchRequest(); // Refresh to show updated tour
        showToast.success("Tour declined");
      } else {
        showToast.error("Failed to decline tour");
      }
    } catch (err) {
      console.error("Error declining tour:", err);
      showToast.error("Failed to decline tour");
    }
  };

  // Handle video call
  const handleStartVideoCall = async (platform: "zoom" | "google" | "custom") => {
    try {
      const response = await fetch(`/api/requests/${params.id}/video-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });

      if (response.ok) {
        const data = await response.json();
        fetchRequest(); // Refresh to show new message with video link
        showToast.success("Video call link sent!");

        // Open the meeting link in a new tab
        window.open(data.meetingLink, "_blank");

        // Show smart notification
        addSmartNotification({
          id: `video-call-${Date.now()}`,
          type: "status",
          title: "Video Call Started",
          message: `Your ${platform === "zoom" ? "Zoom" : platform === "google" ? "Google Meet" : "video"} call link has been sent`,
          timestamp: new Date(),
        });
      } else {
        showToast.error("Failed to start video call");
      }
    } catch (err) {
      console.error("Error starting video call:", err);
      showToast.error("Failed to start video call");
    }

    return "";
  };

  // Handle message search
  const handleSearch = (query: string, filters: SearchFilters) => {
    setSearchQuery(query);
    setSearchFilters(filters);

    if (!query.trim() || !request) {
      setSearchResults([]);
      setCurrentSearchIndex(0);
      return;
    }

    // Combine all messages
    const allMessages = [
      { id: `initial-${request.id}`, content: request.message, senderId: request.sender.id, createdAt: request.createdAt },
      ...request.messages,
    ];

    // Filter messages by search criteria
    const results: string[] = [];
    allMessages.forEach((message) => {
      // Check content match
      if (message.content.toLowerCase().includes(query.toLowerCase())) {
        // Check sender filter
        if (filters.sender === "me" && message.senderId !== session?.user?.id) return;
        if (filters.sender === "other" && message.senderId === session?.user?.id) return;

        // Check date filter
        const messageDate = new Date(message.createdAt);
        if (filters.dateFrom && messageDate < filters.dateFrom) return;
        if (filters.dateTo && messageDate > filters.dateTo) return;

        results.push(message.id);
      }
    });

    setSearchResults(results);
    setCurrentSearchIndex(0);

    // Scroll to first result
    if (results.length > 0) {
      setTimeout(() => {
        const firstResultElement = searchResultRefs.current.get(results[0]);
        firstResultElement?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchFilters({ query: "" });
    setSearchResults([]);
    setCurrentSearchIndex(0);
  };

  const handleNextSearchResult = () => {
    if (currentSearchIndex < searchResults.length - 1) {
      const newIndex = currentSearchIndex + 1;
      setCurrentSearchIndex(newIndex);
      const resultElement = searchResultRefs.current.get(searchResults[newIndex]);
      resultElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handlePreviousSearchResult = () => {
    if (currentSearchIndex > 0) {
      const newIndex = currentSearchIndex - 1;
      setCurrentSearchIndex(newIndex);
      const resultElement = searchResultRefs.current.get(searchResults[newIndex]);
      resultElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Fetch notification settings
  const fetchNotificationSettings = async () => {
    try {
      const response = await fetch(`/api/requests/${params.id}/notifications`);
      if (response.ok) {
        const data = await response.json();
        const settings = data.notificationSettings || {
          muted: false,
          muteUntil: null,
          emailNotifications: true,
        };
        setNotificationSettings({
          muted: settings.muted,
          muteUntil: settings.muteUntil ? new Date(settings.muteUntil) : null,
          emailNotifications: settings.emailNotifications,
        });
      }
    } catch (err) {
      console.error("Error fetching notification settings:", err);
    }
  };

  // Save notification settings
  const handleSaveNotificationSettings = async (settings: NotificationSettingsData) => {
    try {
      const response = await fetch(`/api/requests/${params.id}/notifications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          muted: settings.muted,
          muteUntil: settings.muteUntil ? settings.muteUntil.toISOString() : null,
          emailNotifications: settings.emailNotifications,
        }),
      });

      if (response.ok) {
        setNotificationSettings(settings);
        showToast.success("Notification settings updated!");

        // Show smart notification
        if (settings.muted && settings.muteUntil) {
          const now = new Date();
          const muteUntil = new Date(settings.muteUntil);
          const diffHours = Math.round((muteUntil.getTime() - now.getTime()) / (1000 * 60 * 60));

          let message = "Notifications muted";
          if (diffHours <= 1) message = "Notifications muted for 1 hour";
          else if (diffHours <= 8) message = "Notifications muted for 8 hours";
          else if (diffHours <= 24) message = "Notifications muted for 24 hours";
          else message = "Notifications muted until you turn them back on";

          addSmartNotification({
            id: `mute-${Date.now()}`,
            type: "info",
            title: "Notifications Muted",
            message,
            timestamp: new Date(),
          });
        } else if (!settings.muted) {
          addSmartNotification({
            id: `unmute-${Date.now()}`,
            type: "info",
            title: "Notifications Enabled",
            message: "You'll receive notifications for this conversation",
            timestamp: new Date(),
          });
        }
      } else {
        showToast.error("Failed to update notification settings");
      }
    } catch (err) {
      console.error("Error saving notification settings:", err);
      showToast.error("Failed to update notification settings");
    }
  };

  // Add smart notification
  const addSmartNotification = (notification: SmartNotification) => {
    setSmartNotifications((prev) => [...prev, notification]);
  };

  // Dismiss smart notification
  const dismissSmartNotification = (id: string) => {
    setSmartNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Calculate unread count
  useEffect(() => {
    if (request && session?.user?.id) {
      const unread = request.messages.filter(
        (msg) => msg.senderId !== session.user.id && !msg.readAt
      ).length;
      setUnreadCount(unread);
    }
  }, [request?.messages, session?.user?.id]);

  // Fetch notification settings on load
  useEffect(() => {
    if (status === "authenticated" && request) {
      fetchNotificationSettings();
    }
  }, [status, request?.id]);

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
      <Breadcrumb />

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
              <div className="flex items-center gap-3">
                <p className="text-gray-600">
                  {isFamily
                    ? `${request.provider.providerType.split('_').join(' ')} • ${request.provider.city}, ${request.provider.state}`
                    : `${request.familyProfile.city}, ${request.familyProfile.state}`}
                </p>
                {presence && (
                  <OnlineStatus
                    isOnline={presence.isOnline}
                    lastSeen={presence.otherUser.lastSeen ? new Date(presence.otherUser.lastSeen) : undefined}
                    userName={presence.otherUser.name}
                    showLabel={false}
                    size="md"
                  />
                )}
              </div>
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

        {/* Tours Section */}
        <div className="mb-6">
          <ToursSection
            requestId={request.id}
            providerType={request.provider.providerType}
            tours={request.tourAppointments || []}
            currentUserId={session?.user?.id || ""}
            isProvider={!isFamily}
            onProposeTour={handleProposeTour}
            onAcceptTour={handleAcceptTour}
            onDeclineTour={handleDeclineTour}
          />
        </div>

        {/* Messages */}
        <div
          className="bg-white rounded-lg shadow flex flex-col overflow-hidden"
          style={{ height: "600px" }}
          role="region"
          aria-label="Messaging conversation"
        >
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900" id="messages-heading">Messages</h2>
              <div className="flex items-center gap-2">
                {/* Unread Count Badge */}
                {unreadCount > 0 && (
                  <span className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full">
                    {unreadCount} unread
                  </span>
                )}

                {/* Notification Settings Button */}
                <button
                  type="button"
                  onClick={() => setShowNotificationSettings(true)}
                  className={`
                    relative p-2 rounded-lg
                    ${notificationSettings.muted ? "bg-amber-100 text-amber-700" : "bg-white text-gray-600"}
                    hover:bg-gray-100
                    transition-colors
                  `}
                  title={notificationSettings.muted ? "Notifications muted" : "Notification settings"}
                >
                  {notificationSettings.muted ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  )}
                </button>

                {/* Search Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowSearch(!showSearch)}
                  className={`
                    p-2 rounded-lg
                    ${showSearch ? "bg-primary-100 text-primary-700" : "bg-white text-gray-600"}
                    hover:bg-gray-100
                    transition-colors
                  `}
                  title="Search messages"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                {/* Export Button */}
                <button
                  type="button"
                  onClick={() => setShowExportModal(true)}
                  className="
                    p-2 rounded-lg
                    bg-white text-gray-600
                    hover:bg-gray-100
                    transition-colors
                  "
                  title="Export conversation"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            </div>
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

          {/* Message Search */}
          {showSearch && (
            <MessageSearch
              onSearch={handleSearch}
              onClear={handleClearSearch}
              resultCount={searchResults.length}
              currentIndex={currentSearchIndex}
              onNext={handleNextSearchResult}
              onPrevious={handlePreviousSearchResult}
            />
          )}

          {/* Message List */}
          <div
            className="flex-grow overflow-y-auto p-4 bg-gray-50"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
            role="log"
            aria-live="polite"
            aria-labelledby="messages-heading"
          >
            {(() => {
              // Combine initial message with subsequent messages for proper grouping
              const allMessages = [
                {
                  id: `initial-${request.id}`,
                  senderId: request.sender.id,
                  content: request.message,
                  createdAt: request.createdAt,
                  status: "READ", // Initial message is always considered read
                  deliveredAt: null,
                  readAt: null,
                },
                ...request.messages,
              ];

              // Combine messages and tours into a single timeline
              const tours = request.tourAppointments || [];
              const timeline: Array<{ type: 'message' | 'tour'; data: any; createdAt: string }> = [
                ...allMessages.map(m => ({ type: 'message' as const, data: m, createdAt: m.createdAt })),
                ...tours.map(t => ({ type: 'tour' as const, data: t, createdAt: t.createdAt })),
              ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

              // Group timeline items by date
              const groupedTimeline: { [key: string]: typeof timeline } = {};
              timeline.forEach(item => {
                const date = new Date(item.createdAt).toDateString();
                if (!groupedTimeline[date]) {
                  groupedTimeline[date] = [];
                }
                groupedTimeline[date].push(item);
              });

              return Object.entries(groupedTimeline).map(([dateStr, items]) => (
                <div key={dateStr}>
                  {/* Date Header */}
                  <MessageTimestamp date={new Date(dateStr)} />

                  {/* Timeline items for this date */}
                  <div className="space-y-3">
                    {items.map((item, itemIdx) => {
                      if (item.type === 'message') {
                        const message = item.data;
                        const isOwnMessage = message.senderId === session?.user?.id;
                        const previousItem = itemIdx > 0 ? items[itemIdx - 1] : null;
                        const previousMessage = previousItem?.type === 'message' ? previousItem.data : null;
                        const showAvatar = !shouldGroupMessages(message, previousMessage);

                        // Get sender name
                        const senderName = isOwnMessage
                          ? session?.user?.name || "You"
                          : request.sender.id === message.senderId
                          ? request.sender.name
                          : "Unknown";

                        // Parse attachments if they exist
                        const messageAttachments = message.attachments
                          ? (Array.isArray(message.attachments) ? message.attachments : JSON.parse(message.attachments as string))
                          : [];

                        const isSearchResult = searchResults.includes(message.id);
                        const isCurrentResult = searchResults[currentSearchIndex] === message.id;

                        return (
                          <div
                            key={message.id}
                            ref={(el) => {
                              if (el && isSearchResult) {
                                searchResultRefs.current.set(message.id, el);
                              }
                            }}
                          >
                            <ModernMessageBubble
                              content={message.content}
                              isOwn={isOwnMessage}
                              senderName={senderName}
                              timestamp={new Date(message.createdAt)}
                              showAvatar={showAvatar}
                              showName={false}
                              attachments={messageAttachments}
                              status={isOwnMessage ? (message.status as "SENT" | "DELIVERED" | "READ") : undefined}
                              onImageClick={(index) => handleImageClick(messageAttachments, index)}
                              searchQuery={searchQuery}
                              isCurrentSearchResult={isCurrentResult}
                            />
                          </div>
                        );
                      } else {
                        // Tour appointment
                        const tour = item.data;
                        return (
                          <div key={tour.id} className="flex justify-center my-4">
                            <TourProposal
                              tour={{
                                id: tour.id,
                                proposedBy: tour.proposedBy,
                                proposedDate: new Date(tour.proposedDate),
                                proposedTime: tour.proposedTime,
                                status: tour.status,
                                notes: tour.notes,
                              }}
                              currentUserId={session?.user?.id || ""}
                              onAccept={handleAcceptTour}
                              onDecline={handleDeclineTour}
                            />
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
              ));
            })()}

            {/* Typing Indicator */}
            {presence?.isTyping && presence?.otherUser && (
              <TypingIndicator
                userName={presence.otherUser.name}
                show={true}
              />
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t bg-white">
            {/* Pending Attachments Preview */}
            {pendingAttachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {pendingAttachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="relative inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg border border-gray-200"
                  >
                    {attachment.type.startsWith("image/") ? (
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded">
                        📎
                      </div>
                    )}
                    <span className="text-sm text-gray-700 max-w-[150px] truncate">
                      {attachment.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Video Call Button & Quick Replies */}
            {request.status !== "DECLINED" && request.status !== "COMPLETED" && (
              <div className="space-y-3">
                {/* Video Call Button */}
                {request.status === "ACCEPTED" && (
                  <div className="mb-3">
                    <VideoCallButton
                      onStartCall={handleStartVideoCall}
                      disabled={false}
                    />
                  </div>
                )}

                {/* Quick Replies */}
                <QuickRepliesBar
                  onSelectReply={handleQuickReply}
                  userRole={isFamily ? "FAMILY" : "PROVIDER"}
                  disabled={false}
                />
              </div>
            )}

            <form
              onSubmit={handleSendMessage}
              className="flex gap-2 items-end"
              aria-label="Send message form"
            >
              {/* File Attachment Button */}
              <FileAttachment
                onFilesSelected={handleFilesSelected}
                disabled={request.status === "DECLINED" || request.status === "COMPLETED"}
              />

              <div className="flex-grow border border-gray-300 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
                <RichTextInput
                  value={newMessage}
                  onChange={(value) => {
                    setNewMessage(value);
                    // Send typing indicator
                    if (value.trim()) {
                      sendTypingStatus(true);
                      if (typingTimeoutRef.current) {
                        clearTimeout(typingTimeoutRef.current);
                      }
                      typingTimeoutRef.current = setTimeout(() => {
                        sendTypingStatus(false);
                      }, 3000);
                    } else {
                      sendTypingStatus(false);
                      if (typingTimeoutRef.current) {
                        clearTimeout(typingTimeoutRef.current);
                        typingTimeoutRef.current = null;
                      }
                    }
                  }}
                  onSubmit={() => handleSendMessage({ preventDefault: () => {} } as any)}
                  placeholder="Type a message..."
                  disabled={request.status === "DECLINED" || request.status === "COMPLETED"}
                />
              </div>
              <button
                type="submit"
                disabled={sending || (!newMessage.trim() && pendingAttachments.length === 0) || request.status === "DECLINED" || request.status === "COMPLETED"}
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

      {/* Image Gallery */}
      {galleryOpen && (
        <AttachmentGallery
          attachments={galleryImages}
          currentIndex={galleryIndex}
          onClose={() => setGalleryOpen(false)}
          onNext={() => setGalleryIndex((prev) => Math.min(prev + 1, galleryImages.length - 1))}
          onPrevious={() => setGalleryIndex((prev) => Math.max(prev - 1, 0))}
        />
      )}

      {/* Conversation Export */}
      {showExportModal && request && (
        <ConversationExport
          messages={[
            {
              id: `initial-${request.id}`,
              senderId: request.sender.id,
              content: request.message,
              createdAt: request.createdAt,
              senderName: request.sender.name,
            },
            ...request.messages.map((msg) => ({
              ...msg,
              senderName: msg.senderId === session?.user?.id
                ? (session.user.name || "You")
                : (msg.senderId === request.sender.id
                    ? request.sender.name
                    : isFamily ? request.provider.name : request.familyProfile.user.name),
            })),
          ]}
          conversationTitle={isFamily ? request.provider.name : request.familyProfile.user.name}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Notification Settings Modal */}
      {showNotificationSettings && (
        <NotificationSettings
          currentSettings={notificationSettings}
          onSave={handleSaveNotificationSettings}
          onClose={() => setShowNotificationSettings(false)}
        />
      )}

      {/* Smart Notification Banners */}
      {smartNotifications.map((notification) => (
        <SmartNotificationBanner
          key={notification.id}
          notification={notification}
          onDismiss={dismissSmartNotification}
          autoDismissDelay={5000}
        />
      ))}
    </div>
  );
}
