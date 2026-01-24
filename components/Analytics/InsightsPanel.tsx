"use client";

import { type PerformanceInsight } from "@/lib/analyticsUtils";

interface InsightsPanelProps {
  insights: PerformanceInsight[];
  title?: string;
  onAction?: (action: string) => void;
}

export default function InsightsPanel({
  insights,
  title = "Performance Insights",
  onAction,
}: InsightsPanelProps) {
  if (insights.length === 0) {
    return null;
  }

  const getInsightStyles = (type: PerformanceInsight["type"]) => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          icon: "text-green-600",
          title: "text-green-900",
          message: "text-green-700",
          metric: "bg-green-100 text-green-800",
        };
      case "warning":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          icon: "text-amber-600",
          title: "text-amber-900",
          message: "text-amber-700",
          metric: "bg-amber-100 text-amber-800",
        };
      case "info":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          icon: "text-blue-600",
          title: "text-blue-900",
          message: "text-blue-700",
          metric: "bg-blue-100 text-blue-800",
        };
    }
  };

  const getIcon = (type: PerformanceInsight["type"]) => {
    switch (type) {
      case "success":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "warning":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "info":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          {title}
        </h3>
      </div>

      {/* Insights list */}
      <div className="p-4 space-y-3">
        {insights.map((insight, index) => {
          const styles = getInsightStyles(insight.type);

          return (
            <div
              key={index}
              className={`${styles.bg} ${styles.border} border rounded-xl p-4`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 ${styles.icon}`}>
                  {getIcon(insight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium ${styles.title}`}>
                      {insight.title}
                    </h4>
                    {insight.metric && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles.metric}`}>
                        {insight.metric}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${styles.message}`}>
                    {insight.message}
                  </p>
                  {insight.action && onAction && (
                    <button
                      onClick={() => onAction(insight.action!)}
                      className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
                    >
                      {insight.action}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
