"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface EngagementSummaryProps {
  className?: string;
  userType?: "family" | "provider";
}

interface EngagementData {
  id: string;
  status: string;
  createdAt: string;
  lastActivity: string;
  messageCount: number;
  unreadCount: number;
  hasPendingTour: boolean;
  otherParty: {
    id: string;
    name: string;
    image?: string;
  };
}

interface SummaryStats {
  totalEngagements: number;
  activeEngagements: number;
  pendingResponses: number;
  totalUnreadMessages: number;
  scheduledTours: number;
}

export default function EngagementSummary({
  className = "",
  userType = "family",
}: EngagementSummaryProps) {
  const [engagements, setEngagements] = useState<EngagementData[]>([]);
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEngagements();
  }, []);

  const fetchEngagements = async () => {
    try {
      setLoading(true);
      // Fetch requests and calculate stats
      const [statsRes, activityRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/dashboard/activity"),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        const recentRequests = data.recentRequests || [];

        // Map to engagement format
        const engagementList: EngagementData[] = recentRequests.slice(0, 5).map(
          (req: {
            id: string;
            status: string;
            createdAt: string;
            unreadCount: number;
            providerName?: string;
            familyName?: string;
          }) => ({
            id: req.id,
            status: req.status,
            createdAt: req.createdAt,
            lastActivity: req.createdAt,
            messageCount: 0,
            unreadCount: req.unreadCount || 0,
            hasPendingTour: false,
            otherParty: {
              id: req.id,
              name:
                userType === "family"
                  ? req.providerName || "Provider"
                  : req.familyName || "Family",
            },
          })
        );

        setEngagements(engagementList);
        setStats({
          totalEngagements: data.stats?.totalRequests || 0,
          activeEngagements: data.stats?.activeConversations || 0,
          pendingResponses: data.stats?.pendingRequests || 0,
          totalUnreadMessages: recentRequests.reduce(
            (sum: number, r: { unreadCount?: number }) => sum + (r.unreadCount || 0),
            0
          ),
          scheduledTours: 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch engagements:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            Active
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            Pending
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            Completed
          </span>
        );
      case "DECLINED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            Declined
          </span>
        );
      default:
        return null;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
        <div className="p-5">
          <div className="animate-pulse space-y-4">
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-100 rounded-lg"></div>
              <div className="h-16 bg-gray-100 rounded-lg"></div>
            </div>
            <div className="space-y-2">
              <div className="h-12 bg-gray-100 rounded-lg"></div>
              <div className="h-12 bg-gray-100 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Engagement Overview</h3>
        <Link
          href={userType === "family" ? "/requests" : "/provider/requests"}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          View all
        </Link>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">
                {stats.activeEngagements}
              </div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-yellow-600">
                {stats.pendingResponses}
              </div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-primary-600">
                {stats.totalUnreadMessages}
              </div>
              <div className="text-xs text-gray-500">Unread</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">
                {stats.totalEngagements}
              </div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Engagements List */}
      <div className="p-5">
        {engagements.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Recent Activity
            </h4>
            {engagements.map((engagement) => (
              <Link
                key={engagement.id}
                href={
                  userType === "family"
                    ? `/requests/${engagement.id}`
                    : `/provider/requests/${engagement.id}`
                }
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold flex-shrink-0">
                  {engagement.otherParty.name?.charAt(0) || "?"}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-gray-900 truncate">
                      {engagement.otherParty.name}
                    </span>
                    {getStatusBadge(engagement.status)}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(engagement.lastActivity)}
                    </span>
                    {engagement.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-primary-600 text-white rounded-full">
                        {engagement.unreadCount}
                      </span>
                    )}
                    {engagement.hasPendingTour && (
                      <span className="flex items-center gap-1 text-xs text-orange-600">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Tour pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Chevron */}
                <svg
                  className="w-4 h-4 text-gray-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-gray-500 text-sm">No engagements yet</p>
            <Link
              href={userType === "family" ? "/browse" : "/provider/leads"}
              className="text-primary-600 text-sm font-medium hover:underline mt-2 inline-block"
            >
              {userType === "family" ? "Browse providers" : "Find families"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
