"use client";

import { useState } from "react";

interface EnhancedContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  providerName: string;
  defaultReason?: string;
  onSubmit: (formData: ContactFormData) => Promise<void>;
}

export interface ContactFormData {
  message: string;
  contactReason: string;
  preferredContactMethod: string;
  preferredTourDate?: string;
}

const CONTACT_REASONS = [
  "Schedule a tour",
  "Request pricing information",
  "Ask a question",
  "Request immediate placement",
  "Other",
];

const CONTACT_METHODS = ["Email", "Phone", "Either"];

export default function EnhancedContactModal({
  isOpen,
  onClose,
  providerId,
  providerName,
  defaultReason = "Ask a question",
  onSubmit,
}: EnhancedContactModalProps) {
  const [contactReason, setContactReason] = useState(defaultReason);
  const [preferredContactMethod, setPreferredContactMethod] = useState("Either");
  const [preferredTourDate, setPreferredTourDate] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    if (contactReason === "Schedule a tour" && !preferredTourDate) {
      setError("Please select a preferred date for your tour");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        message: message.trim(),
        contactReason,
        preferredContactMethod,
        preferredTourDate: preferredTourDate || undefined,
      });

      // Reset form
      setMessage("");
      setContactReason(defaultReason);
      setPreferredContactMethod("Either");
      setPreferredTourDate("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 2); // Minimum 2 hours from now
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Contact {providerName}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Send a request and get a response within 24 hours
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Reason for Contact */}
          <div>
            <label
              htmlFor="contactReason"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              What would you like to do? <span className="text-red-500">*</span>
            </label>
            <select
              id="contactReason"
              value={contactReason}
              onChange={(e) => setContactReason(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              {CONTACT_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          {/* Preferred Tour Date - Show only if scheduling a tour */}
          {contactReason === "Schedule a tour" && (
            <div>
              <label
                htmlFor="preferredTourDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Preferred Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="preferredTourDate"
                value={preferredTourDate}
                onChange={(e) => setPreferredTourDate(e.target.value)}
                min={getMinDateTime()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required={contactReason === "Schedule a tour"}
              />
              <p className="text-xs text-gray-500 mt-1">
                Select your preferred date and time. The provider will confirm
                availability.
              </p>
            </div>
          )}

          {/* Preferred Contact Method */}
          <div>
            <label
              htmlFor="preferredContactMethod"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              How should we contact you? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {CONTACT_METHODS.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPreferredContactMethod(method)}
                  className={`py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                    preferredContactMethod === method
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder={
                contactReason === "Schedule a tour"
                  ? "Tell us about your care needs and any specific questions you have..."
                  : contactReason === "Request pricing information"
                  ? "Please provide details about the type of care you're looking for..."
                  : "Share your questions or any specific information the provider should know..."
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 20 characters
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-xs text-blue-800">
                Your contact information will only be shared with this provider.
                You&apos;ll receive a copy of this request via email.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Scheduling..." : "Schedule Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
