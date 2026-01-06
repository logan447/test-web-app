import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import MainNav from "@/components/Navigation/MainNav";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const isFamily = session.user.role === "FAMILY";
  const isProvider = session.user.role === "PROVIDER";

  console.log("Dashboard - User role:", session.user.role, "isFamily:", isFamily);

  // Redirect family users to the home page (browse providers)
  if (isFamily) {
    console.log("Redirecting family user to /");
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isFamily ? "Family Dashboard" : "Provider Dashboard"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isFamily
              ? "Find and connect with care providers for your loved ones"
              : "Connect with families who need your services"}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isFamily && (
            <>
              <Link
                href="/providers"
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Find Providers
                </h3>
                <p className="text-gray-600">
                  Browse our directory of care providers
                </p>
              </Link>
              <Link
                href="/dashboard/care-profile"
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  My Care Profile
                </h3>
                <p className="text-gray-600">
                  Create or update your care needs profile
                </p>
              </Link>
              <Link
                href="/dashboard/saved-providers"
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Saved Providers
                </h3>
                <p className="text-gray-600">
                  View providers you've saved for later
                </p>
              </Link>
            </>
          )}
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

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <p className="text-gray-500 text-center py-8">
            No recent activity yet. Start by{" "}
            {isFamily ? "finding providers" : "browsing family care profiles"}!
          </p>
        </div>
      </main>
    </div>
  );
}
