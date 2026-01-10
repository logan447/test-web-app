"use client";

import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      // Fetch session
      const session = await getSession();

      // Calculate provider profile completion to determine default mode
      let shouldDefaultToProvider = false;

      if (session?.user?.role === 'PROVIDER') {
        try {
          const providerResponse = await fetch('/api/providers/me');
          if (providerResponse.ok) {
            const provider = await providerResponse.json();

            // Calculate provider profile completion (same logic as auth.ts)
            let completedSections = 0;
            const totalSections = 6;

            // 1. Basic Info
            if (provider.name && provider.description && provider.address) completedSections++;
            // 2. Services
            if (provider.services && provider.services.length > 0) completedSections++;
            // 3. Photos
            if (provider.photos && provider.photos.length > 0) completedSections++;
            // 4. Licensing
            if (provider.licenseNumber) completedSections++;
            // 5. Pricing
            if (provider.pricing) completedSections++;
            // 6. Staff
            if (provider.staff && provider.staff.length > 0) completedSections++;

            const completionPercentage = Math.round((completedSections / totalSections) * 100);

            // Default to provider mode if 15%+ complete
            if (completionPercentage >= 15) {
              shouldDefaultToProvider = true;
            }
          }
        } catch (error) {
          console.error('Error fetching provider profile:', error);
        }
      }

      // Redirect with mode as URL parameter based on profile completion
      if (shouldDefaultToProvider) {
        // Provider mode users go to Find Families page
        router.push("/provider/requests?mode=provider");
      } else {
        // Family mode users go to Find Providers homepage
        router.push("/?mode=family");
      }
    } catch (error) {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="text-3xl font-bold text-primary-600 block text-center">
            Olera
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link href="/signup" className="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
