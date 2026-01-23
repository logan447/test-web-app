"use client";

import { useState, useEffect } from "react";

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

interface BenefitsHighlightsProps {
  userType: "family" | "provider";
  variant?: "cards" | "list" | "compact";
  showAnimation?: boolean;
  className?: string;
}

/**
 * BenefitsHighlights - Showcases premium membership benefits
 *
 * Features:
 * - User-type specific benefits
 * - Multiple display variants
 * - Animated entrance
 */
export default function BenefitsHighlights({
  userType,
  variant = "cards",
  showAnimation = true,
  className = "",
}: BenefitsHighlightsProps) {
  const [isVisible, setIsVisible] = useState(!showAnimation);

  useEffect(() => {
    if (showAnimation) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [showAnimation]);

  const familyBenefits: Benefit[] = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      title: "Unlimited Messaging",
      description: "Connect directly with care providers without limits",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: "Priority Matching",
      description: "Get matched first with top-rated providers",
      color: "bg-amber-100 text-amber-600",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      title: "Background Insights",
      description: "Access detailed provider verification status",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      title: "Priority Support",
      description: "Get faster responses from our care team",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
      title: "Care Checklist Tools",
      description: "Personalized checklists for your care journey",
      color: "bg-teal-100 text-teal-600",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Response Tracking",
      description: "See when providers view your requests",
      color: "bg-pink-100 text-pink-600",
    },
  ];

  const providerBenefits: Benefit[] = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      title: "Unlimited Family Connections",
      description: "Message and connect with unlimited families",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      ),
      title: "Contact Information Access",
      description: "See family phone and email when accepted",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
      title: "Priority Search Placement",
      description: "Appear higher in family search results",
      color: "bg-amber-100 text-amber-600",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      title: "Advanced Analytics",
      description: "Track profile views and engagement metrics",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ),
      title: "Featured Profile Badge",
      description: "Stand out with a verified pro badge",
      color: "bg-teal-100 text-teal-600",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      title: "Priority Support",
      description: "Dedicated support for your business needs",
      color: "bg-pink-100 text-pink-600",
    },
  ];

  const benefits = userType === "family" ? familyBenefits : providerBenefits;

  // Cards variant
  if (variant === "cards") {
    return (
      <div className={className}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
              style={{
                transitionDelay: showAnimation ? `${index * 75}ms` : "0ms",
              }}
            >
              <div
                className={`w-12 h-12 rounded-xl ${benefit.color} flex items-center justify-center mb-4`}
              >
                {benefit.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // List variant
  if (variant === "list") {
    return (
      <div className={className}>
        <ul className="space-y-4">
          {benefits.map((benefit, index) => (
            <li
              key={index}
              className={`flex items-start gap-4 transition-all duration-300 ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-4 opacity-0"
              }`}
              style={{
                transitionDelay: showAnimation ? `${index * 50}ms` : "0ms",
              }}
            >
              <div
                className={`w-10 h-10 rounded-lg ${benefit.color} flex items-center justify-center flex-shrink-0`}
              >
                {benefit.icon}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{benefit.title}</h4>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Compact variant
  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-3">
        {benefits.slice(0, 4).map((benefit, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg transition-all duration-300 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0"
            }`}
            style={{
              transitionDelay: showAnimation ? `${index * 50}ms` : "0ms",
            }}
          >
            <div
              className={`w-8 h-8 rounded-lg ${benefit.color} flex items-center justify-center flex-shrink-0`}
            >
              <div className="scale-75">{benefit.icon}</div>
            </div>
            <span className="text-sm font-medium text-gray-900">{benefit.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * BenefitsBanner - A promotional banner highlighting key benefits
 */
export function BenefitsBanner({
  userType,
  onUpgrade,
  className = "",
}: {
  userType: "family" | "provider";
  onUpgrade?: () => void;
  className?: string;
}) {
  const title =
    userType === "family"
      ? "Unlock Premium Features"
      : "Grow Your Business with Pro";

  const subtitle =
    userType === "family"
      ? "Get priority matching, unlimited messaging, and more"
      : "Connect with unlimited families for just $25/month";

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-teal-700 rounded-2xl p-6 ${className}`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-white">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-medium text-primary-100">Premium</span>
          </div>
          <h3 className="text-xl font-bold mb-1">{title}</h3>
          <p className="text-primary-100">{subtitle}</p>
        </div>
        <button
          onClick={onUpgrade}
          className="bg-white text-primary-700 px-6 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors shadow-lg flex-shrink-0"
        >
          Upgrade Now
        </button>
      </div>
    </div>
  );
}
