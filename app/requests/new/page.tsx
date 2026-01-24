"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";
import Footer from "@/components/Navigation/Footer";
import Breadcrumb from "@/components/Navigation/Breadcrumb";
import AuthModal from "@/components/Auth/AuthModal";
import EngagementConfirmationModal from "@/components/Engagement/EngagementConfirmationModal";
import { useFamilyProfile, getEngagementType } from "@/hooks/useFamilyProfile";
import { getEngagementConfigForProvider } from "@/lib/engagementUtils";

type Provider = {
  id: string;
  name: string;
  providerType: string;
  city: string;
  state: string;
};

function NewRequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { getProfileSummary, loading: profileLoading } = useFamilyProfile();

  const providerId = searchParams.get("providerId");

  useEffect(() => {
    // Always fetch provider data (it's public information)
    if (providerId) {
      fetchProvider();
    }
  }, [providerId]);

  useEffect(() => {
    // Show auth modal if not logged in (but don't block page render)
    if (status === "unauthenticated") {
      setAuthModalOpen(true);
    }
  }, [status]);

  const fetchProvider = async () => {
    try {
      const response = await fetch(`/api/providers/${providerId}`);
      if (response.ok) {
        const data = await response.json();
        setProvider(data);
      }
    } catch (err) {
      console.error("Error fetching provider:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission - show confirmation modal first
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check if user is logged in before submitting
    if (!session) {
      setAuthModalOpen(true);
      return;
    }

    // Show confirmation modal
    setConfirmModalOpen(true);
  };

  // Actually send the request after confirmation
  const handleConfirmedSubmit = async () => {
    if (!formRef.current) return;

    setSending(true);
    setError("");

    const formData = new FormData(formRef.current);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId,
          message: formData.get("message"),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send request");
      }

      router.push("/requests");
    } catch (err: any) {
      setError(err.message || "Failed to send request");
      setSending(false);
      throw err; // Re-throw so modal knows it failed
    }
  };

  // Get engagement configuration for dynamic text
  const engagementConfig = provider
    ? getEngagementConfigForProvider(provider.providerType)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Provider not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <Breadcrumb />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {engagementConfig ? `Request ${engagementConfig.label}` : "Request Engagement"}
        </h1>

        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{provider.name}</h2>
          <p className="text-gray-600">
            {provider.providerType.split('_').join(' ')} • {provider.city}, {provider.state}
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Message *
            </label>
            <textarea
              name="message"
              required
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Introduce yourself and describe your care needs. Include any specific questions you have for this provider..."
            />
            <p className="mt-1 text-sm text-gray-500">
              This message will be sent to the provider along with your care profile.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={sending}
              className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 disabled:opacity-50 font-medium"
            >
              {sending ? "Sending..." : `Send ${engagementConfig?.label || "Engagement"} Request`}
            </button>
            <Link
              href={`/providers/${providerId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 font-medium inline-block"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          router.push(`/providers/${providerId}`);
        }}
        defaultView="login"
      />

      {/* Engagement Confirmation Modal */}
      {provider && (
        <EngagementConfirmationModal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={handleConfirmedSubmit}
          providerName={provider.name}
          providerType={provider.providerType}
          engagementType={getEngagementType(provider.providerType)}
          profileSummary={getProfileSummary()}
        />
      )}

      {/* Footer */}
      <Footer variant="light" />
    </div>
  );
}

export default function NewRequestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    }>
      <NewRequestContent />
    </Suspense>
  );
}
