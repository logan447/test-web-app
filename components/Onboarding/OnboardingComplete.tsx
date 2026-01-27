"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NextStep {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  primary?: boolean;
}

interface OnboardingCompleteProps {
  userType: "family" | "provider";
  userName?: string;
  onContinue?: () => void;
  autoRedirectDelay?: number; // milliseconds, 0 to disable
  redirectUrl?: string;
  className?: string;
}

/**
 * OnboardingComplete - Success screen shown after completing onboarding
 *
 * Features:
 * - Celebratory animation
 * - Personalized next steps based on user type
 * - Auto-redirect option
 */
export default function OnboardingComplete({
  userType,
  userName,
  onContinue,
  autoRedirectDelay = 0,
  redirectUrl,
  className = "",
}: OnboardingCompleteProps) {
  const router = useRouter();
  const [isAnimated, setIsAnimated] = useState(false);
  const [countdown, setCountdown] = useState(Math.ceil(autoRedirectDelay / 1000));

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (autoRedirectDelay > 0 && redirectUrl) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            if (onContinue) {
              onContinue();
            } else {
              router.push(redirectUrl);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [autoRedirectDelay, redirectUrl, router, onContinue]);

  const familyNextSteps: NextStep[] = [
    {
      title: "Browse Providers",
      description: "Find quality care providers in your area",
      href: "/browse",
      primary: true,
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
    },
    {
      title: "Complete Your Profile",
      description: "Add more details to get better matches",
      href: "/care-profile/edit",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      title: "View Your Dashboard",
      description: "See your saved providers and requests",
      href: "/care-profile",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },
  ];

  const providerNextSteps: NextStep[] = [
    {
      title: "Find Families",
      description: "Browse families looking for care services",
      href: "/provider/leads",
      primary: true,
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
    },
    {
      title: "Complete Your Profile",
      description: "Add photos and details to stand out",
      href: "/provider/profile/edit",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
    },
    {
      title: "View Your Dashboard",
      description: "Manage requests and track performance",
      href: "/provider/profile",
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
    },
  ];

  const nextSteps = userType === "family" ? familyNextSteps : providerNextSteps;
  const defaultRedirect = userType === "family" ? "/browse" : "/provider/leads";

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      router.push(redirectUrl || defaultRedirect);
    }
  };

  return (
    <div className={`text-center ${className}`}>
      {/* Success animation */}
      <div
        className={`mb-6 transform transition-all duration-700 ${
          isAnimated ? "scale-100 opacity-100" : "scale-50 opacity-0"
        }`}
      >
        <div className="relative inline-flex">
          {/* Confetti dots */}
          {isAnimated && (
            <>
              <div className="absolute -top-4 -left-4 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
              <div className="absolute -top-2 left-8 w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
              <div className="absolute top-2 -right-4 w-3 h-3 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
              <div className="absolute -bottom-4 right-4 w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
            </>
          )}

          {/* Success icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Success message */}
      <div
        className={`mb-8 transform transition-all duration-700 delay-200 ${
          isAnimated ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          You&apos;re all set{userName ? `, ${userName}` : ""}!
        </h2>
        <p className="text-gray-600">
          {userType === "family"
            ? "Your profile is ready. Start exploring care providers today."
            : "Your profile is live. Start connecting with families seeking care."}
        </p>
      </div>

      {/* Next steps */}
      <div
        className={`space-y-3 mb-8 transform transition-all duration-700 delay-400 ${
          isAnimated ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          What&apos;s Next?
        </h3>
        <div className="space-y-2">
          {nextSteps.map((step, index) => (
            <Link
              key={index}
              href={step.href}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                step.primary
                  ? "bg-primary-50 border-primary-200 hover:bg-primary-100"
                  : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  step.primary
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {step.icon}
              </div>
              <div className="text-left">
                <h4
                  className={`font-semibold ${
                    step.primary ? "text-primary-700" : "text-gray-900"
                  }`}
                >
                  {step.title}
                </h4>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
              <svg
                className={`w-5 h-5 ml-auto flex-shrink-0 ${
                  step.primary ? "text-primary-600" : "text-gray-400"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Continue button with optional countdown */}
      <div
        className={`transform transition-all duration-700 delay-500 ${
          isAnimated ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <button
          onClick={handleContinue}
          className="w-full bg-gradient-to-r from-primary-600 to-teal-600 text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
        >
          {autoRedirectDelay > 0 && countdown > 0
            ? `Continue in ${countdown}s`
            : userType === "family"
            ? "Start Browsing Providers"
            : "View Family Inquiries"}
        </button>
      </div>
    </div>
  );
}
