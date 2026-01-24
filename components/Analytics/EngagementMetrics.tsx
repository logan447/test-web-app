"use client";

import { useEffect, useState } from "react";
import StatCard from "./StatCard";
import PerformanceRing from "./PerformanceRing";
import TrendChart from "./TrendChart";
import InsightsPanel from "./InsightsPanel";
import {
  type EngagementMetrics as Metrics,
  type WeeklyTrend,
  type PerformanceInsight,
  generateInsights,
  formatResponseTime,
  getResponseRateLevel,
  getConversionRateLevel,
} from "@/lib/analyticsUtils";

interface EngagementMetricsProps {
  onNavigate?: (path: string) => void;
}

interface AnalyticsData {
  metrics: Metrics;
  weeklyTrends: WeeklyTrend[];
  profileViews: number;
  upcomingTours: number;
}

export default function EngagementMetrics({ onNavigate }: EngagementMetricsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/provider/analytics");

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const result = await response.json();

      // Transform API response to our format
      setData({
        metrics: {
          totalRequests: result.totalRequests || 0,
          acceptedRequests: result.acceptedRequests || 0,
          declinedRequests: result.declinedRequests || 0,
          pendingRequests: result.pendingRequests || 0,
          completedRequests: result.completedRequests || 0,
          responseRate: result.responseRate || 0,
          conversionRate: result.conversionRate || 0,
          averageResponseTime: result.avgResponseTime || 0,
        },
        weeklyTrends: result.weeklyActivity || [],
        profileViews: result.profileViews || 0,
        upcomingTours: result.upcomingTours || 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleInsightAction = (action: string) => {
    if (onNavigate) {
      if (action.toLowerCase().includes("pending")) {
        onNavigate("/provider/requests?status=pending");
      } else if (action.toLowerCase().includes("profile")) {
        onNavigate("/provider/profile/edit");
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-100 rounded-2xl h-72 animate-pulse" />
          <div className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-700 font-medium">Unable to load analytics</p>
        <button
          onClick={fetchAnalytics}
          className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  const { metrics, weeklyTrends, profileViews, upcomingTours } = data;
  const insights = generateInsights(metrics);
  const responseLevel = getResponseRateLevel(metrics.responseRate);
  const conversionLevel = getConversionRateLevel(metrics.conversionRate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Engagement Analytics</h2>
          <p className="text-sm text-gray-500">Track your performance and engagement metrics</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh data"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Inquiries"
          value={metrics.totalRequests}
          subtitle="All time"
          color="blue"
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
            </svg>
          }
        />
        <StatCard
          title="Profile Views"
          value={profileViews}
          subtitle="Estimated"
          color="primary"
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        />
        <StatCard
          title="Upcoming Tours"
          value={upcomingTours}
          subtitle="Scheduled"
          color="green"
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          title="Avg. Response Time"
          value={formatResponseTime(metrics.averageResponseTime)}
          subtitle={metrics.averageResponseTime < 24 ? "Great!" : "Room to improve"}
          color={metrics.averageResponseTime < 24 ? "green" : "yellow"}
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Performance Rings & Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2">
          <TrendChart data={weeklyTrends} title="Weekly Activity" height={220} />
        </div>

        {/* Performance Rings */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Performance</h3>
          <div className="flex items-center justify-around">
            <PerformanceRing
              value={metrics.responseRate}
              label="Response Rate"
              sublabel={responseLevel.label}
              color={responseLevel.color as "green" | "blue" | "yellow" | "red"}
              size="md"
            />
            <PerformanceRing
              value={metrics.conversionRate}
              label="Conversion"
              sublabel={conversionLevel.label}
              color={conversionLevel.color as "green" | "blue" | "yellow" | "red"}
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Request Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Request Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-amber-50 rounded-xl">
            <p className="text-2xl font-bold text-amber-600">{metrics.pendingRequests}</p>
            <p className="text-sm text-amber-700">Pending</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-2xl font-bold text-green-600">{metrics.acceptedRequests}</p>
            <p className="text-sm text-green-700">Accepted</p>
          </div>
          <div className="text-center p-4 bg-gray-100 rounded-xl">
            <p className="text-2xl font-bold text-gray-600">{metrics.declinedRequests}</p>
            <p className="text-sm text-gray-600">Declined</p>
          </div>
          <div className="text-center p-4 bg-primary-50 rounded-xl">
            <p className="text-2xl font-bold text-primary-600">{metrics.completedRequests}</p>
            <p className="text-sm text-primary-700">Completed</p>
          </div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <InsightsPanel
          insights={insights}
          title="Actionable Insights"
          onAction={handleInsightAction}
        />
      )}
    </div>
  );
}
