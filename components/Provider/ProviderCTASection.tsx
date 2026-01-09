"use client";

import { useState } from "react";
import { ProviderType } from "@prisma/client";
import { getProviderCTAs } from "@/lib/providerUtils";

interface ProviderCTASectionProps {
  providerId: string;
  providerName: string;
  providerType: ProviderType;
  phone: string;
  hasPricing: boolean;
  onOpenRequestForm: (reason: string) => void;
}

export default function ProviderCTASection({
  providerId,
  providerName,
  providerType,
  phone,
  hasPricing,
  onOpenRequestForm,
}: ProviderCTASectionProps) {
  const [isSticky, setIsSticky] = useState(false);
  const ctas = getProviderCTAs(providerType);

  // Format phone number for display and calling
  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const phoneHref = `tel:${phone.replace(/\D/g, "")}`;

  // Determine icon for primary CTA
  const getPrimaryIcon = () => {
    if (ctas.tourEnabled) {
      // Calendar icon for tours
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      );
    } else if (providerType === 'INDEPENDENT_CAREGIVER') {
      // User icon for caregiver interview
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      );
    } else {
      // Clipboard icon for consultation
      return (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      );
    }
  };

  return (
    <>
      {/* Desktop CTA Section - Always visible */}
      <div className="hidden lg:block bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ready to Learn More?
        </h3>

        {/* Primary CTA - Context-aware */}
        <button
          onClick={() => onOpenRequestForm(ctas.primary)}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-3"
        >
          <div className="flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {getPrimaryIcon()}
            </svg>
            <span>{ctas.primary}</span>
          </div>
        </button>

        {/* Secondary CTA - Send Request */}
        <button
          onClick={() => onOpenRequestForm("Ask a question")}
          className="w-full bg-white hover:bg-gray-50 text-primary-600 font-semibold py-3 px-6 rounded-lg border-2 border-primary-600 transition-colors mb-3"
        >
          <div className="flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <span>Send a Message</span>
          </div>
        </button>

        {/* Tertiary CTA - Request Pricing (if no pricing shown) */}
        {!hasPricing && (
          <button
            onClick={() => onOpenRequestForm("Request pricing information")}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border border-gray-300 transition-colors mb-3"
          >
            <div className="flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Request Pricing Info</span>
            </div>
          </button>
        )}

        {/* Phone CTA - Click to Call */}
        <a
          href={phoneHref}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <span>{formatPhoneNumber(phone)}</span>
        </a>

        <p className="text-xs text-gray-500 text-center mt-4">
          Response time: Usually within 24 hours
        </p>
      </div>

      {/* Mobile Sticky CTA Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
        <div className="flex gap-2">
          {/* Primary - Context-aware */}
          <button
            onClick={() => onOpenRequestForm(ctas.primary)}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            <div className="flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {getPrimaryIcon()}
              </svg>
              <span className="hidden sm:inline">
                {ctas.tourEnabled ? 'Tour' : providerType === 'INDEPENDENT_CAREGIVER' ? 'Interview' : 'Consult'}
              </span>
            </div>
          </button>

          {/* Secondary - Call */}
          <a
            href={phoneHref}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span className="hidden sm:inline">Call</span>
          </a>

          {/* Tertiary - Message */}
          <button
            onClick={() => onOpenRequestForm("Ask a question")}
            className="flex-1 bg-white hover:bg-gray-50 text-primary-600 font-semibold py-3 px-4 rounded-lg border-2 border-primary-600 transition-colors"
          >
            <div className="flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <span className="hidden sm:inline">Message</span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile spacer to prevent content from being hidden behind sticky bar */}
      <div className="lg:hidden h-20" />
    </>
  );
}
