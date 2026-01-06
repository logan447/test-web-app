"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    // Redirect family users to browse providers
    if (session.user.role === "FAMILY") {
      router.push("/");
    }
  }, [session, status, router]);

  // Show loading state
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // Don't render dashboard for family users
  if (session?.user.role === "FAMILY") {
    return null;
  }

  const isProvider = session?.user.role === "PROVIDER";

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Provider Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Connect with families who need your services
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isProvider && (
            <>
              <Link
                href="/dashboard/provider-profile"
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  My Profile
                </h3>
                <p className="text-gray-600">
                  Update your provider profile and services
                </p>
              </Link>
              <Link
                href="/dashboard/care-profiles"
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Browse Families
                </h3>
                <p className="text-gray-600">
                  Find families looking for care in your area
                </p>
              </Link>
            </>
          )}
          <Link
            href="/dashboard/requests"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Consultation Requests
            </h3>
            <p className="text-gray-600">
              Manage your sent and received requests
            </p>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <p className="text-gray-500 text-center py-8">
            No recent activity yet. Start by browsing family care profiles!
          </p>
        </div>
      </main>
    </div>
  );
}
