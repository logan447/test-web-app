"use client";

import { useState } from "react";

interface SchedulingFormProps {
  /** The engagement noun: "tour", "consultation", or "interview" */
  noun: string;
  /** Provider name for contextual copy */
  providerName: string;
  /** Whether the form is submitting */
  submitting: boolean;
  /** Called when user submits a time */
  onSubmit: (data: {
    date: string;
    time: string;
    format: "in_person" | "video";
    note?: string;
  }) => Promise<void>;
  /** Called when user cancels (only shown when collapsible=true) */
  onCancel?: () => void;
  /** If true, show as a prominent open form. If false, show collapse/expand. Default: true */
  prominent?: boolean;
}

/**
 * SchedulingForm — Shared scheduling UI for tour/consultation/interview
 *
 * Used in the request detail page for both PENDING (suggest a time)
 * and ACCEPTED (pick a time) states. Designed for 65+ users with
 * large touch targets, clear labels, and minimal cognitive load.
 */
export default function SchedulingForm({
  noun,
  providerName,
  submitting,
  onSubmit,
  onCancel,
  prominent = true,
}: SchedulingFormProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [format, setFormat] = useState<"in_person" | "video">("in_person");
  const [note, setNote] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;
    await onSubmit({ date, time, format, note: note || undefined });
    setDate("");
    setTime("");
    setFormat("in_person");
    setNote("");
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Date & Time — large inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[15px] font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={today}
            className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
            required
          />
        </div>
        <div>
          <label className="block text-[15px] font-medium text-gray-700 mb-2">
            Time
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
            required
          />
        </div>
      </div>

      {/* Format toggle — large touch targets */}
      <div>
        <label className="block text-[15px] font-medium text-gray-700 mb-2">
          Format
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormat("in_person")}
            className={`flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl border text-base font-medium transition-colors ${
              format === "in_person"
                ? "border-primary-500 bg-primary-50 text-primary-700"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            In person
          </button>
          <button
            type="button"
            onClick={() => setFormat("video")}
            className={`flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl border text-base font-medium transition-colors ${
              format === "video"
                ? "border-primary-500 bg-primary-50 text-primary-700"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Video call
          </button>
        </div>
      </div>

      {/* Note — optional */}
      <div>
        <label className="block text-[15px] font-medium text-gray-700 mb-2">
          Note <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g., Mornings work best for us"
          className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
        />
      </div>

      {/* Submit — prominent green for key action, or standard for secondary */}
      <div className={onCancel ? "flex gap-3" : ""}>
        <button
          type="submit"
          disabled={submitting || !date || !time}
          className={`${onCancel ? "flex-1" : "w-full"} ${
            prominent
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-primary-600 hover:bg-primary-700 text-white"
          } py-4 rounded-xl font-semibold text-base disabled:opacity-50 transition-colors`}
        >
          {submitting ? "Sending..." : prominent ? "Send this time" : "Send preferred time"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-4 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors text-base"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
