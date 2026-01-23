"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface OnboardingWelcomeProps {
  userName?: string;
  onGetStarted?: () => void;
  variant?: "overlay" | "page";
  className?: string;
}

/**
 * OnboardingWelcome - A welcoming intro screen for new users
 *
 * Can be used as:
 * 1. An intro step before the onboarding wizard
 * 2. A standalone welcome page for new signups
 * 3. Part of a multi-step onboarding flow
 */
export default function OnboardingWelcome({
  userName,
  onGetStarted,
  variant = "overlay",
  className = "",
}: OnboardingWelcomeProps) {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      title: "Find Quality Care",
      description: "Browse thousands of vetted care providers in your area",
      color: "bg-primary-100 text-primary-600",
    },
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
      title: "Connect Directly",
      description: "Message providers and schedule tours with ease",
      color: "bg-teal-100 text-teal-600",
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
      title: "Peace of Mind",
      description: "Verified reviews and transparent pricing",
      color: "bg-blue-100 text-blue-600",
    },
  ];

  if (variant === "page") {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-primary-50 via-white to-teal-50 ${className}`}
      >
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
          {/* Logo */}
          <div
            className={`text-center mb-12 transform transition-all duration-700 ${
              isAnimated ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 to-teal-600 rounded-2xl shadow-lg mb-6">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Welcome to Olera{userName ? `, ${userName}` : ""}!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your journey to finding the perfect care starts here. We&apos;re
              here to help every step of the way.
            </p>
          </div>

          {/* Features */}
          <div
            className={`grid md:grid-cols-3 gap-6 mb-12 transform transition-all duration-700 delay-200 ${
              isAnimated ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}
                >
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div
            className={`text-center transform transition-all duration-700 delay-400 ${
              isAnimated ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Get Started
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
            <p className="mt-4 text-sm text-gray-500">
              Takes less than 2 minutes to set up your profile
            </p>
          </div>

          {/* Trust indicators */}
          <div
            className={`mt-16 pt-8 border-t border-gray-200 transform transition-all duration-700 delay-500 ${
              isAnimated ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Verified Providers</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Free to Use</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Secure & Private</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Overlay variant (compact)
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Welcome header */}
      <div
        className={`text-center transform transition-all duration-500 ${
          isAnimated ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-teal-600 rounded-2xl shadow-lg mb-4">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome to Olera{userName ? `, ${userName}` : ""}!
        </h2>
        <p className="text-gray-600 mt-2">
          Let&apos;s personalize your experience
        </p>
      </div>

      {/* Quick feature highlights */}
      <div
        className={`space-y-3 transform transition-all duration-500 delay-150 ${
          isAnimated ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <div
              className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center flex-shrink-0`}
            >
              {feature.icon}
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{feature.title}</p>
              <p className="text-xs text-gray-500">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div
        className={`transform transition-all duration-500 delay-300 ${
          isAnimated ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <button
          onClick={onGetStarted}
          className="w-full bg-gradient-to-r from-primary-600 to-teal-600 text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          Get Started
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>
        <p className="text-center text-xs text-gray-500 mt-3">
          Takes less than 2 minutes
        </p>
      </div>
    </div>
  );
}
