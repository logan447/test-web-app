"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface TimelineEventMetadata {
  senderId?: string;
  senderName?: string;
  isOwnMessage?: boolean;
  status?: string;
  readAt?: string;
  attachments?: unknown;
  tourId?: string;
  proposedBy?: string;
  proposerName?: string;
  isOwnProposal?: boolean;
  proposedDate?: string;
  proposedTime?: string;
  notes?: string;
  initiatedBy?: string;
}

interface TimelineEvent {
  id: string;
  type: "message" | "tour" | "milestone" | "status_change";
  eventType: string;
  title: string;
  description: string;
  timestamp: string;
  metadata: TimelineEventMetadata;
}

interface EngagementStats {
  totalMessages: number;
  messagesByYou: number;
  messagesByOther: number;
  toursProposed: number;
  toursAccepted: number;
  toursCompleted: number;
  daysSinceStart: number;
  status: string;
}

interface EngagementTimelineProps {
  requestId: string;
  variant?: "full" | "compact";
  className?: string;
  showStats?: boolean;
}

// Helper component for message read status to avoid type issues
function MessageReadStatus({ isOwnMessage, status }: { isOwnMessage: boolean; status: string }) {
  if (!isOwnMessage) return null;

  if (status === "READ") {
    return (
      <div className="mt-1 flex items-center gap-1">
        <span className="text-xs text-blue-600 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Read
        </span>
      </div>
    );
  }

  if (status === "DELIVERED") {
    return (
      <div className="mt-1 flex items-center gap-1">
        <span className="text-xs text-gray-500">Delivered</span>
      </div>
    );
  }

  return (
    <div className="mt-1 flex items-center gap-1">
      <span className="text-xs text-gray-400">Sent</span>
    </div>
  );
}

export default function EngagementTimeline({
  requestId,
  variant = "full",
  className = "",
  showStats = true,
}: EngagementTimelineProps) {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [stats, setStats] = useState<EngagementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTimeline();
  }, [requestId]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/requests/${requestId}/timeline`);
      if (!response.ok) {
        throw new Error("Failed to fetch timeline");
      }
      const data = await response.json();
      setTimeline(data.timeline || []);
      setStats(data.stats || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (eventId: string) => {
    setExpandedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const getEventIcon = (event: TimelineEvent) => {
    switch (event.eventType) {
      case "request_created":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
      case "message_sent":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case "first_response":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        );
      case "tour_proposed":
      case "tour_accepted":
      case "tour_completed":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "tour_declined":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case "request_accepted":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "request_declined":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "request_completed":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getEventStyles = (event: TimelineEvent) => {
    switch (event.type) {
      case "milestone":
        return {
          bg: "bg-primary-100",
          border: "border-primary-200",
          icon: "bg-primary-600 text-white",
          dot: "bg-primary-600",
        };
      case "tour":
        if (event.eventType === "tour_declined") {
          return {
            bg: "bg-red-50",
            border: "border-red-100",
            icon: "bg-red-100 text-red-600",
            dot: "bg-red-400",
          };
        }
        return {
          bg: "bg-orange-50",
          border: "border-orange-100",
          icon: "bg-orange-100 text-orange-600",
          dot: "bg-orange-400",
        };
      case "message":
        const isOwn = event.metadata?.isOwnMessage;
        return {
          bg: isOwn ? "bg-gray-50" : "bg-white",
          border: isOwn ? "border-gray-100" : "border-gray-200",
          icon: isOwn ? "bg-gray-200 text-gray-600" : "bg-emerald-100 text-emerald-600",
          dot: isOwn ? "bg-gray-400" : "bg-emerald-400",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          icon: "bg-gray-100 text-gray-600",
          dot: "bg-gray-400",
        };
    }
  };

  // Group events by date
  const groupedTimeline: { [key: string]: TimelineEvent[] } = {};
  timeline.forEach((event) => {
    const date = new Date(event.timestamp).toDateString();
    if (!groupedTimeline[date]) {
      groupedTimeline[date] = [];
    }
    groupedTimeline[date].push(event);
  });

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-red-600">
          <p>Failed to load timeline</p>
          <button
            onClick={fetchTimeline}
            className="mt-2 text-sm text-primary-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Engagement Timeline</h3>
        <span className="text-sm text-gray-500">{timeline.length} events</span>
      </div>

      {/* Stats Summary */}
      {showStats && stats && (
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalMessages}</div>
              <div className="text-xs text-gray-500">Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.toursAccepted}</div>
              <div className="text-xs text-gray-500">Tours Scheduled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.daysSinceStart}</div>
              <div className="text-xs text-gray-500">Days Active</div>
            </div>
            <div className="text-center">
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  stats.status === "ACCEPTED"
                    ? "bg-green-100 text-green-700"
                    : stats.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : stats.status === "COMPLETED"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {stats.status}
              </span>
              <div className="text-xs text-gray-500 mt-1">Status</div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="p-5">
        {Object.keys(groupedTimeline).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg
              className="w-12 h-12 mx-auto text-gray-300 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>No activity yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTimeline)
              .reverse()
              .map(([date, events]) => (
                <div key={date}>
                  {/* Date Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-gray-200"></div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {formatDateHeader(date)}
                    </span>
                    <div className="h-px flex-1 bg-gray-200"></div>
                  </div>

                  {/* Events for this date */}
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                    <div className="space-y-3">
                      {events.reverse().map((event, index) => {
                        const styles = getEventStyles(event);
                        const isExpanded = expandedEvents.has(event.id);
                        const isMessage = event.type === "message";
                        const truncateDescription =
                          isMessage && event.description.length > 100 && !isExpanded;

                        return (
                          <div
                            key={event.id}
                            className={`relative pl-10 ${
                              variant === "compact" && isMessage ? "py-1" : "py-2"
                            }`}
                          >
                            {/* Timeline dot */}
                            <div
                              className={`absolute left-2.5 top-3 w-3 h-3 rounded-full border-2 border-white ${styles.dot}`}
                            ></div>

                            {/* Event card */}
                            <div
                              className={`rounded-lg p-3 border ${styles.bg} ${styles.border} ${
                                isMessage ? "cursor-pointer" : ""
                              }`}
                              onClick={() => isMessage && toggleExpand(event.id)}
                            >
                              <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div
                                  className={`p-1.5 rounded-lg flex-shrink-0 ${styles.icon}`}
                                >
                                  {getEventIcon(event)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-medium text-sm text-gray-900">
                                      {event.title}
                                    </span>
                                    <span className="text-xs text-gray-500 flex-shrink-0">
                                      {formatTimestamp(event.timestamp)}
                                    </span>
                                  </div>
                                  <p
                                    className={`text-sm text-gray-600 mt-0.5 ${
                                      truncateDescription ? "line-clamp-2" : ""
                                    }`}
                                  >
                                    {event.description}
                                  </p>

                                  {/* Message read indicator */}
                                  {isMessage && event.metadata && (
                                    <MessageReadStatus
                                      isOwnMessage={Boolean(event.metadata.isOwnMessage)}
                                      status={String(event.metadata.status || "SENT")}
                                    />
                                  )}

                                  {/* Tour details */}
                                  {event.type === "tour" && event.metadata?.notes && (
                                    <div className="mt-2 text-xs text-gray-500 italic">
                                      Note: {String(event.metadata.notes)}
                                    </div>
                                  )}

                                  {/* Expand indicator for long messages */}
                                  {isMessage && event.description.length > 100 && (
                                    <button className="text-xs text-primary-600 mt-1 hover:underline">
                                      {isExpanded ? "Show less" : "Show more"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
