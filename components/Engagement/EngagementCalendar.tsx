"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export interface ScheduledEvent {
  id: string;
  date: Date;
  title: string;
  type: "tour" | "consultation" | "interview" | "assessment" | "other";
  providerName?: string;
  providerId?: string;
  familyName?: string;
  familyProfileId?: string;
  location?: string;
  engagementId?: string;
}

interface EngagementCalendarProps {
  events: ScheduledEvent[];
  onEventClick?: (event: ScheduledEvent) => void;
  variant?: "compact" | "full";
  className?: string;
}

// Helper to get calendar dates for a month
function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days: (number | null)[] = [];

  // Add empty slots for days before the first of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return days;
}

// Event type colors
const eventTypeColors: Record<string, { bg: string; text: string; dot: string }> = {
  tour: { bg: "bg-primary-50", text: "text-primary-700", dot: "bg-primary-600" },
  consultation: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-600" },
  interview: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-600" },
  assessment: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-600" },
  other: { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-600" },
};

// Event type labels
const eventTypeLabels: Record<string, string> = {
  tour: "Tour",
  consultation: "Consultation",
  interview: "Interview",
  assessment: "Assessment",
  other: "Event",
};

export default function EngagementCalendar({
  events,
  onEventClick,
  variant = "compact",
  className = "",
}: EngagementCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const calendarDays = useMemo(
    () => getCalendarDays(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map = new Map<string, ScheduledEvent[]>();
    events.forEach((event) => {
      const dateKey = `${event.date.getFullYear()}-${event.date.getMonth()}-${event.date.getDate()}`;
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, event]);
    });
    return map;
  }, [events]);

  // Get events for a specific day
  const getEventsForDay = (day: number) => {
    const dateKey = `${currentYear}-${currentMonth}-${day}`;
    return eventsByDate.get(dateKey) || [];
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Check if a day is today
  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  // Format month name
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Get upcoming events (sorted by date)
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  }, [events]);

  // Format event date for display
  const formatEventDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate.getTime() === today.getTime()) {
      return `Today, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    }
    if (eventDate.getTime() === tomorrow.getTime()) {
      return `Tomorrow, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    }
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{monthName}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={goToPreviousMonth}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToToday}
            className="px-2 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Next month"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <div
              key={index}
              className="text-center text-xs font-medium text-gray-500 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={index} className="h-8" />;
            }

            const dayEvents = getEventsForDay(day);
            const hasEvents = dayEvents.length > 0;
            const today = isToday(day);

            return (
              <button
                key={index}
                className={`relative h-8 rounded-md text-sm transition-colors ${
                  today
                    ? "bg-primary-600 text-white font-semibold"
                    : hasEvents
                    ? "bg-gray-50 text-gray-900 hover:bg-gray-100"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => {
                  if (hasEvents && onEventClick) {
                    onEventClick(dayEvents[0]);
                  }
                }}
                disabled={!hasEvents && !today}
              >
                {day}
                {hasEvents && !today && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events List */}
      {upcomingEvents.length > 0 && (
        <div className="border-t border-gray-200">
          <div className="px-4 py-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Upcoming
            </h4>
            <div className="space-y-3">
              {upcomingEvents.map((event) => {
                const colors = eventTypeColors[event.type] || eventTypeColors.other;
                const label = eventTypeLabels[event.type] || "Event";

                return (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg ${colors.bg} cursor-pointer hover:opacity-90 transition-opacity`}
                    onClick={() => onEventClick?.(event)}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${colors.text}`}>
                          {label}: {event.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {formatEventDate(event.date)}
                        </p>
                        {event.location && (
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {event.location}
                          </p>
                        )}
                      </div>
                      {event.engagementId && (
                        <Link
                          href={`/requests/${event.engagementId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs font-medium text-primary-600 hover:underline flex-shrink-0"
                        >
                          View
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {upcomingEvents.length === 0 && (
        <div className="border-t border-gray-200 px-4 py-6 text-center">
          <svg
            className="w-10 h-10 text-gray-300 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm text-gray-500">No upcoming events</p>
        </div>
      )}
    </div>
  );
}
