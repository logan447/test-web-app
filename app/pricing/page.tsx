"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MainNav from "@/components/Navigation/MainNav";
import Breadcrumb from "@/components/Navigation/Breadcrumb";
import {
  SubscriptionPlans,
  PricingComparison,
  PricingFAQ,
  BenefitsBanner,
  type PlanTier,
} from "@/components/Subscription";
import { showToast } from "@/lib/toast";

interface SubscriptionData {
  tier: string;
  status: string;
  hasActiveSubscription: boolean;
}

export default function PricingPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [userType, setUserType] = useState<"family" | "provider">("family");
  const [activeTab, setActiveTab] = useState<"plans" | "compare">("plans");

  // Determine user type from session
  useEffect(() => {
    if (session?.user) {
      // Check if user is a provider
      const isProvider = (session.user as { role?: string }).role === "provider";
      setUserType(isProvider ? "provider" : "family");
    }
  }, [session]);

  // Fetch current subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      if (authStatus === "loading") return;

      if (authStatus === "unauthenticated") {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/subscription");
        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [authStatus]);

  const getCurrentPlan = (): PlanTier => {
    if (!subscription) return "free";
    return subscription.tier.toLowerCase() as PlanTier;
  };

  const handleSelectPlan = async (plan: PlanTier) => {
    if (!session) {
      // Redirect to login with return URL
      router.push(`/login?returnTo=/pricing&plan=${plan}`);
      return;
    }

    if (plan === "enterprise") {
      // Contact sales for enterprise
      router.push("/contact?subject=enterprise");
      return;
    }

    if (plan === getCurrentPlan()) {
      return;
    }

    setUpgrading(true);
    try {
      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: plan.toUpperCase(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription({
          tier: data.subscription.tier,
          status: data.subscription.status,
          hasActiveSubscription: data.subscription.tier !== "FREE",
        });
        showToast.success(
          plan === "free" ? "Downgraded to free plan" : `Upgraded to ${plan} plan!`
        );
      } else {
        const error = await response.json();
        showToast.error(error.error || "Failed to update subscription");
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      showToast.error("Something went wrong. Please try again.");
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <Breadcrumb />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <MainNav />
      <Breadcrumb />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            Simple, transparent pricing
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose the right plan for you
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {userType === "family"
              ? "Find the perfect care solution with features designed for your journey"
              : "Grow your business and connect with more families"}
          </p>
        </div>

        {/* User type toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setUserType("family")}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                userType === "family"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              For Families
            </button>
            <button
              onClick={() => setUserType("provider")}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                userType === "provider"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              For Providers
            </button>
          </div>
        </div>

        {/* Tab toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex border border-gray-200 rounded-lg p-1 bg-white">
            <button
              onClick={() => setActiveTab("plans")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "plans"
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Plans Overview
            </button>
            <button
              onClick={() => setActiveTab("compare")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "compare"
                  ? "bg-primary-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Compare Features
            </button>
          </div>
        </div>

        {/* Upgrading overlay */}
        {upgrading && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-700 font-medium">Processing your subscription...</p>
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === "plans" ? (
          <SubscriptionPlans
            userType={userType}
            currentPlan={getCurrentPlan()}
            onSelectPlan={handleSelectPlan}
          />
        ) : (
          <PricingComparison
            userType={userType}
            currentPlan={getCurrentPlan()}
            onSelectPlan={handleSelectPlan}
            className="bg-white rounded-2xl border border-gray-200 p-6"
          />
        )}

        {/* Demo mode notice */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-2xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-blue-600"
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
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Demo Mode Active</h3>
              <p className="text-blue-700 text-sm">
                This is a demo environment. All subscription features can be tested without any payment.
                In production, this would integrate with Stripe for secure payment processing.
              </p>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>30-day guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Secure payment</span>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <PricingFAQ />
        </div>

        {/* Bottom CTA */}
        <div className="mt-16">
          <BenefitsBanner
            userType={userType}
            onUpgrade={() => handleSelectPlan("pro")}
          />
        </div>
      </main>
    </div>
  );
}
