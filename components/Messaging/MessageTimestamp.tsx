"use client";

import { format, isToday, isYesterday, isThisWeek, isThisYear } from "date-fns";

export interface MessageTimestampProps {
  date: Date;
  sticky?: boolean;
}

export default function MessageTimestamp({ date, sticky = false }: MessageTimestampProps) {
  const getFormattedDate = (date: Date): string => {
    if (isToday(date)) {
      return "Today";
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else if (isThisWeek(date)) {
      return format(date, "EEEE"); // Monday, Tuesday, etc.
    } else if (isThisYear(date)) {
      return format(date, "MMMM d"); // January 15
    } else {
      return format(date, "MMMM d, yyyy"); // January 15, 2024
    }
  };

  return (
    <div
      className={`
        flex justify-center py-4
        ${sticky ? "sticky top-0 z-10 bg-gray-50 bg-opacity-90 backdrop-blur-sm" : ""}
      `}
    >
      <div className="bg-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
        {getFormattedDate(date)}
      </div>
    </div>
  );
}

/**
 * Utility function to group messages by date
 * Returns array of { date: Date, messages: Message[] }
 */
export function groupMessagesByDate<T extends { createdAt: string | Date }>(
  messages: T[]
): Array<{ date: Date; messages: T[] }> {
  const groups: Map<string, T[]> = new Map();

  messages.forEach((message) => {
    const messageDate = new Date(message.createdAt);
    const dateKey = format(messageDate, "yyyy-MM-dd");

    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(message);
  });

  return Array.from(groups.entries()).map(([dateKey, msgs]) => ({
    date: new Date(dateKey),
    messages: msgs,
  }));
}

/**
 * Utility to determine if consecutive messages should be grouped
 * (same sender, within 2 minutes)
 */
export function shouldGroupMessages(
  currentMessage: { senderId: string; createdAt: string | Date },
  previousMessage: { senderId: string; createdAt: string | Date } | null
): boolean {
  if (!previousMessage) return false;
  if (currentMessage.senderId !== previousMessage.senderId) return false;

  const currentTime = new Date(currentMessage.createdAt).getTime();
  const previousTime = new Date(previousMessage.createdAt).getTime();
  const timeDiff = currentTime - previousTime;

  // Group if within 2 minutes
  return timeDiff < 2 * 60 * 1000;
}
