"use client";

import { useState } from "react";

export type PlanTier = "free" | "pro" | "enterprise";

interface Plan {
  id: PlanTier;
  name: string;
  tagline: string;
  price: number | null;
  priceLabel: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
  badge?: string;
}

interface SubscriptionPlansProps {
  userType: "family" | "provider";
  currentPlan?: PlanTier;
  onSelectPlan?: (plan: PlanTier) => void;
  className?: string;
}

/**
 * SubscriptionPlans - Comprehensive pricing display for subscription tiers
 *
 * Features:
 * - Different plans for families vs providers
 * - Visual highlighting of recommended plan
 * - Responsive grid layout
 */
export default function SubscriptionPlans({
  userType,
  currentPlan = "free",
  onSelectPlan,
  className = "",
}: SubscriptionPlansProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const familyPlans: Plan[] = [
    {
      id: "free",
      name: "Free",
      tagline: "Get started",
      price: 0,
      priceLabel: "$0",
      period: "forever",
      description: "Everything you need to start your care search",
      features: [
        "Browse all care providers",
        "View provider profiles",
        "Save favorite providers",
        "Basic search filters",
        "Email support",
      ],
      cta: currentPlan === "free" ? "Current Plan" : "Get Started",
    },
    {
      id: "pro",
      name: "Family Plus",
      tagline: "Most popular",
      price: billingCycle === "monthly" ? 15 : 12,
      priceLabel: billingCycle === "monthly" ? "$15" : "$12",
      period: billingCycle === "monthly" ? "/month" : "/month, billed annually",
      description: "Enhanced features for your care journey",
      features: [
        "Everything in Free",
        "Unlimited messaging",
        "Priority placement in requests",
        "Advanced matching algorithm",
        "Provider background insights",
        "Priority support",
      ],
      highlighted: true,
      cta: currentPlan === "pro" ? "Current Plan" : "Upgrade Now",
      badge: "Best Value",
    },
    {
      id: "enterprise",
      name: "Care Concierge",
      tagline: "White-glove service",
      price: null,
      priceLabel: "Custom",
      period: "",
      description: "Personalized care coordination support",
      features: [
        "Everything in Family Plus",
        "Dedicated care advisor",
        "Provider vetting assistance",
        "Care transition support",
        "Legal & financial guidance",
        "24/7 phone support",
      ],
      cta: "Contact Us",
    },
  ];

  const providerPlans: Plan[] = [
    {
      id: "free",
      name: "Basic",
      tagline: "Get listed",
      price: 0,
      priceLabel: "$0",
      period: "forever",
      description: "Get discovered by families",
      features: [
        "Create provider profile",
        "Appear in search results",
        "Receive consultation requests",
        "Basic analytics",
        "Email notifications",
      ],
      cta: currentPlan === "free" ? "Current Plan" : "Get Started",
    },
    {
      id: "pro",
      name: "Professional",
      tagline: "Grow your business",
      price: billingCycle === "monthly" ? 25 : 20,
      priceLabel: billingCycle === "monthly" ? "$25" : "$20",
      period: billingCycle === "monthly" ? "/month" : "/month, billed annually",
      description: "Everything you need to connect with families",
      features: [
        "Everything in Basic",
        "Unlimited messaging",
        "See family contact info",
        "Priority in search results",
        "Advanced analytics dashboard",
        "Priority support",
      ],
      highlighted: true,
      cta: currentPlan === "pro" ? "Current Plan" : "Upgrade Now",
      badge: "Most Popular",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      tagline: "For organizations",
      price: null,
      priceLabel: "Custom",
      period: "",
      description: "Solutions for care facilities & agencies",
      features: [
        "Everything in Professional",
        "Multiple team members",
        "Multi-location support",
        "Custom branding",
        "API access",
        "Dedicated account manager",
      ],
      cta: "Contact Sales",
    },
  ];

  const plans = userType === "family" ? familyPlans : providerPlans;

  const handlePlanClick = (planId: PlanTier) => {
    if (planId === currentPlan) return;
    if (onSelectPlan) {
      onSelectPlan(planId);
    }
  };

  return (
    <div className={className}>
      {/* Billing toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              billingCycle === "monthly"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              billingCycle === "annual"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Annual
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlan;

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-6 transition-all ${
                plan.highlighted
                  ? "border-primary-500 bg-white shadow-xl scale-105 z-10"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-primary-600 to-teal-600 text-white text-sm font-semibold rounded-full shadow-md">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-1">{plan.tagline}</p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.priceLabel}</span>
                  {plan.period && (
                    <span className="text-gray-500 text-sm">{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        plan.highlighted ? "text-primary-600" : "text-green-500"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handlePlanClick(plan.id)}
                disabled={isCurrentPlan}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
                  isCurrentPlan
                    ? "bg-gray-100 text-gray-500 cursor-default"
                    : plan.highlighted
                    ? "bg-gradient-to-r from-primary-600 to-teal-600 text-white hover:shadow-lg"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                {plan.cta}
              </button>

              {/* Current plan indicator */}
              {isCurrentPlan && (
                <p className="text-center text-xs text-gray-500 mt-2">
                  You&apos;re on this plan
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom note */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">
          All plans include a 30-day satisfaction guarantee.{" "}
          <a href="/terms" className="text-primary-600 hover:underline">
            Terms apply
          </a>
        </p>
      </div>
    </div>
  );
}
