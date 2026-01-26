"use client";

import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Fragment } from "react";

type TakedownReason =
  | "NOT_MY_BUSINESS"
  | "INCORRECT_INFO"
  | "BUSINESS_CLOSED"
  | "PRIVACY_CONCERN"
  | "DUPLICATE_LISTING"
  | "OTHER";

const REASON_OPTIONS: Array<{ value: TakedownReason; label: string; description: string }> = [
  {
    value: "NOT_MY_BUSINESS",
    label: "I don't own or represent this business",
    description: "You're claiming this page shouldn't exist because the business isn't yours",
  },
  {
    value: "INCORRECT_INFO",
    label: "The information is incorrect",
    description: "The listing contains factually incorrect information",
  },
  {
    value: "BUSINESS_CLOSED",
    label: "This business has permanently closed",
    description: "The business is no longer operating",
  },
  {
    value: "PRIVACY_CONCERN",
    label: "Privacy or legal concern",
    description: "The listing raises privacy or legal issues",
  },
  {
    value: "DUPLICATE_LISTING",
    label: "This is a duplicate listing",
    description: "This provider already has another page on Olera",
  },
  {
    value: "OTHER",
    label: "Other reason",
    description: "Please explain in the details field",
  },
];

interface TakedownRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  providerName: string;
}

export default function TakedownRequestModal({
  isOpen,
  onClose,
  providerId,
  providerName,
}: TakedownRequestModalProps) {
  const [step, setStep] = useState<"form" | "submitting" | "success" | "error">("form");
  const [error, setError] = useState("");

  // Form state
  const [reason, setReason] = useState<TakedownReason | "">("");
  const [details, setDetails] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [proofUrl, setProofUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!reason) {
      setError("Please select a reason for your request");
      return;
    }
    if (!contactName.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!contactEmail.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (!contactEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setStep("submitting");
    setError("");

    try {
      const response = await fetch(`/api/providers/${providerId}/takedown`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          details: details.trim() || null,
          contactName: contactName.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim() || null,
          proofUrl: proofUrl.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit request");
      }

      setStep("success");
    } catch (err: any) {
      setError(err.message || "Failed to submit request. Please try again.");
      setStep("error");
    }
  };

  const handleClose = () => {
    // Reset form state
    setStep("form");
    setError("");
    setReason("");
    setDetails("");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setProofUrl("");
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <DialogTitle as="h3" className="text-lg font-semibold text-gray-900">
                    {step === "success" ? "Request Submitted" : "Request Page Removal"}
                  </DialogTitle>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                  {step === "form" && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <p className="text-sm text-gray-600">
                        You&apos;re requesting removal of the page for <strong>{providerName}</strong>.
                        This request will be reviewed by our team.
                      </p>

                      {/* Reason selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reason for removal request <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                          {REASON_OPTIONS.map((option) => (
                            <label
                              key={option.value}
                              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                reason === option.value
                                  ? "border-primary-500 bg-primary-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name="reason"
                                value={option.value}
                                checked={reason === option.value}
                                onChange={(e) => setReason(e.target.value as TakedownReason)}
                                className="mt-1"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{option.label}</p>
                                <p className="text-xs text-gray-500">{option.description}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Additional details */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Additional details {reason === "OTHER" && <span className="text-red-500">*</span>}
                        </label>
                        <textarea
                          value={details}
                          onChange={(e) => setDetails(e.target.value)}
                          placeholder="Please provide any additional context..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                          required={reason === "OTHER"}
                        />
                      </div>

                      {/* Proof URL */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Proof of ownership (optional)
                        </label>
                        <input
                          type="url"
                          value={proofUrl}
                          onChange={(e) => setProofUrl(e.target.value)}
                          placeholder="https://example.com/proof"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Link to documentation proving your relationship to this business
                        </p>
                      </div>

                      <hr className="my-4" />

                      {/* Contact info */}
                      <p className="text-sm font-medium text-gray-700">Your contact information</p>
                      <p className="text-xs text-gray-500 -mt-2">
                        We&apos;ll notify you about the status of your request
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="Your full name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone (optional)
                          </label>
                          <input
                            type="tel"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="(555) 123-4567"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                          />
                        </div>
                      </div>

                      {/* Error message */}
                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                          {error}
                        </div>
                      )}

                      {/* DMCA notice */}
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
                        <p className="font-medium mb-1">DMCA Notice</p>
                        <p>
                          By submitting this request, you confirm that the information provided is accurate
                          to the best of your knowledge. False or misleading requests may result in legal action.
                          All requests are reviewed within 5-7 business days.
                        </p>
                      </div>
                    </form>
                  )}

                  {step === "submitting" && (
                    <div className="py-12 text-center">
                      <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4" />
                      <p className="text-gray-600">Submitting your request...</p>
                    </div>
                  )}

                  {step === "success" && (
                    <div className="py-8 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Request Submitted</h4>
                      <p className="text-gray-600 mb-4">
                        Your request has been submitted and will be reviewed by our team.
                        We&apos;ll notify you at <strong>{contactEmail}</strong> once a decision has been made.
                      </p>
                      <p className="text-sm text-gray-500">
                        Please allow 5-7 business days for review.
                      </p>
                    </div>
                  )}

                  {step === "error" && (
                    <div className="py-8 text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Submission Failed</h4>
                      <p className="text-gray-600 mb-4">{error}</p>
                      <button
                        onClick={() => setStep("form")}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Try again
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {step === "form" && (
                  <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                    >
                      Submit Request
                    </button>
                  </div>
                )}

                {(step === "success" || step === "error") && (
                  <div className="flex justify-center px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button
                      onClick={handleClose}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
