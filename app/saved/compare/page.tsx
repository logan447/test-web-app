"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import Footer from "@/components/Navigation/Footer";
import ComparisonTable from "@/components/Directory/ComparisonTable";
import { ComparisonProvider } from "@/lib/comparisonUtils";

function ComparePageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [providers, setProviders] = useState<ComparisonProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const providerIds = searchParams.get("ids")?.split(",").filter(Boolean) || [];

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (providerIds.length === 0) {
      setLoading(false);
      return;
    }

    fetchProviders();
  }, [session, status, router, searchParams]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch provider details for each ID
      const providerPromises = providerIds.map(async (id) => {
        const response = await fetch(`/api/providers/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch provider ${id}`);
        }
        return response.json();
      });

      const providerData = await Promise.all(providerPromises);
      setProviders(providerData);
    } catch (err) {
      console.error("Error fetching providers:", err);
      setError("Failed to load some providers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProvider = (providerId: string) => {
    const newIds = providerIds.filter((id) => id !== providerId);
    if (newIds.length === 0) {
      router.push("/saved");
    } else {
      router.push(`/saved/compare?ids=${newIds.join(",")}`);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href="/saved"
                  className="p-2 -ml-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <div className="bg-white/20 p-2 rounded-lg">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">Compare Providers</h1>
              </div>
              <p className="text-primary-100">
                {providers.length > 0
                  ? `Comparing ${providers.length} provider${providers.length !== 1 ? "s" : ""} side by side`
                  : "Select providers to compare"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/saved"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-600">Loading providers...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Providers</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchProviders}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : providerIds.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No providers selected
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Go to your saved providers and select the ones you want to compare.
            </p>
            <Link
              href="/saved"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-semibold transition-all shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              Go to Saved Providers
            </Link>
          </div>
        ) : providers.length === 1 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select at least 2 providers</h3>
            <p className="text-gray-600 mb-4">
              You need at least 2 providers to make a comparison.
            </p>
            <Link
              href="/saved"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add More Providers
            </Link>
          </div>
        ) : (
          <ComparisonTable
            providers={providers}
            onRemoveProvider={handleRemoveProvider}
          />
        )}

        {/* Tips Section */}
        {providers.length >= 2 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Tips for making your decision</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary-100 p-2 rounded-lg shrink-0">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Schedule tours</p>
                  <p className="text-xs text-gray-600">Visit each provider to get a feel for the environment</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary-100 p-2 rounded-lg shrink-0">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Ask questions</p>
                  <p className="text-xs text-gray-600">Reach out to clarify any concerns you have</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary-100 p-2 rounded-lg shrink-0">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Read reviews</p>
                  <p className="text-xs text-gray-600">See what other families say about their experience</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary-100 p-2 rounded-lg shrink-0">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Involve family</p>
                  <p className="text-xs text-gray-600">Share this comparison with other family members</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer variant="light" />
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-blue-800 h-32" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-sm p-12">
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <ComparePageContent />
    </Suspense>
  );
}
