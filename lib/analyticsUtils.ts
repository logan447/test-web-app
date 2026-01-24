/**
 * Analytics Utilities
 * Helper functions for calculating and formatting engagement metrics
 */

// Types for analytics data
export interface EngagementMetrics {
  totalRequests: number;
  acceptedRequests: number;
  declinedRequests: number;
  pendingRequests: number;
  completedRequests: number;
  responseRate: number;
  conversionRate: number;
  averageResponseTime: number; // in hours
}

export interface TrendData {
  label: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
}

export interface WeeklyTrend {
  week: string;
  startDate: string;
  endDate: string;
  total: number;
  accepted: number;
  pending: number;
  declined: number;
}

export interface PerformanceInsight {
  type: "success" | "warning" | "info";
  title: string;
  message: string;
  metric?: string;
  action?: string;
}

/**
 * Calculate response rate (percentage of requests responded to)
 */
export function calculateResponseRate(
  accepted: number,
  declined: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round(((accepted + declined) / total) * 100);
}

/**
 * Calculate conversion rate (percentage of accepted requests)
 */
export function calculateConversionRate(
  accepted: number,
  declined: number
): number {
  const responded = accepted + declined;
  if (responded === 0) return 0;
  return Math.round((accepted / responded) * 100);
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Format hours into a human-readable string
 */
export function formatResponseTime(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}m`;
  }
  if (hours < 24) {
    return `${Math.round(hours)}h`;
  }
  const days = Math.round(hours / 24);
  return `${days}d`;
}

/**
 * Get trend indicator (up, down, stable)
 */
export function getTrendIndicator(
  change: number
): "up" | "down" | "stable" {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "stable";
}

/**
 * Get performance level based on response rate
 */
export function getResponseRateLevel(rate: number): {
  level: "excellent" | "good" | "fair" | "poor";
  color: string;
  label: string;
} {
  if (rate >= 90) {
    return { level: "excellent", color: "green", label: "Excellent" };
  }
  if (rate >= 70) {
    return { level: "good", color: "blue", label: "Good" };
  }
  if (rate >= 50) {
    return { level: "fair", color: "yellow", label: "Fair" };
  }
  return { level: "poor", color: "red", label: "Needs Improvement" };
}

/**
 * Get performance level based on conversion rate
 */
export function getConversionRateLevel(rate: number): {
  level: "excellent" | "good" | "fair" | "poor";
  color: string;
  label: string;
} {
  if (rate >= 60) {
    return { level: "excellent", color: "green", label: "Excellent" };
  }
  if (rate >= 40) {
    return { level: "good", color: "blue", label: "Good" };
  }
  if (rate >= 25) {
    return { level: "fair", color: "yellow", label: "Fair" };
  }
  return { level: "poor", color: "red", label: "Needs Improvement" };
}

/**
 * Generate performance insights based on metrics
 */
export function generateInsights(metrics: EngagementMetrics): PerformanceInsight[] {
  const insights: PerformanceInsight[] = [];

  // Response rate insight
  const responseLevel = getResponseRateLevel(metrics.responseRate);
  if (responseLevel.level === "excellent") {
    insights.push({
      type: "success",
      title: "Great Response Rate",
      message: "You're responding to most inquiries quickly. This builds trust with families.",
      metric: `${metrics.responseRate}%`,
    });
  } else if (responseLevel.level === "poor") {
    insights.push({
      type: "warning",
      title: "Improve Response Rate",
      message: "Families are waiting for your response. Try to reply within 24 hours.",
      metric: `${metrics.responseRate}%`,
      action: "View pending requests",
    });
  }

  // Conversion rate insight
  const conversionLevel = getConversionRateLevel(metrics.conversionRate);
  if (conversionLevel.level === "excellent") {
    insights.push({
      type: "success",
      title: "High Conversion Rate",
      message: "You're successfully connecting with families who reach out.",
      metric: `${metrics.conversionRate}%`,
    });
  } else if (conversionLevel.level === "poor" && metrics.totalRequests >= 5) {
    insights.push({
      type: "info",
      title: "Conversion Opportunity",
      message: "Consider updating your profile to attract more compatible families.",
      metric: `${metrics.conversionRate}%`,
      action: "Update profile",
    });
  }

  // Pending requests insight
  if (metrics.pendingRequests > 0) {
    insights.push({
      type: metrics.pendingRequests > 3 ? "warning" : "info",
      title: `${metrics.pendingRequests} Pending Request${metrics.pendingRequests > 1 ? "s" : ""}`,
      message: "Review and respond to these inquiries to maintain your response rate.",
      action: "View pending",
    });
  }

  // Response time insight
  if (metrics.averageResponseTime > 48) {
    insights.push({
      type: "warning",
      title: "Response Time",
      message: "Your average response time is over 2 days. Faster responses lead to better connections.",
      metric: formatResponseTime(metrics.averageResponseTime),
    });
  } else if (metrics.averageResponseTime < 4 && metrics.totalRequests >= 3) {
    insights.push({
      type: "success",
      title: "Quick Responder",
      message: "You respond quickly to inquiries. This is highly valued by families!",
      metric: formatResponseTime(metrics.averageResponseTime),
    });
  }

  return insights;
}

/**
 * Format large numbers with K/M suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Get date range labels for weekly trends
 */
export function getWeekLabel(weeksAgo: number): string {
  if (weeksAgo === 0) return "This week";
  if (weeksAgo === 1) return "Last week";
  return `${weeksAgo} weeks ago`;
}

/**
 * Calculate the week start and end dates
 */
export function getWeekDateRange(weeksAgo: number): { start: Date; end: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - dayOfWeek);
  startOfThisWeek.setHours(0, 0, 0, 0);

  const start = new Date(startOfThisWeek);
  start.setDate(start.getDate() - weeksAgo * 7);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Format date for display
 */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Calculate engagement funnel metrics
 */
export interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export function calculateFunnel(metrics: EngagementMetrics): FunnelStage[] {
  const total = metrics.totalRequests || 1;

  return [
    {
      name: "Total Inquiries",
      count: metrics.totalRequests,
      percentage: 100,
      color: "gray",
    },
    {
      name: "Responded",
      count: metrics.acceptedRequests + metrics.declinedRequests,
      percentage: Math.round(
        ((metrics.acceptedRequests + metrics.declinedRequests) / total) * 100
      ),
      color: "blue",
    },
    {
      name: "Accepted",
      count: metrics.acceptedRequests,
      percentage: Math.round((metrics.acceptedRequests / total) * 100),
      color: "green",
    },
    {
      name: "Completed",
      count: metrics.completedRequests,
      percentage: Math.round((metrics.completedRequests / total) * 100),
      color: "primary",
    },
  ];
}
