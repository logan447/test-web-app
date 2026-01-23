"use client";

import { Fragment } from "react";

type FeatureValue = boolean | string | number;

interface FeatureCategory {
  name: string;
  features: {
    name: string;
    description?: string;
    free: FeatureValue;
    pro: FeatureValue;
    enterprise: FeatureValue;
  }[];
}

interface PricingComparisonProps {
  userType: "family" | "provider";
  currentPlan?: "free" | "pro" | "enterprise";
  onSelectPlan?: (plan: "free" | "pro" | "enterprise") => void;
  className?: string;
}

/**
 * PricingComparison - Detailed feature comparison table
 *
 * Features:
 * - Categorized feature breakdown
 * - Visual indicators for included/excluded
 * - Responsive design with horizontal scroll on mobile
 */
export default function PricingComparison({
  userType,
  currentPlan = "free",
  onSelectPlan,
  className = "",
}: PricingComparisonProps) {
  const familyFeatures: FeatureCategory[] = [
    {
      name: "Search & Discovery",
      features: [
        { name: "Browse providers", free: true, pro: true, enterprise: true },
        { name: "View profiles", free: true, pro: true, enterprise: true },
        { name: "Basic filters", free: true, pro: true, enterprise: true },
        { name: "Advanced filters", free: false, pro: true, enterprise: true },
        { name: "Priority in matching", free: false, pro: true, enterprise: true },
      ],
    },
    {
      name: "Communication",
      features: [
        { name: "Save favorite providers", free: "5", pro: "Unlimited", enterprise: "Unlimited" },
        { name: "Messages per month", free: "3", pro: "Unlimited", enterprise: "Unlimited" },
        { name: "Schedule tours", free: true, pro: true, enterprise: true },
        { name: "Video consultations", free: false, pro: true, enterprise: true },
      ],
    },
    {
      name: "Care Tools",
      features: [
        { name: "Care needs assessment", free: true, pro: true, enterprise: true },
        { name: "Benefits finder", free: true, pro: true, enterprise: true },
        { name: "Provider background insights", free: false, pro: true, enterprise: true },
        { name: "Care transition checklist", free: false, pro: true, enterprise: true },
        { name: "Personalized care advisor", free: false, pro: false, enterprise: true },
      ],
    },
    {
      name: "Support",
      features: [
        { name: "Email support", free: true, pro: true, enterprise: true },
        { name: "Priority support", free: false, pro: true, enterprise: true },
        { name: "Phone support", free: false, pro: false, enterprise: true },
        { name: "Dedicated advisor", free: false, pro: false, enterprise: true },
      ],
    },
  ];

  const providerFeatures: FeatureCategory[] = [
    {
      name: "Profile & Visibility",
      features: [
        { name: "Provider profile", free: true, pro: true, enterprise: true },
        { name: "Appear in search", free: true, pro: true, enterprise: true },
        { name: "Priority placement", free: false, pro: true, enterprise: true },
        { name: "Featured badge", free: false, pro: true, enterprise: true },
        { name: "Multi-location profiles", free: false, pro: false, enterprise: true },
      ],
    },
    {
      name: "Lead Generation",
      features: [
        { name: "View family requests", free: true, pro: true, enterprise: true },
        { name: "Consultation requests", free: "5/month", pro: "Unlimited", enterprise: "Unlimited" },
        { name: "View contact info", free: false, pro: true, enterprise: true },
        { name: "Lead notifications", free: "Email only", pro: "Email + SMS", enterprise: "All channels" },
      ],
    },
    {
      name: "Messaging & Engagement",
      features: [
        { name: "Messages per month", free: "5", pro: "Unlimited", enterprise: "Unlimited" },
        { name: "Quick reply templates", free: false, pro: true, enterprise: true },
        { name: "Read receipts", free: false, pro: true, enterprise: true },
        { name: "Team inbox", free: false, pro: false, enterprise: true },
      ],
    },
    {
      name: "Analytics & Tools",
      features: [
        { name: "Basic analytics", free: true, pro: true, enterprise: true },
        { name: "Advanced analytics", free: false, pro: true, enterprise: true },
        { name: "Conversion tracking", free: false, pro: true, enterprise: true },
        { name: "API access", free: false, pro: false, enterprise: true },
        { name: "Custom reports", free: false, pro: false, enterprise: true },
      ],
    },
    {
      name: "Support",
      features: [
        { name: "Email support", free: true, pro: true, enterprise: true },
        { name: "Priority support", free: false, pro: true, enterprise: true },
        { name: "Account manager", free: false, pro: false, enterprise: true },
        { name: "Onboarding assistance", free: false, pro: false, enterprise: true },
      ],
    },
  ];

  const featureCategories = userType === "family" ? familyFeatures : providerFeatures;

  const renderValue = (value: FeatureValue) => {
    if (typeof value === "boolean") {
      return value ? (
        <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }
    return <span className="text-sm text-gray-900 font-medium">{value}</span>;
  };

  const planLabels = {
    free: { name: userType === "family" ? "Free" : "Basic", price: "$0" },
    pro: { name: userType === "family" ? "Family Plus" : "Professional", price: userType === "family" ? "$15/mo" : "$25/mo" },
    enterprise: { name: userType === "family" ? "Care Concierge" : "Enterprise", price: "Custom" },
  };

  return (
    <div className={`${className} overflow-x-auto`}>
      <table className="w-full min-w-[600px]">
        {/* Header */}
        <thead>
          <tr>
            <th className="text-left py-4 pr-4 w-1/3">
              <span className="sr-only">Feature</span>
            </th>
            {(["free", "pro", "enterprise"] as const).map((plan) => (
              <th key={plan} className="px-4 py-4 text-center w-1/5">
                <div
                  className={`rounded-lg p-3 ${
                    plan === "pro"
                      ? "bg-primary-50 border-2 border-primary-500"
                      : "bg-gray-50"
                  }`}
                >
                  {plan === "pro" && (
                    <span className="inline-block px-2 py-0.5 bg-primary-600 text-white text-xs font-semibold rounded-full mb-1">
                      Popular
                    </span>
                  )}
                  <div className="font-bold text-gray-900">{planLabels[plan].name}</div>
                  <div className={`text-sm ${plan === "pro" ? "text-primary-600" : "text-gray-500"}`}>
                    {planLabels[plan].price}
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {featureCategories.map((category, categoryIndex) => (
            <Fragment key={category.name}>
              {/* Category header */}
              <tr>
                <td
                  colSpan={4}
                  className={`py-4 ${categoryIndex > 0 ? "pt-8" : ""}`}
                >
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    {category.name}
                  </span>
                </td>
              </tr>

              {/* Features */}
              {category.features.map((feature, featureIndex) => (
                <tr
                  key={feature.name}
                  className={featureIndex % 2 === 0 ? "bg-gray-50/50" : ""}
                >
                  <td className="py-3 pr-4">
                    <span className="text-gray-900 text-sm">{feature.name}</span>
                    {feature.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{feature.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">{renderValue(feature.free)}</td>
                  <td className="px-4 py-3 text-center bg-primary-50/30">{renderValue(feature.pro)}</td>
                  <td className="px-4 py-3 text-center">{renderValue(feature.enterprise)}</td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>

        {/* Footer with CTAs */}
        <tfoot>
          <tr>
            <td className="py-6 pr-4"></td>
            {(["free", "pro", "enterprise"] as const).map((plan) => {
              const isCurrent = plan === currentPlan;
              return (
                <td key={plan} className="px-4 py-6 text-center">
                  <button
                    onClick={() => onSelectPlan?.(plan)}
                    disabled={isCurrent}
                    className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors ${
                      isCurrent
                        ? "bg-gray-100 text-gray-500 cursor-default"
                        : plan === "pro"
                        ? "bg-primary-600 text-white hover:bg-primary-700"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    {isCurrent
                      ? "Current Plan"
                      : plan === "enterprise"
                      ? "Contact Us"
                      : plan === "free"
                      ? "Get Started"
                      : "Upgrade"}
                  </button>
                </td>
              );
            })}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/**
 * PricingFAQ - Common questions about pricing
 */
export function PricingFAQ({ className = "" }: { className?: string }) {
  const faqs = [
    {
      question: "Can I cancel anytime?",
      answer:
        "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.",
    },
    {
      question: "Is there a free trial?",
      answer:
        "We offer a 30-day satisfaction guarantee. If you&apos;re not happy, we&apos;ll refund your payment.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, Mastercard, American Express) and PayPal.",
    },
    {
      question: "Can I switch plans later?",
      answer:
        "Absolutely! You can upgrade or downgrade your plan at any time from your account settings.",
    },
    {
      question: "Do you offer discounts for annual billing?",
      answer:
        "Yes, save 20% when you choose annual billing instead of monthly.",
    },
  ];

  return (
    <div className={className}>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
            <h4 className="font-semibold text-gray-900 mb-1">{faq.question}</h4>
            <p className="text-sm text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
