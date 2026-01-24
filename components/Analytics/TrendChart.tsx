"use client";

import { type WeeklyTrend, getWeekLabel } from "@/lib/analyticsUtils";

interface TrendChartProps {
  data: WeeklyTrend[];
  title?: string;
  height?: number;
}

export default function TrendChart({
  data,
  title = "Weekly Trends",
  height = 200,
}: TrendChartProps) {
  // Find max value for scaling
  const maxValue = Math.max(...data.map((d) => d.total), 1);

  // Reverse data so most recent is on the right
  const chartData = [...data].reverse();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
            <span className="text-gray-600">Accepted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
            <span className="text-gray-600">Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-gray-300 rounded-full" />
            <span className="text-gray-600">Declined</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end gap-2" style={{ height }}>
        {chartData.map((week, index) => {
          const total = week.total || 1;
          const barHeight = (week.total / maxValue) * height;
          const acceptedHeight = (week.accepted / total) * barHeight;
          const pendingHeight = (week.pending / total) * barHeight;
          const declinedHeight = (week.declined / total) * barHeight;

          return (
            <div
              key={week.week}
              className="flex-1 flex flex-col items-center group"
            >
              {/* Stacked bar */}
              <div
                className="w-full relative flex flex-col-reverse rounded-t-lg overflow-hidden transition-all group-hover:opacity-80"
                style={{ height: barHeight || 4 }}
              >
                {/* Declined section */}
                {week.declined > 0 && (
                  <div
                    className="w-full bg-gray-300"
                    style={{ height: declinedHeight }}
                  />
                )}
                {/* Pending section */}
                {week.pending > 0 && (
                  <div
                    className="w-full bg-amber-400"
                    style={{ height: pendingHeight }}
                  />
                )}
                {/* Accepted section */}
                {week.accepted > 0 && (
                  <div
                    className="w-full bg-green-500"
                    style={{ height: acceptedHeight }}
                  />
                )}
              </div>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                  <p className="font-medium mb-1">{getWeekLabel(data.length - 1 - index)}</p>
                  <div className="space-y-0.5">
                    <p>Total: {week.total}</p>
                    <p className="text-green-300">Accepted: {week.accepted}</p>
                    <p className="text-amber-300">Pending: {week.pending}</p>
                    <p className="text-gray-400">Declined: {week.declined}</p>
                  </div>
                </div>
              </div>

              {/* Week label */}
              <p className="text-xs text-gray-500 mt-2 text-center truncate w-full">
                {index === chartData.length - 1 ? "This week" :
                 index === chartData.length - 2 ? "Last week" :
                 `${chartData.length - 1 - index}w ago`}
              </p>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {data.every((d) => d.total === 0) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-400 text-sm">No activity yet</p>
        </div>
      )}
    </div>
  );
}
