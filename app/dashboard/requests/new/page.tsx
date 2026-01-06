"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Provider = {
  id: string;
  name: string;
  providerType: string;
  city: string;
  state: string;
};

export default function NewRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const providerId = searchParams.get("providerId");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (providerId) {
      fetchProvider();
    }
  }, [status, providerId]);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setError("");

    const formData = new FormData(e.currentTarget);

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

      router.push("/dashboard/requests");
    } catch (err: any) {
      setError(err.message || "Failed to send consultation request");
      setSending(false);
    }
  };

  if (loading || status === "loading") {
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
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Olera
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-primary-600">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href={`/providers/${providerId}`} className="text-primary-600 hover:text-primary-700">
            ← Back to Provider
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Request Consultation</h1>

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

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
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
              {sending ? "Sending..." : "Send Consultation Request"}
            </button>
            <Link
              href={`/providers/${providerId}`}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 font-medium inline-block"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
