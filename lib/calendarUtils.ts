/**
 * Calendar Utilities for ICS Generation
 *
 * Generates ICS (iCalendar) files for scheduled engagements like
 * tours, consultations, and interviews.
 */

import { formatEngagementType, type EngagementType } from "./engagementUtils";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  organizer?: {
    name: string;
    email?: string;
  };
  attendee?: {
    name: string;
    email?: string;
  };
  url?: string;
  engagementType?: EngagementType | string;
}

/**
 * Format date to ICS format (YYYYMMDDTHHMMSSZ for UTC)
 */
function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/**
 * Format date to ICS format for all-day events (YYYYMMDD)
 */
function formatICSDateOnly(date: Date): string {
  return date.toISOString().split("T")[0].replace(/-/g, "");
}

/**
 * Escape special characters for ICS text fields
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Fold long lines per ICS spec (max 75 chars per line)
 */
function foldLine(line: string): string {
  const maxLength = 75;
  if (line.length <= maxLength) return line;

  const result: string[] = [];
  let remaining = line;

  while (remaining.length > maxLength) {
    result.push(remaining.substring(0, maxLength));
    remaining = " " + remaining.substring(maxLength);
  }
  result.push(remaining);

  return result.join("\r\n");
}

/**
 * Generate a unique identifier for the calendar event
 */
function generateUID(eventId: string): string {
  return `${eventId}@olera.care`;
}

/**
 * Parse time string (e.g., "2:30 PM") and combine with date
 */
export function parseTimeWithDate(date: Date, timeString: string): Date {
  const result = new Date(date);

  // Parse time like "2:30 PM" or "10:00 AM"
  const timeMatch = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const period = timeMatch[3].toUpperCase();

    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }

    result.setHours(hours, minutes, 0, 0);
  }

  return result;
}

/**
 * Generate ICS content for a single event
 */
export function generateICSContent(event: CalendarEvent): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Olera//Elder Care Platform//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
  ];

  // Required fields
  lines.push(`UID:${generateUID(event.id)}`);
  lines.push(`DTSTAMP:${formatICSDate(new Date())}`);
  lines.push(`DTSTART:${formatICSDate(event.startDate)}`);
  lines.push(`DTEND:${formatICSDate(event.endDate)}`);
  lines.push(foldLine(`SUMMARY:${escapeICSText(event.title)}`));

  // Optional fields
  if (event.description) {
    lines.push(foldLine(`DESCRIPTION:${escapeICSText(event.description)}`));
  }

  if (event.location) {
    lines.push(foldLine(`LOCATION:${escapeICSText(event.location)}`));
  }

  if (event.url) {
    lines.push(`URL:${event.url}`);
  }

  if (event.organizer?.email) {
    const organizerLine = event.organizer.name
      ? `ORGANIZER;CN=${escapeICSText(event.organizer.name)}:mailto:${event.organizer.email}`
      : `ORGANIZER:mailto:${event.organizer.email}`;
    lines.push(foldLine(organizerLine));
  }

  if (event.attendee?.email) {
    const attendeeLine = event.attendee.name
      ? `ATTENDEE;CN=${escapeICSText(event.attendee.name)}:mailto:${event.attendee.email}`
      : `ATTENDEE:mailto:${event.attendee.email}`;
    lines.push(foldLine(attendeeLine));
  }

  // Add reminder (15 minutes before)
  lines.push("BEGIN:VALARM");
  lines.push("TRIGGER:-PT15M");
  lines.push("ACTION:DISPLAY");
  lines.push(foldLine(`DESCRIPTION:Reminder: ${escapeICSText(event.title)}`));
  lines.push("END:VALARM");

  lines.push("END:VEVENT");
  lines.push("END:VCALENDAR");

  return lines.join("\r\n");
}

/**
 * Create a downloadable ICS file
 */
