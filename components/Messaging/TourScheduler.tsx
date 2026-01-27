"use client";

import { useState } from "react";
import { format } from "date-fns";

export interface TourSchedulerProps {
  onPropose: (date: Date, time: string, notes?: string) => void;
  onCancel: () => void;
  disabled?: boolean;
  engagementLabel?: string; // e.g., "Tour", "Consultation", "Interview"
  /** Default meeting format - in-person or video */
  defaultFormat?: "in-person" | "video";
  /** Provider location for in-person meetings */
  providerLocation?: string;
  /** Hide format selector (for facility tours which are always in-person) */
  hideFormatSelector?: boolean;
}

// Pre-defined time slots
const timeSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
];

export default function TourScheduler({
  onPropose,
  onCancel,
  disabled = false,
  engagementLabel = "Tour",
  defaultFormat = "in-person",
  providerLocation,
  hideFormatSelector = false,
}: TourSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [meetingFormat, setMeetingFormat] = useState<"in-person" | "video">(defaultFormat);
  const [location, setLocation] = useState<string>(providerLocation || "");
  const [notes, setNotes] = useState<string>("");

  // Get minimum date (today)
  const minDate = format(new Date(), "yyyy-MM-dd");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && selectedTime) {
      // Build the notes with meeting details
      let fullNotes = "";
      if (meetingFormat === "video") {
        fullNotes = "[Video Call]\n";
      } else if (location) {
        fullNotes = `[Location: ${location}]\n`;
      }
      if (notes) {
        fullNotes += notes;
      }

      onPropose(new Date(selectedDate), selectedTime, fullNotes.trim() || undefined);
      // Reset form
      setSelectedDate("");
      setSelectedTime("");
      setNotes("");
      setLocation(providerLocation || "");
    }
  };

  const isValid = selectedDate && selectedTime && (meetingFormat === "video" || !hideFormatSelector || location || engagementLabel === "Tour");

  return (
    <div className="bg-white border-2 border-primary-300 rounded-xl shadow-lg p-5 max-w-md">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Schedule a {engagementLabel}</h3>
          <p className="text-xs text-gray-500">Propose a date and time for your {engagementLabel.toLowerCase()}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date Picker */}
        <div>
          <label htmlFor="tour-date" className="block text-sm font-medium text-gray-700 mb-1.5">
            Select Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              id="tour-date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={minDate}
              disabled={disabled}
              className="
                w-full
                px-4 py-2.5
                border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                text-gray-900
              "
              required
            />
          </div>
        </div>

        {/* Time Picker */}
        <div>
          <label htmlFor="tour-time" className="block text-sm font-medium text-gray-700 mb-1.5">
            Select Time <span className="text-red-500">*</span>
          </label>
          <select
            id="tour-time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            disabled={disabled}
            className="
              w-full
              px-4 py-2.5
              border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              text-gray-900
              bg-white
            "
            required
          >
            <option value="">Choose a time</option>
            {timeSlots.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        {/* Meeting Format Selector */}
        {!hideFormatSelector && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Meeting Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMeetingFormat("in-person")}
                disabled={disabled}
                className={`
                  flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-colors
                  ${meetingFormat === "in-person"
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium">In Person</span>
              </button>
              <button
                type="button"
                onClick={() => setMeetingFormat("video")}
                disabled={disabled}
                className={`
                  flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-colors
                  ${meetingFormat === "video"
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Video Call</span>
              </button>
            </div>
          </div>
        )}

        {/* Location Field (for in-person) */}
        {meetingFormat === "in-person" && !hideFormatSelector && (
          <div>
            <label htmlFor="tour-location" className="block text-sm font-medium text-gray-700 mb-1.5">
              Meeting Location
            </label>
            <input
              type="text"
              id="tour-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={disabled}
              placeholder="Enter address or meeting place"
              className="
                w-full px-4 py-2.5
                border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                text-gray-900
              "
            />
            {providerLocation && (
              <p className="mt-1 text-xs text-gray-500">
                Suggested: {providerLocation}
              </p>
            )}
          </div>
        )}

        {/* Video Call Notice */}
        {meetingFormat === "video" && !hideFormatSelector && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-blue-800">
                A video call link will be shared once the {engagementLabel.toLowerCase()} is confirmed.
              </p>
            </div>
          </div>
        )}

        {/* Notes (Optional) */}
        <div>
          <label htmlFor="tour-notes" className="block text-sm font-medium text-gray-700 mb-1.5">
            Additional Notes (Optional)
          </label>
          <textarea
            id="tour-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={disabled}
            rows={3}
            maxLength={200}
            placeholder={`Any special requests or questions for the ${engagementLabel.toLowerCase()}...`}
            className="
              w-full
              px-4 py-2.5
              border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              text-gray-900
              resize-none
            "
          />
          <div className="mt-1 text-xs text-gray-500 text-right">
            {notes.length}/200
          </div>
        </div>

        {/* Preview */}
        {selectedDate && selectedTime && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
            <p className="text-xs font-medium text-primary-700 mb-1.5">{engagementLabel} Preview:</p>
            <div className="flex items-center gap-2 text-sm text-gray-900 mb-1">
              <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="font-medium">
                {format(new Date(selectedDate), "EEEE, MMMM d, yyyy")} at {selectedTime}
              </span>
            </div>
            {!hideFormatSelector && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                {meetingFormat === "video" ? (
                  <>
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Video Call</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{location || "In Person"}</span>
                  </>
                )}
              </div>
            )}
            {notes && (
              <p className="text-xs text-gray-600 mt-2 italic">&quot;{notes}&quot;</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={disabled || !isValid}
            className="
              flex-1
              flex items-center justify-center gap-2
              px-4 py-2.5
              bg-primary-600 text-white
              rounded-lg
              hover:bg-primary-700
              active:bg-primary-800
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
              font-medium text-sm
            "
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            Propose {engagementLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={disabled}
            className="
              px-4 py-2.5
              bg-white text-gray-700
              border border-gray-300
              rounded-lg
              hover:bg-gray-50
              active:bg-gray-100
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
              font-medium text-sm
            "
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