export function downloadICSFile(event: CalendarEvent, filename?: string): void {
  const icsContent = generateICSContent(event);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `${event.title.replace(/[^a-z0-9]/gi, "-")}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Generate Google Calendar URL
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams();

  params.set("action", "TEMPLATE");
  params.set("text", event.title);

  // Format dates for Google Calendar (YYYYMMDDTHHMMSS/YYYYMMDDTHHMMSS)
  const startStr = formatICSDate(event.startDate).replace("Z", "");
  const endStr = formatICSDate(event.endDate).replace("Z", "");
  params.set("dates", `${startStr}/${endStr}`);

  if (event.description) {
    params.set("details", event.description);
  }

  if (event.location) {
    params.set("location", event.location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook.com Calendar URL
 */
export function generateOutlookCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams();

  params.set("path", "/calendar/action/compose");
  params.set("rru", "addevent");
  params.set("subject", event.title);

  // Outlook uses ISO format
  params.set("startdt", event.startDate.toISOString());
  params.set("enddt", event.endDate.toISOString());

  if (event.description) {
    params.set("body", event.description);
  }

  if (event.location) {
    params.set("location", event.location);
  }

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate Yahoo Calendar URL
 */
export function generateYahooCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams();

  params.set("v", "60");
  params.set("title", event.title);

  // Yahoo uses YYYYMMDDTHHMMSS format
  const startStr = formatICSDate(event.startDate).replace("Z", "");
  const endStr = formatICSDate(event.endDate).replace("Z", "");
  params.set("st", startStr);
  params.set("et", endStr);

  if (event.description) {
    params.set("desc", event.description);
  }

  if (event.location) {
    params.set("in_loc", event.location);
  }

  return `https://calendar.yahoo.com/?${params.toString()}`;
}

/**
 * Build calendar event from tour/scheduled event data
 */
export function buildCalendarEventFromTour(tour: {
  id: string;
  proposedDate: Date | string;
  proposedTime: string;
  notes?: string | null;
  providerName: string;
  providerLocation?: string;
  familyName?: string;
  engagementType?: EngagementType | string;
  durationMinutes?: number;
}): CalendarEvent {
  const startDate =
    typeof tour.proposedDate === "string"
      ? parseTimeWithDate(new Date(tour.proposedDate), tour.proposedTime)
      : parseTimeWithDate(tour.proposedDate, tour.proposedTime);

  const duration = tour.durationMinutes || 60; // Default 1 hour
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

  const engagementLabel = tour.engagementType
    ? formatEngagementType(tour.engagementType as EngagementType)
    : "Tour";

  const title = `${engagementLabel} with ${tour.providerName}`;

  let description = `${engagementLabel} scheduled with ${tour.providerName}`;
  if (tour.familyName) {
    description += ` for ${tour.familyName}`;
  }
  if (tour.notes) {
    description += `\n\nNotes: ${tour.notes}`;
  }
  description += "\n\nScheduled via Olera - Elder Care Made Simple";

  return {
    id: tour.id,
    title,
    description,
    startDate,
    endDate,
    location: tour.providerLocation,
    engagementType: tour.engagementType,
  };
}

/**
 * Calendar add options for dropdown menu
 */
export interface AddToCalendarOption {
  id: string;
  label: string;
  icon: "google" | "apple" | "outlook" | "yahoo" | "download";
  action: (event: CalendarEvent) => void;
}

export const addToCalendarOptions: AddToCalendarOption[] = [
  {
    id: "google",
    label: "Google Calendar",
    icon: "google",
    action: (event) => {
      window.open(generateGoogleCalendarUrl(event), "_blank");
    },
  },
  {
    id: "outlook",
    label: "Outlook",
    icon: "outlook",
    action: (event) => {
      window.open(generateOutlookCalendarUrl(event), "_blank");
    },
  },
  {
    id: "yahoo",
    label: "Yahoo Calendar",
    icon: "yahoo",
    action: (event) => {
      window.open(generateYahooCalendarUrl(event), "_blank");
    },
  },
  {
    id: "apple",
    label: "Apple Calendar (Download)",
    icon: "apple",
    action: (event) => {
      downloadICSFile(event);
    },
  },
  {
    id: "ics",
    label: "Download .ics File",
    icon: "download",
    action: (event) => {
      downloadICSFile(event);
    },
  },
];
